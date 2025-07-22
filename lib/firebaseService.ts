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
  createdAt: Timestamp
  updatedAt: Timestamp
  emailLists: EmailList[]
  totalValidEmails: number
  totalInvalidEmails: number
  limit: string
  templates: Template[];
}

export interface EmailList {
  id: string
  title: string
  validEmails: string[]
  invalidEmails: string[]
  totalEmails: number
  createdAt: Timestamp
  status: "processing" | "completed" | "failed"
}

export interface Template {
  id: string;
  title: string;
  design: any;
  html: string;
  plaintext: string;
  score: number;
  createdAt: Timestamp;
}

export interface GlobalEmail {
  email: string
  isValid: boolean
  addedBy: string
  addedAt: Timestamp
  listTitle: string
}

export const createOrUpdateUser = async (userData: {
  id: string
  email: string
  fullName: string
}) => {
  try {
    const userRef = doc(db, "users", userData.id)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      // Create new user with initial limit
      const newUser: UserData = {
        ...userData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        emailLists: [],
        templates: [],
        totalValidEmails: 0,
        totalInvalidEmails: 0,
        limit: "1000",
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


export const saveTemplate = async (userId: string, template: Omit<Template, "id" | "createdAt">) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const templateId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTemplate: Template = {
      id: templateId,
      ...template,
      createdAt: Timestamp.now(),
    };

    await updateDoc(userRef, {
      templates: arrayUnion(newTemplate),
      updatedAt: Timestamp.now(),
    });

    return newTemplate;
  } catch (error) {
    console.error("Error saving template:", error);
    throw error;
  }
};

export const getUserTemplates = async (userId: string): Promise<Template[]> => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserData;
      return userData.templates || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching user templates:", error);
    return [];
  }
};


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

export const updateUserLimit = async (userId: string, emailCount: number) => {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserData
      const currentLimit = parseInt(userData.limit || "1000", 10)
      const newLimit = Math.max(0, currentLimit - emailCount)
      await updateDoc(userRef, {
        limit: newLimit.toString(),
        updatedAt: serverTimestamp(),
      })
    }
  } catch (error) {
    console.error("Error updating user limit:", error)
    throw error
  }
}

export const createEmailList = async (userId: string, title: string, totalEmails: number): Promise<string> => {
  try {
    const listId = `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const emailList: EmailList = {
      id: listId,
      title,
      validEmails: [],
      invalidEmails: [],
      totalEmails,
      createdAt: Timestamp.now(),
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
        addedAt: Timestamp.now(),
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
        addedAt: Timestamp.now(),
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

export const checkEmailInGlobal = async (
  email: string,
): Promise<{
  exists: boolean
  isValid?: boolean
  source?: string
}> => {
  try {
    // Normalize email to avoid case sensitivity issues
    const normalizedEmail = email.toLowerCase().trim()

    // Check in global valid emails collection
    const validQuery = query(collection(db, "globalValidEmails"), where("email", "==", normalizedEmail))
    const validDocs = await getDocs(validQuery)

    if (!validDocs.empty) {
      const docData = validDocs.docs[0].data() as GlobalEmail
      return {
        exists: true,
        isValid: true,
        source: docData.listTitle,
      }
    }

    // Check in global invalid emails collection
    const invalidQuery = query(collection(db, "globalInvalidEmails"), where("email", "==", normalizedEmail))
    const invalidDocs = await getDocs(invalidQuery)

    if (!invalidDocs.empty) {
      const docData = invalidDocs.docs[0].data() as GlobalEmail
      return {
        exists: true,
        isValid: false,
        source: docData.listTitle,
      }
    }

    // Email not found in either collection
    return {
      exists: false,
    }
  } catch (error) {
    console.error("Error checking email in global collections:", error)
    throw error
  }
}