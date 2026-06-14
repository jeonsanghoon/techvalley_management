import mermaid from "mermaid";
import { loadAwsIconPack } from "./mermaid-aws";

let ready: Promise<void> | null = null;

export function initMermaid(): Promise<void> {
  if (ready) return ready;

  ready = (async () => {
    const pack = await loadAwsIconPack();
    mermaid.registerIconPacks([
      {
        name: "aws",
        loader: async () => pack as never,
      },
    ]);

    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      securityLevel: "loose",
      flowchart: {
        htmlLabels: true,
        curve: "basis",
        padding: 14,
        nodeSpacing: 36,
        rankSpacing: 44,
        useMaxWidth: false,
      },
      themeVariables: {
        primaryColor: "#e6f1fb",
        primaryTextColor: "#0b3d5c",
        primaryBorderColor: "#1c7293",
        lineColor: "#5b6b73",
        secondaryColor: "#f4f7f9",
        tertiaryColor: "#ffffff",
        fontFamily: '"Malgun Gothic", "맑은 고딕", sans-serif',
      },
    });
  })();

  return ready;
}

export async function renderMermaidChart(chart: string): Promise<string> {
  await initMermaid();
  const id = `mmd-${Math.random().toString(36).slice(2, 11)}`;
  const { svg } = await mermaid.render(id, chart.trim());
  return svg;
}
