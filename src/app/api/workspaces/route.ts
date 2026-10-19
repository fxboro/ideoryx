import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, handleApiError } from "@/lib/api-auth";
import { createWorkspaceRequestSchema } from "@/lib/validators";
import { workspaceService } from "@/lib/services/workspace.service";

export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthUserId(req);
    if (typeof authResult !== "string") return authResult;
    const userId = authResult;

    const list = await workspaceService.listWorkspacesByUser(userId);
    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthUserId(req);
    if (typeof authResult !== "string") return authResult;
    const userId = authResult;

    const body = await req.json();
    const data = createWorkspaceRequestSchema.parse(body);

    const id = "ws_" + crypto.randomUUID().substring(0, 8);

    await workspaceService.createWorkspace(id, {
      ...data,
      userId,
    });

    const created = await workspaceService.getWorkspaceById(id);

    return NextResponse.json(
      {
        success: true,
        message: "Workspace created successfully",
        data: created,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
