import { Twitter, Linkedin, Youtube, Globe } from "lucide-react";
import type { Tile } from "../../hooks/useProfileData";

interface Props {
  tile: Tile;
  onClick: () => void;
}

const platformIcons: Record<string, React.ComponentType<{ size: number }>> = {
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  website: Globe,
};

const platformColors: Record<string, string> = {
  twitter: "#1DA1F2",
  linkedin: "#0A66C2",
  youtube: "#FF0000",
  website: "var(--accent)",
};

export function SocialLinkTile({ tile, onClick }: Props) {
  const meta = tile.meta as { platform?: string } | null;
  const platform = meta?.platform || "website";
  const Icon = platformIcons[platform] || Globe;
  const iconColor = platformColors[platform] || "var(--accent)";

  return (
    <div
      className="bento-tile"
      onClick={onClick}
      role="link"
      tabIndex={0}
      id={`tile-social-${tile.id}`}
    >
      <div className="tile-icon" style={{ color: iconColor, background: `${iconColor}20` }}>
        <Icon size={20} />
      </div>
      <div className="tile-title">{tile.title}</div>
      {tile.subtitle && <div className="tile-subtitle">{tile.subtitle}</div>}
    </div>
  );
}
