// src/app/shared/components/agent-card/agent-card.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Agent } from '../../../core/models/agent.model';
import { AgentActionButtonsComponent } from '../../../pages/agents/agent-action-buttons.component';

@Component({
  selector: 'app-agent-card',
  standalone: true,
  imports: [CommonModule, AgentActionButtonsComponent],
  styles: [`
    .card {
      background: var(--color-background-primary);
      border: 0.5px solid var(--color-border-tertiary);
      border-radius: 14px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 10px;
      cursor: pointer;
      transition: border-color 0.15s, transform 0.15s;
    }
    .card:hover {
      border-color: var(--color-border-secondary);
      transform: translateY(-2px);
    }
    .card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
    }
    .card-icon {
      width: 42px; height: 42px;
      border-radius: 10px;
      background: var(--color-background-secondary);
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; flex-shrink: 0;
    }
    .card-meta { flex: 1; min-width: 0; }
    .card-name {
      font-size: 14px; font-weight: 500;
      color: var(--color-text-primary);
      margin: 0 0 4px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .card-team {
      font-size: 11px;
      color: var(--color-text-secondary);
    }
    .card-right {
      display: flex; flex-direction: column;
      align-items: flex-end; gap: 6px; flex-shrink: 0;
    }
    .status-pill {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 8px; border-radius: 100px;
      font-size: 11px; font-weight: 500;
    }
    .pill-live { background: #EAF3DE; color: #3B6D11; }
    .pill-beta { background: #FAEEDA; color: #854F0B; }
    .pill-coming-soon { background: var(--color-background-secondary); color: var(--color-text-secondary); }
    .status-dot {
      width: 6px; height: 6px; border-radius: 50%;
    }
    .dot-live { background: #1D9E75; }
    .dot-beta { background: #EF9F27; }
    .dot-coming-soon { background: #888780; }
    .fav-btn {
      background: none; border: none; cursor: pointer;
      color: var(--color-text-secondary);
      padding: 2px; line-height: 1;
      font-size: 16px;
    }
    .fav-btn.active { color: #EF9F27; }
    .card-desc {
      font-size: 13px;
      color: var(--color-text-secondary);
      line-height: 1.5;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card-stats {
      display: flex; gap: 12px;
      padding-top: 10px;
      border-top: 0.5px solid var(--color-border-tertiary);
    }
    .stat { display: flex; flex-direction: column; gap: 2px; }
    .stat-val { font-size: 13px; font-weight: 500; color: var(--color-text-primary); }
    .stat-label { font-size: 11px; color: var(--color-text-secondary); }
    .card-model {
      font-size: 11px; color: var(--color-text-secondary);
      display: flex; align-items: center; gap: 4px;
    }
    .model-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: var(--color-border-secondary);
    }
  `],
  template: `
    <div class="card" (click)="openChat()">
      <div class="card-top">
        <div class="card-icon">{{ agent.icon }}</div>
        <div class="card-meta">
          <p class="card-name">{{ agent.name }}</p>
          <span class="card-team">{{ agent.team }}</span>
        </div>
        <div class="card-right">
          <span class="status-pill" [class]="'pill-' + agent.status">
            <span class="status-dot" [class]="'dot-' + agent.status"></span>
            {{ agent.status === 'coming-soon' ? 'Soon' : agent.status }}
          </span>
          <button
            class="fav-btn"
            [class.active]="agent.isFavorite"
            (click)="toggleFav($event)"
          >{{ agent.isFavorite ? '★' : '☆' }}</button>
        </div>
      </div>

      <p class="card-desc">{{ agent.description }}</p>

      @if (agent.status !== 'coming-soon') {
        <div class="card-stats">
          <div class="stat">
            <span class="stat-val">{{ agent.runsPerMonth | number }}</span>
            <span class="stat-label">runs/month</span>
          </div>
          <div class="stat">
            <span class="stat-val">{{ agent.hoursSaved }}</span>
            <span class="stat-label">hrs saved</span>
          </div>
          <div class="stat">
            <span class="stat-val">{{ agent.activityPct }}%</span>
            <span class="stat-label">activity</span>
          </div>
        </div>
      }

      <div class="card-model" (click)="$event.stopPropagation()">
        <span class="model-dot"></span>
        {{ agent.model }}
      </div>

      <div (click)="$event.stopPropagation()">
        <app-agent-action-buttons [agent]="agent" />
      </div>
    </div>
  `
})
export class AgentCardComponent {
  @Input({ required: true }) agent!: Agent;
  @Input() mode: 'grid' | 'list' = 'grid';
  @Output() favoriteToggled = new EventEmitter<number>();

  constructor(private router: Router) {}

  openChat() {
    this.router.navigate(['/chat', this.agent.id]);
  }

  toggleFav(event: MouseEvent) {
    event.stopPropagation();
    this.favoriteToggled.emit(this.agent.id);
  }
}