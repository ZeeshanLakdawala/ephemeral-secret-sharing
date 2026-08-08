import { motion } from 'framer-motion';

export function SproutLock({ className = '', size = '10vw' }: { className?: string; size?: string }) {
  return (
    <motion.div className={className} style={{ width: size, height: size }} animate={{ y: [0, '-.45vw', 0], rotate: [-2, 2, -2] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
      <svg viewBox="0 0 160 160" width="100%" height="100%" aria-hidden="true">
        <path d="M54 66V48c0-15 11-27 26-27s26 12 26 27v18" fill="none" stroke="#2e203d" strokeWidth="10" strokeLinecap="round"/>
        <rect x="24" y="57" width="112" height="83" rx="26" fill="#ffd65a" stroke="#2e203d" strokeWidth="10"/>
        <circle cx="80" cy="95" r="11" fill="#2e203d"/>
        <path d="M80 106v16" stroke="#2e203d" strokeWidth="9" strokeLinecap="round"/>
        <path d="M49 60c-5-16-17-21-26-11 1 15 11 22 26 21M111 60c5-16 17-21 26-11-1 15-11 22-26 21" fill="#a8e8c9" stroke="#2e203d" strokeWidth="8" strokeLinejoin="round"/>
        <path d="M57 82h3M100 82h3" stroke="#2e203d" strokeWidth="8" strokeLinecap="round"/>
      </svg>
    </motion.div>
  );
}

export function Burst({ color = '#ff5b55', className = '' }: { color?: string; className?: string }) {
  return (
    <motion.svg className={className} viewBox="0 0 220 220" aria-hidden="true" animate={{ rotate: [0, 8, -4, 0], scale: [1, 1.05, 1] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}>
      <path d="M110 8l16 48 36-37-9 51 50-10-42 30 45 27-52-7 19 49-40-34-15 51-12-51-42 34 20-49-53 7 45-27-43-30 51 10-8-51 36 37z" fill={color} stroke="#2e203d" strokeWidth="7" strokeLinejoin="round"/>
      <circle cx="110" cy="110" r="24" fill="#ffd65a" stroke="#2e203d" strokeWidth="7"/>
    </motion.svg>
  );
}

export function DotTrail({ count = 6, color = '#2e203d' }: { count?: number; color?: string }) {
  return <div className="flex items-center gap-[.8vw]">{Array.from({ length: count }).map((_, i) => <motion.span key={i} className="block h-[.65vw] w-[.65vw] rounded-full" style={{ background: color }} animate={{ y: [0, '-.55vw', 0], opacity: [.35, 1, .35] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * .1 }} />)}</div>;
}