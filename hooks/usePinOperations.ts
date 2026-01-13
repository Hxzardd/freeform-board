import { Pin } from "@/types/pin";

type UsePinOperationsProps = {
  pins: Pin[];
  commit: (newPins: Pin[]) => void;
  getViewportCenter: () => { x: number; y: number };
};

export function usePinOperations({ pins, commit, getViewportCenter }: UsePinOperationsProps) {
  function parseTags(tagInput: string | null): string[] | undefined {
    if (!tagInput) return undefined;
    const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);
    return tags.length > 0 ? tags : undefined;
  }

  function addTextPin() {
    const text = prompt("Enter pin text");
    if (text === null) return;

    const tagInput = prompt("Add tags (comma separated, optional)", "");
    const tags = parseTags(tagInput);
    const center = getViewportCenter();

    commit([
      ...pins,
      {
        id: crypto.randomUUID(),
        x: center.x,
        y: center.y,
        type: "text",
        text: text.trim() || "New Pin",
        tags,
      },
    ]);
  }

  function addImageFromUrl() {
    const url = prompt("Enter image URL");
    if (!url) return;

    const tagInput = prompt("Add tags (comma separated, optional)", "");
    const tags = parseTags(tagInput);
    const center = getViewportCenter();

    commit([
      ...pins,
      {
        id: crypto.randomUUID(),
        x: center.x,
        y: center.y,
        type: "image",
        imageSrc: url,
        tags,
      },
    ]);
  }

  function addListPin() {
    const firstItem = prompt("First list item");
    if (firstItem === null) return;

    const tagInput = prompt("Add tags (comma separated, optional)", "");
    const tags = parseTags(tagInput);
    const center = getViewportCenter();

    commit([
      ...pins,
      {
        id: crypto.randomUUID(),
        x: center.x,
        y: center.y,
        type: "list",
        items: firstItem.trim() ? [firstItem] : [],
        tags,
      },
    ]);
  }

  function handleLocalImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const tagInput = prompt("Add tags (comma separated, optional)", "");
      const tags = parseTags(tagInput);
      const center = getViewportCenter();

      commit([
        ...pins,
        {
          id: crypto.randomUUID(),
          x: center.x,
          y: center.y,
          type: "image",
          imageSrc: reader.result as string,
          tags,
        },
      ]);
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function deletePin(pinId: string) {
    commit(pins.filter((p) => p.id !== pinId));
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

  function editPin(pin: Pin, groups: any[]) {
    let updatedPin = { ...pin };
    let shouldUpdate = false;

    if (pin.type === "text") {
      const newText = prompt("Edit text", pin.text);
      if (newText !== null) {
        updatedPin.text = newText;
        shouldUpdate = true;
      }
    }

    if (pin.type === "image") {
      const newUrl = prompt("Edit image URL", pin.imageSrc);
      if (newUrl !== null) {
        updatedPin.imageSrc = newUrl;
        shouldUpdate = true;
      }
    }

    if (pin.type === "list") {
      const currentItems = pin.items?.join("\n") || "";
      const newItemsText = prompt(
        "Edit list items (one per line):",
        currentItems
      );
      
      if (newItemsText !== null) {
        updatedPin.items = newItemsText
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);
        shouldUpdate = true;
      }
    }

    const tagInput = prompt(
      "Edit tags (comma separated)",
      updatedPin.tags?.join(", ") || ""
    );

    if (tagInput !== null) {
      const tags = tagInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      updatedPin.tags = tags.length > 0 ? tags : undefined;
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      commit(
        pins.map((p) => (p.id === pin.id ? updatedPin : p))
      );
    }

    if (groups.length > 0) {
      const currentPin = pins.find((p) => p.id === pin.id) || updatedPin;
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
              pins.map((p) =>
                p.id === pin.id ? { ...p, groupId: undefined } : p
              )
            );
          } else {
            const group = groups.find((g) => g.name === selected.trim());
            if (group) {
              commit(
                pins.map((p) =>
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

  return {
    addTextPin,
    addImageFromUrl,
    addListPin,
    handleLocalImageSelect,
    deletePin,
    editPin,
    addListItem,
    deleteListItem,
    editListItem,
    removeGroupFromPin,
  };
}

