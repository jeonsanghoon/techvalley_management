/**
 * 대시보드 지도 언마운트 후 Google Maps가 body에 남기는 잔여 노드·스타일 정리.
 * SPA 메뉴 이동 시 레이아웃·MUI 스타일 충돌 방지.
 */
export function cleanupGoogleMapsArtifacts() {
  if (typeof document === "undefined") return;

  document.body.style.overflow = "";
  document.body.style.position = "";

  document.querySelectorAll<HTMLElement>("body > div").forEach((node) => {
    const cls = node.className;
    if (typeof cls === "string" && /^gm-/.test(cls)) {
      node.remove();
    }
  });
}
