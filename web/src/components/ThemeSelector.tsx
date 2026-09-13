interface Props {
  currentTheme: string;
  onSelect: (theme: string) => void;
}

const themes = [
  { id: "obsidian", label: "Obsidian", bg: "#0a0a0f", accent: "#7c3aed" },
  { id: "cyberpunk", label: "Cyber", bg: "#0d0015", accent: "#ec4899" },
  { id: "glassmorphic", label: "Glass", bg: "#0f172a", accent: "#14b8a6" },
  { id: "paper", label: "Paper", bg: "#fafaf9", accent: "#292524" },
];

export function ThemeSelector({ currentTheme, onSelect }: Props) {
  return (
    <div>
      <div className="form-label" style={{ marginBottom: 8 }}>Theme</div>
      <div className="theme-grid">
        {themes.map((t) => (
          <button
            key={t.id}
            className={`theme-swatch ${currentTheme === t.id ? "active" : ""}`}
            style={{
              background: t.bg,
              color: t.accent,
              borderColor: currentTheme === t.id ? t.accent : "transparent",
            }}
            onClick={() => onSelect(t.id)}
            title={t.label}
            id={`theme-${t.id}`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
