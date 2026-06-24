// ─────────────────────────────────────────────────────────────
// Output Validator — Mission Control AI
// Zod schemas for each workflow's structured output.
// Validates the raw model response into typed, safe data.
// ─────────────────────────────────────────────────────────────

import { z } from "zod";
import type { AllWorkflowId } from "./types";

// ── Per-Workflow Output Schemas ──────────────────────────────

export const ideaToMvpOutputSchema = z.object({
  projectName: z.string(),
  problemStatement: z.string(),
  targetUser: z.string(),
  coreFeatures: z.array(z.string()),
  mvpScope: z.string(),
  outOfScope: z.array(z.string()),
  suggestedStack: z.array(z.string()),
  estimatedTimeline: z.string(),
  risks: z.array(z.string()),
  nextSteps: z.array(z.string()),
});

export const mvpToTechnicalPlanOutputSchema = z.object({
  architectureOverview: z.string(),
  components: z.array(z.object({
    name: z.string(),
    responsibility: z.string(),
    techChoice: z.string(),
  })),
  dataModel: z.array(z.object({
    entity: z.string(),
    fields: z.array(z.string()),
    relationships: z.string(),
  })),
  apiEndpoints: z.array(z.object({
    method: z.string(),
    path: z.string(),
    description: z.string(),
  })),
  deploymentStrategy: z.string(),
  techDecisions: z.array(z.object({
    decision: z.string(),
    rationale: z.string(),
    alternatives: z.array(z.string()),
  })),
  implementationOrder: z.array(z.string()),
  risks: z.array(z.string()),
});

export const featureToBuildPlanOutputSchema = z.object({
  featureSummary: z.string(),
  tasks: z.array(z.object({
    title: z.string(),
    description: z.string(),
    type: z.string(),
    priority: z.string(),
    estimateHours: z.number(),
    dependencies: z.array(z.string()),
  })),
  acceptanceCriteria: z.array(z.string()),
  techNotes: z.string(),
  riskFlags: z.array(z.string()),
});

export const leadToProposalOutputSchema = z.object({
  proposalTitle: z.string(),
  problemSummary: z.string(),
  proposedSolution: z.string(),
  scope: z.string(),
  deliverables: z.array(z.string()),
  timeline: z.string(),
  pricing: z.string(),
  assumptions: z.string(),
  risks: z.string(),
});

export const weeklyReviewOutputSchema = z.object({
  weekSummary: z.string(),
  completedItems: z.array(z.string()),
  inProgressItems: z.array(z.string()),
  blockers: z.array(z.string()),
  learnings: z.array(z.string()),
  nextWeekPriorities: z.array(z.string()),
  suggestedGoals: z.array(z.string()),
  overallMomentum: z.enum(["strong", "steady", "slow", "stalled"]),
  learningTarget: z.string(),
});

export const validateIdeaOutputSchema = z.object({
  validationSummary: z.string(),
  channels: z.array(z.string()),
});

export const launchPrepOutputSchema = z.object({
  launchChecklist: z.array(z.string()),
});

export const deliveryUpdateOutputSchema = z.object({
  sprintStatusSummary: z.string(),
});

export const optimizeProductOutputSchema = z.object({
  optimizationCandidates: z.array(z.string()),
});

export const analyzeSignalsOutputSchema = z.object({
  triageReport: z.string(),
});

// ── Schema Registry ──────────────────────────────────────────

const OUTPUT_SCHEMAS: Record<AllWorkflowId, z.ZodSchema> = {
  idea_to_mvp: ideaToMvpOutputSchema,
  mvp_to_technical_plan: mvpToTechnicalPlanOutputSchema,
  feature_to_build_plan: featureToBuildPlanOutputSchema,
  lead_to_proposal: leadToProposalOutputSchema,
  weekly_review: weeklyReviewOutputSchema,
  validate_idea: validateIdeaOutputSchema,
  launch_prep: launchPrepOutputSchema,
  delivery_update: deliveryUpdateOutputSchema,
  optimize_product: optimizeProductOutputSchema,
  analyze_signals: analyzeSignalsOutputSchema,
};

export function getOutputSchema(workflowId: AllWorkflowId): z.ZodSchema {
  return OUTPUT_SCHEMAS[workflowId];
}


// ── Validation Function ──────────────────────────────────────

export interface ValidationResult {
  success: boolean;
  data: Record<string, unknown> | null;
  error: string | null;
}

/**
 * Validates the raw model output against the workflow's expected schema.
 * Attempts to parse JSON from the raw string first, then validates the shape.
 */
export function validateOutput(workflowId: AllWorkflowId, raw: string): ValidationResult {
  const schema = getOutputSchema(workflowId);

  // Step 1: Parse JSON from the raw response
  let parsed: unknown;
  try {
    // Handle cases where the model wraps JSON in markdown code fences
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return {
      success: false,
      data: null,
      error: `Failed to parse model response as JSON: ${raw.slice(0, 200)}...`,
    };
  }

  // Step 2: Validate against the workflow schema
  const result = schema.safeParse(parsed);

  if (!result.success) {
    return {
      success: false,
      data: null,
      error: `Output validation failed: ${result.error.message}`,
    };
  }

  return {
    success: true,
    data: result.data as Record<string, unknown>,
    error: null,
  };
}
