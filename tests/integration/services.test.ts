import { describe, it, expect } from "vitest";
import { projectService } from "@/lib/services/project.service";
import { decisionService } from "@/lib/services/decision.service";
import { workspaceService, signalService, opportunityService } from "@/lib/services";
import { mockProject } from "../fixtures/mock-data";
import { mockFirestoreInstance } from "../setup";

describe("Firestore Services Integration Tests", () => {
  describe("Project Service", () => {
    it("should successfully create and retrieve a project", async () => {
      const projectId = "project-123";
      
      await projectService.create(projectId, {
        ...mockProject,
        id: projectId,
        name: "Service Test Project",
      });

      const retrieved = await projectService.getById(projectId);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe("Service Test Project");
      expect(retrieved?.userId).toBe("test-user-id");
      expect(retrieved?.createdAt).toBeTypeOf("number");
    });

    it("should fail validation on create if the schema parsing fails", async () => {
      const projectId = "project-bad";
      
      // type is invalid
      await expect(
        projectService.create(projectId, {
          ...mockProject,
          id: projectId,
          type: "invalid-type" as any,
        })
      ).rejects.toThrow();
    });

    it("should list projects by user", async () => {
      const userId = "user-abc";
      
      await projectService.create("p1", { ...mockProject, id: "p1", userId, name: "Proj 1", updatedAt: 1000 });
      await projectService.create("p2", { ...mockProject, id: "p2", userId, name: "Proj 2", updatedAt: 2000 });

      const list = await projectService.listByUser(userId);
      expect(list.length).toBe(2);
      // Ordered by updatedAt desc in listByUser
      expect(list[0].id).toBe("p2");
      expect(list[1].id).toBe("p1");
    });

    it("should retrieve only active projects for getActiveProjects", async () => {
      const userId = "user-active";

      await projectService.create("p1", { ...mockProject, id: "p1", userId, status: "active", updatedAt: 1000 });
      await projectService.create("p2", { ...mockProject, id: "p2", userId, status: "on_hold", updatedAt: 2000 });
      await projectService.create("p3", { ...mockProject, id: "p3", userId, status: "active", updatedAt: 3000 });

      const active = await projectService.getActiveProjects(userId);
      expect(active.length).toBe(2);
      expect(active[0].id).toBe("p3");
      expect(active[1].id).toBe("p1");
      expect(active.some(p => p.id === "p2")).toBe(false);
    });

    it("should update project fields and update updatedAt timestamp", async () => {
      const projectId = "p-update";
      
      await projectService.create(projectId, {
        ...mockProject,
        id: projectId,
        name: "Old Name",
        createdAt: 100,
        updatedAt: 100,
      });

      // Wait a tiny bit to make sure updatedAt changes
      const start = Date.now();
      await projectService.update(projectId, {
        name: "New Name",
      });

      const updated = await projectService.getById(projectId);
      expect(updated?.name).toBe("New Name");
      expect(updated?.updatedAt).toBeGreaterThanOrEqual(start);
      expect(updated?.createdAt).toBe(100); // Should remain unchanged
    });

    it("should delete a project", async () => {
      const projectId = "p-delete";
      await projectService.create(projectId, { ...mockProject, id: projectId });

      const before = await projectService.getById(projectId);
      expect(before).not.toBeNull();

      await projectService.delete(projectId);

      const after = await projectService.getById(projectId);
      expect(after).toBeNull();
    });
  });

  describe("Decision Service", () => {
    it("should save and query decisions", async () => {
      const decisionId = "d-1";
      const userId = "u-decide";

      await decisionService.create(decisionId, {
        userId,
        title: "Database Choice",
        context: "SaaS project requirements",
        optionsConsidered: ["Firebase", "Supabase"],
        chosenOption: "Firebase",
        rationale: "Already using it",
      });

      const decision = await decisionService.getById(decisionId);
      expect(decision).not.toBeNull();
      expect(decision?.chosenOption).toBe("Firebase");
    });
  });

  describe("Workspace Service", () => {
    it("should successfully create a workspace and seed default checklists", async () => {
      const workspaceId = "ws-test-123";
      await workspaceService.createWorkspace(workspaceId, {
        userId: "test-user-id",
        name: "Service Test Workspace",
        workspaceType: "product",
        status: "active",
        summary: "A product workspace summary",
        stage: "validation",
        risk: "low",
      });

      const retrieved = await workspaceService.getWorkspaceById(workspaceId);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe("Service Test Workspace");
      expect(retrieved?.workspaceType).toBe("product");
      expect(retrieved?.checklists).toBeDefined();
      expect(retrieved?.checklists.validation).toBeDefined();
      expect(retrieved?.checklists.validation.length).toBe(4);
      expect(retrieved?.readinessScore).toBe(0);
    });

    it("should toggle a checklist item and update the readinessScore correctly", async () => {
      const workspaceId = "ws-test-toggle";
      await workspaceService.createWorkspace(workspaceId, {
        userId: "test-user-id",
        name: "Toggle Test Workspace",
        workspaceType: "product",
        status: "active",
        summary: "Workspace toggle testing",
        stage: "validation",
        risk: "low",
      });

      // Toggle first item to completed
      const updated = await workspaceService.toggleChecklistItem(workspaceId, "validation", "v1", true);
      expect(updated.checklists.validation[0].completed).toBe(true);
      expect(updated.checklists.validation[0].completedAt).toBeTypeOf("number");
      expect(updated.readinessScore).toBe(25); // 1 of 4 is 25%

      // Toggle back to false
      const updated2 = await workspaceService.toggleChecklistItem(workspaceId, "validation", "v1", false);
      expect(updated2.checklists.validation[0].completed).toBe(false);
      expect(updated2.checklists.validation[0].completedAt).toBeUndefined();
      expect(updated2.readinessScore).toBe(0);
    });
  });

  describe("Signal Service", () => {
    it("should successfully create a signal and list signals by workspace", async () => {
      const signalId = "sig-service-123";
      await signalService.createSignal(signalId, {
        userId: "test-user-id",
        workspaceId: "workspace-abc",
        title: "Database Error",
        description: "Firestore transaction timeout",
        category: "error",
        severity: "high",
        status: "new",
        source: "sentry"
      });

      const retrieved = await signalService.getSignalById(signalId);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.title).toBe("Database Error");

      const list = await signalService.listSignalsByWorkspace("workspace-abc");
      expect(list.length).toBe(1);
      expect(list[0].id).toBe(signalId);
    });
  });

  describe("Opportunity Service", () => {
    it("should successfully create an opportunity and list opportunities by workspace", async () => {
      const oppId = "opp-service-123";
      await opportunityService.createOpportunity(oppId, {
        userId: "test-user-id",
        workspaceId: "workspace-abc",
        title: "Enable CDN Caching",
        description: "Cache static assets",
        status: "open",
        category: "performance",
        score: 75,
        scoringBreakdown: {
          impact: 4,
          confidence: 4,
          effort: 1,
          explanation: "Low effort, high impact"
        },
        sourceSignalIds: ["sig-service-123"]
      });

      const retrieved = await opportunityService.getOpportunityById(oppId);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.title).toBe("Enable CDN Caching");

      const list = await opportunityService.listOpportunitiesByWorkspace("workspace-abc");
      expect(list.length).toBe(1);
      expect(list[0].id).toBe(oppId);
    });
  });
});
