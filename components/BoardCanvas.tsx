import { Group, Pin } from "@/types/pin";
import PinItem from "./PinItem";

type BoardCanvasProps = {
  pins: Pin[];
  groups: Group[];
  scale: number;
  offsetX: number;
  offsetY: number;
  onPinMouseDown: (
    e: React.MouseEvent<HTMLDivElement>,
    pin: Pin
  ) => void;
  onCanvasMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onWheelZoom: (e: React.WheelEvent<HTMLDivElement>) => void;
  onDeletePin: (pinId: string) => void;
  onEditPin: (pin: Pin) => void;
  onAddListItem: (pinId: string) => void;
  onEditListItem: (pinId: string, index: number) => void;
  onDeleteListItem: (pinId: string, index: number) => void;
  onRemoveGroupFromPin: (pinId: string) => void;
};

export default function BoardCanvas({
  pins,
  groups,
  scale,
  offsetX,
  offsetY,
  onPinMouseDown,
  onCanvasMouseDown,
  onWheelZoom,
  onDeletePin,
  onEditPin,
  onAddListItem,
  onEditListItem,
  onDeleteListItem,
  onRemoveGroupFromPin,
}: BoardCanvasProps) {
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#faf9f6]"
      onMouseDown={onCanvasMouseDown}
      onWheel={onWheelZoom}
    >
      {/* transform layer for zoom and pan */}
      <div
        className="absolute top-0 left-0"
        style={{
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
          transformOrigin: "0 0",
          width: "999999px",
          height: "999999px",
        }}
      >
        {pins.map((pin) => (
          <PinItem
            key={pin.id}
            pin={pin}
            groups={groups}
            onMouseDown={(e) => {
              e.stopPropagation(); // stop canvas pan when clicking pin
              onPinMouseDown(e, pin);
            }}
            onDelete={() => onDeletePin(pin.id)}
            onEdit={() => onEditPin(pin)}
            onAddListItem={() => onAddListItem(pin.id)}
            onEditListItem={(index) => onEditListItem(pin.id, index)}
            onDeleteListItem={(index) =>
              onDeleteListItem(pin.id, index)
            }
            onRemoveGroup={() => onRemoveGroupFromPin(pin.id)}
          />
        ))}
      </div>
    </div>
  );
}
