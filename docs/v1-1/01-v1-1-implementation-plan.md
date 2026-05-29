# Mission Control V1.1 Implementation Plan — Lifecycle Execution OS

Upgrading Mission Control from a personal AI execution cockpit (V1) to a lifecycle execution OS (V1.1) for founders, builders, and freelancers.

## User Review Required

We are replacing the concept of **Projects** with **Workspaces** and introducing structured stage checklists, readiness scores, telemetry signals, and monetization opportunities.

> [!IMPORTANT]
> **Data Migration strategy**: To keep V1 functionality intact, we will:
> 1. Keep the Firestore collection name `projects` but expand its schema to support both V1 `Project` and V1.1 `Workspace` interfaces (by adding `workspaceType`, `stage`, `readinessScore`, `checklists`, and `organizationId`).
> 2. Alternatively, create a new collection `workspaces` and provide a migration endpoint `/api/migrate-projects` that transforms V1 `projects` documents into V1.1 `workspaces` with default checklists. We recommend the **new collection approach** (`workspaces`) for database cleanliness, while redirecting V1 `/projects` router paths to `/workspaces`.
> 3. Add `organizationId?: string` to all entities via `BaseEntity` to enable tenant partitioning in future SaaS updates.

> [!WARNING]
> **Agent & Workflow Extensions**: We are adding 5 new agents: `Validation`, `Launch`, `Delivery`, `Improvement`, and `Signal Analyst`. We will also add 5 new workflow handlers in `src/lib/agents/prompt-templates.ts` and `src/lib/agents/output-validator.ts`.

---

## Open Questions

> [!NOTE]
> **Automatic Checklist Actions**: Should checking off a lifecycle checklist item automatically trigger associated agents (e.g., checking off "Design database schema" triggers a schema check by the Reviewer/Architect)?
> *Recommendation*: For V1.1, keep checklist marking manual, but offer a button to "Run Stage Agent" based on current readiness to avoid unexpected model runs/costs.

---

## Proposed Changes

We will introduce the updates in clean boundaries (data models first, database services, agent orchestration, and finally the UI).

### 1. Type Definitions & Schemas

#### [MODIFY] [enums.ts](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/types/enums.ts)
- Add workspace types, stages, new agent roles, and new workflow types.
- Add signal and opportunity categories.

```typescript
// Add:
export type WorkspaceType = "product" | "client";

export type ProductStage = "validation" | "spec" | "build" | "launch" | "growth";
export type ClientStage = "discovery" | "proposal" | "delivery" | "launch" | "support";

export type WorkspaceStatus = "active" | "on_hold" | "completed" | "archived";

// Extend AgentRole:
export type AgentRole =
  | "execution"
  | "architect"
  | "builder"
  | "reviewer"
  | "founder"
  | "freelance"
  | "learning"
  | "validation"       // NEW
  | "launch"           // NEW
  | "delivery"         // NEW
  | "improvement"      // NEW
  | "signal_analyst";  // NEW

// Extend WorkflowType:
export type WorkflowType =
  | "scope_mvp"
  | "design_architecture"
  | "sprint_plan"
  | "code_review"
  | "proposal_draft"
  | "discovery_prep"
  | "study_plan"
  | "decision_analysis"
  | "retrospective"
  | "custom"
  | "validate_idea"        // NEW
  | "launch_prep"          // NEW
  | "delivery_update"      // NEW
  | "optimize_product"     // NEW
  | "analyze_signals";     // NEW

// New Signal Types:
export type SignalCategory = "performance" | "error" | "feedback" | "usage";
export type SignalSeverity = "low" | "medium" | "high";
export type SignalStatus = "new" | "triaged" | "resolved";

// New Opportunity Types:
export type OpportunityType = "upsell" | "feature_request" | "optimization" | "monetization";
export type OpportunityStatus = "backlog" | "evaluating" | "implementing" | "completed" | "dropped";
```

