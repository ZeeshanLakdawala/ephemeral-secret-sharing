import { motion } from 'framer-motion';
import { SproutLock, DotTrail } from './Shared';

const messages = [
  { label: 'Maya', value: 'sk_live_••••••••', color: '#ff5b55', y: '18vw', x: '10vw', delay: .45 },
  { label: 'Jon', value: '••••••••••••••', color: '#3b5bdb', y: '28vw', x: '50vw', delay: .75 },
  { label: 'you', value: 'launch-token••', color: '#a8e8c9', y: '38vw', x: '22vw', delay: 1.05 },
];
export function SceneThree() {
  return (
    <motion.section className="scene-layer z-[2]" initial={{ clipPath: 'circle(0% at 50% 50%)' }} animate={{ clipPath: 'circle(100% at 50% 50%)' }} exit={{ clipPath: 'circle(0% at 15% 85%)' }} transition={{ duration: .85, ease: [0.16, 1, 0.3, 1] }}>
      <div className="absolute left-[8vw] top-[12vw] z-10">
        <motion.div className="tiny-label text-[#3b5bdb]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .2 }}>same room, same moment</motion.div>
        <motion.h2 className="display mt-[1vw] text-[5.9vw] font-extrabold leading-[.84] tracking-[-.07em] text-[#2e203d]" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .35, type: 'spring', stiffness: 170, damping: 15 }}>Secrets<br /><span className="text-[#3b5bdb]">appear live.</span></motion.h2>
      </div>
      <div className="absolute inset-0">
        {messages.map((msg, i) => <motion.div key={msg.label} className="absolute flex w-[36vw] items-center gap-[1vw] paper-card px-[1.4vw] py-[1vw] shadow-[.35vw_.35vw_0_#2e203d]" style={{ left: msg.x, top: msg.y }} initial={{ opacity: 0, scale: .5, rotate: i % 2 ? 5 : -5 }} animate={{ opacity: 1, scale: 1, rotate: i % 2 ? -2 : 2 }} transition={{ delay: msg.delay, type: 'spring', stiffness: 220, damping: 14 }}>
          <div className="flex h-[3.2vw] w-[3.2vw] items-center justify-center rounded-[1vw] border-[.2vw] border-[#2e203d] font-black" style={{ background: msg.color }}>{msg.label[0]}</div>
          <div className="flex-1"><div className="text-[.95vw] font-black uppercase tracking-[.1em] text-[#2e203d]/50">{msg.label} <span className="ml-[.5vw] text-[#3b5bdb]">● now</span></div><div className="mono mt-[.2vw] text-[1.35vw] font-bold">{msg.value}</div></div>
          <motion.div className="h-[.65vw] w-[.65vw] rounded-full bg-[#ff5b55]" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.1, repeat: Infinity, delay: i * .2 }} />
        </motion.div>)}
      </div>
      <motion.div className="absolute bottom-[7vw] right-[9vw] flex items-center gap-[1vw] rounded-full border-[.25vw] border-[#2e203d] bg-[#ffd65a] px-[1.2vw] py-[.7vw] text-[1.15vw] font-black shadow-[.3vw_.3vw_0_#2e203d]" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4, type: 'spring' }}><SproutLock size="3.5vw" /> real-time, not real risky <DotTrail color="#3b5bdb" /></motion.div>
    </motion.section>
  );
}