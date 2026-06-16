# Custom Order AI Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the custom-order form with a chat-first experience where a customer describes their board to Claude, generates a written summary + an Imagen preview image, and submits with contact info only — storing summary, image, and transcript on the order and including them in the owner email and admin view.

**Architecture:** A rewritten client `/custom-order` page drives a chat against a new `/api/custom-order/chat` endpoint (Anthropic SDK). A `/api/custom-order/preview` endpoint asks Claude for `{summary, imagePrompt}`, renders the image via the Gemini Imagen REST API, stores it in Vercel Blob, and returns the URL. The existing `/api/custom-order` POST is extended to persist three new nullable columns and surface them in emails and the admin Custom Orders page.

**Tech Stack:** Next.js 14 App Router, TypeScript, Supabase, Vercel Blob, `@anthropic-ai/sdk`, Gemini Imagen REST API, nodemailer.

**Verification note:** This project has no unit-test runner. Consistent with the existing workflow, each task is verified with `npx tsc --noEmit`, `rm -rf build .next && npx next build`, and `curl` against the dev server where an endpoint is involved. Keep this convention; do not add a test framework.

**Environment prerequisites (owner adds in Vercel, all environments):**
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- (`BLOB_READ_WRITE_TOKEN` already present.)
For local testing, these must be in `.env.local`.

---

### Task 1: Schema migration + dependency

**Files:**
- Modify: `src/lib/supabase-schema.sql`
- Modify: `package.json` (via npm)

- [ ] **Step 1: Append the migration to the schema file**

Find the `custom_orders` table definition in `src/lib/supabase-schema.sql`. At the END of the file (after the last statement), add:

```sql
-- Custom-order AI chat: summary, generated preview image, and transcript.
alter table custom_orders add column if not exists ai_summary text;
alter table custom_orders add column if not exists ai_image_url text;
alter table custom_orders add column if not exists chat_transcript jsonb;
```

- [ ] **Step 2: Install the Anthropic SDK**

Run: `npm install @anthropic-ai/sdk`
Expected: adds `@anthropic-ai/sdk` to `dependencies`, no peer-dep errors.

- [ ] **Step 3: Verify typecheck still passes**

Run: `npx tsc --noEmit`
Expected: no output (success).

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase-schema.sql package.json package-lock.json
git commit -m "Custom-order AI: schema columns + Anthropic SDK"
```

**NOTE:** The owner must run the three `alter table` statements in Supabase before the feature works end-to-end. Flag this in the final handoff.

---

### Task 2: AI helper library (Claude + Imagen)

**Files:**
- Create: `src/lib/customOrderAI.ts`

This module isolates all AI calls so the route handlers stay thin. One responsibility: turn a conversation into (a) a chat reply, (b) a `{summary, imagePrompt}`, and (c) a rendered image.

- [ ] **Step 1: Create the helper module**

Create `src/lib/customOrderAI.ts`:

```ts
import Anthropic from '@anthropic-ai/sdk'

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

const CLAUDE_MODEL = 'claude-sonnet-4-5-20250929'

// Guards against abusive payloads on public endpoints.
export const MAX_MESSAGES = 30
export const MAX_CONTENT_CHARS = 4000

function anthropic(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

const CONCIERGE_SYSTEM = `You are the design assistant for Roger & Sally, a Virginia maker of handcrafted Heritage Lock hardwood cutting and charcuterie boards. Brand voice: warm, understated, expert; the wood is the star, not flashy glue-up patterns.

Your job: help the customer describe the board they want for a custom order. Ask about, ONE topic at a time, in a natural order: intended use/occasion, wood species (we work in Walnut, Cherry, Maple), approximate size, thickness, juice groove, engraving (text or graphic), budget, and timeline. Keep every reply short (1-3 sentences). Do not invent prices or commit to anything. When you have enough to picture the board, gently suggest they click "Generate preview".`

// Sanitize and clamp an incoming message list.
export function clampMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages
    .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_MESSAGES)
    .map(m => ({ role: m.role, content: m.content.slice(0, MAX_CONTENT_CHARS) }))
}

