import { Pin, DragInfo } from "@/types/pin";

type UseDragAndPanProps = {
  pins: Pin[];
  dragInfo: DragInfo;
  scale: number;
  offset: { x: number; y: number };
  isPanning: boolean;
  panStart: { x: number; y: number };
  setDragInfo: React.Dispatch<React.SetStateAction<DragInfo>>;
  setIsPanning: React.Dispatch<React.SetStateAction<boolean>>;
  setPanStart: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  setOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  updatePins: (updater: (pins: Pin[]) => Pin[]) => void;
  commit: (newPins: Pin[]) => void;
};

export function useDragAndPan({
  pins,
  dragInfo,
  scale,
  offset,
  isPanning,
  panStart,
  setDragInfo,
  setIsPanning,
  setPanStart,
  setOffset,
  setScale,
  updatePins,
  commit,
}: UseDragAndPanProps) {
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
    handlePinMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleWheel,
  };
}

