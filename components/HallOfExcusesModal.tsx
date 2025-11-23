import React, { useMemo } from 'react';
import { DailyLog } from '../types';
import { X, Ghost, BarChart3 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  logs: DailyLog[];
}

const HallOfExcusesModal: React.FC<Props> = ({ isOpen, onClose, logs }) => {
  
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    let totalExcuses = 0;

    logs.forEach(log => {
        if (log.reasonForMiss) {
            // Determine if it's a standard one or 'Other' (custom)
            // We treat custom ones as grouped "Custom Reasons" or individual if you prefer.
            // Let's count exact strings to capture "Not in a mood", etc.
            const reason = log.reasonForMiss.trim();
            if (reason) {
                counts[reason] = (counts[reason] || 0) + 1;
                totalExcuses++;
            }
        }
    });

    const sortedStats = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .map(([reason, count]) => ({
            reason,
            count,
            percentage: totalExcuses > 0 ? Math.round((count / totalExcuses) * 100) : 0
        }));

    return { sortedStats, totalExcuses };
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6 bg-slate-800/50 border-b border-slate-700 shrink-0">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                    <Ghost size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Hall of Excuses</h2>
                    <p className="text-xs text-slate-400">Total excuses generated: <span className="text-purple-400 font-bold">{stats.totalExcuses}</span></p>
                </div>
            </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
            {stats.sortedStats.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                    <Ghost size={48} className="mx-auto mb-3 text-slate-600" />
                    <p className="text-slate-400">No excuses recorded yet.</p>
                    <p className="text-xs text-slate-600">That's actually a good thing.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {stats.sortedStats.map((item, index) => (
                        <div key={index} className="group">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-300 font-medium flex items-center gap-2">
                                    <span className="text-slate-600 font-mono w-4">{index + 1}.</span> 
                                    {item.reason}
                                </span>
                                <span className="text-slate-400">{item.count} times</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="bg-purple-500 h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${item.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        
        {stats.totalExcuses > 5 && (
             <div className="p-4 bg-purple-900/20 border-t border-purple-500/20 text-center text-xs text-purple-300 italic">
                "He who is good at making excuses is seldom good for anything else." — Benjamin Franklin
             </div>
        )}
      </div>
    </div>
  );
};

export default HallOfExcusesModal;