#### [MODIFY] [domain.ts](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/types/domain.ts)
- Add `organizationId?: string` to `BaseEntity`.
- Define `Workspace`, `WorkspaceChecklistItem`, `Signal`, and `Opportunity` interfaces.
- Retain `Project` type as an alias/extension of `Workspace` to keep V1 dependencies intact.

```typescript
export interface BaseEntity {
  id: string;
  userId: string;
  organizationId?: string; // NEW (SaaS tenancy prep)
  createdAt: number;
  updatedAt: number;
  sourceRunId?: string;
}

export interface WorkspaceChecklistItem {
  id: string;
  stage: string;
  label: string;
  completed: boolean;
  completedAt?: number;
}

export interface Workspace extends BaseEntity {
  name: string;
  workspaceType: WorkspaceType;
  status: WorkspaceStatus;
  summary: string;
  stage: ProductStage | ClientStage;
  readinessScore: number; // 0-100 percentage
  checklists: Record<string, WorkspaceChecklistItem[]>;
  stack?: string[];
  currentFocus?: string;
  nextMilestone?: string;
  risk: RiskLevel;
  goalId?: string;
  // Keep Project fields for V1 compatibility:
  type?: ProjectType;
  phase?: ProjectPhase;
}

// Backward compatibility:
export type Project = Workspace;

export interface Signal extends BaseEntity {
  workspaceId: string;
  title: string;
  description: string;
  category: SignalCategory;
  severity: SignalSeverity;
  status: SignalStatus;
  source: string; // e.g. "Sentry", "PostHog", "Zendesk", "Client Email"
}

export interface Opportunity extends BaseEntity {
  workspaceId: string;
  title: string;
  description: string;
  type: OpportunityType;
  status: OpportunityStatus;
  impact: RiskLevel; // low/medium/high
  effort: RiskLevel; // low/medium/high
  valueHypothesis?: string;
}
```

#### [MODIFY] [validators/index.ts](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/lib/validators/index.ts)
- Update enums and primitives with new literals.
- Update `baseEntitySchema` to include `organizationId`.
- Add `workspaceChecklistItemSchema`, `workspaceSchema`, `signalSchema`, and `opportunitySchema`.
- Define API request validators for workspaces, signal triages, and opportunities.

---

### 2. Services & Rules

#### [NEW] [workspace.service.ts](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/lib/services/workspace.service.ts)
- Base CRUD operations for workspaces.
- Logic to initialize default stage checklists when a workspace is created.
- Logic to toggle checklist items and recalculate `readinessScore` for the current stage.

