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
    console.error('RESEND_API_KEY nije podešen')
    return { error: 'Email servis nije konfigurisan' }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.bilbord.rs'
  const currentYear = new Date().getFullYear()
  const shareUrl = `${siteUrl}/download/${release.id}`
  
  // Formatiraj datum ako postoji
  let formattedDate = ''
  if (release.published_at) {
    const date = new Date(release.published_at)
    formattedDate = date.toLocaleDateString('sr-Latn-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Ekstraktuj tekst iz HTML content-a ako postoji
  let contentText = release.description || ''
  if (release.content) {
    // Ukloni HTML tagove za čist tekst
    const cleanContent = release.content.replace(/<[^>]*>/g, '').trim()
    if (cleanContent && cleanContent !== release.description) {
      contentText = release.description + '\n\n' + cleanContent
    }
  }
  
  // Ukloni naslov iz početka contentText-a ako postoji (jer se već prikazuje posebno kao boldovan naslov)
  if (contentText && release.title) {
    const title = release.title.trim()
    const titleEscaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    
    // Ukloni naslov sa početka (sa ili bez razmaka, novih redova, separatora)
    // Regex traži naslov na početku, praćen razmacima, novim redovima, separatorima (===, ---, itd.)
    const titleRegex = new RegExp(`^\\s*${titleEscaped}\\s*[\\n\\r\\-=\\s]*`, 'i')
    contentText = contentText.replace(titleRegex, '').trim()
    
    // Takođe proveri da li description ili content počinje sa naslovom
    if (release.description) {
      const descTrimmed = release.description.trim()
      if (descTrimmed.toLowerCase() === title.toLowerCase() || descTrimmed.toLowerCase().startsWith(title.toLowerCase())) {
        // Ako je description samo naslov ili počinje sa naslovom, ukloni ga
        if (release.content) {
          const cleanContent = release.content.replace(/<[^>]*>/g, '').trim()
          const contentWithoutTitle = cleanContent.replace(new RegExp(`^\\s*${titleEscaped}\\s*[\\n\\r\\-=\\s]*`, 'i'), '').trim()
          contentText = contentWithoutTitle
        } else {
          contentText = ''
        }
      }
    }
  }

  // Generiši poseban HTML za dodatne emailove
  const additionalEmailIntro = isAdditionalEmail ? `
    <!-- DODATNI EMAIL INTRO -->
    <tr>
      <td style="padding:0 24px 24px 24px; text-align:left;">
        <div style="padding:20px; margin-top:8px;">
          <p style="margin:0 0 12px 0; font-size:18px; line-height:1.4; color:#111827; font-weight:700;">
            Vaše PR saopštenje je postavljeno! 🎉
          </p>
          <p style="margin:0; font-size:15px; line-height:1.6; color:#374151;">
            Vaše PR saopštenje "<strong>${release.title}</strong>" je uspešno postavljeno na <strong>Bilbord Hub Platformu</strong>.
          </p>
        </div>
      </td>
    </tr>
  ` : ''

  try {
    const emailSubject = isAdditionalEmail 
      ? `🌈 Vaše PR saopštenje je uspešno postavljeno na Bilbord Hub Platformu`
      : `👐 Novo PR saopštenje: ${release.title}`
    
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Bilbord Hub <hub@bilbord.rs>',
      to: email,
      subject: emailSubject,
      html: `
        <!DOCTYPE html>
        <html lang="sr">
        <head>
          <meta charset="UTF-8" />
          <title>Novo PR saopštenje – Bilbord Hub</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            a { color: #111827 !important; text-decoration: none; }
            a:visited { color: #111827 !important; }
            a:hover { color: #111827 !important; }
            a:active { color: #111827 !important; }
          </style>
        </head>
        <body style="margin:0; padding:0; background-color:#ffffff; font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td align="center" style="padding:32px 16px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:520px; background-color:#ffffff;">
                  
                  <!-- LOGO -->
                  <tr>
                    <td align="center" style="padding:32px 24px 24px 24px;">
                      <img src="https://awofvcpmcyizhtdiyoxr.supabase.co/storage/v1/object/public/pr-images/uploads/FINAL%20LOGO%20BILBORD-06.png"
                           alt="Bilbord logo"
                           style="max-width:200px; height:auto; display:block; margin:0 auto;" />
                    </td>
                  </tr>

                  <!-- NASLOV (samo za newsletter emailove, ne za dodatne) -->
                  ${!isAdditionalEmail ? `
                    <tr>
                      <td style="padding:0 24px 20px 24px; text-align:center;">
                        <h1 style="margin:0; font-size:24px; line-height:1.3; color:#111827; font-weight:700;">
                          Novo PR saopštenje 👇
                        </h1>
                        ${formattedDate ? `
                          <p style="margin:8px 0 0 0; font-size:14px; color:#6b7280;">
                            ${formattedDate}
                          </p>
                        ` : ''}
                      </td>
                    </tr>
                  ` : ''}

                  ${additionalEmailIntro}

                  <!-- NASLOV SAOPŠTENJA (samo za newsletter emailove, ne za dodatne) -->
                  ${!isAdditionalEmail ? `
                    <tr>
                      <td style="padding:0 24px 20px 24px; text-align:left;">
                        <h2 style="margin:0; font-size:20px; line-height:1.4; color:#111827; font-weight:700;">
                          ${release.title}
                        </h2>
                      </td>
                    </tr>
                  ` : ''}

                  <!-- TEKST (samo za newsletter emailove, ne za dodatne) -->
                  ${!isAdditionalEmail ? `
                    <tr>
                      <td style="padding:0 24px 24px 24px; text-align:left;">
                        <div style="font-size:15px; line-height:1.7; color:#374151;">
                          ${contentText.split('\n').map(paragraph => 
                            paragraph.trim() ? `<p style="margin:0 0 16px 0;">${paragraph.trim()}</p>` : ''
                          ).join('')}
                        </div>
                      </td>
                    </tr>
                  ` : ''}

                  <!-- TAGOVI (samo za newsletter emailove, ne za dodatne) -->
                  ${!isAdditionalEmail && release.tags && release.tags.length > 0 ? `
                    <tr>
                      <td style="padding:0 24px 24px 24px; text-align:left;">
                        <div style="display:flex; flex-wrap:wrap; gap:8px;">
                          ${release.tags.map(tag => `
                            <span style="display:inline-block; background-color:#f9c344; color:#1d1d1f; padding:6px 14px; border-radius:999px; font-size:12px; font-weight:600;">
                              ${tag}
                            </span>
                          `).join('')}
                        </div>
                      </td>
                    </tr>
                  ` : ''}

                  <!-- AKCIJE -->
                  <tr>
                    <td style="padding:24px 24px 32px 24px;">
                      <!-- GLAVNO DUGME ZA PREUZIMANJE -->
                      <div style="text-align:center; margin-bottom:24px;">
                        <a href="${release.downloadUrl}"
                           style="display:inline-block; padding:14px 32px; border-radius:999px; background-color:#f9c344; color:#1d1d1f; text-decoration:none; font-size:16px; font-weight:600; box-shadow:0 2px 8px rgba(249,195,68,0.3);">
                          📥 Preuzmi saopštenje
                        </a>
                      </div>
                      
                      <!-- LINKOVI -->
                      <div style="border-top:1px solid #e5e7eb; padding-top:20px;">
                        <p style="margin:0 0 12px 0; font-size:13px; color:#6b7280; text-align:center; text-transform:uppercase; letter-spacing:0.5px;">
                          Korisni linkovi
                        </p>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                          <tr>
                            <td style="padding:0;">
                              <a href="https://bilbord.rs/"
                                 style="display:block; padding:12px 16px; margin-bottom:8px; background-color:#f9fafb; border-radius:8px; color:#111827; text-decoration:none; font-size:15px; font-weight:500; text-align:center; border:1px solid #e5e7eb;">
                                🌐 Portal
                              </a>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:0;">
                              <a href="https://hub.bilbord.rs/"
                                 style="display:block; padding:12px 16px; background-color:#f9fafb; border-radius:8px; color:#111827; text-decoration:none; font-size:15px; font-weight:500; text-align:center; border:1px solid #e5e7eb;">
                                🔗 Hub
                              </a>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>

                  <!-- SHARE LINK -->
                  <tr>
                    <td style="padding:0 24px 24px 24px; text-align:left; border-top:2px solid #f3f4f6;">
                      <div style="padding:16px; margin-top:24px;">
                        <p style="margin:0 0 8px 0; font-size:14px; line-height:1.6; color:#111827; font-weight:600;">
                          📎 Link za deljenje
                        </p>
                        <div style="background-color:#f9fafb; padding:12px; border-radius:6px; border:1px solid #e5e7eb; margin-bottom:12px;">
                          <p style="margin:0; font-size:13px; line-height:1.6; color:#111827; word-break:break-all; font-family:'Courier New',monospace; -webkit-user-select:all; -moz-user-select:all; -ms-user-select:all; user-select:all; cursor:text;">
                            ${shareUrl}
                          </p>
                        </div>
                        <p style="margin:0; font-size:12px; line-height:1.6; color:#6b7280;">
                          <strong>Kako koristiti:</strong> Kliknite na link iznad da ga selektujete, zatim kopirajte (Ctrl+C / Cmd+C) i podelite sa drugima. Svako ko klikne na link automatski će preuzeti materijale.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="padding:24px 24px 32px 24px; border-top:2px solid #f3f4f6; background-color:#fafafa;">
                      ${isAdditionalEmail ? `
                        <div style="text-align:center;">
                          <p style="margin:0 0 8px 0; font-size:12px; line-height:1.6; color:#6b7280;">
                            Ovaj email je automatski poslat kao obaveštenje o postavljanju vašeg PR saopštenja na Bilbord Hub Platformu.
                          </p>
                          <p style="margin:0; font-size:12px; line-height:1.6; color:#9ca3af;">
                            Molimo vas da ne odgovarate na ovaj email jer je automatski generisan.
                          </p>
                        </div>
                      ` : `
                        <div style="text-align:center;">
                          <p style="margin:0 0 8px 0; font-size:12px; line-height:1.6; color:#6b7280;">
                            Ovaj email ste primili jer ste se prijavili na email obaveštenja Bilbord Hub platforme.
                          </p>
                          <p style="margin:0; font-size:12px; line-height:1.6;">
                            <a href="${siteUrl}/newsletter/odjava?email=${encodeURIComponent(email)}${unsubscribeToken ? `&token=${unsubscribeToken}` : ''}" style="color:#111827; text-decoration:underline;">Odjavite se</a>
                          </p>
                        </div>
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
      console.error('Resend API greška:', error)
      return { error: error.message }
    }

    console.log(`Email uspešno poslat na ${email}`)
    return { success: true, data }
  } catch (error: any) {
    console.error('Greška pri slanju emaila:', error)
    return { error: error.message || 'Greška pri slanju emaila' }
  }
}

