import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const WhyMoodMatters = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 }
    }
  };

  const useCases = [
    {
      id: 1,
      question: "Should I go to this party?",
      answer: "Check the live mood score from people already there",
      icon: "🎊",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      id: 2,
      question: "Where's the best vibe today?",
      answer: "See real-time mood ratings from local cafes, parks, and venues",
      icon: "☕",
      gradient: "from-orange-500 to-amber-500"
    },
    {
      id: 3,
      question: "Is this event worth it?",
      answer: "Get authentic emotional feedback, not fake 5-star reviews",
      icon: "🎭",
      gradient: "from-purple-500 to-indigo-500"
    },
    {
      id: 4,
      question: "How am I really doing?",
      answer: "Track your mood patterns and get personalized insights for better mental wellness",
      icon: "💭",
      gradient: "from-blue-500 to-cyan-500"
    }
  ];

  return (
    <section ref={ref} className="py-20 bg-linear-to-b from-gray-50 to-white">
      <div className="max-w-[90rem] mx-auto px-6 sm:px-8 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-poppins text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-4">
            Why Mood Matters 💡
          </h2>
          <p className="font-poppins text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
            Real emotions, real insights. Make better decisions about where to go and how you feel.
          </p>
        </motion.div>

        {/* Use Cases Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {useCases.map((useCase) => (
            <motion.div
              key={useCase.id}
              variants={itemVariants}
              className="bg-white rounded-2xl p-8 lg:p-10 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`shrink-0 w-14 h-14 lg:w-16 lg:h-16 rounded-xl bg-linear-to-br ${useCase.gradient} flex items-center justify-center text-2xl lg:text-3xl`}>
                  {useCase.icon}
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-poppins text-lg lg:text-xl font-semibold text-gray-900 mb-2">
                    {useCase.question}
                  </h3>
                  <p className="font-poppins text-sm lg:text-base text-gray-600 leading-relaxed">
                    {useCase.answer}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="font-poppins text-gray-600 lg:text-lg mb-6">
            Join thousands discovering better experiences through authentic emotions
          </p>
          <div className="flex items-center justify-center gap-8 text-sm lg:text-base text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span>Better Decisions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📈</span>
              <span>Personal Growth</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌍</span>
              <span>Community Connection</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyMoodMatters;
