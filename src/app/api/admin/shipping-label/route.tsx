import { NextRequest, NextResponse } from 'next/server'
import { Shippo } from 'shippo'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdminAuthenticated } from '@/lib/adminAuth'
import { logCustomerEvent } from '@/lib/customers'
import nodemailer from 'nodemailer'

const shippo = new Shippo({ apiKeyHeader: process.env.SHIPPO_API_KEY ?? 'shippo_test_REPLACE_ME' })

// Build a single parcel (Shippo wants string fields, weight in lb). We sum
// item weights and use the largest single product's dimensions as the box.
function buildParcel(items: any[]) {
  let totalWeightLb = 0
  let maxL = 6, maxW = 6, maxH = 2
  for (const item of items) {
    const p = item.product
    const qty = item.quantity ?? 1
    totalWeightLb += (p?.weightLbs ?? 2) * qty
    const d = p?.dimensionsInches
    if (d) {
      maxL = Math.max(maxL, d.length)
      maxW = Math.max(maxW, d.width)
      maxH = Math.max(maxH, d.height * qty) // stack height grows with qty
    }
  }
  if (totalWeightLb <= 0) totalWeightLb = 1
  return {
    length: String(maxL),
    width: String(maxW),
    height: String(maxH),
    distanceUnit: 'in' as const,
    weight: totalWeightLb.toFixed(2),
    massUnit: 'lb' as const,
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId } = await req.json()
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

  const db = supabaseAdmin()
  const { data: order } = await db
    .from('orders')
    .select('id, email, items, shipping_address, label_url, tracking_number')
    .eq('id', orderId)
    .single()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  // Idempotency — never buy a second label for the same order
  if (order.label_url) {
    return NextResponse.json({
      error: 'A label has already been purchased for this order.',
      labelUrl: order.label_url,
      trackingNumber: order.tracking_number,
    }, { status: 409 })
  }

  const addr = order.shipping_address ?? {}
  if (!addr.line1 || !addr.city || !addr.state || !addr.zip) {
    return NextResponse.json({ error: 'Order is missing a complete shipping address.' }, { status: 400 })
  }

  try {
    const parcel = buildParcel(order.items ?? [])

    // Create the shipment synchronously to get live rates back
    const shipment = await shippo.shipments.create({
      addressFrom: {
        name: process.env.SHIP_FROM_NAME ?? 'Roger & Sally',
        street1: process.env.SHIP_FROM_STREET ?? '507 Coalbrook Dr',
        city: process.env.SHIP_FROM_CITY ?? 'Midlothian',
        state: process.env.SHIP_FROM_STATE ?? 'VA',
        zip: process.env.SHIP_FROM_ZIP ?? '23114',
        country: 'US',
        phone: process.env.SHIP_FROM_PHONE ?? '8044648162',
        email: process.env.EMAIL_FROM ?? 'sales@rogerandsally.com',
      },
      addressTo: {
        name: addr.name,
        street1: addr.line1,
        street2: addr.line2 || undefined,
        city: addr.city,
        state: addr.state,
        zip: addr.zip,
        country: 'US',
        email: order.email || undefined,
      },
      parcels: [parcel],
      async: false,
    })

    const rates = shipment.rates ?? []
    if (rates.length === 0) {
      return NextResponse.json({ error: 'No shipping rates available for this address.' }, { status: 422 })
    }

    // Auto-buy cheapest, trying rates in ascending price order so an
    // unregistered/erroring carrier doesn't block the purchase — we fall
    // through to the next cheapest until one succeeds.
    const sorted = [...rates].sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))
    let transaction: any = null
    let chosen: any = null
    let lastError = ''
    for (const rate of sorted) {
      const t = await shippo.transactions.create({
        rate: rate.objectId,
        labelFileType: 'PDF',
        async: false,
      })
      if (t.status === 'SUCCESS') { transaction = t; chosen = rate; break }
      lastError = t.messages?.map((m: any) => m.text).join('; ') || 'Carrier rejected the label purchase.'
    }

    if (!transaction) {
      return NextResponse.json({ error: lastError || 'No purchasable rate for this order.' }, { status: 422 })
    }

    const trackingNumber = transaction.trackingNumber
    const labelUrl = transaction.labelUrl
    const carrier = chosen.provider
    const cost = chosen.amount

    // Persist + flip to shipped
    await db.from('orders').update({
      status: 'shipped',
      tracking_number: trackingNumber,
      carrier,
      label_url: labelUrl,
      updated_at: new Date().toISOString(),
    }).eq('id', orderId)

    // Email the customer their tracking info
    await sendTrackingEmail(order.email, addr.name, trackingNumber ?? '', carrier, transaction.trackingUrlProvider)

    // Log to customer timeline
    if (order.email) {
      await logCustomerEvent(order.email, 'email',
        `Shipped via ${carrier} — tracking ${trackingNumber}`,
        { orderId, trackingNumber, carrier })
    }

    return NextResponse.json({ ok: true, labelUrl, trackingNumber, carrier, cost })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Failed to purchase label' }, { status: 500 })
  }
}

async function sendTrackingEmail(email: string, name: string | undefined, tracking: string, carrier?: string, trackUrl?: string) {
  if (!process.env.SMTP_SERVER_HOST || process.env.SMTP_SERVER_HOST === 'REPLACE_WITH_LOCAL_VALUE') return

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER_HOST,
    port: 465,
    secure: true,
    auth: { user: process.env.SMTP_SERVER_USERNAME, pass: process.env.SMTP_SERVER_PASSWORD },
  })

  await transporter.sendMail({
    from: `Roger & Sally <${process.env.EMAIL_FROM ?? 'noreply@rogerandsally.com'}>`,
    to: email,
    subject: 'Your Roger & Sally order has shipped 📦',
    html: `
      <div style="font-family: Georgia, serif; max-width: 540px; margin: 0 auto; color: #2d241e; background: #f9f7f2; padding: 32px;">
        <h1 style="color: #a64b29;">It's on its way!</h1>
        <p style="color: #5a5a5a;">Hi ${name?.split(' ')[0] ?? 'there'}, your handcrafted order has shipped via ${carrier ?? 'carrier'}.</p>
        <div style="background: white; border: 1px solid #e6ded1; border-radius: 6px; padding: 20px; margin: 24px 0;">
          <div style="font-size: 13px; color: #999;">Tracking number</div>
          <div style="font-size: 18px; font-weight: bold; color: #2d241e; font-family: monospace;">${tracking}</div>
        </div>
        ${trackUrl ? `<a href="${trackUrl}" style="display:inline-block;background:#a64b29;color:white;padding:12px 28px;border-radius:4px;text-decoration:none;font-weight:bold;">Track Your Package</a>` : ''}
        <p style="font-size: 12px; color: #999; margin-top: 32px;">Roger & Sally · Handcrafted Heritage Lock Wood Cutting Boards · Virginia</p>
      </div>
    `,
  }).catch(console.error)
}
