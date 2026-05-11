import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/userContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, Loader2 } from "lucide-react";
import { categoriesData } from "@/assets/assets";

const categories = Object.keys(categoriesData);

export default function FreelancerSetupModal() {
  const { user, updateUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    rate: "",
    skills: [] as string[],
    category: [] as string[],
    bio: "",
  });
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (
      user?.type === "FREELANCER" &&
      (!user.skills || user.skills.length === 0 || user.rate === null || user.rate === undefined)
    ) {
      setIsOpen(true);
      setFormData({
        title: user.title || "",
        rate: user.rate?.toString() || "",
        skills: user.skills || [],
        category: user.category || [],
        bio: user.bio || "",
      });
    } else {
      setIsOpen(false);
    }
  }, [user]);

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
  };

  const toggleCategory = (cat: string) => {
    setFormData((prev) => ({
      ...prev,
      category: prev.category.includes(cat)
        ? prev.category.filter((c) => c !== cat)
        : [...prev.category, cat],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api<any>("/auth/setup", {
        method: "POST",
        body: { ...formData, rate: Number(formData.rate) },
      });
      if (res.success) {
        updateUser(res.user);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent 
        className="max-w-md max-h-[85vh] overflow-y-auto custom-scrollbar [&>button:last-child]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Expert Profile</DialogTitle>
          <DialogDescription>Complete your freelancer profile to get started</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="prof-title">Professional Title</Label>
            <Input
              id="prof-title"
              required
              placeholder="e.g. Senior Software Architect"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Rate */}
          <div className="space-y-2">
            <Label htmlFor="rate">Hourly Rate (USD)</Label>
            <Input
              id="rate"
              type="number"
              required
              placeholder="45"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
            />
          </div>

          {/* Specialization */}
          <div className="space-y-2">
            <Label>Specialization</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    formData.category.includes(cat)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label>Core Skills</Label>
            <div className="flex flex-wrap gap-2 p-3 border border-input rounded-lg focus-within:ring-1 focus-within:ring-ring transition-all min-h-[42px]">
              {formData.skills.map((skill) => (
                <Badge key={skill} variant="default" className="flex items-center gap-1">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)}>
                    <X size={10} className="hover:text-destructive transition-colors" />
                  </button>
                </Badge>
              ))}
              <input
                type="text"
                className="flex-1 bg-transparent border-none outline-none text-sm min-w-[100px] placeholder:text-muted-foreground"
                placeholder="Add skill..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              rows={3}
              placeholder="Briefly describe your expertise..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Complete"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
