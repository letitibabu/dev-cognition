export enum BlockType {
  NOTE = 'NOTE',
  TASK = 'TASK',
  DECISION = 'DECISION',
  AI_INSIGHT = 'AI_INSIGHT',
  AI_USER_MSG = 'AI_USER_MSG'
}

export interface DecisionMetadata {
  problem: string;
  options: string[];
  rationale: string;
  status: 'PROPOSED' | 'DECIDED' | 'REVOKED';
}

export interface TaskMetadata {
  completed: boolean;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string; // Markdown supported
  timestamp: number;
  metadata?: DecisionMetadata | TaskMetadata;
}

export interface Session {
  id: string;
  title: string;
  blocks: Block[];
  createdAt: number;
  updatedAt: number;
  tags: string[];
}

export interface ScratchpadItem {
  id: string;
  content: string;
  completed: boolean;
}

// --- Collaboration Types ---

export interface Peer {
  id: string;
  name: string;
  isHost: boolean;
  joinedAt: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
}

export interface CollabStream extends Session {
  mongoUri?: string;
  messages: ChatMessage[];
  connectedPeers: string[]; // List of Peer IDs currently active in this stream
}

export type MeshEvent = 
  | { type: 'HELLO', peer: Peer }
  | { type: 'WELCOME', state: { streams: CollabStream[], peers: Peer[] } }
  | { type: 'UPDATE_STREAM', streamId: string, blocks: Block[] }
  | { type: 'NEW_CHAT', streamId: string, message: ChatMessage }
  | { type: 'CREATE_STREAM', stream: CollabStream }
  | { type: 'PEER_JOINED', peer: Peer }
  | { type: 'PEER_LEFT', peerId: string };
