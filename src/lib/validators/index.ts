import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// ENUMS & PRIMITIVES
// ─────────────────────────────────────────────────────────────

export const projectPhaseSchema = z.enum(["spec", "build", "launch", "maintenance", "completed"]);
export const projectTypeSchema = z.enum(["product", "freelance", "learning"]);
export const projectStatusSchema = z.enum(["active", "on_hold", "completed", "archived"]);

export const workspaceTypeSchema = z.enum(["product", "client"]);
export const productLifecycleStageSchema = z.enum(["validation", "spec", "build", "launch", "growth"]);
export const clientLifecycleStageSchema = z.enum(["discovery", "proposal", "delivery", "launch", "support"]);
export const workspaceStatusSchema = z.enum(["active", "on_hold", "completed", "archived"]);
export const workspaceRiskLevelSchema = z.enum(["low", "medium", "high"]);

export const signalCategorySchema = z.enum(["performance", "error", "feedback", "usage"]);
export const signalSeveritySchema = z.enum(["low", "medium", "high"]);
export const signalStatusSchema = z.enum(["new", "reviewed", "converted", "dismissed"]);

export const riskLevelSchema = z.enum(["low", "medium", "high"]);
export const severitySchema = z.enum(["low", "medium", "high"]);

export const taskTypeSchema = z.enum(["feature", "bug", "chore", "research"]);
export const taskStatusSchema = z.enum(["todo", "in_progress", "blocked", "done"]);
export const prioritySchema = z.enum(["low", "medium", "high", "urgent"]);

export const goalTypeSchema = z.enum(["weekly", "monthly", "quarterly", "annual"]);
export const goalStatusSchema = z.enum(["active", "on_hold", "completed", "archived"]);

export const agentRoleSchema = z.enum([
  "execution",
  "architect",
  "builder",
  "reviewer",
  "founder",
  "freelance",
  "learning",
]);

export const workflowTypeSchema = z.enum([
  "scope_mvp",
  "design_architecture",
  "sprint_plan",
  "code_review",
  "proposal_draft",
  "discovery_prep",
  "study_plan",
  "decision_analysis",
  "retrospective",
  "custom",
  "validate_idea",
  "launch_prep",
  "delivery_update",
  "optimize_product",
  "analyze_signals",
]);

export const agentRunStatusSchema = z.enum(["pending", "running", "completed", "failed"]);
export const agentVerbositySchema = z.enum(["concise", "detailed"]);

export const leadStatusSchema = z.enum(["new", "qualified", "proposal_sent", "won", "lost"]);
export const leadSourceSchema = z.enum(["linkedin", "referral", "cold_outreach", "upwork", "website_form", "other"]);
export const proposalStatusSchema = z.enum(["draft", "sent", "accepted", "rejected"]);
export const budgetSignalSchema = z.enum(["low", "medium", "high"]);

export const skillLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);
export const learningStatusSchema = z.enum(["not_started", "in_progress", "completed", "review"]);
export const sprintStatusSchema = z.enum(["active", "completed", "paused"]);

export const memoryTypeSchema = z.enum(["preference", "fact", "learning", "rule"]);

export const userModeSchema = z.enum(["builder", "founder", "freelance", "hybrid"]);

export const integrationTypeSchema = z.enum([
  "version_control",
  "backend",
  "deployment",
  "project_management",
  "documentation",
  "communication",
  "analytics",
  "other",
]);

// ─────────────────────────────────────────────────────────────
// BASE SCHEMAS
// ─────────────────────────────────────────────────────────────

