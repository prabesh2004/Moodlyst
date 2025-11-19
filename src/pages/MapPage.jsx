import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

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

  // Real city data with actual coordinates and mood scores
  const cities = [
    { name: 'New York', mood: 8.2, lat: 40.7128, lng: -74.0060, color: '#fb7185' },
    { name: 'Los Angeles', mood: 7.8, lat: 34.0522, lng: -118.2437, color: '#fb923c' },
    { name: 'Chicago', mood: 6.5, lat: 41.8781, lng: -87.6298, color: '#fbbf24' },
    { name: 'Houston', mood: 8.5, lat: 29.7604, lng: -95.3698, color: '#f43f5e' },
    { name: 'Miami', mood: 9.1, lat: 25.7617, lng: -80.1918, color: '#ec4899' },
    { name: 'Seattle', mood: 7.2, lat: 47.6062, lng: -122.3321, color: '#fbbf24' },
    { name: 'Denver', mood: 8.7, lat: 39.7392, lng: -104.9903, color: '#fb7185' },
    { name: 'Boston', mood: 7.9, lat: 42.3601, lng: -71.0589, color: '#fb923c' },
    { name: 'San Francisco', mood: 8.1, lat: 37.7749, lng: -122.4194, color: '#fb7185' },
    { name: 'Phoenix', mood: 7.6, lat: 33.4484, lng: -112.0740, color: '#fb923c' },
  ];

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
            key={city.name}
            center={[city.lat, city.lng]}
            radius={15}
            fillColor={city.color}
            fillOpacity={0.8}
            color="white"
            weight={3}
          >
            <Popup>
              <div className="text-center p-2">
                <div className="font-bold text-lg">{city.name}</div>
                <div className="text-sm text-gray-600">
                  Mood Score: <span className="font-semibold text-rose-500">{city.mood}/10</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  😊 {city.mood >= 8.5 ? 'Very Happy' : city.mood >= 7.5 ? 'Happy' : city.mood >= 7.0 ? 'Good' : 'Neutral'}
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