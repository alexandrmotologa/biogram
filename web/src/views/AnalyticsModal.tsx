import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useTelegram } from "../hooks/useTelegram";
import { fetchAnalytics } from "../hooks/useProfileData";
import type { AnalyticsData } from "../hooks/useProfileData";

interface Props {
  onClose: () => void;
}

export function AnalyticsModal({ onClose }: Props) {
  const { getInitData } = useTelegram();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const initData = getInitData();
      const analytics = await fetchAnalytics(initData);
      setData(analytics);
      setLoading(false);
    };
    load();
  }, [getInitData]);

  const maxClicks = data ? Math.max(...data.tiles.map((t) => t.clicks), 1) : 1;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} id="analytics-modal">
        <div className="flex items-center justify-between mb-4">
          <div className="modal-title" style={{ marginBottom: 0 }}>Analytics</div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X size={18} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="loading-skeleton h-20 rounded-xl" />
            <div className="loading-skeleton h-20 rounded-xl" />
          </div>
        ) : data ? (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="analytics-stat">
                <div className="analytics-number">{data.profile_views}</div>
                <div className="analytics-label">Profile views</div>
              </div>
              <div className="analytics-stat">
                <div className="analytics-number">{data.total_clicks}</div>
                <div className="analytics-label">Total clicks</div>
              </div>
            </div>

            {/* Per-tile breakdown */}
            {data.tiles.length > 0 && (
              <div>
                <div className="form-label" style={{ marginBottom: 12 }}>Clicks by tile</div>
                <div className="space-y-3">
                  {data.tiles.map((tile) => (
                    <div key={tile.tile_id} className="p-3 rounded-xl" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{tile.title}</span>
                          <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>{tile.type}</span>
                        </div>
                        <div className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
                          {tile.clicks}
                          <span className="text-xs font-normal ml-1" style={{ color: "var(--text-muted)" }}>
                            ({tile.ctr}%)
                          </span>
                        </div>
                      </div>
                      <div className="analytics-bar">
                        <div
                          className="analytics-bar-fill"
                          style={{ width: `${(tile.clicks / maxClicks) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.tiles.length === 0 && (
              <p className="text-center py-8 text-sm" style={{ color: "var(--text-muted)" }}>
                No click data yet. Share your profile to start tracking.
              </p>
            )}
          </>
        ) : (
          <p className="text-center py-8 text-sm" style={{ color: "var(--text-muted)" }}>
            Could not load analytics.
          </p>
        )}
      </div>
    </div>
  );
}
