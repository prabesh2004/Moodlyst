# Real-Time Mood Map Implementation Progress

## Overview
Implementing the core feature of Moodlyst: real-time mood aggregation by location, allowing users to see authentic emotion data on a map.

---

## ✅ Step 1: Save Location with Mood Logs (COMPLETE)

### Changes Made

#### 1. **moodService.js** - Added Location Support
- **New Function**: `reverseGeocode(latitude, longitude)`
  - Uses OpenStreetMap Nominatim API
  - Returns: city, region, country, countryCode
  - Handles errors gracefully (returns 'Unknown' if fails)

- **Updated Function**: `saveMoodLog(moodData)`
  - Now accepts optional `location` object: `{latitude, longitude}`
  - Automatically reverse geocodes coordinates to get city/region
  - Saves complete location data to Firestore:
    ```javascript
    location: {
      latitude: number,
      longitude: number,
      city: string,
      region: string,
      country: string,
      countryCode: string
    }
    ```
  - Console logs location info when saved: `📍 Location added: Seattle, WA`

#### 2. **MoodLogModal.jsx** - Already Compatible!
- Already requests location permission when modal opens
- Already passes location to `saveMoodLog()` if available
- Shows feedback: "📍 Location saved" in success alert
- Gracefully handles denied/unavailable location

#### 3. **Dashboard.jsx** - No Changes Needed
- Already has location permission UI (added previously)
- MoodLogModal handles location internally
- Location automatically included when user logs mood

### Testing Checklist
- [ ] Log a mood with location enabled → Check Firestore for location data
- [ ] Log a mood with location denied → Should save mood without location
- [ ] Verify city/region correctly reverse geocoded
- [ ] Check console for "📍 Location added" message

---

## 🔄 Step 2: City Mood Aggregation (TODO)

### Goal
Create aggregated city-level mood data that updates when users log moods.

### Implementation Plan

#### Option A: Cloud Functions (Recommended for Scale)
```javascript
// Firestore trigger: onCreate('moodLogs/{logId}')
exports.updateCityMood = functions.firestore
  .document('moodLogs/{logId}')
  .onCreate(async (snap, context) => {
    const moodLog = snap.data();
    
    if (!moodLog.location) return; // Skip if no location
    
    const cityKey = `${moodLog.location.city}_${moodLog.location.region}_${moodLog.location.countryCode}`;
    const cityRef = db.collection('cityMoods').doc(cityKey);
    
    await cityRef.set({
      city: moodLog.location.city,
      region: moodLog.location.region,
      country: moodLog.location.country,
      countryCode: moodLog.location.countryCode,
      
      // Aggregate calculations
      totalLogs: FieldValue.increment(1),
      moodSum: FieldValue.increment(moodLog.moodScore),
      averageMood: // Calculate: moodSum / totalLogs
      
      lastUpdated: FieldValue.serverTimestamp()
    }, { merge: true });
  });
```

#### Option B: Client-Side Aggregation (Simple, No Backend)
```javascript
// In moodService.js
export const updateCityMoodAggregate = async (moodLog) => {
  const cityKey = `${moodLog.location.city}_${moodLog.location.region}`;
  const cityRef = doc(db, 'cityMoods', cityKey);
  
  const cityDoc = await getDoc(cityRef);
  
  if (cityDoc.exists()) {
    const current = cityDoc.data();
    const newTotal = current.totalLogs + 1;
    const newSum = current.moodSum + moodLog.moodScore;
    
    await updateDoc(cityRef, {
      totalLogs: newTotal,
      moodSum: newSum,
      averageMood: newSum / newTotal,
      lastUpdated: Timestamp.now()
    });
  } else {
    await setDoc(cityRef, {
      city: moodLog.location.city,
      region: moodLog.location.region,
      country: moodLog.location.country,
      totalLogs: 1,
      moodSum: moodLog.moodScore,
      averageMood: moodLog.moodScore,
      lastUpdated: Timestamp.now()
    });
  }
};
```

### Database Schema: `cityMoods` Collection
```
cityMoods/
  {cityKey}/  // e.g., "Seattle_Washington_US"
    city: "Seattle"
    region: "Washington"
    country: "United States"
    countryCode: "US"
    totalLogs: 47
    moodSum: 329
    averageMood: 7.0 (calculated)
    lastUpdated: Timestamp
```

### Privacy Considerations
- ✅ Individual mood logs: **Private** (only user can see their own)
- ✅ City aggregates: **Public** (anonymous, no individual data exposed)
- ✅ Minimum threshold: Only show cities with 5+ logs (prevent identification)

---

## 🔄 Step 3: Update MapPage with Real Data (TODO)

### Current State
- MapPage shows dummy hardcoded cities
- No connection to Firestore

### Changes Needed

