'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '../components/Navbar'
import Stepper from '../components/Stepper'
import Link from 'next/link'
import { createClient } from '../../utils/supabase/client'
import { User } from '@supabase/supabase-js'

function FormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const step = parseInt(searchParams.get('step') || '0')

  return (
    <div>
      <Navbar active="form" />
      <div style={{ top: 0, marginTop: 80 }}>
        <Stepper active={step} />
      </div>

      {step === 0 && <Step1 />}
      {step === 1 && <Step2 />}
    </div>
  )
}

export default function FormPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FormContent />
    </Suspense>
  )
}

function Step1() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <div className="flex flex-col items-center py-8 gap-y-12">
      <img
        src="/dengue.png"
        alt="Dengue Illustration"
        className="w-48 max-w-[50%]"
      />
      <div className="flex flex-col text-3xl font-extrabold sm:text-5xl gap-x-2">
        <span> Deteksi DBD hanya dengan </span>
        <span className="text-red-700"> beberapa pertanyaan saja! </span>
      </div>
      
      {user ? (
        // Logged in: Show single "Lanjutkan" button
        <div className="flex flex-col gap-4">
          <Link
            href="/form?step=1"
            className="flex gap-x-2 rounded bg-red-700 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-800 focus:outline-none focus:ring active:bg-red-500 sm:w-auto justify-center"
          >
            Lanjutkan
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
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      ) : (
        // Not logged in: Show both buttons
        <div className="flex flex-col gap-4">
          <Link
            href="/form?step=1"
            className="flex gap-x-2 rounded bg-red-700 px-6 py-3 text-sm font-medium text-white shadow hover:bg-red-800 focus:outline-none focus:ring active:bg-red-500 sm:w-auto justify-center"
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
              <path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V7h-5a8 8 0 0 0-5 2 8 8 0 0 0-5-2H2Z" />
              <path d="M6 11c1.5 0 3 .5 3 2-2 0-3 0-3-2Z" />
              <path d="M18 11c-1.5 0-3 .5-3 2 2 0 3 0 3-2Z" />
            </svg>
            Isi sebagai anonim
          </Link>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">atau</p>
            <Link
              href="/login"
              className="flex gap-x-2 rounded bg-white border-2 border-red-700 px-6 py-3 text-sm font-medium text-red-700 shadow hover:bg-red-50 focus:outline-none focus:ring active:bg-red-100 sm:w-auto justify-center"
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
              Masuk dengan akun
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function Step2() {
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    KDEMA: 'Tidak',
    DDEMA: 1,
    SUHUN: 38.2,
    ULABO: 'Belum',
    JWBCS: 6.0,
    HEMOG: 14.0,
    HEMAT: 40,
    JPLAT: 150,
    SKPLA: 'Tidak',
    NYMAT: 'Tidak',
    NYSEN: 'Tidak',
    RSMUL: 'Tidak',
    HINFM: 'Tidak',
    NYPER: 'Tidak',
    MUMUN: 'Tidak',
    MDIAR: 'Tidak',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Store form data in localStorage
    localStorage.setItem('formData', JSON.stringify(formData))

    // Navigate to result
    router.push('/result')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-y-6 px-4 lg:px-16 my-6"
    >
      {/* Form Gejala Utama */}
      <FormGejalaUtama formData={formData} setFormData={setFormData} />

      {/* Form Gejala Tambahan */}
      <FormGejalaTambahan formData={formData} setFormData={setFormData} />

      {/* Form Uji Lab */}
      <FormUjiLab formData={formData} setFormData={setFormData} />

      <button
        type="submit"
        className="flex items-center justify-center gap-x-2 px-4 py-2 text-sm font-medium text-white bg-red-700 border border-transparent rounded-md shadow-sm hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        {/* <img src="/scan-search.svg" alt="Submit Icon" className="w-5 h-5" /> */}
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
          <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
          <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
          <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
          <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
          <circle cx="12" cy="12" r="3"/>
          <path d="m16 16-1.9-1.9"/>
        </svg>
        <span className="text-nowrap">Periksa</span>
      </button>
    </form>
  )
}

interface FormProps {
  formData: any
  setFormData: (data: any) => void
}

function FormGejalaUtama({ formData, setFormData }: FormProps) {
  const isDemamDisabled = formData.KDEMA === 'Tidak'

  useEffect(() => {
    const images = ['ddema-img', 'suhun-img']
    images.forEach((id) => {
      const img = document.querySelector(`img#${id}`) as HTMLImageElement
      if (img) {
        img.style.transition = '0.5s'
        img.style.filter = isDemamDisabled ? 'grayscale(100%)' : 'none'
      }
    })
  }, [isDemamDisabled])

  return (
    <div
      id="form-gejala-utama"
      className="block w-full px-4 md:px-16 py-10 bg-white border border-gray-200 rounded-lg shadow"
    >
      <div className="flex w-full justify-between items-center py-4">
        <h3 className="text-3xl font-bold tracking-tight text-red-700">
          Gejala Utama
        </h3>
        <a
          href="#form-gejala-tambahan"
          className="flex h-fit items-center justify-center gap-x-2 px-4 py-2 text-sm font-medium text-white bg-red-700 border border-transparent rounded-md shadow-sm hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none"
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-5 h-5">
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
          </svg>
          <span className="text-nowrap">Lanjut</span>
        </a>
      </div>

      <div className="flex flex-col gap-y-8">
        <div className="flex flex-col gap-y-4 md:flex-row gap-x-4 justify-between">
          <div className="flex gap-x-8 items-center">
            <img src="/sick.png" alt="Question" className="w-16" />
            <label className="flex flex-col">
              <h5 className="mb-2 text-xl font-medium tracking-tight text-gray-900">
                Apakah anda merasakan demam?
              </h5>
              <p className="font-normal text-gray-700">
                Jika suhu tubuh anda di atas 38°C, maka anda seharusnya
                merasakan demam
              </p>
            </label>
          </div>
            <ul className="w-1/4 items-center text-sm font-medium bg-white rounded-lg sm:flex">
            {['Iya', 'Tidak'].map((choice, index) => {
              const checked = formData.KDEMA === choice
              return (
              <li key={choice} className="w-full rounded-lg border border-gray-200">
                <div
                className={`flex items-center px-8 transition-colors duration-200 rounded-lg ${
                  checked ? 'bg-red-700 text-white' : 'bg-white text-gray-900'
                }`}
                >
                <input
                  id={`kdema-${index}`}
                  type="radio"
                  value={choice}
                  name="KDEMA"
                  checked={checked}
                  onChange={(e) =>
                  setFormData({ ...formData, KDEMA: e.target.value })
                  }
                  className="hidden"
                />
                <label
                  htmlFor={`kdema-${index}`}
                  className="w-full py-3 text-center text-sm font-medium cursor-pointer"
                >
                  {choice}
                </label>
                </div>
              </li>
              )
            })}
            </ul>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Durasi Demam */}
          <div className="flex flex-col gap-y-4">
            <div className="flex gap-x-8 items-center">
              <img
                id="ddema-img"
                src="/schedule.png"
                alt="Question"
                className="w-16"
              />
              <label className="flex flex-col">
                <h5 className="mb-2 text-xl font-medium tracking-tight text-gray-900">
                  Durasi demam (hari)
                </h5>
                <p className="font-normal text-gray-700">
                  Berapa lama Anda merasakan demam?
                </p>
              </label>
            </div>
            <input
              type="number"
              name="DDEMA"
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5"
              min={1}
              step={1}
              value={formData.DDEMA}
              onChange={(e) =>
                setFormData({ ...formData, DDEMA: parseInt(e.target.value) })
              }
              disabled={isDemamDisabled}
            />
          </div>

          {/* Suhu */}
          <div className="flex flex-col gap-y-4">
            <div className="flex gap-x-8 items-center">
              <img
                id="suhun-img"
                src="/thermometer.png"
                alt="Question"
                className="w-16"
              />
              <label className="flex flex-col">
                <h5 className="mb-2 text-xl font-medium tracking-tight text-gray-900">
                  Suhu saat ini (°C)
                </h5>
                <p className="font-normal text-gray-700">
                  Anda dapat mengecek suhu tubuh Anda dengan termometer
                </p>
              </label>
            </div>
            <input
              type="number"
              name="SUHUN"
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5"
              min={35.0}
              max={45.0}
              step={0.1}
              value={formData.SUHUN}
              onChange={(e) =>
                setFormData({ ...formData, SUHUN: parseFloat(e.target.value) })
              }
              disabled={isDemamDisabled}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function FormGejalaTambahan({ formData, setFormData }: FormProps) {
  const symptoms = [
    {
      code: 'SKPLA',
      title: 'Apakah Anda mengalami sakit kepala parah?',
      desc: 'Sakit kepala parah biasanya disertai dengan gejala lain seperti mual dan muntah',
      img: '/fainting.png',
    },
    {
      code: 'NYMAT',
      title: 'Apakah Anda merasakan nyeri di belakang mata?',
      desc: 'Nyeri di belakang mata dapat dirasakan saat bergerak atau menolehkan kepala',
      img: '/eye.png',
    },
    {
      code: 'NYSEN',
      title: 'Apakah Anda merasakan nyeri pada sendi atau otot?',
      desc: 'Nyeri sendi atau otot biasanya dirasakan di beberapa bagian',
      img: '/muscle-pain.png',
    },
    {
      code: 'RSMUL',
      title: 'Apakah Anda merasakan rasa logam di mulut?',
      desc: 'Mulut yang terasa seperti logam disebut dysgeusia, atau penyimpangan sensasi rasa',
      img: '/disease.png',
    },
    {
      code: 'HINFM',
      title: 'Apakah Anda kehilangan nafsu makan?',
      desc: 'Anda sudah tidak selera makan apapun dalam beberapa hari terakhir',
      img: '/loss-of-appetite.png',
    },
    {
      code: 'NYPER',
      title: 'Apakah Anda mengalami nyeri perut?',
      desc: 'Nyeri perut biasanya dirasakan di bagian perut atas atau bawah',
      img: '/abdominal-pain.png',
    },
    {
      code: 'MUMUN',
      title: 'Apakah Anda mengalami mual atau muntah?',
      desc: 'Mual dan muntah biasanya disertai dengan gejala lain seperti sakit kepala',
      img: '/vomit.png',
    },
    {
      code: 'MDIAR',
      title: 'Apakah Anda mengalami diare?',
      desc: 'Frekuensi buang air besar (BAB) meningkat dan feses yang dikeluarkan bertekstur encer atau cair',
      img: '/diarrhea.png',
    },
  ]

  return (
    <div
      id="form-gejala-tambahan"
      className="block w-full px-4 md:px-16 py-10 bg-white border border-gray-200 rounded-lg shadow"
    >
      <div className="flex w-full justify-between items-center py-4">
        <h3 className="text-3xl font-bold tracking-tight text-red-700">
          Gejala Tambahan
        </h3>
        <a
          href="#form-uji-lab"
          className="flex h-fit items-center justify-center gap-x-2 px-4 py-2 text-sm font-medium text-white bg-red-700 border border-transparent rounded-md shadow-sm hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none"
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-5 h-5">
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
          </svg>
          <span className="text-nowrap">Lanjut</span>
        </a>
      </div>

      <div className="flex flex-col gap-y-8">
        {[0, 2, 4, 6].map((startIdx) => (
          <div key={startIdx} className="grid gap-6 md:grid-cols-2">
            {symptoms.slice(startIdx, startIdx + 2).map((symptom) => (
              <div key={symptom.code} className="flex flex-col gap-y-4">
                <div className="flex gap-x-8 items-center">
                  <img src={symptom.img} alt="Question" className="w-16" />
                  <label className="flex flex-col">
                    <h5 className="mb-2 text-xl font-medium tracking-tight text-gray-900">
                      {symptom.title}
                    </h5>
                    <p className="font-normal text-gray-700">{symptom.desc}</p>
                  </label>
                </div>
                <ul className="w-full items-center text-sm font-medium bg-white border border-gray-200 rounded-lg sm:flex">
                  {['Iya', 'Tidak'].map((choice, index) => {
                    const checked = formData[symptom.code] === choice
                    return (
                      <li
                        key={choice}
                        className="w-full rounded-lg"
                      >
                        <div
                          className={`flex items-center px-8 transition-colors duration-200 rounded-lg ${
                            checked ? 'bg-red-700 text-white' : 'bg-white text-gray-900'
                          }`}
                        >
                          <input
                            id={`${symptom.code}-${index}`}
                            type="radio"
                            value={choice}
                            name={symptom.code}
                            checked={checked}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [symptom.code]: e.target.value,
                              })
                            }
                            className="hidden"
                          />
                          <label
                            htmlFor={`${symptom.code}-${index}`}
                            className="w-full py-3 text-center text-sm font-medium cursor-pointer"
                          >
                            {choice}
                          </label>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function FormUjiLab({ formData, setFormData }: FormProps) {
  const isUjiLabDisabled = formData.ULABO === 'Belum'

  useEffect(() => {
    const images = ['jwbcs-img', 'hemog-img', 'hemat-img', 'jplat-img']
    images.forEach((id) => {
      const img = document.querySelector(`img#${id}`) as HTMLImageElement
      if (img) {
        img.style.transition = '0.5s'
        img.style.filter = isUjiLabDisabled ? 'grayscale(100%)' : 'none'
      }
    })
  }, [isUjiLabDisabled])

  return (
    <div
      id="form-uji-lab"
      className="block w-full px-4 md:px-16 py-10 bg-white border border-gray-200 rounded-lg shadow"
    >
      <h3 className="mb-10 text-3xl font-bold tracking-tight text-red-700">
        Uji Laboratorium
      </h3>

      <div className="flex flex-col gap-y-8">
        <div className="flex flex-col gap-y-4 md:flex-row gap-x-4 justify-between">
          <div className="flex gap-x-8 items-center">
            <img src="/blood-analysis.png" alt="Question" className="w-16" />
            <label className="flex flex-col">
              <h5 className="mb-2 text-xl font-medium tracking-tight text-gray-900">
                Apakah anda sudah melakukan uji darah di Laboratorium?
              </h5>
              <p className="font-normal text-gray-700">
                Uji darah dapat dilakukan untuk mengetahui kondisi tubuh Anda
              </p>
            </label>
          </div>
            <ul className="w-1/4 items-center text-sm font-medium bg-white rounded-lg sm:flex">
            {['Sudah', 'Belum'].map((choice, index) => {
              const checked = formData.ULABO === choice
              return (
              <li key={choice} className="w-full rounded-lg border border-gray-200">
                <div
                className={`flex items-center px-8 transition-colors duration-200 rounded-lg ${
                  checked ? 'bg-red-700 text-white' : 'bg-white text-gray-900'
                }`}
                >
                <input
                  id={`ulabo-${index}`}
                  type="radio"
                  value={choice}
                  name="ULABO"
                  checked={checked}
                  onChange={(e) =>
                  setFormData({ ...formData, ULABO: e.target.value })
                  }
                  className="hidden"
                />
                <label
                  htmlFor={`ulabo-${index}`}
                  className="w-full py-3 text-center text-sm font-medium cursor-pointer"
                >
                  {choice}
                </label>
                </div>
              </li>
              )
            })}
            </ul>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* WBC */}
          <div className="flex flex-col gap-y-4">
            <div className="flex gap-x-8 items-center">
              <img
                id="jwbcs-img"
                src="/white-blood-cell.png"
                alt="Question"
                className="w-16"
              />
              <label className="flex flex-col">
                <h5 className="mb-2 text-xl font-medium tracking-tight text-gray-900">
                  Jumlah WBC (sel darah putih) [×10^3/uL]
                </h5>
                <p className="font-normal text-gray-700">
                  Jumlah sel darah putih yang normal berkisar antara 4.5-11.0
                  ×10^3/uL
                </p>
              </label>
            </div>
            <input
              type="number"
              name="JWBCS"
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5"
              min={1.0}
              max={15.0}
              step={0.1}
              value={formData.JWBCS}
              onChange={(e) =>
                setFormData({ ...formData, JWBCS: parseFloat(e.target.value) })
              }
              disabled={isUjiLabDisabled}
            />
          </div>

          {/* Hemoglobin */}
          <div className="flex flex-col gap-y-4">
            <div className="flex gap-x-8 items-center">
              <img
                id="hemog-img"
                src="/red-blood-cells.png"
                alt="Question"
                className="w-16"
              />
              <label className="flex flex-col">
                <h5 className="mb-2 text-xl font-medium tracking-tight text-gray-900">
                  Hemoglobin [g/dL]
                </h5>
                <p className="font-normal text-gray-700">
                  Hemoglobin adalah protein yang membawa oksigen dalam sel darah
                  merah
                </p>
              </label>
            </div>
            <input
              type="number"
              name="HEMOG"
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5"
              min={10.0}
              max={20.0}
              step={0.1}
              value={formData.HEMOG}
              onChange={(e) =>
                setFormData({ ...formData, HEMOG: parseFloat(e.target.value) })
              }
              disabled={isUjiLabDisabled}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Hematocrit */}
          <div className="flex flex-col gap-y-4">
            <div className="flex gap-x-8 items-center">
              <img
                id="hemat-img"
                src="/blood-test.png"
                alt="Question"
                className="w-16"
              />
              <label className="flex flex-col">
                <h5 className="mb-2 text-xl font-medium tracking-tight text-gray-900">
                  Hematokrit [%]
                </h5>
                <p className="font-normal text-gray-700">
                  Hematokrit adalah persentase volume sel darah merah dalam
                  darah
                </p>
              </label>
            </div>
            <input
              type="number"
              name="HEMAT"
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5"
              min={1}
              max={70}
              step={1}
              value={formData.HEMAT}
              onChange={(e) =>
                setFormData({ ...formData, HEMAT: parseInt(e.target.value) })
              }
              disabled={isUjiLabDisabled}
            />
          </div>

          {/* Platelet */}
          <div className="flex flex-col gap-y-4">
            <div className="flex gap-x-8 items-center">
              <img
                id="jplat-img"
                src="/thermometer.png"
                alt="Question"
                className="w-16"
              />
              <label className="flex flex-col">
                <h5 className="mb-2 text-xl font-medium tracking-tight text-gray-900">
                  Jumlah Platelet [×10^3/uL]
                </h5>
                <p className="font-normal text-gray-700">
                  Jumlah platelet yang normal berkisar antara 150-450 ×10^3/uL
                </p>
              </label>
            </div>
            <input
              type="number"
              name="JPLAT"
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5"
              min={1}
              max={700}
              step={1}
              value={formData.JPLAT}
              onChange={(e) =>
                setFormData({ ...formData, JPLAT: parseInt(e.target.value) })
              }
              disabled={isUjiLabDisabled}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
