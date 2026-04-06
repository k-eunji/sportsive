import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // ✅ 여기 수정
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : ''

  const ua = req.headers.get('user-agent') || ''

  if (
    ip.startsWith('43.172') ||
    ip.startsWith('43.173') ||
    ua.includes('python') ||
    ua.includes('curl')
  ) {
    return new NextResponse('Blocked', { status: 403 })
  }

  return NextResponse.next()
}