// A single conversational reply from the concierge.
export async function chatReply(messages: ChatMessage[]): Promise<string> {
  const res = await anthropic().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 400,
    system: CONCIERGE_SYSTEM,
    messages: clampMessages(messages),
  })
  const text = res.content.find(b => b.type === 'text')
  return text && 'text' in text ? text.text : ''
}

export type PreviewSpec = { summary: string; imagePrompt: string }

// Ask Claude to summarize the conversation and craft an image prompt.
// Robust to non-JSON: falls back to using the raw text as the summary.
export async function buildPreviewSpec(messages: ChatMessage[]): Promise<PreviewSpec> {
  const res = await anthropic().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 600,
    system: `Summarize the customer's desired cutting/charcuterie board from the conversation. Respond ONLY with minified JSON of the form {"summary": string, "imagePrompt": string}. "summary" is a tidy 2-4 sentence description of the board (wood, size, thickness, juice groove, engraving, intended use). "imagePrompt" describes a single photorealistic product photo of THAT board resting on a neutral light kitchen counter, soft daylight, no text overlay, no people — include wood species, shape, dimensions, and any engraving.`,
    messages: clampMessages(messages),
  })
  const block = res.content.find(b => b.type === 'text')
  const raw = block && 'text' in block ? block.text.trim() : ''
  try {
    const jsonStart = raw.indexOf('{')
    const jsonEnd = raw.lastIndexOf('}')
    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1))
    if (parsed.summary && parsed.imagePrompt) {
      return { summary: String(parsed.summary), imagePrompt: String(parsed.imagePrompt) }
    }
  } catch {
    // fall through
  }
  return {
    summary: raw || 'Custom board (see conversation).',
    imagePrompt: `A photorealistic handcrafted hardwood cutting board on a neutral light kitchen counter, soft daylight, no text. ${raw.slice(0, 500)}`,
  }
}

