// import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import About from './pages/About';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/market/Dashboard';
import Messages from './pages/chat/Messages';
import Admin from './pages/admin/Admin';
import Layout from './components/Layout';
// import Theme from './components/ThemeShowcase';
// import Navbar from './components/Navbar';
import { ScrollToTop } from './components/ScrollToTop';
import { GuestRoute } from './components/GuestRoute';
import ProfilePage from './pages/profile/ProfilePage';
import ProfileSettingsPage from './pages/settings/profileSettings';
import NetworkPage from './pages/network/NetworkPage';
import { RequireAuth } from './components/RequireAuth';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* added guest route protection so authenticated users cant access register/login forms  */}
        <Route element={<GuestRoute />}>
          <Route path="/auth/sign-in" element={<Login />} />
          <Route path="/auth/sign-up" element={<Register />} />
          <Route path="/" element={<Landing />} />
        </Route>
        
        {/*Public routes*/}
        {/* <Route path="/auth/sign-in" element={<Login />} />
        <Route path="/auth/sign-up" element={<Register />} /> */}
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/*authenticated routes (with shared layout)*/}
        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<Messages />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/settings/profile" element={<ProfileSettingsPage />} />
            <Route path="/network" element={<NetworkPage />} />
          </Route>
          {/*Admin Area*/}
          <Route path="/admin/*" element={<Admin />} />
        </Route>
      </Routes>
    </>
  );
}
