import { REALTIME_SOURCES, type DataSourceMeta } from "../scope";

const LIVE_AS_OF = "2026-06-06T14:26:00+09:00";

export const realtimeCollectionMeta: DataSourceMeta = {
  scope: "realtime",
  asOf: LIVE_AS_OF,
  source: REALTIME_SOURCES.collectionLive,
  refreshInterval: "CloudWatch 1분 폴링",
};

/** Kinesis·Greengrass 실시간 수집 지표 */
export const realtimeCollectionMetrics = {
  messagesPerMin: 8_420,
  spoolBufferMb: 12.4,
  hotTierLagMs: 120,
};
