import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const DualValue = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-[90rem] mx-auto px-6 sm:px-8 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-poppins text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-4">
            Two Powerful Tools in One 🎯
          </h2>
          <p className="font-poppins text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
            Moodlyst helps you grow personally while discovering the best your community has to offer.
          </p>
        </motion.div>

        {/* Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Growth */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="bg-linear-to-br from-purple-50 to-pink-50 rounded-3xl p-10 lg:p-12 border-2 border-purple-100"
          >
            <div className="text-5xl lg:text-6xl mb-6">🧠</div>
            <h3 className="font-poppins text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Your Personal Wellness Companion
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-purple-500 text-xl shrink-0">✓</span>
                <span className="font-poppins text-gray-700 lg:text-lg">
                  <strong>Daily Check-ins:</strong> Track your mood at 10 AM and 10 PM
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-500 text-xl shrink-0">✓</span>
                <span className="font-poppins text-gray-700 lg:text-lg">
                  <strong>Mood History:</strong> Visualize your emotional patterns over weeks and months
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-500 text-xl shrink-0">✓</span>
                <span className="font-poppins text-gray-700 lg:text-lg">
                  <strong>Personal Insights:</strong> Get AI-powered suggestions to improve your well-being
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-500 text-xl shrink-0">✓</span>
                <span className="font-poppins text-gray-700 lg:text-lg">
                  <strong>Private & Secure:</strong> Your personal data stays yours, always
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Social Discovery */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ delay: 0.2 }}
            className="bg-linear-to-br from-orange-50 to-rose-50 rounded-3xl p-10 lg:p-12 border-2 border-rose-100"
          >
            <div className="text-5xl lg:text-6xl mb-6">🌍</div>
            <h3 className="font-poppins text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Your Community Discovery Tool
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-rose-500 text-xl shrink-0">✓</span>
                <span className="font-poppins text-gray-700 lg:text-lg">
                  <strong>Event Ratings:</strong> See authentic mood scores from concerts, parties, and gatherings
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 text-xl shrink-0">✓</span>
                <span className="font-poppins text-gray-700 lg:text-lg">
                  <strong>Local Trends:</strong> Discover trending cafes, parks, and venues based on real vibes
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 text-xl shrink-0">✓</span>
                <span className="font-poppins text-gray-700 lg:text-lg">
                  <strong>Real-time Updates:</strong> See what is happening in your area right now
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 text-xl shrink-0">✓</span>
                <span className="font-poppins text-gray-700 lg:text-lg">
                  <strong>Genuine Reviews:</strong> No fake ratings - just honest emotional feedback
                </span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DualValue;
