import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
}

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path')
  if (!path) return NextResponse.json({ error: 'missing path' }, { status: 400 })

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers })
  const data = await res.json()
  return NextResponse.json(data)
}
