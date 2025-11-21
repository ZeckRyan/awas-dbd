'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import { getDengueCheckHistory, DengueCheckRecord } from '@/lib/dengue-service'
import { createClient } from '../../utils/supabase/client'

export default function HistoryPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical' | 'warning' | 'safe'>('all')
  const [historyData, setHistoryData] = useState<DengueCheckRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
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
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedFilter === 'all'
                      ? 'bg-red-700 text-white'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-700'
                  }`}
                >
                  Semua ({transformedData.length})
                </button>
                <button
                  onClick={() => setSelectedFilter('critical')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedFilter === 'critical'
                      ? 'bg-red-700 text-white'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-700'
                  }`}
                >
                  Positif ({transformedData.filter(d => d.status === 'critical').length})
                </button>
                <button
                  onClick={() => setSelectedFilter('warning')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedFilter === 'warning'
                      ? 'bg-red-700 text-white'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-700'
                  }`}
                >
                  Kemungkinan ({transformedData.filter(d => d.status === 'warning').length})
                </button>
                <button
                  onClick={() => setSelectedFilter('safe')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedFilter === 'safe'
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
                              className={`h-2 rounded-full ${
                                item.status === 'critical'
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
                            const record = item.raw
                            
                            // Create comprehensive report
                            const report = `
╔═══════════════════════════════════════════════════════════════════╗
║              LAPORAN HASIL PEMERIKSAAN DBD                        ║
║                  Dengue Fever Check Report                        ║
╚═══════════════════════════════════════════════════════════════════╝

INFORMASI PEMERIKSAAN
─────────────────────────────────────────────────────────────────────
Tanggal Pemeriksaan : ${item.date}
Waktu Pemeriksaan   : ${item.time}
ID Pemeriksaan      : ${item.id}

HASIL PEMERIKSAAN
─────────────────────────────────────────────────────────────────────
Status              : ${item.result}
Tingkat Kepercayaan : ${item.probability}%
Model Prediksi      : ${record.model_used}

${item.status === 'critical' ? '⚠️  PERHATIAN: Hasil menunjukkan indikasi POSITIF DBD\n    Segera konsultasikan ke dokter atau fasilitas kesehatan!' : 
  item.status === 'warning' ? '⚠️  PERINGATAN: Ada kemungkinan DBD\n    Disarankan untuk memeriksakan diri ke dokter.' :
  '✓  Hasil pemeriksaan tidak menunjukkan indikasi DBD\n    Tetap jaga kesehatan dan kebersihan lingkungan.'}

DATA DEMAM
─────────────────────────────────────────────────────────────────────
Mengalami Demam     : ${record.kdema}
${record.kdema === 'Iya' ? `Durasi Demam        : ${record.ddema} hari
Suhu Tubuh          : ${record.suhun}°C` : ''}

DATA UJI LABORATORIUM
─────────────────────────────────────────────────────────────────────
Status Uji Lab      : ${record.ulabo}
${record.ulabo === 'Sudah' ? `Leukosit (WBC)      : ${record.jwbcs.toFixed(1)} x10³/μL
Hemoglobin          : ${record.hemog.toFixed(1)} g/dL
Hematokrit          : ${record.hemat}%
Trombosit           : ${record.jplat} x10³/μL` : ''}

GEJALA KLINIS
─────────────────────────────────────────────────────────────────────
[${record.skpla === 'Iya' ? '✓' : '✗'}] Sakit Kepala Parah
[${record.nymat === 'Iya' ? '✓' : '✗'}] Nyeri Belakang Mata
[${record.nysen === 'Iya' ? '✓' : '✗'}] Nyeri Sendi/Otot
[${record.rsmul === 'Iya' ? '✓' : '✗'}] Rasa Logam di Mulut
[${record.hinfm === 'Iya' ? '✓' : '✗'}] Hilang Nafsu Makan
[${record.nyper === 'Iya' ? '✓' : '✗'}] Nyeri Perut
[${record.mumun === 'Iya' ? '✓' : '✗'}] Mual/Muntah
[${record.mdiar === 'Iya' ? '✓' : '✗'}] Diare

INFORMASI MODEL
─────────────────────────────────────────────────────────────────────
Model yang digunakan menggunakan algoritma Logistic Regression untuk
memprediksi kemungkinan DBD berdasarkan data yang dimasukkan.

Varian Model: ${
  record.model_used === 'all_data' ? 'Model Lengkap (Demam + Lab + Gejala)' :
  record.model_used === 'fever_general_data' ? 'Model Demam (Demam + Gejala)' :
  record.model_used === 'lab_general_data' ? 'Model Lab (Lab + Gejala)' :
  record.model_used === 'only_general_data' ? 'Model Gejala (Hanya Gejala)' :
  record.model_used
}

DISCLAIMER
─────────────────────────────────────────────────────────────────────
⚠️  PENTING: Hasil pemeriksaan ini bersifat prediktif dan tidak dapat
    menggantikan diagnosis medis profesional. Selalu konsultasikan
    dengan dokter untuk diagnosis yang akurat.

─────────────────────────────────────────────────────────────────────
Laporan dibuat oleh: Dengue Checker System
Website: https://dengue-checker.vercel.app
Waktu cetak: ${new Date().toLocaleString('id-ID', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
═══════════════════════════════════════════════════════════════════════
`.trim()

                            // Create text file
                            const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
                            const url = URL.createObjectURL(blob)
                            const link = document.createElement('a')
                            link.href = url
                            link.download = `Laporan-DBD-${item.date.replace(/\s/g, '-')}-${item.time.replace(':', '')}.txt`
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                            URL.revokeObjectURL(url)
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
