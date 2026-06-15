import type { NextRequest } from "next/server";

/** 서버 전용 — NestJS beckend base (global prefix `/api` 포함) */
export function getBackendApiUrl(): string {
  const url = (
    process.env.BACKEND_API_URL ??
    process.env.API_URL ??
    "http://localhost:3002/api"
  ).trim();
  return url.replace(/\/$/, "");
}

/** Next.js Route Handler → beckend 프록시 */
export async function proxyToBackend(
  request: NextRequest,
  pathSegments: string[],
): Promise<Response> {
  const backend = getBackendApiUrl();
  const path = pathSegments.join("/");
  const target = new URL(`${backend}/${path}`);

  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  const headers = new Headers();
  headers.set("Accept", "application/json");

  const authorization = request.headers.get("authorization");
  if (authorization) headers.set("Authorization", authorization);

  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const method = request.method;
  const init: RequestInit = { method, headers, cache: "no-store" };

  if (method !== "GET" && method !== "HEAD") {
    init.body = await request.text();
  }

  const upstream = await fetch(target.toString(), init);
  const body = await upstream.arrayBuffer();

  const responseHeaders = new Headers();
  const upstreamType = upstream.headers.get("Content-Type");
  if (upstreamType) responseHeaders.set("Content-Type", upstreamType);

  return new Response(body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
