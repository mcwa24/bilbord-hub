import { sendEmailSMTP } from './smtp'

export async function sendNewsletterEmail(
  email: string,
  release: {
    id: string
    title: string
    description: string
    tags: string[]
    published_at: string | null
    downloadUrl: string
  },
  unsubscribeToken?: string
) {
  try {
    const html = `
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
              <h2 style="color: #1d1d1f; margin-top: 0;">Novo PR saopštenje</h2>
              <h3 style="color: #1d1d1f; font-size: 20px;">${release.title}</h3>
              <p style="color: #666; margin: 20px 0;">${release.description}</p>
              
              ${release.tags.length > 0 ? `
                <div style="margin: 20px 0;">
                  <strong>Tagovi:</strong>
                  ${release.tags.map(tag => `<span style="display: inline-block; background-color: #f0f0f0; padding: 4px 8px; margin: 4px; border-radius: 4px; font-size: 12px;">${tag}</span>`).join('')}
                </div>
              ` : ''}
              
              <div style="margin: 30px 0;">
                <a href="${release.downloadUrl}" 
                   style="display: inline-block; background-color: #f9c344; color: #1d1d1f; padding: 12px 24px; text-decoration: none; border-radius: 24px; font-weight: bold; transition: background-color 0.3s;">
                  Preuzmi materijale
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; margin: 0;">
                Ovaj email ste primili jer ste se prijavili na email obaveštenja Bilbord Hub platforme.
                <br>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.bilbord.rs'}/newsletter/odjava?email=${encodeURIComponent(email)}${unsubscribeToken ? `&token=${unsubscribeToken}` : ''}" style="color: #999;">Odjavite se</a>
                ${unsubscribeToken ? ` | <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.bilbord.rs'}/newsletter/upravljanje?email=${encodeURIComponent(email)}&token=${unsubscribeToken}" style="color: #999;">Upravljajte pretplatom</a>` : ''}
              </p>
            </div>
          </body>
        </html>
      `

    const result = await sendEmailSMTP({
      to: email,
      subject: `Novo PR saopštenje: ${release.title}`,
      html: html,
      from: process.env.RESEND_FROM_EMAIL || 'Bilbord Hub <noreply@mail.hub.bilbord.rs>',
    })

    if (result.error) {
      console.error('SMTP error sending newsletter email:', result.error)
      return { error: result.error }
    }

    console.log('Newsletter email sent successfully via SMTP')
    return { success: true, data: result }
  } catch (error: any) {
    console.error('Email send error:', error)
    return { error: error.message || 'Greška pri slanju emaila' }
  }
}

