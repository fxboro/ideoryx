import { describe, it, expect } from "vitest";
import {
  projectSchema,
  createProjectRequestSchema,
  saveDecisionRequestSchema,
  weeklyReviewRequestSchema,
  createProposalDraftRequestSchema,
  runAgentWorkflowRequestSchema,
  workspaceSchema,
  signalSchema,
  opportunitySchema,
} from "@/lib/validators";

describe("Zod Validators Unit Tests", () => {
  describe("Project Request Schema", () => {
    it("should validate a correct project request and apply defaults", () => {
      const payload = {
        name: "Test Project",
        type: "product",
        summary: "A brief summary of the project.",
        risk: "low",
      };

      const result = createProjectRequestSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("active");
        expect(result.data.phase).toBe("spec");
        expect(result.data.name).toBe("Test Project");
      }
    });

    it("should reject a project request with missing name", () => {
      const payload = {
        type: "product",
        summary: "Missing name",
        risk: "low",
      };

      const result = createProjectRequestSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it("should reject invalid project type or risk levels", () => {
      const payload = {
        name: "Bad Project",
        type: "invalid-type", // invalid
        summary: "Invalid project fields",
        risk: "super-high", // invalid
      };

      const result = createProjectRequestSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("Save Decision Request Schema", () => {
    it("should validate a correct save decision request", () => {
      const payload = {
        title: "Use PostgreSQL",
        context: "Need a relational database for complex queries.",
        optionsConsidered: ["MongoDB", "PostgreSQL", "SQLite"],
        chosenOption: "PostgreSQL",
        rationale: "Better indexing and ACID transactions.",
        projectId: "project-123",
      };

      const result = saveDecisionRequestSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("should reject a save decision with empty optionsConsidered", () => {
      const payload = {
        title: "Choose CSS Framework",
        context: "Style library",
        optionsConsidered: [], // Requires min(1)
        chosenOption: "Tailwind",
        rationale: "Speed",
      };

      const result = saveDecisionRequestSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("Weekly Review Request Schema", () => {
    it("should validate a correct weekly review request", () => {
      const payload = {
        weekStr: "2026-W23",
        notes: "Solid progress on backend tasks.",
        goalsCreated: ["goal-1", "goal-2"],
        tasksRolledOver: [],
        learningsGenerated: ["learning-1"],
      };

      const result = weeklyReviewRequestSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("should fail validation without weekStr", () => {
      const payload = {
        notes: "No week string provided",
      };

      const result = weeklyReviewRequestSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("Create Proposal Draft Request Schema", () => {
    it("should validate a correct proposal request", () => {
      const payload = {
        leadId: "lead-abc",
        contextNotes: "Client wants a e-commerce site.",
        budgetSignal: "high",
        timelineExpectation: "1 month",
        includeServices: ["design", "development"],
      };

      const result = createProposalDraftRequestSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("should fail without leadId", () => {
      const payload = {
        contextNotes: "No lead ID",
      };

      const result = createProposalDraftRequestSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("Run Agent Workflow Request Schema", () => {
    it("should validate a correct run agent request", () => {
      const payload = {
        agentRole: "founder",
        inputGoal: "Evaluate market feasibility of AI app",
        projectId: "proj-1",
        contextTags: ["market-research", "ai"],
      };

      const result = runAgentWorkflowRequestSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("should reject run agent request without inputGoal", () => {
      const payload = {
        agentRole: "builder",
      };

      const result = runAgentWorkflowRequestSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("Workspace Schema", () => {
    it("should validate a correct workspace payload", () => {
      const payload = {
        id: "ws-123",
        userId: "user-123",
        organizationId: "org-123",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        name: "My Workspace",
        workspaceType: "product",
        status: "active",
        summary: "A product workspace summary",
        stage: "validation",
        readinessScore: 50,
        checklists: {
          validation: [
            { id: "item-1", stage: "validation", label: "Check this", completed: false }
          ]
        },
        risk: "low"
      };

      const result = workspaceSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("should reject workspace payload with invalid stage or missing type", () => {
      const payloadMissingType = {
        id: "ws-123",
        userId: "user-123",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        name: "My Workspace",
        status: "active",
        summary: "A workspace missing type",
        stage: "validation",
        readinessScore: 50,
        checklists: {},
        risk: "low"
      };

      const payloadInvalidStage = {
        id: "ws-123",
        userId: "user-123",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        name: "My Workspace",
        workspaceType: "product",
        status: "active",
        summary: "A workspace with invalid stage",
        stage: "invalid_stage",
        readinessScore: 50,
        checklists: {},
        risk: "low"
      };

      expect(workspaceSchema.safeParse(payloadMissingType).success).toBe(false);
      expect(workspaceSchema.safeParse(payloadInvalidStage).success).toBe(false);
    });

    it("should reject workspace payload with out-of-range readinessScore", () => {
      const payload = {
        id: "ws-123",
        userId: "user-123",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        name: "My Workspace",
        workspaceType: "product",
        status: "active",
        summary: "Readiness score test",
        stage: "validation",
        readinessScore: 150, // Max is 100
        checklists: {},
        risk: "low"
      };

      expect(workspaceSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("Signal Schema", () => {
    it("should validate a correct signal payload", () => {
      const payload = {
        id: "sig-123",
        userId: "user-123",
        organizationId: "org-123",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        workspaceId: "ws-123",
        title: "Database Error",
        description: "Firestore transaction aborted due to timeout",
        category: "error",
        severity: "high",
        status: "new",
        source: "sentry"
      };

      const result = signalSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("should reject signal payload with missing workspaceId or invalid severity", () => {
      const payloadMissingWorkspace = {
        id: "sig-123",
        userId: "user-123",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        title: "Database Error",
        description: "Firestore transaction aborted due to timeout",
        category: "error",
        severity: "high",
        status: "new",
        source: "sentry"
      };

      const payloadInvalidSeverity = {
        id: "sig-123",
        userId: "user-123",
        workspaceId: "ws-123",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        title: "Database Error",
        description: "Firestore transaction aborted due to timeout",
        category: "error",
        severity: "critical", // Invalid severity
        status: "new",
        source: "sentry"
      };

      expect(signalSchema.safeParse(payloadMissingWorkspace).success).toBe(false);
      expect(signalSchema.safeParse(payloadInvalidSeverity).success).toBe(false);
    });
  });

  describe("Opportunity Schema", () => {
    it("should validate a correct opportunity payload", () => {
      const payload = {
        id: "opp-123",
        userId: "user-123",
        organizationId: "org-123",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        title: "Enable CDN Caching",
        description: "Cache static assets at edge locations to reduce load times",
        workspaceId: "ws-123",
        status: "open",
        category: "performance",
        score: 75,
        scoringBreakdown: {
          impact: 4,
          confidence: 4,
          effort: 1,
          explanation: "Low effort, high impact optimization"
        },
        sourceSignalIds: ["sig-123"]
      };

      const result = opportunitySchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("should reject opportunity payload with scoring fields out of 1-5 range", () => {
      const payload = {
        id: "opp-123",
        userId: "user-123",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        title: "Enable CDN Caching",
        description: "Cache static assets at edge locations to reduce load times",
        workspaceId: "ws-123",
        status: "open",
        category: "performance",
        score: 75,
        scoringBreakdown: {
          impact: 6, // Max 5
          confidence: 4,
          effort: 1,
          explanation: "Out of range impact"
        },
        sourceSignalIds: []
      };

      expect(opportunitySchema.safeParse(payload).success).toBe(false);
    });
  });
});
