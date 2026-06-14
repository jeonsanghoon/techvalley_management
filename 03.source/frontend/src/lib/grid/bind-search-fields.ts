import type { QuerySearchField } from "@/components/ui/QueryToolbar";

export interface SearchFieldDef {
  id: string;
  label: string;
  placeholder?: string;
  /** API·DB 인덱스 파라미터명 (미지정 시 id) */
  indexKey?: string;
}

export function bindSearchFields<S extends Record<string, string>>(
  defs: readonly SearchFieldDef[],
  search: S,
  setSearch: (id: keyof S & string, value: string) => void,
): QuerySearchField[] {
  return defs.map((d) => ({
    id: d.id,
    label: d.label,
    indexKey: d.indexKey ?? d.id,
    placeholder: d.placeholder,
    value: search[d.id as keyof S] ?? "",
    onChange: (v) => setSearch(d.id as keyof S & string, v),
  }));
}
