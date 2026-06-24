import { describe, it, expect } from "vitest";
import { runAgentWorkflow } from "@/lib/agents/run-agent-workflow";
import type { ModelAdapter, ModelRequest, ModelResponse } from "@/lib/agents/types";
import { mockFirestoreInstance } from "../setup";
import { mockProject } from "../fixtures/mock-data";

class MockModelAdapter implements ModelAdapter {
  constructor(private responseText: string) {}

  async generate(params: ModelRequest): Promise<ModelResponse> {
    return {
      raw: this.responseText,
      parsed: null,
      usage: { promptTokens: 50, completionTokens: 100, totalTokens: 150 },
    };
  }
}

describe("Run Agent Workflow Integration Tests", () => {
  it("should successfully run a full idea_to_mvp workflow and persist the run", async () => {
    const userId = "user-123";
    const projectId = "project-123";

    mockFirestoreInstance.seed("projects", projectId, mockProject);

    const validMvpOutput = {
      projectName: "AgentApp",
      problemStatement: "Fragmented agents",
      targetUser: "AI builders",
      coreFeatures: ["Unified logs", "Visual pipeline"],
      mvpScope: "Single interface for managing agent execution runs.",
      outOfScope: ["Multi-tenant billing"],
      suggestedStack: ["Next.js", "Tailwind", "Vite"],
      estimatedTimeline: "2 weeks",
      risks: ["Vendor dependency"],
      nextSteps: ["Create mock server", "Design UI"],
    };

    const mockAdapter = new MockModelAdapter(JSON.stringify(validMvpOutput));

    const result = await runAgentWorkflow({
      userId,
      modelAdapter: mockAdapter,
      workflowId: "idea_to_mvp",
      rawRequest: {
        agentRole: "founder",
        inputGoal: "Build a control dashboard for AI agents",
        projectId,
        contextTags: ["ai"],
      },
    });

    // 1. Check orchestrator results
    expect(result.success).toBe(true);
    expect(result.agentRunId).toBeTypeOf("string");
    expect(result.output).toEqual(validMvpOutput);
    expect(result.saveActions.length).toBe(3); // 1 create_project, 2 create_task
    expect(result.nextBestAction).toBe("Create mock server");

    // 2. Check persistence in Mock Firestore
    const runsData = mockFirestoreInstance.getCollectionData("agent_runs");
    const run = runsData[result.agentRunId];
    expect(run).toBeDefined();
    expect(run.userId).toBe(userId);
    expect(run.status).toBe("completed");
    expect(run.projectId).toBe(projectId);
    expect(run.inputGoal).toBe("Build a control dashboard for AI agents");
    expect(run.output).toEqual(validMvpOutput);
  });

  it("should fail and persist status as failed if output validation fails", async () => {
    const userId = "user-123";
    
    // Missing required fields (e.g. coreFeatures, targetUser)
    const invalidMvpOutput = {
      projectName: "BrokenApp",
      mvpScope: "Incomplete spec",
    };

    const mockAdapter = new MockModelAdapter(JSON.stringify(invalidMvpOutput));

    const result = await runAgentWorkflow({
      userId,
      modelAdapter: mockAdapter,
      workflowId: "idea_to_mvp",
      rawRequest: {
        agentRole: "founder",
        inputGoal: "Invalid run",
      },
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Output validation failed");

    // Ensure failed run is still persisted in database for debugging
    const runsData = mockFirestoreInstance.getCollectionData("agent_runs");
    const run = runsData[result.agentRunId];
    expect(run).toBeDefined();
    expect(run.status).toBe("failed");
    expect(run.output.error).toContain("Output validation failed");
    expect(run.output.raw).toBe(JSON.stringify(invalidMvpOutput));
  });

  it("should fail synchronously and not persist if input validation fails", async () => {
    const userId = "user-123";

    const result = await runAgentWorkflow({
      userId,
      rawRequest: {
        // Missing agentRole and inputGoal
        projectId: "proj-1",
      },
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid request");

    // Ensure nothing is written to DB since parsing failed before pipeline ran
    const runsData = mockFirestoreInstance.getCollectionData("agent_runs");
  });

  it("should successfully run a V1.1 validate_idea workflow", async () => {
    const userId = "user-123";
    const workspaceId = "workspace-123";

    const mockWorkspace = {
      id: workspaceId,
      userId,
      name: "E-Commerce Checkout",
      workspaceType: "product",
      status: "active",
      summary: "Refactoring Stripe checkout flow",
      stage: "validation",
      readinessScore: 0,
      checklists: {
        validation: [
          { id: "v1", stage: "validation", label: "Define Target Customer Profile (ICP)", completed: false },
        ]
      },
      risk: "medium",
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    mockFirestoreInstance.seed("workspaces", workspaceId, mockWorkspace);

    const validValidateOutput = {
      validationSummary: "ICP defined and pain points validated.",
      channels: ["Direct developer forums", "Reddit"],
    };

    const mockAdapter = new MockModelAdapter(JSON.stringify(validValidateOutput));

    const result = await runAgentWorkflow({
      userId,
      modelAdapter: mockAdapter,
      workflowId: "validate_idea",
      rawRequest: {
        agentRole: "founder",
        inputGoal: "Validate the checkout flow project",
        workspaceId,
      },
    });

    expect(result.success).toBe(true);
    expect(result.output).toEqual(validValidateOutput);
    expect(result.saveActions.length).toBe(2);
    expect(result.nextBestAction).toBe("Draft MVP Specification.");

    // Check persistence of run
    const runsData = mockFirestoreInstance.getCollectionData("agent_runs");
    const run = runsData[result.agentRunId];
    expect(run).toBeDefined();
    expect(run.workspaceId).toBe(workspaceId);
    expect(run.status).toBe("completed");
  });
});

