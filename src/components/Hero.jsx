import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Hero = ({ user }) => {
  const navigate = useNavigate();
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const barVariants = {
    hidden: { scaleY: 0 },
    visible: (custom) => ({
      scaleY: 1,
      transition: {
        duration: 0.8,
        delay: custom,
        ease: "easeOut"
      }
    })
  };

  return (
    <section className="min-h-screen pt-12 bg-white relative flex items-start overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 relative z-10 w-full">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column - Text Content */}
          <motion.div variants={textVariants}>
            <motion.h1 
              className="font-poppins text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 mb-4 leading-tight"
              variants={textVariants}
            >
              Discover Events Through Real Vibes, Track Your Emotional Journey
            </motion.h1>
            <motion.p 
              className="font-poppins text-sm md:text-base text-gray-600 mb-6 leading-relaxed"
              variants={textVariants}
            >
              Check in twice daily, share what you're experiencing, and discover the best local events through authentic mood ratings. Get personal insights while exploring your community's emotional pulse.
            </motion.p>
            <motion.button 
              className="font-poppins text-sm font-medium bg-gray-900 text-white px-6 py-2.5 rounded-lg 
              hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md"
              variants={textVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => user ? navigate('/dashboard') : navigate('/login')}
            >
              {user ? 'Log Your Mood' : 'Get Started'}
            </motion.button>
          </motion.div>

          {/* Right Column - Mood Dashboard */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
            variants={cardVariants}
          >
            {/* Current Mood */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="font-poppins text-sm font-medium text-gray-500 mb-3">Current City Mood</h3>
              <div className="flex items-center gap-4">
                <motion.div 
                  className="text-5xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.5
                  }}
                >
                  😊
                </motion.div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <motion.p 
                      className="font-poppins text-3xl font-bold text-gray-900"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      8.5
                    </motion.p>
                    <p className="font-poppins text-lg text-gray-400">/10</p>
                  </div>
                  <p className="font-poppins text-xs text-gray-500">Last updated: 5 min ago</p>
                </div>
              </div>
            </motion.div>

            {/* 7-Day Bar Graph */}
            <div>
              <h3 className="font-poppins text-sm font-medium text-gray-500 mb-3">Mood Trend (Last 7 Days)</h3>
              <div className="h-40 bg-gradient-to-t from-rose-50 to-transparent rounded-lg flex items-end justify-between px-2 py-3 gap-1">
                {/* Bar chart with staggered animation */}
                {[
                  { height: '65%', delay: 0.7 },
                  { height: '72%', delay: 0.8 },
                  { height: '60%', delay: 0.9 },
                  { height: '82%', delay: 1.0 },
                  { height: '75%', delay: 1.1 },
                  { height: '88%', delay: 1.2 },
                  { height: '85%', delay: 1.3 }
                ].map((bar, index) => (
                  <motion.div
                    key={index}
                    className={`flex-1 rounded-t origin-bottom ${index === 6 ? 'bg-rose-500' : 'bg-rose-400'}`}
                    custom={bar.delay}
                    initial="hidden"
                    animate="visible"
                    variants={barVariants}
                    style={{ height: bar.height }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 px-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <motion.span
                    key={day}
                    className="font-poppins text-xs text-gray-400"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + (index * 0.1) }}
                  >
                    {day}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Emojis */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <span className="absolute text-3xl opacity-20 animate-float top-[10%] left-[5%]">�</span>
        <span className="absolute text-2xl opacity-15 animate-float-delayed-1 top-[20%] right-[15%]">😊</span>
        <span className="absolute text-3xl opacity-20 animate-float-delayed-2 bottom-[30%] left-[10%]">🥰</span>
        <span className="absolute text-2xl opacity-15 animate-float top-[60%] right-[8%]">😄</span>
        <span className="absolute text-3xl opacity-20 animate-float-delayed-1 bottom-[15%] left-[70%]">💛</span>
        <span className="absolute text-2xl opacity-15 animate-float-delayed-2 top-[40%] left-[85%]">🤗</span>
        <span className="absolute text-3xl opacity-20 animate-float top-[75%] left-[20%]">😁</span>
        <span className="absolute text-2xl opacity-15 animate-float-delayed-1 top-[50%] right-[30%]">🌈</span>
        <span className="absolute text-3xl opacity-20 animate-float-delayed-2 bottom-[60%] right-[5%]">☺️</span>
        <span className="absolute text-2xl opacity-15 animate-float top-[15%] left-[50%]">😍</span>
        <span className="absolute text-3xl opacity-20 animate-float-delayed-1 top-[35%] left-[30%]">💖</span>
        <span className="absolute text-2xl opacity-15 animate-float-delayed-2 bottom-[40%] right-[25%]">😃</span>
      </div>
    </section>
  );
};

export default Hero;