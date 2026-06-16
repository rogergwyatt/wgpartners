"use server";

import nodemailer from "nodemailer";
import {
  validateContactForm,
  formatContactMessage,
  type ContactFields,
} from "@/lib/contact";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_SERVER_USERNAME,
    pass: process.env.SMTP_SERVER_PASSWORD,
  },
});

export async function submitContactForm(
  fields: ContactFields
): Promise<{ ok: boolean; error?: string }> {
  const errors = validateContactForm(fields);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: "Please complete all required fields." };
  }

  try {
    await transporter.verify();
    await transporter.sendMail({
      from: process.env.SMTP_SERVER_USERNAME,
      replyTo: fields.email,
      to: process.env.SITE_MAIL_RECIEVER || "roger@wgpartners.com",
      subject: `WG Partners inquiry — ${fields.name}${fields.company ? ` (${fields.company})` : ""}`,
      text: formatContactMessage(fields),
    });
    return { ok: true };
  } catch (error) {
    console.error("Contact mail failed:", error);
    return { ok: false, error: "Mail delivery failed." };
  }
}
