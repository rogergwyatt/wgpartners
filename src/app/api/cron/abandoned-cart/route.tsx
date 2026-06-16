import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import nodemailer from 'nodemailer'
import { Cart } from '@/lib/types'

// Called by Vercel Cron — add to vercel.json:
// { "crons": [{ "path": "/api/cron/abandoned-cart", "schedule": "0 * * * *" }] }

export async function GET(req: NextRequest) {
  // Protect from public access
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = supabaseAdmin()
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: sessions } = await db
    .from('cart_sessions')
    .select('*')
    .eq('recovered', false)
    .not('email', 'is', null)
    .lt('updated_at', cutoff)

  if (!sessions?.length) return NextResponse.json({ sent: 0 })

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER_HOST,
    port: 465,
    secure: true,
    auth: { user: process.env.SMTP_SERVER_USERNAME, pass: process.env.SMTP_SERVER_PASSWORD },
  })

  let sent = 0
  for (const session of sessions) {
    const cart = session.cart_data as Cart
    const itemList = cart.items
      .map(i => `<li>${i.product.name} × ${i.quantity} — $${(i.unitPrice * i.quantity).toFixed(2)}</li>`)
      .join('')

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM ?? 'noreply@rogerandsally.com',
        to: session.email,
        subject: 'You left something behind…',
        html: `
          <div style="font-family: Georgia, serif; max-width: 540px; margin: 0 auto; color: #2d241e;">
            <h2 style="color: #a64b29;">Your cart is waiting</h2>
            <p>Hi there — you started building something beautiful. Your items are still here:</p>
            <ul style="padding-left: 20px; line-height: 2;">${itemList}</ul>
            <p>Each piece is hand-crafted to order, so we wanted to make sure you didn't miss out.</p>
            <a href="https://www.rogerandsally.com/cart"
               style="display: inline-block; background: #a64b29; color: white; padding: 12px 28px; border-radius: 4px; text-decoration: none; font-weight: bold; margin-top: 16px;">
              Return to Cart
            </a>
            <p style="font-size: 12px; color: #5a5a5a; margin-top: 32px;">
              Roger &amp; Sally · Handcrafted Heritage Lock Wood Cutting Boards · Virginia
            </p>
          </div>
        `,
      })

      // Mark as recovered so we don't email again
      await db.from('cart_sessions').update({ recovered: true }).eq('session_id', session.session_id)
      sent++
    } catch { /* skip failed sends, try again next hour */ }
  }

  return NextResponse.json({ sent })
}
