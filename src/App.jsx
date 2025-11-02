import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import FeaturesSection from './components/FeaturesSection';
import WhyMoodMatters from './components/WhyMoodMatters';
import DualValue from './components/DualValue';
import MapPage from './pages/MapPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

function HomePage({ user }) {
  return (
    <>
      <Navbar user={user} />
      <Hero user={user} />
      <HowItWorks />
      <WhyMoodMatters />
      <FeaturesSection />
      <DualValue />
    </>
  );
}

// Protected Route Component
function ProtectedRoute({ user, children }) {
  if (user === null) {
    // Still loading
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    // Not logged in, redirect to login
    return <Navigate to="/login" />;
  }
  
  // User is logged in
  return children;
}

function App() {
  const [user, setUser] = useState(null); // null = loading, false = not logged in, object = logged in
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || false);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-rose-50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Moodlyst...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes - Only accessible when logged in */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/map" 
          element={
            <ProtectedRoute user={user}>
              <MapPage user={user} />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App
