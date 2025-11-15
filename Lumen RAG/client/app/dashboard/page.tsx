"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import Header from "@/components/Header"
import { Loader2 } from "lucide-react"

type AccountType = "user" | "organization"

interface AccountOption {
  type: AccountType
  title: string
  description: string
  color: string
  hoverColor: string
  path: string
  icon: React.ReactNode
  gradient: string
}

const accountOptions: AccountOption[] = [
  {
    type: "user",
    title: "User Account",
    description: "Perfect for individual users managing personal finances",
    color: "bg-blue-600",
    hoverColor: "hover:bg-blue-700",
    path: "/user-dashboard",
    gradient: "from-blue-500 to-cyan-500",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    type: "organization",
    title: "Organization Account",
    description: "Ideal for businesses and teams managing collective finances",
    color: "bg-green-600",
    hoverColor: "hover:bg-green-700",
    path: "/org-dashboard",
    gradient: "from-green-500 to-emerald-500",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
]

export default function DashboardDetail() {
  const router = useRouter()
  const { isLoaded, userId, isSignedIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOption, setSelectedOption] = useState<AccountType | null>(null)
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null)

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push("/sign-in")
      } else if (userId) {
        // Fetch user data here
        setUser({
          name: "User", // Replace with actual user data
          email: "user@example.com", // Replace with actual user data
        })
      }
    }
  }, [isLoaded, isSignedIn, userId, router])

  const handleAccountSelect = async (path: string, type: AccountType) => {
    setIsLoading(true)
    setSelectedOption(type)
    try {
      await router.push(path)
    } catch (error) {
      console.error("Navigation error:", error)
    } finally {
      setIsLoading(false)
      setSelectedOption(null)
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
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6">
              Choose Your Path
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-4">
              Select the type of account that best suits your needs and start your financial journey
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          {/* Account Options */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {accountOptions.map((option) => (
              <div key={option.type} className="group relative">
                {/* Background Glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${option.gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
                ></div>

                {/* Card */}
                <button
                  className="relative w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50 group-hover:scale-105 transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  onClick={() => handleAccountSelect(option.path, option.type)}
                  disabled={isLoading}
                >
                  {/* Icon Header */}
                  <div className="flex items-center mb-6">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${option.gradient} rounded-xl flex items-center justify-center text-white mr-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">{option.title}</h3>
                      <div
                        className={`inline-block px-3 py-1 bg-gradient-to-r ${option.gradient} text-white text-xs font-semibold rounded-full`}
                      >
                        {option.type === "user" ? "Individual" : "Business"}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">{option.description}</p>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {option.type === "user" ? (
                      <>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <svg
                            className="w-5 h-5 text-green-500 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Personal financial tracking
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <svg
                            className="w-5 h-5 text-green-500 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          AI-powered insights
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <svg
                            className="w-5 h-5 text-green-500 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Document analysis
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <svg
                            className="w-5 h-5 text-green-500 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Team collaboration tools
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <svg
                            className="w-5 h-5 text-green-500 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Advanced reporting
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <svg
                            className="w-5 h-5 text-green-500 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Multi-user access
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${option.gradient} text-white font-semibold rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    >
                      {isLoading && selectedOption === option.type ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Get Started
                          <svg
                            className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">Free</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">to start</div>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-2xl blur-3xl"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50 text-center">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Need Help Deciding?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                  Not sure which account type is right for you? You can always switch between account types later or
                  contact our support team for guidance.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Get Help
                  </button>
                  <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    View Features
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


// ------------------------------------------------------------------------------------------------- //

// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from "@clerk/nextjs";
// import Header from '@/components/Header';
// import { Loader2 } from "lucide-react";

// type AccountType = 'user' | 'organization';

// interface AccountOption {
//   type: AccountType;
//   title: string;
//   description: string;
//   color: string;
//   hoverColor: string;
//   path: string;
// }

// const accountOptions: AccountOption[] = [
//   {
//     type: 'user',
//     title: 'User Account',
//     description: 'Perfect for individual users managing personal finances',
//     color: 'bg-blue-600',
//     hoverColor: 'hover:bg-blue-700',
//     path: '/user-dashboard'
//   },
//   {
//     type: 'organization',
//     title: 'Organization Account',
//     description: 'Ideal for businesses and teams managing collective finances',
//     color: 'bg-green-600',
//     hoverColor: 'hover:bg-green-700',
//     path: '/org-dashboard'
//   }
// ];

// export default function DashboardDetail() {
//   const router = useRouter();
//   const { isLoaded, userId, isSignedIn } = useAuth();
//   const [isLoading, setIsLoading] = useState(false);
//   const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);

//   useEffect(() => {
//     if (isLoaded) {
//       if (!isSignedIn) {
//         router.push('/sign-in');
//       } else if (userId) {
//         // Fetch user data here
//         setUser({
//           name: 'User', // Replace with actual user data
//           email: 'user@example.com', // Replace with actual user data
//         });
//       }
//     }
//   }, [isLoaded, isSignedIn, userId, router]);

//   const handleAccountSelect = async (path: string) => {
//     setIsLoading(true);
//     try {
//       await router.push(path);
//     } catch (error) {
//       console.error('Navigation error:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!isLoaded) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
//         <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//       <Header user={user} />
      
//       <main className="container mx-auto px-4 py-8 mt-16">
//         <div className="max-w-4xl mx-auto text-center">
//           <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
//             Choose your account type
//           </h2>
//           <p className="text-gray-600 dark:text-gray-400 mb-8">
//             Select the type of account that best suits your needs
//           </p>
          
//           <div className="grid md:grid-cols-2 gap-6">
//             {accountOptions.map((option) => (
//               <button 
//                 key={option.type}
//                 className={`
//                   p-6 rounded-lg ${option.color} ${option.hoverColor} transition-all
//                   transform hover:scale-105 text-white text-left
//                   flex flex-col space-y-2 disabled:opacity-50
//                 `}
//                 onClick={() => handleAccountSelect(option.path)}
//                 disabled={isLoading}
//               >
//                 <span className="text-xl font-semibold">{option.title}</span>
//                 <span className="text-sm opacity-90">{option.description}</span>
//                 {isLoading && (
//                   <Loader2 className="h-4 w-4 animate-spin ml-2" />
//                 )}
//               </button>
//             ))}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }