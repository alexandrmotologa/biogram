import { useState, useEffect } from "react";
import { X, Search, Sparkles } from "lucide-react";
import { fetchExploreProfiles, type ExploreProfile } from "../hooks/useProfileData";
import { useTelegram } from "../hooks/useTelegram";

interface Props {
  onClose: () => void;
  onSelectUser: (username: string) => void;
}

export function ExploreModal({ onClose, onSelectUser }: Props) {
  const [profiles, setProfiles] = useState<ExploreProfile[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { haptic } = useTelegram();

  useEffect(() => {
    fetchExploreProfiles().then((list) => {
      setProfiles(list);
      setLoading(false);
    });
  }, []);

  const filtered = profiles.filter(
    (p) =>
      p.display_name.toLowerCase().includes(query.toLowerCase()) ||
      p.username.toLowerCase().includes(query.toLowerCase()) ||
      (p.bio && p.bio.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#12121a] border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] text-white">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
              <Sparkles size={16} />
            </div>
            <h2 className="text-base font-bold">Explore Bento Creators</h2>
          </div>
          <button
            onClick={() => {
              haptic("light");
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="relative my-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search creators, keywords, topics..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-white/40">Loading creators...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-white/40">No creators found</div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  haptic("medium");
                  onSelectUser(p.username);
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 hover:bg-white/[0.06] transition-all cursor-pointer flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-sm text-white">
                      {p.display_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-1.5">
                        {p.display_name}
                      </div>
                      <div className="text-xs text-white/40">@{p.username}</div>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 text-[11px] text-white/40 bg-white/5 px-2 py-0.5 rounded-md">
                    {p.tiles_count} tiles
                  </span>
                </div>

                {p.bio && <p className="text-xs text-white/60 line-clamp-2">{p.bio}</p>}

                {p.badges && p.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.badges.map((b, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium bg-white/5 text-white/60 px-2 py-0.5 rounded-full border border-white/5"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
