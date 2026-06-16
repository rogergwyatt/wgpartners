import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  const params = await req.json();
  const apikey = headers().get('Authorization');

  if (apikey !== 'Bearer ' + process.env.CONTACTS_API_KEY) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { rows } = await sql`SELECT * FROM contacts WHERE ${params.email} IN (SELECT email FROM contacts)`;
  if (rows.length === 0) {
    await sql`INSERT INTO contacts (name, email) VALUES (${params.name}, ${params.email})`;
  }

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const apikey = headers().get('Authorization');

  if (apikey !== 'Bearer ' + process.env.HPC_API) {
    return NextResponse.json({ success: false, rows: [] }, { status: 401 });
  }

  const { rows } = await sql`SELECT * FROM contacts`;
  return NextResponse.json({ success: true, rows });
}
