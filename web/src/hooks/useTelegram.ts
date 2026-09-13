import { useEffect, useCallback, useRef } from "react";

// Access the Telegram WebApp object from the global scope
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
      photo_url?: string;
    };
    start_param?: string;
  };
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  colorScheme: "light" | "dark";
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  HapticFeedback: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
    selectionChanged: () => void;
  };
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    isVisible: boolean;
  };
  MainButton: {
    show: () => void;
    hide: () => void;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    isVisible: boolean;
    isActive: boolean;
    setParams: (params: Record<string, unknown>) => void;
  };
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  openInvoice?: (url: string, callback?: (status: "paid" | "cancelled" | "failed" | "pending") => void) => void;
  shareToStory?: (media_url: string, params?: { text?: string; widget_link?: { url: string; name?: string } }) => void;
}

export function useTelegram() {
  const webApp = useRef<TelegramWebApp | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      webApp.current = tg;
      tg.ready();
      tg.expand();
    }
  }, []);

  const haptic = useCallback((type: "light" | "medium" | "heavy" = "light") => {
    try {
      webApp.current?.HapticFeedback.impactOccurred(type);
    } catch {
      // Not in Telegram, ignore
    }
  }, []);

  const hapticSuccess = useCallback(() => {
    try {
      webApp.current?.HapticFeedback.notificationOccurred("success");
    } catch {
      // Not in Telegram, ignore
    }
  }, []);

  const hapticError = useCallback(() => {
    try {
      webApp.current?.HapticFeedback.notificationOccurred("error");
    } catch {
      // Not in Telegram, ignore
    }
  }, []);

  const getInitData = useCallback((): string => {
    return webApp.current?.initData || "";
  }, []);

  const getUser = useCallback(() => {
    return webApp.current?.initDataUnsafe?.user || null;
  }, []);

  const getStartParam = useCallback((): string | undefined => {
    return webApp.current?.initDataUnsafe?.start_param;
  }, []);

  const openInvoice = useCallback(
    (url: string): Promise<"paid" | "cancelled" | "failed" | "pending"> => {
      return new Promise((resolve) => {
        if (webApp.current?.openInvoice) {
          webApp.current.openInvoice(url, (status) => {
            resolve(status);
          });
        } else {
          // Fallback if not in Telegram or old client
          window.open(url, "_blank");
          resolve("pending");
        }
      });
    },
    []
  );

  const shareToStory = useCallback(
    (mediaUrl: string, params?: { text?: string; widget_link?: { url: string; name?: string } }) => {
      if (webApp.current?.shareToStory) {
        webApp.current.shareToStory(mediaUrl, params);
        return true;
      }
      return false;
    },
    []
  );

  const isTelegram = Boolean(window.Telegram?.WebApp?.initData);

  return {
    webApp: webApp.current,
    haptic,
    hapticSuccess,
    hapticError,
    getInitData,
    getUser,
    getStartParam,
    openInvoice,
    shareToStory,
    isTelegram,
    colorScheme: webApp.current?.colorScheme || "dark",
    themeParams: webApp.current?.themeParams,
  };
}
