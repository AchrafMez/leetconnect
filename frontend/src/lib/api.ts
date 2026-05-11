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

export const getAccessToken = () => _accessToken;


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
    category: string[],
    skills: string[],
    rate?: number;
    expLevel?: string;
    avatar: string,
    proposals: Proposal,
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
    twoFAEnabled: boolean;
    oauthProvider?: string | null;
}

// Response when starting 2FA setup
export interface TwoFASetupResponse {
    qrCode: string;
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
    accessToken: string;
    user: User;
    requires2FA?: boolean; // If true, frontend must show the 6-digit code input
    userId?: string;       // Needed to identify which user is finishing 2FA login
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

    // dont refresh for these routes 
    const skipRefresh =
    path.includes('/auth/login') ||
    path.includes('/auth/2fa/login') ||
    path.includes('/auth/2fa/setup') ||
    path.includes('/auth/2fa/disable') ||
    path.includes('/auth/refresh') ||
    path.includes('/auth/change-password');

    // If token expired (401) refresh to get a new one
    if (res.status === 401 && !skipRefresh) {
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
            // shhhhh 
        }
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        // Try getting message properly from express response { success: false, message: '...' }
        let message = err?.message || (typeof err?.error === 'string' ? err.error : `Request failed: ${res.status}`);
        if (!err?.message && Array.isArray(err?.errors)) {
            message = err.errors.join(', ');
        }
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
    uploadAvatar: async (file: File): Promise<{ avatar: string }> => {
        const formData = new FormData();
        formData.append('avatar', file);

        const res = await fetch(`${API_BASE}/auth/avatar`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
            headers: {
                ...(_accessToken ? { Authorization: `Bearer ${_accessToken}` } : {}),
            },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Upload failed' }));
            throw new Error(err.error || 'Upload failed');
        }

        return res.json();
    },

    // 2FA
    setup2FA: (password: string) =>api<TwoFASetupResponse>('/auth/2fa/setup', { method: 'POST',body: { password }}),
    verify2FA: (code: string) =>api<User>('/auth/2fa/verify', { method: 'POST',  body: { code }}),
    disable2FA: (code: string, password: string) =>api<{ message: string }>('/auth/2fa/disable', { method: 'POST', body: { code, password }}),

    // Second step of Login (If login returns requires2FA: true)
    login2FA: (tempToken: string, code: string) =>api<AuthResponse>('/auth/2fa/login', { method: 'POST', body: { tempToken, code } }),


    // remote auth
};

export interface JobRequest {
    title: string;
    description: string;
    category: string;
    budget: number | string;
    skills: string[];
}

export const jobsApi = {
    addJob: (data: JobRequest) =>
        api<Job>('/market/jobs/addjob', {   
            method: 'POST',
            body: data
        }),

    getMyJobs: () =>
        api<{ success: boolean; jobs: Job[] }>('/market/jobs/my-jobs'),

    getAllJobs: () =>
        api<Job[]>('/market/jobs/getalljobs'),

    getJobById: (id: string) =>
        api<Job>(`/market/jobs/${id}`),

    deleteJob: (id: string) =>
        api<void>(`/market/jobs/${id}`, {
            method: 'DELETE'
        }),
};
// export const marketApi = {
//     getJobs: () => api<Job[]>('/market/jobs'),
//     getJob: (id: String) => api<Job[]>(`/market/jobs/${id}`),
//     createJob: (data: Omit<Job, 'id'>) => api<Job>('/market/jobs', { method: 'POST', body: data }),
//     health: () => api<HealthResponse>('/market/health'),
// };


export interface ProposalRequest {
    jobId: string;
    coverLetter: string;
    proposedBudget: number;
    deliveryDays: number;
}

export interface Proposal {
    id: string;
    jobId: string;
    freelancerId: string;
    message: string;
    price: number;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    createdAt: string;
    updatedAt: string;
}


