export type Pin = {
  id: string;
  x: number;
  y: number;
  type: "text" | "image" | "list";
  text?: string;
  imageSrc?: string;
  items?: string[];
  tags?: string[];
  groupId?: string;
};

export type Group = {
  id: string;
  name: string;
};

export type DragInfo = {
  pinId: string;
  offsetX: number;
  offsetY: number;
} | null;

export type HistoryState = {
  past: Pin[][];
  present: Pin[];
  future: Pin[][];
};
  