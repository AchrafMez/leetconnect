import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineArrowRightOnRectangle,
				 HiOutlineBriefcase,
				 HiOutlineChartPie,
				 HiOutlineShieldCheck,
				 HiOutlineSquares2X2,
				 HiOutlineUsers } from "react-icons/hi2";


const NAV_MAIN = [
  {
    label: 'Dashboard',
    href: '/admin',
    minRole: 'guest' as const,
    icon: (
      <HiOutlineSquares2X2 className='w-4 h-4'/>
    ),
  },
  {
    label: 'Users',
    href: '/admin/users',
    minRole: 'moderator' as const,
    icon: (
			<HiOutlineUsers className="h-4 w-4" />

    ),
  },
	{
		label: 'Jobs',
		href: '/admin/jobs',
		minRole: 'moderator' as const,
		icon: (
			<HiOutlineBriefcase className='h-4 w-4' />
		),
	},
  {
    label: 'Roles',
    href: '/admin/roles',
    minRole: 'admin' as const,
    icon: (
      <HiOutlineShieldCheck className='h-4 w-4' />
    ),
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    minRole: 'admin' as const,
    icon: (
      <HiOutlineChartPie className='h-5 w-5' />
    ),
  },
];

export const Sidebar = () => {
  const { user, logout, canAccess } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
      isActive
        ? 'bg-primary/10 text-primary font-medium'
        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
    }`;

  return (
    <aside className="w-[250px] shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border h-screen overflow-hidden">
      <div className="px-10 py-5 items-center">
        <span className="font-brand text-lg font-bold text-primary tracking-tight">leet</span>
        <span className="font-brand text-lg font-bold text-muted-foreground tracking-tight">connect</span>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_MAIN.map(item =>
          canAccess(item.minRole) ? (
            <NavLink key={item.href} to={item.href} end={item.href === '/admin'} className={navLinkClass}>
              {item.icon}
              {item.label}
            </NavLink>
          ) : null
        )}
      </nav>

      {user && (
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
              {user.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{user.role} Account</p>
            </div>
          </div>
        </div>
      )}

        <button
          onClick={handleLogout}
          className="w-full flex pl-6 items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
        >
          <HiOutlineArrowRightOnRectangle className='w-5 h-5' />
          Logout
        </button>
    </aside>
  );
}