interface InputChoiceProps {
  name: string
  choices: string[]
  value?: string
  onChange: (value: string) => void
  wMode?: 'full' | 'fit'
}

export default function InputChoice({
  name,
  choices,
  value,
  onChange,
  wMode = 'full',
}: InputChoiceProps) {
  return (
    <ul
      className={`${
        wMode === 'full' ? 'w-full' : ''
      } items-center text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
    >
      {choices.map((choice, index) => (
        <li
          key={index}
          className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600"
        >
          <div className="flex items-center px-8">
            <input
              id={`horizontal-list-radio-${name.toLowerCase()}-${index}`}
              type="radio"
              value={choice}
              name={name}
              checked={value === choice}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
            />
            <label
              htmlFor={`horizontal-list-radio-${name.toLowerCase()}-${index}`}
              className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              {choice}
            </label>
          </div>
        </li>
      ))}
    </ul>
  )
}
