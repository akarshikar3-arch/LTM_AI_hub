import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AgentApiService {

  private apiUrl = environment.agentApiUrl;

  constructor(private http: HttpClient) {}

  executeCodeReview(code: string): Observable<any> {
    return this.http.post(
      this.apiUrl + '/api/agent/execute',
      { text: code }
    );
  }

  healthCheck(): Observable<any> {
    return this.http.get(this.apiUrl + '/health');
  }
}