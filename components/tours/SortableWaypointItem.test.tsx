import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { SortableWaypointItem, type WaypointShape } from "./SortableWaypointItem";

const waypoint: WaypointShape = {
  id: "wp-1",
  latitude: -34.603722,
  longitude: -58.381592,
  title: "Cabildo",
  description: "Historic site",
  order: 0,
  placeName: "Cabildo de Buenos Aires",
  placeId: "place-1",
};

function renderItem(props: Partial<React.ComponentProps<typeof SortableWaypointItem>> = {}) {
  const defaults = {
    waypoint,
    index: 0,
    isEditing: false,
    onEdit: vi.fn(),
    onSave: vi.fn(),
    onRemove: vi.fn(),
  };
  const merged = { ...defaults, ...props };
  return {
    ...merged,
    ...render(
      <DndContext>
        <SortableContext items={[merged.waypoint.id]}>
          <SortableWaypointItem {...merged} />
        </SortableContext>
      </DndContext>,
    ),
  };
}

describe("SortableWaypointItem", () => {
  it("renders display mode with title, linked place and coordinates", () => {
    renderItem();
    expect(screen.getByText("Cabildo")).toBeInTheDocument();
    expect(screen.getByText("Linked: Cabildo de Buenos Aires")).toBeInTheDocument();
    expect(screen.getByText("Historic site")).toBeInTheDocument();
    expect(screen.getByText(/-34\.603722/)).toBeInTheDocument();
  });

  it("calls onEdit when the card is clicked in display mode", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    renderItem({ onEdit });
    await user.click(screen.getByText("Cabildo"));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("calls onRemove from display mode without triggering edit", async () => {
    const onRemove = vi.fn();
    const onEdit = vi.fn();
    const user = userEvent.setup();
    renderItem({ onRemove, onEdit });
    await user.click(screen.getByLabelText("Remove stop"));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onEdit).not.toHaveBeenCalled();
  });

  it("renders editable inputs in editing mode and saves edited values", async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    renderItem({ isEditing: true, onSave });

    const titleInput = screen.getByPlaceholderText("Stop name") as HTMLInputElement;
    expect(titleInput.value).toBe("Cabildo");

    await user.clear(titleInput);
    await user.type(titleInput, "New title");
    await user.click(screen.getByText("Save"));

    expect(onSave).toHaveBeenCalledWith("New title", "Historic site");
  });

  it("calls onUnlinkPlace when unlinking in editing mode", async () => {
    const onUnlinkPlace = vi.fn();
    const user = userEvent.setup();
    renderItem({ isEditing: true, onUnlinkPlace });
    await user.click(screen.getByText("Unlink"));
    expect(onUnlinkPlace).toHaveBeenCalledTimes(1);
  });

  it("calls onRemove from editing mode", async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    renderItem({ isEditing: true, onRemove });
    await user.click(screen.getByText("Remove"));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("exposes a drag handle", () => {
    renderItem();
    expect(screen.getByLabelText("Drag to reorder")).toBeInTheDocument();
  });
});
