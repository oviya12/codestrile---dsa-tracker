import React from 'react';
import { AlertTriangle, BookOpen, ArrowRight, Clock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  type: 'SOLUTION_TIME' | 'MOVE_ON';
  onConfirm: () => void;
  onClose: () => void;
}

const TimerAlertModal: React.FC<Props> = ({ isOpen, type, onConfirm, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        <div className={`p-6 ${type === 'SOLUTION_TIME' ? 'bg-indigo-900/20' : 'bg-orange-900/20'} border-b border-slate-800 shrink-0`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${type === 'SOLUTION_TIME' ? 'bg-indigo-500 text-white' : 'bg-orange-500 text-white'}`}>
              {type === 'SOLUTION_TIME' ? <BookOpen size={24} /> : <Clock size={24} />}
            </div>
            <h2 className="text-xl font-bold text-white">
              {type === 'SOLUTION_TIME' ? 'Time to Check Solution!' : 'Time to Move On'}
            </h2>
          </div>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          {type === 'SOLUTION_TIME' ? (
            <>
              <p className="text-slate-300 text-lg">
                You've given it your best shot, future champ! Now it's time to learn.
              </p>
              
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex gap-3">
                <AlertTriangle className="text-yellow-500 shrink-0" size={24} />
                <div className="space-y-1">
                  <h4 className="font-bold text-yellow-400">Integrity Warning</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Try to understand the concept deeply and code it on your own. 
                    <span className="block mt-1 font-bold text-white">Do NOT just copy-paste.</span>
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-500">
                A 60-minute timer will now start for you to study the solution and implement it.
              </p>
            </>
          ) : (
            <>
              <p className="text-slate-300 text-lg">
                The review period is over. Don't get stuck on one problem for too long!
              </p>
              <p className="text-slate-400">
                Take a break or switch to a different problem to keep your mind fresh.
              </p>
            </>
          )}

          <div className="flex justify-end gap-3 pt-2">
            {type === 'SOLUTION_TIME' && (
                 <button 
                 onClick={onClose}
                 className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
               >
                 Stop Timer
               </button>
            )}
           
            <button 
              onClick={onConfirm}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 ${
                type === 'SOLUTION_TIME' 
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/20' 
                  : 'bg-orange-600 hover:bg-orange-700 shadow-orange-900/20'
              }`}
            >
              {type === 'SOLUTION_TIME' ? (
                <>Start Review Timer (60m) <ArrowRight size={18} /></>
              ) : (
                <>Got it</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerAlertModal;