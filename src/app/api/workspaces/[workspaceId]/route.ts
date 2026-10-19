import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, handleApiError } from "@/lib/api-auth";
import { workspaceService } from "@/lib/services/workspace.service";

export async function GET(
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

    return NextResponse.json({ success: true, data: workspace });
  } catch (error) {
    return handleApiError(error);
  }
}

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
    await workspaceService.updateWorkspace(workspaceId, body);
    const updated = await workspaceService.getWorkspaceById(workspaceId);

    return NextResponse.json({
      success: true,
      message: "Workspace updated successfully",
      data: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
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

    await workspaceService.delete(workspaceId);

    return NextResponse.json({
      success: true,
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
