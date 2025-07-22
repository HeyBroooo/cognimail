import { parse } from "papaparse"
import { checkEmailInGlobal } from "./firebaseService"

interface ValidationResult {
  email: string
  syntax: boolean
  domain: boolean
  hasMX: boolean
  isDisposable: boolean
  isRoleBased: boolean
  typoDetected: boolean
  smtpValid: boolean
  isCatchAll: boolean
  score: number
  details: string[]
  source?: string
}

export interface EmailStatus {
  email: string
  status: "pending" | "processing" | "completed" | "failed"
  result?: ValidationResult
  processingTime?: number
}

export interface ProcessResult {
  length: number
  validEmails: string[]
  invalidEmails: string[]
  details: ValidationResult[]
}

const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
const disposableDomains = new Set(["tempmail.com", "mailinator.com", "temp-mail.org", "yopmail.com"])
const rolePrefixes = new Set(["admin", "info", "support", "sales", "contact", "noreply"])
const commonTypos: Record<string, string> = { "gmial.com": "gmail.com", "yaho.com": "yahoo.com" }
const mxCache: Map<string, boolean> = new Map()

const checkSMTP = async (email: string, signal: AbortSignal): Promise<{ valid: boolean; hasMX: boolean }> => {
  try {
    console.log("verification started")
    const response = await fetch("/api/smtp-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      signal,
    })
    console.log("verification completed")
    console.log("Response status:", response.status)
    if (!response.ok) throw new Error("SMTP verification failed")
    return await response.json()
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error
    }
    console.error("SMTP check error:", error)
    return { valid: false, hasMX: false }
  }
}

const validateEmail = async (email: string, signal: AbortSignal): Promise<ValidationResult> => {
  console.log(`Validating: ${email}`)

  // First check if email exists in global database
  const globalCheck = await checkEmailInGlobal(email)
  if (globalCheck.exists) {
    return {
      email,
      syntax: emailRegex.test(email),
      domain: globalCheck.isValid || false,
      hasMX: globalCheck.isValid || false,
      isDisposable: false,
      isRoleBased: false,
      typoDetected: false,
      smtpValid: globalCheck.isValid || false,
      isCatchAll: false,
      score: globalCheck.isValid ? 100 : 0,
      details: [`Found in ${globalCheck.source}`],
      source: globalCheck.source,
    }
  }

  const validation: ValidationResult = {
    email,
    syntax: emailRegex.test(email),
    domain: false,
    hasMX: false,
    isDisposable: false,
    isRoleBased: false,
    typoDetected: false,
    smtpValid: false,
    isCatchAll: false,
    score: 0,
    details: [],
  }

  if (!validation.syntax) {
    validation.details.push("Invalid email format")
    validation.score = 0
    return validation
  }

  const [localPart, domain] = email.split("@")
  validation.isDisposable = disposableDomains.has(domain)
  if (validation.isDisposable) {
    validation.details.push("Disposable email domain detected")
  }

  validation.isRoleBased = rolePrefixes.has(localPart.toLowerCase())
  if (validation.isRoleBased) {
    validation.details.push("Role-based email detected")
  }

  validation.typoDetected = domain in commonTypos
  if (validation.typoDetected) {
    validation.details.push(`Possible typo: ${domain} → ${commonTypos[domain]}`)
  }

  if (mxCache.has(domain)) {
    validation.hasMX = mxCache.get(domain)!
  } else {
    const smtpResult = await checkSMTP(email, signal)
    validation.hasMX = smtpResult.hasMX
    validation.smtpValid = smtpResult.valid
    validation.domain = validation.hasMX && validation.smtpValid
    mxCache.set(domain, validation.hasMX)
  }

  if (!validation.hasMX) {
    validation.details.push("No valid mail server found")
  }

  if (!validation.smtpValid) {
    validation.details.push("SMTP validation failed")
  }

  if (validation.smtpValid) {
    validation.score = 100
  } else if (validation.hasMX) {
    validation.score = 75
  } else if (validation.syntax) {
    validation.score = 50
  } else {
    validation.score = 0
  }

  return validation
}

const extractEmailsFromCSV = async (file: File): Promise<string[]> => {
  console.log("Extracting emails...")
  const text = await file.text()
  const result = parse<string[]>(text, { skipEmptyLines: true })
  return [...new Set(result.data.flat().filter(Boolean))]
}

// Update the processEmailFile function signature to include more live updates
const processEmailFile = async (
  file: File,
  onProgress?: (
    progress: number,
    emailStatuses: EmailStatus[],
    currentIndex: number,
    processedCount: number,
    currentEmail: string | null,
    recentCompleted: string[],
  ) => void,
  signal?: AbortSignal,
): Promise<ProcessResult> => {
  console.log(`Processing file: ${file.name}`)

  if (file.type !== "text/csv") {
    console.log("Unsupported file type.")
    return { validEmails: [], invalidEmails: [], details: [], length: 0 }
  }

  const emails = await extractEmailsFromCSV(file)
  const result: ProcessResult = { validEmails: [], invalidEmails: [], details: [], length: emails.length }

  // Initialize email statuses
  const emailStatuses: EmailStatus[] = emails.map((email) => ({
    email,
    status: "pending",
  }))

  console.time("Processing time")

  let processedCount = 0
  const recentlyCompleted: string[] = []

  // Process emails sequentially to show real-time progress
  for (let i = 0; i < emails.length; i++) {
    if (signal?.aborted) {
      throw new DOMException("Validation aborted", "AbortError")
    }

    const email = emails[i]
    const startTime = Date.now()

    // Update status to processing and notify current email
    emailStatuses[i].status = "processing"

    if (onProgress) {
      onProgress(
        Math.round((i / emails.length) * 100),
        [...emailStatuses],
        i,
        processedCount,
        email, // current email being processed
        [...recentlyCompleted],
      )
    }

    try {
      const validation = await validateEmail(email, signal!)
      const processingTime = Date.now() - startTime

      emailStatuses[i] = {
        email,
        status: "completed",
        result: validation,
        processingTime,
      }

      if (validation.score >= 90) {
        result.validEmails.push(validation.email)
      } else {
        result.invalidEmails.push(validation.email)
      }

      result.details.push(validation)
      processedCount++

      // Add to recently completed (keep last 5)
      recentlyCompleted.unshift(email)
      if (recentlyCompleted.length > 5) {
        recentlyCompleted.pop()
      }
    } catch (error) {
      console.error(`Validation failed for email: ${email}`, error)
      emailStatuses[i].status = "failed"
    }

    if (onProgress) {
      const progress = Math.round(((i + 1) / emails.length) * 100)
      onProgress(
        progress,
        [...emailStatuses],
        i,
        processedCount,
        i + 1 < emails.length ? emails[i + 1] : null, // next email or null if done
        [...recentlyCompleted],
      )
    }

    // Small delay to make the progress more visible (remove in production if too slow)
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  console.timeEnd("Processing time")
  console.log(`Valid: ${result.validEmails.length}, Invalid: ${result.invalidEmails.length}`)

  return result
}

export default processEmailFile
