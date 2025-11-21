'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Navbar from './components/Navbar'
import { createClient } from '../utils/supabase/client'
import { User } from '@supabase/supabase-js'

const LeafletMap = dynamic(() => import('./components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
        <p className="text-gray-500">Memuat komponen peta...</p>
      </div>
    </div>
  ),
})

export default function Home() {
  const [plotData, setPlotData] = useState<any>(null)
  const [isLoadingPlot, setIsLoadingPlot] = useState<boolean>(true)
  const [isMounted, setIsMounted] = useState<boolean>(false)
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    setIsMounted(true)

    // Get user auth state
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Load heatmap data
    setIsLoadingPlot(true)
    fetch('/heatmap_geo.json')
      .then((response) => response.json())
      .then((data) => {
        setPlotData(data)
        setIsLoadingPlot(false)
      })
      .catch(() => {
        setIsLoadingPlot(false)
      })

    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <div>
      <Navbar active="home" />

      <div style={{ top: 0, marginTop: 80 }}>
        <section className="bg-gray-50">
          <div className="mx-auto max-w-screen-xl px-4 py-16 lg:py-24 lg:flex lg:h-auto lg:min-h-[70vh] lg:items-center">
            <div className="mx-auto max-w-xl text-center">
              <div className="flex flex-col text-3xl font-extrabold sm:text-5xl">
                <span>Deteksi DBD</span>
                <span className="text-red-700">lebih dini!</span>
              </div>

              <p className="mt-4 sm:text-xl/relaxed">
                Sistem ini dapat membantu Anda untuk mendeteksi Demam Berdarah
                Dengue (DBD) lebih dini dengan AI
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  className="flex gap-x-2 rounded bg-red-700 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-800 focus:outline-none focus:ring active:bg-red-500 sm:w-auto"
                  href="/form"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                    <circle cx="12" cy="12" r="3" />
                    <path d="m16 16-1.9-1.9" />
                  </svg>
                  Periksa
                </Link>
                
                {user ? (
                  <Link
                    className="flex gap-x-2 rounded bg-white border-2 border-red-700 px-12 py-3 text-sm font-medium text-red-700 shadow hover:bg-red-50 focus:outline-none focus:ring active:bg-red-100 sm:w-auto"
                    href="/history"
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
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                      <path d="M8 16H3v5" />
                    </svg>
                    Riwayat
                  </Link>
                ) : (
                  <Link
                    className="flex gap-x-2 rounded bg-white border-2 border-red-700 px-12 py-3 text-sm font-medium text-red-700 shadow hover:bg-red-50 focus:outline-none focus:ring active:bg-red-100 sm:w-auto"
                    href="/login"
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
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" x2="3" y1="12" y2="12" />
                    </svg>
                    Masuk
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="py-2 md:py-16 relative z-0">
        <div className="mx-auto max-w-screen-xl px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Peta Sebaran DBD di Indonesia
            </h2>
            <p className="text-gray-600">
              Visualisasi data kasus DBD berdasarkan lokasi geografis
            </p>
          </div>
          
          <div
            id="chart"
            className="chart mx-auto w-full bg-white rounded-lg shadow-lg p-4"
            style={{ minHeight: 600, height: 600, width: '100%' }}
          >
            {isLoadingPlot && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
                  <p className="text-gray-500">Memuat peta Indonesia...</p>
                </div>
              </div>
            )}
            {!isLoadingPlot && !plotData && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="text-red-500 font-medium">Gagal memuat data peta</p>
                  <p className="text-gray-500 text-sm mt-2">Silakan refresh halaman atau coba lagi nanti</p>
                </div>
              </div>
            )}
            {!isLoadingPlot && plotData && isMounted && (
              <LeafletMap
                data={plotData.data}
                layout={plotData.layout}
              />
            )}
          </div>
        </div>
      </section>

      {/* Section: Features */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-screen-xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sistem deteksi DBD dengan teknologi AI untuk membantu diagnosa lebih cepat dan akurat
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-lg border-2 border-gray-100 hover:border-red-700 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-red-700"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                  <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Deteksi Berbasis AI
              </h3>
              <p className="text-gray-600">
                Menggunakan algoritma Logistic Regression untuk prediksi akurat berdasarkan gejala dan hasil lab
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-lg border-2 border-gray-100 hover:border-red-700 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-red-700"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M8 16H3v5" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Riwayat Pemeriksaan
              </h3>
              <p className="text-gray-600">
                Simpan dan akses riwayat pemeriksaan Anda kapan saja untuk monitoring kesehatan
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-lg border-2 border-gray-100 hover:border-red-700 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-red-700"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Visualisasi Data
              </h3>
              <p className="text-gray-600">
                Lihat peta sebaran kasus DBD di Indonesia untuk awareness dan pencegahan
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: CTA */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-800">
        <div className="mx-auto max-w-screen-xl px-4">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Deteksi DBD Sejak Dini
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Jangan tunggu sampai terlambat. Lakukan pemeriksaan sekarang dan dapatkan hasil prediksi instan!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/form"
                className="flex gap-x-2 items-center rounded bg-white px-8 py-4 text-sm font-medium text-red-700 shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-white/50 active:bg-gray-200 transition-all"
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
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="m16 16-1.9-1.9" />
                </svg>
                Mulai Pemeriksaan
              </Link>
              <a
                href="https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue"
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-x-2 items-center rounded border-2 border-white px-8 py-4 text-sm font-medium text-white hover:bg-white hover:text-red-700 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all"
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
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                Pelajari Lebih Lanjut
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="mx-auto max-w-screen-xl px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: About */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/dengue.png" className="h-10" alt="UTY Logo" />
                <h3 className="text-xl font-bold">Dengue Checker</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Sistem deteksi dini Demam Berdarah Dengue berbasis AI untuk membantu masyarakat Indonesia mendapatkan diagnosa lebih cepat dan akurat.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://github.com/aliepratama/dengue-checker-nextjs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Tautan Cepat</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link href="/form" className="text-gray-400 hover:text-white transition-colors">
                    Periksa Sekarang
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                    Tentang
                  </Link>
                </li>
                <li>
                  <Link href="/history" className="text-gray-400 hover:text-white transition-colors">
                    Riwayat
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                    Masuk
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Informasi</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Tentang DBD (WHO)
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.kemkes.go.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Kemenkes RI
                  </a>
                </li>
                <li>
                  <a
                    href="https://uty.ac.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Tentang UTY
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Dengue Checker - Universitas Teknologi Yogyakarta. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
