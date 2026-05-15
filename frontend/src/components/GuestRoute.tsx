
// will use it to stop user from seeing signup and sign in forms when he is already logged in
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/userContext';

interface GuestRouteProps {
  children?: React.ReactNode;
}

export const GuestRoute = ({ children }: GuestRouteProps) => {
  const { user, loading } = useAuth();

  //  Wait for the initial session check to finish
  if (loading) {
    return null; 
  }

  //  If user is already authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/market/dashboard" replace />;
  }

  // Otherwise, show the Sign In / Sign Up page
  return <Outlet />;
};