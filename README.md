# Chevron AI Hub — Angular 17

Internal AI agent portal built with **Angular 17** (standalone components + signals), **Angular Material**, **Sora + Inter** typography, and a full Chevron brand theme.

---

## Quick Start

```bash
# 1 — Install
npm install

# 2 — Run
npm start
# → http://localhost:4200
```

---

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   │   └── agent.model.ts          ← Agent, Message, HistoryEntry types
│   │   └── services/
│   │       └── agent.service.ts        ← Signal-based state management
│   │
│   ├── layout/
│   │   ├── sidebar/sidebar.component.ts   ← Left nav with logo, routes, user strip
│   │   └── topbar/topbar.component.ts     ← Header with search + submit button
│   │
│   ├── pages/
│   │   ├── home/home.component.ts         ← Dashboard: hero, pinned, recent, grid
│   │   ├── agents/agents.component.ts     ← All agents with filters
│   │   ├── favorites/favorites.component.ts
│   │   ├── stats/stats.component.ts       ← Usage stats + per-agent breakdown
│   │   └── chat/chat.component.ts         ← Full personalised chat per agent
│   │
│   └── shared/
│       └── components/
│           └── agent-card/               ← Reusable card (grid + list modes)
│
├── styles/
│   └── main.scss                         ← Design tokens, global styles, animations
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
└── index.html
```

---

## The 3 Agents

| Agent | Category | Backend | Description |
|---|---|---|---|
| 🔧 ServiceNow Assistant | IT & Platforms | Claude API | Raise/track IT tickets, software requests, incident management |
| 📊 Data Marketplace | Data & Analytics | Azure OpenAI | Search datasets, query schemas, extract insights from Chevron's data catalogue |
| 📁 SharePoint Assistant | Collaboration | Claude API | Find documents, summarise policies, search team sites |

Each agent has:
- Personalised empty state with tailored sample prompts
- Personal chat thread (just you)
- Shared team thread (whole team)
- Chat history log in the right panel
- Agent stats (runs/mo, hours saved, activity bar)
- Export conversation to `.txt`

---

## Features

| Feature | Where |
|---|---|
| Hero banner with live stats | `HomeComponent` |
| Category filter pills | All pages |
| Hover preview tooltip | `AgentCardComponent` |
| ♡ Favorites + pinned strip | `AgentService.toggleFavorite()`, `HomeComponent` |
| Recently used chips | `HomeComponent` |
| Grid ↔ List view toggle | `AgentCardComponent` |
| Personalised chat per agent | `ChatComponent` |
| Personal vs Team thread toggle | `ChatComponent` |
| Typing indicator | `ChatComponent` |
| File attachment | `ChatComponent` |
| Voice input (simulated) | `ChatComponent` |
| Right info panel (agent stats + history) | `ChatComponent` |
| Export chat to .txt | `ChatComponent` |
| Usage stats page | `StatsComponent` |
| Angular Signals state | `AgentService` |
| Lazy-loaded routes + View Transitions | `app.routes.ts` |
| Chevron brand theme (blue/red/white) | `src/styles/main.scss` |
| Inter + Sora typography | Google Fonts |

---

## Connecting Real Agents (Next Steps)

### 1. Replace mock responses with real API calls

In `chat.component.ts`, replace the `setTimeout` simulation with a real HTTP call:

```typescript
// In ChatComponent.send():
this.http.post<{reply: string}>('/api/chat', {
  agentId: this.agentId(),
  message: text,
  history: this.messages(),
  thread: this.thread()
}).subscribe(res => {
  this.isTyping.set(false);
  this.agentSvc.addMessage(id, this.thread(), {
    role: 'ai',
    content: res.reply,
    time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
  });
});
```

### 2. Azure Function backend (your proxy)

```typescript
// Azure Function: POST /api/chat
const { agentId, message, history } = await req.json();
const agent = agentConfigs[agentId]; // system prompt + api type

// Route to Claude / Azure OpenAI / Copilot Studio
const reply = await callAI(agent, message, history);
return { text: reply };
```

### 3. Add Azure AD SSO

```bash
npm install @azure/msal-angular @azure/msal-browser
```

Add `MsalModule` to `app.config.ts` with your Chevron tenant ID and client ID.

### 4. Persist chat history to CosmosDB

Replace `AgentService`'s in-memory arrays with HTTP calls to your Azure Function:

```typescript
// GET /api/conversations?agentId=1&userId=john.d&thread=personal
// POST /api/messages { agentId, content, role, thread }
```

### 5. Load agents from SharePoint List

```typescript
// In AgentService constructor:
this.http.get(`${environment.apiBaseUrl}/agents`)
  .subscribe(agents => this._agents.set(agents));
```

---

## Design System

The Chevron brand theme is fully defined in `src/styles/main.scss`:

```scss
--chev-blue: #0071CF   // Primary — buttons, links, active states
--chev-red:  #C8001E   // Accent — hero elements, gradient bars
--bg:        #F0F4F8   // Page background
--surface:   #FFFFFF   // Cards, sidebar, topbar
```

Typography: **Sora** (headings/display) + **Inter** (body/UI)
