import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'surface' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-control)] ' +
  'transition-[transform,background-color,border-color,box-shadow] duration-150 ' +
  'active:scale-[0.97] disabled:opacity-55 disabled:pointer-events-none select-none ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2'

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-ink shadow-[var(--shadow-md)] hover:brightness-110 hover:-translate-y-0.5',
  surface:
    'bg-surface text-ink border border-border hover:border-border-strong hover:bg-surface-2 shadow-[var(--shadow-sm)]',
  ghost: 'bg-transparent text-muted hover:text-ink hover:bg-surface-2',
  danger: 'bg-danger text-white hover:brightness-110',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

/** App-wide button. All interactive affordances route through this for consistency. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'surface', size = 'md', className = '', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
})
