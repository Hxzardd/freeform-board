import { Group, Pin } from "@/types/pin";

type UseGroupOperationsProps = {
  groups: Group[];
  pins: Pin[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  commit: (newPins: Pin[]) => void;
};

export function useGroupOperations({ groups, pins, setGroups, commit }: UseGroupOperationsProps) {
  function addGroup() {
    const name = prompt("Group name");
    if (!name?.trim()) return;

    const trimmedName = name.trim();
    const existingGroup = groups.find((g) => g.name.toLowerCase() === trimmedName.toLowerCase());
    if (existingGroup) {
      alert(`Group "${trimmedName}" already exists`);
      return;
    }

    setGroups((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: trimmedName },
    ]);
  }

  function deleteGroup() {
    if (groups.length === 0) {
      alert("No groups to delete");
      return;
    }

    const groupNames = groups.map((g) => g.name).join(", ");
    const selected = prompt(`Enter group name to delete:\n${groupNames}`);
    if (!selected) return;

    const group = groups.find((g) => g.name === selected.trim());
    if (!group) {
      alert("Group not found");
      return;
    }

    if (confirm(`Delete group "${group.name}"? This will remove it from all pins.`)) {
      setGroups((prev) => prev.filter((g) => g.id !== group.id));
      commit(
        pins.map((p) => (p.groupId === group.id ? { ...p, groupId: undefined } : p))
      );
    }
  }

  function editGroup() {
    if (groups.length === 0) {
      alert("No groups to edit");
      return;
    }

    const groupNames = groups.map((g) => g.name).join(", ");
    const selected = prompt(`Enter group name to edit:\n${groupNames}`);
    if (!selected) return;

    const group = groups.find((g) => g.name === selected.trim());
    if (!group) {
      alert("Group not found");
      return;
    }

    const newName = prompt("Enter new group name", group.name);
    if (!newName?.trim()) return;

    const trimmedName = newName.trim();
    const existingGroup = groups.find(
      (g) => g.id !== group.id && g.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existingGroup) {
      alert(`Group "${trimmedName}" already exists`);
      return;
    }

    setGroups((prev) =>
      prev.map((g) => (g.id === group.id ? { ...g, name: trimmedName } : g))
    );
  }

  function manageGroups() {
    const options = ["1. Create Group", "2. Edit Group", "3. Delete Group"].join("\n");
    const choice = prompt(`Manage Groups:\n${options}\n\nEnter 1, 2, or 3:`);
    
    if (choice === "1") {
      addGroup();
    } else if (choice === "2") {
      editGroup();
    } else if (choice === "3") {
      deleteGroup();
    }
  }

  return {
    addGroup,
    deleteGroup,
    editGroup,
    manageGroups,
  };
}

