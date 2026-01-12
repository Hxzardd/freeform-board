import { Group, Pin } from "@/types/pin";

type PinItemProps = {
  pin: Pin;
  groups: Group[];
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDelete: () => void;
  onEdit: () => void;
  onAddListItem: () => void;
  onEditListItem: (index: number) => void;
  onDeleteListItem: (index: number) => void;
  onRemoveGroup?: () => void;
};

export default function PinItem({
  pin,
  groups,
  onMouseDown,
  onDelete,
  onEdit,
  onAddListItem,
  onEditListItem,
  onDeleteListItem,
  onRemoveGroup,
}: PinItemProps) {
  // find the group this pin belongs to
  const group = groups.find((g) => g.id === pin.groupId);
  
  // different colors for different pin types
  const pinBgClass = 
    pin.type === "text" 
      ? "bg-[#fef9c3]" 
      : pin.type === "image" 
      ? "bg-white" 
      : "bg-[#f5f5f0]";
  
  // border colors
  const pinBorderClass = 
    pin.type === "text"
      ? "border-[#e8d68a]"
      : pin.type === "image"
      ? "border-gray-300"
      : "border-gray-300";

  return (
    <div
      onMouseDown={onMouseDown}
      className={`absolute ${pinBgClass} border ${pinBorderClass} rounded-xl shadow-sm p-4 cursor-move select-none group min-w-[180px] max-w-[280px]`}
      style={{
        left: pin.x,
        top: pin.y,
        width: pin.type === "image" ? "auto" : "auto",
      }}
    >
      {/* edit and delete buttons (show on hover) */}
      <div className="absolute -top-1.5 -right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="w-5 h-5 bg-blue-500 hover:bg-blue-600 text-white text-[10px] rounded-full shadow-sm flex items-center justify-center transition-colors"
        >
          ✎
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-5 h-5 bg-red-500 hover:bg-red-600 text-white text-[10px] rounded-full shadow-sm flex items-center justify-center transition-colors"
        >
          ✕
        </button>
      </div>

      {/* text pin content */}
      {pin.type === "text" && (
        <p className="text-[15px] text-gray-800 leading-relaxed">{pin.text}</p>
      )}

      {/* image pin content */}
      {pin.type === "image" && (
        <div className="rounded-lg overflow-hidden">
          <img
            src={pin.imageSrc}
            alt="pin"
            className="max-w-[240px] max-h-64 rounded-lg"
            draggable={false}
          />
        </div>
      )}

      {/* list pin content */}
      {pin.type === "list" && (
        <div className="flex flex-col gap-2">
          <h4 className="text-[14px] text-gray-700 font-medium">List</h4>

          <ul className="list-disc pl-5 text-[14px] text-gray-800 leading-relaxed space-y-1">
            {pin.items?.map((item, idx) => (
              <li key={idx} className="flex justify-between gap-2 items-start">
                <span className="flex-1">{item}</span>
                <div className="flex gap-1 mt-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditListItem(idx);
                    }}
                    className="text-[11px] text-blue-500 hover:text-blue-600 transition-colors"
                    title="Edit item"
                  >
                    ✎
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteListItem(idx);
                    }}
                    className="text-[11px] text-red-500 hover:text-red-600 transition-colors"
                    title="Delete item"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddListItem();
            }}
            className="mt-1 text-[12px] text-blue-600 hover:text-blue-700 transition-colors"
          >
            + Add item
          </button>
        </div>
      )}

      {/* show tags if pin has any */}
      {pin.tags && Array.isArray(pin.tags) && pin.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-300/50">
          {pin.tags.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-300/60"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* show group name if pin is in a group */}
      {group && (
        <div className="text-[11px] text-blue-600 mt-2 flex items-center gap-2">
          <span>Group: {group.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Remove "${group.name}" from this pin?`)) {
                // parent handles the removal
                onRemoveGroup?.();
              }
            }}
            className="text-[11px] text-red-500 hover:text-red-600 transition-colors"
            title="Remove group"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
