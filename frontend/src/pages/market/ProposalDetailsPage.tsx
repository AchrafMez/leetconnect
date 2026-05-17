import { proposalsApi } from "@/lib/api";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type Proposal = {
  id: string;
  coverLetter: string;
  proposedBudget: number;
  deliveryDays: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";

  job: {
    id: string;
    title: string;
    description: string;
    budget: number;
    status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CLOSED";
  };

  payment?: {
    amount: number;
    status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  };
};

const ProposalDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProposal();
  }, [id]);

  const fetchProposal = async () => {
    try {
      setLoading(true);
      const res = await proposalsApi.getProposalById(id)

     console.log('resulta//', res)

      setProposal(res.proposal);

    } catch (error) {
    //   console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-white p-10">
        Loading...
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-white p-10">
        Proposal not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">

      {/* Header */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          {proposal.job.title}
        </h1>

        <p className="text-zinc-400 mt-2">
          Proposal details
        </p>

      </div>

      {/* Job Info */}

      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 mb-6">

        <h2 className="text-xl font-semibold mb-3">
          Job Description
        </h2>

        <p className="text-zinc-400">
          {proposal.job.description}
        </p>

        <div className="mt-4 flex gap-6">

          <p>
            <span className="text-zinc-500">Budget:</span>{" "}
            ${proposal.job.budget}
          </p>

          <p>
            <span className="text-zinc-500">Status:</span>{" "}
            {proposal.job.status}
          </p>

        </div>

      </div>

      {/* Proposal Info */}

      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 mb-6">

        <h2 className="text-xl font-semibold mb-3">
          Your Proposal
        </h2>

        <p className="text-zinc-400 mb-4">
          {proposal.coverLetter}
        </p>

        <div className="grid grid-cols-3 gap-4">

          <div>
            <p className="text-zinc-500">Proposed Budget</p>
            <p className="text-white font-semibold">
              ${proposal.proposedBudget}
            </p>
          </div>

          <div>
            <p className="text-zinc-500">Delivery Time</p>
            <p className="text-white font-semibold">
              {proposal.deliveryDays} days
            </p>
          </div>

          <div>
            <p className="text-zinc-500">Status</p>

            <span
              className={`px-3 py-1 rounded-full text-sm ${
                proposal.status === "ACCEPTED"
                  ? "bg-green-900/40 text-green-400"
                  : proposal.status === "REJECTED"
                  ? "bg-red-900/40 text-red-400"
                  : "bg-yellow-900/40 text-yellow-400"
              }`}
            >
              {proposal.status}
            </span>

          </div>

        </div>

      </div>

      {/* Payment */}

      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">

        <h2 className="text-xl font-semibold mb-3">
          Payment
        </h2>

        {proposal.payment ? (

          <div className="flex justify-between">

            <p>
              Amount: ${proposal.payment.amount}
            </p>

            <span
              className={`px-3 py-1 rounded-full text-sm ${
                proposal.payment.status === "PAID"
                  ? "bg-green-900/40 text-green-400"
                  : proposal.payment.status === "FAILED"
                  ? "bg-red-900/40 text-red-400"
                  : "bg-yellow-900/40 text-yellow-400"
              }`}
            >
              {proposal.payment.status}
            </span>

          </div>

        ) : (

          <p className="text-zinc-500">
            No payment yet
          </p>

        )}

      </div>

    </div>
  );
};

export default ProposalDetailsPage;