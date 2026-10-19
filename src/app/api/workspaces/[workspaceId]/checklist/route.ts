import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, handleApiError } from "@/lib/api-auth";
import { workspaceService } from "@/lib/services/workspace.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const authResult = await getAuthUserId(req);
    if (typeof authResult !== "string") return authResult;
    const userId = authResult;

    const { workspaceId } = await params;
    const workspace = await workspaceService.getWorkspaceById(workspaceId);

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found", success: false },
        { status: 404 }
      );
    }

    if (workspace.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized access to workspace", success: false },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { itemId, completed, stage } = body;

    let targetStage = stage;
    if (!targetStage && workspace.checklists) {
      for (const [st, items] of Object.entries(workspace.checklists)) {
        if (items.some((it) => it.id === itemId)) {
          targetStage = st;
          break;
        }
      }
    }

    if (!targetStage) {
      targetStage = workspace.stage;
    }

    const updated = await workspaceService.toggleChecklistItem(
      workspaceId,
      targetStage,
      itemId,
      Boolean(completed)
    );

    return NextResponse.json({
      success: true,
      message: "Checklist item updated",
      data: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
