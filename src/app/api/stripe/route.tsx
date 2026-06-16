import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_REPLACE_ME')

export async function POST(req: NextRequest) {
  try {
    const { amountCents, cartSessionId, email, cart, shippingAddress, subtotal, shipping } = await req.json()

    let amount = amountCents
    let taxCents = 0
    let taxCalculationId: string | null = null

    // Stripe Tax — compute sales tax via the Tax Calculations API (automatic_tax
    // is NOT a valid PaymentIntent param). Defensive: if the calculation fails
    // for any reason, fall back to no tax so a misconfig never blocks checkout.
    if (process.env.STRIPE_TAX_ENABLED === 'true' && shippingAddress?.zip && shippingAddress?.state) {
      try {
        const calc = await stripe.tax.calculations.create({
          currency: 'usd',
          line_items: [{ amount: Math.round((subtotal ?? 0) * 100), reference: 'subtotal' }],
          shipping_cost: { amount: Math.round((shipping ?? 0) * 100) },
          customer_details: {
            address: {
              line1: shippingAddress.line1 ?? '',
              city: shippingAddress.city ?? '',
              state: shippingAddress.state ?? '',
              postal_code: shippingAddress.zip ?? '',
              country: 'US',
            },
            address_source: 'shipping',
          },
        })
        amount = calc.amount_total
        taxCents = calc.tax_amount_exclusive
        taxCalculationId = calc.id
      } catch (taxErr: any) {
        console.error('Stripe Tax calculation failed, proceeding without tax:', taxErr.message)
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      receipt_email: email || undefined,
      metadata: {
        cartSessionId: cartSessionId ?? '',
        taxCalculationId: taxCalculationId ?? '',
      },
    })

    // Pre-create order record so the webhook can update it on success
    if (cart && email) {
      const db = supabaseAdmin()
      const tax = taxCents / 100
      await db.from('orders').upsert({
        stripe_payment_intent_id: paymentIntent.id,
        email,
        items: cart.items ?? [],
        subtotal: subtotal ?? 0,
        shipping: shipping ?? 0,
        total: (subtotal ?? 0) + (shipping ?? 0) + tax,
        shipping_address: shippingAddress ?? {},
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'stripe_payment_intent_id' })
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      tax: taxCents / 100,
      total: amount / 100,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
