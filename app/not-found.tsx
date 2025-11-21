import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            {/* Large 404 Text */}
            <h1 className="text-[150px] md:text-[200px] font-bold text-red-100 leading-none">
              404
            </h1>
            {/* Mosquito Icon Overlay */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <img
                src="/dengue.png"
                alt="Mosquito"
                className="w-32 h-32 md:w-40 md:h-40 opacity-80"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Maaf, halaman yang Anda cari tidak dapat ditemukan.
          </p>
          <p className="text-gray-500">
            Halaman mungkin telah dipindahkan, dihapus, atau tidak pernah ada.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="flex gap-x-2 items-center rounded bg-red-700 px-8 py-4 text-sm font-medium text-white shadow-lg hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 active:bg-red-900 transition-all w-full sm:w-auto"
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
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            Kembali ke Beranda
          </Link>
          <Link
            href="/form"
            className="flex gap-x-2 items-center rounded bg-white border-2 border-red-700 px-8 py-4 text-sm font-medium text-red-700 shadow hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-200 active:bg-red-100 transition-all w-full sm:w-auto"
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
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <circle cx="12" cy="12" r="3" />
              <path d="m16 16-1.9-1.9" />
            </svg>
            Mulai Pemeriksaan
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Atau kunjungi halaman lainnya:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/about"
              className="text-red-700 hover:text-red-800 hover:underline transition-colors"
            >
              Tentang
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/history"
              className="text-red-700 hover:text-red-800 hover:underline transition-colors"
            >
              Riwayat
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/login"
              className="text-red-700 hover:text-red-800 hover:underline transition-colors"
            >
              Masuk
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/register"
              className="text-red-700 hover:text-red-800 hover:underline transition-colors"
            >
              Daftar
            </Link>
          </div>
        </div>

        {/* Error Code */}
        <div className="mt-8">
          <p className="text-xs text-gray-400">Error Code: 404 - Page Not Found</p>
        </div>
      </div>
    </div>
  )
}
