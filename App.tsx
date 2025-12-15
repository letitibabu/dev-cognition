import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { BlockItem } from './components/BlockItem';
import { Editor } from './components/Editor';
import { DecisionModal } from './components/DecisionModal';
import { Scratchpad } from './components/Scratchpad';
import { CollabView } from './components/CollabView'; // Import new view
import { Session, Block, BlockType, TaskMetadata } from './types';
import { loadSessions, saveSessions, generateId } from './services/storageService';
import { generateInsight } from './services/geminiService';
import { Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<'SOLO' | 'COLLAB'>('SOLO');
  
  // --- Solo State ---
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial Load
  useEffect(() => {
    const loaded = loadSessions();
    setSessions(loaded);
    if (loaded.length > 0) {
      setActiveSessionId(loaded[0].id);
    } else {
      createSession(); 
    }
  }, []);

  // Save on change
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Scroll to bottom on new block
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sessions, activeSessionId]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const createSession = () => {
    const newSession: Session = {
      id: generateId(),
      title: 'New Stream',
      blocks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: []
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const updateSession = (id: string, updates: Partial<Session>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s));
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this stream?")) return;
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (activeSessionId === id) {
      setActiveSessionId(newSessions.length > 0 ? newSessions[0].id : null);
    }
  };

  const addBlock = (type: BlockType, content: string, metadata?: any) => {
    if (!activeSessionId) return;
    
    // Auto-update title logic
    let titleUpdate = {};
    if (activeSession?.blocks.length === 0 && type === BlockType.NOTE && activeSession.title === 'New Stream') {
      const firstLine = content.split('\n')[0].substring(0, 30);
      titleUpdate = { title: firstLine || 'New Stream' };
    }

    const newBlock: Block = {
      id: generateId(),
      type,
      content,
      timestamp: Date.now(),
      metadata
    };

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, blocks: [...s.blocks, newBlock], ...titleUpdate, updatedAt: Date.now() };
      }
      return s;
    }));
  };

  const toggleTask = (blockId: string) => {
    if (!activeSessionId) return;
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        const newBlocks = s.blocks.map(b => {
          if (b.id === blockId && b.type === BlockType.TASK) {
            const meta = b.metadata as TaskMetadata;
            return { ...b, metadata: { ...meta, completed: !meta.completed } };
          }
          return b;
        });
        return { ...s, blocks: newBlocks };
      }
      return s;
    }));
  };

  const handleAskAI = async (query: string) => {
    if (!activeSession) return;
    addBlock(BlockType.AI_USER_MSG, query);
    setIsAiLoading(true);
    const tempSession = {
        ...activeSession,
        blocks: [...activeSession.blocks, { id: 'temp', type: BlockType.AI_USER_MSG, content: query, timestamp: Date.now() }]
    };
    const insight = await generateInsight(tempSession, query);
    setIsAiLoading(false);
    addBlock(BlockType.AI_INSIGHT, insight);
  };

  const handleManualAIReview = async () => {
    if (!activeSession) return;
    setIsAiLoading(true);
    const insight = await generateInsight(activeSession);
    setIsAiLoading(false);
    addBlock(BlockType.AI_INSIGHT, insight);
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden text-gray-200 font-sans selection:bg-primary/30">
      <Sidebar 
        mode={mode}
        setMode={setMode}
        sessions={sessions} 
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onCreateSession={createSession}
        onDeleteSession={deleteSession}
      />
      
      {mode === 'SOLO' ? (
        <main className="flex-1 flex flex-col relative min-w-0">
            {/* Header */}
            <div className="h-14 border-b border-border flex items-center justify-between px-6 flex-shrink-0 bg-background/50 backdrop-blur-sm z-10">
            <div className="flex items-center gap-3">
                <input 
                value={activeSession?.title || ''}
                onChange={(e) => activeSessionId && updateSession(activeSessionId, { title: e.target.value })}
                className="bg-transparent text-lg font-bold text-white outline-none placeholder-gray-600 w-full min-w-[300px]"
                placeholder="Stream Title..."
                />
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleManualAIReview}
                    disabled={isAiLoading || !activeSession}
                    className="flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-full border border-indigo-500/30 hover:bg-indigo-500/10 transition-colors"
                >
                    <Sparkles className="w-3 h-3" />
                    Review Context
                </button>
            </div>
            </div>

            {/* Stream Content */}
            <div className="flex-1 overflow-y-auto px-4 md:px-0" ref={scrollRef}>
            <div className="max-w-3xl mx-auto py-8">
                {activeSession ? (
                <>
                    {activeSession.blocks.length === 0 && (
                    <div className="text-center mt-20 text-secondary">
                        <p className="text-sm">This is your space to think.</p>
                        <p className="text-xs mt-2">Start with a plan, a bug report, or a raw idea.</p>
                    </div>
                    )}
                    {activeSession.blocks.map(block => (
                    <BlockItem 
                        key={block.id} 
                        block={block} 
                        onToggleTask={toggleTask}
                    />
                    ))}
                </>
                ) : (
                <div className="flex items-center justify-center h-full text-secondary">
                    Select or create a stream to begin.
                </div>
                )}
            </div>
            </div>

            {/* Editor */}
            {activeSessionId && (
            <Editor 
                onAddNote={(c) => addBlock(BlockType.NOTE, c)}
                onAddTask={(c) => addBlock(BlockType.TASK, c, { completed: false })}
                onOpenDecisionModal={() => setIsDecisionModalOpen(true)}
                onAskAI={handleAskAI}
                isAiLoading={isAiLoading}
            />
            )}
        </main>
      ) : (
          <div className="flex-1 overflow-hidden">
              <CollabView />
          </div>
      )}

      <Scratchpad />
      
      <DecisionModal 
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        onSubmit={(data) => addBlock(BlockType.DECISION, data.decision, data.metadata)}
      />
    </div>
  );
};

export default App;
