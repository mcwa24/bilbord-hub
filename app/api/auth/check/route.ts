import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value
    
    if (!sessionToken) {
      return NextResponse.json({ isAdmin: false }, { status: 401 })
    }
    
    // U produkciji bi trebalo validirati token sa baze podataka
    // Za sada samo proveravamo da li postoji
    return NextResponse.json({ isAdmin: true })
  } catch (error) {
    return NextResponse.json({ isAdmin: false }, { status: 401 })
  }
}

