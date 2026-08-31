import { motion } from 'framer-motion';

export function Scene2() {
  return (
    <motion.div
      className="absolute inset-0 bg-zhi-navy text-zhi-cream overflow-hidden flex flex-col"
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute top-0 left-0 w-full h-[60vh] overflow-hidden">
        <motion.img
          src={`${import.meta.env.BASE_URL}images/screen-dashboard.jpg`}
          alt="Dashboard"
          className="w-full h-full object-cover object-top opacity-50"
          initial={{ scale: 1.2, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 6, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zhi-navy/50 to-zhi-navy" />
      </div>

      <div className="z-10 w-full h-full flex flex-col justify-end p-8 pb-20">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
          className="mb-4"
        >
          <div className="inline-block px-4 py-2 bg-zhi-blue text-white font-sans font-bold text-sm rounded-full mb-6 uppercase tracking-wider">
            4-Week Course
          </div>
        </motion.div>

        <motion.h2
          className="font-display font-bold text-[10vw] leading-tight mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          Free, <br />
          <span className="text-zhi-blue">Self-Paced</span>, <br />
          First Principles.
        </motion.h2>

        <div className="space-y-4 font-sans text-lg text-zhi-cream/80">
          {[
            'Step-by-step guidance',
            'Interactive tutorials',
            'Comprehensive curriculum',
          ].map((text, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.5 + i * 0.2 }}
            >
              <div className="w-6 h-6 rounded-full bg-zhi-blue/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-zhi-blue" />
              </div>
              <span>{text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
