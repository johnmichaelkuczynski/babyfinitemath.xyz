import { useCallback, useMemo, useState } from 'react';

export function useSceneControls(baseDurations: Record<string, number>) {
  const sceneKeys = useMemo(() => Object.keys(baseDurations), [baseDurations]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [locked, setLocked] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mountKey, setMountKey] = useState(0);

  const durations = useMemo(() => {
    const key = sceneKeys[activeIndex];
    if (locked) return { [`${key}_r1`]: baseDurations[key], [`${key}_r2`]: baseDurations[key] };
    const rotated: Record<string, number> = {};
    sceneKeys.forEach((_, offset) => {
      const nextKey = sceneKeys[(activeIndex + offset) % sceneKeys.length];
      rotated[nextKey] = baseDurations[nextKey];
    });
    return rotated;
  }, [activeIndex, baseDurations, locked, sceneKeys]);

  const onSceneChange = useCallback((rawKey: string) => {
    const index = sceneKeys.indexOf(rawKey.replace(/_r[12]$/, ''));
    if (index >= 0) setActiveIndex(index);
  }, [sceneKeys]);

  const jumpTo = useCallback((index: number) => {
    setActiveIndex(index);
    setPaused(false);
    setMountKey((value) => value + 1);
  }, []);

  const toggleLock = useCallback(() => {
    setLocked((value) => !value);
    setPaused(false);
    setMountKey((value) => value + 1);
  }, []);

  return {
    sceneKeys,
    activeIndex,
    locked,
    paused,
    mountKey,
    durations,
    onSceneChange,
    jumpTo,
    toggleLock,
    togglePause: () => setPaused((value) => !value),
  };
}