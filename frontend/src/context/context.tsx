import { createContext, useState } from "react";
import type { ReactNode } from "react";
type SkillsState = {
  [key: string]: string[];
};

type RangeRate = {
  Min: number;
  Max: number;
};

type Freelancer = any; // tu peux remplacer par ton type Freelancer si tu veux

type ContextType = {
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

// Création du contexte
export const context = createContext<ContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

const ContextProvider = ({ children }: Props) => {
  const [skills, setSkills] = useState<SkillsState>({});
  const [categorie, setCategorie] = useState<string[]>([]);
  const [rangeRate, setRangeRate] = useState<RangeRate>({
    Min: 0,
    Max: 0,
  });
  const [expLevel, setExpLevel] = useState<string>("");
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);

  const allSkills = Object.values(skills).flat();
  const AllCategories = Object.keys(skills).flat();

  const value: ContextType = {
    categorie,
    setCategorie,
    rangeRate,
    setRangeRate,
    expLevel,
    setExpLevel,
    freelancers,
    setFreelancers,
    skills,
    setSkills,
    allSkills,
    AllCategories,
  };

  return (
    <context.Provider value={value}>
      {children}
    </context.Provider>
  );
};

export default ContextProvider;