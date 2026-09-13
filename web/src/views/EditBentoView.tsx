import { useState, useCallback, useRef } from "react";
import {
  Plus,
  GripVertical,
  Trash2,
  BarChart3,
  ArrowLeft,
  Download,
  Upload,
  Bell,
  BellOff,
  Tag,
  X,
  Layers,
  Lock,
} from "lucide-react";
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
  { type: "GITHUB", title: "GitHub Repo", icon: "🐙", defaultColSpan: 2, defaultRowSpan: 1 },
  { type: "TELEGRAM_CHANNEL", title: "Telegram Channel", icon: "📢", defaultColSpan: 2, defaultRowSpan: 1 },
  { type: "SOCIAL", title: "Social Link", icon: "🔗", defaultColSpan: 1, defaultRowSpan: 1 },
  { type: "AUDIO", title: "Audio Player", icon: "🎵", defaultColSpan: 2, defaultRowSpan: 1 },
  { type: "GATED_STAR", title: "Stars Locked", icon: "⭐", defaultColSpan: 2, defaultRowSpan: 1 },
  { type: "NEWSLETTER", title: "Newsletter", icon: "💌", defaultColSpan: 2, defaultRowSpan: 1 },
  { type: "BOOKING", title: "Calendar / Call", icon: "📅", defaultColSpan: 1, defaultRowSpan: 1 },
  { type: "TIP", title: "Tip / Coffee", icon: "☕", defaultColSpan: 1, defaultRowSpan: 1 },
  { type: "MEDIA", title: "Video Embed", icon: "🎬", defaultColSpan: 2, defaultRowSpan: 1 },
  { type: "CONTACT", title: "Contact", icon: "💬", defaultColSpan: 2, defaultRowSpan: 1 },
  { type: "TEXT", title: "Text Note", icon: "📝", defaultColSpan: 1, defaultRowSpan: 1 },
];

