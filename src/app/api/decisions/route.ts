import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, handleApiError } from "@/lib/api-auth";
import { decisionService } from "@/lib/services/decision.service";
import { decisionSchema } from "@/lib/validators";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthUserId(req);
    if (typeof authResult !== "string") return authResult;
    const userId = authResult;

    const decisions = await decisionService.getRecentDecisions(userId, 50);
    return NextResponse.json({ success: true, data: decisions });
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
    const id = body.id || `dec_${nanoid(10)}`;
    const now = Date.now();

    const payload = {
      ...body,
      id,
      userId,
      createdAt: body.createdAt || now,
      updatedAt: now,
    };

    decisionSchema.parse(payload);
    await decisionService.create(id, payload);

    return NextResponse.json(
      { success: true, message: "Decision logged successfully", data: payload },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
