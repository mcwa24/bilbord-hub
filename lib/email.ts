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
  unsubscribeToken?: string,
  isAdditionalEmail?: boolean
) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY nije postavljen')
    return { error: 'Email servis nije konfigurisan' }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.bilbord.rs'
  const currentYear = new Date().getFullYear()
  const shareUrl = `${siteUrl}/download/${release.id}`
  
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

  // Generiši poseban HTML za dodatne emailove
  const additionalEmailIntro = isAdditionalEmail ? `
    <!-- DODATNI EMAIL INTRO -->
    <tr>
      <td style="padding:16px 24px 0 24px; text-align:left;">
        <div style="background-color:#f0f9ff; border-left:4px solid #111827; padding:16px; border-radius:8px; margin-bottom:16px;">
          <p style="margin:0 0 8px 0; font-size:15px; line-height:1.6; color:#111827; font-weight:600;">
            Vaše PR saopštenje je objavljeno! 🎉
          </p>
          <p style="margin:0; font-size:14px; line-height:1.6; color:#374151;">
            Vaše PR saopštenje "<strong>${release.title}</strong>" je uspešno objavljeno na <strong>Bilbord Portalu</strong> i postavljeno na <strong>Bilbord Hub</strong> platformu.
          </p>
        </div>
      </td>
    </tr>
  ` : ''

  try {
    const emailSubject = isAdditionalEmail 
      ? `🌈 Vaše PR saopštenje je uspešno objavljeno`
      : `👐 Novo PR saopštenje: ${release.title}`
    
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Bilbord Hub <noreply@mail.hub.bilbord.rs>',
      to: email,
      subject: emailSubject,
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

                  <!-- NASLOV (samo za newsletter emailove, ne za dodatne) -->
                  ${!isAdditionalEmail ? `
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
                  ` : ''}

                  ${additionalEmailIntro}

                  <!-- NASLOV SAOPŠTENJA (samo za newsletter emailove, ne za dodatne) -->
                  ${!isAdditionalEmail ? `
                    <tr>
                      <td style="padding:16px 24px 0 24px; text-align:left;">
                        <h2 style="margin:0 0 12px 0; font-size:18px; line-height:1.4; color:#111827; font-weight:600;">
                          ${release.title}
                        </h2>
                      </td>
                    </tr>
                  ` : ''}

                  <!-- TEKST (samo za newsletter emailove, ne za dodatne) -->
                  ${!isAdditionalEmail ? `
                    <tr>
                      <td style="padding:16px 24px 0 24px; text-align:left;">
                        <div style="margin:0 0 16px 0; font-size:15px; line-height:1.6; color:#374151;">
                          ${contentText.split('\n').map(paragraph => 
                            paragraph.trim() ? `<p style="margin:0 0 12px 0;">${paragraph.trim()}</p>` : ''
                          ).join('')}
                        </div>
                      </td>
                    </tr>
                  ` : ''}

                  <!-- TAGOVI (samo za newsletter emailove, ne za dodatne) -->
                  ${!isAdditionalEmail && release.tags && release.tags.length > 0 ? `
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

                  <!-- DUGMAD -->
                  <tr>
                    <td style="padding:8px 24px 24px 24px;">
                      <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                        <a href="${release.downloadUrl}"
                           style="display:inline-block; padding:12px 28px; border-radius:999px; background-color:#f9c344; color:#1d1d1f; text-decoration:none; font-size:15px; font-weight:600; flex:1; margin-right:8px; text-align:center;">
                          Preuzmi saopštenje
                        </a>
                        <a href="https://bilbord.rs/"
                           style="display:inline-block; padding:12px 28px; border-radius:999px; background-color:#111827; color:#ffffff; text-decoration:none; font-size:15px; font-weight:600; flex:1; margin:0 8px; text-align:center;">
                          Portal
                        </a>
                        <a href="https://hub.bilbord.rs/"
                           style="display:inline-block; padding:12px 28px; border-radius:999px; background-color:#111827; color:#ffffff; text-decoration:none; font-size:15px; font-weight:600; flex:1; margin-left:8px; text-align:center;">
                          Hub
                        </a>
                      </div>
                    </td>
                  </tr>

                  <!-- SHARE LINK -->
                  <tr>
                    <td style="padding:0 24px 24px 24px; text-align:left; border-top:1px solid #e5e7eb;">
                      <p style="margin:16px 0 12px 0; font-size:14px; line-height:1.6; color:#111827; font-weight:600;">
                        📎 Link za deljenje (kopirajte u clipboard):
                      </p>
                      <div style="background-color:#f9fafb; padding:16px; border-radius:8px; border:1px solid #e5e7eb; margin-bottom:12px;">
                        <p style="margin:0; font-size:14px; line-height:1.6; color:#111827; word-break:break-all; font-family:monospace; -webkit-user-select:all; -moz-user-select:all; -ms-user-select:all; user-select:all; cursor:text;">
                          ${shareUrl}
                        </p>
                      </div>
                      <p style="margin:0; font-size:12px; line-height:1.6; color:#6b7280; text-align:left;">
                        <strong>Instrukcije:</strong> Kliknite na link iznad da ga selektujete, zatim kopirajte ga (Ctrl+C na Windows-u ili Cmd+C na Mac-u) i paste-ujte gde želite da ga podelite. Svako ko klikne na link automatski će preuzeti materijale.
                      </p>
                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="padding:16px 24px 24px 24px; border-top:1px solid #e5e7eb; text-align:left;">
                      ${isAdditionalEmail ? `
                        <p style="margin:0 0 8px 0; font-size:12px; line-height:1.6; color:#9ca3af;">
                          Ovaj email je automatski poslat kao obaveštenje o objavi vašeg PR saopštenja na Bilbord Hub platformi.
                        </p>
                        <p style="margin:0; font-size:12px; line-height:1.6; color:#9ca3af;">
                          Molimo vas da ne odgovarate na ovaj email jer je automatski generisan.
                        </p>
                      ` : `
                        <p style="margin:0 0 6px 0; font-size:12px; line-height:1.6; color:#9ca3af;">
                          Ovaj email ste primili jer ste se prijavili na email obaveštenja Bilbord Hub platforme.
                        </p>
                        <p style="margin:0; font-size:12px; line-height:1.6; color:#9ca3af;">
                          <a href="${siteUrl}/newsletter/odjava?email=${encodeURIComponent(email)}${unsubscribeToken ? `&token=${unsubscribeToken}` : ''}" style="color:#6b7280; text-decoration:underline;">Odjavite se</a>
                        </p>
                      `}
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

