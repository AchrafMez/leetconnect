import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/userContext';
import { HiOutlineArrowRightOnRectangle,
				 HiOutlineBriefcase,
				 HiOutlineChartPie,
				 HiOutlineShieldCheck,
				 HiOutlineSquares2X2,
				 HiOutlineUsers } from "react-icons/hi2";
import { Link } from 'react-router-dom';


const NAV_MAIN = [
  {
    label: 'Dashboard',
    href: '/admin',
    minRole: 'MODERATOR' as const,
    icon: (
      <HiOutlineSquares2X2 className='w-4 h-4'/>
    ),
  },
  {
    label: 'Users',
    href: '/admin/users',
    minRole: 'MODERATOR' as const,
    icon: (
			<HiOutlineUsers className="h-4 w-4" />

    ),
  },
	{
		label: 'Jobs',
		href: '/admin/jobs',
		minRole: 'MODERATOR' as const,
		icon: (
			<HiOutlineBriefcase className='h-4 w-4' />
		),
	},
  {
    label: 'Roles',
    href: '/admin/roles',
    minRole: 'ADMIN' as const,
    icon: (
      <HiOutlineShieldCheck className='h-4 w-4' />
    ),
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    minRole: 'ADMIN' as const,
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
    navigate('/admin/login');
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
      isActive
        ? 'bg-primary/10 text-primary font-medium'
        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
    }`;

  return (
    <aside className="w-[250px] shrink-0 flex flex-col bg-sidebar border-sidebar-border h-screen overflow-hidden pb-3">
      <div className="px-10 py-5 items-center">
				<Link to="/admin">
            <span className="font-sans font-bold text-[20px] tracking-tighter flex items-baseline cursor-pointer transition-colors hover:opacity-80">
                <span className="text-primary">leet</span><span className="text-muted-foreground">connect</span>
            </span>
        </Link>
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
            <div className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0 overflow-hidden">
											{user.avatar ? (
												<img 
													src={user.avatar} 
													alt={`${user.firstname}'s avatar`} 
													className="w-full h-full object-cover"
													onError={(e) => {
														// Fallback if image fails to load
														e.currentTarget.style.display = 'none';
													}}
												/>
											) : (
												<span>{`${user.firstname[0]}${user.lastname[0]}`}</span>
											)}
										</div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{`${user.firstname} ${user.lastname}`}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{user.role} Account</p>
            </div>
          </div>
        </div>
      )}

        <button
          onClick={handleLogout}
          className="w-full flex pl-6 items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors"
        >
          <HiOutlineArrowRightOnRectangle className='w-5 h-5' />
					<span className='text-destructive'>Logout</span>
        </button>
    </aside>
  );
}