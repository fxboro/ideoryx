// ─────────────────────────────────────────────────────────────
// Agent Orchestration Types — Mission Control AI
// ─────────────────────────────────────────────────────────────

import type { z } from "zod";
import type { AgentRole, WorkflowType } from "@/types";
import type { ProjectSchemaType, GoalSchemaType, TaskSchemaType, LeadSchemaType, MemorySchemaType, DecisionSchemaType, AgentRunSchemaType, LearningItemSchemaType, WorkspaceSchemaType, SignalSchemaType } from "@/lib/validators";

// ── Workflow Definitions ─────────────────────────────────────

/**
 * The five V1 named workflows.
 * Each maps to a specific agent role and output shape.
 */
export type V1WorkflowId =
  | "idea_to_mvp"
  | "mvp_to_technical_plan"
  | "feature_to_build_plan"
  | "lead_to_proposal"
  | "weekly_review";

/**
 * The five new V1.1 workflow IDs.
 */
export type V1_1WorkflowId =
  | "validate_idea"
  | "launch_prep"
  | "delivery_update"
  | "optimize_product"
  | "analyze_signals";

/**
 * Combined union of all workflow IDs.
 */
export type AllWorkflowId = V1WorkflowId | V1_1WorkflowId;

/**
 * Maps each named workflow to the agent role that owns it
 * and the existing WorkflowType enum value for persistence.
 */
export interface WorkflowDefinition {
  id: AllWorkflowId;
  agentRole: AgentRole;
  workflowType: WorkflowType;
  label: string;
  description: string;
}

// ── Context ──────────────────────────────────────────────────

/** Everything the prompt builder receives to assemble the final prompt. */
export interface AgentContext {
  /** The user's stated goal / input for this run. */
  inputGoal: string;

  /** Relevant memories loaded from the user's memory store. */
  memories: MemorySchemaType[];

  /** The project being worked on (if any). */
  project: ProjectSchemaType | null;

  /** The workspace being worked on (for V1.1 workflows). */
  workspace: WorkspaceSchemaType | null;

  /** Telemetry signals relevant to this run. */
  signals?: SignalSchemaType[];

  /** Active goals relevant to the workflow. */
  goals: GoalSchemaType[];

  /** Tasks related to the project (if any). */
  tasks: TaskSchemaType[];

  /** Lead context for freelance workflows. */
  lead: LeadSchemaType | null;

  /** Recent decisions context (optional). */
  decisions?: DecisionSchemaType[];

  /** Recent agent runs (optional). */
  agentRuns?: AgentRunSchemaType[];

  /** Active or completed learning items (optional). */
  learningItems?: LearningItemSchemaType[];

  /** Additional user-supplied freeform context. */
  additionalContext?: string;

  /** Tags the user attached to the run request. */
  contextTags: string[];
}

// ── Model Adapter ────────────────────────────────────────────

/**
 * Vendor-agnostic interface for calling a language model.
 * Implement this for OpenAI, Anthropic, Gemini, local models, etc.
 */
export interface ModelAdapter {
  /**
   * Send a prompt and receive a structured JSON string back.
   * The orchestrator will parse and validate the response.
   */
  generate(params: ModelRequest): Promise<ModelResponse>;
}

export interface ModelRequest {
  systemPrompt: string;
  userPrompt: string;
  /** Optional JSON schema hint for structured output. */
  responseSchema?: z.ZodSchema;
  /** Model-level parameters. */
  temperature?: number;
  maxTokens?: number;
}

