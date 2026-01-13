import { useEffect, useState } from "react";
import { DragInfo, Pin } from "@/types/pin";

type UseCanvasProps = {
  pins: Pin[];
  updatePins: (updater: (pins: Pin[]) => Pin[]) => void;
  commit: (newPins: Pin[]) => void;
};

export function useCanvas({ pins, updatePins, commit }: UseCanvasProps) {
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

  function handlePinMouseDown(e: React.MouseEvent<HTMLDivElement>, pin: Pin) {
    const mouseX = (e.clientX - offset.x) / scale;
    const mouseY = (e.clientY - offset.y) / scale;
    
    setDragInfo({
      pinId: pin.id,
      offsetX: mouseX - pin.x,
      offsetY: mouseY - pin.y,
    });
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!dragInfo) return;

    const mouseX = (e.clientX - offset.x) / scale;
    const mouseY = (e.clientY - offset.y) / scale;

    updatePins((prevPins) =>
      prevPins.map((p) =>
        p.id === dragInfo.pinId
          ? {
              ...p,
              x: mouseX - dragInfo.offsetX,
              y: mouseY - dragInfo.offsetY,
            }
          : p
      )
    );
  }

  function handleMouseUp() {
    if (!dragInfo) return;
    commit(pins);
    setDragInfo(null);
  }

  function handleCanvasMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (dragInfo) return;

    setIsPanning(true);
    setPanStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  }

  function handleCanvasMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!isPanning || dragInfo) return;

    setOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
  }

  function handleCanvasMouseUp() {
    setIsPanning(false);
  }

  function handleWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    setScale((s) => Math.min(Math.max(s - e.deltaY * 0.001, 0.3), 3));
  }

  return {
    scale,
    offset,
    zoomIn,
    zoomOut,
    getViewportCenter,
    handlePinMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleWheel,
  };
}

