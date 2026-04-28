import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jobsApi } from "@/lib/api";


type Job = {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  status?: "OPEN" | "IN_PROGRESS" | "CLOSED";
  proposals?: any[];
};



const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const res = await jobsApi.getMyJobs();

      setJobs(res.jobs || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);



  return (
    <div className="min-h-screen w-full bg-black text-white p-6">

      {/* TOP BAR */}
      <div className="flex justify-between items-center mb-8">
        <input
          type="text"
          placeholder="Search for talent, jobs, or messages..."
          className="bg-[#111] border border-gray-700 rounded-lg px-4 py-2 w-[400px] text-sm outline-none"
        />

        <button className="bg-green-500 hover:bg-green-600 text-black font-medium px-5 py-2 rounded-lg">
          Post a Job
        </button>
      </div>

      {/* TITLE */}
      <div>
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-gray-400 text-sm mt-1">
          Here's what's happening with your jobs today.
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-gray-400 mt-6">Loading jobs...</p>
      )}

      {/* TABLE */}
      <div className="bg-[#111] border border-gray-800 rounded-xl mt-8">

        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="font-medium">My Jobs</h2>
        </div>

        {/* HEADER */}
        <div className="grid grid-cols-4 p-4 text-gray-400 text-sm border-b border-gray-800">
          <span>Job Title</span>
          <span>Posted</span>
          <span>Proposals</span>
          <span>Status</span>
        </div>

        {/* DATA */}
        {jobs.length === 0 && !loading ? (
          <p className="p-4 text-gray-400">No jobs found</p>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="grid grid-cols-4 p-4 items-center border-b border-gray-800 cursor-pointer hover:bg-[#1a1a1a]"
            >

              {/* TITLE */}
              <div>
                <p className="font-medium">{job.title}</p>
                <p className="text-gray-400 text-sm">{job.category}</p>
              </div>

              {/* DATE */}
              <span className="text-sm text-gray-400">
                {new Date(job.createdAt).toLocaleString()}
              </span>

              {/* PROPOSALS */}
              {job.proposals && job.proposals.length > 0 ? (
                <div className="flex -space-x-2">
                  {job.proposals.map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 bg-gray-500 rounded-full border border-black"
                    />
                  ))}
                </div>
              ) : (
                <span className="text-gray-400 text-sm">
                  No proposals yet
                </span>
              )}

              {/* STATUS */}
              <span
                className={`px-3 py-1 rounded-full text-xs w-fit ${
                  job.status === "OPEN"
                    ? "bg-green-900 text-green-400"
                    : job.status === "IN_PROGRESS"
                    ? "bg-yellow-900 text-yellow-400"
                    : "bg-red-900 text-red-400"
                }`}
              >
                {job.status || "OPEN"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;