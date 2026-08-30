import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ArrayField,
  ConfirmDialog,
  FormField,
  MediaPicker,
  SaveBar,
  SortableList,
  StatusSelect,
  TextArea,
  TextInput,
} from "@/components/admin";

const toast = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));

vi.mock("sonner", () => ({
  Toaster: () => null,
  toast,
}));

describe("admin form primitives", () => {
  beforeEach(() => {
    toast.error.mockReset();
    toast.success.mockReset();
  });

  it("connects labels, descriptions, and server field errors to a control", () => {
    render(
      <FormField
        id="title"
        name="title"
        label="Title"
        description="Shown on the project page."
        fieldErrors={{ title: ["A title is required."] }}
      >
        <TextInput placeholder="Project title" />
      </FormField>,
    );

    const input = screen.getByRole("textbox", { name: "Title" });
    expect(input).toHaveAttribute("id", "title");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "title-description title-error");
    expect(screen.getByRole("alert")).toHaveTextContent("A title is required.");
  });

  it("updates and removes array values while respecting the minimum", async () => {
    const user = userEvent.setup();

    function ArrayFieldHarness() {
      const [values, setValues] = useState(["Residential"]);
      return (
        <ArrayField
          id="project-types"
          name="projectTypes"
          label="Project types"
          value={values}
          onChange={setValues}
          minItems={1}
        />
      );
    }

    render(<ArrayFieldHarness />);
    const input = screen.getByRole("textbox", { name: "Item 1" });

    await user.clear(input);
    await user.type(input, "Hospitality");
    expect(input).toHaveValue("Hospitality");

    expect(screen.getByRole("button", { name: "Remove item 1" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Add item" }));
    expect(screen.getByRole("textbox", { name: "Item 2" })).toBeInTheDocument();
  });

  it("renders status options and reports value changes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <FormField id="status" label="Status">
        <StatusSelect
          aria-label="Status"
          value="draft"
          onValueChange={onValueChange}
          options={[
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
          ]}
        />
      </FormField>,
    );

    await user.selectOptions(screen.getByRole("combobox", { name: "Status" }), "published");
    expect(onValueChange).toHaveBeenCalledWith("published", expect.anything());
  });

  it("keeps media selection as a stable placeholder contract", () => {
    render(
      <MediaPicker
        id="hero-media"
        value={null}
        onChange={vi.fn()}
        description="Choose the lead image when the media library is connected."
      />,
    );

    expect(screen.getByRole("group", { name: "Media" })).toHaveTextContent(
      "No media selected yet.",
    );
    expect(screen.getByText("Media library pending")).toBeInTheDocument();
  });
});

describe("admin editing actions", () => {
  it("requires an explicit confirmation before running a destructive action", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        open
        title="Delete project?"
        description="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce());
  });

  it("shows action result feedback through Sonner", async () => {
    const { rerender } = render(<SaveBar actionResult={null} />);

    rerender(<SaveBar actionResult={{ ok: true, message: "Project saved." }} />);
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Project saved."));

    rerender(<SaveBar actionResult={{ ok: false, formError: "Could not save project." }} />);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Could not save project."));
  });

  it("exposes a keyboard-operable drag handle contract", () => {
    render(
      <SortableList
        ariaLabel="Project order"
        items={[
          { id: "one", title: "One" },
          { id: "two", title: "Two" },
        ]}
        getItemId={(item) => item.id}
        onReorder={vi.fn()}
        renderItem={(item, helpers) => (
          <div>
            <button
              type="button"
              ref={helpers.setActivatorNodeRef}
              {...helpers.attributes}
              {...helpers.listeners}
            >
              Move {item.title}
            </button>
          </div>
        )}
      />,
    );

    const handle = screen.getByRole("button", { name: "Move One" });
    expect(handle).toHaveAttribute("aria-roledescription", "sortable");
    expect(handle).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("list", { name: "Project order" })).toBeInTheDocument();
  });

  it("renders a text area with the same field error contract", () => {
    render(
      <FormField id="description" name="description" label="Description" errors={["Too short."]}>
        <TextArea />
      </FormField>,
    );

    expect(screen.getByRole("textbox", { name: "Description" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Too short.");
  });
});
