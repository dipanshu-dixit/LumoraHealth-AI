
import { expect, test, describe } from "bun:test";
import { detectMedicines, checkInteractions } from "./medicineDetection";

describe("detectMedicines", () => {
  test("should return empty array if no medicine context exists", () => {
    expect(detectMedicines("I have a headache and need some sleep.")).toEqual([]);
    // Even if it has a known medicine, it should not detect without context
    expect(detectMedicines("I took ibuprofen.")).toEqual([]);
  });

  test("should detect known medicines when context exists", () => {
    // 'pill' is a context word
    const result = detectMedicines("I took a pill of ibuprofen and paracetamol.");
    expect(result).toContain('Ibuprofen');
    expect(result).toContain('Paracetamol');
    expect(result.length).toBe(2);
  });

  test("should handle case insensitivity for known medicines", () => {
    // 'medication' is context
    const result = detectMedicines("My medication includes TYLENOL and Advil.");
    expect(result).toContain('Tylenol');
    expect(result).toContain('Advil');
    expect(result.length).toBe(2);
  });

  test("should use smart detection for unknown medicines with common suffixes", () => {
    // 'prescription' is context. Word requires 5 lowercase chars before suffix: F a k e p + pril = 9 chars
    const result = detectMedicines("Here is my prescription for Fakeppril.");
    expect(result).toContain('Fakeppril');

    // 'tablet' is context. N e w s t + statin = 11 chars
    const result2 = detectMedicines("Taking a tablet of Newststatin.");
    expect(result2).toContain('Newststatin');
  });

  test("should ignore blacklisted words in smart detection", () => {
    // 'Baseline' would match the 6 char requirement and is capitalized, but 'baseline' is blacklisted.
    expect(detectMedicines("My dosage of Baseline is zero.")).toEqual([]);
  });

  test("should ignore smart detection if context is too far away", () => {
    // context keyword 'medicine' is index 0. Word is > 50 chars away
    const text = "medicine " + "a".repeat(60) + " Fakepril";
    expect(detectMedicines(text)).toEqual([]);
  });
});

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
