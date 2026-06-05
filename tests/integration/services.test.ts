import { describe, it, expect } from "vitest";
import { projectService } from "@/lib/services/project.service";
import { decisionService } from "@/lib/services/decision.service";
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
});
