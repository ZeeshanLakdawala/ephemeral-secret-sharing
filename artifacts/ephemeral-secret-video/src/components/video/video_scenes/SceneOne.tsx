import { motion } from 'framer-motion';
import { SproutLock, Burst } from './Shared';

export function SceneOne() {
  return (
    <motion.section className="scene-layer z-[2]" initial={{ clipPath: 'circle(0% at 50% 52%)', opacity: 0 }} animate={{ clipPath: 'circle(100% at 50% 52%)', opacity: 1 }} exit={{ clipPath: 'circle(0% at 82% 18%)', opacity: 0 }} transition={{ duration: .85, ease: [0.16, 1, 0.3, 1] }}>
      <div className="absolute left-[8vw] top-[17vw] w-[48vw]">
        <motion.div className="tiny-label mb-[1.5vw] text-[#ff5b55]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25, duration: .35 }}>a tiny problem</motion.div>
        <motion.h1 className="display m-0 text-[6.7vw] font-extrabold leading-[.83] tracking-[-.06em] text-[#2e203d]" initial={{ opacity: 0, y: 40, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: .35, type: 'spring', stiffness: 180, damping: 14 }}>
          Need to<br /><span className="text-[#3b5bdb]">share</span> a secret?
        </motion.h1>
        <motion.p className="mt-[1.8vw] max-w-[28vw] text-[1.55vw] font-bold leading-tight text-[#2e203d]/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .75, duration: .5 }}>API keys. Tokens. Passwords.<br />Not for the group chat.</motion.p>
      </div>
      <motion.div className="absolute right-[14vw] top-[14vw] flex h-[21vw] w-[21vw] items-center justify-center rounded-[5vw] border-[.35vw] border-[#2e203d] bg-[#ffd65a] soft-shadow" initial={{ scale: .2, rotate: -18 }} animate={{ scale: 1, rotate: 7 }} transition={{ delay: .25, type: 'spring', stiffness: 150, damping: 12 }}>
        <SproutLock size="11.5vw" />
        <motion.img src={`${import.meta.env.BASE_URL}assets/secret-sprout.png`} alt="" className="absolute -bottom-[2vw] -left-[4vw] w-[9vw]" initial={{ opacity: 0, scale: .4 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .9, type: 'spring', stiffness: 200, damping: 13 }} />
        <motion.div className="absolute -right-[3vw] -top-[3vw] w-[7vw]" animate={{ rotate: [0, 14, -8, 0], scale: [1, 1.12, 1] }} transition={{ duration: 2.8, repeat: Infinity }}><Burst color="#ff5b55" /></motion.div>
      </motion.div>
      <motion.div className="absolute bottom-[7vw] left-[8vw] flex items-center gap-[1vw]" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.05, duration: .5 }}>
        <span className="h-[.8vw] w-[.8vw] rounded-full bg-[#ff5b55]" /><span className="text-[1.1vw] font-extrabold uppercase tracking-[.12em] text-[#2e203d]/55">send it somewhere safe →</span>
      </motion.div>
      <motion.div className="absolute right-[7vw] bottom-[7vw] rotate-[-8deg] rounded-[1vw] border-[.25vw] border-[#2e203d] bg-[#fff5d9] px-[1.1vw] py-[.7vw] text-[1.1vw] font-black shadow-[.25vw_.25vw_0_#2e203d]" initial={{ opacity: 0, scale: .5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.25, type: 'spring', stiffness: 250, damping: 13 }}>keep it temporary</motion.div>
    </motion.section>
  );
}