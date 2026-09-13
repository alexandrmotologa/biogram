import { useState, useCallback } from "react";
import { Plus, GripVertical, Trash2, BarChart3, ArrowLeft } from "lucide-react";
import { useTelegram } from "../hooks/useTelegram";
import {
  addTile,
  removeTile,
  reorderTiles,
  updateProfile,
} from "../hooks/useProfileData";
import type { ProfileData, Tile } from "../hooks/useProfileData";
import { ThemeSelector } from "../components/ThemeSelector";
import { AnalyticsModal } from "./AnalyticsModal";

interface Props {
  profile: ProfileData;
  onRefresh: () => void;
  onBack: () => void;
}

const tilePresets = [
  { type: "GITHUB", title: "GitHub Repo", icon: "🐙", defaultColSpan: 2 },
  { type: "SOCIAL", title: "Social Link", icon: "🔗", defaultColSpan: 1 },
  { type: "TIP", title: "Tip / Coffee", icon: "☕", defaultColSpan: 1 },
  { type: "MEDIA", title: "Video Embed", icon: "🎬", defaultColSpan: 2 },
  { type: "TEXT", title: "Text Note", icon: "📝", defaultColSpan: 1 },
  { type: "CONTACT", title: "Contact", icon: "💬", defaultColSpan: 2 },
];

