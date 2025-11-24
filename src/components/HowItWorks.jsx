import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const steps = [
    {
      number: "01",
      title: "Check-In Twice Daily",
      description: "Get notified at 10 AM and 10 PM to log your mood. Share how you're feeling and what you're experiencing - events, places, moments.",
      emoji: "⏰",
      color: "from-rose-400 to-pink-400"
    },
    {
      number: "02",
      title: "Tag Events & Locations",
      description: "At a concert? Visiting a cafe? Tag the event or place and rate the vibe in real-time. Your mood becomes part of the event's authentic rating.",
      emoji: "🎉",
      color: "from-purple-400 to-indigo-400"
    },
    {
      number: "03",
      title: "Discover & Grow",
      description: "Find the best events based on real emotions, track your personal mood patterns, and get insights to improve your emotional well-being.",
      emoji: "🌟",
      color: "from-blue-400 to-cyan-400"
    }
  ];

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-[90rem] mx-auto px-6 sm:px-8 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-poppins text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="font-poppins text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
            Track your emotions, discover authentic experiences, and grow through self-awareness.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative"
            >
              {/* Card */}
              <motion.div 
                className="bg-white rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full border border-gray-100"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step Number */}
                <div className="absolute -top-4 -left-4">
                  <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                    <span className="font-poppins text-white font-bold text-sm lg:text-base">{step.number}</span>
                  </div>
                </div>

                {/* Emoji */}
                <motion.div 
                  className="text-6xl lg:text-7xl mb-6 mt-4"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.3 + (index * 0.2)
                  }}
                >
                  {step.emoji}
                </motion.div>

                {/* Content */}
                <h3 className="font-poppins text-xl lg:text-2xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="font-poppins text-sm lg:text-base text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>

              {/* Connector Line (hidden on last item and mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-transparent transform -translate-y-1/2 z-0" />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.button
            className="font-poppins text-sm lg:text-base font-medium bg-rose-600 text-white px-8 py-3 lg:px-10 lg:py-4 rounded-lg 
            hover:bg-rose-700 transition-all duration-300 shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Tracking Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
