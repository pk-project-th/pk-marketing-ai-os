# Workflows & n8n Integration

## 7 Core Workflows
1. `idea-generation`: Synthesizes brand specs and generates structured ideas
2. `content-production`: Produces captions, scripts, scenes, and briefs
3. `doc-extraction`: Analyzes uploaded files and maps fields
4. `content-repurposing`: Adapts assets across 6 social platforms
5. `analytics-diagnostic`: Performs 9-point diagnostic on campaign metrics
6. `doc-to-form-submission`: Dispatches verified data to external webhooks
7. `knowledge-ingestion`: Categorizes and verifies new product documents

## n8n Dispatcher & Fallback
When `N8N_WEBHOOK_URL` is defined, the system dispatches structured JSON payloads to the external n8n workflow. If not configured, an internal asynchronous execution worker handles the job locally and logs results to `workflow_runs`.
