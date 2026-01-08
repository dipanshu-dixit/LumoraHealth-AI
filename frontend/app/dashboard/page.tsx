'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, Calendar, TrendingUp, MessageCircle, Plus, Target, MessageSquarePlus, History, Pill, Settings, AlertCircle, Heart, Download, Zap, Sparkles } from 'lucide-react';
import NavigationSidebar from '../components/NavigationSidebar';
import { ChatStorage } from '../lib/chatStorage';
import { HealthTimeline, type SymptomEntry, type MedicationEntry, type HealthInsight } from '../lib/healthTimeline';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('User');
  const [todayMood, setTodayMood] = useState('');
  const [todayEnergy, setTodayEnergy] = useState('');
  const [quickNote, setQuickNote] = useState('');
  const [healthNotes, setHealthNotes] = useState<Array<{id: number, text: string, date: string}>>([]);
  const [healthGoals, setHealthGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [medications, setMedications] = useState<MedicationEntry[]>([]);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [healthScore, setHealthScore] = useState(0);
  const [stats, setStats] = useState({
    totalChats: 0,
    thisWeek: 0,
    topCategory: 'General Health',
    streak: 0
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserName(localStorage.getItem('lumora-user-name') || 'User');
      
      const today = new Date().toDateString();
      const moodDate = localStorage.getItem('lumora-mood-date');
      const energyDate = localStorage.getItem('lumora-energy-date');
      
      if (moodDate === today) {
        setTodayMood(localStorage.getItem('lumora-today-mood') || '');
      } else {
        setTodayMood('');
        localStorage.removeItem('lumora-today-mood');
        localStorage.removeItem('lumora-mood-date');
      }
      
      if (energyDate === today) {
        setTodayEnergy(localStorage.getItem('lumora-today-energy') || '');
      } else {
        setTodayEnergy('');
        localStorage.removeItem('lumora-today-energy');
        localStorage.removeItem('lumora-energy-date');
      }
      
      const notes = JSON.parse(localStorage.getItem('lumora-daily-notes') || '[]');
      setHealthNotes(notes);
      
      const goals = JSON.parse(localStorage.getItem('lumora-health-goals') || '[]');
      setHealthGoals(goals);
      
      // Load cached health data
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
    }
  }, []);

  const loadHealthTimeline = async () => {
    setLoading(true);
    setDataLoaded(true);
    try {
      const chats = ChatStorage.getAllChats();
      const data = await HealthTimeline.extractHealthData(chats);
      
      setSymptoms(data.symptoms);
      setMedications(data.medications);
      
      const filteredInsights = data.insights.map(insight => {
        if (insight.recommendation.toLowerCase().includes('consult') || 
            insight.recommendation.toLowerCase().includes('healthcare provider')) {
          return null;
        }
        return insight;
      }).filter(Boolean) as HealthInsight[];
      
      setInsights(filteredInsights);
      
      const score = HealthTimeline.calculateHealthScore(data);
      let current = 0;
      const increment = score / 20;
      const timer = setInterval(() => {
        current += increment;
        if (current >= score) {
          setHealthScore(score);
          clearInterval(timer);
        } else {
          setHealthScore(Math.floor(current));
        }
      }, 50);
      
      // Cache the results
      localStorage.setItem('lumora-health-cache', JSON.stringify({
        symptoms: data.symptoms,
        medications: data.medications,
        insights: filteredInsights,
        healthScore: score,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to load health timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Calculate stats separately to avoid blocking render
    const calculateStats = () => {
      const chats = ChatStorage.getAllChats();
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisWeekChats = chats.filter(c => c.timestamp >= weekAgo);
      
      // Calculate streak (days with at least one chat)
      let streak = 0;
      for (let i = 0; i < 30; i++) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        const dayChats = chats.filter(c => c.timestamp >= dayStart && c.timestamp <= dayEnd);
        if (dayChats.length > 0) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }
      
      // Find most common category
      const categories = chats.map(c => ChatStorage.categorizeChat(c.topic));
      const categoryCount = categories.reduce((acc, cat) => {
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const topCategory = Object.entries(categoryCount).sort(([,a], [,b]) => b - a)[0]?.[0] || 'General Health';
      
      setStats({
        totalChats: chats.length,
        thisWeek: thisWeekChats.length,
        topCategory,
        streak
      });
    };

    calculateStats();
  }, []);

  const saveMood = (mood: string) => {
    setTodayMood(mood);
    localStorage.setItem('lumora-today-mood', mood);
    localStorage.setItem('lumora-mood-date', new Date().toDateString());
  };

  const saveEnergy = (energy: string) => {
    setTodayEnergy(energy);
    localStorage.setItem('lumora-today-energy', energy);
    localStorage.setItem('lumora-energy-date', new Date().toDateString());
  };

  const addQuickNote = () => {
    if (!quickNote.trim()) return;
    
    const newNote = {
      id: Date.now(),
      text: quickNote.trim(),
      date: new Date().toLocaleDateString()
    };
    
    const updatedNotes = [newNote, ...healthNotes].slice(0, 10);
    setHealthNotes(updatedNotes);
    localStorage.setItem('lumora-daily-notes', JSON.stringify(updatedNotes));
    setQuickNote('');
  };

  const deleteNote = (id: number) => {
    const updatedNotes = healthNotes.filter(note => note.id !== id);
    setHealthNotes(updatedNotes);
    localStorage.setItem('lumora-daily-notes', JSON.stringify(updatedNotes));
  };

  const addHealthGoal = () => {
    if (!newGoal.trim()) return;
    const updatedGoals = [...healthGoals, newGoal.trim()];
    setHealthGoals(updatedGoals);
    localStorage.setItem('lumora-health-goals', JSON.stringify(updatedGoals));
    setNewGoal('');
  };

  const removeGoal = (index: number) => {
    const updatedGoals = healthGoals.filter((_, i) => i !== index);
    setHealthGoals(updatedGoals);
    localStorage.setItem('lumora-health-goals', JSON.stringify(updatedGoals));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const exportSummary = async () => {
    toast.loading('Preparing your health report...', { id: 'export' });
    
    const chats = ChatStorage.getAllChats();
    const summary = await HealthTimeline.generateMedicalSummary(chats);
    
    const userData = {
      user: { name: userName, exportDate: new Date().toISOString() },
      chatHistory: chats,
      symptoms,
      medications,
      insights,
      healthScore
    };

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
    ${symptoms.map(s => {
      const avgSeverity = Array.isArray(s.severity) && s.severity.length > 0
        ? (s.severity.reduce((a,b) => a+b, 0) / s.severity.length).toFixed(1)
        : '5.0';
      return `
      <div class="symptom">
        <h3 style="margin: 0 0 10px 0; text-transform: capitalize;">${s.name}</h3>
        <p style="margin: 5px 0; color: #6b7280;">Occurrences: ${s.dates.length}</p>
        <p style="margin: 5px 0; color: #6b7280;">Average Severity: ${avgSeverity}/10</p>
      </div>
    `}).join('')}
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
    const link = document.createElement('a');
    link.href = url;
    link.download = `Lumora-Health-Report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Health report exported! Open the HTML file and print to save as PDF.', { id: 'export', duration: 5000 });
  };

  return (
    <>
      <NavigationSidebar user={{ name: userName }} />
      
      <div className="h-full overflow-y-auto bg-[var(--bg-page)] lg:ml-16 transition-all duration-400">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#18181b',
              color: '#FFFFFF',
              border: '1px solid #39D3BB',
            },
          }}
        />
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 pb-20 lg:pb-8 mt-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-light text-white mb-2 flex items-center gap-3">
                Health <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-medium">Overview</span>
              </h1>
              <p className="text-zinc-400">Your personalized wellness dashboard</p>
            </div>
            <div className="flex gap-3">
              {dataLoaded && (
                <button
                  onClick={loadHealthTimeline}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg transition-colors"
                >
                  <Brain className="w-4 h-4" />
                  {loading ? 'Analyzing...' : 'Refresh AI'}
                </button>
              )}
              <button
                onClick={exportSummary}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-100 text-black rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>

          {/* Hero Health Score */}
          {!dataLoaded ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 bg-zinc-900 border border-white/30 rounded-2xl p-12 text-center"
            >
              <Brain className="w-16 h-16 text-white mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-3">AI Health Analysis</h2>
              <p className="text-zinc-400 mb-6">Get personalized insights from your health conversations</p>
              <button
                onClick={loadHealthTimeline}
                disabled={loading}
                className="px-6 py-3 bg-white hover:bg-zinc-100 disabled:bg-zinc-800 text-black disabled:text-zinc-600 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-5 h-5" />
                {loading ? 'Analyzing...' : 'Analyze My Health'}
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 bg-zinc-900 border border-white/30 rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-purple-500/5" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-6 h-6 text-white" />
                    <h2 className="text-2xl font-bold text-white">Health Score</h2>
                  </div>
                  <p className="text-zinc-400 mb-4">Based on {stats.totalChats} conversation{stats.totalChats !== 1 ? 's' : ''}</p>
                  <div className="flex gap-4">
                    <div className="bg-zinc-800/50 rounded-lg px-4 py-2 border border-zinc-700">
                      <div className="text-zinc-400 text-xs mb-1">This Week</div>
                      <div className="text-white text-xl font-bold">{stats.thisWeek}</div>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg px-4 py-2 border border-zinc-700">
                      <div className="text-zinc-400 text-xs mb-1">Streak</div>
                      <div className="text-orange-400 text-xl font-bold">{stats.streak}d</div>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg px-4 py-2 border border-zinc-700">
                      <div className="text-zinc-400 text-xs mb-1">Tracked</div>
                      <div className="text-purple-400 text-xl font-bold">{symptoms.length}</div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  {loading ? (
                    <div className="w-40 h-40 rounded-full border-8 border-zinc-800 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    <div className="relative w-40 h-40">
                      <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
                        <circle
                          cx="80"
                          cy="80"
                          r="72"
                          stroke="#27272a"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="72"
                          stroke={healthScore >= 80 ? '#4ade80' : healthScore >= 60 ? '#facc15' : '#f87171'}
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(healthScore / 100) * 452} 452`}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dasharray 1s ease-out' }}
                        />
                      </svg>
                      <div className={`absolute inset-0 flex items-center justify-center text-6xl font-bold ${getScoreColor(healthScore)}`}>
                        {healthScore}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* AI Insights */}
            {dataLoaded && (loading ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:col-span-2 lg:col-span-3 bg-zinc-900 border border-purple-500/30 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
                  <h2 className="text-xl font-bold text-white">AI Health Insights</h2>
                </div>
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400 mx-auto mb-4"></div>
                    <p className="text-zinc-400">Analyzing your health patterns...</p>
                  </div>
                </div>
              </motion.div>
            ) : insights.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:col-span-2 lg:col-span-3 bg-zinc-900 border border-purple-500/30 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-bold text-white">AI Health Insights</h2>
                  <span className="ml-auto text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
                    {insights.length} pattern{insights.length !== 1 ? 's' : ''} detected
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.slice(0, 4).map((insight, idx) => (
                    <div key={idx} className="bg-zinc-800/50 border border-purple-500/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-white font-medium mb-1">{insight.pattern}</h3>
                          <p className="text-zinc-400 text-sm mb-2">{insight.recommendation}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500"
                                style={{ width: `${insight.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-zinc-500">{Math.round(insight.confidence * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {insights.length > 4 && (
                  <button
                    onClick={() => router.push('/timeline')}
                    className="mt-4 w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors text-sm"
                  >
                    View all {insights.length} insights →
                  </button>
                )}
              </motion.div>
            ) : null)}

            {/* Symptoms Tracker */}
            {dataLoaded && symptoms.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-zinc-900 border border-red-500/30 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <h2 className="text-lg font-medium text-white">Recent Symptoms</h2>
                </div>
                <div className="space-y-3">
                  {symptoms.slice(0, 3).map((symptom, idx) => (
                    <div key={idx} className="border-l-4 border-red-400 pl-3 py-2 bg-red-900/10 rounded-r">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-medium capitalize text-sm">{symptom.name}</h3>
                        <span className="text-zinc-400 text-xs">{symptom.dates.length}x</span>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(10)].map((_, i) => {
                          const avgSeverity = Array.isArray(symptom.severity) && symptom.severity.length > 0
                            ? symptom.severity.reduce((a, b) => a + b, 0) / symptom.severity.length
                            : 5;
                          return (
                            <div
                              key={i}
                              className={`w-1.5 h-3 rounded ${
                                i < avgSeverity ? 'bg-red-500' : 'bg-zinc-700'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {symptoms.length > 3 && (
                  <button
                    onClick={() => router.push('/timeline')}
                    className="mt-3 w-full py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-colors text-sm"
                  >
                    View all symptoms →
                  </button>
                )}
              </motion.div>
            )}

            {/* Medications */}
            {dataLoaded && medications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-zinc-900 border border-blue-500/30 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Pill className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-medium text-white">Medications</h2>
                </div>
                <div className="space-y-2">
                  {medications.slice(0, 3).map((med, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-blue-900/10 border border-blue-500/20 rounded-lg">
                      <div>
                        <h3 className="text-white font-medium text-sm">{med.name}</h3>
                        <p className="text-zinc-400 text-xs">{med.frequency}</p>
                      </div>
                      <span className="text-xs text-blue-400">
                        {new Date(med.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
                {medications.length > 3 && (
                  <button
                    onClick={() => router.push('/timeline')}
                    className="mt-3 w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-colors text-sm"
                  >
                    View all medications →
                  </button>
                )}
              </motion.div>
            )}

            {/* Today's Health Check */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900 border border-white/30 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-medium text-white">Today's Health Check</h2>
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full hidden sm:inline">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-300 text-sm">Energy Level</span>
                    <span className="text-xs text-zinc-500">{todayEnergy || 'Not set'}</span>
                  </div>
                  <div className="flex gap-1">
                    {['Low', 'Fair', 'Good', 'High', 'Excellent'].map((level, i) => {
                      const isSelected = todayEnergy === level;
                      const colors = ['bg-red-600', 'bg-orange-500', 'bg-yellow-400', 'bg-lime-500', 'bg-emerald-400'];
                      return (
                        <button
                          key={level}
                          onClick={() => saveEnergy(level)}
                          className={`flex-1 h-3 rounded-full transition-all border ${
                            isSelected 
                              ? `${colors[i]} border-white/30 shadow-lg` 
                              : 'bg-zinc-700 hover:bg-zinc-600 border-zinc-600'
                          }`}
                          title={level}
                        />
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-300 text-sm">Mood Rating</span>
                    <span className="text-xs text-zinc-500">{todayMood || 'Not set'}</span>
                  </div>
                  <div className="flex gap-1">
                    {['Poor', 'Fair', 'Good', 'Great', 'Amazing'].map((mood, i) => {
                      const isSelected = todayMood === mood;
                      const colors = ['bg-red-600', 'bg-orange-500', 'bg-yellow-400', 'bg-blue-500', 'bg-emerald-400'];
                      return (
                        <button
                          key={mood}
                          onClick={() => saveMood(mood)}
                          className={`flex-1 h-3 rounded-full transition-all border ${
                            isSelected 
                              ? `${colors[i]} border-white/30 shadow-lg` 
                              : 'bg-zinc-700 hover:bg-zinc-600 border-zinc-600'
                          }`}
                          title={mood}
                        />
                      );
                    })}
                  </div>
                </div>

                {(todayMood || todayEnergy) && (
                  <div className="pt-3 border-t border-zinc-800">
                    <div className="text-xs text-zinc-400 mb-2">Health Insight</div>
                    <div className="text-sm text-zinc-300">
                      {todayMood === 'Poor' || todayEnergy === 'Low' ? (
                        <span className="text-orange-400">Consider rest, hydration, or light exercise today.</span>
                      ) : todayMood === 'Amazing' && todayEnergy === 'Excellent' ? (
                        <span className="text-green-400">Great day! Perfect time for challenging activities.</span>
                      ) : (
                        <span className="text-blue-400">You're doing well. Keep maintaining healthy habits.</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Health Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Health Notes</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-2 items-stretch">
                  <input
                    type="text"
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addQuickNote()}
                    placeholder="Add a health observation..."
                    className="flex-1 min-w-0 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)] focus:outline-none focus:border-teal-500 transition-colors"
                  />
                  <button
                    onClick={addQuickNote}
                    className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {healthNotes.map((note) => (
                    <div key={note.id} className="flex items-start justify-between bg-zinc-800/40 border border-zinc-700/30 p-4 rounded-lg hover:bg-zinc-800/60 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm leading-relaxed">{note.text}</p>
                        <p className="text-zinc-400 text-xs mt-2">{note.date}</p>
                      </div>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-zinc-400 hover:text-red-400 text-lg w-6 h-6 flex items-center justify-center ml-3 flex-shrink-0 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Health Goals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Target className="w-5 h-5 text-green-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Health Objectives</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-2 items-stretch">
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addHealthGoal()}
                    placeholder="Set a health objective..."
                    className="flex-1 min-w-0 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)] focus:outline-none focus:border-teal-500 transition-colors"
                  />
                  <button
                    onClick={addHealthGoal}
                    className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {healthGoals.map((goal, index) => (
                    <div key={index} className="flex items-center justify-between bg-zinc-800/40 border border-zinc-700/30 p-4 rounded-lg hover:bg-zinc-800/60 transition-colors">
                      <span className="text-white text-sm leading-relaxed">{goal}</span>
                      <button
                        onClick={() => removeGoal(index)}
                        className="text-zinc-400 hover:text-red-400 text-lg w-6 h-6 flex items-center justify-center transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="md:col-span-2 lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-medium text-white">Quick Actions</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <button
                  onClick={() => router.push('/')}
                  className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 p-4 rounded-lg transition-all hover:scale-105 text-center"
                >
                  <MessageSquarePlus className="w-6 h-6 text-teal-400 mx-auto mb-2" />
                  <span className="text-white text-sm font-medium">New Chat</span>
                </button>
                
                <button
                  onClick={() => router.push('/history')}
                  className="bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 p-4 rounded-lg transition-all hover:scale-105 text-center"
                >
                  <History className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <span className="text-white text-sm font-medium">History</span>
                </button>
                
                <button
                  onClick={() => router.push('/timeline')}
                  className="bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 p-4 rounded-lg transition-all hover:scale-105 text-center"
                >
                  <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <span className="text-white text-sm font-medium">Timeline</span>
                </button>
                
                <button
                  onClick={() => router.push('/medicines')}
                  className="bg-orange-600/20 border border-orange-500/30 hover:bg-orange-600/30 p-4 rounded-lg transition-all hover:scale-105 text-center"
                >
                  <Pill className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                  <span className="text-white text-sm font-medium">Medicines</span>
                </button>
                
                <button
                  onClick={() => router.push('/settings')}
                  className="bg-gray-600/20 border border-gray-500/30 hover:bg-gray-600/30 p-4 rounded-lg transition-all hover:scale-105 text-center"
                >
                  <Settings className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <span className="text-white text-sm font-medium">Settings</span>
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
      <footer className="w-full py-6 text-center text-zinc-600 text-xs font-medium">
        <p>Lumora AI Health Assistant © 2026</p>
      </footer>
    </>
  );
}