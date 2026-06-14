export function buildRemoteDiagnosisHref(equipmentSn: string): string {
  return `/remote-diagnosis?${new URLSearchParams({ equipmentSn }).toString()}`;
}

export function buildRemoteControlHref(equipmentSn: string, findingId?: string): string {
  const params = new URLSearchParams({ equipmentSn });
  if (findingId) params.set("findingId", findingId);
  return `/remote-control?${params.toString()}`;
}
