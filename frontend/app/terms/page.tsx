'use client';

import { useState, useEffect } from 'react';
import NavigationSidebar from '../components/NavigationSidebar';
import { FileText, AlertTriangle, Check } from 'lucide-react';

export default function Terms() {
  const [hasAccepted, setHasAccepted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const accepted = localStorage.getItem('lumora-terms-accepted');
      setHasAccepted(accepted === 'true');
    }
  }, []);

  const handleAccept = () => {
    setHasAccepted(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lumora-terms-accepted', 'true');
      localStorage.setItem('lumora-terms-accepted-date', new Date().toISOString());
    }
  };

  return (
    <div className="flex h-screen">
      <NavigationSidebar user={{ name: 'User' }} />
      
      <div className="flex-1 overflow-y-auto bg-[var(--bg-page)] pt-8 pb-20">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileText className="w-10 h-10 text-purple-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">Terms of Service</h1>
            </div>
            <p className="text-zinc-400">Last updated: January 2, 2026</p>
          </div>

          <div className="space-y-8 text-zinc-300">
            {/* Acceptance */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing and using Lumora, you accept and agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use this service.
              </p>
            </section>

            {/* Service Description */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Service Description</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  Lumora is a privacy-focused AI health assistant that provides general health information for educational purposes.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400">
                  <li>AI-powered health conversations using xAI Grok-2 model</li>
                  <li>Zero-knowledge architecture with no data collection</li>
                  <li>Local-only data storage in your browser</li>
                  <li>No account creation or personal information required</li>
                </ul>
              </div>
            </section>

            {/* Medical Disclaimer */}
            <section className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <h2 className="text-2xl font-semibold text-red-400">3. Medical Disclaimer</h2>
              </div>
              <div className="space-y-3 text-red-200/90">
                <p className="leading-relaxed font-semibold">
                  LUMORA IS NOT A MEDICAL SERVICE AND DOES NOT PROVIDE MEDICAL ADVICE.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Information provided is for educational purposes only</li>
                  <li>Not a substitute for professional medical advice, diagnosis, or treatment</li>
                  <li>Always consult qualified healthcare professionals for medical decisions</li>
                  <li>Never disregard professional medical advice or delay seeking it</li>
                  <li>In emergencies, call 911 (US), 112 (EU), or 108/102 (India) immediately</li>
                </ul>
              </div>
            </section>

            {/* Privacy & Data */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Privacy & Data Storage</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  Lumora operates on a zero-knowledge architecture:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400">
                  <li><strong className="text-white">No Database:</strong> We don't have any database to store your data</li>
                  <li><strong className="text-white">Local Storage:</strong> All data is stored in your browser's localStorage</li>
                  <li><strong className="text-white">No Collection:</strong> We don't collect, store, or transmit personal information</li>
                  <li><strong className="text-white">AI Processing:</strong> Messages sent to xAI Grok-2 via OpenRouter API for processing</li>
                  <li><strong className="text-white">Data Loss:</strong> Clearing browser cache permanently deletes all data</li>
                </ul>
              </div>
            </section>

            {/* User Responsibilities */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">5. User Responsibilities</h2>
              <p className="leading-relaxed mb-3">You agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400">
                <li>Use the service for lawful purposes only</li>
                <li>Not rely on Lumora for medical emergencies or urgent health issues</li>
                <li>Understand that all data is stored locally and can be lost</li>
                <li>Not attempt to reverse engineer or exploit the service</li>
                <li>Not use the service to harm yourself or others</li>
              </ul>
            </section>

            {/* Limitations of Liability */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Limitations of Liability</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  Lumora is provided "AS IS" without warranties of any kind. We are not liable for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400">
                  <li>Any health decisions made based on information from Lumora</li>
                  <li>Loss of data due to browser cache clearing or technical issues</li>
                  <li>Inaccuracies or errors in AI-generated responses</li>
                  <li>Service interruptions or unavailability</li>
                  <li>Any damages arising from use of the service</li>
                </ul>
              </div>
            </section>

            {/* AI Model Information */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">7. AI Model & Processing</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  Lumora uses xAI Grok-2 model via OpenRouter API:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400">
                  <li>AI responses are generated automatically and may contain errors</li>
                  <li>We don't control or guarantee the accuracy of AI responses</li>
                  <li>Messages are processed by third-party AI providers</li>
                  <li>No personal identifiers are sent with AI requests</li>
                </ul>
              </div>
            </section>

            {/* Changes to Terms */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Changes to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these terms at any time. Continued use of Lumora 
                after changes constitutes acceptance of the modified terms. Check this page regularly 
                for updates.
              </p>
            </section>

            {/* Termination */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Termination</h2>
              <p className="leading-relaxed">
                You may stop using Lumora at any time. We reserve the right to terminate or restrict 
                access to the service at our discretion without notice.
              </p>
            </section>

            {/* Governing Law */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">10. Governing Law</h2>
              <p className="leading-relaxed">
                These terms are governed by applicable laws. Any disputes shall be resolved in 
                accordance with the laws of the jurisdiction where the service is operated.
              </p>
            </section>

            {/* Contact */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">11. Contact</h2>
              <p className="leading-relaxed">
                For questions about these terms, please visit our Support page or contact us through 
                the available channels in the application.
              </p>
            </section>

            {/* Final Notice */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-amber-400 mb-2">Important Reminder</h3>
                  <p className="text-amber-200/90 leading-relaxed">
                    By using Lumora, you acknowledge that you have read, understood, and agree to these 
                    Terms of Service. You also acknowledge that Lumora is not a medical service and should 
                    never be used as a substitute for professional medical care.
                  </p>
                </div>
              </div>
            </div>

            {/* Acceptance Button */}
            {mounted && (
              <div className="bg-white/10 border border-white/30 rounded-xl p-6">
                <div className="text-center">
                  {hasAccepted ? (
                    <div className="flex items-center justify-center gap-3 text-green-400">
                      <Check className="w-6 h-6" />
                      <span className="text-lg font-semibold">Terms Accepted</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-white text-lg font-semibold">
                        Do you accept these Terms of Service?
                      </p>
                      <button
                        onClick={handleAccept}
                        className="bg-white hover:bg-zinc-100 text-black px-8 py-3 rounded-lg font-semibold transition-colors"
                      >
                        I Accept the Terms of Service
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
