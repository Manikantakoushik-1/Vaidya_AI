import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'emergency'
}

export default function Card({ className, variant = 'default', children, ...props }: CardProps) {
  const variants = {
    default: 'bg-white dark:bg-gray-800 shadow-md',
    glass: 'glass shadow-lg',
    emergency: 'bg-red-600 text-white shadow-xl',
  }
  return (
    <div
      className={twMerge(clsx('rounded-2xl p-5', variants[variant], className))}
      {...props}
    >
      {children}
    </div>
  )
}
