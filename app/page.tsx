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

// FAQ Accordion Component
const FAQAccordion = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqData = [
    {
      question: "Bagaimana mengenali gejala awal DBD?",
      icon: "🌡️",
      color: "red",
      content: [
        { icon: "🔥", text: "Demam tinggi mendadak (38°C - 40°C) tanpa sebab yang jelas" },
        { icon: "🤕", text: "Sakit kepala hebat yang terasa menusuk, terutama di area belakang mata" },
        { icon: "💪", text: "Nyeri otot dan sendi yang membuat tubuh terasa sangat pegal" },
        { icon: "🤢", text: "Mual, muntah, dan hilang nafsu makan secara tiba-tiba" },
        { icon: "🔴", text: "Ruam merah kecil yang muncul di kulit, biasanya setelah hari ke-3" },
        { icon: "⚠️", text: "Perlu diingat: Gejala awal DBD mirip flu biasa, jadi waspada jika demam tidak kunjung turun" }
      ]
    },
    {
      question: "Kapan harus segera ke dokter?",
      icon: "🏥",
      color: "yellow",
      content: [
        { icon: "🚨", text: "Demam tinggi berlangsung lebih dari 3 hari berturut-turut" },
        { icon: "🤮", text: "Muntah terus-menerus sehingga tidak bisa makan atau minum" },
        { icon: "⚡", text: "Nyeri perut hebat dan berkelanjutan yang tidak tertahankan" },
        { icon: "🩸", text: "Pendarahan spontan: mimisan, gusi berdarah, atau bintik merah di kulit" },
        { icon: "😵", text: "Lemas berlebihan, gelisah, atau kehilangan kesadaran" },
        { icon: "💧", text: "Tanda dehidrasi: mulut kering, jarang buang air kecil, kulit pucat" }
      ]
    },
    {
      question: "Apa yang harus dilakukan dalam 24 jam pertama demam?",
      icon: "⏰",
      color: "blue",
      content: [
        { icon: "🌡️", text: "Monitor suhu tubuh setiap 2-3 jam dan catat dalam buku harian" },
        { icon: "💊", text: "Berikan paracetamol untuk menurunkan demam, HINDARI aspirin dan ibuprofen" },
        { icon: "💧", text: "Perbanyak minum air putih, oralit, atau jus buah segar" },
        { icon: "🛏️", text: "Istirahat total di tempat tidur dan hindari aktivitas berat" },
        { icon: "🍲", text: "Konsumsi makanan bergizi yang mudah dicerna seperti bubur atau sup" },
        { icon: "👨‍⚕️", text: "Hubungi dokter jika demam tidak turun setelah 24 jam atau muncul gejala lain" }
      ]
    },
    {
      question: "Apa perbedaan DBD dan tipes?",
      icon: "🔍",
      color: "green",
      content: [
        { icon: "🌡️", text: "DBD: Demam tinggi mendadak vs Tipes: Demam naik bertahap" },
        { icon: "🤕", text: "DBD: Sakit kepala hebat dan nyeri mata vs Tipes: Sakit kepala ringan" },
        { icon: "🔴", text: "DBD: Ruam merah kecil muncul hari ke-3 vs Tipes: Bintik merah di dada (rose spot)" },
        { icon: "💪", text: "DBD: Nyeri otot dan sendi parah vs Tipes: Nyeri otot ringan" },
        { icon: "🍽️", text: "DBD: Mual muntah awal penyakit vs Tipes: Gangguan pencernaan dominan" },
        { icon: "🧪", text: "Diagnosis pasti memerlukan tes laboratorium: NS1, IgG/IgM untuk DBD" }
      ]
    }
  ]

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const getColorClasses = (color: string) => {
    const colorMap = {
      red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'bg-red-100' },
      yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'bg-yellow-100' },
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'bg-blue-100' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'bg-green-100' }
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.red
  }

  return (
    <div className="space-y-4">
      {faqData.map((faq, index) => {
        const colors = getColorClasses(faq.color)
        const isOpen = openIndex === index

        return (
          <div key={index} className={`rounded-xl border-2 ${colors.border} ${colors.bg} overflow-hidden transition-all duration-300`}>
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-opacity-80 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${colors.icon} rounded-full flex items-center justify-center text-xl`}>
                  {faq.icon}
                </div>
                <h3 className={`text-lg font-semibold ${colors.text}`}>
                  {faq.question}
                </h3>
              </div>
              <svg
                className={`w-5 h-5 ${colors.text} transform transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : 'rotate-0'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className={`px-6 transition-all duration-300 ${isOpen ? 'pb-6' : 'pb-0 max-h-0 overflow-hidden'}`}>
              <div className="space-y-3 pt-2">
                {faq.content.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start gap-3">
                    <span className="text-lg mt-0.5 flex-shrink-0">{item.icon}</span>
                    <p className={`${colors.text} leading-relaxed`}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Call to action di akhir setiap FAQ */}
              <div className="mt-4 pt-4 border-t border-opacity-30">
                <p className="text-sm text-gray-600 mb-3">
                  Masih ada pertanyaan? Gunakan sistem deteksi kami untuk analisis lebih lanjut.
                </p>
                <Link
                  href="/form"
                  className={`inline-flex items-center gap-2 px-4 py-2 
                    ${faq.color === 'red' ? 'bg-red-600 hover:bg-red-700' : 
                      faq.color === 'yellow' ? 'bg-amber-600 hover:bg-amber-700' : 
                      faq.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 
                      'bg-green-600 hover:bg-green-700'} 
                    text-white rounded-lg text-sm font-medium transition-colors shadow-md hover:shadow-lg`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Cek Gejala Sekarang
                </Link>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

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
        <section className="relative bg-white overflow-hidden min-h-screen">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <circle cx="30" cy="30" r="2" fill="#dc2626"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)"/>
            </svg>
          </div>
          
          <div className="relative mx-auto max-w-screen-xl px-4 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
              
              {/* Left Content */}
              <div className="text-left space-y-6 lg:pr-8">
                <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2 rounded-full text-red-600 text-sm font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Deteksi Dini. Akurat. Terpercaya.
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    <span className="block">Deteksi DBD</span>
                    <span className="block text-red-600">lebih dini!</span>
                  </h1>
                  
                  <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                    Sistem AI canggih untuk membantu deteksi Demam Berdarah Dengue (DBD) 
                    lebih dini dengan akurasi tinggi
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link
                    className="group flex items-center justify-center gap-3 bg-red-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:bg-red-800 transform hover:scale-105 transition-all duration-300"
                    href="/form"
                  >
                    <svg
                      className="w-5 h-5 group-hover:rotate-12 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Mulai Pemeriksaan
                  </Link>
                  
                  {user ? (
                    <Link
                      className="group flex items-center justify-center gap-3 bg-white border-2 border-red-300 text-red-700 px-8 py-4 rounded-xl font-semibold hover:bg-red-50 transform hover:scale-105 transition-all duration-300"
                      href="/history"
                    >
                      <svg
                        className="w-5 h-5 group-hover:rotate-12 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Lihat Riwayat
                    </Link>
                  ) : (
                    <Link
                      className="group flex items-center justify-center gap-3 bg-white border-2 border-red-300 text-red-700 px-8 py-4 rounded-xl font-semibold hover:bg-red-50 transform hover:scale-105 transition-all duration-300"
                      href="/login"
                    >
                      <svg
                        className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                      </svg>
                      Masuk
                    </Link>
                  )}
                </div>

                {/* Additional Links */}
                <div className="flex flex-wrap gap-6 pt-4">
                  <Link
                    href="/articles"
                    className="group flex items-center gap-2 text-gray-600 hover:text-red-700 font-medium transition-colors"
                  >
                    <svg
                      className="w-4 h-4 group-hover:scale-110 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                    </svg>
                    Baca Artikel Terbaru
                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
                  
                  {user && (
                    <Link
                      href="/checklist"
                      className="group flex items-center gap-2 text-gray-600 hover:text-red-700 font-medium transition-colors"
                    >
                      <svg
                        className="w-4 h-4 group-hover:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Misi Mingguan
                      <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  )}
                  
                  {user && (
                    <Link
                      href="/profile"
                      className="group flex items-center gap-2 text-gray-600 hover:text-red-700 font-medium transition-colors"
                    >
                      <svg
                        className="w-4 h-4 group-hover:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      Misi & Badges
                      <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  )}
                  
                  <Link
                    href="/about"
                    className="group flex items-center gap-2 text-gray-600 hover:text-red-700 font-medium transition-colors"
                  >
                    <svg
                      className="w-4 h-4 group-hover:scale-110 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Pelajari Lebih Lanjut
                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex gap-8 pt-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">98%</div>
                    <div className="text-gray-500 text-sm">Akurasi</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">5 Menit</div>
                    <div className="text-gray-500 text-sm">Hasil Cepat</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">24/7</div>
                    <div className="text-gray-500 text-sm">Tersedia</div>
                  </div>
                </div>
              </div>

              {/* Right Illustration - Mosquito & Medical Theme */}
              <div className="relative lg:pl-8">
                <div className="relative">
                  {/* Main Background Circle */}
                  <div className="relative w-80 h-80 lg:w-96 lg:h-96 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-xl opacity-10"></div>
                    <div className="absolute inset-4 bg-gradient-to-br from-red-400 to-red-500 rounded-full opacity-20"></div>
                    
                    {/* Main Mosquito Illustration */}
                    <div className="absolute inset-16 flex items-center justify-center">
                      <div className="text-red-500 transform rotate-12 animate-pulse">
                        <svg className="w-40 h-40 lg:w-48 lg:h-48" fill="currentColor" viewBox="0 0 512 512">
                          <path d="M463.1 474.7c-4.2-4.7-9.6-7.2-15.8-7.2s-11.6 2.5-15.8 7.2l-55.5 62.1c-8.4 9.4-8.4 23.7 0 33.1 8.4 9.4 22.1 9.4 30.5 0l55.5-62.1c8.4-9.4 8.4-23.7 0-33.1zM256 320c-88.4 0-160-71.6-160-160S167.6 0 256 0s160 71.6 160 160-71.6 160-160 160zm0-288c-70.7 0-128 57.3-128 128s57.3 128 128 128 128-57.3 128-128S326.7 32 256 32z"/>
                          <circle cx="256" cy="160" r="48"/>
                          <path d="M432 160c0-97.2-78.8-176-176-176S80 62.8 80 160c0 41.8 14.6 80.1 39 110.1L256 416l137-145.9c24.4-30 39-68.3 39-110.1z"/>
                        </svg>
                      </div>
                    </div>
                    
                    {/* Medical Icons around mosquito */}
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-red-400 animate-bounce">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    
                    {/* Blood drop */}
                    <div className="absolute top-16 right-12 text-red-500 animate-pulse">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2s-8 8.5-8 12a8 8 0 1 0 16 0c0-3.5-8-12-8-12z"/>
                      </svg>
                    </div>
                    
                    {/* Temperature/thermometer */}
                    <div className="absolute bottom-16 left-12 text-red-400 animate-pulse" style={{ animationDelay: '0.5s' }}>
                      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15 13V5a3 3 0 0 0-6 0v8a5 5 0 1 0 6 0zM12 4a1 1 0 0 1 1 1v7.5a3 3 0 1 1-2 0V5a1 1 0 0 1 1-1z"/>
                      </svg>
                    </div>
                    
                    {/* Medical cross */}
                    <div className="absolute bottom-8 right-16 text-red-300 animate-pulse" style={{ animationDelay: '1s' }}>
                      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                      </svg>
                    </div>
                    
                    {/* Virus particle */}
                    <div className="absolute top-20 left-8 text-red-300 animate-bounce" style={{ animationDelay: '1.5s' }}>
                      <div className="relative w-8 h-8 bg-current rounded-full opacity-60">
                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-current rounded-full"></div>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-current rounded-full"></div>
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-current rounded-full"></div>
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-current rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Heart pulse */}
                    <div className="absolute bottom-20 right-8 text-red-400 animate-pulse" style={{ animationDelay: '2s' }}>
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                    
                    {/* DNA strand */}
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-200 animate-spin" style={{ animationDuration: '10s' }}>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Floating decorative elements */}
                  <div className="absolute -top-4 left-1/4 text-red-300 animate-float">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </div>
                  
                  <div className="absolute -right-4 top-1/3 text-red-200 animate-bounce" style={{ animationDelay: '0.7s' }}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="2"/>
                    </svg>
                  </div>
                  
                  <div className="absolute -left-6 bottom-1/4 text-red-300 animate-pulse" style={{ animationDelay: '1.3s' }}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="2.5"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Quick Tips Cards Section */}
      <section className="min-h-screen bg-gray-50 flex items-center">
        <div className="mx-auto max-w-screen-xl px-4 py-20 w-full">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              Tips Pencegahan DBD
            </h2>
            <p className="text-gray-600 text-base lg:text-lg max-w-2xl mx-auto mb-4">
              Langkah-langkah sederhana untuk melindungi diri dan keluarga dari bahaya Demam Berdarah Dengue
            </p>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full text-blue-600 text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM9 7a1 1 0 11-2 0 1 1 0 012 0zM7 10a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H8a1 1 0 01-1-1v-3z"/>
              </svg>
              Metode 3M Plus - Cara Terbukti Efektif
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Card 1: Menguras */}
            <div className="group bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-100">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg className="w-7 h-7 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2s-8 8.5-8 12a8 8 0 1 0 16 0c0-3.5-8-12-8-12zm0 18a6 6 0 0 1-6-6c0-2.17 3.5-6.5 6-9.47C14.5 7.5 18 11.83 18 14a6 6 0 0 1-6 6z"/>
                    <circle cx="12" cy="14" r="2" fill="white"/>
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Menguras & Membersihkan
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  Kuras dan bersihkan tempat penampungan air seperti bak mandi, ember, vas bunga minimal seminggu sekali
                </p>
                <div className="text-xs text-blue-600 font-medium">
                  ✓ Bak mandi  ✓ Ember air  ✓ Vas bunga
                </div>
              </div>
            </div>

            {/* Card 2: Menutup */}
            <div className="group bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-100">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg className="w-7 h-7 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                    <path d="M7 10h10v7H7z" opacity="0.6"/>
                    <path d="M9 7h6v2H9z"/>
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Menutup Rapat
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  Tutup rapat-rapat tempat penyimpanan air dan wadah yang berpotensi menampung air hujan
                </p>
                <div className="text-xs text-green-600 font-medium">
                  ✓ Tong air  ✓ Drum  ✓ Tempayan
                </div>
              </div>
            </div>

            {/* Card 3: Mendaur Ulang */}
            <div className="group bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-100">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <svg className="w-7 h-7 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2v6l4-4-4-4zM21 9l-4 4 4 4v-8zM12 22v-6l-4 4 4 4zM3 15l4-4-4-4v8z"/>
                    <circle cx="12" cy="12" r="2" opacity="0.6"/>
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Mendaur Ulang
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  Manfaatkan atau daur ulang barang bekas yang dapat menampung air seperti kaleng, ban bekas
                </p>
                <div className="text-xs text-purple-600 font-medium">
                  ✓ Kaleng bekas  ✓ Ban bekas  ✓ Botol plastik
                </div>
              </div>
            </div>

            {/* Card 4: Plus (Tambahan) */}
            <div className="group bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-100">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <svg className="w-7 h-7 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Plus Proteksi
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  Tambahan perlindungan dengan menanam tanaman anti nyamuk dan menggunakan obat nyamuk
                </p>
                <div className="text-xs text-orange-600 font-medium">
                  ✓ Lavender  ✓ Serai wangi  ✓ Lotion anti nyamuk
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Gejala DBD */}
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-800">Waspadai Gejala DBD</h3>
              </div>
              <ul className="space-y-2 text-sm text-red-700">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  Demam tinggi mendadak (38°C - 40°C) selama 2-7 hari
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  Sakit kepala hebat dan nyeri di belakang mata
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  Nyeri otot dan sendi di seluruh tubuh
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  Mual, muntah, dan hilang nafsu makan
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  Ruam merah pada kulit
                </li>
              </ul>
            </div>

            {/* Kapan Harus ke Dokter */}
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2L3 7v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V7l-7-5z"/>
                    <path d="M9 10h2v6H9v-6zm0-4h2v2H9V6z" fill="white"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-yellow-800">Segera ke Dokter Jika</h3>
              </div>
              <ul className="space-y-2 text-sm text-yellow-700">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                  Demam tidak turun setelah 3 hari
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                  Muntah terus-menerus dan tidak bisa makan/minum
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                  Nyeri perut hebat dan terus-menerus
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                  Pendarahan (mimisan, gusi berdarah)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                  Lemas, gelisah, atau pingsan
                </li>
              </ul>
            </div>
          </div>

          
        </div>
      </section>

      {/* FAQ/Edukasi Section */}
      <section className="min-h-screen bg-white flex items-center">
        <div className="mx-auto max-w-screen-xl px-4 py-20 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Pertanyaan Umum tentang DBD
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Pertanyaan umum seputar DBD yang perlu Anda ketahui untuk pencegahan dan penanganan yang tepat
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <FAQAccordion />
          </div>
        </div>
      </section>

      <section className="min-h-screen relative z-0 flex items-center bg-white"
        style={{ backgroundColor: '#fafafa' }}>
        <div className="mx-auto max-w-screen-xl px-4 py-20 w-full">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              Peta Sebaran DBD di Indonesia
            </h2>
            <p className="text-gray-600">
              Visualisasi data kasus DBD berdasarkan lokasi geografis
            </p>
          </div>
          
          <div
            id="chart"
            className="chart mx-auto w-full bg-white rounded-lg shadow-lg p-6"
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
              Platform komprehensif untuk deteksi, pencegahan, dan edukasi DBD dengan teknologi AI dan gamifikasi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 - AI Detection */}
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
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Deteksi AI
              </h3>
              <p className="text-gray-600 text-sm">
                Algoritma machine learning untuk prediksi DBD akurat berdasarkan gejala
              </p>
            </div>

            {/* Feature 2 - Weekly Missions */}
            <div className="text-center p-6 rounded-lg border-2 border-gray-100 hover:border-orange-500 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-orange-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Misi Mingguan
              </h3>
              <p className="text-gray-600 text-sm">
                Checklist interaktif pencegahan DBD dengan tracking progress dan reward
              </p>
            </div>

            {/* Feature 3 - Achievement System */}
            <div className="text-center p-6 rounded-lg border-2 border-gray-100 hover:border-purple-500 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-purple-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="7"/>
                  <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Sistem Badges
              </h3>
              <p className="text-gray-600 text-sm">
                Kumpulkan badges untuk konsistensi pencegahan dan pencapaian milestone
              </p>
            </div>

            {/* Feature 4 - News Aggregator */}
            <div className="text-center p-6 rounded-lg border-2 border-gray-100 hover:border-blue-500 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
                  <path d="M18 14h-8"/>
                  <path d="M15 18h-5"/>
                  <path d="M10 6h8"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Berita Terkini
              </h3>
              <p className="text-gray-600 text-sm">
                Update berita dan informasi terbaru seputar DBD dari berbagai sumber
              </p>
            </div>
          </div>

          {/* Additional Features Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {/* Feature 5 - Data Visualization */}
            <div className="text-center p-6 rounded-lg border-2 border-gray-100 hover:border-green-500 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-green-600"
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
                Peta Sebaran
              </h3>
              <p className="text-gray-600">
                Visualisasi interaktif sebaran kasus DBD di Indonesia dengan teknologi heatmap
              </p>
            </div>

            {/* Feature 6 - History Tracking */}
            <div className="text-center p-6 rounded-lg border-2 border-gray-100 hover:border-indigo-500 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-indigo-600"
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
                Riwayat Lengkap
              </h3>
              <p className="text-gray-600">
                Tracking pemeriksaan dan progress pencegahan dengan analytics mendalam
              </p>
            </div>

            {/* Feature 7 - Educational Content */}
            <div className="text-center p-6 rounded-lg border-2 border-gray-100 hover:border-yellow-500 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-yellow-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Edukasi Interaktif
              </h3>
              <p className="text-gray-600">
                FAQ komprehensif dan tips pencegahan DBD dengan format yang mudah dipahami
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
