import { Component, signal, computed, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AgentService } from '../../core/services/agent.service';
import { Agent, Message, ThreadType } from '../../core/models/agent.model';
 
const AGENT_SYSTEM_PROMPTS: Record<number, string> = {
  1: `You are ServiceNow Assistant, an intelligent IT service desk AI for Chevron. You help employees raise IT incidents, track tickets, request software access, and answer IT policy questions. You integrate with Chevron's ServiceNow instance. Be concise, professional, and always provide ticket numbers (format: INC04XXXXX) and priorities (P1-P4) when raising incidents. Use **bold** for key info.`,
  2: `You are Data Marketplace, Chevron's internal data catalogue AI. You help employees discover datasets, understand schemas, request data access, and run natural-language queries against approved datasets. You cover production, drilling, refinery, financial, and ESG data. Use \`backticks\` for dataset names and **bold** for key figures. Be precise and data-focused.`,
  3: `You are SharePoint Assistant, Chevron's internal knowledge base AI. You help employees find documents, policies, and team resources across SharePoint. You can summarise documents, find latest policy versions, and locate team sites. Be concise and always mention the SharePoint location path when referencing documents.`
};

const HARDCODED_RESPONSES: Record<number, string[]> = {
  1: [
    `I've raised **INC0048231** for your issue.\n\n**Priority:** P2 — High\n**Assigned to:** Mark Chen, Network Operations\n**Expected resolution:** 2–4 hours\n\nA confirmation has been sent to your email. Shall I add any additional context to the ticket?`,
    `I found **3 open tickets** currently assigned to your team:\n\n• **INC0041122** — Email sync failure (P3, in progress)\n• **INC0039887** — Printer offline, Floor 4 (P4, awaiting parts)\n• **INC0044500** — VPN timeout for remote users (P2, escalated)\n\nWould you like me to update or escalate any of these?`,
    `According to Chevron's IT Access Policy (v4.2), **Power BI Premium** requires manager approval and a valid business justification.\n\nI've pre-filled a software access request on your behalf:\n- **Requested by:** Akarshika R\n- **Software:** Power BI Premium\n- **Justification field:** Please add your use case\n\nShall I submit it once you confirm the justification?`,
    `The **Houston office VPN outage** has been resolved as of 11:42 AM CST.\n\n**Root cause:** Firmware rollback on Firewall Cluster HOU-02 completed successfully.\n**Duration:** 2h 14min · **Affected users:** 87\n\nA post-incident report will be available within 24 hours. Is there anything else I can help with?`
  ],
  2: [
    `Found **14 datasets** matching your query for Permian Basin production data:\n\n**Top result:** \`permian_well_production_daily\`\n- **Owner:** Upstream Analytics\n- **Last updated:** Yesterday\n- **Rows:** 847,000 (2018–present)\n- **Access:** Restricted — you have read access ✓\n\nWould you like me to show the schema or run a sample query?`,
    `Here's the schema for \`drilling_performance_metrics\`:\n\n**Columns:** well_id (VARCHAR), spud_date (DATE), total_depth_ft (FLOAT), rop_avg (FLOAT), npt_hours (FLOAT)\n\n**Last refreshed:** 6 hours ago · **Rows:** 1.2M\n\nShall I run a sample query or request full access?`,
    `Here's a summary of **Asset A-14 daily oil production** for Q3 2024:\n\n**Total output:** 1.24M barrels\n**Daily average:** 13,478 bbl/day\n**Peak day:** Aug 14 — 16,230 bbl\n**vs Q2:** ↑ **3.2%**\n\nWould you like me to export this as a CSV or generate a trend chart?`,
    `The **Refinery KPI dataset** is owned by the **Downstream Performance team**.\n\n- **Dataset:** \`refinery_kpi_consolidated\`\n- **Owner:** James R. (downstream-analytics@chevron.com)\n- **Update frequency:** Daily at 06:00 UTC\n- **Access level:** Internal — request required\n\nShall I raise an access request on your behalf?`
  ],
  3: [
    `I found the **HSE Policy for Offshore Operations** on SharePoint:\n\n📄 **HSE-OPS-2024-v3.2.pdf**\n📍 Location: \`/sites/SafetyHub/Policies/Offshore/\`\n🕐 Last updated: February 12, 2026 by Sarah Mitchell\n\n**Key updates in v3.2:** Revised PPE requirements for subsea operations, updated emergency muster procedures, new contractor induction checklist.\n\nShall I summarise the full document or open it directly?`,
    `Here's a summary of the **Q3 Board Report** (SharePoint: \`/sites/Executive/BoardReports/Q3-2024/\`):\n\n**Financial:** Revenue up 8.2% YoY driven by upstream recovery. CAPEX within 3% of guidance.\n**Operations:** Permian Basin output exceeded targets by 4.1%. Two refinery turnarounds completed on schedule.\n**ESG:** Scope 1 emissions reduced by 6% vs baseline.\n\nWould you like the full document or a specific section?`,
    `I located the **Upstream team's project tracker** on SharePoint:\n\n📊 **Upstream Projects Dashboard**\n📍 \`/sites/Upstream/ProjectManagement/ActiveProjects.xlsx\`\n👤 Maintained by: Priya R., Project Controls\n🕐 Updated: Today at 08:30 AM\n\nThe tracker currently shows **12 active projects**, 3 flagged as at-risk. Would you like me to pull the at-risk items?`,
    `Here's what changed in the **Travel & Expense Policy** (last updated Jan 15, 2026):\n\n📍 \`/sites/HR/Policies/Finance/TravelExpense-v5.1.pdf\`\n\n**Key changes:**\n• Daily meal allowance increased to **$75** (was $60)\n• Hotel cap raised to **$220/night** in Tier 1 cities\n• Receipts mandatory for all expenses over **$25** (was $50)\n• Uber/Lyft now approved over rental cars for trips under 50 miles\n\nShall I open the full policy document?`
  ]
};

