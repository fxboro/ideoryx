// ─────────────────────────────────────────────────────────────
// Context Builder — Mission Control AI
// Assembles the full AgentContext for a workflow run by
// loading relevant data from Firestore services.
// ─────────────────────────────────────────────────────────────

import type { AllWorkflowId } from "./types";
import type { AgentContext } from "./types";
import type { RunAgentWorkflowRequest } from "@/lib/validators";
import { loadMemories } from "./memory-loader";
import { loadProjectContext } from "./project-context-loader";
import { loadWorkspaceContext } from "./workspace-context-loader";
import { goalService } from "@/lib/services/goal.service";
import { leadService } from "@/lib/services/lead.service";
import { taskService } from "@/lib/services/task.service";
import { decisionService } from "@/lib/services/decision.service";
import { agentRunService } from "@/lib/services/agent-run.service";
import { learningItemService } from "@/lib/services/learning-item.service";
import { getWorkflowDefinition } from "./workflow-registry";

export interface ContextBuilderParams {
  userId: string;
  request: RunAgentWorkflowRequest;
  workflowId: AllWorkflowId;
}

/**
 * Builds the complete AgentContext for a given workflow run.
 * Loads memories, project data, workspace data, goals, and lead data in parallel
 * based on what the workflow actually needs.
 */
export async function buildAgentContext(params: ContextBuilderParams): Promise<AgentContext> {
  const { userId, request, workflowId } = params;
  const definition = getWorkflowDefinition(workflowId);

  // Determine what to load based on workflow needs
  const needsProject = !!request.projectId;
  const needsWorkspace = !!request.workspaceId;
  const needsLead = !!request.leadId || definition.agentRole === "freelance";
  const contextTags = request.contextTags ?? [];

  const isWeeklyReview = workflowId === "weekly_review";

  // Load everything in parallel for speed
  const [memories, projectCtx, workspaceCtx, goals, lead, allTasks, decisions, agentRuns, learningItems] = await Promise.all([
    loadMemories(userId, contextTags),
    needsProject && request.projectId
      ? loadProjectContext(request.projectId)
      : Promise.resolve({ project: null, tasks: [] }),
    needsWorkspace && request.workspaceId
      ? loadWorkspaceContext(request.workspaceId)
      : Promise.resolve({ workspace: null, tasks: [], signals: [] }),
    goalService.listByUser(userId),
    needsLead && request.leadId
      ? leadService.getById(request.leadId)
      : Promise.resolve(null),
    isWeeklyReview ? taskService.listByUser(userId) : Promise.resolve([]),
    isWeeklyReview ? decisionService.listByUser(userId) : Promise.resolve([]),
    isWeeklyReview ? agentRunService.listByUser(userId) : Promise.resolve([]),
    isWeeklyReview ? learningItemService.listByUser(userId) : Promise.resolve([]),
  ]);

  // Combine tasks from either project, workspace, or weekly review
  let tasks = projectCtx.tasks;
  if (isWeeklyReview) {
    tasks = allTasks;
  } else if (needsWorkspace) {
    tasks = workspaceCtx.tasks;
  }

  return {
    inputGoal: request.inputGoal,
    memories,
    project: projectCtx.project,
    workspace: workspaceCtx.workspace,
    signals: workspaceCtx.signals,
    goals,
    tasks,
    lead,
    decisions,
    agentRuns,
    learningItems,
    additionalContext: request.context,
    contextTags,
  };
}
