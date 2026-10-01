import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from 'react'
import { cn } from '../../lib/cn'

const inputCls =
  'mt-1 block min-h-touch w-full rounded-md border bg-surface px-3 text-base transition-ui focus:border-action-600'

/** Labelled input with hint and error wired up via aria-describedby / aria-invalid. */
export function TextField({
  label,
  error,
  hint,
  name,
  className,
  ref,
  ...rest
}: {
  label: string
  error?: string
  hint?: ReactNode
  name: string
  ref?: Ref<HTMLInputElement>
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  const describedBy =
    [hint ? `${id}-hint` : null, error ? `${id}-err` : null].filter(Boolean).join(' ') || undefined
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {rest.required && <span aria-hidden="true"> *</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-ink-muted">
          {hint}
        </p>
      )}
      <input
        ref={ref}
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(inputCls, error ? 'border-danger' : 'border-line-strong')}
        {...rest}
      />
      {error && (
        <p id={`${id}-err`} className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  error,
}: {
  label: string
  name: string
  value: string
  onChange: (v: string) => void
  options: readonly { value: string; label: string }[]
  error?: string
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        className={cn(inputCls, error ? 'border-danger' : 'border-line-strong')}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-err`} className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
