import { useState } from "react";
import { Sun, Moon, Menu, X, LayoutDashboard, Users, Briefcase, PlusCircle, Search, MessageCircle, Settings, User as UserIcon, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/Theme";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/userContext";
import { useNotifications } from "@/context/NotifProvider";
import NotifBell from "@/components/NotifBell";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Avatar from "@/components/ui/Avatar";

const clientMenuItems = [
  { name: "Overview", path: "/market/dashboard", icon: LayoutDashboard, desc: "View your account activity and stats" },
  { name: "Talent", path: "/market/freelancers", icon: Users, desc: "Browse and hire top freelancers" },
  { name: "My Projects", path: "/market/my-jobs", icon: Briefcase, desc: "Manage your posted jobs" },
  { name: "Post Project", path: "/market/post-job", icon: PlusCircle, desc: "Create a new job posting" },
];

const freelancerMenuItems = [
  { name: "Overview", path: "/market/dashboard", icon: LayoutDashboard, desc: "View your earnings and profile stats" },
  { name: "Talent", path: "/market/freelancers", icon: Users, desc: "Browse and hire top freelancers" },
  { name: "Marketplace", path: "/market/find-work", icon: Search, desc: "Find new jobs and projects" },
  { name: "Proposals", path: "/market/proposals", icon: Briefcase, desc: "Track your active proposals" },
];

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

  const notifContext = useNotifications();
  const notifs = notifContext?.notifs || [];

  const unreadMessages = notifs.filter(n => !n.is_read && n.type === 'MESSAGE').length;
  const unreadNetwork = notifs.filter(n => !n.is_read && n.type === 'FRIEND_REQ').length;
  const unreadProposals = notifs.filter(n => !n.is_read && n.type === 'SYSTEM' && n.title.toLowerCase().includes('proposal')).length;

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

  const menuItems = user?.type === "CLIENT" ? clientMenuItems : freelancerMenuItems;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-8">
          <Logo className="flex-shrink-0" />

          {/* Desktop Left Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`${navLinkClass(isActive(item.path))} relative flex items-center gap-1`}
                  >
                    {item.name}
                    {item.name === "Proposals" && unreadProposals > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </Link>
                ))}
                <Link to="/chat" className={`${navLinkClass(isActive('/chat'))} relative flex items-center gap-1`}>
                  Messages
                  {unreadMessages > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </Link>
                <Link to="/network" className={`${navLinkClass(isActive('/network'))} relative flex items-center gap-1`}>
                  Network
                  {unreadNetwork > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </Link>
              </>
            ) : (
              <>
                <a href="/#features" className={navLinkClass(false)}>Features</a>
                <a href="/#how-it-works" className={navLinkClass(false)}>How it works</a>
              </>
            )}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 cursor-pointer" /> : <Moon className="w-5 h-5 cursor-pointer" />}
          </button>

          {(user || loading) && <NotifBell />}

          {/* Desktop Right Side */}
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
              !loading && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 rounded-lg hover:bg-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <Avatar name={user?.username || "U"} image={user?.avatar} size="xs" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.username || "Guest"}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={() => handleNavigate(`/profile/${user?.username}`)}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => handleNavigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950 dark:focus:text-red-400" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-sm h-[calc(100vh-4rem)] overflow-y-auto pb-6">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            
            <div className="flex flex-col gap-3 py-4 border-b border-border/40">
              {user ? (
                <>
                  <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Dashboard
                  </p>
                  {menuItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`flex items-center gap-3 text-left py-2 px-3 rounded ${navLinkClass(isActive(item.path))}`}
                    >
                      <item.icon size={16} />
                      <span className="flex items-center gap-1.5">
                        {item.name}
                        {item.name === "Proposals" && unreadProposals > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                      </span>
                    </button>
                  ))}
                  
                  <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-1">
                    System
                  </p>
                  <button
                    onClick={() => handleNavigate('/chat')}
                    className={`flex items-center gap-3 text-left py-2 px-3 rounded ${navLinkClass(isActive('/chat'))}`}
                  >
                    <MessageCircle size={16} />
                    <span className="flex items-center gap-1.5">
                      Messages
                      {unreadMessages > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </span>
                  </button>
                  <button
                    onClick={() => handleNavigate('/network')}
                    className={`flex items-center gap-3 text-left py-2 px-3 rounded ${navLinkClass(isActive('/network'))}`}
                  >
                    <Users size={16} />
                    <span className="flex items-center gap-1.5">
                      Network
                      {unreadNetwork > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </span>
                  </button>
                  <button
                    onClick={() => handleNavigate(`/profile/${user?.username}`)}
                    className={`flex items-center gap-3 text-left py-2 px-3 rounded ${navLinkClass(isActive(`/profile/${user?.username}`))}`}
                  >
                    <UserIcon size={16} />
                    Profile
                  </button>
                  <button
                    onClick={() => handleNavigate('/settings')}
                    className={`flex items-center gap-3 text-left py-2 px-3 rounded ${navLinkClass(isActive('/settings'))}`}
                  >
                    <Settings size={16} />
                    Settings
                  </button>
                </>
              ) : (
                <>
                  <a href="/#features" onClick={() => setMobileMenuOpen(false)} className={`text-left py-2 px-3 rounded ${navLinkClass(false)}`}>Features</a>
                  <a href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className={`text-left py-2 px-3 rounded ${navLinkClass(false)}`}>How it works</a>
                </>
              )}
            </div>

            {/* Mobile Auth Buttons */}
            <div className="flex flex-col gap-2 sm:hidden">
              {!loading && !user ? (
                <>
                  <Button onClick={() => handleNavigate('/auth/sign-in')} variant={isActive('/auth/sign-in') ? 'default' : 'ghost'} className="w-full justify-center">Sign In</Button>
                  <Button onClick={() => handleNavigate('/auth/sign-up')} variant={isActive('/auth/sign-up') ? 'default' : 'outline'} className={`w-full justify-center ${!location.pathname.startsWith('/auth') ? theme === 'light' ? 'bg-primary text-white' : 'bg-white text-black' : ''}`}>Sign up</Button>
                </>
              ) : (
                !loading && (
                  <Button onClick={handleLogout} variant="destructive" className="w-full justify-center gap-2">
                    <LogOut size={16} />
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
