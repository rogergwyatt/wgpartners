import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdminAuthenticated } from '@/lib/adminAuth'
import { sendStatusEmail, NOTIFY_STATUSES } from '@/lib/statusEmails'
import { logCustomerEvent } from '@/lib/customers'
import { OrderStatus, ORDER_STATUS_LABELS } from '@/lib/types'

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = supabaseAdmin()
  const { data, error } = await db
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ orders: data })
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status, trackingNumber } = await req.json()
  const db = supabaseAdmin()

  // Load current order so we can detect a genuine status change and have the
  // data needed for the notification email.
  const { data: existing } = await db
    .from('orders')
    .select('id, email, status, shipping_address, carrier, tracking_number')
    .eq('id', id)
    .single()

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (status) update.status = status
  if (trackingNumber !== undefined) update.tracking_number = trackingNumber
  const { error } = await db.from('orders').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify the customer only when the status actually changes into a
  // notify-eligible state (avoids re-sending on tracking-only saves or
  // re-selecting the same status).
  const newStatus = status as OrderStatus | undefined
  if (existing && newStatus && newStatus !== existing.status && NOTIFY_STATUSES.includes(newStatus)) {
    const merged = { ...existing, status: newStatus, tracking_number: trackingNumber ?? existing.tracking_number }
    await sendStatusEmail(merged, newStatus)
    if (existing.email) {
      await logCustomerEvent(existing.email, 'email', `Status email sent: ${ORDER_STATUS_LABELS[newStatus]}`, { orderId: id })
    }
  }

  return NextResponse.json({ ok: true })
}
