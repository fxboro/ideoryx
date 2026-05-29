import type { Workspace, WorkspaceChecklistItem } from "@/types";

export const MOCK_PRODUCT_CHECKLISTS = {
  validation: [
    { id: "v1", stage: "validation", label: "Define Target Customer Profile (ICP)", completed: true, completedAt: Date.now() },
    { id: "v2", stage: "validation", label: "Validate 5+ customer pain points in interviews", completed: true, completedAt: Date.now() },
    { id: "v3", stage: "validation", label: "Analyze competitors and unique positioning", completed: false },
    { id: "v4", stage: "validation", label: "Establish Unique Value Proposition (UVP)", completed: false },
  ],
  spec: [
    { id: "s1", stage: "spec", label: "Write MVP specifications and scope", completed: false },
    { id: "s2", stage: "spec", label: "Design modular system architecture", completed: false },
    { id: "s3", stage: "spec", label: "Draft Firestore collection/schema details", completed: false },
    { id: "s4", stage: "spec", label: "Define milestone timeline and delivery targets", completed: false },
  ],
  build: [
    { id: "b1", stage: "build", label: "Set up repository & configure dev environment", completed: false },
    { id: "b2", stage: "build", label: "Implement authentication and user accounts", completed: false },
    { id: "b3", stage: "build", label: "Build core feature modules", completed: false },
    { id: "b4", stage: "build", label: "Run security and code quality review checklists", completed: false },
  ],
  launch: [
    { id: "l1", stage: "launch", label: "Provision production database & deployments", completed: false },
    { id: "l2", stage: "launch", label: "Set up performance/telemetry monitoring", completed: false },
    { id: "l3", stage: "launch", label: "Create onboarding guide / tutorials", completed: false },
    { id: "l4", stage: "launch", label: "Execute launch marketing/campaign checklist", completed: false },
  ],
  growth: [
    { id: "g1", stage: "growth", label: "Collect and index post-launch user feedback", completed: false },
    { id: "g2", stage: "growth", label: "Monitor telemetry errors and triage alerts", completed: false },
    { id: "g3", stage: "growth", label: "Map improvement opportunities (impact vs effort)", completed: false },
  ]
};

export const MOCK_CLIENT_CHECKLISTS = {
  discovery: [
    { id: "d1", stage: "discovery", label: "Qualify lead and contact alignment", completed: true, completedAt: Date.now() },
    { id: "d2", stage: "discovery", label: "Identify primary business pain points", completed: true, completedAt: Date.now() },
    { id: "d3", stage: "discovery", label: "Host discovery/requirements call", completed: true, completedAt: Date.now() },
    { id: "d4", stage: "discovery", label: "Establish high-level budget match", completed: false },
  ],
  proposal: [
    { id: "p1", stage: "proposal", label: "Define detailed client project scope", completed: false },
    { id: "p2", stage: "proposal", label: "Estimate implementation hours and cost logic", completed: false },
    { id: "p3", stage: "proposal", label: "Generate and review draft proposal", completed: false },
    { id: "p4", stage: "proposal", label: "Deliver final proposal and capture feedback", completed: false },
  ],
  delivery: [
    { id: "e1", stage: "delivery", label: "Conduct project kickoff with client", completed: false },
    { id: "e2", stage: "delivery", label: "Ship milestone deliverables on timeline", completed: false },
    { id: "e3", stage: "delivery", label: "Send periodic progress & scope reports", completed: false },
    { id: "e4", stage: "delivery", label: "Perform QA and client feedback cycles", completed: false },
  ],
  launch: [
    { id: "c1", stage: "launch", label: "Deploy final solution to client production", completed: false },
    { id: "c2", stage: "launch", label: "Conduct handover session & training", completed: false },
    { id: "c3", stage: "launch", label: "Submit system documentation and admin keys", completed: false },
    { id: "c4", stage: "launch", label: "Secure client final sign-off", completed: false },
  ],
  support: [
    { id: "u1", stage: "support", label: "Sign SLAs / define maintenance terms", completed: false },
    { id: "u2", stage: "support", label: "Schedule monthly feedback follow-up", completed: false },
    { id: "u3", stage: "support", label: "Analyze expansion/retention opportunities", completed: false },
  ]
};

const INITIAL_MOCK_WORKSPACES: Workspace[] = [
  {
    id: "w1",
    userId: "user1",
    name: "Mission Control AI",
    workspaceType: "product",
    status: "active",
    summary: "A personal AI operating system for helping the user become a top-tier AI software developer, tech founder, and freelancer.",
    stage: "validation",
    readinessScore: 50,
    checklists: JSON.parse(JSON.stringify(MOCK_PRODUCT_CHECKLISTS)),
    currentFocus: "Frontend Components & UI Shell Refactoring",
    nextMilestone: "Step 2 UI Shell Acceptance",
    risk: "medium",
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 3600000,
    // Compat fields
    type: "product",
    phase: "build"
  },
  {
    id: "w2",
    userId: "user1",
    name: "Client Wellness Portal",
    workspaceType: "client",
    status: "active",
    summary: "Patient intake and progress tracking portal for Acme Wellness studio.",
    stage: "discovery",
    readinessScore: 75,
    checklists: JSON.parse(JSON.stringify(MOCK_CLIENT_CHECKLISTS)),
    currentFocus: "Awaiting Budget Approval Sign-off",
    nextMilestone: "Proposal Drafting",
    risk: "high",
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000,
    // Compat fields
    type: "freelance",
    phase: "spec"
  },
  {
    id: "w3",
    userId: "user1",
    name: "Advanced Firebase Realtime",
    workspaceType: "product",
    status: "on_hold",
    summary: "Deep dive into real-time pub/sub architecture using Firebase.",
    stage: "build",
    readinessScore: 0,
    checklists: JSON.parse(JSON.stringify(MOCK_PRODUCT_CHECKLISTS)),
    currentFocus: "Paused until next sprint",
    nextMilestone: "Setup Firebase triggers",
    risk: "low",
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 86400000 * 10,
    // Compat fields
    type: "learning",
    phase: "build"
  }
];

const LOCAL_STORAGE_KEY = "mission_control_workspaces";

export function getStoredWorkspaces(): Workspace[] {
  if (typeof window === "undefined") return INITIAL_MOCK_WORKSPACES;
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_WORKSPACES));
      return INITIAL_MOCK_WORKSPACES;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to load workspaces from localStorage", e);
    return INITIAL_MOCK_WORKSPACES;
  }
}

export function saveStoredWorkspaces(workspaces: Workspace[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(workspaces));
  } catch (e) {
    console.error("Failed to save workspaces to localStorage", e);
  }
}
