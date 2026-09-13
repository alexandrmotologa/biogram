import { useState, useEffect, useCallback } from "react";

export interface TileMeta {
  [key: string]: unknown;
}

export interface Tile {
  id: string;
  order_index: number;
  type: string;
  title: string;
  subtitle: string | null;
  url: string | null;
  col_span: number;
  row_span: number;
  meta: TileMeta | null;
  locked_stars?: number;
  is_unlocked?: boolean;
  unlocked_content?: string | null;
}

export interface ProfileData {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  theme: string;
  badges?: string[];
  custom_bg?: string | null;
  glass_blur?: number;
  notifications_enabled?: boolean;
  tiles: Tile[];
}

export interface ExploreProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  theme: string;
  badges: string[];
  tiles_count: number;
  preview_tiles: { title: string; type: string }[];
}

interface UseProfileDataResult {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setProfileLocally: React.Dispatch<React.SetStateAction<ProfileData | null>>;
}

const API_BASE = "";

export function useProfileData(username: string | null): UseProfileDataResult {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!username) {
      setLoading(false);
      setError("No username provided");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/p/${encodeURIComponent(username)}`);

      if (!res.ok) {
        if (res.status === 404) {
          setError("Profile not found");
        } else {
          setError(`Failed to load profile (${res.status})`);
        }
        setProfile(null);
        return;
      }

      const data = await res.json();
      setProfile(data);
    } catch {
      setError("Could not connect to the server");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile, setProfileLocally: setProfile };
}

// API helpers for mutations

export async function updateProfile(
  initData: string,
  updates: Partial<Pick<ProfileData, "display_name" | "bio" | "avatar_url" | "theme" | "badges" | "custom_bg" | "glass_blur" | "notifications_enabled">>
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `tma ${initData}`,
      },
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function addTile(
  initData: string,
  tile: {
    type: string;
    title: string;
    subtitle?: string;
    url?: string;
    col_span?: number;
    row_span?: number;
    meta?: TileMeta;
    locked_stars?: number;
    unlocked_content?: string;
  }
): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/tiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `tma ${initData}`,
      },
      body: JSON.stringify(tile),
    });
    if (res.ok) {
      const data = await res.json();
      return data.tile_id;
    }
    return null;
  } catch {
    return null;
  }
}

export async function removeTile(initData: string, tileId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/tiles/${tileId}`, {
      method: "DELETE",
      headers: { Authorization: `tma ${initData}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function reorderTiles(initData: string, tileIds: string[]): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/tiles/reorder`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `tma ${initData}`,
      },
      body: JSON.stringify({ tile_ids: tileIds }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function recordTileClick(tileId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/click/${tileId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
  } catch {
    // Non-critical
  }
}

export async function subscribeNewsletter(username: string, emailOrHandle: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/p/${encodeURIComponent(username)}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrHandle }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchExploreProfiles(): Promise<ExploreProfile[]> {
  try {
    const res = await fetch(`${API_BASE}/api/explore`);
    if (res.ok) {
      const data = await res.json();
      return data.profiles || [];
    }
    return [];
  } catch {
    return [];
  }
}

export interface StarsInvoiceResponse {
  invoiceLink: string | null;
  simulated: boolean;
  tileId?: string;
  price?: number;
  title?: string;
}

export async function createStarsInvoice(
  initData: string,
  tileId: string,
  amountStars?: number
): Promise<StarsInvoiceResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/stars/create-invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `tma ${initData}`,
      },
      body: JSON.stringify({ tileId, amountStars }),
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

export async function simulateUnlockTile(initData: string, tileId: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/stars/simulate-unlock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `tma ${initData}`,
      },
      body: JSON.stringify({ tileId }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.unlocked_content;
    }
    return null;
  } catch {
    return null;
  }
}

export interface AnalyticsData {
  profile_views: number;
  total_clicks: number;
  tiles: {
    tile_id: string;
    title: string;
    type: string;
    clicks: number;
    ctr: number;
  }[];
}

export async function fetchAnalytics(initData: string): Promise<AnalyticsData | null> {
  try {
    const res = await fetch(`${API_BASE}/api/analytics`, {
      headers: { Authorization: `tma ${initData}` },
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}
