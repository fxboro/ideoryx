// ─────────────────────────────────────────────────────────────
// Agent Workflow Orchestrator — Mission Control AI
//
// This is the main entry point for running an agent workflow.
// It ties together:
//   1. Input validation
//   2. Context building (memories, project, goals, lead)
//   3. Prompt template resolution
//   4. Model call (via adapter)
//   5. Output validation (via Zod)
//   6. Agent run persistence
//   7. Save actions preparation
// ─────────────────────────────────────────────────────────────

import { randomUUID } from "crypto";

import type { AgentWorkflowResult, AllWorkflowId, WorkflowOutput, ModelAdapter } from "./types";
import { runAgentWorkflowRequestSchema } from "@/lib/validators";
import { buildAgentContext } from "./context-builder";
import { resolvePromptTemplate } from "./prompt-templates";
import { validateOutput } from "./output-validator";
import { mapSaveActions } from "./save-actions";
import { getWorkflowDefinition, isV1WorkflowId } from "./workflow-registry";
import { agentRunService } from "@/lib/services/agent-run.service";
import { createModelAdapter } from "./model-adapter";

export interface RunAgentWorkflowParams {
  /** Authenticated user ID. */
  userId: string;

  /** Raw request body from the API / server action. */
  rawRequest: unknown;

  /** Optional: supply your own model adapter (useful for testing). */
  modelAdapter?: ModelAdapter;

  /** Optional: override the workflow ID (otherwise inferred from request). */
  workflowId?: AllWorkflowId;
}

/**
 * Orchestrates a full agent workflow execution.
 *
 * This is the single function that API routes and server actions call.
 * It handles the entire pipeline from input validation through to
 * persistence and save action preparation.
 */
