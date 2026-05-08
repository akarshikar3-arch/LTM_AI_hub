export type AgentStatus = 'live' | 'beta' | 'coming-soon';
export type AgentCategory = 'Business Usecase' | 'Enterprise' 
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
  supportContacts?: SupportContact[];
  createdBy?: {
    initials: string;
    name: string;
    role: string;
  };
  downloadAssets?: {
    name: string;
    meta: string;
    type: string;
  }[];
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

export interface SupportContact {
  initials: string;
  name: string;
  title: string;
  email: string;
  teamsHandle: string;
  avatarColor: 'teal' | 'amber' | 'blue';
}





