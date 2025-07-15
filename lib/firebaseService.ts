import { db } from "./firebase"
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore"

export interface UserData {
  id: string
  email: string
  fullName: string
  createdAt: any
  updatedAt: any
  emailLists: EmailList[]
  totalValidEmails: number
  totalInvalidEmails: number
}

export interface EmailList {
  id: string
  title: string
  validEmails: string[]
  invalidEmails: string[]
  totalEmails: number
  createdAt: any
  status: "processing" | "completed" | "failed"
}

export interface GlobalEmail {
  email: string
  isValid: boolean
  addedBy: string
  addedAt: any
  listTitle: string
}

// User Collection Operations
export const createOrUpdateUser = async (userData: {
  id: string
  email: string
  fullName: string
}) => {
  try {
    const userRef = doc(db, "users", userData.id)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      // Create new user
      const newUser: UserData = {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailLists: [],
        totalValidEmails: 0,
        totalInvalidEmails: 0,
      }
      await setDoc(userRef, newUser)
      return newUser
    } else {
      // Update existing user
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp(),
      })
      return userDoc.data() as UserData
    }
  } catch (error) {
    console.error("Error creating/updating user:", error)
    throw error
  }
}

export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)
    return userDoc.exists() ? (userDoc.data() as UserData) : null
  } catch (error) {
    console.error("Error getting user data:", error)
    return null
  }
}

// Email List Operations
export const createEmailList = async (userId: string, title: string, totalEmails: number): Promise<string> => {
  try {
    const listId = `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const emailList: EmailList = {
      id: listId,
      title,
      validEmails: [],
      invalidEmails: [],
      totalEmails,
      createdAt: Timestamp.now(), // Use Timestamp.now() instead of serverTimestamp()
      status: "processing",
    }

    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      emailLists: arrayUnion(emailList),
      updatedAt: serverTimestamp(),
    })

    return listId
  } catch (error) {
    console.error("Error creating email list:", error)
    throw error
  }
}

export const updateEmailListResults = async (
  userId: string,
  listId: string,
  validEmails: string[],
  invalidEmails: string[],
) => {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      const userData = userDoc.data() as UserData
      const updatedLists = userData.emailLists.map((list) => {
        if (list.id === listId) {
          return {
            ...list,
            validEmails,
            invalidEmails,
            status: "completed" as const,
          }
        }
        return list
      })

      await updateDoc(userRef, {
        emailLists: updatedLists,
        totalValidEmails: userData.totalValidEmails + validEmails.length,
        totalInvalidEmails: userData.totalInvalidEmails + invalidEmails.length,
        updatedAt: serverTimestamp(),
      })

      // Add to global collections
      await addToGlobalEmails(
        userId,
        validEmails,
        invalidEmails,
        userData.emailLists.find((l) => l.id === listId)?.title || "Untitled",
      )
    }
  } catch (error) {
    console.error("Error updating email list results:", error)
    throw error
  }
}

// Global Email Collections
export const addToGlobalEmails = async (
  userId: string,
  validEmails: string[],
  invalidEmails: string[],
  listTitle: string,
) => {
  try {
    const batch = []

    // Add valid emails to global collection
    for (const email of validEmails) {
      const globalEmail: GlobalEmail = {
        email,
        isValid: true,
        addedBy: userId,
        addedAt: Timestamp.now(), // Use Timestamp.now() instead of serverTimestamp()
        listTitle,
      }
      batch.push(addDoc(collection(db, "globalValidEmails"), globalEmail))
    }

    // Add invalid emails to global collection
    for (const email of invalidEmails) {
      const globalEmail: GlobalEmail = {
        email,
        isValid: false,
        addedBy: userId,
        addedAt: Timestamp.now(), // Use Timestamp.now() instead of serverTimestamp()
        listTitle,
      }
      batch.push(addDoc(collection(db, "globalInvalidEmails"), globalEmail))
    }

    await Promise.all(batch)
  } catch (error) {
    console.error("Error adding to global emails:", error)
    throw error
  }
}

// Check if email exists in global collections
export const checkEmailInGlobal = async (
  email: string,
): Promise<{
  exists: boolean
  isValid?: boolean
  source?: string
}> => {
  try {
    // Check in valid emails
    const validQuery = query(collection(db, "globalValidEmails"), where("email", "==", email))
    const validDocs = await getDocs(validQuery)

    if (!validDocs.empty) {
      return {
        exists: true,
        isValid: true,
        source: "global_database",
      }
    }

    // Check in invalid emails
    const invalidQuery = query(collection(db, "globalInvalidEmails"), where("email", "==", email))
    const invalidDocs = await getDocs(invalidQuery)

    if (!invalidDocs.empty) {
      return {
        exists: true,
        isValid: false,
        source: "global_database",
      }
    }

    return { exists: false }
  } catch (error) {
    console.error("Error checking email in global:", error)
    return { exists: false }
  }
}

// Alternative approach using batch writes for better performance
export const addToGlobalEmailsBatch = async (
  userId: string,
  validEmails: string[],
  invalidEmails: string[],
  listTitle: string,
) => {
  try {
    const { writeBatch } = await import("firebase/firestore")
    const batch = writeBatch(db)

    // Add valid emails to global collection
    for (const email of validEmails) {
      const globalEmail: GlobalEmail = {
        email,
        isValid: true,
        addedBy: userId,
        addedAt: Timestamp.now(),
        listTitle,
      }
      const docRef = doc(collection(db, "globalValidEmails"))
      batch.set(docRef, globalEmail)
    }

    // Add invalid emails to global collection
    for (const email of invalidEmails) {
      const globalEmail: GlobalEmail = {
        email,
        isValid: false,
        addedBy: userId,
        addedAt: Timestamp.now(),
        listTitle,
      }
      const docRef = doc(collection(db, "globalInvalidEmails"))
      batch.set(docRef, globalEmail)
    }

    await batch.commit()
  } catch (error) {
    console.error("Error adding to global emails with batch:", error)
    throw error
  }
}