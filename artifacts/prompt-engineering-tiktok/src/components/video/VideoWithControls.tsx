import { useCallback, useEffect, useState } from 'react';
import { Pause, Play, Repeat, Volume2, VolumeX } from 'lucide-react';
import VideoTemplate, { SCENE_DURATIONS } from './VideoTemplate';
import { useSceneControls } from './useSceneControls';

const DETAILS = [
  ['Hook', 'src/components/video/video_scenes/Scene1.tsx'],
  ['Course', 'src/components/video/video_scenes/Scene2.tsx'],
  ['Practice', 'src/components/video/video_scenes/Scene3.tsx'],
  ['ZHI Systems', 'src/components/video/video_scenes/Scene4.tsx'],
  ['Course URL', 'src/components/video/video_scenes/Scene5.tsx'],
] as const;

export default function VideoWithControls() {
  const isIframed = typeof window !== 'undefined' && window.self !== window.top;
  const [muted, setMuted] = useState(false);
  const controls = useSceneControls(SCENE_DURATIONS);

  useEffect(() => {
    if (!controls.paused) return;
    const animations = document.getAnimations().filter((item) => item.playState === 'running');
    animations.forEach((item) => item.pause());
    return () => animations.forEach((item) => item.play());
  }, [controls.paused]);

  const jumpTo = useCallback((index: number) => {
    controls.jumpTo(index);
    window.parent.postMessage({
      type: 'REPLIT_VIDEO_SCENE_SELECTED',
      payload: {
        sceneIndex: index,
        sceneCount: controls.sceneKeys.length,
        sceneTitle: DETAILS[index][0],
        filePath: DETAILS[index][1],
        lineNumber: 1,
      },
    }, '*');
  }, [controls]);

  if (!isIframed) return <VideoTemplate />;

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <VideoTemplate
        key={controls.mountKey}
        durations={controls.durations}
        loop
        paused={controls.paused}
        muted={muted}
        onSceneChange={controls.onSceneChange}
      />
      <div className="absolute bottom-0 inset-x-0 z-50 flex items-center gap-3 bg-black/55 backdrop-blur-md px-4 py-3 text-white">
        <button aria-label={controls.paused ? 'Play' : 'Pause'} onClick={controls.togglePause} className="p-2">
          {controls.paused ? <Play /> : <Pause />}
        </button>
        <button aria-label="Loop current scene" aria-pressed={controls.locked} onClick={controls.toggleLock} className={`p-2 ${controls.locked ? 'bg-white/20 rounded-lg' : ''}`}>
          <Repeat />
        </button>
        <button aria-label={muted ? 'Unmute narration' : 'Mute narration'} onClick={() => setMuted((value) => !value)} className="p-2">
          {muted ? <VolumeX /> : <Volume2 />}
        </button>
        <div className="flex-1 flex gap-2">
          {controls.sceneKeys.map((key, index) => (
            <button
              key={key}
              aria-label={`Jump to scene ${index + 1}`}
              onClick={() => jumpTo(index)}
              className={`h-3 flex-1 rounded-full ${index === controls.activeIndex ? 'bg-white' : 'bg-white/25'}`}
            />
          ))}
        </div>
        <span className="font-mono text-sm">{controls.activeIndex + 1}/{controls.sceneKeys.length}</span>
      </div>
    </div>
  );
}