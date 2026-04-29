import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { jobsApi, proposalsApi, userApi } from "@/lib/api";
import { useAuth } from "@/context/userContext";

type Proposal = {
  id: string;
  freelancer: {
    name?: string;
    username?: string;
  };
  price: number;
  message: string;
  createdAt: string;
  status?: "PENDING" | "ACCEPTED" | "REJECTED";
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

const JobDetails: React.FC = () => {
  const { id } = useParams();
  const { enriched } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  if (!enriched) {
    return <div>Loading...</div>;
  }

 
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);

        const { job } = await jobsApi.getJobById(id);
        const { user: client } = await userApi.getUserById(job.clientId);
        const users = await userApi.getAllClients();

        const freelancersMap = Object.fromEntries(
          users.freelancers.map((u: any) => [u.id, u])
        );

        const enrichedProposals = (job.proposals || []).map((p: any) => ({
          ...p,
          freelancer: freelancersMap[p.freelancerId] || null,
          status: p.status || "PENDING",
        }));

        setJob({
          ...job,
          client,
          proposals: enrichedProposals,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  
  const acceptJob = async (proposalId: string) => {
    try {
      await proposalsApi.acceptProposal(proposalId);

      setJob((prev) =>
        prev
          ? {
              ...prev,
              proposals: prev.proposals.map((p) =>
                p.id === proposalId
                  ? { ...p, status: "ACCEPTED" }
                  : p
              ),
            }
          : prev
      );
    } catch (err) {
      console.error(err);
    }
  };

 
  const rejectJob = async (proposalId: string) => {
    try {
      await proposalsApi.rejectProposal(proposalId);

      setJob((prev) =>
        prev
          ? {
              ...prev,
              proposals: prev.proposals.map((p) =>
                p.id === proposalId
                  ? { ...p, status: "REJECTED" }
                  : p
              ),
            }
          : prev
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <p className="text-white p-6">Loading...</p>;
  }

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
                    {p.freelancer?.username ||
                      p.freelancer?.name ||
                      "Unknown"}
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

                {/* ACTIONS */}
                {p.status === "PENDING" ? (
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => acceptJob(p.id)}
                      className="bg-green-500 text-black px-3 py-1 rounded text-sm"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => rejectJob(p.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <button
                    className={
                      p.status === "ACCEPTED"
                        ? "bg-green-500 text-black px-3 py-1 rounded text-sm mt-3"
                        : "bg-red-500 text-white px-3 py-1 rounded text-sm mt-3"
                    }
                  >
                    {p.status}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;