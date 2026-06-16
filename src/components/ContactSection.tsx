"use client";

import { useState } from "react";
import { toast } from "sonner";
import Section from "./Section";
import { validateContactForm, type ContactFields, type ContactErrors } from "@/lib/contact";
import { submitContactForm } from "@/app/actions/contact";

const empty: ContactFields = { name: "", company: "", email: "", phone: "", message: "" };

const fieldClass =
  "block w-full rounded-md border border-slate-300 bg-white p-3 text-sm text-ink focus:border-royal focus:ring-royal";

export default function ContactSection() {
  const [fields, setFields] = useState<ContactFields>(empty);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const update =
    (key: keyof ContactFields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateContactForm(fields);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const result = await submitContactForm(fields);
      if (result.ok) {
        toast.success("Thanks — we'll be in touch shortly.");
        setFields(empty);
      } else {
        toast.error("Couldn't send. Please call us at 910-297-0929.");
      }
    } catch {
      toast.error("Couldn't send. Please call us at 910-297-0929.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Section id="contact" className="bg-mist">
      <p className="font-serif text-sm uppercase tracking-[0.25em] text-royal">
        Contact Us
      </p>
      <h2 className="mt-3 font-serif text-3xl font-bold text-navy lg:text-4xl">
        Tell us what you&rsquo;re running.
      </h2>
      <p className="mt-3 text-slate-600">
        20 minutes. No pitch. Just questions. Or reach us directly at{" "}
        <a href="mailto:roger@wgpartners.com" className="text-royal underline">
          roger@wgpartners.com
        </a>{" "}
        ·{" "}
        <a href="tel:+19102970929" className="text-royal underline">
          910-297-0929
        </a>
        .
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 max-w-2xl space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">Name</label>
          <input id="name" className={fieldClass} value={fields.name} onChange={update("name")} />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="company" className="mb-1 block text-sm font-medium text-ink">Company</label>
          <input id="company" className={fieldClass} value={fields.company} onChange={update("company")} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">Email</label>
          <input id="email" type="email" className={fieldClass} value={fields.email} onChange={update("email")} />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-ink">Phone</label>
          <input id="phone" type="tel" className={fieldClass} value={fields.phone} onChange={update("phone")} />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="message" className="mb-1 block text-sm font-medium text-ink">Message</label>
          <textarea
            id="message"
            rows={5}
            className={fieldClass}
            placeholder="What are you running, and what's it costing you?"
            value={fields.message}
            onChange={update("message")}
          />
          {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-md bg-navy px-6 py-3 text-sm font-semibold text-mist hover:bg-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send message"}
        </button>
      </form>
    </Section>
  );
}
