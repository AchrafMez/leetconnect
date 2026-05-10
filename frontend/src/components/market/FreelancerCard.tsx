import React from "react";
import { Star } from "lucide-react";

type Freelancer = {
  name: string;
  username?: string;
  title: string;
  rate: number;
  avatar: string;
  skills: string[];
  category: string[];
  rating?: number;
};

type Props = {
  freelancer: Freelancer;
};

const FreelancerCard: React.FC<Props> = ({ freelancer }) => {
  const visibleSkills = freelancer.skills.slice(0, 6);
  const remaining = freelancer.skills.length - visibleSkills.length;

  return (
    <div className="bg-[#111] rounded-xl p-6 hover:bg-[#151515] transition-all">

      {/* HEADER */}
      <div className="flex justify-between mb-4">

        <div className="flex gap-3">
          {freelancer.avatar ? (
  <img
    src={freelancer.avatar}
    alt={freelancer.name}
    className="w-12 h-12 rounded-full object-cover"
  />
) : (
  <div className="w-12 h-12 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white font-bold">
    {freelancer.username?.charAt(0).toUpperCase()}
  </div>
)}

          <div>
            <h2 className="font-semibold text-white">
              {freelancer.username || freelancer.name}
            </h2>

            <p className="text-sm text-[#CBD5E1]">
              {freelancer.title}
            </p>

            {/* CATEGORIES */}
            <p className="text-xs text-gray-400 mt-1">
              {freelancer.category?.join(" && ")}
            </p>
          </div>
        </div>

        {/* RATE */}
        <div className="text-right">
          <div className="text-lg text-[#69B34C] font-bold">
            {freelancer.rate}$
          </div>

          <p className="text-xs text-gray-500">PER HOUR</p>
        </div>
      </div>

      {/* RATING */}
      <div className="flex items-center gap-1 mb-3">
        {new Array(5).fill(0).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={
              i < (freelancer.rating || 5)
                ? "text-[#69B34C]"
                : "text-gray-600"
            }
          />
        ))}

        <span className="text-xs text-gray-400 ml-2">
          {(freelancer.rating || 5).toFixed(1)} (reviews)
        </span>
      </div>

      {/* SKILLS */}
      <div className="flex flex-wrap gap-2 mb-4">
        {visibleSkills.map((skill, index) => (
          <span
            key={index}
            className="text-xs bg-[#1A1A1A] text-gray-400 px-2 py-1 rounded"
          >
            {skill}
          </span>
        ))}

        {remaining > 0 && (
          <span className="text-xs text-gray-500">
            +{remaining} more
          </span>
        )}
      </div>

      {/* BUTTON */}
      <button className="w-full bg-[#1A1A1A] py-2 rounded-lg text-sm hover:bg-[#222] transition">
        View Profile
      </button>
    </div>
  );
};

export default FreelancerCard;