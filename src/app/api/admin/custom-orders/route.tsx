import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdminAuthenticated } from '@/lib/adminAuth'
import { logCustomerEvent } from '@/lib/customers'
import nodemailer from 'nodemailer'

export async function GET() {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = supabaseAdmin()
  const { data, error } = await db
    .from('custom_orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ customOrders: data ?? [] })
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status, quoteAmount, notes } = await req.json()
  const db = supabaseAdmin()

  const update: Record<string, unknown> = {}
  if (status !== undefined) update.status = status
  if (quoteAmount !== undefined) update.quote_amount = quoteAmount === '' ? null : Number(quoteAmount)
  if (notes !== undefined) update.notes = notes

  const { data, error } = await db.from('custom_orders').update(update).eq('id', id).select('email').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Log status changes to the customer timeline
  if (status && data?.email) {
    await logCustomerEvent(data.email, 'custom_order', `Custom order marked "${status}"`, { customOrderId: id })
  }

  return NextResponse.json({ ok: true })
}

// Email the customer their quote, mark the order "quoted", and log it.
export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, quoteAmount, message } = await req.json()
  if (!id || quoteAmount === undefined || quoteAmount === '') {
    return NextResponse.json({ error: 'Quote amount required' }, { status: 400 })
  }

  const db = supabaseAdmin()
  const { data: co, error } = await db.from('custom_orders').select('*').eq('id', id).single()
  if (error || !co) return NextResponse.json({ error: 'Custom order not found' }, { status: 404 })

  if (!process.env.SMTP_SERVER_HOST || process.env.SMTP_SERVER_HOST === 'REPLACE_WITH_LOCAL_VALUE') {
    return NextResponse.json({ error: 'Email is not configured.' }, { status: 500 })
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER_HOST,
    port: 465,
    secure: true,
    auth: { user: process.env.SMTP_SERVER_USERNAME, pass: process.env.SMTP_SERVER_PASSWORD },
  })

  const amount = Number(quoteAmount).toFixed(2)
  try {
    await transporter.sendMail({
      from: `Roger & Sally <${process.env.EMAIL_FROM ?? 'sales@rogerandsally.com'}>`,
      to: co.email,
      replyTo: process.env.SITE_MAIL_RECIEVER || process.env.EMAIL_FROM,
      subject: 'Your custom order quote from Roger & Sally',
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #2d241e; background: #f9f7f2; padding: 32px;">
          <h1 style="color: #a64b29;">Your Custom Quote</h1>
          <p>Hi ${co.name?.split(' ')[0] ?? 'there'}, thank you for your custom order request. Here's your quote:</p>
          <div style="background: white; border: 1px solid #e6ded1; border-radius: 6px; padding: 20px; margin: 20px 0; text-align: center;">
            <div style="font-size: 13px; color: #999;">Quoted price</div>
            <div style="font-size: 30px; font-weight: bold; color: #a64b29;">$${amount}</div>
          </div>
          ${message ? `<p style="color:#5a5a5a; white-space:pre-line;">${message}</p>` : ''}
          <div style="background: white; border: 1px solid #e6ded1; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <div style="font-weight: bold; margin-bottom: 6px;">Your request</div>
            <div style="color:#5a5a5a; white-space:pre-line;">${co.description ?? ''}</div>
          </div>
          <p style="color:#5a5a5a;">Reply to this email to accept the quote or ask any questions, and we'll arrange next steps.</p>
          <p style="font-size: 12px; color: #999; margin-top: 32px;">Roger & Sally · Handcrafted Heritage Lock Wood Cutting Boards · Virginia</p>
        </div>
      `,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Failed to send quote' }, { status: 500 })
  }

  await db.from('custom_orders').update({ quote_amount: Number(quoteAmount), status: 'quoted' }).eq('id', id)
  await logCustomerEvent(co.email, 'custom_order', `Quote sent — $${amount}`, { customOrderId: id, quote: Number(quoteAmount) })

  return NextResponse.json({ ok: true })
}
