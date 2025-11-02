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
        staggerChildren: 0.15,
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

  const features = [
    {
      id: 1,
      emoji: '📊',
      title: 'Personal Mood Analytics',
      description: 'Track your emotional patterns over time with detailed insights and visual trends to improve your well-being.',
      gradient: 'from-purple-500 to-pink-500',
      clickable: false
    },
    {
      id: 2,
      emoji: '🗺️',
      title: 'Interactive Mood Map',
      description: 'Explore real-time mood trends and discover events near you. Click to view the full interactive map!',
      gradient: 'from-rose-500 to-orange-500',
      clickable: true,
      onClick: () => navigate('/map')
    },
    {
      id: 3,
      emoji: '🎉',
      title: 'Live Event Ratings',
      description: 'See authentic mood-based ratings for concerts, parties, and local events happening right now.',
      gradient: 'from-blue-500 to-cyan-500',
      clickable: false
    },
    {
      id: 4,
      emoji: '⏰',
      title: 'Smart Check-In Reminders',
      description: 'Get notified at 10 AM and 10 PM to log your mood and share what you are experiencing.',
      gradient: 'from-green-500 to-emerald-500',
      clickable: false
    },
    {
      id: 5,
      emoji: '📍',
      title: 'Location-Based Discovery',
      description: 'Find trending spots, cafes, and venues based on real-time positive vibes from your community.',
      gradient: 'from-indigo-500 to-purple-500',
      clickable: false
    },
    {
      id: 6,
      emoji: '🔒',
      title: 'Privacy First',
      description: 'Your personal mood data stays secure and private. Event ratings are anonymous and aggregated.',
      gradient: 'from-gray-600 to-gray-800',
      clickable: false
    }
  ];

  return (
    <section ref={ref} className="py-20 px-6 bg-white">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need 🚀
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From personal wellness tracking to discovering the best local experiences through authentic emotions.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              className={`relative group ${feature.clickable ? 'cursor-pointer' : ''}`}
              onClick={feature.clickable ? feature.onClick : undefined}
              whileHover={feature.clickable ? { scale: 1.02 } : {}}
            >
              <div className={`h-full bg-white rounded-2xl p-8 shadow-lg border border-gray-100 transition-all duration-300 ${
                feature.clickable ? 'hover:shadow-2xl hover:border-rose-200' : 'hover:shadow-xl'
              }`}>
                {/* Icon with gradient background */}
                <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${feature.gradient} flex items-center justify-center mb-6 text-3xl transform group-hover:scale-110 transition-transform duration-300`}>
                  {feature.emoji}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Clickable indicator for map */}
                {feature.clickable && (
                  <div className="mt-4 flex items-center gap-2 text-rose-500 font-semibold group-hover:gap-3 transition-all">
                    <span>Explore Map</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                )}

                {/* Gradient border on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div variants={itemVariants} className="mt-16 text-center">
          <div className="bg-linear-to-r from-rose-50 to-orange-50 rounded-3xl p-12 border border-rose-100">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to start tracking? ✨
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already mapping their emotions and connecting with their communities.
            </p>
            <button className="bg-linear-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
              Get Started Free →
            </button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default FeaturesSection;
