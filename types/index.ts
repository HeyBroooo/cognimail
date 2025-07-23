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
  createdAt: any;
  subject?: string;
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
  imageStatus: string;
  verificationStatus: "Valid" | "Invalid" | "Insufficient data" | "Not verified";
  privacyPolicyStatus: "Valid" | "Invalid" | "Missing";
  privacyPolicyUrl?: string;
  puterResponse: string; // Added to store raw Puter AI response
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