import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';

// Collection names
const MOOD_LOGS_COLLECTION = 'moodLogs';
const USERS_COLLECTION = 'users';
const CITY_MOODS_COLLECTION = 'cityMoods';

/**
 * Reverse geocode coordinates to get city/region info using BigDataCloud API
 * Free API with no key required and CORS support
 */
const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📍 Reverse geocode response:', data);
    
    // BigDataCloud provides: city, locality, principalSubdivision, countryName, countryCode
    const city = data.city || data.locality || data.localityInfo?.administrative?.[3]?.name || 'Unknown';
    const region = data.principalSubdivision || data.principalSubdivisionCode || 'Unknown';
    const country = data.countryName || 'Unknown';
    const countryCode = data.countryCode || 'XX';
    
    const result = {
      city: city.trim(),
      region: region.trim(),
      country: country.trim(),
      countryCode: countryCode.toUpperCase()
    };
    
    console.log('📍 Parsed location:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Reverse geocode error:', error);
    return {
      city: 'Unknown',
      region: 'Unknown',
      country: 'Unknown',
      countryCode: 'XX'
    };
  }
};

/**
 * Update city mood aggregate when a new mood is logged
 * @param {Object} data - Mood data with score and location
 */
const updateCityMoodAggregate = async (data) => {
  try {
    const { moodScore, location } = data;
    
    // Skip if location is unknown
    if (!location || location.city === 'Unknown') {
      console.log('⚠️ Skipping city aggregate - location unknown');
      return;
    }
    
    // Create unique city key: "CityName_Region_CountryCode"
    const cityKey = `${location.city}_${location.region}_${location.countryCode}`.replace(/\s+/g, '_');
    const cityRef = doc(db, CITY_MOODS_COLLECTION, cityKey);
    
    // Get existing city document
    const cityDoc = await getDoc(cityRef);
    
    if (cityDoc.exists()) {
      // Update existing aggregate
      const current = cityDoc.data();
      const newTotalLogs = current.totalLogs + 1;
      const newMoodSum = current.moodSum + moodScore;
      const newAverageMood = newMoodSum / newTotalLogs;
      
      await updateDoc(cityRef, {
        totalLogs: newTotalLogs,
        moodSum: newMoodSum,
        averageMood: parseFloat(newAverageMood.toFixed(2)),
        lastUpdated: Timestamp.now()
      });
      
      console.log(`📊 Updated ${location.city} aggregate: ${newAverageMood.toFixed(1)}/10 (${newTotalLogs} logs)`);
    } else {
      // Create new city aggregate
      await setDoc(cityRef, {
        city: location.city,
        region: location.region,
        country: location.country,
        countryCode: location.countryCode,
        latitude: location.latitude,
        longitude: location.longitude,
        totalLogs: 1,
        moodSum: moodScore,
        averageMood: parseFloat(moodScore.toFixed(2)),
        lastUpdated: Timestamp.now(),
        createdAt: Timestamp.now()
      });
      
      console.log(`🆕 Created ${location.city} aggregate: ${moodScore}/10 (1 log)`);
    }
  } catch (error) {
    console.error('❌ Error updating city mood aggregate:', error);
    // Don't throw - we don't want to block mood logging if aggregation fails
  }
};

/**
 * Save a mood log to Firestore
 * @param {Object} moodData - The mood data to save
 * @param {string} moodData.userId - User ID from Firebase Auth
 * @param {number} moodData.moodScore - Mood score (0-10)
 * @param {string} moodData.note - Optional note about the mood
 * @param {string} moodData.checkInType - 'morning', 'evening', or 'anytime'
 * @param {string} moodData.eventId - Optional event ID if tagging an event
 * @param {Object} moodData.location - Optional location data {latitude, longitude}
 * @returns {Promise<string>} - Document ID of the created mood log
 */
export const saveMoodLog = async (moodData) => {
  try {
    const logData = {
      userId: moodData.userId,
      moodScore: moodData.moodScore,
      note: moodData.note || '',
      checkInType: moodData.checkInType, // 'morning', 'evening', or 'anytime'
      eventId: moodData.eventId || null,
      timestamp: Timestamp.now(),
      createdAt: new Date().toISOString(),
    };

    // Add location data if provided
    if (moodData.location) {
      const { latitude, longitude } = moodData.location;
      
      // Get city/region info
      const geoInfo = await reverseGeocode(latitude, longitude);
      
      logData.location = {
        latitude,
        longitude,
        city: geoInfo.city,
        region: geoInfo.region,
        country: geoInfo.country,
        countryCode: geoInfo.countryCode
      };
      
      console.log(`📍 Location added: ${geoInfo.city}, ${geoInfo.region}`);
      
      // Update city mood aggregate
      await updateCityMoodAggregate({
        moodScore: moodData.moodScore,
        location: logData.location
      });
    }

    const docRef = await addDoc(collection(db, MOOD_LOGS_COLLECTION), logData);
    
    console.log('✅ Mood log saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving mood log:', error);
    throw error;
  }
};

/**
 * Get all mood logs for a specific user
 * @param {string} userId - User ID from Firebase Auth
 * @returns {Promise<Array>} - Array of mood logs
 */
export const getUserMoodLogs = async (userId) => {
  try {
    const q = query(
      collection(db, MOOD_LOGS_COLLECTION),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc') // Most recent first
    );
    
    const querySnapshot = await getDocs(q);
    const moodLogs = [];
    
    querySnapshot.forEach((doc) => {
      moodLogs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ Found ${moodLogs.length} mood logs for user ${userId}`);
    return moodLogs;
  } catch (error) {
    console.error('❌ Error fetching mood logs:', error);
    throw error;
  }
};

/**
 * Get today's check-ins for a user
 * @param {string} userId - User ID from Firebase Auth
 * @returns {Promise<Object>} - Object with morning and evening check-ins
 */
export const getTodayCheckIns = async (userId) => {
  try {
    // Get start of today (midnight)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const q = query(
      collection(db, MOOD_LOGS_COLLECTION),
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const checkIns = {
      morning: null,
      evening: null
    };
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.checkInType === 'morning' && !checkIns.morning) {
        checkIns.morning = { id: doc.id, ...data };
      } else if (data.checkInType === 'evening' && !checkIns.evening) {
        checkIns.evening = { id: doc.id, ...data };
      }
    });
    
    console.log('✅ Today\'s check-ins:', checkIns);
    return checkIns;
  } catch (error) {
    console.error('❌ Error fetching today\'s check-ins:', error);
    throw error;
  }
};

/**
 * Calculate user's current streak (consecutive days with at least one check-in)
 * @param {string} userId - User ID from Firebase Auth
 * @returns {Promise<number>} - Number of consecutive days
 */
export const calculateStreak = async (userId) => {
  try {
    const q = query(
      collection(db, MOOD_LOGS_COLLECTION),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const logs = [];
    
    querySnapshot.forEach((doc) => {
      logs.push(doc.data());
    });
    
    if (logs.length === 0) return 0;
    
    // Group logs by date
    const dateSet = new Set();
    logs.forEach(log => {
      const date = log.timestamp.toDate().toDateString();
      dateSet.add(date);
    });
    
    // Convert to sorted array of dates
    const dates = Array.from(dateSet).map(d => new Date(d));
    dates.sort((a, b) => b - a); // Most recent first
    
    // Calculate streak
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const date of dates) {
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((currentDate - checkDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    console.log(`✅ User streak: ${streak} days`);
    return streak;
  } catch (error) {
    console.error('❌ Error calculating streak:', error);
    return 0;
  }
};

/**
 * Get all city mood aggregates (for map display)
 * @param {number} minLogs - Minimum number of logs required (privacy threshold)
 * @returns {Promise<Array>} - Array of city mood data
 */
export const getCityMoods = async (minLogs = 1) => {
  try {
    const q = query(
      collection(db, CITY_MOODS_COLLECTION),
      where('totalLogs', '>=', minLogs),
      orderBy('totalLogs', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const cityMoods = [];
    
    querySnapshot.forEach((doc) => {
      cityMoods.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`🗺️ Found ${cityMoods.length} cities with ${minLogs}+ logs`);
    return cityMoods;
  } catch (error) {
    console.error('❌ Error fetching city moods:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time city mood updates
 * @param {Function} callback - Function called with updated city data
 * @param {number} minLogs - Minimum number of logs required (privacy threshold)
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToCityMoods = (callback, minLogs = 1) => {
  const q = query(
    collection(db, CITY_MOODS_COLLECTION),
    where('totalLogs', '>=', minLogs),
    orderBy('totalLogs', 'desc')
  );
  
  console.log('🔄 Subscribing to real-time city mood updates...');
  
  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const cityMoods = [];
      
      querySnapshot.forEach((doc) => {
        cityMoods.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`🔄 Real-time update: ${cityMoods.length} cities`);
      callback(cityMoods);
    },
    (error) => {
      console.error('❌ Error in city moods subscription:', error);
    }
  );
  
  return unsubscribe;
};
