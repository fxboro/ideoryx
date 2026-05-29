import { NextRequest, NextResponse } from "next/server";
import { auth } from "./firebase/admin";
import { z } from "zod";

export async function getAuthUserId(req: NextRequest): Promise<string | NextResponse> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid authorization header.", success: false },
      { status: 401 }
    );
  }

  const token = authHeader.split("Bearer ")[1];
  
  try {
    const decoded = await auth.verifyIdToken(token);
    return decoded.uid;
  } catch (error) {
    console.error("Auth Error:", error);
    return NextResponse.json(
      { error: "Unauthorized / Invalid Token", success: false },
      { status: 401 }
    );
  }
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Validation Error", details: (error as any).errors, success: false },
      { status: 400 }
    );
  }
  return NextResponse.json(
    { error: "Internal Server Error", success: false },
    { status: 500 }
  );
}
