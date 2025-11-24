import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { getTodayCheckIns, calculateStreak, getUserMoodLogs, deleteTodaysMoodLogs } from '../services/moodService';
import MoodLogModal from '../components/MoodLogModal';
import MoodTimeline from '../components/MoodTimeline';
import EventsWidget from '../components/EventsWidget';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [modalCheckInType, setModalCheckInType] = useState('anytime');
  const dropdownRef = useRef(null);
  
  // Real data from Firestore
  const [todayCheckIns, setTodayCheckIns] = useState({ morning: null, evening: null });
  const [streak, setStreak] = useState(0);
  const [recentMood, setRecentMood] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [todayMoodCount, setTodayMoodCount] = useState(0);
  const [allMoodLogs, setAllMoodLogs] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationName, setLocationName] = useState('');

  const fetchLocationName = async (latitude, longitude) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
      if (!response.ok) throw new Error('Reverse geocoding failed');

      const data = await response.json();
      const address = data.address || {};
      const city = address.city || address.town || address.village || address.suburb;
      const state = address.state;
      const country = address.country_code ? address.country_code.toUpperCase() : address.country;

      const formatted = [city, state].filter(Boolean).join(', ') || data.display_name?.split(',').slice(0, 2).join(', ');
      setLocationName(formatted ? `${formatted}${country ? ` · ${country}` : ''}` : 'Location detected');
    } catch (error) {
      console.error('Reverse geocode error:', error);
      setLocationName('Location detected');
    }
  };

  const requestLocationAccess = () => {
    if (!('geolocation' in navigator)) {
      setLocationStatus('unavailable');
      return;
    }

    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Location permission granted');
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationStatus('granted');
        fetchLocationName(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.log('⚠️ Location permission denied:', error.message);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('denied');
        } else {
          setLocationStatus('error');
        }
      }
    );
  };

  useEffect(() => {
    requestLocationAccess();
  }, []);

  const getLocationLabel = () => {
    if (locationName) return locationName;
    if (!userLocation) return 'Location enabled';
    const { latitude, longitude } = userLocation;
    return `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
  };

  const handleEnableLocationClick = () => {
    requestLocationAccess();
    if (locationStatus === 'denied') {
      alert('Location access is blocked. Please enable location for Moodlyst in your browser settings (Site Settings → Location) and try again.');
    }
  };

  // Time validation functions
  const canLogMorning = () => {
    if (todayCheckIns.morning) return false; // Already logged
    const now = new Date();
    const hour = now.getHours();
    return hour >= 6 && hour < 12; // 6 AM to 12 PM
  };

  const canLogEvening = () => {
    if (todayCheckIns.evening) return false; // Already logged
    const now = new Date();
    const hour = now.getHours();
    return hour >= 20; // 8 PM to 11:59 PM
  };

  const canLogAnytime = () => {
    // Check if daily limit reached (5 total: 2 check-ins + 3 anytime)
    const checkInsCount = (todayCheckIns.morning ? 1 : 0) + (todayCheckIns.evening ? 1 : 0);
    const anytimeCount = todayMoodCount - checkInsCount;
    return anytimeCount < 3; // Max 3 anytime logs
  };

  const getMorningAvailabilityMessage = () => {
    if (todayCheckIns.morning) return 'Already logged today';
    const now = new Date();
    const hour = now.getHours();
    if (hour < 6) return 'Available at 6:00 AM';
    if (hour >= 12) return 'Morning window closed (6 AM - 12 PM)';
    return 'Log now';
  };

  const getEveningAvailabilityMessage = () => {
    if (todayCheckIns.evening) return 'Already logged today';
    const now = new Date();
    const hour = now.getHours();
    if (hour < 20) return 'Available at 8:00 PM';
    return 'Log now';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch user's mood data
  useEffect(() => {
    const fetchMoodData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch today's check-ins
        const checkIns = await getTodayCheckIns(user.uid);
        setTodayCheckIns(checkIns);
        
        // Calculate streak
        const userStreak = await calculateStreak(user.uid);
        setStreak(userStreak);
        
        // Get most recent mood and count today's logs
        const allMoods = await getUserMoodLogs(user.uid);
        if (allMoods.length > 0) {
          setRecentMood(allMoods[0]); // Most recent is first
        }
        
        // Count today's total mood logs
        const today = new Date().toDateString();
        const todayLogs = allMoods.filter(log => {
          const logDate = log.timestamp.toDate().toDateString();
          return logDate === today;
        });
        setTodayMoodCount(todayLogs.length);
        
        // Store all mood logs for timeline
        setAllMoodLogs(allMoods);
      } catch (error) {
        console.error('Error fetching mood data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoodData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Open mood modal with specific check-in type
  const openMoodModal = (type = 'anytime') => {
    // Validate time restrictions
    if (type === 'morning' && !canLogMorning()) {
      alert(getMorningAvailabilityMessage());
      return;
    }
    
    if (type === 'evening' && !canLogEvening()) {
      alert(getEveningAvailabilityMessage());
      return;
    }
    
    if (type === 'anytime' && !canLogAnytime()) {
      alert('Daily mood limit reached (3/3 anytime logs used today)');
      return;
    }
    
    // Check overall 5-mood limit
    if (todayMoodCount >= 5) {
      alert('Daily mood limit reached (5/5 moods logged today)');
      return;
    }
    
    setModalCheckInType(type);
    setShowMoodModal(true);
  };

  // Refresh data after logging mood
  const handleModalClose = async () => {
    setShowMoodModal(false);
    
    // Refresh data
    try {
      const checkIns = await getTodayCheckIns(user.uid);
      setTodayCheckIns(checkIns);
      
      const userStreak = await calculateStreak(user.uid);
      setStreak(userStreak);
      
      const allMoods = await getUserMoodLogs(user.uid);
      if (allMoods.length > 0) {
        setRecentMood(allMoods[0]);
      }
      
      // Update today's count
      const today = new Date().toDateString();
      const todayLogs = allMoods.filter(log => {
        const logDate = log.timestamp.toDate().toDateString();
        return logDate === today;
      });
      setTodayMoodCount(todayLogs.length);
      
      // Update all mood logs for timeline
      setAllMoodLogs(allMoods);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Delete today's logs (for testing)
  const handleDeleteTodayLogs = async () => {
    const confirmed = window.confirm(
      '🗑️ Delete all mood logs from today?\n\nThis is for testing purposes only and cannot be undone.'
    );
    
    if (!confirmed) return;
    
    try {
      const count = await deleteTodaysMoodLogs(user.uid);
      alert(`✅ Deleted ${count} mood log(s) from today`);
      
      // Refresh the page to update all data
      window.location.reload();
    } catch (error) {
      console.error('Error deleting logs:', error);
      alert('❌ Error deleting logs. Check console for details.');
    }
  };

  // Get emoji based on mood score
  const getMoodEmoji = (score) => {
    if (!score) return '😊';
    if (score >= 9) return '😍';
    if (score >= 8) return '😊';
    if (score >= 7) return '🙂';
    if (score >= 6) return '😐';
    if (score >= 5) return '😕';
    if (score >= 4) return '😔';
    if (score >= 3) return '😢';
    if (score >= 2) return '😭';
    return '😰';
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-rose-50 to-pink-50">
      {/* Header/Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-[90rem] mx-auto px-6 sm:px-8 lg:px-8 py-3 flex items-center justify-between">
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

            <div className="hidden sm:flex items-center">
              {locationStatus === 'requesting' ? (
                <span className="text-xs text-gray-500 px-3 py-1 rounded-full border border-gray-200">
                  Locating...
                </span>
              ) : locationStatus !== 'granted' && (
                <button
                  onClick={handleEnableLocationClick}
                  className="text-xs text-rose-600 border border-rose-200 px-3 py-1 rounded-full hover:bg-rose-50 transition flex items-center gap-1"
                >
                  <span>📍</span>
                  Enable Location
                </button>
              )}
            </div>
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

                {locationStatus !== 'granted' && locationStatus !== 'requesting' && (
                  <button
                    onClick={() => {
                      handleEnableLocationClick();
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    📍 Enable Location
                  </button>
                )}
                
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
      <div className="max-w-[90rem] mx-auto px-6 sm:px-8 lg:px-8 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
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
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Today's Check-Ins</h3>
              <p className="text-gray-600 text-sm lg:text-base">Log your mood twice daily to track your journey</p>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl lg:text-3xl">🔥</span>
                <div>
                  <p className="text-rose-600 font-bold text-lg lg:text-xl">
                    {isLoading ? '...' : `${streak} Day${streak !== 1 ? 's' : ''}`}
                  </p>
                  <p className="text-rose-500 text-xs lg:text-sm">Current Streak</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Morning Check-in - Bright/Warm */}
            <div className={`rounded-2xl p-6 border shadow-lg transition-all ${
              canLogMorning() || todayCheckIns.morning
                ? 'bg-linear-to-br from-rose-500 to-pink-600 border-pink-400'
                : 'bg-gray-300 border-gray-400 opacity-70'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`rounded-full p-3 ${
                  canLogMorning() || todayCheckIns.morning ? 'bg-white/30' : 'bg-white/20'
                }`}>
                  <span className="text-3xl lg:text-4xl">🌅</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg lg:text-xl">Morning (6-12 AM)</h4>
                  <p className={`text-sm ${
                    canLogMorning() || todayCheckIns.morning ? 'text-white/90' : 'text-white/70'
                  }`}>
                    How was your morning?
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                {todayCheckIns.morning ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl lg:text-3xl">{getMoodEmoji(todayCheckIns.morning.moodScore)}</span>
                      <span className="text-white font-bold text-2xl lg:text-3xl">
                        {todayCheckIns.morning.moodScore}/10
                      </span>
                    </div>
                    <span className="bg-white text-rose-600 text-xs px-3 py-1 rounded-full font-semibold">
                      ✓ Logged
                    </span>
                  </>
                ) : canLogMorning() ? (
                  <>
                    <span className="text-white/80 text-sm">Available now</span>
                    <button 
                      onClick={() => openMoodModal('morning')}
                      className="bg-white text-rose-600 px-4 py-2 rounded-full font-semibold hover:bg-rose-50 transition-all text-sm lg:text-base"
                    >
                      Log Now
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-white/70 text-xs">{getMorningAvailabilityMessage()}</span>
                    <button 
                      disabled
                      title={getMorningAvailabilityMessage()}
                      className="bg-white/50 text-gray-600 px-4 py-2 rounded-full font-semibold cursor-not-allowed text-sm"
                    >
                      Unavailable
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Evening Check-in - Dark/Cool */}
            <div className={`rounded-2xl p-6 border shadow-lg transition-all ${
              canLogEvening() || todayCheckIns.evening
                ? 'bg-linear-to-br from-pink-600 to-rose-700 border-rose-500'
                : 'bg-gray-400 border-gray-500 opacity-70'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`rounded-full p-3 ${
                  canLogEvening() || todayCheckIns.evening ? 'bg-white/10' : 'bg-white/5'
                }`}>
                  <span className="text-3xl lg:text-4xl">🌙</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg lg:text-xl">Evening (8 PM-11:59 PM)</h4>
                  <p className={`text-sm ${
                    canLogEvening() || todayCheckIns.evening ? 'text-white/80' : 'text-white/60'
                  }`}>
                    How was your day?
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                {todayCheckIns.evening ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl lg:text-3xl">{getMoodEmoji(todayCheckIns.evening.moodScore)}</span>
                      <span className="text-white font-bold text-2xl lg:text-3xl">
                        {todayCheckIns.evening.moodScore}/10
                      </span>
                    </div>
                    <span className="bg-white text-pink-600 text-xs px-3 py-1 rounded-full font-semibold">
                      ✓ Logged
                    </span>
                  </>
                ) : canLogEvening() ? (
                  <>
                    <span className="text-white/70 text-sm">Available now</span>
                    <button 
                      onClick={() => openMoodModal('evening')}
                      className="bg-white text-rose-800 px-4 py-2 rounded-full font-semibold hover:bg-rose-50 transition-all text-sm lg:text-base"
                    >
                      Log Now
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-white/60 text-xs">{getEveningAvailabilityMessage()}</span>
                    <button 
                      disabled
                      title={getEveningAvailabilityMessage()}
                      className="bg-white/30 text-gray-700 px-4 py-2 rounded-full font-semibold cursor-not-allowed text-sm"
                    >
                      Unavailable
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-linear-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="text-rose-800 text-sm font-semibold">
                    {todayCheckIns.morning && todayCheckIns.evening 
                      ? "Amazing! You've completed both check-ins today! 🎉"
                      : todayCheckIns.morning && !todayCheckIns.evening
                      ? "Great start! Don't forget your evening check-in at 10 PM"
                      : !todayCheckIns.morning && todayCheckIns.evening
                      ? "Evening logged! Remember morning check-in (6 AM - 12 PM)"
                      : "Start your day right! Log your morning mood between 6 AM - 12 PM"
                    }
                  </p>
                  <p className="text-rose-600 text-xs mt-1">
                    {todayMoodCount}/5 moods logged today • Keep your {streak}-day streak alive!
                  </p>
                </div>
              </div>
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
            <div className="text-4xl mb-3">
              {isLoading ? '⏳' : recentMood ? getMoodEmoji(recentMood.moodScore) : '😊'}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {isLoading ? 'Loading...' : recentMood ? `${recentMood.moodScore}/10` : 'No data'}
            </h3>
            <p className="text-gray-600 lg:text-lg">Your Recent Mood</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="text-4xl lg:text-5xl mb-3">📊</div>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
              {isLoading ? 'Loading...' : `${streak} day${streak !== 1 ? 's' : ''}`}
            </h3>
            <p className="text-gray-600 lg:text-lg">Current Streak</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="text-4xl lg:text-5xl mb-3">🎯</div>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">8.2/10</h3>
            <p className="text-gray-600 lg:text-lg">Community Average</p>
          </motion.div>
        </div>

        {/* Log Mood Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`rounded-3xl shadow-2xl p-12 text-center text-white transition-all ${
            canLogAnytime() && todayMoodCount < 5
              ? 'bg-linear-to-r from-rose-600 to-pink-600'
              : 'bg-gray-400'
          }`}
        >
          <h3 className="text-3xl font-bold mb-4">How are you feeling today?</h3>
          <p className="text-white/90 mb-2">
            Log your mood to see personalized insights and trends
          </p>
          <p className="text-white/80 text-sm mb-6">
            {todayMoodCount}/5 moods logged today
            {canLogAnytime() && todayMoodCount < 5 && (
              <span className="ml-2">
                ({3 - (todayMoodCount - (todayCheckIns.morning ? 1 : 0) - (todayCheckIns.evening ? 1 : 0))}/3 anytime logs available)
              </span>
            )}
          </p>
          <div className="flex items-center justify-center gap-4">
            {canLogAnytime() && todayMoodCount < 5 ? (
              <button 
                onClick={() => openMoodModal('anytime')}
                className="bg-white text-rose-500 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Log Your Mood →
              </button>
            ) : (
              <button 
                disabled
                className="bg-white/50 text-gray-700 px-8 py-4 rounded-full font-bold cursor-not-allowed shadow-lg"
              >
                {todayMoodCount >= 5 ? 'Daily Limit Reached (5/5)' : 'Anytime Logs Full (3/3)'}
              </button>
            )}
          </div>
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

        {/* Mood Timeline Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <MoodTimeline moodLogs={allMoodLogs} />
        </motion.div>

        {/* Events Near You Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <EventsWidget recentMood={recentMood} userLocation={userLocation} />
        </motion.div>
      </div>

      {/* Mood Log Modal */}
      <MoodLogModal 
        isOpen={showMoodModal}
        onClose={handleModalClose}
        user={user}
        checkInType={modalCheckInType}
      />
    </div>
  );
};

export default Dashboard;
