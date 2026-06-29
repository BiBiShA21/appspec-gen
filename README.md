# AppSpec Generator

An AI-powered application specification generator that transforms natural language descriptions into structured, implementable app specifications.

**Status:** 🚀 Phase 1 - Boilerplate & Foundation (Today: Architecture + Core Pipeline)

## Overview

AppSpec Gen uses a multi-stage LLM pipeline to convert user prompts into complete app specifications:

1. **Stage 1: Intent Extraction** — Parse user input into structured app intent
2. **Stage 2: Schema Generation** — Create data model and validation rules
3. **Stage 3: App Spec Generation** — Produce full frontend + integration specs

Each stage uses AI-driven validation and repair mechanisms to ensure output quality.

## Key Features

✅ **Multi-stage LLM pipeline** with Google Gemini (primary) + OpenRouter (fallback)  
✅ **5 fully integrated services**: Slack, Gmail, Stripe, Notion, Airtable  
✅ **3-strategy repair engine**: Structural, Field, Consistency  
✅ **Typed validation** using Zod schemas  
✅ **Config-driven model routing** (swap providers without code changes)  
✅ **Real-time progress** via Server-Sent Events (SSE)  
✅ **Cost tracking** per stage with actual token metrics  

## Architecture

```
appspec-gen/
├── src/
│   ├── lib/types.ts                  # Shared interfaces
│   ├── validation/schemas.ts         # Zod schemas + validation
│   ├── repair/engine.ts              # 3-strategy repair orchestrator
│   ├── ai/router.ts                  # Config-driven model routing
│   ├── integrations/registry.ts      # Integration definitions
│   ├── stages/                       # (Coming Day 1 afternoon)
│   │   ├── intent.ts                 # Stage 1 implementation
│   │   ├── schema.ts                 # Stage 2 implementation
│   │   └── appspec.ts                # Stage 3 implementation
│   └── api/                          # (Coming Day 2)
│       ├── generate.ts               # POST /api/generate
│       └── [jobId]/stream.ts         # GET /api/generate/:jobId/stream (SSE)
├── pages/
│   ├── index.tsx                     # (Coming Day 2) Main UI
│   └── api/                          # API routes
├── evaluation/
│   ├── prompts.json                  # 12 test prompts
│   └── results.json                  # (Generated after eval)
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Setup

### Prerequisites
- Node.js 18+
- API keys for:
  - Google Gemini API (primary)
  - OpenRouter (fallback)
  - Integration providers (Slack, Gmail, Stripe, Notion, Airtable) — optional

### Installation

```bash
# Clone repo
git clone <repo-url>
cd appspec-gen

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Fill in your API keys in .env.local

# Type check
npm run type-check

# Start dev server (Day 2+)
npm run dev
```

## API Endpoints

### Generate AppSpec

**POST /api/generate**

Request:
```json
{
  "userInput": "Create a task management app with Slack notifications"
}
```

Response:
```json
{
  "jobId": "job_123abc",
  "status": "processing"
}
```

### Stream Generation Progress

**GET /api/generate/:jobId/stream**

Returns Server-Sent Events:
```
event: stage_started
data: {"stage": "intent", "progress": {"current": 1, "total": 3}}

event: stage_completed
data: {"stage": "intent", "output": {...}}

event: complete
data: {"finalSpec": {...}, "costTracking": {...}}
```

### List Integrations

**GET /api/integrations**

Returns all available integrations with triggers, actions, and requirements.

## Configuration

### Model Routing

Edit `src/ai/router.ts` to change:
- Primary/fallback AI providers per stage
- Temperature, max tokens, cost settings
- Model selection logic

**Config-driven override via environment:**
```bash
MODEL_ROUTING_CONFIG='{"stage1": {"primary": {...}}, ...}'
```

### Integration Registry

All integrations defined in `src/integrations/registry.ts`:
- 5 **fully implemented**: Slack, Gmail, Stripe, Notion, Airtable
- 3 **stubbed** with registry interface: Jira, GitHub, Zapier

Add new integrations by:
1. Creating entry in `INTEGRATIONS` object
2. Implementing provider client in `src/integrations/[provider].ts`
3. Adding hooks to stage 3 generation logic

## Validation & Repair

### Validation Schemas (Zod)

- `AppIntentSchema` — Intent extraction output
- `DataSchemaSchema` — Data model validity
- `AppSpecSchema` — Complete spec structure

### Repair Engine

3 strategies for fixing validation errors:

1. **Structural** — Add missing fields, fix array/object structure
2. **Field** — Type coercion, enum fixing
3. **Consistency** — Cross-field relationships, version alignment

Repairs logged with before/after values for debugging.

## Evaluation

### Run 12 Test Prompts

```bash
npm run evaluate
```

Runs all prompts in `evaluation/prompts.json` and logs:
- Success rate (%)
- Latency per stage (ms)
- Token usage + cost
- Repair operations performed
- Failed validation paths

Results saved to `evaluation/results.json`.

## Development Timeline

### Day 1 (Today)
- [x] TypeScript boilerplate with strict mode
- [x] Zod schemas (Intent, Schema, AppSpec)
- [x] Integration registry (5 + 3 stubbed)
- [x] Repair engine (3 strategies)
- [x] Model routing config
- [ ] Stage 1: Intent Extraction (afternoon)
- [ ] Stage 2: Schema Generation (afternoon)
- [ ] GET `/api/integrations` endpoint (afternoon)

### Day 2 (Tomorrow)
- [ ] Stage 3: App Spec Generation
- [ ] POST `/api/generate` + SSE streaming
- [ ] Frontend UI + progress sidebar
- [ ] Lenis + GSAP animations
- [ ] Evaluation runner + metrics
- [ ] Deploy to Vercel

## Cost Tracking

Each stage reports:
- Input/output tokens
- Model-specific rates
- Total cost per stage
- Fallback usage (if triggered)

View in response `costTracking` or streaming events.

## Error Handling

- **Validation errors** logged with severity + reparability flag
- **Repair failures** tracked with original/repaired values
- **API failures** trigger fallback provider with retry logic
- **SSE stream errors** sent as `error` events with details

## Testing

```bash
# Type checking
npm run type-check

# Linting (setup on Day 2)
npm run lint

# Evaluation (after Day 2)
npm run evaluate
```

## Deployment

### Vercel

```bash
# Set environment variables in Vercel dashboard
GOOGLE_API_KEY=...
OPENROUTER_API_KEY=...
# ... (rest of integrations)

# Deploy
vercel deploy
```

## Next Steps

1. **Today afternoon**: Wire Stages 1 & 2, test intent extraction on simple prompts
2. **Tomorrow morning**: Complete Stage 3, wire POST `/api/generate` endpoint
3. **Tomorrow afternoon**: Build frontend UI with real-time progress
4. **Tomorrow evening**: Run full 12-prompt evaluation, deploy to Vercel

## Contributing

To extend:

- **Add integration**: Create provider client, add to registry, hook into stage 3
- **Add repair strategy**: Extend `RepairEngine` with new strategy method
- **Add schema field**: Update relevant Zod schema + validation tests
- **Change AI provider**: Update `ModelRouter` or env `MODEL_ROUTING_CONFIG`

## License

Proprietary — built with ❤️ for fast iteration

---

**Ready to ship.** 🚀

Detailed progress tracked in PRs. Latest metrics in `evaluation/results.json`.
