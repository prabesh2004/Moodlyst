import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Collection names
const MOOD_LOGS_COLLECTION = 'moodLogs';
const USERS_COLLECTION = 'users';

/**
 * Save a mood log to Firestore
 * @param {Object} moodData - The mood data to save
 * @param {string} moodData.userId - User ID from Firebase Auth
 * @param {number} moodData.moodScore - Mood score (0-10)
 * @param {string} moodData.note - Optional note about the mood
 * @param {string} moodData.checkInType - 'morning' or 'evening'
 * @param {string} moodData.eventId - Optional event ID if tagging an event
 * @returns {Promise<string>} - Document ID of the created mood log
 */
export const saveMoodLog = async (moodData) => {
  try {
    const docRef = await addDoc(collection(db, MOOD_LOGS_COLLECTION), {
      userId: moodData.userId,
      moodScore: moodData.moodScore,
      note: moodData.note || '',
      checkInType: moodData.checkInType, // 'morning' or 'evening'
      eventId: moodData.eventId || null,
      timestamp: Timestamp.now(), // Firestore timestamp
      createdAt: new Date().toISOString(), // Human-readable timestamp
    });
    
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
