import type { Signal } from "@/types";

const INITIAL_MOCK_SIGNALS: Signal[] = [
  {
    id: "sig1",
    userId: "user1",
    workspaceId: "w1",
    title: "Database connection pool exhausted",
    description: "Production database connection pool reached 100% capacity. 15 requests timed out waiting for connection. Triggered at peak hour traffic.",
    category: "error",
    severity: "high",
    status: "new",
    source: "sentry",
    sourceMetadata: {
      issueId: "SEN-1082",
      errorCount: 15,
      firstSeen: Date.now() - 3600000 * 2,
    },
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 2,
  },
  {
    id: "sig2",
    userId: "user1",
    workspaceId: "w1",
    title: "Slow render on main project cards",
    description: "Client side card grid is taking 1.4s to paint on 3G network. Main bottleneck detected in raw image resizing loops.",
    category: "performance",
    severity: "medium",
    status: "reviewed",
    source: "posthog",
    sourceMetadata: {
      eventMetric: "FCP_1400ms",
      count: 240,
    },
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3600000 * 4,
  },
  {
    id: "sig3",
    userId: "user1",
    workspaceId: "w2",
    title: "Client Wellness Portal billing dispute",
    description: "Client sent Zendesk ticket requesting custom pricing tier modification for invoice #1042 due to onboarding delay.",
    category: "feedback",
    severity: "high",
    status: "new",
    source: "zendesk",
    sourceMetadata: {
      ticketId: "ZEN-409",
      contactEmail: "billing@acmewellness.com",
    },
    createdAt: Date.now() - 3600000 * 4,
    updatedAt: Date.now() - 3600000 * 4,
  },
  {
    id: "sig4",
    userId: "user1",
    workspaceId: "w1",
    title: "Manual: Validate dark mode settings",
    description: "Beta testers in Discord requested clean support for system preference matching instead of simple manual toggles.",
    category: "feedback",
    severity: "low",
    status: "dismissed",
    source: "manual",
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 2,
  }
];

const LOCAL_STORAGE_KEY = "mission_control_signals";

export function getStoredSignals(): Signal[] {
  if (typeof window === "undefined") return INITIAL_MOCK_SIGNALS;
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_SIGNALS));
      return INITIAL_MOCK_SIGNALS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to load signals from localStorage", e);
    return INITIAL_MOCK_SIGNALS;
  }
}

export function saveStoredSignals(signals: Signal[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(signals));
  } catch (e) {
    console.error("Failed to save signals to localStorage", e);
  }
}
