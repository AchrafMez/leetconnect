import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, X, Loader2, ChevronDown, Check } from "lucide-react";
import { categoriesData } from "@/assets/assets";

const categories = Object.keys(categoriesData);

const PostJob = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [job, setJob] = useState({
    title: "",
    category: "",
    budget: "",
    description: "",
    skills: [] as string[],
  });

  const [skillInput, setSkillInput] = useState("");

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const selectCategory = (cat: string) => {
    setJob({ ...job, category: cat });
    setDropdownOpen(false);
  };

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (skillInput.trim() && !job.skills.includes(skillInput.trim())) {
        setJob({ ...job, skills: [...job.skills, skillInput.trim()] });
        setSkillInput("");
      }
    }
  };

  const addSuggestedSkill = (skill: string) => {
    if (!job.skills.includes(skill)) {
      setJob({ ...job, skills: [...job.skills, skill] });
    }
  };

  const removeSkill = (skill: string) => {
    setJob({ ...job, skills: job.skills.filter((s) => s !== skill) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job.title || !job.category || !job.description || !job.budget || job.skills.length === 0)
      return;

    try {
      setIsSubmitting(true);
      await api("/market/jobs", {
        method: "POST",
        body: { ...job, budget: Number(job.budget) },
      });
      navigate("/market/dashboard");
    } catch (error) {
      console.error("Failed to post job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get suggested skills for the selected category, filtered by what's already added
  const suggestedSkills = job.category
    ? (categoriesData[job.category] || []).filter((s) => !job.skills.includes(s))
    : [];

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Cancel
        </button>
        <h1 className="text-xl font-semibold tracking-tight">Post Project</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Define your project requirements to reach verified experts.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-border rounded-lg p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              name="title"
              required
              value={job.title}
              onChange={handleChange}
              placeholder="e.g. Build a Modern Fintech Dashboard"
            />
          </div>

          {/* Category & Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Custom Category Dropdown */}
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center justify-between h-9 w-full rounded-lg border px-3 py-1 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-ring ${
                    job.category
                      ? "border-input text-foreground"
                      : "border-input text-muted-foreground"
                  }`}
                >
                  <span className="truncate">{job.category || "Select a category"}</span>
                  <ChevronDown
                    size={14}
                    className={`ml-2 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar py-1">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => selectCategory(cat)}
                          className={`flex items-center justify-between w-full px-3 py-2 text-sm transition-colors ${
                            job.category === cat
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-foreground hover:bg-muted/50"
                          }`}
                        >
                          <span className="truncate">{cat}</span>
                          {job.category === cat && <Check size={14} className="shrink-0 text-primary" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (USD)</Label>
              <Input
                id="budget"
                type="number"
                name="budget"
                required
                value={job.budget}
                onChange={handleChange}
                placeholder="500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              required
              rows={5}
              value={job.description}
              onChange={handleChange}
              placeholder="Provide a high-level overview of goals and deliverables..."
            />
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label>Required Expertise</Label>
            <div className="flex flex-wrap gap-2 p-3 border border-input rounded-lg focus-within:ring-1 focus-within:ring-ring transition-all min-h-[42px]">
              {job.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="default"
                  className="flex items-center gap-1"
                >
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)}>
                    <X size={12} className="hover:text-destructive transition-colors" />
                  </button>
                </Badge>
              ))}
              <input
                type="text"
                className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px] placeholder:text-muted-foreground"
                placeholder="Press Enter to add skills..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
              />
            </div>

            {/* Suggested Skills */}
            {suggestedSkills.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Suggested skills:</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSuggestedSkill(skill)}
                      className="px-2.5 py-1 rounded-md text-xs font-medium border border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Post Project"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;
