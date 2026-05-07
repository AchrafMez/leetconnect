import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/userContext';

export default function AuthSuccess() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    useEffect(() => {
        // UserContext already has a useEffect calling /auth/me.
        // Once it finishes, 'user' will be populated via the cookie.
        if (!loading && user) {
            // // Redirect based on the NEW 'type' field
            // if (user.type === 'FREELANCER') {
            //     navigate('/freedashboard');
            // } else {
                navigate('/dashboard');
            // }
        }
    }, [user, loading, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-foreground-muted text-sm font-medium">
                Syncing with 42 Intra...
            </p>
        </div>
    );
}