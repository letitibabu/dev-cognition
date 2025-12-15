import React, { useState, useRef, useEffect } from 'react';
import { Send, CheckSquare, BrainCircuit, PenTool, Gavel } from 'lucide-react';

interface EditorProps {
  onAddNote: (content: string) => void;
  onAddTask: (content: string) => void;
  onOpenDecisionModal: () => void;
  onAskAI: (query: string) => void;
  isAiLoading: boolean;
}

export const Editor: React.FC<EditorProps> = ({ 
  onAddNote, 
  onAddTask, 
  onOpenDecisionModal,
  onAskAI,
  isAiLoading
}) => {
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<'NOTE' | 'TASK' | 'AI'>('NOTE');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleSubmit = () => {
    if (!content.trim()) return;

    if (mode === 'NOTE') {
      onAddNote(content);
    } else if (mode === 'TASK') {
      onAddTask(content);
    } else if (mode === 'AI') {
      onAskAI(content);
    }
    
    setContent('');
    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    
    // Reset mode to note after task/ai usually, but let's keep it stick if user wants to batch add tasks
    if (mode === 'AI') setMode('NOTE'); 
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border bg-background p-4 sticky bottom-0 z-10">
      <div className="max-w-3xl mx-auto flex flex-col gap-2">
        
        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-1">
          <button 
            onClick={() => setMode('NOTE')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              mode === 'NOTE' ? 'bg-secondary/20 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <PenTool className="w-3 h-3" /> Note
          </button>
          <button 
            onClick={() => setMode('TASK')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              mode === 'TASK' ? 'bg-secondary/20 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <CheckSquare className="w-3 h-3" /> Task
          </button>
          <button 
            onClick={() => setMode('AI')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              mode === 'AI' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-500 hover:text-indigo-300'
            }`}
          >
            <BrainCircuit className="w-3 h-3" /> Ask AI
          </button>
          <div className="w-px h-4 bg-border mx-1"></div>
          <button 
            onClick={onOpenDecisionModal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-500 hover:bg-emerald-500/10 transition-colors ml-auto"
          >
            <Gavel className="w-3 h-3" /> Log Decision
          </button>
        </div>

        {/* Input Area */}
        <div className={`relative rounded-lg border transition-colors ${
          mode === 'AI' ? 'border-indigo-500/50 bg-indigo-950/10' : 'border-border bg-surface'
        }`}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === 'NOTE' ? "Write a note... (Markdown supported)" :
              mode === 'TASK' ? "What needs to be done?" :
              "Ask your AI collaborator..."
            }
            className="w-full bg-transparent p-3 text-sm text-gray-200 placeholder-gray-500 outline-none resize-none min-h-[50px] max-h-[300px]"
            rows={1}
          />
          <button 
            onClick={handleSubmit}
            disabled={!content.trim() || isAiLoading}
            className="absolute right-2 bottom-2 p-1.5 rounded-md bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {isAiLoading && (
          <div className="text-[10px] text-indigo-400 animate-pulse flex items-center gap-1 ml-1">
            <BrainCircuit className="w-3 h-3" /> Thinking...
          </div>
        )}
      </div>
    </div>
  );
};
