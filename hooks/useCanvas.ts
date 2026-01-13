import { useEffect, useState } from "react";
import { DragInfo } from "@/types/pin";

export function useCanvas() {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragInfo, setDragInfo] = useState<DragInfo>(null);

  useEffect(() => {
    const preventBrowserZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", preventBrowserZoom, {
      passive: false,
    });

    return () => {
      window.removeEventListener("wheel", preventBrowserZoom);
    };
  }, []);

  function zoomIn() {
    setScale((s) => Math.min(s + 0.1, 3));
  }

  function zoomOut() {
    setScale((s) => Math.max(s - 0.1, 0.3));
  }

  function getViewportCenter() {
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;
    
    const centerX = (screenCenterX - offset.x) / scale;
    const centerY = (screenCenterY - offset.y) / scale;
    
    return { x: centerX, y: centerY };
  }

  return {
    scale,
    offset,
    isPanning,
    panStart,
    dragInfo,
    setScale,
    setOffset,
    setIsPanning,
    setPanStart,
    setDragInfo,
    zoomIn,
    zoomOut,
    getViewportCenter,
  };
}

