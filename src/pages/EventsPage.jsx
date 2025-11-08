import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { 
  IoSearchOutline, 
  IoFilterOutline, 
  IoCalendarOutline, 
  IoLocationOutline,
  IoTicketOutline
} from 'react-icons/io5';
import { getEventsNearby, getMoodBasedEvents, getDemoEvents } from '../services/eventsService';
import { auth } from '../firebase';
import EventDetailModal from '../components/EventDetailModal';

const EventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('All');
  const [selectedDistance, setSelectedDistance] = useState('50');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const categories = ['All', 'Music', 'Sports', 'Arts & Theatre', 'Family', 'Film', 'Miscellaneous'];
  const dateRanges = ['All', 'Today', 'This Week', 'This Month', 'Next Month'];
  const distances = ['10', '25', '50', '100'];

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied, using demo data');
        }
      );
    }
  }, []);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);

      try {
        const hasApiKey = import.meta.env.VITE_TICKETMASTER_API_KEY;
        
        if (!hasApiKey || !userLocation) {
          console.log('Using demo events');
          const demoEvents = getDemoEvents();
          setEvents(demoEvents);
          setFilteredEvents(demoEvents);
          setIsLoading(false);
          return;
        }

        // Fetch events based on location and distance
        const eventsList = await getEventsNearby(
          userLocation.latitude,
          userLocation.longitude,
          parseInt(selectedDistance),
          selectedCategory === 'All' ? '' : selectedCategory
        );

        setEvents(eventsList);
        setFilteredEvents(eventsList);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        const demoEvents = getDemoEvents();
        setEvents(demoEvents);
        setFilteredEvents(demoEvents);
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [userLocation, selectedDistance, selectedCategory]);

  // Apply filters
  useEffect(() => {
    let filtered = [...events];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date range filter
    if (selectedDateRange !== 'All') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        
        switch (selectedDateRange) {
          case 'Today':
            return eventDate.toDateString() === today.toDateString();
          case 'This Week':
            const weekFromNow = new Date(today);
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return eventDate >= today && eventDate <= weekFromNow;
          case 'This Month':
            return eventDate.getMonth() === today.getMonth() && 
                   eventDate.getFullYear() === today.getFullYear();
          case 'Next Month':
            const nextMonth = new Date(today);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            return eventDate.getMonth() === nextMonth.getMonth() && 
                   eventDate.getFullYear() === nextMonth.getFullYear();
          default:
            return true;
        }
      });
    }

    setFilteredEvents(filtered);
    setVisibleCount(12); // Reset visible count when filters change
  }, [searchQuery, selectedDateRange, events]);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 12, filteredEvents.length));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-rose-50">
      {/* Dashboard-style Navbar - Extra Compact */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 
              className="text-lg font-bold text-gray-900 cursor-pointer hover:text-rose-500 transition-colors"
              onClick={() => navigate('/dashboard')}
            >
              Moodlyst
            </h1>
            
            <button
              className="text-xs text-gray-600 hover:text-rose-500 font-medium transition-colors hidden sm:block"
            >
              Events Near You
            </button>
          </div>
          
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              {auth.currentUser?.photoURL ? (
                <img 
                  src={auth.currentUser.photoURL} 
                  alt={auth.currentUser.displayName}
                  className="w-8 h-8 rounded-full border-2 border-rose-200 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-rose-200 bg-rose-500 text-white flex items-center justify-center font-bold text-sm">
                  {auth.currentUser?.displayName?.[0] || auth.currentUser?.email?.[0] || 'U'}
                </div>
              )}
              <span className="text-xs text-gray-700 font-medium hidden md:block">
                {auth.currentUser?.displayName?.split(' ')[0] || auth.currentUser?.email?.split('@')[0]}
              </span>
              <svg 
                className="w-3 h-3 text-gray-500 hidden md:block" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{auth.currentUser?.displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{auth.currentUser?.email}</p>
                </div>
                
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  🏠 Dashboard
                </button>
                
                <button
                  onClick={() => {
                    navigate('/map');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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

      {/* Search & Filter Bar - Compact with visible search bar */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="flex items-center justify-between gap-2">
            {/* Search Bar - Always visible, compact */}
            <div className="flex-1 max-w-md relative">
              <IoSearchOutline className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-xs border border-gray-300 rounded-md focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition-all bg-white"
              />
            </div>

            {/* Filters Button - Compact */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-md transition-colors font-medium whitespace-nowrap text-xs"
            >
              <IoFilterOutline className="w-3.5 h-3.5" />
              <span>Filters</span>
              {(selectedCategory !== 'All' || selectedDateRange !== 'All' || selectedDistance !== '50') && (
                <span className="px-1 py-0.5 bg-white text-rose-600 text-xs rounded-full font-bold leading-none">
                  {[selectedCategory !== 'All', selectedDateRange !== 'All', selectedDistance !== '50'].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2"
              >
                <div className="p-2.5 rounded-lg space-y-2.5">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {categories.map(category => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                            selectedCategory === category
                              ? 'bg-rose-500 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      When
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {dateRanges.map(range => (
                        <button
                          key={range}
                          onClick={() => setSelectedDateRange(range)}
                          className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                            selectedDateRange === range
                              ? 'bg-orange-500 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Distance Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Distance (miles)
                    </label>
                    <div className="flex gap-1.5">
                      {distances.map(distance => (
                        <button
                          key={distance}
                          onClick={() => setSelectedDistance(distance)}
                          className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                            selectedDistance === distance
                              ? 'bg-purple-500 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {distance}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            {isLoading ? (
              'Loading events...'
            ) : (
              <>
                Showing <span className="font-semibold text-gray-900">{Math.min(visibleCount, filteredEvents.length)}</span> of{' '}
                <span className="font-semibold text-gray-900">{filteredEvents.length}</span> events
              </>
            )}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <IoTicketOutline className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedDateRange('All');
                setSelectedDistance('50');
              }}
              className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Events Grid */}
        {!isLoading && filteredEvents.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.slice(0, visibleCount).map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleEventClick(event)}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group"
                >
                  {/* Event Image */}
                  {event.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute top-3 left-3 px-3 py-1 bg-rose-500 text-white text-xs font-semibold rounded-full">
                        {event.category}
                      </span>
                      {event.distance && (
                        <span className="absolute top-3 right-3 px-3 py-1 bg-white/90 text-gray-800 text-xs font-semibold rounded-full">
                          {event.distance.toFixed(1)} mi
                        </span>
                      )}
                    </div>
                  )}

                  {/* Event Details */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-rose-600 transition-colors">
                      {event.name}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <IoCalendarOutline className="w-4 h-4 shrink-0" />
                        <span className="line-clamp-1">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                          {event.time !== 'TBA' && ` • ${event.time}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <IoLocationOutline className="w-4 h-4 shrink-0" />
                        <span className="line-clamp-1">{event.venue}</span>
                      </div>

                      {event.city && event.state && (
                        <p className="text-xs text-gray-500">
                          {event.city}, {event.state}
                        </p>
                      )}

                      <div className="pt-2 flex items-center justify-between">
                        <span className="font-semibold text-gray-900">{event.priceRange}</span>
                        <span className="text-rose-600 font-medium group-hover:underline">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More Button */}
            {visibleCount < filteredEvents.length && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Load More Events ({filteredEvents.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default EventsPage;