// Render an image via the Gemini Imagen REST API; returns a base64 PNG (no data: prefix).
// Throws on failure so the caller can degrade gracefully.
export async function generateImageBase64(imagePrompt: string): Promise<string> {
  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY ?? '',
    },
    body: JSON.stringify({
      instances: [{ prompt: imagePrompt }],
      parameters: { sampleCount: 1, aspectRatio: '4:3' },
    }),
  })
  if (!res.ok) {
    throw new Error(`Imagen error ${res.status}: ${await res.text()}`)
  }
  const data = await res.json()
  const b64 = data?.predictions?.[0]?.bytesBase64Encoded
  if (!b64) throw new Error('Imagen returned no image')
  return b64
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no output. (If `@anthropic-ai/sdk` block-type narrowing errors appear, confirm the `.find(b => b.type === 'text')` + `'text' in text` guards are present exactly as above.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/customOrderAI.ts
git commit -m "Custom-order AI: Claude + Imagen helper library"
```

---

### Task 3: Chat endpoint

**Files:**
- Create: `src/app/api/custom-order/chat/route.tsx`

- [ ] **Step 1: Create the route**

Create `src/app/api/custom-order/chat/route.tsx`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { chatReply, MAX_MESSAGES, type ChatMessage } from '@/lib/customOrderAI'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] }
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages' }, { status: 400 })
    }
    if (messages.length > MAX_MESSAGES) {
      return NextResponse.json({ error: 'Conversation too long' }, { status: 400 })
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Chat is not configured.' }, { status: 503 })
    }
    const reply = await chatReply(messages)
    return NextResponse.json({ reply })
  } catch (err: any) {
    console.error('custom-order chat error:', err.message)
    return NextResponse.json({ error: 'Chat failed. Please try again.' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no output.

- [ ] **Step 3: Manual smoke test (requires ANTHROPIC_API_KEY in .env.local)**

Start dev server in another terminal: `npm run dev`
Run:
```bash
curl -s localhost:3000/api/custom-order/chat -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"I want a walnut board for my dad"}]}'
```
Expected: JSON `{"reply":"..."}` with a short concierge question. (If `ANTHROPIC_API_KEY` is absent, expect `{"error":"Chat is not configured."}` and HTTP 503 — acceptable until the key is added.)

- [ ] **Step 4: Commit**

```bash
git add src/app/api/custom-order/chat/route.tsx
git commit -m "Custom-order AI: chat endpoint"
```

---

### Task 4: Preview endpoint (summary + image)

**Files:**
- Create: `src/app/api/custom-order/preview/route.tsx`

- [ ] **Step 1: Create the route**

Create `src/app/api/custom-order/preview/route.tsx`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import {
  buildPreviewSpec,
  generateImageBase64,
  MAX_MESSAGES,
  type ChatMessage,
} from '@/lib/customOrderAI'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] }
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages' }, { status: 400 })
    }
    if (messages.length > MAX_MESSAGES) {
      return NextResponse.json({ error: 'Conversation too long' }, { status: 400 })
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Preview is not configured.' }, { status: 503 })
    }

    const spec = await buildPreviewSpec(messages)

    // Image is best-effort: never block the summary on a render failure.
    let imageUrl: string | null = null
    let imageError = false
    try {
      const b64 = await generateImageBase64(spec.imagePrompt)
      const bytes = Buffer.from(b64, 'base64')
      const blob = await put(`custom-order-preview-${Date.now()}.png`, bytes, {
        access: 'public',
        addRandomSuffix: true,
        contentType: 'image/png',
      })
      imageUrl = blob.url
    } catch (imgErr: any) {
      console.error('preview image error:', imgErr.message)
      imageError = true
    }

    return NextResponse.json({ summary: spec.summary, imageUrl, imageError })
  } catch (err: any) {
    console.error('custom-order preview error:', err.message)
    return NextResponse.json({ error: 'Preview failed. Please try again.' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no output.

- [ ] **Step 3: Manual smoke test (requires ANTHROPIC_API_KEY + GEMINI_API_KEY)**

With `npm run dev` running:
```bash
curl -s localhost:3000/api/custom-order/preview -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"A 16x11 walnut cutting board, 1.5 inch thick, juice groove, engrave \"The Wyatts\" in the corner"}]}'
```
Expected: JSON `{"summary":"...", "imageUrl":"https://...blob.vercel-storage.com/...png", "imageError":false}`. If the Gemini key is missing or Imagen errors, expect `imageUrl:null, imageError:true` but a valid `summary`.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/custom-order/preview/route.tsx
git commit -m "Custom-order AI: preview endpoint (summary + Imagen image)"
```

---

### Task 5: Extend the submit endpoint (persist + emails)

**Files:**
- Modify: `src/app/api/custom-order/route.tsx`

- [ ] **Step 1: Accept and store the new fields**

In `src/app/api/custom-order/route.tsx`, find the destructuring of `body`:

```ts
    const { name, email, phone, description, woodPreference, dimensions, budget, timeline, referenceImages, engravingText, engravingNotes } = body
```

Replace it with (adds three fields):

```ts
    const { name, email, phone, description, woodPreference, dimensions, budget, timeline, referenceImages, engravingText, engravingNotes, aiSummary, aiImageUrl, chatTranscript } = body
```

- [ ] **Step 2: Persist the new columns**

Find the `db.from('custom_orders').insert({ ... })` object. Add three properties right after `reference_images: referenceImages ?? [],`:

```ts
      ai_summary: aiSummary ?? null,
      ai_image_url: aiImageUrl ?? null,
      chat_transcript: chatTranscript ?? null,
```

- [ ] **Step 3: Surface them in the owner email**

In the owner `sendMail` HTML, find the `<p><strong>Description:</strong></p>` block. Immediately BEFORE that `<p><strong>Description:</strong></p>` line, insert:

