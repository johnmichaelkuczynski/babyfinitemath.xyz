import { motion } from 'framer-motion';

export function Scene5() {
  return (
    <motion.div
      className="absolute inset-0 bg-zhi-navy text-white overflow-hidden flex flex-col items-center justify-center p-8"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-zhi-blue/20 to-transparent"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="z-10 text-center w-full flex flex-col items-center">
        <motion.img
          src={`${import.meta.env.BASE_URL}images/zhi-logo.png`}
          alt="ZHI Systems"
          className="w-[34vw] max-h-[18vh] object-contain mb-8"
          initial={{ scale: 0.75, opacity: 0, rotate: -4 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="mb-5"
        >
          <span className="font-sans text-sm font-bold tracking-[0.2em] text-zhi-blue uppercase">
            Start Learning Today
          </span>
        </motion.div>

        <motion.h2 className="font-display font-extrabold text-[8.5vw] leading-none mb-8">
          <motion.span
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            promptengineering.ink
          </motion.span>
        </motion.h2>

        <motion.div
          className="relative px-8 py-4 bg-zhi-blue text-white font-sans font-bold text-xl rounded-full overflow-hidden"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5, type: 'spring' }}
        >
          <motion.div
            className="absolute inset-0 bg-white/20"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
          />
          Free four-week course
        </motion.div>
      </div>
    </motion.div>
  );
}
