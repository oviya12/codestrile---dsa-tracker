import React, { useState } from 'react';
import { ImpactAnalysis, UserState } from '../types';
import { analyzeMissedTarget } from '../services/geminiService';
import { AlertTriangle, TrendingUp, X, BrainCircuit, ArrowUpRight, ChevronRight, PenTool } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdjustTarget: (deficit: number, reason: string) => void;
  state: UserState;
  problemsSolvedToday: number;
}

const COMMON_EXCUSES = [
  "Not in a mood 😒",
  "Feeling tired 😴",
  "Busy schedule 📅",
  "Family function 🎉",
  "Travelling ✈️",
  "Topic too hard 🤯",
  "Procrastinated 🐢",
  "Forgot to log 🤦‍♂️"
];

const MissedTargetModal: React.FC<Props> = ({ isOpen, onClose, onAdjustTarget, state, problemsSolvedToday }) => {
  const [reason, setReason] = useState('');
  const [isCustomReason, setIsCustomReason] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ImpactAnalysis | null>(null);

  if (!isOpen) return null;

  const missedCount = Math.max(0, state.dailyTarget - problemsSolvedToday);

  const handleAnalyze = async () => {
    if (!reason.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeMissedTarget(reason, missedCount, state);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAcceptChallenge = () => {
    onAdjustTarget(missedCount, reason);
  };

  const selectExcuse = (excuse: string) => {
    setReason(excuse);
    setIsCustomReason(false);
  };

  const selectOther = () => {
    setReason('');
    setIsCustomReason(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {!analysis ? (
          <div className="p-8 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-500/20 rounded-full text-red-400">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Target Missed</h2>
                <p className="text-slate-400">You are {missedCount} problems short of your daily goal.</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-4">
                What's the reason today?
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {COMMON_EXCUSES.map((excuse) => (
                  <button
                    key={excuse}
                    onClick={() => selectExcuse(excuse)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                      reason === excuse && !isCustomReason
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {excuse}
                  </button>
                ))}
                <button
                  onClick={selectOther}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border flex items-center justify-center gap-2 ${
                    isCustomReason
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <PenTool size={14} /> Other
                </button>
              </div>

              {isCustomReason && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <textarea
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none h-24"
                    placeholder="Type your specific reason here..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Skip & Ignore
              </button>
              <button
                onClick={handleAnalyze}
                disabled={!reason || isAnalyzing}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? 'Analyzing Impact...' : 'Analyze Impact'}
                {!isAnalyzing && <BrainCircuit size={18} />}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
             <div className={`p-6 border-b border-slate-800 shrink-0 ${
                analysis.riskLevel === 'CRITICAL' || analysis.riskLevel === 'HIGH' ? 'bg-red-900/20' : 
                analysis.riskLevel === 'MEDIUM' ? 'bg-amber-900/20' : 'bg-emerald-900/20'
             }`}>
                <div className="flex items-center justify-between pr-8">
                    <h3 className="text-xl font-semibold text-white">Impact Analysis</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        analysis.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                        analysis.riskLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' :
                        analysis.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' :
                        'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                    }`}>
                        RISK LEVEL: {analysis.riskLevel}
                    </span>
                </div>
             </div>
             
             <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                <div>
                    <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">The Consequence</h4>
                    <p className="text-slate-200 leading-relaxed">{analysis.impactDescription}</p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <h4 className="flex items-center gap-2 text-indigo-400 font-medium mb-2">
                        <TrendingUp size={18} />
                        Recovery Plan
                    </h4>
                    <p className="text-slate-300 text-sm">{analysis.adjustedPlan}</p>
                </div>

                <div>
                    <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Mentor's Note</h4>
                    <p className="italic text-slate-300 border-l-4 border-indigo-500 pl-4 py-1">
                        "{analysis.motivationalMessage}"
                    </p>
                </div>
             </div>

             <div className="p-6 bg-slate-800 border-t border-slate-700 flex justify-between items-center shrink-0">
                <p className="text-xs text-slate-500">By accepting, we'll add <span className="text-white font-bold">{missedCount} problems</span> to your target.</p>
                <button 
                    onClick={handleAcceptChallenge}
                    className="flex items-center gap-2 px-6 py-2 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                >
                    I Accept the Challenge
                    <ArrowUpRight size={16} className="text-slate-600" />
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissedTargetModal;