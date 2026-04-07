import { checkInteractions } from '../lib/medicineDetection';

describe('checkInteractions', () => {
  it('should return true for dangerous interactions', () => {
    expect(checkInteractions(['warfarin', 'aspirin'])).toBe(true);
    expect(checkInteractions(['Aspirin', 'Warfarin'])).toBe(true);
    expect(checkInteractions(['metformin', 'alcohol'])).toBe(true);
    expect(checkInteractions(['alcohol', 'metformin'])).toBe(true);
  });

  it('should return false for safe combinations', () => {
    expect(checkInteractions(['paracetamol', 'ibuprofen'])).toBe(false);
    expect(checkInteractions(['aspirin', 'metformin'])).toBe(false);
  });

  it('should handle multiple medicines and find interaction', () => {
    expect(checkInteractions(['paracetamol', 'warfarin', 'aspirin'])).toBe(true);
    expect(checkInteractions(['paracetamol', 'ibuprofen', 'alcohol', 'alprazolam'])).toBe(true);
  });

  it('should handle empty or single medicine lists', () => {
    expect(checkInteractions([])).toBe(false);
    expect(checkInteractions(['warfarin'])).toBe(false);
  });
});
