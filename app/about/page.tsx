'use client'

import Navbar from '../components/Navbar'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <div>
      <Navbar active="about" />

      <div style={{ top: 0, marginTop: 80 }}>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
          <div className="mx-auto max-w-screen-xl px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Tentang Dengue Checker
              </h1>
              <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto">
                Sistem deteksi dini Demam Berdarah Dengue berbasis AI untuk membantu masyarakat Indonesia
              </p>
            </div>
          </div>
        </section>

        {/* About Application Section */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-screen-xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Tentang Aplikasi
              </h2>
              <div className="w-20 h-1 bg-red-700 mx-auto mb-6"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src="/dengue.png"
                  alt="Dengue Checker"
                  className="w-full max-w-md mx-auto"
                />
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed">
                  <strong className="text-red-700">Dengue Checker</strong> adalah aplikasi web inovatif yang dirancang untuk membantu deteksi dini Demam Berdarah Dengue (DBD) menggunakan teknologi Artificial Intelligence.
                </p>
                <p className="leading-relaxed">
                  Dengan memanfaatkan algoritma Machine Learning seperti <strong>Logistic Regression</strong> dan <strong>Support Vector Machine (SVM)</strong>, aplikasi ini dapat memprediksi kemungkinan seseorang terkena DBD berdasarkan gejala klinis dan hasil laboratorium yang diinputkan.
                </p>
                <p className="leading-relaxed">
                  DBD merupakan penyakit tropis yang serius dan dapat berakibat fatal jika tidak ditangani dengan cepat. Melalui aplikasi ini, kami berharap dapat membantu masyarakat untuk lebih waspada dan melakukan tindakan preventif sejak dini.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-screen-xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Fitur Unggulan
              </h2>
              <div className="w-20 h-1 bg-red-700 mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Berbagai fitur yang memudahkan Anda dalam melakukan deteksi DBD
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7 text-red-700"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                    <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Prediksi Berbasis AI
                </h3>
                <p className="text-gray-600">
                  Menggunakan model Machine Learning seperti Logistic Regression dan SVM yang telah dilatih dengan dataset klinis untuk memberikan prediksi akurat.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7 text-red-700"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" x2="8" y1="13" y2="13" />
                    <line x1="16" x2="8" y1="17" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Form Interaktif
                </h3>
                <p className="text-gray-600">
                  Interface yang user-friendly dengan form wizard multi-step untuk kemudahan input data gejala dan hasil lab.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7 text-red-700"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M8 16H3v5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Riwayat Pemeriksaan
                </h3>
                <p className="text-gray-600">
                  Simpan dan akses riwayat pemeriksaan Anda untuk monitoring perkembangan kesehatan dari waktu ke waktu.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7 text-red-700"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Visualisasi Data
                </h3>
                <p className="text-gray-600">
                  Peta interaktif yang menampilkan sebaran kasus DBD di Indonesia untuk meningkatkan awareness masyarakat.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7 text-red-700"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Mode Anonim
                </h3>
                <p className="text-gray-600">
                  Lakukan pemeriksaan tanpa harus login, menjaga privasi Anda dengan tetap mendapatkan hasil prediksi.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7 text-red-700"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" x2="12" y1="15" y2="3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Export Hasil
                </h3>
                <p className="text-gray-600">
                  Download hasil pemeriksaan dalam format yang dapat dibawa ke fasilitas kesehatan untuk konsultasi lebih lanjut.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-screen-xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Tim Pengembang
              </h2>
              <div className="w-20 h-1 bg-red-700 mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Dibangun oleh tim mahasiswa Universitas Teknologi Yogyakarta yang berdedikasi untuk membantu masyarakat
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Developer 1 */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-red-600 to-red-800 h-32"></div>
                <div className="text-center -mt-16 pb-8 px-6">
                  <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white mx-auto mb-4 flex items-center justify-center overflow-hidden">
                    <Image
                      src="/images/alie.jpg"
                      alt="Alie Pratama"
                      width={128}
                      height={128}
                      className="w-full h-auto text-gray-400"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Alie Pratama
                  </h3>
                  <p className="text-red-700 font-medium mb-3">Full Stack Developer</p>
                  <p className="text-gray-600 text-sm mb-4">
                    Bertanggung jawab atas pengembangan frontend dan integrasi API
                  </p>
                </div>
              </div>

              {/* Developer 2 */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-red-600 to-red-800 h-32"></div>
                <div className="text-center -mt-16 pb-8 px-6">
                  <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white mx-auto mb-4 flex items-center justify-center overflow-hidden">
                    <Image
                      src="/images/zakki.jpg"
                      alt="Zakki Farian"
                      width={128}
                      height={128}
                      className="w-full h-auto text-gray-400"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Zakki Farian
                  </h3>
                  <p className="text-red-700 font-medium mb-3">Machine Learning Engineer</p>
                  <p className="text-gray-600 text-sm mb-4">
                    Fokus pada pengembangan model AI dan data processing
                  </p>
                </div>
              </div>

              {/* Developer 3 */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-red-600 to-red-800 h-32"></div>
                <div className="text-center -mt-16 pb-8 px-6">
                  <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white mx-auto mb-4 flex items-center justify-center overflow-hidden">
                    <Image
                      src="/images/ridho.jpg"
                      alt="Ridho Ardiansyah"
                      width={128}
                      height={128}
                      className="w-full h-auto text-gray-400"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Ridho Ardiansyah
                  </h3>
                  <p className="text-red-700 font-medium mb-3">UI/UX Designer & Developer</p>
                  <p className="text-gray-600 text-sm mb-4">
                    Merancang interface dan user experience aplikasi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-screen-xl px-4">
            <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-12 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Siap Melakukan Pemeriksaan?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Deteksi DBD sejak dini untuk penanganan yang lebih cepat dan tepat
              </p>
              <a
                href="/form"
                className="inline-flex gap-x-2 items-center rounded bg-white px-8 py-4 text-sm font-medium text-red-700 shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-white/50 active:bg-gray-200 transition-all"
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
                Mulai Pemeriksaan Sekarang
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
