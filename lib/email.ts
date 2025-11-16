import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendNewsletterEmail(
  email: string,
  release: {
    id: string
    title: string
    description: string
    content?: string
    tags: string[]
    published_at: string | null
    downloadUrl: string
  },
  unsubscribeToken?: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY nije postavljen')
    return { error: 'Email servis nije konfigurisan' }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.bilbord.rs'
  const currentYear = new Date().getFullYear()
  
  // Formatiraj datum ako postoji
  let formattedDate = ''
  if (release.published_at) {
    const date = new Date(release.published_at)
    formattedDate = date.toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Ekstraktuj tekst iz HTML content-a ako postoji
  let contentText = release.description || ''
  if (release.content) {
    // Ukloni HTML tagove za čist tekst
    contentText = release.content.replace(/<[^>]*>/g, '').trim()
    if (contentText && contentText !== release.description) {
      contentText = release.description + '\n\n' + contentText
    }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Bilbord Hub <noreply@mail.hub.bilbord.rs>',
      to: email,
      subject: `Novo PR saopštenje: ${release.title}`,
      html: `
        <!DOCTYPE html>
        <html lang="sr">
        <head>
          <meta charset="UTF-8" />
          <title>Novo PR saopštenje – Bilbord Hub</title>
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
                        Novo PR saopštenje 👇
                      </h1>
                    </td>
                  </tr>

                  <!-- DATUM -->
                  ${formattedDate ? `
                    <tr>
                      <td style="padding:8px 24px 0 24px; text-align:center;">
                        <p style="margin:0; font-size:14px; color:#6b7280;">
                          ${formattedDate}
                        </p>
                      </td>
                    </tr>
                  ` : ''}

                  <!-- NASLOV SAOPŠTENJA -->
                  <tr>
                    <td style="padding:16px 24px 0 24px; text-align:left;">
                      <h2 style="margin:0 0 12px 0; font-size:18px; line-height:1.4; color:#111827; font-weight:600;">
                        ${release.title}
                      </h2>
                    </td>
                  </tr>

                  <!-- TEKST -->
                  <tr>
                    <td style="padding:16px 24px 0 24px; text-align:left;">
                      <div style="margin:0 0 16px 0; font-size:15px; line-height:1.6; color:#374151;">
                        ${contentText.split('\n').map(paragraph => 
                          paragraph.trim() ? `<p style="margin:0 0 12px 0;">${paragraph.trim()}</p>` : ''
                        ).join('')}
                      </div>
                    </td>
                  </tr>

                  <!-- TAGOVI -->
                  ${release.tags && release.tags.length > 0 ? `
                    <tr>
                      <td style="padding:0 24px 16px 24px; text-align:left;">
                        <div style="display:flex; flex-wrap:wrap; gap:6px;">
                          ${release.tags.map(tag => `
                            <span style="display:inline-block; background-color:#f9c344; color:#1d1d1f; padding:4px 12px; border-radius:999px; font-size:12px; font-weight:500;">
                              ${tag}
                            </span>
                          `).join('')}
                        </div>
                      </td>
                    </tr>
                  ` : ''}

                  <!-- DUGME -->
                  <tr>
                    <td align="center" style="padding:8px 24px 24px 24px;">
                      <a href="${release.downloadUrl}"
                         style="display:inline-block; padding:12px 28px; border-radius:999px; background-color:#111827; color:#ffffff; text-decoration:none; font-size:15px; font-weight:600;">
                        Preuzmi materijale
                      </a>
                    </td>
                  </tr>

                  <!-- ALTERNATIVNI LINK -->
                  <tr>
                    <td style="padding:0 24px 24px 24px; text-align:left;">
                      <p style="margin:0 0 8px 0; font-size:13px; line-height:1.6; color:#6b7280;">
                        Ako dugme ne radi, koristi ovaj link:
                      </p>
                      <p style="margin:0; font-size:12px; line-height:1.6; color:#4b5563; word-break:break-all;">
                        ${release.downloadUrl}
                      </p>
                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="padding:16px 24px 24px 24px; border-top:1px solid #e5e7eb; text-align:left;">
                      <p style="margin:0 0 6px 0; font-size:12px; line-height:1.6; color:#9ca3af;">
                        Ovaj email ste primili jer ste se prijavili na email obaveštenja Bilbord Hub platforme.
                      </p>
                      <p style="margin:0; font-size:12px; line-height:1.6; color:#9ca3af;">
                        <a href="${siteUrl}/newsletter/odjava?email=${encodeURIComponent(email)}${unsubscribeToken ? `&token=${unsubscribeToken}` : ''}" style="color:#6b7280; text-decoration:underline;">Odjavite se</a>
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

    console.log('Newsletter email sent successfully:', data)
    return { success: true, data }
  } catch (error: any) {
    console.error('Email send error:', error)
    return { error: error.message || 'Greška pri slanju emaila' }
  }
}

