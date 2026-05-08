import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AgentService } from '../../core/services/agent.service';
import { AgentCardComponent } from '../../shared/components/agent-card/agent-card.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink, AgentCardComponent],
  template: `
    <div class="fav-page">
      <div class="sec-head fade-up">
        <span class="sec-title">♥ Favorites · {{ svc.favorites().length }}</span>
      </div>
      @if (svc.favorites().length > 0) {
        <div class="agents-grid fade-up-2">
          @for (a of svc.favorites(); track a.id) {
            <app-agent-card [agent]="a" mode="grid" (favoriteToggled)="svc.toggleFavorite($event)" />
          }
        </div>
      } @else {
        <div class="empty-state fade-up">
          <div class="empty-icon">♡</div>
          <div class="empty-title">No favorites yet</div>
          <p class="empty-sub">Tap ♡ on any agent card to pin it here.</p>
          <a class="empty-cta" routerLink="/agents">Browse all agents →</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .fav-page { padding: 28px 32px 64px; }
    .agents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
    .empty-state {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 80px 24px; text-align: center;
    }
    .empty-icon { font-size: 52px; color: var(--t5); margin-bottom: 16px; }
    .empty-title { font-size: 20px; font-weight: 700; color: var(--t2); margin-bottom: 8px; }
    .empty-sub { font-size: 14px; color: var(--t4); margin-bottom: 24px; line-height: 1.6; }
    .empty-cta {
      padding: 10px 24px;
      background: var(--chev-blue); color: white;
      border-radius: 10px; font-size: 13px; font-weight: 600;
      text-decoration: none; transition: all .18s;
      box-shadow: var(--s-blue);
    }
    .empty-cta:hover { background: var(--chev-blue-d); }
  `]
})
export class FavoritesComponent {
  constructor(readonly svc: AgentService) {}
}
