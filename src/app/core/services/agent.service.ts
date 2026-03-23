import { Injectable, signal, computed } from '@angular/core';
import { Agent, Message, ThreadType } from '../models/agent.model';

@Injectable({ providedIn: 'root' })
export class AgentService {

  private readonly _agents = signal<Agent[]>([
    {
      id: 1,
      name: 'ServiceNow Assistant',
      team: 'Enterprise',
      category: 'Enterprise',
      icon: '🔧',
      colorClass: 'ic-blue',
      status: 'live',
      model: 'Claude API',
      tagline: 'Your intelligent IT service desk',
      description: 'Raise, track and resolve IT tickets instantly. Get answers on IT policies, software requests, and outages without waiting on hold.',
      fullDescription: 'Raise incidents, check ticket status, request software access, track approvals, and get answers to IT policy questions — all without leaving the Hub. Integrates directly with Chevron\'s ServiceNow instance. Supports P1–P4 classification, auto-routing, and SLA tracking.',
      runsPerMonth: 2340,
      hoursSaved: 280,
      activityPct: 92,
      isFavorite: true,
      lastUsed: '1h ago',
      samplePrompts: [
        'Raise an incident — my laptop won\'t connect to VPN',
        'What\'s the status of my ticket INC0042891?',
        'Request Power BI Premium access for my team',
        'Who do I contact for a hardware replacement?'
      ],
      chatHistory: {
        personal: [
          { role: 'user', content: 'Raise an incident — my laptop won\'t connect to VPN', time: '9:41 AM' },
          { role: 'ai', content: 'I\'ve raised **INC0048231** for your VPN connectivity issue.\n\n**Priority:** P2 — High\n**Assigned to:** Mark Chen, Network Operations\n**Expected resolution:** 2–4 hours\n\nA confirmation has been sent to your email. Shall I add any additional context to the ticket?', time: '9:41 AM' }
        ],
        shared: [
          { role: 'user', content: 'Team: Houston office VPN is down — anyone else affected?', time: 'Yesterday', author: 'Sarah K.' },
          { role: 'ai', content: 'I found **12 open VPN tickets** from the Houston office in the last 24 hours. Root cause identified: firmware update on the firewall cluster at 03:00 CST. Network Ops is rolling back — ETA **45 minutes**. I\'ll post an update here when resolved.', time: 'Yesterday' },
          { role: 'user', content: 'Thanks, letting the team know now.', time: 'Yesterday', author: 'Mike T.' }
        ]
      },
      chatHistory_history: [
        { id: 'h1', title: 'VPN connectivity incident', preview: 'Raise an incident — laptop won\'t connect...', time: 'Today, 9:41 AM', isShared: false },
        { id: 'h2', title: 'Power BI access request', preview: 'Request access to Power BI Premium...', time: 'Yesterday', isShared: false },
        { id: 'h3', title: 'Houston office VPN outage', preview: 'Team thread: Houston office VPN is down...', time: 'Monday', isShared: true }
      ]
    },
    {
      id: 2,
      name: 'Data Marketplace',
      team: 'IT & Platforms',
      category: 'IT & Platforms',
      icon: '📊',
      colorClass: 'ic-amber',
      status: 'live',
      model: 'Azure OpenAI',
      tagline: 'Your gateway to Chevron\'s data catalogue',
      description: 'Discover, access and query Chevron\'s internal data assets. Find datasets, understand schemas, and extract insights using natural language.',
      fullDescription: 'Search and discover internal datasets, understand data schemas and lineage, request data access, and run natural-language queries against approved datasets. Covers production, drilling, refinery, financial, and ESG data across all Chevron assets.',
      runsPerMonth: 1890,
      hoursSaved: 245,
      activityPct: 78,
      isFavorite: true,
      lastUsed: 'Yesterday',
      samplePrompts: [
        'Find all production datasets for Permian Basin wells',
        'What columns are in the drilling_performance table?',
        'Show daily oil production for asset A-14 last quarter',
        'Who owns the refinery KPI dataset?'
      ],
      chatHistory: {
        personal: [
          { role: 'user', content: 'Find all production datasets for Permian Basin wells', time: '2:15 PM' },
          { role: 'ai', content: 'Found **14 datasets** matching Permian Basin production data:\n\n**Top result:** `permian_well_production_daily`\n- Owner: Upstream Analytics team\n- Last updated: Yesterday\n- Rows: 847,000 (2018–present)\n- Access level: Restricted — you have read access\n\nWould you like me to show the schema or run a sample query?', time: '2:15 PM' }
        ],
        shared: [
          { role: 'user', content: 'Team: Looking for Q3 production data across all Permian assets', time: '2 days ago', author: 'Priya R.' },
          { role: 'ai', content: 'I found the authoritative Q3 dataset: `permian_q3_2024_production_consolidated`. It covers all 247 operated wells, updated daily. I\'ve requested shared team access — you\'ll get a confirmation within 2 hours.', time: '2 days ago' }
        ]
      },
      chatHistory_history: [
        { id: 'h4', title: 'Permian Basin dataset search', preview: 'Find all production datasets...', time: 'Yesterday', isShared: false },
        { id: 'h5', title: 'Q3 production data request', preview: 'Team thread: Looking for Q3 production...', time: '2 days ago', isShared: true }
      ]
    },
    {
      id: 3,
      name: 'SharePoint Assistant',
      team: 'IT & Platforms',
      category: 'IT & Platforms',
      icon: '📁',
      colorClass: 'ic-teal',
      status: 'beta',
      model: 'Claude API',
      tagline: 'Search and summarise Chevron\'s knowledge base',
      description: 'Find documents, policies, and team resources instantly. Summarise long documents and navigate SharePoint without manual searching.',
      fullDescription: 'Intelligently search across all Chevron SharePoint sites you have access to. Summarise long documents, find the latest version of policies, locate team sites, compare versions, and get answers from internal knowledge bases — all with a single question.',
      runsPerMonth: 980,
      hoursSaved: 87,
      activityPct: 45,
      isFavorite: false,
      lastUsed: '3 days ago',
      samplePrompts: [
        'Find the latest HSE policy for offshore operations',
        'Summarise the Q3 board report on SharePoint',
        'Where is the Upstream team\'s project tracker?',
        'What changed in the travel expense policy last update?'
      ],
      chatHistory: {
        personal: [],
        shared: []
      },
      chatHistory_history: [
        { id: 'h6', title: 'HSE offshore policy search', preview: 'Find the latest HSE policy...', time: '3 days ago', isShared: false }
      ]
    }
  ]);