export async function runAgentWorkflow(params: RunAgentWorkflowParams): Promise<AgentWorkflowResult> {
  const startTime = Date.now();
  const agentRunId = randomUUID();

  try {
    // ── Step 1: Validate Input ─────────────────────────────────
    const parseResult = runAgentWorkflowRequestSchema.safeParse(params.rawRequest);
    if (!parseResult.success) {
      return buildErrorResult(agentRunId, startTime, `Invalid request: ${parseResult.error.message}`);
    }
    const request = parseResult.data;

    // ── Step 2: Resolve Workflow ───────────────────────────────
    const workflowId = params.workflowId ?? inferWorkflowId(request.agentRole);
    if (!isV1WorkflowId(workflowId)) {
      return buildErrorResult(agentRunId, startTime, `Unknown workflow: ${workflowId}`);
    }
    const definition = getWorkflowDefinition(workflowId);

    // ── Step 3: Build Context ──────────────────────────────────
    const context = await buildAgentContext({
      userId: params.userId,
      request,
      workflowId,
    });

    // ── Step 4: Resolve Prompts ────────────────────────────────
    const { systemPrompt, userPrompt } = resolvePromptTemplate(workflowId, context);

    // ── Step 5: Call Model ─────────────────────────────────────
    const adapter = params.modelAdapter ?? createModelAdapter();
    const modelResponse = await adapter.generate({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 4096,
    });

    // ── Step 6: Validate Output ────────────────────────────────
    const validation = validateOutput(workflowId, modelResponse.raw);
    if (!validation.success || !validation.data) {
      // Persist failed run for debugging
      await persistAgentRun({
        agentRunId,
        userId: params.userId,
        definition,
        request,
        output: { raw: modelResponse.raw, error: validation.error },
        status: "failed",
        durationMs: Date.now() - startTime,
      });

      return buildErrorResult(agentRunId, startTime, validation.error ?? "Output validation failed");
    }

    const output = validation.data as unknown as WorkflowOutput;

    // ── Step 7: Prepare Save Actions ───────────────────────────
    const saveActions = mapSaveActions(
      workflowId,
      output,
      request.projectId || request.workspaceId,
      request.leadId,
      agentRunId
    );

    // ── Step 8: Determine Next Best Action ─────────────────────
    const nextBestAction = deriveNextBestAction(workflowId, output);

    // ── Step 9: Persist Agent Run ──────────────────────────────
    await persistAgentRun({
      agentRunId,
      userId: params.userId,
      definition,
      request,
      output: validation.data,
      status: "completed",
      durationMs: Date.now() - startTime,
      nextBestAction,
    });

    // ── Step 10: Return Result ─────────────────────────────────
    return {
      success: true,
      agentRunId,
      output,
      nextBestAction,
      saveActions,
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown orchestration error";
    console.error("[runAgentWorkflow] Unhandled error:", error);

    return buildErrorResult(agentRunId, startTime, message);
  }
}

// ── Internal Helpers ─────────────────────────────────────────

function buildErrorResult(agentRunId: string, startTime: number, error: string): AgentWorkflowResult {
  return {
    success: false,
    agentRunId,
    output: {} as WorkflowOutput,
    nextBestAction: "",
    saveActions: [],
    durationMs: Date.now() - startTime,
    error,
  };
}

/**
 * Infers a default workflow from the agent role.
 * Used when the caller doesn't explicitly specify a workflowId.
 */
function inferWorkflowId(agentRole: string): AllWorkflowId {
  const roleToWorkflow: Record<string, AllWorkflowId> = {
    founder: "idea_to_mvp",
    architect: "mvp_to_technical_plan",
    builder: "feature_to_build_plan",
    freelance: "lead_to_proposal",
    execution: "weekly_review",
    reviewer: "weekly_review",
    learning: "weekly_review",
    validation: "validate_idea",
    launch: "launch_prep",
    delivery: "delivery_update",
    improvement: "optimize_product",
    signal_analyst: "analyze_signals",
  };

  return roleToWorkflow[agentRole] ?? "weekly_review";
}

/**
 * Derives a human-readable next-best-action string
 * based on the workflow type and its output.
 */
function deriveNextBestAction(workflowId: AllWorkflowId, output: WorkflowOutput): string {
  switch (workflowId) {
    case "idea_to_mvp": {
      const o = output as { nextSteps?: string[] };
      return o.nextSteps?.[0] ?? "Review the MVP scope and create a project.";
    }
    case "mvp_to_technical_plan": {
      const o = output as { implementationOrder?: string[] };
      return o.implementationOrder?.[0] ?? "Begin implementing the first component.";
    }
    case "feature_to_build_plan": {
      const o = output as { tasks?: Array<{ title: string }> };
      return o.tasks?.[0]?.title ? `Start task: ${o.tasks[0].title}` : "Begin the first task.";
    }
    case "lead_to_proposal": {
      return "Review the proposal draft and send it to the client.";
    }
    case "weekly_review": {
      const o = output as { nextWeekPriorities?: string[] };
      return o.nextWeekPriorities?.[0] ?? "Set your priorities for next week.";
    }
    case "validate_idea": {
      return "Draft MVP Specification.";
    }
    case "launch_prep": {
      return "Deploy & Advance to Growth.";
    }
    case "delivery_update": {
      return "Log Client Approval.";
    }
    case "optimize_product": {
      return "Create Growth Opportunity.";
    }
    case "analyze_signals": {
      return "Create Severity Signal.";
    }
    default:
      return "Review the output and take the next step.";
  }
}

// ── Persistence Helper ───────────────────────────────────────

interface PersistParams {
  agentRunId: string;
  userId: string;
  definition: { agentRole: string; workflowType: string };
  request: { inputGoal: string; projectId?: string; workspaceId?: string; leadId?: string; contextTags?: string[] };
  output: Record<string, unknown>;
  status: "completed" | "failed";
  durationMs: number;
  nextBestAction?: string;
}

async function persistAgentRun(p: PersistParams): Promise<void> {
  try {
    await agentRunService.create(p.agentRunId, {
      userId: p.userId,
      agentRole: p.definition.agentRole as import("@/types").AgentRole,
      workflowType: p.definition.workflowType as import("@/types").WorkflowType,
      projectId: p.request.projectId,
      workspaceId: p.request.workspaceId,
      leadId: p.request.leadId,
      inputGoal: p.request.inputGoal,
      contextTags: p.request.contextTags ?? [],
      output: p.output,
      nextBestAction: p.nextBestAction,
      status: p.status as import("@/types").AgentRunStatus,
      durationMs: p.durationMs,
    });
  } catch (error) {
    // Never let persistence failures crash the pipeline
    console.error("[persistAgentRun] Failed to persist agent run:", error);
  }
}
