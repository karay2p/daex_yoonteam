export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNotices, useSchedules, useMissions, useAttendance, useMembers, useSubmissions } from '@/hooks/useData'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard, Card, Badge, ProgressBar } from '@/components/ui'
import { formatDate, formatDateShort, getMissionStatusLabel } from '@/lib/utils'
import { Users, CheckSquare, Target, Bell, Calendar, Upload, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const { notices } = useNotices()
  const { schedules } = useSchedules()
  const { missions } = useMissions()
  const { attendance } = useAttendance(today)
  const { members } = useMembers()
  const { submissions } = useSubmissions()

  const totalMembers = members.filter(m => m.role === 'member').length
  const activeMissions = missions.filter(m => m.status === 'active').length
  const recentNotices = notices.slice(0, 3)
  const upcomingSchedules = schedules.filter(s => new Date(s.start_date) >= new Date()).slice(0, 3)
  const memberCount = members.filter(m => m.role === 'member').length

  if (!mounted) return null

  return (
    <DashboardLayout title="대시보드">
      <div className="relative mb-6 rounded-2xl overflow-hidden bg-brand-gradient p-6 md:p-8 text-white shadow-lg shadow-brand-200/40">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="relative z-10">
          <p className="text-brand-200 text-sm font-medium mb-1">
            {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-2">
            {user ? `안녕하세요, ${user?.name ?? ''}님! 👋` : 'D.A.E.X. Club 박윤영팀에 오신 것을 환영합니다 👋'}
          </h2>
          <p className="text-brand-200 text-sm">연결되고 실행되는 D.A.E.X. Club 박윤영팀</p>
          {!user && (
            <Link href="/login" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all">
              로그인하기 <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="전체 팀원" value={totalMembers} subtitle="활동 중인 팀원" icon={Users} color="brand" />
        <StatCard title="오늘 출석" value={`${attendance.length}/${totalMembers}`} subtitle="출석 완료" icon={CheckSquare} color="green" />
        <StatCard title="진행중 미션" value={activeMissions} subtitle="현재 진행 중" icon={Target} color="blue" />
        <StatCard title="미션 제출" value={submissions.length} subtitle="전체 제출 수" icon={Upload} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-brand-600" />
                <h3 className="font-bold text-navy-900">최근 공지사항</h3>
              </div>
              <Link href="/notices" className="text-xs text-brand-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                전체보기 <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentNotices.length === 0 ? (
                <p className="text-center py-8 text-gray-400 text-sm">공지사항이 없습니다</p>
              ) : recentNotices.map(notice => (
                <Link key={notice.id} href="/notices" className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/70 transition-colors group">
                  <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {notice.is_pinned ? <span className="text-sm">📌</span> : <Bell size={14} className="text-brand-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-brand-700 transition-colors">{notice.title}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{notice.content}</p>
                    <p className="text-xs text-gray-300 mt-1">{formatDate(notice.created_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-brand-600" />
                <h3 className="font-bold text-navy-900">미션 현황</h3>
              </div>
              <Link href="/missions" className="text-xs text-brand-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                전체보기 <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {missions.length === 0 ? (
                <p className="text-center py-8 text-gray-400 text-sm">미션이 없습니다</p>
              ) : missions.map(mission => {
                const missionSubs = submissions.filter(s => s.mission_id === mission.id)
                const statusColors: Record<string, 'success' | 'warning' | 'info'> = { active: 'warning', upcoming: 'info', completed: 'success' }
                return (
                  <div key={mission.id} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 mb-0.5">{mission.title}</p>
                        <p className="text-xs text-gray-400">마감: {formatDate(mission.deadline)}</p>
                      </div>
                      <Badge variant={statusColors[mission.status] || 'default'}>{getMissionStatusLabel(mission.status)}</Badge>
                    </div>
                    {mission.status !== 'upcoming' && memberCount > 0 && (
                      <ProgressBar value={missionSubs.length} max={memberCount} />
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-brand-600" />
                <h3 className="font-bold text-navy-900">다가오는 일정</h3>
              </div>
              <Link href="/schedule" className="text-xs text-brand-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                전체 <ArrowRight size={12} />
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {upcomingSchedules.length === 0 ? (
                <p className="text-center py-6 text-gray-400 text-sm">예정된 일정이 없습니다</p>
              ) : upcomingSchedules.map((sch, i) => {
                const colors = ['bg-brand-500', 'bg-blue-500', 'bg-emerald-500']
                return (
                  <div key={sch.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`w-1.5 h-12 rounded-full ${colors[i % colors.length]} flex-shrink-0 mt-0.5`} />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{sch.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDateShort(sch.start_date)}</p>
                      {sch.location && <p className="text-xs text-gray-400">📍 {sch.location}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CheckSquare size={18} className="text-brand-600" />
                <h3 className="font-bold text-navy-900">오늘 출석</h3>
              </div>
              <Link href="/attendance" className="text-xs text-brand-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                전체 <ArrowRight size={12} />
              </Link>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl font-bold text-navy-900">{attendance.length}</span>
                <span className="text-gray-400 text-sm">/ {totalMembers}명</span>
              </div>
              <ProgressBar value={attendance.length} max={totalMembers} />
              <div className="mt-4 flex flex-wrap gap-2">
                {members.filter(m => m.role === 'member').map(member => {
                  const checked = attendance.some(a => a.member_id === member.id)
                  return (
                    <div key={member.id} title={member.name}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        checked ? 'bg-brand-gradient text-white border-brand-300 shadow-sm shadow-brand-200' : 'bg-gray-100 text-gray-400 border-gray-200'
                      }`}>
                      {member.name[0]}
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>

          {user && (user.role === 'member' || user.role === 'admin') && (
            <Card className="p-4">
              <h3 className="font-bold text-navy-900 text-sm mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-brand-600" />빠른 실행
              </h3>
              <div className="space-y-2">
                <Link href="/attendance" className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors group">
                  <CheckSquare size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-700">출석 체크하기</span>
                  <ArrowRight size={14} className="text-green-400 ml-auto group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/submissions" className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 hover:bg-brand-100 transition-colors group">
                  <Upload size={16} className="text-brand-600" />
                  <span className="text-sm font-medium text-brand-700">미션 인증하기</span>
                  <ArrowRight size={14} className="text-brand-400 ml-auto group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}