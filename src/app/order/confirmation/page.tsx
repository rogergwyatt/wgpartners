'use client'
import Link from 'next/link'
import TopSection from '@/controls/topSection'
import FooterSection from '@/controls/footerSection'
import { serif } from '@/controls/fonts'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'
import { splitOptions } from '@/lib/orderOptions'

const LEAD_TIME = process.env.NEXT_PUBLIC_LEAD_TIME ?? '3–4 weeks'

interface OrderSummary {
  id: string
  status: string
  email: string
  items: any[]
  subtotal: number
  shipping: number
  total: number
  shipping_address: { name?: string; line1?: string; line2?: string; city?: string; state?: string; zip?: string }
}

function ConfirmationContent() {
  const params = useSearchParams()
  const pi = params.get('pi')
  const { clearCart } = useCart()
  const [order, setOrder] = useState<OrderSummary | null>(null)
  const [processed, setProcessed] = useState(false)
  const [notFound, setNotFound] = useState(false)

  // Clear the cart once we've safely landed on the confirmation page.
  useEffect(() => { clearCart() }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  // Finalize the order (idempotent with the Stripe webhook), then load it.
  useEffect(() => {
    if (!pi) return
    let attempts = 0
    let timer: ReturnType<typeof setTimeout>

    // Verify payment with Stripe and finalize — works even if the webhook
    // never reaches the server (e.g. local dev or unconfigured endpoint).
    fetch('/api/order/finalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pi }),
    }).catch(() => {/* fall back to polling */})

    async function poll() {
      attempts++
      try {
        const res = await fetch(`/api/order/by-payment?pi=${pi}`)
        if (res.ok) {
          const { order } = await res.json()
          if (order) {
            setOrder(order)
            if (order.status !== 'pending') { setProcessed(true); return }
          }
        } else if (res.status === 404 && attempts > 8) {
          setNotFound(true); return
        }
      } catch { /* keep trying */ }
      if (attempts < 12) timer = setTimeout(poll, 2500)
      else setProcessed(true) // stop spinning; show what we have
    }

    poll()
    return () => clearTimeout(timer)
  }, [pi])

  // No payment reference at all — generic thanks
  if (!pi) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="text-5xl mb-6">🎉</div>
        <h1 className={`text-4xl text-walnut mb-4 ${serif.className}`}>Thank You!</h1>
        <p className="text-slate text-lg mb-8 max-w-md">Your order has been received.</p>
        <Link href="/shop" className="bg-cherry text-white px-8 py-3 rounded font-semibold hover:bg-opacity-90 transition-colors">
          Continue Shopping
        </Link>
      </div>
    )
  }

  // Still finalizing — webhook hasn't confirmed payment yet
  if (!processed && !order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="animate-spin text-4xl mb-6">⏳</div>
        <h1 className={`text-3xl text-walnut mb-3 ${serif.className}`}>Finalizing your order…</h1>
        <p className="text-slate max-w-md">Hang tight — we're confirming your payment. This only takes a moment.</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="text-5xl mb-6">🎉</div>
        <h1 className={`text-4xl text-walnut mb-4 ${serif.className}`}>Thank You!</h1>
        <p className="text-slate text-lg mb-2 max-w-md">Your payment went through and your order is on its way to us.</p>
        <p className="text-sm text-slate mb-8">Reference: <span className="font-mono text-walnut">{pi}</span></p>
        <Link href="/order/lookup" className="bg-cherry text-white px-8 py-3 rounded font-semibold hover:bg-opacity-90 transition-colors">
          Track Your Order
        </Link>
      </div>
    )
  }

  const addr = order?.shipping_address ?? {}
  const isConfirmed = order && order.status !== 'pending'

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className={`text-4xl text-walnut mb-3 ${serif.className}`}>
          {addr.name ? `Thank you, ${addr.name.split(' ')[0]}!` : 'Thank You!'}
        </h1>
        <p className="text-slate text-lg max-w-md mx-auto">
          {isConfirmed
            ? "Your order is confirmed and we're already thinking about your board."
            : 'Your order has been received.'}
        </p>
        <p className="text-sm text-slate mt-3">
          A confirmation has been sent to <span className="text-walnut">{order?.email}</span>.
        </p>
      </div>

      {order && (
        <div className="bg-white border border-maple rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl text-walnut ${serif.className}`}>Order Summary</h2>
            <span className="text-xs font-mono text-slate">#{order.id.slice(0, 8)}</span>
          </div>

          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm py-2 border-b border-maple last:border-0">
              <div className="text-slate">
                <span className="text-walnut">{item.product?.name}</span> × {item.quantity}
                <div className="text-xs mt-0.5">
                  {splitOptions(item.selectedOptions).text.map(o => `${o.key}: ${o.value}`).join(' · ')}
                  {splitOptions(item.selectedOptions).graphics.length > 0 && (
                    <> · graphic:{' '}
                      <a href={splitOptions(item.selectedOptions).graphics[0]} target="_blank" rel="noopener noreferrer" className="text-forest hover:underline">view</a>
                    </>
                  )}
                  {splitOptions(item.selectedOptions).notes && (
                    <div>Engraving placement: {splitOptions(item.selectedOptions).notes}</div>
                  )}
                </div>
              </div>
              <span className="text-walnut font-medium whitespace-nowrap">
                ${((item.unitPrice ?? 0) * (item.quantity ?? 1)).toFixed(2)}
              </span>
            </div>
          ))}

          <div className="mt-4 pt-3 border-t border-maple space-y-1">
            <div className="flex justify-between text-sm text-slate"><span>Subtotal</span><span>${order.subtotal?.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm text-slate"><span>Shipping</span><span>${order.shipping?.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold text-walnut text-lg pt-1"><span>Total</span><span>${order.total?.toFixed(2)}</span></div>
          </div>
        </div>
      )}

      {/* Lead time */}
      <div className="bg-forest text-white rounded-lg p-5 mb-6">
        <p className="text-xs uppercase tracking-wide opacity-80 mb-1">Estimated production time</p>
        <p className="text-2xl font-bold">{LEAD_TIME}</p>
        <p className="text-sm opacity-80 mt-1">Each piece is hand-crafted to order. We'll email you tracking as soon as it ships.</p>
      </div>

      {/* Shipping address */}
      {addr.line1 && (
        <div className="bg-white border border-maple rounded-lg p-5 mb-8">
          <p className="text-xs uppercase tracking-wide text-slate font-semibold mb-2">Shipping to</p>
          <p className="text-walnut text-sm leading-6">
            {addr.name}<br />
            {addr.line1}{addr.line2 ? <>, {addr.line2}</> : null}<br />
            {addr.city}, {addr.state} {addr.zip}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href={order ? `/order/${order.id}` : '/order/lookup'}
          className="bg-cherry text-white px-8 py-3 rounded font-semibold hover:bg-opacity-90 transition-colors text-center"
        >
          Track Your Order
        </Link>
        <Link href="/shop" className="border border-cherry text-cherry px-8 py-3 rounded font-semibold hover:bg-cherry hover:text-white transition-colors text-center">
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <main className="bg-parchment min-h-screen flex flex-col">
      <TopSection />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-slate">Loading…</div>}>
        <ConfirmationContent />
      </Suspense>
      <FooterSection />
    </main>
  )
}
