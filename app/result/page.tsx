'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import Stepper from '../components/Stepper'
import { predictDengue, FormData, getModelName } from '@/lib/model'
import { saveDengueCheck } from '@/lib/dengue-service'

export default function ResultPage() {
  const router = useRouter()
  const [prediction, setPrediction] = useState<number | null>(null)
  const [probability, setProbability] = useState<number>(0)
  const [saving, setSaving] = useState<boolean>(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const hasRun = useRef(false) // Track if save has already run

  useEffect(() => {
    // Prevent double execution in StrictMode
    if (hasRun.current) return
    hasRun.current = true

    const saveResult = async () => {
      // Get form data from localStorage
      const storedData = localStorage.getItem('formData')
      if (!storedData) {
        router.push('/form')
        return
      }

      const formData: FormData = JSON.parse(storedData)
      const result = await predictDengue(formData)
      setPrediction(result)
      setProbability(Math.round(result * 100))

      // Get the model name based on the data combination
      const modelName = getModelName(formData)

      // Save to database
      setSaving(true)
      const dataToSave = {
        kdema: formData.KDEMA as 'Iya' | 'Tidak',
        ddema: formData.DDEMA,
        suhun: formData.SUHUN,
        ulabo: formData.ULABO as 'Sudah' | 'Belum',
        jwbcs: formData.JWBCS,
        hemog: formData.HEMOG,
        hemat: formData.HEMAT,
        jplat: formData.JPLAT,
        skpla: formData.SKPLA as 'Iya' | 'Tidak',
        nymat: formData.NYMAT as 'Iya' | 'Tidak',
        nysen: formData.NYSEN as 'Iya' | 'Tidak',
        rsmul: formData.RSMUL as 'Iya' | 'Tidak',
        hinfm: formData.HINFM as 'Iya' | 'Tidak',
        nyper: formData.NYPER as 'Iya' | 'Tidak',
        mumun: formData.MUMUN as 'Iya' | 'Tidak',
        mdiar: formData.MDIAR as 'Iya' | 'Tidak',
        prediction: result as 0 | 1,
        probability: result * 100,
        model_used: modelName
      }

      const saveResult = await saveDengueCheck(dataToSave)

      setSaving(false)

      if (!saveResult.success) {
        setSaveError(saveResult.error || 'Gagal menyimpan hasil')
      } else {
        // Store the check ID for future reference
        localStorage.setItem('lastCheckId', saveResult.id || '')
      }
    }

    saveResult()
  }, [router])

  if (prediction === null) {
    return (
      <div>
        <Navbar active="form" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Memproses hasil pemeriksaan...</p>
            {saving && <p className="text-sm text-gray-500 mt-2">Menyimpan ke database...</p>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar active="form" />
      <div style={{ top: 0, marginTop: 80 }}>
        <Stepper active={2} />
      </div>

      <div className="flex flex-col items-center px-4 md:px-16">
        {/* Save Status Notification */}
        {saveError && (
          <div className="w-full max-w-4xl mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  Hasil tidak tersimpan ke riwayat
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  {saveError}. Hasil tetap dapat dilihat di halaman ini.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Alert Rating */}
        <div
          id="marketing-banner"
          tabIndex={-1}
          className="fixed z-50 flex flex-col-reverse gap-y-4 items-center md:flex-row justify-between w-[calc(100%-2rem)] p-4 -translate-x-1/2 bg-white border border-gray-100 rounded-lg shadow-sm lg:max-w-7xl left-1/2 bottom-10"
        >
          <div className="flex flex-col-reverse md:gap-x-4 mb-3 me-4 items-center md:flex-row md:mb-0">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <a
                href="https://uty.ac.id/"
                className="flex items-center space-x-3 rtl:space-x-reverse"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/uty_logo.png" className="h-10" alt="UTY Logo" />
              </a>
            </div>
            <p className="flex items-center text-md font-normal text-center text-gray-800">
              Kami butuh penilaian Anda untuk meningkatkan layanan dan akurasi
            </p>
          </div>
          <div className="w-full md:w-fit flex justify-center items-center md:gap-x-4">
            <div className="flex items-center mr-0 ml-auto">
              {[...Array(4)].map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4 text-yellow-300 ms-1"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 22 20"
                >
                  <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                </svg>
              ))}
              <svg
                className="w-4 h-4 ms-1 text-gray-300"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 22 20"
              >
                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
              </svg>
            </div>
            <button
              onClick={() => {
                const banner = document.getElementById('marketing-banner')
                if (banner) banner.style.display = 'none'
              }}
              type="button"
              className="flex-shrink-0 inline-flex justify-center w-7 h-7 items-center text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto"
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close banner</span>
            </button>
          </div>
        </div>

        {/* Card Result */}
        <div className="mt-0 md:mt-8 flex flex-col md:flex-row gap-4 w-full lg:w-1/2 bg-white border border-gray-200 rounded-lg shadow-lg px-4">
          <div className="flex justify-center items-center aspect-square p-12">
            <img
              className="w-40 rounded-t-lg"
              src={prediction === 0 ? '/protected.png' : '/mosquito.png'}
              alt="Classification Result"
            />
          </div>
          <div className="flex flex-col p-5 gap-y-2">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
              {prediction === 0
                ? 'Anda tidak terkena penyakit demam berdarah'
                : 'Anda kemungkinan terkena penyakit demam berdarah'}
            </h5>
            <p className="mb-3 font-normal text-gray-700">
              {prediction === 0
                ? 'Tetap jaga kesehatan dan kebersihan diri serta lingkungan sekitar agar terhindar dari penyakit dengue'
                : 'Segera periksakan diri ke dokter atau rumah sakit untuk mendapatkan penanganan lebih lanjut'}
            </p>
            <div className="flex flex-col gap-4 md:flex-row">
              <a
                href="/"
                className="flex justify-center md:justify-normal gap-x-2 rounded px-4 py-2 text-sm font-medium text-red-700 shadow hover:text-red-700 focus:outline-none focus:ring active:text-red-500 sm:w-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-red-700"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                  <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                Kembali ke beranda
              </a>
              <a
                href="/form"
                className="flex justify-center md:justify-normal gap-x-2 rounded bg-red-700 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-800 focus:outline-none focus:ring active:bg-red-500 sm:w-auto"
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
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                Coba Lagi
              </a>
            </div>
          </div>
        </div>

        {/* Rekomendasi */}
        {prediction === 1 && (
          <section className="bg-white">
            <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
              <h2 className="text-center text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Kami merekomendasikan untuk
              </h2>

              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
                <blockquote className="flex flex-col gap-y-4 rounded-lg bg-gray-50 p-6 shadow-sm sm:p-8">
                  <div className="flex items-center gap-4">
                    <img alt="Icon" src="/doctor.png" className="w-16" />
                    <p className="mt-0.5 text-lg font-medium text-gray-900">
                      Konsultasi ke dokter
                    </p>
                  </div>
                  <p className="mt-4 text-gray-700">
                    Segera periksakan diri ke dokter atau rumah sakit untuk
                    mendapatkan penanganan lebih lanjut
                  </p>
                  <a
                    href="https://www.google.com/maps/search/rumah+sakit+terdekat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-row-reverse justify-center gap-x-2 rounded bg-red-700 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-800 focus:outline-none focus:ring active:bg-red-500 sm:w-auto"
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
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                    Cari Dokter
                  </a>
                </blockquote>

                <blockquote className="flex flex-col gap-y-4 rounded-lg bg-gray-50 p-6 shadow-sm sm:p-8">
                  <div className="flex items-center gap-4">
                    <img alt="Icon" src="/fogging.png" className="w-16" />
                    <p className="mt-0.5 text-lg font-medium text-gray-900">
                      Melakukan penyemprotan
                    </p>
                  </div>
                  <p className="mt-4 text-gray-700">
                    Hubungi petugas kesehatan untuk melakukan penyemprotan di
                    sekitar rumah Anda
                  </p>
                  <a
                    href="https://www.google.com/maps/search/puskesmas+terdekat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-row-reverse justify-center gap-x-2 rounded bg-red-700 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-800 focus:outline-none focus:ring active:bg-red-500 sm:w-auto"
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
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                    Cari petugas kesehatan
                  </a>
                </blockquote>

                <blockquote className="flex flex-col gap-y-4 rounded-lg bg-gray-50 p-6 shadow-sm sm:p-8">
                  <div className="flex items-center gap-4">
                    <img alt="Icon" src="/mosquito (1).png" className="w-16" />
                    <p className="mt-0.5 text-lg font-medium text-gray-900">
                      Memberi bubuk abate
                    </p>
                  </div>
                  <p className="mt-4 text-gray-700">
                    Larutkan bubuk abate di tempat-tempat yang berpotensi
                    menjadi tempat berkembang biak nyamuk
                  </p>
                  <a
                    href="https://www.google.com/search?q=bubuk+abate+terdekat&tbm=shop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-row-reverse justify-center gap-x-2 rounded bg-red-700 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-800 focus:outline-none focus:ring active:bg-red-500 sm:w-auto"
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
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                    Cari bubuk abate
                  </a>
                </blockquote>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
