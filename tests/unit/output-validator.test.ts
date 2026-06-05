import { describe, it, expect } from "vitest";
import { validateOutput } from "@/lib/agents/output-validator";

describe("Output Validator Unit Tests", () => {
  describe("JSON Cleaning and Parsing", () => {
    it("should successfully parse clean JSON", () => {
      const raw = `{"projectName": "Test", "problemStatement": "Slow tests", "targetUser": "Devs", "coreFeatures": [], "mvpScope": "Mock", "outOfScope": [], "suggestedStack": [], "estimatedTimeline": "1d", "risks": [], "nextSteps": []}`;
      const result = validateOutput("idea_to_mvp", raw);
      expect(result.success).toBe(true);
      expect(result.data?.projectName).toBe("Test");
    });

    it("should parse JSON wrapped in markdown code blocks", () => {
      const raw = `\`\`\`json
{
  "projectName": "Test Markdown",
  "problemStatement": "Slow tests",
  "targetUser": "Devs",
  "coreFeatures": [],
  "mvpScope": "Mock",
  "outOfScope": [],
  "suggestedStack": [],
  "estimatedTimeline": "1d",
  "risks": [],
  "nextSteps": []
}
\`\`\``;
      const result = validateOutput("idea_to_mvp", raw);
      expect(result.success).toBe(true);
      expect(result.data?.projectName).toBe("Test Markdown");
    });

    it("should return failure for malformed non-JSON text", () => {
      const raw = "This is not a JSON object, it's just raw chat response.";
      const result = validateOutput("idea_to_mvp", raw);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to parse model response as JSON");
    });
  });

  describe("Workflow Schema Mismatches", () => {
    it("should fail validation if required fields are missing", () => {
      // Missing targetUser, problemStatement, etc.
      const raw = `{"projectName": "Incomplete MVP"}`;
      const result = validateOutput("idea_to_mvp", raw);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Output validation failed");
    });

    it("should validate a valid weekly review output", () => {
      const raw = JSON.stringify({
        weekSummary: "A productive week overall.",
        completedItems: ["Installed dependencies", "Wrote unit tests"],
        inProgressItems: ["API route testing"],
        blockers: [],
        learnings: ["Vitest is fast"],
        nextWeekPriorities: ["Full E2E setup"],
        suggestedGoals: ["Achieve 90% test coverage"],
        overallMomentum: "strong",
        learningTarget: "Firebase emulator configuration",
      });

      const result = validateOutput("weekly_review", raw);
      expect(result.success).toBe(true);
      expect(result.data?.overallMomentum).toBe("strong");
    });

    it("should fail weekly review output validation on invalid enum value", () => {
      const raw = JSON.stringify({
        weekSummary: "Invalid review",
        completedItems: [],
        inProgressItems: [],
        blockers: [],
        learnings: [],
        nextWeekPriorities: [],
        suggestedGoals: [],
        overallMomentum: "critical", // invalid enum, should be strong/steady/slow/stalled
        learningTarget: "None",
      });

      const result = validateOutput("weekly_review", raw);
      expect(result.success).toBe(false);
      expect(result.error).toContain("overallMomentum");
    });
  });
});
