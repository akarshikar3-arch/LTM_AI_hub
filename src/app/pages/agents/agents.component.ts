import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AgentService } from '../../core/services/agent.service';
import { AgentCardComponent } from '../../shared/components/agent-card/agent-card.component';
import { AgentActionButtonsComponent } from './agent-action-buttons.component';
import { AgentCategory } from '../../core/models/agent.model';

@Component({
  selector: 'app-agents',
  standalone: true,
  imports: [CommonModule, AgentCardComponent, AgentActionButtonsComponent],
  template: `
    <div class="agents-page">
      <div class="pill-group fade-up">
        <button class="pill" [class.active]="cat() === 'All'" (click)="setCat('All')">All</button>
        <button class="pill" [class.active]="cat() === 'Business Usecase'" (click)="setCat('Business Usecase')">Business Usecase</button>
        <button class="pill" [class.active]="cat() === 'Enterprise'" (click)="setCat('Enterprise')">Enterprise</button>
      </div>
      <div class="pill-group" style="margin-top:-12px">
        <button class="pill sm" [class.active]="stat() === 'all'" (click)="setStat('all')">All</button>
        <button class="pill sm" [class.active]="stat() === 'live'" (click)="setStat('live')">Live</button>
        <button class="pill sm" [class.active]="stat() === 'beta'" (click)="setStat('beta')">Beta</button>
        <button class="pill sm" [class.active]="stat() === 'coming-soon'" (click)="setStat('coming-soon')">Coming Soon</button>
      </div>
      <div class="sec-head fade-up">
        <span class="sec-title">{{ agents().length }} agent{{ agents().length !== 1 ? 's' : '' }}</span>
      </div>
      <div class="agents-grid fade-up-2">
        @for (a of agents(); track a.id) {
          <app-agent-card [agent]="a" mode="grid" (favoriteToggled)="svc.toggleFavorite($event)" />
        }
      </div>
    </div>
  `,
  styles: [`
    .agents-page { padding: 28px 32px 64px; }
    .agents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
  `]
})
export class AgentsComponent implements OnInit {
  readonly cat = signal<AgentCategory | 'All'>('All');
  readonly stat = signal('all');
  readonly agents = computed(() => this.svc.filterBy(this.cat(), this.stat(), ''));
  constructor(readonly svc: AgentService, private route: ActivatedRoute) {}
  ngOnInit() {
    this.route.queryParams.subscribe(p => { if (p['category']) this.cat.set(p['category']); });
  }
  setCat(c: AgentCategory | 'All') { this.cat.set(c); }
  setStat(s: string) { this.stat.set(s); }
}
