# V1.1 Implementation Plan — Critical Review & Migration Notes

> Reviewed against the existing V1 codebase on 2026-05-29.
> This document is the authoritative reference for plan gaps, risks, and required fixes.

---

## 1. Missing Files & Modules

The implementation plan references files to modify or create but **omits** the following, all of which contain hard `Project` references that must be updated:

### 1.1 Omitted from Plan — Must Be Modified

| File | Why it matters |
|---|---|
| [`payloads.ts`](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/types/payloads.ts) | Exports `CreateProjectPayload`, `UpdateProjectPayload`, `ProjectListItem`. Needs `Workspace` equivalents + backward-compat aliases. |
| [`types/index.ts`](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/types/index.ts) | Barrel file. Must re-export all new Workspace, Signal, Opportunity types and their payloads. |
| [`services/index.ts`](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/lib/services/index.ts) | Barrel file for services. Must export `workspaceService`, `signalService`, `opportunityService`. |
| [`context-builder.ts`](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/lib/agents/context-builder.ts) | Loads `ProjectSchemaType` from `projectService` for agent context. Must be extended to load Workspace context (stage, checklists, readiness, signals) for V1.1 workflows. |
| [`project-context-loader.ts`](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/lib/agents/project-context-loader.ts) | Directly imports `projectService` and returns `ProjectSchemaType`. Either rename to `workspace-context-loader.ts` or extend it. |
| [`memory-loader.ts`](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/lib/agents/memory-loader.ts) | Imported by `context-builder.ts`. Not reviewed in the plan — verify it doesn't hardcode `projects` assumptions. |
| [`model-adapter.ts`](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/lib/agents/model-adapter.ts) | Imported by `run-agent-workflow.ts`. Likely safe but needs verification. |
| [`firestore.indexes.json`](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/firestore.indexes.json) | **Exists** and contains composite indexes for `projects`. Must add `workspaces`, `signals`, `opportunities` indexes. Plan mentions it but only as a side note in Phase 1 Step 4 — should be an explicit deliverable. |
| [`api/projects/`](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/app/api/projects) | V1 REST route directory for projects. Not addressed in plan. Needs redirect or deprecation. |
| [`api/agent/run/route.ts`](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/app/api/agent/run/route.ts) | Accepts `projectId` in the request body. Must also accept `workspaceId` and route new V1.1 workflows correctly. |

### 1.2 Omitted from Plan — UI Components (Must Be Modified)

| File | Why it matters |
|---|---|
| [`projects/_components/mock-projects.ts`](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/app/(dashboard)/projects/_components/mock-projects.ts) | Imports `Project` type directly from `@/types`. Uses `ProjectType`, `ProjectPhase`, `ProjectStatus`, `RiskLevel` casts. Must map to Workspace mock data for the new `/workspaces` pages. |
| [`projects/_components/project-card-grid.tsx`](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/app/(dashboard)/projects/_components/project-card-grid.tsx) | Renders Project cards. Must be cloned/adapted for Workspace cards (with readiness scores, stage badges, etc.). |
| [`projects/_components/project-filters-bar.tsx`](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/app/(dashboard)/projects/_components/project-filters-bar.tsx) | Filter UI. Needs workspace type/stage/readiness filters. |
| [`projects/_components/project-table.tsx`](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/app/(dashboard)/projects/_components/project-table.tsx) | Table view. Same as above. |
| [`projects/[projectId]/_components/`](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/app/(dashboard)/projects/[projectId]/_components) | `project-detail-header.tsx`, `project-summary-cards.tsx`, `project-tabs.tsx`, `tabs/overview-tab.tsx` — all hardcoded to `Project` type. Must be rewritten or adapted for workspace cockpit. |

### 1.3 Missing — New Files Not Listed in Plan

| File | Purpose |
|---|---|
| `src/lib/agents/workspace-context-loader.ts` | New loader parallel to `project-context-loader.ts`, loads workspace + checklists + signals for new agent workflows. |
| `src/lib/validators/workspace.validators.ts` (or inline in `index.ts`) | The plan says "add schemas" to `validators/index.ts` but doesn't specify request validators like `createWorkspaceRequestSchema`, `toggleChecklistRequestSchema`, `createSignalRequestSchema`. |
| `src/app/api/workspaces/[workspaceId]/route.ts` | CRUD endpoint for individual workspaces (GET, PATCH, DELETE). Only `/create` is planned. |
| `src/app/api/signals/route.ts` | CRUD for signals — the plan only lists a triage endpoint, not basic signal CRUD. |
| `src/app/api/opportunities/route.ts` | Same — no basic CRUD endpoint listed. |

