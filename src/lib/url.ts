export function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  const envUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL;
  if (envUrl) {
    return envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
  }
  return "http://localhost:3000";
}

export function getVerificationUrl(certificateId: string) {
  const base = getBaseUrl();
  return `${base}/verify/${encodeURIComponent(certificateId.trim())}`;
}