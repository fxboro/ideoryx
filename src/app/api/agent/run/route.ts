import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, handleApiError } from "@/lib/api-auth";
import { runAgentWorkflowRequestSchema } from "@/lib/validators";
import { agentRunService } from "@/lib/services/agent-run.service";
import { runAgentWorkflow } from "@/lib/agents/run-agent-workflow";

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthUserId(req);
    if (typeof authResult !== "string") return authResult;
    const userId = authResult;

    const body = await req.json();
    const data = runAgentWorkflowRequestSchema.parse(body);

    // Synchronous execution mode (used by interactive Agents Console)
    if (data.sync) {
      const result = await runAgentWorkflow({
        userId,
        rawRequest: data,
      });

      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: result.error || "Workflow execution failed",
          data: {
            id: result.agentRunId,
            durationMs: result.durationMs,
          }
        }, { status: 422 });
      }

      return NextResponse.json({
        success: true,
        message: "Agent workflow executed successfully",
        data: {
          id: result.agentRunId,
          output: result.output,
          nextBestAction: result.nextBestAction,
          saveActions: result.saveActions,
          durationMs: result.durationMs,
        }
      }, { status: 200 });
    }

    // Default asynchronous/queued mode
    const id = crypto.randomUUID();
    
    await agentRunService.create(id, {
      userId,
      agentRole: data.agentRole,
      workflowType: data.workflowType,
      projectId: data.projectId,
      workspaceId: data.workspaceId,
      leadId: data.leadId,
      inputGoal: data.inputGoal,
      contextTags: data.contextTags ?? [],
      status: "pending",
      output: {},
    });
    
    return NextResponse.json({
      success: true,
      message: "Agent workflow successfully started",
      data: { id }
    }, { status: 201 });

  } catch (error) {
    return handleApiError(error);
  }
}