```typescript
export const DEFAULT_PRODUCT_CHECKLISTS = {
  validation: [
    { id: "v1", stage: "validation", label: "Define Target Customer Profile (ICP)", completed: false },
    { id: "v2", stage: "validation", label: "Validate 5+ customer pain points in interviews", completed: false },
    { id: "v3", stage: "validation", label: "Analyze competitors and unique positioning", completed: false },
    { id: "v4", stage: "validation", label: "Establish Unique Value Proposition (UVP)", completed: false },
  ],
  spec: [
    { id: "s1", stage: "spec", label: "Write MVP specifications and scope", completed: false },
    { id: "s2", stage: "spec", label: "Design modular system architecture", completed: false },
    { id: "s3", stage: "spec", label: "Draft Firestore collection/schema details", completed: false },
    { id: "s4", stage: "spec", label: "Define milestone timeline and delivery targets", completed: false },
  ],
  build: [
    { id: "b1", stage: "build", label: "Set up repository & configure dev environment", completed: false },
    { id: "b2", stage: "build", label: "Implement authentication and user accounts", completed: false },
    { id: "b3", stage: "build", label: "Build core feature modules", completed: false },
    { id: "b4", stage: "build", label: "Run security and code quality review checklists", completed: false },
  ],
  launch: [
    { id: "l1", stage: "launch", label: "Provision production database & deployments", completed: false },
    { id: "l2", stage: "launch", label: "Set up performance/telemetry monitoring", completed: false },
    { id: "l3", stage: "launch", label: "Create onboarding guide / tutorials", completed: false },
    { id: "l4", stage: "launch", label: "Execute launch marketing/campaign checklist", completed: false },
  ],
  growth: [
    { id: "g1", stage: "growth", label: "Collect and index post-launch user feedback", completed: false },
    { id: "g2", stage: "growth", label: "Monitor telemetry errors and triage alerts", completed: false },
    { id: "g3", stage: "growth", label: "Map improvement opportunities (impact vs effort)", completed: false },
  ]
};

export const DEFAULT_CLIENT_CHECKLISTS = {
  discovery: [
    { id: "d1", stage: "discovery", label: "Qualify lead and contact alignment", completed: false },
    { id: "d2", stage: "discovery", label: "Identify primary business pain points", completed: false },
    { id: "d3", stage: "discovery", label: "Host discovery/requirements call", completed: false },
    { id: "d4", stage: "discovery", label: "Establish high-level budget match", completed: false },
  ],
  proposal: [
    { id: "p1", stage: "proposal", label: "Define detailed client project scope", completed: false },
    { id: "p2", stage: "proposal", label: "Estimate implementation hours and cost logic", completed: false },
    { id: "p3", stage: "proposal", label: "Generate and review draft proposal", completed: false },
    { id: "p4", stage: "proposal", label: "Deliver final proposal and capture feedback", completed: false },
  ],
  delivery: [
    { id: "e1", stage: "delivery", label: "Conduct project kickoff with client", completed: false },
    { id: "e2", stage: "delivery", label: "Ship milestone deliverables on timeline", completed: false },
    { id: "e3", stage: "delivery", label: "Send periodic progress & scope reports", completed: false },
    { id: "e4", stage: "delivery", label: "Perform QA and client feedback cycles", completed: false },
  ],
  launch: [
    { id: "c1", stage: "launch", label: "Deploy final solution to client production", completed: false },
    { id: "c2", stage: "launch", label: "Conduct handover session & training", completed: false },
    { id: "c3", stage: "launch", label: "Submit system documentation and admin keys", completed: false },
    { id: "c4", stage: "launch", label: "Secure client final sign-off", completed: false },
  ],
  support: [
    { id: "u1", stage: "support", label: "Sign SLAs / define maintenance terms", completed: false },
    { id: "u2", stage: "support", label: "Schedule monthly feedback follow-up", completed: false },
    { id: "u3", stage: "support", label: "Analyze expansion/retention opportunities", completed: false },
  ]
};
```

#### [NEW] [signal.service.ts](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/lib/services/signal.service.ts)
- Base CRUD operations for telemetry signals.
- Filter list by workspace.

#### [NEW] [opportunity.service.ts](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/lib/services/opportunity.service.ts)
- Base CRUD operations for product/client opportunities.

#### [MODIFY] [firestore.rules](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/firestore.rules)
- Add `workspaces`, `signals`, and `opportunities` to whitelisted collections.
- Ensure that if `organizationId` is populated in the future, it verifies tenancy (for now, `isOwner(userId)` is the fallback).

---

### 3. Agent Orchestration & Prompt Extensions

#### [NEW] [validation-agent.md](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/prompts/agents/validation-agent.md)
- Prompt detailing evaluation guidelines for validating market opportunities, client lead pain points, and ICP target segments.

#### [NEW] [launch-agent.md](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/prompts/agents/launch-agent.md)
- Prompt instructing on release checklists, announcement copies, and deployment plans.

#### [NEW] [delivery-agent.md](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/prompts/agents/delivery-agent.md)
- Prompt for drafting client reports, progress updates, and analyzing scope changes.

#### [NEW] [improvement-agent.md](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/prompts/agents/improvement-agent.md)
- Prompt instructing on evaluating logs, codebases, or feedback to identify feature upgrades, upsells, or monetizations.