---

## 2. Naming Conflicts — Project vs. Workspace

> [!WARNING]
> The "Project" name is deeply embedded in V1. Aliasing `Project = Workspace` is **not safe** without addressing every consumer.

### 2.1 Type-Level Conflicts

The plan proposes `export type Project = Workspace;` in `domain.ts`. This is **structurally breaking** because:

- **V1 `Project` has `type: ProjectType` (required)** — V1.1 `Workspace` has `workspaceType: WorkspaceType`.
- **V1 `Project` has `phase: ProjectPhase` (required)** — V1.1 `Workspace` has `stage: ProductStage | ClientStage`.
- **V1 `Project` has `targetUser?: string` and `problem?: string`** — these fields are absent from the proposed `Workspace` interface.

If you set `Project = Workspace`, every existing consumer that does `project.type` or `project.phase` will get a TypeScript error. This is a compile-time break.

**Recommendation**: The `Workspace` interface should keep the V1 `Project` fields as optional:

```typescript
export interface Workspace extends BaseEntity {
  name: string;
  workspaceType: WorkspaceType;
  status: WorkspaceStatus;
  summary: string;
  stage: ProductStage | ClientStage;
  readinessScore: number;
  checklists: Record<string, WorkspaceChecklistItem[]>;
  stack?: string[];
  currentFocus?: string;
  nextMilestone?: string;
  risk: RiskLevel;
  goalId?: string;
  // V1 backward-compat fields:
  type?: ProjectType;        // ← already in plan ✓
  phase?: ProjectPhase;       // ← already in plan ✓
  targetUser?: string;        // ← MISSING from plan
  problem?: string;           // ← MISSING from plan
}
```

### 2.2 Zod Schema Conflict

The plan says to update `validators/index.ts`. But the existing `projectSchema` has `type: projectTypeSchema` (required), `phase: projectPhaseSchema` (required). If `Project = Workspace`, the `projectSchema` validator must either:
- Be loosened to accept both old and new fields, OR
- Be replaced with `workspaceSchema`, while keeping `projectSchema` intact for the migration endpoint.

**Recommendation**: Keep `projectSchema` untouched for backward compatibility. Create a **separate** `workspaceSchema` with new required fields. The migration endpoint validates with `projectSchema` (read) and writes with `workspaceSchema`.

### 2.3 Service-Level Conflicts

- `ProjectService` reads from collection `"projects"` with `projectSchema` validation.
- `WorkspaceService` needs to read from collection `"workspaces"`.
- The plan proposes keeping both running simultaneously. ✓ **This is correct.**
- But `project-context-loader.ts` calls `projectService.getById()` directly. All V1.1 agent workflows will need a `workspaceService.getById()` call instead.

### 2.4 `projectId` Field in Existing Entities

The following V1 entities have a `projectId` field:
- `Task.projectId` — used for task-to-project linking
- `Decision.projectId` — used for decision-to-project linking
- `AgentRun.projectId` — used for agent run context
- `Proposal.projectId` (in validator) — used for proposal linking

**Problem**: Should these become `workspaceId`? If so, **existing V1 data breaks**. If not, we have a naming inconsistency where tasks link via `projectId` to documents in the `workspaces` collection.

**Recommendation**: For V1.1, add an **optional** `workspaceId` field to Task, Decision, and AgentRun alongside the existing `projectId`. The migration script should copy `projectId` → `workspaceId` for migrated entities. New code uses `workspaceId`. This avoids any data breakage.

---

## 3. Schema Conflicts

### 3.1 `BaseEntity.sourceRunId` vs. `organizationId`

- Plan adds `organizationId?: string` to `BaseEntity`. ✓ Safe — optional field addition.
- But `sourceRunId?: string` is already on `BaseEntity` and NOT in the Zod `baseEntitySchema`. This is an existing inconsistency — the domain type has it, but the Zod schema doesn't validate it. The plan should fix this while touching `BaseEntity`.

### 3.2 `WorkspaceStatus` vs. `ProjectStatus`

- V1: `ProjectStatus = "active" | "on_hold" | "completed" | "archived"`
- V1.1: `WorkspaceStatus = "active" | "on_hold" | "completed" | "archived"`
- These are **identical**. Remove the redundant `WorkspaceStatus` and reuse `ProjectStatus` (aliased to `EntityStatus` if desired).

### 3.3 `ProjectPhase` vs. `ProductStage` Overlap

