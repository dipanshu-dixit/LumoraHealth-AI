import { detectMedicines, checkInteractions } from '../medicineDetection';

describe('medicineDetection', () => {
  describe('checkInteractions', () => {
    test('identifies interacting pairs', () => {
      expect(checkInteractions(['warfarin', 'aspirin'])).toBe(true);
      expect(checkInteractions(['warfarin', 'ibuprofen'])).toBe(true);
      expect(checkInteractions(['metformin', 'alcohol'])).toBe(true);
      expect(checkInteractions(['alprazolam', 'alcohol'])).toBe(true);
      expect(checkInteractions(['tramadol', 'sertraline'])).toBe(true);
    });

    test('identifies non-interacting pairs', () => {
      expect(checkInteractions(['paracetamol', 'ibuprofen'])).toBe(false);
      expect(checkInteractions(['aspirin', 'metformin'])).toBe(false);
    });

    test('is case insensitive', () => {
      expect(checkInteractions(['Warfarin', 'ASPIRIN'])).toBe(true);
      expect(checkInteractions(['METFORMIN', 'Alcohol'])).toBe(true);
    });

    test('handles multiple medicines with interactions', () => {
      expect(checkInteractions(['warfarin', 'paracetamol', 'aspirin'])).toBe(true);
      expect(checkInteractions(['metformin', 'lisinopril', 'alcohol'])).toBe(true);
    });

    test('handles multiple medicines without interactions', () => {
      expect(checkInteractions(['paracetamol', 'ibuprofen', 'lisinopril'])).toBe(false);
    });

    test('handles edge cases', () => {
      expect(checkInteractions([])).toBe(false);
      expect(checkInteractions(['aspirin'])).toBe(false);
    });
  });

  describe('detectMedicines', () => {
    test('detects basic medicines from list when context is present', () => {
      const text = 'I am taking aspirin tablet and paracetamol pill';
      const detected = detectMedicines(text);
      expect(detected).toContain('Aspirin');
      expect(detected).toContain('Paracetamol');
    });

    test('does not detect medicines when context is missing', () => {
      const text = 'I saw some aspirin and paracetamol';
      const detected = detectMedicines(text);
      expect(detected).toEqual([]);
    });

    test('uses smart detection for capitalized words with suffixes', () => {
      // Captopril has 'pril' suffix and is capitalized.
      // Need nearby context (within 50 chars)
      const text = 'Patient is on Captopril 25mg twice daily';
      const detected = detectMedicines(text);
      expect(detected).toContain('Captopril');
    });

    test('filters out blacklisted words', () => {
      // 'alcohol' is in BLACKLIST. Even with context, it should not be detected by detectMedicines
      // as it's not in COMMON_MEDICINES and doesn't match smart suffixes (or is blacklisted if it did)
      const text = 'I am taking alcohol tablet';
      const detected = detectMedicines(text);
      expect(detected).not.toContain('Alcohol');
      expect(detected).not.toContain('alcohol');
    });

    test('detects multiple medicines and formats them', () => {
      const text = 'Prescribed lisinopril 10mg and Atorvastatin 20mg';
      const detected = detectMedicines(text);
      expect(detected).toContain('Lisinopril');
      expect(detected).toContain('Atorvastatin');
    });
  });
});
