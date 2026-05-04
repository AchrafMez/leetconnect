import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/userContext';
import { RoleBadge } from '../components/ui/RoleBadge';

export const ForbiddenPage = () => {
  const navigate = useNavigate();
  const { user }  = useAuth();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <p className="text-xs font-bold text-destructive tracking-widest uppercase mb-2">403 Forbidden</p>
        <h1 className="text-xl font-semibold text-foreground mb-2">Access denied</h1>
        <p className="text-sm text-muted-foreground mb-6">
          You don't have permission to this area.
          {user && <span className="block mt-2">Signed in as <RoleBadge role={user.role} size="sm" /></span>}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground bg-card border border-border hover:border-border-hover transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}