export const baseEntitySchema = z.object({
  id: z.string(),
  userId: z.string(),
  createdAt: z.number(), // epoch ms
  updatedAt: z.number(), // epoch ms
  sourceRunId: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────
// DOMAIN ENTITIES
// ─────────────────────────────────────────────────────────────

export const userSchema = z.object({
  uid: z.string(),
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
  avatarUrl: z.string().url("Invalid URL").optional(),
  createdAt: z.number(),
  missionStatement: z.string().optional(),
  preferredStack: z.array(z.string()).optional(),
  weeklyCapacity: z.number().min(0, "Capacity cannot be negative").max(168, "Max 168 hours in a week").optional(),
  businessFocus: z.array(z.string()).optional(),
  growthFocus: z.array(z.string()).optional(),
  primaryMode: userModeSchema.optional(),
});
export type UserSchemaType = z.infer<typeof userSchema>;

export const goalSchema = baseEntitySchema.extend({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: goalTypeSchema.optional(),
  timeframe: z.string().min(1, "Timeframe is required"),
  status: goalStatusSchema,
  progress: z.number().min(0).max(100).optional(),
  linkedProjectIds: z.array(z.string()).optional(),
  linkedWorkspaceIds: z.array(z.string()).optional(),
  workspaceId: z.string().optional(),
});
export type GoalSchemaType = z.infer<typeof goalSchema>;

export const projectSchema = baseEntitySchema.extend({
  name: z.string().min(1, "Name is required"),
  type: projectTypeSchema,
  status: projectStatusSchema,
  summary: z.string().min(1, "Summary is required"),
  targetUser: z.string().optional(),
  problem: z.string().optional(),
  phase: projectPhaseSchema,
  stack: z.array(z.string()).optional(),
  currentFocus: z.string().optional(),
  nextMilestone: z.string().optional(),
  risk: riskLevelSchema,
  goalId: z.string().optional(),
});
export type ProjectSchemaType = z.infer<typeof projectSchema>;

export const workspaceChecklistItemSchema = z.object({
  id: z.string(),
  stage: z.string(),
  label: z.string(),
  completed: z.boolean(),
  completedAt: z.number().optional(),
});

export const stageChecklistSchema = z.object({
  stage: z.string(),
  items: z.array(workspaceChecklistItemSchema),
});
export type StageChecklistSchemaType = z.infer<typeof stageChecklistSchema>;

export const workspaceSchema = baseEntitySchema.extend({
  name: z.string().min(1, "Name is required"),
  workspaceType: workspaceTypeSchema,
  status: workspaceStatusSchema,
  summary: z.string().min(1, "Summary is required"),
  stage: z.union([productLifecycleStageSchema, clientLifecycleStageSchema]),
  readinessScore: z.number().min(0).max(100),
  checklists: z.record(z.string(), z.array(workspaceChecklistItemSchema)),
  stack: z.array(z.string()).optional(),
  currentFocus: z.string().optional(),
  nextMilestone: z.string().optional(),
  risk: workspaceRiskLevelSchema,
  goalId: z.string().optional(),
  // SaaS tenancy
  organizationId: z.string().optional(),
  // Backward compatibility fields for Project alias:
  type: projectTypeSchema.optional(),
  phase: projectPhaseSchema.optional(),
  targetUser: z.string().optional(),
  problem: z.string().optional(),
});
export type WorkspaceSchemaType = z.infer<typeof workspaceSchema>;

export const signalSchema = baseEntitySchema.extend({
  workspaceId: z.string().min(1, "Workspace ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: signalCategorySchema,
  severity: signalSeveritySchema,
  status: signalStatusSchema,
  source: z.string().min(1, "Source is required"),
  sourceMetadata: z.record(z.string(), z.unknown()).optional(),
});
export type SignalSchemaType = z.infer<typeof signalSchema>;

export const taskSchema = baseEntitySchema.extend({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  projectId: z.string().optional(),
  workspaceId: z.string().optional(),
  type: taskTypeSchema,
  workflowId: z.string().optional(),
  priority: prioritySchema,
  dueDate: z.number().optional(),
  status: taskStatusSchema,
  assignee: z.string().optional(),
  tags: z.array(z.string()).optional(),
  estimateHours: z.number().min(0).optional(),
});
export type TaskSchemaType = z.infer<typeof taskSchema>;

export const decisionSchema = baseEntitySchema.extend({
  title: z.string().min(1, "Title is required"),
  projectId: z.string().optional(),
  workspaceId: z.string().optional(),
  context: z.string().min(1, "Context is required"),
  optionsConsidered: z.array(z.string()).min(1, "At least one option required"),
  chosenOption: z.string().min(1, "Chosen option is required"),
  rationale: z.string().min(1, "Rationale is required"),
  tradeoffs: z.string().optional(),
  risks: z.string().optional(),
  reviewDate: z.number().optional(),
  tags: z.array(z.string()).optional(),
});
export type DecisionSchemaType = z.infer<typeof decisionSchema>;

export const playbookSchema = baseEntitySchema.extend({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  summary: z.string().min(1, "Summary is required"),
  tags: z.array(z.string()),
  steps: z.array(z.string()),
  checklist: z.array(z.string()),
  promptTemplate: z.string().min(1, "Prompt template is required"),
  lastUsed: z.number().optional(),
  runCount: z.number().optional(),
  workspaceId: z.string().optional(),
});
export type PlaybookSchemaType = z.infer<typeof playbookSchema>;

export const learningItemSchema = baseEntitySchema.extend({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  skillLevel: skillLevelSchema,
  status: learningStatusSchema,
  progress: z.number().min(0).max(100),
  notes: z.string().optional(),
  tags: z.array(z.string()),
  resourceUrl: z.union([z.string().url("Must be a valid URL"), z.literal("")]).optional(),
});
export type LearningItemSchemaType = z.infer<typeof learningItemSchema>;

export const leadSchema = baseEntitySchema.extend({
  businessName: z.string().min(1, "Business name is required"),
  contactName: z.string().optional(),
  contactEmail: z.union([z.string().email("Invalid email"), z.literal("")]).optional(),
  niche: z.string().optional(),
  source: z.string().optional(),
  painPoint: z.string().optional(),
  urgency: severitySchema.optional(),
  budgetSignal: budgetSignalSchema.optional(),
  status: leadStatusSchema,
  notes: z.string().optional(),
  nextFollowUp: z.number().optional(),
});
export type LeadSchemaType = z.infer<typeof leadSchema>;

export const proposalLineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0).optional(),
});

