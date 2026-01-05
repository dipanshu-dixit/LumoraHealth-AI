'use client';

import { useState, useEffect } from 'react';
import { Activity, TrendingUp, Calendar, Download, AlertCircle, Pill, Heart, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import NavigationSidebar from '../components/NavigationSidebar';
import { ChatStorage } from '../lib/chatStorage';
import { HealthTimeline, type SymptomEntry, type MedicationEntry, type HealthInsight } from '../lib/healthTimeline';

export default function Timeline() {
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [medications, setMedications] = useState<MedicationEntry[]>([]);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [healthScore, setHealthScore] = useState(0);

  useEffect(() => {
    const cached = localStorage.getItem('lumora-health-cache');
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setSymptoms(data.symptoms || []);
        setMedications(data.medications || []);
        setInsights(data.insights || []);
        setHealthScore(data.healthScore || 0);
        setDataLoaded(true);
      } catch (e) {
        console.error('Failed to load cached health data');
      }
    }
  }, []);

  const loadHealthData = async () => {
    setLoading(true);
    setDataLoaded(true);
    try {
      const chats = ChatStorage.getAllChats();
      const data = await HealthTimeline.extractHealthData(chats);
      
      setSymptoms(data.symptoms);
      setMedications(data.medications);
      setInsights(data.insights);
      setHealthScore(HealthTimeline.calculateHealthScore(data));
      
      localStorage.setItem('lumora-health-cache', JSON.stringify({
        symptoms: data.symptoms,
        medications: data.medications,
        insights: data.insights,
        healthScore: HealthTimeline.calculateHealthScore(data),
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to load health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    const chats = ChatStorage.getAllChats();
    const userName = typeof window !== 'undefined' ? localStorage.getItem('lumora-user-name') || 'User' : 'User';
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lumora Health Report - ${userName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; padding: 40px; border-radius: 12px; margin-bottom: 30px; }
    .header h1 { margin: 0 0 10px 0; font-size: 42px; font-family: Georgia, serif; font-style: italic; font-weight: 300; }
    .header p { margin: 5px 0; opacity: 0.9; }
    .score { background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .score-value { font-size: 72px; font-weight: bold; color: ${healthScore >= 80 ? '#4ade80' : healthScore >= 60 ? '#facc15' : '#f87171'}; }
    .section { background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .section h2 { color: #14b8a6; margin-top: 0; border-bottom: 2px solid #14b8a6; padding-bottom: 10px; }
    .symptom { background: #fef2f2; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #ef4444; }
    .medication { background: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #3b82f6; }
    .insight { background: #f5f3ff; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #8b5cf6; }
    .footer { text-align: center; color: #6b7280; margin-top: 40px; padding: 20px; font-size: 14px; }
    @media print { body { background: white; } .section { box-shadow: none; page-break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Lumora</h1>
    <p><strong>${userName}</strong></p>
    <p>Health Intelligence Report</p>
    <p>Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
  </div>

  <div class="score">
    <h2 style="color: #14b8a6; margin-bottom: 20px;">Overall Health Score</h2>
    <div class="score-value">${healthScore}</div>
    <p style="color: #6b7280; margin-top: 10px;">Based on ${chats.length} conversation${chats.length !== 1 ? 's' : ''}</p>
  </div>

  ${symptoms.length > 0 ? `
  <div class="section">
    <h2>🩺 Symptoms Tracked</h2>
    ${symptoms.map(s => `
      <div class="symptom">
        <h3 style="margin: 0 0 10px 0; text-transform: capitalize;">${s.name}</h3>
        <p style="margin: 5px 0; color: #6b7280;">Occurrences: ${s.dates.length}</p>
        <p style="margin: 5px 0; color: #6b7280;">Average Severity: ${(s.severity.reduce((a,b) => a+b, 0) / s.severity.length).toFixed(1)}/10</p>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${medications.length > 0 ? `
  <div class="section">
    <h2>💊 Medications</h2>
    ${medications.map(m => `
      <div class="medication">
        <h3 style="margin: 0 0 10px 0;">${m.name}</h3>
        <p style="margin: 5px 0; color: #6b7280;">Started: ${new Date(m.startDate).toLocaleDateString()}</p>
        <p style="margin: 5px 0; color: #6b7280;">Frequency: ${m.frequency}</p>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${insights.length > 0 ? `
  <div class="section">
    <h2>🧠 AI Health Insights</h2>
    ${insights.map(i => `
      <div class="insight">
        <h3 style="margin: 0 0 10px 0;">${i.pattern}</h3>
        <p style="margin: 5px 0; color: #4b5563;">${i.recommendation}</p>
        <p style="margin: 10px 0 0 0; color: #8b5cf6; font-size: 14px;">Confidence: ${Math.round(i.confidence * 100)}%</p>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="footer">
    <p><strong>Lumora AI v1.1</strong> • Privacy-First Health Intelligence</p>
    <p>This data is exported from your local device storage. No data was sent to external servers.</p>
    <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">To save as PDF: Press Ctrl+P (Cmd+P on Mac) → Select "Save as PDF"</p>
  </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lumora-Health-Report-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!dataLoaded) {
    return (
      <>
        <NavigationSidebar user={{ name: typeof window !== 'undefined' ? localStorage.getItem('lumora-user-name') || 'User' : 'User' }} />
        <div className="h-full flex items-center justify-center bg-[var(--bg-page)]">
          <div className="text-center">
            <Brain className="w-16 h-16 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">No Health Data</h2>
            <p className="text-zinc-400 mb-6">Analyze your health from the Dashboard first</p>
            <button
              onClick={loadHealthData}
              disabled={loading}
              className="px-6 py-3 bg-white hover:bg-zinc-100 disabled:bg-teal-800 text-black rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
            >
              <Activity className="w-5 h-5" />
              {loading ? 'Analyzing...' : 'Analyze Now'}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavigationSidebar user={{ name: typeof window !== 'undefined' ? localStorage.getItem('lumora-user-name') || 'User' : 'User' }} />
      
      <div className="h-full overflow-y-auto bg-[var(--bg-page)] pt-16">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 pb-20">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Health Timeline</h1>
              <p className="text-zinc-400">Longitudinal health intelligence from your conversations</p>
            </div>
            <div className="flex gap-3">
              {dataLoaded && (
                <button
                  onClick={loadHealthData}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg transition-colors"
                >
                  <Activity className="w-4 h-4" />
                  {loading ? 'Refreshing...' : 'Refresh Report'}
                </button>
              )}
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-100 text-black rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Summary
              </button>
            </div>
          </div>

          {/* Health Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-white mb-1">Overall Health Score</h2>
                <p className="text-zinc-400 text-sm">Based on conversation analysis</p>
              </div>
              <div className={`text-5xl font-bold ${getScoreColor(healthScore)}`}>
                {healthScore}
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <h3 className="text-white font-medium">Symptoms Tracked</h3>
              </div>
              <p className="text-3xl font-bold text-white">{symptoms.length}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <Pill className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-medium">Medications</h3>
              </div>
              <p className="text-3xl font-bold text-white">{medications.length}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-medium">AI Insights</h3>
              </div>
              <p className="text-3xl font-bold text-white">{insights.length}</p>
            </motion.div>
          </div>

          {/* Symptoms Timeline */}
          {symptoms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6"
            >
              <h2 className="text-xl font-medium text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-400" />
                Symptom Tracker
              </h2>
              <div className="space-y-4">
                {symptoms.map((symptom, idx) => (
                  <div key={idx} className="border-l-4 border-red-400 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium capitalize">{symptom.name}</h3>
                      <span className="text-zinc-400 text-sm">{symptom.dates.length} occurrences</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {symptom.dates.slice(0, 5).map((date, i) => (
                        <span key={i} className="px-2 py-1 bg-red-900/20 text-red-400 text-xs rounded">
                          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      ))}
                      {symptom.dates.length > 5 && (
                        <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded">
                          +{symptom.dates.length - 5} more
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-zinc-500 text-xs">Avg Severity:</span>
                      <div className="flex gap-1">
                        {[...Array(10)].map((_, i) => {
                          const avgSeverity = Array.isArray(symptom.severity) && symptom.severity.length > 0
                            ? symptom.severity.reduce((a, b) => a + b, 0) / symptom.severity.length
                            : 5;
                          return (
                            <div
                              key={i}
                              className={`w-2 h-4 rounded ${
                                i < avgSeverity ? 'bg-red-500' : 'bg-zinc-700'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Medications */}
          {medications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6"
            >
              <h2 className="text-xl font-medium text-white mb-4 flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-400" />
                Medication Adherence
              </h2>
              <div className="space-y-3">
                {medications.map((med, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">{med.name}</h3>
                      <p className="text-zinc-400 text-sm">Started: {new Date(med.startDate).toLocaleDateString()}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-900/20 text-blue-400 text-sm rounded-full">
                      {med.frequency}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* AI Insights */}
          {insights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
            >
              <h2 className="text-xl font-medium text-white mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                AI-Powered Insights
              </h2>
              <div className="space-y-4">
                {insights.map((insight, idx) => (
                  <div key={idx} className="p-4 bg-purple-900/10 border border-purple-800/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">{insight.pattern}</h3>
                        <p className="text-zinc-400 text-sm mb-2">{insight.recommendation}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500">Confidence:</span>
                          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden max-w-xs">
                            <div
                              className="h-full bg-purple-500"
                              style={{ width: `${insight.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-400">{Math.round(insight.confidence * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {symptoms.length === 0 && medications.length === 0 && insights.length === 0 && (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
              <h3 className="text-xl font-medium text-white mb-2">No Health Data Yet</h3>
              <p className="text-zinc-400">Start conversations to build your health timeline</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
