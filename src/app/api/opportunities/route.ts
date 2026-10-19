import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, handleApiError } from "@/lib/api-auth";
import { opportunityService } from "@/lib/services/opportunity.service";
import { opportunitySchema } from "@/lib/validators";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthUserId(req);
    if (typeof authResult !== "string") return authResult;
    const userId = authResult;

    const opportunities = await opportunityService.listOpportunitiesByUser(userId);
    return NextResponse.json({ success: true, data: opportunities });
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
    const id = body.id || `opp_${nanoid(10)}`;
    const now = Date.now();

    const payload = {
      ...body,
      id,
      userId,
      status: body.status || "open",
      createdAt: body.createdAt || now,
      updatedAt: now,
    };

    opportunitySchema.parse(payload);
    await opportunityService.createOpportunity(id, payload);

    return NextResponse.json(
      { success: true, message: "Opportunity created successfully", data: payload },
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
        { error: "Opportunity ID is required", success: false },
        { status: 400 }
      );
    }

    const existing = await opportunityService.getOpportunityById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Opportunity not found", success: false },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized access to opportunity", success: false },
        { status: 403 }
      );
    }

    await opportunityService.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    const updated = await opportunityService.getOpportunityById(id);
    return NextResponse.json({
      success: true,
      message: "Opportunity updated successfully",
      data: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
