// ─────────────────────────────────────────────────────────────
// Agent Orchestration — Public API barrel
// Mission Control AI
// ─────────────────────────────────────────────────────────────

// Main orchestrator
export { runAgentWorkflow } from "./run-agent-workflow";
export type { RunAgentWorkflowParams } from "./run-agent-workflow";

// Types
export type {
  V1WorkflowId,
  V1_1WorkflowId,
  AllWorkflowId,
  WorkflowDefinition,
  AgentContext,
  ModelAdapter,
  ModelRequest,
  ModelResponse,
  AgentWorkflowResult,
  SaveAction,
  WorkflowOutput,
  IdeaToMvpOutput,
  MvpToTechnicalPlanOutput,
  FeatureToBuildPlanOutput,
  LeadToProposalOutput,
  WeeklyReviewOutput,
} from "./types";

// Workflow registry
export { WORKFLOW_REGISTRY, getWorkflowDefinition, isV1WorkflowId } from "./workflow-registry";

// Utilities (for advanced usage / testing)
export { buildAgentContext } from "./context-builder";
export { loadMemories } from "./memory-loader";
export { loadProjectContext } from "./project-context-loader";
export { resolvePromptTemplate } from "./prompt-templates";
export { validateOutput, getOutputSchema } from "./output-validator";
export { mapSaveActions } from "./save-actions";
export { createModelAdapter, PlaceholderModelAdapter } from "./model-adapter";