- V1 `ProjectPhase` = `"spec" | "build" | "launch" | "maintenance" | "completed"`
- V1.1 `ProductStage` = `"validation" | "spec" | "build" | "launch" | "growth"`
- Overlap: `spec`, `build`, `launch`
- Conflict: V1 has `maintenance` and `completed`; V1.1 has `validation` and `growth`.
- V1 Projects currently in `maintenance` or `completed` phase will fail migration to `ProductStage`.

**Recommendation**: Migration script must handle `maintenance` → `growth` and `completed` → `growth` with `status: "completed"`. Document this mapping in the migration notes.

### 3.4 Checklist `Record<string, WorkspaceChecklistItem[]>` — Keys Must Match Stage Literals

The plan uses string keys for the checklists record (`validation`, `spec`, `build`, etc.). These must align exactly with the stage type literals. This is not validated anywhere in the plan — needs a Zod `z.record()` constraint.

---

## 4. UI Route Conflicts

### 4.1 Sidebar Active-Link Matching

Current sidebar uses `pathname.startsWith(item.url)` for active state. If we change Projects → Workspaces (`/projects` → `/workspaces`), the sidebar highlight will break for:
- Any deep links: `/projects/p1` → redirect → `/workspaces/p1` (user clicks Back → goes to `/projects` → redirect loop).
- External bookmarks to the old `/projects` path.

**Recommendation**: Keep the redirect pages as permanent (HTTP 308), not temporary (307).

### 4.2 Project Detail Redirect — `params` Access

The plan proposes:
```typescript
export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  redirect(`/workspaces/${params.projectId}`);
}
```

> [!CAUTION]
> In Next.js 15+ App Router, `params` is a **Promise** and must be awaited via `React.use(params)` or `await params` in an `async` component. The plan's sync access pattern will cause a runtime error.

**Must-fix**: Use `async function` or `React.use(params)`.

### 4.3 Existing V1 Project Detail Components Are Significant

The project detail page has a complete tab system (overview, roadmap, tasks, architecture, decisions, agent_runs, playbooks, risks) with sub-components. The plan proposes creating a new workspace cockpit from scratch but doesn't mention **reusing** any of these existing components. Significant duplication risk.

**Recommendation**: Port existing project detail components into a shared `_components/` directory and adapt them for the workspace cockpit. New V1.1 tabs (Stage Checklist, Validation, Launch/Delivery, Signals, Opportunities) can be added alongside existing tabs.

---

## 5. Backend/API Conflicts

### 5.1 `runAgentWorkflowRequestSchema` Needs `workspaceId`

The existing request schema accepts `projectId`. For V1.1 agent workflows, it should also accept `workspaceId`. The plan doesn't mention updating this schema.

**Must-fix**: Add `workspaceId: z.string().optional()` to `runAgentWorkflowRequestSchema`.

### 5.2 `AgentContext.project` Must Become `AgentContext.workspace`

The `AgentContext` interface has `project: ProjectSchemaType | null`. For V1.1 workflows, it needs `workspace: WorkspaceSchemaType | null`. Since V1 workflows still need `project`, the context should carry **both** fields.

**Must-fix**: Extend `AgentContext`:
```typescript
export interface AgentContext {
  // ... existing fields
  project: ProjectSchemaType | null;    // V1 workflows
  workspace: WorkspaceSchemaType | null; // V1.1 workflows
  signals?: SignalSchemaType[];          // V1.1 workflows
}
```

### 5.3 `V1WorkflowId` Is a Closed Type

The `V1WorkflowId` union type only has 5 members. The plan says to "register 5 new workflow IDs" in `types.ts`, but the orchestrator (`runAgentWorkflow`) checks `isV1WorkflowId()` which is gated to the `WORKFLOW_REGISTRY`. If V1.1 workflows aren't added to this registry with a wider type, they will fail with `"Unknown workflow"`.

**Must-fix**: Create a new `V1_1WorkflowId` type and union it:
```typescript
export type V1_1WorkflowId = "validate_idea" | "launch_prep" | "delivery_update" | "optimize_product" | "analyze_signals";
export type AllWorkflowId = V1WorkflowId | V1_1WorkflowId;
```
Then update `runAgentWorkflow`, `inferWorkflowId`, `WORKFLOW_REGISTRY`, `mapSaveActions`, `resolvePromptTemplate`, and `validateOutput` to accept `AllWorkflowId`.

### 5.4 `save-actions.ts` — Closed `Record<V1WorkflowId, ...>` Map

`mapSaveActions` uses `Record<V1WorkflowId, () => SaveAction[]>`. Adding V1.1 workflow IDs without changing the type will cause TypeScript errors. Must be updated to `AllWorkflowId`.

