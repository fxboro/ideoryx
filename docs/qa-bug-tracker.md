# Ideoryx (Mission Control AI) — QA Bug & Issue Tracker

This document tracks all defects, inconsistencies, and design deviations identified during the QA verification phase of Ideoryx V1.1.

## Issue Status Legend
*   🔴 **Open**: Bug identified and confirmed; awaiting developer assignment.
*   🟡 **In Progress**: Work has started to resolve the issue.
*   🟢 **Resolved**: Fixed by engineering; awaiting QA verification.
*   🔵 **Verified**: Confirmed fixed by QA; closed.

---

## Active Bug Log

| Issue ID | Severity | Component | Status | Description | Code Reference |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | 🟡 Medium | Types (Domain) | 🔵 Verified | `BaseEntity` is missing the `organizationId?: string` field required for SaaS tenant partitioning. It is currently defined inside `Workspace` only. | [domain.ts:L47](file:///c:/Users/dayoo/OneDrive/Dokumente/development/ideoryx/src/types/domain.ts#L47-L53) |
| **BUG-002** | 🟡 Medium | Firestore Config | 🔵 Verified | Missing composite indexes for `signals` and `opportunities` queries in `firestore.indexes.json`. | [firestore.indexes.json](file:///c:/Users/dayoo/OneDrive/Dokumente/development/ideoryx/firestore.indexes.json) |
| **BUG-003** | 🟡 Medium | Firestore Rules | 🔵 Verified | The `signals` and `opportunities` collections are missing from the `firestore.rules` whitelist collections array. | [firestore.rules:L49](file:///c:/Users/dayoo/OneDrive/Dokumente/development/ideoryx/firestore.rules#L47-L57) |
| **BUG-004** | 🔴 High | Agent Orchestration (Prompts) | 🔵 Verified | `formatWorkspace` helper is missing, and prompt templates/resolvers for the 5 new V1.1 workflows (`validate_idea`, `launch_prep`, `delivery_update`, `optimize_product`, `analyze_signals`) are not implemented. | [prompt-templates.ts:L19](file:///c:/Users/dayoo/OneDrive/Dokumente/development/ideoryx/src/lib/agents/prompt-templates.ts#L19-L30) |
| **BUG-005** | 🔴 High | UI Redirects | 🔵 Verified | Legacy `/projects` and `/projects/[projectId]` pages do not redirect to `/workspaces` and `/workspaces/[workspaceId]`. | [projects/page.tsx](file:///c:/Users/dayoo/OneDrive/Dokumente/development/ideoryx/src/app/(dashboard)/projects/page.tsx) |


---

## Detailed Bug Reports

### BUG-001: `BaseEntity` missing `organizationId` field
*   **Severity**: 🟡 Medium
*   **Impact**: Blocks unified multi-tenancy controls. If SaaS tenancy partition is implemented, other tables (tasks, decisions, playbooks, signals) will not inherit the tenant isolation parameters because it's missing from the base schema type.
*   **Steps to Reproduce**:
    1. Inspect `src/types/domain.ts` interface `BaseEntity`.
    2. Note that `organizationId?: string` is absent.
    3. Note that `organizationId?: string` is defined specifically in `Workspace` on line 113.
*   **Recommended Resolution**:
    *   Move `organizationId?: string` from `Workspace` interface to `BaseEntity` interface.
    *   Confirm Zod schemas in `src/lib/validators/index.ts` align with this structure.
*   **Resolution Details**:
    *   **Status**: 🔵 Verified by QA.
    *   **Details**: Moved `organizationId?: string` to `BaseEntity` in [domain.ts](file:///c:/Users/dayoo/OneDrive/Dokumente/development/ideoryx/src/types/domain.ts#L47-L53), inheriting it automatically for `Workspace` and all other entities extending `BaseEntity`. Also updated `baseEntitySchema` and `workspaceSchema` in [index.ts](file:///c:/Users/dayoo/OneDrive/Dokumente/development/ideoryx/src/lib/validators/index.ts#L93-L99) to align validation rules. Verified correct TypeScript compilation and that all 46 existing tests pass cleanly.

### BUG-002: Missing Firestore Composite Indexes for `signals` and `opportunities`
*   **Severity**: 🟡 Medium
*   **Impact**: Query failures at runtime. Firestore requires composite indexes for any query combining equality filters (`where`) and inequality ordering (`orderBy`) on different fields. Running `listSignalsByWorkspace`, `listOpportunitiesByWorkspace`, `listSignalsByUser`, or `listOpportunitiesByUser` will crash at runtime.
*   **Steps to Reproduce**:
    1. Inspect `src/lib/services/signal.service.ts` query `listSignalsByWorkspace` and inherited `listSignalsByUser`.
    2. Inspect `src/lib/services/opportunity.service.ts` query `listOpportunitiesByWorkspace` and inherited `listOpportunitiesByUser`.
    3. Note that `firestore.indexes.json` contains no entries for `signals` or `opportunities` collection groups.
*   **Recommended Resolution**:
    *   Append composite index configurations for `signals` (`userId` + `updatedAt desc`, and `workspaceId` + `createdAt desc`) to `firestore.indexes.json`.
    *   Append composite index configurations for `opportunities` (`userId` + `updatedAt desc`, and `workspaceId` + `score desc`) to `firestore.indexes.json`.
*   **Resolution Details**:
    *   **Status**: Fixed in engineering; awaiting QA check.
    *   **Details**: Appended the 4 missing composite indexes (2 for `signals` and 2 for `opportunities`) to [firestore.indexes.json](file:///c:/Users/dayoo/OneDrive/Dokumente/development/ideoryx/firestore.indexes.json) to cover all filtered listing queries.

### BUG-003: `firestore.rules` whitelist missing `signals` and `opportunities`
*   **Severity**: 🟡 Medium
*   **Impact**: Client-side queries targeting these new collections will be blocked by Firestore, causing permission denied failures on the frontend if accessed client-side.
*   **Steps to Reproduce**:
    1. Open `firestore.rules`.
    2. Inspect lines 49, 52, and 55.
    3. Observe that only `workspaces` was added to the list, while `signals` and `opportunities` are missing.
*   **Recommended Resolution**:
    *   Add `'signals'` and `'opportunities'` to the collection whitelist arrays in `firestore.rules` on lines 49, 52, and 55.
*   **Resolution Details**:
    *   **Status**: 🔵 Verified by QA.
    *   **Details**: Added `'signals'` and `'opportunities'` to the whitelist arrays in [firestore.rules](file:///c:/Users/dayoo/OneDrive/Dokumente/development/ideoryx/firestore.rules#L47-L57) for `read, delete`, `create`, and `update` matches. Verified that compilation is successful and all tests pass cleanly.

### BUG-004: Missing `formatWorkspace` helper and prompts for the 5 new V1.1 workflows
*   **Severity**: 🔴 High
*   **Impact**: Completely blocks prompt compilation and model invocation for the 5 new workflows introduced in V1.1: `validate_idea`, `launch_prep`, `delivery_update`, `optimize_product`, and `analyze_signals`.
*   **Steps to Reproduce**:
    1. Inspect `src/lib/agents/prompt-templates.ts`.
    2. Note that `resolvePromptTemplate` only maps V1 workflows and does not support the 5 new ones.
    3. Note that `formatWorkspace` helper is not defined to format workspace context fields.
*   **Recommended Resolution**:
    *   Widen orchestrator workflow ID types to include the 5 new workflows.
    *   Implement `formatWorkspace` helper function to extract stage, readiness, checklists, stack, etc.
    *   Implement prompt builders for the 5 new workflows and map them in `resolvePromptTemplate`.
*   **Resolution Details**:
    *   **Status**: 🔵 Verified by QA.
    *   **Details**: Widened the `V1WorkflowId` type to `AllWorkflowId` to support both V1 and V1.1 workflows across the registry, prompt builders, validators, and save action mappers. Implemented `formatWorkspace` and `formatSignals` helper context formatters, and added all 5 prompt template builder configurations. Added new unit and integration tests covering the V1.1 workflows (validation, launch, delivery, optimize, signals) in Vitest, and verified successful compilation (`npx tsc --noEmit`) and 100% test passes.

### BUG-005: Missing legacy `/projects` redirects to `/workspaces`
*   **Severity**: 🔴 High
*   **Impact**: Bookmark breakages and deep link failures. Users navigating to old `/projects` URLs will see outdated V1 layouts instead of being redirecting to their respective workspace pages.
*   **Steps to Reproduce**:
    1. Inspect `src/app/(dashboard)/projects/page.tsx`.
    2. Note that the page renders the old V1 `ProjectsPage` component instead of redirecting.
    3. Inspect `src/app/(dashboard)/projects/[projectId]/page.tsx`.
    4. Note that the page renders the old V1 `ProjectDetailPage` component instead of redirecting.
*   **Recommended Resolution**:
    *   Replace `src/app/(dashboard)/projects/page.tsx` with a server-side redirect to `/workspaces`.
    *   Replace `src/app/(dashboard)/projects/[projectId]/page.tsx` with a server-side redirect to `/workspaces/[workspaceId]`, ensuring the `params` are awaited before redirecting.
*   **Resolution Details**:
    *   **Status**: 🔵 Verified by QA.
    *   **Details**: Replaced the components in [projects/page.tsx](file:///c:/Users/dayoo/OneDrive/Dokumente/development/ideoryx/src/app/(dashboard)/projects/page.tsx) and [projects/[projectId]/page.tsx](file:///c:/Users/dayoo/OneDrive/Dokumente/development/ideoryx/src/app/(dashboard)/projects/[projectId]/page.tsx) with clean, server-side redirects to `/workspaces` and `/workspaces/[workspaceId]` respectively. The detail page un-wrapper awaits the compliant promise-based params for Next.js 15 App Router compatibility.




