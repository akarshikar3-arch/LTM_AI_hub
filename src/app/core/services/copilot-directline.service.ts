import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CopilotDirectLineService {
  async generateToken(): Promise<string> { return ''; }
  async startConversation(): Promise<string> { return ''; }
  async sendMessage(text: string): Promise<void> {}
  async getNewReplies(): Promise<string[]> { return []; }
  resetConversation(): void {}
}