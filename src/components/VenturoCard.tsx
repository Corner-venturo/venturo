import { ReactNode } from 'react'

interface VenturoCardProps {
  children: ReactNode
  className?: string
  variant?: 'gradient' | 'solid'
}

export function VenturoCard({ 
  children, 
  className = '', 
  variant = 'solid' 
}: VenturoCardProps) {
  const baseClasses = "rounded-lg p-6 shadow-lg transition-transform duration-300 hover:scale-105"
  
  const variantClasses = variant === 'gradient' 
    ? "venturo-card text-white" 
    : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
  
  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </div>
  )
}