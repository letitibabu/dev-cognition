import React, { useState, useEffect } from 'react';
import { ScratchpadItem } from '../types';
import { generateId, saveScratchpad, loadScratchpad } from '../services/storageService';
import { X, Plus, ChevronRight, ChevronLeft } from 'lucide-react';

export const Scratchpad: React.FC = () => {
  const [items, setItems] = useState<ScratchpadItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setItems(loadScratchpad());
  }, []);

  useEffect(() => {
    saveScratchpad(items);
  }, [items]);

  const addItem = () => {
    if (!newItem.trim()) return;
    setItems([{ id: generateId(), content: newItem, completed: false }, ...items]);
    setNewItem('');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className={`fixed right-0 top-16 bottom-0 z-20 flex transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-64'}`}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-8 bg-surface border-y border-l border-border rounded-l-md flex items-center justify-center cursor-pointer absolute -left-8 top-4 hover:bg-border transition-colors text-secondary"
      >
        {isOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </div>
      
      <div className="w-72 bg-surface border-l border-border flex flex-col h-full shadow-2xl">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-sm text-gray-300 uppercase tracking-wider">Scratchpad</h2>
          <p className="text-xs text-secondary">Fleeting thoughts & quick pastes.</p>
        </div>

        <div className="p-3 border-b border-border">
          <div className="relative">
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              placeholder="Add quick note..."
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-white focus:border-primary outline-none pr-8"
            />
            <button onClick={addItem} className="absolute right-2 top-2 text-primary hover:text-white">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {items.map(item => (
            <div key={item.id} className="group bg-background p-2 rounded border border-transparent hover:border-border text-xs text-gray-300 relative">
              <p className="pr-5 break-words">{item.content}</p>
              <button 
                onClick={() => removeItem(item.id)}
                className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 text-secondary hover:text-danger p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center text-secondary text-xs mt-10">Empty scratchpad</div>
          )}
        </div>
      </div>
    </div>
  );
};
