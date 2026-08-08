import { motion } from 'framer-motion';
import { Burst, SproutLock } from './Shared';

export function SceneFour() {
  return (
    <motion.section className="scene-layer z-[2]" initial={{ opacity: 0, scale: 1.15 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .72, rotate: -4 }} transition={{ duration: .75, ease: [0.16, 1, 0.3, 1] }}>
      <motion.div className="absolute inset-x-0 top-[10vw] text-center" initial={{ y: 24 }} animate={{ y: 0 }} transition={{ delay: .25, type: 'spring', stiffness: 170 }}>
        <div className="tiny-label text-[#ff5b55]">when the room ends</div>
        <h2 className="display mt-[.8vw] text-[6.4vw] font-extrabold leading-[.8] tracking-[-.07em] text-[#2e203d]">Poof.<br /><span className="text-[#3b5bdb]">Gone.</span></h2>
      </motion.div>
      <motion.div className="absolute left-[16vw] top-[28vw] h-[14vw] w-[68vw] rounded-[2.5vw] border-[.28vw] border-[#2e203d] bg-[#fff5d9] p-[1.5vw] soft-shadow" initial={{ rotate: -2, scale: 1 }} animate={{ rotate: 3, scale: 1.03 }} transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}>
        <div className="mb-[1vw] flex items-center justify-between"><span className="tiny-label text-[#2e203d]/45">room 471826</span><span className="mono text-[1.4vw] font-bold text-[#ff5b55]">00:03</span></div>
        <div className="relative h-[.9vw] overflow-hidden rounded-full bg-[#c9b5f7]"><motion.div className="absolute inset-y-0 left-0 rounded-full bg-[#ff5b55]" animate={{ width: ['72%', '12%'] }} transition={{ duration: 3.5, ease: 'circIn' }} /></div>
        <div className="mt-[1.1vw] flex gap-[.7vw]">{['sk_live_••••', '••••••••••', 'token••••'].map((item, i) => <motion.div key={item} className="mono rounded-[.8vw] border-[.18vw] border-[#2e203d]/25 bg-[#a8e8c9] px-[.8vw] py-[.5vw] text-[1vw] font-bold" animate={{ opacity: [1, 1, 0], scale: [1, 1.02, .4], y: [0, 0, -10 - i * 8] }} transition={{ duration: 2.8, delay: .5 + i * .28, repeat: Infinity, repeatDelay: .8 }}>{item}</motion.div>)}</div>
      </motion.div>
      <motion.div className="absolute right-[12vw] top-[24vw] w-[8vw]" animate={{ rotate: [0, 12, -10, 0], scale: [1, 1.1, .92, 1] }} transition={{ duration: 2.8, repeat: Infinity }}><Burst color="#ff5b55" /></motion.div>
      <motion.img src={`${import.meta.env.BASE_URL}assets/vanish-confetti.png`} alt="" className="absolute right-[18vw] bottom-[7vw] w-[13vw]" initial={{ opacity: 0, scale: .2, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: 8 }} transition={{ delay: .9, type: 'spring', stiffness: 170, damping: 12 }} />
      <motion.div className="absolute left-[10vw] bottom-[7vw] flex items-center gap-[1vw]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .8 }}><SproutLock size="4.5vw" /><span className="text-[1.15vw] font-black text-[#2e203d]/65">host left → everything left</span></motion.div>
      <div className="absolute left-[5vw] top-[22vw] h-[11vw] w-[.3vw] rotate-[18deg] bg-[#3b5bdb]" />
    </motion.section>
  );
}