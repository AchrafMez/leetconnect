// API client utility for frontend
// All requests go through Nginx proxy (relative paths)
// Automatically attaches JWT token from localStorage

import type { Conversation } from '../pages/chat/ConverLayer';
import type { Message } from '../pages/chat/MessageLayer';

const API_BASE = '/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';


interface ApiOptions extends Omit<RequestInit, 'body' | 'method'> {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
}

export interface User {
    id: string;
    email: string;
    name: string;
}

export interface Job {
    id: string;
    title: string;
    description: string;
    createdAt: string;
}

// export interface Conversation {
//     id: string;
//     title: string;
//     updatedAt: string;
// }

// export interface Message {
//     id: string;
//     conversationId: string;
//     content: string;
//     createdAt: string;
// }

export interface HealthResponse {
    status: 'ok' | 'degraded' | 'down';
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
    const token = localStorage.getItem('token');
    const { body, headers: extraHeaders, ...restOptions } = options;

    const config : RequestInit = {
        ...restOptions,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...extraHeaders,

        },
        // Stringify body if it's an object
        ...(body !== undefined && { body: JSON.stringify(body) }),
    };

    const res = await fetch(`${API_BASE}${path}`, config);


    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        const message = typeof err?.error === 'string' ? err.error : `Request failed: ${res.status}`;
        throw new Error(message);
    }

    return res.json() as Promise<T>;
}

// Convenience methods
export const authApi = {
    login: (data: LoginRequest) => api<AuthResponse>('/auth/login', { method: 'POST', body: data }),
    register: (data: RegisterRequest) => api<AuthResponse>('/auth/register', { method: 'POST', body: data }),
    me: () => api<User>('/auth/me'),
    health: () => api<HealthResponse>('/auth/health'),
};

export const marketApi = {
    getJobs: () => api<Job[]>('/market/jobs'),
    getJob: (id: String) => api<Job[]>(`/market/jobs/${id}`),
    createJob: (data: Omit<Job, 'id'>) => api<Job>('/market/jobs', { method: 'POST', body: data }),
    health: () => api<HealthResponse>('/market/health'),
};

interface PaginatedMessages {
	messages: 		Message[];
	next_cursor:	number | null;
}

export const chatApi = {
	// ---------------------- Conversations ----------------------
	listConversations: (user_id: number) =>
		api<Conversation[]>(`/chat/convers?user_id=${user_id}`),

	getConversation: (convers_id: number, user_id: number) =>
		api<Conversation>(`/chat/convers/${convers_id}?user_id=${user_id}`),

	leaveConversation: (convers_id: number, user_id: number) =>
		api<{ message: string }>(`/chat/convers/${convers_id}`, {
			method: 'DELETE',
			body: { user_id: user_id },
		}),

	// ---------------------- Messages ----------------------
	listMessages: (convers_id: number, user_id: number, limit = 20, cursor?: number) => {
		let url = `/chat/convers/${convers_id}/messages?user_id=${user_id}&limit=${limit}`;
		if (cursor)
            url += `&cursor=${cursor}`;
		return api<PaginatedMessages>(url);
	},

	sendMessage: (convers_id: number, user_id: number, content: string) =>
		api<Message>(`/chat/convers/${convers_id}/messages`, {
			method: 'POST',
			body: { user_id: user_id, content },
		}),

	getMessage: (convers_id: number, user_id: number, msg_id: number) =>
		api<{ message: string }>(`/chat/convers/${convers_id}/messages/${msg_id}`, {
			body: { user_id: user_id, msg_id: msg_id },
		}),

	deleteMessage: (convers_id: number, user_id: number, msg_id: number) =>
		api<{ message: string }>(`/chat/convers/${convers_id}/messages/${msg_id}`, {
			method: 'DELETE',
			body: { user_id: user_id, msg_id: msg_id },
		}),

	// ---------------------- Health ----------------------
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
