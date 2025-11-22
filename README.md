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

### 📁 Riwayat Pemeriksaan
- Simpan semua hasil pemeriksaan
- Download hasil dalam format PDF/Image
- Monitoring kesehatan dari waktu ke waktu

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
git clone https://github.com/aliepratama/dengue-checker-nextjs.git
cd dengue-checker-nextjs
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

#### 3.2 Aktifkan Google OAuth (Opsional)

Untuk fitur login dengan Google:

1. Buka project Anda di Supabase Dashboard
2. Navigasi ke **Authentication** → **Providers**
3. Enable **Google** provider
4. Dapatkan Google OAuth credentials:
   - Buka [Google Cloud Console](https://console.cloud.google.com/)
   - Buat OAuth 2.0 Client ID
   - Tambahkan redirect URI: `https://[PROJECT-ID].supabase.co/auth/v1/callback`
5. Paste Client ID dan Secret ke Supabase

#### 3.3 Setup Database Tables

Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Table untuk menyimpan profil user
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Table untuk menyimpan riwayat pemeriksaan
CREATE TABLE examinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  form_data JSONB NOT NULL,
  prediction INTEGER NOT NULL,
  probability FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;

-- Policies untuk user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policies untuk examinations
CREATE POLICY "Users can view own examinations"
  ON examinations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create examinations"
  ON examinations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Tambahkan table untuk menyimpan profile user yang lebih detail
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS untuk user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy untuk user_profiles - user hanya bisa akses profile mereka sendiri
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger untuk auto-update updated_at pada user_profiles
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- Function untuk otomatis membuat profile ketika user baru register
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger untuk auto-create profile ketika user baru register
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- Update existing users yang belum punya profile (optional, untuk existing users)
INSERT INTO user_profiles (id, full_name)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', 'User')
FROM auth.users
WHERE id NOT IN (SELECT id FROM user_profiles)
ON CONFLICT (id) DO NOTHING;

-- Table untuk menyimpan progress checklist pencegahan mingguan
CREATE TABLE IF NOT EXISTS weekly_prevention_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    completed_items TEXT[] NOT NULL DEFAULT '{}',
    total_items INTEGER NOT NULL DEFAULT 8,
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint untuk memastikan satu user hanya punya satu record per minggu
    UNIQUE(user_id, week_start)
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_weekly_prevention_user_id ON weekly_prevention_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_prevention_week_start ON weekly_prevention_progress(week_start);
CREATE INDEX IF NOT EXISTS idx_weekly_prevention_user_week ON weekly_prevention_progress(user_id, week_start);

-- Function untuk update timestamp otomatis
CREATE OR REPLACE FUNCTION update_weekly_prevention_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk auto-update updated_at
CREATE OR REPLACE TRIGGER update_weekly_prevention_updated_at 
    BEFORE UPDATE ON weekly_prevention_progress 
    FOR EACH ROW 
    EXECUTE FUNCTION update_weekly_prevention_updated_at();

-- RLS Policy untuk keamanan
ALTER TABLE weekly_prevention_progress ENABLE ROW LEVEL SECURITY;

-- Policy untuk user hanya bisa akses data mereka sendiri
CREATE POLICY "Users can view their own prevention progress" ON weekly_prevention_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prevention progress" ON weekly_prevention_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prevention progress" ON weekly_prevention_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prevention progress" ON weekly_prevention_progress
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON weekly_prevention_progress TO authenticated;

-- Table untuk menyimpan achievement/pencapaian user
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(100) NOT NULL,
    description TEXT,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    week_start DATE,
    
    -- Constraint untuk memastikan satu user tidak bisa dapat achievement yang sama di minggu yang sama
    UNIQUE(user_id, achievement_type, week_start)
);

-- Index untuk achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_type);

-- RLS Policy untuk achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT ON user_achievements TO authenticated;

