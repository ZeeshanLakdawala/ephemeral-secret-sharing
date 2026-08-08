import { motion } from 'framer-motion';
import { SproutLock, DotTrail } from './Shared';

const code = ['4', '7', '1', '8', '2', '6'];
export function SceneTwo() {
  return (
    <motion.section className="scene-layer z-[2]" initial={{ clipPath: 'polygon(100% 0,100% 0,100% 100%,100% 100%)' }} animate={{ clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)' }} exit={{ clipPath: 'polygon(0 0,0 0,0 100%,0 100%)' }} transition={{ duration: .8, ease: [0.16, 1, 0.3, 1] }}>
      <div className="absolute left-[9vw] top-[13vw]">
        <motion.div className="tiny-label text-[#3b5bdb]" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }}>one tap</motion.div>
        <motion.h2 className="display mt-[1vw] text-[6.5vw] font-extrabold leading-[.82] tracking-[-.07em] text-[#2e203d]" initial={{ opacity: 0, scale: .8, rotate: -3 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: .35, type: 'spring', stiffness: 180, damping: 13 }}>Make a<br /><span className="text-[#ff5b55]">room.</span></motion.h2>
        <motion.p className="mt-[1.5vw] text-[1.5vw] font-bold text-[#2e203d]/65" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .9 }}>No account. No trail.</motion.p>
      </div>
      <motion.div className="absolute right-[11vw] top-[13vw] w-[37vw] rotate-[3deg] paper-card soft-shadow p-[2vw]" initial={{ x: 25, opacity: 0, rotate: 10, scale: .88 }} animate={{ x: 0, opacity: 1, rotate: 3, scale: 1 }} transition={{ delay: .35, type: 'spring', stiffness: 130, damping: 14 }}>
        <div className="mb-[1.5vw] flex items-center justify-between"><span className="tiny-label text-[#2e203d]/50">your room code</span><span className="rounded-full bg-[#a8e8c9] px-[.8vw] py-[.35vw] text-[.9vw] font-black">LIVE</span></div>
        <div className="flex gap-[.65vw]">{code.map((digit, i) => <motion.div key={digit + i} className="flex h-[6.2vw] w-[4.5vw] items-center justify-center rounded-[1.2vw] border-[.22vw] border-[#2e203d] bg-[#ffd65a] font-mono text-[3.3vw] font-bold text-[#2e203d] shadow-[.22vw_.22vw_0_#2e203d]" initial={{ y: 40, opacity: 0, rotate: i % 2 ? 8 : -8 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ delay: .55 + i * .1, type: 'spring', stiffness: 280, damping: 13 }}>{digit}</motion.div>)}</div>
        <div className="mt-[1.5vw] flex items-center justify-between text-[1vw] font-extrabold text-[#2e203d]/55"><span>expires when you leave</span><DotTrail color="#ff5b55" /></div>
      </motion.div>
      <motion.div className="absolute bottom-[7vw] left-[9vw] flex items-center gap-[1vw]" animate={{ x: [0, 12, 0] }} transition={{ duration: 2.2, repeat: Infinity }}><SproutLock size="5vw" /><span className="rounded-full border-[.2vw] border-[#2e203d] bg-[#a8e8c9] px-[1vw] py-[.6vw] text-[1.1vw] font-black">room ready</span></motion.div>
    </motion.section>
  );
}