#### 1. Fetch Real City Data
```javascript
// In MapPage.jsx
const [cities, setCities] = useState([]);

useEffect(() => {
  const fetchCityMoods = async () => {
    const cityMoodsRef = collection(db, 'cityMoods');
    const q = query(cityMoodsRef, where('totalLogs', '>=', 5)); // Privacy threshold
    const snapshot = await getDocs(q);
    
    const cityData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Need to geocode city name → coordinates
      coordinates: await geocodeCityName(doc.data().city, doc.data().region)
    }));
    
    setCities(cityData);
  };
  
  fetchCityMoods();
}, []);
```

#### 2. Geocode City Names to Coordinates
```javascript
// Helper function
const geocodeCityName = async (city, region) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${city},${region}`
  );
  const data = await response.json();
  if (data[0]) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    };
  }
  return null;
};
```

#### 3. Color Markers by Mood Score
```javascript
const getMoodColor = (averageMood) => {
  if (averageMood >= 7) return '#10b981'; // Green (happy)
  if (averageMood >= 5) return '#f59e0b'; // Yellow (neutral)
  return '#ef4444'; // Red (sad)
};

// In marker rendering
<CircleMarker
  center={[city.coordinates.lat, city.coordinates.lng]}
  radius={10}
  pathOptions={{ 
    fillColor: getMoodColor(city.averageMood),
    fillOpacity: 0.7,
    color: 'white',
    weight: 2
  }}
>
  <Popup>
    <strong>{city.city}, {city.region}</strong><br/>
    Average Mood: {city.averageMood.toFixed(1)}/10<br/>
    Total Logs: {city.totalLogs}
  </Popup>
</CircleMarker>
```

---

## 🔄 Step 4: Real-Time Updates (TODO)

### Goal
Map updates live when users log moods (no page refresh needed).

### Implementation
```javascript
// In MapPage.jsx
useEffect(() => {
  const cityMoodsRef = collection(db, 'cityMoods');
  const q = query(cityMoodsRef, where('totalLogs', '>=', 5));
  
  // Real-time listener
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const cityData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Geocode and update state
    Promise.all(cityData.map(async (city) => ({
      ...city,
      coordinates: await geocodeCityName(city.city, city.region)
    }))).then(setCities);
  });
  
  return () => unsubscribe(); // Cleanup on unmount
}, []);
```

### Performance Considerations
- Rate limit updates (debounce 2-3 seconds)
- Cache geocoded coordinates in localStorage
- Only re-geocode new cities

---

## 📊 Future Enhancements

### Event Mood Aggregation
- Tag events when logging moods (already supported via `eventId`)
- Create `eventMoods` collection with average mood per event
- Show event ratings based on attendee moods

### Social Features
- Friends list
- See friends' mood trends (with permission)
- Group mood comparisons

### Analytics Dashboard
- Personal mood trends over time
- City comparisons ("Seattle is 15% happier than NYC")
- Best/worst days of the week by mood

### Privacy Controls
- User setting: Share mood publicly (default: only aggregated)
- Anonymous mode: Don't contribute to city aggregates
- Data retention: Auto-delete moods after 90 days

---

## Testing & Validation

### Step 1 Testing (Current)
1. **Test with location enabled**:
   - Open Dashboard → Click "Log Your Mood"
   - Allow location permission
   - Submit mood
   - Check Firestore `moodLogs` collection for `location` field
   - Verify console shows: `📍 Location added: [City], [Region]`

2. **Test without location**:
   - Deny location permission
   - Log mood
   - Verify mood saves successfully (no location field)
   - Check alert shows no "📍 Location saved" message

3. **Test reverse geocoding accuracy**:
   - Check if city/region names are correct
   - Try different locations (use browser dev tools to spoof location)

### Step 2 Testing
- Log multiple moods from same city
- Verify `cityMoods` aggregates update correctly
- Check averageMood calculation accuracy

### Step 3 Testing
- MapPage shows real cities (not dummy data)
- Marker colors match mood scores
- Popup displays correct city info
- Only cities with 5+ logs appear (privacy threshold)

### Step 4 Testing
- Log mood in one browser tab
- Watch MapPage in another tab update live
- Verify no excessive re-renders

---

## Success Metrics

✅ **Step 1 Complete When**:
- Mood logs save with location data
- Reverse geocoding works for all logs
- No breaking changes to existing functionality

⏳ **Step 2 Complete When**:
- City aggregates update automatically
- Average mood calculated correctly
- Privacy threshold enforced (5+ logs)

⏳ **Step 3 Complete When**:
- MapPage shows real data (no dummy data)
- Markers positioned correctly
- Colors reflect mood scores accurately

⏳ **Step 4 Complete When**:
- Map updates in real-time (< 3 seconds latency)
- No performance issues with 100+ cities
- Smooth UX with loading states

---

## Next Immediate Action
**Test Step 1**: Log a mood with location enabled, check Firestore for location data.
