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

export function useNotices() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotices = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const [{ data, error }, profilesMap] = await Promise.all([
      supabase.from('notices').select('*').order('created_at', { ascending: false }),
      getPublicProfilesMap(),
    ])
    if (error) {
      console.error('Failed to load notices:', error)
      setLoading(false)
      return
    }
    setNotices((data || []).map((n: any) => ({
      ...n,
      author_name: profilesMap.get(n.author_id)?.name || null,
    })))
    setLoading(false)
  }, [])

  useEffect(() => { fetchNotices() }, [fetchNotices])
  return { notices, loading, refetch: fetchNotices }
}

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSchedules = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('schedules').select('*').order('start_date', { ascending: true })
    if (error) {
      console.error('Failed to load schedules:', error)
      setLoading(false)
      return
    }
    setSchedules(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchSchedules() }, [fetchSchedules])
  return { schedules, loading, refetch: fetchSchedules }
}

export function useMissions() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMissions = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('missions').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error('Failed to load missions:', error)
      setLoading(false)
      return
    }
    setMissions(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchMissions() }, [fetchMissions])
  return { missions, loading, refetch: fetchMissions }
}

export function useSubmissions(missionId?: string, memberId?: string) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase.from('submissions').select('*')
    if (missionId) query = query.eq('mission_id', missionId)
    if (memberId) query = query.eq('member_id', memberId)

    const [{ data, error }, profilesMap, missionsRes] = await Promise.all([
      query.order('submitted_at', { ascending: false }),
      getPublicProfilesMap(),
      supabase.from('missions').select('id, title'),
    ])

    if (error) {
      console.error('Failed to load submissions:', error)
      setLoading(false)
      return
    }

    const missionMap = new Map<string, string>(
      (missionsRes.data || []).map((m: any) => [m.id, m.title])
    )
    setSubmissions((data || []).map((s: any) => ({
      ...s,
      member_name: profilesMap.get(s.member_id)?.name || null,
      mission_title: missionMap.get(s.mission_id) || null,
    })))
    setLoading(false)
  }, [missionId, memberId])

  useEffect(() => { fetchSubmissions() }, [fetchSubmissions])
  return { submissions, loading, refetch: fetchSubmissions }
}

export function useAttendance(date?: string) {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAttendance = useCallback(async () => {
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
      setLoading(false)
      return
    }

    setAttendance((data || []).map((a: any) => ({
      ...a,
      member_name: profilesMap.get(a.member_id)?.name || null,
    })))
    setLoading(false)
  }, [date])

  useEffect(() => { fetchAttendance() }, [fetchAttendance])
  return { attendance, loading, refetch: fetchAttendance }
}

export function useMembers() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('public_profiles').select('*').order('role')
      if (error) {
        console.error('Failed to load members:', error)
        setLoading(false)
        return
      }
      setMembers(data || [])
      setLoading(false)
    }
    run()
  }, [])

  return { members, loading }
}