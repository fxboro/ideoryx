import type { Opportunity } from "@/types";

const INITIAL_MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp1",
    userId: "user1",
    workspaceId: "w1",
    title: "Optimize Database Connection Pool Settings",
    description: "Database connection pool exhausted signals were triggered during peak traffic. Upgrading pool sizing or introducing connection recycling will mitigate timeouts.",
    category: "performance",
    status: "open",
    score: 80,
    scoringBreakdown: {
      impact: 5,
      confidence: 4,
      effort: 1,
      explanation: "Priority score of 80/100 is calculated based on: Massive Impact, High Confidence, and Very Low Effort (1-2 days). Formula: (Impact [5] × Confidence [4] / Effort [1]) × 4."
    },
    sourceSignalIds: ["sig1"],
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 2,
  },
  {
    id: "opp2",
    userId: "user1",
    workspaceId: "w1",
    title: "Implement Client Image Compression Loop",
    description: "Slow render bottleneck on project cards. Pre-scaling/caching images at upload time will prevent client-side paint delays.",
    category: "performance",
    status: "open",
    score: 48,
    scoringBreakdown: {
      impact: 3,
      confidence: 4,
      effort: 1,
      explanation: "Priority score of 48/100 is calculated based on: Medium Impact, High Confidence, and Very Low Effort (1-2 days). Formula: (Impact [3] × Confidence [4] / Effort [1]) × 4."
    },
    sourceSignalIds: ["sig2"],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3600000 * 4,
  }
];

const LOCAL_STORAGE_KEY = "mission_control_opportunities";

export function getStoredOpportunities(): Opportunity[] {
  if (typeof window === "undefined") return INITIAL_MOCK_OPPORTUNITIES;
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_OPPORTUNITIES));
      return INITIAL_MOCK_OPPORTUNITIES;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to load opportunities from localStorage", e);
    return INITIAL_MOCK_OPPORTUNITIES;
  }
}

export function saveStoredOpportunities(opportunities: Opportunity[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(opportunities));
  } catch (e) {
    console.error("Failed to save opportunities to localStorage", e);
  }
}
