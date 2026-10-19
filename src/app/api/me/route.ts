import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, handleApiError } from "@/lib/api-auth";
import { getDbClient } from "@/lib/supabase/db";
import { toCamelCase, toSnakeCase } from "@/lib/services/base.service";

export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthUserId(req);
    if (typeof authResult !== "string") return authResult;
    const userId = authResult;

    const supabase = await getDbClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data ? toCamelCase(data) : { id: userId, onboardingCompleted: false },
    });
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
    const supabase = await getDbClient();

    const dbPayload = toSnakeCase({
      ...body,
      updatedAt: Date.now(),
    });

    // Upsert profile
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ ...dbPayload, id: userId })
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: data ? toCamelCase(data) : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
