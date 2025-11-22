'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../utils/supabase/client'
import { User } from '@supabase/supabase-js'
import Navbar from '../components/Navbar'
import Link from 'next/link'

// Interface untuk badge/achievement
interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  category: 'consistency' | 'completion' | 'streak' | 'milestone'
  requirement: string
  isEarned: boolean
  earnedAt?: string
  progress?: {
    current: number
    target: number
  }
}

// Interface untuk user profile data
interface UserProfile {
  totalWeeks: number
  perfectWeeks: number
  currentStreak: number
  longestStreak: number
  averageCompletion: number
  totalBadges: number
  lastActivity: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [badges, setBadges] = useState<Badge[]>([])
  const [stats, setStats] = useState<UserProfile | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const supabase = createClient()

  // Definisi semua badges yang tersedia
  const allBadges: Badge[] = [
    // Consistency Badges
    {
      id: 'first_week',
      name: 'Langkah Pertama',
      description: 'Menyelesaikan checklist pencegahan untuk pertama kali',
      icon: '🌱',
      color: 'from-green-400 to-green-600',
      category: 'milestone',
      requirement: '1 minggu aktivitas',
      isEarned: false
    },
    {
      id: 'consistent_3_weeks',
      name: 'Konsisten',
      description: 'Menyelesaikan checklist 3 minggu berturut-turut (minimal 50%)',
      icon: '🔥',
      color: 'from-orange-400 to-orange-600',
      category: 'consistency',
      requirement: '3 minggu berturut-turut ≥50%',
      isEarned: false
    },
    {
      id: 'consistent_5_weeks',
      name: 'Tekun',
      description: 'Menyelesaikan checklist 5 minggu berturut-turut (minimal 50%)',
      icon: '⚡',
      color: 'from-yellow-400 to-yellow-600',
      category: 'consistency',
      requirement: '5 minggu berturut-turut ≥50%',
      isEarned: false
    },
    {
      id: 'consistent_10_weeks',
      name: 'Dedikasi Tinggi',
      description: 'Menyelesaikan checklist 10 minggu berturut-turut (minimal 50%)',
      icon: '💎',
      color: 'from-blue-400 to-blue-600',
      category: 'consistency',
      requirement: '10 minggu berturut-turut ≥50%',
      isEarned: false
    },
    
    // Perfect Completion Streaks
    {
      id: 'perfect_3_weeks',
      name: 'Perfeksionis',
      description: '3 minggu berturut-turut dengan completion 100%',
      icon: '✨',
      color: 'from-purple-400 to-purple-600',
      category: 'streak',
      requirement: '3 minggu 100% berturut-turut',
      isEarned: false
    },
    {
      id: 'perfect_5_weeks',
      name: 'Master Pencegahan',
      description: '5 minggu berturut-turut dengan completion 100%',
      icon: '👑',
      color: 'from-yellow-400 to-yellow-600',
      category: 'streak',
      requirement: '5 minggu 100% berturut-turut',
      isEarned: false
    },
    {
      id: 'perfect_10_weeks',
      name: 'Legend',
      description: '10 minggu berturut-turut dengan completion 100%',
      icon: '🏆',
      color: 'from-gradient-to-r from-yellow-400 via-red-500 to-pink-500',
      category: 'streak',
      requirement: '10 minggu 100% berturut-turut',
      isEarned: false
    },
    
    // Completion Milestones
    {
      id: 'total_10_weeks',
      name: 'Veteran',
      description: 'Total 10 minggu melakukan checklist pencegahan',
      icon: '🎖️',
      color: 'from-indigo-400 to-indigo-600',
      category: 'milestone',
      requirement: '10 minggu total aktivitas',
      isEarned: false
    },
    {
      id: 'total_25_weeks',
      name: 'Pahlawan Kesehatan',
      description: 'Total 25 minggu melakukan checklist pencegahan',
      icon: '🦸‍♂️',
      color: 'from-red-400 to-red-600',
      category: 'milestone',
      requirement: '25 minggu total aktivitas',
      isEarned: false
    },
    {
      id: 'average_80_percent',
      name: 'High Achiever',
      description: 'Rata-rata completion ≥80% selama minimal 5 minggu',
      icon: '📈',
      color: 'from-teal-400 to-teal-600',
      category: 'completion',
      requirement: 'Rata-rata ≥80% (min 5 minggu)',
      isEarned: false
    },
    {
      id: 'monthly_champion',
      name: 'Juara Bulanan',
      description: 'Completion rate 100% selama 1 bulan penuh',
      icon: '🌟',
      color: 'from-pink-400 to-pink-600',
      category: 'completion',
      requirement: '4 minggu 100% dalam 1 bulan',
      isEarned: false
    }
  ]

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        await Promise.all([
          loadUserProfile(user.id),
          calculateUserStats(user.id),
          checkEarnedBadges(user.id)
        ])
      }
      setLoading(false)
    }
    getUser()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading profile for user:', userId)
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('Profile query error:', error)
        
        // If profile doesn't exist, try to create one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...')
          await createUserProfile(userId)
          return
        }
      }
      
      console.log('Profile loaded:', profile)
      setUserProfile(profile)
      
    } catch (error) {
      console.error('Error loading user profile:', error)
      // Try to create profile if it doesn't exist
      await createUserProfile(userId)
    }
  }

  const createUserProfile = async (userId: string) => {
    try {
      console.log('Creating profile for user:', userId)
      
      // Get user metadata from auth
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      const profileData = {
        id: userId,
        full_name: authUser?.user_metadata?.full_name || 
                   authUser?.user_metadata?.name || 
                   authUser?.email?.split('@')[0] || 
                   'User',
        avatar_url: authUser?.user_metadata?.avatar_url || null
      }
      
      const { data: newProfile, error } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single()
      
      if (error) {
        console.error('Error creating profile:', error)
      } else {
        console.log('Profile created successfully:', newProfile)
        setUserProfile(newProfile)
      }
      
    } catch (error) {
      console.error('Error in createUserProfile:', error)
    }
  }

  const calculateUserStats = async (userId: string) => {
    try {
      // Get all weekly progress records
      const { data: weeklyRecords } = await supabase
        .from('weekly_prevention_progress')
        .select('*')
        .eq('user_id', userId)
        .order('week_start', { ascending: true })

      if (!weeklyRecords || weeklyRecords.length === 0) {
        setStats({
          totalWeeks: 0,
          perfectWeeks: 0,
          currentStreak: 0,
          longestStreak: 0,
          averageCompletion: 0,
          totalBadges: 0,
          lastActivity: 'Belum ada aktivitas'
        })
        return
      }

      // Calculate statistics
      const totalWeeks = weeklyRecords.length
      const perfectWeeks = weeklyRecords.filter(record => record.completion_percentage === 100).length
      const averageCompletion = Math.round(
        weeklyRecords.reduce((sum, record) => sum + record.completion_percentage, 0) / totalWeeks
      )
      
      // Calculate current and longest streak
      const { currentStreak, longestStreak } = calculateStreaks(weeklyRecords)
      
      // Get earned badges count
      const { count: badgeCount } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)

      setStats({
        totalWeeks,
        perfectWeeks,
        currentStreak,
        longestStreak,
        averageCompletion,
        totalBadges: badgeCount || 0,
        lastActivity: weeklyRecords[weeklyRecords.length - 1]?.week_start || 'Tidak diketahui'
      })

    } catch (error) {
      console.error('Error calculating stats:', error)
    }
  }

  const calculateStreaks = (records: any[]) => {
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    // Sort by week_start descending to calculate current streak
    const sortedRecords = [...records].sort((a, b) => 
      new Date(b.week_start).getTime() - new Date(a.week_start).getTime()
    )

    // Calculate current streak (from most recent)
    for (const record of sortedRecords) {
      if (record.completion_percentage >= 50) {
        currentStreak++
      } else {
        break
      }
    }

    // Calculate longest streak
    const sortedForLongest = [...records].sort((a, b) => 
      new Date(a.week_start).getTime() - new Date(b.week_start).getTime()
    )

    for (const record of sortedForLongest) {
      if (record.completion_percentage >= 50) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }

    return { currentStreak, longestStreak }
  }

  const checkEarnedBadges = async (userId: string) => {
    try {
      const { data: weeklyRecords } = await supabase
        .from('weekly_prevention_progress')
        .select('*')
        .eq('user_id', userId)
        .order('week_start', { ascending: true })

      const updatedBadges = allBadges.map(badge => {
        const earnedBadge = { ...badge }
        
        if (!weeklyRecords || weeklyRecords.length === 0) {
          return earnedBadge
        }

        switch (badge.id) {
          case 'first_week':
            earnedBadge.isEarned = weeklyRecords.length >= 1
            if (earnedBadge.isEarned) {
              earnedBadge.earnedAt = weeklyRecords[0].week_start
            }
            break
            
          case 'consistent_3_weeks':
          case 'consistent_5_weeks':
          case 'consistent_10_weeks':
            const targetWeeks = parseInt(badge.id.split('_')[1])
            const { longestStreak } = calculateStreaks(weeklyRecords)
            earnedBadge.isEarned = longestStreak >= targetWeeks
            earnedBadge.progress = {
              current: Math.min(longestStreak, targetWeeks),
              target: targetWeeks
            }
            break
            
          case 'perfect_3_weeks':
          case 'perfect_5_weeks':
          case 'perfect_10_weeks':
            const perfectTarget = parseInt(badge.id.split('_')[1])
            const perfectStreak = calculatePerfectStreak(weeklyRecords)
            earnedBadge.isEarned = perfectStreak >= perfectTarget
            earnedBadge.progress = {
              current: Math.min(perfectStreak, perfectTarget),
              target: perfectTarget
            }
            break
            
          case 'total_10_weeks':
          case 'total_25_weeks':
            const totalTarget = parseInt(badge.id.split('_')[1])
            earnedBadge.isEarned = weeklyRecords.length >= totalTarget
            earnedBadge.progress = {
              current: Math.min(weeklyRecords.length, totalTarget),
              target: totalTarget
            }
            break
            
          case 'average_80_percent':
            if (weeklyRecords.length >= 5) {
              const average = weeklyRecords.reduce((sum, record) => sum + record.completion_percentage, 0) / weeklyRecords.length
              earnedBadge.isEarned = average >= 80
              earnedBadge.progress = {
                current: Math.min(Math.round(average), 80),
                target: 80
              }
            }
            break
            
          case 'monthly_champion':
            earnedBadge.isEarned = checkMonthlyChampion(weeklyRecords)
            break
        }
        
        return earnedBadge
      })

      setBadges(updatedBadges)
    } catch (error) {
      console.error('Error checking badges:', error)
    }
  }

  const calculatePerfectStreak = (records: any[]) => {
    let longestPerfectStreak = 0
    let tempStreak = 0

    const sortedRecords = [...records].sort((a, b) => 
      new Date(a.week_start).getTime() - new Date(b.week_start).getTime()
    )

    for (const record of sortedRecords) {
      if (record.completion_percentage === 100) {
        tempStreak++
        longestPerfectStreak = Math.max(longestPerfectStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }

    return longestPerfectStreak
  }

  const checkMonthlyChampion = (records: any[]) => {
    // Group records by month and check if any month has 4 consecutive weeks with 100%
    const monthGroups: { [key: string]: any[] } = {}
    
    records.forEach(record => {
      const monthKey = record.week_start.substring(0, 7) // YYYY-MM
      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = []
      }
      monthGroups[monthKey].push(record)
    })

    for (const month in monthGroups) {
      const monthRecords = monthGroups[month]
      if (monthRecords.length >= 4) {
        const perfectWeeks = monthRecords.filter(record => record.completion_percentage === 100)
        if (perfectWeeks.length >= 4) {
          return true
        }
      }
    }
    
    return false
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'consistency': return 'text-orange-600 bg-orange-100'
      case 'completion': return 'text-green-600 bg-green-100'
      case 'streak': return 'text-purple-600 bg-purple-100'
      case 'milestone': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const filteredBadges = selectedCategory === 'all' 
    ? badges 
    : badges.filter(badge => badge.category === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar active="profile" />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar active="profile" />
        <div className="pt-20">
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-6xl mb-6">🔒</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Login Diperlukan
              </h1>
              <p className="text-gray-600 mb-8">
                Halaman profile dan badges hanya tersedia untuk pengguna yang sudah login.
              </p>
              <Link
                href="/login"
                className="bg-red-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-800 transition-colors"
              >
                Masuk Sekarang
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="profile" />
      
      <div className="pt-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                {userProfile?.full_name?.[0]?.toUpperCase() || 
                 user?.user_metadata?.full_name?.[0]?.toUpperCase() || 
                 user?.user_metadata?.name?.[0]?.toUpperCase() || 
                 user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {userProfile?.full_name || 
                   user?.user_metadata?.full_name || 
                   user?.user_metadata?.name || 
                   user.email?.split('@')[0] || 
                   'User'}
                </h1>
                <p className="text-red-100">
                  {user.email}
                </p>
                <p className="text-red-100 text-sm">
                  Bergabung sejak: {new Date(user.created_at || '').toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-2xl font-bold text-red-700">{stats?.totalWeeks || 0}</div>
              <div className="text-sm text-gray-600">Total Minggu</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-2xl font-bold text-green-600">{stats?.perfectWeeks || 0}</div>
              <div className="text-sm text-gray-600">Minggu Sempurna</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats?.currentStreak || 0}</div>
              <div className="text-sm text-gray-600">Streak Saat Ini</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats?.totalBadges || 0}</div>
              <div className="text-sm text-gray-600">Total Badges</div>
            </div>
          </div>

          {/* Overall Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistik Pencegahan</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Rata-rata Completion</h3>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full"
                    style={{ width: `${stats?.averageCompletion || 0}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{stats?.averageCompletion || 0}%</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Streak Terpanjang</h3>
                <p className="text-3xl font-bold text-orange-600">{stats?.longestStreak || 0}</p>
                <p className="text-sm text-gray-600">minggu berturut-turut</p>
              </div>
            </div>
          </div>

          {/* Badge Categories Filter */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Koleksi Badges</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Semua', count: badges.length },
                { key: 'consistency', label: 'Konsistensi', count: badges.filter(b => b.category === 'consistency').length },
                { key: 'streak', label: 'Perfect Streak', count: badges.filter(b => b.category === 'streak').length },
                { key: 'completion', label: 'Pencapaian', count: badges.filter(b => b.category === 'completion').length },
                { key: 'milestone', label: 'Milestone', count: badges.filter(b => b.category === 'milestone').length }
              ].map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-red-700 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-red-50'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBadges.map((badge) => (
              <div 
                key={badge.id}
                className={`relative bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all duration-300 ${
                  badge.isEarned 
                    ? 'border-green-200 bg-gradient-to-br from-green-50 to-white' 
                    : 'border-gray-200 bg-gradient-to-br from-gray-50 to-white opacity-75'
                }`}
              >
                {/* Badge Icon */}
                <div className={`h-32 flex items-center justify-center bg-gradient-to-r ${badge.color}`}>
                  <div className="text-6xl">{badge.icon}</div>
                  {badge.isEarned && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                      ✓
                    </div>
                  )}
                </div>
                
                {/* Badge Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(badge.category)}`}>
                      {badge.category.charAt(0).toUpperCase() + badge.category.slice(1)}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {badge.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3">
                    {badge.description}
                  </p>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    Syarat: {badge.requirement}
                  </div>

                  {/* Progress Bar untuk badge yang belum earned */}
                  {!badge.isEarned && badge.progress && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{badge.progress.current}/{badge.progress.target}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((badge.progress.current / badge.progress.target) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {badge.isEarned && badge.earnedAt && (
                    <div className="text-xs text-green-600 font-medium">
                      Diraih: {new Date(badge.earnedAt).toLocaleDateString('id-ID')}
                    </div>
                  )}
                  
                  {!badge.isEarned && (
                    <div className="text-xs text-gray-500">
                      Belum tercapai
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-8 border border-blue-200 text-center">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">
              Raih Badge Selanjutnya! 🎯
            </h3>
            <p className="text-blue-800 mb-6">
              Lakukan checklist pencegahan secara konsisten untuk membuka badge baru dan meningkatkan level pencegahan DBD Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/checklist"
                className="bg-red-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-800 transition-colors"
              >
                Lanjutkan Misi
              </Link>
              <Link
                href="/history"
                className="bg-white border border-blue-300 text-blue-700 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Lihat Riwayat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}