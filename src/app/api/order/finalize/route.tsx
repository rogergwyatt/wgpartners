import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { fulfillOrder } from '@/lib/fulfillOrder'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_REPLACE_ME')

// Called by the confirmation page. Verifies with Stripe that the payment
// actually succeeded before finalizing — so it can't be triggered by simply
// guessing a payment-intent ID. Idempotent with the Stripe webhook.
export async function POST(req: NextRequest) {
  const { pi } = await req.json()
  if (!pi) return NextResponse.json({ error: 'Missing payment reference' }, { status: 400 })

  let paymentIntent: Stripe.PaymentIntent
  try {
    paymentIntent = await stripe.paymentIntents.retrieve(pi)
  } catch {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  if (paymentIntent.status !== 'succeeded') {
    return NextResponse.json({ status: paymentIntent.status, fulfilled: false })
  }

  const result = await fulfillOrder(pi, paymentIntent.metadata.cartSessionId || undefined, paymentIntent.metadata.taxCalculationId || undefined)
  return NextResponse.json({ status: 'succeeded', ...result })
}
