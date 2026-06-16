import { NextRequest, NextResponse } from 'next/server'
import { chatReply, MAX_PAYLOAD_MESSAGES, type ChatMessage } from '@/lib/customOrderAI'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] }
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages' }, { status: 400 })
    }
    if (messages.length > MAX_PAYLOAD_MESSAGES) {
      return NextResponse.json({ error: 'Conversation too long' }, { status: 400 })
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Chat is not configured.' }, { status: 503 })
    }
    const reply = await chatReply(messages)
    return NextResponse.json({ reply })
  } catch (err: any) {
    console.error('custom-order chat error:', err.message)
    return NextResponse.json({ error: 'Chat failed. Please try again.' }, { status: 500 })
  }
}
