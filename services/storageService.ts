import { Session, ScratchpadItem } from '../types';

const SESSIONS_KEY = 'devcognition_sessions';
const SCRATCHPAD_KEY = 'devcognition_scratchpad';

export const saveSessions = (sessions: Session[]) => {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
};

export const loadSessions = (): Session[] => {
  const data = localStorage.getItem(SESSIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveScratchpad = (items: ScratchpadItem[]) => {
  localStorage.setItem(SCRATCHPAD_KEY, JSON.stringify(items));
};

export const loadScratchpad = (): ScratchpadItem[] => {
  const data = localStorage.getItem(SCRATCHPAD_KEY);
  return data ? JSON.parse(data) : [];
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
