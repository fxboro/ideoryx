import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, handleApiError } from "@/lib/api-auth";
import { weeklyReviewRequestSchema } from "@/lib/validators";
import { getDbClient } from "@/lib/supabase/db";
import { toSnakeCase } from "@/lib/services/base.service";

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthUserId(req);
    if (typeof authResult !== "string") return authResult;
    const userId = authResult;

    const body = await req.json();
    const data = weeklyReviewRequestSchema.parse(body);

    const id = crypto.randomUUID();
    const supabase = await getDbClient();

    const payload = toSnakeCase({
      id,
      userId,
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const { error } = await supabase.from("weekly_reviews").insert(payload);
    if (error) {
      throw new Error(`Failed to save weekly review: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Weekly review successfully submitted",
      data: { id }
    }, { status: 201 });

  } catch (error) {
    return handleApiError(error);
  }
}
