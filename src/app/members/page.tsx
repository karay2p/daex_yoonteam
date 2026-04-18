'use client'

import { useAuth } from '@/hooks/useAuth'
import { useMembers, useSubmissions, useAttendance } from '@/hooks/useData'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, Badge, LoadingSpinner } from '@/components/ui'
import { getRoleLabel } from '@/lib/utils'
import { Target, CheckSquare, Eye } from 'lucide-react'

const TOTAL_MISSIONS = 3

export default function MembersPage() {
  const { user } = useAuth()
  const { members, loading } = useMembers()
  const { submissions } = useSubmissions()
  const { attendance } = useAttendance()

  const teamMembers = members.filter((m) => m.role === 'member')
  const admins = members.filter((m) => m.role === 'admin')
  const observers = members.filter((m) => m.role === 'observer')

  const getMemberStats = (memberId: string) => {
    const memberSubs = submissions.filter((s) => s.member_id === memberId)
    const memberAtt = attendance.filter((a) => a.member_id === memberId)
    return { submissionCount: memberSubs.length, attendanceCount: memberAtt.length }
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-brand-600 text-white',
    member: 'bg-navy-600 text-white',
    observer: 'bg-gray-500 text-white',
  }

  const MemberCard = ({ member }: { member: any }) => {
    const stats = getMemberStats(member.id)
    const isMe = user?.id === member.id

    return (
      <Card className={`p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${isMe ? 'border-brand-200 ring-1 ring-brand-200' : ''}`}>
        <div className="flex items-start gap-3 mb-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center text-white font-bold text-lg shadow-md shadow-brand-200/50 flex-shrink-0">
              {member.name[0]}
            </div>
            {isMe && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-navy-900">{member.name}</h3>
              {isMe && <Badge variant="info">나</Badge>}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[member.role]}`}>
              {getRoleLabel(member.role)}
            </span>
          </div>
        </div>

        {member.role === 'member' && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckSquare size={13} className="text-emerald-500" />
                <span className="text-xs text-gray-500">출석</span>
              </div>
              <p className="font-bold text-navy-900 text-lg">{stats.attendanceCount}</p>
              <p className="text-xs text-gray-400">회</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target size={13} className="text-brand-500" />
                <span className="text-xs text-gray-500">미션</span>
              </div>
              <p className="font-bold text-navy-900 text-lg">{stats.submissionCount}</p>
              <p className="text-xs text-gray-400">/{TOTAL_MISSIONS}개</p>
            </div>
          </div>
        )}

        {member.role !== 'member' && (
          <div className="pt-3 border-t border-gray-100 text-center text-xs text-gray-400">
            {member.role === 'admin' ? '관리자 권한' : '읽기 전용'}
          </div>
        )}
      </Card>
    )
  }

  return (
    <DashboardLayout title="팀원 현황">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy-900">팀원 현황</h2>
        <p className="text-gray-500 text-sm mt-1">전체 {members.length}명</p>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500" />
              관리자
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {admins.map((m) => <MemberCard key={m.id} member={m} />)}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-navy-500" />
              팀원 ({teamMembers.length}명)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {teamMembers.map((m) => <MemberCard key={m.id} member={m} />)}
            </div>
          </div>

          {observers.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Eye size={13} className="text-gray-400" />
                옵저버
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {observers.map((m) => <MemberCard key={m.id} member={m} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
