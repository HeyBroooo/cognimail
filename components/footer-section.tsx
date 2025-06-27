"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ArrowRight, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"

export default function FooterSection() {
  const [email, setEmail] = useState("")
  const footerRef = useRef<HTMLElement>(null)
  const newsletterRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Gentle animations with easing
      gsap.fromTo(
        newsletterRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        },
      )

      gsap.fromTo(
        linksRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        },
      )

      gsap.fromTo(
        bottomRef.current,
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        },
      )
    }, footerRef)

    return () => ctx.revert()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Gentle button animation
    const button = e.currentTarget.querySelector("button")
    gsap.to(button, {
      scale: 0.98,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
    })

    console.log("Newsletter signup:", email)
    setEmail("")
  }

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ]

  return (
    <footer ref={footerRef} className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Glassmorphism background */}
      <div className="absolute inset-0 backdrop-blur-3xl"></div>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(255,255,255,0.03)_0%,transparent_50%)]"></div>

      {/* Top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter and Links Section */}
        <div className="py-20 grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Newsletter Section */}
          <div ref={newsletterRef} className="lg:col-span-2">
            <div className="relative">
              <h3 className="text-3xl font-light text-white mb-6 tracking-wide">Stay Updated with Cognimail</h3>
              <div className="w-12 h-px bg-gradient-to-r from-white/40 to-transparent mb-6"></div>
              <p className="text-gray-300/70 mb-8 font-light leading-relaxed">
                Subscribe to our newsletter for product updates and email marketing tips.
              </p>

              <form onSubmit={handleSubmit} className="relative">
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your Email Address"
                    className="w-full px-6 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-400/70 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all duration-300 font-light"
                    required
                    style={{ color: email ? 'white' : '' }} // Fix for white text issue
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 px-6 bg-white/10 backdrop-blur-sm hover:bg-white/15 text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-light border border-white/10 hover:border-white/20"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Links Section */}
          <div ref={linksRef} className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-12">
            {/* Product */}
            <div className="space-y-6">
              <h4 className="text-white/90 font-light text-lg tracking-wide">Product</h4>
              <div className="w-8 h-px bg-gradient-to-r from-white/30 to-transparent"></div>
              <ul className="space-y-4">
                {["Features", "Pricing", "Templates", "API"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-gray-300/70 hover:text-white/90 transition-colors duration-300 font-light text-sm"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-6">
              <h4 className="text-white/90 font-light text-lg tracking-wide">Contact</h4>
              <div className="w-8 h-px bg-gradient-to-r from-white/30 to-transparent"></div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-300/70">
                  <div className="w-8 h-8 px-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-light">support</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300/70">
                  <div className="w-8 h-8 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-light">+91 98765 43210</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300/70">
                  <div className="w-8 h-8 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-light">Bangalore, India</span>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-6">
              <h4 className="text-white/90 font-light text-lg tracking-wide">Resources</h4>
              <div className="w-8 h-px bg-gradient-to-r from-white/30 to-transparent"></div>
              <ul className="space-y-4">
                {["Blog", "Documentation", "API Reference", "Guides"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-gray-300/70 hover:text-white/90 transition-colors duration-300 font-light text-sm"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-6">
              <h4 className="text-white/90 font-light text-lg tracking-wide">Company</h4>
              <div className="w-8 h-px bg-gradient-to-r from-white/30 to-transparent"></div>
              <ul className="space-y-4">
                {["About Us", "Careers", "Privacy", "Terms"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-gray-300/70 hover:text-white/90 transition-colors duration-300 font-light text-sm"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div
          ref={bottomRef}
          className="relative py-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-light text-white tracking-wider">Cognimail</div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                aria-label={social.label}
                className="w-12 h-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-gray-300/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-8 text-sm">
            {["Privacy Policy", "Terms of Service", "Security", "Cookie Policy"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-gray-300/60 hover:text-white/80 transition-colors duration-300 font-light"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}