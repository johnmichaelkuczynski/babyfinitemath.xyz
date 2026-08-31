import { motion } from 'framer-motion';

export function Scene3() {
  return (
    <motion.div
      className="absolute inset-0 bg-zhi-gray text-zhi-navy overflow-hidden"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="flex flex-col h-full relative p-6 pt-16">
        <motion.h2
          className="font-display font-bold text-[12vw] leading-[1] text-center z-20 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Practice <br />
          What You <br />
          Learn
        </motion.h2>

        <motion.div
          className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-2xl z-10 border border-white/50 bg-white"
          initial={{ y: '100%', rotateZ: 5 }}
          animate={{ y: '0%', rotateZ: 0 }}
          transition={{ duration: 1, delay: 0.6, type: 'spring', stiffness: 80, damping: 15 }}
        >
          <img
            src={`${import.meta.env.BASE_URL}images/screen-assignments.jpg`}
            alt="Assignments"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
        </motion.div>

        {/* Floating badge */}
        <motion.div
          className="absolute bottom-32 right-2 bg-zhi-navy text-white font-sans font-bold px-6 py-4 rounded-2xl shadow-xl z-30"
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: -5 }}
          transition={{ duration: 0.6, delay: 1.5, type: 'spring', stiffness: 200, damping: 12 }}
        >
          <span className="text-[6vw]">Score: 100%</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
