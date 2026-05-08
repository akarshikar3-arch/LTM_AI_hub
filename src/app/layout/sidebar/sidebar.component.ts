import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AgentService } from '../../core/services/agent.service';
 
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
 
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-inner">
          <!-- LTM mark: blue LTM on top, red LTM on bottom -->
          <img src="assets/LTM_logo.png" alt="Logo" class="logo-mark"/>
          <div class="logo-text">
            <span class="logo-name"></span>
            <span class="logo-sub">AI Hub Platform</span>
          </div>
        </div>
        <div class="logo-accent-bar"></div>
      </div>
 
      <!-- Nav -->
      <nav class="sidebar-nav">
 
        <div class="nav-section-label">Workspace</div>
 
        <a routerLink="/home" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".8"/>
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".8"/>
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".8"/>
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".8"/>
            </svg>
          </span>
          <span>Home</span>
        </a>
 
        <a routerLink="/agents" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.5"/>
              <path d="M2 13c0-2.2 2.7-4 6-4s6 1.8 6 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </span>
          <span>All Agents</span>
          <span class="nav-badge">{{ agentService.agents().length }}</span>
        </a>
 
        <a routerLink="/favorites" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 13.5S2 9.8 2 5.5A3.5 3.5 0 0 1 8 3.2 3.5 3.5 0 0 1 14 5.5c0 4.3-6 8-6 8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            </svg>
          </span>
          <span>Favorites</span>
          <span class="nav-badge fav" [class.has-items]="favCount() > 0">{{ favCount() }}</span>
        </a>
 
        <a routerLink="/stats" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="9" width="3" height="5" rx="1" fill="currentColor" opacity=".8"/>
              <rect x="6.5" y="5" width="3" height="9" rx="1" fill="currentColor" opacity=".8"/>
              <rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor" opacity=".8"/>
            </svg>
          </span>
          <span>Usage Stats</span>
        </a>
 
        <div class="nav-divider"></div>
        <div class="nav-section-label">Recent Chats</div>
 
        @for (agent of agentService.recentlyUsed(); track agent.id) {
          <a [routerLink]="['/chat', agent.id]" routerLinkActive="active" class="nav-agent">
            <div class="nav-agent-icon" [class]="agent.colorClass">{{ agent.icon }}</div>
            <span class="nav-agent-name">{{ agent.name }}</span>
            @if (agent.chatHistory.personal.length > 0) {
              <span class="nav-dot"></span>
            }
          </a>
        }
 
        <div class="nav-divider"></div>
        <div class="nav-section-label">Categories</div>
 
        <a routerLink="/agents" [queryParams]="{category: 'IT & Platforms'}" class="nav-item cat">
          <span class="nav-icon cat-icon ic-blue">🔧</span>
          <span>Business Usecase</span>
          <span class="nav-badge">42</span>
        </a>
        <a routerLink="/agents" [queryParams]="{category: 'Enterprise'}" class="nav-item cat">
          <span class="nav-icon cat-icon ic-amber">📊</span>
          <span>Enterprise</span>
          <span class="nav-badge">1</span>
        </a>
 
      </nav>
 
    
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--nav-w);
      flex-shrink: 0;
      background: var(--chev-blue-dd);
      display: flex;
      flex-direction: column;
      height: 100vh;
      position: relative;
      z-index: 100;
      overflow: hidden;
    }
    .sidebar::after {
      content: '';
      position: absolute;
      top: 0; right: 0;
      width: 1px; height: 100%;
      background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(200,0,30,.28) 60%, rgba(255,255,255,.04));
    }
 
    /* Logo */
    .sidebar-logo {
      flex-shrink: 0;
      background: linear-gradient(160deg, #000000 0%, var(--chev-blue-dd) 100%);
      border-bottom: 1px solid rgba(255,255,255,.07);
      position: relative;
    }
    .logo-inner {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 18px 16px 15px;
      position: relative;
      z-index: 1;
    }
    .logo-mark { width: 40px; height: 40px; flex-shrink: 0; }
    .logo-name {
      display: block;
      font-family: var(--font);
      font-size: 18px;
      font-weight: 700;
      color: white;
      letter-spacing: -.3px;
      line-height: 1;
    }
    .logo-sub {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.6);
      letter-spacing: .8px;
      text-transform: uppercase;
      margin-top: 3px;
    }
    .logo-accent-bar {
      height: 2px;
      background: linear-gradient(90deg, rgba(255,255,255,0), var(--chev-red) 45%, rgba(255,255,255,0));
    }
 
    /* Nav */
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 10px 10px;
    }
    .sidebar-nav::-webkit-scrollbar { display: none; }
 
    .nav-section-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .7px;
      color: rgba(255, 255, 255, 0.8);
      padding: 12px 9px 5px;
    }
 
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px;
      border-radius: var(--r1);
      text-decoration: none;
      font-size: 13px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.86);
      transition: all .15s;
      margin-bottom: 1px;
      cursor: pointer;
      border: 1px solid transparent;
    }
    .nav-item:hover { background: rgba(255,255,255,.07); color: rgba(255,255,255,.85); }
    .nav-item.active {
      background: rgba(255,255,255,.1);
      color: white;
      font-weight: 500;
      border-color: rgba(255,255,255,.1);
    }
    .nav-item.active .nav-icon { color: #60AAEF; }
    .nav-item.cat { padding: 7px 10px; }
 
    .nav-icon {
      width: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: currentColor;
      flex-shrink: 0;
    }
    .cat-icon {
      width: 22px; height: 22px;
      border-radius: 6px;
      font-size: 11px;
    }
    .ic-blue  { background: rgba(0, 0, 0, 0.18); }
    .ic-amber { background: rgba(240,180,60,.18); }
    .ic-teal  { background: rgba(0, 0, 0, 0.18); }
 
    .nav-badge {
      margin-left: auto;
      font-size: 10px; font-weight: 600;
      color: rgba(255,255,255,.4);
      background: rgba(255,255,255,.1);
      padding: 2px 8px; border-radius: 20px;
    }
    .nav-badge.fav.has-items {
      background: rgba(200,0,30,.3);
      color: #ff8a9a;
    }
 
    /* Agent rows */
    .nav-agent {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 7px 10px;
      border-radius: var(--r1);
      text-decoration: none;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.86);
      transition: all .14s;
      margin-bottom: 1px;
    }
    .nav-agent:hover { background: rgba(255,255,255,.06); color: rgba(255,255,255,.82); }
    .nav-agent.active { background: rgba(255,255,255,.1); color: #60AAEF; font-weight: 500; }
    .nav-agent-icon {
      width: 22px; height: 22px;
      border-radius: 5px;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; flex-shrink: 0;
    }
    .nav-agent-name {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .nav-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--chev-blue-lt);
      flex-shrink: 0;
      animation: blink 2.5s ease-in-out infinite;
    }
 
    .nav-divider {
      height: 1px;
      background: rgba(255,255,255,.07);
      margin: 6px 8px;
    }
 
   
  `]
})
export class SidebarComponent {
  readonly favCount = () => this.agentService.favorites().length;
  constructor(readonly agentService: AgentService) { }
}
 