'use client'

import { useAuth } from '@/hooks/useAuth'
import { useNotices, useMissions, useSubmissions, useAttendance, useMembers } from '@/hooks/useData'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, StatCard, AccessDenied, Badge } from '@/components/ui'
import { formatDateTime, getMissionStatusLabel } from '@/lib/utils'
import { Settings, Users, Target, CheckSquare, Bell, TrendingUp, Upload } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  const { user } = useAuth()
  const { missions } = useMissions()
  const { submissions } = useSubmissions()
  const { attendance } = useAttendance()
  const { members } = useMembers()

  if (user && user.role !== 'admin') return (
    <DashboardLayout title="관리자">
      <AccessDenied />
    </DashboardLayout>
  )

  const teamMembers = members.filter(m => m.role === 'member')
  const today = new Date().toISOString().split('T')[0]
  const todayAtt = attendance.filter(a => a.date === today)

  const memberStats = teamMembers.map(m => {
    const subs = submissions.filter(s => s.member_id === m.id)
    const att = attendance.filter(a => a.member_id === m.id)
    return { ...m, submissionCount: subs.length, attendanceCount: att.length }
  }).sort((a, b) => b.submissionCount - a.submissionCount)

  return (
    <DashboardLayout title="관리자">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-md shadow-brand-200">
          <Settings size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-navy-900">관리자 대시보드</h2>
          <p className="text-gray-500 text-sm">전체 팀 현황을 관리합니다</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="전체 팀원" value={teamMembers.length} icon={Users} color="brand" />
        <StatCard title="오늘 출석" value={`${todayAtt.length}/${teamMembers.length}`} icon={CheckSquare} color="green" />
        <StatCard title="전체 미션" value={missions.length} icon={Target} color="blue" />
        <StatCard title="전체 인증 수" value={submissions.length} icon={Upload} color="amber" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { href: '/notices', label: '공지 관리', icon: Bell, color: 'text-brand-600 bg-brand-50' },
          { href: '/schedule', label: '일정 관리', icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
          { href: '/missions', label: '미션 관리', icon: Target, color: 'text-amber-600 bg-amber-50' },
          { href: '/attendance', label: '출석 현황', icon: CheckSquare, color: 'text-emerald-600 bg-emerald-50' },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-2 p-5 bg-white rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
              <item.icon size={22} />
            </div>
            <span className="text-sm font-semibold text-gray-700">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Users size={16} className="text-brand-600" />
            <h3 className="font-bold text-navy-900">팀원 활동 현황</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">이름</th>
                  <th className="px-3 py-3 text-center">출석</th>
                  <th className="px-3 py-3 text-center">미션</th>
                  <th className="px-3 py-3 text-center">활동도</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {memberStats.map(m => {
                  const activity = Math.min(100, Math.round(((m.submissionCount / 3) * 0.6 + (m.attendanceCount / 10) * 0.4) * 100))
                  return (
                    <tr key={m.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {m.name[0]}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-sm font-semibold text-gray-700">{m.attendanceCount}</span>
                        <span className="text-xs text-gray-400">회</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-sm font-semibold text-brand-700">{m.submissionCount}</span>
                        <span className="text-xs text-gray-400">/3</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-gradient rounded-full" style={{ width: `${activity}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 w-8">{activity}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Target size={16} className="text-brand-600" />
            <h3 className="font-bold text-navy-900">미션 상태</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {missions.map(mission => {
              const mSubs = submissions.filter(s => s.mission_id === mission.id)
              const statusBadge: Record<string, 'warning' | 'info' | 'success'> = {
                active: 'warning', upcoming: 'info', completed: 'success'
              }
              return (
                <div key={mission.id} className="px-6 py-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-sm font-semibold text-gray-800 flex-1 truncate">{mission.title}</p>
                    <Badge variant={statusBadge[mission.status] || 'default'}>
                      {getMissionStatusLabel(mission.status)}
                    </Badge>
                  </div>
                  {mission.status !== 'upcoming' && (
                    <>
                      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                        <span>제출 현황</span>
                        <span className="font-semibold text-brand-600">{mSubs.length}/{teamMembers.length}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-gradient rounded-full" style={{ width: `${(mSubs.length / teamMembers.length) * 100}%` }} />
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Upload size={16} className="text-brand-600" />
            <h3 className="font-bold text-navy-900">최근 인증 제출</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {submissions.slice(0, 5).map(sub => (
              <div key={sub.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/70 transition-colors">
                <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {sub.member_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800 text-sm">{sub.member_name}</span>
                    <span className="text-gray-300 text-xs">·</span>
                    <span className="text-brand-600 text-xs font-medium truncate">{sub.mission_title}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{sub.content}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{formatDateTime(sub.submitted_at)}</p>
                </div>
                <Badge variant="success">완료</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