export interface ModelResponse {
  /** Raw text response from the model. */
  raw: string;
  /** Parsed JSON if the model returned valid JSON, otherwise null. */
  parsed: Record<string, unknown> | null;
  /** Token usage stats if available. */
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

// ── Structured Outputs per Workflow ─────────────────────────

/** idea_to_mvp: takes an idea and scopes an MVP. */
export interface IdeaToMvpOutput {
  projectName: string;
  problemStatement: string;
  targetUser: string;
  coreFeatures: string[];
  mvpScope: string;
  outOfScope: string[];
  suggestedStack: string[];
  estimatedTimeline: string;
  risks: string[];
  nextSteps: string[];
}

/** mvp_to_technical_plan: takes an MVP spec and produces architecture. */
export interface MvpToTechnicalPlanOutput {
  architectureOverview: string;
  components: Array<{ name: string; responsibility: string; techChoice: string }>;
  dataModel: Array<{ entity: string; fields: string[]; relationships: string }>;
  apiEndpoints: Array<{ method: string; path: string; description: string }>;
  deploymentStrategy: string;
  techDecisions: Array<{ decision: string; rationale: string; alternatives: string[] }>;
  implementationOrder: string[];
  risks: string[];
}

/** feature_to_build_plan: breaks a feature into actionable tasks. */
export interface FeatureToBuildPlanOutput {
  featureSummary: string;
  tasks: Array<{
    title: string;
    description: string;
    type: string;
    priority: string;
    estimateHours: number;
    dependencies: string[];
  }>;
  acceptanceCriteria: string[];
  techNotes: string;
  riskFlags: string[];
}

/** lead_to_proposal: generates a proposal from lead context. */
export interface LeadToProposalOutput {
  proposalTitle: string;
  problemSummary: string;
  proposedSolution: string;
  scope: string;
  deliverables: string[];
  timeline: string;
  pricing: string;
  assumptions: string;
  risks: string;
}

/** weekly_review: summarises the week and plans the next. */
export interface WeeklyReviewOutput {
  weekSummary: string;
  completedItems: string[];
  inProgressItems: string[];
  blockers: string[];
  learnings: string[];
  nextWeekPriorities: string[];
  suggestedGoals: string[];
  overallMomentum: "strong" | "steady" | "slow" | "stalled";
  learningTarget: string;
}

/** validate_idea: takes idea and maps personas / channels */
export interface ValidateIdeaOutput {
  validationSummary: string;
  channels: string[];
}

/** launch_prep: generates release & monitoring checklist */
export interface LaunchPrepOutput {
  launchChecklist: string[];
}

/** delivery_update: compiles status summaries and changelogs */
export interface DeliveryUpdateOutput {
  sprintStatusSummary: string;
}

/** optimize_product: logs UX/monetization opportunities */
export interface OptimizeProductOutput {
  optimizationCandidates: string[];
}

/** analyze_signals: triages logs & feedback */
export interface AnalyzeSignalsOutput {
  triageReport: string;
}

/** Union of all structured outputs. */
export type WorkflowOutput =
  | IdeaToMvpOutput
  | MvpToTechnicalPlanOutput
  | FeatureToBuildPlanOutput
  | LeadToProposalOutput
  | WeeklyReviewOutput
  | ValidateIdeaOutput
  | LaunchPrepOutput
  | DeliveryUpdateOutput
  | OptimizeProductOutput
  | AnalyzeSignalsOutput;

// ── Orchestrator Result ──────────────────────────────────────

/** What the full pipeline produces — ready for persistence + UI. */
export interface AgentWorkflowResult {
  /** Whether the run completed successfully. */
  success: boolean;

  /** The persisted agent run ID. */
  agentRunId: string;

  /** Validated structured output. */
  output: WorkflowOutput;

  /** Suggested next action string. */
  nextBestAction: string;

  /** Pre-built save actions the frontend can present to the user. */
  saveActions: SaveAction[];

  /** Duration of the full pipeline in ms. */
  durationMs: number;

  /** Any error message if success is false. */
  error?: string;
}

// ── Save Actions ─────────────────────────────────────────────

/**
 * A concrete action the user can take after a workflow run.
 * The frontend renders these as buttons; the backend knows
 * exactly what to persist when the user clicks "Save".
 */
export interface SaveAction {
  /** Unique key for this action. */
  key: string;

  /** Human-readable label, e.g. "Create Project". */
  label: string;

  /** Which Firestore collection this would write to. */
  collection: string;

  /** The payload to persist (pre-filled from the agent output). */
  payload: Record<string, unknown>;
}
