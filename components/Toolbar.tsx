import { useEffect, useRef, useState } from "react";

type ToolbarProps = {
  onAddText: () => void;
  onAddImageUrl: () => void;
  onAddImageFile: () => void;
  onAddList: () => void;
  onAddGroup: () => void;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

export default function Toolbar({
  onAddText,
  onAddImageUrl,
  onAddImageFile,
  onAddList,
  onAddGroup,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
}: ToolbarProps) {
  // toolbar state
  const [collapsed, setCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // start dragging toolbar
  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  }

  // update toolbar position while dragging
  function handleMouseMove(e: MouseEvent) {
    if (!dragging) return;

    setPosition({
      x: Math.max(0, e.clientX - dragOffset.current.x),
      y: Math.max(0, e.clientY - dragOffset.current.y),
    });
  }

  // stop dragging toolbar
  function handleMouseUp() {
    setDragging(false);
  }

  // listen for mouse events to drag toolbar
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  return (
    <div
      className="fixed z-[9999] bg-white/95 backdrop-blur-sm shadow-md rounded-2xl border border-gray-300/60 select-none"
      style={{
        left: position.x,
        top: position.y,
      }}
      onWheel={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-gray-300/50 cursor-move bg-gray-50/50 rounded-t-2xl"
        onMouseDown={handleMouseDown}
      >
        <span className="text-[13px] text-gray-700 font-medium">Board Tools</span>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[11px] text-gray-500 hover:text-gray-700 transition-colors"
        >
          {collapsed ? "▾" : "▴"}
        </button>
      </div>

      {!collapsed && (
        <div className="p-2.5 flex flex-col gap-1.5">
          <div className="flex gap-1.5">
            <button onClick={onUndo} className="btn">Undo</button>
            <button onClick={onRedo} className="btn">Redo</button>
          </div>

          <button onClick={onAddText} className="btn">Add Text</button>
          <button onClick={onAddList} className="btn">Add List</button>
          <button onClick={onAddImageUrl} className="btn">Image URL</button>
          <button onClick={onAddImageFile} className="btn">Image File</button>
          <button onClick={onAddGroup} className="btn">Create Group</button>

          <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-300/50">
            <button onClick={onZoomOut} className="btn">−</button>
            <span className="text-[12px] text-gray-600 font-medium">{Math.round(zoom * 100)}%</span>
            <button onClick={onZoomIn} className="btn">+</button>
          </div>
        </div>
      )}
    </div>
  );
}
