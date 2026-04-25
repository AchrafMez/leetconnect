import { Sun, Moon } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/Theme";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center">
            <Logo />
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a
              href="/#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="/#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How it works
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          <Button onClick={() => navigate('/auth/sign-up')} variant="ghost" className="hidden sm:inline-flex">
            Sign In
          </Button>
          <Button onClick={() => navigate('/auth/sign-up')}>
            Sign up
          </Button>
        </div>
      </nav>
    </header>
  );
}
