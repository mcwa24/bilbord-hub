import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendConfirmationEmail(
  email: string,
  verificationToken: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY nije postavljen')
    return { error: 'Email servis nije konfigurisan' }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.bilbord.rs'
  const confirmationUrl = `${siteUrl}/newsletter/potvrda?token=${verificationToken}&email=${encodeURIComponent(email)}`

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Bilbord Hub <noreply@mail.hub.bilbord.rs>',
      to: email,
      subject: 'Potvrdite prijavu na Bilbord Hub email obaveštenja',
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
              <h2 style="color: #1d1d1f; margin-top: 0;">Potvrdite prijavu na email obaveštenja</h2>
              <p style="color: #666; margin: 20px 0;">
                Hvala vam što ste se prijavili na Bilbord Hub email obaveštenja! Kliknite na dugme ispod da potvrdite vašu email adresu.
              </p>
              
              <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 8px;">
                <p style="margin: 0; color: #1d1d1f;">Primaćete <strong>sva PR saopštenja</strong> kada se objave nova saopštenja.</p>
              </div>
              
              <div style="margin: 30px 0; text-align: center;">
                <a href="${confirmationUrl}" 
                   style="display: inline-block; background-color: #f9c344; color: #1d1d1f; padding: 12px 24px; text-decoration: none; border-radius: 24px; font-weight: bold; transition: background-color 0.3s;">
                  Potvrdi prijavu
                </a>
              </div>
              
              <p style="color: #999; font-size: 12px; margin: 20px 0 0 0;">
                Ako niste se prijavili na email obaveštenja, ignorišite ovaj email.
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend API error:', error)
      return { error: error.message }
    }

    console.log('Confirmation email sent successfully:', data)
    return { success: true, data }
  } catch (error: any) {
    console.error('Email send error:', error)
    return { error: error.message || 'Greška pri slanju emaila' }
  }
}
