import React from 'react';
import { Block, BlockType, DecisionMetadata, TaskMetadata } from '../types';
import { CheckCircle2, Circle, AlertTriangle, Lightbulb, MessageSquare, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface BlockItemProps {
  block: Block;
  onToggleTask?: (id: string) => void;
}

export const BlockItem: React.FC<BlockItemProps> = ({ block, onToggleTask }) => {
  
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderContent = () => {
    switch (block.type) {
      case BlockType.DECISION:
        const meta = block.metadata as DecisionMetadata;
        return (
          <div className="border-l-4 border-success bg-success/5 p-4 rounded-r-md my-2">
            <div className="flex items-center gap-2 mb-2 text-success font-semibold uppercase text-xs tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              Decision Log
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{meta.problem}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <span className="text-xs text-secondary font-mono block mb-1">OPTIONS</span>
                <ul className="list-disc list-inside text-sm text-gray-300">
                  {meta.options.map((opt, i) => <li key={i}>{opt}</li>)}
                </ul>
              </div>
              <div>
                <span className="text-xs text-secondary font-mono block mb-1">RATIONALE</span>
                <p className="text-sm text-gray-300">{meta.rationale}</p>
              </div>
            </div>
            
            <div className="mt-2 pt-2 border-t border-success/20">
              <span className="text-xs text-secondary font-mono block mb-1">OUTCOME</span>
              <div className="text-white font-medium">{block.content}</div>
            </div>
          </div>
        );

      case BlockType.TASK:
        const taskMeta = block.metadata as TaskMetadata;
        return (
          <div 
            className={`flex items-start gap-3 p-3 rounded-md transition-colors ${taskMeta.completed ? 'opacity-60' : 'bg-surface'}`}
            onClick={() => onToggleTask && onToggleTask(block.id)}
          >
            <button className={`mt-0.5 ${taskMeta.completed ? 'text-success' : 'text-gray-500 hover:text-gray-300'}`}>
              {taskMeta.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
            </button>
            <div className={`text-sm ${taskMeta.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
              <ReactMarkdown>{block.content}</ReactMarkdown>
            </div>
          </div>
        );

      case BlockType.AI_INSIGHT:
        return (
          <div className="flex gap-3 bg-indigo-950/30 border border-indigo-500/20 p-4 rounded-md my-2">
            <Bot className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-1" />
            <div className="text-sm text-indigo-100 prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{block.content}</ReactMarkdown>
            </div>
          </div>
        );

      case BlockType.AI_USER_MSG:
        return (
            <div className="flex gap-3 bg-surface/50 p-3 rounded-md my-2 border border-dashed border-border">
                <MessageSquare className="w-4 h-4 text-secondary mt-1" />
                <div className="text-sm text-gray-300 italic">
                    You asked AI: {block.content}
                </div>
            </div>
        )

      default: // NOTE
        return (
          <div className="group relative py-2 pl-2 border-l-2 border-transparent hover:border-border transition-all">
            <div className="text-gray-300 text-sm leading-relaxed prose prose-invert prose-p:my-1 max-w-none">
              <ReactMarkdown>{block.content}</ReactMarkdown>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="mb-2 hover:bg-white/5 rounded-lg px-2 -mx-2 transition-colors duration-200">
      <div className="flex items-center justify-between mb-1 opacity-40 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-mono text-secondary">{formatTime(block.timestamp)}</span>
      </div>
      {renderContent()}
    </div>
  );
};
