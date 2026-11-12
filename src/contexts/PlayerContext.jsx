import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useSyncStore } from "../lib/syncStore";

const Ctx = createContext(null);
export const usePlayer = () => useContext(Ctx);

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const recordPlay = useSyncStore((s) => s.recordPlay);

  const current = queue[index] || null;

  const loadAndPlay = useCallback((list, startIndex = 0) => {
    setQueue(list);
    setIndex(startIndex);
    const song = list[startIndex];
    if (!song) return;
    audioRef.current.src = song.uri;
    audioRef.current.play().catch(() => {});
    setPlaying(true);
    recordPlay(song.id);
  }, [recordPlay]);

  useEffect(() => {
    if (!current) return;
    audioRef.current.src = current.uri;
    if (playing) audioRef.current.play().catch(() => {});
  }, [index]); // eslint-disable-line

  useEffect(() => {
    const a = audioRef.current;
    const onTime = () => setCurrentTime(a.currentTime);
    const onDur = () => setDuration(a.duration || 0);
    const onEnd = () => { if (index < queue.length - 1) setIndex((i) => i + 1); };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onDur);
    a.addEventListener("ended", onEnd);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onDur);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, [index, queue.length]);

  const playPause = () => {
    if (!current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play().catch(() => {}); setPlaying(true); }
  };
  const next = () => { if (index < queue.length - 1) setIndex((i) => i + 1); };
  const prev = () => {
    if (audioRef.current.currentTime > 3) { audioRef.current.currentTime = 0; return; }
    if (index > 0) setIndex((i) => i - 1);
  };
  const seek = (sec) => { audioRef.current.currentTime = sec; setCurrentTime(sec); };

  return (
    <Ctx.Provider value={{ current, queue, index, playing, currentTime, duration, loadAndPlay, playPause, next, prev, seek }}>
      {children}
    </Ctx.Provider>
  );
}