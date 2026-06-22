import { describe, it, expect, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { render, screen, userEvent } from "@/test-utils/render";
import { DataTable } from "./DataTable";

interface Row {
  id: string;
  name: string;
  age: number;
}

const columns = [
  { key: "name", header: "Name", render: (r: Row) => r.name },
  { key: "age", header: "Age", align: "right" as const, render: (r: Row) => r.age },
];

const data: Row[] = [
  { id: "1", name: "Alice", age: 30 },
  { id: "2", name: "Bob", age: 25 },
];

describe("DataTable", () => {
  it("renders the empty state with the default message", () => {
    render(
      <DataTable<Row> columns={columns} data={[]} keyExtractor={(r) => r.id} />,
    );
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders a custom empty message", () => {
    render(
      <DataTable<Row>
        columns={columns}
        data={[]}
        keyExtractor={(r) => r.id}
        emptyMessage="Nothing here"
      />,
    );
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("renders headers and rows", () => {
    render(
      <DataTable<Row> columns={columns} data={data} keyExtractor={(r) => r.id} />,
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("calls onRowClick with the clicked item", async () => {
    const onRowClick = vi.fn();
    render(
      <DataTable<Row>
        columns={columns}
        data={data}
        keyExtractor={(r) => r.id}
        onRowClick={onRowClick}
      />,
    );
    await userEvent.click(screen.getByText("Alice"));
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });

  it("toggles row hover background on mouse enter/leave", () => {
    render(
      <DataTable<Row> columns={columns} data={data} keyExtractor={(r) => r.id} />,
    );
    const row = screen.getByText("Alice").closest("tr")!;
    fireEvent.mouseEnter(row);
    expect(row).toHaveStyle({ backgroundColor: "var(--color-section-bg)" });
    fireEvent.mouseLeave(row);
    expect(row.style.backgroundColor).toBe("transparent");
  });
});
