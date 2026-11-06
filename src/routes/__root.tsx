import { useEffect, useRef } from "react";
import { createRootRoute, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { Toaster } from "sonner";
import { PRIMARY_SITE_HOST, isGrokPlatformHost } from "@/lib/site-origin";
import appCss from "../styles.css?url";

const APP_NAME = "Gobinda Jewellers";
const GA_MEASUREMENT_ID = "G-N7RS69X8ES";

function publicShareHost(): string {
  const raw = String(import.meta.env.VITE_PUBLIC_HOSTNAME ?? "").trim();
  const host = raw.split(",")[0]?.trim().split(":")[0]?.toLowerCase() ?? "";
  if (host === PRIMARY_SITE_HOST || host === "www." + PRIMARY_SITE_HOST) return host;
  if (host && isGrokPlatformHost(host)) return PRIMARY_SITE_HOST;
  if (!host || !/^[a-z0-9.-]+$/.test(host) || !host.includes(".")) return PRIMARY_SITE_HOST;
  if (host === "vercel.app" || host.endsWith(".vercel.app")) return PRIMARY_SITE_HOST;
  if (host === "vercel.com" || host.endsWith(".vercel.com")) return PRIMARY_SITE_HOST;
  return host;
}

function GaSpaViews() {
  const href = useRouterState({ select: (s) => s.location.href });
  const skipFirst = useRef(true);
  useEffect(() => {
    if (skipFirst.current) { skipFirst.current = false; return; }
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag !== "function") return;
    gtag("event", "page_view", {
      page_path: window.location.pathname + window.location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [href]);
  return null;
}

export const Route = createRootRoute({
  head: () => {
    const host = publicShareHost();
    const xBanner = host ? "https://" + host + "/x-banner.jpg" : undefined;
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
        { title: APP_NAME },
        { name: "description", content: "Gobinda Jewellers — timeless gold and silver jewellery, handcrafted heirlooms, and today's metal rates." },
        { name: "theme-color", content: "#f7f1eb" },
        { name: "application-name", content: "GJewels" },
        { name: "apple-mobile-web-app-title", content: "GJewels" },
        ...(xBanner ? [{ property: "x:game:image", content: xBanner }] : []),
      ],
      links: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Manrope:wght@300;400;500;600&display=swap" },
        { rel: "stylesheet", href: appCss },
        { rel: "manifest", href: "/__grok/manifest.webmanifest" },
        { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      ],
      scripts: [],
    };
  },
  component: RootDocument,
});

function RootDocument() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const timer = window.setTimeout(() => {
      void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => undefined);
    }, 700);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadAnalytics = () => {
      if (cancelled || document.querySelector("script[data-gj-analytics]")) return;
      const target = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
      target.dataLayer = target.dataLayer || [];
      target.gtag = target.gtag || ((...args: unknown[]) => target.dataLayer?.push(args));
      target.gtag("js", new Date());
      target.gtag("config", GA_MEASUREMENT_ID);
      const script = document.createElement("script");
      script.async = true;
      script.dataset.gjAnalytics = "true";
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
      document.head.append(script);
    };
    const idleWindow = window as Window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number };
    const timer = window.setTimeout(() => {
      if (idleWindow.requestIdleCallback) idleWindow.requestIdleCallback(loadAnalytics, { timeout: 4000 });
      else loadAnalytics();
    }, 1800);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head><HeadContent /></head>
      <body className="bg-ink font-sans text-ivory antialiased">
        <PreviewHostBridge />
        <PwaInstallPrompt />
        <GaSpaViews />
        <AuthProvider><Outlet /></AuthProvider>
        <Toaster theme="dark" position="bottom-center" />
        <Scripts />
      </body>
    </html>
  );
}
