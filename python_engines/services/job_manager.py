"""Thread-safe job state manager with async SSE event broadcasting."""

import asyncio
import threading
import time
import uuid
from dataclasses import asdict, dataclass, field
from typing import Any, Literal


JobType = Literal["download", "convert"]
JobStatus = Literal["queued", "running", "completed", "error", "cancelled"]


@dataclass
class MediaJob:
    id: str
    job_type: JobType
    title: str
    source: str
    target_format: str
    quality: str = "best"
    status: JobStatus = "queued"
    progress: float = 0.0
    speed: str = ""
    eta: str = ""
    message: str = "Queued"
    output_filename: str = ""
    output_path: str = ""
    file_size: int = 0
    duration: str = ""
    error: str = ""
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        # Never leak internal absolute filesystem path to browser clients unnecessarily;
        # expose download_url and output_filename instead.
        data.pop("output_path", None)
        if self.output_filename:
            folder = "downloads" if self.job_type == "download" else "converted"
            data["download_url"] = f"/api/files/{folder}/{self.output_filename}"
        else:
            data["download_url"] = ""
        return data


class JobManager:
    """Manages media download/conversion jobs and broadcasts updates to SSE clients."""

    def __init__(self) -> None:
        self._jobs: dict[str, MediaJob] = {}
        self._lock = threading.Lock()
        self._subscribers: set[asyncio.Queue[dict[str, Any]]] = set()
        self._loop: asyncio.AbstractEventLoop | None = None

    def set_event_loop(self, loop: asyncio.AbstractEventLoop) -> None:
        self._loop = loop

    def create_job(
        self,
        job_type: JobType,
        title: str,
        source: str,
        target_format: str,
        quality: str = "best",
    ) -> MediaJob:
        job = MediaJob(
            id=uuid.uuid4().hex[:12],
            job_type=job_type,
            title=title,
            source=source,
            target_format=target_format,
            quality=quality,
        )
        with self._lock:
            self._jobs[job.id] = job
        self._notify("job_created", job)
        return job

    def update_job(self, job_id: str, **changes: Any) -> MediaJob | None:
        with self._lock:
            job = self._jobs.get(job_id)
            if not job:
                return None
            for key, value in changes.items():
                if hasattr(job, key):
                    setattr(job, key, value)
            job.updated_at = time.time()
        self._notify("job_updated", job)
        return job

    def get_job(self, job_id: str) -> MediaJob | None:
        with self._lock:
            return self._jobs.get(job_id)

    def list_jobs(self) -> list[dict[str, Any]]:
        with self._lock:
            ordered = sorted(
                self._jobs.values(),
                key=lambda item: item.created_at,
                reverse=True,
            )
            return [item.to_dict() for item in ordered]

    def delete_job(self, job_id: str) -> MediaJob | None:
        with self._lock:
            job = self._jobs.pop(job_id, None)
        if job:
            self._notify_raw({"event": "job_deleted", "id": job_id})
        return job

    def clear_finished(self) -> list[str]:
        removed: list[str] = []
        with self._lock:
            for jid in list(self._jobs.keys()):
                if self._jobs[jid].status in ("completed", "error", "cancelled"):
                    removed.append(jid)
                    del self._jobs[jid]
        if removed:
            self._notify_raw({"event": "jobs_cleared", "ids": removed})
        return removed

    def subscribe(self) -> asyncio.Queue[dict[str, Any]]:
        queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue(maxsize=200)
        self._subscribers.add(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue[dict[str, Any]]) -> None:
        self._subscribers.discard(queue)

    def _notify(self, event_name: str, job: MediaJob) -> None:
        self._notify_raw({"event": event_name, "job": job.to_dict()})

    def _notify_raw(self, payload: dict[str, Any]) -> None:
        if not self._loop or self._loop.is_closed():
            return
        for queue in list(self._subscribers):
            self._loop.call_soon_threadsafe(self._safe_put, queue, payload)

    @staticmethod
    def _safe_put(queue: asyncio.Queue[dict[str, Any]], payload: dict[str, Any]) -> None:
        if queue.full():
            try:
                queue.get_nowait()
            except asyncio.QueueEmpty:
                pass
        try:
            queue.put_nowait(payload)
        except asyncio.QueueFull:
            pass
