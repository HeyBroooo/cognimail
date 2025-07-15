"use client"

import { useState, useRef, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import processEmailFile, { type ProcessResult } from "../lib/processEmailFile"
import { createOrUpdateUser, createEmailList, updateEmailListResults } from "../lib/firebaseService"



interface BackgroundProcessState {
  isProcessing: boolean
  progress: number
  result: ProcessResult | null
  error: string | null
  listTitle: string
  currentListId: string | null
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
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const startProcess = useCallback(
    async (file: File, listTitle: string) => {
      if (!user) {
        setState((prev) => ({ ...prev, error: "User not authenticated" }))
        return
      }

      setState((prev) => ({
        ...prev,
        isProcessing: true,
        progress: 0,
        result: null,
        error: null,
        listTitle,
      }))

      abortControllerRef.current = new AbortController()

      try {
        // Create or update user in Firebase
        await createOrUpdateUser({
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          fullName: user.fullName || user.primaryEmailAddress?.emailAddress || "User",
        })

        // Get total emails count first
        const text = await file.text()
        const emailCount = text.split("\n").filter((line) => line.trim()).length

        // Create email list in Firebase
        const listId = await createEmailList(user.id, listTitle, emailCount)

        setState((prev) => ({ ...prev, currentListId: listId }))

        const result = await processEmailFile(
          file,
          (progress) => {
            setState((prev) => ({ ...prev, progress }))
          },
          abortControllerRef.current.signal,
        )

        // Update Firebase with results
        await updateEmailListResults(user.id, listId, result.validEmails, result.invalidEmails)

        setState((prev) => ({
          ...prev,
          isProcessing: false,
          result,
          progress: 100,
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
    })
  }, [])

  return {
    ...state,
    startProcess,
    cancelProcess,
    resetProcess,
  }
}
