// API client utility for frontend
// All requests go through Nginx proxy (relative paths)
// Automatically attaches JWT token from localStorage

const API_BASE = '/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// storing access token in this variable that will live in RAM so its not accessable by XSS attack :3
let _accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
    _accessToken = token;
};


interface ApiOptions extends Omit<RequestInit, 'body' | 'method'> {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
}

export interface User {
    id: string;
    email: string;
    username: string; // Used 'username' instead of 'name'
    firstname: string;
    lastname: string;
    avatar: string;
    // role: 'CLIENT' | 'FREELANCER' | 'ADMIN'; // old
    role: 'ADMIN' | 'USER' | 'MODERATOR';
    type: 'CLIENT' | 'FREELANCER';
}

export interface Job {
    id: string;
    title: string;
    description: string;
    createdAt: string;
}

export interface Conversation {
    id: string;
    title: string;
    updatedAt: string;
}

export interface Message {
    id: string;
    conversationId: string;
    content: string;
    createdAt: string;
}

export interface HealthResponse {
    status: 'ok' | 'degraded' | 'down';
}

export interface LoginRequest {
    email: string;
    password: string;
}

// what the frontend sends during register 
export interface RegisterRequest {
    email: string;
    username: string;
    firstname: string;
    lastname: string;
    password: string;
    // role: 'CLIENT' | 'FREELANCER'; old
    type: 'CLIENT' | 'FREELANCER'; // Changed from role
}

export interface AuthResponse {
    token: string;
    user: User;
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
    const { body, headers: extraHeaders, ...restOptions } = options;

    // used httpOnly cookie instead of localstorage
    const config: RequestInit = {
        ...restOptions,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(_accessToken && { Authorization: `Bearer ${_accessToken}` }),
            ...extraHeaders,
        },
        // Stringify body if it's an object
        ...(body !== undefined && { body: JSON.stringify(body) }),
    };

    const res = await fetch(`${API_BASE}${path}`, config);

    // If token expired (401) refresh to get a new one
    if (res.status === 401 && !path.includes('/auth/login') && !path.includes('/auth/refresh')) {
        try {
            const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                credentials: 'include'
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                setAccessToken(data.accessToken);
                // Retry the original request with the new token
                return api<T>(path, options);
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        const message = typeof err?.error === 'string' ? err.error : `Request failed: ${res.status}`;
        throw new Error(message);
    }

    // Handle 204 No Content response
    if (res.status === 204) {
        return Promise.resolve(undefined as unknown as T);
    }

    return res.json() as Promise<T>;
}

// Convenience methods
export const authApi = {
    login: (data: LoginRequest) => api<AuthResponse>('/auth/login', { method: 'POST', body: data }),
    register: (data: RegisterRequest) => api<AuthResponse>('/auth/register', { method: 'POST', body: data }),
    me: () => api<User>('/auth/me'),
    health: () => api<HealthResponse>('/auth/health'),
    updateProfile: (data: any) => api<User>('/auth/settings', { method: 'PATCH', body: data }),
    changePassword: (data: any) =>api<User>('/auth/change-password', { method: 'POST', body: data }),
    // 2FA
    // remote auth
};

export const marketApi = {
    getJobs: () => api<Job[]>('/market/jobs'),
    getJob: (id: String) => api<Job[]>(`/market/jobs/${id}`),
    createJob: (data: Omit<Job, 'id'>) => api<Job>('/market/jobs', { method: 'POST', body: data }),
    health: () => api<HealthResponse>('/market/health'),
};

export const chatApi = {
    getConversations: () => api<Conversation[]>('/chat/conversations'),
    getMessages: (convId: string) => api<Message[]>(`/chat/conversations/${convId}/messages`),
    health: () => api<HealthResponse>('/chat/health'),
};

export const analyticsApi = {
    getDashboard: () => api('/analytics/dashboard'),
    health: () => api<HealthResponse>('/analytics/health'),
};

export const adminApi = {
    getUsers: () => api('/admin/users'),
    health: () => api<HealthResponse>('/admin/health'),
};
