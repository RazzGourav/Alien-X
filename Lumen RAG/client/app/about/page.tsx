"use client"

import { useTheme } from "@/context/ThemeContext"
import Header from "@/components/Header"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function About() {
  const { isDarkMode } = useTheme()
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
    }
  }, [isLoaded, isSignedIn, router])

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
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6">
              About Us
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Revolutionizing financial document analysis through cutting-edge AI technology
            </p>
          </div>

          <div className="space-y-16">
            {/* Mission Section */}
            <section className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-3xl"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Our Mission</h2>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  We are dedicated to revolutionizing financial document analysis through advanced AI technology. Our
                  platform aims to make financial data more accessible, understandable, and actionable for both
                  individuals and organizations.
                </p>
              </div>
            </section>

            {/* Team Section */}
            <section className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-2xl blur-3xl"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center mb-12">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Meet the Developers</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  <div className="group text-center">
                    <div className="relative w-56 h-56 mx-auto mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                      <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                        <Image src="/images/lucky.jpg" alt="Gourav" fill className="object-cover" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Gourav</h3>
                    <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-3">
                      Full Stack Developer
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Specializing in AI integration and backend development with expertise in modern web technologies
                    </p>
                  </div>

                  <div className="group text-center">
                    <div className="relative w-56 h-56 mx-auto mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                      <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                        <Image src="/images/tanishk.jpg" alt="Rohan" fill className="object-cover" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Rohan</h3>
                    <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-3">
                      Frontend Developer
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Expert in React and modern web technologies with a passion for creating intuitive user experiences
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Technology Stack */}
            <section className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10 rounded-2xl blur-3xl"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center mb-12">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Our Technology Stack</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { name: "Next.js", desc: "React Framework", gradient: "from-gray-700 to-gray-900" },
                    { name: "TypeScript", desc: "Type Safety", gradient: "from-blue-600 to-blue-800" },
                    { name: "Tailwind CSS", desc: "Styling", gradient: "from-cyan-500 to-blue-600" },
                    { name: "Clerk", desc: "Authentication", gradient: "from-purple-600 to-purple-800" },
                  ].map((tech, index) => (
                    <div key={index} className="group relative">
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${tech.gradient} rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300`}
                      ></div>
                      <div className="relative text-center p-6 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50 group-hover:scale-105 transition-transform duration-300">
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-lg mb-2">{tech.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{tech.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-red-600/10 rounded-2xl blur-3xl"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Get in Touch</h2>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  We'd love to hear from you! Whether you have questions about our platform or need assistance, our team
                  is here to help.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="/contact"
                    className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Contact Us
                  </a>
                  <a
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
                    Documentation
                  </a>
                  <a
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
                    Dashboard
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}


// ------------------------------------------------------------------------------------------------------------------------------------ //

// 'use client';

// import { useTheme } from '@/context/ThemeContext';
// import Header from '@/components/Header';
// import { useAuth } from "@clerk/nextjs";
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import Image from 'next/image';

// export default function About() {
//   const { isDarkMode } = useTheme();
//   const { isLoaded, isSignedIn } = useAuth();
//   const router = useRouter();
//   const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);

//   useEffect(() => {
//     if (isLoaded && !isSignedIn) {
//       router.push('/sign-in');
//     }
//   }, [isLoaded, isSignedIn, router]);

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
//         <div className="max-w-4xl mx-auto">
//           <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-8">
//             About Us
//           </h1>

//           <div className="space-y-12">
//             <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
//               <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
//                 Our Mission
//               </h2>
//               <p className="text-gray-600 dark:text-gray-400 mb-4">
//                 We are dedicated to revolutionizing financial document analysis through advanced AI technology. Our platform aims to make financial data more accessible, understandable, and actionable for both individuals and organizations.
//               </p>
//             </section>

//             <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
//               <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
//                 Meet the Developers
//               </h2>
              
//               <div className="grid md:grid-cols-2 gap-8">
//                 <div className="text-center">
//                   <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
//                     <Image
//                       src="/images/lucky.jpg"
//                       alt="Lucky"
//                       fill
//                       className="object-cover"
//                     />
//                   </div>
//                   <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
//                     Lucky
//                   </h3>
//                   <p className="text-gray-600 dark:text-gray-400">
//                     Full Stack Developer
//                   </p>
//                   <p className="text-gray-600 dark:text-gray-400 mt-2">
//                     Specializing in AI integration and backend development
//                   </p>
//                 </div>

//                 <div className="text-center">
//                   <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
//                     <Image
//                       src="/images/tanishk.jpg"
//                       alt="Tanishk"
//                       fill
//                       className="object-cover"
//                     />
//                   </div>
//                   <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
//                     Tanishk
//                   </h3>
//                   <p className="text-gray-600 dark:text-gray-400">
//                     Frontend Developer
//                   </p>
//                   <p className="text-gray-600 dark:text-gray-400 mt-2">
//                     Expert in React and modern web technologies
//                   </p>
//                 </div>
//               </div>
//             </section>

//             <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
//               <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
//                 Our Technology Stack
//               </h2>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                   <h4 className="font-medium text-gray-800 dark:text-gray-200">Next.js</h4>
//                   <p className="text-sm text-gray-600 dark:text-gray-400">React Framework</p>
//                 </div>
//                 <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                   <h4 className="font-medium text-gray-800 dark:text-gray-200">TypeScript</h4>
//                   <p className="text-sm text-gray-600 dark:text-gray-400">Type Safety</p>
//                 </div>
//                 <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                   <h4 className="font-medium text-gray-800 dark:text-gray-200">Tailwind CSS</h4>
//                   <p className="text-sm text-gray-600 dark:text-gray-400">Styling</p>
//                 </div>
//                 <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                   <h4 className="font-medium text-gray-800 dark:text-gray-200">Clerk</h4>
//                   <p className="text-sm text-gray-600 dark:text-gray-400">Authentication</p>
//                 </div>
//               </div>
//             </section>

//             <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
//               <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
//                 Get in Touch
//               </h2>
//               <p className="text-gray-600 dark:text-gray-400 mb-4">
//                 We'd love to hear from you! Whether you have questions about our platform or need assistance, our team is here to help.
//               </p>
//               <div className="flex flex-wrap gap-4">
//                 <a
//                   href="/contact"
//                   className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
//                 >
//                   Contact Us
//                 </a>
//                 <a
//                   href="/documentation"
//                   className="inline-block bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
//                 >
//                   View Documentation
//                 </a>
//                 <a
//                   href="/dashboard"
//                   className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
//                 >
//                   Go to Dashboard
//                 </a>
//               </div>
//             </section>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// } 