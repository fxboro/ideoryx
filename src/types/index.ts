// ─────────────────────────────────────────────────────────────
// Public Type API — Mission Control AI
//
// This barrel re-exports everything from the type modules.
// All existing `import type { ... } from "@/types"` continue
// to work without modification.
//
// Module Structure:
//   enums.ts    — String literal unions (status, role, phase…)
//   domain.ts   — Core entity interfaces (User, Project, Task…)
//   payloads.ts — API payloads, UI view models, helpers
// ─────────────────────────────────────────────────────────────

// Enums & union types
export type {
  ProjectPhase,
  ProjectType,
  ProjectStatus,
  RiskLevel,
  Severity,
  TaskType,
  TaskStatus,
  Priority,
  GoalType,
  GoalStatus,
  AgentRole,
  WorkflowType,
  AgentRunStatus,
  AgentVerbosity,
  LeadStatus,
  LeadSource,
  ProposalStatus,
  BudgetSignal,
  SkillLevel,
  LearningStatus,
  SprintStatus,
  MemoryType,
  UserMode,
  IntegrationType,
  WorkspaceType,
  ProductLifecycleStage,
  ClientLifecycleStage,
  WorkspaceStatus,
  WorkspaceRiskLevel,
  SignalCategory,
  SignalSeverity,
  SignalStatus,
  OpportunityStatus,
  OpportunityCategory,
} from "./enums";

// Domain entities
export type {
  BaseEntity,
  User,
  Goal,
  Project,
  Workspace,
  WorkspaceChecklistItem,
  StageChecklist,
  Signal,
  Task,
  Decision,
  Playbook,
  Lead,
  ProposalLineItem,
  Proposal,
  AgentRun,
  AgentPreference,
  Memory,
  LearningItem,
  WeakSpot,
  StudySprint,
  ServiceTemplate,
  Integration,
  Opportunity,
} from "./domain";

// API payloads & UI view models
export type {
  CreatePayload,
  UpdatePayload,
  WithTimestamps,
  CreateUserPayload,
  UpdateUserPayload,
  UserViewModel,
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectListItem,
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
  WorkspaceListItem,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskListItem,
  CreateGoalPayload,
  UpdateGoalPayload,
  CreateDecisionPayload,
  UpdateDecisionPayload,
  DecisionListItem,
  CreatePlaybookPayload,
  UpdatePlaybookPayload,
  CreateLeadPayload,
  UpdateLeadPayload,
  LeadListItem,
  CreateProposalPayload,
  UpdateProposalPayload,
  ProposalListItem,
  CreateAgentRunPayload,
  AgentRunListItem,
  CreateMemoryPayload,
  UpdateMemoryPayload,
  CreateLearningItemPayload,
  UpdateLearningItemPayload,
  CreateWeakSpotPayload,
  CreateStudySprintPayload,
  CreateServiceTemplatePayload,
  UpdateServiceTemplatePayload,
  PaginatedResponse,
  ListFilters,
} from "./payloads";
