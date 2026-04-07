import { detectMedicines } from '../lib/medicineDetection';
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
