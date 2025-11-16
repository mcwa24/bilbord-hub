import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendAdminNotificationEmail(userEmail: string) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY nije postavljen')
    return { error: 'Email servis nije konfigurisan' }
  }

  const adminEmail = 'office@hub.bilbord.rs'
  const currentYear = new Date().getFullYear()

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Bilbord Hub <noreply@mail.hub.bilbord.rs>',
      to: adminEmail,
      subject: 'Novi korisnik se prijavio na newsletter',
      html: `
        <!DOCTYPE html>
        <html lang="sr">
        <head>
          <meta charset="UTF-8" />
          <title>Novi korisnik – Bilbord Hub</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0; padding:0; background-color:#f3f4f6; font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td align="center" style="padding:32px 16px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:520px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 8px 20px rgba(15,23,42,0.08);">
                  
                  <!-- LOGO -->
                  <tr>
                    <td align="center" style="padding:24px 24px 8px 24px;">
                      <img src="https://awofvcpmcyizhtdiyoxr.supabase.co/storage/v1/object/public/pr-images/uploads/FINAL%20LOGO%20BILBORD-06.png"
                           alt="Bilbord logo"
                           style="max-width:180px; height:auto; display:block; margin:0 auto;" />
                    </td>
                  </tr>

                  <!-- NASLOV -->
                  <tr>
                    <td style="padding:8px 24px 0 24px; text-align:center;">
                      <h1 style="margin:0; font-size:22px; line-height:1.4; color:#111827;">
                        Novi korisnik se prijavio 👇
                      </h1>
                    </td>
                  </tr>

                  <!-- TEKST -->
                  <tr>
                    <td style="padding:16px 24px 0 24px; text-align:left;">
                      <p style="margin:0 0 12px 0; font-size:15px; line-height:1.6; color:#374151;">
                        Zdravo,
                      </p>
                      <p style="margin:0 0 16px 0; font-size:15px; line-height:1.6; color:#374151;">
                        Novi korisnik se upravo prijavio na email obaveštenja Bilbord Hub platforme.
                      </p>
                      <div style="background-color:#f9fafb; padding:16px; border-radius:8px; margin:16px 0;">
                        <p style="margin:0 0 8px 0; font-size:14px; color:#6b7280; font-weight:600;">Email adresa:</p>
                        <p style="margin:0; font-size:16px; color:#111827; font-weight:600;">${userEmail}</p>
                      </div>
                      <p style="margin:16px 0 0 0; font-size:15px; line-height:1.6; color:#374151;">
                        Korisnik će dobiti email za potvrdu registracije i nakon potvrde će početi da prima obaveštenja o novim PR saopštenjima.
                      </p>
                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="padding:16px 24px 24px 24px; border-top:1px solid #e5e7eb; text-align:left;">
                      <p style="margin:0; font-size:12px; line-height:1.6; color:#9ca3af;">
                        Ovaj email je automatski generisan kada se novi korisnik prijavi na newsletter.
                      </p>
                    </td>
                  </tr>

                </table>

                <p style="margin:16px 0 0 0; font-size:11px; line-height:1.6; color:#9ca3af; text-align:center;">
                  &copy; ${currentYear} Bilbord. Sva prava zadržana.
                </p>

              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend API error:', error)
      return { error: error.message }
    }

    console.log('Admin notification email sent successfully:', data)
    return { success: true, data }
  } catch (error: any) {
    console.error('Email send error:', error)
    return { error: error.message || 'Greška pri slanju emaila' }
  }
}

