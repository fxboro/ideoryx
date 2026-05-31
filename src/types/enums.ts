// ─────────────────────────────────────────────────────────────
// Enums & Union Types — Mission Control AI Domain Model
// Strict string literal unions for all domain statuses, roles, and categories.
// ─────────────────────────────────────────────────────────────

// ── Project ──────────────────────────────────────────────────
export type ProjectPhase = "spec" | "build" | "launch" | "maintenance" | "completed";
export type ProjectType = "product" | "freelance" | "learning";
export type ProjectStatus = "active" | "on_hold" | "completed" | "archived";

// ── Workspace ────────────────────────────────────────────────
export type WorkspaceType = "product" | "client";
export type ProductLifecycleStage = "validation" | "spec" | "build" | "launch" | "growth";
export type ClientLifecycleStage = "discovery" | "proposal" | "delivery" | "launch" | "support";
export type WorkspaceStatus = "active" | "on_hold" | "completed" | "archived";
export type WorkspaceRiskLevel = "low" | "medium" | "high";

// ── Telemetry Signal ─────────────────────────────────────────
export type SignalCategory = "performance" | "error" | "feedback" | "usage";
export type SignalSeverity = "low" | "medium" | "high";
export type SignalStatus = "new" | "reviewed" | "converted" | "dismissed";

// ── Opportunity ──────────────────────────────────────────────
export type OpportunityStatus = "open" | "in_progress" | "implemented" | "archived";
export type OpportunityCategory = "growth" | "performance" | "security" | "cost" | "quality" | "other";

// ── Risk / Severity ──────────────────────────────────────────
export type RiskLevel = "low" | "medium" | "high";
export type Severity = "low" | "medium" | "high";

// ── Task ─────────────────────────────────────────────────────
export type TaskType = "feature" | "bug" | "chore" | "research";
export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
export type Priority = "low" | "medium" | "high" | "urgent";

// ── Goal ─────────────────────────────────────────────────────
export type GoalType = "weekly" | "monthly" | "quarterly" | "annual";
export type GoalStatus = "active" | "on_hold" | "completed" | "archived";

// ── Agent ────────────────────────────────────────────────────
export type AgentRole =
  | "execution"
  | "architect"
  | "builder"
  | "reviewer"
  | "founder"
  | "freelance"
  | "learning";

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
  | "validate_idea"
  | "launch_prep"
  | "delivery_update"
  | "optimize_product"
  | "analyze_signals";

export type AgentRunStatus = "pending" | "running" | "completed" | "failed";

export type AgentVerbosity = "concise" | "detailed";

// ── Freelance / Sales ────────────────────────────────────────
export type LeadStatus = "new" | "qualified" | "proposal_sent" | "won" | "lost";
export type LeadSource = "linkedin" | "referral" | "cold_outreach" | "upwork" | "website_form" | "other";
export type ProposalStatus = "draft" | "sent" | "accepted" | "rejected";
export type BudgetSignal = "low" | "medium" | "high";

// ── Learning ─────────────────────────────────────────────────
export type SkillLevel = "beginner" | "intermediate" | "advanced";
export type LearningStatus = "not_started" | "in_progress" | "completed" | "review";
export type SprintStatus = "active" | "completed" | "paused";

// ── Memory ───────────────────────────────────────────────────
export type MemoryType = "preference" | "fact" | "learning" | "rule";

// ── User ─────────────────────────────────────────────────────
export type UserMode = "builder" | "founder" | "freelance" | "hybrid";

// ── Integration ──────────────────────────────────────────────
export type IntegrationType =
  | "version_control"
  | "backend"
  | "deployment"
  | "project_management"
  | "documentation"
  | "communication"
  | "analytics"
  | "other";
