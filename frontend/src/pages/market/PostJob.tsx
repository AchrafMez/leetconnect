import React, { useState } from "react";
import axios from "axios";
import { Plus } from "lucide-react";
import {categoriesData} from "../../assets/assets"

const PostJob = () => {
  const [job, setJob] = useState({
    title: "",
    category: "",
    budget: "",
    description: "",
    skills: [] as string[],
  });

  const [skillInput, setSkillInput] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (skillInput.trim()) {
        setJob({...job,skills: [...job.skills, skillInput.trim()]});
        setSkillInput("");
      }
    }
  };

  const removeSkill = (skill: string) => {
    setJob({...job, skills: job.skills.filter((s) => s !== skill)});
  };

const handleSubmit = async () => {
  if (!job.title.trim() || !job.category.trim() || !job.description.trim() || job.budget === "" || !Array.isArray(job.skills) ||
  job.skills.length === 0) {
      alert("Please fill all fields and add at least one skill");
      return;
  }
  try {
    console.log(job);
    await axios.post("http://localhost:5000/api/jobs/addjob",job,
      {
        withCredentials: true,
      }
    );

    alert("Job posted successfully");

    setJob({title: "",category: "", budget: "", description: "", skills: []});

  } catch (err: any) {
    console.error(err.response?.data || err.message);
  }
};

  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* MAIN */}
      <div className="flex-1 p-10">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Post a New Job</h1>
          <p className="text-gray-400">
            Fill in the details below to find the perfect freelancer for your next project.
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-[#0c0c0c] border border-gray-800 rounded-2xl p-8 space-y-6">

          {/* TITLE */}
          <div>
            <label className="text-sm text-gray-400">Job Title</label>
            <input
              type="text"
              name="title"
              value={job.title}
              onChange={handleChange}
              placeholder="e.g. Senior React Developer"
              className="w-full mt-2 p-3 bg-black border border-gray-800 rounded-lg"
            />
          </div>

          {/* CATEGORY + BUDGET */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Category</label>
              <select
                name="category"
                value={job.category}
                onChange={handleChange}
                className="w-full mt-2 p-3 bg-black border border-gray-800 rounded-lg"
              >
                <option value="">Select category</option>

                {Object.keys(categoriesData).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400">
                Estimated Budget (USD)
              </label>
              <input
                type="number"
                name="budget"
                value={job.budget}
                onChange={handleChange}
                placeholder="$ 0.00"
                className="w-full mt-2 p-3 bg-black border border-gray-800 rounded-lg"
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-sm text-gray-400">Job Description</label>
            <textarea
              name="description"
              value={job.description}
              onChange={handleChange}
              placeholder="Describe the project..."
              rows={5}
              className="w-full mt-2 p-3 bg-black border border-gray-800 rounded-lg"
            />
          </div>

          {/* SKILLS */}
          <div>
            <label className="text-sm text-gray-400">Required Skills</label>

            <div className="flex flex-wrap gap-2 mt-3 mb-2">
              {job.skills.map((skill, index) => (
                <span
                  key={index}
                  onClick={() => removeSkill(skill)}
                  className="bg-green-600 px-3 py-1 rounded-full text-sm cursor-pointer"
                >
                  {skill} ✕
                </span>
              ))}
            </div>

            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={addSkill}
              placeholder="Add a skill..."
              className="w-full p-3 bg-black border border-gray-800 rounded-lg"
            />
          </div>

          {/* BUTTON */}
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-medium"
          >
            <Plus size={18} />
            Post Job Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostJob;