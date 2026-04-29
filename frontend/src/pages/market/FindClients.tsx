import React, { useMemo, useState , useEffect} from "react";
import { Search, Sliders } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/userContext";


import NumberCarousel from "@/components/market/NumberCarousel";
import FilterModal from "@/components/market/Filters";
import { proposalsApi, userApi } from "@/lib/api";


type Job = {
  id: string | number;
  title: string;
  description: string;
  budget: number;
  category: string;
  skills: string[];
  client: {
    name: string;
    rating: number;
  };
  createdAt: string;
};

const FindClients: React.FC = () => {
  const [numberPages, setNumberPages] = useState<number>(0);
  const [currentPages, setcurrentPages] = useState<number>(1);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  // const [enriched, setEnriched] = useState<any[]>([]);



    const { jobs , enriched} = useAuth();
    if (!jobs) {
      return <div>Loading...</div>; // ou erreur claire
  }

    const [showApply, setShowApply] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<string>("");

    const [coverLetter, setCoverLetter] = useState("");
    const [proposedBudget, setProposedBudget] = useState("");
    const [deliveryDays, setDeliveryDays] = useState("");


    const handleApplyClick = (jobId: string ) => {
      setSelectedJobId(jobId);
      setShowApply(true);
    };
  


  const jobsRange = useMemo(() => {
    let filtered = enriched;

    if (search) {
      filtered = enriched.filter((job) =>
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.skills.some((s) =>
          s.toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    const start = (currentPages - 1) * 6;
    const end = start + 6;

    const pages = Math.ceil(filtered?.length / 6);

    return {
      data: filtered.slice(start, end),
      pages,
    };
  }, [enriched, currentPages, search]);

  const handleSubmitProposal = async () => {
  
    try {
      await proposalsApi.createProposal(selectedJobId,
        
        {
          jobId: selectedJobId,
          coverLetter,
          proposedBudget: Number(proposedBudget),
          deliveryDays: Number(deliveryDays),
        }
       
      );

      setShowApply(false);
      setCoverLetter("");
      setProposedBudget("");
      setDeliveryDays("");

      alert("Proposal sent ✅");

    } catch (error) {
      console.error(error);
      alert("Error sending proposal ❌");
    }
  };

  React.useEffect(() => {
    setNumberPages(jobsRange.pages);
  }, [jobsRange.pages]);

  return (
    <div className="bg-black text-white w-full min-h-screen px-10 py-10 flex flex-col gap-8">

      <h1 className="text-4xl font-semibold">
        Find Jobs
      </h1>

     
      <div className="flex items-center gap-4">

        <div className="flex items-center gap-3 bg-[#111] px-4 py-3 rounded-xl flex-1">
          <Search size={18} className="text-gray-400" />

          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none w-full text-gray-300"
          />
        </div>

        <button
          className="flex items-center gap-2 bg-[#111] px-4 py-3 rounded-xl"
          onClick={() => setShowFilter(true)}
        >
          <Sliders size={18} className="text-[#69B34C]" />
          Filter
        </button>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {enriched.map((job) => (
          <div
            key={job.id}
            className="bg-[#111] p-5 rounded-xl border border-gray-800 hover:border-[#69B34C]"
          >
            <h2 className="text-lg font-semibold">{job.title}</h2>

            <p className="text-sm text-gray-400 mt-2">
              {job.description}
            </p>

            <div className="flex gap-2 mt-3 flex-wrap">
              {job.skills.map((skill, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 bg-[#132112] text-[#69B34C] rounded"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex justify-between mt-4 text-sm text-gray-400">
              <span>{job.client.username}</span>
              <span>⭐ {job.client.rating}</span>
            </div>

            <div className="flex justify-between mt-3">
              <span className="text-[#69B34C] font-semibold">
                ${job.budget}
              </span>

              <button
                onClick={() => handleApplyClick(job.id)}
                className="bg-[#69B34C] text-black px-3 py-1 rounded text-sm"
              >
                Apply
              </button>
            </div>
          </div>
        ))}

      </div>

      <div className="flex justify-center mt-6">
        <NumberCarousel
          currentPages={currentPages}
          setcurrentPages={setcurrentPages}
          numberPages={numberPages}
        />
      </div>

 
      {showFilter && (
        <FilterModal
          showFilter={showFilter}
          setShowFilter={setShowFilter}
        />
      )}


      {showApply && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="bg-[#111] p-6 rounded-xl w-[400px] flex flex-col gap-4">

            <h2 className="text-lg font-semibold">Apply to this job</h2>

            <textarea
              placeholder="Cover Letter..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="bg-black border border-gray-700 p-2 rounded"
            />

            <input
              type="number"
              placeholder="Your Budget"
              value={proposedBudget}
              onChange={(e) => setProposedBudget(e.target.value)}
              className="bg-black border border-gray-700 p-2 rounded"
            />

            <input
              type="number"
              placeholder="Delivery Days"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
              className="bg-black border border-gray-700 p-2 rounded"
            />

            <div className="flex justify-between mt-2">
              <button
                onClick={() => setShowApply(false)}
                className="bg-gray-700 px-3 py-1 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmitProposal}
                className="bg-[#69B34C] text-black px-3 py-1 rounded"
              >
                Send
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default FindClients;