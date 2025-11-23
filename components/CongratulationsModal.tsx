import React, { useEffect, useRef } from 'react';
import { UserState } from '../types';
import { Trophy, PartyPopper, X, Flame, Star } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  state: UserState;
  totalSolvedToday: number;
}

const CongratulationsModal: React.FC<Props> = ({ isOpen, onClose, state, totalSolvedToday }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (isOpen) {
        playSuccessSound();
    }
  }, [isOpen]);

  const playSuccessSound = () => {
      try {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        
        // Resume context if suspended (browser autoplay policy)
        if (ctx.state === 'suspended') {
             ctx.resume().catch(err => console.error("Audio resume failed", err));
        }

        const now = ctx.currentTime;

        // Fanfare Melody: Upward Major Arpeggio (C5, E5, G5, C6)
        const notes = [
            { freq: 523.25, time: 0 },    // C5
            { freq: 659.25, time: 0.1 },  // E5
            { freq: 783.99, time: 0.2 },  // G5
            { freq: 1046.50, time: 0.35 }, // C6
            { freq: 1046.50, time: 0.5 }  // C6 (Repeat impact)
        ];

        notes.forEach(({ freq, time }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'triangle'; // Bright, game-like sound
            osc.frequency.value = freq;
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            const startTime = now + time;
            const duration = 0.4;

            // ADSR Envelope
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            
            osc.start(startTime);
            osc.stop(startTime + duration);
        });

        // Accompaniment: Bass Root Note (C4)
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.value = 261.63; // C4
        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);
        
        bassGain.gain.setValueAtTime(0, now);
        bassGain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        bassGain.gain.linearRampToValueAtTime(0, now + 1.2); // Long decay
        
        bassOsc.start(now);
        bassOsc.stop(now + 1.2);

      } catch (e) {
          console.error("Audio synthesis failed", e);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-center">
        
        {/* Confetti / Decoration Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-600/30 to-transparent pointer-events-none" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 pt-10 relative">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/20 animate-bounce">
            <Trophy size={40} className="text-white" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Target Crushed!</h2>
          <p className="text-slate-400 mb-8">You've successfully hit your daily coding goal.</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center justify-center gap-2 text-emerald-400 mb-1">
                <Star size={16} fill="currentColor" />
                <span className="text-xs font-bold uppercase">Solved</span>
              </div>
              <span className="text-2xl font-bold text-white">{totalSolvedToday}</span>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center justify-center gap-2 text-orange-400 mb-1">
                <Flame size={16} fill="currentColor" />
                <span className="text-xs font-bold uppercase">Streak</span>
              </div>
              <span className="text-2xl font-bold text-white">{state.streak} <span className="text-xs font-normal text-slate-500">days</span></span>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-medium mb-1">
              <PartyPopper size={18} />
              <span>Consistency is Key</span>
            </div>
            <p className="text-sm text-slate-300">
              "Success is the sum of small efforts, repeated day in and day out."
            </p>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-lg shadow-emerald-900/20 transition-all transform hover:-translate-y-0.5"
          >
            Keep the Momentum
          </button>
        </div>
      </div>
    </div>
  );
};

export default CongratulationsModal;