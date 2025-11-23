import React, { useState, useEffect } from 'react';
import { X, Quote, Zap, RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const QUOTES = [
  { text: "You were dangerous back then. Now you’re just scrolling (Please bring back that beast!!!!)", author: "Self" },
  { text: "It always seems impossible until it is done.", author: "Nelson Mandela" },
  { text: "Arrays broke you today? Fine. They’ll fund your rent tomorrow", author: "Reality" },
  { text: "Are we building problem-solving skills or just building excuses today?", author: "Discipline" },
  { text: "Be honest — are we still an aspirant or just emotionally attached to the idea? (stop dreaming and get into action)", author: "Hard Truth" },
  { text: "Solve it or not — showing up already puts you top 10%", author: "Statistics" },
  { text: "Your DSA streak is so inconsistent even Git can’t track it. So please continue solving!", author: "GitHub" },
  { text: "Your brain has a PhD in overthinking and a diploma in execution. Make use of your brain!", author: "Focus" },
  { text: "You’re not bad. You’re just underperforming on purpose — and that’s the most tragic flex of all. Now go solve one problem. Not because you’re motivated. Because your future self is tired of your nonsense", author: "Tough Love" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "If effort were WiFi, yours would say “connected, no internet.” (Basically no use!!!)", author: "Tech Humor" },
  { text: "Your mind is a programmable supercomputer. Use it.", author: "Unknown" }
];

const MotivatorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [currentQuote, setCurrentQuote] = useState(QUOTES[0]);
  const [shuffleCount, setShuffleCount] = useState(0);
  const [showUltimatum, setShowUltimatum] = useState(false);

  const pickRandomQuote = () => {
    // Check if user has clicked shuffle 4 times already (so this is the 5th click)
    if (shuffleCount >= 4) {
      setShowUltimatum(true);
      return;
    }

    setShuffleCount(prev => prev + 1);
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    setCurrentQuote(QUOTES[randomIndex]);
  };

  // Pick a new quote every time the modal opens and reset state
  useEffect(() => {
    if (isOpen) {
      setShuffleCount(0);
      setShowUltimatum(false);
      const randomIndex = Math.floor(Math.random() * QUOTES.length);
      setCurrentQuote(QUOTES[randomIndex]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`relative border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transition-colors duration-500 ${
        showUltimatum ? 'bg-red-950 border-red-500/50' : 'bg-slate-900 border-amber-500/30'
      }`}>
        
        {/* Decorative Background */}
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full pointer-events-none transition-colors duration-500 ${
             showUltimatum ? 'bg-red-500/10' : 'bg-amber-500/10'
        }`} />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
          
          {/* Icon */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg transition-colors duration-500 ${
              showUltimatum 
              ? 'bg-red-500/20 shadow-red-500/10 text-red-500' 
              : 'bg-amber-500/20 shadow-amber-500/10 text-amber-400'
          }`}>
            {showUltimatum ? <AlertTriangle size={32} /> : <Zap size={32} />}
          </div>

          {/* Content */}
          {showUltimatum ? (
             <div className="mb-8 animate-in zoom-in duration-300">
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed mb-4">
                  Enough hunting for motivation.
                </h2>
                <p className="text-lg text-red-200 font-medium">
                  Either shut the laptop and live with the guilt, or open it and earn some dignity.
                </p>
             </div>
          ) : (
            <>
                <div className="mb-8 relative">
                    <Quote size={48} className="absolute -top-6 -left-6 text-slate-800 transform -scale-x-100" />
                    <h2 className="text-2xl md:text-3xl font-serif italic text-slate-200 leading-relaxed relative z-10">
                    "{currentQuote.text}"
                    </h2>
                    <Quote size={48} className="absolute -bottom-6 -right-6 text-slate-800" />
                </div>

                <p className="text-amber-500 font-bold uppercase tracking-widest text-sm mb-8">
                    — {currentQuote.author || "Unknown"}
                </p>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 w-full">
             {!showUltimatum && (
                 <button 
                    onClick={pickRandomQuote}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
                  >
                    <RefreshCw size={18} />
                    Still feeling low?
                  </button>
             )}
              <button 
                onClick={onClose}
                className={`flex-1 py-3 font-bold rounded-lg shadow-lg transition-colors ${
                    showUltimatum 
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/20' 
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/20'
                }`}
              >
                {showUltimatum ? "I'll Code." : "Let's Code!"}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotivatorModal;