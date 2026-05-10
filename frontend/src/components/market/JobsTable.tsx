import React from "react";

type Job = {
  title: string;
  posted: string;
  proposals: number;
  status: "Active" | "Closed" | "Pending";
};

type Props = {
  jobs?: Job[];
};

const JobsTable: React.FC<Props> = ({ jobs = [] }) => {
  return (
    <div className="bg-[#121212] border border-gray-800 rounded-lg p-6">

      <h2 className="text-white mb-6">Recent Job Postings</h2>

      <table className="w-full text-gray-400">

        <thead className="text-left text-sm">
          <tr>
            <th>JOB TITLE</th>
            <th>POSTED</th>
            <th>PROPOSALS</th>
            <th>STATUS</th>
          </tr>
        </thead>

        <tbody className="text-white">

          {jobs.length === 0 ? (
            <tr className="border-t border-gray-800">
              <td className="py-4" colSpan={4}>
                No jobs available
              </td>
            </tr>
          ) : (
            jobs.map((job, index) => (
              <tr key={index} className="border-t border-gray-800">

                <td className="py-4">{job.title}</td>

                <td>{job.posted}</td>

                <td>{job.proposals} proposals</td>

                <td>
                  <span
                    className={`px-2 py-1 rounded ${
                      job.status === "Active"
                        ? "bg-green-900 text-green-400"
                        : job.status === "Closed"
                        ? "bg-red-900 text-red-400"
                        : "bg-yellow-900 text-yellow-400"
                    }`}
                  >
                    {job.status}
                  </span>
                </td>

              </tr>
            ))
          )}

        </tbody>

      </table>

    </div>
  );
};

export default JobsTable;