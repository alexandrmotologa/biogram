import { Calendar, Clock, ExternalLink } from "lucide-react";
import type { Tile } from "../../hooks/useProfileData";

interface Props {
  tile: Tile;
  onClick: () => void;
}

export function BookingTile({ tile, onClick }: Props) {
  const meta = (tile.meta as { platform?: string; badge?: string }) || {};

  return (
    <div
      className="bento-tile flex flex-col justify-between p-4 cursor-pointer relative overflow-hidden group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center border border-violet-500/30 group-hover:scale-110 transition-transform">
          <Calendar size={20} />
        </div>
        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <Clock size={11} />
          {meta.badge || "Available"}
        </span>
      </div>

      <div className="mt-3">
        <h3 className="font-semibold text-sm text-white group-hover:text-violet-300 transition-colors">
          {tile.title}
        </h3>
        {tile.subtitle && (
          <p className="text-xs text-white/50 line-clamp-1 mt-0.5">{tile.subtitle}</p>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-violet-400 font-medium">
        <span>{meta.platform || "Cal.com"}</span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 transition-colors">
          Schedule <ExternalLink size={11} />
        </span>
      </div>
    </div>
  );
}
