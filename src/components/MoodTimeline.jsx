import { motion } from 'framer-motion';
import { useState } from 'react';

const MoodTimeline = ({ moodLogs }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);

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

  // Calculate SVG path for line chart
  const getChartPath = () => {
    const validDays = days.filter(d => d.avgMood !== null);
    if (validDays.length === 0) return '';
    
    const width = 600;
    const height = 150;
    const padding = 20;
    
    const xStep = (width - padding * 2) / 6;
    const yScale = (height - padding * 2) / 10;
    
    let path = '';
    days.forEach((day, index) => {
      const x = padding + (index * xStep);
      const y = day.avgMood 
        ? height - padding - (day.avgMood * yScale)
        : null;
      
      if (y !== null) {
        if (path === '') {
          path = `M ${x} ${y}`;
        } else {
          path += ` L ${x} ${y}`;
        }
      }
    });
    
    return path;
  };

  return (
    <div className="bg-linear-to-br from-purple-50 via-pink-50 to-orange-50 rounded-3xl shadow-xl p-8 border border-purple-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            Your Mood Journey
          </h3>
          <p className="text-gray-600 text-sm">Last 7 days of emotional tracking</p>
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
                {trend === 'improving' ? '�' : trend === 'declining' ? '🌱' : '🌊'}
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

      {/* Graph Area */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-inner">
        <svg viewBox="0 0 600 150" className="w-full h-40">
          {/* Grid lines */}
          {[0, 2.5, 5, 7.5, 10].map((line, idx) => (
            <line
              key={idx}
              x1="20"
              y1={130 - (line * 11)}
              x2="580"
              y2={130 - (line * 11)}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}
          
          {/* Line chart */}
          {getChartPath() && (
            <path
              d={getChartPath()}
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          
          {/* Data points */}
          {days.map((day, index) => {
            const x = 20 + (index * 93.33);
            const y = day.avgMood 
              ? 130 - (day.avgMood * 11)
              : 130;
            
            return day.avgMood ? (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill={getMoodColor(day.avgMood)}
                  stroke="white"
                  strokeWidth="3"
                  className="cursor-pointer hover:r-8 transition-all"
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  onClick={() => setSelectedDay(day.moods.length > 0 ? day : null)}
                />
                {(hoveredDay === day || day.isToday) && (
                  <g>
                    <rect
                      x={x - 30}
                      y={y - 40}
                      width="60"
                      height="30"
                      rx="8"
                      fill="white"
                      stroke={getMoodColor(day.avgMood)}
                      strokeWidth="2"
                      filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
                    />
                    <text
                      x={x}
                      y={y - 20}
                      textAnchor="middle"
                      className="text-xs font-bold"
                      fill={getMoodColor(day.avgMood)}
                    >
                      {day.avgMood.toFixed(1)}
                    </text>
                  </g>
                )}
              </g>
            ) : null;
          })}
        </svg>
        
        {/* Day Labels */}
        <div className="flex justify-between mt-4 px-2">
          {days.map((day, index) => (
            <div 
              key={index}
              className={`text-center cursor-pointer transition-all ${
                day.moods.length > 0 ? 'hover:scale-110' : ''
              }`}
              onClick={() => setSelectedDay(day.moods.length > 0 ? day : null)}
            >
              <p className={`text-xs font-semibold mb-1 ${
                day.isToday ? 'text-purple-600' : day.avgMood ? 'text-gray-700' : 'text-gray-400'
              }`}>
                {day.dayName}
              </p>
              <div className={`text-2xl ${day.avgMood ? '' : 'opacity-30'}`}>
                {getMoodEmoji(day.avgMood)}
              </div>
              {day.isToday && (
                <div className="mt-1">
                  <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    Today
                  </span>
                </div>
              )}
              {day.moods.length > 1 && (
                <div className="mt-1">
                  <span className="bg-pink-100 text-pink-600 text-xs px-2 py-0.5 rounded-full font-semibold">
                    {day.moods.length}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-purple-100">
          <div className="text-3xl mb-1">
            {days.filter(d => d.avgMood !== null).length}
          </div>
          <p className="text-xs text-gray-600 font-medium">Days Logged</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-purple-100">
          <div className="text-3xl mb-1">
            {moodLogs.length > 0 
              ? (moodLogs.reduce((sum, log) => sum + log.moodScore, 0) / moodLogs.length).toFixed(1)
              : '0.0'
            }
          </div>
          <p className="text-xs text-gray-600 font-medium">Avg Mood</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-purple-100">
          <div className="text-3xl mb-1">
            {Math.max(...days.filter(d => d.avgMood).map(d => d.avgMood), 0).toFixed(1)}
          </div>
          <p className="text-xs text-gray-600 font-medium">Best Day</p>
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
