const configuredAppUrl = (import.meta.env.VITE_APP_URL || "")
  .trim()
  .replace(/\/+$/, "");

export function getAppUrl() {
  if (configuredAppUrl) return configuredAppUrl;
  return typeof window !== "undefined" ? window.location.origin : "";
}
