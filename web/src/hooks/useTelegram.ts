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

  const isTelegram = Boolean(window.Telegram?.WebApp?.initData);

  return {
    webApp: webApp.current,
    haptic,
    hapticSuccess,
    hapticError,
    getInitData,
    getUser,
    getStartParam,
    isTelegram,
    colorScheme: webApp.current?.colorScheme || "dark",
  };
}
