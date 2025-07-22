import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import * as dns from "dns"
import { promisify } from "util"

const resolveMx = promisify(dns.resolveMx)

const SMTP_CONFIG = {
  user: process.env.EMAIL,
  pass: process.env.PASS,
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
}

async function verifyWithNodemailer(email: string, mailServer: string): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_CONFIG.host,
      port: SMTP_CONFIG.port,
      secure: SMTP_CONFIG.secure,
      auth: { user: SMTP_CONFIG.user, pass: SMTP_CONFIG.pass },
      tls: { rejectUnauthorized: false },
    })

    await transporter.verify()
    return true
  } catch (error) {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
console.error(`${email} cannot receive emails via ${mailServer}: ${(error as any).message}`);    return false
  }
}

async function verifyEmailSMTP(email: string): Promise<{ valid: boolean; hasMX: boolean; reason?: string }> {
  try {
    console.log(`Verifying email: ${email}`)
    console.log("Checking MX records...")
    const [, domain] = email.split("@")
    const mxRecords = await resolveMx(domain)

    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, hasMX: false, reason: "No MX records found" }
    }

    const sortedRecords = mxRecords.sort((a, b) => a.priority - b.priority)

    for (const record of sortedRecords) {
      const isValid = await verifyWithNodemailer(email, record.exchange)
      if (isValid) return { valid: true, hasMX: true }
    }

    console.log("No valid mail server found for SMTP verification")
    return { valid: false, hasMX: true, reason: "SMTP verification failed" }
  } catch (error) {
    console.error("Verification error:", error)
    return { valid: false, hasMX: false, reason: "Verification error" }
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ valid: false, hasMX: false, reason: "Invalid email format" }, { status: 400 })
    }

    const result = await verifyEmailSMTP(email)
    console.log("SMTP verification result:", result)
    return NextResponse.json(result)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ valid: false, hasMX: false, reason: "Server error" }, { status: 500 })
  }
}
