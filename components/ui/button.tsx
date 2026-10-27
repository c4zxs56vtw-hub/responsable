import * as React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'bg-[#173b3f] text-white shadow-xs hover:bg-[#24575a]',
  destructive: 'bg-[#b42332] text-white shadow-xs hover:bg-[#961d2a]',
  outline: 'border border-[#cbd8ce] bg-transparent text-[#173b3f] shadow-xs hover:bg-[#eef1ec]',
  secondary: 'bg-[#e5e9e3] text-[#173b3f] shadow-xs hover:bg-[#d8ded5]',
  ghost: 'text-[#173b3f] hover:bg-[#e8ebe6]',
  link: 'text-[#173b3f] underline-offset-4 hover:underline',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 rounded-md px-3 text-xs',
  lg: 'h-10 rounded-md px-8',
  icon: 'size-9',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', type = 'button', ...props }, ref) => {
    const baseClasses =
      'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173b3f] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'

    return (
      <button
        ref={ref}
        type={type}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
