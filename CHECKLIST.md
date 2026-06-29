## AppSpec Generator — 2-Day Build Checklist

### ✅ FOUNDATION (Completed Today)

- [x] GitHub repo setup with TypeScript strict mode
- [x] Zod schemas for AppIntent → DataSchema → AppSpec
- [x] Validation engine (typed, not throwing) with `validateAtStage()` helper
- [x] Integration registry (5 done properly + 3 stubbed)
  - [x] Slack (messaging)
  - [x] Gmail (email)
  - [x] Stripe (payment)
  - [x] Notion (database)
  - [x] Airtable (database)
  - [x] Jira, GitHub, Zapier (stubbed with interface)
- [x] Repair engine with 3 strategies
  - [x] Structural (missing fields, arrays, objects)
  - [x] Field (type coercion, enums)
  - [x] Consistency (relationships, versions)
  - [x] RepairEngine orchestrator with logging
- [x] Model routing config (Gemini Flash/Pro → OpenRouter fallback)
- [x] 12 evaluation prompts (covers all integration types)
- [x] Project structure ready (`src/`, `pages/`, `evaluation/`)
- [x] README with full setup & API docs

### TODAY — AFTERNOON (3-4 hours remaining)

**Stage 1: Intent Extraction**
- [ ] `src/stages/intent.ts` — Prompt engineering for intent parsing
- [ ] Extract features, constraints, integration hints from user input
- [ ] Test on 3 simple prompts manually

**Stage 2: Schema Generation**
- [ ] `src/stages/schema.ts` — Generate data schema from intent
- [ ] Entity detection, field type inference, relationship mapping
- [ ] Validate output against `DataSchemaSchema`

**Endpoints & Integration**
- [ ] `pages/api/integrations.ts` — GET endpoint returning registry
- [ ] Test with curl: `GET /api/integrations`

**Testing**
- [ ] Run intent extraction on: simple CRUD, e-commerce, task app
- [ ] Log validation errors and repair operations
- [ ] Verify Zod schemas catch errors correctly

### TOMORROW — MORNING (4 hours)

**Stage 3: App Spec Generation**
- [ ] `src/stages/appspec.ts` — Full app spec from schema + intent
- [ ] Page layouts, component definitions, integration hooks
- [ ] Validate against `AppSpecSchema`

**API Pipeline**
- [ ] `pages/api/generate.ts` — POST `/api/generate` with job tracking
- [ ] Job storage (in-memory for now)
- [ ] Queue management

**SSE Streaming**
- [ ] `pages/api/[jobId]/stream.ts` — GET streaming with SSE
- [ ] Events: `stage_started`, `stage_completed`, `complete`, `error`
- [ ] Progress tracking per stage

**Model Routing & Cost**
- [ ] Integrate `ModelRouter` into all stages
- [ ] Track tokens + calculate costs per stage
- [ ] Log fallback usage (if triggered)

### TOMORROW — AFTERNOON (3 hours)

**Frontend**
- [ ] `pages/index.tsx` — Main UI component
- [ ] Left sidebar: progress tracker (real-time from SSE)
- [ ] Main panel: prompt input + stacked output cards
- [ ] Error panel (slides in on failure)

**Animations**
- [ ] Lenis scroll integration (smooth)
- [ ] GSAP reveal animations (on card entry)
- [ ] Dark theme, minimal flashiness

**Testing**
- [ ] Test UI with real streaming from `/api/generate/:jobId/stream`
- [ ] Verify progress bar updates in real-time
- [ ] Error handling in UI

### TOMORROW — EVENING (2 hours)

**Evaluation**
- [ ] Run all 12 prompts through full pipeline
- [ ] Collect metrics:
  - [ ] Success rate (%)
  - [ ] Latency per stage (ms)
  - [ ] Token usage + cost per stage
  - [ ] Repair operation counts
  - [ ] Failed validation paths
- [ ] Save results to `evaluation/results.json`

**Deployment**
- [ ] Set env vars in Vercel
- [ ] Deploy full stack to `vercel.com`
- [ ] Test live endpoints

**Documentation**
- [ ] Update README with actual metrics
- [ ] Add local setup instructions
- [ ] Document repair logs format

**Final Checklist**
- [ ] All 12 prompts generate valid specs
- [ ] Fallback AI provider triggers correctly
- [ ] SSE streaming works end-to-end
- [ ] Cost tracking accurate
- [ ] Repo ready for GitHub (clean, documented)

---

## Critical Path

**Must have by end of Day 1 afternoon:**
- ✅ Foundation complete
- Stages 1 & 2 working on simple prompts
- GET `/api/integrations` live

**Must have by end of Day 2:**
- Stage 3 + full POST pipeline
- Frontend UI + SSE streaming
- All 12 eval prompts passing
- Deployed to Vercel

---

## Notes

- **Repair logs** = transparency into what broke + how we fixed it
- **SSE streaming** = user sees progress in real-time
- **Cost tracking** = know exactly what each stage costs (useful for pricing)
- **Config-driven routing** = swap AI providers without touching code
- **Strict TypeScript** = catch bugs before runtime

---

**Ship it.** 🚀
