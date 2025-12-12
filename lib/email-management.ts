import { Resend } from 'resend'

export async function sendManagementLinkEmail(
  email: string,
  managementToken: string
) {
  if (!process.env.RESEND_API_KEY) {
    return { error: 'Email servis nije konfigurisan' }
  }

  // Kreiraj Resend klijent sa najnovijim API ključem
  const resend = new Resend(process.env.RESEND_API_KEY)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.bilbord.rs'
  const managementUrl = `${siteUrl}/newsletter/upravljanje?token=${managementToken}&email=${encodeURIComponent(email)}`

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Bilbord Hub <hub@bilbord.rs>',
      to: email,
      subject: 'Link za upravljanje pretplatom - Bilbord Hub',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f9c344; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #1d1d1f; margin: 0;">Bilbord Hub</h1>
            </div>
            <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
              <h2 style="color: #1d1d1f; margin-top: 0;">Upravljanje pretplatom</h2>
              <p style="color: #666; margin: 20px 0;">
                Zatražili ste pristup upravljanju vašom pretplatom na email obaveštenja. Kliknite na dugme ispod da pristupite stranici za upravljanje.
              </p>
              
              <div style="margin: 30px 0; text-align: center;">
                <a href="${managementUrl}" 
                   style="display: inline-block; background-color: #f9c344; color: #1d1d1f; padding: 12px 24px; text-decoration: none; border-radius: 24px; font-weight: bold; transition: background-color 0.3s;">
                  Upravljajte pretplatom
                </a>
              </div>
              
              <p style="color: #999; font-size: 12px; margin: 20px 0 0 0;">
                Ako niste zatražili pristup upravljanju, ignorišite ovaj email. Link je važeći 24 sata.
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    return { error: error.message || 'Greška pri slanju emaila' }
  }
}

