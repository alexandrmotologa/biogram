import { useState } from "react";
import { useTelegram } from "../hooks/useTelegram";
import { recordTileClick } from "../hooks/useProfileData";
import type { ProfileData, Tile } from "../hooks/useProfileData";
import { GitHubRepoTile } from "../components/tiles/GitHubRepoTile";
import { SocialLinkTile } from "../components/tiles/SocialLinkTile";
import { TipCoffeeTile } from "../components/tiles/TipCoffeeTile";
import { VideoEmbedTile } from "../components/tiles/VideoEmbedTile";
import { ContactTile } from "../components/tiles/ContactTile";
import { TelegramChannelTile } from "../components/tiles/TelegramChannelTile";
import { AudioPlayerTile } from "../components/tiles/AudioPlayerTile";
import { NewsletterTile } from "../components/tiles/NewsletterTile";
import { BookingTile } from "../components/tiles/BookingTile";
import { GatedStarTile } from "../components/tiles/GatedStarTile";
import { ShareBanner } from "../components/ShareBanner";
import { ExploreModal } from "./ExploreModal";
import { FileText, Compass, Sparkles, Check } from "lucide-react";

interface Props {
  profile: ProfileData;
  onNavigateUser?: (username: string) => void;
}

export function PublicBentoView({ profile, onNavigateUser }: Props) {
  const { haptic, shareToStory, hapticSuccess, getInitData } = useTelegram();
  const [showExplore, setShowExplore] = useState(false);
  const [tiles, setTiles] = useState<Tile[]>(profile.tiles);
  const [storyShared, setStoryShared] = useState(false);

  const initData = getInitData();

  const handleTileClick = (tile: Tile) => {
    haptic("light");
    recordTileClick(tile.id);

    if (tile.url) {
      window.open(tile.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleUnlocked = (tileId: string, secretContent: string) => {
    setTiles((prev) =>
      prev.map((t) =>
        t.id === tileId
          ? { ...t, is_unlocked: true, unlocked_content: secretContent }
          : t
      )
    );
  };

  const handleShareStory = () => {
    haptic("medium");
    const mediaUrl = profile.avatar_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60";
    const appUrl = `https://t.me/biogram_bot/app?startapp=${profile.username}`;

    const shared = shareToStory(mediaUrl, {
      text: `Check out my Bento profile on BioGram: @${profile.username}`,
      widget_link: { url: appUrl, name: `${profile.display_name} on BioGram` },
    });

    if (!shared) {
      // Fallback copy link
      navigator.clipboard.writeText(appUrl);
      setStoryShared(true);
      hapticSuccess();
      setTimeout(() => setStoryShared(false), 2500);
    }
  };

  const renderTile = (tile: Tile) => {
    const onClick = () => handleTileClick(tile);

    // Dynamic span classes
    const spanClass =
      tile.col_span === 2 && tile.row_span === 2
        ? "col-span-2 row-span-2"
        : tile.col_span === 2
        ? "col-span-2"
        : tile.row_span === 2
        ? "row-span-2"
        : "col-span-1";

    let component: React.ReactNode = null;

    switch (tile.type) {
      case "GITHUB":
        component = <GitHubRepoTile tile={tile} onClick={onClick} />;
        break;
      case "SOCIAL":
        component = <SocialLinkTile tile={tile} onClick={onClick} />;
        break;
      case "TIP":
        component = <TipCoffeeTile tile={tile} onClick={onClick} />;
        break;
      case "MEDIA":
        component = <VideoEmbedTile tile={tile} onClick={onClick} />;
        break;
      case "CONTACT":
        component = <ContactTile tile={tile} onClick={onClick} />;
        break;
      case "TELEGRAM_CHANNEL":
        component = <TelegramChannelTile tile={tile} onClick={onClick} />;
        break;
      case "AUDIO":
        component = <AudioPlayerTile tile={tile} onClick={onClick} />;
        break;
      case "NEWSLETTER":
        component = <NewsletterTile tile={tile} username={profile.username} onClick={onClick} />;
        break;
      case "BOOKING":
        component = <BookingTile tile={tile} onClick={onClick} />;
        break;
      case "GATED_STAR":
        component = (
          <GatedStarTile
            tile={tile}
            initData={initData}
            onClick={onClick}
            onUnlocked={handleUnlocked}
          />
        );
        break;
      case "TEXT":
        component = (
          <div
            className="bento-tile flex flex-col justify-between p-4 cursor-pointer"
            onClick={onClick}
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 text-white/80 flex items-center justify-center">
              <FileText size={18} />
            </div>
            <div className="my-2">
              <h3 className="font-semibold text-sm text-white">{tile.title}</h3>
              {tile.subtitle && <p className="text-xs text-white/50">{tile.subtitle}</p>}
            </div>
          </div>
        );
        break;
      default:
        component = null;
    }

    if (!component) return null;

    return (
      <div key={tile.id} className={spanClass}>
        {component}
      </div>
    );
  };

  const initials = profile.display_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="animate-fade-in pb-10" id="public-bento-view">
      {/* Top action bar */}
      <div className="flex items-center justify-between px-2 pt-3 pb-1">
        <button
          onClick={() => {
            haptic("light");
            setShowExplore(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium border border-white/10 transition-colors cursor-pointer"
        >
          <Compass size={14} className="text-amber-400" />
          <span>Explore</span>
        </button>

        <button
          onClick={handleShareStory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-white text-xs font-medium border border-purple-500/30 transition-all cursor-pointer"
        >
          {storyShared ? <Check size={14} className="text-emerald-400" /> : <Sparkles size={14} className="text-pink-400" />}
          <span>{storyShared ? "Link Copied!" : "Share to Story"}</span>
        </button>
      </div>

      {/* Profile header */}
      <div className="profile-header text-center my-6">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.display_name}
            className="profile-avatar mx-auto mb-3"
          />
        ) : (
          <div className="profile-avatar-placeholder mx-auto mb-3">{initials}</div>
        )}

        <h1 className="profile-name text-2xl font-bold tracking-tight">{profile.display_name}</h1>
        <div className="text-xs text-white/40 mt-0.5">@{profile.username}</div>

        {/* Custom badges */}
        {profile.badges && profile.badges.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5 max-w-xs mx-auto">
            {profile.badges.map((b, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium bg-white/[0.07] text-white/80 px-2.5 py-0.5 rounded-full border border-white/10 shadow-sm"
              >
                {b}
              </span>
            ))}
          </div>
        )}

        {profile.bio && (
          <p className="profile-bio max-w-sm mx-auto text-xs text-white/60 mt-3 px-4 leading-relaxed">
            {profile.bio}
          </p>
        )}
      </div>

      {/* Bento grid */}
      <div className="bento-grid grid grid-cols-2 gap-3 px-1">
        {tiles
          .sort((a, b) => a.order_index - b.order_index)
          .map(renderTile)}
      </div>

      {/* Share banner */}
      <div className="mt-4">
        <ShareBanner username={profile.username} />
      </div>

      {/* Footer */}
      <div className="text-center py-6">
        <span className="text-xs text-white/30 font-medium">
          Powered by <span className="text-white/50 font-semibold">BioGram</span>
        </span>
      </div>

      {/* Explore modal */}
      {showExplore && (
        <ExploreModal
          onClose={() => setShowExplore(false)}
          onSelectUser={(u) => {
            if (onNavigateUser) onNavigateUser(u);
            else window.location.search = `?page=${u}`;
          }}
        />
      )}
    </div>
  );
}
