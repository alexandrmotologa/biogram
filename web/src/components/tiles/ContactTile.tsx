import { MessageCircle } from "lucide-react";
import type { Tile } from "../../hooks/useProfileData";

interface Props {
  tile: Tile;
  onClick: () => void;
}

export function ContactTile({ tile, onClick }: Props) {
  return (
    <div
      className={`bento-tile contact-tile ${tile.col_span === 2 ? "tile-span-2x1" : ""}`}
      onClick={onClick}
      role="link"
      tabIndex={0}
      id={`tile-contact-${tile.id}`}
    >
      <div className="tile-icon" style={{ margin: "0 auto 12px" }}>
        <MessageCircle size={20} />
      </div>
      <div className="tile-title">{tile.title}</div>
      {tile.subtitle && <div className="tile-subtitle">{tile.subtitle}</div>}
    </div>
  );
}
