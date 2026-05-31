import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, handleApiError } from "@/lib/api-auth";
import { runAgentWorkflowRequestSchema } from "@/lib/validators";
import { agentRunService } from "@/lib/services/agent-run.service";

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthUserId(req);
    if (typeof authResult !== "string") return authResult;
    const userId = authResult;

    const body = await req.json();
    const data = runAgentWorkflowRequestSchema.parse(body);

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
