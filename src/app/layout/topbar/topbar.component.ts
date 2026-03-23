
import { Component, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <div class="page-title" [innerHTML]="pageTitle()"></div>
      </div>
      <div class="topbar-right">
        <div class="search-box">
          <svg class="search-ico" width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.4"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          <input type="text" placeholder="Search agents…" [(ngModel)]="searchQuery">
          <kbd>⌘K</kbd>
        </div>
        <button class="submit-btn">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          Submit Agent
        </button>

        <!-- Profile button top right -->
        <div class="profile-btn" (click)="toggleProfile()" title="Akarshika R">
          <div class="profile-av">AK</div>
          <div class="profile-info">
            <span class="profile-name">Akarshika R</span>
            <span class="profile-role">Upstream · Chennai</span>
          </div>
          <div class="profile-status"></div>
        </div>

        <!-- Profile dropdown -->
        @if (profileOpen()) {
          <div class="profile-dropdown">
            <div class="pd-header">
              <div class="pd-av">AK</div>
              <div>
                <div class="pd-name">Akarshika R</div>
                <div class="pd-email">akarshika.r&#64;ltimindtree.com</div>
              </div>
            </div>
            <div class="pd-divider"></div>
            <button class="pd-item">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.4"/>
                <path d="M2 13c0-2.2 2.7-4 6-4s6 1.8 6 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
              My Profile
            </button>
            <button class="pd-item">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.4"/>
                <path d="M8 5v3l2 2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
              Usage Stats
            </button>
            <button class="pd-item">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M8 2a6 6 0 016 6v1l1 2H1l1-2V8a6 6 0 016-6z" stroke="currentColor" stroke-width="1.4"/>
                <path d="M6 13a2 2 0 004 0" stroke="currentColor" stroke-width="1.4"/>
              </svg>
              Notifications
            </button>
            <div class="pd-divider"></div>
            <button class="pd-item danger">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l4-3-4-3M14 8H6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Sign Out
            </button>
          </div>
        }
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: var(--top-h);
      background: rgba(255,255,255,.95);
      backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      padding: 0 28px;
      gap: 16px;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      z-index: 50;
      position: relative;
    }
    .topbar::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--chev-blue) 0%, var(--chev-red) 50%, transparent 100%);
      opacity: .35;
    }
    .topbar-left { flex: 1; min-width: 0; }
    .page-title {
      font-family: var(--font);
      font-size: 17px;
      font-weight: 700;
      color: var(--t1);
      letter-spacing: -.4px;
      white-space: nowrap;
    }
    :host ::ng-deep .page-title em {
      font-style: normal;
      color: var(--chev-blue);
      font-weight: 400;
    }
    .topbar-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
      position: relative;
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--surface-2);
      border: 1.5px solid var(--border);
      border-radius: 10px;
      padding: 0 12px;
      height: 36px;
      width: 240px;
      transition: all .2s;
    }
    .search-box:focus-within {
      background: white;
      border-color: var(--chev-blue);
      box-shadow: 0 0 0 3px rgba(0,84,166,.1);
      width: 280px;
    }
    .search-ico { color: var(--t4); flex-shrink: 0; }
    .search-box input {
      flex: 1; border: none; outline: none;
      background: transparent; font-size: 13px;
      color: var(--t1); font-family: var(--font);
    }
    .search-box input::placeholder { color: var(--t5); }
    kbd {
      font-size: 10px; color: var(--t5);
      background: var(--surface-3);
      border: 1px solid var(--border);
      border-radius: 5px; padding: 2px 6px;
      font-family: var(--font); flex-shrink: 0;
    }
    .submit-btn {
      display: flex; align-items: center; gap: 6px;
      height: 36px; padding: 0 16px;
      background: var(--chev-blue); color: white;
      border: none; border-radius: 10px;
      font-size: 13px; font-weight: 600;
      font-family: var(--font); cursor: pointer;
      white-space: nowrap; transition: all .18s;
      box-shadow: 0 2px 8px rgba(0,84,166,.28);
    }
    .submit-btn:hover {
      background: var(--chev-blue-d);
      transform: translateY(-1px);
      box-shadow: 0 5px 18px rgba(0,84,166,.34);
    }
    .submit-btn:active { transform: scale(.98); }

    /* Profile button */
    .profile-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 10px 4px 4px;
      border-radius: 22px;
      border: 1.5px solid var(--border);
      background: white;
      cursor: pointer;
      transition: all .15s;
      box-shadow: var(--s-card);
      position: relative;
    }
    .profile-btn:hover {
      border-color: var(--chev-blue);
      box-shadow: 0 0 0 3px rgba(0,84,166,.08);
    }
    .profile-av {
      width: 28px; height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--chev-red), var(--chev-red-d));
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: white;
      flex-shrink: 0;
    }
    .profile-name {
      display: block;
      font-size: 12px; font-weight: 600;
      color: var(--t1); white-space: nowrap;
    }
    .profile-role {
      display: block;
      font-size: 10px; color: var(--t4);
      white-space: nowrap;
    }
    .profile-status {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #3ddc84;
      flex-shrink: 0;
      box-shadow: 0 0 0 2px white;
    }

    /* Profile dropdown */
    .profile-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: 220px;
      background: white;
      border: 1.5px solid var(--border);
      border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,.12);
      z-index: 200;
      overflow: hidden;
      animation: dropIn .15s ease forwards;
    }
    @keyframes dropIn {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .pd-header {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 14px 12px;
    }
    .pd-av {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, var(--chev-red), var(--chev-red-d));
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; color: white; flex-shrink: 0;
    }
    .pd-name { font-size: 13px; font-weight: 700; color: var(--t1); }
    .pd-email { font-size: 11px; color: var(--t4); margin-top: 1px; }
    .pd-divider { height: 1px; background: var(--border); margin: 0 10px; }
    .pd-item {
      display: flex; align-items: center; gap: 9px;
      width: 100%; padding: 10px 14px;
      background: none; border: none;
      font-size: 13px; color: var(--t2);
      font-family: var(--font); cursor: pointer;
      text-align: left; transition: all .12s;
    }
    .pd-item:hover { background: var(--surface-2); color: var(--t1); }
    .pd-item.danger { color: var(--chev-red); }
    .pd-item.danger:hover { background: rgba(220,38,38,.06); }
  `]
})
export class TopbarComponent {
  searchQuery = '';
  readonly pageTitle = signal('Agent <em>Hub</em>');
  readonly profileOpen = signal(false);

  private readonly titleMap: Record<string, string> = {
    '/home':      'Agent <em>Hub</em>',
    '/agents':    'All <em>Agents</em>',
    '/favorites': '<em>Favorites</em>',
    '/stats':     'Usage <em>Stats</em>',
  };

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const seg = '/' + e.urlAfterRedirects.split('/')[1].split('?')[0];
        if (seg.startsWith('/chat')) {
          this.pageTitle.set('<em>Chat</em>');
        } else {
          this.pageTitle.set(this.titleMap[seg] ?? 'Agent <em>Hub</em>');
        }
        this.profileOpen.set(false);
      });
  }

  toggleProfile() {
    this.profileOpen.update(v => !v);
  }
}