### 5.5 `prompt-templates.ts` — Same Closed Map

`resolvePromptTemplate` uses `Record<V1WorkflowId, (ctx) => PromptPair>`. Same issue.

### 5.6 `output-validator.ts` — Same Closed Map

`OUTPUT_SCHEMAS: Record<V1WorkflowId, z.ZodSchema>`. Same issue.

### 5.7 Missing `api/projects/*` Redirect

The V1 API has routes under `/api/projects/`. The plan only covers UI redirects from `/projects` to `/workspaces`, but doesn't mention API route redirects. Any frontend code or external integrations calling `/api/projects/create` will break.

**Recommendation**: Keep `/api/projects/*` routes functional in V1.1 and add new `/api/workspaces/*` routes. Deprecate the project routes with a warning header.

---

## 6. Agent/Prompt Risks

### 6.1 `formatProject()` in Prompt Templates

The `formatProject()` helper in `prompt-templates.ts` formats project context using `p.type`, `p.phase`, `p.status`. New V1.1 workflows need a `formatWorkspace()` helper that formats `workspaceType`, `stage`, `readinessScore`, `checklists` status. The plan mentions this but doesn't detail the implementation.

### 6.2 Prompt Files Not Connected to Code

The plan creates 5 new `.md` prompt files in `prompts/agents/`. But the existing V1 prompts in `prompts/agents/` (architect-agent.md, builder-agent.md, etc.) are **not loaded by any code** — the actual prompts are hardcoded inline in `prompt-templates.ts`. This means the new `.md` files will also be dead files unless `resolvePromptTemplate` is refactored to load from the filesystem.

**Recommendation**: Either:
1. Keep prompts inline in `prompt-templates.ts` (matching V1 pattern), or
2. Refactor to load from `.md` files, but do so for **all** prompts (V1 + V1.1) to maintain consistency.

---

## 7. Recommended Changes to Implementation Plan

### Must-Fix Before Coding

| # | Issue | Severity |
|---|---|---|
| 1 | Add `workspaceId` to `runAgentWorkflowRequestSchema`, `AgentContext`, `AgentRun`, `Task`, and `Decision` types | 🔴 Critical |
| 2 | Widen `V1WorkflowId` to `AllWorkflowId` across orchestrator, registry, prompts, output-validator, and save-actions | 🔴 Critical |
| 3 | Add `targetUser?` and `problem?` fields to `Workspace` interface for backward compat | 🔴 Critical |
| 4 | Fix `params` access in redirect pages to use Next.js 15+ async pattern | 🔴 Critical |
| 5 | Add missing `payloads.ts`, `types/index.ts`, `services/index.ts` updates to the plan | 🟡 High |
| 6 | Add `context-builder.ts` and `project-context-loader.ts` to the plan | 🟡 High |
| 7 | Add `firestore.indexes.json` as explicit deliverable with new composite indexes | 🟡 High |
| 8 | Fix `ProjectPhase` → `ProductStage` mapping for `maintenance` and `completed` values | 🟡 High |
| 9 | Add workspace CRUD API routes (`GET`, `PATCH`, `DELETE` for `/api/workspaces/[id]`) | 🟡 High |
| 10 | Add basic signal/opportunity CRUD API routes (not just agent-triggered endpoints) | 🟡 High |
| 11 | Fix `sourceRunId` inconsistency between `BaseEntity` (domain) and `baseEntitySchema` (Zod) | 🟢 Medium |
| 12 | Remove redundant `WorkspaceStatus` — reuse `ProjectStatus` or create shared `EntityStatus` | 🟢 Medium |

### Recommended Plan Additions

1. **Add Phase 0: Widen the Orchestrator Types** — Before anything else, create `AllWorkflowId`, extend `AgentContext`, and update all 4 closed maps (registry, prompts, output-validator, save-actions) to accept the wider type. This unblocks everything.

2. **Add explicit `context-builder.ts` update** to Phase 2 — The context builder is the **critical bridge** between services and agents. It must be able to load workspace context, signals, and checklists for V1.1 workflows.

3. **Add `payloads.ts` + barrel file updates** to Phase 1 — These are import dependencies; if they're missing, nothing downstream compiles.

---

## 8. Simplified Build Order

The plan's 6-phase, 22-step sequence is correct in principle but has dependency ordering issues. Here's a streamlined sequence:

### Phase 0: Type Foundation (unblocks everything)
1. `enums.ts` — Add workspace types, stages, signal/opportunity enums, **and** new agent role + workflow type literals
2. `domain.ts` — Add `organizationId` to `BaseEntity`, fix `sourceRunId` in Zod. Define `Workspace`, `Signal`, `Opportunity`. Keep `Project` as alias.
3. `payloads.ts` — Add `CreateWorkspacePayload`, `WorkspaceListItem`, `CreateSignalPayload`, `CreateOpportunityPayload`
4. `types/index.ts` — Re-export everything
5. `agents/types.ts` — Create `V1_1WorkflowId`, `AllWorkflowId`, extend `AgentContext` with `workspace` + `signals` fields, add V1.1 output interfaces

### Phase 1: Validation & Services
6. `validators/index.ts` — Add `workspaceSchema`, `signalSchema`, `opportunitySchema`, `createWorkspaceRequestSchema`, `toggleChecklistRequestSchema`
7. `workspace.service.ts`, `signal.service.ts`, `opportunity.service.ts`
8. `services/index.ts` — Re-export new services
9. `firestore.rules` — Whitelist new collections
10. `firestore.indexes.json` — Add composite indexes

### Phase 2: Agent Orchestration
11. `workflow-registry.ts` — Register 5 new workflows with `AllWorkflowId`
12. `workspace-context-loader.ts` — New file for loading workspace context
13. `context-builder.ts` — Add workspace path alongside project path
14. `prompt-templates.ts` — Add 5 new prompt builders + `formatWorkspace()` helper
15. `output-validator.ts` — Add 5 new output schemas
16. `save-actions.ts` — Add 5 new mappers
17. `run-agent-workflow.ts` — Update to accept `AllWorkflowId`, add `workspaceId` flow

### Phase 3: API Routes
18. `/api/workspaces/create/route.ts`
19. `/api/workspaces/[workspaceId]/route.ts` (CRUD)
20. `/api/signals/route.ts` (CRUD)
21. `/api/opportunities/route.ts` (CRUD)
22. `/api/workspaces/triage-signals/route.ts`
23. `/api/workspaces/evaluate-opportunities/route.ts`
24. `/api/migrate-projects/route.ts`
25. `/api/agent/run/route.ts` — Add `workspaceId` support

### Phase 4: UI
26. `app-sidebar.tsx` — Rename "Projects" → "Workspaces", add Signals + Opportunities
27. Redirect pages (`/projects` → `/workspaces`)
28. Workspaces listing page
29. Workspace cockpit (detail page with tabs)
30. Global Signals + Opportunities pages

### Phase 5: Hardening
31. Mock data for workspaces
32. Unit tests for services + validators
33. Migration script testing

---

## 9. Features to Defer to V1.2

| Feature | Reason |
|---|---|
| **Signal Analyst Agent** (`analyze_signals`) | Requires telemetry ingestion infrastructure (Sentry/PostHog/Zendesk webhooks) that doesn't exist yet. Ship the `Signal` entity and manual CRUD in V1.1, defer automated analysis. |
| **Improvement Agent** (`optimize_product`) | Depends on sufficient signal/opportunity data that won't exist at V1.1 launch. Ship the `Opportunity` entity and manual CRUD. |
| **`organizationId` enforcement in Firestore rules** | The plan correctly notes this is for future SaaS. Adding the field is fine, but don't write any rule logic around it yet — it complicates testing. |
| **Automatic checklist-to-agent triggers** | The plan already recommends deferring this. ✓ |
| **External integration signals** (Sentry, PostHog, Zendesk webhooks) | No integration infrastructure exists in V1. Defer to V1.2 after basic Signal CRUD is proven. |
| **Impact-vs-Effort matrix/Kanban for Opportunities** | Complex UI component. Ship a simple list view in V1.1, upgrade to Kanban in V1.2. |

---

## 10. Risks Summary

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `Project = Workspace` alias breaks TypeScript consumers | High | High | Keep `Project` interface intact, use separate `Workspace` interface. Only share via optional backward-compat fields. |
| V1.1 agent workflows silently fail due to closed `V1WorkflowId` type | High | High | Widen to `AllWorkflowId` in Phase 0 before any agent work begins. |
| Migration script maps `maintenance`/`completed` phases incorrectly | Medium | Medium | Explicit mapping table + unit test for every ProjectPhase → ProductStage conversion. |
| `params` runtime crash on Next.js 15+ redirect pages | High | Medium | Use `async` component or `React.use()` pattern. |
| Prompt `.md` files created but never loaded (dead code) | Medium | Low | Decide upfront: inline prompts (match V1) or filesystem-loaded prompts (new pattern for all). |
| Missing Firestore indexes cause slow queries on `workspaces` collection | Low | Medium | Deploy `firestore.indexes.json` changes to emulator and production before code deploy. |
