import { NextRequest, NextResponse } from 'next/server'
import { ShippingRate } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { toZip, weightLbs, length, width, height } = await req.json()

    const fromZip = process.env.SHIP_FROM_ZIP ?? '20001'
    const userId = process.env.USPS_USER_ID

    if (!userId || userId === 'REPLACE_ME') {
      // Return placeholder rates when USPS not yet configured
      const rates: ShippingRate[] = [
        { service: 'PRIORITY', displayName: 'USPS Priority Mail (2–3 days)', price: 12.95, estimatedDays: '2–3' },
        { service: 'PRIORITY_EXPRESS', displayName: 'USPS Priority Mail Express (1–2 days)', price: 29.95, estimatedDays: '1–2' },
        { service: 'GROUND_ADVANTAGE', displayName: 'USPS Ground Advantage (2–5 days)', price: 8.95, estimatedDays: '2–5' },
      ]
      return NextResponse.json({ rates })
    }

    const weightOz = Math.ceil(weightLbs * 16)
    const xml = `
      <RateV4Request USERID="${userId}">
        <Revision>2</Revision>
        <Package ID="0">
          <Service>ALL</Service>
          <ZipOrigination>${fromZip}</ZipOrigination>
          <ZipDestination>${toZip}</ZipDestination>
          <Pounds>${Math.floor(weightLbs)}</Pounds>
          <Ounces>${weightOz % 16}</Ounces>
          <Container>RECTANGULAR</Container>
          <Size>REGULAR</Size>
          <Width>${width}</Width>
          <Length>${length}</Length>
          <Height>${height}</Height>
          <Machinable>true</Machinable>
        </Package>
      </RateV4Request>
    `.trim()

    const url = `https://secure.shippingapis.com/ShippingAPI.dll?API=RateV4&XML=${encodeURIComponent(xml)}`
    const response = await fetch(url)
    const text = await response.text()

    // Parse USPS XML response
    const rates: ShippingRate[] = []
    const postageMatches = text.matchAll(/<Postage CLASSID="(\d+)">([\s\S]*?)<\/Postage>/g)
    for (const match of postageMatches) {
      const block = match[2]
      const mailService = block.match(/<MailService>(.*?)<\/MailService>/)?.[1]?.replace(/&lt;.*?&gt;/g, '').trim()
      const rateStr = block.match(/<Rate>(.*?)<\/Rate>/)?.[1]
      if (mailService && rateStr) {
        rates.push({
          service: match[1],
          displayName: `USPS ${mailService}`,
          price: parseFloat(rateStr),
          estimatedDays: '',
        })
      }
    }

    return NextResponse.json({ rates })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch shipping rates' }, { status: 500 })
  }
}
