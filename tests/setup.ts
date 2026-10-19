import { beforeEach } from "vitest";
import { MockFirestore } from "./helpers/firebase-mock";
import { MockSupabase } from "./helpers/supabase-mock";
import { setTestMockClient } from "@/lib/supabase/db";

// Singleton mock instances for testing
export const mockFirestoreInstance = new MockFirestore();
export const mockSupabaseInstance = new MockSupabase();

// Connect the test mock client to the database resolver and mirror stores
mockFirestoreInstance.mirrorTarget = mockSupabaseInstance;
mockSupabaseInstance.mirrorTarget = mockFirestoreInstance;
setTestMockClient(mockSupabaseInstance);

// Reset mock databases before each test run
beforeEach(() => {
  mockFirestoreInstance.clear();
  mockSupabaseInstance.clear();
});
