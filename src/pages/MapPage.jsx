import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { subscribeToCityMoods } from '../services/moodService';

// Component to update map center dynamically
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const MapPage = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([39.8283, -98.5795]);
  const [mapZoom, setMapZoom] = useState(4);
  const [locationStatus, setLocationStatus] = useState('requesting');
  const [isMapReady, setIsMapReady] = useState(false);
  const [cities, setCities] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);

  // Get mood color based on score (using rose/pink palette)
  const getMoodColor = (averageMood) => {
    if (averageMood >= 8) return '#10b981'; // Bright green (very happy)
    if (averageMood >= 7) return '#84cc16'; // Light green (happy)
    if (averageMood >= 6) return '#fbbf24'; // Yellow (good)
    if (averageMood >= 5) return '#fb923c'; // Orange (neutral)
    if (averageMood >= 4) return '#f87171'; // Light red (low)
    return '#ef4444'; // Red (very low)
  };

  // Get mood label based on score
  const getMoodLabel = (averageMood) => {
    if (averageMood >= 8.5) return 'Very Happy';
    if (averageMood >= 7.5) return 'Happy';
    if (averageMood >= 6.5) return 'Good';
    if (averageMood >= 5.5) return 'Neutral';
    if (averageMood >= 4) return 'Low';
    return 'Very Low';
  };

  // Fetch city moods from Firestore with real-time updates
  useEffect(() => {
    console.log('🔄 Setting up real-time city mood listener...');
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToCityMoods((cityData) => {
      setCities(cityData);
      setIsLoadingCities(false);
      console.log('🗺️ Real-time city moods updated:', cityData.length, 'cities');
    }, 1); // Min 1 log (increase to 5 for privacy in production)
    
    // Cleanup subscription on unmount
    return () => {
      console.log('🔌 Unsubscribing from city mood updates');
      unsubscribe();
    };
  }, []);

  // Request location IMMEDIATELY on mount (before map loads)
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };
          setUserLocation(newLocation);
          setMapCenter([latitude, longitude]);
          setMapZoom(11);
          setLocationStatus('allowed');
          setIsMapReady(true); // Map can now load with correct center
        },
        (error) => {
          setLocationStatus('denied');
          setIsMapReady(true); // Load map anyway with default center
          console.log('Location denied:', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      setLocationStatus('unsupported');
      setIsMapReady(true);
    }
  }, []);

  return (
    <div className="relative w-full h-screen">
      {/* Loading Screen - Show while requesting location */}
      {!isMapReady && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center">
          <div className="text-6xl mb-4 animate-bounce">📍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Requesting Location</h2>
          <p className="text-gray-600">Please allow location access to see events near you</p>
          <div className="mt-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          </div>
        </div>
      )}

      {/* Full Screen Map - Only render when ready */}
      {isMapReady && (
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          dragging={true}
          touchZoom={true}
          doubleClickZoom={true}
          zoomControl={true}
        >
          <MapUpdater center={mapCenter} zoom={mapZoom} />
        
        {/* Map Tiles - Google Maps Style */}
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
          maxZoom={20}
        />

        {/* User Location Marker */}
        {userLocation && (
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={20}
            fillColor="#3b82f6"
            fillOpacity={0.3}
            color="#3b82f6"
            weight={3}
          >
            <Popup>
              <div className="text-center p-2">
                <div className="font-bold text-lg">📍 You are here!</div>
                <div className="text-xs text-gray-500 mt-1">
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        )}

        {/* City Markers */}
        {cities.map((city) => (
          <CircleMarker
            key={city.id}
            center={[city.latitude, city.longitude]}
            radius={Math.min(10 + city.totalLogs * 2, 25)} // Size based on number of logs
            fillColor={getMoodColor(city.averageMood)}
            fillOpacity={0.7}
            color="white"
            weight={2}
          >
            <Popup>
              <div className="text-center p-2">
                <div className="font-bold text-lg">{city.city}</div>
                <div className="text-xs text-gray-500">{city.region}, {city.countryCode}</div>
                <div className="text-sm text-gray-600 mt-2">
                  Average Mood: <span className="font-semibold" style={{ color: getMoodColor(city.averageMood) }}>
                    {city.averageMood}/10
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {getMoodLabel(city.averageMood)} • {city.totalLogs} {city.totalLogs === 1 ? 'log' : 'logs'}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        </MapContainer>
      )}

      {/* Floating Header - Show after map loads */}
      {isMapReady && (
      <div className="absolute top-0 left-0 right-0 z-1000 p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-white transition-colors"
          >
            <span className="text-xl">←</span>
            <span className="font-medium">Back to Home</span>
          </button>

          {/* Location Status Badge */}
          <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
            {locationStatus === 'checking' && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </div>
            )}
            {locationStatus === 'allowed' && (
              <div className="flex items-center gap-2 text-sm text-green-700">
                <span>📍</span>
                Your Location
              </div>
            )}
            {locationStatus === 'denied' && (
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <span>🗺️</span>
                USA Map
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Floating Info Card - Show after map loads */}
      {isMapReady && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-1000 max-w-md w-full mx-4">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Explore Mood Trends 🗺️
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Click on any marker to see the mood score. Use pinch to zoom, drag to explore.
          </p>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
              <span className="text-gray-600">Very Happy (8.5+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
              <span className="text-gray-600">Happy (7.5-8.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
              <span className="text-gray-600">Good (7.0-7.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-gray-600">Neutral (6.0-7.0)</span>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default MapPage;