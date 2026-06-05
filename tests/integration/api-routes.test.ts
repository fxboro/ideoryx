import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { mockFirestoreInstance } from "../setup";

// Import route handlers
import { POST as createProjectHandler } from "@/app/api/projects/create/route";
import { POST as runAgentHandler } from "@/app/api/agent/run/route";
import { POST as saveDecisionHandler } from "@/app/api/decisions/save/route";
import { POST as submitWeeklyReviewHandler } from "@/app/api/weekly-review/route";
import { POST as createProposalHandler } from "@/app/api/proposals/create/route";

describe("API Routes Integration Tests", () => {
  const authHeaders = {
    Authorization: "Bearer valid-token",
    "Content-Type": "application/json",
  };

  describe("POST /api/projects/create", () => {
    it("should reject unauthorized request", async () => {
      const req = new NextRequest("http://localhost/api/projects/create", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const res = await createProjectHandler(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it("should reject invalid project data (missing name)", async () => {
      const req = new NextRequest("http://localhost/api/projects/create", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          type: "product",
          summary: "Missing name",
          risk: "low",
        }),
      });

      const res = await createProjectHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Validation Error");
    });

    it("should create a project on valid payload", async () => {
      const req = new NextRequest("http://localhost/api/projects/create", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          name: "API Project",
          type: "product",
          summary: "Created via API route",
          risk: "medium",
        }),
      });

      const res = await createProjectHandler(req);
      expect(res.status).toBe(201);
      
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.id).toBeTypeOf("string");

      // Verify DB write
      const projects = mockFirestoreInstance.getCollectionData("projects");
      const project = projects[json.data.id];
      expect(project).toBeDefined();
      expect(project.name).toBe("API Project");
      expect(project.userId).toBe("test-user-id");
    });
  });

  describe("POST /api/agent/run", () => {
    it("should start/register a pending agent run", async () => {
      const req = new NextRequest("http://localhost/api/agent/run", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          agentRole: "founder",
          workflowType: "scope_mvp",
          inputGoal: "Evaluate startup idea",
          projectId: "project-1",
        }),
      });

      const res = await runAgentHandler(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.success).toBe(true);

      const runs = mockFirestoreInstance.getCollectionData("agent_runs");
      const run = runs[json.data.id];
      expect(run).toBeDefined();
      expect(run.status).toBe("pending");
      expect(run.agentRole).toBe("founder");
    });
  });

  describe("POST /api/decisions/save", () => {
    it("should create a new decision when no ID is provided", async () => {
      const req = new NextRequest("http://localhost/api/decisions/save", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          title: "Choose Firebase",
          context: "Datastore selection",
          optionsConsidered: ["SQL", "NoSQL"],
          chosenOption: "NoSQL",
          rationale: "Fast prototyping",
        }),
      });

      const res = await saveDecisionHandler(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      const decisions = mockFirestoreInstance.getCollectionData("decisions");
      const decision = decisions[json.data.id];
      expect(decision).toBeDefined();
      expect(decision.title).toBe("Choose Firebase");
    });

    it("should update an existing decision when ID is provided", async () => {
      const decisionId = "existing-decision";
      mockFirestoreInstance.seed("decisions", decisionId, {
        id: decisionId,
        userId: "test-user-id",
        title: "Old Decision Title",
        context: "SaaS planning",
        optionsConsidered: ["A", "B"],
        chosenOption: "A",
        rationale: "Initial choice",
        createdAt: 100,
        updatedAt: 100,
      });

      const req = new NextRequest("http://localhost/api/decisions/save", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          id: decisionId,
          title: "Updated Decision Title",
          context: "SaaS planning",
          optionsConsidered: ["A", "B"],
          chosenOption: "A",
          rationale: "Updated logic",
        }),
      });

      const res = await saveDecisionHandler(req);
      expect(res.status).toBe(200);

      const decisions = mockFirestoreInstance.getCollectionData("decisions");
      const decision = decisions[decisionId];
      expect(decision).toBeDefined();
      expect(decision.title).toBe("Updated Decision Title");
      expect(decision.rationale).toBe("Updated logic");
    });
  });

  describe("POST /api/weekly-review", () => {
    it("should submit a weekly review and save it in weekly_reviews collection", async () => {
      const req = new NextRequest("http://localhost/api/weekly-review", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          weekStr: "2026-W23",
          notes: "Productive retrospective comments",
          goalsCreated: ["goal-123"],
        }),
      });

      const res = await submitWeeklyReviewHandler(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      const reviews = mockFirestoreInstance.getCollectionData("weekly_reviews");
      const review = reviews[json.data.id];
      expect(review).toBeDefined();
      expect(review.weekStr).toBe("2026-W23");
      expect(review.notes).toBe("Productive retrospective comments");
    });
  });

  describe("POST /api/proposals/create", () => {
    it("should create a proposal draft based on lead context", async () => {
      const req = new NextRequest("http://localhost/api/proposals/create", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          leadId: "lead-xyz",
          contextNotes: "Client requested an automated dashboard",
          timelineExpectation: "2 months",
        }),
      });

      const res = await createProposalHandler(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      const proposals = mockFirestoreInstance.getCollectionData("proposals");
      const proposal = proposals[json.data.id];
      expect(proposal).toBeDefined();
      expect(proposal.leadId).toBe("lead-xyz");
      expect(proposal.status).toBe("draft");
      expect(proposal.timeline).toBe("2 months");
      expect(proposal.problemSummary).toBe("Client requested an automated dashboard");
    });
  });
});
