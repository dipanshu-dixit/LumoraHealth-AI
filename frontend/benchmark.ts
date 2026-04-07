interface MedicineHistoryItem {
  medicine: string;
  timestamp: number;
  response?: string;
}

// Generate test data
const generateData = (size: number): MedicineHistoryItem[] => {
  const data: MedicineHistoryItem[] = [];
  for (let i = 0; i < size; i++) {
    // Make some duplicates
    const medicineId = i % (size / 10);
    data.push({
      medicine: `Medicine ${medicineId} `,
      timestamp: Date.now(),
    });
  }
  return data;
};

const items = generateData(10000);

// Current O(N^2) approach
const start1 = performance.now();
const unique1 = items.filter((item: MedicineHistoryItem, index: number, self: MedicineHistoryItem[]) =>
  index === self.findIndex(t => t.medicine.toLowerCase().trim() === item.medicine.toLowerCase().trim())
);
const end1 = performance.now();
console.log(`Current approach (O(N^2)): ${end1 - start1} ms`);

// Proposed O(N) approach
const start2 = performance.now();
const seen = new Set<string>();
const unique2: MedicineHistoryItem[] = [];
for (const item of items) {
  const normalized = item.medicine.toLowerCase().trim();
  if (!seen.has(normalized)) {
    seen.add(normalized);
    unique2.push(item);
  }
}
const end2 = performance.now();
console.log(`Proposed approach (O(N)): ${end2 - start2} ms`);

console.log(`Result lengths match: ${unique1.length === unique2.length}`);
console.log(`Unique items: ${unique1.length}`);
