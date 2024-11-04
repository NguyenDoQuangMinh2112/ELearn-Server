import nodemailer from 'nodemailer'
import { env } from '~/configs/evironment'

export const sendVerificationEmail = async (email: string, code: string, subject?: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: false,
    auth: {
      user: env.SMPT_MAIL,
      pass: env.SMPT_PASSWORD
    }
  })

  const mailOptions = {
    from: '"Hệ thống E-Lean 👻" <no-reply@cuahangdientu.com>',
    to: email,
    subject: subject,
    html: `<p>Vui lòng xác minh email của bạn bằng cách nhập mã sau: <strong>${code}</strong></p>`
  }
  transporter.sendMail(mailOptions)
}
