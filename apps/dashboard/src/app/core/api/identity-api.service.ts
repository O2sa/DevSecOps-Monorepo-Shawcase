import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class IdentityApiService {
  private readonly baseUrl = environment.identityServiceUrl;

  constructor(private http: HttpClient) {}

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/api/users/me`);
  }

  getUsers(): Observable<User[]> {
    return this.http
      .get<User[] | { results: User[] }>(`${this.baseUrl}/api/users`)
      .pipe(map((res) => (Array.isArray(res) ? res : res.results || [])));
  }
}
