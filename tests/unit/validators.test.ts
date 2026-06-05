import { describe, it, expect } from "vitest";
import {
  projectSchema,
  createProjectRequestSchema,
  saveDecisionRequestSchema,
  weeklyReviewRequestSchema,
  createProposalDraftRequestSchema,
  runAgentWorkflowRequestSchema,
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
});
