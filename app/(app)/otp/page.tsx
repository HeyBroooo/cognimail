"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ArrowRight, Shield, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingIndicator from "@/components/loading-indicator";

export default function OtpVerification() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [email, setEmail] = useState("");
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/";

  useEffect(() => {
    // Retrieve email from localStorage
    const storedEmail = localStorage.getItem('loginEmail') || 'your@email.com';
    setEmail(storedEmail);
    console.log('Retrieved email from localStorage:', storedEmail);

    // GSAP animations
    const ctx = gsap.context(() => {
      gsap.from(".slide-in-left", {
        x: -100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });

      gsap.from(".slide-in-right", {
        x: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.2,
      });

      gsap.from(".fade-up", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        delay: 0.5,
        ease: "power2.out",
      });

      gsap.from(".otp-input", {
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.8,
        ease: "back.out(1.7)",
      });
    }, containerRef);

    // Check if user is already logged in
    const checkSession = async () => {
      try {
        console.log('Checking session with /check-session');
        const response = await fetch(`${BASE_URL}api/auth/check-session`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Session check response:', data);
          if (data.isLoggedIn) {
            console.log('User already logged in, redirecting to dashboard');
            router.push("/dashboard");
          }
        } else {
          console.error('Session check failed:', response.status);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();

    return () => ctx.revert();
  }, [BASE_URL, router]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    
    if (code.length < 6) {
      alert("Please enter a complete 6-digit code.");
      return;
    }

    const email = localStorage.getItem('loginEmail');

    try {
      const response = await fetch(`${BASE_URL}api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: code }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Verification failed");
      }

      const data = await response.json();
      console.log("OTP verified successfully:", data);
      
      // Clean up localStorage
      localStorage.removeItem('loginEmail');
      
      if (data.redirect) {
        router.push(data.redirect);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during verification:", error);
        alert(error.message || "Verification failed. Please try again.");
      } else {
        console.error("Unknown error during verification:", error);
        alert("An unexpected error occurred.");
      }
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      console.log('Resending OTP for email:', email);
      const response = await fetch(`${BASE_URL}api/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to resend OTP:", errorData);
        throw new Error(errorData.error || "Failed to resend OTP");
      }

      setIsResending(false);
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      alert("OTP resent successfully!");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during OTP resend:", error);
        alert(error.message || "Failed to resend OTP. Please try again.");
      } else {
        console.error("Unknown error during OTP resend:", error);
        alert("An unexpected error occurred.");
      }
    } finally {
      setIsResending(false);
    }
  };

  if (isCheckingSession) {
    return <LoadingIndicator />;
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white flex">
      <div className="slide-in-left hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-teal-500 to-blue-500 opacity-90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="relative z-10 flex items-center justify-center w-full p-12">
          <div className="text-center space-y-6">
            <div className="w-32 h-32 mx-auto bg-white/10 rounded-3xl backdrop-blur-sm flex items-center justify-center">
              <Shield className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-4xl font-mono font-bold">Verify Your Email</h2>
            <p className="text-xl font-mono text-white/80 max-w-md">
              We&apos;ve sent a verification code to secure your account
            </p>
          </div>
        </div>
      </div>

      <div className="slide-in-right w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="fade-up text-center lg:text-left">
            <Link href="/" className="inline-block font-mono text-2xl font-bold mb-8">
              Cogni<span className="text-gray-400">Mail</span>
            </Link>
            <h1 className="text-3xl font-mono font-bold mb-2">
              Enter Verification Code
            </h1>
            <p className="text-gray-400 font-mono">
              We&apos;ve sent a 6-digit code to
              <br />
              <span className="text-white">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="fade-up">
              <label className="block text-sm font-mono font-medium mb-4">
                Verification Code
              </label>
              <div className="flex gap-3 justify-center lg:justify-start">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="otp-input w-12 h-12 bg-gray-900 border border-gray-700 rounded-lg font-mono text-white text-center text-lg focus:outline-none focus:border-white transition-colors"
                  />
                ))}
              </div>
            </div>

            <div className="fade-up space-y-4">
              <button
                type="submit"
                className="w-full bg-white text-black font-mono font-medium py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center group"
              >
                Verify Code
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-sm font-mono text-gray-400">
                    Resend code in {timer}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="text-sm font-mono text-white hover:text-gray-300 transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Resend Code
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="fade-up text-center">
            <p className="text-xs font-mono text-gray-400">
              Didn&apos;t receive the code? Check your spam folder or{" "}
              <button
                onClick={handleResendOtp}
                className="underline hover:text-white transition-colors"
                disabled={isResending}
              >
                try again
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}