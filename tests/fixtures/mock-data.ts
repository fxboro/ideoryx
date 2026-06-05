import type {
  UserSchemaType,
  ProjectSchemaType,
  TaskSchemaType,
  MemorySchemaType,
  GoalSchemaType,
  LeadSchemaType,
  DecisionSchemaType,
  AgentRunSchemaType,
  LearningItemSchemaType,
} from "@/lib/validators";

export const mockUser: UserSchemaType = {
  uid: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  missionStatement: "Empower developers with agentic tools.",
  weeklyCapacity: 40,
  preferredStack: ["Next.js", "TypeScript", "TailwindCSS", "Firebase"],
  businessFocus: ["Product Management", "AI integrations"],
  growthFocus: ["Marketing", "Sales"],
  primaryMode: "builder",
  createdAt: 1717584000000, // June 5, 2024
};

export const mockProject: ProjectSchemaType = {
  id: "project-1",
  userId: "test-user-id",
  name: "Ideoryx App",
  type: "product",
  status: "active",
  summary: "A dashboard for managing agent workflows and product lifecycle.",
  targetUser: "Indie hackers and solo founders",
  problem: "Managing multiple AI agents is scattered and lacks a single control pane.",
  phase: "spec",
  stack: ["Next.js", "TypeScript", "Firestore"],
  currentFocus: "Define MVP scope",
  nextMilestone: "Launch beta v1",
  risk: "low",
  createdAt: 1717584000000,
  updatedAt: 1717584000000,
};

export const mockTask: TaskSchemaType = {
  id: "task-1",
  userId: "test-user-id",
  title: "Setup Firebase Admin SDK",
  description: "Configure firebase-admin app initialization and export firestore db reference.",
  projectId: "project-1",
  type: "chore",
  priority: "high",
  status: "todo",
  estimateHours: 2,
  createdAt: 1717584000000,
  updatedAt: 1717584000000,
};

export const mockGoal: GoalSchemaType = {
  id: "goal-1",
  userId: "test-user-id",
  title: "Launch MVP of Ideoryx",
  description: "Get the basic dashboard live for initial feedback.",
  type: "weekly",
  timeframe: "Week 23, 2026",
  status: "active",
  progress: 20,
  linkedProjectIds: ["project-1"],
  createdAt: 1717584000000,
  updatedAt: 1717584000000,
};

export const mockLead: LeadSchemaType = {
  id: "lead-1",
  userId: "test-user-id",
  businessName: "Acme Corp",
  contactName: "John Doe",
  contactEmail: "john@acme.com",
  niche: "Enterprise SaaS",
  source: "linkedin",
  painPoint: "Inefficient customer support workflows.",
  urgency: "medium",
  budgetSignal: "high",
  status: "new",
  notes: "Interested in custom AI chatbots.",
  createdAt: 1717584000000,
  updatedAt: 1717584000000,
};

export const mockDecision: DecisionSchemaType = {
  id: "decision-1",
  userId: "test-user-id",
  title: "Use Vitest instead of Jest",
  projectId: "project-1",
  context: "We need a testing framework for our Next.js and Firebase backend.",
  optionsConsidered: ["Jest", "Vitest", "Playwright components"],
  chosenOption: "Vitest",
  rationale: "Vitest has native support for ES modules and is extremely fast with Next.js path aliases.",
  tradeoffs: "Jest has a larger ecosystem but can be difficult to set up with modern React 19 ESM codebases.",
  risks: "Slightly fewer historical StackOverflow answers compared to Jest.",
  createdAt: 1717584000000,
  updatedAt: 1717584000000,
};

export const mockMemory: MemorySchemaType = {
  id: "memory-1",
  userId: "test-user-id",
  type: "preference",
  content: "User prefers HSL Tailwind colors over hex values.",
  confidence: 95,
  tags: ["design", "css"],
  createdAt: 1717584000000,
  updatedAt: 1717584000000,
};

export const mockAgentRun: AgentRunSchemaType = {
  id: "run-1",
  userId: "test-user-id",
  agentRole: "founder",
  workflowType: "scope_mvp",
  projectId: "project-1",
  inputGoal: "Scope out an AI support agent",
  contextTags: ["ai", "support"],
  output: {
    projectName: "SupportAI",
    problemStatement: "Customer support is slow.",
    targetUser: "SaaS startups",
    coreFeatures: ["Auto-responses", "Agent dashboard"],
    mvpScope: "Basic chatbot that auto-resolves tickets.",
    outOfScope: ["Multi-channel support"],
    suggestedStack: ["Next.js", "Gemini API"],
    estimatedTimeline: "2 weeks",
    risks: ["Hallucinations"],
    nextSteps: ["Define prompt templates", "Setup database"],
  },
  nextBestAction: "Review next steps and create task backlog.",
  status: "completed",
  durationMs: 1450,
  createdAt: 1717584000000,
  updatedAt: 1717584000000,
};

export const mockLearningItem: LearningItemSchemaType = {
  id: "learning-1",
  userId: "test-user-id",
  title: "Learn Firebase Rules",
  category: "Security",
  skillLevel: "intermediate",
  status: "in_progress",
  progress: 50,
  notes: "Need to secure collection writes for tenant separation.",
  tags: ["firebase", "security"],
  resourceUrl: "https://firebase.google.com/docs/rules",
  createdAt: 1717584000000,
  updatedAt: 1717584000000,
};
