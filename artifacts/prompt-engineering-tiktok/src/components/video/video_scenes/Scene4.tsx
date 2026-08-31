import { motion } from 'framer-motion';

export function Scene4() {
  return (
    <motion.div
      className="absolute inset-0 bg-zhi-blue text-white overflow-hidden flex flex-col items-center justify-center p-8"
      initial={{ scale: 1.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Dynamic background shapes */}
      <motion.div
        className="absolute w-[150vw] h-[150vw] border-[1px] border-white/20 rounded-full"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute w-[100vw] h-[100vw] border-[1px] border-white/30 rounded-full"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 6, ease: 'easeOut', delay: 0.2 }}
      />

      <motion.div
        className="z-10 text-center w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <h2 className="font-sans text-[6vw] font-medium tracking-wide mb-2 opacity-80">
          NEED SOMETHING CUSTOM?
        </h2>
        <h3 className="font-display font-bold text-[11vw] leading-tight mb-12">
          ZHI Systems <br />Builds For You
        </h3>
      </motion.div>

      <div className="z-10 flex flex-col w-full gap-4">
        {[
          { text: 'Custom Courses', delay: 1.2 },
          { text: 'Certifications', delay: 1.4 },
          { text: 'Internal Apps', delay: 1.6 },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 flex items-center justify-between"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: item.delay, type: 'spring', stiffness: 100 }}
          >
            <span className="font-sans font-bold text-xl">{item.text}</span>
            <div className="w-8 h-8 rounded-full bg-white text-zhi-blue flex items-center justify-center font-bold">
              +
            </div>
          </motion.div>
        ))}
      </div>

      <motion.p
        className="z-10 mt-12 font-sans text-center text-white/80 max-w-[80%]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 2.2 }}
      >
        For colleges, banks, and individuals.
      </motion.p>
    </motion.div>
  );
}
