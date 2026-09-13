import { useState } from "react";
import { Mail, Check, ArrowRight, Loader2 } from "lucide-react";
import type { Tile } from "../../hooks/useProfileData";
import { subscribeNewsletter } from "../../hooks/useProfileData";
import { useTelegram } from "../../hooks/useTelegram";

interface Props {
  tile: Tile;
  username: string;
  onClick: () => void;
}

export function NewsletterTile({ tile, username, onClick }: Props) {
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { hapticSuccess, hapticError, haptic } = useTelegram();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!input.trim() || submitting || subscribed) return;

    setSubmitting(true);
    haptic("medium");

    const success = await subscribeNewsletter(username, input.trim());
    setSubmitting(false);

    if (success) {
      setSubscribed(true);
      hapticSuccess();
    } else {
      hapticError();
    }
  };

  return (
    <div
      className="bento-tile flex flex-col justify-between p-4 relative overflow-hidden"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
          <Mail size={16} />
        </div>
        <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
          Newsletter
        </span>
      </div>

      <div className="my-2">
        <h3 className="font-semibold text-sm text-white">{tile.title}</h3>
        {tile.subtitle && (
          <p className="text-xs text-white/50 line-clamp-1 mt-0.5">{tile.subtitle}</p>
        )}
      </div>

      {subscribed ? (
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/15 py-2 px-3 rounded-xl border border-emerald-500/30 font-medium">
          <Check size={14} className="text-emerald-400" />
          <span>Subscribed! Check your inbox.</span>
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="flex items-center gap-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Email or @handle"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          <button
            type="submit"
            disabled={submitting || !input.trim()}
            className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 disabled:opacity-40 transition-all cursor-pointer"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
          </button>
        </form>
      )}
    </div>
  );
}
