import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

// Card
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-100/50', className)}>
      {children}
    </div>
  )
}

// Stat Card
export function StatCard({
  title, value, subtitle, icon: Icon, color = 'brand'
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: any
  color?: 'brand' | 'green' | 'blue' | 'amber'
}) {
  const colors = {
    brand: { bg: 'bg-brand-50', icon: 'text-brand-600', border: 'border-brand-100', val: 'text-brand-900' },
    green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100', val: 'text-emerald-900' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100', val: 'text-blue-900' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100', val: 'text-amber-900' },
  }
  const c = colors[color]

  return (
    <Card className={cn('p-5 border', c.border)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={cn('text-3xl font-bold mt-1', c.val)}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', c.bg)}>
          <Icon size={22} className={c.icon} />
        </div>
      </div>
    </Card>
  )
}

// Badge
export function Badge({
  children, variant = 'default'
}: {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    outline: 'border border-gray-300 text-gray-600',
  }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', variants[variant])}>
      {children}
    </span>
  )
}

// Button
export function Button({
  children, onClick, variant = 'primary', size = 'md', disabled, className, type = 'button'
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit'
}) {
  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-200',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200',
    ghost: 'hover:bg-gray-100 text-gray-600',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  )
}

// Loading Spinner
export function LoadingSpinner({ text = '불러오는 중...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 size={32} className="animate-spin text-brand-500" />
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  )
}

// Empty State
export function EmptyState({
  icon: Icon, title, description, action
}: {
  icon: any
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Icon size={32} className="text-gray-300" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-500">{title}</h3>
        {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  )
}

// Access Denied
export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center">
        <span className="text-4xl">🔒</span>
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-700">접근 권한이 없습니다</h3>
        <p className="text-sm text-gray-400 mt-1">이 페이지는 권한이 있는 사용자만 접근할 수 있습니다.</p>
      </div>
    </div>
  )
}

// Input
export function Input({
  label, value, onChange, placeholder, type = 'text', required, className
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
      />
    </div>
  )
}

// Textarea
export function Textarea({
  label, value, onChange, placeholder, rows = 4, required
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all resize-none"
      />
    </div>
  )
}

// Progress Bar
export function ProgressBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100)
  return (
    <div className={cn('w-full', className)}>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-gradient rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">{value}/{max} ({pct}%)</p>
    </div>
  )
}

// Modal
export function Modal({
  open, onClose, title, children
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-navy-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
          >✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