#### [NEW] [signal-analyst-agent.md](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/prompts/agents/signal-analyst-agent.md)
- Prompt for parsing telemetry feeds, errors, performance degradation logs, and triaging issues.

#### [MODIFY] [agents/types.ts](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/lib/agents/types.ts)
- Register the 5 new workflow IDs: `validate_idea`, `launch_prep`, `delivery_update`, `optimize_product`, `analyze_signals`.
- Map output contracts (interfaces) for each of the new workflows.

#### [MODIFY] [agents/workflow-registry.ts](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/lib/agents/workflow-registry.ts)
- Map new workflow IDs to their respective new agents and categories.

#### [MODIFY] [agents/prompt-templates.ts](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/lib/agents/prompt-templates.ts)
- Implement prompt-builder resolvers for:
  - `validate_idea` (Validation Agent)
  - `launch_prep` (Launch Agent)
  - `delivery_update` (Delivery Agent)
  - `optimize_product` (Improvement Agent)
  - `analyze_signals` (Signal Analyst Agent)
- Add functions to format Workspace context (instead of just project context) including stage, readiness score, active checklist status, and telemetry signals.

#### [MODIFY] [agents/output-validator.ts](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/lib/agents/output-validator.ts)
- Define output schemas for the 5 new workflows using Zod.
- Register new schemas in the validation registry.

#### [MODIFY] [agents/save-actions.ts](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/lib/agents/save-actions.ts)
- Map output JSON structures to save actions:
  - `analyze_signals` -> Create/Update triaged `signals`.
  - `optimize_product` -> Create new `opportunities`.
  - `validate_idea` -> Update workspace details, add validated pain points to workspace notes, create starter tasks.
  - `launch_prep` -> Update workspace checklist, create deployment tasks.
  - `delivery_update` -> Create updates/timeline tasks.

---

### 4. UI Route Changes & Redirects

To avoid breaking existing V1 bookmarks and links, we will implement client-side redirects for the old `/projects` routes, routing them transparently to `/workspaces`.

#### [MODIFY/REPLACE] [projects/page.tsx](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/app/(dashboard)/projects/page.tsx)
- Change to a server-side redirect:
```typescript
import { redirect } from "next/navigation";
export default function ProjectsPage() {
  redirect("/workspaces");
}
```

#### [MODIFY/REPLACE] [projects/[projectId]/page.tsx](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/app/(dashboard)/projects/[projectId]/page.tsx)
- Change to redirect:
```typescript
import { redirect } from "next/navigation";
export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  redirect(`/workspaces/${params.projectId}`);
}
```

#### [NEW] [workspaces/page.tsx](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/app/(dashboard)/workspaces/page.tsx)
- Display all active/archived Workspaces.
- Toggle between Product and Client workspaces.
- Filter by Stage, Status, Risk, and readiness score.
- Dynamic visual components (cards, tabular listing) showing progress bars with readiness scores.

#### [NEW] [workspaces/[workspaceId]/page.tsx](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/app/(dashboard)/workspaces/[workspaceId]/page.tsx)
- Workspace Cockpit tabs:
  - **Overview**: Basic statistics, description, stack, current focus, current stage, and overall readiness score.
  - **Stage Checklist**: Visual interactive check list for the current active stage. Toggling items makes an immediate Firestore update and recalculates the stage readiness score. Includes "Advance to Next Stage" control.
  - **Validation & Discovery**: Evaluated opportunity sheets, user interviews, pain point logs (integrated with Validation Agent).
  - **Launch & Delivery**: Release management, deployment steps, drafts of client emails, milestone history (integrated with Launch/Delivery Agents).
  - **Telemetry Signals**: Internal performance logs, error counts, customer tickets, client feedback signals (integrated with Signal Analyst).
  - **Opportunities**: Up-sell listings, product upgrade cards, refactoring proposals (integrated with Improvement Agent).
  - **Tasks, Decisions, Agent Runs, Playbooks**: V1 tabs migrated to support the Workspace model.

