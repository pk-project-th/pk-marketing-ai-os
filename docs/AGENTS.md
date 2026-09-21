# Core AI Agents Specification

## AGENT 01: Idea Agent (Idea Lab)
- **Role**: Strategic content idea generation
- **Input**: Brand, Product, Campaign, Audience, Objective, Platform, Content Pillar, Tone, Topic
- **Output**: Strict JSON array (title, concept, hook, audience, objective, pillar, platform, format, key message, CTA, reasoning, priority, stage)
- **Engine**: Gemini 3.8 Flash with High Reasoning Effort

## AGENT 02: Production Agent (Content & Script Studio)
- **Role**: Transformation of approved ideas into production-ready assets
- **Input**: Content Idea + chosen Copywriting Framework (AIDA, PAS, FAB, BAB, HVPC, PMTO, WWHN, Story)
- **Output**: Captions (short, long, CTA, hashtags), Voiceover Script (Hook, Intro, Body, Proof, CTA), Video Scenes (timestamp, visual, dialogue, on-screen text, camera, sound), Creative Brief (visual direction, lighting, composition, English prompt)
- **Governance**: Auto-enqueued to Approval Center

## AGENT 03: Document Agent (Document & Form Automation)
- **Role**: Unstructured business document intelligence and dynamic field mapping
- **Input**: PDF, DOCX, XLSX, CSV, TXT
- **Output**: Extracted fields, Confidence ratings (High/Medium/Low), Target template mapping
- **Guardrail**: Human confirmation required before form submission

## AGENT 04: Content Repurposing Agent (Repurpose Studio)
- **Role**: Multi-platform format adaptation
- **Supported Platforms**: Facebook (storytelling), Instagram (carousels), TikTok (scripts), YouTube (chapters & Shorts), LinkedIn (thought leadership), X (threads)

## AGENT 05: Analytics Agent (Analytics Dashboard)
- **Role**: Performance diagnostics and learning loop
- **Evaluation**: 9-point deep diagnostic
- **Closed Loop**: 1-click conversion of recommendations back into the Idea Agent
