// ─────────────────────────────────────────────────────────────
// Save Actions Mapper — Mission Control AI
// Converts validated workflow outputs into concrete SaveAction
// objects that the frontend can present as one-click persist buttons.
// ─────────────────────────────────────────────────────────────

import type {
  AllWorkflowId,
  SaveAction,
  IdeaToMvpOutput,
  MvpToTechnicalPlanOutput,
  FeatureToBuildPlanOutput,
  LeadToProposalOutput,
  WeeklyReviewOutput,
  ValidateIdeaOutput,
  LaunchPrepOutput,
  DeliveryUpdateOutput,
  OptimizeProductOutput,
  AnalyzeSignalsOutput,
  WorkflowOutput,
} from "./types";

/**
 * Takes a validated workflow output and produces an array of
 * SaveAction objects — each representing a concrete Firestore
 * write the user can trigger from the UI.
 */
export function mapSaveActions(
  workflowId: AllWorkflowId,
  output: WorkflowOutput,
  projectId?: string, // functions as workspaceId for V1.1 workflows
  leadId?: string,
  agentRunId?: string
): SaveAction[] {
  const mappers: Record<AllWorkflowId, () => SaveAction[]> = {
    idea_to_mvp: () => mapIdeaToMvpActions(output as IdeaToMvpOutput),
    mvp_to_technical_plan: () => mapMvpToTechnicalPlanActions(output as MvpToTechnicalPlanOutput, projectId),
    feature_to_build_plan: () => mapFeatureToBuildPlanActions(output as FeatureToBuildPlanOutput, projectId),
    lead_to_proposal: () => mapLeadToProposalActions(output as LeadToProposalOutput, leadId, projectId),
    weekly_review: () => mapWeeklyReviewActions(output as WeeklyReviewOutput),
    validate_idea: () => mapValidateIdeaActions(output as ValidateIdeaOutput, projectId),
    launch_prep: () => mapLaunchPrepActions(output as LaunchPrepOutput, projectId),
    delivery_update: () => mapDeliveryUpdateActions(output as DeliveryUpdateOutput, projectId),
    optimize_product: () => mapOptimizeProductActions(output as OptimizeProductOutput, projectId),
    analyze_signals: () => mapAnalyzeSignalsActions(output as AnalyzeSignalsOutput, projectId),
  };


  let actions = mappers[workflowId]();

  // Attach agentRunId as sourceRunId for traceability
  if (agentRunId) {
    actions = actions.map(action => ({
      ...action,
      payload: {
        ...action.payload,
        sourceRunId: agentRunId,
      }
    }));
  }

  return actions;
}

// ── Per-Workflow Mappers ─────────────────────────────────────

function mapIdeaToMvpActions(output: IdeaToMvpOutput): SaveAction[] {
  const actions: SaveAction[] = [];

  // Action 1: Create a new project from the MVP scope
  actions.push({
    key: "create_project",
    label: "Create Project",
    collection: "projects",
    payload: {
      name: output.projectName,
      type: "product",
      status: "active",
      summary: output.mvpScope,
      targetUser: output.targetUser,
      problem: output.problemStatement,
      phase: "spec",
      stack: output.suggestedStack,
      currentFocus: output.nextSteps[0] ?? "Define MVP scope",
      risk: output.risks.length > 3 ? "high" : output.risks.length > 1 ? "medium" : "low",
    },
  });

  // Action 2: Create starter tasks from nextSteps
  output.nextSteps.forEach((step, i) => {
    actions.push({
      key: `create_task_${i}`,
      label: `Create Task: ${step.slice(0, 50)}`,
      collection: "tasks",
      payload: {
        title: step,
        type: "feature",
        priority: i === 0 ? "high" : "medium",
        status: "todo",
      },
    });
  });

  return actions;
}

function mapMvpToTechnicalPlanActions(output: MvpToTechnicalPlanOutput, projectId?: string): SaveAction[] {
  const actions: SaveAction[] = [];

  // Action 1: Save architecture decisions
  output.techDecisions.forEach((td, i) => {
    actions.push({
      key: `save_decision_${i}`,
      label: `Save Decision: ${td.decision.slice(0, 50)}`,
      collection: "decisions",
      payload: {
        title: td.decision,
        projectId,
        context: `Architecture planning for technical plan`,
        optionsConsidered: td.alternatives,
        chosenOption: td.decision,
        rationale: td.rationale,
      },
    });
  });

  // Action 2: Create implementation tasks
  output.implementationOrder.forEach((step, i) => {
    actions.push({
      key: `create_impl_task_${i}`,
      label: `Create Task: ${step.slice(0, 50)}`,
      collection: "tasks",
      payload: {
        title: step,
        projectId,
        type: "feature",
        priority: i < 2 ? "high" : "medium",
        status: "todo",
      },
    });
  });

  return actions;
}

function mapFeatureToBuildPlanActions(output: FeatureToBuildPlanOutput, projectId?: string): SaveAction[] {
  const actions: SaveAction[] = [];

  // Create a task for each item in the build plan
  output.tasks.forEach((task, i) => {
    actions.push({
      key: `create_task_${i}`,
      label: `Create Task: ${task.title.slice(0, 50)}`,
      collection: "tasks",
      payload: {
        title: task.title,
        description: task.description,
        projectId,
        type: task.type,
        priority: task.priority,
        estimateHours: task.estimateHours,
        status: "todo",
      },
    });
  });

  // Action 2: Save as a reusable Playbook
  actions.push({
    key: "save_playbook",
    label: "Save as Playbook",
    collection: "playbooks",
    payload: {
      title: output.featureSummary.substring(0, 50),
      category: "Feature Implementation",
      summary: output.featureSummary,
      tags: output.riskFlags ?? [],
      steps: output.tasks.map(t => t.title),
      checklist: output.acceptanceCriteria ?? [],
      promptTemplate: "Use this playbook to guide similar feature development in the future."
    }
  });

  return actions;
}

