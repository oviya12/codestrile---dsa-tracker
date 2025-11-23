import React, { useState } from 'react';
import { Goal } from '../types';
import { Pencil, Save, X, Calendar, Target, CheckCircle2 } from 'lucide-react';

interface Props {
  goals: Goal[];
  onUpdateGoal: (goal: Goal) => void;
}

const GoalManager: React.FC<Props> = ({ goals, onUpdateGoal }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Goal>>({});

  const handleEditClick = (goal: Goal) => {
    setEditingId(goal.id);
    setEditForm(goal);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = () => {
    if (editingId && editForm) {
      // Merge existing goal with updates
      const originalGoal = goals.find(g => g.id === editingId);
      if (originalGoal) {
        onUpdateGoal({ ...originalGoal, ...editForm } as Goal);
      }
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold text-white mb-6">Goal Management</h2>
      
      <div className="grid gap-6">
        {goals.map(goal => (
          <div key={goal.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            
            {/* Header */}
            <div className={`px-6 py-3 border-b border-slate-700 flex justify-between items-center ${
              goal.type === 'LONG_TERM' ? 'bg-purple-900/20' : 'bg-blue-900/20'
            }`}>
              <span className={`text-xs font-bold px-2 py-1 rounded border ${
                  goal.type === 'LONG_TERM' 
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}>
                  {goal.type === 'LONG_TERM' ? 'LONG TERM GOAL' : 'SHORT TERM GOAL'}
              </span>
              
              {editingId !== goal.id && (
                <button 
                  onClick={() => handleEditClick(goal)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>

            <div className="p-6">
              {editingId === goal.id ? (
                // EDIT MODE
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Goal Description</label>
                    <input 
                      type="text" 
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Target Count</label>
                      <div className="relative">
                        <Target size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="number" 
                          value={editForm.targetCount || 0}
                          onChange={(e) => setEditForm({...editForm, targetCount: Number(e.target.value)})}
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Deadline</label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="date" 
                          value={editForm.deadline || ''}
                          onChange={(e) => setEditForm({...editForm, deadline: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-700">
                    <button 
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <X size={16} /> Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                // VIEW MODE
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-white mb-2">{goal.description}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Target size={14} />
                        Target: <span className="text-slate-200">{goal.targetCount} {goal.unit}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Deadline: <span className="text-slate-200">{goal.deadline}</span>
                      </span>
                    </div>
                  </div>

                  <div className="md:w-1/3">
                     <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Progress</span>
                        <span className={goal.progress >= goal.targetCount ? 'text-emerald-400 font-bold' : ''}>
                          {goal.progress} / {goal.targetCount}
                        </span>
                    </div>
                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              goal.progress >= goal.targetCount ? 'bg-emerald-500' : 
                              goal.type === 'LONG_TERM' ? 'bg-purple-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(100, (goal.progress / goal.targetCount) * 100)}%`}} 
                        />
                    </div>
                    {goal.progress >= goal.targetCount && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-emerald-400 font-bold">
                        <CheckCircle2 size={12} /> Goal Achieved!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalManager;