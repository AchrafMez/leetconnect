import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { api, setAccessToken, userApi, type User } from '../lib/api';

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

  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;

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
        const userData = await api<User>('/auth/me');
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: any) => {
    const res = await api<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: data
    });
    setAccessToken(res.accessToken);
    setUser(res.user);
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
    setAccessToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    jobs,
    login,
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;