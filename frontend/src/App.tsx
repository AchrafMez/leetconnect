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
import ProfileSettingsPage from './pages/settings/profileSettings';
import Layout from './components/Layout';
// import Theme from './components/ThemeShowcase';
// import Navbar from './components/Navbar';
import { ScrollToTop } from './components/ScrollToTop';
import { GuestRoute } from './components/GuestRoute';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* added guest route protection so authenticated users cant access register/login forms  */}
        <Route element={<GuestRoute />}>
          <Route path="/auth/sign-in" element={<Login />} />
          <Route path="/auth/sign-up" element={<Register />} />
        </Route>

        {/*Public routes*/}
        <Route path="/" element={<Landing />} />
        {/* <Route path="/auth/sign-in" element={<Login />} />
        <Route path="/auth/sign-up" element={<Register />} /> */}
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/*authenticated routes (with shared layout)*/}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/freedashboard" element={<Dashboard />} /> {/* just temporary */}
          <Route path="/chat" element={<Messages />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/settings/profile" element={<ProfileSettingsPage />} />
        </Route>
      </Routes>
    </>
  );
}
