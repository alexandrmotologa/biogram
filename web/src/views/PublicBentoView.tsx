import { useTelegram } from "../hooks/useTelegram";
import { recordTileClick } from "../hooks/useProfileData";
import type { ProfileData, Tile } from "../hooks/useProfileData";
import { GitHubRepoTile } from "../components/tiles/GitHubRepoTile";
import { SocialLinkTile } from "../components/tiles/SocialLinkTile";
import { TipCoffeeTile } from "../components/tiles/TipCoffeeTile";
import { VideoEmbedTile } from "../components/tiles/VideoEmbedTile";
import { ContactTile } from "../components/tiles/ContactTile";
import { ShareBanner } from "../components/ShareBanner";
import { FileText } from "lucide-react";

interface Props {
  profile: ProfileData;
}

export function PublicBentoView({ profile }: Props) {
  const { haptic } = useTelegram();

  const handleTileClick = (tile: Tile) => {
    haptic("light");
    recordTileClick(tile.id);

    if (tile.url) {
      window.open(tile.url, "_blank", "noopener,noreferrer");
    }
  };

  const renderTile = (tile: Tile) => {
    const onClick = () => handleTileClick(tile);

    switch (tile.type) {
      case "GITHUB":
        return <GitHubRepoTile key={tile.id} tile={tile} onClick={onClick} />;
      case "SOCIAL":
        return <SocialLinkTile key={tile.id} tile={tile} onClick={onClick} />;
      case "TIP":
        return <TipCoffeeTile key={tile.id} tile={tile} onClick={onClick} />;
      case "MEDIA":
        return <VideoEmbedTile key={tile.id} tile={tile} onClick={onClick} />;
      case "CONTACT":
        return <ContactTile key={tile.id} tile={tile} onClick={onClick} />;
      case "TEXT":
        return (
          <div
            key={tile.id}
            className={`bento-tile ${tile.col_span === 2 ? "tile-span-2x1" : ""}`}
            onClick={onClick}
            id={`tile-text-${tile.id}`}
          >
            <div className="tile-icon">
              <FileText size={20} />
            </div>
            <div className="tile-title">{tile.title}</div>
            {tile.subtitle && <div className="tile-subtitle">{tile.subtitle}</div>}
          </div>
        );
      default:
        return null;
    }
  };

  const initials = profile.display_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="animate-fade-in" id="public-bento-view">
      {/* Profile header */}
      <div className="profile-header">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.display_name}
            className="profile-avatar mx-auto"
          />
        ) : (
          <div className="profile-avatar-placeholder">{initials}</div>
        )}
        <h1 className="profile-name">{profile.display_name}</h1>
        {profile.bio && <p className="profile-bio">{profile.bio}</p>}
      </div>

      {/* Bento grid */}
      <div className="bento-grid">
        {profile.tiles
          .sort((a, b) => a.order_index - b.order_index)
          .map(renderTile)}
      </div>

      {/* Share banner */}
      <ShareBanner username={profile.username} />

      {/* Footer */}
      <div className="text-center py-8">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          Made with BioGram
        </span>
      </div>
    </div>
  );
}
