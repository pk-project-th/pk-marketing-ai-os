# PK Marketing AI OS v1.0

An enterprise-grade, privacy-first, free-first Marketing Operating System designed specifically for automotive marketing strategy, content production, document-to-form automation, multi-platform repurposing, performance diagnostics, and human-in-the-loop workflow governance.

---

## 🌟 Core Philosophy

```
INPUT 
  → AI ANALYSIS 
  → STRATEGY 
  → CONTENT PRODUCTION 
  → HUMAN REVIEW 
  → EXECUTION 
  → PERFORMANCE 
  → LEARNING (CLOSED LOOP)
```

The system reduces repetitive manual labor by moving marketing teams seamlessly through:
**Idea → Content → Script → Creative Brief → Repurposed Content → Approval → Analytics** within a single integrated platform.

---

## 🚀 Key Features & Modules

1. **Marketing Command Center (Dashboard)**: Centralized overview of active automotive campaigns, draft assets, items awaiting approval, and AI usage.
2. **Idea Lab (Agent 01 - Idea Agent)**: Generates 5, 10, 20, or 30 strategic content ideas with strict Zod JSON schemas, funnel tags, and audience targeting.
3. **Content & Script Studio (Agent 02 - Production Agent)**: Produces short/long captions, voiceover scripts, scene breakdowns, and creative briefs supporting 8 copywriting frameworks (AIDA, PAS, FAB, BAB, HVPC, PMTO, WWHN, Story).
4. **Creative Studio**: Professional English prompt generator for Midjourney v6, Stable Diffusion, and Imagen with zero-hallucination guardrails.
5. **Repurpose Studio (Agent 04 - Content Repurposing Agent)**: Tailors single marketing assets into platform-native formats for Facebook, Instagram (carousel slides), TikTok (video scripts), YouTube (timestamps/Shorts), LinkedIn, and X (threads).
6. **Document Agent & Form Automation (Agent 03 - Document Agent)**: Extracts structured fields from PDF/DOCX/CSV/XLSX, displays confidence ratings, features dynamic field mapping (Source $\to$ Target), and enforces human review before form submission.
7. **Marketing Analytics (Agent 05 - Analytics Agent)**: 9-point deep diagnostic engine evaluating metrics (Reach, CTR, ROAS, Conversions) with a closed feedback loop that pushes winning themes back into the Idea Lab.
8. **Knowledge Base**: Strict Source-of-Truth hierarchy (User verified data > Knowledge Base > Connected business data > AI general knowledge) preventing hallucinations on vehicle specifications and warranties.
9. **Approval Center**: Human-in-the-loop governance gate (`DRAFT` $\to$ `AI CHECK` $\to$ `HUMAN REVIEW` $\to$ `APPROVED` $\to$ `EXECUTED` $\to$ `LOGGED`).
10. **Workflow Center & n8n Hub**: Orchestrates 7 core marketing pipelines via internal async workers or self-hosted n8n webhooks.
11. **AI Monitor & Settings**: Real-time token usage, cost estimator, latency monitor, and configuration for Gemini 3.8 Flash.

---

## 🛠️ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
# The application will be running at http://localhost:3000

# 3. Build for production
npm run build
npm run start
```

For complete documentation, see [`docs/`](./docs/).
