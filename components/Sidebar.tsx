import React from 'react';
import { Session } from '../types';
import { FolderPlus, Hash, BrainCircuit, Trash2, Users, Network, Monitor } from 'lucide-react';

interface SidebarProps {
  mode: 'SOLO' | 'COLLAB';
  setMode: (mode: 'SOLO' | 'COLLAB') => void;
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  mode,
  setMode,
  sessions, 
  activeSessionId, 
  onSelectSession, 
  onCreateSession,
  onDeleteSession
}) => {
  return (
    <div className="w-64 bg-surface border-r border-border h-full flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <BrainCircuit className="text-primary w-6 h-6" />
          <h1 className="font-bold text-lg tracking-tight">DevCognition</h1>
        </div>
        
        {/* Mode Switcher */}
        <div className="grid grid-cols-2 bg-background rounded-lg p-1 gap-1 border border-border">
            <button 
                onClick={() => setMode('SOLO')}
                className={`flex items-center justify-center gap-2 text-xs font-medium py-1.5 rounded-md transition-all ${
                    mode === 'SOLO' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
            >
                <Monitor className="w-3 h-3" /> Solo
            </button>
            <button 
                onClick={() => setMode('COLLAB')}
                className={`flex items-center justify-center gap-2 text-xs font-medium py-1.5 rounded-md transition-all ${
                    mode === 'COLLAB' ? 'bg-accent text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
            >
                <Network className="w-3 h-3" /> Mesh
            </button>
        </div>
      </div>
      
      {mode === 'SOLO' ? (
        <>
            <div className="flex-1 overflow-y-auto p-2">
                <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2 px-2 mt-4">
                My Streams
                </div>
                {sessions.map(session => (
                <div
                    key={session.id}
                    onClick={() => onSelectSession(session.id)}
                    className={`group flex items-center justify-between p-2 rounded-md cursor-pointer text-sm mb-1 transition-colors ${
                    activeSessionId === session.id 
                        ? 'bg-border/50 text-white' 
                        : 'text-gray-400 hover:bg-border/30 hover:text-gray-200'
                    }`}
                >
                    <div className="flex items-center gap-2 truncate">
                    <Hash className="w-4 h-4 opacity-50 flex-shrink-0" />
                    <span className="truncate">{session.title}</span>
                    </div>
                    <button 
                    onClick={(e) => onDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-danger transition-opacity"
                    title="Delete Stream"
                    >
                    <Trash2 className="w-3 h-3" />
                    </button>
                </div>
                ))}

                {sessions.length === 0 && (
                <div className="text-center p-4 text-secondary text-sm italic">
                    No active streams. Start thinking.
                </div>
                )}
            </div>

            <div className="p-3 border-t border-border">
                <button
                onClick={onCreateSession}
                className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/50 p-2 rounded-md text-sm font-medium transition-all"
                >
                <FolderPlus className="w-4 h-4" />
                New Stream
                </button>
            </div>
        </>
      ) : (
          <div className="flex-1 p-4 flex flex-col items-center justify-center text-center text-secondary">
              <Users className="w-12 h-12 mb-3 opacity-20" />
              <h3 className="text-sm font-medium text-gray-300">Collaboration Mode</h3>
              <p className="text-xs mt-1 max-w-[180px]">
                  Join a local mesh to share streams, chat, and think together.
              </p>
          </div>
      )}
    </div>
  );
};
