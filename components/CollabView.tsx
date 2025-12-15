import React, { useState, useEffect, useRef } from 'react';
import { meshService } from '../services/meshService';
import { Peer, CollabStream, BlockType, ChatMessage, Block } from '../types';
import { generateId } from '../services/storageService';
import { BlockItem } from './BlockItem';
import { Editor } from './Editor';
import { Wifi, Plus, MessageCircle, Database, Users, Hash, AlertTriangle } from 'lucide-react';

export const CollabView: React.FC = () => {
  const [hasJoined, setHasJoined] = useState(false);
  const [username, setUsername] = useState('');
  const [peers, setPeers] = useState<Peer[]>([]);
  const [streams, setStreams] = useState<CollabStream[]>([]);
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false); // AI not enabled in mesh for now, but keeping prop

  const activeStream = streams.find(s => s.id === activeStreamId);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Default username
  useEffect(() => {
    setUsername(`Dev-${Math.floor(Math.random() * 1000)}`);
  }, []);

  // Scroll to bottom on updates
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streams, activeStreamId]);

  // Mesh Event Handling
  useEffect(() => {
    const unsub = meshService.subscribe((event) => {
        switch (event.type) {
            case 'HELLO':
                // A new peer wants to join. If we are host, we welcome them with state.
                setPeers(prev => {
                    if (prev.find(p => p.id === event.peer.id)) return prev;
                    return [...prev, event.peer];
                });
                if (isHost) {
                    meshService.broadcast({
                        type: 'WELCOME',
                        state: { streams, peers: [...peers, { ...event.peer, isHost: false }] }
                    });
                }
                break;
            case 'WELCOME':
                // We just joined and received state
                if (!isHost) { // Only accept if we aren't the host
                    setStreams(event.state.streams);
                    setPeers(event.state.peers);
                    if (event.state.streams.length > 0 && !activeStreamId) {
                        setActiveStreamId(event.state.streams[0].id);
                    }
                }
                break;
            case 'CREATE_STREAM':
                setStreams(prev => [...prev, event.stream]);
                break;
            case 'UPDATE_STREAM':
                setStreams(prev => prev.map(s => s.id === event.streamId ? { ...s, blocks: event.blocks } : s));
                break;
            case 'NEW_CHAT':
                setStreams(prev => prev.map(s => {
                    if (s.id === event.streamId) {
                        return { ...s, messages: [...s.messages, event.message] };
                    }
                    return s;
                }));
                break;
            case 'PEER_JOINED':
                setPeers(prev => [...prev, event.peer]);
                break;
            case 'PEER_LEFT':
                setPeers(prev => prev.filter(p => p.id !== event.peerId));
                break;
        }
    });
    return unsub;
  }, [isHost, streams, peers, activeStreamId]);

  const handleStartSession = (host: boolean) => {
    setIsHost(host);
    setHasJoined(true);
    const me: Peer = {
        id: meshService.getPeerId(),
        name: username,
        isHost: host,
        joinedAt: Date.now()
    };
    setPeers([me]);
    
    if (host) {
        // Create initial default stream
        const defaultStream: CollabStream = {
            id: generateId(),
            title: 'General Discussion',
            blocks: [],
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            tags: [],
            connectedPeers: []
        };
        setStreams([defaultStream]);
        setActiveStreamId(defaultStream.id);
    } else {
        // Announce self
        meshService.broadcast({ type: 'HELLO', peer: me });
    }
  };

  const handleCreateStream = () => {
    const title = prompt("Stream Title:");
    if (!title) return;
    
    // Optional MongoDB
    const mongoUri = prompt("MongoDB URI (Optional - for persistence):");

    const newStream: CollabStream = {
        id: generateId(),
        title,
        blocks: [],
        messages: [],
        mongoUri: mongoUri || undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: [],
        connectedPeers: []
    };

    setStreams(prev => [...prev, newStream]);
    setActiveStreamId(newStream.id);
    meshService.broadcast({ type: 'CREATE_STREAM', stream: newStream });
  };

  const addBlock = (type: BlockType, content: string, metadata?: any) => {
    if (!activeStreamId || !activeStream) return;

    const newBlock: Block = {
        id: generateId(),
        type,
        content,
        timestamp: Date.now(),
        metadata
    };

    const updatedBlocks = [...activeStream.blocks, newBlock];
    
    // Local Update
    setStreams(prev => prev.map(s => s.id === activeStreamId ? { ...s, blocks: updatedBlocks } : s));
    
    // Broadcast
    meshService.broadcast({ type: 'UPDATE_STREAM', streamId: activeStreamId, blocks: updatedBlocks });
  };

  const sendChat = (content: string) => {
    if (!activeStreamId || !content.trim()) return;
    
    const msg: ChatMessage = {
        id: generateId(),
        senderId: meshService.getPeerId(),
        senderName: username,
        content,
        timestamp: Date.now()
    };

    setStreams(prev => prev.map(s => {
        if (s.id === activeStreamId) {
            return { ...s, messages: [...s.messages, msg] };
        }
        return s;
    }));

    meshService.broadcast({ type: 'NEW_CHAT', streamId: activeStreamId, message: msg });
  };

  if (!hasJoined) {
    return (
        <div className="h-full flex flex-col items-center justify-center bg-background text-center p-8">
            <div className="bg-surface border border-border p-8 rounded-xl max-w-md w-full shadow-2xl">
                <Wifi className="w-12 h-12 text-accent mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Local Mesh Mode</h2>
                <p className="text-secondary text-sm mb-6">
                    Connect with developers on your local network. No internet required.
                    Data is shared peer-to-peer.
                </p>

                <div className="mb-6 text-left">
                    <label className="text-xs font-mono text-secondary block mb-2">IDENTIFICATION</label>
                    <input 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-background border border-border rounded px-3 py-2 text-white focus:border-accent outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => handleStartSession(true)}
                        className="bg-accent/10 hover:bg-accent/20 border border-accent/50 text-accent font-bold py-3 rounded-lg transition-all"
                    >
                        Host Session
                    </button>
                    <button 
                        onClick={() => handleStartSession(false)}
                        className="bg-surface hover:bg-border border border-border text-gray-300 font-bold py-3 rounded-lg transition-all"
                    >
                        Join Session
                    </button>
                </div>
                <p className="text-[10px] text-gray-600 mt-4">
                    * Uses BroadcastChannel for local device simulation. <br/> 
                    For real LAN, ensure all clients are on the same signaling server.
                </p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex h-full bg-background">
        {/* Mesh Sidebar */}
        <div className="w-64 bg-surface/50 border-r border-border flex flex-col">
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-accent uppercase tracking-wider">Mesh Streams</h3>
                    <button onClick={handleCreateStream} className="text-accent hover:text-white"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="space-y-1">
                    {streams.map(stream => (
                        <div 
                            key={stream.id}
                            onClick={() => setActiveStreamId(stream.id)}
                            className={`flex items-center justify-between px-2 py-2 rounded cursor-pointer text-sm ${
                                activeStreamId === stream.id ? 'bg-accent/20 text-white' : 'text-gray-400 hover:bg-white/5'
                            }`}
                        >
                            <div className="flex items-center gap-2 truncate">
                                <Hash className="w-3 h-3 opacity-50" />
                                <span className="truncate">{stream.title}</span>
                            </div>
                            {stream.mongoUri && <Database className="w-3 h-3 text-success" />}
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Peers ({peers.length})</h3>
                <div className="space-y-2">
                    {peers.map(peer => (
                        <div key={peer.id} className="flex items-center gap-2 text-sm text-gray-300">
                            <div className={`w-2 h-2 rounded-full ${peer.isHost ? 'bg-accent' : 'bg-success'}`} />
                            <span className={peer.id === meshService.getPeerId() ? 'font-bold' : ''}>
                                {peer.name} {peer.id === meshService.getPeerId() && '(You)'}
                            </span>
                            {peer.isHost && <span className="text-[10px] bg-accent/20 text-accent px-1 rounded">HOST</span>}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/50 backdrop-blur">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {activeStream?.title}
                    {activeStream?.mongoUri && (
                        <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20 flex items-center gap-1">
                            <Database className="w-3 h-3" /> Persisted
                        </span>
                    )}
                </h2>
                <div className="flex items-center gap-2 text-xs text-secondary">
                    <Wifi className="w-3 h-3 text-accent" />
                    Mesh Active
                </div>
            </div>

            {/* Stream */}
            <div className="flex-1 overflow-y-auto px-6 py-4" ref={scrollRef}>
                <div className="max-w-3xl mx-auto">
                    {!activeStream && (
                        <div className="text-center mt-20 text-secondary">Select a stream to contribute.</div>
                    )}
                    {activeStream?.blocks.map(block => (
                         <BlockItem key={block.id} block={block} />
                    ))}
                </div>
            </div>

            {/* Editor (Reused) */}
            {activeStream && (
                <Editor 
                    onAddNote={(c) => addBlock(BlockType.NOTE, c)}
                    onAddTask={(c) => addBlock(BlockType.TASK, c, { completed: false })}
                    onOpenDecisionModal={() => {}} // Disabled in mesh for simplicity or add later
                    onAskAI={() => {}} // Disabled in mesh for now
                    isAiLoading={false}
                />
            )}
        </div>

        {/* Chat Panel */}
        <div className="w-72 border-l border-border bg-surface/30 flex flex-col">
            <div className="p-3 border-b border-border flex items-center gap-2 text-sm font-bold text-gray-300">
                <MessageCircle className="w-4 h-4" />
                Stream Chat
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {activeStream?.messages.map(msg => (
                    <div key={msg.id} className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-xs text-accent">{msg.senderName}</span>
                            <span className="text-[10px] text-gray-500">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="text-gray-300 bg-surface/50 p-2 rounded border border-white/5 break-words">
                            {msg.content}
                        </div>
                    </div>
                ))}
                {activeStream?.messages.length === 0 && (
                    <div className="text-center text-secondary text-xs mt-10">No messages yet.</div>
                )}
            </div>
            <div className="p-3 border-t border-border">
                <input 
                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-white focus:border-accent outline-none"
                    placeholder="Type a message..."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            sendChat(e.currentTarget.value);
                            e.currentTarget.value = '';
                        }
                    }}
                />
            </div>
        </div>
    </div>
  );
};
