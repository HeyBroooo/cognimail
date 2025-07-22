// src/types/index.ts
export interface UserInterface {
  userId: string;
  username: string;
  email: string;
  templates: any[];
  campaigns: any[];
  remainingEmail: number;
  membership: string;
  emailUse: number;
}

export interface Template {
  id: string;
  title: string;
  design: any;
  html: string;
  plaintext: string;
  score: number;
  createdAt: import("firebase/firestore").Timestamp;
}

export interface AnalysisWarning {
  type: "error" | "warning" | "info";
  message: string;
  code: string;
  suggestion?: string;
  location?: string;
  replacementText?: string;
  element?: HTMLElement;
}

export interface EmailMetrics {
  textToImageRatio: number;
  linkCount: number;
  spamScore: number;
  complianceScore: number;
  subjectLineScore: number;
  ctaScore: number;
  mobileScore: number;
  totalScore: number;
  companyName?: string;
  address?: string;
  imageStatus?: string;
  verificationStatus?: "Valid" | "Invalid" | "Insufficient data" | "Not verified";
  privacyPolicyStatus?: "Valid" | "Invalid" | "Missing";
  privacyPolicyUrl?: string;
}