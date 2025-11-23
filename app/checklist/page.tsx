'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../utils/supabase/client'
import { User } from '@supabase/supabase-js'
import Navbar from '../components/Navbar'
import Link from 'next/link'

// Interface untuk checklist item
interface ChecklistItem {
  id: string
  title: string
  description: string
  category: 'lingkungan' | 'personal' | 'rumah'
  isCompleted: boolean
}

// Interface untuk progress mingguan
interface WeeklyProgress {
  id?: string
  user_id: string
  week_start: string
  completed_items: string[]
  total_items: number
  completion_percentage: number
  created_at?: string
}

export default function PreventionChecklistPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const supabase = createClient()

  // Data checklist pencegahan DBD
  const defaultChecklist: ChecklistItem[] = [
    {
      id: 'drain_water_tank',
      title: 'Menguras dan menyikat bak mandi/WC',
      description: 'Lakukan minimal 1x seminggu, bersihkan dinding bak dari telur nyamuk',
      category: 'rumah',
      isCompleted: false
    },
    {
      id: 'close_water_containers',
      title: 'Menutup rapat tempat penampungan air',
      description: 'Tutup drum, kendi, tong air, dan tempat penampungan air lainnya',
      category: 'rumah',
      isCompleted: false
    },
    {
      id: 'recycle_containers',
      title: 'Mendaur ulang barang bekas yang dapat menampung air',
      description: 'Singkirkan kaleng, botol bekas, ban bekas yang bisa jadi tempat genangan',
      category: 'lingkungan',
      isCompleted: false
    },
    {
      id: 'use_repellent',
      title: 'Menggunakan lotion/spray anti nyamuk',
      description: 'Pakai repellent terutama saat pagi dan sore hari',
      category: 'personal',
      isCompleted: false
    },
    {
      id: 'clean_plant_pots',
      title: 'Membersihkan pot tanaman dari genangan air',
      description: 'Periksa dan bersihkan tatakan pot, ganti air vas bunga secara rutin',
      category: 'lingkungan',
      isCompleted: false
    },
    {
      id: 'check_gutters',
      title: 'Membersihkan saluran air/got rumah',
      description: 'Pastikan air mengalir lancar, tidak ada genangan di sekitar rumah',
      category: 'lingkungan',
      isCompleted: false
    },
    {
      id: 'use_mosquito_net',
      title: 'Menggunakan kelambu saat tidur',
      description: 'Terutama untuk anak-anak dan area yang banyak nyamuk',
      category: 'personal',
      isCompleted: false
    },
    {
      id: 'plant_repellent_plants',
      title: 'Menanam tanaman pengusir nyamuk',
      description: 'Serai, lavender, mint, atau tanaman pengusir nyamuk lainnya',
      category: 'lingkungan',
      isCompleted: false
    }
  ]

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        await loadWeeklyProgress(user.id)
      }
      setLoading(false)
    }
    getUser()
  }, [])

  const loadWeeklyProgress = async (userId: string) => {
    const weekStart = getWeekStart()
    
    // Coba ambil progress minggu ini
    const { data: existingProgress } = await supabase
      .from('weekly_prevention_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .single()

    if (existingProgress) {
      setWeeklyProgress(existingProgress)
      // Load checklist dengan status yang tersimpan
      const updatedChecklist = defaultChecklist.map(item => ({
        ...item,
        isCompleted: existingProgress.completed_items.includes(item.id)
      }))
      setChecklist(updatedChecklist)
    } else {
      setChecklist(defaultChecklist)
    }
  }

  const getWeekStart = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1))
    return monday.toISOString().split('T')[0]
  }

  const handleChecklistChange = (itemId: string) => {
    const updatedChecklist = checklist.map(item => 
      item.id === itemId 
        ? { ...item, isCompleted: !item.isCompleted }
        : item
    )
    setChecklist(updatedChecklist)
  }

  const calculateProgress = () => {
    const completed = checklist.filter(item => item.isCompleted).length
    const total = checklist.length
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100)
    }
  }

  const saveWeeklyProgress = async () => {
    if (!user) return

    setSaving(true)
    const progress = calculateProgress()
    const weekStart = getWeekStart()
    const completedItems = checklist.filter(item => item.isCompleted).map(item => item.id)

    const progressData: WeeklyProgress = {
      user_id: user.id,
      week_start: weekStart,
      completed_items: completedItems,
      total_items: progress.total,
      completion_percentage: progress.percentage
    }

    const { error } = await supabase
      .from('weekly_prevention_progress')
      .upsert(progressData, {
        onConflict: 'user_id,week_start'
      })

    if (error) {
      setSaveMessage('Gagal menyimpan progress. Silakan coba lagi.')
    } else {
      setSaveMessage('Progress berhasil disimpan! 🎉')
      await loadWeeklyProgress(user.id)
    }

    setSaving(false)
    setTimeout(() => setSaveMessage(''), 3000)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'rumah': return '🏠'
      case 'lingkungan': return '🌿'
      case 'personal': return '👤'
      default: return '✅'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'rumah': return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'lingkungan': return 'bg-green-50 border-green-200 text-green-800'
      case 'personal': return 'bg-purple-50 border-purple-200 text-purple-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar active="checklist" />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar active="checklist" />
        <div className="pt-20">
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-6xl mb-6">🔒</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Login Diperlukan
              </h1>
              <p className="text-gray-600 mb-8">
                Fitur Checklist Pencegahan Interaktif hanya tersedia untuk pengguna yang sudah login. 
                Masuk untuk melacak progress pencegahan DBD mingguan Anda.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="bg-red-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-800 transition-colors"
                >
                  Masuk Sekarang
                </Link>
                <Link
                  href="/register"
                  className="bg-white border border-red-700 text-red-700 px-6 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors"
                >
                  Daftar Akun Baru
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const progress = calculateProgress()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="checklist" />
      
      <div className="pt-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">
                Checklist Pencegahan Interaktif
              </h1>
              <p className="text-xl text-red-100">
                Lakukan langkah pencegahan DBD secara rutin dan pantau progress mingguan Anda
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Progress Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Progress Pencegahan Minggu Ini
              </h2>
              <div className="text-4xl font-bold text-red-700 mb-4">
                {progress.percentage}%
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div 
                  className="bg-gradient-to-r from-red-500 to-red-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              
              <p className="text-gray-600">
                {progress.completed} dari {progress.total} langkah pencegahan telah diselesaikan
              </p>
            </div>

            {/* Achievement Badges */}
            <div className="flex justify-center gap-4 mb-4">
              {progress.percentage >= 25 && (
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  🌟 Pemula
                </div>
              )}
              {progress.percentage >= 50 && (
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  🔥 Semangat
                </div>
              )}
              {progress.percentage >= 75 && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  ⭐ Hebat
                </div>
              )}
              {progress.percentage === 100 && (
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  🏆 Sempurna
                </div>
              )}
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Langkah-Langkah Pencegahan DBD
            </h3>
            
            {checklist.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleChecklistChange(item.id)}
                className={`w-full bg-white rounded-lg border-2 p-4 transition-all duration-300 text-left hover:scale-[1.02] ${
                  item.isCompleted 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 hover:border-red-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      item.isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-red-500'
                    }`}
                  >
                    {item.isCompleted && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{getCategoryIcon(item.category)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(item.category)}`}>
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </span>
                    </div>
                    
                    <h4 className={`font-semibold mb-1 ${item.isCompleted ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                      {item.title}
                    </h4>
                    <p className={`text-sm ${item.isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                      {item.description}
                    </p>
                  </div>

                  <div className="text-2xl">
                    {item.isCompleted ? '✅' : '⏳'}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Save Progress Button */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Simpan Progress Mingguan
            </h3>
            <p className="text-gray-600 mb-6">
              Simpan progress Anda untuk melacak perkembangan pencegahan DBD dari minggu ke minggu
            </p>
            
            <button
              onClick={saveWeeklyProgress}
              disabled={saving}
              className="bg-red-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Simpan Progress
                </>
              )}
            </button>

            {saveMessage && (
              <div className={`mt-4 p-3 rounded-lg ${
                saveMessage.includes('Gagal') 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {saveMessage}
              </div>
            )}
          </div>

          {/* Tips Section */}
          <div className="mt-8 bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
            <h3 className="text-xl font-semibold text-red-900 mb-4">
              💡 Tips Pencegahan Efektif
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-red-800">
              <div>
                <h4 className="font-medium mb-2">🕐 Waktu Terbaik</h4>
                <p className="text-sm">Lakukan pencegahan setiap hari Minggu untuk hasil maksimal</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">👨‍👩‍👧‍👦 Libatkan Keluarga</h4>
                <p className="text-sm">Ajak anggota keluarga untuk melakukan pencegahan bersama</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">📱 Pengingat</h4>
                <p className="text-sm">Set alarm atau reminder untuk checklist mingguan</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">🎯 Konsistensi</h4>
                <p className="text-sm">Lakukan secara rutin untuk pencegahan yang efektif</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}