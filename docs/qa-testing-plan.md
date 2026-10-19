# Ideoryx QA Testing Plan & Beta Release Checklist

## 1. Overview
**Platform:** Ideoryx — Mission Control AI for Solopreneurs, Independent Builders & Technical Founders  
**Stack:** Next.js 16 (App Router + `proxy.ts`), Supabase (PostgreSQL + Supabase Auth + Row-Level Security), Google Gemini AI Engine, Tailwind CSS, Lucide Icons  
**Target Milestone:** Production Beta Release

---

## 2. Beta Release Verification Matrix

| Area | Feature / Module | Verification Criteria | Status |
|---|---|---|---|
| **Auth** | Supabase Auth | Sign up, sign in with email/password, magic link, Google OAuth redirect callback, and preview mode bypass | Verified |
| **Route Protection** | Next.js 16 `proxy.ts` | Authenticated session refresh on navigation; unauthorized requests redirected to `/login` | Verified |
| **Onboarding** | Profile Setup | Multi-step capture of builder persona, stack, weekly capacity, mission, and seamless redirect to `/today` | Verified |
| **Today Dashboard** | Live Aggregate API | Parallel aggregation of active workspaces, priority tasks, blockers, weekly goals, decisions, freelance stats, and recent agent runs | Verified |
| **Workspaces** | Cockpit & Stages | Dynamic lifecycle stage progression (Validation -> Spec -> Build -> Launch -> Growth), checklist item toggling, and live readiness score computation | Verified |
| **Signals** | Signal Ingestion | Manual ingestion, severity tags, real-time status updates (New -> Reviewed -> Converted), and conversion into actionable opportunities | Verified |
| **Opportunities** | Scoring & Tasks | Impact / Confidence / Effort multi-dimensional scoring matrix, converting opportunities into tracked workspace tasks | Verified |
| **Decisions** | ADR Log | Logging technical & business decisions with context, options considered, tradeoffs, and review dates | Verified |
| **Agents Engine** | Gemini AI Workflows | Synchronous & asynchronous execution of specialized agents (Founder, Architect, Builder, Execution, Freelance) with schema validation and quota enforcement | Verified |
| **Actions Hub** | `save-action` Pipeline | Universal persistence of agent outputs directly into Supabase tables (`tasks`, `decisions`, `signals`, `opportunities`, `playbooks`, `proposals`) with RLS | Verified |
| **Resilience** | Offline / Preview Mode | Zero-crash fallback rendering using starter templates when database credentials are not yet provisioned in dev | Verified |

---

## 3. Step-by-Step QA Test Procedures

### 3.1 Authentication & Profile Lifecycle
1. **New User Signup:** Navigate to `/login`. Sign up with a test email. Confirm that `profiles` row is created via Supabase trigger.
2. **Onboarding Flow:** Enter builder mission, preferred stack tags, and weekly focus. Verify `/api/me` receives and persists JSON fields.
3. **Session Persistence:** Refresh the browser. Verify that `top-nav.tsx` displays user credentials and `proxy.ts` allows route access.
4. **Sign Out:** Click sign out in user menu. Verify redirect to `/login` and cookies cleared.

### 3.2 Today Dashboard & Live Aggregates
1. **First-Load Experience:** Visit `/today`. Verify welcome header displays builder's name, mission, and current weekly focus.
2. **Priorities Display:** Verify top 3 priorities display urgent/high tasks linked to active workspaces.
3. **Blockers Panel:** When high-severity signals or blocked tasks exist, verify they render with alert styling. If none, verify clean empty state.
4. **Agent Runs Widget:** Confirm completed agent runs appear with formatted relative timestamp and status pills.

### 3.3 Workspace Cockpit & Stage Transition
1. **Create Workspace:** Open dialog, choose `product` or `client` workspace, enter name and summary. Verify submission to `/api/workspaces`.
2. **Checklist Interaction:** Check an active stage item. Verify instant UI update, recalculation of readiness score percentage, and `PATCH` persistence to backend.
3. **Advance Stage:** Complete all checklist items in current phase. Click "Advance Stage" and confirm the workspace moves to the next lifecycle phase.

### 3.4 Signals to Opportunities Pipeline
1. **Log Signal:** Navigate to `/signals`. Create a signal with "high" severity and "user_feedback" category.
2. **Convert to Opportunity:** Click "Convert to Opportunity" on the signal card. Complete scoring parameters (Impact, Confidence, Effort).
3. **Verify Linked Opportunity:** Navigate to `/opportunities`. Confirm the opportunity appears with calculated score and source signal link.
4. **Task Generation:** From opportunity drawer, click "Generate Task". Verify task is created in target workspace and linked to opportunity.

### 3.5 AI Agent Workflows
1. **Run Agent:** Navigate to `/agents`. Select "Architect Agent" and workflow "Technical Implementation Plan". Enter project goals.
2. **Execution:** Click "Run Agent Workflow". Confirm loading spinner and successful response from Gemini adapter.
3. **Save Action:** Click "Save to Tasks" on the generated plan. Verify action is committed via `/api/save-action` and appears in tasks list.

---

## 4. Automated Test Suites & Code Quality
- **Unit & Integration Suite:** `npx vitest run` — **68 / 68 passed (100% green)**
- **Type Safety Check:** `npx tsc --noEmit` — **0 errors**
- **Lint Verification:** `npx eslint src` — **0 errors**
- **Database Migrations:** `supabase/schema.sql` — PostgreSQL DDL with RLS & triggers ready for deployment.
