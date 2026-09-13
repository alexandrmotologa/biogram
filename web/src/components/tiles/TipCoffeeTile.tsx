import { useState } from "react";
import { Coffee, Star, X, Check, Loader2 } from "lucide-react";
import type { Tile } from "../../hooks/useProfileData";
import { createStarsInvoice } from "../../hooks/useProfileData";
import { useTelegram } from "../../hooks/useTelegram";

interface Props {
  tile: Tile;
  onClick: () => void;
}

export function TipCoffeeTile({ tile, onClick }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tipped, setTipped] = useState(false);
  const { haptic, hapticSuccess, hapticError, openInvoice, getInitData } = useTelegram();

  const handleTileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
    haptic("light");
    setShowModal(true);
  };

  const handleSendTip = async (amount: number) => {
    setLoading(true);
    haptic("medium");

    try {
      const initData = getInitData();
      const invoice = await createStarsInvoice(initData, tile.id, amount);

      if (invoice?.invoiceLink) {
        const status = await openInvoice(invoice.invoiceLink);
        if (status === "paid") {
          hapticSuccess();
          setTipped(true);
        } else if (status === "failed") {
          hapticError();
        }
      } else {
        // Simulated tip confirmation in demo/dev mode
        hapticSuccess();
        setTipped(true);
      }
    } catch {
      hapticError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="bento-tile tip-tile cursor-pointer relative overflow-hidden group"
        onClick={handleTileClick}
        role="button"
        tabIndex={0}
        id={`tile-tip-${tile.id}`}
      >
        <div className="tile-icon group-hover:scale-110 transition-transform">
          <Coffee size={20} />
        </div>
        <div className="tile-title flex items-center gap-1">
          {tile.title}
          <Star size={13} className="text-amber-300 fill-amber-300 ml-1" />
        </div>
        {tile.subtitle && <div className="tile-subtitle">{tile.subtitle}</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xs bg-[#151522] border border-amber-500/30 rounded-3xl p-5 shadow-2xl text-white text-center">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setTipped(false);
                }}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto mb-3 border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <Coffee size={24} />
            </div>

            {tipped ? (
              <div className="py-4 space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check size={20} />
                </div>
                <h3 className="font-bold text-base text-white">Thank You So Much!</h3>
                <p className="text-xs text-white/60">
                  Your Telegram Stars support means the world! ☕✨
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-base mb-1">Buy Me a Coffee</h3>
                <p className="text-xs text-white/50 mb-4">
                  Support my work with Telegram Stars
                </p>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[15, 50, 100].map((stars) => (
                    <button
                      key={stars}
                      onClick={() => handleSendTip(stars)}
                      disabled={loading}
                      className="py-2.5 px-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 font-semibold text-xs text-amber-300 flex flex-col items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-40"
                    >
                      <Star size={14} className="fill-amber-300" />
                      <span>{stars} Stars</span>
                    </button>
                  ))}
                </div>

                {loading && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-amber-300/80">
                    <Loader2 size={13} className="animate-spin" /> Preparing invoice...
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
