import { Play } from "lucide-react";
import type { Tile } from "../../hooks/useProfileData";

interface Props {
  tile: Tile;
  onClick: () => void;
}

export function VideoEmbedTile({ tile, onClick }: Props) {
  const meta = tile.meta as { mediaType?: string; videoId?: string } | null;
  const isYouTube = meta?.mediaType === "youtube" && meta?.videoId;
  const thumbnailUrl = isYouTube
    ? `https://img.youtube.com/vi/${meta!.videoId}/mqdefault.jpg`
    : null;

  return (
    <div
      className={`bento-tile ${tile.col_span === 2 ? "tile-span-2x1" : ""}`}
      onClick={onClick}
      role="link"
      tabIndex={0}
      id={`tile-video-${tile.id}`}
    >
      <div className="relative">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={tile.title}
            className="video-thumbnail"
            loading="lazy"
          />
        ) : (
          <div className="video-thumbnail flex items-center justify-center">
            <Play size={32} className="text-white/60" />
          </div>
        )}
        <div className="video-play-overlay">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play size={24} className="text-white ml-1" fill="white" />
          </div>
        </div>
      </div>
      <div className="tile-title">{tile.title}</div>
      {tile.subtitle && <div className="tile-subtitle">{tile.subtitle}</div>}
    </div>
  );
}