```ts
        ${aiSummary ? `<p><strong>AI summary:</strong></p><blockquote style="border-left: 3px solid #3e4d39; padding-left: 16px; color: #2d241e;">${aiSummary}</blockquote>` : ''}
        ${aiImageUrl ? `<p><strong>Generated preview:</strong></p><p><a href="${aiImageUrl}"><img src="${aiImageUrl}" alt="Generated board preview" style="max-width:480px;border:1px solid #e6ded1;border-radius:6px;" /></a></p>` : ''}
        ${Array.isArray(chatTranscript) && chatTranscript.length ? `<details><summary><strong>Chat transcript</strong></summary>${chatTranscript.map((m: any) => `<p style="margin:4px 0;"><strong>${m.role === 'user' ? 'Customer' : 'Assistant'}:</strong> ${String(m.content).replace(/</g, '&lt;')}</p>`).join('')}</details>` : ''}
```

- [ ] **Step 4: Use the AI summary as the description fallback**

Find the `fullDescription` builder near the top of the handler:

```ts
    const fullDescription = [
      description,
```

Replace that line `description,` with:

```ts
      description || aiSummary || '',
```

This ensures the stored `description` is populated even when the chat-first page sends an empty `description` and relies on `aiSummary`.

- [ ] **Step 5: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no output.

- [ ] **Step 6: Manual smoke test**

