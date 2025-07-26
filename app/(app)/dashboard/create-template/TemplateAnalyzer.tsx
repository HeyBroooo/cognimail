import React, { useEffect, useState, useRef } from "react";
import { AlertCircle, X, CheckCircle, Info, Zap, Eye } from "lucide-react";
import { gsap } from "gsap";
import { toast } from "sonner";
import { AnalysisWarning, EmailMetrics } from "@/types";

interface TemplateAnalyzerProps {
  html: string;
  onClose: () => void;
  onApplyFix: (fixedHtml: string) => void;
  onScoreUpdate?: (score: number) => void;
}

const SPAM_WORDS_REPLACEMENTS: { [key: string]: string } = {
  free: "complimentary",
  Free: "Complimentary",
  offer: "opportunity",
  win: "earn",
  winner: "achiever",
  guaranteed: "assured",
  "buy now": "learn more",
  "order now": "get started",
  "click here": "learn more",
  urgent: "important",
  "limited time": "exclusive offer",
  cash: "payment",
  price: "value",
  discount: "savings",
  "act now": "start today",
  amazing: "impressive",
  "cancel at any time": "flexible options",
  cheap: "affordable",
  click: "view",
  congratulations: "well done",
  deal: "offer",
  "direct marketing": "personalized communication",
  "double your income": "increase your earnings",
  "earn money": "build revenue",
  "eliminate debt": "reduce financial burden",
  "exclusive deal": "special opportunity",
  expire: "end soon",
  "get paid": "receive compensation",
  "increase sales": "grow your business",
  "incredible deal": "exceptional value",
  member: "customer",
  money: "funds",
  opportunity: "possibility",
  "order today": "explore now",
  promise: "commitment",
  sale: "special pricing",
  "sign up free": "join at no cost",
  trial: "preview",
};

const COMPLIANCE_REQUIREMENTS = [
  { key: "unsubscribe", description: "Unsubscribe link or option" },
  { key: "address", description: "Physical business address" },
  { key: "(contact|tel|phone|email)", description: "Contact information" },
  { key: "company name", description: "Company or sender name" },
  { key: "privacy[ -]?policy", description: "Privacy policy link" },
];

const CTA_BEST_PRACTICES = [
  {
    pattern: /click here/i,
    recommendation: "Use more descriptive CTA text like 'Learn More' or 'View Details'",
  },
  {
    pattern: /buy now/i,
    recommendation: "Consider softer CTAs like 'Shop Now' or 'Explore Options'",
  },
  {
    pattern: /submit/i,
    recommendation: "Use more engaging CTAs like 'Get Started' or 'Join Today'",
  },
  {
    pattern: /sign up/i,
    recommendation: "Try 'Join Now' or 'Create Account' for better engagement",
  },
];

interface PrivacyPolicyResult {
  status: "Valid" | "Invalid" | "Missing";
  details: string;
  url?: string;
}

interface CompanyDetails {
  companyName?: string;
  address?: string;
  rawResponse: string;
}

const detectPrivacyPolicy = async (html: string): Promise<PrivacyPolicyResult> => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const links = Array.from(doc.querySelectorAll("a"));
  const bodyText = doc.body.textContent?.toLowerCase() || "";

  const privacyKeywords = [
    "privacy",
    "policy",
    "data protection",
    "confidentiality",
    "personal data",
    "datenschutz",
    "privatsphäre",
    "privacidad",
    "protección de datos",
    "confidentialité",
    "protection des données",
    "プライバシー",
    "個人情報",
    "خصوصية",
    "سياسة الخصوصية",
    "privacidade",
    "proteção de dados",
    "конфиденциальность",
    "защита данных",
  ];

  const privacyLinks = links.filter((link) => {
    const href = link.getAttribute("href")?.toLowerCase() || "";
    const text = link.textContent?.toLowerCase() || "";
    const ariaLabel = link.getAttribute("aria-label")?.toLowerCase() || "";
    return privacyKeywords.some(
      (keyword) =>
        href.includes(keyword) || text.includes(keyword) || ariaLabel.includes(keyword)
    );
  });

  if (privacyLinks.length === 0) {
    const hasPrivacyText = privacyKeywords.some((keyword) => bodyText.includes(keyword));
    return {
      status: hasPrivacyText ? "Invalid" : "Missing",
      details: hasPrivacyText
        ? "Privacy policy mentioned but no valid link found"
        : "No privacy policy detected",
    };
  }

  for (const link of privacyLinks) {
    const href = link.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.includes("placeholder")) {
      continue;
    }

    try {
      const url = new URL(
        href.startsWith("http") ? href : `https://example.com${href.startsWith("/") ? "" : "/"}${href}`
      );
      const genericDomains = [
        "google.com",
        "facebook.com",
        "twitter.com",
        "example.com",
        "yourwebsite.com",
        "domain.com",
        "website.com",
        "company.com",
        "business.com",
      ];

      if (genericDomains.some((domain) => url.hostname.includes(domain))) {
        return {
          status: "Invalid",
          details: "Privacy policy link points to a generic domain",
          url: href,
        };
      }

      if (
        href.includes("{{") ||
        href.includes("}}") ||
        href.includes("%7B%7B") ||
        href.includes("%7D%7D")
      ) {
        return {
          status: "Invalid",
          details: "Privacy policy link contains template variables",
          url: href,
        };
      }

      if (href.match(/\[.*\]/) || href.match(/%5B.*%5D/)) {
        return {
          status: "Invalid",
          details: "Privacy policy link contains invalid characters",
          url: href,
        };
      }

      return {
        status: "Valid",
        details: "Valid privacy policy link found",
        url: href,
      };
    } catch (error) {
      console.log("Invalid URL in privacy policy link:", error);
      continue;
    }
  }

  const firstInvalidUrl = privacyLinks[0]?.getAttribute("href") || "";
  return {
    status: "Invalid",
    details: "Privacy policy links found but none are valid",
    url: firstInvalidUrl,
  };
};

