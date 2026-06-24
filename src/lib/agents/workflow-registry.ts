// ─────────────────────────────────────────────────────────────
// Workflow Registry — Mission Control AI
// Maps V1 workflow IDs to their metadata, agent role, and
// corresponding WorkflowType enum value for persistence.
// ─────────────────────────────────────────────────────────────

import type { WorkflowDefinition, AllWorkflowId } from "./types";

export const WORKFLOW_REGISTRY: Record<AllWorkflowId, WorkflowDefinition> = {
  idea_to_mvp: {
    id: "idea_to_mvp",
    agentRole: "founder",
    workflowType: "scope_mvp",
    label: "Idea → MVP Scope",
    description: "Take a raw product idea and scope it into a concrete MVP with features, stack, and timeline.",
  },
  mvp_to_technical_plan: {
    id: "mvp_to_technical_plan",
    agentRole: "architect",
    workflowType: "design_architecture",
    label: "MVP → Technical Plan",
    description: "Transform an MVP spec into a full technical architecture with components, data models, and API design.",
  },
  feature_to_build_plan: {
    id: "feature_to_build_plan",
    agentRole: "builder",
    workflowType: "sprint_plan",
    label: "Feature → Build Plan",
    description: "Break a feature down into prioritised, estimable tasks with acceptance criteria.",
  },
  lead_to_proposal: {
    id: "lead_to_proposal",
    agentRole: "freelance",
    workflowType: "proposal_draft",
    label: "Lead → Proposal",
    description: "Generate a professional client proposal from lead context, pain points, and budget signals.",
  },
  weekly_review: {
    id: "weekly_review",
    agentRole: "execution",
    workflowType: "retrospective",
    label: "Weekly Review",
    description: "Summarise the past week, surface blockers, extract learnings, and plan priorities for next week.",
  },
  validate_idea: {
    id: "validate_idea",
    agentRole: "founder",
    workflowType: "validate_idea",
    label: "Validate Product Idea",
    description: "Analyze market positioning, target personas, and validation metrics.",
  },
  launch_prep: {
    id: "launch_prep",
    agentRole: "builder",
    workflowType: "launch_prep",
    label: "Product Launch Prep",
    description: "Generate pre-launch safety checklists and multi-channel launch checklists.",
  },
  delivery_update: {
    id: "delivery_update",
    agentRole: "freelance",
    workflowType: "delivery_update",
    label: "Client Delivery Update",
    description: "Generate client-friendly progress updates and document changes.",
  },
  optimize_product: {
    id: "optimize_product",
    agentRole: "builder",
    workflowType: "optimize_product",
    label: "Identify Product Improvements",
    description: "Structure performance, cost, and quality candidate improvements.",
  },
  analyze_signals: {
    id: "analyze_signals",
    agentRole: "execution",
    workflowType: "analyze_signals",
    label: "Analyze Telemetry Signals",
    description: "Scans active logs and recommends resolutions or conversion candidates.",
  },
};

export function getWorkflowDefinition(id: AllWorkflowId): WorkflowDefinition {
  const def = WORKFLOW_REGISTRY[id];
  if (!def) {
    throw new Error(`Unknown workflow: ${id}`);
  }
  return def;
}

export function isV1WorkflowId(value: string): value is AllWorkflowId {
  return value in WORKFLOW_REGISTRY;
}

