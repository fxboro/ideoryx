/**
 * Dynamic priority scoring utility for opportunities.
 * Computes a priority score based on RICE factors: (Impact * Confidence) / Effort.
 * Normalizes the result to a 100-point scale (multiplier of 4 for 1-5 inputs).
 */
export function calculateOpportunityScore(impact: number, confidence: number, effort: number) {
  // Input sanity checks (clamp 1-5)
  const imp = Math.min(5, Math.max(1, impact));
  const conf = Math.min(5, Math.max(1, confidence));
  const eff = Math.min(5, Math.max(1, effort));

  const rawScore = (imp * conf) / eff;
  // (5 * 5) / 1 = 25. 25 * 4 = 100.
  const score = Math.min(100, Math.max(1, Math.round(rawScore * 4)));

  const impactLabels: Record<number, string> = {
    1: "Minimal Impact",
    2: "Low Impact",
    3: "Medium Impact",
    4: "High Impact",
    5: "Massive Impact",
  };

  const confidenceLabels: Record<number, string> = {
    1: "Low/Speculative Confidence",
    2: "Low-Medium Confidence",
    3: "Medium Confidence",
    4: "High Confidence",
    5: "Very High/Proven Confidence",
  };

  const effortLabels: Record<number, string> = {
    1: "Very Low Effort (1-2 days)",
    2: "Low Effort (3-5 days)",
    3: "Medium Effort (1 week)",
    4: "High Effort (2 weeks)",
    5: "Very High Effort (2+ weeks)",
  };

  const explanation = `Priority score of ${score}/100 is calculated based on: ` +
    `${impactLabels[imp]}, ${confidenceLabels[conf]}, and ${effortLabels[eff]}. ` +
    `Formula: (Impact [${imp}] × Confidence [${conf}] / Effort [${eff}]) × 4.`;

  return {
    score,
    explanation,
  };
}
