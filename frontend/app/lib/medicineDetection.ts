// Common medicine names for detection
const COMMON_MEDICINES = [
  'paracetamol', 'acetaminophen', 'ibuprofen', 'aspirin', 'amoxicillin',
  'metformin', 'omeprazole', 'cetirizine', 'loratadine', 'azithromycin',
  'ciprofloxacin', 'doxycycline', 'prednisone', 'lisinopril', 'atorvastatin',
  'simvastatin', 'amlodipine', 'metoprolol', 'losartan', 'gabapentin',
  'tramadol', 'codeine', 'morphine', 'insulin', 'levothyroxine',
  'albuterol', 'montelukast', 'fluticasone', 'ranitidine', 'pantoprazole',
  'diclofenac', 'naproxen', 'meloxicam', 'cyclobenzaprine', 'tizanidine',
  'sertraline', 'fluoxetine', 'escitalopram', 'duloxetine', 'venlafaxine',
  'alprazolam', 'lorazepam', 'clonazepam', 'zolpidem', 'trazodone',
  'warfarin', 'clopidogrel', 'apixaban', 'rivaroxaban', 'furosemide',
  'hydrochlorothiazide', 'spironolactone', 'potassium', 'magnesium',
  'vitamin d', 'vitamin b12', 'folic acid', 'iron', 'calcium',
  // Extended list
  'tylenol', 'advil', 'motrin', 'aleve', 'benadryl', 'claritin', 'zyrtec',
  'penicillin', 'augmentin', 'zithromax', 'cipro', 'flagyl', 'keflex',
  'nexium', 'prilosec', 'zantac', 'pepcid', 'tums', 'maalox',
  'lipitor', 'crestor', 'zocor', 'pravachol', 'norvasc', 'coreg',
  'lisinopril', 'enalapril', 'ramipril', 'losartan', 'valsartan',
  'metformin', 'glipizide', 'glyburide', 'januvia', 'lantus', 'humalog',
  'synthroid', 'levoxyl', 'cytomel', 'armour thyroid',
  'ventolin', 'proventil', 'flovent', 'advair', 'symbicort', 'singulair',
  'prozac', 'zoloft', 'lexapro', 'celexa', 'paxil', 'effexor', 'cymbalta',
  'xanax', 'ativan', 'klonopin', 'valium', 'ambien', 'lunesta',
  'vicodin', 'percocet', 'oxycontin', 'morphine', 'fentanyl', 'dilaudid',
  'coumadin', 'plavix', 'eliquis', 'xarelto', 'pradaxa',
  'lasix', 'hctz', 'aldactone', 'bumex',
  'aspirin', 'baby aspirin', 'ecotrin',
  'multivitamin', 'vitamin c', 'vitamin e', 'omega 3', 'fish oil',
  'glucosamine', 'chondroitin', 'turmeric', 'curcumin', 'probiotics'
];

// Pre-calculate formatted names and regexes for common medicines to optimize detection
const MEDICINE_DATA = COMMON_MEDICINES.map(medicine => ({
  formatted: medicine.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' '),
  regex: new RegExp(`\\b${medicine.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
}));

// Medicine-related keywords to detect context
const MEDICINE_KEYWORDS = [
  'tablet', 'capsule', 'pill', 'medication', 'medicine', 'drug',
  'mg',  'dosage', 'prescription', 'prescribed'
];

// Blacklist of common words that match medicine patterns but aren't medicines
const BLACKLIST = [
  'alcohol', 'control', 'protocol', 'patrol', 'petrol', 'symbol',
  'urine', 'routine', 'marine', 'oline', 'oline', 'inine', 'amine',
  'examine', 'determine', 'combine', 'refine', 'define', 'decline',
  'incline', 'outline', 'baseline', 'deadline', 'online', 'offline',
  'sunshine', 'moonshine', 'coastline', 'hairline', 'headline',
  'pipeline', 'timeline', 'guideline', 'underline', 'streamline',
  'school', 'cool', 'pool', 'tool', 'fool', 'wool', 'stool'
];

// Optimization: Convert blacklist to a Set for O(1) lookups
const BLACKLIST_SET = new Set(BLACKLIST.map(word => word.toLowerCase()));

// Optimization: Pre-compile smart detection regex
const SMART_DETECTION_REGEX = /\b[A-Z][a-z]{4,}(?:pril|statin|mycin|cillin|oxin|azole|mab|tinib|afil|dipine|sartan|olol|zole|pine|done|tide)\b/g;

// Known dangerous interactions (module-level for performance)
const DANGEROUS_INTERACTIONS: [string, string][] = [
  ['warfarin', 'aspirin'],
  ['warfarin', 'ibuprofen'],
  ['metformin', 'alcohol'],
  ['alprazolam', 'alcohol'],
  ['tramadol', 'sertraline']
];

export const detectMedicines = (text: string): string[] => {
  const lowerText = text.toLowerCase();
  const detected = new Set<string>();
  
  // Only detect if medicine context exists
  const hasMedicineContext = MEDICINE_KEYWORDS.some(keyword => lowerText.includes(keyword));
  
  if (!hasMedicineContext) {
    return [];
  }

  // Detect from known medicine list using pre-compiled regexes
  MEDICINE_DATA.forEach(med => {
    if (med.regex.test(lowerText)) {
      detected.add(med.formatted);
    }
  });
  
  // Smart detection: capitalized words with medicine suffixes
  const words = text.match(SMART_DETECTION_REGEX);
  if (words) {
    words.forEach(word => {
      const lower = word.toLowerCase();
      // Only add if not in blacklist, not already detected, and has medicine context nearby
      if (!BLACKLIST_SET.has(lower) && !detected.has(word) && word.length >= 6) {
        // Check if word appears near medicine context
        const wordIndex = lowerText.indexOf(lower);
        const contextWindow = lowerText.substring(Math.max(0, wordIndex - 50), wordIndex + word.length + 50);
        const hasNearbyContext = MEDICINE_KEYWORDS.some(keyword => contextWindow.includes(keyword));
        
        if (hasNearbyContext) {
          detected.add(word);
        }
      }
    });
  }

  return Array.from(detected);
};

export const checkInteractions = (medicines: string[]): boolean => {
  if (medicines.length < 2) return false;

  const medicineSet = new Set(medicines.map(m => m.toLowerCase()));

  return DANGEROUS_INTERACTIONS.some(([a, b]) =>
    medicineSet.has(a) && medicineSet.has(b)
  );
};
