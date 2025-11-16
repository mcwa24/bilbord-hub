import nodemailer from 'nodemailer'

// Kreiraj SMTP transporter koristeći Resend SMTP credentials
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.resend.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // true za 465, false za ostale portove
    auth: {
      user: process.env.SMTP_USER || 'resend',
      pass: process.env.SMTP_PASSWORD || process.env.RESEND_API_KEY, // Koristi API key kao password
    },
  })
}

export async function sendEmailSMTP(options: {
  to: string
  subject: string
  html: string
  from?: string
}) {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: options.from || process.env.RESEND_FROM_EMAIL || 'Bilbord Hub <noreply@mail.hub.bilbord.rs>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    }

    const info = await transporter.sendMail(mailOptions)
    
    console.log('Email sent via SMTP:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('SMTP error:', error)
    return { error: error.message || 'Greška pri slanju emaila preko SMTP' }
  }
}

