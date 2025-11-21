interface PasswordStrengthIndicatorProps {
  password: string
}

export default function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { strength: 0, text: '', color: '' }

    let strength = 0

    // Length check
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++

    // Character variety checks
    if (/[a-z]/.test(pwd)) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++

    // Determine strength level
    if (strength <= 2) {
      return { strength: 1, text: 'Lemah', color: 'bg-red-500' }
    } else if (strength <= 4) {
      return { strength: 2, text: 'Sedang', color: 'bg-yellow-500' }
    } else {
      return { strength: 3, text: 'Kuat', color: 'bg-green-500' }
    }
  }

  const getPasswordRequirements = (pwd: string) => {
    return [
      { met: pwd.length >= 8, text: 'Minimal 8 karakter' },
      { met: /[a-z]/.test(pwd), text: 'Huruf kecil (a-z)' },
      { met: /[A-Z]/.test(pwd), text: 'Huruf besar (A-Z)' },
      { met: /[0-9]/.test(pwd), text: 'Angka (0-9)' },
      { met: /[^a-zA-Z0-9]/.test(pwd), text: 'Karakter khusus (!@#$%^&*)' },
    ]
  }

  const { strength, text, color } = getPasswordStrength(password)
  const requirements = getPasswordRequirements(password)

  if (password.length === 0) return null

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${(strength / 3) * 100}%` }}
          ></div>
        </div>
        <span
          className={`text-sm font-medium ${
            strength === 1
              ? 'text-red-600'
              : strength === 2
              ? 'text-yellow-600'
              : 'text-green-600'
          }`}
        >
          {text}
        </span>
      </div>

      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs font-medium text-gray-700 mb-2">
          Persyaratan Password:
        </p>
        <ul className="space-y-1">
          {requirements.map((req, index) => (
            <li key={index} className="flex items-center gap-2 text-xs">
              {req.met ? (
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className={req.met ? 'text-green-700' : 'text-gray-500'}>
                {req.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
