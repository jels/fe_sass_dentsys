import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiPageResponse, ApiResponse, PageData, PageParams } from '../models/api.models';

@Injectable()
export abstract class BaseApiService<T> {
    protected abstract readonly endpoint: string;

    constructor(protected http: HttpClient) {}

    getAll(): Observable<T[]> {
        return this.http.get<ApiResponse<T[]>>(this.endpoint).pipe(map((res) => res.data));
    }

    getPage(params: PageParams): Observable<PageData<T>> {
        const httpParams = new HttpParams()
            .set('page', params.page)
            .set('size', params.size)
            .set('sort', params.sort ?? 'id')
            .set('direction', params.direction ?? 'ASC');

        return this.http.get<ApiPageResponse<T>>(this.endpoint, { params: httpParams }).pipe(map((res) => res.data));
    }

    getById(id: number): Observable<T> {
        return this.http.get<ApiResponse<T>>(`${this.endpoint}/${id}`).pipe(map((res) => res.data));
    }

    create(payload: Partial<T>): Observable<T> {
        return this.http.post<ApiResponse<T>>(this.endpoint, payload).pipe(map((res) => res.data));
    }

    update(id: number, payload: Partial<T>): Observable<T> {
        return this.http.put<ApiResponse<T>>(`${this.endpoint}/${id}`, payload).pipe(map((res) => res.data));
    }

    patch(id: number, payload: Partial<T>): Observable<T> {
        return this.http.patch<ApiResponse<T>>(`${this.endpoint}/${id}`, payload).pipe(map((res) => res.data));
    }

    delete(id: number): Observable<void> {
        return this.http.delete<ApiResponse<void>>(`${this.endpoint}/${id}`).pipe(map(() => undefined));
    }

    toggleStatus(id: number): Observable<T> {
        return this.http.patch<ApiResponse<T>>(`${this.endpoint}/${id}/toggle-status`, {}).pipe(map((res) => res.data));
    }
}