With `npm run dev` running:
```bash
curl -s localhost:3000/api/custom-order -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"test@example.com","phone":"","description":"","aiSummary":"A 16x11 walnut board with juice groove.","aiImageUrl":"https://example.com/x.png","chatTranscript":[{"role":"user","content":"hi"},{"role":"assistant","content":"hello"}]}'
```
Expected: `{"ok":true,"id":"<uuid>"}`. (Requires the Supabase columns from Task 1 to exist; if they don't yet, expect a column error — that confirms the insert references them.)

- [ ] **Step 7: Commit**

```bash
git add src/app/api/custom-order/route.tsx
git commit -m "Custom-order AI: persist summary/image/transcript + emails"
```

---

### Task 6: Rewrite the custom-order page (chat-first UI)

**Files:**
- Modify: `src/app/custom-order/page.tsx` (full rewrite)

- [ ] **Step 1: Replace the page with the chat-first version**

Overwrite `src/app/custom-order/page.tsx` with:

```tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import TopSection from '@/controls/topSection'
import FooterSection from '@/controls/footerSection'
import { serif } from '@/controls/fonts'
import { toast } from 'sonner'

type Msg = { role: 'user' | 'assistant'; content: string }

const MAX_IMAGE_GENS = 3

const GREETING: Msg = {
  role: 'assistant',
  content:
    "Hi! I'm the Roger & Sally design assistant. Tell me about the board you have in mind — who it's for, the occasion, or any look you're after — and we'll shape it together.",
}

export default function CustomOrderPage() {
  const [messages, setMessages] = useState<Msg[]>([GREETING])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageGens, setImageGens] = useState(0)
  const [contact, setContact] = useState({ name: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, chatLoading])

  const userTurns = messages.filter(m => m.role === 'user').length
  const canPreview = userTurns >= 1 && !chatLoading && !previewLoading

  async function send() {
    const text = input.trim()
    if (!text || chatLoading) return
    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next)
    setInput('')
    setChatLoading(true)
    try {
      const res = await fetch('/api/custom-order/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Chat failed')
      setMessages(m => [...m, { role: 'assistant', content: data.reply }])
    } catch (err: any) {
      toast.error(err.message ?? 'Chat failed. Please try again.')
    } finally {
      setChatLoading(false)
    }
  }

  async function generatePreview() {
    if (imageGens >= MAX_IMAGE_GENS) {
      toast.error(`You've reached the ${MAX_IMAGE_GENS}-preview limit for this session.`)
      return
    }
    setPreviewLoading(true)
    try {
      const res = await fetch('/api/custom-order/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Preview failed')
      setSummary(data.summary)
      setImageUrl(data.imageUrl)
      setImageGens(n => n + 1)
      if (data.imageError) toast.message("Summary ready — the image couldn't be generated this time.")
    } catch (err: any) {
      toast.error(err.message ?? 'Preview failed. Please try again.')
    } finally {
      setPreviewLoading(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!contact.name || !contact.email) {
      toast.error('Please add your name and email.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/custom-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contact,
          description: '',
          aiSummary: summary,
          aiImageUrl: imageUrl,
          chatTranscript: messages,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submit failed')
      setSubmitted(true)
    } catch (err: any) {
      toast.error(err.message ?? 'Submit failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="bg-parchment min-h-screen flex flex-col">
        <TopSection />
        <div className="max-w-2xl mx-auto w-full px-4 py-20 flex-1 text-center">
          <h1 className={`text-4xl text-walnut mb-4 ${serif.className}`}>We got it!</h1>
          <p className="text-slate text-lg">
            Thanks, {contact.name.split(' ')[0]}. We&apos;ve received your custom request and will be in
            touch within 2 business days with a quote. Check your inbox for a confirmation.
          </p>
          <a href="/shop" className="inline-block mt-8 text-cherry hover:underline">Browse the shop →</a>
        </div>
        <FooterSection />
      </main>
    )
  }

  return (
    <main className="bg-parchment min-h-screen flex flex-col">
      <TopSection />
      <div className="max-w-3xl mx-auto w-full px-4 py-10 flex-1">
        <h1 className={`text-4xl lg:text-5xl text-walnut text-center mb-2 ${serif.className}`}>
          Design Your Custom Board
        </h1>
        <p className="text-slate text-center mb-8">
          Chat with our design assistant, generate a preview, and send us your idea.
        </p>

        {/* Chat */}
        <div className="bg-white border border-maple rounded-lg overflow-hidden">
          <div ref={scrollRef} className="h-80 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.role === 'user' ? 'bg-cherry text-white' : 'bg-maple text-walnut'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {chatLoading && <div className="text-xs text-slate">Assistant is typing…</div>}
          </div>
          <div className="border-t border-maple p-3 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send() } }}
              placeholder="Describe your board…"
              className="flex-1 border border-maple rounded px-3 py-2 text-sm focus:outline-none focus:border-cherry bg-parchment"
            />
            <button onClick={send} disabled={chatLoading || !input.trim()}
              className="bg-forest text-white px-4 py-2 rounded text-sm font-semibold hover:bg-opacity-90 disabled:opacity-50">
              Send
            </button>
          </div>
        </div>

        {/* Generate preview */}
        <div className="text-center my-6">
          <button onClick={generatePreview} disabled={!canPreview || imageGens >= MAX_IMAGE_GENS}
            className="bg-cherry text-white px-6 py-3 rounded font-semibold hover:bg-opacity-90 disabled:opacity-50">
            {previewLoading ? 'Generating…' : summary ? 'Regenerate preview' : 'Generate preview'}
          </button>
          <p className="text-xs text-slate mt-2">
            {imageGens > 0 ? `${MAX_IMAGE_GENS - imageGens} preview${MAX_IMAGE_GENS - imageGens === 1 ? '' : 's'} left` : 'Describe your board first, then generate a preview.'}
          </p>
        </div>

        {/* Preview result */}
        {(summary || imageUrl) && (
          <div className="bg-white border border-maple rounded-lg p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {imageUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={imageUrl} alt="Generated board preview" className="w-full rounded border border-maple" />
            )}
            {summary && (
              <div>
                <p className="text-xs font-semibold text-walnut mb-1">Your board, as we understood it</p>
                <p className="text-slate text-sm whitespace-pre-line">{summary}</p>
                <p className="text-xs text-slate mt-3 italic">This preview is an AI impression to help us picture your idea — your handcrafted board will be uniquely made.</p>
              </div>
            )}
          </div>
        )}

        {/* Contact + submit */}
        <form onSubmit={submit} className="bg-white border border-maple rounded-lg p-5 space-y-3">
          <h2 className={`text-lg text-walnut ${serif.className}`}>Send us your request</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input required placeholder="Name" value={contact.name} onChange={e => setContact(c => ({ ...c, name: e.target.value }))}
              className="border border-maple rounded px-3 py-2 text-sm focus:outline-none focus:border-cherry bg-parchment" />
            <input required type="email" placeholder="Email" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
              className="border border-maple rounded px-3 py-2 text-sm focus:outline-none focus:border-cherry bg-parchment" />
            <input placeholder="Phone (optional)" value={contact.phone} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))}
              className="border border-maple rounded px-3 py-2 text-sm focus:outline-none focus:border-cherry bg-parchment" />
          </div>
          <button type="submit" disabled={submitting}
            className="bg-cherry text-white px-6 py-2.5 rounded font-semibold hover:bg-opacity-90 disabled:opacity-50">
            {submitting ? 'Sending…' : 'Send My Request'}
          </button>
          <p className="text-xs text-slate">We&apos;ll reply within 2 business days with a quote. No payment is taken now.</p>
        </form>
      </div>
      <FooterSection />
    </main>
  )
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no output.

