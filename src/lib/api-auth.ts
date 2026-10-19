import { NextRequest, NextResponse } from "next/server";
import { createClient } from "./supabase/server";
import { z } from "zod";

export async function getAuthUserId(req: NextRequest): Promise<string | NextResponse> {
  // Support testing mock user
  if (process.env.NODE_ENV === "test") {
    const testHeader = req.headers.get("x-test-user-id");
    if (testHeader) return testHeader;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer mock-token-for-")) {
      return authHeader.replace("Bearer mock-token-for-", "");
    }
    if (
      authHeader?.startsWith("Bearer test-token") ||
      authHeader === "Bearer valid-token"
    ) {
      return "test-user-id";
    }
  }

  const authHeader = req.headers.get("Authorization");
  const cookieHeader = req.headers.get("cookie");

  // Check if Supabase keys are configured in environment
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: "Unauthorized. Supabase credentials not configured in environment.", success: false },
      { status: 401 }
    );
  }

  try {
    const supabase = await createClient();

    // 1. Check Bearer token in Authorization header
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user?.id) {
        return data.user.id;
      }
    }

    // 2. Check Cookie session from Supabase SSR
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!error && user?.id) {
      return user.id;
    }

    return NextResponse.json(
      { error: "Unauthorized. Please sign in to continue.", success: false },
      { status: 401 }
    );
  } catch (error) {
    console.error("Auth Verification Error:", error);
    return NextResponse.json(
      { error: "Internal Auth Error", success: false },
      { status: 500 }
    );
  }
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Validation Error", details: error.issues, success: false },
      { status: 400 }
    );
  }
  return NextResponse.json(
    { error: "Internal Server Error", success: false },
    { status: 500 }
  );
}
