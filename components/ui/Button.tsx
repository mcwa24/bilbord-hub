import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    const variants = {
      primary: 'bg-[#f9c344] hover:bg-[#f0b830] text-[#1d1d1f]',
      secondary: 'bg-[#1d1d1f] hover:bg-[#000] text-white',
      outline: 'border border-[#1d1d1f] hover:bg-[#1d1d1f] hover:text-white text-[#1d1d1f]',
    }

    return (
      <button
        ref={ref}
        className={cn(
          'px-10 py-5 rounded-full text-lg font-medium transition',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button

