import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImageUpload } from "./ImageUpload";

// Capture the onDrop callback so we can drive uploads directly without
// simulating real drag/drop file input plumbing.
let capturedOnDrop: ((files: File[]) => void | Promise<void>) | undefined;
vi.mock("react-dropzone", () => ({
  useDropzone: ({ onDrop }: { onDrop: (files: File[]) => void }) => {
    capturedOnDrop = onDrop;
    return {
      getRootProps: () => ({}),
      getInputProps: () => ({}),
      isDragActive: false,
    };
  },
}));

const toastError = vi.fn();
vi.mock("sonner", () => ({
  toast: { error: (...args: unknown[]) => toastError(...args) },
}));

// Deterministic FileReader producing a data URL per file.
class MockFileReader {
  result: string | null = null;
  onloadend: (() => void) | null = null;
  readAsDataURL() {
    this.result = "data:image/png;base64,AAA";
    this.onloadend?.();
  }
}

beforeEach(() => {
  capturedOnDrop = undefined;
  toastError.mockClear();
  vi.stubGlobal("FileReader", MockFileReader);
});

describe("ImageUpload", () => {
  it("renders the dropzone prompt when below the limit", () => {
    render(<ImageUpload images={[]} onImagesChange={vi.fn()} />);
    expect(
      screen.getByText("Drag images here or click to select"),
    ).toBeInTheDocument();
  });

  it("renders existing images with a primary badge and count", () => {
    render(
      <ImageUpload
        images={["data:1", "data:2"]}
        onImagesChange={vi.fn()}
      />,
    );
    expect(screen.getAllByRole("img")).toHaveLength(2);
    expect(screen.getByText("Primary")).toBeInTheDocument();
    expect(
      screen.getByText("2 of 10 images. The first image will be the primary one."),
    ).toBeInTheDocument();
  });

  it("appends dropped files as data URLs", async () => {
    const onImagesChange = vi.fn();
    render(<ImageUpload images={[]} onImagesChange={onImagesChange} />);

    const file = new File(["x"], "a.png", { type: "image/png" });
    await act(async () => {
      await capturedOnDrop!([file]);
    });

    expect(onImagesChange).toHaveBeenCalledWith(["data:image/png;base64,AAA"]);
  });

  it("rejects uploads that exceed maxImages", async () => {
    const onImagesChange = vi.fn();
    render(
      <ImageUpload images={["a"]} onImagesChange={onImagesChange} maxImages={1} />,
    );
    // At the limit, the dropzone is hidden, but the captured onDrop still rejects.
    const file = new File(["x"], "b.png", { type: "image/png" });
    await act(async () => {
      await capturedOnDrop!([file]);
    });
    expect(toastError).toHaveBeenCalledWith("Maximum 1 images allowed");
    expect(onImagesChange).not.toHaveBeenCalled();
  });

  it("removes an image when its remove button is clicked", async () => {
    const onImagesChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ImageUpload images={["a", "b"]} onImagesChange={onImagesChange} />,
    );
    await user.click(screen.getAllByTitle("Remove")[0]);
    expect(onImagesChange).toHaveBeenCalledWith(["b"]);
  });

  it("reorders an image to the right", async () => {
    const onImagesChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ImageUpload images={["a", "b"]} onImagesChange={onImagesChange} />,
    );
    await user.click(screen.getByTitle("Move right"));
    expect(onImagesChange).toHaveBeenCalledWith(["b", "a"]);
  });

  it("reorders an image to the left", async () => {
    const onImagesChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ImageUpload images={["a", "b"]} onImagesChange={onImagesChange} />,
    );
    await user.click(screen.getByTitle("Move left"));
    expect(onImagesChange).toHaveBeenCalledWith(["b", "a"]);
  });
});
