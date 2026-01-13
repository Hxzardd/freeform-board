"use client";

import { useEffect, useRef, useState } from "react";
import { DragInfo, Group, HistoryState, Pin } from "@/types/pin";
import Toolbar from "@/components/Toolbar";
import BoardCanvas from "@/components/BoardCanvas";

const STORAGE_KEY = "freeform-board-history";
const GROUPS_STORAGE_KEY = "freeform-board-groups";

export default function Home() {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: [],
    future: [],
  });

  const pins = history.present;
  const [groups, setGroups] = useState<Group[]>([]);
  const [dragInfo, setDragInfo] = useState<DragInfo>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        console.error("Failed to load history");
      }
    }
  }, []);

  useEffect(() => {
    try {
      const historyStr = JSON.stringify(history);
      // check if data is too large (localStorage limit is usually 5-10MB)
      if (historyStr.length > 4 * 1024 * 1024) {
        console.warn("History too large, saving only current state");
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          past: [],
          present: history.present,
          future: [],
        }));
        return;
      }
      localStorage.setItem(STORAGE_KEY, historyStr);
    } catch (error) {
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        console.warn("localStorage full, saving only current state");
        // save only current state without calling setHistory (to avoid infinite loop)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            past: [],
            present: history.present,
            future: [],
          }));
        } catch (e) {
          console.error("Failed to save even minimal history", e);
        }
      } else {
        console.error("Failed to save history", error);
      }
    }
  }, [history]);

  useEffect(() => {
    const savedGroups = localStorage.getItem(GROUPS_STORAGE_KEY);
    if (savedGroups) {
      try {
        setGroups(JSON.parse(savedGroups));
      } catch {
        console.error("Failed to load groups");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
  }, [groups]);

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

  // Keep history limited to prevent localStorage issues
  function commit(newPins: Pin[]) {
    setHistory((prev) => {
      const newPast = [...prev.past, prev.present];
      const limitedPast = newPast.slice(-50);
      return {
        past: limitedPast,
        present: newPins,
        future: [],
      };
    });
  }

  function getViewportCenter() {
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;
    
    // Account for zoom and pan to get the actual center position
    const centerX = (screenCenterX - offset.x) / scale;
    const centerY = (screenCenterY - offset.y) / scale;
    
    return { x: centerX, y: centerY };
  }

  function addTextPin() {
    const text = prompt("Enter pin text");
    if (text === null) return;

    const center = getViewportCenter();
    commit([
      ...pins,
      {
        id: crypto.randomUUID(),
        x: center.x,
        y: center.y,
        type: "text",
        text: text.trim() || "New Pin",
      },
    ]);
  }

  function addImageFromUrl() {
    const url = prompt("Enter image URL");
    if (!url) return;

    const center = getViewportCenter();
    commit([
      ...pins,
      {
        id: crypto.randomUUID(),
        x: center.x,
        y: center.y,
        type: "image",
        imageSrc: url,
      },
    ]);
  }

  function addListPin() {
    const firstItem = prompt("First list item");
    if (firstItem === null) return;

    const center = getViewportCenter();
    commit([
      ...pins,
      {
        id: crypto.randomUUID(),
        x: center.x,
        y: center.y,
        type: "list",
        items: firstItem.trim() ? [firstItem] : [],
      },
    ]);
  }

  function addListItem(pinId: string) {
    const item = prompt("Add list item");
    if (!item?.trim()) return;

    commit(
      pins.map((p) =>
        p.id === pinId
          ? { ...p, items: [...(p.items || []), item] }
          : p
      )
    );
  }

  function deleteListItem(pinId: string, index: number) {
    commit(
      pins.map((p) =>
        p.id === pinId
          ? { ...p, items: p.items?.filter((_, i) => i !== index) }
          : p
      )
    );
  }

  function editListItem(pinId: string, index: number) {
    const pin = pins.find((p) => p.id === pinId);
    if (!pin || !pin.items) return;

    const currentItem = pin.items[index];
    const newItem = prompt("Edit list item", currentItem);
    if (newItem === null || !newItem.trim()) return;

    commit(
      pins.map((p) =>
        p.id === pinId
          ? {
              ...p,
              items: p.items?.map((item, i) => (i === index ? newItem.trim() : item)),
            }
          : p
      )
    );
  }

  function handleLocalImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const center = getViewportCenter();
      commit([
        ...pins,
        {
          id: crypto.randomUUID(),
          x: center.x,
          y: center.y,
          type: "image",
          imageSrc: reader.result as string,
        },
      ]);
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function deletePin(pinId: string) {
    commit(pins.filter((p) => p.id !== pinId));
  }

  function editPin(pin: Pin) {
    if (pin.type === "text") {
      const newText = prompt("Edit text", pin.text);
      if (newText === null) return;

      const tagInput = prompt(
        "Edit tags (comma separated)",
        pin.tags?.join(", ") || ""
      );

      const tags =
        tagInput?.split(",").map((t) => t.trim()).filter(Boolean) || [];

      commit(
        pins.map((p) =>
          p.id === pin.id ? { ...p, text: newText, tags, groupId: p.groupId } : p
        )
      );
    }

    if (pin.type === "image") {
      const newUrl = prompt("Edit image URL", pin.imageSrc);
      if (newUrl === null) return;

      const tagInput = prompt(
        "Edit tags (comma separated)",
        pin.tags?.join(", ") || ""
      );

      const tags =
        tagInput?.split(",").map((t) => t.trim()).filter(Boolean) || [];

      commit(
        pins.map((p) =>
          p.id === pin.id ? { ...p, imageSrc: newUrl, tags, groupId: p.groupId } : p
        )
      );
    }

    if (pin.type === "list") {
      const currentItems = pin.items?.join("\n") || "";
      const newItemsText = prompt(
        "Edit list items (one per line):",
        currentItems
      );
      
      if (newItemsText !== null) {
        const newItems = newItemsText
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);

        const tagInput = prompt(
          "Edit tags (comma separated)",
          pin.tags?.join(", ") || ""
        );

        const tags =
          tagInput?.split(",").map((t) => t.trim()).filter(Boolean) || [];

        commit(
          pins.map((p) =>
            p.id === pin.id ? { ...p, items: newItems, tags, groupId: p.groupId } : p
          )
        );
      } else {
        const tagInput = prompt(
          "Edit tags (comma separated)",
          pin.tags?.join(", ") || ""
        );

        if (tagInput !== null) {
          const tags =
            tagInput?.split(",").map((t) => t.trim()).filter(Boolean) || [];

          commit(
            pins.map((p) =>
              p.id === pin.id ? { ...p, tags, groupId: p.groupId } : p
            )
          );
        }
      }
    }

    // get latest pin data after edits for group assignment
    const updatedPins = history.present;
    const currentPin = updatedPins.find((p) => p.id === pin.id) || pin;
    
    if (groups.length > 0) {
      const groupNames = groups.map((g) => g.name).join(", ");
      const currentGroup = groups.find((g) => g.id === currentPin.groupId);
      const assignGroup = confirm(
        `Manage group? Current: ${currentGroup ? currentGroup.name : "None"}\nAvailable: ${groupNames}\n\nClick OK to change, Cancel to skip.`
      );

      if (assignGroup) {
        const options = ["Remove group", ...groups.map((g) => g.name)].join("\n");
        const selected = prompt(`Enter group name or "Remove group":\n${options}`);
        if (selected) {
          if (selected.trim().toLowerCase() === "remove group") {
            commit(
              updatedPins.map((p) =>
                p.id === pin.id ? { ...p, groupId: undefined } : p
              )
            );
          } else {
            const group = groups.find((g) => g.name === selected.trim());
            if (group) {
              commit(
                updatedPins.map((p) =>
                  p.id === pin.id ? { ...p, groupId: group.id } : p
                )
              );
            }
          }
        }
      }
    }
  }

  function removeGroupFromPin(pinId: string) {
    commit(
      pins.map((p) =>
        p.id === pinId ? { ...p, groupId: undefined } : p
      )
    );
  }

  function addGroup() {
    const name = prompt("Group name");
    if (!name) return;

    setGroups((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name },
    ]);
  }

  function assignPinToGroup(pinId: string) {
    if (groups.length === 0) {
      alert("Create a group first");
      return;
    }

    const groupNames = groups.map((g) => g.name).join(", ");
    const selected = prompt(`Assign to group: ${groupNames}`);

    const group = groups.find((g) => g.name === selected);
    if (!group) return;

    commit(
      pins.map((p) =>
        p.id === pinId ? { ...p, groupId: group.id } : p
      )
    );
  }

  function handlePinMouseDown(e: React.MouseEvent<HTMLDivElement>, pin: Pin) {
    // Convert mouse position to transformed coordinates
    const mouseX = (e.clientX - offset.x) / scale;
    const mouseY = (e.clientY - offset.y) / scale;
    
    // Calculate offset from pin's position
    setDragInfo({
      pinId: pin.id,
      offsetX: mouseX - pin.x,
      offsetY: mouseY - pin.y,
    });
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!dragInfo) return;

    // Convert mouse position to transformed coordinates
    const mouseX = (e.clientX - offset.x) / scale;
    const mouseY = (e.clientY - offset.y) / scale;

    setHistory((prev) => ({
      ...prev,
      present: prev.present.map((p) =>
        p.id === dragInfo.pinId
          ? {
              ...p,
              x: mouseX - dragInfo.offsetX,
              y: mouseY - dragInfo.offsetY,
            }
          : p
      ),
    }));
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

  function zoomIn() {
    setScale((s) => Math.min(s + 0.1, 3));
  }

  function zoomOut() {
    setScale((s) => Math.max(s - 0.1, 0.3));
  }

  return (
    <div
      className="w-screen h-screen bg-[#faf9f6] relative overflow-hidden"
      onMouseMove={(e) => {
        handleMouseMove(e);
        handleCanvasMouseMove(e);
      }}
      onMouseUp={() => {
        handleMouseUp();
        handleCanvasMouseUp();
      }}
    >
      <Toolbar
        onAddText={addTextPin}
        onAddImageUrl={addImageFromUrl}
        onAddImageFile={() => fileInputRef.current?.click()}
        onAddList={addListPin}
        onAddGroup={addGroup}
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
        onChange={handleLocalImageSelect}
      />

      <BoardCanvas
        pins={pins}
        groups={groups}
        scale={scale}
        offsetX={offset.x}
        offsetY={offset.y}
        onPinMouseDown={handlePinMouseDown}
        onCanvasMouseDown={handleCanvasMouseDown}
        onWheelZoom={handleWheel}
        onDeletePin={deletePin}
        onEditPin={editPin}
        onAddListItem={addListItem}
        onEditListItem={editListItem}
        onDeleteListItem={deleteListItem}
        onRemoveGroupFromPin={removeGroupFromPin}
      />
    </div>
  );
}
