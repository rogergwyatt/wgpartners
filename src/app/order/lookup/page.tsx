'use client'
import { useState } from 'react'
import Link from 'next/link'
import TopSection from '@/controls/topSection'
import FooterSection from '@/controls/footerSection'
import { serif } from '@/controls/fonts'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/types'

const STATUS_LABELS = ORDER_STATUS_LABELS
const STATUS_COLORS = ORDER_STATUS_COLORS

export default function OrderLookupPage() {
  const [email, setEmail] = useState('')
  const [orders, setOrders] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/orders/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    setOrders(data.orders ?? [])
    setSearched(true)
    setLoading(false)
  }

  return (
    <main className="bg-parchment min-h-screen flex flex-col">
      <TopSection />
      <div className="max-w-xl mx-auto w-full px-4 py-12 flex-1">
        <h1 className={`text-4xl text-walnut mb-3 ${serif.className}`}>Track Your Order</h1>
        <p className="text-slate mb-8">Enter the email address you used at checkout to find your orders.</p>

        <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 border border-maple rounded px-3 py-2 focus:outline-none focus:border-cherry bg-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-cherry text-white px-5 py-2 rounded font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            {loading ? '…' : 'Look Up'}
          </button>
        </form>

        {searched && orders !== null && (
          orders.length === 0 ? (
            <div className="text-center py-12 text-slate">
              <p className="mb-4">No orders found for that email address.</p>
              <Link href="/shop" className="text-cherry hover:underline">Browse our shop →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order: any) => (
                <Link
                  key={order.id}
                  href={`/order/${order.id}`}
                  className="block bg-white border border-maple rounded-lg p-5 hover:border-cherry transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono text-sm text-slate mb-1">{order.id.slice(0, 8)}…</div>
                      <div className="text-sm text-slate">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      <div className="text-sm text-slate mt-1">{order.items?.length ?? 0} item(s)</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-walnut mb-2">${Number(order.total).toFixed(2)}</div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${(STATUS_COLORS as Record<string, string>)[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {(STATUS_LABELS as Record<string, string>)[order.status] ?? order.status}
                      </span>
                    </div>
                  </div>
                  {order.tracking_number && (
                    <div className="mt-3 pt-3 border-t border-maple text-sm text-slate">
                      Tracking: <span className="font-mono text-walnut">{order.tracking_number}</span>
                    </div>
                  )}
                  <div className="mt-2 text-xs text-forest">View details →</div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>
      <FooterSection />
    </main>
  )
}
