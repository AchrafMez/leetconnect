import React from "react";
import { Briefcase, MapPin, DollarSign } from "lucide-react";

type ClientJob = {
  id: string | number;
  title: string;
  client: {
    name: string;
    rating: number;
  };
  budget: number;
  location: string;
  skills: string[];
};

type Props = {
  jobs: ClientJob[];
};

const FindClients: React.FC<Props> = ({ jobs }) => {
  return (
    <div className="w-full flex flex-col gap-6">

      <h2 className="text-2xl font-semibold text-white">
        Find Clients & Projects
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-[#111] border border-gray-800 rounded-xl p-5"
          >

            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Briefcase size={18} />
              {job.title}
            </h3>

            <p className="text-gray-400 mt-2">
              Client: {job.client}
            </p>

            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <DollarSign size={14} />
                ${job.budget}
              </span>

              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {job.location}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {job.skills.map((skill, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded-full bg-green-900 text-green-300"
                >
                  {skill}
                </span>
              ))}
            </div>

          </div>
        ))}

      </div>
    </div>
  );
};

export default FindClients;