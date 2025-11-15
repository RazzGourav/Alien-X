"use client"

import type React from "react"

import { useTheme } from "@/context/ThemeContext"
import Header from "@/components/Header"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

function ContactCard({ contact }: { contact: any }) {
  return (
    <>
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${contact.gradient} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
        {contact.icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
        {contact.title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors duration-300">
        {contact.value}
      </p>
      <div className={`absolute inset-0 bg-gradient-to-r ${contact.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>
    </>
  )
}

export default function Contact() {
  const { isDarkMode } = useTheme()
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
    }
  }, [isLoaded, isSignedIn, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      // Here you would typically send the form data to your backend
      // For now, we'll simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSubmitStatus("success")
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-800">
      <Header user={user} />

      <main className="container mx-auto px-4 py-12 mt-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Have questions or need support? We're here to help you succeed with our platform.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-3xl"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 md:p-10 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Send us a message</h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="group">
                        <label
                          htmlFor="name"
                          className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Name
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:text-white transition-all duration-300 group-hover:border-blue-400/50"
                            placeholder="Your full name"
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label
                          htmlFor="email"
                          className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Email
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:text-white transition-all duration-300 group-hover:border-blue-400/50"
                            placeholder="your.email@example.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="group">
                      <label
                        htmlFor="subject"
                        className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Subject
                      </label>
                      <div className="relative">
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:text-white transition-all duration-300 group-hover:border-blue-400/50 appearance-none cursor-pointer"
                        >
                          <option value="">Select a subject</option>
                          <option value="general">General Inquiry</option>
                          <option value="support">Technical Support</option>
                          <option value="feedback">Feedback</option>
                          <option value="other">Other</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="group">
                      <label
                        htmlFor="message"
                        className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Message
                      </label>
                      <div className="relative">
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={5}
                          className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:text-white transition-all duration-300 group-hover:border-blue-400/50 resize-none"
                          placeholder="Tell us how we can help you..."
                        ></textarea>
                      </div>
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group relative w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <span className="flex items-center justify-center">
                          {isSubmitting ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Sending...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                              </svg>
                              Send Message
                            </>
                          )}
                        </span>
                      </button>
                    </div>

                    {submitStatus === "success" && (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-xl blur"></div>
                        <div className="relative p-4 bg-green-50/80 dark:bg-green-900/30 backdrop-blur-sm text-green-700 dark:text-green-200 rounded-xl border border-green-200/50 dark:border-green-700/50">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Thank you for your message! We'll get back to you soon.
                          </div>
                        </div>
                      </div>
                    )}

                    {submitStatus === "error" && (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20 rounded-xl blur"></div>
                        <div className="relative p-4 bg-red-50/80 dark:bg-red-900/30 backdrop-blur-sm text-red-700 dark:text-red-200 rounded-xl border border-red-200/50 dark:border-red-700/50">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            There was an error sending your message. Please try again later.
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              {[
                {
                  title: "Email",
                  value: "mlucky110405@gmail.com",
                  href: "mailto:mlucky110405@gmail.com",
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  ),
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  title: "Phone",
                  value: "+91 8818858826",
                  href: "tel:+918818858826",
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  ),
                  gradient: "from-purple-500 to-pink-500",
                },
                {
                  title: "WhatsApp",
                  value: "+91 8818858826",
                  href: "https://wa.me/918818858826?text=Hello! I'm interested in your financial advisory services.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  gradient: "from-green-500 to-emerald-500",
                },
              ].map((contact, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
                  contact.href ? 'hover:shadow-xl hover:scale-105 cursor-pointer' : ''
                }`}
              >
                {contact.href ? (
                  <a
                    href={contact.href}
                    target={contact.href.startsWith('http') ? '_blank' : '_self'}
                    rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="block"
                  >
                    <ContactCard contact={contact} />
                  </a>
                ) : (
                  <ContactCard contact={contact} />
                )}
              </div>
            ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-red-600/10 rounded-2xl blur-3xl"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">Explore More</h3>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link
                    href="/about"
                    className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Learn More About Us
                  </Link>
                  <Link
                    href="/documentation"
                    className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    View Documentation
                  </Link>
                  <Link
                    href="/dashboard"
                    className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


// ----------------------------------------------------------------------------------------------------------------------------- //

// 'use client';

// import { useTheme } from '@/context/ThemeContext';
// import Header from '@/components/Header';
// import { useAuth } from "@clerk/nextjs";
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import Link from 'next/link';

// export default function Contact() {
//   const { isDarkMode } = useTheme();
//   const { isLoaded, isSignedIn } = useAuth();
//   const router = useRouter();
//   const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     subject: '',
//     message: ''
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

//   useEffect(() => {
//     if (isLoaded && !isSignedIn) {
//       router.push('/sign-in');
//     }
//   }, [isLoaded, isSignedIn, router]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setSubmitStatus('idle');

//     try {
//       // Here you would typically send the form data to your backend
//       // For now, we'll simulate a successful submission
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       setSubmitStatus('success');
//       setFormData({
//         name: '',
//         email: '',
//         subject: '',
//         message: ''
//       });
//     } catch (error) {
//       setSubmitStatus('error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!isLoaded) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//       <Header user={user} />
      
//       <main className="container mx-auto px-4 py-8 mt-16">
//         <div className="max-w-2xl mx-auto">
//           <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-8">
//             Contact Us
//           </h1>

//           <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div>
//                 <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   id="name"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//                 />
//               </div>

//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//                 />
//               </div>

//               <div>
//                 <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Subject
//                 </label>
//                 <select
//                   id="subject"
//                   name="subject"
//                   value={formData.subject}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//                 >
//                   <option value="">Select a subject</option>
//                   <option value="general">General Inquiry</option>
//                   <option value="support">Technical Support</option>
//                   <option value="feedback">Feedback</option>
//                   <option value="other">Other</option>
//                 </select>
//               </div>

//               <div>
//                 <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Message
//                 </label>
//                 <textarea
//                   id="message"
//                   name="message"
//                   value={formData.message}
//                   onChange={handleInputChange}
//                   required
//                   rows={5}
//                   className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//                 ></textarea>
//               </div>

//               <div>
//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {isSubmitting ? 'Sending...' : 'Send Message'}
//                 </button>
//               </div>

//               {submitStatus === 'success' && (
//                 <div className="p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-md">
//                   Thank you for your message! We'll get back to you soon.
//                 </div>
//               )}

//               {submitStatus === 'error' && (
//                 <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
//                   There was an error sending your message. Please try again later.
//                 </div>
//               )}
//             </form>
//           </div>

//           <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md text-center">
//               <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Email</h3>
//               <p className="text-gray-600 dark:text-gray-400">support@example.com</p>
//             </div>
//             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md text-center">
//               <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Phone</h3>
//               <p className="text-gray-600 dark:text-gray-400">+1 (555) 123-4567</p>
//             </div>
//             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md text-center">
//               <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Hours</h3>
//               <p className="text-gray-600 dark:text-gray-400">Mon-Fri: 9AM-5PM EST</p>
//             </div>
//           </div>

//           <div className="mt-8 flex flex-wrap gap-4 justify-center">
//             <Link
//               href="/about"
//               className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
//             >
//               Learn More About Us
//             </Link>
//             <Link
//               href="/documentation"
//               className="inline-block bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
//             >
//               View Documentation
//             </Link>
//             <Link
//               href="/dashboard"
//               className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
//             >
//               Go to Dashboard
//             </Link>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// } 