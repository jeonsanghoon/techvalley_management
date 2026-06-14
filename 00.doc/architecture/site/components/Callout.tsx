import { cn } from "@/lib/utils";

type Props = { variant?: "info" | "ok" | "warn"; children: React.ReactNode };

const map = {
  info: "border-sky-200 bg-sky-50 text-sky-950",
  ok: "border-emerald-200 bg-emerald-50 text-emerald-950",
  warn: "border-amber-200 bg-amber-50 text-amber-950",
};

export function Callout({ variant = "info", children }: Props) {
  return (
    <div className={cn("my-4 rounded-xl border px-4 py-3 text-sm leading-relaxed", map[variant])}>
      {children}
    </div>
  );
}
