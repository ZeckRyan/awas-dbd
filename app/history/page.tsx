'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import { getDengueCheckHistory, DengueCheckRecord } from '@/lib/dengue-service'
import { createClient } from '../../utils/supabase/client'
import jsPDF from 'jspdf'

// Helper function to generate PDF report
function generatePDFReport(item: any, record: DengueCheckRecord, userName: string, userEmail: string) {
  const doc = new jsPDF()

  // Colors
  const primaryRed = [220, 38, 38]
  const darkGray = [31, 41, 55]
  const lightGray = [156, 163, 175]

  // Header with logo (circle with X)
  doc.setFillColor(primaryRed[0], primaryRed[1], primaryRed[2])
  doc.circle(30, 20, 8, 'F')
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(2)
  doc.line(26, 16, 34, 24)
  doc.line(26, 24, 34, 16)

  //Title
  doc.setFontSize(20)
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
  doc.setFont('helvetica', 'bold')
  doc.text('PANTAU DBD', 50, 20)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2])
  doc.text('Sistem Pemantauan Demam Berdarah Dengue', 50, 26)

  // Report title
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
  doc.text('LAPORAN HASIL PEMERIKSAAN DENGUE', 105, 40, { align: 'center' })

  // Report number
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2])
  const reportNo = `No. Laporan: PDB/${new Date().getFullYear()}/${item.date.replace(/\s/g, '')}/${item.id.substring(0, 8)}`
  doc.text(reportNo, 105, 46, { align: 'center' })

  // Horizontal line
  doc.setDrawColor(darkGray[0], darkGray[1], darkGray[2])
  doc.setLineWidth(0.5)
  doc.line(20, 50, 190, 50)

  let yPos = 60

  // INFORMASI PASIEN BOX
  doc.setDrawColor(darkGray[0], darkGray[1], darkGray[2])
  doc.setLineWidth(0.5)
  doc.rect(20, yPos, 170, 18)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORMASI PASIEN', 25, yPos + 6)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Nama Pasien', 25, yPos + 11)
  doc.text(': ' + (userName || 'Anonymous'), 60, yPos + 11)
  doc.text('Email', 25, yPos + 15)
  doc.text(': ' + (userEmail || '-'), 60, yPos + 15)

  yPos += 26

  // HASIL PEMERIKSAAN BOX
  doc.rect(20, yPos, 170, 30)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('HASIL PEMERIKSAAN', 25, yPos + 6)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('STATUS', 25, yPos + 14)
  doc.setFontSize(12)
  if (item.status === 'critical' || item.status === 'warning') {
    doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2])
  } else {
    doc.setTextColor(16, 185, 129) // green
  }
  doc.text(': ' + item.result.toUpperCase(), 60, yPos + 14)

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Tingkat Kepercayaan', 25, yPos + 20)
  doc.text(`: ${item.probability}%`, 60, yPos + 20)

  // Warning box
  if (item.status === 'critical' || item.status === 'warning') {
    doc.setFillColor(254, 226, 226)
    doc.rect(25, yPos + 22, 160, 6, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    const warningText = item.status === 'critical'
      ? 'PERHATIAN: Hasil menunjukkan indikasi POSITIF Demam Berdarah Dengue (DBD). Segera konsultasikan dengan dokter.'
      : 'PERHATIAN: Hasil menunjukkan kemungkinan DBD. Disarankan memeriksakan diri ke dokter.'
    doc.text(warningText, 27, yPos + 26, { maxWidth: 155 })
  }

  yPos += 38

  // DATA DEMAM & LAB - Two columns
  const col1X = 20
  const col2X = 107
  const colWidth = 83

  // DATA DEMAM (Left)
  doc.setDrawColor(darkGray[0], darkGray[1], darkGray[2])
  doc.rect(col1X, yPos, colWidth, 20)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('DATA DEMAM', col1X + 5, yPos + 6)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Status Demam', col1X + 5, yPos + 12)
  doc.text(`: ${record.kdema}`, col1X + 35, yPos + 12)

  if (record.kdema === 'Iya') {
    doc.text('Durasi', col1X + 5, yPos + 16)
    doc.text(`: ${record.ddema} hari`, col1X + 35, yPos + 16)
  }

  // DATA LABORATORIUM (Right)
  doc.rect(col2X, yPos, colWidth, 20)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('DATA LABORATORIUM', col2X + 5, yPos + 6)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Status Lab', col2X + 5, yPos + 12)
  doc.text(`: ${record.ulabo}`, col2X + 35, yPos + 12)

  yPos += 28

  // GEJALA KLINIS TERDETEKSI
  doc.rect(20, yPos, 170, 36)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('GEJALA KLINIS TERDETEKSI', 25, yPos + 6)

  // Symptoms in 2 columns
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  const symptoms = [
    { label: 'Sakit Kepala Parah', value: record.skpla },
    { label: 'Nyeri Sendi/Otot', value: record.nysen },
    { label: 'Hilang Nafsu Makan', value: record.hinfm },
    { label: 'Mual/Muntah', value: record.mumun },
    { label: 'Nyeri Belakang Mata', value: record.nymat },
    { label: 'Rasa Logam di Mulut', value: record.rsmul },
    { label: 'Nyeri Perut', value: record.nyper },
    { label: 'Diare', value: record.mdiar },
  ]

  let symY = yPos + 12
  symptoms.forEach((symptom, idx) => {
    const x = idx % 2 === 0 ? 25 : 110
    doc.text(symptom.label, x, symY)
    doc.text(`: ${symptom.value === 'Iya' ? 'YA' : '-'}`, x + 45, symY)
    if (idx % 2 === 1) symY += 4
  })

  yPos += 44

  // DISCLAIMER
  doc.setFillColor(249, 250, 251)
  doc.rect(20, yPos, 170, 14, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('DISCLAIMER', 25, yPos + 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  const disclaimer = 'Hasil ini bersifat prediktif (Algoritma Logistic Regression) dan TIDAK MENGGANTIKAN diagnosis medis profesional.'
  doc.text(disclaimer, 25, yPos + 10, { maxWidth: 160 })

  yPos += 18

  // Footer
  doc.setFontSize(7)
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2])
  const footerText = `Laporan dibuat oleh Pantau DB System | https://deteksi-dbd.jkovu.dev`
  doc.text(footerText, 105, yPos + 4, { align: 'center' })
  const printTime = `Dicetak pada: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} pukul ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
  doc.text(printTime, 105, yPos + 8, { align: 'center' })

  // Save PDF
  const fileName = `Laporan-DBD-${item.date.replace(/\s/g, '-')}-${item.time.replace(':', '')}.pdf`
  doc.save(fileName)
}

export default function HistoryPage() {
  const router = useRouter()
  const supabase = createClient()

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical' | 'warning' | 'safe'>('all')
  const [historyData, setHistoryData] = useState<DengueCheckRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Fetch user profile for name
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profile?.full_name) {
        setUserName(profile.full_name)
      }

      // Fetch history data
      setLoading(true)
      const result = await getDengueCheckHistory()

      if (result.success && result.data) {
        setHistoryData(result.data)
      } else {
        setError(result.error || 'Gagal memuat riwayat')
      }

      setLoading(false)
    }

    checkAuthAndFetchData()
  }, [router, supabase])

  const getStatusFromPrediction = (prediction: number, probability: number): 'critical' | 'warning' | 'safe' => {
    if (prediction === 1) {
      return probability >= 75 ? 'critical' : 'warning'
    }
    return 'safe'
  }

  const getResultText = (prediction: number, probability: number): string => {
    if (prediction === 1) {
      return probability >= 75 ? 'Positif DBD' : 'Kemungkinan DBD'
    }
    return 'Negatif DBD'
  }

  const getSymptomsFromData = (record: DengueCheckRecord): string[] => {
    const symptoms: string[] = []

    if (record.kdema === 'Iya') symptoms.push('Demam')
    if (record.nymat === 'Iya') symptoms.push('Nyeri mata')
    if (record.nysen === 'Iya') symptoms.push('Nyeri sendi')
    if (record.rsmul === 'Iya') symptoms.push('Ruam kulit')
    if (record.hinfm === 'Iya') symptoms.push('Hidung/gusi berdarah')
    if (record.nyper === 'Iya') symptoms.push('Nyeri perut')
    if (record.mumun === 'Iya') symptoms.push('Muntah')
    if (record.mdiar === 'Iya') symptoms.push('Diare')

    if (symptoms.length === 0) symptoms.push('Tidak ada gejala utama')

    return symptoms
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Transform database records to display format
  const transformedData = historyData.map(record => ({
    id: record.id,
    date: formatDate(record.created_at),
    time: formatTime(record.created_at),
    result: getResultText(record.prediction, record.probability || 0),
    probability: Math.round(record.probability || 0),
    symptoms: getSymptomsFromData(record),
    status: getStatusFromPrediction(record.prediction, record.probability || 0),
    raw: record
  }))

  const filteredData = selectedFilter === 'all'
    ? transformedData
    : transformedData.filter(item => item.status === selectedFilter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'safe':
        return 'bg-green-100 text-green-800 border-green-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'safe':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div>
      <Navbar active="history" />

      <div style={{ top: 0, marginTop: 80 }}>
        <section className="bg-gray-50 min-h-screen py-8">
          <div className="mx-auto max-w-screen-xl px-4">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                Riwayat Pemeriksaan
              </h1>
              <p className="text-gray-600">
                Lihat hasil pemeriksaan DBD yang pernah Anda lakukan
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat riwayat pemeriksaan...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-red-500 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-900 text-lg font-medium mb-2">
                    Gagal Memuat Riwayat
                  </p>
                  <p className="text-gray-600 text-sm mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-red-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-800"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            )}

            {/* Filter Buttons - Only show if data loaded */}
            {!loading && !error && (
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedFilter === 'all'
                    ? 'bg-red-700 text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-700'
                    }`}
                >
                  Semua ({transformedData.length})
                </button>
                <button
                  onClick={() => setSelectedFilter('critical')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedFilter === 'critical'
                    ? 'bg-red-700 text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-700'
                    }`}
                >
                  Positif ({transformedData.filter(d => d.status === 'critical').length})
                </button>
                <button
                  onClick={() => setSelectedFilter('warning')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedFilter === 'warning'
                    ? 'bg-red-700 text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-700'
                    }`}
                >
                  Kemungkinan ({transformedData.filter(d => d.status === 'warning').length})
                </button>
                <button
                  onClick={() => setSelectedFilter('safe')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedFilter === 'safe'
                    ? 'bg-red-700 text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-700'
                    }`}
                >
                  Negatif ({transformedData.filter(d => d.status === 'safe').length})
                </button>
              </div>
            )}

            {/* History List - Only show if data loaded */}
            {!loading && !error && historyData.length > 0 && (
              <div className="space-y-4">
                {filteredData.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                    <img
                      src="/dengue.png"
                      alt="No Data"
                      className="w-32 mx-auto mb-6 opacity-50"
                    />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Tidak Ada Data
                    </h2>
                    <p className="text-gray-600 mb-2">
                      Tidak ada riwayat pemeriksaan untuk filter yang dipilih
                    </p>
                    <p className="text-gray-500 text-sm">
                      Coba pilih filter lain atau lakukan pemeriksaan baru
                    </p>
                  </div>
                ) : (
                  filteredData.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Left Section */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(item.status)}`}>
                              {getStatusIcon(item.status)}
                              <span className="font-semibold text-sm">
                                {item.result}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {item.date} • {item.time}
                            </span>
                          </div>

                          {/* Probability Bar */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">
                                Tingkat Kepercayaan
                              </span>
                              <span className="text-sm font-bold text-gray-900">
                                {item.probability}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${item.status === 'critical'
                                  ? 'bg-red-600'
                                  : item.status === 'warning'
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                  }`}
                                style={{ width: `${item.probability}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Symptoms */}
                          <div>
                            <span className="text-sm font-medium text-gray-700 block mb-2">
                              Gejala yang dilaporkan:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {item.symptoms.map((symptom, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                                >
                                  {symptom}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right Section - Actions */}
                        <div className="flex md:flex-col gap-2">
                          <button
                            onClick={() => router.push(`/history/${item.id}`)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-700 text-white rounded-lg font-medium hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all text-sm"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            Detail
                          </button>
                          <button
                            onClick={() => {
                              generatePDFReport(item, item.raw, userName, user?.email || '')

                            }}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all text-sm"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                            Unduh
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Empty State for no history at all - Only show if not loading and no error */}
            {!loading && !error && historyData.length === 0 && (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <img
                  src="/dengue.png"
                  alt="No History"
                  className="w-32 mx-auto mb-6 opacity-50"
                />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Belum Ada Riwayat
                </h2>
                <p className="text-gray-600 mb-6">
                  Anda belum melakukan pemeriksaan DBD. Mulai pemeriksaan pertama Anda sekarang!
                </p>
                <a
                  href="/form"
                  className="inline-flex items-center gap-2 bg-red-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Mulai Pemeriksaan
                </a>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
