# Architecture & Design System

## High-Level Architecture Overview

PK Marketing AI OS v1.0 is engineered around a modular, free-first, privacy-respecting full-stack architecture built with Next.js App Router, TypeScript, Tailwind CSS, Supabase PostgreSQL, and Google Gemini 3.8 Flash.

```
+-------------------------------------------------------------------------------+
|                       PK Marketing AI OS (Next.js 15 App)                     |
|                   Thai Primary UI / Responsive Desktop & Mobile               |
+---------------------------------------+---------------------------------------+
                                        |
       +--------------------------------+--------------------------------+
       |                                |                                |
+------v------+                  +------v------+                  +------v------+
| Presentation|                  | API Handlers|                  | Agent Engine|
| 13 Modules  |                  | Auth & Gate |                  | Gemini 3.8  |
| Lucide Icons|                  | Audit Logger|                  | Zod Schemas |
+------+------+                  +------+------+                  +------+------+
       |                                |                                |
       +--------------------------------+--------------------------------+
                                        |
             +--------------------------+--------------------------+
             |                                                     |
    +--------v--------+                                   +--------v--------+
    | Database Layer  |                                   | Automation Layer|
    | Supabase + RLS  |                                   | n8n Webhook Hub |
    | Offline SQLite  |                                   | Local Fallback  |
    +-----------------+                                   +-----------------+
```

## Dual Database Layer (Free-First & Offline Resilience)

The application incorporates a repository adapter pattern (`src/lib/db/index.ts`):
1. **Supabase PostgreSQL Engine**: Used when `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided. Supports full relational queries and Row Level Security.
2. **Offline Local Store**: Automatically active when Supabase credentials are absent. Uses local disk state initialized with seed data for PK Auto Demo, ensuring 100% operational testability with zero paid dependencies.

## Source-of-Truth Hierarchy

To prevent hallucinations, the system implements a strict priority chain:
1. **User-Provided Verified Data** (Inputs and confirmed edits)
2. **Knowledge Base** (Approved product specs, brand guidelines, warranty terms)
3. **Connected Business Data** (Live ERP / CRM values)
4. **AI General Knowledge** (Used strictly for formatting, phrasing, and creative brainstorming)
