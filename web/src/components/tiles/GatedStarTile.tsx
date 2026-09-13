import { useState } from "react";
import { Lock, Unlock, Star, Sparkles, ExternalLink, Copy, Check, Loader2 } from "lucide-react";
import type { Tile } from "../../hooks/useProfileData";
import { createStarsInvoice, simulateUnlockTile } from "../../hooks/useProfileData";
import { useTelegram } from "../../hooks/useTelegram";

interface Props {
  tile: Tile;
  initData: string;
  onClick: () => void;
  onUnlocked: (tileId: string, content: string) => void;
}

export function GatedStarTile({ tile, initData, onClick, onUnlocked }: Props) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { openInvoice, hapticSuccess, hapticError, haptic } = useTelegram();

  const isUnlocked = Boolean(tile.is_unlocked);
  const starsPrice = tile.locked_stars || 15;

  const handleUnlock = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
    if (loading || isUnlocked) return;

    setLoading(true);
    haptic("medium");

    try {
      const invoice = await createStarsInvoice(initData, tile.id, starsPrice);

      if (invoice?.invoiceLink) {
        // Open real Telegram Stars payment invoice
        const status = await openInvoice(invoice.invoiceLink);
        if (status === "paid") {
          hapticSuccess();
          const secret = await simulateUnlockTile(initData, tile.id);
          if (secret) onUnlocked(tile.id, secret);
        } else if (status === "failed") {
          hapticError();
        }
      } else {
        // Dev/demo mode fallback simulation
        const secret = await simulateUnlockTile(initData, tile.id);
        if (secret) {
          hapticSuccess();
          onUnlocked(tile.id, secret);
        }
      }
    } catch {
      hapticError();
    } finally {
      setLoading(false);
    }
  };

  const copyContent = (e: React.MouseEvent, content: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    setCopied(true);
    hapticSuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`bento-tile flex flex-col justify-between p-4 relative overflow-hidden transition-all ${
        isUnlocked
          ? "border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-transparent"
          : "border-white/10 hover:border-amber-500/30"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
            isUnlocked
              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
          }`}
        >
          {isUnlocked ? <Unlock size={20} /> : <Lock size={20} />}
        </div>

        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-500/30 shadow-sm shadow-amber-500/10">
          <Star size={12} className="fill-amber-300 text-amber-300" />
          {isUnlocked ? "Unlocked" : `${starsPrice} Stars`}
        </span>
      </div>

      <div className="my-2.5">
        <h3 className="font-semibold text-sm text-white flex items-center gap-1.5">
          {tile.title}
          {isUnlocked && <Sparkles size={14} className="text-amber-400" />}
        </h3>
        {tile.subtitle && (
          <p className="text-xs text-white/50 line-clamp-2 mt-0.5">{tile.subtitle}</p>
        )}
      </div>

      {isUnlocked && tile.unlocked_content ? (
        <div className="mt-2 pt-2 border-t border-amber-500/20">
          <div className="text-xs text-amber-200 bg-black/30 p-2.5 rounded-xl border border-amber-500/20 break-all font-mono">
            {tile.unlocked_content}
          </div>
          <div className="flex items-center justify-end gap-2 mt-2">
            {tile.unlocked_content.startsWith("http") && (
              <a
                href={tile.unlocked_content}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] font-medium text-amber-300 hover:text-amber-200"
                onClick={(e) => e.stopPropagation()}
              >
                Open <ExternalLink size={11} />
              </a>
            )}
            <button
              onClick={(e) => copyContent(e, tile.unlocked_content!)}
              className="flex items-center gap-1 text-[11px] font-medium text-amber-300 hover:text-amber-200 cursor-pointer"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleUnlock}
          disabled={loading}
          className="mt-2 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={13} className="animate-spin" /> Unlocking...
            </>
          ) : (
            <>
              <Star size={13} className="fill-black" /> Unlock for {starsPrice} Stars
            </>
          )}
        </button>
      )}
    </div>
  );
}
