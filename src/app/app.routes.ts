import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'Home — Chevron AI Hub'
  },
  {
    path: 'agents',
    loadComponent: () => import('./pages/agents/agents.component').then(m => m.AgentsComponent),
    title: 'All Agents — Chevron AI Hub'
  },
  {
    path: 'favorites',
    loadComponent: () => import('./pages/favorites/favorites.component').then(m => m.FavoritesComponent),
    title: 'Favorites — Chevron AI Hub'
  },
  {
    path: 'stats',
    loadComponent: () => import('./pages/stats/stats.component').then(m => m.StatsComponent),
    title: 'Usage Stats — Chevron AI Hub'
  },
  {
    path: 'chat/:id',
    loadComponent: () => import('./pages/chat/chat.component').then(m => m.ChatComponent),
    title: 'Chat — Chevron AI Hub'
  },
  { path: '**', redirectTo: 'home' }
];