export const proposalSchema = baseEntitySchema.extend({
  leadId: z.string().min(1, "Lead ID is required"),
  projectId: z.string().optional(),
  workspaceId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  status: proposalStatusSchema,
  problemSummary: z.string().min(1, "Problem summary is required"),
  scope: z.string().min(1, "Scope is required"),
  deliverables: z.array(z.string()),
  timeline: z.string().min(1, "Timeline is required"),
  pricing: z.string().min(1, "Pricing is required"),
  lineItems: z.array(proposalLineItemSchema).optional(),
  assumptions: z.string().optional(),
  risks: z.string().optional(),
  validUntil: z.number().optional(),
});
export type ProposalSchemaType = z.infer<typeof proposalSchema>;

export const agentRunSchema = baseEntitySchema.extend({
  agentRole: agentRoleSchema,
  workflowId: z.string().optional(),
  workflowType: workflowTypeSchema.optional(),
  projectId: z.string().optional(),
  workspaceId: z.string().optional(),
  leadId: z.string().optional(),
  inputGoal: z.string().min(1, "Input goal is required"),
  contextTags: z.array(z.string()),
  output: z.record(z.string(), z.unknown()),
  nextBestAction: z.string().optional(),
  status: agentRunStatusSchema,
  durationMs: z.number().min(0).optional(),
});
export type AgentRunSchemaType = z.infer<typeof agentRunSchema>;

export const memorySchema = baseEntitySchema.extend({
  type: memoryTypeSchema,
  content: z.string().min(1, "Content is required"),
  confidence: z.number().min(0).max(100),
  tags: z.array(z.string()),
  source: z.string().optional(),
  expiresAt: z.number().optional(),
  workspaceId: z.string().optional(),
});
export type MemorySchemaType = z.infer<typeof memorySchema>;

