import { describe, it, expect } from "vitest";
import { validateContactForm, formatContactMessage } from "./contact";

const valid = {
  name: "Jane CTO",
  company: "Acme",
  email: "jane@acme.com",
  phone: "910-555-0100",
  message: "We pay $200k/yr for a legacy ERP module.",
};

describe("validateContactForm", () => {
  it("passes for a complete, valid submission", () => {
    expect(validateContactForm(valid)).toEqual({});
  });

  it("flags blank required fields", () => {
    const errors = validateContactForm({ name: "", company: "", email: "", phone: "", message: "" });
    expect(errors.name).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.phone).toBeTruthy();
    expect(errors.message).toBeTruthy();
  });

  it("flags an invalid email", () => {
    const errors = validateContactForm({ ...valid, email: "not-an-email" });
    expect(errors.email).toBeTruthy();
  });

  it("does not require company", () => {
    const errors = validateContactForm({ ...valid, company: "" });
    expect(errors.company).toBeUndefined();
  });
});

describe("formatContactMessage", () => {
  it("includes all fields in the body", () => {
    const body = formatContactMessage(valid);
    expect(body).toContain("Jane CTO");
    expect(body).toContain("Acme");
    expect(body).toContain("jane@acme.com");
    expect(body).toContain("910-555-0100");
    expect(body).toContain("legacy ERP");
  });
});
