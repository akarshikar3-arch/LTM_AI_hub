import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Agent } from '../../core/models/agent.model';

type ModalType = 'access' | 'support' | 'demo' | null;

@Component({
  selector: 'app-agent-action-buttons',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .btn-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 12px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: 0.5px solid;
      transition: background 0.15s, transform 0.1s;
      white-space: nowrap;
      font-family: inherit;
    }
    .btn:active { transform: scale(0.98); }
    .btn-outline {
      background: var(--color-background-primary, #fff);
      border-color: var(--color-border-secondary);
      color: var(--color-text-primary);
    }
    .btn-outline:hover { background: var(--color-background-secondary); }
    .btn-primary {
      background: #e91a1a;
      border-color: #a10606;
      color: #E6F1FB;
    }
    .btn-primary:hover { background: #e91a1a; border-color: #a10606; }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
    }
    .modal-overlay.open {
      opacity: 1;
      pointer-events: all;
    }
    .modal {
      background: var(--color-background-primary, #fff);
      border-radius: 16px;
      border: 0.5px solid var(--color-border-tertiary);
      width: min(540px, 92vw);
      max-height: 85vh;
      overflow-y: auto;
      transform: translateY(12px) scale(0.98);
      transition: transform 0.2s;
    }
    .modal-overlay.open .modal { transform: translateY(0) scale(1); }
    .modal-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 1.25rem 1.5rem 1rem;
      border-bottom: 0.5px solid var(--color-border-tertiary);
      position: sticky;
      top: 0;
      background: var(--color-background-primary, #fff);
      z-index: 1;
      border-radius: 16px 16px 0 0;
    }
    .modal-header-icon {
      width: 40px; height: 40px;
      border-radius: 8px;
      background: var(--color-background-info);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; flex-shrink: 0;
    }
    .modal-title { font-size: 16px; font-weight: 500; color: var(--color-text-primary); }
    .modal-subtitle { font-size: 12px; color: var(--color-text-secondary); margin-top: 2px; }
    .modal-close {
      margin-left: auto;
      background: none; border: none; cursor: pointer;
      color: var(--color-text-secondary);
      padding: 4px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
    }
    .modal-close:hover { background: var(--color-background-secondary); color: var(--color-text-primary); }
    .modal-body { padding: 1.25rem 1.5rem; }
    .modal-footer {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 1rem 1.5rem;
      border-top: 0.5px solid var(--color-border-tertiary);
    }
    .section-hd {
      font-size: 11px; font-weight: 500;
      text-transform: uppercase; letter-spacing: 0.06em;
      color: var(--color-text-secondary);
      margin: 0 0 0.6rem;
    }
    .info-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 8px; margin-bottom: 1.25rem;
    }
    .info-cell {
      background: var(--color-background-secondary);
      border-radius: 8px; padding: 0.75rem 1rem;
    }
    .info-cell-label { font-size: 11px; color: var(--color-text-secondary); margin-bottom: 3px; }
    .info-cell-val { font-size: 14px; font-weight: 500; color: var(--color-text-primary); display: flex; align-items: center; gap: 6px; }
    .arch-box {
      background: var(--color-background-secondary);
      border-radius: 8px; padding: 1rem; margin-bottom: 1.25rem;
    }
    .arch-nodes {
      display: flex; align-items: center; gap: 8px;
      flex-wrap: wrap; justify-content: center; margin-bottom: 0.75rem;
    }
    .arch-node {
      background: var(--color-background-primary, #fff);
      border: 0.5px solid var(--color-border-secondary);
      border-radius: 8px; padding: 6px 12px;
      font-size: 12px; font-weight: 500; color: var(--color-text-primary);
    }
    .arch-node.highlight { border-color: #378ADD; color: #185FA5; }
    .arch-arrow { color: var(--color-text-secondary); font-weight: 500; }
    .arch-desc { font-size: 12px; color: var(--color-text-secondary); text-align: center; line-height: 1.5; margin: 0; }
    .download-row {
      display: flex; align-items: center; justify-content: space-between;
      background: var(--color-background-secondary);
      border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 8px;
    }
    .download-name { font-size: 13px; font-weight: 500; color: var(--color-text-primary); }
    .download-meta { font-size: 11px; color: var(--color-text-secondary); margin-top: 2px; }
    .btn-dl {
      padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 500;
      cursor: pointer; border: 0.5px solid var(--color-border-secondary);
      background: var(--color-background-primary, #fff); color: var(--color-text-primary);
      font-family: inherit;
    }
    .btn-dl:hover { background: var(--color-background-secondary); }
    .btn-dl:disabled { opacity: 0.5; cursor: not-allowed; }
    .divider { height: 0.5px; background: var(--color-border-tertiary); margin: 1rem 0; border: none; }
    .creator-card {
      display: flex; align-items: center; gap: 12px;
      background: var(--color-background-secondary);
      border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.25rem;
    }
    .avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: #B5D4F4; color: #0C447C;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 500; flex-shrink: 0;
    }
    .creator-name { font-size: 14px; font-weight: 500; color: var(--color-text-primary); }
    .creator-role { font-size: 12px; color: var(--color-text-secondary); margin-top: 1px; }
    .teams-cta {
      display: flex; align-items: center; gap: 10px;
      background: #185FA5; border-radius: 8px;
      padding: 0.85rem 1rem; margin-bottom: 1rem;
      cursor: pointer; text-decoration: none;
    }
    .teams-cta:hover { background: #0C447C; }
    .teams-icon {
      width: 28px; height: 28px; background: #E6F1FB;
      border-radius: 6px; display: flex; align-items: center;
      justify-content: center; flex-shrink: 0;
    }
    .teams-title { font-size: 14px; font-weight: 500; color: #E6F1FB; }
    .teams-sub { font-size: 12px; color: rgba(230,241,251,0.8); margin-top: 1px; }
    .badge-new {
      display: inline-block; background: #EAF3DE; color: #3B6D11;
      font-size: 10px; font-weight: 500; padding: 2px 7px;
      border-radius: 100px; margin-left: 6px; vertical-align: middle;
    }
    .contact-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 1.25rem; }
    .contact-card {
      display: flex; align-items: center; gap: 12px;
      background: var(--color-background-secondary);
      border-radius: 8px; padding: 0.85rem 1rem;
    }
    .contact-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 500; flex-shrink: 0;
    }
    .avatar-teal { background: #9FE1CB; color: #085041; }
    .avatar-amber { background: #FAC775; color: #633806; }
    .avatar-blue { background: #B5D4F4; color: #0C447C; }
    .contact-name { font-size: 14px; font-weight: 500; color: var(--color-text-primary); }
    .contact-title { font-size: 12px; color: var(--color-text-secondary); margin-top: 1px; }
    .contact-channels { display: flex; gap: 6px; margin-top: 6px; }
    .ch-btn {
      padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 500;
      cursor: pointer; border: 0.5px solid var(--color-border-secondary);
      background: var(--color-background-primary, #fff); color: var(--color-text-primary);
      text-decoration: none; font-family: inherit;
    }
    .ch-btn:hover { background: var(--color-background-secondary); }
    .sla-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
    .sla-list li { font-size: 13px; color: var(--color-text-secondary); display: flex; align-items: center; gap: 6px; }
    .sla-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .dot-green { background: #1D9E75; }
    .dot-amber { background: #EF9F27; }
    .chat-bubble {
      background: var(--color-background-secondary);
      border-radius: 8px; padding: 0.85rem 1rem; margin-bottom: 0.5rem;
    }
    .chat-bubble.chat-ai { background: #E6F1FB; }
    .chat-sender { font-size: 11px; font-weight: 500; color: var(--color-text-primary); margin-bottom: 3px; }
    .chat-msg { font-size: 13px; color: var(--color-text-primary); line-height: 1.5; }
    .prompt-list { display: flex; flex-direction: column; gap: 6px; }
    .prompt-btn {
      width: 100%; padding: 8px 12px; border-radius: 6px;
      font-size: 12px; text-align: left; cursor: pointer;
      border: 0.5px solid var(--color-border-secondary);
      background: var(--color-background-primary, #fff);
      color: var(--color-text-primary); font-family: inherit;
    }
    .prompt-btn:hover { background: var(--color-background-secondary); }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
    .dot-live { background: #1D9E75; }
    .dot-beta { background: #EF9F27; }
    .dot-coming-soon { background: #888780; }
    .muted-text { font-size: 13px; color: var(--color-text-secondary); }
  `],
  template: `
    <!-- Buttons -->
    <div class="btn-row">
      <button class="btn btn-outline" (click)="openModal('access')">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="3" width="12" height="10" rx="2"/>
          <path d="M5 7h6M5 10h4"/>
        </svg>
        Request access
      </button>

      <button class="btn btn-outline" (click)="openModal('support')">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="8" cy="8" r="6"/>
          <path d="M8 5v3.5l2 1.5"/>
        </svg>
        Tech support
      </button>

      @if (agent.status === 'live') {
        <button class="btn btn-primary" (click)="openModal('demo')">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <polygon points="4,3 13,8 4,13"/>
          </svg>
          Live demo
        </button>
      }
    </div>

    <!-- Overlay -->
    <div class="modal-overlay" [class.open]="activeModal() !== null" (click)="closeModal()">

      <!-- REQUEST ACCESS -->
      @if (activeModal() === 'access') {
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
          
            <div class="modal-header-icon">{{ agent.icon }}</div>
            <div>
              <div class="modal-title">{{ agent.name }}</div>
              <div class="modal-subtitle">Agent details &amp; access request</div>
            </div>
            <button class="modal-close" (click)="closeModal()">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 4l8 8M12 4l-8 8"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <p class="section-hd">Overview</p>
            <div class="info-grid">
              <div class="info-cell">
                <div class="info-cell-label">Model</div>
                <div class="info-cell-val">{{ agent.model }}</div>
              </div>
              <div class="info-cell">
                <div class="info-cell-label">Status</div>
                <div class="info-cell-val">
                  <span class="status-dot" [class]="'dot-' + agent.status"></span>
                  {{ agent.status }}
                </div>
              </div>
              <div class="info-cell">
                <div class="info-cell-label">Runs / month</div>
                <div class="info-cell-val">{{ agent.runsPerMonth | number }}</div>
              </div>
              <div class="info-cell">
                <div class="info-cell-label">Hours saved</div>
                <div class="info-cell-val">{{ agent.hoursSaved }} hrs</div>
              </div>
            </div>

            <p class="section-hd">Architecture</p>
            <div class="arch-box">
              <div class="arch-nodes">
                <div class="arch-node highlight">Hub UI</div>
                <span class="arch-arrow">→</span>
                <div class="arch-node highlight">Agent API</div>
                <span class="arch-arrow">→</span>
                <div class="arch-node highlight">{{ agent.model }}</div>
                <span class="arch-arrow">→</span>
                <div class="arch-node">{{ agent.name }}</div>
              </div>
              <p class="arch-desc">{{ agent.fullDescription }}</p>
            </div>

            <p class="section-hd">Downloads</p>
            @if (agent.downloadAssets?.length) {
              @for (asset of agent.downloadAssets; track asset.name) {
                <div class="download-row">
                  <div>
                    <div class="download-name">{{ asset.name }}</div>
                    <div class="download-meta">{{ asset.meta }}</div>
                  </div>
                  <button class="btn-dl">↓ {{ asset.type }}</button>
                </div>
              }
            } @else {
              <div class="download-row">
                <div>
                  <div class="download-name">Deployment package</div>
                  <div class="download-meta">Request access to download</div>
                </div>
                <button class="btn-dl" disabled>Locked</button>
              </div>
            }

            <hr class="divider"/>

            <p class="section-hd">Created by</p>
            @if (agent.createdBy) {
              <div class="creator-card">
                <div class="avatar">{{ agent.createdBy.initials }}</div>
                <div>
                  <div class="creator-name">{{ agent.createdBy.name }}</div>
                  <div class="creator-role">{{ agent.createdBy.role }}</div>
                </div>
              </div>
            } @else {
              <p class="muted-text">No creator info available.</p>
            }
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeModal()">Cancel</button>
            <button class="btn btn-primary">Submit access request</button>
          </div>
        </div>
      }

      <!-- TECH SUPPORT -->
      @if (activeModal() === 'support') {
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-header-icon">🎧</div>
            <div>
              <div class="modal-title">Tech support</div>
              <div class="modal-subtitle">{{ agent.name }} — contact the team</div>
            </div>
            <button class="modal-close" (click)="closeModal()">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 4l8 8M12 4l-8 8"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <a class="teams-cta" href="#teams-channel">
              <div class="teams-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="#185FA5">
                  <rect x="2" y="5" width="7" height="7" rx="1.5"/>
                  <rect x="7" y="3" width="7" height="7" rx="1.5" opacity=".6"/>
                </svg>
              </div>
              <div style="flex:1">
                <div class="teams-title">
                  Open Teams channel
                  <span class="badge-new">Fastest</span>
                </div>
                <div class="teams-sub">Agent-Support · Usually responds within 15 min</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#E6F1FB" stroke-width="1.5">
                <path d="M3 8h10M9 4l4 4-4 4"/>
              </svg>
            </a>

            <p class="section-hd">Support team</p>
            @if (agent.supportContacts?.length) {
              <div class="contact-list">
                @for (c of agent.supportContacts; track c.email) {
                  <div class="contact-card">
                    <div class="contact-avatar" [class]="'avatar-' + c.avatarColor">{{ c.initials }}</div>
                    <div>
                      <div class="contact-name">{{ c.name }}</div>
                      <div class="contact-title">{{ c.title }}</div>
                      <div class="contact-channels">
                        <a [href]="'mailto:' + c.email" class="ch-btn">✉ Email</a>
                        <a [href]="'msteams://teams/l/chat/0/0?users=' + c.teamsHandle" class="ch-btn">Teams</a>
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="muted-text">Contact the platform team via the Teams channel above.</p>
            }

            <hr class="divider"/>

            <p class="section-hd">Response SLA</p>
            <ul class="sla-list">
              <li><span class="sla-dot dot-green"></span>Teams: &lt; 15 minutes (business hours)</li>
              <li><span class="sla-dot dot-green"></span>Email: &lt; 4 hours</li>
              <li><span class="sla-dot dot-amber"></span>P1 incidents: 24/7 on-call via ServiceNow</li>
            </ul>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeModal()">Close</button>
            <button class="btn btn-primary">Raise a support ticket</button>
          </div>
        </div>
      }

      <!-- LIVE DEMO -->
      @if (activeModal() === 'demo') {
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-header-icon">{{ agent.icon }}</div>
            <div>
              <div class="modal-title">Live demo</div>
              <div class="modal-subtitle">{{ agent.name }} · try it now</div>
            </div>
            <button class="modal-close" (click)="closeModal()">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 4l8 8M12 4l-8 8"/>
              </svg>
            </button>
          </div>
          <div style="padding: 16px;">
            <button class="primary-btn" (click)="goToChat()">
              Start chatting
            </button>
          </div>

          <div class="modal-body">
            @for (msg of agent.chatHistory.personal.slice(0, 2); track msg.time) {
              <div class="chat-bubble" [class.chat-ai]="msg.role === 'ai'">
                <div class="chat-sender">{{ msg.role === 'user' ? 'You' : agent.name }}</div>
                <div class="chat-msg">{{ msg.content }}</div>
              </div>
            }

            <p class="section-hd" style="margin-top:1rem">Try a sample prompt</p>
            <div class="prompt-list">
              @for (p of agent.samplePrompts; track p) {
                <button class="prompt-btn" (click)="openAgentWithPrompt(p)">{{ p }}</button>
              }
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeModal()">Close</button>
            <button class="btn btn-primary" (click)="goToChat()">Open full agent</button>
          </div>
        </div>
      }

    </div>
  `
})
export class AgentActionButtonsComponent {
  @Input({ required: true }) agent!: Agent;

  activeModal = signal<ModalType>(null);

  constructor(private router: Router) {}

  openModal(type: ModalType) {
    this.activeModal.set(type);
  }

  closeModal() {
    this.activeModal.set(null);
  }

  openAgentWithPrompt(prompt: string) {
    this.closeModal();
    this.router.navigate(['/agents', this.agent.id], {
      queryParams: { prompt }
    });
  }

  // ✅ ADD THIS
  goToChat() {
    this.closeModal();
    this.router.navigate(['/chat', this.agent.id]);
    // OR: this.router.navigate(['/chat'], { queryParams: { agentId: this.agent.id } });
  }
}
