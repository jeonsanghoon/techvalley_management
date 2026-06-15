/** UI DataScope · batchMeta 계약 — frontend `DataSourceMeta` 미러 */
export interface BatchMetaDto {
  scope: 'batch';
  asOf: string;
  source: string;
  refreshInterval: string;
}

export function createBatchMeta(source: string, refreshInterval = 'realtime'): BatchMetaDto {
  return {
    scope: 'batch',
    asOf: new Date().toISOString(),
    source,
    refreshInterval,
  };
}
