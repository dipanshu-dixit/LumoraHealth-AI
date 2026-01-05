export interface EmergencyGuide {
  id: string;
  title: string;
  steps: string[];
  icon: string;
  severity: 'critical' | 'high' | 'medium';
}

export const emergencyGuides: EmergencyGuide[] = [
  {
    id: 'cpr',
    title: 'CPR (Cardiopulmonary Resuscitation)',
    severity: 'critical',
    icon: '❤️',
    steps: [
      'Check responsiveness - tap shoulders and shout',
      'Call emergency services (112/108) immediately',
      'Place person on firm, flat surface',
      'Position hands: center of chest, between nipples',
      'Push hard and fast: 100-120 compressions/minute',
      'Compress at least 2 inches deep',
      'Allow chest to fully recoil between compressions',
      'Continue until help arrives or person responds'
    ]
  },
  {
    id: 'choking',
    title: 'Choking (Heimlich Maneuver)',
    severity: 'critical',
    icon: '🫁',
    steps: [
      'Ask "Are you choking?" - if they can\'t speak, act immediately',
      'Stand behind person, wrap arms around waist',
      'Make a fist, place above navel below ribcage',
      'Grasp fist with other hand',
      'Give quick upward thrusts',
      'Repeat until object dislodges',
      'If unconscious, begin CPR and call 112/108'
    ]
  },
  {
    id: 'bleeding',
    title: 'Severe Bleeding Control',
    severity: 'critical',
    icon: '🩸',
    steps: [
      'Call emergency services (112/108)',
      'Wear gloves if available',
      'Apply direct pressure with clean cloth',
      'Maintain firm pressure for 10-15 minutes',
      'Don\'t remove cloth if blood soaks through - add more',
      'Elevate injured area above heart if possible',
      'Apply pressure to artery if bleeding continues',
      'Keep person warm and calm until help arrives'
    ]
  },
  {
    id: 'stroke',
    title: 'Stroke Recognition (FAST)',
    severity: 'critical',
    icon: '🧠',
    steps: [
      'F - Face: Ask to smile, check for drooping',
      'A - Arms: Raise both arms, check for drift',
      'S - Speech: Repeat simple phrase, check for slurring',
      'T - Time: Call 112/108 IMMEDIATELY if any sign present',
      'Note time symptoms started',
      'Keep person calm and lying down',
      'Don\'t give food, water, or medication',
      'Monitor breathing until help arrives'
    ]
  },
  {
    id: 'burns',
    title: 'Burn Treatment',
    severity: 'high',
    icon: '🔥',
    steps: [
      'Remove from heat source immediately',
      'Cool burn with running water for 10-20 minutes',
      'Remove jewelry/tight clothing before swelling',
      'Cover with sterile, non-stick bandage',
      'Don\'t apply ice, butter, or ointments',
      'For severe burns: call 112/108',
      'Treat for shock if needed',
      'Keep person warm with clean blanket'
    ]
  },
  {
    id: 'seizure',
    title: 'Seizure Response',
    severity: 'high',
    icon: '⚡',
    steps: [
      'Stay calm, note the time',
      'Clear area of dangerous objects',
      'Cushion head with something soft',
      'Turn person on side if possible',
      'Don\'t restrain or put anything in mouth',
      'Time the seizure duration',
      'Call 112/108 if: lasts >5 min, first seizure, or injury',
      'Stay with person until fully conscious'
    ]
  },
  {
    id: 'allergic',
    title: 'Severe Allergic Reaction',
    severity: 'critical',
    icon: '💉',
    steps: [
      'Call 112/108 immediately',
      'Use EpiPen if available (inject outer thigh)',
      'Help person lie down, elevate legs',
      'Loosen tight clothing',
      'Monitor breathing and pulse',
      'Be ready to perform CPR if needed',
      'Second dose may be needed after 5-15 minutes',
      'Stay with person until help arrives'
    ]
  },
  {
    id: 'fracture',
    title: 'Fracture/Broken Bone',
    severity: 'medium',
    icon: '🦴',
    steps: [
      'Don\'t move person unless necessary',
      'Immobilize injured area',
      'Apply ice pack (wrapped in cloth)',
      'Elevate if possible',
      'Don\'t try to realign bone',
      'Control bleeding if present',
      'Call 112/108 for severe fractures',
      'Monitor for shock symptoms'
    ]
  }
];

export const emergencyAssessment = [
  {
    question: 'Is the person unconscious or unresponsive?',
    severity: 'critical',
    action: 'Call 112/108 immediately. Check breathing and pulse. Begin CPR if needed.'
  },
  {
    question: 'Is there severe bleeding that won\'t stop?',
    severity: 'critical',
    action: 'Call 112/108. Apply direct pressure with clean cloth. Don\'t remove cloth.'
  },
  {
    question: 'Is the person having difficulty breathing?',
    severity: 'critical',
    action: 'Call 112/108 immediately. Keep person calm and in comfortable position.'
  },
  {
    question: 'Are there signs of stroke (face drooping, arm weakness, speech difficulty)?',
    severity: 'critical',
    action: 'Call 112/108 IMMEDIATELY. Note time symptoms started. Every minute counts.'
  },
  {
    question: 'Is there chest pain or pressure?',
    severity: 'critical',
    action: 'Call 112/108. Keep person calm and seated. Loosen tight clothing.'
  },
  {
    question: 'Is there a severe allergic reaction (swelling, difficulty breathing)?',
    severity: 'critical',
    action: 'Call 112/108. Use EpiPen if available. Monitor breathing closely.'
  },
  {
    question: 'Is there a suspected poisoning or overdose?',
    severity: 'critical',
    action: 'Call 112/108. Don\'t induce vomiting. Bring container/substance if safe.'
  },
  {
    question: 'Is there a severe burn covering large area?',
    severity: 'high',
    action: 'Call 112/108. Cool with water. Cover with clean cloth. Don\'t apply ice.'
  }
];
