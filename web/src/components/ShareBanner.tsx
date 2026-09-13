import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useTelegram } from "../hooks/useTelegram";

interface Props {
  username: string;
}

export function ShareBanner({ username }: Props) {
  const [copied, setCopied] = useState(false);
  const { hapticSuccess } = useTelegram();

  const profileUrl = `https://t.me/biogram_bot/app?startapp=${username}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      hapticSuccess();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = profileUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="share-banner">
      <button className="share-btn" onClick={handleCopy} id="share-copy-btn">
        {copied ? (
          <>
            <Check size={16} />
            Copied!
          </>
        ) : (
          <>
            <Copy size={16} />
            Copy my Telegram Bio Link
          </>
        )}
      </button>
    </div>
  );
}