#### [NEW] [signals/page.tsx](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/app/(dashboard)/signals/page.tsx)
- Central log of all incoming signals across all workspaces. Filterable by category, severity, status, and workspace. Includes a CTA to "Run Signal Analyst" to triage unresolved logs.

#### [NEW] [opportunities/page.tsx](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/app/(dashboard)/opportunities/page.tsx)
- Matrix/Kanban board of opportunities. Segmented by Type (upsell, monetization, refactor) and Status. Sortable by Impact vs. Effort.

#### [MODIFY] [components/app-sidebar.tsx](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/components/app-sidebar.tsx)
- Change "Projects" tab to "Workspaces" with the route `/workspaces` (using `Briefcase` or `FolderKanban` icon).
- Add new sidebar link: "Telemetry Signals" (`/signals` with `Activity` or `BellRing` icon).
- Add new sidebar link: "Opportunities" (`/opportunities` with `Lightbulb` or `TrendingUp` icon).

---

### 5. Backend/API Changes

#### [NEW] [/api/workspaces/create/route.ts](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/app/api/workspaces/create/route.ts)
- POST endpoint to instantiate a workspace. Scopes the record with the authenticated `userId`, optional `organizationId`, and populates `checklists` based on default sets.

#### [NEW] [/api/workspaces/triage-signals/route.ts](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/app/api/workspaces/triage-signals/route.ts)
- POST endpoint to evaluate a bunch of signals via `Signal Analyst Agent` and return suggested actions.

#### [NEW] [/api/workspaces/evaluate-opportunities/route.ts](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/app/api/workspaces/evaluate-opportunities/route.ts)
- POST endpoint running the `Improvement Agent` against workspace signals, feedback, and tasks to recommend optimization points.

#### [NEW] [/api/migrate-projects/route.ts](file:///c:/Users/dayoo/OneDrive/Dokumente/development/mission-control-ai/src/app/api/migrate-projects/route.ts)
- Backwards compatibility endpoint. Reads existing `projects` collection and transforms documents to `workspaces` in Firestore:
  - `type: "product"` -> `workspaceType: "product"`, stage `validation`.
  - `type: "freelance"` -> `workspaceType: "client"`, stage `discovery`.
  - `type: "learning"` -> `workspaceType: "product"`, stage `build`.
  - Seed default checklists for each stage.
  - Calculate initial `readinessScore` (default to 0%).

---

## Step-by-Step Implementation Order

To execute the upgrade without disrupting existing features, we will follow a strict, phased build sequence:

### Phase 1: Database & Rules Foundation
1. **Extend Domain Types**: Update `enums.ts` and `domain.ts` with workspace definitions, lifecycle stages, signals, opportunities, new agent roles, and the `organizationId` parameter.
2. **Update Zod Schemas**: Modify `validators/index.ts` to include the Zod validation schemas matching the new type systems.
3. **Define Services**: Create `workspace.service.ts`, `signal.service.ts`, and `opportunity.service.ts` for database CRUD.
4. **Update Security Rules**: Append `firestore.rules` and `firestore.indexes.json` to configure whitelisted collections, indexes, and tenancy rules.

### Phase 2: Agent Orchestration Engine Upgrade
5. **Agent Prompts**: Create the 5 markdown files for the new agents in the `prompts/agents/` folder.
6. **Registry Expansion**: Update `workflow-registry.ts` and `types.ts` with the new workflows and output type contracts.
7. **Prompt Templating**: Update `prompt-templates.ts` to resolve prompt templates for the 5 new agents and correctly format Workspace context (stage, readiness score, checklists, signals).
8. **JSON Validation**: Implement the 5 new output validation schemas in `output-validator.ts`.
9. **Save Action Mapping**: Update `save-actions.ts` to support saving triaged signals, new opportunities, and update workspace details.

