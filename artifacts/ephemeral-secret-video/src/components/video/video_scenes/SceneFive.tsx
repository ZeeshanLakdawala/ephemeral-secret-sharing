import { motion } from 'framer-motion';
import { Burst, SproutLock } from './Shared';

export function SceneFive() {
  return (
    <motion.section className="scene-layer z-[2]" initial={{ clipPath: 'polygon(0 0,0 0,0 100%,0 100%)' }} animate={{ clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)' }} exit={{ clipPath: 'polygon(100% 0,100% 0,100% 100%,100% 100%)' }} transition={{ duration: .85, ease: [0.16, 1, 0.3, 1] }}>
      <motion.div className="absolute left-[9vw] top-[12vw] w-[57vw]" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .28, duration: .55 }}>
        <div className="tiny-label text-[#2e203d]/55">ephemeral secret sharing</div>
        <h2 className="display mt-[1vw] text-[6.5vw] font-extrabold leading-[.8] tracking-[-.07em] text-[#2e203d]">Share now.<br /><span className="text-[#fff5d9] [text-shadow:.2vw_.2vw_0_#2e203d]">Worry never.</span></h2>
        <p className="mt-[1.7vw] max-w-[30vw] text-[1.45vw] font-bold leading-tight text-[#2e203d]/75">Real-time rooms for secrets<br />that know when to disappear.</p>
      </motion.div>
      <motion.div className="absolute right-[14vw] top-[13vw] flex h-[24vw] w-[24vw] items-center justify-center rounded-[6vw] border-[.35vw] border-[#2e203d] bg-[#ffd65a] soft-shadow" initial={{ scale: .4, rotate: 12 }} animate={{ scale: 1, rotate: -5 }} transition={{ delay: .35, type: 'spring', stiffness: 150, damping: 12 }}><SproutLock size="13vw" /><motion.div className="absolute -left-[4vw] -top-[3vw] w-[8vw]" animate={{ rotate: [0, 16, -7, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}><Burst color="#3b5bdb" /></motion.div></motion.div>
      <motion.div className="absolute bottom-[6vw] left-[9vw] flex items-center gap-[1vw]" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }}><span className="rounded-full border-[.22vw] border-[#2e203d] bg-[#a8e8c9] px-[1.15vw] py-[.65vw] text-[1.05vw] font-black shadow-[.25vw_.25vw_0_#2e203d]">no accounts</span><span className="rounded-full border-[.22vw] border-[#2e203d] bg-[#fff5d9] px-[1.15vw] py-[.65vw] text-[1.05vw] font-black shadow-[.25vw_.25vw_0_#2e203d]">no leftovers</span></motion.div>
      <motion.div className="absolute bottom-[7vw] right-[8vw] flex items-center gap-[.8vw] text-[1vw] font-black uppercase tracking-[.13em] text-[#2e203d]/55" animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>made to vanish <span className="text-[1.8vw] text-[#2e203d]">↗</span></motion.div>
    </motion.section>
  );
}