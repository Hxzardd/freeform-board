"use client";

import { useRef } from "react";
import Toolbar from "@/components/Toolbar";
import BoardCanvas from "@/components/BoardCanvas";
import { usePins } from "@/hooks/usePins";
import { useGroups } from "@/hooks/useGroups";
import { useCanvas } from "@/hooks/useCanvas";
import { usePinOperations } from "@/hooks/usePinOperations";
import { useGroupOperations } from "@/hooks/useGroupOperations";

export default function Home() {
  const { pins, commit, updatePins, undo, redo } = usePins();
  const { groups, setGroups } = useGroups();
  const canvas = useCanvas({ pins, updatePins, commit });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const pinOperations = usePinOperations({
    pins,
    commit,
    getViewportCenter: canvas.getViewportCenter,
  });

  const groupOperations = useGroupOperations({
    groups,
    pins,
    setGroups,
    commit,
  });

  return (
    <div
      className="w-screen h-screen bg-[#faf9f6] relative overflow-hidden"
      onMouseMove={(e) => {
        canvas.handleMouseMove(e);
        canvas.handleCanvasMouseMove(e);
      }}
      onMouseUp={() => {
        canvas.handleMouseUp();
        canvas.handleCanvasMouseUp();
      }}
    >
      <Toolbar
        onAddText={pinOperations.addTextPin}
        onAddImageUrl={pinOperations.addImageFromUrl}
        onAddImageFile={() => fileInputRef.current?.click()}
        onAddList={pinOperations.addListPin}
        onManageGroups={groupOperations.manageGroups}
        onUndo={undo}
        onRedo={redo}
        zoom={canvas.scale}
        onZoomIn={canvas.zoomIn}
        onZoomOut={canvas.zoomOut}
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
        scale={canvas.scale}
        offsetX={canvas.offset.x}
        offsetY={canvas.offset.y}
        onPinMouseDown={canvas.handlePinMouseDown}
        onCanvasMouseDown={canvas.handleCanvasMouseDown}
        onWheelZoom={canvas.handleWheel}
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
