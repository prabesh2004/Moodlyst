import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section ref={ref} className="py-20 px-6 bg-linear-to-b from-white to-rose-50">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Explore Mood Trends 🗺️
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover how people are feeling in cities around the world. Click below to explore our interactive map.
          </p>
        </motion.div>

        {/* Map Preview Card - Click to go to full map */}
        <motion.div variants={itemVariants} className="relative">
          <div 
            onClick={() => navigate('/map')}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 cursor-pointer group hover:shadow-3xl transition-all duration-300"
          >
            {/* Map Preview Image */}
            <div className="relative w-full h-96 md:h-[500px] rounded-2xl overflow-hidden bg-linear-to-br from-blue-50 to-purple-50">
              {/* Decorative Map Illustration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-4 animate-float">�️</div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                    Interactive Mood Map
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Click to explore real-time mood data from cities worldwide
                  </p>
                  <button className="bg-rose-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-rose-600 transition-colors shadow-lg group-hover:scale-105 transform duration-300">
                    Open Map →
                  </button>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-10 right-10 text-4xl animate-float-delayed-1">🌍</div>
              <div className="absolute bottom-10 left-10 text-3xl animate-float-delayed-2">📍</div>
              <div className="absolute top-1/3 left-1/4 text-3xl animate-float">😊</div>
              <div className="absolute bottom-1/3 right-1/4 text-3xl animate-float-delayed-1">💫</div>
            </div>

            {/* Legend */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-pink-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Very Happy (8.5+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-rose-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Happy (7.5-8.5)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Good (7.0-7.5)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Neutral (6.0-7.0)</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
        >
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <div className="text-3xl font-bold text-rose-500">50+</div>
            <div className="text-sm text-gray-600 mt-2">Cities Mapped</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <div className="text-3xl font-bold text-rose-500">10K+</div>
            <div className="text-sm text-gray-600 mt-2">Active Users</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <div className="text-3xl font-bold text-rose-500">1M+</div>
            <div className="text-sm text-gray-600 mt-2">Mood Logs</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <div className="text-3xl font-bold text-rose-500">24/7</div>
            <div className="text-sm text-gray-600 mt-2">Live Updates</div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default FeaturesSection;
