import { useState } from 'react'
import InputField from './InputField'
import PasswordStrengthIndicator from './PasswordStrengthIndicator'
import { createClient } from '../../utils/supabase/client'

interface SignUpFormProps {
  onSuccess: () => void
}

interface FormErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [message, setMessage] = useState<{
    type: 'error' | 'success'
    text: string
  } | null>(null)

  const supabase = createClient()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validate full name
    if (!fullName.trim()) {
      newErrors.fullName = 'Nama lengkap harus diisi'
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Nama lengkap minimal 3 karakter'
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email harus diisi'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Format email tidak valid'
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password harus diisi'
    } else if (password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter'
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = 'Password harus mengandung huruf kecil'
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password harus mengandung huruf besar'
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password harus mengandung angka'
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password harus diisi'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/form`,
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      if (data.user?.identities?.length === 0) {
        // Email already registered
        setMessage({
          type: 'error',
          text: 'Email sudah terdaftar. Silakan gunakan email lain atau login.',
        })
      } else {
        setMessage({
          type: 'success',
          text: 'Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.',
        })

        // Clear form
        setFullName('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')

        setTimeout(() => {
          onSuccess()
        }, 2000)
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Terjadi kesalahan. Silakan coba lagi.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === 'error'
              ? 'bg-red-50 border border-red-200'
              : 'bg-green-50 border border-green-200'
          }`}
        >
          <div className="flex items-start gap-2">
            {message.type === 'error' ? (
              <svg
                className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <p
              className={`text-sm ${
                message.type === 'error' ? 'text-red-800' : 'text-green-800'
              }`}
            >
              {message.text}
            </p>
          </div>
        </div>
      )}

      <InputField
        label="Nama Lengkap"
        type="text"
        name="fullName"
        value={fullName}
        onChange={(e) => {
          setFullName(e.target.value)
          if (errors.fullName) setErrors({ ...errors, fullName: undefined })
        }}
        placeholder="Masukkan nama lengkap Anda"
        required
        autoComplete="name"
        error={errors.fullName}
        icon={
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        }
      />

      <InputField
        label="Email"
        type="email"
        name="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          if (errors.email) setErrors({ ...errors, email: undefined })
        }}
        placeholder="nama@example.com"
        required
        autoComplete="email"
        error={errors.email}
        icon={
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
            />
          </svg>
        }
      />

      <div>
        <InputField
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (errors.password) setErrors({ ...errors, password: undefined })
          }}
          placeholder="Minimal 8 karakter"
          required
          autoComplete="new-password"
          error={errors.password}
          icon={
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          }
        />
        <PasswordStrengthIndicator password={password} />
      </div>

      <InputField
        label="Konfirmasi Password"
        type="password"
        name="confirmPassword"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value)
          if (errors.confirmPassword)
            setErrors({ ...errors, confirmPassword: undefined })
        }}
        placeholder="Ketik ulang password Anda"
        required
        autoComplete="new-password"
        error={errors.confirmPassword}
        icon={
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-red-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Mendaftar...
          </span>
        ) : (
          'Daftar Sekarang'
        )}
      </button>
    </form>
  )
}
