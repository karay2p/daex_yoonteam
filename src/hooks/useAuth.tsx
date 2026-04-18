'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase'
import { Profile } from '@/types'

type AuthContextType = {
  user: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const loadUserProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) {
        console.error('프로필 로드 실패:', error)
        setUser(null)
        return
      }
      setUser(data)
    }

    const init = async () => {
      setLoading(true)
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('세션 가져오기 실패:', error)
        setUser(null)
        setLoading(false)
        return
      }
      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] 이벤트:', event)

        // ✅ 토큰 갱신 실패 시 - 데이터를 지우지 않고 에러만 로그
        if (event === 'TOKEN_REFRESH_FAILED') {
          console.error('[Auth] 토큰 갱신 실패 - 재로그인 필요')
          setLoading(false)
          return
        }

        // ✅ 로그아웃 시에만 user를 null로
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setLoading(false)
          return
        }

        // ✅ 로그인 또는 토큰 갱신 성공 시
        if (session?.user) {
          await loadUserProfile(session.user.id)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const supabase = createClient()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setLoading(false)
      return { error: error.message }
    }
    setLoading(false)
    return { error: null }
  }

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}