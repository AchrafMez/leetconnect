// API client utility for frontend
// All requests go through Nginx proxy (relative paths)
// Automatically attaches JWT token from localStorage

import type { Conversation } from '../pages/chat/ConverLayer';
import type { Message } from '../pages/chat/MessageLayer';
import type { Job } from '@/types';

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
		status: 'active' | 'suspended' | 'pending';
		createdAt: string;

    // profile settings
    bio: string;
    location: string,
    website: string,
    title: string
}

export interface OverviewData {
  totalUsers: number;
  totalJobs: number;
  activeJobs: number;
  flaggedJobs: number;
  suspendedUsers: number;
  pendingUsers: number;
  newUsersThisWeek: number;
  newJobsThisWeek: number;
}

export interface UsersAnalytics {
  range: string;
  registrationsOverTime: { date: string; count: number }[];
  byRole: { role: string; count: number }[];
  byStatus: { status: string; count: number }[];
}

export interface JobsAnalytics {
  range: string;
  jobsOverTime: { date: string; count: number }[];
  byStatus: { status: string; count: number }[];
  byCategory: { category: string; count: number }[];
  byBudgetType: { type: string; count: number }[];
  avgProposals: number;
}

/* export interface Job {
    id: string;
    title: string;
    description: string;
    createdAt: string;
} */

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

export interface UpdateProfileResponse {
    message: string;
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
    refresh: () => api<{ accessToken: string }>('/auth/refresh', { method: 'POST' }),
    health: () => api<HealthResponse>('/auth/health'),
    updateProfile: (data: any) => api<UpdateProfileResponse>('/auth/settings', { method: 'PATCH', body: data }),
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

interface PaginatedMessages {
	messages: 		Message[];
	next_cursor:	number | null;
}

interface CreateConversPayload {
    type: 'Direct' | 'Group';
    name?: string;
    member_ids: string[];
}

export const chatApi = {
	// ---------------------- Conversations ----------------------
	listConversations: () =>
		api<Conversation[]>(`/chat/convers`),

	getConversation: (convers_id: number) =>
		api<Conversation>(`/chat/convers/${convers_id}`),

	leaveConversation: (convers_id: number, user_id: string) =>
		api<{ message: string }>(`/chat/convers/${convers_id}`, {
			method: 'DELETE',
			body: { user_id: user_id },
		}),

	// ---------------------- Messages ----------------------
	listMessages: (convers_id: number, limit = 20, cursor?: number) => {
		let url = `/chat/convers/${convers_id}/messages?limit=${limit}`;
		if (cursor)
            url += `&cursor=${cursor}`;
		return api<PaginatedMessages>(url);
	},

	sendMessage: (convers_id: number, content: string) =>
		api<Message>(`/chat/convers/${convers_id}/messages`, {
			method: 'POST',
			body: { content: content },
		}),

	getMessage: (convers_id: number, msg_id: number) =>
		api<{ message: string }>(`/chat/convers/${convers_id}/messages/${msg_id}`, {
			body: { msg_id: msg_id },
		}),

	deleteMessage: (convers_id: number, msg_id: number) =>
		api<{ message: string }>(`/chat/convers/${convers_id}/messages/${msg_id}`, {
			method: 'DELETE'
		}),

	// ---------------------- Convers ----------------------
        createConversation: (data: CreateConversPayload) =>
        api<Conversation>('/chat/convers', {
            method: 'POST',
            body: {
                type: data.type,
                name: data.name,
                member_ids: data.member_ids,
            },
        }),
	// ---------------------- Health ----------------------
	health: () => api<HealthResponse>('/chat/health'),
};

export interface FriendRequest {
    id:             number;
    sender_id:      string;
    receiver_id:    string;
    status:         'PENDING' | 'ACCEPTED' | 'REJECTED';
    created_at:     string;
    updated_at:     string;

    sender?:   {id: string, username: string, avatar: string};
    receiver?: {id: string, username: string, avatar: string};
}

export interface Friend {
    id:         string;
    username:   string;
    avatar:     string;
    is_online:  boolean;
}

export const friendApi = {
    sendRequest: (receiver_id: string) =>
        api<FriendRequest>('/friend/requests', {
            method: 'POST',
            body: {receiver_id}
        }),
    
    acceptRequest: (request_id: number) =>
        api<FriendRequest>(`/friend/requests/${request_id}/accept`, {
            method: 'PATCH'
        }),

    rejectRequest: (request_id: number) =>
        api<FriendRequest>(`/friend/requests/${request_id}/reject`, {
            method: 'PATCH'
        }),

    cancelRequest: (request_id: number) =>
        api<void>(`/friend/requests/${request_id}`, {
            method: 'DELETE'
        }),

    listIncoming: () => api<FriendRequest[]>('/friend/requests/incoming'),
    listOutgoing: () => api<FriendRequest[]>('/friend/requests/outgoing'),
    listFriends: () => api<Friend[]>('/friend/requests/friends'),

    removeFriend: (friend_id: string) => api<void>('/friend/requests/friends', {
            method: 'DELETE',
            body: {friend_id},
        })
}

export const analyticsApi = {
    getAnalyticsOverview: () =>
			api<OverviewData>('/admin/analytics/overview'),
		getUsersAnalytics: (params: string) =>
			api<UsersAnalytics>(`/admin/analytics/users?${params}`),
		getJobsAnalytics: (params: string) =>
			api<JobsAnalytics>(`/admin/analytics/jobs?${params}`),
    health: () => api<HealthResponse>('/analytics/health'),
};

export interface RoleConfig {
  id:          string;
  label:       string;
  description: string;
  userCount:   number;
  permissions: string[];
}

export const adminApi = {
  // users
  getUsers:         (params?: { search?: string; role?: string; status?: string }) => {
		const query = new URLSearchParams(params as any).toString();
		return api<User[]>(`/admin/users?${query}`);
	},
  getUserById:      (id: string)              => api<User>(`/admin/users/${id}`),
  updateUserStatus: (id: string, status: string) =>
    api<User>(`/admin/users/${id}/status`, { method: 'PATCH', body: { status } }),
  updateUserRole:   (id: string, role: string) =>
    api<User>(`/admin/users/${id}/role`, { method: 'PATCH', body: { role } }),
  deleteUser:       (id: string)              =>
    api<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE' }),

  // jobs
  getJobs:          (params?: { search?: string; status?: string; category?: string }) => {
		const query = new URLSearchParams(params as any).toString();
		return api<Job[]>(`/admin/jobs?${query}`);
	},
  getJobById:       (id: string)              => api<Job>(`/admin/jobs/${id}`),
  updateJobStatus:  (id: string, status: string) =>
    api<Job>(`/admin/jobs/${id}/status`, { method: 'PATCH', body: { status } }),
  deleteJob:        (id: string)              =>
    api<{ message: string }>(`/admin/jobs/${id}`, { method: 'DELETE' }),

	// roles
	getRoles: () => api<RoleConfig[]>('/admin/roles'),

  health: () => api<HealthResponse>('/admin/health'),
};
