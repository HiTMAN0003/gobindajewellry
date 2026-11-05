import { useEffect, useState } from "react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISSED_KEY = "gobinda-pwa-install-dismissed-v1";

export function PwaInstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

    if (standalone || localStorage.getItem(DISMISSED_KEY)) return;

    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isIOS) {
      setIos(true);
      setVisible(true);
    }

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
      setVisible(true);
    };

    const handleInstalled = () => {
      localStorage.setItem(DISMISSED_KEY, "installed");
      setVisible(false);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "dismissed");
    setVisible(false);
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      localStorage.setItem(DISMISSED_KEY, "installed");
    } else {
      localStorage.setItem(DISMISSED_KEY, "dismissed");
    }
    setVisible(false);
    setInstallEvent(null);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(25, 19, 15, 0.58)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          padding: 26,
          borderRadius: 20,
          background: "#f7f1eb",
          color: "#33251d",
          textAlign: "center",
          boxShadow: "0 20px 70px rgba(0,0,0,.28)",
        }}
      >
        <div style={{ fontSize: 38, marginBottom: 10 }}>✦</div>
        <h2 id="pwa-install-title" style={{ fontSize: 23, margin: "0 0 10px", fontWeight: 600 }}>
          Install Gobinda Jewellers
        </h2>
        <p style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 22px", color: "#725f51" }}>
          {ios
            ? "Add our store to your Home Screen for quick access. Tap Share in Safari, then choose Add to Home Screen."
            : "Add our store to your home screen for a faster, app-like experience."}
        </p>

        {ios ? (
          <a
            href="/?install=1&platform=ios"
            style={{
              display: "block",
              padding: "13px 18px",
              borderRadius: 10,
              background: "#765033",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 14,
              marginBottom: 10,
            }}
          >
            View installation steps
          </a>
        ) : (
          <button
            onClick={install}
            style={{
              width: "100%",
              padding: "13px 18px",
              border: 0,
              borderRadius: 10,
              background: "#765033",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              marginBottom: 10,
            }}
          >
            Install app
          </button>
        )}

        <button
          onClick={dismiss}
          style={{
            width: "100%",
            padding: "11px 18px",
            border: "1px solid #d8c9bc",
            borderRadius: 10,
            background: "transparent",
            color: "#725f51",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
