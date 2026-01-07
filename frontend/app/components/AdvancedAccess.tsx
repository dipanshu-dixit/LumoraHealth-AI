'use client';

import { useState } from 'react';
import { Shield, Mail, CheckCircle, Clock, Settings, Zap, Database, Lock } from 'lucide-react';
import { getDeviceId } from '../lib/deviceId';
import toast from 'react-hot-toast';

interface AdvancedAccessProps {
  isOpen: boolean;
  onClose: () => void;
  onAccessGranted: () => void;
}

export default function AdvancedAccess({ isOpen, onClose, onAccessGranted }: AdvancedAccessProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [deviceIdInput, setDeviceIdInput] = useState('');
  const [showDeviceIdInput, setShowDeviceIdInput] = useState(false);

  // Check if user has already submitted a request
  useState(() => {
    if (typeof window !== 'undefined') {
      const hasSubmitted = localStorage.getItem('lumora-access-requested');
      if (hasSubmitted === 'true') {
        setIsSubmitted(true);
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    const deviceId = getDeviceId();
    
    try {
      // Send email with device ID for approval
      const subject = encodeURIComponent('Lumora Advanced Settings Access Request');
      const body = encodeURIComponent(`Hi,

I would like to access the Advanced Settings in Lumora for testing and feedback.

My details:
- Email: ${email}
- Device ID: ${deviceId}
- Timestamp: ${new Date().toISOString()}

Please approve my access to help improve Lumora.

Thank you!`);
      
      // Open Gmail compose with pre-filled details
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=dipanshudixit206@gmail.com&su=${subject}&body=${body}`;
      window.open(gmailUrl, '_blank');
      
      setIsSubmitted(true);
      localStorage.setItem('lumora-access-requested', 'true');
      toast.success('Request sent! Check your email app.');
    } catch (error) {
      console.error('Email error:', error);
      toast.error('Failed to send request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkAccess = () => {
    const deviceId = getDeviceId();
    
    // Check approved devices list from admin panel
    const approvedList = localStorage.getItem('lumora-approved-devices-list');
    if (approvedList) {
      const approvedDevices = JSON.parse(approvedList);
      if (approvedDevices.includes(deviceId)) {
        localStorage.setItem('lumora-advanced-access', 'approved');
        onAccessGranted();
        return;
      }
    }
    
    toast.error('Access not yet approved. Please wait for email confirmation.');
  };

  const resetRequest = () => {
    setIsSubmitted(false);
    setEmail('');
    setShowDeviceIdInput(false);
    setDeviceIdInput('');
    localStorage.removeItem('lumora-access-requested');
    toast.success('Request reset. You can submit a new request.');
  };

  const enterDeviceId = () => {
    if (!deviceIdInput.trim()) {
      toast.error('Please enter a device ID');
      return;
    }
    
    const approvedList = localStorage.getItem('lumora-approved-devices-list');
    if (approvedList) {
      const approvedDevices = JSON.parse(approvedList);
      if (approvedDevices.includes(deviceIdInput.trim())) {
        localStorage.setItem('lumora-advanced-access', 'approved');
        onAccessGranted();
        return;
      }
    }
    
    toast.error('Device ID not found in approved list.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full p-4 sm:p-8 max-h-[90vh] overflow-y-auto relative animate-in slide-in-from-bottom-4 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-10"
        >
          ✕
        </button>
        
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-full mb-4">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-teal-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent mb-2">
            Advanced Settings Access
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Request access to advanced configuration options
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 sm:p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
              What's included:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-zinc-300">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                AI Parameters Control
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                Storage Management
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-green-400" />
                Encryption Testing
              </div>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-400" />
                UI Preferences
              </div>
            </div>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-zinc-500 mt-2">
                  We'll send you an approval notification
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:from-zinc-700 disabled:to-zinc-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Request Access
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Request Sent!</h3>
                <p className="text-zinc-400 text-sm mb-4">
                  Your access request has been sent. You'll receive approval via email.
                </p>
                
                {!showDeviceIdInput ? (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        onClick={checkAccess}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 justify-center"
                      >
                        <Clock className="w-4 h-4" />
                        Check Access Status
                      </button>
                      <button
                        onClick={() => setShowDeviceIdInput(true)}
                        className="text-teal-400 hover:text-teal-300 text-sm underline py-2"
                      >
                        Already approved? Enter Device ID
                      </button>
                    </div>
                    <button
                      onClick={resetRequest}
                      className="text-zinc-500 hover:text-zinc-400 text-xs underline mt-2"
                    >
                      Reset & Submit New Request
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={deviceIdInput}
                      onChange={(e) => setDeviceIdInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && enterDeviceId()}
                      placeholder="Enter your approved Device ID"
                      className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-center"
                    />
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        onClick={enterDeviceId}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Verify Access
                      </button>
                      <button
                        onClick={() => setShowDeviceIdInput(false)}
                        className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-zinc-500 space-y-2">
          <div>Device ID: {typeof window !== 'undefined' ? getDeviceId() : 'Loading...'}</div>
        </div>
      </div>
    </div>
  );
}