// ─────────────────────────────────────────────────────────────
// API REQUEST VALIDATION SCHEMAS
// ─────────────────────────────────────────────────────────────

/**
 * runAgentWorkflow request
 */
export const runAgentWorkflowRequestSchema = z.object({
  agentRole: agentRoleSchema,
  workflowType: workflowTypeSchema.optional(),
  inputGoal: z.string().min(1, "Input goal is required"),
  projectId: z.string().optional(),
  workspaceId: z.string().optional(),
  leadId: z.string().optional(),
  contextTags: z.array(z.string()).optional(),
  context: z.string().optional(), // additional user-provided context
});
export type RunAgentWorkflowRequest = z.infer<typeof runAgentWorkflowRequestSchema>;

/**
 * weeklyReview request
 */
export const weeklyReviewRequestSchema = z.object({
  weekStr: z.string().min(1, "Week identifier (e.g. 2026-W14) is required"),
  notes: z.string().optional(),
  goalsCreated: z.array(z.string()).optional(), // goal IDs
  tasksRolledOver: z.array(z.string()).optional(), // task IDs
  learningsGenerated: z.array(z.string()).optional(), // learning IDs
});
export type WeeklyReviewRequest = z.infer<typeof weeklyReviewRequestSchema>;

/**
 * createProposalDraft request
 */
export const createProposalDraftRequestSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  contextNotes: z.string().optional(),
  budgetSignal: budgetSignalSchema.optional(),
  timelineExpectation: z.string().optional(),
  includeServices: z.array(z.string()).optional(), // specific service templates to include
});
export type CreateProposalDraftRequest = z.infer<typeof createProposalDraftRequestSchema>;

/**
 * saveDecision request
 * For creating or updating a decision entity. Usually omitted system fields.
 */
export const saveDecisionRequestSchema = decisionSchema.omit({
  createdAt: true,
  updatedAt: true,
  userId: true, // assumes populated by auth context
}).extend({
  id: z.string().optional(), // optional id means create if missing, update if present
});
export type SaveDecisionRequest = z.infer<typeof saveDecisionRequestSchema>;

export const createProjectRequestSchema = projectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true, 
  status: true, // we might default to active
  phase: true,  // default to spec
}).extend({
  status: projectStatusSchema.optional().default("active"),
  phase: projectPhaseSchema.optional().default("spec"),
});
export type CreateProjectRequest = z.infer<typeof createProjectRequestSchema>;

/**
 * createWorkspace request
 */
export const createWorkspaceRequestSchema = workspaceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  status: true,
  readinessScore: true,
  checklists: true,
}).extend({
  status: workspaceStatusSchema.optional().default("active"),
  readinessScore: z.number().optional().default(0),
  checklists: z.record(z.string(), z.array(workspaceChecklistItemSchema)).optional(),
});
export type CreateWorkspaceRequest = z.infer<typeof createWorkspaceRequestSchema>;

/**
 * toggleChecklist request
 */
export const toggleChecklistRequestSchema = z.object({
  itemId: z.string(),
  completed: z.boolean(),
});
export type ToggleChecklistRequest = z.infer<typeof toggleChecklistRequestSchema>;

/**
 * createSignal request
 */
export const createSignalRequestSchema = signalSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  status: true,
}).extend({
  status: signalStatusSchema.optional().default("new"),
});
export type CreateSignalRequest = z.infer<typeof createSignalRequestSchema>;

/**
 * createTask request
 */
export const createTaskRequestSchema = taskSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  status: true,
}).extend({
  status: taskStatusSchema.optional().default("todo"),
});
export type CreateTaskRequest = z.infer<typeof createTaskRequestSchema>;

// ─────────────────────────────────────────────────────────────
// HELPER VALIDATORS
// ─────────────────────────────────────────────────────────────

export const validateRequest = <T>(schema: z.ZodType<T>, data: unknown) => {
  return schema.safeParse(data);
};
