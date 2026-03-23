import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Agent } from '../../../core/models/agent.model';

@Component({
  selector: 'app-agent-card',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    @if (mode === 'grid') {
      <div class="agent-card" [routerLink]="['/chat', agent.id]">

        <!-- Hover preview -->
        <div class="preview-card">
          <div class="prev-header">
            <div class="prev-icon" [class]="agent.colorClass">{{ agent.icon }}</div>
            <div>
              <div class="prev-name">{{ agent.name }}</div>
              <div class="prev-model">{{ agent.model }}</div>
            </div>
          </div>
          <p class="prev-desc">{{ agent.fullDescription }}</p>
          <div class="prev-stats">
            <div class="prev-stat">
              <div class="prev-stat-val">{{ agent.runsPerMonth | number }}</div>
              <div class="prev-stat-lbl">Queries / mo</div>
            </div>
            <div class="prev-stat">
              <div class="prev-stat-val green">{{ agent.hoursSaved }}h</div>
              <div class="prev-stat-lbl">Time saved</div>
            </div>
          </div>
          <div class="prev-divider"></div>
          <div class="prev-prompt">"{{ agent.samplePrompts[0] }}"</div>
        </div>

        <!-- Card body -->
        <div class="card-header">
          <div class="card-icon" [class]="agent.colorClass">{{ agent.icon }}</div>
          <button class="fav-btn" [class.on]="agent.isFavorite"
            (click)="$event.preventDefault(); $event.stopPropagation(); onFav()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              @if (agent.isFavorite) {
                <path d="M12 21S4 14.5 4 8a5 5 0 0110 0 5 5 0 0110 0c0 6.5-8 13-8 13z" fill="var(--chev-red)" stroke="var(--chev-red)" stroke-width="1.5" stroke-linejoin="round"/>
              } @else {
                <path d="M12 21S4 14.5 4 8a5 5 0 0110 0 5 5 0 0110 0c0 6.5-8 13-8 13z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              }
            </svg>
          </button>
        </div>

        <div class="card-name">{{ agent.name }}</div>
        <div class="card-team-row">
          <span class="card-team">{{ agent.team }}</span>
        </div>
        <p class="card-desc">{{ agent.description }}</p>

        <div class="card-footer">
          <span class="badge" [class]="agent.status === 'live' ? 'live' : agent.status === 'beta' ? 'beta' : 'soon'">
            {{ agent.status === 'live' ? 'Live' : agent.status === 'beta' ? 'Beta' : 'Coming Soon' }}
          </span>
          <span class="card-runs"><b>{{ agent.runsPerMonth | number }}</b> runs/mo</span>
        </div>

        <div class="activity-bar">
          <div class="bar-labels"><span>Activity</span><span>{{ agent.activityPct }}%</span></div>
          <div class="bar-track">
            <div class="bar-fill"
              [class.high]="agent.activityPct > 70"
              [class.med]="agent.activityPct > 40 && agent.activityPct <= 70"
              [style.width.%]="agent.activityPct">
            </div>
          </div>
        </div>

      </div>
    }

    @if (mode === 'list') {
      <div class="list-row" [routerLink]="['/chat', agent.id]">
        <div class="list-icon" [class]="agent.colorClass">{{ agent.icon }}</div>
        <div class="list-info">
          <div class="list-name">{{ agent.name }}</div>
          <div class="list-team">{{ agent.team }}</div>
        </div>
        <span class="badge" [class]="agent.status === 'live' ? 'live' : agent.status === 'beta' ? 'beta' : 'soon'">
          {{ agent.status === 'live' ? 'Live' : agent.status === 'beta' ? 'Beta' : 'Soon' }}
        </span>
        <div class="list-runs">{{ agent.runsPerMonth | number }} runs/mo</div>
        <div class="list-saved">↑ {{ agent.hoursSaved }}h saved</div>
        <button class="fav-btn list-fav" [class.on]="agent.isFavorite"
          (click)="$event.preventDefault(); $event.stopPropagation(); onFav()">
          {{ agent.isFavorite ? '♥' : '♡' }}
        </button>
      </div>
    }
  `,
  styles: [`
    /* ── Grid card ── */
    .agent-card {
      background: white;
      border: 1.5px solid var(--border);
      border-radius: var(--r4);
      padding: 22px;
      cursor: pointer;
      position: relative;
      overflow: visible;
      text-decoration: none;
      display: block;
      transition: all .22s cubic-bezier(.4,0,.2,1);
      box-shadow: var(--s-card);
    }
    .agent-card::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 2px;
      border-radius: 0 0 var(--r4) var(--r4);
      background: linear-gradient(90deg, var(--chev-blue), var(--chev-red));
      transform: scaleX(0);
      transform-origin: left;
      transition: transform .22s;
    }
    .agent-card:hover {
      border-color: var(--chev-blue-lt);
      transform: translateY(-4px);
      box-shadow: 0 20px 48px rgba(0,30,60,.11), 0 4px 12px rgba(0,84,166,.14);
      z-index: 20;
    }
    .agent-card:hover::after { transform: scaleX(1); }

    /* Preview tooltip */
    .preview-card {
      position: absolute;
      bottom: calc(100% + 12px);
      left: 0; right: 0;
      background: white;
      border: 1.5px solid var(--border);
      border-radius: var(--r3);
      padding: 18px;
      z-index: 200;
      opacity: 0;
      transform: translateY(8px) scale(.96);
      pointer-events: none;
      transition: all .2s cubic-bezier(.4,0,.2,1);
      box-shadow: 0 20px 60px rgba(0,30,60,.14), 0 4px 16px rgba(0,30,60,.07);
    }
    .agent-card:hover .preview-card { opacity: 1; transform: translateY(0) scale(1); }
    .prev-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .prev-icon { width: 36px; height: 36px; border-radius: 9px; display:flex; align-items:center; justify-content:center; font-size:17px; }
    .prev-name { font-size: 13px; font-weight: 700; color: var(--t1); }
    .prev-model { font-size: 10px; color: var(--t4); margin-top: 1px; }
    .prev-desc { font-size: 11.5px; color: var(--t2); line-height: 1.65; margin-bottom: 12px; }
    .prev-stats { display: flex; gap: 20px; margin-bottom: 10px; }
    .prev-stat-val { font-size: 20px; font-weight: 700; color: var(--t1); letter-spacing: -.5px; }
    .prev-stat-val.green { color: var(--green); }
    .prev-stat-lbl { font-size: 9px; font-weight: 700; color: var(--t4); text-transform: uppercase; letter-spacing: .4px; margin-top: 2px; }
    .prev-divider { height: 1px; background: var(--border); margin: 8px 0; }
    .prev-prompt { font-size: 11px; color: var(--t4); font-style: italic; }

    /* Card body */
    .card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
    .card-icon { width: 50px; height: 50px; border-radius: 14px; display:flex; align-items:center; justify-content:center; font-size:23px; flex-shrink:0; }
    .ic-blue  { background: var(--ic-blue); }
    .ic-amber { background: var(--ic-amber); }
    .ic-teal  { background: var(--ic-teal); }

    .fav-btn {
      cursor: pointer; border: none; background: none;
      color: var(--t5); transition: all .18s; padding: 4px;
      border-radius: 8px; display: flex; align-items: center; justify-content: center;
    }
    .fav-btn:hover { color: var(--chev-red); background: var(--chev-red-xl); transform: scale(1.15); }
    .fav-btn.on { color: var(--chev-red); }

    .card-name { font-size: 15.5px; font-weight: 700; color: var(--t1); letter-spacing: -.3px; margin-bottom: 4px; }
    .card-team-row { margin-bottom: 10px; }
    .card-team { font-size: 11px; color: var(--t4); font-weight: 600; text-transform: uppercase; letter-spacing: .4px; }
    .card-desc { font-size: 12.5px; color: var(--t3); line-height: 1.7; margin-bottom: 16px; }
    .card-footer { display: flex; align-items: center; justify-content: space-between; }
    .card-runs { font-size: 11.5px; color: var(--t4); }
    .card-runs b { color: var(--t2); font-weight: 600; }

    .activity-bar { margin-top: 13px; }
    .bar-labels { display: flex; justify-content: space-between; font-size: 10px; color: var(--t5); margin-bottom: 5px; font-weight: 500; }
    .bar-track { height: 4px; background: var(--surface-3); border-radius: 10px; overflow: hidden; }
    .bar-fill {
      height: 100%; border-radius: 10px;
      background: linear-gradient(90deg, var(--chev-blue), var(--chev-blue-lt));
      animation: barGrow 1.2s cubic-bezier(.4,0,.2,1) forwards;
    }
    .bar-fill.high { background: linear-gradient(90deg, var(--green), #22c55e); }
    .bar-fill.med  { background: linear-gradient(90deg, var(--amber), #f59e0b); }

    /* List row */
    .list-row {
      background: white; border: 1.5px solid var(--border); border-radius: var(--r2);
      padding: 14px 20px; display: flex; align-items: center; gap: 14px;
      cursor: pointer; transition: all .15s; text-decoration: none; box-shadow: var(--s-card);
    }
    .list-row:hover { border-color: var(--chev-blue); background: var(--chev-blue-xxl); }
    .list-icon { width: 38px; height: 38px; border-radius: 10px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
    .list-info { flex: 1; min-width: 0; }
    .list-name { font-size: 14px; font-weight: 600; color: var(--t1); }
    .list-team { font-size: 11px; color: var(--t4); margin-top: 2px; text-transform: uppercase; letter-spacing: .3px; }
    .list-runs { font-size: 12px; color: var(--t2); width: 110px; text-align: right; flex-shrink: 0; }
    .list-saved { font-size: 12px; color: var(--green); width: 90px; text-align: right; font-weight: 600; flex-shrink: 0; }
    .list-fav { font-size: 15px; margin-left: 4px; }

    .badge { display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:600; padding:3px 10px; border-radius:20px; }
    .live { background: var(--green-bg); color: var(--green-t); }
    .live::before { content:''; width:5px; height:5px; border-radius:50%; background:var(--green); animation:blink 2s ease-in-out infinite; }
    .beta { background: var(--amber-bg); color: var(--amber-t); }
    .soon { background: var(--purple-bg); color: var(--purple); }
  `]
})
export class AgentCardComponent {
  @Input({ required: true }) agent!: Agent;
  @Input() mode: 'grid' | 'list' = 'grid';
  @Output() favoriteToggled = new EventEmitter<number>();
  onFav() { this.favoriteToggled.emit(this.agent.id); }
}