function mapLeadToProposalActions(output: LeadToProposalOutput, leadId?: string, projectId?: string): SaveAction[] {
  return [
    {
      key: "create_proposal",
      label: "Save Proposal Draft",
      collection: "proposals",
      payload: {
        leadId: leadId ?? "",
        projectId: projectId,
        title: output.proposalTitle,
        status: "draft",
        problemSummary: output.problemSummary,
        scope: output.scope,
        deliverables: output.deliverables,
        timeline: output.timeline,
        pricing: output.pricing,
        assumptions: output.assumptions,
        risks: output.risks,
      },
    },
  ];
}

function mapWeeklyReviewActions(output: WeeklyReviewOutput): SaveAction[] {
  const actions: SaveAction[] = [];

  // Create goals for next week
  output.suggestedGoals.forEach((goal, i) => {
    actions.push({
      key: `create_goal_${i}`,
      label: `Create Goal: ${goal.slice(0, 50)}`,
      collection: "goals",
      payload: {
        title: goal,
        type: "weekly",
        status: "active",
        progress: 0,
      },
    });
  });

  // Save learnings as memories
  output.learnings.forEach((learning, i) => {
    actions.push({
      key: `save_learning_${i}`,
      label: `Save Learning: ${learning.slice(0, 50)}`,
      collection: "memories",
      payload: {
        type: "learning",
        content: learning,
        confidence: 80,
        tags: ["weekly_review"],
      },
    });
  });

  return actions;
}

function mapValidateIdeaActions(output: ValidateIdeaOutput, workspaceId?: string): SaveAction[] {
  return [
    {
      key: "advance_stage_validation",
      label: "Update Lifecycle Stage (Spec)",
      collection: "workspaces",
      payload: {
        id: workspaceId ?? "",
        stage: "spec",
      },
    },
    {
      key: "create_task_validation",
      label: "Create User Interview Task",
      collection: "tasks",
      payload: {
        title: "Conduct 5 user interviews",
        type: "research",
        priority: "medium",
        description: "Draft interview guide and interview 5 developers on how they prioritize tasks daily.",
        workspaceId: workspaceId ?? "",
      },
    },
  ];
}

function mapLaunchPrepActions(output: LaunchPrepOutput, workspaceId?: string): SaveAction[] {
  return [
    {
      key: "advance_stage_launch",
      label: "Update Lifecycle Stage (Growth)",
      collection: "workspaces",
      payload: {
        id: workspaceId ?? "",
        stage: "growth",
      },
    },
    {
      key: "create_task_launch",
      label: "Create Deployment Task",
      collection: "tasks",
      payload: {
        title: "Deploy production build on Vercel",
        type: "chore",
        priority: "high",
        description: "Deploy to production, configure custom domain, and bind environment variables.",
        workspaceId: workspaceId ?? "",
      },
    },
  ];
}

function mapDeliveryUpdateActions(output: DeliveryUpdateOutput, workspaceId?: string): SaveAction[] {
  return [
    {
      key: "save_decision_delivery",
      label: "Save Handoff Decision",
      collection: "decisions",
      payload: {
        title: "Approve Client Phase 2 Milestones",
        context: "Client review session on May 31",
        chosenOption: "Approved & Handoff completed",
        rationale: output.sprintStatusSummary,
        optionsConsidered: ["Approve with minor fixes", "Full delay for minor changes"],
        tradeoffs: "Closing sprint early frees capacity, but minor CSS fixes will need post-launch chore logging.",
        workspaceId: workspaceId ?? "",
      },
    },
  ];
}

function mapOptimizeProductActions(output: OptimizeProductOutput, workspaceId?: string): SaveAction[] {
  return [
    {
      key: "create_opp_improvement",
      label: "Create Bundle Opportunity",
      collection: "opportunities",
      payload: {
        title: "Optimize Landing Page Bundle Sizing",
        description: output.optimizationCandidates[0] ?? "Compress landing page bundle size.",
        category: "performance",
        score: 60,
        scoringBreakdown: {
          impact: 4,
          confidence: 3,
          effort: 2,
          explanation: "Priority score of 60/100 calculated from: High Impact (4), Medium Confidence (3), and Low Effort (2).",
        },
        sourceSignalIds: [],
        workspaceId: workspaceId ?? "",
      },
    },
  ];
}

function mapAnalyzeSignalsActions(output: AnalyzeSignalsOutput, workspaceId?: string): SaveAction[] {
  return [
    {
      key: "create_signal_analyst",
      label: "Create Memory Signal",
      collection: "signals",
      payload: {
        title: "High memory usage in render loop",
        description: output.triageReport,
        category: "performance",
        severity: "high",
        source: "posthog",
        workspaceId: workspaceId ?? "",
      },
    },
    {
      key: "save_playbook_analyst",
      label: "Save Triage Playbook",
      collection: "playbooks",
      payload: {
        title: "Memory Heap Triage Guide",
        category: "telemetry",
        summary: "Step-by-step debug flow for memory leak issues.",
        steps: [
          "Open Chrome DevTools Performance Profiler",
          "Identify garbage collection memory retainers",
          "Check clean-up triggers in useEffect dependencies",
        ],
        checklist: ["Check event listeners", "Verify timer disposal"],
        promptTemplate: "Analyze the following heap snapshot trace to find leaks...",
        workspaceId: workspaceId ?? "",
      },
    },
  ];
}

