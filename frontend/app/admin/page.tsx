'use client';

import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [approvedDevices, setApprovedDevices] = useState<string[]>([]);
  const [newDeviceId, setNewDeviceId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lumora-approved-devices-list');
    if (saved) {
      setApprovedDevices(JSON.parse(saved));
    }
  }, []);

  const authenticate = () => {
    if (adminPassword === 'lumora2024') {
      setIsAuthenticated(true);
      toast.success('Admin access granted');
    } else {
      toast.error('Invalid password');
    }
  };

  const addDevice = () => {
    if (!newDeviceId.trim()) return;
    
    const updated = [...approvedDevices, newDeviceId.trim()];
    setApprovedDevices(updated);
    localStorage.setItem('lumora-approved-devices-list', JSON.stringify(updated));
    setNewDeviceId('');
    toast.success('Device approved!');
  };

  const removeDevice = (deviceId: string) => {
    const updated = approvedDevices.filter(id => id !== deviceId);
    setApprovedDevices(updated);
    localStorage.setItem('lumora-approved-devices-list', JSON.stringify(updated));
    toast.success('Device removed');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-teal-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-zinc-400">Enter password to manage device approvals</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && authenticate()}
              placeholder="Admin password"
              className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={authenticate}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-teal-400" />
            <h1 className="text-3xl font-bold text-white">Device Approval Admin</h1>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-6">
            <p className="text-yellow-300 text-sm">
              <strong>Note:</strong> After approving a device here, tell the user to run this in their browser console (F12):
              <br />
              <code className="bg-black/50 px-2 py-1 rounded mt-2 inline-block">
                localStorage.setItem(&apos;lumora-advanced-access&apos;, &apos;approved&apos;)
              </code>
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Approve New Device</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={newDeviceId}
                onChange={(e) => setNewDeviceId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addDevice()}
                placeholder="Enter Device ID from email"
                className="flex-1 bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500"
              />
              <button
                onClick={addDevice}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Approve
              </button>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Approved Devices ({approvedDevices.length})
            </h2>
            
            {approvedDevices.length === 0 ? (
              <p className="text-zinc-400 text-center py-8">No devices approved yet</p>
            ) : (
              <div className="space-y-3">
                {approvedDevices.map((deviceId, index) => (
                  <div key={index} className="flex items-center justify-between bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-400" />
                      <span className="text-white font-mono">{deviceId}</span>
                    </div>
                    <button
                      onClick={() => removeDevice(deviceId)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}