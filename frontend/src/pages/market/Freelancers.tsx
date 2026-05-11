import React, { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Avatar from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Search, Star, Loader2, UserSearch } from "lucide-react";
import { categoriesData } from "@/assets/assets";

const categories = ["All", ...Object.keys(categoriesData)];

const Freelancers: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [allFreelancers, setAllFreelancers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchFreelancers = async () => {
    try {
      setIsLoading(true);
      const data = await api<{ freelancers: any[] }>(`/auth/freelancers`);
      setAllFreelancers(data.freelancers || []);
    } catch (error) {
      console.error("Failed to fetch freelancers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancers();
  }, []);

  // Client-side filtering by category and search
  const freelancers = useMemo(() => {
    let filtered = [...allFreelancers];

    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (f) => f.category && Array.isArray(f.category) && f.category.includes(selectedCategory)
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((f) => {
        const matchName = f.username?.toLowerCase().includes(q);
        const matchTitle = f.title?.toLowerCase().includes(q);
        const matchSkills = f.skills?.some((s: string) => s.toLowerCase().includes(q));
        return matchName || matchTitle || matchSkills;
      });
    }

    return filtered;
  }, [allFreelancers, selectedCategory, search]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Talent Discovery</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect with verified experts for your next project.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder="Search by name, skill, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Filters — scrollable for many categories */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-colors shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Freelancers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-16">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : freelancers.length === 0 ? (
          <Card className="col-span-full overflow-hidden border-border/60 shadow-sm">
            <div className="h-16 bg-linear-to-r from-primary/20 via-primary/5 to-transparent" />
            <CardContent className="p-5 pt-0 relative">
              <div className="-mt-6 relative z-10 mb-3">
                <div className="rounded-xl ring-4 ring-card bg-card w-12 h-12 flex items-center justify-center">
                  <UserSearch size={20} className="text-primary" />
                </div>
              </div>
              <h3 className="text-base font-bold text-foreground">
                No experts found
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                No experts match your criteria. Try adjusting your search or selecting a different category.
              </p>
            </CardContent>
          </Card>
        ) : (
          freelancers.map((f: any) => (
            <Card
              key={f.id}
              className="overflow-hidden border-border/60 shadow-sm flex flex-col"
            >
              {/* gradient banner */}
              <div className="h-16 bg-linear-to-r from-primary/20 via-primary/5 to-transparent" />

              <CardContent className="p-5 pt-0 relative flex-1">
                <div className="flex justify-between items-start">
                  {/* avatar */}
                  <div className="-mt-6 relative z-10">
                    <div className="rounded-xl ring-4 ring-card bg-card overflow-hidden">
                      <Avatar name={f.username || "?"} image={f.avatar} size="md" shape="rounded" />
                    </div>
                    {f.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-primary border-2.5 border-card rounded-full shadow-sm" />
                    )}
                  </div>

                  {/* rating */}
                  <div className="text-right mt-3">
                    <div className="flex items-center gap-1 text-yellow-500 text-xs font-semibold">
                      <Star size={12} fill="currentColor" />
                      <span>{f.rating ? f.rating.toFixed(1) : "0.0"}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{f.reviewCount || 0} reviews</p>
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="text-base font-bold text-foreground line-clamp-1">
                    {[f.firstname, f.lastname].filter(Boolean).join(" ") || f.username}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5 line-clamp-1">
                    {f.title || "Professional"}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
                  {f.bio || "Professional freelancer ready to deliver quality results."}
                </p>

                {f.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {f.skills.slice(0, 3).map((skill: string) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-[10px] font-medium px-2 py-0.5 bg-secondary/50 hover:bg-secondary/80 transition-colors"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {f.skills.length > 3 && (
                      <span className="text-[10px] text-muted-foreground self-center">
                        +{f.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>

              {/* Footer: rate + View Profile */}
              <CardFooter className="px-5 py-4 mt-auto border-t border-border/50 bg-secondary/20">
                <div className="flex items-center justify-between w-full gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
                      Hourly
                    </p>
                    <div className="flex items-baseline text-base font-bold">
                      <span className="text-primary">$</span>
                      <span className="text-foreground">{f.rate || "45"}</span>
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                    onClick={() => navigate(`/profile/${f.username}`)}
                  >
                    View Profile
                  </button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Freelancers;
