'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../../utils/supabase/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Stats {
    totalUsers: number
    totalPositive: number
    totalNegative: number
}

interface ChartData {
    month: string
    positif: number
    negatif: number
}

export default function AdminDashboard() {
    const supabase = createClient()
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalPositive: 0,
        totalNegative: 0
    })
    const [loading, setLoading] = useState(true)
    const [chartData, setChartData] = useState<ChartData[]>([])

    useEffect(() => {
        fetchStats()
        fetchChartData()
    }, [])

    const fetchStats = async () => {
        try {
            // Get total users
            const { count: userCount } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true })

            //  Get positive and negative cases from examinations
            const { data: examinations } = await supabase
                .from('examinations')
                .select('prediction')

            const positive = examinations?.filter(e => e.prediction === 1).length || 0
            const negative = examinations?.filter(e => e.prediction === 0).length || 0

            setStats({
                totalUsers: userCount || 0,
                totalPositive: positive,
                totalNegative: negative
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchChartData = async () => {
        try {
            // Fetch examinations with created_at
            const { data: examinations } = await supabase
                .from('examinations')
                .select('prediction, created_at')
                .order('created_at', { ascending: true })

            if (!examinations || examinations.length === 0) {
                // Set dummy data jika belum ada
                setChartData([
                    { month: 'Jan', positif: 5, negatif: 45 },
                    { month: 'Feb', positif: 8, negatif: 52 },
                    { month: 'Mar', positif: 12, negatif: 48 },
                    { month: 'Apr', positif: 10, negatif: 60 },
                    { month: 'Mei', positif: 15, negatif: 55 },
                    { month: 'Jun', positif: 20, negatif: 70 },
                ])
                return
            }

            // Group by month
            const monthlyData: { [key: string]: { positif: number, negatif: number } } = {}

            examinations.forEach(exam => {
                const date = new Date(exam.created_at)
                const monthKey = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })

                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = { positif: 0, negatif: 0 }
                }

                if (exam.prediction === 1) {
                    monthlyData[monthKey].positif++
                } else {
                    monthlyData[monthKey].negatif++
                }
            })

            // Convert to array
            const chartDataArray = Object.keys(monthlyData).map(month => ({
                month: month,
                positif: monthlyData[month].positif,
                negatif: monthlyData[month].negatif
            }))

            setChartData(chartDataArray.length > 0 ? chartDataArray : [
                { month: 'Jan', positif: 5, negatif: 45 },
                { month: 'Feb', positif: 8, negatif: 52 },
                { month: 'Mar', positif: 12, negatif: 48 },
            ])
        } catch (error) {
            console.error('Error fetching chart data:', error)
        }
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Statistik Bulan Januari</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                        {loading ? '...' : stats.totalUsers}
                    </div>
                    <div className="text-sm text-gray-600">Total Pengguna</div>
                    <div className="text-xs text-yellow-600 mt-2">+5 bulan ini</div>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                        {loading ? '...' : stats.totalPositive}
                    </div>
                    <div className="text-sm text-gray-600">Total Positif DBD</div>
                    <div className="text-xs text-pink-600 mt-2">+10 bulan ini</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                        {loading ? '...' : stats.totalNegative}
                    </div>
                    <div className="text-sm text-gray-600">Total Negatif DBD</div>
                    <div className="text-xs text-green-600 mt-2">+200 bulan ini</div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Trend Kasus DBD</h2>
                <p className="text-sm text-gray-600 mb-6">Grafik perkembangan kasus positif dan negatif DBD per bulan</p>

                <div className="w-full" style={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="month"
                                tick={{ fill: '#6B7280' }}
                                tickLine={{ stroke: '#6B7280' }}
                            />
                            <YAxis
                                tick={{ fill: '#6B7280' }}
                                tickLine={{ stroke: '#6B7280' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '8px',
                                    padding: '12px'
                                }}
                            />
                            <Legend
                                wrapperStyle={{
                                    paddingTop: '20px'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="positif"
                                stroke="#DC2626"
                                strokeWidth={3}
                                name="Positif DBD"
                                dot={{ fill: '#DC2626', r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="negatif"
                                stroke="#10B981"
                                strokeWidth={3}
                                name="Negatif DBD"
                                dot={{ fill: '#10B981', r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                            <p className="text-sm font-semibold text-gray-700">Trend Positif</p>
                        </div>
                        <p className="text-xs text-gray-600">
                            Pantau peningkatan kasus untuk antisipasi dini
                        </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                            <p className="text-sm font-semibold text-gray-700">Trend Negatif</p>
                        </div>
                        <p className="text-xs text-gray-600">
                            Indikator efektivitas pencegahan di masyarakat
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
