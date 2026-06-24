// ─────────────────────────────────────────────────────────────
// Workspace Context Loader — Mission Control AI
// Loads a workspace and its related tasks/signals for context injection.
// ─────────────────────────────────────────────────────────────

import type { WorkspaceSchemaType, TaskSchemaType, SignalSchemaType } from "@/lib/validators";
import { workspaceService } from "@/lib/services/workspace.service";
import { signalService } from "@/lib/services/signal.service";
import { taskService } from "@/lib/services/task.service";

export interface WorkspaceContext {
  workspace: WorkspaceSchemaType | null;
  tasks: TaskSchemaType[];
  signals: SignalSchemaType[];
}

/**
 * Loads a workspace, its tasks, and its telemetry signals in parallel.
 * Returns null workspace + empty lists if the workspace doesn't exist.
 */
export async function loadWorkspaceContext(workspaceId: string): Promise<WorkspaceContext> {
  const [workspace, tasks, signals] = await Promise.all([
    workspaceService.getWorkspaceById(workspaceId),
    taskService.getWorkspaceTasks(workspaceId),
    signalService.listSignalsByWorkspace(workspaceId),
  ]);

  return { workspace, tasks, signals };
}