export function EditBentoView({ profile, onRefresh, onBack }: Props) {
  const { haptic, hapticSuccess, hapticError, getInitData } = useTelegram();
  const [tiles, setTiles] = useState<Tile[]>([...profile.tiles].sort((a, b) => a.order_index - b.order_index));
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [theme, setTheme] = useState(profile.theme);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [addForm, setAddForm] = useState({
    type: "SOCIAL",
    title: "",
    subtitle: "",
    url: "",
    col_span: 1,
  });

  const initData = getInitData();

  // Theme change
  const handleThemeChange = useCallback(async (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    haptic("light");
    await updateProfile(initData, { theme: newTheme });
  }, [initData, haptic]);

  // Drag and drop
  const handleDragStart = (index: number) => {
    setDragIndex(index);
    haptic("medium");
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const newTiles = [...tiles];
    const [moved] = newTiles.splice(dragIndex, 1);
    newTiles.splice(index, 0, moved);
    setTiles(newTiles);
    setDragIndex(index);
  };

  const handleDragEnd = async () => {
    setDragIndex(null);
    const tileIds = tiles.map((t) => t.id);
    await reorderTiles(initData, tileIds);
    hapticSuccess();
  };

  // Add tile
  const handleAddTile = async () => {
    if (!addForm.title.trim()) {
      hapticError();
      return;
    }

    const preset = tilePresets.find((p) => p.type === addForm.type);
    const tileId = await addTile(initData, {
      type: addForm.type,
      title: addForm.title.trim(),
      subtitle: addForm.subtitle.trim() || undefined,
      url: addForm.url.trim() || undefined,
      col_span: preset?.defaultColSpan || addForm.col_span,
      meta: addForm.type === "SOCIAL" ? { platform: guessPlatform(addForm.url) } : undefined,
    });

    if (tileId) {
      hapticSuccess();
      setShowAddModal(false);
      setAddForm({ type: "SOCIAL", title: "", subtitle: "", url: "", col_span: 1 });
      onRefresh();
    } else {
      hapticError();
    }
  };

  // Delete tile
  const handleDeleteTile = async (tileId: string) => {
    haptic("heavy");
    const success = await removeTile(initData, tileId);
    if (success) {
      setTiles(tiles.filter((t) => t.id !== tileId));
      hapticSuccess();
    } else {
      hapticError();
    }
  };

  return (
    <div className="animate-fade-in" id="edit-bento-view">
      {/* Toolbar */}
      <div className="edit-toolbar">
        <button className="edit-btn edit-btn-secondary" onClick={onBack} id="edit-back-btn">
          <ArrowLeft size={16} className="inline mr-1" />
          View
        </button>
        <div className="flex gap-2">
          <button
            className="edit-btn edit-btn-secondary"
            onClick={() => { setShowAnalytics(true); haptic("light"); }}
            id="edit-analytics-btn"
          >
            <BarChart3 size={16} className="inline mr-1" />
            Stats
          </button>
          <button
            className="edit-btn"
            onClick={() => { setShowAddModal(true); haptic("light"); }}
            id="edit-add-btn"
          >
            <Plus size={16} className="inline mr-1" />
            Add Tile
          </button>
        </div>
      </div>

      {/* Theme selector */}
      <div className="px-4 py-4 max-w-[480px] mx-auto">
        <ThemeSelector currentTheme={theme} onSelect={handleThemeChange} />
      </div>

      {/* Draggable tile list */}
      <div className="bento-grid">
        {tiles.map((tile, index) => (
          <div
            key={tile.id}
            className={`bento-tile relative ${tile.col_span === 2 ? "tile-span-2x1" : ""} ${dragIndex === index ? "tile-dragging" : ""}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            id={`edit-tile-${tile.id}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-xs font-medium mb-1" style={{ color: "var(--accent)" }}>
                  {tile.type}
                </div>
                <div className="tile-title">{tile.title}</div>
                {tile.subtitle && <div className="tile-subtitle">{tile.subtitle}</div>}
              </div>
              <div className="flex items-center gap-2 ml-2">
                <GripVertical size={16} style={{ color: "var(--text-muted)", cursor: "grab" }} />
                <button
                  className="p-1 rounded-lg hover:bg-red-500/20 transition-colors"
                  onClick={() => handleDeleteTile(tile.id)}
                  title="Delete tile"
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tiles.length === 0 && (
        <div className="text-center py-16 px-4">
          <p style={{ color: "var(--text-muted)" }}>No tiles yet. Tap "Add Tile" to get started.</p>
        </div>
      )}

      {/* Add tile modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Add a tile</div>

            {/* Type picker */}
            <div className="form-label">Type</div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {tilePresets.map((p) => (
                <button
                  key={p.type}
                  className={`p-3 rounded-xl text-center text-sm transition-colors ${addForm.type === p.type ? "border-2" : "border border-transparent"}`}
                  style={{
                    background: addForm.type === p.type ? "var(--accent-soft)" : "var(--card-bg)",
                    borderColor: addForm.type === p.type ? "var(--accent)" : "var(--card-border)",
                    color: "var(--text)",
                  }}
                  onClick={() => setAddForm({ ...addForm, type: p.type })}
                >
                  <div className="text-lg mb-1">{p.icon}</div>
                  {p.title}
                </button>
              ))}
            </div>

            {/* Fields */}
            <label className="form-label">Title</label>
            <input
              className="form-input"
              placeholder="e.g. My GitHub Repo"
              value={addForm.title}
              onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
              id="add-tile-title"
            />

            <label className="form-label">Subtitle (optional)</label>
            <input
              className="form-input"
              placeholder="e.g. A cool project"
              value={addForm.subtitle}
              onChange={(e) => setAddForm({ ...addForm, subtitle: e.target.value })}
              id="add-tile-subtitle"
            />

            <label className="form-label">URL (optional)</label>
            <input
              className="form-input"
              placeholder="https://..."
              value={addForm.url}
              onChange={(e) => setAddForm({ ...addForm, url: e.target.value })}
              id="add-tile-url"
            />

            <div className="flex gap-2 mt-4">
              <button
                className="edit-btn edit-btn-secondary flex-1"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="edit-btn flex-1"
                onClick={handleAddTile}
                id="add-tile-submit"
              >
                Add tile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics modal */}
      {showAnalytics && (
        <AnalyticsModal onClose={() => setShowAnalytics(false)} />
      )}
    </div>
  );
}

function guessPlatform(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "twitter";
  if (lower.includes("linkedin.com")) return "linkedin";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
  return "website";
}
