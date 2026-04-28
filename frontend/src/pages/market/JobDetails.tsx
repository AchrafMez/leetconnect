

import React, { useEffect, useState } from "react";

import { useParams } from "react-router-dom";
import axios from "axios";
import { jobsApi } from "@/lib/api";

type Proposal = {
  id: string;
  freelancer: {
    name: string;
  };
  price: number;
  message: string;
  createdAt: string;
};

type Job = {
  id: string;
  title: string;
  category: string;
  budget: number;
  description: string;
  skills: string[];
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  clientId: string;
  proposals: Proposal[];
  createdAt: string;
  updatedAt: string;
};

export const jobsData: Job[] = [
  {
    id: "1",
    title: "Senior React Developer",
    category: "Web Development",
    budget: 2500,
    description: "Build a scalable frontend app using React.",
    skills: ["React", "TypeScript", "Tailwind"],
    status: "OPEN",
    clientId: "client_1",
    proposals: [
      {
        id: "p1",
        freelancer: { name: "Alex" },
        price: 2400,
        message: "I can do this job fast",
        createdAt: "2026-04-20T10:00:00Z",
      },
    ],
    createdAt: "2026-04-20T10:00:00Z",
    updatedAt: "2026-04-20T10:00:00Z",
  },
];

const JobDetails: React.FC = () => {
  const { id } = useParams();
  const [state, setState] = useState("")
  const [job, setJob] = useState<Job | null>(null);
const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await jobsApi.getJobById(id)

        setJob(res.job);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

const acceptJob = async (id: string) => {
  // try {
  //   const { data } = await axios.post(
  //     `http://localhost:5000/api/proposal/accept/${id}`,
  //     {}, 
  //     { withCredentials: true }
  //   );

    // console.log("Accepted:", data);
    setState("Accept");
    
  // } catch (err) {
  //   console.error(err);
  // }
};

const rejectJob = async (id: string) => {
  // try {
  //   const { data } = await axios.post(
  //     `http://localhost:5000/api/proposal/reject/${id}`, 
  //     {},
  //     { withCredentials: true }
  //   );

    // console.log("Rejected:", data);
    setState(" Reject");
  // } catch (err) {
  //   console.error(err);
  // }
};

  // const job = jobsData.find((item) => item.id === id);

  if (!job) {
    return <p className="text-white p-6">Job not found</p>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* TITLE */}
      <h1 className="text-3xl font-bold">{job.title}</h1>
      <p className="text-gray-400 mt-1">{job.category}</p>

      {/* INFO */}
      <div className="mt-6">
        <p className="text-green-400 font-semibold">
          Budget: ${job.budget}
        </p>

        <p className="mt-4 text-gray-300">
          {job.description}
        </p>
      </div>

      {/* SKILLS */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Skills</h3>

        <div className="flex gap-2 flex-wrap">
          {job.skills.map((skill) => (
            <span
              key={skill}
              className="bg-gray-800 px-3 py-1 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* STATUS */}
      <div className="mt-6 text-sm text-gray-400">
        Status: {job.status}
      </div>

      {/* PROPOSALS */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">
          Proposals ({job.proposals.length})
        </h2>

        {job.proposals.length === 0 ? (
          <p className="text-gray-400">No proposals yet</p>
        ) : (
          <div className="space-y-4">
            {job.proposals.map((p) => (
              <div
                key={p.id}
                className="bg-[#111] border border-gray-800 rounded-xl p-4"
              >
                {/* HEADER */}
                <div className="flex justify-between items-center">
                  <p className="font-medium">
                    {p.freelancer.name}
                  </p>

                  <span className="text-green-400 font-semibold">
                    ${p.price}
                  </span>
                </div>

                {/* MESSAGE */}
                <p className="text-gray-300 mt-2 text-sm">
                  {p.message}
                </p>

                {/* DATE */}
                <p className="text-gray-500 text-xs mt-2">
                  {new Date(p.createdAt).toLocaleString()}
                </p>

             
               { !state ? <div className="flex gap-3 mt-3">
                  <button onClick={() => acceptJob(p.id) }
                  className="bg-green-500 text-black px-3 py-1 rounded text-sm">
                    Accept
                  </button>

                  <button  onClick={() => rejectJob(p.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                    Reject
                  </button>
                </div> :  <button className={ state === "Accept" ?  "bg-green-500 text-black px-3 py-1 rounded text-sm" :"bg-red-500 text-white px-3 py-1 rounded text-sm" }>
                    {state}
                  </button>}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default JobDetails;