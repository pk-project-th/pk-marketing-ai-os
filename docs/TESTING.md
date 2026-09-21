# Testing & Quality Assurance

## Automated Test Suites
1. **Build Validation**: Tests TypeScript compilation, Next.js page generation, and bundle integrity:
   ```bash
   npm run build
   ```
2. **AI Schema Validation**: Validates Zod schemas against structured JSON outputs for all 5 agents.
3. **Repository Operations**: Verifies CRUD persistence for campaigns, ideas, assets, documents, and approvals.

## Manual Test Journeys
- **Journey 1**: Generate 5 ideas in Idea Lab $\to$ Filter by Platform $\to$ Select idea $\to$ Produce PAS content package in Content Studio $\to$ Verify in Approval Center.
- **Journey 2**: Input long-form copy in Repurpose Studio $\to$ Select Instagram & TikTok $\to$ Inspect formatted slides and scripts.
- **Journey 3**: Analyze document in Document Agent $\to$ Verify confidence scores $\to$ Test dynamic field mapping $\to$ Attempt submission $\to$ Observe honest "Integration not connected" status.
- **Journey 4**: Inspect Analytics Agent 9-point diagnostic $\to$ Click "Push to Idea Lab" $\to$ Confirm new ideas generated in Idea Lab.
