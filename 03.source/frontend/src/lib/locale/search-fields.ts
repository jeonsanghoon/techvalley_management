import type { LocalizableText } from "./types";

/** 페이지 검색 필드 공통 라벨 */
export const SEARCH_FIELD_LABELS: Record<string, LocalizableText> = {
  serialNo: { ko: "S/N", en: "S/N" },
  model: { ko: "모델", en: "Model" },
  customer: { ko: "고객사", en: "Customer" },
  site: { ko: "현장", en: "Site" },
  customerName: { ko: "고객사", en: "Customer" },
  siteName: { ko: "현장명", en: "Site name" },
  address: { ko: "주소", en: "Address" },
  tier: { ko: "Tier", en: "Tier" },
  store: { ko: "저장소", en: "Store" },
  equipmentSn: { ko: "장비 S/N", en: "Equipment S/N" },
  message: { ko: "메시지", en: "Message" },
  metric: { ko: "메트릭", en: "Metric" },
  unit: { ko: "단위", en: "Unit" },
  name: { ko: "명칭", en: "Name" },
  target: { ko: "대상", en: "Target" },
  recipients: { ko: "수신 대상", en: "Recipients" },
  description: { ko: "설명", en: "Description" },
  ruleName: { ko: "룰명", en: "Rule name" },
  partNo: { ko: "부품번호", en: "Part no." },
  trackingNo: { ko: "송장번호", en: "Tracking no." },
};

export function searchFieldLabel(id: string, labels: Record<string, LocalizableText>): LocalizableText {
  return labels[id] ?? { ko: id, en: id };
}
