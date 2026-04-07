
import { expect, test, describe, beforeEach } from "bun:test";
import { AdaptiveAI } from "../lib/adaptiveAI";

// Mock localStorage
const storage: Record<string, string> = {};
global.localStorage = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, value: string) => { storage[key] = value; },
  removeItem: (key: string) => { delete storage[key]; },
  clear: () => { for (const key in storage) delete storage[key]; },
  length: 0,
  key: (index: number) => Object.keys(storage)[index] || null,
};

describe("AdaptiveAIService", () => {
  beforeEach(() => {
    for (const key in storage) delete storage[key];
    // @ts-ignore - access private property to reset for testing
    AdaptiveAI.cachedFeedback = null;
  });

  test("should record and retrieve feedback", () => {
    AdaptiveAI.recordFeedback("1", "Positive feedback about exercise", true);
    const stats = AdaptiveAI.getStats();
    expect(stats.totalFeedback).toBe(1);
    expect(stats.liked).toBe(1);
  });

  test("should limit feedback to 100 items", () => {
    for (let i = 0; i < 110; i++) {
      AdaptiveAI.recordFeedback(`msg-${i}`, "feedback", true);
    }
    const stats = AdaptiveAI.getStats();
    expect(stats.totalFeedback).toBe(100);
  });

  test("should build profile after feedback", () => {
    // Need longer messages to get 'detailed' style (> 300 characters avg)
    const longMessage = "This is a very detailed and long message about exercise and diet. ".repeat(10);
    AdaptiveAI.recordFeedback("1", longMessage, true);
    AdaptiveAI.recordFeedback("2", longMessage, true);
    AdaptiveAI.recordFeedback("3", longMessage, true);

    const stats = AdaptiveAI.getStats();
    expect(stats.profileBuilt).toBe(true);
    expect(stats.preferredStyle).toBe("detailed");
  });

  test("should include adaptive section in prompt when profile exists", () => {
    const longMessage = "This is a very detailed and long message about exercise and diet. ".repeat(10);
    AdaptiveAI.recordFeedback("1", longMessage, true);
    AdaptiveAI.recordFeedback("2", longMessage, true);
    AdaptiveAI.recordFeedback("3", longMessage, true);

    const prompt = AdaptiveAI.buildAdaptivePrompt("Base prompt");
    expect(prompt).toContain("USER PREFERENCES");
    expect(prompt).toContain("Response style: detailed");
  });
});
