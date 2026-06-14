"use client";

import { useEffect, useState } from "react";
import { MermaidViewer } from "./MermaidViewer";
import { enrichFlowchartWithAwsIcons, loadAwsIconPack } from "@/lib/mermaid-aws";
import { renderMermaidChart } from "@/lib/mermaid-init";

type Props = { chart: string };

export function MermaidDiagram({ chart }: Props) {
  const [svg, setSvg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const pack = await loadAwsIconPack();
        const enriched = enrichFlowchartWithAwsIcons(chart, pack);
        const rendered = await renderMermaidChart(enriched);
        if (!cancelled) setSvg(rendered);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (err) {
    return (
      <pre className="my-4 overflow-x-auto rounded-lg bg-amber-50 p-4 text-xs text-amber-900">
        {chart}
      </pre>
    );
  }

  if (!svg) {
    return (
      <div className="my-6 flex h-48 items-center justify-center rounded-xl border border-border bg-white text-sm text-muted">
        다이어그램 렌더링 중…
      </div>
    );
  }

  const titleLine = chart
    .split("\n")
    .find((l) => l.includes("subgraph") || l.trim().startsWith("flowchart"))
    ?.replace(/subgraph\s+\w+\s*\[?([^\]]*)/, "$1")
    .trim();

  return <MermaidViewer svg={svg} title={titleLine || "Architecture"} />;
}
