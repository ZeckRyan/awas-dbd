# Dengue Checker 🦟

<div align="center">
  <img src="public/dengue.png" alt="Dengue Checker Logo" width="120"/>
  
  <p><strong>Sistem Deteksi Dini Demam Berdarah Dengue Berbasis AI</strong></p>
  
  <p>Aplikasi web inovatif untuk membantu deteksi dini DBD menggunakan teknologi Machine Learning</p>

  [![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Auth-green?style=flat&logo=supabase)](https://supabase.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

---

## 📖 Tentang Aplikasi

**Dengue Checker** adalah aplikasi web yang dirancang untuk membantu masyarakat Indonesia melakukan deteksi dini Demam Berdarah Dengue (DBD) secara mandiri. Dengan memanfaatkan algoritma Machine Learning seperti **Logistic Regression** dan **Support Vector Machine (SVM)**, aplikasi ini dapat memprediksi kemungkinan seseorang terkena DBD berdasarkan gejala klinis dan hasil laboratorium.

### 🎯 Manfaat Aplikasi

#### Untuk Masyarakat Umum:
- ✅ **Deteksi Dini**: Identifikasi risiko DBD sejak gejala awal muncul
- ✅ **Mudah Digunakan**: Interface yang user-friendly dan interaktif
- ✅ **Tanpa Biaya**: Gratis dan dapat diakses kapan saja, dimana saja
- ✅ **Privasi Terjamin**: Pemeriksaan anonim tanpa harus login
- ✅ **Edukasi Kesehatan**: Informasi lengkap tentang DBD dan pencegahannya

#### Untuk Tenaga Kesehatan:
- 📊 **Data Visual**: Peta sebaran kasus DBD di Indonesia
- 🔍 **Screening Awal**: Membantu triase pasien sebelum pemeriksaan mendalam
- 📱 **Akses Cepat**: Dapat digunakan untuk konsultasi online

#### Untuk Peneliti:
- 📈 **Pattern Recognition**: Analisis pola gejala DBD
- 🧪 **Validasi Model**: Platform untuk testing model ML berbeda
- 📊 **Data Insights**: Visualisasi data kasus DBD

---

## ✨ Fitur Utama

### 🎯 Prediksi Berbasis AI
- Menggunakan algoritma Logistic Regression dan SVM
- Akurasi tinggi berdasarkan dataset klinis
- Prediksi real-time dan instan

### 📋 Form Interaktif Multi-Step
- **Step 1**: Data Pribadi & Gejala Utama (demam, suhu, durasi)
- **Step 2**: Gejala Tambahan (8 gejala klinis)
- **Step 3**: Hasil Uji Laboratorium (WBC, Hemoglobin, Hematokrit, Platelet)
- Progress indicator untuk tracking pengisian

### 📊 Visualisasi Data
- Peta interaktif sebaran kasus DBD di Indonesia
- Heatmap geografis dengan Leaflet & Plotly
- Real-time data visualization

### 👤 Sistem Autentikasi
- Login dengan email/password atau Google OAuth
- Riwayat pemeriksaan tersimpan untuk user terdaftar
- Mode anonim untuk privasi maksimal
- Role-based access control (Admin/User)

### 📁 Riwayat Pemeriksaan
- Simpan semua hasil pemeriksaan
- Download hasil dalam format PDF menggunakan jsPDF
- Monitoring kesehatan dari waktu ke waktu
- Filter berdasarkan status hasil

### 👨‍💼 Dashboard Admin
- Panel khusus untuk admin
- Manajemen artikel edukasi
- Monitoring sistem

### 📰 Konten Edukasi
- Artikel informatif tentang DBD
- Tips pencegahan dan perawatan
- Informasi kesehatan terkini

### ✏️ Manajemen Profil
- Edit profil pengguna
- Update nama dan password
- Avatar dengan inisial otomatis

### 📱 Responsive Design
- Optimal di desktop, tablet, dan mobile
- Interface adaptif untuk semua ukuran layar
- Fast loading dan smooth navigation

---

## 🚀 Instalasi & Setup

### Prasyarat

Pastikan Anda sudah menginstal:
- **Bun** (Package Manager) - [Download](https://bun.sh/)
- **Git** - [Download](https://git-scm.com/)
- **Akun Supabase** (gratis) - [Sign Up](https://supabase.com/)

### Langkah 1: Clone Repository

```bash
git clone https://github.com/ZeckRyan/awas-dbd-dfe.git
cd awas-dbd
```

### Langkah 2: Install Dependencies

```bash
bun install
```

### Langkah 3: Setup Supabase

#### 3.1 Buat Project Supabase

1. Buka [Supabase Dashboard](https://app.supabase.com/)
2. Klik **"New Project"**
3. Isi nama project, password database, dan pilih region (Southeast Asia untuk Indonesia)
4. Tunggu setup selesai (~2 menit)

#### 3.2 Setup Database Tables

**PENTING**: Gunakan file `supabase_role_setup.sql` yang sudah disediakan di root project untuk setup database yang lengkap.

Atau jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Table untuk menyimpan profil user dengan role
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Table untuk menyimpan riwayat pemeriksaan
CREATE TABLE IF NOT EXISTS examinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Data demam
  kdema TEXT NOT NULL,
  ddema NUMERIC,
  suhun NUMERIC,
  
  -- Data laboratorium
  ulabo TEXT NOT NULL,
  jwbcs NUMERIC,
  hemog NUMERIC,
  hemat NUMERIC,
  jplat NUMERIC,
  
  -- Gejala klinis
  skpla TEXT,
  nymat TEXT,
  nysen TEXT,
  rsmul TEXT,
  hinfm TEXT,
  nyper TEXT,
  mumun TEXT,
  mdiar TEXT,
  
  -- Hasil prediksi
  prediction INTEGER NOT NULL,
  probability NUMERIC,
  model_used TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;

-- Policies untuk profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policies untuk examinations
CREATE POLICY "Users can view own examinations"
  ON examinations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create examinations"
  ON examinations FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Function untuk auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger untuk auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Membuat Admin User:**

Untuk membuatnya register sebagai user user dulu lalu dijadikan admin secara manual via supabase

### Langkah 4: Konfigurasi Environment Variables

1. Salin file environment template:
   ```bash
   cp .env.local.example .env.local
   ```

2. Buka `.env.local` dan isi dengan credentials Supabase Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Cara mendapatkan credentials:
   - Buka Supabase Dashboard
   - Pilih project Anda
   - Navigasi ke **Settings** → **API**
   - Copy **Project URL** dan **anon public** key

### Langkah 5: Jalankan Aplikasi

#### Development Mode:
```bash
bun dev
```

Aplikasi akan berjalan di: **http://localhost:3000**

#### Production Build:
```bash
# Build aplikasi
bun run build

# Jalankan production server
bun start
```

---

## 📱 Cara Menggunakan

### Untuk User Baru (Tanpa Login)

1. **Akses Homepage**
   - Buka http://localhost:3000
   - Klik tombol **"Periksa"**

2. **Isi Formulir Pemeriksaan**
   - **Step 1**: Isi data pribadi, gejala demam, dan suhu tubuh
   - **Step 2**: Centang gejala tambahan yang dialami
   - **Step 3**: Isi hasil uji laboratorium (jika ada)
   - Klik **"Submit"** untuk mendapatkan hasil

3. **Lihat Hasil Prediksi**
   - Lihat status: **Positif DBD** atau **Negatif DBD**
   - Baca rekomendasi tindakan
   - Download hasil untuk dibawa ke dokter

### Untuk User Terdaftar

1. **Daftar/Login**
   - Klik **"Masuk"** di navbar
   - Pilih **"Daftar"** untuk akun baru
   - Atau login dengan **Google**

2. **Lakukan Pemeriksaan**
   - Sama seperti user tanpa login
   - Hasil otomatis tersimpan di riwayat

3. **Akses Riwayat**
   - Klik menu **"Riwayat"**
   - Lihat semua pemeriksaan sebelumnya
   - Download atau lihat detail hasil lama

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | Flowbite, Flowbite React |
| **Authentication** | Supabase Auth |
| **Database** | Supabase (PostgreSQL) |
| **Maps** | Leaflet, React Leaflet |
| **Charts** | Plotly.js, Recharts |
| **PDF Generation** | jsPDF |
| **Icons** | React Icons |
| **Machine Learning** | Logistic Regression, SVM (scikitjs) |
| **Package Manager** | Bun |
| **Deployment** | Vercel (recommended) |

---

## 📂 Struktur Project

```
awas-dbd/
├── app/                          # Next.js App Router
│   ├── components/               # Reusable components
│   │   ├── Navbar.tsx           # Navigation bar with role-based menu
│   │   ├── Stepper.tsx          # Progress indicator
│   │   ├── InputChoice.tsx      # Checkbox group input
│   │   ├── InputNum.tsx         # Number input
│   │   ├── InputField.tsx       # Text input field
│   │   ├── Question.tsx         # Question wrapper
│   │   ├── QAWrapper.tsx        # Q&A wrapper component
│   │   ├── LoginForm.tsx        # Login form component
│   │   ├── SignUpForm.tsx       # Sign up form component
│   │   ├── AuthButton.tsx       # Authentication button
│   │   ├── PlotlyChart.tsx      # Plotly chart component
│   │   ├── RechartsHeatmap.tsx  # Recharts heatmap component
│   │   └── PasswordStrengthIndicator.tsx
│   ├── about/                    # About page
│   ├── admin/                    # Admin section
│   │   ├── dashboard/           # Admin dashboard
│   │   └── articles/            # Article management
│   ├── articles/                 # Public articles page
│   ├── auth/                     # Auth pages
│   │   └── error/               # Auth error page
│   ├── checklist/                # Checklist page
│   ├── form/                     # Multi-step examination form
│   ├── history/                  # Examination history with PDF export
│   │   └── [id]/                # Individual history detail
│   ├── login/                    # Login page
│   ├── profile/                  # User profile (edit form)
│   ├── register/                 # Register page
│   ├── result/                   # Result page
│   ├── page.tsx                  # Homepage with map
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── not-found.tsx             # 404 page
├── lib/                          # Utilities & logic
│   ├── model.ts                  # ML models & prediction (Logistic Regression, SVM)
│   └── dengue-service.ts         # Supabase services (CRUD operations)
├── utils/                        # Utility functions
│   └── supabase/                 # Supabase clients (client & server)
├── types/                        # TypeScript types
├── public/                       # Static assets
│   ├── dengue.png               # App logo
│   └── heatmap_geo.json         # Map data for Indonesia
├── middleware.ts                 # Next.js middleware for auth
├── supabase_role_setup.sql      # Complete database setup script
├── .env.local                    # Environment variables (create this)
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript config
```

---

## 🤝 Kontribusi

Kami menerima kontribusi dari siapa saja! Jika Anda ingin berkontribusi:

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

---

## 📄 Lisensi

Project ini dilisensikan di bawah MIT License - lihat file [LICENSE](LICENSE) untuk detail.

---

## 👥 Tim Pengembang

Dibuat oleh mahasiswa Universitas Teknologi Yogyakarta

---

## ⚠️ Disclaimer

Aplikasi ini **BUKAN** pengganti diagnosis medis profesional. Hasil prediksi hanya sebagai **screening awal** dan **referensi**. Selalu konsultasikan dengan dokter atau tenaga kesehatan untuk diagnosis dan pengobatan yang tepat.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open Source Firebase Alternative
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Leaflet](https://leafletjs.com/) - Open-source JavaScript library for maps
- [WHO](https://www.who.int/) - Dengue data and guidelines
- [Kemenkes RI](https://www.kemkes.go.id/) - Indonesian health data

---

<div align="center">
  <p>Made with ❤️ for Indonesian Healthcare</p>
  <p>© 2025 Awas DBD - Universitas Teknologi Yogyakarta</p>
</div>
