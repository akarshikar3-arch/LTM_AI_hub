import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private _globalSidebarOpen = new BehaviorSubject<boolean>(false);
  globalSidebarOpen$ = this._globalSidebarOpen.asObservable();

  openGlobalSidebar() { this._globalSidebarOpen.next(true); }
  closeGlobalSidebar() { this._globalSidebarOpen.next(false); }
  toggleGlobalSidebar() { this._globalSidebarOpen.next(!this._globalSidebarOpen.value); }

  get isOpen() { return this._globalSidebarOpen.value; }
}