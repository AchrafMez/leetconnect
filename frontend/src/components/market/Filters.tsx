import React, { useContext, useState } from "react";
import { X } from "lucide-react";
import { categoriesData } from "../../assets/assets";
import { context } from "../../context/context";
import { freelencer } from "../../assets/assets";
import { useAuth } from "@/context/userContext";

type FilterModalProps = {
  showFilter: boolean;
  setShowFilter: React.Dispatch<React.SetStateAction<boolean>>;
};

type RangeRate = {
  Min: number;
  Max: number;
};

type SkillsState = {
  [key: string]: string[];
};

type Freelancer = {
  id: string;
  price: number;
  name: string;
  title: string;
  categorie?: string;
  expLevel: string;
  skills: string[];
};

const FilterModal = ({ showFilter, setShowFilter }: FilterModalProps) => {
  const [isCategorie, setisCategorie] = useState<string>("All");
  const [skills, setSkills] = useState<SkillsState>({});
  const [categorie, setCategorie] = useState<string[]>([]);
  const [expLevel, setExpLevel] = useState<string>("");
  const [rangeRate, setRangeRate] = useState<RangeRate>({
    Min: 0,
    Max: 0,
  });

  const { setFreelancers, allSkills , freelancers} = useAuth();

  const ClearFilter = () => {
    setSkills({});
    setisCategorie("All");
    setCategorie([]);
    setRangeRate({ Min: 0, Max: 0 });
    setExpLevel("");
  };

  const ApplyFilter = () => {
    if (rangeRate.Min > rangeRate.Max) {
      alert("le Max de RangeRate doit etre plus grand que le Min");
      return;
    }

    let filterFreelancer: Freelancer[] = [...freelancers];

    if (rangeRate.Min && rangeRate.Max) {
      filterFreelancer = filterFreelancer.filter(
        (item) =>
          item.price >= rangeRate.Min && item.price <= rangeRate.Max
      );
    }

    if (expLevel) {
      filterFreelancer = filterFreelancer.filter(
        (item) => item.expLevel === expLevel
      );
    }

    if (categorie.length > 0) {
      filterFreelancer = filterFreelancer.filter((item) =>
        categorie.includes(item.categorie!)
      );

      filterFreelancer = filterFreelancer.filter((item) =>
        item.skills.some((skill) => allSkills.includes(skill))
      );
    }

    setFreelancers(filterFreelancer);
    setShowFilter(false);
  };

  const removeCaterorie = (item: string) => {
    setisCategorie(item);

    setCategorie((prev) => {
      if (prev.includes(item) && item === isCategorie) {
        addOrRemoveSkill(null as any, item);
        return prev.filter((elem) => elem !== item);
      } else if (prev.includes(item)) {
        return prev;
      } else {
        return [...prev, item];
      }
    });
  };

  const addOrRemoveSkill = (skill: string | null, categorie: string) => {
    setSkills((prev) => {
      if (Object.keys(prev).includes(categorie) && !skill) {
        const update = { ...prev };
        delete update[categorie];
        return update;
      } else {
        if (skill && prev[categorie]) {
          if (prev[categorie].includes(skill)) {
            const update = {
              ...prev,
              [categorie]: prev[categorie].filter((item) => item !== skill),
            };
            if (update[categorie]?.length === 0) {
              delete update[categorie];
            }
            return update;
          } else {
            return {
              ...prev,
              [categorie]: [...prev[categorie], skill],
            };
          }
        } else {
          if (!skill) {
            return { ...prev, [categorie]: [] };
          }

          return {
            ...prev,
            [categorie]: [skill],
          };
        }
      }
    });
  };

  const categories: string[] = Object.keys(categoriesData);

  if (!showFilter) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
      <div className="bg-[#111] text-white w-[500px] rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Filters</h2>
          <X
            className="cursor-pointer text-gray-400 hover:text-white"
            onClick={() => setShowFilter(false)}
          />
        </div>

    
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-3">CATEGORIES</p>

          <div className="flex flex-wrap gap-2">
            {categories.map((item, index) => (
              <button
                key={index}
                onClick={() => removeCaterorie(item)}
                className={`px-3 py-1 rounded-full border text-sm cursor-pointer
                ${
                  categorie.includes(item)
                    ? "bg-[#69B34C] text-black border-[#69B34C]"
                    : "border-gray-600 text-gray-300"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-3">SKILLS</p>

          <div className="flex flex-wrap gap-2">
            {categorie.includes(isCategorie) &&
              categoriesData[isCategorie]?.map((item: string, index: number) => (
                <button
                  key={index}
                  onClick={() => addOrRemoveSkill(item, isCategorie)}
                  className={`px-3 py-1 rounded-full border text-sm
                  ${
                    skills[isCategorie]?.includes(item)
                      ? "bg-[#69B34C] text-black border-[#69B34C]"
                      : "border-gray-600 text-gray-300"
                  }`}
                >
                  {item}
                </button>
              ))}
          </div>
        </div>

        
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-3">HOURLY RATE ($)</p>

          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Min"
              className="bg-[#1A1A1A] border border-gray-700 rounded-lg px-3 py-2 w-full"
              onChange={(e) =>
                setRangeRate((prev) => ({
                  ...prev,
                  Min: Number(e.target.value),
                }))
              }
            />

            <input
              type="number"
              placeholder="Max"
              className="bg-[#1A1A1A] border border-gray-700 rounded-lg px-3 py-2 w-full"
              onChange={(e) =>
                setRangeRate((prev) => ({
                  ...prev,
                  Max: Number(e.target.value),
                }))
              }
            />
          </div>
        </div>

       
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-3">EXPERIENCE LEVEL</p>

          <div className="flex gap-2">
            {["Junior", "Mid", "Sunior"].map((level) => (
              <button
                key={level}
                className={`flex-1 border rounded-lg py-2 ${
                  expLevel === level
                    ? "border-[#69B34C] text-[#69B34C]"
                    : "border-gray-600"
                }`}
                onClick={() =>
                  setExpLevel(expLevel === level ? "" : level)
                }
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            className="flex-1 border border-gray-600 rounded-lg py-2"
            onClick={ClearFilter}
          >
            Clear
          </button>

          <button
            className="flex-1 bg-[#69B34C] text-black rounded-lg py-2 font-semibold"
            onClick={ApplyFilter}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;