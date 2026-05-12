import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecentService {

  private key = 'recentAgents';

  getRecent(): any[] {
    return JSON.parse(localStorage.getItem(this.key) || '[]');
  }

  addRecent(agent: any) {
    let recents = this.getRecent();

    recents = recents.filter(a => a.id !== agent.id);

    recents.unshift({
      ...agent,
      lastUsed: new Date()
    });

    recents = recents.slice(0, 10);

    localStorage.setItem(this.key, JSON.stringify(recents));
  }
}