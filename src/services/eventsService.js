// Events Service - Fetches events from Ticketmaster API

const API_KEY = import.meta.env.VITE_TICKETMASTER_API_KEY || 'demo-key';
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2';

/**
 * Get events near a location
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @param {number} radius - Search radius in miles (default: 25)
 * @param {string} category - Event category (Music, Sports, Arts, etc.)
 * @returns {Promise<Array>} Array of events
 */
export const getEventsNearby = async (latitude, longitude, radius = 25, category = '') => {
  try {
    // Build the API URL
    let url = `${BASE_URL}/events.json?apikey=${API_KEY}&latlong=${latitude},${longitude}&radius=${radius}&unit=miles&sort=date,asc`;
    
    // Add category filter if specified
    if (category) {
      url += `&classificationName=${category}`;
    }
    
    console.log('🎫 Fetching events from Ticketmaster...');
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Check if we got events
    if (data._embedded && data._embedded.events) {
      console.log(`✅ Found ${data._embedded.events.length} events!`);
      
      // Format the events data for easier use
      const formattedEvents = data._embedded.events.map(event => ({
        id: event.id,
        name: event.name,
        date: event.dates.start.localDate,
        time: event.dates.start.localTime || 'TBA',
        venue: event._embedded?.venues?.[0]?.name || 'Venue TBA',
        city: event._embedded?.venues?.[0]?.city?.name || '',
        state: event._embedded?.venues?.[0]?.state?.stateCode || '',
        image: event.images?.[0]?.url || '',
        category: event.classifications?.[0]?.segment?.name || 'Event',
        url: event.url,
        priceRange: event.priceRanges?.[0] 
          ? `$${event.priceRanges[0].min} - $${event.priceRanges[0].max}`
          : 'Price TBA'
      }));
      
      return formattedEvents;
    } else {
      console.log('ℹ️ No events found in this area');
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching events:', error);
    return [];
  }
};

/**
 * Get mood-based event recommendations
 * @param {number} moodScore - User's recent mood score (0-10)
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @param {number} size - Maximum number of events to return (default: 18)
 * @returns {Promise<Array>} Array of recommended events
 */
export const getMoodBasedEvents = async (moodScore, latitude, longitude, size = 18) => {
  console.log(`🎭 Fetching events for mood score ${moodScore}`);
  
  // Strategy 1: Try with NO category filter first (get all events)
  const allEventsNoFilter = await getEventsNearby(latitude, longitude, 50, '');
  
  console.log(`📊 Found ${allEventsNoFilter.length} total events nearby`);
  
  // If we got enough events, return them
  if (allEventsNoFilter.length >= size) {
    return allEventsNoFilter.slice(0, size);
  }
  
  // Strategy 2: If still not enough, try wider radius (100 miles)
  if (allEventsNoFilter.length < size) {
    console.log(`🔍 Searching wider area (100 miles)...`);
    const widerSearch = await getEventsNearby(latitude, longitude, 100, '');
    console.log(`📊 Found ${widerSearch.length} events in wider area`);
    
    // Remove duplicates
    const uniqueEvents = Array.from(new Map(widerSearch.map(e => [e.id, e])).values());
    return uniqueEvents.slice(0, size);
  }
  
  return allEventsNoFilter;
};

/**
 * Get demo/sample events (for when API key is not set or for testing)
 */
export const getDemoEvents = () => {
  return [
    {
      id: 'demo-1',
      name: 'Summer Music Festival',
      date: '2025-11-15',
      time: '18:00:00',
      venue: 'Central Park',
      city: 'New York',
      state: 'NY',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
      category: 'Music',
      url: '#',
      priceRange: '$50 - $150'
    },
    {
      id: 'demo-2',
      name: 'Comedy Night Live',
      date: '2025-11-18',
      time: '20:00:00',
      venue: 'Comedy Club Downtown',
      city: 'Los Angeles',
      state: 'CA',
      image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800',
      category: 'Comedy',
      url: '#',
      priceRange: '$25 - $40'
    },
    {
      id: 'demo-3',
      name: 'Art Gallery Opening',
      date: '2025-11-20',
      time: '17:00:00',
      venue: 'Modern Art Museum',
      city: 'Chicago',
      state: 'IL',
      image: 'https://images.unsplash.com/photo-1578926314433-e2789279f4aa?w=800',
      category: 'Arts',
      url: '#',
      priceRange: 'Free'
    }
  ];
};
