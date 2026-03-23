export type AgentStatus = 'live' | 'beta' | 'coming-soon';
export type AgentCategory = 'IT & Platforms' | 'Enterprise' 
export type ThreadType = 'personal' | 'shared';

export interface Agent {
  id: number;
  name: string;
  team: string;
  category: AgentCategory;
  icon: string;
  colorClass: string;
  status: AgentStatus;
  model: string;
  tagline: string;
  description: string;
  fullDescription: string;
  runsPerMonth: number;
  hoursSaved: number;
  activityPct: number;
  samplePrompts: string[];
  isFavorite: boolean;
  lastUsed?: string;
  chatHistory: {
    personal: Message[];
    shared: Message[];
  };
  chatHistory_history: HistoryEntry[];
}

export interface Message {
  role: 'user' | 'ai';
  content: string;
  time: string;
  author?: string;
  files?: string[];
}

export interface HistoryEntry {
  id: string;
  title: string;
  preview: string;
  time: string;
  isShared: boolean;
}