-- Function untuk auto-create achievements berdasarkan progress
CREATE OR REPLACE FUNCTION create_achievement_on_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Achievement untuk first time completion
    IF NEW.completion_percentage > 0 AND (
        OLD IS NULL OR OLD.completion_percentage = 0
    ) THEN
        INSERT INTO user_achievements (user_id, achievement_type, achievement_name, description, week_start)
        VALUES (
            NEW.user_id, 
            'first_steps', 
            'Langkah Pertama', 
            'Menyelesaikan checklist pencegahan pertama kali',
            NEW.week_start
        )
        ON CONFLICT (user_id, achievement_type, week_start) DO NOTHING;
    END IF;
    
    -- Achievement untuk 50% completion
    IF NEW.completion_percentage >= 50 AND (
        OLD IS NULL OR OLD.completion_percentage < 50
    ) THEN
        INSERT INTO user_achievements (user_id, achievement_type, achievement_name, description, week_start)
        VALUES (
            NEW.user_id, 
            'halfway_hero', 
            'Pahlawan Setengah Jalan', 
            'Menyelesaikan 50% checklist pencegahan',
            NEW.week_start
        )
        ON CONFLICT (user_id, achievement_type, week_start) DO NOTHING;
    END IF;
    
    -- Achievement untuk 100% completion
    IF NEW.completion_percentage = 100 AND (
        OLD IS NULL OR OLD.completion_percentage < 100
    ) THEN
        INSERT INTO user_achievements (user_id, achievement_type, achievement_name, description, week_start)
        VALUES (
            NEW.user_id, 
            'perfect_week', 
            'Minggu Sempurna', 
            'Menyelesaikan 100% checklist pencegahan',
            NEW.week_start
        )
        ON CONFLICT (user_id, achievement_type, week_start) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk create achievements otomatis
CREATE OR REPLACE TRIGGER create_achievements_trigger
    AFTER INSERT OR UPDATE ON weekly_prevention_progress
    FOR EACH ROW
    EXECUTE FUNCTION create_achievement_on_progress();
```

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
   - Lihat peta sebaran DBD di Indonesia
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
| **Authentication** | Supabase Auth |
| **Database** | Supabase (PostgreSQL) |
| **Maps** | Leaflet, Plotly.js |
| **Machine Learning** | Logistic Regression, SVM |
| **Package Manager** | Bun |
| **Deployment** | Vercel (recommended) |

---

## 📂 Struktur Project

```
dengue-checker-nextjs/
├── app/                          # Next.js App Router
│   ├── components/               # Reusable components
│   │   ├── Navbar.tsx           # Navigation bar
│   │   ├── Stepper.tsx          # Progress indicator
│   │   ├── InputChoice.tsx      # Checkbox group input
│   │   ├── InputNum.tsx         # Number input
│   │   ├── Question.tsx         # Question wrapper
│   │   ├── LeafletMap.tsx       # Map component
│   │   └── ...
│   ├── about/                    # About page
│   ├── form/                     # Multi-step form
│   ├── history/                  # Examination history
│   ├── login/                    # Login page
│   ├── register/                 # Register page
│   ├── result/                   # Result page
│   ├── page.tsx                  # Homepage
│   ├── layout.tsx                # Root layout
│   └── not-found.tsx             # 404 page
├── lib/                          # Utilities & logic
│   ├── model.ts                  # ML models & prediction
│   └── dengue-service.ts         # Supabase services
├── utils/                        # Utility functions
│   └── supabase/                 # Supabase clients
├── public/                       # Static assets
│   ├── images/                   # Images
│   ├── icons/                    # SVG icons
│   └── heatmap_geo.json         # Map data
├── types/                        # TypeScript types
├── .env.local                    # Environment variables (create this)
└── package.json                  # Dependencies
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

Dibuat oleh mahasiswa Universitas Teknologi Yogyakarta:

- **Alie Pratama** - Full Stack Developer
- **Zakki Farian** - Machine Learning Engineer  
- **Ridho Lestari** - UI/UX Designer & Developer

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
  <p>© 2025 Dengue Checker - Universitas Teknologi Yogyakarta</p>
</div>
