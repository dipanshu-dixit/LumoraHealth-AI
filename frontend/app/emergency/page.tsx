'use client';

import NavigationSidebar from '../components/NavigationSidebar';
import { Phone, AlertTriangle, Heart, Brain, Activity, Stethoscope, Ambulance, Clock, Shield } from 'lucide-react';

export default function Emergency() {
  const emergencyNumbers = [
    { service: 'National Emergency', number: '112', description: 'All emergencies - Police, Fire, Medical', icon: AlertTriangle },
    { service: 'Ambulance', number: '108', description: 'Free ambulance service across India', icon: Ambulance },
    { service: 'Police', number: '100', description: 'Police emergency', icon: Shield },
    { service: 'Fire', number: '101', description: 'Fire emergency', icon: AlertTriangle },
    { service: 'Women Helpline', number: '181', description: 'Women in distress, domestic violence', icon: Shield },
    { service: 'Child Helpline', number: '1098', description: 'Child abuse, missing children', icon: Shield }
  ];

  const mentalHealthNumbers = [
    { service: 'KIRAN Mental Health', number: '1800-599-0019', description: 'Free 24/7 mental health support, suicide prevention', icon: Brain },
    { service: 'Vandrevala Foundation', number: '1860-2662-345', description: '24/7 mental health counseling', icon: Brain },
    { service: 'iCall Helpline', number: '9152987821', description: 'Psychosocial support (Mon-Sat, 8AM-10PM)', icon: Brain },
    { service: 'NIMHANS Helpline', number: '080-46110007', description: 'Mental health support (Mon-Sat, 9AM-5PM)', icon: Brain }
  ];

  const criticalSigns = [
    {
      title: 'Cardiac Emergency',
      icon: Heart,
      signs: [
        'Severe chest pain or pressure',
        'Pain radiating to arm, jaw, or back',
        'Shortness of breath',
        'Cold sweats, nausea',
        'Loss of consciousness'
      ],
      action: 'Call emergency services immediately. Chew aspirin if available and not allergic.'
    },
    {
      title: 'Stroke Symptoms',
      icon: Brain,
      signs: [
        'Sudden numbness or weakness (face, arm, leg)',
        'Confusion or trouble speaking',
        'Vision problems in one or both eyes',
        'Severe headache with no known cause',
        'Loss of balance or coordination'
      ],
      action: 'Time is critical. Call emergency services immediately. Note the time symptoms started.'
    },
    {
      title: 'Severe Allergic Reaction',
      icon: Activity,
      signs: [
        'Difficulty breathing or swallowing',
        'Swelling of face, lips, or throat',
        'Rapid pulse',
        'Dizziness or fainting',
        'Widespread hives or rash'
      ],
      action: 'Use epinephrine auto-injector if available. Call emergency services immediately.'
    },
    {
      title: 'Severe Bleeding',
      icon: AlertTriangle,
      signs: [
        'Blood spurting or pulsating from wound',
        'Bleeding that won\'t stop after 10 minutes',
        'Blood soaking through bandages',
        'Signs of shock (pale, cold, rapid pulse)',
        'Amputation or severe trauma'
      ],
      action: 'Apply direct pressure. Elevate if possible. Call emergency services immediately.'
    }
  ];

  const whenToCall = [
    'Unconsciousness or altered mental state',
    'Difficulty breathing or choking',
    'Severe chest pain or pressure',
    'Severe bleeding that won\'t stop',
    'Suspected poisoning or overdose',
    'Severe burns',
    'Head, neck, or spine injury',
    'Seizures lasting more than 5 minutes',
    'Severe allergic reaction',
    'Suicidal or homicidal thoughts'
  ];

  return (
    <div className="flex h-screen">
      <NavigationSidebar user={{ name: 'User' }} />
      
      <div className="flex-1 overflow-y-auto bg-[var(--bg-page)] pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent mb-4">
              Emergency Medical Information
            </h1>
            <p className="text-zinc-400">Critical information for medical emergencies</p>
          </div>

          {/* Critical Warning */}
          <div className="bg-red-500/10 border-2 border-red-500/50 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-red-400 mb-2">Life-Threatening Emergency?</h2>
                <p className="text-red-200 text-lg mb-4">
                  If you or someone else is experiencing a medical emergency, call emergency services immediately. 
                  Do not wait. Do not use this website for emergency medical advice.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="tel:112" className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-colors">
                    Call 112 - Emergency
                  </a>
                  <a href="tel:108" className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-colors">
                    Call 108 - Ambulance
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Mental Health Crisis - Priority Section */}
          <div className="bg-purple-500/10 border-2 border-purple-500/50 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <Brain className="w-8 h-8 text-purple-400 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-purple-400 mb-2">Mental Health Crisis Support</h2>
                <p className="text-purple-200 mb-4">
                  Mental health is as important as physical health. If you're experiencing a mental health crisis, 
                  suicidal thoughts, or severe emotional distress, reach out immediately.
                </p>
                <div className="space-y-3">
                  {mentalHealthNumbers.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.number} className="bg-zinc-900/50 border border-purple-500/30 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="w-5 h-5 text-purple-400" />
                              <h3 className="font-semibold text-white">{item.service}</h3>
                            </div>
                            <p className="text-sm text-zinc-400 mb-2">{item.description}</p>
                          </div>
                          <a 
                            href={`tel:${item.number}`}
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold transition-colors whitespace-nowrap"
                          >
                            {item.number}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Numbers */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Emergency Contact Numbers (India)</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {emergencyNumbers.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.number} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon className="w-5 h-5 text-red-400 mt-1" />
                        <div>
                          <h3 className="font-semibold text-white mb-1">{item.service}</h3>
                          <p className="text-sm text-zinc-400">{item.description}</p>
                        </div>
                      </div>
                      <a 
                        href={`tel:${item.number}`}
                        className="text-xl font-bold text-white hover:text-red-400 transition-colors ml-4"
                      >
                        {item.number}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Critical Signs to Recognize */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Recognize Critical Medical Emergencies</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {criticalSigns.map((emergency) => {
                const Icon = emergency.icon;
                return (
                  <div key={emergency.title} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon className="w-6 h-6 text-red-400" />
                      <h3 className="text-xl font-semibold text-white">{emergency.title}</h3>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-zinc-400 mb-2">Warning Signs:</p>
                      <ul className="space-y-1">
                        {emergency.signs.map((sign, idx) => (
                          <li key={idx} className="text-zinc-300 text-sm">• {sign}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-sm font-semibold text-red-300">{emergency.action}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* When to Call Emergency Services */}
          <div className="mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Phone className="w-6 h-6 text-orange-400" />
                <h2 className="text-2xl font-semibold text-white">When to Call Emergency Services</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
                {whenToCall.map((situation, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold">•</span>
                    <span className="text-zinc-300">{situation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* What to Tell Emergency Dispatcher */}
          <div className="mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Stethoscope className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Information for Emergency Dispatcher</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-white mb-3">Essential Information:</h3>
                  <ul className="space-y-2 text-zinc-300">
                    <li>• Your exact location and address</li>
                    <li>• Phone number you're calling from</li>
                    <li>• Nature of the emergency</li>
                    <li>• Number of people needing help</li>
                    <li>• Condition of the patient(s)</li>
                    <li>• Any immediate dangers present</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-3">Important Guidelines:</h3>
                  <ul className="space-y-2 text-zinc-300">
                    <li>• Stay calm and speak clearly</li>
                    <li>• Answer all questions accurately</li>
                    <li>• Don't hang up until instructed</li>
                    <li>• Follow dispatcher's instructions</li>
                    <li>• Send someone to guide responders</li>
                    <li>• Keep phone line open if possible</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-amber-400 mb-2">Important Disclaimer</h3>
                <p className="text-amber-200/90 leading-relaxed">
                  This information is for educational purposes only and is not a substitute for professional medical advice, 
                  diagnosis, or treatment. In any medical emergency, always call your local emergency number immediately. 
                  Time is critical in medical emergencies - do not delay seeking professional help.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
