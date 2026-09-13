import { Github, Star } from "lucide-react";
import type { Tile } from "../../hooks/useProfileData";

interface Props {
  tile: Tile;
  onClick: () => void;
}

export function GitHubRepoTile({ tile, onClick }: Props) {
  const meta = tile.meta as { stars?: number; language?: string; languageColor?: string } | null;

  return (
    <div
      className={`bento-tile ${tile.col_span === 2 ? "tile-span-2x1" : ""}`}
      onClick={onClick}
      role="link"
      tabIndex={0}
      id={`tile-github-${tile.id}`}
    >
      <div className="tile-icon">
        <Github size={20} />
      </div>
      <div className="tile-title">{tile.title}</div>
      {tile.subtitle && <div className="tile-subtitle">{tile.subtitle}</div>}
      <div className="github-stats">
        {meta?.stars !== undefined && (
          <span className="flex items-center gap-1">
            <Star size={12} fill="currentColor" />
            {meta.stars}
          </span>
        )}
        {meta?.language && (
          <span className="flex items-center gap-1">
            <span
              className="github-lang-dot"
              style={{ backgroundColor: meta.languageColor || "#6e7681" }}
            />
            {meta.language}
          </span>
        )}
      </div>
    </div>
  );
}
