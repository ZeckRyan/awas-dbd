import { ReactNode } from 'react'

interface QAWrapperProps {
  question: ReactNode
  inputForm: ReactNode
  mode?: 'col' | 'row'
}

export default function QAWrapper({
  question,
  inputForm,
  mode = 'col',
}: QAWrapperProps) {
  return (
    <div
      className={`flex flex-col gap-y-4 ${
        mode === 'row' ? 'md:flex-row gap-x-4 justify-between' : ''
      }`}
    >
      {question}
      {inputForm}
    </div>
  )
}
