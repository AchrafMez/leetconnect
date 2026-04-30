import { Sun, Moon, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/Theme";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/userContext";
import NotifBell from "@/components/NotifBell";
import {useState} from "react";

const navLinkClass = (isActive: boolean) =>
  `cursor-pointer text-sm transition-colors duration-200 ${
    isActive
      ? 'text-foreground font-medium'
      : 'text-muted-foreground hover:text-foreground'
  }`;

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const { user, loading, logout } = auth || { user: null, loading: true, logout: async () => { } };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* <div className="flex items-center gap-10"> */}
          {/* <div className="flex items-center"> */}
            <Logo className="flex-shrink-0"/>
          {/* </div> */}
          {/* Desktop */}

          <div className="hidden md:flex items-center gap-8 flex-1 ml-12">
                 {user ? (
            <>
              <button
                onClick={() => handleNavigate('/dashboard')}
                className={navLinkClass(isActive('/dashboard'))}
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavigate('/chat')}
                className={navLinkClass(isActive('/chat'))}
              >
                Messages
              </button>
            </>
          ) : (
            <>
            <a
              href="/#features"
              className={navLinkClass(false)}
            >
              Features
            </a>
            <a
              href="/#how-it-works"
              className={navLinkClass(false)}
            >
              How it works
            </a>
            </>
          )}
          </div>
        {/* // </div>  */}

        <div className="flex items-center gap-3 sm:gap-4">

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 hover:cursor-pointer" />
            ) : (
              <Moon className="w-5 h-5 hover:cursor-pointer" />
            )}
          </button>

            {/* notif */}
          {(user || loading) && <NotifBell />}

          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-3">
          {!loading && !user ? (
            <>
              <Button
                onClick={() => navigate('/auth/sign-in')}
                variant={isActive('/auth/sign-in') ? 'default' : 'ghost'}
                className="hidden sm:inline-flex"
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate('/auth/sign-up')}
                variant={isActive('/auth/sign-up') ? 'default' : 'outline'}
                className={`${
                  !location.pathname.startsWith('/auth') 
                    ? theme === 'light' ? 'bg-primary text-white' : 'bg-white text-black'
                    : ''
                } cursor-pointer`}
              >
                Sign up
              </Button>
            </>
          ) : (
            // <NotifBell />
            !loading && (
              <Button
                onClick={handleLogout}
                variant="default"
              >
                Logout
              </Button>
              )
              )}
            </div>
                {/* Mobile Menu Button */}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {/* Mobile Navigation Links */}
            <div className="flex flex-col gap-3 py-4 border-b border-border/40">
              {user ? (
                <>
                  <button
                    onClick={() => handleNavigate('/dashboard')}
                    className={`text-left py-2 px-3 rounded ${navLinkClass(isActive('/dashboard'))}`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => handleNavigate('/chat')}
                    className={`text-left py-2 px-3 rounded ${navLinkClass(isActive('/chat'))}`}
                  >
                    Messages
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-left py-2 px-3 rounded ${navLinkClass(false)}`}
                  >
                    Features
                  </a>
                  <a
                    href="/#how-it-works"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-left py-2 px-3 rounded ${navLinkClass(false)}`}
                  >
                    How it works
                  </a>
                </>
              )}
            </div>
            

            {/* Mobile Auth Buttons */}
            <div className="flex flex-col gap-2 sm:hidden">
              {!loading && !user ? (
                <>
                  <Button
                    onClick={() => handleNavigate('/auth/sign-in')}
                    variant={isActive('/auth/sign-in') ? 'default' : 'ghost'}
                    className="w-full justify-center"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => handleNavigate('/auth/sign-up')}
                    variant={isActive('/auth/sign-up') ? 'default' : 'outline'}
                    className={`w-full justify-center ${
                      !location.pathname.startsWith('/auth') 
                        ? theme === 'light' ? 'bg-primary text-white' : 'bg-white text-black'
                        : ''
                    }`}
                  >
                    Sign up
                  </Button>
                </>
              ) : (
                !loading && (
                  <Button
                    onClick={handleLogout}
                    variant="default"
                    className="w-full justify-center"
                  >
                    Logout
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
