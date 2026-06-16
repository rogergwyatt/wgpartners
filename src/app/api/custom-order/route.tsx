import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { upsertCustomer, logCustomerEvent } from '@/lib/customers'
import { extractSpecs, type BoardSpecs } from '@/lib/customOrderAI'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, description, woodPreference, dimensions, budget, timeline, referenceImages, engravingText, engravingNotes, aiSummary, aiImageUrl, chatTranscript } = body

    // Escape user-controlled values before interpolating into email HTML.
    const esc = (s: unknown) =>
      String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))

    // The chat-first flow captures intent in the conversation itself, so the
    // full transcript — not a lossy AI summary — is the source of truth for
    // what the customer wants. Render it as readable text for storage/email.
    const transcriptText = Array.isArray(chatTranscript)
      ? chatTranscript
          .map((m: any) => `${m.role === 'user' ? 'Customer' : 'Assistant'}: ${m.content}`)
          .join('\n\n')
      : ''

    const fullDescription = [
      transcriptText || description || aiSummary || '',
      engravingText ? `Engraving text: ${engravingText}` : '',
      engravingNotes ? `Engraving placement: ${engravingNotes}` : '',
    ].filter(Boolean).join('\n\n')

    // Pull structured specs (wood, dimensions, thickness, juice groove,
    // engraving, budget) out of the conversation for the order record.
    let specs: BoardSpecs | null = null
    if (Array.isArray(chatTranscript) && chatTranscript.length && process.env.ANTHROPIC_API_KEY) {
      specs = await extractSpecs(chatTranscript)
    }

    // Specs as labeled rows for the owner email (only fields that are present).
    const SPEC_LABELS: [keyof BoardSpecs, string][] = [
      ['wood', 'Wood'], ['dimensions', 'Dimensions'], ['thickness', 'Thickness'],
      ['juiceGroove', 'Juice groove'], ['engraving', 'Engraving'], ['budget', 'Budget'],
    ]
    const specsHtml = specs && SPEC_LABELS.some(([k]) => specs![k])
      ? `<p><strong>Specifications:</strong></p><ul style="margin:4px 0; padding-left:18px; color:#2d241e;">${SPEC_LABELS
          .filter(([k]) => specs![k])
          .map(([k, label]) => `<li><strong>${label}:</strong> ${esc(specs![k])}</li>`)
          .join('')}</ul>`
      : ''

    // Full conversation as HTML for the owner email (always visible).
    const conversationHtml =
      Array.isArray(chatTranscript) && chatTranscript.length
        ? `<p><strong>Conversation:</strong></p>
           <div style="border-left: 3px solid #a64b29; padding-left: 16px;">
           ${chatTranscript
             .map(
               (m: any) =>
                 `<p style="margin:6px 0; color:#2d241e;"><strong>${m.role === 'user' ? 'Customer' : 'Assistant'}:</strong> ${esc(m.content)}</p>`,
             )
             .join('')}
           </div>`
        : fullDescription
          ? `<p><strong>Details:</strong></p><blockquote style="border-left: 3px solid #a64b29; padding-left: 16px; color: #5a5a5a;">${esc(fullDescription)}</blockquote>`
          : ''

    const db = supabaseAdmin()
    const { data, error } = await db.from('custom_orders').insert({
      name, email, phone,
      description: fullDescription,
      wood_preference: woodPreference,
      dimensions,
      budget,
      timeline,
      reference_images: referenceImages ?? [],
      ai_summary: aiSummary ?? null,
      ai_image_url: aiImageUrl ?? null,
      chat_transcript: chatTranscript ?? null,
      ai_specs: specs ?? null,
      status: 'new',
      created_at: new Date().toISOString(),
    }).select('id').single()

    if (error) throw error

    // Capture customer
    await upsertCustomer({ email, name, phone })
    await logCustomerEvent(email, 'custom_order', `Custom order request — ${woodPreference ?? 'wood TBD'}, budget: ${budget ?? 'TBD'}`, { customOrderId: data?.id, description })

    // Notify site owner
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER_HOST,
      port: 465,
      secure: true,
      auth: { user: process.env.SMTP_SERVER_USERNAME, pass: process.env.SMTP_SERVER_PASSWORD },
    })

    await transporter.sendMail({
      from: `Roger & Sally <${process.env.EMAIL_FROM ?? 'noreply@rogerandsally.com'}>`,
      to: process.env.SITE_MAIL_RECIEVER,
      subject: `New Custom Order Request — ${esc(name)}`,
      html: `
        <h2>New Custom Order Request</h2>
        <p><strong>Name:</strong> ${esc(name)}</p>
        <p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
        <p><strong>Phone:</strong> ${esc(phone) || 'not provided'}</p>
        ${woodPreference ? `<p><strong>Wood Preference:</strong> ${esc(woodPreference)}</p>` : ''}
        ${dimensions ? `<p><strong>Dimensions:</strong> ${esc(dimensions)}</p>` : ''}
        ${budget ? `<p><strong>Budget:</strong> ${esc(budget)}</p>` : ''}
        ${timeline ? `<p><strong>Timeline:</strong> ${esc(timeline)}</p>` : ''}
        ${engravingText ? `<p><strong>Engraving text:</strong> ${esc(engravingText)}</p>` : ''}
        ${engravingNotes ? `<p><strong>Engraving placement:</strong> ${esc(engravingNotes)}</p>` : ''}
        ${specsHtml}
        ${aiImageUrl ? `<p><strong>Generated preview:</strong></p><p><a href="${esc(aiImageUrl)}"><img src="${esc(aiImageUrl)}" alt="Generated board preview" style="max-width:480px;border:1px solid #e6ded1;border-radius:6px;" /></a></p>` : ''}
        ${conversationHtml}
        ${(referenceImages ?? []).length
          ? `<p><strong>Reference image(s):</strong> ${(referenceImages as string[]).map((u, i) => `<a href="${esc(u)}">image ${i + 1}</a>`).join(' · ')}</p>`
          : ''}
        <p><a href="https://www.rogerandsally.com/admin/custom-orders">View in Admin</a></p>
      `,
    }).catch(console.error)

    // Confirm to customer
    await transporter.sendMail({
      from: `Roger & Sally <${process.env.EMAIL_FROM ?? 'noreply@rogerandsally.com'}>`,
      to: email,
      subject: 'We received your custom order request',
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #2d241e; background: #f9f7f2; padding: 32px;">
          <h1 style="color: #a64b29;">We got it!</h1>
          <p>Hi ${esc(name.split(' ')[0])}, thank you for reaching out. We've received your custom order request and will be in touch within 2 business days with a quote.</p>
          <div style="background: white; border: 1px solid #e6ded1; border-radius: 6px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px; font-weight: bold; color: #2d241e;">Your request:</p>
            <p style="color: #5a5a5a; margin: 0; line-height: 1.6;">${aiSummary ? esc(aiSummary) : 'We have the details from your conversation and will follow up shortly.'}</p>
          </div>
          <p style="color: #5a5a5a;">In the meantime, feel free to browse our <a href="https://www.rogerandsally.com/shop" style="color: #a64b29;">standard offerings</a> or reply to this email with any additional details or photos.</p>
          <p style="font-size: 12px; color: #999; margin-top: 32px;">Roger & Sally · Handcrafted Heritage Lock Wood Cutting Boards · Virginia</p>
        </div>
      `,
    }).catch(console.error)

    return NextResponse.json({ ok: true, id: data?.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
