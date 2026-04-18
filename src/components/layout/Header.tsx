'use client'

import { useState } from 'react'
import { Menu, Bell, Search, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface HeaderProps {
  onMenuToggle: () => void
  title?: string
}

export function Header({ onMenuToggle, title }: HeaderProps) {
  const { user } = useAuth()
  const [showNotif, setShowNotif] = useState(false)

  const notifications = [
    { id: 1, text: '새 공지사항이 등록되었습니다.', time: '5분 전', unread: true },
    { id: 2, text: '미션 마감이 이틀 후입니다.', time: '1시간 전', unread: true },
    { id: 3, text: '김아람님이 미션을 제출했습니다.', time: '3시간 전', unread: false },
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="sticky top-0 z-10 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center px-4 md:px-6 gap-4">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Menu size={20} className="text-gray-600" />
      </button>

      {/* Title */}
      {title && (
        <h1 className="text-lg font-bold text-navy-900 hidden md:block">{title}</h1>
      )}

      {/* Brand (mobile) */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center">
          <span className="text-white font-bold text-xs">DX</span>
        </div>
        <span className="font-bold text-navy-900 text-sm">D.A.E.X. Club</span>
      </div>

      <div className="flex-1" />

      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setShowNotif(!showNotif)}
          className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Bell size={20} className="text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        {showNotif && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setShowNotif(false)} />
            <div className="absolute right-0 top-12 z-30 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="font-bold text-navy-900 text-sm">알림</h3>
                <button onClick={() => setShowNotif(false)}>
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {notifications.map(n => (
                  <div key={n.id} className={`px-4 py-3 flex gap-3 hover:bg-gray-50 transition-colors ${n.unread ? 'bg-brand-50/50' : ''}`}>
                    {n.unread && (
                      <div className="w-2 h-2 rounded-full bg-brand-600 mt-1.5 flex-shrink-0" />
                    )}
                    {!n.unread && <div className="w-2 flex-shrink-0" />}
                    <div>
                      <p className="text-sm text-gray-800 font-medium">{n.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 text-center border-t border-gray-100">
                <button className="text-xs text-brand-600 font-medium hover:underline">모두 읽음으로 표시</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User Avatar */}
      {user && (
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-sm shadow-md shadow-brand-200">
            {user.name?.[0] || '?'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-navy-900 leading-tight">{user.name}</p>
          </div>
        </div>
      )}
    </header>
  )
}