const TemplateAnalyzer: React.FC<TemplateAnalyzerProps> = ({
  html,
  onClose,
  onApplyFix,
  onScoreUpdate,
}) => {
  const [warnings, setWarnings] = useState<AnalysisWarning[]>([]);
  const [metrics, setMetrics] = useState<EmailMetrics>({
    textToImageRatio: 0,
    linkCount: 0,
    spamScore: 100,
    complianceScore: 100,
    subjectLineScore: 100,
    ctaScore: 100,
    mobileScore: 100,
    totalScore: 100,
    verificationStatus: "Not verified",
    imageStatus: "0/0 uploaded",
    privacyPolicyStatus: "Missing",
    puterResponse: "",
  });
  const [optimizedVersion, setOptimizedVersion] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"issues" | "metrics" | "optimized">("issues");
  const [highlightMode, setHighlightMode] = useState<boolean>(false);
  const [showOptimizedPreview, setShowOptimizedPreview] = useState<boolean>(false);
  const [fixesApplied, setFixesApplied] = useState<boolean>(false);
  const [showLegalPrompt, setShowLegalPrompt] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const analyzerRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    const legalPromptDismissed = localStorage.getItem("legalPromptDismissed");
    if (legalPromptDismissed === "true") {
      setShowLegalPrompt(false);
    }

    gsap.fromTo(
      analyzerRef.current,
      { x: 400, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
    );
  }, []);

  const extractCompanyDetails = async (text: string): Promise<CompanyDetails> => {
    const response = await (window as any).puter.ai.chat(
      `Extract the company name and physical address from the following text. Look for explicit labels like "Company Name = [value]" or "Company Address = [value]" as well as natural text where a company name or address might be mentioned. If the value is empty, a placeholder (e.g., {{...}}), or not found, return "Not detected" for that field. Return the result as a JSON object with keys "companyName" and "address":\n\n${text}`
    );

    let companyName = "Not detected";
    let address = "Not detected";
    try {
      const parsedResult = JSON.parse(response);
      companyName =
        parsedResult.companyName &&
        parsedResult.companyName.trim() !== "" &&
        !parsedResult.companyName.match(/^{{.*}}$/)
          ? parsedResult.companyName
          : "Not detected";
      address =
        parsedResult.address &&
        parsedResult.address.trim() !== "" &&
        !parsedResult.address.match(/^{{.*}}$/)
          ? parsedResult.address
          : "Not detected";
    } catch (error) {
      console.warn("Failed to parse AI response as JSON:", error);
    }

    return { companyName, address, rawResponse: response };
  };

  const verifyCompanyDetails = async (companyName: string, address: string): Promise<"Valid" | "Invalid" | "Insufficient data" | "Not verified"> => {
    const response = await (window as any).puter.ai.chat(
      `Verify if the following company name and address are plausible and consistent:\nCompany Name: ${companyName}\nAddress: ${address}\nReturn "Valid", "Invalid", or "Insufficient data"`
    );
    const trimmedResponse = response.trim();
    if (["Valid", "Invalid", "Insufficient data"].includes(trimmedResponse)) {
      return trimmedResponse as "Valid" | "Invalid" | "Insufficient data";
    }
    return "Not verified";
  };

  const getEnhancedSuggestion = async (issue: string): Promise<string> => {
    const response = await (window as any).puter.ai.chat(
      `Provide a clear and actionable suggestion to fix the following email template issue. Include specific steps or examples where applicable: ${issue}`
    );
    return response.trim();
  };

  const analyzeTemplate = async (html: string) => {
    setIsLoading(true);
    const newWarnings: AnalysisWarning[] = [];
    let scoreDeduction = 0;
    let complianceScoreAdjustment = 0;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const bodyText = doc.body.textContent || "";
    const footer = doc.querySelector("footer");
    const textToAnalyze = footer ? footer.textContent || bodyText : bodyText;

    const { companyName, address, rawResponse } = await extractCompanyDetails(textToAnalyze);
    const privacyPolicyResult = await detectPrivacyPolicy(html);

    setMetrics((prev) => ({
      ...prev,
      privacyPolicyUrl: privacyPolicyResult.url,
      privacyPolicyStatus: privacyPolicyResult.status,
      puterResponse: rawResponse,
    }));

    if (companyName === "Not detected" || !companyName) {
      const suggestionText = await getEnhancedSuggestion("Missing company name");
      newWarnings.push({
        type: "error",
        message: "Company name not detected or empty",
        code: "COMPLIANCE_COMPANY",
        suggestion: suggestionText,
      });
      complianceScoreAdjustment += 15;
      scoreDeduction += 10;
    }

    if (address === "Not detected" || !address) {
      const suggestionText = await getEnhancedSuggestion("Missing physical address");
      newWarnings.push({
        type: "error",
        message: "Physical address not detected or invalid",
        code: "COMPLIANCE_ADDRESS",
        suggestion: suggestionText,
      });
      complianceScoreAdjustment += 15;
      scoreDeduction += 10;
    }

    if (privacyPolicyResult.status !== "Valid") {
      let suggestionText = "";
      if (privacyPolicyResult.status === "Missing") {
        suggestionText = "Add a valid privacy policy link in the email footer (e.g., '<a href=\"https://yourwebsite.com/privacy\">Privacy Policy</a>'). Ensure it uses 'Privacy Policy' or its equivalent in your language and points to your actual policy page.";
      } else if (privacyPolicyResult.url) {
        if (privacyPolicyResult.url.includes("{{")) {
          suggestionText = "Replace the template variable in your privacy policy link with a valid URL (e.g., '<a href=\"https://yourwebsite.com/privacy\">Privacy Policy</a>').";
        } else if (privacyPolicyResult.url.includes("google.com")) {
          suggestionText = "Replace the generic Google link with your actual privacy policy URL (e.g., '<a href=\"https://yourwebsite.com/privacy\">Privacy Policy</a>').";
        } else {
          suggestionText = "Ensure the privacy policy link is valid and points to your policy page. Manually replace any incorrect links with '<a href=\"https://yourwebsite.com/privacy\">Privacy Policy</a>'.";
        }
      }

      newWarnings.push({
        type: privacyPolicyResult.status === "Missing" ? "error" : "warning",
        message: privacyPolicyResult.details,
        code: "COMPLIANCE_PRIVACY",
        suggestion: suggestionText,
        location: privacyPolicyResult.url ? `Link: ${privacyPolicyResult.url}` : undefined,
      });
      complianceScoreAdjustment += privacyPolicyResult.status === "Missing" ? 15 : 10;
      scoreDeduction += privacyPolicyResult.status === "Missing" ? 10 : 5;
    }

    const images = doc.getElementsByTagName("img");
    let totalImages = 0;
    let uploadedImages = 0;

    Array.from(images).forEach((img) => {
      const src = img.getAttribute("src") || "";
      const alt = img.getAttribute("alt") || "";
      const isFooterImage = src.includes("safeburst.email") || alt.toLowerCase().includes("safeburst");

      if (!isFooterImage) {
        totalImages++;
        if (
          src.trim() !== "" &&
          !src.includes("placeholder") &&
          !src.match(/^data:image\/.*?;base64,/) &&
          img.width > 0
        ) {
          uploadedImages++;
        }
      }
    });

    const imageStatus = `${uploadedImages}/${totalImages} uploaded`;
    if (totalImages === 0) {
      const suggestionText = await getEnhancedSuggestion("No images found in template");
      newWarnings.push({
        type: "warning",
        message: "No images found in template",
        code: "IMAGE_MISSING",
        suggestion: suggestionText,
      });
      scoreDeduction += 5;
    } else if (uploadedImages < totalImages) {
      const suggestionText = await getEnhancedSuggestion(
        `${uploadedImages}/${totalImages} images uploaded`
      );
      newWarnings.push({
        type: "warning",
        message: `${uploadedImages}/${totalImages} images uploaded`,
        code: "PARTIAL_IMAGE_UPLOAD",
        suggestion: suggestionText,
      });
      scoreDeduction += (totalImages - uploadedImages) * 4;
    }

    let verificationStatus: "Valid" | "Invalid" | "Insufficient data" | "Not verified" =
      "Not verified";
    if (companyName !== "Not detected" && address !== "Not detected" && companyName && address) {
      verificationStatus = await verifyCompanyDetails(companyName, address);
      if (verificationStatus === "Invalid") {
        const suggestionText = await getEnhancedSuggestion(
          `Company name "${companyName}" and address "${address}" may be inconsistent or invalid`
        );
        newWarnings.push({
          type: "error",
          message: `Company name "${companyName}" and address "${address}" may be inconsistent or invalid`,
          code: "COMPLIANCE_VERIFICATION",
          suggestion: suggestionText,
        });
        complianceScoreAdjustment += 10;
        scoreDeduction += 8;
      }
    }

    const subjectElement = doc.querySelector('meta[name="subject"], title, h1, h2');
    const subjectLine = subjectElement?.textContent || "";
    if (subjectLine.length > 50) {
      const suggestionText = await getEnhancedSuggestion("Subject line too long");
      newWarnings.push({
        type: "warning",
        message: "Subject line too long",
        code: "SUBJECT_LENGTH",
        suggestion: suggestionText,
        location: "Subject line",
        replacementText: subjectLine.substring(0, 47) + "...",
      });
      scoreDeduction += 5;
    }

    for (const word of Object.keys(SPAM_WORDS_REPLACEMENTS)) {
      if (subjectLine.toLowerCase().includes(word.toLowerCase())) {
        const suggestionText = await getEnhancedSuggestion(
          `Subject contains spam trigger word "${word}"`
        );
        newWarnings.push({
          type: "warning",
          message: `Subject contains spam trigger word "${word}"`,
          code: "SUBJECT_SPAM",
          suggestion: suggestionText,
          location: "Subject line",
          replacementText: SPAM_WORDS_REPLACEMENTS[word],
        });
        scoreDeduction += 8;
      }
    }

    const textLength = bodyText.length;
    const imageCount = totalImages;
    const textToImageRatio = imageCount > 0 ? textLength / imageCount : textLength;

    if (textToImageRatio < 500 && imageCount > 0) {
      const suggestionText = await getEnhancedSuggestion("Low text-to-image ratio");
      newWarnings.push({
        type: "warning",
        message: "Low text-to-image ratio",
        code: "TEXT_IMAGE_RATIO",
        suggestion: suggestionText,
      });
      scoreDeduction += 5;
    }

    Array.from(images).forEach(async (img, imgIndex) => {
      const src = img.getAttribute("src") || "";
      const isFooterImage = src.includes("safeburst.email");
      if (!isFooterImage) {
        if (!img.alt) {
          img.setAttribute("alt", `Image ${uploadedImages > 0 ? imgIndex + 1 : imgIndex} - Email content`);
        }
        if (img.width > 600) {
          const suggestionText = await getEnhancedSuggestion(
            `Image #${uploadedImages > 0 ? imgIndex + 1 : imgIndex} is too wide (${img.width}px)`
          );
          newWarnings.push({
            type: "warning",
            message: `Image #${uploadedImages > 0 ? imgIndex + 1 : imgIndex} is too wide (${img.width}px)`,
            code: "IMG_SIZE",
            suggestion: suggestionText,
            location: `Image #${uploadedImages > 0 ? imgIndex + 1 : imgIndex}`,
            element: img as HTMLElement,
          });
          scoreDeduction += 2;
        }
      }
    });

    const bodyTextLower = bodyText.toLowerCase();
    for (const requirement of COMPLIANCE_REQUIREMENTS) {
      const regex = new RegExp(requirement.key, "i");
      if (
        !regex.test(bodyTextLower) &&
        requirement.key !== "address" &&
        requirement.key !== "company name"
      ) {
        const suggestionText = await getEnhancedSuggestion(`Missing ${requirement.description}`);
        newWarnings.push({
          type: "error",
          message: `Missing ${requirement.description}`,
          code: "COMPLIANCE",
          suggestion: suggestionText,
        });
        scoreDeduction += 10;
      }
    }

    const mandatoryLinks = ["privacy-policy", "unsubscribe", "contact"];
    const links = Array.from(doc.getElementsByTagName("a")).filter(
      (link) => !mandatoryLinks.some((text) => link.href.includes(text))
    );

    if (links.length > 5) {
      const suggestionText = await getEnhancedSuggestion("Too many links");
      newWarnings.push({
        type: "warning",
        message: "Too many links",
        code: "LINK_COUNT",
        suggestion: suggestionText,
      });
      scoreDeduction += 5;
    }

    for (const [linkIndex, link] of Array.from(links).entries()) {
      const linkText = link.textContent?.trim() || "";
      if (
        linkText === "" ||
        linkText.toLowerCase() === "click here" ||
        linkText.toLowerCase() === "link"
      ) {
        const suggestionText = await getEnhancedSuggestion(
          `Link #${linkIndex + 1} has generic text "${linkText}"`
        );
        newWarnings.push({
          type: "warning",
          message: `Link #${linkIndex + 1} has generic text "${linkText}"`,
          code: "LINK_TEXT",
          suggestion: suggestionText,
          location: `Link #${linkIndex + 1}`,
          element: link as HTMLElement,
        });
        scoreDeduction += 3;
      }
    }

    for (const word of Object.keys(SPAM_WORDS_REPLACEMENTS)) {
      if (bodyTextLower.includes(word.toLowerCase())) {
        const elements = Array.from(
          doc.querySelectorAll("p, h1, h2, h3, h4, h5, h6, div, span, a, button, li")
        );
        const matchingElement = elements.find((el) =>
          el.textContent?.toLowerCase().includes(word.toLowerCase())
        );
        const suggestionText = await getEnhancedSuggestion(`Found spam trigger word "${word}"`);
        newWarnings.push({
          type: "warning",
          message: `Found spam trigger word "${word}"`,
          code: "SPAM_WORD",
          suggestion: suggestionText,
          location: matchingElement ? getElementPath(matchingElement) : undefined,
          replacementText: SPAM_WORDS_REPLACEMENTS[word],
          element: matchingElement as HTMLElement,
        });
        scoreDeduction += 3;
      }
    }

    const buttons = doc.querySelectorAll('a[role="button"], button, .btn, .button, a.cta');
    for (const practice of CTA_BEST_PRACTICES) {
      for (const btn of Array.from(buttons)) {
        const text = btn.textContent?.trim() || "";
        if (practice.pattern.test(text)) {
          const suggestionText = await getEnhancedSuggestion(`CTA "${text}" could be improved`);
          newWarnings.push({
            type: "info",
            message: `CTA "${text}" could be improved`,
            code: "CTA_TEXT",
            suggestion: suggestionText,
            location: getElementPath(btn),
            element: btn as HTMLElement,
          });
          scoreDeduction += 2;
        }
      }
    }

    const hasMeta = !!doc.querySelector('meta[name="viewport"]');
    const hasTables = !!doc.querySelector("table");
    const hasFixedWidths = !!doc.querySelector("[width]");
    if (!hasMeta) {
      const suggestionText = await getEnhancedSuggestion("Missing viewport meta tag");
      newWarnings.push({
        type: "warning",
        message: "Missing viewport meta tag",
        code: "RESPONSIVE",
        suggestion: suggestionText,
      });
      scoreDeduction += 3;
    }
    if (hasTables && hasFixedWidths) {
      const suggestionText = await getEnhancedSuggestion(
        "Fixed-width tables may not display well on mobile"
      );
      newWarnings.push({
        type: "warning",
        message: "Fixed-width tables may not display well on mobile",
        code: "RESPONSIVE",
        suggestion: suggestionText,
      });
      scoreDeduction += 4;
    }

    const spamScore = Math.max(0, 100 - scoreDeduction * 1.5);
    const complianceScore = Math.max(0, 100 - scoreDeduction * 2 - complianceScoreAdjustment);
    const subjectLineScore = Math.max(0, 100 - scoreDeduction * 0.8);
    const ctaScore = Math.max(0, 100 - scoreDeduction * 0.6);
    const mobileScore = Math.max(0, 100 - scoreDeduction * 0.7);
    const totalScore = Math.max(0, 100 - scoreDeduction);

    setMetrics({
      textToImageRatio,
      linkCount: links.length,
      spamScore,
      complianceScore,
      subjectLineScore,
      ctaScore,
      mobileScore,
      totalScore,
      companyName,
      address,
      imageStatus,
      verificationStatus,
      privacyPolicyStatus: privacyPolicyResult.status,
      privacyPolicyUrl: privacyPolicyResult.url,
      puterResponse: rawResponse,
    });

    setWarnings(newWarnings);
    if (onScoreUpdate) {
      onScoreUpdate(totalScore);
    }

    generateOptimizedVersion(doc, newWarnings);
    setIsLoading(false);
  };

    useEffect(() => {
    if (html) {
      analyzeTemplate(html);
    }
  }, [html, analyzeTemplate]);



  const getElementPath = (element: Element): string => {
    if (!element) return "Unknown";
    if (element.id) return `#${element.id}`;
    if (element.classList && element.classList.length)
      return `.${Array.from(element.classList).join(".")}`;
    const tagName = element.tagName.toLowerCase();
    const siblings = Array.from(element.parentNode?.children || []).filter(
      (e) => e.tagName === element.tagName
    );
    if (siblings.length > 1) {
      const index = siblings.indexOf(element) + 1;
      return `${tagName}:nth-of-type(${index})`;
    }
    return tagName;
  };

  const generateOptimizedVersion = (doc: Document, warnings: AnalysisWarning[]) => {
    const optimizedDoc = doc.cloneNode(true) as Document;
    const footer = optimizedDoc.querySelector("footer") || optimizedDoc.body;
    let complianceDiv = optimizedDoc.querySelector(".compliance-section");
    if (!complianceDiv) {
      complianceDiv = optimizedDoc.createElement("div");
      complianceDiv.className = "compliance-section";
      (complianceDiv as HTMLElement).style.cssText =
        "margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;";
      footer.appendChild(complianceDiv);
    }

    warnings.forEach((warning) => {
      if (warning.replacementText && warning.element) {
        const element = optimizedDoc.querySelector(getElementPath(warning.element));
        if (element && element.textContent) {
          element.textContent = element.textContent.replace(
            new RegExp(Object.keys(SPAM_WORDS_REPLACEMENTS).join("|"), "gi"),
            (match) => SPAM_WORDS_REPLACEMENTS[match] || match
          );
        }
      }

      if (warning.code === "IMG_SIZE") {
        const images = optimizedDoc.querySelectorAll("img[width]");
        images.forEach((img) => {
          const src = img.getAttribute("src") || "";
          if (!src.includes("safeburst.email")) {
            const currentWidth = parseInt(img.getAttribute("width") || "0", 10);
            if (currentWidth > 600) {
              const aspectRatio =
                (parseInt(img.getAttribute("height") || "0", 10) || 1) / currentWidth;
              img.setAttribute("width", "600");
              img.setAttribute("height", `${Math.round(600 * aspectRatio)}`);
              img.setAttribute(
                "style",
                `${img.getAttribute("style") || ""}; max-width:600px; width:100%;`
              );
            }
          }
        });
      }

      if (warning.code === "RESPONSIVE" && !optimizedDoc.querySelector('meta[name="viewport"]')) {
        const head = optimizedDoc.querySelector("head") || optimizedDoc.createElement("head");
        const viewport = optimizedDoc.createElement("meta");
        viewport.setAttribute("name", "viewport");
        viewport.setAttribute("content", "width=device-width, initial-scale=1.0");
        head.appendChild(viewport);
        optimizedDoc.documentElement.insertBefore(head, optimizedDoc.body);
      }

      if (warning.code === "RESPONSIVE") {
        const tables = optimizedDoc.querySelectorAll("table[width]");
        tables.forEach((table) => {
          table.removeAttribute("width");
          table.setAttribute("style", "width: 100%; max-width: 600px;");
        });
      }

      if (warning.code === "COMPLIANCE_COMPANY") {
        complianceDiv.innerHTML += `<p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>`;
      }

      if (warning.code === "COMPLIANCE_ADDRESS") {
        complianceDiv.innerHTML += `<p>Company Address: Your Physical Address</p>`;
      }

      if (warning.code === "COMPLIANCE_PRIVACY") {
        complianceDiv.innerHTML += `<p><a href="https://yourwebsite.com/privacy">Privacy Policy</a></p>`;
      }

      if (warning.code === "IMAGE_MISSING" || warning.code === "PARTIAL_IMAGE_UPLOAD") {
        const images = optimizedDoc.getElementsByTagName("img");
        Array.from(images).forEach((img) => {
          const src = img.getAttribute("src") || "";
          if (
            (!src || src.trim() === "" || src.includes("placeholder")) &&
            !src.includes("safeburst.email")
          ) {
            img.setAttribute(
              "src",
              "https://via.placeholder.com/600x200?text=Your+Image+Here"
            );
            img.setAttribute("alt", "Placeholder Image");
            img.setAttribute("style", "max-width: 600px; width: 100%;");
          }
        });
      }
    });

    const bodyText = optimizedDoc.body.textContent?.toLowerCase() || "";
    COMPLIANCE_REQUIREMENTS.forEach((requirement) => {
      const regex = new RegExp(requirement.key, "i");
      if (
        !regex.test(bodyText) &&
        requirement.key !== "address" &&
        requirement.key !== "company name"
      ) {
        switch (requirement.key.toLowerCase()) {
          case "unsubscribe":
            complianceDiv.innerHTML += `<p>If you no longer wish to receive these emails, you can <a href="https://yourwebsite.com/unsubscribe">unsubscribe here</a>.</p>`;
            break;
          case "(contact|tel|phone|email)":
            complianceDiv.innerHTML += `<p>Contact us at: <a href="mailto:support@yourwebsite.com">support@yourwebsite.com</a></p>`;
            break;
        }
      }
    });

    setOptimizedVersion(optimizedDoc.documentElement.outerHTML);
  };

  const applyFixes = () => {
    onApplyFix(optimizedVersion);
    setFixesApplied(true);
    toast.success("Fixes applied successfully");
  };

  const getSeverityColor = (type: "error" | "warning" | "info") => {
    switch (type) {
      case "error":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      case "info":
        return "text-blue-400";
    }
  };

  const getSeverityIcon = (type: "error" | "warning" | "info") => {
    switch (type) {
      case "error":
        return <AlertCircle size={20} className="text-red-400" />;
      case "warning":
        return <AlertCircle size={20} className="text-yellow-400" />;
      case "info":
        return <Info size={20} className="text-blue-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getVerificationColor = (status: string | undefined) => {
    switch (status) {
      case "Valid":
        return "text-green-400";
      case "Invalid":
        return "text-red-400";
      case "Insufficient data":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getImageStatusColor = (status: string | undefined) => {
    if (!status) return "text-gray-400";
    const [uploaded, total] = status.split("/").map(Number);
    if (total === 0) return "text-yellow-400";
    if (uploaded === total) return "text-green-400";
    return "text-red-400";
  };

  const getPrivacyPolicyColor = (status: string | undefined) => {
    switch (status) {
      case "Valid":
        return "text-green-400";
      case "Invalid":
        return "text-yellow-400";
      case "Missing":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const complianceWarnings = warnings.filter((w) =>
    ["COMPLIANCE", "COMPLIANCE_COMPANY", "COMPLIANCE_ADDRESS", "COMPLIANCE_PRIVACY", "COMPLIANCE_VERIFICATION"].includes(w.code)
  );
  const spamWarnings = warnings.filter((w) => ["SUBJECT_SPAM", "SPAM_WORD"].includes(w.code));
  const designWarnings = warnings.filter((w) =>
    ["IMAGE_MISSING", "PARTIAL_IMAGE_UPLOAD", "IMG_SIZE", "TEXT_IMAGE_RATIO", "RESPONSIVE"].includes(w.code)
  );
  const ctaWarnings = warnings.filter((w) => ["CTA_TEXT", "LINK_TEXT", "SUBJECT_LENGTH"].includes(w.code));

  return (
    <div
      ref={analyzerRef}
      className="fixed right-4 top-4 w-full max-w-md bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 z-50 text-white"
    >
      <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
        <h3 className="text-xl font-bold bg-gradient-to-r from-lime-400 to-green-500 bg-clip-text text-transparent">
          Template Analyzer
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHighlightMode(!highlightMode)}
            className={`p-2 rounded-lg ${highlightMode ? "bg-lime-400/20" : "bg-gray-700/50"} hover:bg-lime-400/30 transition-colors`}
            title="Highlight issues in template"
          >
            <Eye size={18} className={highlightMode ? "text-lime-400" : "text-gray-300"} />
          </button>
          <button
            onClick={() => {
              gsap.to(analyzerRef.current, {
                x: 400,
                opacity: 0,
                duration: 0.5,
                ease: "power2.in",
                onComplete: onClose,
              });
            }}
            className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
          >
            <X size={18} className="text-gray-300" />
          </button>
        </div>
      </div>

      {showLegalPrompt && (
        <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-b border-yellow-600/50">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-yellow-400 mt-1 flex-shrink-0" />
            <div className="w-full">
              <p className="text-sm font-bold text-yellow-300">Compliance Requirements</p>
              <p className="text-sm text-gray-300 mt-1">
                Ensure your email includes the following to improve deliverability:
              </p>
              <div className="mt-2 space-y-1 text-sm text-gray-200">
                <div className="flex justify-between">
                  <span>Company name</span>
                  <span className="font-bold">+10 points</span>
                </div>
                <div className="flex justify-between">
                  <span>Physical address</span>
                  <span className="font-bold">+10 points</span>
                </div>
                <div className="flex justify-between">
                  <span>Privacy policy link</span>
                  <span className="font-bold">+15 points</span>
                </div>
                <div className="flex justify-between">
                  <span>Unsubscribe link</span>
                  <span className="font-bold">+10 points</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowLegalPrompt(false);
                  localStorage.setItem("legalPromptDismissed", "true");
                }}
                className="mt-3 text-sm text-yellow-300 hover:text-yellow-200 border border-yellow-500/50 rounded-lg px-4 py-1.5 transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex border-b border-gray-700/50">
        {["issues", "metrics", "optimized"].map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-lime-400/20 text-lime-400 border-b-2 border-lime-400"
                : "text-gray-400 hover:text-white hover:bg-gray-700/30"
            }`}
            onClick={() => {
              setActiveTab(tab as "issues" | "metrics" | "optimized");
              gsap.fromTo(
                ".tab-content",
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
              );
            }}
          >
            {tab === "issues" && `Issues (${warnings.length})`}
            {tab === "metrics" && "Metrics"}
            {tab === "optimized" && "Optimize"}
          </button>
        ))}
      </div>

      <div className="p-4 max-h-[70vh] overflow-y-auto tab-content">
        {isLoading && (
          <div className="flex flex-col justify-center items-center py-8">
            <Zap size={32} className="text-lime-400 animate-pulse" />
            <p className="text-gray-300 mt-2">Analyzing with AI...</p>
          </div>
        )}

        {!isLoading && activeTab === "issues" && (
          <div className="space-y-4">
            {warnings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle size={48} className="text-green-400 mb-2" />
                <p className="text-gray-300 text-center">No issues detected!</p>
              </div>
            ) : fixesApplied ? (
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle size={48} className="text-green-400 mb-2" />
                <p className="text-gray-300 text-center font-semibold">All fixes applied!</p>
              </div>
            ) : (
              <>
                {complianceWarnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-gray-200">Compliance Issues</h4>
                    {complianceWarnings.map((warning, index) => (
                      <div
                        key={`${warning.code}-${index}`}
                        className="p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 analyzer-issue"
                      >
                        <div className="flex items-start gap-2">
                          {getSeverityIcon(warning.type)}
                          <div className="flex-1">
                            <p className={`text-sm font-bold ${getSeverityColor(warning.type)}`}>
                              {warning.message}
                            </p>
                            {warning.location && (
                              <p className="text-xs text-gray-400 mt-1">Location: {warning.location}</p>
                            )}
                            {warning.suggestion && (
                              <p className="text-sm text-gray-300 mt-1">{warning.suggestion}</p>
                            )}
                            {warning.replacementText && (
                              <div className="mt-2 p-2 bg-gray-600/50 rounded-lg">
                                <p className="text-xs text-gray-400">Suggested Fix:</p>
                                <p className="text-sm text-gray-200">
                                  Replace{" "}
                                  <span className="text-red-400">
                                    &quot;{warning.message.split('"')[1] || warning.message}&quot;
                                  </span>{" "}
                                  with{" "}
                                  <span className="text-green-400">
                                    &quot;{warning.replacementText}&quot;
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {spamWarnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-gray-200">Spam Triggers</h4>
                    {spamWarnings.map((warning, index) => (
                      <div
                        key={`${warning.code}-${index}`}
                        className="p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 analyzer-issue"
                      >
                        <div className="flex items-start gap-2">
                          {getSeverityIcon(warning.type)}
                          <div className="flex-1">
                            <p className={`text-sm font-bold ${getSeverityColor(warning.type)}`}>
                              {warning.message}
                            </p>
                            {warning.location && (
                              <p className="text-xs text-gray-400 mt-1">Location: {warning.location}</p>
                            )}
                            {warning.suggestion && (
                              <p className="text-sm text-gray-300 mt-1">{warning.suggestion}</p>
                            )}
                            {warning.replacementText && (
                              <div className="mt-2 p-2 bg-gray-600/50 rounded-lg">
                                <p className="text-xs text-gray-400">Suggested Fix:</p>
                                <p className="text-sm text-gray-200">
                                  Replace{" "}
                                  <span className="text-red-400">
                                    &quot;{warning.message.split('"')[1] || warning.message}&quot;
                                  </span>{" "}
                                  with{" "}
                                  <span className="text-green-400">
                                    &quot;{warning.replacementText}&quot;
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {designWarnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-gray-200">Design Issues</h4>
                    {designWarnings.map((warning, index) => (
                      <div
                        key={`${warning.code}-${index}`}
                        className="p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 analyzer-issue"
                      >
                        <div className="flex items-start gap-2">
                          {getSeverityIcon(warning.type)}
                          <div className="flex-1">
                            <p className={`text-sm font-bold ${getSeverityColor(warning.type)}`}>
                              {warning.message}
                            </p>
                            {warning.location && (
                              <p className="text-xs text-gray-400 mt-1">Location: {warning.location}</p>
                            )}
                            {warning.suggestion && (
                              <p className="text-sm text-gray-300 mt-1">{warning.suggestion}</p>
                            )}
                            {warning.replacementText && (
                              <div className="mt-2 p-2 bg-gray-600/50 rounded-lg">
                                <p className="text-xs text-gray-400">Suggested Fix:</p>
                                <p className="text-sm text-gray-200">
                                  Replace{" "}
                                  <span className="text-red-400">
                                    &quot;{warning.message.split('"')[1] || warning.message}&quot;
                                  </span>{" "}
                                  with{" "}
                                  <span className="text-green-400">
                                    &quot;{warning.replacementText}&quot;
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {ctaWarnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-gray-200">CTA & Subject Issues</h4>
                    {ctaWarnings.map((warning, index) => (
                      <div
                        key={`${warning.code}-${index}`}
                        className="p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 analyzer-issue"
                      >
                        <div className="flex items-start gap-2">
                          {getSeverityIcon(warning.type)}
                          <div className="flex-1">
                            <p className={`text-sm font-bold ${getSeverityColor(warning.type)}`}>
                              {warning.message}
                            </p>
                            {warning.location && (
                              <p className="text-xs text-gray-400 mt-1">Location: {warning.location}</p>
                            )}
                            {warning.suggestion && (
                              <p className="text-sm text-gray-300 mt-1">{warning.suggestion}</p>
                            )}
                            {warning.replacementText && (
                              <div className="mt-2 p-2 bg-gray-600/50 rounded-lg">
                                <p className="text-xs text-gray-400">Suggested Fix:</p>
                                <p className="text-sm text-gray-200">
                                  Replace{" "}
                                  <span className="text-red-400">
                                    &quot;{warning.message.split('"')[1] || warning.message}&quot;
                                  </span>{" "}
                                  with{" "}
                                  <span className="text-green-400">
                                    &quot;{warning.replacementText}&quot;
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {!isLoading && activeTab === "metrics" && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-700/50 rounded-xl border border-gray-600/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold text-gray-200">Overall Score</span>
                <span className={`text-xl font-bold ${getScoreColor(metrics.totalScore)}`}>
                  {metrics.totalScore.toFixed(0)}/100
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    metrics.totalScore >= 90
                      ? "bg-green-400"
                      : metrics.totalScore >= 70
                      ? "bg-yellow-400"
                      : "bg-red-400"
                  }`}
                  style={{ width: `${metrics.totalScore}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Spam Score", value: metrics.spamScore, colorFn: getScoreColor as (value: number | string) => string },
                { label: "Compliance", value: metrics.complianceScore, colorFn: getScoreColor as (value: number | string) => string },
                { label: "Subject Line", value: metrics.subjectLineScore, colorFn: getScoreColor as (value: number | string) => string },
                { label: "CTA Quality", value: metrics.ctaScore, colorFn: getScoreColor as (value: number | string) => string },
                { label: "Mobile-Friendly", value: metrics.mobileScore, colorFn: getScoreColor as (value: number | string) => string },
                { label: "Text/Image Ratio", value: metrics.textToImageRatio, unit: "", colorFn: getScoreColor as (value: number | string) => string },
                { label: "Image Status", value: metrics.imageStatus, colorFn: getImageStatusColor as (value: string | number) => string },
                { label: "Privacy Policy", value: metrics.privacyPolicyStatus, colorFn: getPrivacyPolicyColor as (value: string | number) => string },
                { label: "Company Name", value: metrics.companyName || "Not detected", colorFn: (v: string | number) => (v !== "Not detected" ? "text-green-400" : "text-red-400") },
                { label: "Physical Address", value: metrics.address || "Not detected", colorFn: (v: string | number) => (v !== "Not detected" ? "text-green-400" : "text-red-400") },
                { label: "Verification Status", value: metrics.verificationStatus, colorFn: getVerificationColor as (value: string | number) => string },
                { label: "Link Count", value: metrics.linkCount, colorFn: (v: string | number) => (Number(v) > 5 ? "text-yellow-400" : "text-green-400") },
                { label: "Puter AI Response", value: metrics.puterResponse || "No response", colorFn: (v: string | number) => (v !== "No response" ? "text-blue-400" : "text-gray-400") },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="p-3 bg-gray-700/50 rounded-xl border border-gray-600/50 analyzer-metric"
                >
                  <p className="text-xs text-gray-400">{metric.label}</p>
                  <p
                    className={`text-sm font-bold ${metric.colorFn(metric.value)}`}
                  >
                    {metric.unit !== undefined ? metric.value + metric.unit : metric.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && activeTab === "optimized" && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-lime-400/20 to-green-500/20 rounded-xl border border-green-500/50">
              <div className="flex items-start gap-2">
                <Zap size={20} className="text-green-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-200">Optimized Template</p>
                  <p className="text-sm text-gray-300 mt-1">
                    This version includes automatic fixes for spam words, image sizes, responsive design, and compliance requirements. Review the preview and apply fixes to your template.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOptimizedPreview(!showOptimizedPreview)}
                className="mt-3 w-full py-2 bg-gradient-to-r from-lime-400 to-green-500 text-gray-900 rounded-lg font-bold hover:bg-lime-300 transition-colors"
              >
                {showOptimizedPreview ? "Hide Preview" : "Show Preview"}
              </button>
            </div>
            {showOptimizedPreview && (
              <div className="p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 max-h-[300px] overflow-y-auto">
                <iframe
                  srcDoc={optimizedVersion}
                  className="w-full h-[250px] border-none rounded-lg"
                  title="Optimized Template Preview"
                />
              </div>
            )}
            <button
              onClick={applyFixes}
              disabled={fixesApplied}
              className={`w-full py-3 rounded-lg font-bold transition-colors ${
                fixesApplied
                  ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-lime-400 to-green-500 text-gray-900 hover:bg-lime-300"
              }`}
            >
              {fixesApplied ? "Fixes Applied" : "Apply All Fixes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateAnalyzer;