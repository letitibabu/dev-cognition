import React, { useState } from 'react';
import { X, Plus, Trash2, Gavel } from 'lucide-react';
import { DecisionMetadata } from '../types';

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { decision: string; metadata: DecisionMetadata }) => void;
}

export const DecisionModal: React.FC<DecisionModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [problem, setProblem] = useState('');
  const [options, setOptions] = useState<string[]>(['']);
  const [rationale, setRationale] = useState('');
  const [decision, setDecision] = useState('');

  if (!isOpen) return null;

  const handleAddOption = () => setOptions([...options, '']);
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    if (!problem || !decision || !rationale) return; // Simple validation
    
    onSubmit({
      decision,
      metadata: {
        problem,
        options: options.filter(o => o.trim() !== ''),
        rationale,
        status: 'DECIDED'
      }
    });
    onClose();
    // Reset form
    setProblem('');
    setOptions(['']);
    setRationale('');
    setDecision('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-lg w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Gavel className="w-5 h-5 text-emerald-500" />
            Log Decision
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          
          <div>
            <label className="block text-xs font-mono text-secondary mb-1">PROBLEM / CONTEXT</label>
            <input 
              value={problem}
              onChange={e => setProblem(e.target.value)}
              className="w-full bg-background border border-border rounded p-2 text-sm text-white focus:border-primary outline-none"
              placeholder="e.g., Which database to use for analytics?"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-secondary mb-1">OPTIONS CONSIDERED</label>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    value={opt}
                    onChange={e => handleOptionChange(idx, e.target.value)}
                    className="flex-1 bg-background border border-border rounded p-2 text-sm text-white focus:border-primary outline-none"
                    placeholder={`Option ${idx + 1}`}
                  />
                  {options.length > 1 && (
                    <button 
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 text-gray-500 hover:text-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button 
                onClick={handleAddOption}
                className="text-xs text-primary flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3 h-3" /> Add Option
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-secondary mb-1">RATIONALE (WHY?)</label>
            <textarea 
              value={rationale}
              onChange={e => setRationale(e.target.value)}
              className="w-full bg-background border border-border rounded p-2 text-sm text-white focus:border-primary outline-none h-24 resize-none"
              placeholder="Explain the reasoning behind the choice..."
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-secondary mb-1">FINAL DECISION</label>
            <input 
              value={decision}
              onChange={e => setDecision(e.target.value)}
              className="w-full bg-emerald-900/20 border border-emerald-500/50 rounded p-3 text-sm text-emerald-200 focus:border-emerald-500 outline-none font-bold"
              placeholder="The chosen path..."
            />
          </div>

        </div>

        <div className="p-4 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
          <button 
            onClick={handleSubmit}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded shadow-lg shadow-emerald-900/20"
          >
            Commit Decision
          </button>
        </div>
      </div>
    </div>
  );
};
