import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContactSection from "./ContactSection";

const submitMock = vi.fn();
vi.mock("@/app/actions/contact", () => ({
  submitContactForm: (...args: unknown[]) => submitMock(...args),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

beforeEach(() => submitMock.mockReset());

describe("ContactSection", () => {
  it("shows validation errors and does not submit when empty", async () => {
    render(<ContactSection />);
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(submitMock).not.toHaveBeenCalled();
  });

  it("submits when the form is valid", async () => {
    submitMock.mockResolvedValue({ ok: true });
    render(<ContactSection />);
    fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: "Jane" } });
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: "jane@acme.com" } });
    fireEvent.change(screen.getByLabelText(/^phone$/i), { target: { value: "910-555-0100" } });
    fireEvent.change(screen.getByLabelText(/^message$/i), { target: { value: "Legacy ERP pain." } });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    await waitFor(() => expect(submitMock).toHaveBeenCalledOnce());
  });
});
