import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdminAuthenticated } from '@/lib/adminAuth'
import { logCustomerEvent } from '@/lib/customers'
import { RefundRecord } from '@/lib/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_REPLACE_ME')

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId, amountCents, reason, full } = await req.json()
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

  const db = supabaseAdmin()

  // Load order to get payment intent ID and existing refunds
  const { data: order, error: orderError } = await db
    .from('orders')
    .select('stripe_payment_intent_id, total, refunds, email')
    .eq('id', orderId)
    .single()

  if (orderError || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (!order.stripe_payment_intent_id) return NextResponse.json({ error: 'No payment found for this order' }, { status: 400 })

  // Retrieve the payment intent to get the charge ID
  const pi = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id)
  const chargeId = pi.latest_charge as string
  if (!chargeId) return NextResponse.json({ error: 'No charge found for this payment' }, { status: 400 })

  // Create the Stripe refund
  const refundParams: Stripe.RefundCreateParams = {
    charge: chargeId,
    reason: 'requested_by_customer',
  }
  if (!full && amountCents) refundParams.amount = amountCents

  const stripeRefund = await stripe.refunds.create(refundParams)

  const refundRecord: RefundRecord = {
    stripeRefundId: stripeRefund.id,
    amount: stripeRefund.amount / 100,
    reason: reason ?? 'Customer return',
    createdAt: new Date().toISOString(),
    refundedBy: full ? 'full' : 'partial',
  }

  const existingRefunds: RefundRecord[] = order.refunds ?? []
  const updatedRefunds = [...existingRefunds, refundRecord]
  const totalRefunded = updatedRefunds.reduce((sum, r) => sum + r.amount, 0)
  const newStatus = totalRefunded >= Number(order.total) ? 'returned' : 'processing'

  await db.from('orders').update({
    refunds: updatedRefunds,
    status: newStatus,
    updated_at: new Date().toISOString(),
  }).eq('id', orderId)

  // Log refund to the customer's interaction timeline
  if (order.email) {
    await logCustomerEvent(
      order.email,
      'refund',
      `${full ? 'Full' : 'Partial'} refund — $${refundRecord.amount.toFixed(2)} (${refundRecord.reason})`,
      { orderId, refundId: refundRecord.stripeRefundId, amount: refundRecord.amount }
    )
  }

  return NextResponse.json({ ok: true, refund: refundRecord, newStatus })
}
