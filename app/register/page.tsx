'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import SignUpForm from '../components/SignUpForm'
import { createClient } from '../../utils/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()



  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        router.push('/form')
      }
    }
    checkUser()
  }, [router, supabase])



  const handleAuthSuccess = () => {
    router.push('/form')
  }

  return (
    <div>
      <Navbar active="form" />

      <div style={{ top: 0, marginTop: 80 }}>
        <section className="bg-gray-50 min-h-[calc(100vh-80px)]">
          <div className="mx-auto max-w-screen-xl px-4 py-16 lg:flex lg:items-center lg:justify-center">
            <div className="mx-auto max-w-md w-full">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                  <img
                    src="/dengue.png"
                    alt="Dengue Logo"
                    className="w-24 mx-auto mb-4"
                  />
                  <h1 className="text-3xl font-extrabold text-gray-900">
                    Daftar Akun
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    Buat akun baru untuk melanjutkan
                  </p>
                </div>



                {/* Sign Up Form */}
                <SignUpForm onSuccess={handleAuthSuccess} />

                {/* Toggle to Login */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Sudah punya akun?{' '}
                    <Link
                      href="/login"
                      className="font-medium text-red-700 hover:text-red-800 focus:outline-none"
                    >
                      Masuk di sini
                    </Link>
                  </p>
                </div>

                {/* Anonymous Option */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <a
                    href="/form"
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V7h-5a8 8 0 0 0-5 2 8 8 0 0 0-5-2H2Z" />
                      <path d="M6 11c1.5 0 3 .5 3 2-2 0-3 0-3-2Z" />
                      <path d="M18 11c-1.5 0-3 .5-3 2 2 0 3 0 3-2Z" />
                    </svg>
                    Lanjutkan tanpa akun
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
