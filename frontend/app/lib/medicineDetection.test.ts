import { checkInteractions } from './medicineDetection';

describe('checkInteractions', () => {
  test('returns false for empty list', () => {
    expect(checkInteractions([])).toBe(false);
  });

  test('returns false for single medicine', () => {
    expect(checkInteractions(['Warfarin'])).toBe(false);
  });

  test('returns false for medicines with no interactions', () => {
    expect(checkInteractions(['Amoxicillin', 'Omeprazole', 'Cetirizine'])).toBe(false);
  });

  test('returns true for known interactions (Warfarin, Aspirin)', () => {
    expect(checkInteractions(['Warfarin', 'Aspirin'])).toBe(true);
  });

  test('returns true for known interactions (Metformin, Alcohol)', () => {
    expect(checkInteractions(['Metformin', 'Alcohol'])).toBe(true);
  });

  test('returns true for known interactions (Tramadol, Sertraline)', () => {
    expect(checkInteractions(['Tramadol', 'Sertraline'])).toBe(true);
  });

  test('is case insensitive', () => {
    expect(checkInteractions(['warfarin', 'ASPIRIN'])).toBe(true);
  });

  test('returns true when interactions are among other medicines', () => {
    expect(checkInteractions(['Amoxicillin', 'Warfarin', 'Omeprazole', 'Aspirin', 'Cetirizine'])).toBe(true);
  });

  test('returns false for medicines that are part of interactions but not together', () => {
    expect(checkInteractions(['Warfarin', 'Amoxicillin', 'Metformin'])).toBe(false);
  });
});
