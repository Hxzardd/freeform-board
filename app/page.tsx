"use client";

import { useRef } from "react";
import Toolbar from "@/components/Toolbar";
import BoardCanvas from "@/components/BoardCanvas";
import { usePins } from "@/hooks/usePins";
import { useGroups } from "@/hooks/useGroups";
import { useCanvas } from "@/hooks/useCanvas";
import { usePinOperations } from "@/hooks/usePinOperations";
import { useGroupOperations } from "@/hooks/useGroupOperations";
import { useDragAndPan } from "@/hooks/useDragAndPan";

export default function Home() {
  const { pins, commit, updatePins } = usePins();
  const { groups, setGroups } = useGroups();
  const {
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
  } = useCanvas();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const pinOperations = usePinOperations({
    pins,
    commit,
    getViewportCenter,
  });

  const groupOperations = useGroupOperations({
    groups,
    pins,
    setGroups,
    commit,
  });

  const dragAndPan = useDragAndPan({
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
  });

  return (
    <div
      className="w-screen h-screen bg-[#faf9f6] relative overflow-hidden"
      onMouseMove={(e) => {
        dragAndPan.handleMouseMove(e);
        dragAndPan.handleCanvasMouseMove(e);
      }}
      onMouseUp={() => {
        dragAndPan.handleMouseUp();
        dragAndPan.handleCanvasMouseUp();
      }}
    >
      <Toolbar
        onAddText={pinOperations.addTextPin}
        onAddImageUrl={pinOperations.addImageFromUrl}
        onAddImageFile={() => fileInputRef.current?.click()}
        onAddList={pinOperations.addListPin}
        onManageGroups={groupOperations.manageGroups}
        onUndo={() => {}}
        onRedo={() => {}}
        zoom={scale}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={pinOperations.handleLocalImageSelect}
      />

      <BoardCanvas
        pins={pins}
        groups={groups}
        scale={scale}
        offsetX={offset.x}
        offsetY={offset.y}
        onPinMouseDown={(e, pin) => dragAndPan.handlePinMouseDown(e, pin)}
        onCanvasMouseDown={dragAndPan.handleCanvasMouseDown}
        onWheelZoom={dragAndPan.handleWheel}
        onDeletePin={pinOperations.deletePin}
        onEditPin={(pin) => pinOperations.editPin(pin, groups)}
        onAddListItem={pinOperations.addListItem}
        onEditListItem={pinOperations.editListItem}
        onDeleteListItem={pinOperations.deleteListItem}
        onRemoveGroupFromPin={pinOperations.removeGroupFromPin}
      />
    </div>
  );
}
