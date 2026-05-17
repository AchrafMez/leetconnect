import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Laptop } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ProtectedRoute } from '../../components/CanAccess';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DashboardPage } from './DashboardPage';
import { UsersPage } from './UsersPage';
import { RolesPage } from './RolesPage';
import { ForbiddenPage } from '../ForbiddenPage';
import { AnalyticsPage } from './AnalyticsPage';
import { JobsPage } from './JobsPage';
import { AdminLoginPage } from './AdminLoginPage';

const Admin = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Card className="max-w-sm w-full border-0 shadow-none bg-transparent">
          <CardHeader className="flex flex-col items-center pb-4">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Laptop className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Desktop Recommended</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <CardDescription className="text-muted-foreground text-sm mt-1 mb-8 text-center">
              The Admin Dashboard contains complex tables, analytics, and moderation tools. 
              For the optimal experience, please access this area using a laptop or desktop computer.
            </CardDescription>
            <Button asChild className="w-full">
              <Link to="/">Return to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Routes>
      <Route path='403' element={<ForbiddenPage />} />
			<Route path='login' element={<AdminLoginPage />} />

      <Route
        element={
          <ProtectedRoute minRole='MODERATOR'>
            <DashboardLayout />
          </ProtectedRoute>
        }>
        <Route index element={<DashboardPage />} />
        <Route
          path='users'
          element={
            <ProtectedRoute minRole='MODERATOR'>
              <UsersPage />
            </ProtectedRoute>
          }/>

				<Route
					path='jobs'
					element={
						<ProtectedRoute minRole='MODERATOR'>
							<JobsPage />
						</ProtectedRoute>
					}/>

        <Route
          path='roles'
          element={
            <ProtectedRoute minRole='ADMIN'>
              <RolesPage />
            </ProtectedRoute>
          }/>

				<Route 
					path='analytics'
					element={
						<ProtectedRoute minRole='ADMIN'>
							<AnalyticsPage />
						</ProtectedRoute>
					}/>

      </Route>

      <Route path='*' element={<Navigate to='/admin' replace />} />
    </Routes>
  );
};

export default Admin;