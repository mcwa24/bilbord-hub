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
  const currentYear = new Date().getFullYear()

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Bilbord Hub <noreply@mail.hub.bilbord.rs>',
      to: email,
      subject: 'Potvrdi svoju registraciju na Bilbord Hub',
      html: `
<!DOCTYPE html>
<html lang="sr">
<head>
  <meta charset="UTF-8" />
  <title>Potvrda registracije – Bilbord Hub</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#f3f4f6; font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:520px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 8px 20px rgba(15,23,42,0.08);">
          <tr>
            <td align="center" style="padding:24px 24px 8px 24px;">
              <img src="https://awofvcpmcyizhtdiyoxr.supabase.co/storage/v1/object/public/pr-images/uploads/FINAL%20LOGO%20BILBORD-06.png"
                   alt="Bilbord logo"
                   style="max-width:180px; height:auto; display:block; margin:0 auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 0 24px; text-align:center;">
              <h1 style="margin:0; font-size:22px; line-height:1.4; color:#111827;">
                Potvrdi svoju registraciju na Bilbord Hub
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px 0 24px; text-align:left;">
              <p style="margin:0 0 8px 0; font-size:15px; line-height:1.6; color:#374151;">
                Zdravo,
              </p>
              <p style="margin:0 0 12px 0; font-size:15px; line-height:1.6; color:#374151;">
                Hvala ti što si se prijavio/la za <strong>Bilbord Hub</strong>. Još samo jedan korak –
                potrebno je da potvrdiš svoju e-mail adresu kako bismo završili registraciju.
              </p>
              <p style="margin:0 0 16px 0; font-size:15px; line-height:1.6; color:#374151;">
                Klikni na dugme ispod da potvrdiš svoj nalog:
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:8px 24px 24px 24px;">
              <a href="${confirmationUrl}"
                 style="display:inline-block; padding:12px 28px; border-radius:999px; background-color:#111827; color:#ffffff; text-decoration:none; font-size:15px; font-weight:600;">
                Potvrdi e-mail adresu
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 24px 24px; text-align:left;">
              <p style="margin:0 0 8px 0; font-size:13px; line-height:1.6; color:#6b7280;">
                Ako dugme ne radi, iskopiraj i nalepi sledeći link u svoj browser:
              </p>
              <p style="margin:0; font-size:12px; line-height:1.6; color:#4b5563; word-break:break-all;">
                ${confirmationUrl}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px 24px 24px; border-top:1px solid #e5e7eb; text-align:left;">
              <p style="margin:0 0 6px 0; font-size:12px; line-height:1.6; color:#9ca3af;">
                Ovaj mejl si dobio jer si započeo/la registraciju na platformi Bilbord Hub.
              </p>
              <p style="margin:0; font-size:12px; line-height:1.6; color:#9ca3af;">
                Ako se ti nisi prijavio/la, možeš slobodno da ignorišeš ovu poruku – tvoja adresa neće biti aktivirana.
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

    console.log('Confirmation email sent successfully:', data)
    return { success: true, data }
  } catch (error: any) {
    console.error('Email send error:', error)
    return { error: error.message || 'Greška pri slanju emaila' }
  }
}
