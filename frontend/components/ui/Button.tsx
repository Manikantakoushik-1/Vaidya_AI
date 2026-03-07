'use client'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
    const variants = {
      primary: 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500',
      secondary: 'bg-indigo-500 hover:bg-indigo-600 text-white focus:ring-indigo-400',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
      ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
    }
    const sizes = { sm: 'text-sm px-3 py-1.5', md: 'text-base px-5 py-2.5', lg: 'text-lg px-8 py-4' }
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={twMerge(clsx(base, variants[variant], sizes[size], (disabled || loading) && 'opacity-50 cursor-not-allowed', className))}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
export default Button
