"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  TransformComponent,
  TransformWrapper,
  useControls,
} from "react-zoom-pan-pinch";
import { cn } from "@/lib/utils";

type Props = {
  svg: string;
  title?: string;
};

const FIT = {
  pad: 12,
  fillFactor: 0.96,
  absoluteMinScale: 0.2,
  minManualScale: 0.15,
  maxManualScale: 8,
} as const;

function readContentSize(surface: HTMLElement, svgEl: SVGSVGElement): { w: number; h: number } {
  const ow = surface.offsetWidth;
  const oh = surface.offsetHeight;
  if (ow > 4 && oh > 4) return { w: ow, h: oh };

  try {
    const root = svgEl.querySelector("g.root, g[class*='root'], g") as SVGGElement | null;
    if (root) {
      const bb = root.getBBox();
      if (bb.width > 1 && bb.height > 1) return { w: bb.width, h: bb.height };
    }
  } catch {
    /* getBBox can fail before layout */
  }

  const rect = svgEl.getBoundingClientRect();
  if (rect.width > 1 && rect.height > 1) return { w: rect.width, h: rect.height };

  const vb = svgEl.viewBox?.baseVal;
  if (vb && vb.width > 0 && vb.height > 0) return { w: vb.width, h: vb.height };

  return { w: 1, h: 1 };
}

function computeFillScale(cw: number, ch: number, contentW: number, contentH: number): number {
  const scale = Math.min(cw / contentW, ch / contentH) * FIT.fillFactor;
  return Math.max(FIT.absoluteMinScale, scale);
}

function IconBtn({
  children,
  label,
  onClick,
  compact,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "rounded-md font-semibold text-navy hover:bg-accent-light",
        compact ? "min-h-8 min-w-8 px-2 py-1" : "min-h-9 min-w-9 px-2.5 py-1.5",
      )}
    >
      {children}
    </button>
  );
}

function DiagramSurface({ svg, surfaceRef }: { svg: string; surfaceRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={surfaceRef}
      className="mermaid-svg-root inline-block w-max max-w-none cursor-grab active:cursor-grabbing [&_svg]:block [&_svg]:h-auto [&_svg]:max-w-none [&_svg]:w-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function ZoomCanvasBody({
  svg,
  onFullscreen,
  className,
}: {
  svg: string;
  onFullscreen: () => void;
  className?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const { setTransform, zoomIn, zoomOut } = useControls();

  const fitToView = useCallback(() => {
    const wrapper = wrapperRef.current;
    const surface = surfaceRef.current;
    const svgEl = surface?.querySelector("svg");
    if (!wrapper || !surface || !svgEl) return;

    const pad = FIT.pad;
    const cw = Math.max(wrapper.clientWidth - pad * 2, 1);
    const ch = Math.max(wrapper.clientHeight - pad * 2, 1);
    const { w: contentW, h: contentH } = readContentSize(surface, svgEl);
    const scale = computeFillScale(cw, ch, contentW, contentH);

    const posX = (wrapper.clientWidth - contentW * scale) / 2;
    const posY = (wrapper.clientHeight - contentH * scale) / 2;
    setTransform(posX, posY, scale, 0);
  }, [setTransform]);

  useEffect(() => {
    fitToView();
    const timers = [0, 50, 150, 350, 700, 1200].map((ms) => window.setTimeout(fitToView, ms));
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => fitToView())
        : null;
    if (ro && wrapperRef.current) ro.observe(wrapperRef.current);
    return () => {
      timers.forEach(window.clearTimeout);
      ro?.disconnect();
    };
  }, [svg, fitToView]);

  return (
    <div ref={wrapperRef} className={cn("relative flex h-full w-full flex-col", className)}>
      <div className="absolute right-2 top-2 z-10">
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-white/95 p-1 text-xs shadow-sm backdrop-blur-sm">
          <IconBtn label="확대" onClick={() => zoomIn(0.15)} compact>
            +
          </IconBtn>
          <IconBtn label="축소" onClick={() => zoomOut(0.15)} compact>
            −
          </IconBtn>
          <IconBtn label="화면에 맞춤" onClick={fitToView} compact>
            ⊡
          </IconBtn>
          <span className="mx-1 hidden h-4 w-px bg-border sm:block" />
          <IconBtn label="전체 화면" onClick={onFullscreen} compact>
            ⛶
          </IconBtn>
        </div>
      </div>
      <TransformComponent
        wrapperClass="!w-full !h-full"
        contentClass="!w-full !h-full flex items-center justify-center"
      >
        <DiagramSurface svg={svg} surfaceRef={surfaceRef} />
      </TransformComponent>
    </div>
  );
}

function wheelActivationKeys(keys: string[]) {
  return keys.includes("Control") || keys.includes("Meta");
}

function ZoomCanvas({
  svg,
  onFullscreen,
  className,
}: {
  svg: string;
  onFullscreen: () => void;
  className?: string;
}) {
  return (
    <TransformWrapper
      initialScale={1}
      minScale={FIT.minManualScale}
      maxScale={FIT.maxManualScale}
      centerOnInit={false}
      limitToBounds={false}
      panning={{ velocityDisabled: true, excluded: ["button"] }}
      wheel={{
        step: 0.12,
        activationKeys: wheelActivationKeys,
      }}
      trackPadPanning={{ disabled: true }}
      pinch={{ step: 5 }}
      doubleClick={{ disabled: true }}
    >
      <ZoomCanvasBody svg={svg} onFullscreen={onFullscreen} className={className} />
    </TransformWrapper>
  );
}

function FullscreenModal({ svg, title, onClose }: { svg: string; title?: string; onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-surface">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-white px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs text-muted">다이어그램 · 전체 화면</p>
          {title && <p className="truncate text-sm font-semibold text-navy">{title}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-surface"
        >
          닫기 ✕
        </button>
      </header>
      <div className="relative min-h-0 flex-1">
        <ZoomCanvas svg={svg} onFullscreen={onClose} className="absolute inset-0" />
      </div>
    </div>,
    document.body,
  );
}

export function MermaidViewer({ svg, title }: Props) {
  const [fullscreen, setFullscreen] = useState(false);
  const hintId = useId();

  const openFullscreen = useCallback(() => setFullscreen(true), []);
  const closeFullscreen = useCallback(() => setFullscreen(false), []);

  if (!svg) return null;

  return (
    <>
      <figure
        className="my-6 overflow-hidden rounded-xl border border-border bg-white shadow-sm"
        aria-describedby={hintId}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border bg-accent-light/40 px-3 py-2 sm:px-4">
          <span className="text-xs font-medium text-navy">AWS 아키텍처 다이어그램</span>
          <span id={hintId} className="hidden text-[10px] text-muted sm:inline">
            초기 화면 맞춤 · Ctrl+휠 확대/축소 · 드래그 · ⛶
          </span>
        </div>
        <div className="relative h-[min(72vh,640px)] min-h-[420px] w-full bg-[linear-gradient(#eef1f4_1px,transparent_1px),linear-gradient(90deg,#eef1f4_1px,transparent_1px)] bg-size-[16px_16px]">
          <ZoomCanvas svg={svg} onFullscreen={openFullscreen} className="absolute inset-0" />
        </div>
      </figure>
      {fullscreen && <FullscreenModal svg={svg} title={title} onClose={closeFullscreen} />}
    </>
  );
}
