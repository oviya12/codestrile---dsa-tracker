import React, { useState, useEffect } from 'react';
import { Platform, DailyLog } from '../types';
import { syncPlatformData } from '../services/scraperService';
import { RefreshCw, Plus, Check, User, Loader2, Globe } from 'lucide-react';

interface Props {
  onUpdate: (count: number) => void;
  onSyncComplete: (data: { logs: DailyLog[], totalSolved: number, solvedToday: number }) => void;
}

const Tracker: React.FC<Props> = ({ onUpdate, onSyncComplete }) => {
  const [loading, setLoading] = useState(false);
       
  // Store count for the current session
  const [sessionCount, setSessionCount] = useState(0);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('codepulse_leetcode_username');
    if (saved) {
      setUsername(saved);
    }
  }, []);

  const handleSaveUsername = (val: string) => {
    setUsername(val);
    localStorage.setItem('codepulse_leetcode_username', val);
  };

  const handleSync = async () => {
    if (!username) {
        alert("Please enter your LeetCode username first!");
        return;
    }

    setLoading(true);
    try {
      const data = await syncPlatformData({ [Platform.LeetCode]: username });
      const { solvedToday, totalSolved, logs } = data[Platform.LeetCode];
      
      // Pass full data back to App to replace/hydrate state
      onSyncComplete({
          logs,
          totalSolved,
          solvedToday
      });

    } catch (error) {
      console.error("Sync failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    onUpdate(sessionCount);
    setSessionCount(0);
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden transition-all">
      <div className="p-6 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">Track Progress</h3>
        <p className="text-xs text-slate-400 mt-1">Connect LeetCode or log other platforms.</p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Configuration */}
        <div>
            <label className="block text-xs text-slate-500 mb-1">LeetCode Username</label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                    <input 
                        type="text"
                        value={username}
                        onChange={(e) => handleSaveUsername(e.target.value)}
                        placeholder="username"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>
                <button 
                    onClick={handleSync}
                    disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${loading ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    {loading ? '...' : 'Sync'}
                </button>
            </div>
        </div>
      
        {/* Manual Counter */}
        <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                    <Globe size={16} />
                </div>
                <div className="flex flex-col">
                    <span className="text-slate-200 font-medium">Other Platforms</span>
                    <span className="text-[10px] text-slate-500">HackerRank, GFG, etc.</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setSessionCount(Math.max(0, sessionCount - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
                >
                    -
                </button>
                <span className="w-8 text-center text-white font-mono font-bold text-lg">{sessionCount}</span>
                <button 
                    onClick={() => setSessionCount(sessionCount + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
                >
                    <Plus size={14} />
                </button>
            </div>
        </div>
      </div>

      <div className="p-4 bg-slate-900/80 flex justify-end items-center border-t border-slate-800">
        <button 
            onClick={handleSubmit}
            disabled={sessionCount === 0}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-lg shadow-emerald-900/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
            <Check size={18} />
            Log to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Tracker; 