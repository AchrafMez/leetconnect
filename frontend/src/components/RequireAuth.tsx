import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/userContext';

// guards authenticated routes redirects unauthenticated to sign-in
export const RequireAuth = () => {
	const {user, loading} = useAuth();

	if (loading) return null;
	if (!user) return <Navigate to="/auth/sign-in" replace/>;
	return <Outlet/>;
};
