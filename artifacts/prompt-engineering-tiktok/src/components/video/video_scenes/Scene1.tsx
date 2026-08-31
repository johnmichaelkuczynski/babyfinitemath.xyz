import { motion } from 'framer-motion';

export function Scene1() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-zhi-cream text-zhi-navy overflow-hidden perspective-1000"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background graphic */}
      <motion.div
        className="absolute top-[-10vh] right-[-20vw] w-[80vw] h-[80vw] rounded-full bg-zhi-blue/10 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -20, 0],
        }}
        transition={{ duration: 6, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-20vh] left-[-20vw] w-[100vw] h-[100vw] rounded-full bg-zhi-navy/5 blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 30, 0],
        }}
        transition={{ duration: 6, ease: 'easeInOut' }}
      />

      <div className="z-10 w-full flex flex-col justify-center items-start pt-10 h-full relative">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-2"
        >
          <span className="font-sans font-bold tracking-widest text-zhi-blue text-sm uppercase">
            ZHI SYSTEMS PRESENTS
          </span>
        </motion.div>

        <motion.h1
          className="font-display font-extrabold text-[12vw] leading-[0.9] tracking-tight mb-8"
          initial={{ opacity: 0, rotateX: 45, y: 50 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: 'bottom' }}
        >
          Prompt<br />Engineering
        </motion.h1>

        {/* 3D Image reveal */}
        <motion.div
          className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] mt-auto mb-10 border border-zhi-navy/10"
          initial={{ y: 200, opacity: 0, rotateX: 30, rotateY: 15, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, rotateX: 10, rotateY: -5, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5, type: 'spring', stiffness: 100, damping: 20 }}
        >
          <img
            src={`${import.meta.env.BASE_URL}images/screen-home.jpg`}
            alt="App Home"
            className="w-full h-full object-cover object-top"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