### Phase 3: Backend API Development
10. **Migration Handler**: Create `/api/migrate-projects` endpoint to translate V1 projects to workspaces.
11. **Workspace API**: Implement `/api/workspaces/create` to handle workspace instantiation.
12. **Signal & Opportunity APIs**: Implement `/api/signals/triage` and `/api/opportunities/evaluate` endpoint handlers.

### Phase 4: UI Navigation & Redirects
13. **Navigation Sidebar**: Update `app-sidebar.tsx` with "Workspaces", "Signals", and "Opportunities" paths.
14. **Redirect Scaffolding**: Replace page handlers in `src/app/(dashboard)/projects` and `src/app/(dashboard)/projects/[projectId]` with server-side redirects to `/workspaces`.

### Phase 5: Workspace Cockpit & Page Components
15. **Workspaces Workspace Directory**: Build the main `/workspaces` listing grid page.
16. **Workspace Details Page**: Compose `/workspaces/[workspaceId]/page.tsx` displaying summary statistics and the tab control.
17. **Interactive Checklists Component**: Build the stage checklist view supporting real-time toggling and readiness updates.
18. **Module Dashboard Tabs**: Implement dedicated viewport panels for Validation, Launch/Delivery, Telemetry Signals, and Opportunity management.
19. **Global Feeds**: Implement `/signals` and `/opportunities` main listing boards.

### Phase 6: Hardening, Seeding & Launch
20. **Seeding Utility**: Seed realistic workspace, checklist, signal, and opportunity data.
21. **Automated Testing**: Write unit tests for services and validators in the `/tests` folder.
22. **Manual QA Gate Validation**: Validate the V1-to-V1.1 migration script, checklist score updates, redirects, and agent orchestration.

---

## Verification Plan

### Automated Tests
*Because there are no active tests in the `/tests` folder, we will create new unit tests under `/tests` specifically for the database services and agent validation schemas.*
- Run local unit tests to verify Zod validation:
  ```powershell
  npm run test
  ```
- Verify Firestore rule modifications:
  Use firebase-emulator to run rules validation.

### Manual Verification
1. **Migration Verification**: Trigger `/api/migrate-projects` with a test account containing V1 projects and verify they import cleanly into `/workspaces` with populated checklists.
2. **Readiness Calculations**: Verify toggling checklist items on a workspace details view correctly updates the stage readiness percentage dynamically.
3. **Redirections**: Navigate manually to `/projects` and verify the browser successfully redirects to `/workspaces` preserving URL search parameters.
4. **Agent Workflows**: Run the "Signal Analyst" agent in the Agents Console against mocked error signals and check if it suggests save actions that successfully persist `signals` records.

---

## Risks and Rollback Plan

### Identified Risks
1. **Migration Data Loss**: If a user runs the migration, V1 projects could be misconfigured.
   - *Mitigation*: The `/api/migrate-projects` will strictly follow a read-and-clone architecture, creating new documents in the `workspaces` collection without modifying or deleting the original `projects` documents.
2. **Model Schema Mismatch**: LLMs returning JSON structure updates could fail output validation.
   - *Mitigation*: Implement fallback validation rules or default schema mocks when LLM JSON outputs are malformed, logging errors in `agent_runs` for audit purposes.
3. **Firestore Index Spikes**: New collections (`workspaces`, `signals`, `opportunities`) will require composite query indexes (ordering by `userId` and `updatedAt`).
   - *Mitigation*: Update `firestore.indexes.json` before deployment, executing queries to pre-trigger index building on the staging instance.

### Rollback Strategy
1. **Database Rollback**: Keep `projects` collection completely untouched. If the workspace migration fails or is rejected, we can return to V1 by simply restoring `/projects` page routing.
2. **Route Reversion**: Revert `/components/app-sidebar.tsx` and delete the redirects in `/projects` pages to restore V1 viewports instantly.
3. **API Reversion**: Revert `/api/agent/run` configurations back to V1 enums.
