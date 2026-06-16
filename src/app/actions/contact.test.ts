import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ContactFields } from "@/lib/contact";

const { sendMailMock, headersGetMock } = vi.hoisted(() => ({
  sendMailMock: vi.fn(),
  headersGetMock: vi.fn(),
}));
vi.mock("nodemailer", () => ({
  default: { createTransport: () => ({ sendMail: sendMailMock }) },
}));
vi.mock("next/headers", () => ({
  headers: () => ({ get: headersGetMock }),
}));

import { submitContactForm } from "./contact";

const valid: ContactFields = {
  name: "Jane",
  company: "Acme",
  email: "jane@acme.com",
  phone: "910-555-0100",
  message: "We're running a legacy ERP and it hurts.",
};

beforeEach(() => {
  sendMailMock.mockReset();
  sendMailMock.mockResolvedValue({ messageId: "1" });
  headersGetMock.mockReset();
  headersGetMock.mockReturnValue("203.0.113.1"); // default unique-ish IP
});

describe("submitContactForm", () => {
  it("sends mail and returns ok for a valid submission", async () => {
    headersGetMock.mockReturnValue("203.0.113.10");
    const result = await submitContactForm(valid, "");
    expect(result).toEqual({ ok: true });
    expect(sendMailMock).toHaveBeenCalledOnce();
  });

  it("returns an error and does not send for an invalid submission", async () => {
    headersGetMock.mockReturnValue("203.0.113.11");
    const result = await submitContactForm({ ...valid, email: "" }, "");
    expect(result.ok).toBe(false);
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("silently no-ops (returns ok) without sending when the honeypot is filled", async () => {
    headersGetMock.mockReturnValue("203.0.113.12");
    const result = await submitContactForm(valid, "http://spam.example");
    expect(result).toEqual({ ok: true });
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("rate limits a single IP after the allowed number of submissions", async () => {
    headersGetMock.mockReturnValue("203.0.113.99");

    const r1 = await submitContactForm(valid, "");
    const r2 = await submitContactForm(valid, "");
    const r3 = await submitContactForm(valid, "");
    const r4 = await submitContactForm(valid, "");

    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    expect(r3.ok).toBe(true);
    expect(r4.ok).toBe(false);
    expect(r4.error).toMatch(/too many/i);
    // only the first three were actually sent
    expect(sendMailMock).toHaveBeenCalledTimes(3);
  });

  it("rate limits each IP independently", async () => {
    headersGetMock.mockReturnValue("203.0.113.50");
    await submitContactForm(valid, "");
    await submitContactForm(valid, "");
    await submitContactForm(valid, "");
    const blocked = await submitContactForm(valid, "");
    expect(blocked.ok).toBe(false);

    headersGetMock.mockReturnValue("203.0.113.51");
    const fresh = await submitContactForm(valid, "");
    expect(fresh.ok).toBe(true);
  });
});
