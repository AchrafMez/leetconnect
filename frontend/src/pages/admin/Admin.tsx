import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { ProtectedRoute } from '../../components/CanAccess';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DashboardPage } from './DashboardPage';
import { UsersPage } from './UsersPage';
import { RolesPage } from './RolesPage';
import { ForbiddenPage } from '../ForbiddenPage';
import { Analytics } from './Analytics';
import { JobsPage } from './JobsPage';

const Admin = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path='403' element={<ForbiddenPage />} />

        <Route
          element={
            <ProtectedRoute minRole='guest'>
              <DashboardLayout />
            </ProtectedRoute>
          }>
          <Route index element={<DashboardPage />} />
          <Route
            path='users'
            element={
              <ProtectedRoute minRole='moderator'>
                <UsersPage />
              </ProtectedRoute>
            }/>

					<Route
						path='jobs'
						element={
							<ProtectedRoute minRole='moderator'>
								<JobsPage />
							</ProtectedRoute>
						}/>

          <Route
            path='roles'
            element={
              <ProtectedRoute minRole='admin'>
                <RolesPage />
              </ProtectedRoute>
            }/>

					<Route 
						path='analytics'
						element={
							<ProtectedRoute minRole='admin'>
								<Analytics />
							</ProtectedRoute>
						}/>		

        </Route>

        <Route path='*' element={<Navigate to='/admin' replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default Admin;