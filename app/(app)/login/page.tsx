"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ArrowRight, Eye, EyeOff, Mail, Lock } from "lucide-react";
import Link from "next/link";

export default function Login() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt:", formData);
    window.location.href = "/otp";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white flex">
      {/* Left Side - Illustration */}
      <div className="slide-in-left hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 opacity-90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="relative z-10 flex items-center justify-center w-full p-12">
          <div className="text-center space-y-6">
            <div className="w-32 h-32 mx-auto bg-white/10 rounded-3xl backdrop-blur-sm flex items-center justify-center">
              <Mail className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-4xl font-mono font-bold">Welcome Back</h2>
            <p className="text-xl font-mono text-white/80 max-w-md">
              Continue your email marketing journey with CogniMail
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="slide-in-right w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="fade-up text-center lg:text-left">
            <Link  href={"/"} className="inline-block font-mono text-2xl font-bold mb-8">
              Cogni<span className="text-gray-400">Mail</span>
            </Link>
            <h1 className="text-3xl font-mono font-bold mb-2">
              Login to
              <br />
              CogniMail
            </h1>
            <p className="text-gray-400 font-mono">
              Don't have an account?{" "}
              <Link href="/signup" className="text-white hover:text-gray-300 underline">
                Sign Up
              </Link>
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="fade-up">
              <label htmlFor="email" className="block text-sm font-mono font-medium mb-2">
                E-mail address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg font-mono text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="fade-up">
              <label htmlFor="password" className="block text-sm font-mono font-medium mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-gray-900 border border-gray-700 rounded-lg font-mono text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="fade-up">
              <Link href="/forgot-password" className="text-sm font-mono text-gray-400 hover:text-white transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="fade-up w-full bg-white text-black font-mono font-medium py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center group"
            >
              Login
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="fade-up text-center">
            <p className="text-xs font-mono text-gray-400">
              By connecting to CogniMail you agree to our{" "}
              <a href="#" className="underline hover:text-white transition-colors">
                Terms of use
              </a>{" "}
              and{" "}
              <a href="#" className="underline hover:text-white transition-colors">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}