export function EditBentoView({ profile, onRefresh, onBack }: Props) {
  const { haptic, hapticSuccess, hapticError, getInitData } = useTelegram();
  const [tiles, setTiles] = useState<Tile[]>([...profile.tiles].sort((a, b) => a.order_index - b.order_index));
  const [badges, setBadges] = useState<string[]>(profile.badges || []);
  const [newBadge, setNewBadge] = useState("");
  const [notifications, setNotifications] = useState(profile.notifications_enabled !== false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [theme, setTheme] = useState(profile.theme);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [addForm, setAddForm] = useState({
    type: "SOCIAL",
    title: "",
    subtitle: "",
    url: "",
    col_span: 1,
    row_span: 1,
    locked_stars: 0,
    unlocked_content: "",
  });

  const initData = getInitData();

  // Theme change
  const handleThemeChange = useCallback(
    async (newTheme: string) => {
      setTheme(newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
      haptic("light");
      await updateProfile(initData, { theme: newTheme });
    },
    [initData, haptic]
  );

  // Toggle notifications
  const handleToggleNotifications = async () => {
    const nextVal = !notifications;
    setNotifications(nextVal);
    haptic("light");
    await updateProfile(initData, { notifications_enabled: nextVal });
    hapticSuccess();
  };

  // Add badge
  const handleAddBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBadge.trim()) return;
    const updated = [...badges, newBadge.trim()];
    setBadges(updated);
    setNewBadge("");
    haptic("light");
    await updateProfile(initData, { badges: updated });
  };

  // Remove badge
  const handleRemoveBadge = async (idx: number) => {
    const updated = badges.filter((_, i) => i !== idx);
    setBadges(updated);
    haptic("light");
    await updateProfile(initData, { badges: updated });
  };

  // Drag and drop reordering
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

    const tileId = await addTile(initData, {
      type: addForm.type,
      title: addForm.title.trim(),
      subtitle: addForm.subtitle.trim() || undefined,
      url: addForm.url.trim() || undefined,
      col_span: addForm.col_span,
      row_span: addForm.row_span,
      locked_stars: addForm.locked_stars > 0 ? addForm.locked_stars : undefined,
      unlocked_content: addForm.unlocked_content.trim() || undefined,
      meta:
        addForm.type === "SOCIAL"
          ? { platform: guessPlatform(addForm.url) }
          : addForm.type === "TELEGRAM_CHANNEL"
          ? { handle: addForm.subtitle || "@channel", membersCount: "1.2k" }
          : addForm.type === "BOOKING"
          ? { platform: "Cal.com", badge: "Available" }
          : undefined,
    });

    if (tileId) {
      hapticSuccess();
      setShowAddModal(false);
      setAddForm({
        type: "SOCIAL",
        title: "",
        subtitle: "",
        url: "",
        col_span: 1,
        row_span: 1,
        locked_stars: 0,
        unlocked_content: "",
      });
      onRefresh();
    } else {
      hapticError();
    }
  };

  // Delete tile
  const handleDeleteTile = async (tileId: string) => {
    haptic("heavy");
    const ok = await removeTile(initData, tileId);
    if (ok) {
      setTiles((prev) => prev.filter((t) => t.id !== tileId));
      hapticSuccess();
    } else {
      hapticError();
    }
  };

  // Backup export
  const handleExportJson = () => {
    haptic("light");
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `biogram_${profile.username}_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    hapticSuccess();
  };

  // Restore import
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.tiles && Array.isArray(imported.tiles)) {
          // Re-create tiles sequentially
          for (const t of imported.tiles) {
            await addTile(initData, {
              type: t.type,
              title: t.title,
              subtitle: t.subtitle,
              url: t.url,
              col_span: t.col_span,
              row_span: t.row_span,
              meta: t.meta,
              locked_stars: t.locked_stars,
              unlocked_content: t.unlocked_content,
            });
          }
          if (imported.badges) {
            await updateProfile(initData, { badges: imported.badges });
          }
          hapticSuccess();
          onRefresh();
        }
      } catch {
        hapticError();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="animate-fade-in pb-12" id="edit-bento-view">
      {/* Top Bar */}
      <div className="flex items-center justify-between py-4 px-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white transition-colors cursor-pointer bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            title="Export JSON Backup"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer border border-white/10"
          >
            <Download size={14} />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import JSON Backup"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer border border-white/10"
          >
            <Upload size={14} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJson}
            className="hidden"
          />

          <button
            onClick={handleToggleNotifications}
            title="Toggle Live Click Alerts"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
              notifications
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-white/5 text-white/40 border-white/10"
            }`}
          >
            {notifications ? <Bell size={14} /> : <BellOff size={14} />}
          </button>

          <button
            onClick={() => setShowAnalytics(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors cursor-pointer"
          >
            <BarChart3 size={14} className="text-purple-400" /> Stats
          </button>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="my-3">
        <ThemeSelector currentTheme={theme} onSelect={handleThemeChange} />
      </div>

      {/* Badges manager */}
      <div className="my-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80 mb-2">
          <Tag size={13} className="text-purple-400" />
          <span>Profile Badges & Roles</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {badges.map((b, i) => (
            <span
              key={i}
              className="flex items-center gap-1 text-[11px] font-medium bg-white/10 text-white/90 px-2.5 py-0.5 rounded-full border border-white/15"
            >
              {b}
              <X
                size={12}
                onClick={() => handleRemoveBadge(i)}
                className="hover:text-red-400 cursor-pointer"
              />
            </span>
          ))}
        </div>

        <form onSubmit={handleAddBadge} className="flex gap-1.5">
          <input
            type="text"
            value={newBadge}
            onChange={(e) => setNewBadge(e.target.value)}
            placeholder="Add tag (e.g. 👨‍💻 Full-Stack, 🚀 Maker)"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1 text-xs text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
          />
          <button
            type="submit"
            disabled={!newBadge.trim()}
            className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-xs font-medium text-white transition-colors cursor-pointer"
          >
            Add
          </button>
        </form>
      </div>

      {/* Tiles Management Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
          Tiles ({tiles.length}) • Drag to reorder
        </span>
        <button
          onClick={() => {
            haptic("medium");
            setShowAddModal(true);
          }}
          className="flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
        >
          <Plus size={14} /> Add Tile
        </button>
      </div>

      {/* Tiles List */}
      <div className="space-y-2">
        {tiles.map((tile, index) => (
          <div
            key={tile.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all ${
              dragIndex === index ? "opacity-50 scale-95" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="cursor-grab text-white/30 hover:text-white/70">
                <GripVertical size={16} />
              </div>
              <div>
                <div className="font-medium text-xs text-white flex items-center gap-1.5">
                  {tile.title}
                  {tile.locked_stars ? (
                    <span className="text-[10px] text-amber-300 bg-amber-500/20 px-1.5 rounded">
                      ⭐ {tile.locked_stars}
                    </span>
                  ) : null}
                  <span className="text-[10px] text-white/40 font-mono bg-white/5 px-1 rounded">
                    {tile.col_span}x{tile.row_span}
                  </span>
                </div>
                <div className="text-[11px] text-white/40">{tile.type}</div>
              </div>
            </div>

            <button
              onClick={() => handleDeleteTile(tile.id)}
              className="w-7 h-7 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Tile Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-[#141420] border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-sm">Add New Bento Tile</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            {/* Type selector */}
            <div className="my-3">
              <label className="text-[11px] font-medium text-white/50 mb-1.5 block">Select Type</label>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {tilePresets.map((p) => (
                  <button
                    key={p.type}
                    type="button"
                    onClick={() => {
                      haptic("light");
                      setAddForm({
                        ...addForm,
                        type: p.type,
                        col_span: p.defaultColSpan,
                        row_span: p.defaultRowSpan,
                      });
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs border transition-all cursor-pointer ${
                      addForm.type === p.type
                        ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                        : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span className="truncate">{p.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Span Controls */}
            <div className="mb-3">
              <label className="text-[11px] font-medium text-white/50 mb-1.5 flex items-center gap-1">
                <Layers size={12} /> Grid Size (Columns x Rows)
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: "1x1", col: 1, row: 1 },
                  { label: "2x1", col: 2, row: 1 },
                  { label: "1x2", col: 1, row: 2 },
                  { label: "2x2", col: 2, row: 2 },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setAddForm({ ...addForm, col_span: s.col, row_span: s.row })}
                    className={`py-1.5 text-xs font-mono font-semibold rounded-xl border transition-all cursor-pointer ${
                      addForm.col_span === s.col && addForm.row_span === s.row
                        ? "bg-purple-600 text-white border-purple-500"
                        : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-medium text-white/50 block mb-1">Title *</label>
                <input
                  type="text"
                  value={addForm.title}
                  onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  placeholder="e.g. My Telegram Channel"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-white/50 block mb-1">Subtitle / Details</label>
                <input
                  type="text"
                  value={addForm.subtitle}
                  onChange={(e) => setAddForm({ ...addForm, subtitle: e.target.value })}
                  placeholder="e.g. 1.5k members • Behind the scenes"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-white/50 block mb-1">URL (optional)</label>
                <input
                  type="url"
                  value={addForm.url}
                  onChange={(e) => setAddForm({ ...addForm, url: e.target.value })}
                  placeholder="https://t.me/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              {/* Gated Stars Options */}
              {addForm.type === "GATED_STAR" && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-300">
                    <Lock size={12} /> Telegram Stars Gating
                  </div>
                  <div>
                    <label className="text-[10px] text-amber-200/70 block mb-0.5">Price in Stars</label>
                    <input
                      type="number"
                      value={addForm.locked_stars || 15}
                      onChange={(e) => setAddForm({ ...addForm, locked_stars: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-black/40 border border-amber-500/30 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-amber-200/70 block mb-0.5">Secret Content (revealed after payment)</label>
                    <textarea
                      rows={2}
                      value={addForm.unlocked_content}
                      onChange={(e) => setAddForm({ ...addForm, unlocked_content: e.target.value })}
                      placeholder="Secret URL, download link, code or message..."
                      className="w-full bg-black/40 border border-amber-500/30 rounded-lg px-2.5 py-1 text-xs text-white placeholder-white/30 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddTile}
              className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
            >
              Add Tile to Bento
            </button>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && <AnalyticsModal onClose={() => setShowAnalytics(false)} />}
    </div>
  );
}

function guessPlatform(url: string): string {
  if (!url) return "link";
  if (url.includes("twitter.com") || url.includes("x.com")) return "twitter";
  if (url.includes("linkedin.com")) return "linkedin";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("t.me")) return "telegram";
  return "link";
}
