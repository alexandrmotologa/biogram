import { useState, useEffect, useCallback } from "react";
import { useTelegram } from "./hooks/useTelegram";
import { useProfileData } from "./hooks/useProfileData";
import { PublicBentoView } from "./views/PublicBentoView";
import { EditBentoView } from "./views/EditBentoView";
import { Loader2 } from "lucide-react";

export default function App() {
  const { getStartParam } = useTelegram();
  const [username, setUsername] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");

  // Parse username from URL params or Telegram start param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Check Telegram start_param first
    const startParam = getStartParam();
    if (startParam) {
      setUsername(startParam);
    } else if (params.get("username")) {
      setUsername(params.get("username"));
    } else {
      // Default to demo profile
      setUsername("demo");
    }

    // Check for edit mode
    if (params.get("mode") === "edit") {
      setMode("edit");
    }
  }, [getStartParam]);

  const { profile, loading, error, refetch } = useProfileData(username);

  // Apply theme
  useEffect(() => {
    if (profile?.theme) {
      document.documentElement.setAttribute("data-theme", profile.theme);
    }
  }, [profile?.theme]);

  const handleSwitchToEdit = useCallback(() => {
    setMode("edit");
  }, []);

  const handleSwitchToView = useCallback(() => {
    refetch();
    setMode("view");
  }, [refetch]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-theme="obsidian">
        <div className="bg-ambient" />
        <div className="text-center animate-fade-in">
          <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: "var(--accent)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-theme="obsidian">
        <div className="bg-ambient" />
        <div className="text-center px-6 animate-fade-in">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text)" }}>
            {error === "Profile not found" ? "Profile not found" : "Something went wrong"}
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            {error === "Profile not found"
              ? `No profile exists for "${username}". Send /start to @biogram_bot to create one.`
              : error || "Could not load the profile."}
          </p>
          <button
            className="edit-btn"
            onClick={() => { setUsername("demo"); refetch(); }}
            id="load-demo-btn"
          >
            Load demo profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-theme={profile.theme || "obsidian"}>
      <div className="bg-ambient" />
      {mode === "edit" ? (
        <EditBentoView profile={profile} onRefresh={refetch} onBack={handleSwitchToView} />
      ) : (
        <div>
          <PublicBentoView
            profile={profile}
            onNavigateUser={(u) => {
              setUsername(u);
              setMode("view");
            }}
          />
          {/* Quick edit button (visible only for authenticated owners in a real scenario) */}
          <div className="text-center pb-4">
            <button
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: "var(--text-muted)", background: "var(--accent-soft)" }}
              onClick={handleSwitchToEdit}
              id="switch-to-edit-btn"
            >
              Edit profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
