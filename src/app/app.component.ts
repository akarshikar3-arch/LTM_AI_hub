import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { TopbarComponent } from './layout/topbar/topbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="shell">
      <app-sidebar />
      <div class="shell-main">
        <app-topbar />
        <main class="shell-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .shell { display: flex; height: 100vh; overflow: hidden; }
    .shell-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
    .shell-content { flex: 1; overflow-y: auto; overflow-x: hidden; }
    .shell-content::-webkit-scrollbar { width: 5px; }
    .shell-content::-webkit-scrollbar-thumb { background: var(--border-s); border-radius: 10px; }
  `]
})
export class AppComponent {}
