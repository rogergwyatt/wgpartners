# Custom Order AI Chat — Design

**Date:** 2026-06-08
**Branch:** `feature/custom-order-ai-chat`
**Status:** Approved

## Goal

Replace the long structured custom-order form with a chat-first experience. A
customer describes their board by chatting with a Roger & Sally "design
assistant" (Claude). They can generate a written summary and a board preview
image (Google Imagen) from the conversation, then submit with only their
contact info. The summary, image, and transcript are stored on the order and
included in the owner notification email and the admin Custom Orders page.

## User flow

1. Customer opens `/custom-order` and chats with the design assistant about the
   board (wood, size, intended use, engraving, budget, timeline).
2. When ready, the customer clicks **Generate preview**. The system produces:
   - a concise written **summary** of the board, and
   - an **Imagen** preview image of the board.
   Both are shown inline.
3. The customer can refine via more chat and regenerate, up to **3 image
   generations per session**.
4. The customer fills in **contact fields only** (name, email, phone) and
   submits.
5. The order is stored with the summary, image URL, and chat transcript; the
   owner email and admin Custom Orders page include all three.

## Components

### Frontend — `/custom-order` (rewritten, client component)
- Chat panel: scrollable message list + text input + send.
- "Generate preview" button (enabled once there is enough conversation).
- Summary + image display area.
- Contact fields: name, email, phone.
- Submit button.
- A client-generated `sessionId` (uuid) ties the conversation, preview, and
  submission together. Client tracks `imageGenCount` to enforce the 3-image cap.

### `POST /api/custom-order/chat`
- Input: `{ sessionId, messages: {role, content}[] }`.
- Calls **Claude** (`@anthropic-ai/sdk`, `ANTHROPIC_API_KEY`) with a system
  prompt: a warm, concise board-design concierge for Roger & Sally that asks
  about wood species, dimensions, intended use, engraving, budget, and timeline,
  one topic at a time, and keeps replies short.
- Returns: `{ reply }` (assistant text).
- Server guard: reject payloads with more than ~30 messages or oversized
  content.

### `POST /api/custom-order/preview`
- Input: `{ sessionId, messages }`.
- Step 1 — Claude produces a JSON object `{ summary, imagePrompt }`:
  - `summary`: tidy paragraph describing the requested board.
  - `imagePrompt`: a descriptive prompt for a photoreal product image of the
    board (wood species, shape, dimensions, engraving, on a neutral kitchen
    surface).
- Step 2 — Call **Imagen** via Gemini REST API (`GEMINI_API_KEY`,
  `imagen-3`) with `imagePrompt`; receive base64 PNG.
- Step 3 — Upload the PNG to **Vercel Blob** (existing `put`, public store);
  get the public URL.
- Returns: `{ summary, imageUrl }`.
- If Imagen or Blob fails: return `{ summary, imageUrl: null, imageError: true }`
  so the customer still gets a summary and can submit. Image is non-blocking.

### `POST /api/custom-order` (existing, extended)
- Also accepts `ai_summary`, `ai_image_url`, `chat_transcript`.
- Stores them on the `custom_orders` row.
- Owner email: include the summary, an `<img>`/link to the image, and a
  readable transcript.
- Customer confirmation email: unchanged except the summary stands in for the
  free-text description.

## Data / schema

Add to `custom_orders` (backward compatible — all nullable):

```sql
alter table custom_orders add column if not exists ai_summary text;
alter table custom_orders add column if not exists ai_image_url text;
alter table custom_orders add column if not exists chat_transcript jsonb;
```

The existing structured columns (wood_preference, dimensions, budget, timeline,
reference_images, description) remain and stay nullable so the old code path and
any existing rows are unaffected.

### Admin Custom Orders page
- Display `ai_summary` (prominently, as the description) and render
  `ai_image_url` as an image thumbnail/link when present.
- Keep showing the legacy fields when present.

## Dependencies & environment

- New dependency: `@anthropic-ai/sdk`.
- Imagen accessed via plain `fetch` to the Gemini REST endpoint (no extra dep).
- New env vars (added by owner in Vercel, all environments):
  - `ANTHROPIC_API_KEY`
  - `GEMINI_API_KEY`
- Reuses existing `BLOB_READ_WRITE_TOKEN` for image storage.

## Cost / abuse guards

- Chat capped at ~20 customer messages per session (client) with a server-side
  reject above ~30 messages.
- **Max 3 image generations per session** (client-enforced `imageGenCount`;
  server rejects preview calls beyond a coarse message/size limit).
- Prompt/content length caps on both endpoints.
- Graceful degradation: any AI failure returns a friendly error; image failure
  never blocks submission.

## Error handling

- Chat error → inline "Something went wrong, try again" with retry; conversation
  preserved.
- Preview/summary error → retry button; submission still allowed without a
  preview.
- Imagen/Blob error → summary returned, `imageError: true`, submission proceeds
  without an image.
- Submit error → existing behavior (toast + retry).

## Testing

- Unit: the preview endpoint's parsing of Claude's `{ summary, imagePrompt }`
  JSON (including malformed-JSON fallback), and the extended submit payload
  handling (new fields stored, emails include them).
- Unit: server guards reject oversized/too-many-message payloads.
- Manual e2e: full chat → preview → submit, plus the image-failure path.

## Out of scope (YAGNI)

- Persistent per-user rate limiting infrastructure (counters in a DB/table).
- Streaming chat responses (simple request/response is sufficient).
- Auto-extracting structured fields (wood/dimensions/etc.) from chat — the
  summary captures this in prose.
- Editing the generated image.