  readonly agents = this._agents.asReadonly();
  readonly favorites = computed(() => this._agents().filter(a => a.isFavorite));
  readonly recentlyUsed = computed(() => this._agents().filter(a => a.lastUsed));

  toggleFavorite(id: number): void {
    this._agents.update(list =>
      list.map(a => a.id === id ? { ...a, isFavorite: !a.isFavorite } : a)
    );
  }

  filterBy(category: string, status: string, query: string): Agent[] {
    return this._agents().filter(a => {
      if (category !== 'All' && a.category !== category) return false;
      if (status !== 'all' && a.status !== status) return false;
      if (query && !a.name.toLowerCase().includes(query) &&
          !a.team.toLowerCase().includes(query) &&
          !a.description.toLowerCase().includes(query)) return false;
      return true;
    });
  }

  addMessage(agentId: number, thread: ThreadType, msg: Message): void {
    this._agents.update(list =>
      list.map(a => {
        if (a.id !== agentId) return a;
        const updated = { ...a };
        updated.chatHistory = {
          ...a.chatHistory,
          [thread]: [...a.chatHistory[thread], msg]
        };
        return updated;
      })
    );
  }

  clearChat(agentId: number, thread: ThreadType): void {
    this._agents.update(list =>
      list.map(a => {
        if (a.id !== agentId) return a;
        return { ...a, chatHistory: { ...a.chatHistory, [thread]: [] } };
      })
    );
  }

  getAgentById(id: number): Agent | undefined {
    return this._agents().find(a => a.id === id);
  }
}
