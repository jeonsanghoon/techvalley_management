import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() {
    return [
      /** Google Maps JS — ad blocker가 maps.googleapis.com 직접 요청을 차단하는 경우 우회 */
      {
        source: "/gmaps/:path*",
        destination: "https://maps.googleapis.com/:path*",
      },
      /** Maps JS가 로드하는 v3 번들 (일부 환경에서 추가 차단 방지) */
      {
        source: "/gmaps-api-v3/:path*",
        destination: "https://maps.googleapis.com/maps-api-v3/:path*",
      },
      /** Maps 타일·아이콘 정적 리소스 */
      {
        source: "/gstatic-maps/:path*",
        destination: "https://maps.gstatic.com/:path*",
      },
    ];
  },
};

export default nextConfig;
