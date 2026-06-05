import { describe, it, expect } from "vitest";
import { buildAgentContext } from "@/lib/agents/context-builder";
import { mockFirestoreInstance } from "../setup";
import {
  mockProject,
  mockTask,
  mockGoal,
  mockLead,
  mockDecision,
  mockAgentRun,
  mockLearningItem,
  mockMemory,
} from "../fixtures/mock-data";

describe("Context Builder Integration Tests", () => {
  it("should assemble context for a standard project workflow", async () => {
    const userId = "test-user-id";
    const projectId = "project-1";

    // 1. Seed Firestore with project-specific data
    mockFirestoreInstance.seed("projects", projectId, mockProject);
    mockFirestoreInstance.seed("tasks", "task-1", mockTask);
    mockFirestoreInstance.seed("goals", "goal-1", mockGoal);
    mockFirestoreInstance.seed("memories", "memory-1", mockMemory);

    const context = await buildAgentContext({
      userId,
      workflowId: "idea_to_mvp",
      request: {
        agentRole: "founder",
        inputGoal: "Evaluate AI capability",
        projectId,
        contextTags: ["design"],
      },
    });

    expect(context.project).not.toBeNull();
    expect(context.project?.id).toBe(projectId);
    expect(context.tasks.length).toBe(1);
    expect(context.tasks[0].id).toBe("task-1");
    expect(context.goals.length).toBe(1);
    expect(context.memories.length).toBe(1);
    expect(context.memories[0].id).toBe("memory-1");
    expect(context.lead).toBeNull(); // No leadId passed
  });

  it("should assemble context for a freelance workflow with lead", async () => {
    const userId = "test-user-id";
    const leadId = "lead-1";

    mockFirestoreInstance.seed("leads", leadId, mockLead);
    mockFirestoreInstance.seed("goals", "goal-1", mockGoal);

    const context = await buildAgentContext({
      userId,
      workflowId: "lead_to_proposal",
      request: {
        agentRole: "freelance",
        inputGoal: "Create a proposal for John",
        leadId,
      },
    });

    expect(context.lead).not.toBeNull();
    expect(context.lead?.id).toBe(leadId);
    expect(context.lead?.businessName).toBe("Acme Corp");
    expect(context.project).toBeNull();
  });

  it("should assemble complete context for the weekly_review workflow", async () => {
    const userId = "test-user-id";

    // Seed all collections
    mockFirestoreInstance.seed("tasks", "task-1", mockTask);
    mockFirestoreInstance.seed("decisions", "decision-1", mockDecision);
    mockFirestoreInstance.seed("agent_runs", "run-1", mockAgentRun);
    mockFirestoreInstance.seed("learning_items", "learning-1", mockLearningItem);
    mockFirestoreInstance.seed("goals", "goal-1", mockGoal);
    mockFirestoreInstance.seed("memories", "memory-1", mockMemory);

    const context = await buildAgentContext({
      userId,
      workflowId: "weekly_review",
      request: {
        agentRole: "execution",
        inputGoal: "Prepare retrospective for last week",
      },
    });

    expect(context.tasks.length).toBe(1);
    expect(context.decisions?.length).toBe(1);
    expect(context.decisions?.[0].id).toBe("decision-1");
    expect(context.agentRuns?.length).toBe(1);
    expect(context.agentRuns?.[0].id).toBe("run-1");
    expect(context.learningItems?.length).toBe(1);
    expect(context.learningItems?.[0].id).toBe("learning-1");
    expect(context.goals.length).toBe(1);
    expect(context.memories.length).toBe(1);
  });
});
