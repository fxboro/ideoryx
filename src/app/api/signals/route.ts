import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, handleApiError } from "@/lib/api-auth";
import { signalService } from "@/lib/services/signal.service";
import { signalSchema } from "@/lib/validators";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthUserId(req);
    if (typeof authResult !== "string") return authResult;
    const userId = authResult;

    const signals = await signalService.listSignalsByUser(userId);
    return NextResponse.json({ success: true, data: signals });
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
    const id = body.id || `sig_${nanoid(10)}`;
    const now = Date.now();

    const payload = {
      ...body,
      id,
      userId,
      status: body.status || "new",
      createdAt: body.createdAt || now,
      updatedAt: now,
    };

    signalSchema.parse(payload);
    await signalService.createSignal(id, payload);

    return NextResponse.json(
      { success: true, message: "Signal created successfully", data: payload },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await getAuthUserId(req);
    if (typeof authResult !== "string") return authResult;
    const userId = authResult;

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Signal ID is required", success: false },
        { status: 400 }
      );
    }

    const existing = await signalService.getSignalById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Signal not found", success: false },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized access to signal", success: false },
        { status: 403 }
      );
    }

    await signalService.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    const updated = await signalService.getSignalById(id);
    return NextResponse.json({
      success: true,
      message: "Signal updated successfully",
      data: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
