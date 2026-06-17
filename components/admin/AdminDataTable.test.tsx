import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test-utils/render";
import { AdminDataTable, type AdminColumn } from "./AdminDataTable";

interface Row {
  id: string;
  name: string;
}

const columns: AdminColumn<Row>[] = [
  {
    key: "name",
    header: "Name",
    sortable: true,
    sortKey: "name",
    render: (r) => r.name,
  },
  { key: "id", header: "ID", render: (r) => r.id },
];

const data: Row[] = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
];

const key = (r: Row) => r.id;

describe("AdminDataTable", () => {
  it("renders a loading spinner when loading", () => {
    const { container } = render(
      <AdminDataTable<Row>
        columns={columns}
        data={[]}
        keyExtractor={key}
        loading
      />,
    );
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders the empty message when there is no data", () => {
    render(
      <AdminDataTable<Row>
        columns={columns}
        data={[]}
        keyExtractor={key}
        emptyMessage="Nothing"
      />,
    );
    expect(screen.getByText("Nothing")).toBeInTheDocument();
  });

  it("renders headers and rows", () => {
    render(
      <AdminDataTable<Row> columns={columns} data={data} keyExtractor={key} />,
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("renders a search box when onSearchChange is provided", () => {
    render(
      <AdminDataTable<Row>
        columns={columns}
        data={data}
        keyExtractor={key}
        onSearchChange={vi.fn()}
        searchPlaceholder="Search rows"
      />,
    );
    expect(screen.getByPlaceholderText("Search rows")).toBeInTheDocument();
  });

  it("renders toolbar filters and actions", () => {
    render(
      <AdminDataTable<Row>
        columns={columns}
        data={data}
        keyExtractor={key}
        filters={<span>my-filter</span>}
        toolbarActions={<button>Export</button>}
      />,
    );
    expect(screen.getByText("my-filter")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
  });

  it("calls onRowClick with the clicked item", async () => {
    const onRowClick = vi.fn();
    render(
      <AdminDataTable<Row>
        columns={columns}
        data={data}
        keyExtractor={key}
        onRowClick={onRowClick}
      />,
    );
    await userEvent.click(screen.getByText("Alice"));
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });

  it("toggles sort direction on a sortable header", async () => {
    const onSortChange = vi.fn();
    const { rerender } = render(
      <AdminDataTable<Row>
        columns={columns}
        data={data}
        keyExtractor={key}
        onSortChange={onSortChange}
      />,
    );
    // not currently sorted -> first click asc
    await userEvent.click(screen.getByText("Name"));
    expect(onSortChange).toHaveBeenCalledWith("name", "asc");

    // already sorted asc on this key -> next click desc
    rerender(
      <AdminDataTable<Row>
        columns={columns}
        data={data}
        keyExtractor={key}
        onSortChange={onSortChange}
        sortKey="name"
        sortDirection="asc"
      />,
    );
    await userEvent.click(screen.getByText("Name"));
    expect(onSortChange).toHaveBeenCalledWith("name", "desc");
  });

  it("selects and deselects all via the header checkbox", async () => {
    const onSelectionChange = vi.fn();
    render(
      <AdminDataTable<Row>
        columns={columns}
        data={data}
        keyExtractor={key}
        selectable
        selectedIds={new Set()}
        onSelectionChange={onSelectionChange}
      />,
    );
    const checkboxes = screen.getAllByRole("checkbox");
    await userEvent.click(checkboxes[0]); // header -> select all
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["1", "2"]));
  });

  it("clears all when the header checkbox is toggled off while all selected", async () => {
    const onSelectionChange = vi.fn();
    render(
      <AdminDataTable<Row>
        columns={columns}
        data={data}
        keyExtractor={key}
        selectable
        selectedIds={new Set(["1", "2"])}
        onSelectionChange={onSelectionChange}
      />,
    );
    const checkboxes = screen.getAllByRole("checkbox");
    await userEvent.click(checkboxes[0]); // header -> deselect all
    expect(onSelectionChange).toHaveBeenCalledWith(new Set());
  });

  it("toggles a single row selection and shows the selection bar", async () => {
    const onSelectionChange = vi.fn();
    render(
      <AdminDataTable<Row>
        columns={columns}
        data={data}
        keyExtractor={key}
        selectable
        selectedIds={new Set(["1"])}
        onSelectionChange={onSelectionChange}
      />,
    );
    expect(screen.getByText("1 selected")).toBeInTheDocument();
    const checkboxes = screen.getAllByRole("checkbox");
    // row checkbox for Alice (already selected) -> deselect
    await userEvent.click(checkboxes[1]);
    expect(onSelectionChange).toHaveBeenCalledWith(new Set());
    // adding Bob's row
    await userEvent.click(checkboxes[2]);
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["1", "2"]));
  });

  it("clears selection from the selection bar button", async () => {
    const onSelectionChange = vi.fn();
    render(
      <AdminDataTable<Row>
        columns={columns}
        data={data}
        keyExtractor={key}
        selectable
        selectedIds={new Set(["1"])}
        onSelectionChange={onSelectionChange}
      />,
    );
    await userEvent.click(screen.getByText("Clear selection"));
    expect(onSelectionChange).toHaveBeenCalledWith(new Set());
  });

  it("renders pagination when onPageChange and totalCount are provided", () => {
    render(
      <AdminDataTable<Row>
        columns={columns}
        data={data}
        keyExtractor={key}
        page={1}
        pageSize={10}
        totalCount={2}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
  });
});
