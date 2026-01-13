import { useEffect, useState } from "react";
import { HistoryState, Pin } from "@/types/pin";

const STORAGE_KEY = "freeform-board-history";

export function usePins() {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: [],
    future: [],
  });

  const pins = history.present;

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

  function updatePins(updater: (pins: Pin[]) => Pin[]) {
    setHistory((prev) => ({
      ...prev,
      present: updater(prev.present),
    }));
  }

  function undo() {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }

  function redo() {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0];
      const newFuture = prev.future.slice(1);
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  }

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return { pins, history, commit, updatePins, setHistory, undo, redo, canUndo, canRedo };
}

