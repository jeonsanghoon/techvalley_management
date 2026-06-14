import { cn } from "@/lib/utils";

type Props = {
  status: "done" | "skeleton" | "next";
  children?: React.ReactNode;
};

const styles = {
  done: "bg-emerald-100 text-emerald-800",
  skeleton: "bg-sky-100 text-sky-800",
  next: "bg-amber-100 text-amber-900",
};

const labels = { done: "완료", skeleton: "골격", next: "다음" };

export function StatusBadge({ status, children }: Props) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", styles[status])}>
      {children ?? labels[status]}
    </span>
  );
}
