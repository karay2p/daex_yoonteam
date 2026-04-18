'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { cn, getRoleLabel } from '@/lib/utils'
import {
  LayoutDashboard, Bell, Calendar, Target, CheckSquare, Users,
  Settings, LogOut, ChevronRight, Shield, Upload, LogIn
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: '대시보드' },
  { href: '/notices', icon: Bell, label: '공지사항' },
  { href: '/schedule', icon: Calendar, label: '스케줄' },
  { href: '/missions', icon: Target, label: '미션' },
  { href: '/submissions', icon: Upload, label: '미션 인증' },
  { href: '/attendance', icon: CheckSquare, label: '출석 체크' },
  { href: '/members', icon: Users, label: '팀원 현황' },
]

const adminItems = [
  { href: '/admin', icon: Settings, label: '관리자' },
]

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const roleColors: Record<string, string> = {
    admin: 'bg-brand-600 text-white',
    member: 'bg-navy-600 text-white',
    observer: 'bg-gray-600 text-white',
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <aside className={cn(
        'fixed top-0 left-0 z-30 h-full w-64 flex flex-col',
        'bg-navy-900 border-r border-white/5',
        'transform transition-transform duration-300 ease-in-out',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-brand-900/50">
            <span className="text-white font-bold text-sm">DX</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">D.A.E.X. Club</p>
            <p className="text-white/40 text-xs">박윤영팀</p>
          </div>
        </div>

        {/* User Info */}
        {user ? (
          <div className="px-4 py-4 mx-3 mt-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {user.name?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{user.name}</p>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  roleColors[user.role] || 'bg-gray-600 text-white'
                )}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-4 mx-3 mt-4 rounded-xl bg-white/5 border border-white/10">
            <Link href="/login" onClick={onClose} className="flex items-center gap-3 text-white/60 hover:text-white transition-colors">
              <LogIn size={18} />
              <span className="text-sm font-medium">로그인하기</span>
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                      isActive
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/40'
                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <item.icon size={18} className={cn(
                      'transition-transform group-hover:scale-110',
                      isActive ? 'text-white' : 'text-white/50'
                    )} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight size={14} className="text-white/60" />}
                  </Link>
                </li>
              )
            })}
            {user?.role === 'admin' && adminItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                      isActive
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/40'
                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <item.icon size={18} className={cn(
                      'transition-transform group-hover:scale-110',
                      isActive ? 'text-white' : 'text-white/50'
                    )} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight size={14} className="text-white/60" />}
                    <Shield size={12} className="text-brand-300" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Sign Out */}
        {user && (
          <div className="p-3 border-t border-white/10">
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:bg-red-900/30 hover:text-red-400 transition-all duration-200 group"
            >
              <LogOut size={18} className="transition-transform group-hover:scale-110" />
              <span>로그아웃</span>
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
