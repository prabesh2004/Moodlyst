import { motion } from 'framer-motion';
import { useState } from 'react';

const MoodTimeline = ({ moodLogs }) => {
  const [selectedDay, setSelectedDay] = useState(null);

  // Get last 7 days of data
  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      // Find moods for this day
      const dayMoods = moodLogs.filter(log => {
        const logDate = log.timestamp.toDate();
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === date.getTime();
      });
      
      // Calculate average mood for the day
      const avgMood = dayMoods.length > 0
        ? dayMoods.reduce((sum, log) => sum + log.moodScore, 0) / dayMoods.length
        : null;
      
      days.push({
        date: date,
        moods: dayMoods,
        avgMood: avgMood,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        isToday: i === 0
      });
    }
    
    return days;
  };

  const days = getLast7Days();

  // Get emoji based on average mood
  const getMoodEmoji = (score) => {
    if (!score) return '😶';
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
    if (!score) return '#9ca3af';
    if (score >= 8) return '#10b981';
    if (score >= 6) return '#fbbf24';
    if (score >= 4) return '#f97316';
    return '#ef4444';
  };

  // Calculate trend
  const getTrend = () => {
    const moodsWithData = days.filter(d => d.avgMood !== null);
    if (moodsWithData.length < 2) return null;
    
    const recent = moodsWithData.slice(-3).reduce((sum, d) => sum + d.avgMood, 0) / Math.min(3, moodsWithData.slice(-3).length);
    const older = moodsWithData.slice(0, -3).reduce((sum, d) => sum + d.avgMood, 0) / Math.max(1, moodsWithData.slice(0, -3).length);
    
    if (recent > older + 0.5) return 'improving';
    if (recent < older - 0.5) return 'declining';
    return 'stable';
  };

  const trend = getTrend();

  return (
    <div className="bg-linear-to-br from-purple-50 via-pink-50 to-orange-50 rounded-3xl shadow-xl p-4 sm:p-8 border border-purple-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Your Mood Journey
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm">Last 7 days of emotional tracking</p>
        </div>
        
        {/* Trend Indicator */}
        {trend && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`px-6 py-3 rounded-2xl border-2 shadow-lg ${
              trend === 'improving' 
                ? 'bg-green-100 border-green-300' 
                : trend === 'declining'
                ? 'bg-orange-100 border-orange-300'
                : 'bg-blue-100 border-blue-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {trend === 'improving' ? '📈' : trend === 'declining' ? '🌱' : '🌊'}
              </span>
              <div>
                <p className={`text-sm font-bold ${
                  trend === 'improving' 
                    ? 'text-green-700' 
                    : trend === 'declining'
                    ? 'text-orange-700'
                    : 'text-blue-700'
                }`}>
                  {trend === 'improving' ? 'On The Rise!' : trend === 'declining' ? 'Take Care' : 'Steady Flow'}
                </p>
                <p className="text-xs text-gray-600">Weekly Trend</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bar Chart - Clean design for mobile and desktop */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 shadow-inner">
        {/* Bar Chart */}
        <div className="flex items-end justify-between gap-2 sm:gap-4 h-36 sm:h-44 mb-4">
          {days.map((day, index) => {
            const isSelected = selectedDay && selectedDay.date.getTime() === day.date.getTime();
            const barHeight = day.avgMood ? (day.avgMood / 10) * 100 : 0;
            
            return (
              <motion.div
                key={index}
                className="flex-1 flex flex-col items-center cursor-pointer group"
                onClick={() => setSelectedDay(day.moods.length > 0 ? (isSelected ? null : day) : null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Score tooltip on hover/tap */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: isSelected || day.isToday ? 1 : 0,
                    y: isSelected || day.isToday ? 0 : 10
                  }}
                  className="mb-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
                >
                  <span 
                    className="text-xs sm:text-sm font-bold px-2 py-0.5 rounded-full"
                    style={{ 
                      backgroundColor: day.avgMood ? `${getMoodColor(day.avgMood)}20` : '#f3f4f6',
                      color: day.avgMood ? getMoodColor(day.avgMood) : '#9ca3af'
                    }}
                  >
                    {day.avgMood ? day.avgMood.toFixed(1) : '-'}
                  </span>
                </motion.div>
                
                {/* Bar */}
                <motion.div
                  className={`w-full rounded-t-lg sm:rounded-t-xl relative overflow-hidden ${
                    isSelected ? 'ring-2 ring-purple-500 ring-offset-2' : ''
                  }`}
                  style={{ 
                    height: `${Math.max(barHeight, 8)}%`,
                    background: day.avgMood 
                      ? `linear-gradient(to top, ${getMoodColor(day.avgMood)}, ${getMoodColor(day.avgMood)}99)`
                      : '#e5e7eb'
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(barHeight, 8)}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Day Labels */}
        <div className="flex justify-between gap-2 sm:gap-4 border-t border-gray-200 pt-3">
          {days.map((day, index) => {
            const isSelected = selectedDay && selectedDay.date.getTime() === day.date.getTime();
            return (
              <div 
                key={index}
                className={`flex-1 text-center cursor-pointer transition-all ${
                  isSelected ? 'scale-110' : ''
                }`}
                onClick={() => setSelectedDay(day.moods.length > 0 ? (isSelected ? null : day) : null)}
              >
                <div className={`text-lg sm:text-xl mb-1 ${day.avgMood ? '' : 'opacity-30'}`}>
                  {getMoodEmoji(day.avgMood)}
                </div>
                <p className={`text-[10px] sm:text-xs font-semibold ${
                  day.isToday ? 'text-purple-600' : day.avgMood ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  {day.dayName}
                </p>
                {day.isToday && (
                  <span className="inline-block mt-1 bg-purple-500 text-white text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    Today
                  </span>
                )}
                {day.moods.length > 1 && !day.isToday && (
                  <span className="inline-block mt-1 bg-pink-100 text-pink-600 text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                    ×{day.moods.length}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center border border-purple-100">
          <div className="text-2xl sm:text-3xl mb-1">
            {days.filter(d => d.avgMood !== null).length}
          </div>
          <p className="text-[10px] sm:text-xs text-gray-600 font-medium">Days Logged</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center border border-purple-100">
          <div className="text-2xl sm:text-3xl mb-1">
            {moodLogs.length > 0 
              ? (moodLogs.reduce((sum, log) => sum + log.moodScore, 0) / moodLogs.length).toFixed(1)
              : '0.0'
            }
          </div>
          <p className="text-[10px] sm:text-xs text-gray-600 font-medium">Avg Mood</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center border border-purple-100">
          <div className="text-2xl sm:text-3xl mb-1">
            {Math.max(...days.filter(d => d.avgMood).map(d => d.avgMood), 0).toFixed(1)}
          </div>
          <p className="text-[10px] sm:text-xs text-gray-600 font-medium">Best Day</p>
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border-2 border-purple-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{getMoodEmoji(selectedDay.avgMood)}</div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">
                  {selectedDay.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h4>
                <p className="text-sm text-gray-600">
                  Average: <span className="font-bold" style={{ color: getMoodColor(selectedDay.avgMood) }}>
                    {selectedDay.avgMood.toFixed(1)}/10
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {selectedDay.moods.map((mood, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-linear-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getMoodEmoji(mood.moodScore)}</span>
                    <div>
                      <p className="font-bold text-gray-900">{mood.moodScore}/10</p>
                      <p className="text-xs text-gray-500">
                        {mood.timestamp.toDate().toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    mood.checkInType === 'morning' 
                      ? 'bg-amber-100 text-amber-700' 
                      : mood.checkInType === 'evening' 
                      ? 'bg-slate-200 text-slate-700' 
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {mood.checkInType === 'morning' ? '🌅 Morning' : mood.checkInType === 'evening' ? '🌙 Evening' : '💭 Anytime'}
                  </span>
                </div>
                {mood.note && (
                  <p className="text-sm text-gray-700 italic mt-2 pl-12">"{mood.note}"</p>
                )}
                {mood.location && (
                  <p className="text-xs text-gray-500 mt-2 pl-12 flex items-center gap-1">
                    📍 Location saved
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {moodLogs.length === 0 && (
        <div className="text-center py-16">
          <div className="text-7xl mb-4">📊</div>
          <h4 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Start Your Journey
          </h4>
          <p className="text-gray-600">Log your first mood to see beautiful visualizations!</p>
        </div>
      )}
    </div>
  );
};

export default MoodTimeline;
