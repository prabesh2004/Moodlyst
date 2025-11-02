import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-rose-50 to-orange-50">
      {/* Header/Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 
              className="text-xl font-bold text-gray-900 cursor-pointer hover:text-rose-500 transition-colors"
              onClick={() => navigate('/')}
            >
              Moodlyst
            </h1>
            
            <button
              onClick={() => navigate('/map')}
              className="text-sm text-gray-600 hover:text-rose-500 font-medium transition-colors hidden sm:block"
            >
              Explore Map
            </button>
          </div>
          
          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full border-2 border-rose-200 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-rose-200 bg-rose-500 text-white flex items-center justify-center font-bold">
                  {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                </div>
              )}
              <span className="text-sm text-gray-700 font-medium hidden md:block">
                {user?.displayName?.split(' ')[0] || user?.email?.split('@')[0]}
              </span>
              <svg 
                className="w-4 h-4 text-gray-500 hidden md:block" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{user?.displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                
                <button
                  onClick={() => {
                    navigate('/map');
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors sm:hidden"
                >
                  🗺️ Explore Map
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  🚪 Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.displayName?.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600">
            Track your mood and see how your community is feeling today.
          </p>
        </motion.div>

        {/* Today's Check-In Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Today's Check-Ins</h3>
              <p className="text-gray-600 text-sm">Log your mood twice daily to track your journey</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-orange-600 font-bold text-lg">7 Days</p>
                  <p className="text-orange-500 text-xs">Current Streak</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Morning Check-in - Bright/Warm */}
            <div className="bg-linear-to-br from-amber-400 to-orange-500 rounded-2xl p-6 border border-orange-300 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/30 rounded-full p-3">
                  <span className="text-3xl">🌅</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">Morning (10 AM)</h4>
                  <p className="text-white/90 text-sm">How was your morning?</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">😊</span>
                  <span className="text-white font-bold text-2xl">8.5/10</span>
                </div>
                <span className="bg-white text-orange-600 text-xs px-3 py-1 rounded-full font-semibold">
                  ✓ Logged
                </span>
              </div>
            </div>

            {/* Evening Check-in - Dark/Cool */}
            <div className="bg-linear-to-br from-slate-700 to-slate-900 rounded-2xl p-6 border border-slate-600 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/10 rounded-full p-3">
                  <span className="text-3xl">🌙</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">Evening (10 PM)</h4>
                  <p className="text-white/80 text-sm">How was your day?</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Pending check-in</span>
                <button className="bg-white text-slate-800 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-all text-sm">
                  Log Now
                </button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💡</span>
                <p className="text-blue-800 text-sm">
                  Keep your streak alive! Log your evening mood before 11:59 PM
                </p>
              </div>
              <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-full font-semibold transition-all text-sm hidden md:block">
                Set Reminder
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="text-4xl mb-3">😊</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">8.5/10</h3>
            <p className="text-gray-600">Your Current Mood</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">7 days</h3>
            <p className="text-gray-600">Current Streak</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">8.2/10</h3>
            <p className="text-gray-600">Community Average</p>
          </motion.div>
        </div>

        {/* Log Mood Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-linear-to-r from-teal-600 to-cyan-600 rounded-3xl shadow-2xl p-12 text-center text-white"
        >
          <h3 className="text-3xl font-bold mb-4">How are you feeling today?</h3>
          <p className="text-white/90 mb-8">
            Log your mood to see personalized insights and trends
          </p>
          <button className="bg-white text-rose-500 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
            Log Your Mood →
          </button>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
        >
          <div 
            onClick={() => navigate('/map')}
            className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all group"
          >
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Explore Mood Map</h3>
            <p className="text-gray-600 mb-4">
              See real-time mood trends from cities around the world
            </p>
            <span className="text-rose-500 font-semibold group-hover:gap-2 flex items-center gap-1 transition-all">
              Open Map <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-5xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your Insights</h3>
            <p className="text-gray-600 mb-4">
              View your mood patterns and get personalized recommendations
            </p>
            <span className="text-gray-400 font-semibold">Coming Soon...</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
