import React, { createContext, useContext, useState, useEffect} from 'react';
import { api, setAccessToken, userApi, type User } from '../lib/api';
import { authApi } from '../lib/api';
import { disconnectSocket } from '@/lib/socket';
import { canAccessMinRole, hasPermission as checkPermission } from '../lib/permissions';
import type { Role, Permission } from '../types';
import type { LoginRequest } from '../types/auth';


type SkillsState = {
  [key: string]: string[];
};

type RangeRate = {
  Min: number;
  Max: number;
};

type Freelancer = any;

type Client = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  rating?: number;
};

type Job = {
  id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  skills: string[];
  status: "OPEN" | "CLOSED" | string;
  proposals : Proposal[];
  clientId: string;

  client: Client | null;

  createdAt: string;
  updatedAt: string;
};


type Proposal = {
  id: string;
  freelancer: {
    name: string;
  };
  price: number;
  message: string;
  createdAt: string;
};

type Enriched = Job & {
  client: any; // idéalement tu mets un vrai type User
  proposals?: (Proposal & {
    freelancer: any;
  })[];
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  jobs: Job[];
  enriched: Enriched[];

  login: (data: any) => Promise<{ requires2FA: boolean; tempToken?: string }>;
  login2FA: (tempToken: string, code: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateUser: (user: User) => void;

  skills: SkillsState;
  setSkills: React.Dispatch<React.SetStateAction<SkillsState>>;

  categorie: string[];
  setCategorie: React.Dispatch<React.SetStateAction<string[]>>;

  rangeRate: RangeRate;
  setRangeRate: React.Dispatch<React.SetStateAction<RangeRate>>;

  expLevel: string;
  setExpLevel: React.Dispatch<React.SetStateAction<string>>;

  freelancers: Freelancer[];
  setFreelancers: React.Dispatch<React.SetStateAction<Freelancer[]>>;

  allSkills: string[];
  AllCategories: string[];

  hasRole: (role: Role | Role[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
  canAccess: (minRole: Role) => boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);

  const [skills, setSkills] = useState<SkillsState>({});
  const [categorie, setCategorie] = useState<string[]>([]);
  const [rangeRate, setRangeRate] = useState<RangeRate>({ Min: 0, Max: 0 });
  const [expLevel, setExpLevel] = useState<string>("");
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [enriched, setEnriched] = useState<any[]>([]);

  const allSkills = Object.values(skills).flat();
  const AllCategories = Object.keys(skills).flat();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await api<{ jobs: Job[] }>("/market/jobs/getalljobs");
        console.log(data)
        setJobs(data.jobs);
      } catch (error) {
        console.error("Erreur fetch jobs:", error);
        setJobs([]);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
  const enrichJobs = async () => {
    if (!jobs || jobs.length === 0) {
      setEnriched([]);
      return;
    }

    try {
    
      const users = await userApi.getAllClients();

      const clientsMap = Object.fromEntries(
        users.freelancers.map((u: any) => [u.id, u])
      );

      const freelancersMap = Object.fromEntries(
        users.freelancers.map((u: any) => [u.id, u])
      );

      const enrichedData = jobs.map(job => ({
        ...job,
        client: clientsMap[job.clientId] || null,

        proposals: job.proposals?.map((proposal: any) => ({
          ...proposal,
          freelancer: freelancersMap[proposal.freelancerId] || null,
        })) || [],
      }));

      setEnriched(enrichedData);

    } catch (error) {
      console.error("Erreur enrich jobs:", error);
    }
  };

  enrichJobs();
}, [jobs]);


  useEffect(() => {
    const initAuth = async () => {
      try {
        // Instead of /me, try to get a new token from the cookie immediately
        // This populates the _accessToken in api.ts RAM
        const refreshData = await authApi.refresh(); 
        setAccessToken(refreshData.accessToken);
        const userData = await api<User>('/auth/me');
        console.log(userData)
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginRequest): Promise<{ requires2FA: boolean; tempToken?: string;user?: User;}> => {
     const res = await api<{ 
      accessToken?: string;
      user?: User;
      requires2FA?: boolean;
      tempToken?: string;
    }>('/auth/login', { method: 'POST', body: data });

    // 2Fa required = dont set accesstoken or user yet
    if (res.requires2FA) {
      return { requires2FA: true, tempToken: res.tempToken as string };
    }

    // normal login
    setAccessToken(res.accessToken!);
    setUser(res.user!);

    return { requires2FA: false, user: res.user!};
  };

  const login2FA = async (tempToken: string, code: string): Promise<void> => {
    const res = await authApi.login2FA(tempToken, code);
    setAccessToken(res.accessToken);
    setUser(res.user!);
  };

  const register = async (data: any) => {
    const res = await api<{ accessToken: string; user: User }>('/auth/register', {
      method: 'POST',
      body: data
    });
    setAccessToken(res.accessToken);
    setUser(res.user);
  };

  const logout = async () => {
    await api('/auth/logout', { method: 'POST' });
    disconnectSocket();
    setAccessToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(prev => prev ? { ...prev, ...updatedUser } : updatedUser);
  };

  const hasRole = (role: Role | Role[]) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role as Role);
    }
    return user.role === role;
  };

  const hasPermission = (permission: Permission) => {
    if (!user) return false;
    return checkPermission(user.role as Role, permission);
  };

  const canAccess = (minRole: Role) => {
    if (!user) return false;
    return canAccessMinRole(user.role as Role, minRole);
  };

  const value: AuthContextType = {
    user,
    setUser,
    updateUser,
    loading,
    jobs,
    login,
    login2FA,
    register,
    logout,
    enriched,
    skills,
    setSkills,
    categorie,
    setCategorie,
    rangeRate,
    setRangeRate,
    expLevel,
    setExpLevel,
    freelancers,
    setFreelancers,
    allSkills,
    AllCategories,
    hasRole,
    hasPermission,
    canAccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;