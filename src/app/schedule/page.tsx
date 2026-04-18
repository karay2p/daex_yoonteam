'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSchedules } from '@/hooks/useData'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, Button, Modal, Input, Textarea, LoadingSpinner, EmptyState, Badge } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { Calendar, Plus, MapPin, Clock, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function SchedulePage() {
  const { user } = useAuth()
  const { schedules, loading, refetch } = useSchedules()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [location, setLocation] = useState('')
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditing(null); setTitle(''); setDescription(''); setStartDate(''); setLocation('')
    setShowModal(true)
  }

  const openEdit = (s: any) => {
    setEditing(s)
    setTitle(s.title)
    setDescription(s.description || '')
    setStartDate(s.start_date.split('T')[0])
    setLocation(s.location || '')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!title.trim() || !startDate) return
    setSaving(true)
    const supabase = createClient()
    const payload = { title, description, start_date: new Date(startDate).toISOString(), location, author_id: user?.id }
    if (editing) await supabase.from('schedules').update(payload).eq('id', editing.id)
    else await supabase.from('schedules').insert(payload)
    refetch()
    setSaving(false)
    setShowModal(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('일정을 삭제하시겠습니까?')) return
    const supabase = createClient()
    await supabase.from('schedules').delete().eq('id', id)
    refetch()
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const upcoming = schedules.filter(s => {
    const d = new Date(s.start_date)
    d.setHours(0, 0, 0, 0)
    return d >= now
  })
  const past = schedules.filter(s => {
    const d = new Date(s.start_date)
    d.setHours(0, 0, 0, 0)
    return d < now
  })
  const colorPalette = ['bg-brand-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500']

  return (
    <DashboardLayout title="스케줄">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">스케줄</h2>
          <p className="text-gray-500 text-sm mt-1">총 {schedules.length}개의 일정</p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={openCreate}><Plus size={16} /> 일정 추가</Button>
        )}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500" />
              예정된 일정 ({upcoming.length})
            </h3>
            {upcoming.length === 0 ? (
              <EmptyState icon={Calendar} title="예정된 일정이 없습니다" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {upcoming.map((sch, i) => (
                  <Card key={sch.id} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl ${colorPalette[i % colorPalette.length]} flex items-center justify-center text-white flex-shrink-0`}>
                        <Calendar size={18} />
                      </div>
                      {user?.role === 'admin' && (
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(sch)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-brand-600 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(sch.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    <h4 className="font-bold text-navy-900 mb-1">{sch.title}</h4>
                    {sch.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{sch.description}</p>}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={12} className="text-brand-400" />
                        <span>{formatDate(sch.start_date)}</span>
                      </div>
                      {sch.location && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin size={12} className="text-brand-400" />
                          <span>{sch.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Badge variant="info">
                        D-{Math.ceil((new Date(sch.start_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {past.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">지난 일정 ({past.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {past.map((sch) => (
                  <Card key={sch.id} className="p-5 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-semibold text-gray-600">{sch.title}</h4>
                      {user?.role === 'admin' && (
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(sch)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-brand-600 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(sch.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock size={12} />
                      <span>{formatDate(sch.start_date)}</span>
                    </div>
                    {sch.location && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <MapPin size={12} />
                        <span>{sch.location}</span>
                      </div>
                    )}
                    <div className="mt-2">
                      <Badge variant="default">완료</Badge>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? '일정 수정' : '일정 추가'}>
        <div className="space-y-4">
          <Input label="일정 제목" value={title} onChange={setTitle} placeholder="일정 제목 입력" required />
          <Textarea label="설명" value={description} onChange={setDescription} placeholder="일정 설명 (선택사항)" rows={3} />
          <Input label="날짜" value={startDate} onChange={setStartDate} type="date" required />
          <Input label="장소" value={location} onChange={setLocation} placeholder="장소 (선택사항)" />
          <div className="flex gap-3 pt-2">
            <Button onClick={() => setShowModal(false)} variant="secondary" className="flex-1">취소</Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
