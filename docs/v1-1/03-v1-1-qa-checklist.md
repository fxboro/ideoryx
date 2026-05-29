# V1.1 QA Checklist

Pre-implementation verification gates aligned with the critical review in `02-v1-1-migration-notes.md`.

---

## Phase 0: Type Foundation

- [ ] `enums.ts` compiles with all new workspace/signal/opportunity/agent literals
- [ ] `domain.ts` — `Workspace` interface includes `targetUser?` and `problem?` for backward compat
- [ ] `domain.ts` — `BaseEntity` includes `organizationId?: string`
- [ ] `domain.ts` — `Project = Workspace` alias doesn't break existing consumers (run `npx tsc --noEmit`)
- [ ] `payloads.ts` — `CreateWorkspacePayload`, `WorkspaceListItem` compile correctly
- [ ] `types/index.ts` — barrel re-exports all new types without missing exports
- [ ] `agents/types.ts` — `AllWorkflowId` union includes both V1 and V1.1 workflow IDs
- [ ] `agents/types.ts` — `AgentContext` has both `project` and `workspace` fields
- [ ] `agents/types.ts` — `WorkflowOutput` union includes all 5 new V1.1 output interfaces

## Phase 1: Validation & Services

- [ ] `validators/index.ts` — `workspaceSchema` validates all required Workspace fields
- [ ] `validators/index.ts` — `signalSchema` validates all required Signal fields
- [ ] `validators/index.ts` — `opportunitySchema` validates all required Opportunity fields
- [ ] `validators/index.ts` — `baseEntitySchema` includes `sourceRunId` and `organizationId`
- [ ] `validators/index.ts` — `runAgentWorkflowRequestSchema` accepts `workspaceId?: string`
- [ ] `workspace.service.ts` — `create()` populates default checklists based on `workspaceType`
- [ ] `workspace.service.ts` — `toggleChecklistItem()` recalculates `readinessScore`
- [ ] `signal.service.ts` — `listByWorkspace()` filters by `workspaceId`
- [ ] `opportunity.service.ts` — `listByWorkspace()` filters by `workspaceId`
- [ ] `services/index.ts` — exports `workspaceService`, `signalService`, `opportunityService`
- [ ] `firestore.rules` — `workspaces`, `signals`, `opportunities` in whitelist array
- [ ] `firestore.indexes.json` — composite indexes exist for new collections

## Phase 2: Agent Orchestration

- [ ] `workflow-registry.ts` — all 5 new workflows registered with correct agent roles
- [ ] `workspace-context-loader.ts` — loads workspace, checklists, and signals in parallel
- [ ] `context-builder.ts` — routes to workspace loader when `workspaceId` is present
- [ ] `context-builder.ts` — still routes to project loader when only `projectId` is present (V1 compat)
- [ ] `prompt-templates.ts` — `resolvePromptTemplate()` accepts `AllWorkflowId`
- [ ] `prompt-templates.ts` — `formatWorkspace()` helper formats stage, readiness, checklist status
- [ ] `prompt-templates.ts` — all 5 new prompt builders return valid `PromptPair` objects
- [ ] `output-validator.ts` — all 5 new output schemas registered in `OUTPUT_SCHEMAS`
- [ ] `output-validator.ts` — `validateOutput()` accepts `AllWorkflowId`
- [ ] `save-actions.ts` — `mapSaveActions()` accepts `AllWorkflowId`
- [ ] `save-actions.ts` — all 5 new mappers produce valid `SaveAction[]` arrays
- [ ] `run-agent-workflow.ts` — `inferWorkflowId()` maps new agent roles to V1.1 workflows
- [ ] `run-agent-workflow.ts` — passes `workspaceId` through to save actions

## Phase 3: API Routes

- [ ] `POST /api/workspaces/create` — creates workspace with default checklists, returns 201
- [ ] `GET /api/workspaces/[workspaceId]` — returns workspace by ID
- [ ] `PATCH /api/workspaces/[workspaceId]` — updates workspace fields
- [ ] `DELETE /api/workspaces/[workspaceId]` — deletes workspace
- [ ] `POST /api/workspaces/triage-signals` — triggers Signal Analyst agent (if not deferred)
- [ ] `POST /api/workspaces/evaluate-opportunities` — triggers Improvement agent (if not deferred)
- [ ] `POST /api/migrate-projects` — transforms all V1 `projects` docs into `workspaces` docs
- [ ] Migration maps `maintenance` → `growth` with `status: "completed"`
- [ ] Migration maps `completed` (phase) → `growth` with `status: "completed"`
- [ ] Migration maps `freelance` → `workspaceType: "client"`, `learning` → `workspaceType: "product"`
- [ ] Migration does NOT modify or delete original `projects` documents
- [ ] `POST /api/agent/run` — accepts `workspaceId` alongside `projectId`

## Phase 4: UI

### Sidebar
- [ ] "Projects" renamed to "Workspaces" with correct icon and route `/workspaces`
- [ ] "Telemetry Signals" entry visible with `/signals` route
- [ ] "Opportunities" entry visible with `/opportunities` route
- [ ] Active state highlighting works for all new routes

### Redirects
- [ ] `/projects` → `/workspaces` (permanent redirect, no flicker)
- [ ] `/projects/p1` → `/workspaces/p1` (permanent redirect, preserves ID)
- [ ] `params` access uses Next.js 15+ async pattern (no runtime errors)
- [ ] Back button from `/workspaces` doesn't loop through `/projects` redirect

### Workspaces Listing
- [ ] Displays all workspaces with readiness scores
- [ ] Toggle between Product and Client workspace views
- [ ] Filters by Stage, Status, Risk, readiness score
- [ ] Table and Card view modes both work

### Workspace Cockpit
- [ ] Overview tab shows stage, readiness score, stack, focus
- [ ] Stage Checklist tab renders interactive checkboxes
- [ ] Toggling a checklist item updates Firestore and recalculates readiness
- [ ] "Advance to Next Stage" control works
- [ ] V1 tabs (Tasks, Decisions, Agent Runs, Playbooks) remain functional

### Global Pages
- [ ] `/signals` lists all signals across workspaces
- [ ] `/opportunities` lists all opportunities across workspaces

## Phase 5: Hardening

- [ ] Unit tests pass for `workspaceSchema`, `signalSchema`, `opportunitySchema` validation
- [ ] Unit tests pass for `workspaceService` create/update/toggle operations
- [ ] Unit tests pass for `mapSaveActions()` with all V1.1 workflow IDs
- [ ] TypeScript compilation: `npx tsc --noEmit` returns 0 errors
- [ ] Firestore emulator rules test: new collections pass `isOwner` checks
- [ ] Migration script tested with sample V1 data (all 3 project types)

## V1 Regression Checks

- [ ] `/today` page loads without errors
- [ ] `/agents` page loads, V1 agent workflows still trigger
- [ ] `/playbooks` page loads
- [ ] `/learning` page loads
- [ ] `/freelance` page loads with leads/proposals
- [ ] `/decisions` page loads
- [ ] `/settings` page loads
- [ ] V1 agent workflows (`idea_to_mvp`, `mvp_to_technical_plan`, `feature_to_build_plan`, `lead_to_proposal`, `weekly_review`) still complete successfully
- [ ] V1 API routes (`/api/projects/*`, `/api/tasks/*`, `/api/decisions/*`, `/api/proposals/*`, `/api/agent/run`) still respond correctly
