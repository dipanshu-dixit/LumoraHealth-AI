import { detectMedicines, checkInteractions } from '../lib/medicineDetection';
import { performance } from 'perf_hooks';

const sampleText = `
I have been taking paracetamol for my headache.
My doctor also prescribed ibuprofen and some amoxicillin for the infection.
I also take metformin for my diabetes and omeprazole for acid reflux.
I am allergic to aspirin.
Yesterday I took tylenol and advil.
I need to check my dosage of lisinopril and atorvastatin.
`;

describe('medicineDetection performance', () => {
  it('should detect medicines correctly', () => {
    const detected = detectMedicines(sampleText);
    expect(detected).toContain('Paracetamol');
    expect(detected).toContain('Ibuprofen');
    expect(detected).toContain('Amoxicillin');
    expect(detected).toContain('Metformin');
    expect(detected).toContain('Omeprazole');
    expect(detected).toContain('Aspirin');
    expect(detected).toContain('Tylenol');
    expect(detected).toContain('Advil');
    expect(detected).toContain('Lisinopril');
    expect(detected).toContain('Atorvastatin');
  });

  it('benchmark', () => {
    const iterations = 1000;

    // Warm up
    for (let i = 0; i < 100; i++) {
      detectMedicines(sampleText);
    }

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      detectMedicines(sampleText);
    }
    const end = performance.now();

    const totalTime = end - start;
    const averageTime = totalTime / iterations;

    console.log(`Total time for ${iterations} iterations: ${totalTime.toFixed(2)}ms`);
    console.log(`Average time per call: ${averageTime.toFixed(4)}ms`);

    expect(averageTime).toBeLessThan(10); // Loose constraint
  });
});

describe('checkInteractions', () => {
  it('should detect known dangerous interactions', () => {
    expect(checkInteractions(['warfarin', 'aspirin'])).toBe(true);
    expect(checkInteractions(['warfarin', 'ibuprofen'])).toBe(true);
    expect(checkInteractions(['metformin', 'alcohol'])).toBe(true);
    expect(checkInteractions(['alprazolam', 'alcohol'])).toBe(true);
    expect(checkInteractions(['tramadol', 'sertraline'])).toBe(true);
  });

  it('should be case-insensitive', () => {
    expect(checkInteractions(['Warfarin', 'ASPIRIN'])).toBe(true);
    expect(checkInteractions(['Metformin', 'ALCOHOL'])).toBe(true);
  });

  it('should not detect interactions for safe combinations', () => {
    expect(checkInteractions(['paracetamol', 'ibuprofen'])).toBe(false);
    expect(checkInteractions(['amoxicillin', 'omeprazole'])).toBe(false);
    expect(checkInteractions(['warfarin', 'metformin'])).toBe(false);
  });

  it('should handle empty or single medicine lists', () => {
    expect(checkInteractions([])).toBe(false);
    expect(checkInteractions(['warfarin'])).toBe(false);
  });

  it('should detect interactions within a larger list of medicines', () => {
    expect(checkInteractions(['paracetamol', 'warfarin', 'omeprazole', 'aspirin'])).toBe(true);
  });

  it('should return false for a larger list of medicines with no interactions', () => {
    expect(checkInteractions(['paracetamol', 'omeprazole', 'amoxicillin', 'lisinopril'])).toBe(false);
  });
});
