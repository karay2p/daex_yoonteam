'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAttendance, useMembers, useSchedules } from '@/hooks/useData'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, LoadingSpinner, Badge } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { CheckSquare, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function AttendancePage() {
  const { user } = useAuth()
  const { attendance, loading: attLoading, refetch } = useAttendance()
  const { members } = useMembers()
  const { schedules, loading: schLoading } = useSchedules()
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const selectedSchedule = schedules.find(s => s.id === selectedScheduleId)
  const scheduleAttendance = attendance.filter(a => a.schedule_id === selectedScheduleId)
  const checkedIds = scheduleAttendance.map(a => a.member_id)

  const handleToggleAttendance = async (memberId: string, currentlyChecked: boolean) => {
    if (!user || !selectedScheduleId) return
    setToggling(memberId)
    const supabase = createClient()

    if (currentlyChecked) {
      const existing = scheduleAttendance.find(a => a.member_id === memberId)
      if (existing) {
        await supabase.from('attendance').delete().eq('id', existing.id)
      }
    } else {
      await supabase.from('attendance').insert({
        member_id: memberId,
        schedule_id: selectedScheduleId,
        date: selectedSchedule?.start_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        checked_at: new Date().toISOString(),
      })
    }
    await refetch()
    setToggling(null)
  }

  const checkedCount = checkedIds.length
  const totalCount = members.length
  const rate = totalCount === 0 ? 0 : Math.round((checkedCount / totalCount) * 100)

  const now = new Date()
  const pastSchedules = schedules.filter(s => new Date(s.start_date) <= now)
  const upcomingSchedules = schedules.filter(s => new Date(s.start_date) > now)

  return (
    <DashboardLayout title="출석 체크">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy-900">출석 체크</h2>
        <p className="text-gray-500 text-sm mt-1">스케줄별 출석 현황</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          {selectedScheduleId && (
            <Card className="p-5">
              <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
                <CheckSquare size={16} className="text-brand-600" />
                출석 통계
              </h3>
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke="url(#grad)" strokeWidth="3"
                      strokeDasharray={`${rate} ${100 - rate}`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-navy-900">{rate}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{checkedCount}/{totalCount}명 출석</p>
              </div>
            </Card>
          )}

          <Card className="p-4">
            <h3 className="font-bold text-gray-700 text-sm mb-3">스케줄 선택</h3>
            {schLoading ? <LoadingSpinner /> : (
              <div className="space-y-4">
                {upcomingSchedules.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 font-semibold mb-2">예정된 일정</p>
                    <div className="space-y-1">
                      {upcomingSchedules.map(sch => (
                        <button
                          key={sch.id}
                          onClick={() => setSelectedScheduleId(sch.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                            selectedScheduleId === sch.id
                              ? 'bg-brand-600 text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <p className="font-semibold truncate">{sch.title}</p>
                          <p className={`text-xs mt-0.5 ${selectedScheduleId === sch.id ? 'text-white/70' : 'text-gray-400'}`}>
                            {formatDate(sch.start_date)} {sch.location && `· ${sch.location}`}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {pastSchedules.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 font-semibold mb-2">지난 일정</p>
                    <div className="space-y-1">
                      {pastSchedules.map(sch => (
                        <button
                          key={sch.id}
                          onClick={() => setSelectedScheduleId(sch.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                            selectedScheduleId === sch.id
                              ? 'bg-brand-600 text-white'
                              : 'hover:bg-gray-100 text-gray-600 opacity-70'
                          }`}
                        >
                          <p className="font-semibold truncate">{sch.title}</p>
                          <p className={`text-xs mt-0.5 ${selectedScheduleId === sch.id ? 'text-white/70' : 'text-gray-400'}`}>
                            {formatDate(sch.start_date)} {sch.location && `· ${sch.location}`}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2">
          {!selectedScheduleId ? (
            <Card className="flex items-center justify-center h-64">
              <div className="text-center">
                <CheckSquare size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">왼쪽에서 스케줄을 선택하세요</p>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-navy-900">{selectedSchedule?.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedSchedule && formatDate(selectedSchedule.start_date)}</p>
                </div>
                <Badge variant="info">{checkedCount}/{totalCount}명</Badge>
              </div>
              <div className="divide-y divide-gray-50">
                {attLoading ? <LoadingSpinner /> : members.map(member => {
                  const checked = checkedIds.includes(member.id)
                  const isToggling = toggling === member.id
                  return (
                    <div key={member.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/70 transition-colors">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        checked ? 'bg-brand-gradient text-white shadow-sm' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {member.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">{member.name}</p>
                        <p className="text-xs text-gray-400">{member.email}</p>
                      </div>
                      {user?.role === 'admin' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleAttendance(member.id, false)}
                            disabled={isToggling || checked}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              checked
                                ? 'bg-green-100 text-green-600 ring-2 ring-green-300 opacity-60 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600 cursor-pointer'
                            }`}
                          >
                            <Check size={12} className="inline mr-1" />출석
                          </button>
                          <button
                            onClick={() => handleToggleAttendance(member.id, true)}
                            disabled={isToggling || !checked}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              !checked
                                ? 'bg-red-100 text-red-400 ring-2 ring-red-200 opacity-60 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-400 cursor-pointer'
                            }`}
                          >
                            <X size={12} className="inline mr-1" />미출석
                          </button>
                        </div>
                      ) : (
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          checked ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-400'
                        }`}>
                          {checked ? '✅ 출석' : '❌ 미출석'}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
