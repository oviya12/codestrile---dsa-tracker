import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, RotateCcw, Volume2, CheckCircle2, XCircle, Trophy, X, Square } from 'lucide-react';
import TimerAlertModal from './TimerAlertModal';

// Internal Component: Decision Modal when Timer Ends
const TimesUpDecisionModal: React.FC<{
  isOpen: boolean;
  onSolved: () => void;
  onNotSolved: () => void;
}> = ({ isOpen, onSolved, onNotSolved }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Timer className="text-red-400" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Time's Up!</h2>
                <p className="text-slate-400 mb-8">Did you manage to crack the code?</p>
                
                <div className="space-y-3">
                    <button 
                        onClick={onSolved}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all transform hover:-translate-y-0.5 shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={20} />
                        Yes, I Completed It!
                    </button>
                    <button 
                        onClick={onNotSolved}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors border border-slate-700 flex items-center justify-center gap-2"
                    >
                        <XCircle size={20} />
                        I Didn't Solve It Yet
                    </button>
                </div>
            </div>
        </div>
    );
};

// Internal Component: Success Reminder
const SuccessTipModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
}> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-emerald-500/30 w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
                 
                 <div className="mx-auto w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                    <Trophy size={24} className="text-white" />
                 </div>

                 <h2 className="text-2xl font-bold text-white mb-2">Great Job! 🎉</h2>
                 <p className="text-slate-300 mb-6 leading-relaxed">
                    Don't forget to <strong>Sync</strong> or <strong>Manually Log</strong> this problem now to keep your dashboard green!
                 </p>
                 
                 <button 
                    onClick={onClose}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-lg"
                 >
                    Will Do!
                 </button>
            </div>
        </div>
    );
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ProblemTimer: React.FC<Props> = ({ isOpen, onClose }) => {
  // Input in minutes
  const [inputMinutes, setInputMinutes] = useState<string>('20');
  
  // Timer Logic
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'IDLE' | 'ATTEMPT' | 'REVIEW'>('IDLE');
  
  // Ref to store the absolute end timestamp
  const endTimeRef = useRef<number>(0);

  // Modal States
  const [showModal, setShowModal] = useState(false); // Existing Alert Modal
  const [modalType, setModalType] = useState<'SOLUTION_TIME' | 'MOVE_ON'>('SOLUTION_TIME');
  
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [showSuccessTip, setShowSuccessTip] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Unlock Audio Context on user gesture
  const ensureAudioContext = () => {
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playPianoNote = (ctx: AudioContext, freq: number, startTime: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Sine wave creates a piano-like tone
    osc.type = 'sine'; 
    osc.frequency.value = freq;
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Envelope: Sharp attack, medium decay (slightly harsher/percussive)
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.01); 
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); 
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  const startPianoAlarm = () => {
    if (alarmIntervalRef.current) return;
    
    const playLoop = () => {
        const ctx = ensureAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        
        // Rhythmic Pattern: "Double Tap + Alert"
        // Rhythm: 16th, 16th, Quarter
        // Notes: G5, G5, C6 (V - V - I resolution, feels final/alerting)
        
        const staccato = 0.1;
        const accent = 0.5;
        
        // G5 (783.99 Hz) - Staccato
        playPianoNote(ctx, 783.99, now, staccato);
        
        // G5 (783.99 Hz) - Staccato
        playPianoNote(ctx, 783.99, now + 0.15, staccato);
        
        // C6 (1046.50 Hz) - Accent/Alert
        playPianoNote(ctx, 1046.50, now + 0.30, accent);
        
        // Harmony (E5 - 659.25 Hz) to make it sound like a chord on the accent
        playPianoNote(ctx, 659.25, now + 0.30, accent);
    };

    playLoop(); 
    alarmIntervalRef.current = window.setInterval(playLoop, 1500); // Loop every 1.5s
  };

  const stopPianoAlarm = () => {
    if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
    }
  };

  // Dedicated cleanup effect for unmount only
  useEffect(() => {
    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        stopPianoAlarm();
    };
  }, []);

  // Timer Ticker Effect: Updates time left based on Date.now() to prevent drift
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const remaining = Math.ceil((endTimeRef.current - now) / 1000);

        if (remaining <= 0) {
          setTimeLeft(0);
          // The completion logic is handled by the Watcher effect below
        } else {
          setTimeLeft(remaining);
        }
      }, 200); // Run frequently to catch 0 faster
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  // Watcher Effect: Monitors state for completion
  useEffect(() => {
    if (isActive && timeLeft <= 0) {
      // Timer Finished
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsActive(false);
      setTimeLeft(0);
      
      // Start Alarm specifically when timer hits 0
      startPianoAlarm();

      if (mode === 'ATTEMPT') {
        setShowDecisionModal(true);
      } else if (mode === 'REVIEW') {
        setModalType('MOVE_ON');
        setShowModal(true);
      }
    }
  }, [timeLeft, isActive, mode]);


  const startAttempt = () => {
    ensureAudioContext(); // Important: Unlock audio on click
    const mins = parseInt(inputMinutes);
    if (isNaN(mins) || mins <= 0) return;
    
    const duration = mins * 60;
    setTimeLeft(duration);
    endTimeRef.current = Date.now() + duration * 1000; // Set End Timestamp
    
    setMode('ATTEMPT');
    setIsActive(true);
  };

  const toggleTimer = () => {
    if (isActive) {
        // Pausing
        setIsActive(false);
        // timeLeft state holds the remaining duration
    } else {
        // Resuming
        // Recalculate end time based on current timeLeft
        endTimeRef.current = Date.now() + timeLeft * 1000;
        setIsActive(true);
    }
  };

  const stopTimer = () => {
    setIsActive(false);
    setMode('IDLE');
    setTimeLeft(0);
    stopPianoAlarm();
    if (intervalRef.current) clearInterval(intervalRef.current);
    onClose(); // Close the popup
  };

  // Decision Modal Handlers
  const handleSolved = () => {
      stopPianoAlarm();
      setShowDecisionModal(false);
      setShowSuccessTip(true);
      setMode('IDLE');
  };

  const handleNotSolved = () => {
      stopPianoAlarm();
      setShowDecisionModal(false);
      // Transition to Warning / Review Timer Modal
      setModalType('SOLUTION_TIME');
      setShowModal(true);
  };

  // Alert Modal Handler (Existing)
  const handleModalConfirm = () => {
    setShowModal(false);
    stopPianoAlarm(); // Ensure alarm stops if "Move On" confirmed
    
    if (modalType === 'SOLUTION_TIME') {
      // Start 60 min review timer
      const duration = 60 * 60;
      setTimeLeft(duration);
      endTimeRef.current = Date.now() + duration * 1000; // Set End Timestamp
      
      setMode('REVIEW');
      setIsActive(true);
    } else {
        // Move on confirmed
        setMode('IDLE');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6 border-b border-slate-700 flex items-center gap-3 pr-12">
            <div className="flex items-center gap-2">
                <Timer className="text-indigo-400" size={20} />
                <h3 className="text-lg font-semibold text-white">Focus Timer</h3>
            </div>
            {mode !== 'IDLE' && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded border ml-2 ${
                    mode === 'ATTEMPT' 
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                    : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                }`}>
                    {mode === 'ATTEMPT' ? 'ATTEMPTING' : 'REVIEWING'}
                </div>
            )}
        </div>

        <div className="p-6">
            {mode === 'IDLE' ? (
            <div className="space-y-4">
                <div>
                    <label className="block text-xs text-slate-500 mb-1">Time Allocation (mins)</label>
                    <div className="flex gap-2">
                        <input 
                            type="number"
                            value={inputMinutes}
                            onChange={(e) => setInputMinutes(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="20"
                        />
                        <button 
                            onClick={startAttempt}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <Play size={18} fill="currentColor" />
                        </button>
                    </div>
                </div>
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Volume2 size={10} />
                    Sound will play until you respond.
                </p>
            </div>
            ) : (
            <div className="text-center space-y-4">
                <div className="relative">
                    <div className={`text-5xl font-mono font-bold tracking-wider ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                        {formatTime(timeLeft)}
                    </div>
                    <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest">
                        {mode === 'ATTEMPT' ? 'Solve Problem' : 'Study Solution'}
                    </p>
                </div>
                
                <div className="flex justify-center gap-2">
                    <button 
                        onClick={toggleTimer}
                        className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                            isActive 
                            ? 'border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10' 
                            : 'border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10'
                        }`}
                    >
                        {isActive ? (
                            <span className="flex items-center gap-1"><Square size={12} fill="currentColor" /> Pause</span>
                        ) : (
                            <span className="flex items-center gap-1"><Play size={12} fill="currentColor" /> Resume</span>
                        )}
                    </button>
                    <button 
                        onClick={stopTimer}
                        className="px-4 py-2 rounded-lg border border-red-500/50 text-red-500 hover:bg-red-500/10 font-medium transition-colors"
                    >
                        Stop
                    </button>
                </div>
            </div>
            )}
        </div>
      </div>

      {/* Modals */}
      
      <TimesUpDecisionModal 
        isOpen={showDecisionModal}
        onSolved={handleSolved}
        onNotSolved={handleNotSolved}
      />

      <SuccessTipModal 
        isOpen={showSuccessTip}
        onClose={() => {
            setShowSuccessTip(false);
            onClose(); // Close main popup on Will Do
        }}
      />

      <TimerAlertModal 
        isOpen={showModal}
        type={modalType}
        onConfirm={handleModalConfirm}
        onClose={() => {
            setShowModal(false);
            stopPianoAlarm(); // Stop sound if dismissed via X
            setMode('IDLE');
        }}
      />
    </div>
  );
};

export default ProblemTimer;