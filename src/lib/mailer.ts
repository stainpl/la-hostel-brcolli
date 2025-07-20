// src/lib/mailer.ts
import nodemailer from 'nodemailer'
import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import path from 'path'
import fs from 'fs'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
})

export async function sendPaymentReceipt(opts: {
  toEmail: string
  studentName: string
  roomBlock: string
  roomNumber: number
  amount: number   // in NGN
  reference: string
  date: Date
}) {
  const { toEmail, studentName, roomBlock, roomNumber, amount, reference, date } = opts

  let attachments: any[] = []

  try {
    // 1) Create a new PDF document and register fontkit
    const pdfDoc = await PDFDocument.create()
    pdfDoc.registerFontkit(fontkit as any)

    // 2) Embed custom font
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'static', 'Roboto-Regular.ttf')
    const fontBytes = fs.readFileSync(fontPath)
    const customFont = await pdfDoc.embedFont(fontBytes)

    // 3) Embed logo image (PNG) at top-right
    const logoPath = path.join(process.cwd(), 'public', 'logo.png')
    let logoImage;
    try {
      const logoBytes = fs.readFileSync(logoPath)
      // Choose embedPng or embedJpg based on file type
      logoImage = await pdfDoc.embedPng(logoBytes)
    } catch (_) {
      logoImage = null
    }

    // 4) Create page
    const page = pdfDoc.addPage([612, 792]) // Letter size
    const { width, height } = page.getSize()
    const margin = 50

    // 5) Draw logo at top-right
    if (logoImage) {
      const logoDims = logoImage.scale(0.25) // scale down to 25%
      page.drawImage(logoImage, {
        x: width - logoDims.width - margin,
        y: height - logoDims.height - margin,
        width: logoDims.width,
        height: logoDims.height,
      })
    }

    // 6) Draw header text
    page.drawText(process.env.SCHOOL_NAME || 'Hostel Management', {
      x: margin,
      y: height - margin - 20,
      size: 20,
      font: customFont,
      color: rgb(0, 0, 0),
    })

    // 7) Draw receipt details
    const fontSize = 14
    const startY = height - margin - 60
    page.drawText('Payment Receipt', {
      x: margin,
      y: startY,
      size: 16,
      font: customFont,
    })
    const details = [
      `Date: ${date.toLocaleString()}`,
      `Reference: ${reference}`,
      `Student: ${studentName}`,
      `Room: ${roomBlock}-${roomNumber}`,
      `Amount Paid: ₦${amount.toLocaleString()}`,
    ]
    details.forEach((line, idx) => {
      page.drawText(line, {
        x: margin,
        y: startY - (idx + 1) * (fontSize + 4),
        size: fontSize,
        font: customFont,
      })
    })

    // 8) Footer
    page.drawText('Thank you for your payment.', {
      x: margin,
      y: startY - (details.length + 2) * (fontSize + 4),
      size: fontSize,
      font: customFont,
    })

    // 9) Serialize to PDF bytes
    const pdfBytes = await pdfDoc.save()
    attachments.push({ filename: `receipt-${reference}.pdf`, content: Buffer.from(pdfBytes), contentType: 'application/pdf' })
  } catch (err) {
    console.error('[Mailer] pdf-lib generation failed, sending plain email', err)
  }

  // 10) Send email
  await transporter.sendMail({
    from: `"${process.env.SCHOOL_NAME}" <${process.env.SMTP_USER}>`,
    to:   toEmail,
    subject: `Payment Receipt — ${reference}`,
    html: `
      <p>Hi ${studentName},</p>
      <p>Thank you for your payment of <strong>₦${amount.toLocaleString()}</strong> for room <strong>${roomBlock}-${roomNumber}</strong> on ${date.toLocaleDateString()}.</p>
      <p>Your reference is <code>${reference}</code>.</p>
      <p>– ${process.env.SCHOOL_NAME}</p>
    `,
    attachments,
  })
}
