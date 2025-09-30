import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CogniMail",
  description: "CogniMail - Your AI-Powered Email Service",
  metadataBase: new URL("https://cognimail.vercel.app/"),
  authors: [
    {
      name: "Mohit Kumar",
      url: "https://cognimail.vercel.app/",
    },
  ],
  keywords: [
    "AI Email Service",
    "Artificial Intelligence",
    "Email Management",
    "Productivity",
    "CogniMail",
  ],
  icons: {
    icon: "/cube-icon.ico",
  },
  openGraph: {
    title: "CogniMail",
    description: "CogniMail - Your AI-Powered Email Service",
    siteName: "CogniMail",
    url: "https://cognimail.vercel.app/",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://i.postimg.cc/jWXc2XGw/favicon-1.png",
        width: 1200,
        height: 630,
        alt: "CogniMail Open Graph Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CogniMail",
    description: "CogniMail - Your AI-Powered Email Service",
    site: "@CogniMail",
    creator: "@Firmware_X",
    images: [
      {
        url: "https://i.postimg.cc/jWXc2XGw/favicon-1.png",
        width: 1200,
        height: 630,
        alt: "CogniMail Twitter Image",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <Script
            src="https://js.puter.com/v2/"
            strategy="afterInteractive"
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}