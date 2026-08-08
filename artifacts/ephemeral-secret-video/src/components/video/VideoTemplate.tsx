import { useEffect, useRef } from 'react';
import { useVideoPlayer } from '@/lib/video';
import { AnimatePresence, motion } from 'framer-motion';
import { SceneOne } from './video_scenes/SceneOne';
import { SceneTwo } from './video_scenes/SceneTwo';
import { SceneThree } from './video_scenes/SceneThree';
import { SceneFour } from './video_scenes/SceneFour';
import { SceneFive } from './video_scenes/SceneFive';

export const SCENE_DURATIONS = {
  hook: 4300,
  room: 4200,
  live: 4700,
  vanish: 4300,
  outro: 5000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  hook: SceneOne,
  room: SceneTwo,
  live: SceneThree,
  vanish: SceneFour,
  outro: SceneFive,
};

const SCENE_START_SEC: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  let cumulativeMs = 0;
  for (const [key, ms] of Object.entries(SCENE_DURATIONS)) {
    out[key] = cumulativeMs / 1000;
    cumulativeMs += ms;
  }
  return out;
})();

const AUDIO_SEEK_EPSILON_SEC = 0.18;

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  muted = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentScene, currentSceneKey } = useVideoPlayer({ durations, loop });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '') as keyof typeof SCENE_DURATIONS;
  const sceneIndex = Object.keys(SCENE_DURATIONS).indexOf(baseSceneKey);
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.45;
    const targetTime = SCENE_START_SEC[baseSceneKey] ?? 0;
    if (Math.abs(audio.currentTime - targetTime) > AUDIO_SEEK_EPSILON_SEC) {
      audio.currentTime = targetTime;
    }
    audio.play().catch(() => {});
  }, [currentSceneKey, baseSceneKey, muted]);

  const sceneColors = ['#fff5d9', '#ffd65a', '#a8e8c9', '#c9b5f7', '#ff5b55'];
  const sceneShapes = [
    { x: '78vw', y: '10vw', size: '18vw', color: '#ff5b55', rotate: 12 },
    { x: '7vw', y: '65vh', size: '24vw', color: '#3b5bdb', rotate: -18 },
    { x: '76vw', y: '62vh', size: '19vw', color: '#ff5b55', rotate: 22 },
    { x: '9vw', y: '8vh', size: '21vw', color: '#ffd65a', rotate: -12 },
    { x: '42vw', y: '4vh', size: '20vw', color: '#ffd65a', rotate: 10 },
  ];
  const shape = sceneShapes[sceneIndex] ?? sceneShapes[0];

  return (
    <>
      <div className="video-root" style={{ backgroundColor: sceneColors[sceneIndex] }}>
        <motion.div
          className="absolute rounded-full opacity-80"
          animate={{ left: shape.x, top: shape.y, width: shape.size, height: shape.size, backgroundColor: shape.color, rotate: shape.rotate }}
          transition={{ duration: 1.1, type: 'spring', stiffness: 90, damping: 18 }}
          style={{ zIndex: 0, filter: 'blur(.05vw)' }}
        />
        <motion.div
          className="absolute rounded-[38%] border-[.3vw] border-[#2e203d]/20"
          animate={{ x: ['4vw', '7vw', '4vw'], y: ['-2vw', '1vw', '-2vw'], rotate: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '30vw', height: '18vw', right: '-6vw', bottom: '-5vw', zIndex: 0 }}
        />
        <div className="absolute inset-0 dot-grid opacity-25" style={{ zIndex: 0 }} />
        <div className="absolute left-[3vw] top-[2.2vw] z-10 flex items-center gap-[.7vw]">
          <div className="h-[2.7vw] w-[2.7vw] rounded-[.9vw] border-[.25vw] border-[#2e203d] bg-[#ffd65a] shadow-[.28vw_.28vw_0_#2e203d]">
            <div className="mx-auto mt-[.7vw] h-[.6vw] w-[.6vw] rounded-full bg-[#2e203d]" />
          </div>
          <span className="display text-[1.35vw] font-extrabold tracking-tight text-[#2e203d]">ephemeral</span>
        </div>
        <div className="absolute right-[3vw] top-[2.6vw] z-10 tiny-label text-[#2e203d]/60">secret sharing / {String(sceneIndex + 1).padStart(2, '0')}</div>
        <AnimatePresence mode="sync" initial={false}>
          {SceneComponent && <SceneComponent key={currentSceneKey} />}
        </AnimatePresence>
      </div>
      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}audio/bg_music.mp3`}
        preload="auto"
        autoPlay
        muted={muted}
      />
    </>
  );
}
