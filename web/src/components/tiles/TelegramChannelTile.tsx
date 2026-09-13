import { Send, Users } from "lucide-react";
import type { Tile } from "../../hooks/useProfileData";

interface Props {
  tile: Tile;
  onClick: () => void;
}

export function TelegramChannelTile({ tile, onClick }: Props) {
  const meta = (tile.meta as { channelUsername?: string; membersCount?: string; handle?: string }) || {};

  return (
    <div
      className="bento-tile flex flex-col justify-between p-4 cursor-pointer relative overflow-hidden group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-lg border border-sky-500/30 group-hover:scale-110 transition-transform">
          <Send size={20} className="translate-x-[-1px] translate-y-[1px]" />
        </div>
        {meta.membersCount && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
            <Users size={12} />
            {meta.membersCount}
          </span>
        )}
      </div>

      <div className="mt-3">
        <h3 className="font-semibold text-sm text-white group-hover:text-sky-300 transition-colors">
          {tile.title}
        </h3>
        {tile.subtitle && (
          <p className="text-xs text-white/50 line-clamp-1 mt-0.5">{tile.subtitle}</p>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-sky-400 font-medium">
        <span>{meta.handle || "Telegram Channel"}</span>
        <span className="px-2 py-0.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 transition-colors">
          Join →
        </span>
      </div>
    </div>
  );
}
