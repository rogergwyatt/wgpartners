import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { fulfillOrder } from '@/lib/fulfillOrder'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_REPLACE_ME')

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '')
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    await fulfillOrder(pi.id, pi.metadata.cartSessionId || undefined, pi.metadata.taxCalculationId || undefined)
  }

  return NextResponse.json({ received: true })
}
