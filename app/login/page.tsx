'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import LoginForm from '../components/LoginForm'
import { createClient } from '../../utils/supabase/client'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    // Check for auth error from URL
    const error = searchParams.get('error')
    if (error === 'auth_failed') {
      setAuthError('Login gagal. Silakan coba lagi.')
    }

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
  }, [router, supabase, searchParams])



  const handleAuthSuccess = async () => {
    // Get user profile to check role
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Fetch user profile to get role
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // Redirect based on role
      if (profile?.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/form')
      }
    } else {
      router.push('/form')
    }
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
                    Masuk
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    Masuk ke akun Anda untuk melanjutkan
                  </p>
                </div>

                {/* Auth Error Message */}
                {authError && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm text-red-800">{authError}</p>
                    </div>
                  </div>
                )}



                {/* Login Form */}
                <LoginForm onSuccess={handleAuthSuccess} />

                {/* Toggle to Register */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Belum punya akun?{' '}
                    <Link
                      href="/register"
                      className="font-medium text-red-700 hover:text-red-800 focus:outline-none"
                    >
                      Daftar di sini
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
