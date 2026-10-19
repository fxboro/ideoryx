import { createClient as createServerSupabase } from "./server";
import { createAdminClient } from "./admin";

// Global mock holder for Vitest runs
let testMockClient: any = null;

export function setTestMockClient(client: any) {
  testMockClient = client;
}

export function getTestMockClient() {
  return testMockClient;
}

/**
 * Resolves the Supabase client based on execution environment.
 * - In testing (NODE_ENV === "test"), returns the in-memory mock client.
 * - In server requests, returns createServerSupabase() with cookie session.
 * - Fallback to createAdminClient() when running outside request context.
 */
export async function getDbClient() {
  if (process.env.NODE_ENV === "test" && testMockClient) {
    return testMockClient;
  }

  try {
    return await createServerSupabase();
  } catch {
    // If called outside of a Next.js request context (e.g. background job, CLI),
    // fall back to admin service client.
    return createAdminClient();
  }
}
