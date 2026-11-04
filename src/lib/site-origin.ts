/** Primary public site and Vercel deployment. */
export const PRIMARY_SITE_HOST = "gobindajewels.in";

export const PRIMARY_SITE_HOSTS = [
  "gobindajewels.in",
  "www.gobindajewels.in",
  "gobindajewellry.vercel.app",
] as const;

export const PRIMARY_SITE_ORIGIN = "https://gobindajewels.in";

export const PRIMARY_SITE_ORIGINS: string[] = PRIMARY_SITE_HOSTS.flatMap((host) => [
  `https://${host}`,
  `http://${host}`,
]);

export function isGrokPlatformHost(host: string): boolean {
  const h = host.toLowerCase().split(":")[0] ?? "";
  return h === "grok.me" || h.endsWith(".grok.me") || h.endsWith(".grok-sandbox.com");
}
