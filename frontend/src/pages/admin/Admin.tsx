import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../../components/CanAccess';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DashboardPage } from './DashboardPage';
import { UsersPage } from './UsersPage';
import { RolesPage } from './RolesPage';
import { ForbiddenPage } from '../ForbiddenPage';
import { Analytics } from './Analytics';
import { JobsPage } from './JobsPage';
import { AdminLoginPage } from './AdminLoginPage';

const Admin = () => {
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
							<Analytics />
						</ProtectedRoute>
					}/>

      </Route>

      <Route path='*' element={<Navigate to='/admin' replace />} />
    </Routes>
  );
};

export default Admin;