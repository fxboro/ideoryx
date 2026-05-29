// ─────────────────────────────────────────────────────────────
// API Payload & UI View Model Types — Mission Control AI
// Helper types for creating, updating, and presenting entities.
// These keep the domain model clean while giving components
// and API routes purpose-built contracts.
// ─────────────────────────────────────────────────────────────

import type {
  BaseEntity,
  User,
  Goal,
  Project,
  Workspace,
  Task,
  Decision,
  Playbook,
  Lead,
  Proposal,
  AgentRun,
  Memory,
  LearningItem,
  WeakSpot,
  StudySprint,
  ServiceTemplate,
} from "./domain";

// ── Generic Helpers ──────────────────────────────────────────

/** Strip server-managed fields for create payloads. */
export type CreatePayload<T extends BaseEntity> = Omit<T, "id" | "userId" | "createdAt" | "updatedAt">;

/** Partial update — only the fields being changed, plus the id. */
export type UpdatePayload<T extends BaseEntity> = Partial<Omit<T, "id" | "userId" | "createdAt" | "updatedAt">> & { id: string };

/** Firestore doc with server timestamp strings (for API responses). */
export type WithTimestamps<T> = Omit<T, "createdAt" | "updatedAt"> & {
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
};

// ── User ─────────────────────────────────────────────────────

export type CreateUserPayload = Omit<User, "uid" | "createdAt">;
export type UpdateUserPayload = Partial<Omit<User, "uid" | "createdAt">> & { uid: string };

/** User profile as returned to the UI. */
export interface UserViewModel extends User {
  displayMode: string; // formatted label for primaryMode
}

// ── Project ──────────────────────────────────────────────────

export type CreateProjectPayload = CreatePayload<Project>;
export type UpdateProjectPayload = UpdatePayload<Project>;

/** Project card as rendered in lists / grids. */
export interface ProjectListItem extends Project {
  taskCount?: number;
  completedTaskCount?: number;
}

// ── Workspace ────────────────────────────────────────────────

export type CreateWorkspacePayload = CreatePayload<Workspace>;
export type UpdateWorkspacePayload = UpdatePayload<Workspace>;

/** Workspace card as rendered in lists / grids. */
export interface WorkspaceListItem extends Workspace {
  taskCount?: number;
  completedTaskCount?: number;
}

// ── Task ─────────────────────────────────────────────────────

export type CreateTaskPayload = CreatePayload<Task>;
export type UpdateTaskPayload = UpdatePayload<Task>;

/** Task row with computed display fields. */
export interface TaskListItem extends Task {
  projectName?: string;
  isOverdue?: boolean;
}

// ── Goal ─────────────────────────────────────────────────────

export type CreateGoalPayload = CreatePayload<Goal>;
export type UpdateGoalPayload = UpdatePayload<Goal>;

// ── Decision ─────────────────────────────────────────────────

export type CreateDecisionPayload = CreatePayload<Decision>;
export type UpdateDecisionPayload = UpdatePayload<Decision>;

/** Decision row with resolved project name. */
export interface DecisionListItem extends Decision {
  projectName?: string;
  isReviewDue?: boolean;
}

// ── Playbook ─────────────────────────────────────────────────

export type CreatePlaybookPayload = CreatePayload<Playbook>;
export type UpdatePlaybookPayload = UpdatePayload<Playbook>;

// ── Lead ─────────────────────────────────────────────────────

export type CreateLeadPayload = CreatePayload<Lead>;
export type UpdateLeadPayload = UpdatePayload<Lead>;

/** Lead row with proposal status indicator. */
export interface LeadListItem extends Lead {
  proposalId?: string;
  proposalStatus?: string;
}

// ── Proposal ─────────────────────────────────────────────────

export type CreateProposalPayload = CreatePayload<Proposal>;
export type UpdateProposalPayload = UpdatePayload<Proposal>;

/** Proposal with resolved lead name. */
export interface ProposalListItem extends Proposal {
  leadName?: string;
}

// ── Agent ────────────────────────────────────────────────────

export type CreateAgentRunPayload = CreatePayload<AgentRun>;

/** Agent run card with formatted role label. */
export interface AgentRunListItem extends AgentRun {
  roleLabel: string;
  workflowLabel?: string;
  projectName?: string;
}

// ── Memory ───────────────────────────────────────────────────

export type CreateMemoryPayload = CreatePayload<Memory>;
export type UpdateMemoryPayload = UpdatePayload<Memory>;

// ── Learning ─────────────────────────────────────────────────

export type CreateLearningItemPayload = CreatePayload<LearningItem>;
export type UpdateLearningItemPayload = UpdatePayload<LearningItem>;

export type CreateWeakSpotPayload = CreatePayload<WeakSpot>;
export type CreateStudySprintPayload = CreatePayload<StudySprint>;

// ── Service Template ─────────────────────────────────────────

export type CreateServiceTemplatePayload = CreatePayload<ServiceTemplate>;
export type UpdateServiceTemplatePayload = UpdatePayload<ServiceTemplate>;

// ── Pagination / Lists ───────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ListFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}
