import { supabaseAdmin } from '@/lib/supabase'
import { Order } from '@/lib/types'
import { notFound } from 'next/navigation'
import TopSection from '@/controls/topSection'
import FooterSection from '@/controls/footerSection'
import { serif } from '@/controls/fonts'

// Always render fresh — order status/tracking changes over time and must
// never be served from a stale cache.
export const dynamic = 'force-dynamic'

const STATUS_STEPS = ['pending', 'processing', 'being_crafted', 'ready_to_ship', 'shipped', 'delivered']
const STATUS_LABELS: Record<string, string> = {
  pending: 'Order Received',
  processing: 'Processing',
  being_crafted: 'Being Crafted',
  ready_to_ship: 'Ready to Ship',
  shipped: 'Shipped',
  delivered: 'Delivered',
}

// Build a carrier tracking URL from the tracking number.
function trackingUrl(carrier?: string, tracking?: string): string | null {
  if (!tracking) return null
  const c = (carrier ?? '').toLowerCase()
  if (c.includes('usps')) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${tracking}`
  if (c.includes('ups')) return `https://www.ups.com/track?tracknum=${tracking}`
  if (c.includes('fedex')) return `https://www.fedex.com/fedextrack/?trknbr=${tracking}`
  // Carrier-agnostic fallback
  return `https://www.google.com/search?q=${encodeURIComponent(`${carrier ?? ''} tracking ${tracking}`)}`
}

export default async function OrderPage({ params }: { params: { id: string } }) {
  const db = supabaseAdmin()
  const { data } = await db.from('orders').select('*').eq('id', params.id).single()
  if (!data) notFound()
  const order = data as unknown as Order
  // Supabase returns snake_case columns
  const trackingNumber = (data as any).tracking_number as string | undefined
  const carrier = (data as any).carrier as string | undefined
  const trackUrl = trackingUrl(carrier, trackingNumber)

  const currentStep = STATUS_STEPS.indexOf(order.status)

  return (
    <main className="bg-parchment min-h-screen flex flex-col">
      <TopSection />
      <div className="max-w-2xl mx-auto w-full px-4 py-12 flex-1">
        <h1 className={`text-4xl text-walnut mb-2 ${serif.className}`}>Order Tracking</h1>
        <p className="text-slate mb-8 font-mono text-sm">#{order.id}</p>

        {/* Progress bar */}
        <div className="flex items-center mb-10">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`flex flex-col items-center ${i <= currentStep ? 'text-cherry' : 'text-slate'}`}>
                <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${i <= currentStep ? 'bg-cherry border-cherry text-white' : 'border-maple bg-white'}`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span className="text-xs mt-1 text-center hidden sm:block">{STATUS_LABELS[step]}</span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${i < currentStep ? 'bg-cherry' : 'bg-maple'}`} />
              )}
            </div>
          ))}
        </div>

        {trackingNumber && (
          <div className="bg-white border border-maple rounded-lg p-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm text-slate">{carrier ? `${carrier} Tracking` : 'Tracking Number'}</p>
              <p className="font-mono text-walnut font-semibold">{trackingNumber}</p>
            </div>
            {trackUrl && (
              <a href={trackUrl} target="_blank" rel="noopener noreferrer"
                className="bg-cherry text-white px-5 py-2 rounded font-semibold text-sm hover:bg-opacity-90 transition-colors whitespace-nowrap">
                Track Package →
              </a>
            )}
          </div>
        )}

        <div className="bg-white border border-maple rounded-lg p-6">
          <h2 className={`text-xl text-walnut mb-4 ${serif.className}`}>Order Summary</h2>
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm text-slate mb-2">
              <span>{item.product.name} × {item.quantity}</span>
              <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-maple pt-3 mt-3 space-y-1">
            <div className="flex justify-between text-sm text-slate"><span>Subtotal</span><span>${order.subtotal?.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm text-slate"><span>Shipping</span><span>${order.shipping?.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold text-walnut"><span>Total</span><span>${order.total?.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
      <FooterSection />
    </main>
  )
}
