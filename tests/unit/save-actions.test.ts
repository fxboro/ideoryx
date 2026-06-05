import { describe, it, expect } from "vitest";
import { mapSaveActions } from "@/lib/agents/save-actions";
import type {
  IdeaToMvpOutput,
  MvpToTechnicalPlanOutput,
  FeatureToBuildPlanOutput,
  LeadToProposalOutput,
  WeeklyReviewOutput,
} from "@/lib/agents/types";

describe("Save Actions Mapper Unit Tests", () => {
  describe("Idea to MVP Mapper", () => {
    it("should generate a project creation action and starter tasks", () => {
      const output: IdeaToMvpOutput = {
        projectName: "ProductivityHub",
        problemStatement: " Scattered tools",
        targetUser: "Professionals",
        coreFeatures: ["Notes", "Calendar"],
        mvpScope: "Build basic notes editor with calendar integration.",
        outOfScope: ["Collaboration"],
        suggestedStack: ["Next.js", "Tailwind"],
        estimatedTimeline: "3 weeks",
        risks: ["Scope creep"],
        nextSteps: ["Initialize repository", "Configure Database"],
      };

      const actions = mapSaveActions("idea_to_mvp", output, undefined, undefined, "run-123");
      
      expect(actions.length).toBe(3); // 1 create_project + 2 create_task
      
      const projectAction = actions.find(a => a.key === "create_project");
      expect(projectAction).toBeDefined();
      expect(projectAction?.collection).toBe("projects");
      expect(projectAction?.payload.name).toBe("ProductivityHub");
      expect(projectAction?.payload.sourceRunId).toBe("run-123");
      
      const taskAction0 = actions.find(a => a.key === "create_task_0");
      expect(taskAction0).toBeDefined();
      expect(taskAction0?.collection).toBe("tasks");
      expect(taskAction0?.payload.title).toBe("Initialize repository");
    });
  });

  describe("MVP to Technical Plan Mapper", () => {
    it("should generate save decision actions and implementation tasks", () => {
      const output: MvpToTechnicalPlanOutput = {
        architectureOverview: "Serverless web app",
        components: [{ name: "API", responsibility: "Process data", techChoice: "Next.js API Routes" }],
        dataModel: [{ entity: "User", fields: ["id", "email"], relationships: "1:N with Tasks" }],
        apiEndpoints: [{ method: "POST", path: "/api/user", description: "Create user" }],
        deploymentStrategy: "Vercel",
        techDecisions: [
          { decision: "Use Vitest", rationale: " ESM support and speed", alternatives: ["Jest", "Mocha"] }
        ],
        implementationOrder: ["Setup project structure", "Configure DB schema"],
        risks: ["Cold starts"],
      };

      const actions = mapSaveActions("mvp_to_technical_plan", output, "project-xyz");

      const decisionAction = actions.find(a => a.key === "save_decision_0");
      expect(decisionAction).toBeDefined();
      expect(decisionAction?.collection).toBe("decisions");
      expect(decisionAction?.payload.projectId).toBe("project-xyz");
      expect(decisionAction?.payload.title).toBe("Use Vitest");

      const taskAction = actions.find(a => a.key === "create_impl_task_0");
      expect(taskAction).toBeDefined();
      expect(taskAction?.collection).toBe("tasks");
      expect(taskAction?.payload.title).toBe("Setup project structure");
    });
  });

  describe("Feature to Build Plan Mapper", () => {
    it("should generate task creation actions and a save playbook action", () => {
      const output: FeatureToBuildPlanOutput = {
        featureSummary: "Implement user authentication with Firebase",
        tasks: [
          { title: "Install firebase-admin", description: "Run npm install", type: "chore", priority: "high", estimateHours: 1, dependencies: [] }
        ],
        acceptanceCriteria: ["User can sign in", "User can sign out"],
        techNotes: "Use standard cookies",
        riskFlags: ["auth-security"],
      };

      const actions = mapSaveActions("feature_to_build_plan", output, "project-123");

      const taskAction = actions.find(a => a.key === "create_task_0");
      expect(taskAction).toBeDefined();
      expect(taskAction?.collection).toBe("tasks");
      expect(taskAction?.payload.estimateHours).toBe(1);

      const playbookAction = actions.find(a => a.key === "save_playbook");
      expect(playbookAction).toBeDefined();
      expect(playbookAction?.collection).toBe("playbooks");
      expect(playbookAction?.payload.title).toContain("Implement user authentication");
    });
  });

  describe("Lead to Proposal Mapper", () => {
    it("should generate a single proposal draft action", () => {
      const output: LeadToProposalOutput = {
        proposalTitle: "E-Commerce Upgrade",
        problemSummary: "Current Shopify site is slow.",
        proposedSolution: "Custom Next.js headless commerce setup.",
        scope: "Build checkout and product pages",
        deliverables: ["Product detail page", "Stripe payment logic"],
        timeline: "4 weeks",
        pricing: "$8,000",
        assumptions: "Client provides all product data",
        risks: "API delays",
      };

      const actions = mapSaveActions("lead_to_proposal", output, undefined, "lead-456");

      expect(actions.length).toBe(1);
      expect(actions[0].key).toBe("create_proposal");
      expect(actions[0].collection).toBe("proposals");
      expect(actions[0].payload.leadId).toBe("lead-456");
      expect(actions[0].payload.title).toBe("E-Commerce Upgrade");
    });
  });

  describe("Weekly Review Mapper", () => {
    it("should generate goal creation and learning memory actions", () => {
      const output: WeeklyReviewOutput = {
        weekSummary: "Done with auth integration.",
        completedItems: ["Installed packages"],
        inProgressItems: [],
        blockers: [],
        learnings: ["Vitest configuration was easy"],
        nextWeekPriorities: ["Write API tests"],
        suggestedGoals: ["Reach 100% test coverage"],
        overallMomentum: "steady",
        learningTarget: "Firebase rules",
      };

      const actions = mapSaveActions("weekly_review", output);

      const goalAction = actions.find(a => a.key === "create_goal_0");
      expect(goalAction).toBeDefined();
      expect(goalAction?.collection).toBe("goals");
      expect(goalAction?.payload.title).toBe("Reach 100% test coverage");

      const memoryAction = actions.find(a => a.key === "save_learning_0");
      expect(memoryAction).toBeDefined();
      expect(memoryAction?.collection).toBe("memories");
      expect(memoryAction?.payload.content).toBe("Vitest configuration was easy");
    });
  });
});
