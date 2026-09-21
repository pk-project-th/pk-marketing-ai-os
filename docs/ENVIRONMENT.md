# Environment Configuration

| Variable | Description | Default / Required |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google AI Studio API Key for Gemini 3.8 Flash | Optional (Simulated fallback active if omitted) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Optional (Local JSON DB active if omitted) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Client Key | Optional |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Admin / Service Role Key | Optional |
| `N8N_WEBHOOK_URL` | Endpoint to trigger external n8n workflows | Optional (Local engine active if omitted) |
| `N8N_API_KEY` | Header key for n8n webhook authentication | Optional |
| `N8N_BASE_URL` | Self-hosted n8n web app URL | Default: `http://localhost:5678` |