export const proposalsApi = {
    createProposal: (jobId: string, data: ProposalRequest) =>
        api<Proposal>(`/market/proposals/${jobId}`, {
            method: 'POST',
            body: data
        }),

    getMyProposals: () =>
        api<{ success: boolean; proposals: (Proposal & { job: any })[] }>(
            `/market/proposals/my-proposals`
        ),

    getProposalsByJob: (jobId: string) =>
        api<{ success: boolean; proposals: Proposal[] }>(
            `/market/proposals/${jobId}`
        ),

    acceptProposal: (id: string) =>
        api<Proposal>(`/market/proposals/accept/${id}`, {
            method: 'PATCH'
        }),

    rejectProposal: (id: string) =>
        api<Proposal>(`/market/proposals/reject/${id}`, {
            method: 'PATCH'
        }),
};


export const userApi = {
  getUserById: (id: string) => api<{ success: boolean; user: User }>(`/auth/users/${id}`),
  getAllFreelancers: () => api<{ success: boolean; freelancers: User[] }>('/auth/freelancers'),
   getAllClients: () => api<{ success: boolean; clients: User[] }>('/auth/clients'),
 
setupProfile: (data) =>
  api('/auth/setup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data,
  }),
};

export const paymentsApi = {
  getById: (id: string) =>
    api<{ success: boolean; payment: any }>(`/market/jobs/payments/${id}`),

  create: (proposalId: string) =>
    api<{ success: boolean; payment: any }>(
      `/payments/create/${proposalId}`,
      {
        method: "POST",
      }
    ),

  pay: (id: string) =>
    api<{ success: boolean; payment: any }>(
      `/market/jobs/payments/${id}/pay`,
      {
        method: "POST",
      }
    ),
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

export interface UserProfile {
    id: string;
    username: string;
    firstname?: string;
    lastname?: string;
    avatar: string;
    isOnline: boolean;
    type: 'CLIENT' | 'FREELANCER';
    bio?: string | null;
    location?: string | null;
    website?: string | null;
    createdAt: string;
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

	addMember: (convers_id: number, user_id: string) =>
		api<{
            user_id: string;
            user: {
                username: string;
                avatar: string;
                isOnline: boolean
            }}>(
			`/chat/convers/${convers_id}/members`,
			{ method: 'POST', body: { user_id } },
		),
	// ---------------------- Health ----------------------
	health: () => api<HealthResponse>('/chat/health'),
    
	// ---------------------- Users ----------------------
    getUser: (username: string) => api<UserProfile>(`/chat/users/${username}`),
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

    listIncoming: () => api<FriendRequest[]>('/friend/requests/incoming'),
    listOutgoing: () => api<FriendRequest[]>('/friend/requests/outgoing'),
    listFriends: () => api<Friend[]>('/friend/requests/friends'),

    removeFriend: (friend_id: string) => api<void>('/friend/requests/friends', {
            method: 'DELETE',
            body: {friend_id},
        })
}

export interface ChatNotif {
    id: number;
    user_id: string;
    type: 'MESSAGE' | 'FRIEND_REQ' | 'SYSTEM';
    title: string;
    body: string | null;
    is_read: boolean;
    created_at: string;
}

export const notifApi = {
    list: (): Promise<ChatNotif[]> => api('/notifs'),
    markRead: (id: number): Promise<ChatNotif> =>
        api(`/notifs/${id}/read`, { method: 'PATCH' }),
    markAllRead: (): Promise<{ message: string }> =>
        api('/notifs/read-all', { method: 'PATCH' }),
};

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

export interface Review {
  id:         string;
  rating:     number;
  coment:     string;
  fromUserId: string;
  toUserId:   string;
  jobId:      string;
  job:        { title: string; category: string; status: string };
  fromUser?:  { username: string; avatar?: string | null; firstname?: string | null; lastname?: string | null };
  createdAt:  string;
}

export const reviewsApi = {
  getForUser: (userId: string, opts?: { closedOnly?: boolean }) =>
      api<{ success: boolean; reviews: Review[] }>(
        `/market/jobs/reviews/user/${userId}${opts?.closedOnly ? "?closedOnly=true" : ""}`
      ),
};
