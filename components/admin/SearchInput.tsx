'use client'

import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (newValue: string) => {
    setLocalValue(newValue)

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      onChange(newValue)
    }, debounceMs)
  }

  const handleClear = () => {
    setLocalValue('')
    onChange('')
  }

  return (
    <div className='relative'>
      <Search
        size={16}
        className='absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none'
        style={{ color: 'var(--color-text-muted)' }}
      />
      <input
        type='text'
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className='w-full pl-9 pr-8 py-2 text-sm rounded-lg border outline-none transition-colors'
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-card-border)',
          color: 'var(--color-text-body)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-primary)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-card-border)'
        }}
      />
      {localValue && (
        <button
          onClick={handleClear}
          className='absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-colors'
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-text-body)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-muted)'
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
