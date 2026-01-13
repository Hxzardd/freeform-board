import { useEffect, useState } from "react";
import { Group } from "@/types/pin";

const GROUPS_STORAGE_KEY = "freeform-board-groups";

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);

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

  return { groups, setGroups };
}

