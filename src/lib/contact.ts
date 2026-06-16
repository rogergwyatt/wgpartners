export interface ContactFields {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactFields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContactForm(fields: ContactFields): ContactErrors {
  const errors: ContactErrors = {};
  if (!fields.name.trim()) errors.name = "Name is required.";
  if (!fields.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(fields.email)) errors.email = "Enter a valid email.";
  if (!fields.phone.trim()) errors.phone = "Phone is required.";
  if (!fields.message.trim()) errors.message = "Please add a message.";
  return errors;
}

export function formatContactMessage(fields: ContactFields): string {
  return [
    `Name: ${fields.name}`,
    `Company: ${fields.company || "(not provided)"}`,
    `Email: ${fields.email}`,
    `Phone: ${fields.phone}`,
    "",
    "Message:",
    fields.message,
  ].join("\n");
}
