import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
 
@Injectable({ providedIn: 'root' })
export class AiService {
  constructor(private http: HttpClient) {}
 
  generateUnitTests(payload: any) {
    return this.http.post(
      'http://localhost:3001/api/ai/angular-unit-testing',
      payload
    );
  }

  codeReview(code: string) {
  return this.http.post<any>(
    'http://localhost:5000/api/ai/code-review', // backend endpoint
    code
  );
}
}
 