import type { WorkspaceType, WorkspaceChecklistItem, WorkflowType } from "@/types";

/**
 * Calculates a workspace stage readiness score.
 * Explanability: A simple percentage of completed items divided by total items.
 */
export function calculateReadinessScore(items: WorkspaceChecklistItem[]): number {
  if (!items || items.length === 0) return 0;
  const completedCount = items.filter((item) => item.completed).length;
  return Math.round((completedCount / items.length) * 100);
}

/**
 * Deterministically recommends the next workflow to run based on workspace type and stage.
 * Can be easily extended with AI/agent logic later.
 */
export function getRecommendedWorkflow(
  workspaceType: WorkspaceType,
  stage: string
): WorkflowType | null {
  if (workspaceType === "product") {
    switch (stage) {
      case "validation":
        return "validate_idea";
      case "spec":
        return "scope_mvp";
      case "build":
        return "sprint_plan";
      case "launch":
        return "launch_prep";
      case "growth":
        return "optimize_product";
      default:
        return null;
    }
  } else if (workspaceType === "client") {
    switch (stage) {
      case "discovery":
        return "discovery_prep";
      case "proposal":
        return "proposal_draft";
      case "delivery":
        return "delivery_update";
      case "launch":
        return "launch_prep";
      case "support":
        return "optimize_product";
      default:
        return null;
    }
  }
  return null;
}

/**
 * Returns a human-friendly description of why a workflow is recommended.
 */
export function getWorkflowRecommendationReason(workflowType: WorkflowType): string {
  switch (workflowType) {
    case "validate_idea":
      return "Validate your product concept, assess competitor landscapes, and verify target ICP pain points.";
    case "scope_mvp":
      return "Draft comprehensive MVP features, scope technical parameters, and align system architectures.";
    case "sprint_plan":
      return "Plan your implementation sprints, prioritize backlog items, and assign developer roles.";
    case "launch_prep":
      return "Configure telemetry monitoring, draft announcement copy, and manage deployment steps.";
    case "optimize_product":
      return "Evaluate telemetry alerts, post-launch feedback, and scope potential feature enhancements.";
    case "discovery_prep":
      return "Identify client business pain points, qualify leads, and outline project discovery templates.";
    case "proposal_draft":
      return "Formulate implementation estimates, draft scope agreements, and structure budget options.";
    case "delivery_update":
      return "Prepare progress reporting, assess scope adjustments, and review qa/deliverable milestones.";
    default:
      return "Run active playbook guidelines or custom workflows tailored to this project phase.";
  }
}
