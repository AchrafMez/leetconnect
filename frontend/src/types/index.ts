export type Role = 'admin' | 'moderator' | 'user' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;
  status: 'active' | 'suspended' | 'pending';
}

export type JobStatus = 'active' | 'closed' | 'flagged';
export type JobCategory =
  | 'Frontend Dev'
  | 'Backend Dev'
  | 'Full Stack'
  | 'Mobile Dev'
  | 'UI/UX Design'
  | 'DevOps'
  | 'Data Science'
  | 'QA & Testing'
  | 'Content Writing'
  | 'Marketing';

export interface Job {
  id: string;
  title: string;
  category: JobCategory;
  budget: number;
  budgetType: 'fixed' | 'hourly';
  status: JobStatus;
  proposalCount: number;
  postedBy: string;
  postedByName: string;
  postedByAvatar: string;
  createdAt: string;
  deadline?: string;
  description: string;
  skills: string[];
}

export interface RoleDefinition {
  id: string;
  name: Role;
  label: string;
  description: string;
  permissions: Permission[];
  color: string;
  userCount: number;
}

export type Permission =
  | 'users:read'
  | 'users:create'
  | 'users:edit'
  | 'users:delete'
  | 'roles:read'
  | 'roles:create'
  | 'roles:edit'
  | 'roles:delete'
  | 'content:read'
  | 'content:create'
  | 'content:edit'
  | 'content:delete'
  | 'content:moderate'
  | 'jobs:read'
  | 'jobs:delete'
  | 'jobs:moderate';

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: Role | Role[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
  canAccess: (minRole: Role) => boolean;
}