/** 브라우저 → same-origin Next.js BFF (`/app/api/*`) */
export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "/api";
  return url.replace(/\/$/, "");
}
