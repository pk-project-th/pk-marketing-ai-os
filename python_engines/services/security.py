"""Security helpers: URL validation (SSRF guard) and safe filename sanitization."""

import ipaddress
import re
import socket
from pathlib import Path
from urllib.parse import urlparse


_INVALID_FILENAME_CHARS = re.compile(r'[<>:"/\\|?*\x00-\x1f]')
_WHITESPACE_RUN = re.compile(r"\s+")


def validate_media_url(raw_url: str) -> str:
    """Validate that a URL is http/https and does not resolve to a private/loopback address."""
    url = (raw_url or "").strip()
    if not url:
        raise ValueError("URL cannot be empty.")

    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError("Only http:// and https:// URLs are supported.")

    hostname = parsed.hostname
    if not hostname:
        raise ValueError("Invalid URL: missing hostname.")

    lowered = hostname.lower()
    if lowered in ("localhost", "localhost.localdomain") or lowered.endswith(".local"):
        raise ValueError("Localhost URLs are not allowed.")

    # Check if hostname is an IP literal
    try:
        ip_obj = ipaddress.ip_address(hostname)
        if _is_restricted_ip(ip_obj):
            raise ValueError("Private or loopback IP addresses are not allowed.")
        return url
    except ValueError as exc:
        if "not allowed" in str(exc):
            raise

    # Resolve hostname to check for private IP targets
    try:
        addr_info = socket.getaddrinfo(hostname, None)
        for info in addr_info:
            ip_str = info[4][0].split("%")[0]
            ip_obj = ipaddress.ip_address(ip_str)
            if _is_restricted_ip(ip_obj):
                raise ValueError("URL resolves to a private or loopback IP address.")
    except socket.gaierror:
        # Let yt-dlp report DNS errors if offline or invalid domain
        pass

    return url


def _is_restricted_ip(ip_obj: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    return (
        ip_obj.is_private
        or ip_obj.is_loopback
        or ip_obj.is_link_local
        or ip_obj.is_multicast
        or ip_obj.is_reserved
        or ip_obj.is_unspecified
    )


def sanitize_filename(name: str, fallback: str = "media_file") -> str:
    """Sanitize a filename while preserving Unicode (including Thai) characters."""
    cleaned = _INVALID_FILENAME_CHARS.sub("_", (name or "").strip())
    cleaned = _WHITESPACE_RUN.sub(" ", cleaned).strip(". ")
    if not cleaned:
        return fallback
    # Limit length to avoid Windows MAX_PATH issues
    if len(cleaned) > 140:
        cleaned = cleaned[:140].rstrip(". ")
    return cleaned or fallback


def safe_resolve_child(base_dir: Path, filename: str) -> Path:
    """Resolve a child path inside base_dir and prevent directory traversal."""
    base_resolved = base_dir.resolve()
    target = (base_resolved / Path(filename).name).resolve()
    if target == base_resolved or base_resolved not in target.parents:
        raise ValueError("Invalid file path.")
    return target
