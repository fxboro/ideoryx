import { describe, it, expect } from "vitest";
import { loadMemories } from "@/lib/agents/memory-loader";
import { mockFirestoreInstance } from "../setup";

describe("Memory Loader Unit Tests", () => {
  it("should filter out expired memories and return active ones", async () => {
    const userId = "user-123";
    const now = Date.now();

    // 1. Seed memories
    // Active memory
    mockFirestoreInstance.seed("memories", "mem-1", {
      userId,
      type: "preference",
      content: "Active pref",
      confidence: 90,
      tags: ["design"],
      expiresAt: now + 100000,
    });

    // Expired memory
    mockFirestoreInstance.seed("memories", "mem-2", {
      userId,
      type: "preference",
      content: "Expired pref",
      confidence: 90,
      tags: ["design"],
      expiresAt: now - 5000,
    });

    // Active memory with no expiration
    mockFirestoreInstance.seed("memories", "mem-3", {
      userId,
      type: "preference",
      content: "Permanent pref",
      confidence: 85,
      tags: ["code"],
    });

    const result = await loadMemories(userId);

    expect(result.length).toBe(2);
    expect(result.some((m) => m.id === "mem-1")).toBe(true);
    expect(result.some((m) => m.id === "mem-3")).toBe(true);
    expect(result.some((m) => m.id === "mem-2")).toBe(false);
  });

  it("should boost memories matching contextTags and sort by score descending", async () => {
    const userId = "user-123";

    // mem-1: High confidence, no tag match
    mockFirestoreInstance.seed("memories", "mem-1", {
      userId,
      type: "rule",
      content: "High confidence rule",
      confidence: 95,
      tags: ["unrelated"],
    });

    // mem-2: Medium confidence, but matches one tag ("typescript")
    mockFirestoreInstance.seed("memories", "mem-2", {
      userId,
      type: "preference",
      content: "Typescript preferences",
      confidence: 80,
      tags: ["typescript", "code"],
    });

    // mem-3: Low confidence, but matches two tags ("typescript" and "react")
    mockFirestoreInstance.seed("memories", "mem-3", {
      userId,
      type: "learning",
      content: "React with Typescript notes",
      confidence: 70,
      tags: ["typescript", "react"],
    });

    // With contextTags = ["typescript", "react"]
    // Scores:
    // mem-1: 95 + 0 = 95
    // mem-2: 80 + 1 * 10 = 90
    // mem-3: 70 + 2 * 10 = 90 (or 70 + 20 = 90. If tie, original order, but let's make it clear)
    
    // Let's modify mem-3 confidence to 85, so 85 + 20 = 105 (highest)
    mockFirestoreInstance.seed("memories", "mem-3", {
      userId,
      type: "learning",
      content: "React with Typescript notes",
      confidence: 85,
      tags: ["typescript", "react"],
    });

    const result = await loadMemories(userId, ["typescript", "react"]);

    expect(result.length).toBe(3);
    // Highest score first: mem-3 (score 105), then mem-1 (score 95), then mem-2 (score 90)
    expect(result[0].id).toBe("mem-3");
    expect(result[1].id).toBe("mem-1");
    expect(result[2].id).toBe("mem-2");
  });

  it("should limit the number of returned memories", async () => {
    const userId = "user-123";

    for (let i = 0; i < 15; i++) {
      mockFirestoreInstance.seed("memories", `mem-${i}`, {
        userId,
        type: "fact",
        content: `Fact ${i}`,
        confidence: 80,
        tags: ["general"],
      });
    }

    const result = await loadMemories(userId, [], 5);
    expect(result.length).toBe(5);
  });
});
