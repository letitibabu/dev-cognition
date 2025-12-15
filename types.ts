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
