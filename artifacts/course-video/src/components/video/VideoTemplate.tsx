import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { getNarrationCue } from './narrationCues';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { Scene6 } from './video_scenes/Scene6';
import { Scene7 } from './video_scenes/Scene7';
import { Scene8 } from './video_scenes/Scene8';
import { Scene9 } from './video_scenes/Scene9';

export const SCENE_DURATIONS = {
  intro: 6800,
  dashboard: 4600,
  curriculum: 5000,
  lecture: 5000,
  tutor: 6800,
  practice: 5500,
  grades: 6700,
  analytics: 4500,
  outro: 6000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  intro: Scene1,
  dashboard: Scene2,
  curriculum: Scene3,
  lecture: Scene4,
  tutor: Scene5,
  practice: Scene6,
  grades: Scene7,
  analytics: Scene8,
  outro: Scene9,
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
  autoPlay = true,
  controls = false,
  syncToAudio = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  muted?: boolean;
  autoPlay?: boolean;
  controls?: boolean;
  /** Lets the audio element own scene timing for an accessible public player. */
  syncToAudio?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const [currentTime, setCurrentTime] = useState(0);
  const { currentSceneKey } = useVideoPlayer({
    durations,
    loop,
    playbackTime: syncToAudio ? currentTime : undefined,
  });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '') as keyof typeof SCENE_DURATIONS;
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !autoPlay) return;
    audio.volume = 1.0;
    const targetTime = SCENE_START_SEC[baseSceneKey] ?? 0;
    if (Math.abs(audio.currentTime - targetTime) > AUDIO_SEEK_EPSILON_SEC) {
      audio.currentTime = targetTime;
    }
    audio.play().catch(() => {});
  }, [currentSceneKey, baseSceneKey, muted, autoPlay]);

  const activeCue = getNarrationCue(currentTime);

  return (
    <div
      className="w-full h-screen overflow-hidden relative"
      style={{ backgroundColor: 'var(--color-bg-light)' }}
    >
      <AnimatePresence mode="popLayout">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>
      {activeCue && (
        <p
          className="absolute bottom-20 left-4 right-4 z-40 mx-auto max-w-3xl rounded-md bg-black/75 px-4 py-3 text-center text-sm leading-relaxed text-white"
          aria-live="polite"
          aria-label="Current caption"
        >
          {activeCue.text}
        </p>
      )}
      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}audio/voiceover.mp3`}
        preload="auto"
        autoPlay={autoPlay}
        controls={controls}
        muted={muted}
        loop={loop}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onSeeked={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setCurrentTime(event.currentTarget.currentTime)}
        aria-label="Prompt Engineering walkthrough narration"
        className={controls ? "absolute bottom-4 left-4 right-4 z-50 w-[calc(100%-2rem)]" : undefined}
      >
        <track
          kind="captions"
          src={`${import.meta.env.BASE_URL}audio/voiceover.vtt`}
          srcLang="en"
          label="English"
          default
        />
      </audio>
    </div>
  );
}
