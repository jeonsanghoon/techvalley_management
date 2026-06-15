export interface PipelineTiersResponseDto {
  ingress: {
    kinesis: Record<string, unknown>;
    lambdas: string[];
  };
  normalize: {
    routes: number;
    mongo_database: string;
  };
  source: string;
}

export interface PipelineLiveResponseDto {
  collections: Record<string, number>;
  cadences: Array<{ id: string; enabled: boolean }>;
  asOf: string;
}

export interface PipelineCollectionStatsDataDto {
  totalDevices: number;
  onlineDevices: number;
  normalizedToday: number;
  greengrassComponents: number;
  collections: import('../../../common/types/db/postgres-rows').CollectionDailyStatsRow[];
}
