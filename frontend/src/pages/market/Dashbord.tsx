import React from "react";
import { useNavigate } from "react-router-dom";

type Job = {
  id: string;
  title: string;
  category: string;
  budget: number;
  description: string;
  skills: string[];
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  clientId: string;
  proposals: any[];
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
    proposals: [{}, {}, {}],
    createdAt: "2026-04-20T10:00:00Z",
    updatedAt: "2026-04-20T10:00:00Z",
  },
  {
    id: "2",
    title: "UX/UI Designer",
    category: "UI/UX Design",
    budget: 1800,
    description: "Design modern UI for SaaS platform.",
    skills: ["Figma", "Wireframing"],
    status: "OPEN",
    clientId: "client_1",
    proposals: [{}, {}],
    createdAt: "2026-04-19T14:30:00Z",
    updatedAt: "2026-04-19T14:30:00Z",
  },
  {
    id: "3",
    title: "Python Backend Architect",
    category: "Web Development",
    budget: 3200,
    description: "Build scalable APIs with Django.",
    skills: ["Python", "Django", "REST API"],
    status: "IN_PROGRESS",
    clientId: "client_2",
    proposals: [],
    createdAt: "2026-04-18T09:15:00Z",
    updatedAt: "2026-04-21T12:00:00Z",
  },
  {
    id: "4",
    title: "Mobile App Developer",
    category: "Mobile Apps",
    budget: 4000,
    description: "Develop cross-platform mobile app.",
    skills: ["Flutter", "Firebase"],
    status: "CLOSED",
    clientId: "client_3",
    proposals: [{}, {}, {}, {}],
    createdAt: "2026-04-15T08:00:00Z",
    updatedAt: "2026-04-22T16:00:00Z",
  },
];

type JobRow = {
  id: string;
  title: string;
  category: string;
  posted: string;
  proposals: number;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
};

export const formatJobs = (jobs: Job[]): JobRow[] => {
  return jobs.map((job) => ({
    id: job.id,
    title: job.title,
    category: job.category,
    posted: new Date(job.createdAt).toLocaleString(),
    proposals: job.proposals?.length || 0,
    status: job.status,
  }));
};

const Dashboard: React.FC = () => {
  const jobs = formatJobs(jobsData);
  const navigate = useNavigate()

  //   const [jobs, setJobs] = useState([]);

  // const fetchJobs = async () => {
  //   try {
  //     const res = await axios.get(
  //       "http://localhost:5000/api/jobs/my-jobs",
  //       {
  //         withCredentials: true,
  //       }
  //     );

  //     setJobs(res.data.jobs);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  // useEffect(() => {
  //   fetchJobs();
  // }, []);

  return (
    <div className="min-h-screen w-full bg-black text-white p-6">

      {/* Top Bar */}
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

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, Alex!</h1>
        <p className="text-gray-400 text-sm mt-1">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-4 gap-4 mt-6">

        <div className="bg-[#111] border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Active Jobs</p>
          <h2 className="text-xl font-semibold mt-2">4</h2>
          <span className="text-green-400 text-sm">↑ 1</span>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm">New Proposals</p>
          <h2 className="text-xl font-semibold mt-2">12</h2>
          <span className="text-gray-400 text-sm">from 8 candidates</span>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Total Hires</p>
          <h2 className="text-xl font-semibold mt-2">24</h2>
          <span className="text-green-400 text-sm">+3 this month</span>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Total Spend</p>
          <h2 className="text-xl font-semibold mt-2">$45.2k</h2>
        </div>

      </div>

      {/* Table */}
      <div className="bg-[#111] border border-gray-800 rounded-xl mt-8">

        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="font-medium">Recent Job Postings</h2>
          <span className="text-green-400 text-sm cursor-pointer">
            View all
          </span>
        </div>

        <div className="grid grid-cols-4 p-4 text-gray-400 text-sm border-b border-gray-800">
          <span>Job Title</span>
          <span>Posted</span>
          <span>Proposals</span>
          <span>Status</span>
        </div>

        {jobs.map((job) => (
          <div onClick={() => navigate(`/jobs/${job.id}`)}
            key={job.id}
            className="grid grid-cols-4 p-4 items-center border-b border-gray-800"
          >
            {/* Title */}
            <div>
              <p className="font-medium">{job.title}</p>
              <p className="text-gray-400 text-sm">{job.category}</p>
            </div>

            {/* Posted */}
            <span className="text-sm text-gray-400">{job.posted}</span>

            {/* Proposals */}
            {job.proposals > 0 ? (
              <div className="flex -space-x-2">
                {Array.from({ length: job.proposals }).map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-gray-400 rounded-full border border-black"
                  />
                ))}
              </div>
            ) : (
              <span className="text-gray-400 text-sm">
                No proposals yet
              </span>
            )}

            {/* Status */}
            <span
              className={`px-3 py-1 rounded-full text-xs w-fit ${
                job.status === "OPEN"
                  ? "bg-green-900 text-green-400"
                  : job.status === "IN_PROGRESS"
                  ? "bg-yellow-900 text-yellow-400"
                  : "bg-red-900 text-red-400"
              }`}
            >
              {job.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;