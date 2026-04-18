'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNotices } from '@/hooks/useData'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, Badge, Button, Modal, Input, Textarea, LoadingSpinner, EmptyState } from '@/components/ui'
import { formatDateTime } from '@/lib/utils'
import { Bell, Plus, Pin, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function NoticesPage() {
  const { user } = useAuth()
  const { notices, loading, refetch } = useNotices()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const openCreate = () => {
    setEditing(null)
    setTitle('')
    setContent('')
    setIsPinned(false)
    setImageFile(null)
    setImagePreview(null)
    setShowModal(true)
  }

  const openEdit = (notice: any) => {
    setEditing(notice)
    setTitle(notice.title)
    setContent(notice.content)
    setIsPinned(notice.is_pinned)
    setImagePreview(notice.image_url || null)
    setImageFile(null)
    setShowModal(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    const supabase = createClient()

    let image_url = editing?.image_url || null

    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}.${ext}`
      const { data } = await supabase.storage.from('notices').upload(fileName, imageFile, { upsert: true })
      if (data) {
        const { data: urlData } = supabase.storage.from('notices').getPublicUrl(fileName)
        image_url = urlData.publicUrl
      }
    }

    if (editing) {
      await supabase.from('notices').update({ title, content, is_pinned: isPinned, image_url, updated_at: new Date().toISOString() }).eq('id', editing.id)
    } else {
      await supabase.from('notices').insert({ title, content, is_pinned: isPinned, image_url, author_id: user?.id })
    }
    refetch()
    setSaving(false)
    setShowModal(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('공지를 삭제하시겠습니까?')) return
    const supabase = createClient()
    await supabase.from('notices').delete().eq('id', id)
    refetch()
    setSelected(null)
  }

  const pinned = notices.filter(n => n.is_pinned)
  const regular = notices.filter(n => !n.is_pinned)

  return (
    <DashboardLayout title="공지사항">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">공지사항</h2>
          <p className="text-gray-500 text-sm mt-1">총 {notices.length}개의 공지</p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={openCreate}>
            <Plus size={16} /> 공지 작성
          </Button>
        )}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {pinned.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Pin size={11} /> 고정 공지
                </p>
                {pinned.map(notice => (
                  <NoticeCard
                    key={notice.id}
                    notice={notice}
                    isSelected={selected?.id === notice.id}
                    onClick={() => setSelected(notice)}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    isAdmin={user?.role === 'admin'}
                  />
                ))}
              </div>
            )}
            {regular.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">일반 공지</p>
                {regular.map(notice => (
                  <NoticeCard
                    key={notice.id}
                    notice={notice}
                    isSelected={selected?.id === notice.id}
                    onClick={() => setSelected(notice)}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    isAdmin={user?.role === 'admin'}
                  />
                ))}
              </div>
            )}
            {notices.length === 0 && (
              <EmptyState icon={Bell} title="공지사항이 없습니다" description="아직 등록된 공지가 없습니다." />
            )}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <Card className="p-6 animate-fade-in">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {selected.is_pinned && <Badge variant="info"><Pin size={10} className="inline mr-1" />고정</Badge>}
                    </div>
                    <h3 className="text-xl font-bold text-navy-900">{selected.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {selected.author_name} · {formatDateTime(selected.created_at)}
                    </p>
                  </div>
                  {user?.role === 'admin' && (
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(selected)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-brand-600 transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(selected.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {selected.image_url && (
                  <div className="mb-4 rounded-xl overflow-hidden">
                    <img src={selected.image_url} alt="공지 이미지" className="w-full object-contain" />
                  </div>
                )}

                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl p-4">
                  {selected.content}
                </div>
              </Card>
            ) : (
              <Card className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Bell size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">공지를 선택하면 내용이 표시됩니다</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? '공지 수정' : '공지 작성'}>
        <div className="space-y-4">
          <Input label="제목" value={title} onChange={setTitle} placeholder="공지 제목을 입력하세요" required />
          <Textarea label="내용" value={content} onChange={setContent} placeholder="공지 내용을 입력하세요" rows={4} required />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">이미지 첨부</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
            {imagePreview && (
              <div className="mt-2 rounded-xl overflow-hidden">
                <img src={imagePreview} alt="미리보기" className="w-full object-contain" />
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={e => setIsPinned(e.target.checked)}
              className="w-4 h-4 accent-brand-600"
            />
            <span className="text-sm font-medium text-gray-700">상단 고정</span>
          </label>

          <div className="flex gap-3 pt-2">
            <Button onClick={() => setShowModal(false)} variant="secondary" className="flex-1">취소</Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? '저장 중...' : editing ? '수정 완료' : '공지 등록'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

function NoticeCard({ notice, isSelected, onClick, onEdit, onDelete, isAdmin }: any) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-brand-300 bg-brand-50 shadow-sm'
          : 'border-gray-100 bg-white hover:border-brand-200 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            {notice.is_pinned && <Pin size={11} className="text-brand-500 flex-shrink-0" />}
            <p className="text-sm font-semibold text-gray-800 truncate">{notice.title}</p>
          </div>
          {notice.image_url && <p className="text-xs text-brand-400 mb-1">📷 이미지 첨부</p>}
          <p className="text-xs text-gray-400 line-clamp-1">{notice.content}</p>
          <p className="text-xs text-gray-300 mt-1">{formatDateTime(notice.created_at)}</p>
        </div>
      </div>
    </div>
  )
}
