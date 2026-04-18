'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useMissions, useSubmissions, useMembers } from '@/hooks/useData'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, Badge, Button, Modal, Input, Textarea, LoadingSpinner, EmptyState } from '@/components/ui'
import { formatDate, getMissionStatusLabel } from '@/lib/utils'
import { Target, Plus, Pencil, Trash2, Clock, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase'

const TOTAL_MEMBERS = 10

export default function MissionsPage() {
  const { user } = useAuth()
  const { missions, loading, refetch } = useMissions()
  const { submissions, refetch: refetchSubmissions } = useSubmissions()
  const { members } = useMembers()
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedMission, setSelectedMission] = useState<any>(null)
  const [editing, setEditing] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [status, setStatus] = useState<'upcoming' | 'active' | 'completed'>('active')
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active' | 'completed'>('all')
  const [toggling, setToggling] = useState<string | null>(null)

  const openCreate = () => {
    setEditing(null); setTitle(''); setDescription(''); setDeadline(''); setStatus('active')
    setShowModal(true)
  }

  const openEdit = (m: any) => {
    setEditing(m); setTitle(m.title); setDescription(m.description)
    setDeadline(m.deadline.split('T')[0]); setStatus(m.status)
    setShowModal(true)
  }

  const openDetail = (m: any) => {
    setSelectedMission(m)
    setShowDetailModal(true)
  }

  const handleSave = async () => {
    if (!title.trim() || !deadline) return
    setSaving(true)
    const supabase = createClient()
    const payload = { title, description, deadline: new Date(deadline).toISOString(), status, author_id: user?.id }
    if (editing) await supabase.from('missions').update(payload).eq('id', editing.id)
    else await supabase.from('missions').insert(payload)
    refetch()
    setSaving(false)
    setShowModal(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('미션을 삭제하시겠습니까?')) return
    const supabase = createClient()
    await supabase.from('missions').delete().eq('id', id)
    refetch()
  }

  const handleToggleSubmission = async (missionId: string, memberId: string) => {
    setToggling(memberId)
    const supabase = createClient()
    const existing = submissions.find(s => s.mission_id === missionId && s.member_id === memberId)
    if (existing) {
      await supabase.from('submissions').delete().eq('id', existing.id)
    } else {
      await supabase.from('submissions').insert({
        mission_id: missionId,
        member_id: memberId,
        content: '제출 완료',
        submitted_at: new Date().toISOString()
      })
    }
    await refetchSubmissions()
    setToggling(null)
  }

  const statusVariant: Record<string, 'warning' | 'info' | 'success'> = {
    active: 'warning', upcoming: 'info', completed: 'success'
  }

  const filtered = filter === 'all' ? missions : missions.filter(m => m.status === filter)

  return (
    <DashboardLayout title="미션">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">미션 관리</h2>
          <p className="text-gray-500 text-sm mt-1">총 {missions.length}개 미션</p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={openCreate}><Plus size={16} /> 미션 추가</Button>
        )}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'active', 'upcoming', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === f ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:border-brand-300'
            }`}
          >
            {f === 'all' ? '전체' : getMissionStatusLabel(f)}
            <span className="ml-1.5 text-xs opacity-70">
              ({f === 'all' ? missions.length : missions.filter(m => m.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon={Target} title="미션이 없습니다" description="새 미션을 추가해 보세요." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(mission => {
            const missionSubs = submissions.filter(s => s.mission_id === mission.id)
            const daysLeft = Math.ceil((new Date(mission.deadline).getTime() - Date.now()) / (1000*60*60*24))

            return (
              <Card key={mission.id} className="p-5 flex flex-col hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <Target size={20} className="text-brand-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant[mission.status] || 'default'}>
                      {getMissionStatusLabel(mission.status)}
                    </Badge>
                    {user?.role === 'admin' && (
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(mission)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-300 hover:text-brand-500 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(mission.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-navy-900 mb-2">{mission.title}</h3>
                <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-3">{mission.description}</p>

                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-brand-400" />
                      <span>마감 {formatDate(mission.deadline)}</span>
                    </div>
                    {daysLeft > 0 ? (
                      <span className={`font-semibold ${daysLeft <= 3 ? 'text-red-500' : 'text-gray-400'}`}>D-{daysLeft}</span>
                    ) : mission.status !== 'completed' ? (
                      <span className="text-red-500 font-semibold">마감됨</span>
                    ) : null}
                  </div>

                  {mission.status !== 'upcoming' && (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Users size={11} />
                          <span>제출 현황</span>
                        </div>
                        <span className="text-brand-600 font-semibold">{missionSubs.length}/{TOTAL_MEMBERS}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-gradient rounded-full transition-all" style={{ width: `${(missionSubs.length / TOTAL_MEMBERS) * 100}%` }} />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => openDetail(mission)}
                    className="w-full py-2 rounded-xl bg-gray-50 hover:bg-brand-50 text-gray-500 hover:text-brand-600 text-xs font-semibold transition-all border border-gray-100 hover:border-brand-200"
                  >
                    팀원별 제출 현황 보기
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)} title={`${selectedMission?.title} - 제출 현황`}>
        <div className="space-y-2">
          {members.map(member => {
            const submitted = submissions.some(s => s.mission_id === selectedMission?.id && s.member_id === member.id)
            const isToggling = toggling === member.id
            return (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm">
                    {member.name?.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-800 text-sm">{member.name}</span>
                </div>
                {user?.role === 'admin' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => !submitted && handleToggleSubmission(selectedMission?.id, member.id)}
                      disabled={isToggling}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        submitted ? 'bg-green-100 text-green-600 ring-2 ring-green-300' : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-600'
                      }`}
                    >
                      ✅ 제출
                    </button>
                    <button
                      onClick={() => submitted && handleToggleSubmission(selectedMission?.id, member.id)}
                      disabled={isToggling}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        !submitted ? 'bg-red-100 text-red-400 ring-2 ring-red-200' : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-400'
                      }`}
                    >
                      ❌ 미제출
                    </button>
                  </div>
                ) : (
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${submitted ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-400'}`}>
                    {submitted ? '✅ 제출' : '❌ 미제출'}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </Modal>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? '미션 수정' : '미션 추가'}>
        <div className="space-y-4">
          <Input label="미션 제목" value={title} onChange={setTitle} required placeholder="미션 제목 입력" />
          <Textarea label="미션 설명" value={description} onChange={setDescription} rows={4} placeholder="미션 내용 설명" required />
          <Input label="마감일" value={deadline} onChange={setDeadline} type="date" required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">상태</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <option value="upcoming">예정</option>
              <option value="active">진행중</option>
              <option value="completed">완료</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={() => setShowModal(false)} variant="secondary" className="flex-1">취소</Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1">{saving ? '저장 중...' : '저장'}</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
