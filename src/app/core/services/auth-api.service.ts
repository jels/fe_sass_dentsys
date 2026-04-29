import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RefreshTokenRequest } from '../models/auth.models';
import { ApiResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
    private readonly url = `${environment.apiUrl}/auth`;

    constructor(private http: HttpClient) {}

    login(request: LoginRequest): Observable<AuthResponse> {
        return this.http.post<ApiResponse<AuthResponse>>(`${this.url}/login`, request).pipe(map((res) => res.data));
    }

    refreshToken(refreshToken: string): Observable<AuthResponse> {
        const body: RefreshTokenRequest = { refreshToken };
        return this.http.post<ApiResponse<AuthResponse>>(`${this.url}/refresh-token`, body).pipe(map((res) => res.data));
    }

    logout(): Observable<void> {
        return this.http.post<void>(`${this.url}/logout`, {});
    }
}
