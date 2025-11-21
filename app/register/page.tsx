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

  const [loading, setLoading] = useState(false)

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

  const handleGoogleAuth = async () => {
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/form`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      setLoading(false)
    }
  }

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

                {/* Google Sign In Button */}
                <button
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {loading ? 'Memproses...' : 'Lanjutkan dengan Google'}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Atau</span>
                  </div>
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
