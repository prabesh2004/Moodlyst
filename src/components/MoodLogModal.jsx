import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveMoodLog } from '../services/moodService';

const MoodLogModal = ({ isOpen, onClose, user, checkInType = 'anytime' }) => {
  const [moodScore, setMoodScore] = useState(5);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Request location when modal opens
  useEffect(() => {
    if (isOpen) {
      setMoodScore(5);
      setNote('');
      setLocation(null);
      setLocationError(null);

      // Request user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            console.error('Location error:', error);
            setLocationError('Location access denied. Mood will be saved without location.');
          }
        );
      } else {
        setLocationError('Geolocation not supported by your browser.');
      }
    }
  }, [isOpen]);

  // Get emoji based on mood score
  const getMoodEmoji = (score) => {
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

  // Get color based on mood score
  const getMoodColor = (score) => {
    if (score >= 8) return 'from-green-400 to-emerald-500';
    if (score >= 6) return 'from-yellow-400 to-orange-400';
    if (score >= 4) return 'from-orange-400 to-red-400';
    return 'from-red-400 to-red-600';
  };

  // Get placeholder text based on check-in type
  const getPlaceholder = () => {
    if (checkInType === 'morning') {
      return 'Describe your morning... (e.g., "Had a great breakfast and feeling energized!")';
    } else if (checkInType === 'evening') {
      return 'Describe your day... (e.g., "Productive day at work, went to the gym")';
    } else {
      return 'Describe this moment... (e.g., "At the concert, amazing vibes!")';
    }
  };

  // Get title based on check-in type
  const getTitle = () => {
    if (checkInType === 'morning') return 'Morning Check-In 🌅';
    if (checkInType === 'evening') return 'Evening Check-In 🌙';
    return 'Log Your Mood 💭';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const moodData = {
        userId: user.uid,
        moodScore: moodScore,
        note: note.trim(),
        checkInType: checkInType
      };

      // Add location if available
      if (location) {
        moodData.location = location;
      }

      await saveMoodLog(moodData);

      // Success feedback with emoji
      const emoji = getMoodEmoji(moodScore);
      const message = checkInType === 'morning' 
        ? `${emoji} Morning mood logged! Have a great day!`
        : checkInType === 'evening'
        ? `${emoji} Evening mood logged! Rest well tonight!`
        : `${emoji} Mood logged successfully!`;
      
      alert(`✅ ${message}\n\nScore: ${moodScore}/10${location ? '\n📍 Location saved' : ''}`);
      onClose();
    } catch (error) {
      console.error('Error saving mood:', error);
      alert('❌ Failed to save mood. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {getTitle()}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 py-6">
              {/* Location Status */}
              {location && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <span className="text-green-600">📍</span>
                  <span className="text-green-700 text-sm font-medium">Location captured</span>
                </div>
              )}
              {locationError && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                  <span className="text-yellow-600">⚠️</span>
                  <span className="text-yellow-700 text-xs">{locationError}</span>
                </div>
              )}

              {/* Mood Score Selector */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  How are you feeling? (0-10)
                </label>

                {/* Big Emoji Display */}
                <div className={`bg-linear-to-br ${getMoodColor(moodScore)} rounded-2xl p-8 mb-6 text-center`}>
                  <div className="text-8xl mb-4">{getMoodEmoji(moodScore)}</div>
                  <div className="text-white text-4xl font-bold">{moodScore}/10</div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={moodScore}
                  onChange={(e) => setMoodScore(parseFloat(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  style={{
                    background: `linear-gradient(to right, #f43f5e 0%, #f43f5e ${moodScore * 10}%, #e5e7eb ${moodScore * 10}%, #e5e7eb 100%)`
                  }}
                />

                {/* Score Labels */}
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>😰 Terrible</span>
                  <span>😐 Okay</span>
                  <span>😍 Amazing</span>
                </div>
              </div>

              {/* Note Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {checkInType === 'morning' && 'Describe your morning'}
                  {checkInType === 'evening' && 'Describe your day'}
                  {checkInType === 'anytime' && 'Describe this moment'}
                  <span className="text-gray-400 font-normal ml-2">(optional)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={getPlaceholder()}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                />
                <div className="text-xs text-gray-400 mt-2">
                  {note.length}/200 characters
                </div>
              </div>

              {/* Check-in Type Badge */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm">
                  <span>
                    {checkInType === 'morning' && '🌅 Morning Check-in'}
                    {checkInType === 'evening' && '🌙 Evening Check-in'}
                    {checkInType === 'anytime' && '💭 Anytime Log'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-rose-500 to-pink-500 text-white rounded-full font-semibold hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Mood'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MoodLogModal;
