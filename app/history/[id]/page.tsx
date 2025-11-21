'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import { getDengueCheckById, DengueCheckRecord, deleteDengueCheck } from '@/lib/dengue-service'
import { createClient } from '../../../utils/supabase/client'

export default function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const supabase = createClient()
  const { id } = use(params)
  
  const [record, setRecord] = useState<DengueCheckRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch detail data
      setLoading(true)
      const result = await getDengueCheckById(id)
      
      if (result.success && result.data) {
        setRecord(result.data)
      } else {
        setError(result.error || 'Gagal memuat detail pemeriksaan')
      }
      
      setLoading(false)
    }

    checkAuthAndFetchData()
  }, [id, router, supabase])

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus riwayat pemeriksaan ini?')) {
      return
    }

    setDeleting(true)
    const result = await deleteDengueCheck(id)
    
    if (result.success) {
      router.push('/history')
    } else {
      alert('Gagal menghapus data: ' + (result.error || 'Unknown error'))
      setDeleting(false)
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusInfo = (prediction: number, probability: number) => {
    if (prediction === 1) {
      if (probability >= 75) {
        return {
          status: 'Positif DBD',
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
          recommendation: 'Segera konsultasikan ke dokter atau fasilitas kesehatan terdekat. Hasil pemeriksaan menunjukkan indikasi kuat DBD.',
          bgColor: 'bg-red-50'
        }
      } else {
        return {
          status: 'Kemungkinan DBD',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ),
          recommendation: 'Disarankan untuk memeriksakan diri ke dokter untuk pemeriksaan lebih lanjut. Pantau gejala yang muncul.',
          bgColor: 'bg-yellow-50'
        }
      }
    }
    return {
      status: 'Negatif DBD',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      recommendation: 'Hasil pemeriksaan tidak menunjukkan indikasi DBD. Tetap jaga kesehatan dan kebersihan lingkungan.',
      bgColor: 'bg-green-50'
    }
  }

  const getModelNameDisplay = (modelName: string): string => {
    const modelMap: Record<string, string> = {
      'all_data': 'Model Lengkap (Demam + Lab + Gejala)',
      'fever_general_data': 'Model Demam (Demam + Gejala)',
      'lab_general_data': 'Model Lab (Lab + Gejala)',
      'only_general_data': 'Model Gejala (Hanya Gejala)',
      'decision_tree_v1': 'Model Lama (v1)'
    }
    return modelMap[modelName] || modelName
  }

  if (loading) {
    return (
      <div>
        <Navbar active="history" />
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat detail pemeriksaan...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !record) {
    return (
      <div>
        <Navbar active="history" />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-screen-xl px-4">
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
                  Gagal Memuat Detail
                </p>
                <p className="text-gray-600 text-sm mb-4">{error || 'Data tidak ditemukan'}</p>
                <button
                  onClick={() => router.push('/history')}
                  className="bg-red-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-800"
                >
                  Kembali ke Riwayat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(record.prediction, record.probability || 0)

  return (
    <div>
      <Navbar active="history" />
      
      <div style={{ top: 0, marginTop: 80 }} className="bg-gray-50 min-h-screen py-8">
        <div className="mx-auto max-w-screen-xl px-4">
          {/* Back Button */}
          <button
            onClick={() => router.push('/history')}
            className="flex items-center gap-2 text-gray-600 hover:text-red-700 mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Kembali ke Riwayat</span>
          </button>

          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
                  Detail Pemeriksaan DBD
                </h1>
                <p className="text-gray-600 text-sm">
                  {formatDate(record.created_at)}
                </p>
              </div>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Hapus</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Status Card */}
          <div className={`${statusInfo.bgColor} rounded-lg shadow-lg p-6 mb-6 border-2 ${statusInfo.color.split(' ')[2]}`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${statusInfo.color}`}>
                {statusInfo.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Hasil: {statusInfo.status}
                </h2>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Probabilitas</span>
                    <span className="text-sm font-bold text-gray-900">{Math.round(record.probability || 0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        record.prediction === 1
                          ? record.probability >= 75
                            ? 'bg-red-600'
                            : 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.round(record.probability || 0)}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {statusInfo.recommendation}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Data Demam */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Data Demam
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Mengalami Demam</span>
                  <span className={`font-medium px-3 py-1 rounded-full text-xs ${
                    record.kdema === 'Iya' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {record.kdema}
                  </span>
                </div>
                {record.kdema === 'Iya' && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">Durasi Demam</span>
                      <span className="font-semibold text-gray-900">{record.ddema} hari</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">Suhu Tubuh</span>
                      <span className="font-semibold text-gray-900">{record.suhun}°C</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Data Uji Lab */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Data Uji Laboratorium
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Status Uji Lab</span>
                  <span className={`font-medium px-3 py-1 rounded-full text-xs ${
                    record.ulabo === 'Sudah' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {record.ulabo}
                  </span>
                </div>
                {record.ulabo === 'Sudah' && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">WBC (Leukosit)</span>
                      <span className="font-semibold text-gray-900">{record.jwbcs.toFixed(1)} x10³/μL</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">Hemoglobin</span>
                      <span className="font-semibold text-gray-900">{record.hemog.toFixed(1)} g/dL</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">Hematokrit</span>
                      <span className="font-semibold text-gray-900">{record.hemat}%</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">Trombosit</span>
                      <span className="font-semibold text-gray-900">{record.jplat} x10³/μL</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Gejala Klinis */}
            <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Gejala Klinis yang Dialami
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: 'skpla', label: 'Sakit Kepala Parah', value: record.skpla },
                  { key: 'nymat', label: 'Nyeri Belakang Mata', value: record.nymat },
                  { key: 'nysen', label: 'Nyeri Sendi/Otot', value: record.nysen },
                  { key: 'rsmul', label: 'Rasa Logam di Mulut', value: record.rsmul },
                  { key: 'hinfm', label: 'Hilang Nafsu Makan', value: record.hinfm },
                  { key: 'nyper', label: 'Nyeri Perut', value: record.nyper },
                  { key: 'mumun', label: 'Mual/Muntah', value: record.mumun },
                  { key: 'mdiar', label: 'Diare', value: record.mdiar }
                ].map((symptom) => (
                  <div key={symptom.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 text-sm">{symptom.label}</span>
                    <div className="flex items-center gap-2">
                      {symptom.value === 'Iya' ? (
                        <>
                          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-red-600 font-medium text-sm">Ya</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-400 font-medium text-sm">Tidak</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Information */}
            <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Informasi Model Prediksi
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      {getModelNameDisplay(record.model_used)}
                    </p>
                    <p className="text-xs text-gray-600">
                      Model ini menggunakan algoritma Logistic Regression untuk memprediksi kemungkinan DBD berdasarkan data yang Anda masukkan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                const report = `
╔═══════════════════════════════════════════════════════════════════╗
║              LAPORAN HASIL PEMERIKSAAN DBD                        ║
║                  Dengue Fever Check Report                        ║
╚═══════════════════════════════════════════════════════════════════╝

INFORMASI PEMERIKSAAN
─────────────────────────────────────────────────────────────────────
Tanggal Pemeriksaan : ${formatDate(record.created_at)}
ID Pemeriksaan      : ${record.id}

HASIL PEMERIKSAAN
─────────────────────────────────────────────────────────────────────
Status              : ${statusInfo.status}
Tingkat Kepercayaan : ${Math.round(record.probability || 0)}%
Model Prediksi      : ${record.model_used}

${statusInfo.status === 'Positif DBD' ? '⚠️  PERHATIAN: Hasil menunjukkan indikasi POSITIF DBD\n    Segera konsultasikan ke dokter atau fasilitas kesehatan!' : 
  statusInfo.status === 'Kemungkinan DBD' ? '⚠️  PERINGATAN: Ada kemungkinan DBD\n    Disarankan untuk memeriksakan diri ke dokter.' :
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

Varian Model: ${getModelNameDisplay(record.model_used)}

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

                const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                const fileName = `Laporan-DBD-${formatDate(record.created_at).replace(/\s/g, '-')}.txt`
                link.download = fileName
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
              }}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Unduh Laporan
            </button>
            <button
              onClick={() => router.push('/form')}
              className="flex-1 bg-red-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Pemeriksaan Baru
            </button>
            <button
              onClick={() => router.push('/history')}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lihat Semua Riwayat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
