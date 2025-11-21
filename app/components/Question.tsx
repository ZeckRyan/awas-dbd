interface QuestionProps {
  title: string
  description: string
  image: string
  labelFor?: string
}

export default function Question({
  title,
  description,
  image,
  labelFor,
}: QuestionProps) {
  return (
    <div className="flex gap-x-8 items-center">
      <img
        id={labelFor ? `${labelFor.toLowerCase()}-img` : ''}
        src={image}
        alt="Question"
        className="w-16"
      />
      <label
        htmlFor={labelFor ? labelFor.toLowerCase() : ''}
        className="flex flex-col"
      >
        <h5 className="mb-2 text-xl font-medium tracking-tight text-gray-900 dark:text-white">
          {title}
        </h5>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          {description}
        </p>
      </label>
    </div>
  )
}
