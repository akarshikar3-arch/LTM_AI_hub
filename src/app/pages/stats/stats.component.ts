import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { AgentService } from '../../core/services/agent.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="stats-page">

      <div class="stats-grid fade-up">
        <div class="stat-card">
          <div class="stat-label">Total Queries</div>
          <div class="stat-value">4,872</div>
          <div class="stat-delta up">↑ 22% this month</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Hours Saved</div>
          <div class="stat-value">612<span class="stat-unit">h</span></div>
          <div class="stat-delta neutral">≈ 15 work weeks</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Agents Active</div>
          <div class="stat-value">{{ svc.agents().length }}</div>
          <div class="stat-delta neutral">of {{ svc.agents().length }} available</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Avg. Daily</div>
          <div class="stat-value">162</div>
          <div class="stat-delta neutral">queries / day</div>
        </div>
      </div>

      <div class="sec-head fade-up-2"><span class="sec-title">Per-agent breakdown</span></div>

      <div class="breakdown-list fade-up-3">
        @for (a of sorted(); track a.id) {
          <a class="brow" [routerLink]="['/chat', a.id]">
            <div class="brow-icon" [class]="a.colorClass">{{ a.icon }}</div>
            <div class="brow-info">
              <div class="brow-name">{{ a.name }}</div>
              <div class="brow-team">{{ a.team }}</div>
              <div class="bar-track">
                <div class="bar-fill"
                  [class.high]="a.activityPct > 70"
                  [class.med]="a.activityPct > 40 && a.activityPct <= 70"
                  [style.width.%]="a.activityPct">
                </div>
              </div>
            </div>
            <div class="brow-metrics">
              <div class="brow-q">{{ a.runsPerMonth | number }}<span class="brow-unit"> q/mo</span></div>
              <div class="brow-s">{{ a.hoursSaved }}h saved</div>
            </div>
            <span class="badge" [class]="a.status === 'live' ? 'live' : a.status === 'beta' ? 'beta' : 'soon'">
              {{ a.status === 'live' ? 'Live' : a.status === 'beta' ? 'Beta' : 'Soon' }}
            </span>
          </a>
        }
      </div>
    </div>
  `,
  styles: [`
    .stats-page { padding: 28px 32px 64px; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 28px;
    }
    .stat-card {
      background: white;
      border: 1.5px solid var(--border);
      border-radius: var(--r3);
      padding: 22px;
      position: relative;
      overflow: hidden;
      box-shadow: var(--s-card);
    }
    .stat-card::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, var(--chev-blue), var(--chev-red));
    }
    .stat-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; color: var(--t4); margin-bottom: 10px; }
    .stat-value {
      font-family: var(--font);
      font-size: 36px; font-weight: 700;
      color: var(--t1); letter-spacing: -1.2px; line-height: 1; margin-bottom: 6px;
    }
    .stat-unit { font-size: 18px; font-weight: 400; color: var(--t3); }
    .stat-delta { font-size: 12px; }
    .stat-delta.up { color: var(--green); }
    .stat-delta.neutral { color: var(--t4); }

    .breakdown-list { display: flex; flex-direction: column; gap: 10px; }
    .brow {
      background: white;
      border: 1.5px solid var(--border);
      border-radius: var(--r2);
      padding: 16px 20px;
      display: flex; align-items: center; gap: 14px;
      text-decoration: none;
      transition: all .16s;
      box-shadow: var(--s-card); cursor: pointer;
    }
    .brow:hover { border-color: var(--chev-blue); box-shadow: var(--s2); }
    .brow-icon { width: 42px; height: 42px; border-radius: 11px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
    .ic-blue  { background: var(--ic-blue); }
    .ic-amber { background: var(--ic-amber); }
    .ic-teal  { background: var(--ic-teal); }
    .brow-info { flex: 1; min-width: 0; }
    .brow-name { font-size: 14px; font-weight: 600; color: var(--t1); }
    .brow-team { font-size: 11px; color: var(--t4); margin-top: 1px; }
    .bar-track { height: 4px; background: var(--surface-3); border-radius: 10px; overflow: hidden; margin-top: 8px; }
    .bar-fill { height: 100%; border-radius: 10px; background: linear-gradient(90deg, var(--chev-blue), var(--chev-blue-lt)); animation: barGrow 1.2s cubic-bezier(.4,0,.2,1) forwards; }
    .bar-fill.high { background: linear-gradient(90deg, var(--green), #22c55e); }
    .bar-fill.med  { background: linear-gradient(90deg, var(--amber), #f59e0b); }
    .brow-metrics { text-align: right; flex-shrink: 0; }
    .brow-q { font-size: 18px; font-weight: 700; color: var(--t1); letter-spacing: -.5px; }
    .brow-unit { font-size: 11px; font-weight: 400; color: var(--t4); }
    .brow-s { font-size: 11px; color: var(--green); margin-top: 3px; font-weight: 500; }

    .badge { display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:600; padding:3px 10px; border-radius:20px; }
    .live { background: var(--green-bg); color: var(--green-t); }
    .live::before { content:''; width:5px; height:5px; border-radius:50%; background:var(--green); animation:blink 2s ease-in-out infinite; }
    .beta { background: var(--amber-bg); color: var(--amber-t); }
    .soon { background: var(--purple-bg); color: var(--purple); }
  `]
})
export class StatsComponent {
  readonly sorted = () => [...this.svc.agents()].sort((a,b) => b.runsPerMonth - a.runsPerMonth);
  constructor(readonly svc: AgentService) {}
}
