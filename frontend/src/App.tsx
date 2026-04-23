// // import React from 'react';
// import { Routes, Route } from 'react-router-dom';
// import Landing from './pages/Landing';
// import Privacy from './pages/Privacy';
// import Terms from './pages/Terms';
// import About from './pages/About';
// import Login from './pages/auth/Login';
// import Register from './pages/auth/Register';
// import Dashboard from './pages/market/Dashboard';
// import Messages from './pages/chat/Messages';
// import Admin from './pages/admin/Admin';
// import Layout from './components/Layout';
// // import Theme from './components/ThemeShowcase';
// // import Navbar from './components/Navbar';
// import { ScrollToTop } from './components/ScrollToTop';

// export default function App() {
//   return (
//     <>
//       <ScrollToTop />
//       <Routes>
//         {/*Public routes*/}
//         <Route path="/" element={<Landing />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/privacy" element={<Privacy />} />
//         <Route path="/terms" element={<Terms />} />

//         {/*authenticated routes (with shared layout)*/}
//         <Route element={<Layout />}>
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/messages" element={<Messages />} />
//           <Route path="/admin" element={<Admin />} />
//         </Route>
//       </Routes>
//     </>
//   );
// }


import { Routes, Route } from "react-router-dom";

import SideBar from "./components/market/SideBar";
import PostJob from "./pages/market/PostJob";
import Freelencers from "./pages/market/Freelencers";
import Dashboard from "./pages/market/Dashbord";
import FreelancerDashboardPage from "./pages/market/FreelancerDashboardPage";
import FindClients from "./pages/market/FindClients";
import JobDetails from "./pages/market/JobDetails";

// import { Routes, Route } from "react-router-dom";
// import SideBar from "./components/SideBar";
// import Dashboard from "./pages/Dashboard";
// import PostJob from "./pages/PostJob";
// import Freelencers from "./pages/Freelencers";
// import FindClients from "./pages/FindClients";
// import FreelancerDashboardPage from "./pages/FreelancerDashboardPage";

function App() {
  // 🔥 change ici pour tester
  const auth = "client"; // "client" ou "freelancer"

  const jobs = [
    {
      id: "1",
      title: "Développeur React pour dashboard freelance",
      description:
        "Créer un dashboard moderne avec React et Tailwind pour une plateforme freelance.",
      budget: 500,
      category: "Développement Web",
      skills: ["React", "Tailwind", "API REST"],
      client: {
        name: "Ahmed Benali",
        rating: 4.8,
      },
      createdAt: "2026-04-15",
    },
    {
      id: "2",
      title: "Designer UI/UX pour application mobile",
      description:
        "Concevoir une interface moderne et intuitive pour une app de livraison.",
      budget: 300,
      category: "Design",
      skills: ["Figma", "UX Research", "Prototyping"],
      client: {
        name: "Sara El Amrani",
        rating: 4.6,
      },
      createdAt: "2026-04-18",
    },
    {
      id: "3",
      title: "Développeur Node.js backend API",
      description: "Créer une API sécurisée avec Express et JWT.",
      budget: 400,
      category: "Backend",
      skills: ["Node.js", "Express", "JWT", "MongoDB"],
      client: {
        name: "Youssef Karim",
        rating: 4.9,
      },
      createdAt: "2026-04-10",
    },
  ];

  return (
    <div className="flex h-screen">
      <SideBar />

      <div className="flex-1 overflow-auto">
        <Routes>
          {/* Dashboard dynamique */}
          <Route
            path="/"
            element={auth === "client" ? (<Dashboard />) : (
                <FreelancerDashboardPage />
              )
            }
          />

          {/* Routes CLIENT */}
          {auth === "client" && (
            <>
              <Route path="/myJobs" element={<PostJob />} />
              <Route path="/freelencers" element={<Freelencers />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
            </>
          )}

          {/* Routes FREELANCER */}
          {auth === "freelancer" && (
            <>
              <Route
                path="/freelancers"
                element={<FindClients jobs={jobs} />}
              />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
}

export default App;