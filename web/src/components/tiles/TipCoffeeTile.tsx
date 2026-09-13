import { Coffee } from "lucide-react";
import type { Tile } from "../../hooks/useProfileData";

interface Props {
  tile: Tile;
  onClick: () => void;
}

export function TipCoffeeTile({ tile, onClick }: Props) {
  return (
    <div
      className="bento-tile tip-tile"
      onClick={onClick}
      role="button"
      tabIndex={0}
      id={`tile-tip-${tile.id}`}
    >
      <div className="tile-icon">
        <Coffee size={20} />
      </div>
      <div className="tile-title">{tile.title}</div>
      {tile.subtitle && <div className="tile-subtitle">{tile.subtitle}</div>}
    </div>
  );
}
