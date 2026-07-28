import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Traffic Controller
import Home from './pages/Home/Home';

// Auth
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Profile & Stats
import Profile from './pages/Dashboard/Profile';
import Achievements from './pages/Dashboard/Achievements';

// Core Features
import Practice from './pages/Practice/Practice';
import TestDashboard from './pages/Test/TestDashboard';
import QuizSession from './pages/Test/QuizSession';
import TestResult from './pages/Test/TestResult';

import LearningVault from './pages/Tutorials/LearningVault';
import Tutorials from './pages/Tutorials/Tutorials';
import Lecture from './pages/Tutorials/Lecture';

// 🆕 SCROLL TO TOP CONTROLLER
// Listens to the current route path execution location and instantly snaps viewport back to coordinate origin (0, 0)
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* 🆕 Activated global scroll engine inside the router provider tree */}
        <ScrollToTop />

        {/* The wrapper stays flex-col. 
          Navbar and Footer will silently return null on the landing page 
          based on the logic we wrote inside them.
        */}
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] selection:bg-primary/10 selection:text-primary">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              {/* Home handles the Landing vs UserHome logic internally */}
              <Route path="/" element={<Home />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
              
              <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
              
              <Route path="/test" element={<ProtectedRoute><TestDashboard /></ProtectedRoute>} />
              <Route path="/test/session" element={<ProtectedRoute><QuizSession /></ProtectedRoute>} />
              <Route path="/test/result" element={<ProtectedRoute><TestResult /></ProtectedRoute>} />
              
              <Route path="/learning-vault" element={<ProtectedRoute><LearningVault /></ProtectedRoute>} />
              <Route path="/tutorials/:courseId/:sectionId?" element={<ProtectedRoute><Tutorials /></ProtectedRoute>} />
              <Route path="/tutorials/:courseId/:sectionId/:lectureId" element={<ProtectedRoute><Lecture /></ProtectedRoute>} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;