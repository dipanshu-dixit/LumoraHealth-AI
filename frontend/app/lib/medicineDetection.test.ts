
import { expect, test, describe } from "bun:test";
import { checkInteractions } from "./medicineDetection";

describe("checkInteractions", () => {
  test("should detect known interactions", () => {
    expect(checkInteractions(['warfarin', 'aspirin'])).toBe(true);
    expect(checkInteractions(['Warfarin', 'ASPIRIN'])).toBe(true);
    expect(checkInteractions(['metformin', 'alcohol'])).toBe(true);
    expect(checkInteractions(['alprazolam', 'alcohol'])).toBe(true);
    expect(checkInteractions(['tramadol', 'sertraline'])).toBe(true);
  });

  test("should not detect unknown interactions", () => {
    expect(checkInteractions(['warfarin', 'metformin'])).toBe(false);
    expect(checkInteractions(['paracetamol', 'ibuprofen'])).toBe(false);
    expect(checkInteractions(['alcohol', 'aspirin'])).toBe(false);
  });

  test("should handle empty or single item lists", () => {
    expect(checkInteractions([])).toBe(false);
    expect(checkInteractions(['warfarin'])).toBe(false);
  });

  test("should handle multiple items with no interaction", () => {
    expect(checkInteractions(['warfarin', 'metformin', 'paracetamol', 'omeprazole'])).toBe(false);
  });

  test("should handle multiple items with interaction", () => {
    expect(checkInteractions(['warfarin', 'metformin', 'aspirin', 'omeprazole'])).toBe(true);
  });
});
