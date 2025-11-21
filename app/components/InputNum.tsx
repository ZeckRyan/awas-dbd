interface InputNumProps {
  name: string
  min?: number
  max?: number
  step?: number
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  wMode?: 'full' | 'fit'
}

export default function InputNum({
  name,
  min,
  max,
  step,
  value,
  onChange,
  disabled,
  wMode = 'full',
}: InputNumProps) {
  return (
    <div className={wMode === 'full' ? 'w-full' : ''}>
      <input
        type="number"
        id={name.toLowerCase()}
        name={name}
        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-red-500 dark:focus:border-red-500"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
      />
    </div>
  )
}
