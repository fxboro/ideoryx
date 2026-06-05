import { vi, beforeEach } from "vitest";
import { MockFirestore } from "./helpers/firebase-mock";

// Create a singleton instance of the mock Firestore
export const mockFirestoreInstance = new MockFirestore();

// Mock the Firebase Admin module
vi.mock("@/lib/firebase/admin", () => {
  return {
    db: mockFirestoreInstance,
    auth: {
      verifyIdToken: async (token: string) => {
        if (token === "valid-token") {
          return { uid: "test-user-id", email: "test@example.com" };
        }
        throw new Error("Invalid token");
      },
    },
    admin: {
      apps: [],
      initializeApp: () => {},
      credential: {
        applicationDefault: () => ({}),
      },
      firestore: () => mockFirestoreInstance,
      auth: () => ({
        verifyIdToken: async (token: string) => {
          if (token === "valid-token") {
            return { uid: "test-user-id", email: "test@example.com" };
          }
          throw new Error("Invalid token");
        },
      }),
    },
  };
});

// Mock randomUUID in crypto if needed or let it use native
// Reset mock database before each test run
beforeEach(() => {
  mockFirestoreInstance.clear();
});
