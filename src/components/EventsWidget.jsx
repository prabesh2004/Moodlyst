import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getMoodBasedEvents, getDemoEvents } from '../services/eventsService';

const EventsWidget = ({ recentMood, userLocation }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if we have API key
        const hasApiKey = import.meta.env.VITE_TICKETMASTER_API_KEY;
        
        if (!hasApiKey) {
          console.log('ℹ️ No API key found, using demo events');
          setEvents(getDemoEvents());
          setIsLoading(false);
          return;
        }

        // Check if we have location
        if (!userLocation) {
          console.log('ℹ️ No location available, using demo events');
          setEvents(getDemoEvents());
          setIsLoading(false);
          return;
        }

        // Fetch real events based on mood
        const moodScore = recentMood?.moodScore || 7;
        const eventsList = await getMoodBasedEvents(
          moodScore,
          userLocation.latitude,
          userLocation.longitude,
          18 // Fetch up to 18 events
        );

        console.log(`✅ Fetched ${eventsList.length} events from API`);
        
        if (eventsList.length === 0) {
          // No events found, use demo
          setEvents(getDemoEvents());
        } else {
          setEvents(eventsList);
        }
      } catch (err) {
        console.error('Error loading events:', err);
        setError('Failed to load events');
        setEvents(getDemoEvents());
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [recentMood, userLocation]);

  // Get emoji based on mood
  const getMoodEmoji = (score) => {
    if (!score) return '🎉';
    if (score >= 8) return '🎉';
    if (score >= 6) return '🎭';
    if (score >= 4) return '🎨';
    return '🌿';
  };

  // Get mood-based title
  const getMoodBasedTitle = () => {
    const score = recentMood?.moodScore || 7;
    if (score >= 8) return 'You\'re feeling great! Check out these events:';
    if (score >= 6) return 'Events you might enjoy:';
    if (score >= 4) return 'Relaxing activities nearby:';
    return 'Gentle events to lift your spirits:';
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-2xl font-bold text-gray-900">Events Near You</h3>
            <span className="text-3xl">{getMoodEmoji(recentMood?.moodScore)}</span>
          </div>
          <p className="text-gray-600 text-sm">
            {getMoodBasedTitle()}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {!import.meta.env.VITE_TICKETMASTER_API_KEY && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
              <p className="text-xs text-yellow-700 font-medium">Demo Mode</p>
            </div>
          )}
          
          <button
            onClick={() => navigate('/events')}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            View All Events 🎉
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">😕</div>
          <p className="text-gray-600">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, visibleCount).map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-rose-300"
              >
                {/* Event Image */}
                <div className="relative h-48 bg-linear-to-br from-rose-100 to-orange-100 overflow-hidden">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🎪
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-3 py-1 rounded-full font-semibold">
                      {event.category}
                    </span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-5">
                  <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-rose-600 transition-colors">
                    {event.name}
                  </h4>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span>💰</span>
                      <span className="font-semibold text-rose-600">{event.priceRange}</span>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <div className="mt-4">
                    <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-lg font-semibold text-sm text-center group-hover:bg-rose-500 group-hover:text-white transition-colors">
                      View Details →
                    </div>
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
          </div>

          {/* Load More Button */}
          {visibleCount < events.length && (
            <div className="mt-8 text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  console.log(`📊 Loading more: current ${visibleCount}, total ${events.length}`);
                  setVisibleCount(prev => prev + 6);
                }}
                className="bg-linear-to-r from-rose-500 to-orange-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Load More Events 🎉
              </motion.button>
              <p className="text-gray-500 text-sm mt-3">
                Showing {visibleCount} of {events.length} events
              </p>
            </div>
          )}
        </>
      )}

      {events.length === 0 && !isLoading && !error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎪</div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">No events found</h4>
          <p className="text-gray-600">Check back later for new events in your area!</p>
        </div>
      )}
    </div>
  );
};

export default EventsWidget;
