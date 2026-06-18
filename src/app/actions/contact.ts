"use server";

import nodemailer from "nodemailer";
import { headers } from "next/headers";
import {
  validateContactForm,
  formatContactMessage,
  type ContactFields,
} from "@/lib/contact";

// SMTP_SERVER_HOST must be a bare mail-server hostname (e.g. "mail.wgaipartners.com"),
// NOT a website URL. Strip any accidental scheme/path/whitespace so a pasted value
// like "https://wgaipartners.com/" still resolves.
const SMTP_HOST = process.env.SMTP_SERVER_HOST?.trim()
  .replace(/^https?:\/\//i, "")
  .replace(/\/.*$/, "");

// Port 465 = implicit TLS (secure). 587/25 = STARTTLS (secure:false, upgraded).
const SMTP_PORT = Number(process.env.SMTP_SERVER_PORT) || 465;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: process.env.SMTP_SERVER_USERNAME,
    pass: process.env.SMTP_SERVER_PASSWORD,
  },
});

// Lightweight, dependency-free per-IP rate limiting. State lives in process
// memory, so it resets on deploy and is per-instance — good enough to blunt a
// bot loop against the SMTP quota without an external store like Upstash.
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const submissions = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (submissions.get(ip) ?? []).filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS
  );
  if (recent.length >= RATE_LIMIT_MAX) {
    submissions.set(ip, recent);
    return true;
  }
  recent.push(now);
  submissions.set(ip, recent);
  return false;
}

export async function submitContactForm(
  fields: ContactFields,
  honeypot?: string
): Promise<{ ok: boolean; error?: string }> {
  // Honeypot: a hidden field no human fills. If it has a value, a bot did —
  // pretend success and send nothing so the bot has no signal to adapt.
  if (honeypot && honeypot.trim().length > 0) {
    return { ok: true };
  }

  const errors = validateContactForm(fields);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: "Please complete all required fields." };
  }

  const ip =
    headers().get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return {
      ok: false,
      error:
        "Too many submissions. Please try again in a few minutes, or call us at 910-297-0929.",
    };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_SERVER_USERNAME,
      replyTo: fields.email,
      to:
        process.env.SITE_MAIL_RECEIVER ||
        process.env.SITE_MAIL_RECIEVER ||
        "roger@wgaipartners.com",
      subject: `WG AI Partners inquiry — ${fields.name}${fields.company ? ` (${fields.company})` : ""}`,
      text: formatContactMessage(fields),
    });
    return { ok: true };
  } catch (error) {
    console.error("Contact mail failed:", error);
    return { ok: false, error: "Mail delivery failed." };
  }
}
