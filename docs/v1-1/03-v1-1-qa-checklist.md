# Mission Control V1.1 — QA Verification Checklist

This checklist defines the validation steps required to sign off on the V1.1 upgrade.

---

## 1. Routing & Backward Compatibility Redirects

- [ ] **Projects List Redirect**:
  - **Action**: Manually navigate to `/projects`.
  - **Expected Result**: Browser instantly redirects to `/workspaces` with HTTP 307/308, and the page renders the Workspaces listing.
- [ ] **Project Detail Redirect**:
  - **Action**: Manually navigate to `/projects/p1` (or another valid project ID).
  - **Expected Result**: Browser instantly redirects to `/workspaces/p1`, loading the Workspace Cockpit for that workspace.
- [ ] **URL Search Params Persistence**:
  - **Action**: Navigate to `/projects?filter=active`.
  - **Expected Result**: Redirects to `/workspaces?filter=active`, preserving the search query.

---

## 2. Workspaces & Readiness Score Engine

- [ ] **Default Checklist Instantiation**:
  - **Action**: Create a new workspace of type `product`, then create one of type `client`.
  - **Expected Result**: 
    - The `product` workspace contains checklists for `validation`, `spec`, `build`, `launch`, `growth`.
    - The `client` workspace contains checklists for `discovery`, `proposal`, `delivery`, `launch`, `support`.
- [ ] **Checklist Interactive Toggle**:
  - **Action**: Navigate to a workspace cockpit, click a checkbox inside the current active stage checklist.
  - **Expected Result**: Item state flips immediately in the UI, updates in Firestore, and the stage readiness score changes dynamically (e.g., checking 1 of 4 items updates score from 0% to 25%).
- [ ] **Stage Advancement**:
  - **Action**: Complete all checklist items in a stage and click "Advance Stage".
  - **Expected Result**: Workspace stage advances (e.g., from `validation` to `spec`), the checklist updates to show the new stage criteria, and readiness score resets to 0% (unless items in the new stage were already checked).

---

## 3. New Modules Verification

### Validation & Discovery
- [ ] **Validation Run**:
  - **Action**: Run the Validation Agent on a raw idea in the Workspace cockpit.
  - **Expected Result**: Output includes a structured Target Profile, Pain Points, and a numeric Market Validation score.
- [ ] **Save Action**:
  - **Expected Result**: Save action button creates a proposal draft or saves validation findings directly to the Workspace notes.

### Launch & Delivery
- [ ] **Milestone & Release Tracker**:
  - **Expected Result**: Displays past milestone releases.
- [ ] **Delivery Agent Execution**:
  - **Action**: Trigger the Delivery Agent to create a progress update.
  - **Expected Result**: Output contains a draft of a client update email and milestone progress report.

### Telemetry Signals
- [ ] **Global Signals Page**:
  - **Action**: Navigate to `/signals`.
  - **Expected Result**: Displays performance logs, error alerts, and feedback.
- [ ] **Signal Analyst Agent**:
  - **Action**: Run the triage action on unresolved signals.
  - **Expected Result**: Signal status changes to `triaged` and remediation actions are suggested.

### Opportunities
- [ ] **Kanban Matrix**:
  - **Action**: Navigate to `/opportunities`.
  - **Expected Result**: Opportunity list categorizes cards by Status, indicating Impact vs. Effort.
- [ ] **Improvement Agent**:
  - **Expected Result**: Agent generates monetization hypotheses and technical optimization tasks.

---

## 4. Multi-Tenant Tenancy Schema Prep

- [ ] **Organization ID binding**:
  - **Action**: Create a workspace or task with an optional `organizationId` parameter.
  - **Expected Result**: Saved Firestore record contains the `organizationId` field.
- [ ] **Rule Restriction**:
  - **Action**: Attempt to write/read a record where `userId` does not match the authenticated session.
  - **Expected Result**: Firebase Security Rules reject request with Permission Denied.
