'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function RootPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      router.replace('/dashboard')
    }
  }, [loading, router])

  useEffect(() => {
    // 3초 후에도 로딩 중이면 강제로 대시보드로 이동
    const timer = setTimeout(() => {
      router.replace('/dashboard')
    }, 3000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-2xl">
          <span className="text-white font-bold text-lg">DX</span>
        </div>
        <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )
}
