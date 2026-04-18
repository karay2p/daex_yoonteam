'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Notice, Schedule, Mission, Submission, Attendance } from '@/types'

type PublicProfile = {
  id: string
  name: string
  role: string
  avatar_url?: string | null
  created_at?: string
}

async function getPublicProfilesMap() {
  const supabase = createClient()
  const { data, error } = await supabase.from('public_profiles').select('*')
  if (error) {
    console.error('Failed to load public_profiles:', error)
    return new Map<string, PublicProfile>()
  }
  return new Map<string, PublicProfile>((data || []).map((p: any) => [p.id, p]))
}

// ✅ 세션 확인 헬퍼 - 세션 없으면 fetch 시도 안 함
async function checkSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export function useNotices() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotices = useCallback(async () => {
    // ✅ 세션 없으면 fetch 안 함 (데이터 0으로 초기화 방지)
    const session = await checkSession()
    if (!session) {
      setLoading(false)
      return
    }

    setLoading(true)
    const supabase = createClient()

    const [{ data: noticesData, error: noticesError }, profilesMap] = await Promise.all([
      supabase.from('notices').select('*').order('created_at', { ascending: false }),
      getPublicProfilesMap(),
    ])

    if (noticesError) {
      console.error('Failed to load notices:', noticesError)
      setError(noticesError.message)
      // ✅ 에러 시 기존 데이터 유지 (빈 배열로 덮어쓰지 않음)
      setLoading(false)
      return
    }

    const mapped = (noticesData || []).map((n: any) => ({
      ...n,
      author_name: profilesMap.get(n.author_id)?.name || null,
    }))

    setNotices(mapped)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchNotices()
  }, [fetchNotices])

  return { notices, loading, error, refetch: fetchNotices }
}

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSchedules = useCallback(async () => {
    const session = await checkSession()
    if (!session) {
      setLoading(false)
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Failed to load schedules:', error)
      setError(error.message)
      setLoading(false)
      return
    }

    setSchedules(data || [])
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  return { schedules, loading, error, refetch: fetchSchedules }
}

export function useMissions() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMissions = useCallback(async () => {
    const session = await checkSession()
    if (!session) {
      setLoading(false)
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load missions:', error)
      setError(error.message)
      setLoading(false)
      return
    }

    setMissions(data || [])
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchMissions()
  }, [fetchMissions])

  return { missions, loading, error, refetch: fetchMissions }
}

export function useSubmissions(missionId?: string, memberId?: string) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubmissions = useCallback(async () => {
    const session = await checkSession()
    if (!session) {
      setLoading(false)
      return
    }

    setLoading(true)
    const supabase = createClient()

    let query = supabase.from('submissions').select('*')
    if (missionId) query = query.eq('mission_id', missionId)
    if (memberId) query = query.eq('member_id', memberId)

    const [{ data: submissionsData, error: submissionsError }, profilesMap, missionsRes] = await Promise.all([
      query.order('submitted_at', { ascending: false }),
      getPublicProfilesMap(),
      supabase.from('missions').select('id, title'),
    ])

    if (submissionsError) {
      console.error('Failed to load submissions:', submissionsError)
      setError(submissionsError.message)
      setLoading(false)
      return
    }

    const missionMap = new Map<string, string>((missionsRes.data || []).map((m: any) => [m.id, m.title]))

    const mapped = (submissionsData || []).map((s: any) => ({
      ...s,
      member_name: profilesMap.get(s.member_id)?.name || null,
      mission_title: missionMap.get(s.mission_id) || null,
    }))

    setSubmissions(mapped)
    setError(null)
    setLoading(false)
  }, [missionId, memberId])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  return { submissions, loading, error, refetch: fetchSubmissions }
}

export function useAttendance(date?: string) {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAttendance = useCallback(async () => {
    const session = await checkSession()
    if (!session) {
      setLoading(false)
      return
    }

    setLoading(true)
    const supabase = createClient()

    let query = supabase.from('attendance').select('*')
    if (date) query = query.eq('date', date)

    const [{ data, error }, profilesMap] = await Promise.all([
      query.order('checked_at', { ascending: false }),
      getPublicProfilesMap(),
    ])

    if (error) {
      console.error('Failed to load attendance:', error)
      setError(error.message)
      setLoading(false)
      return
    }

    const mapped = (data || []).map((a: any) => ({
      ...a,
      member_name: profilesMap.get(a.member_id)?.name || null,
    }))

    setAttendance(mapped)
    setError(null)
    setLoading(false)
  }, [date])

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  return { attendance, loading, error, refetch: fetchAttendance }
}

export function useMembers() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      const session = await checkSession()
      if (!session) {
        setLoading(false)
        return
      }

      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('public_profiles')
        .select('*')
        .order('role')

      if (error) {
        console.error('Failed to load members:', error)
        setError(error.message)
        setLoading(false)
        return
      }

      setMembers(data || [])
      setError(null)
      setLoading(false)
    }

    run()
  }, [])

  return { members, loading, error }
}