'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Search, Eye, EyeOff, Lock, Settings, Users, Music } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import { getVideoUrl } from '@/lib/utils';

interface QuizSet {
  set_id: string;
  original_title: string;
  num_questions: number;
  quiz_mode: string;
  status: string;
}

interface Question {
  id: number;
  set_id: string;
  question_number: number;
  question_text: string;
  correct_answer: string;
  youtube_title: string;
  youtube_url: string;
  video_url: string;
  category: string;
}

interface Lead {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  instrument?: string;
  message?: string;
  created_at?: string;
}

interface OverlaySettings {
  height: number;
  offset: number;
  opacity: number;
  blur: boolean;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'sets' | 'overlay' | 'leads'>('sets');
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [stats, setStats] = useState({ total_sets: 0, total_questions: 0, categories_count: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSet, setSelectedSet] = useState<QuizSet | null>(null);
  const [selectedSetQuestions, setSelectedSetQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Overlay editor state
  const [overlaySetId, setOverlaySetId] = useState('');
  const [overlaySettings, setOverlaySettings] = useState<OverlaySettings>({
    height: 300,
    offset: 0,
    opacity: 0.95,
    blur: false,
  });
  const [savingOverlay, setSavingOverlay] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState('');

  // Leads state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.authenticated) {
        setAuthenticated(true);
        sessionStorage.setItem('admin_authenticated', 'true');
        sessionStorage.setItem('admin_token', password);
        setPassword('');
        // Load dashboard data
        await loadDashboardData();
      } else {
        setError(data.message || 'Invalid password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = useCallback(async () => {
    try {
      // Get stats and all sets
      const statsRes = await fetch('/api/quiz?stats=true');
      const statsData = await statsRes.json();
      setStats(statsData.data);

      const setsRes = await fetch('/api/quiz');
      const setsData = await setsRes.json();
      setQuizSets(setsData.data.sets || []);

      // Load leads
      await loadLeads();
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }, []);

  const loadLeads = async () => {
    setLoadingLeads(true);
    try {
      const token = sessionStorage.getItem('admin_token') || '';
      const response = await fetch('/api/admin/leads', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setLeads(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoadingLeads(false);
    }
  };

  const handleLoadQuestions = async (set: QuizSet) => {
    setSelectedSet(set);
    setLoadingQuestions(true);

    try {
      const response = await fetch(`/api/quiz?setId=${set.set_id}`);
      const data = await response.json();
      setSelectedSetQuestions(data.data?.questions || []);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSaveOverlay = async () => {
    if (!overlaySetId) {
      setOverlayMessage('Please select a quiz set');
      return;
    }

    setSavingOverlay(true);
    setOverlayMessage('');

    try {
      const response = await fetch('/api/overlay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setId: overlaySetId,
          height: overlaySettings.height,
          offset: overlaySettings.offset,
          opacity: overlaySettings.opacity / 100,
          blur: overlaySettings.blur ? 1 : 0,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOverlayMessage('Overlay settings saved successfully!');
        setTimeout(() => setOverlayMessage(''), 3000);
      } else {
        setOverlayMessage(data.error || 'Failed to save overlay settings');
      }
    } catch (err) {
      setOverlayMessage(err instanceof Error ? err.message : 'Error saving overlay settings');
    } finally {
      setSavingOverlay(false);
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_token');
    setPassword('');
    setActiveTab('sets');
  };

  // Check session on mount
  useEffect(() => {
    if (sessionStorage.getItem('admin_authenticated') === 'true') {
      setAuthenticated(true);
      loadDashboardData();
    }
  }, [loadDashboardData]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-bg via-slate-900 to-dark-bg flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-slate-900/50 backdrop-blur border border-slate-700 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-center mb-8">
              <div className="p-4 bg-gradient-to-br from-electric-violet to-deep-purple rounded-full">
                <Lock className="w-6 h-6 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-white mb-2">Admin Dashboard</h1>
            <p className="text-center text-slate-400 mb-8">Enter your password to continue</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Enter Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-electric-violet focus:ring-1 focus:ring-electric-violet transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/4 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-electric-violet to-deep-purple text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-electric-violet/50 transition disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // Dashboard
  const filteredSets = quizSets.filter((set) =>
    set.set_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-slate-900 to-dark-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-slate-400">Manage quiz sets, overlays, and leads</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-electric-violet/20 rounded-lg">
                  <Music className="w-6 h-6 text-electric-violet" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total Sets</p>
                  <p className="text-3xl font-bold text-white">{stats.total_sets}</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-deep-purple/20 rounded-lg">
                  <Users className="w-6 h-6 text-deep-purple" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total Questions</p>
                  <p className="text-3xl font-bold text-white">{stats.total_questions}</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 rounded-lg">
                  <Settings className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Categories</p>
                  <p className="text-3xl font-bold text-white">{stats.categories_count}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden"
        >
          <div className="flex border-b border-slate-700">
            {(['sets', 'overlay', 'leads'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 font-semibold transition ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-electric-violet/20 to-deep-purple/20 text-electric-violet border-b-2 border-electric-violet'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {tab === 'sets' && 'Quiz Sets'}
                {tab === 'overlay' && 'Overlay Editor'}
                {tab === 'leads' && 'Leads'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'sets' && (
                <motion.div key="sets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search by set ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-electric-violet"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Set ID</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Title</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Questions</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Mode</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSets.map((set) => (
                          <tr key={set.set_id} className="border-b border-slate-700 hover:bg-slate-800/30 transition">
                            <td className="px-6 py-4 text-white font-mono">{set.set_id}</td>
                            <td className="px-6 py-4 text-slate-300">{set.original_title}</td>
                            <td className="px-6 py-4 text-slate-300">{set.num_questions}</td>
                            <td className="px-6 py-4 text-slate-300">{set.quiz_mode}</td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                                {set.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleLoadQuestions(set)}
                                className="px-4 py-2 bg-electric-violet/20 hover:bg-electric-violet/30 text-electric-violet rounded-lg transition text-sm font-medium"
                              >
                                View Questions
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Questions Modal */}
                  <AnimatePresence>
                    {selectedSet && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedSet(null)}
                      >
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto"
                        >
                          <h3 className="text-2xl font-bold text-white mb-4">{selectedSet.original_title}</h3>

                          {loadingQuestions ? (
                            <div className="flex items-center justify-center py-12">
                              <div className="w-8 h-8 border-2 border-electric-violet border-r-transparent rounded-full animate-spin" />
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {selectedSetQuestions.map((q) => (
                                <div key={q.id} className="p-4 bg-slate-800 rounded-lg">
                                  <p className="font-semibold text-white mb-2">
                                    Q{q.question_number}: {q.question_text}
                                  </p>
                                  <p className="text-sm text-slate-400 mb-2">Category: {q.category}</p>
                                  <p className="text-sm text-electric-violet">Answer: {q.correct_answer}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          <button
                            onClick={() => setSelectedSet(null)}
                            className="w-full mt-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                          >
                            Close
                          </button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {activeTab === 'overlay' && (
                <motion.div key="overlay" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Settings Panel */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-3">
                          Select Quiz Set
                        </label>
                        <select
                          value={overlaySetId}
                          onChange={(e) => setOverlaySetId(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-electric-violet"
                        >
                          <option value="">Choose a set...</option>
                          {quizSets.map((set) => (
                            <option key={set.set_id} value={set.set_id}>
                              {set.set_id} - {set.original_title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="flex items-center justify-between text-sm font-semibold text-slate-300 mb-3">
                          Height: {overlaySettings.height}px
                        </label>
                        <input
                          type="range"
                          min="40"
                          max="70"
                          value={(overlaySettings.height / 12.5) - 3.2}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setOverlaySettings({ ...overlaySettings, height: Math.round((val + 3.2) * 12.5) });
                          }}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-electric-violet"
                        />
                        <p className="text-xs text-slate-500 mt-1">40-70% of screen height</p>
                      </div>

                      <div>
                        <label className="flex items-center justify-between text-sm font-semibold text-slate-300 mb-3">
                          Offset: {overlaySettings.offset}px
                        </label>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          value={overlaySettings.offset}
                          onChange={(e) => setOverlaySettings({ ...overlaySettings, offset: parseInt(e.target.value) })}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-electric-violet"
                        />
                        <p className="text-xs text-slate-500 mt-1">-50 to +50px vertical offset</p>
                      </div>

                      <div>
                        <label className="flex items-center justify-between text-sm font-semibold text-slate-300 mb-3">
                          Opacity: {overlaySettings.opacity}%
                        </label>
                        <input
                          type="range"
                          min="85"
                          max="100"
                          value={overlaySettings.opacity}
                          onChange={(e) => setOverlaySettings({ ...overlaySettings, opacity: parseInt(e.target.value) })}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-electric-violet"
                        />
                        <p className="text-xs text-slate-500 mt-1">85-100%</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-300">Enable Blur Effect</label>
                        <button
                          onClick={() => setOverlaySettings({ ...overlaySettings, blur: !overlaySettings.blur })}
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            overlaySettings.blur
                              ? 'bg-electric-violet text-white'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {overlaySettings.blur ? 'ON' : 'OFF'}
                        </button>
                      </div>

                      {overlayMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-lg text-sm ${
                            overlayMessage.includes('successfully')
                              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                              : 'bg-red-500/10 border border-red-500/30 text-red-400'
                          }`}
                        >
                          {overlayMessage}
                        </motion.div>
                      )}

                      <button
                        onClick={handleSaveOverlay}
                        disabled={savingOverlay || !overlaySetId}
                        className="w-full py-3 bg-gradient-to-r from-electric-violet to-deep-purple text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-electric-violet/50 transition disabled:opacity-50"
                      >
                        {savingOverlay ? 'Saving...' : 'Save Overlay Settings'}
                      </button>
                    </div>

                    {/* Preview Panel */}
                    {overlaySetId && (
                      <div className="space-y-4">
                        <div className="text-sm font-semibold text-slate-300 mb-4">Live Preview</div>
                        <div
                          className="relative bg-black rounded-xl overflow-hidden aspect-video"
                          style={{
                            filter: overlaySettings.blur ? 'blur(2px)' : 'none',
                          }}
                        >
                          <VideoPlayer
                            videoUrl={getVideoUrl(overlaySetId, 1)}
                            className="w-full"
                          />
                          {/* Overlay preview */}
                          <div
                            className="absolute left-0 right-0 bottom-0 bg-gradient-to-t from-black to-transparent pointer-events-none transition-all"
                            style={{
                              height: `${overlaySettings.height}px`,
                              bottom: `${overlaySettings.offset}px`,
                              opacity: overlaySettings.opacity / 100,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'leads' && (
                <motion.div key="leads" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  {loadingLeads ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-2 border-electric-violet border-r-transparent rounded-full animate-spin" />
                    </div>
                  ) : leads.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-400">No contact submissions yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Phone</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Instrument</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Message</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leads.map((lead, idx) => (
                            <tr key={idx} className="border-b border-slate-700 hover:bg-slate-800/30 transition">
                              <td className="px-6 py-4 text-white">{lead.name}</td>
                              <td className="px-6 py-4 text-slate-300">{lead.email}</td>
                              <td className="px-6 py-4 text-slate-300">{lead.phone || '-'}</td>
                              <td className="px-6 py-4 text-slate-300">{lead.instrument || '-'}</td>
                              <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{lead.message || '-'}</td>
                              <td className="px-6 py-4 text-slate-400 text-sm">
                                {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
