import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import About from './pages/About';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Messages from './pages/chat/Messages';
import Admin from './pages/admin/Admin';
import Layout from './components/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { GuestRoute } from './components/GuestRoute';
import ProfileSettingsPage from './pages/settings/profileSettings';
import NetworkPage from './pages/network/NetworkPage';
import ProfilePage from './pages/profile/ProfilePage';
import { RequireAuth } from './components/RequireAuth';

// New Market Pages
import MarketDashboard from './pages/market/Dashboard';
import FindWork from './pages/market/FindWork';
import Freelancers from './pages/market/Freelancers';
import JobDetails from './pages/market/JobDetails';
import PostJob from './pages/market/PostJob';
import PaymentPage from './pages/market/PaymentPage';
import Proposals from './pages/market/Proposals';
import MyJobs from './pages/market/MyJobs';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/auth/sign-in" element={<Login />} />
          <Route path="/auth/sign-up" element={<Register />} />
          <Route path="/" element={<Landing />} />
        </Route>
        
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Public market routes that still use Layout/Navbar */}
        <Route element={<Layout />}>
          <Route path="/market/find-work" element={<FindWork />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            {/* Redirect old dashboard paths to new /market/dashboard */}
            <Route path="/dashboard" element={<Navigate to="/market/dashboard" replace />} />
            <Route path="/freedashboard" element={<Navigate to="/market/dashboard" replace />} />
            
            <Route path="/market/dashboard" element={<MarketDashboard />} />
            <Route path="/market/freelancers" element={<Freelancers />} />
            <Route path="/market/my-jobs" element={<MyJobs />} />
            <Route path="/market/post-job" element={<PostJob />} />
            <Route path="/market/proposals" element={<Proposals />} />
            <Route path="/market/jobs/:id" element={<JobDetails />} />
            <Route path="/market/payment/:id" element={<PaymentPage />} />

            <Route path="/messages" element={<Messages />} />
            <Route path="/chat" element={<Messages/>} />
            <Route path="/settings/profile" element={<ProfileSettingsPage />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
          </Route>

          {/*Admin Area*/}
         <Route path="/admin" element={<Admin />} />
          <Route path="/admin/*" element={<Admin />} />
        </Route>
      </Routes>
    </>
  );
}