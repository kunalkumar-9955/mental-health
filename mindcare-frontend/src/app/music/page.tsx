"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, Waves } from "lucide-react";
import { musicAPI } from "@/lib/api";
import AppLayout from "@/components/layout/AppLayout";

const CATEGORY_COLORS: Record<string, string> = {
  anxiety: "from-blue-600 to-cyan-500",
  stress: "from-green-600 to-teal-500",
  sleep: "from-indigo-600 to-purple-500",
  focus: "from-yellow-600 to-orange-500",
  meditation: "from-purple-600 to-pink-500",
  happiness: "from-orange-500 to-yellow-400",
};

export default function MusicPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("meditation");
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number>();

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadTracks(activeCategory); }, [activeCategory]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const loadCategories = async () => {
    try {
      const res = await musicAPI.getCategories();
      setCategories(res.data.categories || []);
    } catch (e) {}
  };

  const loadTracks = async (category: string) => {
    try {
      const res = await musicAPI.getCategory(category);
      setTracks(res.data.tracks || []);
    } catch (e) {}
  };

  const playTrack = (track: any, index: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = track.url;
      audioRef.current.volume = volume;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current = new Audio(track.url);
      audioRef.current.volume = volume;
      audioRef.current.play().catch(() => {});
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          const p = (audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100;
          setProgress(p);
        }
      };
      audioRef.current.onended = () => { setIsPlaying(false); nextTrack(); };
    }
    setCurrentTrack(track);
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play().catch(() => {}); setIsPlaying(true); }
  };

  const nextTrack = () => {
    const next = (currentIndex + 1) % tracks.length;
    if (tracks[next]) playTrack(tracks[next], next);
  };

  const prevTrack = () => {
    const prev = (currentIndex - 1 + tracks.length) % tracks.length;
    if (tracks[prev]) playTrack(tracks[prev], prev);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Music Therapy</h1>
          <p className="text-white/60 text-sm mt-1">Mood-based healing frequencies & therapeutic sounds</p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                activeCategory === cat.id
                  ? `bg-gradient-to-r ${CATEGORY_COLORS[cat.id] || "from-purple-600 to-cyan-500"} text-white`
                  : "glass text-white/60 hover:text-white"
              }`}>
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
              <span className="text-xs opacity-60">({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Now Playing */}
        <AnimatePresence>
          {currentTrack && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className={`glass-card p-6 rounded-2xl bg-gradient-to-br ${CATEGORY_COLORS[activeCategory] || "from-purple-600/20 to-cyan-500/10"} relative overflow-hidden`}>
              {/* Animated waves background */}
              <div className="absolute inset-0 opacity-10">
                {[...Array(5)].map((_, i) => (
                  <motion.div key={i} className="absolute bottom-0 left-0 right-0 h-16 rounded-full"
                    style={{ background: "white", bottom: `${i * 8}px` }}
                    animate={{ scaleX: [1, 1.1, 0.9, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }} />
                ))}
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <motion.div animate={isPlaying ? { rotate: 360 } : {}} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                    {currentTrack.emoji}
                  </motion.div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{currentTrack.title}</h3>
                    <p className="text-white/70 text-sm">{currentTrack.artist}</p>
                    <p className="text-white/50 text-xs">{currentTrack.frequency} • {currentTrack.duration}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-white/20 rounded-full mb-4 overflow-hidden">
                  <motion.div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }} />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <button onClick={prevTrack} className="text-white/70 hover:text-white transition-colors">
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all">
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <button onClick={nextTrack} className="text-white/70 hover:text-white transition-colors">
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-2 mt-4">
                  <Volume2 className="w-4 h-4 text-white/60" />
                  <input type="range" min={0} max={1} step={0.1} value={volume}
                    onChange={e => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: "rgba(255,255,255,0.2)" }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Track List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tracks.map((track, i) => (
            <motion.div key={track.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => playTrack(track, i)}
              className={`glass-card p-4 rounded-2xl cursor-pointer hover:scale-[1.02] transition-all ${currentTrack?.id === track.id ? "border border-purple-500/50" : ""}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[activeCategory] || "from-purple-600 to-cyan-500"} flex items-center justify-center text-2xl`}>
                  {track.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{track.title}</p>
                  <p className="text-white/50 text-xs">{track.artist}</p>
                  <p className="text-white/40 text-xs">{track.frequency} • {track.duration}</p>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentTrack?.id === track.id && isPlaying ? "bg-purple-600" : "bg-white/10"}`}>
                  {currentTrack?.id === track.id && isPlaying
                    ? <Pause className="w-3 h-3 text-white" />
                    : <Play className="w-3 h-3 text-white/60 ml-0.5" />}
                </div>
              </div>
              <div className="mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs bg-gradient-to-r ${CATEGORY_COLORS[activeCategory] || "from-purple-600 to-cyan-500"} bg-opacity-20 text-white/70`}>
                  {track.mood}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
