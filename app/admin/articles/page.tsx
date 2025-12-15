'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../../utils/supabase/client'

interface Article {
    id: string
    title: string
    description: string
    url: string
    image_url: string
    category: string
    source_name: string
    created_at: string
}

export default function AdminArticlesPage() {
    const supabase = createClient()
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        url: '',
        image_url: '',
        category: 'Berita DBD Terbaru',
        source_name: ''
    })

    const categories = [
        'Berita DBD Terbaru',
        'Pencegahan DBD',
        'Vaksin Dengue',
        'Teknologi Deteksi'
    ]

    useEffect(() => {
        fetchArticles()
    }, [selectedCategory])

    const fetchArticles = async () => {
        try {
            let query = supabase
                .from('articles')
                .select('*')
                .order('created_at', { ascending: false })

            if (selectedCategory !== 'all') {
                query = query.eq('category', selectedCategory)
            }

            const { data, error } = await query

            if (error) throw error
            setArticles(data || [])
        } catch (error) {
            console.error('Error fetching articles:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const { error } = await supabase
                .from('articles')
                .insert([formData])

            if (error) throw error

            setShowModal(false)
            setFormData({
                title: '',
                description: '',
                url: '',
                image_url: '',
                category: 'Berita DBD Terbaru',
                source_name: ''
            })
            fetchArticles()
        } catch (error) {
            console.error('Error adding article:', error)
            alert('Gagal menambahkan artikel')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus artikel ini?')) return

        try {
            const { error } = await supabase
                .from('articles')
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchArticles()
        } catch (error) {
            console.error('Error deleting article:', error)
            alert('Gagal menghapus artikel')
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Kelola Artikel</h1>
                    <p className="text-gray-600 mt-1">Tambah dan kelola artikel DBD</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-red-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-800 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambahkan Artikel
                </button>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Kategori Berita DBD:</h3>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === 'all'
                            ? 'bg-red-700 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-red-50'
                            }`}
                    >
                        Semua ({articles.length})
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === cat
                                ? 'bg-red-700 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-red-50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Articles Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
                </div>
            ) : articles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => (
                        <div key={article.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-video bg-gradient-to-r from-red-400 to-red-500 overflow-hidden">
                                {article.image_url ? (
                                    <img
                                        src={article.image_url}
                                        alt={article.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white text-6xl">📰</div>
                                )}
                            </div>

                            <div className="p-4">
                                <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium mb-2">
                                    {article.source_name}
                                </span>

                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                    {article.title}
                                </h3>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {article.description}
                                </p>

                                <div className="flex items-center gap-2">
                                    <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-800 transition-colors text-center"
                                    >
                                        Baca Selengkapnya
                                    </a>
                                    <button
                                        onClick={() => handleDelete(article.id)}
                                        className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl">
                    <div className="text-6xl mb-4">📄</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum ada artikel</h3>
                    <p className="text-gray-600">Klik tombol "Tambahkan Artikel" untuk menambah artikel baru</p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Tambah Artikel Baru</h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Judul Artikel</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Contoh: Kasus DBD Meningkat di Jakarta"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Deskripsi singkat artikel..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">URL Artikel</label>
                                    <input
                                        type="url"
                                        required
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="https://www.kompas.com/..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">URL Gambar</label>
                                    <input
                                        type="url"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="https://example.com/image.jpg (optional)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sumber</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.source_name}
                                        onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Contoh: Kompas, Detik, CNN Indonesia"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-red-700 text-white rounded-lg font-medium hover:bg-red-800 transition-colors"
                                    >
                                        Simpan Artikel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
