import { useVideoPlayer, VideoPausedContext } from '@/lib/video';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

import { Scene1, Scene2, Scene3, Scene4, Scene5 } from './video_scenes';

export const SCENE_DURATIONS = {
  intro: 6000,
  details: 6000,
  practice: 5000,
  custom: 9000,
  outro: 8000,
};

const SCENES = [Scene1, Scene2, Scene3, Scene4, Scene5];

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  paused = false,
  muted = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  paused?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentSceneKey } = useVideoPlayer({
    durations,
    loop,
    paused,
  });
  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '');
  const sceneIndex = Object.keys(SCENE_DURATIONS).indexOf(baseSceneKey);
  const Scene = SCENES[sceneIndex];

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
    if (audioRef.current) {
      if (baseSceneKey === 'intro') {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((e: any) => console.log('Audio autoplay prevented:', e));
      }
    }
  }, [baseSceneKey, currentSceneKey, onSceneChange]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = muted;
    if (paused) audioRef.current.pause();
    else audioRef.current.play().catch(() => undefined);
  }, [muted, paused]);

  return (
    <VideoPausedContext.Provider value={paused}>
      <div
        className="w-full h-screen overflow-hidden relative"
        style={{ backgroundColor: 'var(--color-zhi-cream)' }}
      >
        <audio
          ref={audioRef}
          src={`${import.meta.env.BASE_URL}voiceover.mp3`}
          preload="auto"
        />
        <AnimatePresence mode="popLayout">
          {Scene && <Scene key={currentSceneKey} />}
        </AnimatePresence>
      </div>
    </VideoPausedContext.Provider>
  );
}