const agentResponseCounters: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
function getNextResponse(agentId: number): string {
  const responses = HARDCODED_RESPONSES[agentId];
  if (!responses) return 'I\'m here to help! Could you provide more details about your request?';
  const index = agentResponseCounters[agentId] % responses.length;
  agentResponseCounters[agentId]++;
  return responses[index];
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="chat-outer">

      <!-- LEFT HISTORY SIDEBAR -->
      <div class="history-sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="hs-header">
          @if (!sidebarCollapsed()) {
            <span class="hs-title">Chat History</span>
          }
          <button class="hs-toggle" (click)="toggleSidebar()" [title]="sidebarCollapsed() ? 'Expand' : 'Collapse'">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              @if (sidebarCollapsed()) {
                <path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              } @else {
                <path d="M10 3l-5 5 5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              }
            </svg>
          </button>
        </div>
        @if (!sidebarCollapsed()) {
          <div class="hs-tabs">
            <button class="hs-tab" [class.active]="thread() === 'personal'" (click)="setThread('personal')">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.4"/>
                <path d="M2 13c0-2.2 2.7-4 6-4s6 1.8 6 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
              My Chats
            </button>
            <button class="hs-tab" [class.active]="thread() === 'shared'" (click)="setThread('shared')">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <circle cx="5" cy="5" r="2.5" stroke="currentColor" stroke-width="1.4"/>
                <circle cx="11" cy="5" r="2.5" stroke="currentColor" stroke-width="1.4"/>
                <path d="M1 13c0-2 1.8-3 4-3h6c2.2 0 4 1 4 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
              Team
            </button>
          </div>
          <div class="hs-list">
            @if (agent()?.chatHistory_history?.length) {
              @for (h of agent()!.chatHistory_history; track h.id; let i = $index) {
                <div class="hs-item" [class.active]="i === activeHistoryIdx()" (click)="activeHistoryIdx.set(i)">
                  <div class="hs-item-icon" [class]="agent()!.colorClass">{{ agent()!.icon }}</div>
                  <div class="hs-item-body">
                    <div class="hs-item-title">{{ h.title }}</div>
                    <div class="hs-item-preview">{{ h.preview }}</div>
                    <div class="hs-item-meta">
                      <span>{{ h.time }}</span>
                      @if (h.isShared) { <span class="hs-team-tag">Team</span> }
                    </div>
                  </div>
                </div>
              }
            } @else {
              <div class="hs-empty">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>No history yet</span>
                <span class="hs-empty-sub">Start chatting to see history here</span>
              </div>
            }
          </div>
        }
      </div>

      <!-- MAIN CHAT -->
      <div class="chat-layout">

        <header class="chat-header">
          <a class="back-btn" routerLink="/home">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M10 13L5 8l5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
          @if (agent()) {
            <div class="agent-icon-wrap" [class]="agent()!.colorClass">{{ agent()!.icon }}</div>
            <div class="chat-agent-info">
              <div class="chat-agent-name">{{ agent()!.name }}</div>
              <div class="chat-agent-meta">
                <span class="meta-dot"></span>
                <span class="meta-online">Online</span>
                <span class="meta-sep">·</span>
                <span>{{ agent()!.team }}</span>
                <span class="meta-sep">·</span>
                <span>{{ agent()!.model }}</span>
              </div>
            </div>
          }
          <div class="chat-header-actions">
            <div class="thread-switch">
              <button class="ts-btn" [class.active]="thread() === 'personal'" (click)="setThread('personal')">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.4"/>
                  <path d="M2 13c0-2.2 2.7-4 6-4s6 1.8 6 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                </svg>
                My Chat
              </button>
              <button class="ts-btn" [class.active]="thread() === 'shared'" (click)="setThread('shared')">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <circle cx="5" cy="5" r="2.5" stroke="currentColor" stroke-width="1.4"/>
                  <circle cx="11" cy="5" r="2.5" stroke="currentColor" stroke-width="1.4"/>
                  <path d="M1 13c0-2 1.8-3 4-3h6c2.2 0 4 1 4 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                </svg>
                Team
              </button>
            </div>
            <button class="hdr-btn" (click)="togglePanel()">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="3" width="14" height="2" rx="1" fill="currentColor"/>
                <rect x="1" y="7.5" width="14" height="2" rx="1" fill="currentColor"/>
                <rect x="1" y="12" width="14" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>
            <button class="hdr-btn hdr-danger" (click)="clearConversation()" title="New conversation">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 8h12M8 2l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </header>

        <div class="chat-body">
          <div class="messages-area">
            @if (messages().length === 0) {
              <div class="chat-empty">
                @if (agent()) {
                  <div class="empty-icon-wrap" [class]="agent()!.colorClass">{{ agent()!.icon }}</div>
                  <h2 class="empty-title">How can I help you today?</h2>
                  <p class="empty-sub">{{ agent()!.description }}</p>
                  <div class="prompt-grid">
                    @for (p of agent()!.samplePrompts; track p) {
                      <button class="prompt-card" (click)="usePrompt(p)">
                        <span class="prompt-arrow">→</span>
                        <span>{{ p }}</span>
                      </button>
                    }
                  </div>
                }
              </div>
            } @else {
              <div class="messages" #msgContainer>
                @for (msg of messages(); track $index) {
                  <div class="msg-row" [class.user-row]="msg.role === 'user'">
                    <div class="msg-av" [class.user-av]="msg.role === 'user'" [class.ai-av]="msg.role === 'ai'">
                      {{ msg.role === 'user' ? (msg.author ? msg.author[0] : 'A') : agent()?.icon }}
                    </div>
                    <div class="msg-body" [class.user-body]="msg.role === 'user'">
                      @if (msg.author) { <div class="msg-author">{{ msg.author }}</div> }
                      <div class="msg-bubble"
                        [class.user-bubble]="msg.role === 'user'"
                        [class.ai-bubble]="msg.role === 'ai'"
                        [innerHTML]="formatMsg(msg.content)">
                      </div>
                      <div class="msg-time">{{ msg.time }}</div>
                    </div>
                  </div>
                }
                @if (isTyping()) {
                  <div class="msg-row">
                    <div class="msg-av ai-av">{{ agent()?.icon }}</div>
                    <div class="typing-bubble">
                      <div class="ty-dot"></div><div class="ty-dot"></div><div class="ty-dot"></div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <div class="info-panel" [class.open]="panelOpen()">
            <div class="panel-header">
              <span class="panel-title">Agent Info</span>
              <button class="panel-close" (click)="togglePanel()">✕</button>
            </div>
            <div class="panel-body">
              @if (agent()) {
                <div class="agent-info-box">
                  <div class="aib-row">
                    <div class="aib-icon" [class]="agent()!.colorClass">{{ agent()!.icon }}</div>
                    <div>
                      <div class="aib-name">{{ agent()!.name }}</div>
                      <div class="aib-team">{{ agent()!.team }}</div>
                    </div>
                  </div>
                  <div class="aib-stat"><span>Backend</span><span>{{ agent()!.model }}</span></div>
                  <div class="aib-stat"><span>Runs / month</span><b class="green">{{ agent()!.runsPerMonth.toLocaleString() }}</b></div>
                  <div class="aib-stat"><span>Time saved</span><b class="green">{{ agent()!.hoursSaved }}h / mo</b></div>
                  <div class="aib-stat"><span>Status</span>
                    <span class="badge" [class]="agent()!.status === 'live' ? 'live' : agent()!.status === 'beta' ? 'beta' : 'soon'">{{ agent()!.status }}</span>
                  </div>
                </div>
                <button class="export-btn" (click)="exportChat()">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2v9M4 7l4 4 4-4M2 13h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Export conversation
                </button>
                @if (agent()!.chatHistory_history.length > 0) {
                  <div class="history-label">Chat history</div>
                  @for (h of agent()!.chatHistory_history; track h.id; let i = $index) {
                    <div class="history-item" [class.active]="i === 0">
                      <div class="hi-title">{{ h.title }}</div>
                      <div class="hi-preview">{{ h.preview }}</div>
                      <div class="hi-meta">
                        <span class="hi-time">{{ h.time }}</span>
                        @if (h.isShared) { <span class="team-tag">Team</span> }
                      </div>
                    </div>
                  }
                }
              }
            </div>
          </div>
        </div>

        <div class="input-area">
          @if (attachedFiles().length > 0) {
            <div class="file-chips">
              @for (f of attachedFiles(); track f; let i = $index) {
                <div class="file-chip">
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                    <path d="M4 2h6l4 4v8a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.4"/>
                  </svg>
                  {{ f }}
                  <button (click)="removeFile(i)">✕</button>
                </div>
              }
            </div>
          }
          <div class="input-shell" [class.focused]="inputFocused">
            <textarea #inputRef [(ngModel)]="inputText"
              placeholder="Message {{ agent()?.name }}…" rows="1"
              (input)="autoResize($event)"
              (focus)="inputFocused = true"
              (blur)="inputFocused = false"
              (keydown)="onKeydown($event)">
            </textarea>
            <div class="input-actions">
              <label class="action-btn">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M13 8l-5 5a4 4 0 01-5.66-5.66l6-6a2.5 2.5 0 013.54 3.54L6 11.34a1 1 0 01-1.42-1.42L10 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                </svg>
                <input type="file" multiple style="display:none" (change)="onFileSelect($event)">
              </label>
              <button class="action-btn" [class.recording]="isRecording()" (click)="toggleVoice()">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect x="5" y="1" width="6" height="9" rx="3" stroke="currentColor" stroke-width="1.4"/>
                  <path d="M2 8c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                  <line x1="8" y1="14" x2="8" y2="16" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                </svg>
              </button>
              <button class="send-btn" [disabled]="!canSend" (click)="send()">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8h12M8 2l6 6-6 6" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="input-hint">
            <span>{{ thread() === 'personal' ? '🔒 Personal — only you see this' : '👥 Team thread — visible to your team' }}</span>
            <span>Enter to send · Shift+Enter for new line</span>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex; flex-direction: column;
      height: calc(100vh - var(--top-h)); overflow: hidden;
      --r: #e23825;
      --r-light: #fff0f1;
      --r-mid: rgba(232,25,44,.12);
      --r-border: rgba(232,25,44,.22);
      --r-shadow: rgba(232,25,44,.18);
      --bg: #f7f7f8;
      --surface: #ffffff;
      --surface-2: #f4f4f5;
      --border: #e4e4e7;
      --border-strong: #d1d1d6;
      --t1: #111113;
      --t2: #3f3f46;
      --t3: #71717a;
      --t4: #a1a1aa;
    }

    .chat-outer { display: flex; height: 100%; overflow: hidden; background: var(--bg); }

    /* HISTORY SIDEBAR */
    .history-sidebar {
      width: 240px; flex-shrink: 0;
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex; flex-direction: column; overflow: hidden;
      transition: width .22s cubic-bezier(.4,0,.2,1);
    }
    .history-sidebar.collapsed { width: 44px; }

    .hs-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 10px 10px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0; min-height: 48px;
    }
    .hs-title { font-size: 11px; font-weight: 700; color: var(--t3); white-space: nowrap; text-transform: uppercase; letter-spacing: .6px; }
    .hs-toggle {
      width: 26px; height: 26px; border-radius: 7px;
      border: 1.5px solid var(--border); background: white;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: var(--t3); transition: all .14s; flex-shrink: 0;
    }
    .hs-toggle:hover { border-color: var(--r); color: var(--r); background: var(--r-light); }

    .hs-tabs { display: flex; gap: 3px; padding: 8px 8px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
    .hs-tab {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
      padding: 5px 8px; border-radius: 7px;
      font-size: 11px; font-weight: 500; color: var(--t3);
      cursor: pointer; border: none; background: transparent;
      font-family: var(--font); transition: all .14s; white-space: nowrap;
    }
    .hs-tab.active { background: var(--r-light); color: var(--r); font-weight: 600; }

    .hs-list { flex: 1; overflow-y: auto; padding: 8px; }
    .hs-list::-webkit-scrollbar { width: 3px; }
    .hs-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }

    .hs-item {
      display: flex; gap: 9px; padding: 10px; border-radius: 9px;
      cursor: pointer; transition: all .14s;
      border: 1.5px solid transparent; margin-bottom: 3px;
    }
    .hs-item:hover { background: var(--surface-2); border-color: var(--border); }
    .hs-item.active { background: var(--r-light); border-color: var(--r-border); }
    .hs-item-icon { width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
    .ic-blue  { background: rgba(74,159,224,.12); }
    .ic-amber { background: rgba(240,180,60,.12); }
    .ic-teal  { background: rgba(60,200,200,.12); }
    .hs-item-body { flex: 1; min-width: 0; }
    .hs-item-title { font-size: 12px; font-weight: 600; color: var(--t1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
    .hs-item-preview { font-size: 11px; color: var(--t4); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
    .hs-item-meta { display: flex; align-items: center; gap: 6px; }
    .hs-item-meta span { font-size: 10px; color: var(--t4); }
    .hs-team-tag { background: var(--r-light); color: var(--r); font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 5px; }

    .hs-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 16px; gap: 8px; color: var(--t4); text-align: center; }
    .hs-empty span { font-size: 12px; color: var(--t3); font-weight: 500; }
    .hs-empty-sub { font-size: 11px; color: var(--t4); font-weight: 400 !important; line-height: 1.5; }

    /* MAIN CHAT */
    .chat-layout { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--bg); }

    /* HEADER */
    .chat-header {
      height: 64px; background: var(--surface);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center;
      padding: 0 20px; gap: 12px; flex-shrink: 0; position: relative;
    }
    .chat-header::after {
      content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, var(--r) 0%, rgba(232,25,44,.3) 40%, transparent 70%);
    }

    .back-btn {
      width: 32px; height: 32px; border-radius: 9px;
      border: 1.5px solid var(--border); background: white;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: var(--t3); text-decoration: none; transition: all .15s; flex-shrink: 0;
      box-shadow: 0 1px 3px rgba(0,0,0,.06);
    }
    .back-btn:hover { border-color: var(--r); color: var(--r); background: var(--r-light); }

    .agent-icon-wrap {
      width: 40px; height: 40px; border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; flex-shrink: 0;
      border: 1.5px solid var(--border);
      box-shadow: 0 1px 3px rgba(0,0,0,.06);
    }

    .chat-agent-name { font-size: 15px; font-weight: 700; color: var(--t1); letter-spacing: -.3px; }
    .chat-agent-meta { font-size: 11px; color: var(--t3); margin-top: 3px; display: flex; align-items: center; gap: 5px; }
    .meta-dot { width: 6px; height: 6px; border-radius: 50%; background: #16a34a; flex-shrink: 0; animation: blink 2.5s ease-in-out infinite; }
    .meta-online { color: #16a34a; font-weight: 600; }
    .meta-sep { color: var(--border-strong); }

    .chat-header-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; }

    .thread-switch {
      display: flex; background: var(--surface-2); border: 1.5px solid var(--border);
      border-radius: 10px; padding: 3px; gap: 2px;
    }
    .ts-btn {
      display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 7px;
      font-size: 12px; font-weight: 500; color: var(--t3);
      cursor: pointer; border: none; background: transparent; font-family: var(--font); transition: all .14s;
    }
    .ts-btn.active { background: var(--r); color: white; box-shadow: 0 2px 8px var(--r-shadow); }

    .hdr-btn {
      width: 32px; height: 32px; border-radius: 9px;
      border: 1.5px solid var(--border); background: white;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: var(--t3); transition: all .14s; box-shadow: 0 1px 3px rgba(0,0,0,.06);
    }
    .hdr-btn:hover { border-color: var(--border-strong); color: var(--t1); }
    .hdr-danger:hover { border-color: var(--r); color: var(--r); background: var(--r-light); }

    /* BODY */
    .chat-body { flex: 1; display: flex; overflow: hidden; }
    .messages-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

    /* Empty */
    .chat-empty {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center; padding: 40px 28px;
    }
    .empty-icon-wrap {
      width: 72px; height: 72px; border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      font-size: 34px; margin-bottom: 20px;
      border: 1.5px solid var(--border);
      box-shadow: 0 4px 16px rgba(0,0,0,.06);
    }
    .empty-title { font-size: 22px; font-weight: 700; color: var(--t1); margin-bottom: 8px; letter-spacing: -.4px; }
    .empty-sub { font-size: 13px; color: var(--t3); line-height: 1.65; text-align: center; max-width: 360px; margin-bottom: 28px; }
    .prompt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; max-width: 520px; }
    .prompt-card {
      display: flex; align-items: flex-start; gap: 9px;
      background: white; border: 1.5px solid var(--border);
      border-radius: 10px; padding: 12px 14px;
      cursor: pointer; font-size: 12px; color: var(--t2);
      font-family: var(--font); text-align: left;
      transition: all .18s; line-height: 1.5;
      box-shadow: 0 1px 4px rgba(0,0,0,.05);
    }
    .prompt-card:hover { border-color: var(--r); color: var(--t1); background: var(--r-light); box-shadow: 0 3px 12px var(--r-shadow); }
    .prompt-arrow { color: var(--r); font-size: 14px; flex-shrink: 0; margin-top: 1px; font-weight: 700; }

    /* Messages */
    .messages { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
    .messages::-webkit-scrollbar { width: 4px; }
    .messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }

    .msg-row { display: flex; gap: 10px; }
    .msg-row.user-row { flex-direction: row-reverse; }

    .msg-av {
      width: 30px; height: 30px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; flex-shrink: 0; margin-top: 2px;
    }
    .ai-av { background: white; border: 1.5px solid var(--border); font-size: 15px; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
    .user-av { background: var(--r); color: white; font-size: 11px; box-shadow: 0 2px 8px var(--r-shadow); }

    .msg-body { max-width: 68%; display: flex; flex-direction: column; gap: 4px; }
    .user-body { align-items: flex-end; }
    .msg-author { font-size: 11px; font-weight: 600; color: var(--t2); padding: 0 2px; }

    .msg-bubble { padding: 11px 15px; border-radius: 16px; font-size: 13px; line-height: 1.7; }
    .ai-bubble {
      background: white; border: 1.5px solid var(--border);
      color: var(--t1); border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,.05);
    }
    .user-bubble {
      background: var(--r); color: white;
      border-bottom-right-radius: 4px;
      box-shadow: 0 4px 16px var(--r-shadow);
    }
    :host ::ng-deep .ai-bubble strong { font-weight: 700; color: var(--t1); }
    :host ::ng-deep .ai-bubble code {
      background: var(--r-light); color: var(--r);
      padding: 1px 6px; border-radius: 4px; font-size: 12px;
      border: 1px solid var(--r-border);
    }
    .msg-time { font-size: 10px; color: var(--t4); padding: 0 3px; }

    .typing-bubble {
      display: flex; gap: 5px; align-items: center;
      background: white; border: 1.5px solid var(--border);
      padding: 13px 16px; border-radius: 16px; border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,.05);
    }
    .ty-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--t4); animation: dotBounce 1.2s ease-in-out infinite; }
    .ty-dot:nth-child(2) { animation-delay: .2s; }
    .ty-dot:nth-child(3) { animation-delay: .4s; }
    @keyframes dotBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }

    /* Right panel */
    .info-panel { width: 0; flex-shrink: 0; border-left: 1px solid var(--border); background: white; overflow: hidden; transition: width .25s cubic-bezier(.4,0,.2,1); display: flex; flex-direction: column; }
    .info-panel.open { width: 264px; }
    .panel-header { padding: 16px 16px 12px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
    .panel-title { font-size: 11px; font-weight: 700; color: var(--t3); text-transform: uppercase; letter-spacing: .5px; }
    .panel-close { width: 26px; height: 26px; border-radius: 7px; border: 1.5px solid var(--border); background: white; cursor: pointer; color: var(--t3); font-size: 13px; display: flex; align-items: center; justify-content: center; transition: all .12s; }
    .panel-close:hover { border-color: var(--r); color: var(--r); background: var(--r-light); }
    .panel-body { flex: 1; overflow-y: auto; padding: 14px; }
    .agent-info-box { background: var(--surface-2); border: 1.5px solid var(--border); border-radius: 10px; padding: 14px; margin-bottom: 12px; }
    .aib-row { display: flex; align-items: center; gap: 10px; margin-bottom: 11px; }
    .aib-icon { width: 38px; height: 38px; border-radius: 10px; display:flex; align-items:center; justify-content:center; font-size:18px; }
    .aib-name { font-size: 13px; font-weight: 700; color: var(--t1); }
    .aib-team { font-size: 10px; color: var(--t4); margin-top: 2px; text-transform: uppercase; letter-spacing: .3px; }
    .aib-stat { display: flex; justify-content: space-between; align-items: center; font-size: 11px; padding: 6px 0; border-top: 1px solid var(--border); color: var(--t3); }
    .aib-stat b { font-weight: 700; color: var(--t1); }
    .aib-stat b.green { color: #16a34a; }
    .export-btn { width: 100%; padding: 8px 12px; background: white; border: 1.5px solid var(--border); border-radius: 8px; color: var(--t2); font-size: 12px; font-weight: 500; font-family: var(--font); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: all .15s; margin-bottom: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.05); }
    .export-btn:hover { border-color: var(--r); color: var(--r); background: var(--r-light); }
    .history-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--t4); margin: 4px 0 8px; }
    .history-item { padding: 10px 10px; border-radius: 8px; cursor: pointer; transition: all .14s; border: 1.5px solid transparent; margin-bottom: 4px; }
    .history-item:hover { background: var(--surface-2); border-color: var(--border); }
    .history-item.active { background: var(--r-light); border-color: var(--r-border); }
    .hi-title { font-size: 12px; color: var(--t1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; font-weight: 500; }
    .hi-preview { font-size: 11px; color: var(--t4); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .hi-meta { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
    .hi-time { font-size: 10px; color: var(--t4); }
    .team-tag { background: var(--r-light); color: var(--r); font-size: 10px; font-weight: 600; padding: 1px 8px; border-radius: 6px; }
    .badge { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 600; padding: 3px 9px; border-radius: 20px; }
    .live { background: #dcfce7; color: #16a34a; }
    .live::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: #16a34a; }
    .beta { background: #fef9c3; color: #ca8a04; }
    .soon { background: #f3e8ff; color: #9333ea; }

    /* INPUT */
    .input-area { padding: 12px 20px 16px; border-top: 1px solid var(--border); background: white; flex-shrink: 0; }
    .file-chips { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 10px; }
    .file-chip { display: flex; align-items: center; gap: 6px; background: var(--r-light); border: 1.5px solid var(--r-border); border-radius: 6px; padding: 4px 10px; font-size: 11px; color: var(--r); }
    .file-chip button { cursor: pointer; color: var(--r); font-size: 11px; background: none; border: none; font-family: var(--font); opacity: .7; }
    .file-chip button:hover { opacity: 1; }

    .input-shell {
      background: var(--surface-2); border: 1.5px solid var(--border);
      border-radius: 13px; padding: 10px 10px 10px 16px;
      display: flex; align-items: flex-end; gap: 8px; transition: all .18s;
    }
    .input-shell.focused { border-color: var(--r); background: white; box-shadow: 0 0 0 3px var(--r-mid); }

    textarea { flex: 1; border: none; outline: none; font-size: 13px; color: var(--t1); font-family: var(--font); resize: none; max-height: 120px; min-height: 22px; line-height: 1.6; background: transparent; padding: 1px 0; }
    textarea::placeholder { color: var(--t4); }

    .input-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
    .action-btn { width: 30px; height: 30px; border-radius: 7px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--t4); transition: all .14s; }
    .action-btn:hover { background: var(--border); color: var(--t2); }
    .action-btn.recording { color: var(--r); animation: pulse 1s infinite; }

    .send-btn {
      width: 34px; height: 34px; border-radius: 9px;
      border: none; background: var(--r); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all .18s; box-shadow: 0 3px 10px var(--r-shadow); flex-shrink: 0;
    }
    .send-btn:not([disabled]):hover { background: #c8111f; transform: scale(1.06); box-shadow: 0 5px 18px var(--r-shadow); }
    .send-btn[disabled] { background: var(--border); box-shadow: none; cursor: not-allowed; }

    .input-hint { display: flex; justify-content: space-between; margin-top: 8px; padding: 0 2px; }
    .input-hint span { font-size: 10px; color: var(--t4); }
  `]
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('msgContainer') msgContainer?: ElementRef;
  @ViewChild('inputRef') inputRef?: ElementRef;
 
  private agentId = signal(0);
  readonly thread = signal<ThreadType>('personal');
  readonly panelOpen = signal(false);
  readonly isTyping = signal(false);
  readonly isRecording = signal(false);
  readonly attachedFiles = signal<string[]>([]);
  readonly sidebarCollapsed = signal(false);
  readonly activeHistoryIdx = signal(0);
 
  inputText = '';
  inputFocused = false;
  private shouldScroll = false;
 
  readonly agent = computed(() => this.agentSvc.getAgentById(this.agentId()));
  readonly messages = computed(() => {
    const a = this.agent();
    if (!a) return [];
    return a.chatHistory[this.thread()];
  });

  get canSend(): boolean {
    return this.inputText.trim().length > 0 || this.attachedFiles().length > 0;
  }

  constructor(private route: ActivatedRoute, private router: Router, readonly agentSvc: AgentService) {}
 
  ngOnInit() {
    this.route.params.subscribe(p => {
      const id = parseInt(p['id'], 10);
      this.agentId.set(id);
      if (!this.agentSvc.getAgentById(id)) this.router.navigate(['/home']);
    });
  }
 
  ngAfterViewChecked() {
    if (this.shouldScroll && this.msgContainer) {
      const el = this.msgContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }
 
  setThread(t: ThreadType) { this.thread.set(t); this.shouldScroll = true; }
  togglePanel() { this.panelOpen.update(v => !v); }
  toggleSidebar() { this.sidebarCollapsed.update(v => !v); }
 
  usePrompt(p: string) {
    this.inputText = p;
    setTimeout(() => this.inputRef?.nativeElement.focus(), 50);
  }
 
  formatMsg(content: string): string {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }
 
  autoResize(event: Event) {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }
 
  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (this.canSend) this.send();
    }
  }
 
  async send() {
    const text = this.inputText.trim();
    if (!text && !this.attachedFiles().length) return;
    const id = this.agentId();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.agentSvc.addMessage(id, this.thread(), {
      role: 'user', content: text || '[File attachment]', time: now, files: [...this.attachedFiles()]
    });
    this.inputText = '';
    if (this.inputRef) this.inputRef.nativeElement.style.height = 'auto';
    this.attachedFiles.set([]);
    this.shouldScroll = true;
    this.isTyping.set(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    this.isTyping.set(false);
    this.agentSvc.addMessage(id, this.thread(), {
      role: 'ai', content: getNextResponse(id),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    this.shouldScroll = true;
  }
 
  clearConversation() { this.agentSvc.clearChat(this.agentId(), this.thread()); }
 
  onFileSelect(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;
    this.attachedFiles.update(a => [...a, ...Array.from(files).map(f => f.name)]);
  }
 
  removeFile(i: number) { this.attachedFiles.update(a => a.filter((_, idx) => idx !== i)); }
 
  toggleVoice() {
    this.isRecording.update(v => !v);
    if (this.isRecording()) {
      setTimeout(() => { this.inputText = 'Show me the latest data for my request.'; this.isRecording.set(false); }, 2500);
    }
  }
 
  exportChat() {
    const a = this.agent();
    if (!a) return;
    const msgs = a.chatHistory[this.thread()];
    const text = msgs.map(m => `[${m.role.toUpperCase()}] ${m.time}\n${m.content}`).join('\n\n---\n\n');
    const blob = new Blob([`LTM Chevron AI Hub — ${a.name}\nExported: ${new Date().toLocaleString()}\n\n` + text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${a.name.replace(/ /g, '-')}-chat.txt`;
    link.click();
  }
}