"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Plus } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "How fast is your email delivery?",
    answer: "Our optimized infrastructure and global CDN network ensure emails are delivered in under 50ms, making Cognimail one of the fastest email delivery platforms available.",
  },
  {
    question: "What is your email deliverability rate?",
    answer: "We maintain a 99.9% deliverability rate through advanced reputation management and strict authentication protocols like SPF, DKIM, and DMARC to ensure your emails reach the inbox.",
  },
  {
    question: "Do you provide email analytics?",
    answer: "Yes, our real-time analytics dashboard tracks opens, clicks, bounces, and engagement metrics with detailed reports to help you optimize your email campaigns.",
  },
  {
    question: "Is there an API for developers?",
    answer: "Absolutely! We offer a simple REST API with SDKs for all major programming languages, comprehensive documentation, and developer-friendly tools to integrate email functionality seamlessly.",
  },
  {
    question: "Can I create custom email templates?",
    answer: "Yes, our drag-and-drop email builder comes with 100+ responsive templates and supports custom HTML. You can also integrate your design system for brand consistency.",
  },
]

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])
  const sectionRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Gentle fade in animation
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        },
      )

      // Staggered item animations with gentle easing
      itemRefs.current.forEach((item, index) => {
        if (item) {
          gsap.fromTo(
            item,
            { opacity: 0, y: 20, scale: 0.98 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              delay: index * 0.15,
              ease: "power2.out",
              scrollTrigger: {
                trigger: item,
                start: "top 92%",
                toggleActions: "play none none reverse",
              },
            },
          )
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const toggleItem = (index: number) => {
    const answerElement = document.getElementById(`answer-${index}`)
    const iconElement = document.getElementById(`icon-${index}`)

    if (openItems.includes(index)) {
      // Close item with gentle animation
      gsap.to(answerElement, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
      })
      gsap.to(iconElement, {
        rotation: 0,
        duration: 0.4,
        ease: "power2.inOut",
      })
      setOpenItems(openItems.filter((item) => item !== index))
    } else {
      // Open item with gentle animation
      gsap.set(answerElement, { height: "auto" })
      const height = answerElement?.scrollHeight || 0
      gsap.fromTo(
        answerElement,
        { height: 0, opacity: 0 },
        {
          height: height,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        },
      )
      gsap.to(iconElement, {
        rotation: 45,
        duration: 0.4,
        ease: "power2.out",
      })
      setOpenItems([...openItems, index])
    }
  }

  return (
    <section ref={sectionRef} className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Glassmorphism background with gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_0%,transparent_50%)]"></div>

      <div className="relative max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6 tracking-wide">Frequently Asked Questions</h2>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-6"></div>
          <p className="text-gray-300/80 text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Find answers to common questions about Cognimail's email services
          </p>
        </div>

        <div className="space-y-6">
          {faqData.map((item, index) => (
            <div key={index} ref={(el) => { itemRefs.current[index] = el }} className="group relative">
              {/* Glassmorphism card */}
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/20 hover:bg-white/8 transition-all duration-500">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <button
                  onClick={() => toggleItem(index)}
                  className="relative w-full px-8 py-8 text-left flex items-center justify-between group-hover:bg-white/[0.02] transition-all duration-300"
                >
                  <h3 className="text-white/90 font-light text-lg pr-6 leading-relaxed group-hover:text-white transition-colors duration-300">
                    {item.question}
                  </h3>
                  <div id={`icon-${index}`} className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all duration-300">
                      <Plus className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>
                </button>

                <div id={`answer-${index}`} className="overflow-hidden" style={{ height: 0, opacity: 0 }}>
                  <div className="px-8 pb-8">
                    <div className="w-full h-px bg-gradient-to-r from-white/10 via-white/20 to-white/10 mb-6"></div>
                    <p className="text-gray-300/80 leading-relaxed font-light text-[15px]">{item.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}