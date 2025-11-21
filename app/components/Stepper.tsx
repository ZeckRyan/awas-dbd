interface StepperProps {
  active: number
}

export default function Stepper({ active }: StepperProps) {
  const activeStep =
    'size-6 rounded-full bg-red-600 text-center text-[10px]/6 font-bold text-white'
  const regularStep =
    'size-6 rounded-full bg-gray-100 text-center text-[10px]/6 font-bold'

  return (
    <div className="flex w-full px-4 py-4 justify-center">
      <div className="relative w-full lg:w-1/2 after:absolute after:inset-x-0 after:top-1/2 after:block after:h-0.5 after:-translate-y-1/2 after:rounded-lg after:bg-gray-100">
        <ol className="relative z-10 flex justify-between text-sm font-medium text-gray-500">
          <li className="flex items-center gap-2 bg-white p-2">
            <span className={active === 0 ? activeStep : regularStep}>1</span>
            <span className="hidden sm:block"> Konfirmasi </span>
          </li>

          <li className="flex items-center gap-2 bg-white p-2">
            <span className={active === 1 ? activeStep : regularStep}>2</span>
            <span className="hidden sm:block"> Survey </span>
          </li>

          <li className="flex items-center gap-2 bg-white p-2">
            <span className={active === 2 ? activeStep : regularStep}>3</span>
            <span className="hidden sm:block"> Hasil </span>
          </li>
        </ol>
      </div>
    </div>
  )
}
