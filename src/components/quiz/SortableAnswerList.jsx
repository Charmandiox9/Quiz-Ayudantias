import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";

export default function SortableAnswerList({
  items,
  renderItem,
  onChange,
  disabled = false,
  isCorrectPosition = () => false,
  label = "Elementos para ordenar",
}) {
  const dragRef = useRef(null);
  const [draggingItem, setDraggingItem] = useState(null);
  const [announcement, setAnnouncement] = useState("");

  const moveItem = (fromIndex, toIndex) => {
    if (disabled || fromIndex === toIndex || toIndex < 0 || toIndex >= items.length) return;
    const next = [...items];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    onChange(next);
    setAnnouncement(`Elemento ${fromIndex + 1} movido a la posición ${toIndex + 1} de ${items.length}.`);
  };

  const handlePointerDown = (event, item) => {
    if (disabled || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, item };
    setDraggingItem(item);
  };

  const handlePointerMove = (event) => {
    const activeDrag = dragRef.current;
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;

    const targetRow = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-sortable-item]");
    if (!targetRow) return;
    const fromIndex = items.indexOf(activeDrag.item);
    const toIndex = items.findIndex((item) => String(item) === targetRow.dataset.sortableItem);
    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) moveItem(fromIndex, toIndex);
  };

  const finishDrag = (event) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDraggingItem(null);
  };

  return (
    <div className="sortable-answer-list" role="list" aria-label={label}>
      {items.map((item, index) => (
        <div
          key={item}
          data-sortable-item={item}
          role="listitem"
          className={`sortable-answer-row${draggingItem === item ? " is-dragging" : ""}${disabled ? " is-disabled" : ""}`}
          style={{
            background: isCorrectPosition(item, index) ? "var(--color-success-bg)" : "var(--color-surface)",
          }}
        >
          <span className="sortable-answer-position" aria-hidden="true">{index + 1}</span>
          <div className="sortable-answer-content">{renderItem(item, index)}</div>
          {!disabled && <>
            <span
              className="sortable-answer-drag-handle"
              aria-hidden="true"
              title="Arrastrar para reordenar"
              onPointerDown={(event) => handlePointerDown(event, item)}
              onPointerMove={handlePointerMove}
              onPointerUp={finishDrag}
              onPointerCancel={finishDrag}
              onLostPointerCapture={finishDrag}
            >
              <GripVertical size={19} />
            </span>
            <div className="sortable-answer-controls">
              <button type="button" aria-label={`Mover elemento ${index + 1} hacia arriba`} disabled={index === 0} onClick={() => moveItem(index, index - 1)}><ArrowUp size={17} /></button>
              <button type="button" aria-label={`Mover elemento ${index + 1} hacia abajo`} disabled={index === items.length - 1} onClick={() => moveItem(index, index + 1)}><ArrowDown size={17} /></button>
            </div>
          </>}
        </div>
      ))}
      {!disabled && <span className="sr-only" role="status" aria-live="polite">{announcement}</span>}
    </div>
  );
}
