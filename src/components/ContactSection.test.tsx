import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import ContactSection from "./ContactSection";

const submitMock = vi.fn();
vi.mock("@/app/actions/contact", () => ({
  submitContactForm: (...args: unknown[]) => submitMock(...args),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

beforeEach(() => {
  submitMock.mockReset();
  vi.mocked(toast.success).mockReset();
  vi.mocked(toast.error).mockReset();
});

function fillValidForm() {
  fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: "Jane" } });
  fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: "jane@acme.com" } });
  fireEvent.change(screen.getByLabelText(/^phone$/i), { target: { value: "910-555-0100" } });
  fireEvent.change(screen.getByLabelText(/^message$/i), { target: { value: "Legacy ERP pain." } });
}

describe("ContactSection", () => {
  it("shows validation errors and does not submit when empty", async () => {
    render(<ContactSection />);
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(submitMock).not.toHaveBeenCalled();
  });

  it("submits, toasts success, and resets when the form is valid", async () => {
    submitMock.mockResolvedValue({ ok: true });
    render(<ContactSection />);
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    await waitFor(() => expect(submitMock).toHaveBeenCalledOnce());
    expect(toast.success).toHaveBeenCalled();
    // form resets on success
    await waitFor(() =>
      expect((screen.getByLabelText(/^name$/i) as HTMLInputElement).value).toBe("")
    );
  });

  it("toasts an error and keeps field values when submission fails", async () => {
    submitMock.mockResolvedValue({ ok: false, error: "Mail delivery failed." });
    render(<ContactSection />);
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect((screen.getByLabelText(/^name$/i) as HTMLInputElement).value).toBe("Jane");
  });
});
