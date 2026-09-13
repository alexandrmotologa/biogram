import { useState, useRef } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import type { Tile } from "../../hooks/useProfileData";

interface Props {
  tile: Tile;
  onClick: () => void;
}

export function AudioPlayerTile({ tile, onClick }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const meta = (tile.meta as { duration?: string; artist?: string }) || {};

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();

    if (!audioRef.current && tile.url) {
      audioRef.current = new Audio(tile.url);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  return (
    <div
      className="bento-tile flex flex-col justify-between p-4 cursor-pointer relative overflow-hidden group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
            <Volume2 size={16} />
          </div>
          <span className="text-[11px] font-semibold text-pink-400 uppercase tracking-wider">
            Audio Track
          </span>
        </div>

        <button
          onClick={togglePlay}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            isPlaying
              ? "bg-pink-500 text-white shadow-lg shadow-pink-500/40"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} className="translate-x-[1px]" />}
        </button>
      </div>

      <div className="my-2">
        <h3 className="font-semibold text-sm text-white group-hover:text-pink-300 transition-colors">
          {tile.title}
        </h3>
        <p className="text-xs text-white/50">{meta.artist || tile.subtitle || "Track Preview"}</p>
      </div>

      {/* Animated audio wave bars */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-end gap-[3px] h-4">
          {[40, 70, 30, 90, 60, 100, 45, 80, 50, 75, 35].map((height, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${
                isPlaying ? "bg-pink-400 animate-pulse" : "bg-white/20"
              }`}
              style={{
                height: isPlaying ? `${Math.max(20, (height * (i % 2 === 0 ? 1 : 0.7)))}%` : "25%",
                animationDelay: `${i * 80}ms`,
              }}
            />
          ))}
        </div>
        <span className="text-[11px] text-white/40 font-mono">
          {meta.duration || "0:30"}
        </span>
      </div>
    </div>
  );
}
