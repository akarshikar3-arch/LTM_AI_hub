import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AgentApiService {

  private apiUrl = environment.agentApiUrl;

  constructor(private http: HttpClient) {}

  executeCodeReview(code: string, filePath?: string): Observable<any> {

  const headers: any = {
    'Content-Type': 'text/plain'
  };

  // ✅ add file path (critical for backend filtering)
  if (filePath) {
    headers['x-file-path'] = filePath;
  }

  return this.http.post(
    this.apiUrl + '/api/agent/execute',
    code, // ✅ send raw code, NOT { text: code }
    { headers }
  );
}


  healthCheck(): Observable<any> {
    return this.http.get(this.apiUrl + '/health');
  }
}