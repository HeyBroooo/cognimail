"use client"
import { useState, useRef, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import processEmailFile, { type ProcessResult, type EmailStatus } from "../lib/processEmailFile"
import { createOrUpdateUser, createEmailList, updateEmailListResults, updateUserLimit } from "../lib/firebaseService"

interface BackgroundProcessState {
  isProcessing: boolean
  progress: number
  result: ProcessResult | null
  error: string | null
  listTitle: string
  currentListId: string | null
  emailStatuses: EmailStatus[]
  currentEmailIndex: number
  estimatedTimeRemaining: number
  startTime: number | null
  processedCount: number
  totalCount: number
  currentlyProcessingEmail: string | null
  processingSpeed: number
  recentlyCompletedEmails: string[]
}

export const useBackgroundProcess = () => {
  const { user } = useUser()
  const [state, setState] = useState<BackgroundProcessState>({
    isProcessing: false,
    progress: 0,
    result: null,
    error: null,
    listTitle: "",
    currentListId: null,
    emailStatuses: [],
    currentEmailIndex: 0,
    estimatedTimeRemaining: 0,
    startTime: null,
    processedCount: 0,
    totalCount: 0,
    currentlyProcessingEmail: null,
    processingSpeed: 0,
    recentlyCompletedEmails: [],
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const calculateEstimatedTime = (
    processedCount: number,
    totalCount: number,
    startTime: number,
  ): { estimatedTime: number; speed: number } => {
    if (processedCount === 0) return { estimatedTime: 0, speed: 0 }

    const elapsedTime = Date.now() - startTime
    const speed = processedCount / (elapsedTime / 1000)
    const averageTimePerEmail = elapsedTime / processedCount
    const remainingEmails = totalCount - processedCount

    return {
      estimatedTime: Math.ceil((remainingEmails * averageTimePerEmail) / 1000),
      speed: Math.round(speed * 100) / 100,
    }
  }

  const startProcess = useCallback(
    async (file: File, listTitle: string, emailCount: number) => {
      if (!user) {
        setState((prev) => ({ ...prev, error: "User not authenticated" }))
        return
      }

      const startTime = Date.now()

      setState((prev) => ({
        ...prev,
        isProcessing: true,
        progress: 0,
        result: null,
        error: null,
        listTitle,
        startTime,
        processedCount: 0,
        emailStatuses: [],
        currentEmailIndex: 0,
        estimatedTimeRemaining: 0,
        totalCount: emailCount,
      }))

      abortControllerRef.current = new AbortController()

      try {
        // Create or update user in Firebase
        await createOrUpdateUser({
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          fullName: user.fullName || user.primaryEmailAddress?.emailAddress || "User",
        })

        // Create email list in Firebase
        const listId = await createEmailList(user.id, listTitle, emailCount)
        setState((prev) => ({ ...prev, currentListId: listId }))

        // Process emails
        const result = await processEmailFile(
          file,
          (progress, emailStatuses, currentIndex, processedCount, currentEmail, recentCompleted) => {
            const { estimatedTime, speed } = calculateEstimatedTime(processedCount, emailCount, startTime)

            setState((prev) => ({
              ...prev,
              progress,
              emailStatuses,
              currentEmailIndex: currentIndex,
              processedCount,
              estimatedTimeRemaining: estimatedTime,
              processingSpeed: speed,
              currentlyProcessingEmail: currentEmail,
              recentlyCompletedEmails: recentCompleted || [],
            }))
          },
          abortControllerRef.current.signal,
        )

        // Update Firebase with results and user limit
        await updateEmailListResults(user.id, listId, result.validEmails, result.invalidEmails)
        await updateUserLimit(user.id, emailCount)

        setState((prev) => ({
          ...prev,
          isProcessing: false,
          result,
          progress: 100,
          estimatedTimeRemaining: 0,
        }))

        // Show notification when process completes
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Email Validation Complete", {
            body: `"${listTitle}" processed: ${result.validEmails.length} valid, ${result.invalidEmails.length} invalid emails.`,
            icon: "/favicon.ico",
          })
        }

        return result
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setState((prev) => ({
            ...prev,
            isProcessing: false,
            error: "Process cancelled",
          }))
        } else {
          setState((prev) => ({
            ...prev,
            isProcessing: false,
            error: "Process failed. Please try again.",
          }))
        }
        throw err
      }
    },
    [user],
  )

  const cancelProcess = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  const resetProcess = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setState({
      isProcessing: false,
      progress: 0,
      result: null,
      error: null,
      listTitle: "",
      currentListId: null,
      emailStatuses: [],
      currentEmailIndex: 0,
      estimatedTimeRemaining: 0,
      startTime: null,
      processedCount: 0,
      totalCount: 0,
      currentlyProcessingEmail: null,
      processingSpeed: 0,
      recentlyCompletedEmails: [],
    })
  }, [])

  return {
    ...state,
    startProcess,
    cancelProcess,
    resetProcess,
  }
}