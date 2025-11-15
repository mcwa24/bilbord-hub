import { NextRequest, NextResponse } from 'next/server'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'Bilbord'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'QsTXWTcnUSHtupu0wyA%'
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minuta

// In-memory store za rate limiting (u produkciji koristiti Redis ili bazu)
const loginAttempts = new Map<string, { count: number; lockoutUntil: number }>()

function getClientId(request: NextRequest): string {
  // Koristi IP adresu kao identifikator
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return ip
}

function isLockedOut(clientId: string): boolean {
  const attempts = loginAttempts.get(clientId)
  if (!attempts) return false
  
  if (attempts.lockoutUntil > Date.now()) {
    return true
  }
  
  // Ako je lockout istekao, resetuj
  if (attempts.lockoutUntil > 0 && attempts.lockoutUntil <= Date.now()) {
    loginAttempts.delete(clientId)
    return false
  }
  
  return false
}

function recordFailedAttempt(clientId: string) {
  const attempts = loginAttempts.get(clientId) || { count: 0, lockoutUntil: 0 }
  attempts.count += 1
  
  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.lockoutUntil = Date.now() + LOCKOUT_DURATION
  }
  
  loginAttempts.set(clientId, attempts)
}

function recordSuccess(clientId: string) {
  loginAttempts.delete(clientId)
}

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientId(request)
    
    // Proveri da li je IP zaključan
    if (isLockedOut(clientId)) {
      const attempts = loginAttempts.get(clientId)
      const remainingTime = Math.ceil((attempts!.lockoutUntil - Date.now()) / 1000 / 60)
      return NextResponse.json(
        { 
          error: 'Previše neuspešnih pokušaja. Pokušajte ponovo za ' + remainingTime + ' minuta.',
          locked: true 
        },
        { status: 429 }
      )
    }
    
    const body = await request.json()
    const { username, password } = body
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Korisničko ime i lozinka su obavezni' },
        { status: 400 }
      )
    }
    
    // Validacija credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      recordSuccess(clientId)
      
      // Generiši session token
      const sessionToken = Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64')
      
      const response = NextResponse.json({ 
        success: true,
        token: sessionToken 
      })
      
      // Postavi HTTP-only cookie za session
      response.cookies.set('admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 sata
        path: '/'
      })
      
      return response
    } else {
      recordFailedAttempt(clientId)
      const attempts = loginAttempts.get(clientId)
      const remainingAttempts = MAX_ATTEMPTS - attempts!.count
      
      return NextResponse.json(
        { 
          error: 'Pogrešno korisničko ime ili lozinka',
          remainingAttempts: remainingAttempts > 0 ? remainingAttempts : 0
        },
        { status: 401 }
      )
    }
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Greška pri prijavljivanju' },
      { status: 500 }
    )
  }
}

