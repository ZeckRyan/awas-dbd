'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'

// Interface untuk artikel berita
interface NewsArticle {
  title: string
  description: string
  url: string
  urlToImage: string
  publishedAt: string
  source: {
    name: string
  }
  author: string
}

export default function ArticlesPage() {
  const [selectedCategory, setSelectedCategory] = useState('demam-berdarah')
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const categories = [
    { key: 'demam-berdarah', label: 'Berita DBD Terbaru' },
    { key: 'pencegahan', label: 'Pencegahan DBD' },
    { key: 'vaksin', label: 'Vaksin Dengue' },
    { key: 'teknologi', label: 'Teknologi Deteksi' }
  ]

  // Fetch berita DBD dari NewsData API
  const fetchNews = async (query: string) => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/news?q=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }
      
      const data = await response.json()
      setArticles(data.articles || [])
    } catch (err) {
      setError('Gagal memuat berita DBD. Silakan coba lagi nanti.')
      console.error('Error fetching news:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNews(selectedCategory)
  }, [selectedCategory])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Baru saja'
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} hari yang lalu`
    
    return formatDate(dateStr)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="articles" />
      
      <div className="pt-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white">
          <div className="max-w-screen-xl mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                Berita DBD Terkini
              </h1>
              <p className="text-xl text-red-100 max-w-2xl mx-auto">
                Informasi terbaru seputar Demam Berdarah Dengue, pencegahan, penelitian, dan perkembangan teknologi deteksi DBD
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 py-12">
          {/* Category Filter */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategori Berita DBD:</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-red-700 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-red-50 hover:border-red-300'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat berita terbaru...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Terjadi Kesalahan
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => fetchNews(selectedCategory)}
                className="bg-red-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-800 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Articles Grid */}
          {!isLoading && !error && (
            <>
              {articles.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {articles.map((article, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="aspect-video bg-gradient-to-r from-red-400 to-red-500 overflow-hidden">
                        {article.urlToImage ? (
                          <img
                            src={article.urlToImage}
                            alt={article.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-white text-6xl">📰</div>'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-6xl">📰</div>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                            {article.source.name}
                          </span>
                          <span>📅 {getTimeAgo(article.publishedAt)}</span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                          {article.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {article.description || 'Baca selengkapnya di sumber berita...'}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {article.author ? `👤 ${article.author}` : `📰 ${article.source.name}`}
                          </span>
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-red-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-800 transition-colors flex items-center gap-2"
                          >
                            Baca Selengkapnya
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Tidak ada berita ditemukan
                  </h3>
                  <p className="text-gray-600">
                    Tidak ada berita DBD ditemukan untuk kategori ini. Coba pilih kategori lain.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Call to Action */}
          <div className="mt-16 bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-8 border border-red-200">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-red-900 mb-4">
                Khawatir dengan Gejala DBD?
              </h3>
              <p className="text-red-800 mb-6 max-w-2xl mx-auto">
                Gunakan sistem deteksi kami untuk analisis dini gejala DBD dengan teknologi AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/form"
                  className="inline-flex items-center gap-2 bg-red-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Cek Gejala DBD
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-white border border-red-300 text-red-700 px-6 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}