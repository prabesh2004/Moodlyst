import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const YourInsights = ({ insights, loading, onGenerate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!insights && !loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 border border-purple-100">
        <div className="text-center">
          <div className="text-5xl mb-4">✨</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Insights</h3>
          <p className="text-gray-600 mb-6">
            Get AI-powered insights from your recent mood logs
          </p>
          <button
            onClick={onGenerate}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            Generate Insights
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 border border-purple-100">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🤔</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Analyzing your moods...</h3>
          <p className="text-gray-600">This will take just a moment</p>
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 border border-purple-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{insights.emoji}</span>
          <h3 className="text-2xl font-bold text-gray-900">Your Insights</h3>
        </div>
        <button
          onClick={onGenerate}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <h4 className="text-sm font-semibold text-purple-600 mb-2">Recent Mood Summary</h4>
        <p className="text-gray-800">{insights.summary}</p>
      </div>

      {/* Best Time */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <h4 className="text-sm font-semibold text-blue-600 mb-2">When You Feel Best</h4>
        <div className="flex items-center gap-3">
          <span className="text-3xl">
            {insights.bestTime === 'morning' && '🌅'}
            {insights.bestTime === 'evening' && '🌙'}
            {insights.bestTime === 'afternoon' && '☀️'}
            {insights.bestTime === 'consistent' && '⚖️'}
          </span>
          <div>
            <p className="font-medium text-gray-900 capitalize">{insights.bestTime}</p>
            <p className="text-sm text-gray-600">{insights.bestTimeExplanation}</p>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-green-600">Suggestions for You</h4>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? '▼ Collapse' : '▶ Expand'}
          </button>
        </div>
        
        <AnimatePresence>
          {isExpanded ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3"
            >
              {insights.suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100"
                >
                  <span className="text-lg mt-0.5">💡</span>
                  <p className="text-sm text-gray-800">{suggestion}</p>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-600"
            >
              {insights.suggestions[0]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center text-xs text-gray-500">
        Powered by AI • Based on your last 5 mood logs
      </div>
    </motion.div>
  );
};

export default YourInsights;
