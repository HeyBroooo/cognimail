"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ArrowRight, Shield, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function OtpVerification() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  

  useEffect(() => {
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

    return () => ctx.revert();
  }, []);

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

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      alert("Please enter the complete OTP");
      return;
    }
    
    console.log("OTP verification:", otpCode);
    window.location.href = "/dashboard";
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsResending(false);
    setTimer(60);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white flex">
      {/* Left Side - Illustration */}
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
              We've sent a verification code to secure your account
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - OTP Form */}
      <div className="slide-in-right w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="fade-up text-center lg:text-left">
            <Link href="/" className="inline-block font-mono text-2xl font-bold mb-8">
              Cogni<span className="text-gray-400">Mail</span>
            </Link>
            <h1 className="text-3xl font-mono font-bold mb-2">
              Enter Verification Code
            </h1>
            <p className="text-gray-400 font-mono">
              We've sent a 6-digit code to
              <br />
              <span className="text-white">your@email.com</span>
            </p>
          </div>

          {/* OTP Form */}
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
              Didn't receive the code? Check your spam folder or{" "}
              <button
                onClick={handleResendOtp}
                className="underline hover:text-white transition-colors"
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