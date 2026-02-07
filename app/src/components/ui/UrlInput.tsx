import { ArrowRight } from '../icons/ArrowRight'

interface UrlInputProps {
  value: string
  onChange: (value: string) => void
  error: string | null
  placeholder?: string
}

export function UrlInput({ value, onChange, error, placeholder }: UrlInputProps) {
  return (
    <div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <span className="text-[var(--color-text-subtle)]">https://</span>
        </div>
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full py-4 pl-[5.5rem] pr-32
            bg-[var(--color-bg-elevated)] 
            border rounded-xl
            text-lg
            placeholder:text-[var(--color-text-subtle)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent
            transition-all duration-150
            ${error 
              ? 'border-[var(--color-error)]' 
              : 'border-[var(--color-border)] hover:border-[var(--color-text-subtle)]'
            }
          `}
        />
        
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
          <button
            type="submit"
            className="
              px-5 py-2.5 
              bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]
              text-black font-medium
              rounded-lg
              flex items-center gap-2
              transition-colors duration-150
            "
          >
            Explore
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-[var(--color-error)] pl-1">
          {error}
        </p>
      )}
    </div>
  )
}
