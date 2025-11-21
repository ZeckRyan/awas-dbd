'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Navbar from '../../components/Navbar'
import Link from 'next/link'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')

  const getErrorMessage = () => {
    if (error === 'access_denied') {
      return 'Anda membatalkan proses login dengan Google.'
    }
    if (errorCode === 'unexpected_failure' || error === 'server_error') {
      return 'Gagal melakukan autentikasi. Silakan coba lagi dalam beberapa saat.'
    }
    return 'Terjadi kesalahan saat login. Silakan coba lagi.'
  }

  const getErrorTitle = () => {
    if (error === 'access_denied') {
      return 'Login Dibatalkan'
    }
    return 'Halaman Sedang Perbaikan'
  }

  const getErrorSuggestion = () => {
    if (error === 'access_denied') {
      return 'Silakan coba login lagi jika Anda ingin melanjutkan.'
    }
    return 'Mohon coba beberapa saat lagi atau hubungi kami jika masalah terus berlanjut.'
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
                  <div className="w-20 h-20 bg-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                    {getErrorTitle()}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Maaf, terjadi kesalahan saat proses autentikasi
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-red-700 mt-0.5 mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Apa yang terjadi?
                      </p>
                      <p className="text-sm text-gray-600">
                        {getErrorMessage()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 w-full text-center bg-red-700 text-white px-6 py-3 rounded font-medium shadow hover:bg-red-800 focus:outline-none focus:ring active:bg-red-500 transition-all"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Coba Login Lagi
                  </Link>

                  <Link
                    href="/"
                    className="flex items-center justify-center gap-2 w-full text-center bg-white border-2 border-red-700 text-red-700 px-6 py-3 rounded font-medium shadow hover:bg-red-50 focus:outline-none focus:ring active:bg-red-100 transition-all"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Kembali ke Beranda
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 text-center">
                      💡 <strong>Saran:</strong> {getErrorSuggestion()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div>
          <Navbar active="form" />
          <div style={{ top: 0, marginTop: 80 }}>
            <section className="bg-gray-50 min-h-[calc(100vh-80px)]">
              <div className="mx-auto max-w-screen-xl px-4 py-16 lg:flex lg:items-center lg:justify-center">
                <div className="mx-auto max-w-md w-full">
                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  )
}