- [ ] **Step 3: Verify production build**

Run: `rm -rf build .next && npx next build`
Expected: "Compiled successfully"; `/custom-order` listed as a route. Then `rm -rf build .next`.

- [ ] **Step 4: Manual UI check (with dev server + keys)**

Open `localhost:3000/custom-order`. Send a message, confirm a concierge reply appears. Click Generate preview, confirm a summary (and image if Gemini key present) appears. Fill name/email, submit, confirm the "We got it!" screen.

- [ ] **Step 5: Commit**

```bash
git add src/app/custom-order/page.tsx
git commit -m "Custom-order AI: chat-first page with preview + contact submit"
```

---

### Task 7: Admin Custom Orders — show summary + image

**Files:**
- Modify: `src/app/admin/(protected)/custom-orders/page.tsx`

- [ ] **Step 1: Add AI summary + image to the expanded view**

In `src/app/admin/(protected)/custom-orders/page.tsx`, find the Description block inside the expanded panel:

```tsx
                  <div>
                    <p className="text-xs font-semibold text-walnut mb-1">Description</p>
                    <p className="text-sm text-slate whitespace-pre-line">{co.description}</p>
                  </div>
```

Immediately BEFORE that block, insert:

```tsx
                  {co.ai_summary && (
                    <div>
                      <p className="text-xs font-semibold text-walnut mb-1">AI summary</p>
                      <p className="text-sm text-slate whitespace-pre-line">{co.ai_summary}</p>
                    </div>
                  )}
                  {co.ai_image_url && (
                    <div>
                      <p className="text-xs font-semibold text-walnut mb-1">Generated preview</p>
                      <a href={co.ai_image_url} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={co.ai_image_url} alt="Generated preview" className="max-w-xs rounded border border-maple hover:border-cherry" />
                      </a>
                    </div>
                  )}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add "src/app/admin/(protected)/custom-orders/page.tsx"
git commit -m "Custom-order AI: show summary + preview in admin"
```

---

### Task 8: Full build + final verification

- [ ] **Step 1: Clean production build**

Run: `rm -rf build .next && npx next build`
Expected: "Compiled successfully" with `/custom-order`, `/api/custom-order/chat`, `/api/custom-order/preview` all present. Then `rm -rf build .next`.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no output.

- [ ] **Step 3: Confirm clean tree**

Run: `git status --short`
Expected: empty (all work committed).

---

## Post-implementation handoff (owner actions)

1. Run the three `alter table custom_orders ...` statements from Task 1 in Supabase.
2. Add `ANTHROPIC_API_KEY` and `GEMINI_API_KEY` to Vercel (all environments) and to local `.env.local` for testing.
3. Review on a preview deploy, then merge to prod per the usual flow.
