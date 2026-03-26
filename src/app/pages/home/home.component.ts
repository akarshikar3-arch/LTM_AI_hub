import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { AgentService } from '../../core/services/agent.service';
import { AgentCardComponent } from '../../shared/components/agent-card/agent-card.component';
import { AgentCategory } from '../../core/models/agent.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, AgentCardComponent, DecimalPipe],
  template: `
    <div class="home-page">

      <!-- Hero banner -->
      <div class="hero fade-up">
        <!-- Decorative bg chevron -->
        <svg class="hero-chevron-bg" viewBox="0 0 300 240" fill="none">
          <path d="M20 70L150 145L280 70" stroke="white" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M20 135L150 210L280 135" stroke="white" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="hero-text">
          <div class="hero-eyebrow">Chevron Internal AI Platform</div>
          <h1 class="hero-title">Your team's intelligence,<br><span>at your fingertips.</span></h1>
          <p class="hero-sub">AI agents built by Chevron teams for IT, data, and collaboration — all in one place.</p>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="hero-stat-val">{{ agentService.agents().length }}</div>
            <div class="hero-stat-lbl">Live agents</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-val">4.8k</div>
            <div class="hero-stat-lbl">Queries / mo</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-val">612h</div>
            <div class="hero-stat-lbl">Hours saved</div>
          </div>
        </div>
      </div>

      <!-- Filter pills -->
      <div class="pill-group fade-up-2">
        <button class="pill" [class.active]="activeCat() === 'All'" (click)="setCat('All')">All</button>
        <button class="pill" [class.active]="activeCat() === 'Business Usecase'" (click)="setCat('Business Usecase')">Business Usecase</button>
        <button class="pill" [class.active]="activeCat() === 'Enterprise'" (click)="setCat('Enterprise')">Enterprise</button>
      </div>

      <!-- Pinned -->
      @if (agentService.favorites().length > 0) {
        <section class="sec fade-up-2">
          <div class="sec-head">
            <span class="sec-title">⭐ Pinned by you</span>
          </div>
          <div class="pinned-row">
            @for (a of agentService.favorites(); track a.id) {
              <a class="pin-card" [routerLink]="['/chat', a.id]">
                <div class="pin-icon" [class]="a.colorClass">{{ a.icon }}</div>
                <div class="pin-info">
                  <div class="pin-name">{{ a.name }}</div>
                  <div class="pin-meta">{{ a.lastUsed || a.team }}</div>
                </div>
                <div class="pin-arrow">↗</div>
              </a>
            }
          </div>
        </section>
      }

      <!-- Recently used -->
      <section class="sec fade-up-3">
        <div class="sec-head">
          <span class="sec-title">🕐 Recently used</span>
          <button class="sec-more" routerLink="/agents">See all</button>
        </div>
        <div class="recent-row">
          @for (a of agentService.recentlyUsed(); track a.id) {
            <a class="recent-chip" [routerLink]="['/chat', a.id]">
              <div class="rc-icon" [class]="a.colorClass">{{ a.icon }}</div>
              <div>
                <div class="rc-name">{{ a.name }}</div>
                <div class="rc-time">{{ a.lastUsed }}</div>
              </div>
            </a>
          }
        </div>
      </section>

      <!-- Agents grid -->
      <section class="sec fade-up-4">
        <div class="sec-head">
          <span class="sec-title">{{ filteredAgents().length }} agent{{ filteredAgents().length !== 1 ? 's' : '' }}</span>
          <button class="sec-more" routerLink="/agents">See all</button>
        </div>
        <div class="agents-grid">
          @for (a of filteredAgents(); track a.id) {
            <app-agent-card [agent]="a" mode="grid"
              (favoriteToggled)="agentService.toggleFavorite($event)" />
          }
        </div>
      </section>

    </div>
  `,
  styles: [`
    .home-page { padding: 28px 32px 64px; }

    /* Hero */
    .hero {
      background: linear-gradient(130deg, var(--chev-blue-dd) 0%, var(--chev-blue) 55%, var(--chev-blue-lt) 100%);
      border-radius: var(--r4);
      padding: 38px 44px;
      margin-bottom: 28px;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }
    .hero::before {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at 80% 50%, rgba(200,0,30,.18), transparent 55%);
    }
    .hero-chevron-bg {
      position: absolute;
      right: -30px; bottom: -40px;
      opacity: .055;
      width: 300px; height: 240px;
    }
    .hero-eyebrow {
      display: inline-flex; align-items: center; gap: 7px;
      font-size: 11px; font-weight: 600; letter-spacing: .5px;
      text-transform: uppercase; color: rgba(255,255,255,.55); margin-bottom: 14px;
    }
    .hero-eyebrow::before {
      content: ''; width: 6px; height: 6px; border-radius: 50%;
      background: var(--chev-red-l); box-shadow: 0 0 10px var(--chev-red-l);
      animation: blink 2s ease-in-out infinite;
    }
    .hero-title {
      font-family: var(--font);
      font-size: 30px; font-weight: 700;
      color: white; letter-spacing: -.6px; line-height: 1.18;
      margin-bottom: 12px; position: relative; z-index: 1;
    }
    .hero-title span {
      font-family: var(--font-display);
      font-style: italic; font-weight: 400;
      color: rgba(255,255,255,.68);
    }
    .hero-sub {
      font-size: 14px; color: rgba(255,255,255,.5);
      line-height: 1.65; max-width: 380px; position: relative; z-index: 1;
    }
    .hero-stats {
      display: flex;
      align-items: stretch;
      flex-shrink: 0;
      position: relative; z-index: 1;
      background: rgba(255,255,255,.08);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: var(--r3); overflow: hidden;
    }
    .hero-stat { padding: 22px 26px; text-align: center; }
    .hero-stat + .hero-stat { border-left: 1px solid rgba(255,255,255,.1); }
    .hero-stat-val {
      font-family: var(--font); font-size: 30px; font-weight: 700;
      color: white; letter-spacing: -1px; line-height: 1; margin-bottom: 5px;
    }
    .hero-stat-lbl { font-size: 9px; font-weight: 600; color: rgba(255,255,255,.38); text-transform: uppercase; letter-spacing: .5px; }

    /* Pinned */
    .pinned-row { display: flex; gap: 10px; flex-wrap: wrap; }
    .pin-card {
      flex: 1; min-width: 200px;
      background: white; border: 1.5px solid var(--border);
      border-radius: var(--r2); padding: 14px 16px;
      display: flex; align-items: center; gap: 12px;
      cursor: pointer; text-decoration: none;
      transition: all .18s; box-shadow: var(--s-card);
      position: relative; overflow: hidden;
    }
    .pin-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, var(--chev-blue), var(--chev-red));
      opacity: 0; transition: opacity .18s;
    }
    .pin-card:hover { border-color: var(--chev-blue); transform: translateY(-2px); box-shadow: var(--s-blue); }
    .pin-card:hover::before { opacity: 1; }
    .pin-icon { width: 40px; height: 40px; border-radius: 10px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
    .pin-info { flex: 1; min-width: 0; }
    .pin-name { font-size: 13px; font-weight: 600; color: var(--t1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pin-meta { font-size: 11px; color: var(--t4); margin-top: 2px; }
    .pin-arrow { font-size: 16px; color: var(--chev-blue); opacity: .4; margin-left: auto; flex-shrink: 0; }
    .pin-card:hover .pin-arrow { opacity: 1; }

    /* Recent */
    .recent-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
    .recent-row::-webkit-scrollbar { display: none; }
    .recent-chip {
      display: flex; align-items: center; gap: 10px;
      background: white; border: 1.5px solid var(--border);
      border-radius: var(--r2); padding: 10px 16px;
      cursor: pointer; white-space: nowrap; flex-shrink: 0;
      text-decoration: none; transition: all .15s; box-shadow: var(--s-card);
    }
    .recent-chip:hover { border-color: var(--chev-blue); background: var(--chev-blue-xxl); }
    .rc-icon { width: 28px; height: 28px; border-radius: 7px; display:flex; align-items:center; justify-content:center; font-size:14px; }
    .rc-name { font-size: 13px; font-weight: 500; color: var(--t1); }
    .rc-time { font-size: 11px; color: var(--t4); margin-top: 1px; }

    /* Grid */
    .agents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }

    .ic-blue  { background: var(--ic-blue); }
    .ic-amber { background: var(--ic-amber); }
    .ic-teal  { background: var(--ic-teal); }

    .sec { margin-bottom: 32px; }

  `]
})
export class HomeComponent {
  readonly activeCat = signal<AgentCategory | 'All'>('All');
  readonly filteredAgents = computed(() =>
    this.agentService.filterBy(this.activeCat(), 'all', '')
  );
  constructor(readonly agentService: AgentService) { }
  setCat(c: AgentCategory | 'All') { this.activeCat.set(c); }
}
