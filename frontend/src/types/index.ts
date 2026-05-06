import { User } from "@/lib/api";

export type Role = 'ADMIN' | 'MODERATOR' | 'USER';

/* export interface AdminUser extends User {
  // id: string;
  // name: string;
  // email: string;
	firstname: string;
	lastname: string;
  role: Role;
  avatar?: string;
  createdAt: string;
  status: 'active' | 'suspended' | 'pending';
}
 */
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
  description: string;
  budget: number;
  budgetType: 'fixed' | 'hourly';
  category: JobCategory;
  status: JobStatus;
  createdAt: string;
  proposals: number;
  skills: string[];
  deadline?: string;
  postedByName: string;
  // postedByAvatar: string;
	createdBy: User;
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
