'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSubmissions, useMissions, useMembers } from '@/hooks/useData'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, Badge, Button, Modal, Textarea, LoadingSpinner, EmptyState } from '@/components/ui'
import { formatDateTime } from '@/lib/utils'
import { Upload, Plus, CheckCircle, User, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function SubmissionsPage() {
  const { user } = useAuth()
  const { submissions, loading, refetch } = useSubmissions()
  const { missions } = useMissions()
  const { members } = useMembers()

  const [showModal, setShowModal] = useState(false)
  const [selectedMission, setSelectedMission] = useState('')
  const [selectedMember, setSelectedMember] = useState('')
  const [content, setContent] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [filterMission, setFilterMission] = useState('all')
  const [filterMember, setFilterMember] = useState('all')
  const [lightbox, setLightbox] = useState<{ urls: string[], idx: number } | null>(null)

  const availableMissions = missions.filter(m => m.status === 'active' || m.status === 'completed')
  const teamMembers = members.filter(m => m.role === 'member')

  const filteredSubs = submissions
    .filter(s => filterMission === 'all' || s.mission_id === filterMission)
    .filter(s => filterMember === 'all' || s.member_id === filterMember)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setImageFiles(prev => [...prev, ...files])
    files.forEach(file => setImagePreviews(prev => [...prev, URL.createObjectURL(file)]))
    e.target.value = ''
  }

  const removeImage = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx))
    setImagePreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async () => {
    if (!selectedMission || !selectedMember || !user) return
    setSaving(true)
    const supabase = createClient()
    const uploadedUrls: string[] = []
    for (const file of imageFiles) {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data } = await supabase.storage.from('submissions').upload(fileName, file, { upsert: true })
      if (data) {
        const { data: urlData } = supabase.storage.from('submissions').getPublicUrl(fileName)
        uploadedUrls.push(urlData.publicUrl)
      }
    }
    await supabase.from('submissions').insert({
      mission_id: selectedMission,
      member_id: selectedMember,
      content: content || '제출 완료',
      image_url: uploadedUrls[0] || null,
      image_urls: uploadedUrls,
      submitted_at: new Date().toISOString()
    })
    refetch()
    setSaving(false)
    setShowModal(false)
    setContent('')
    setSelectedMission('')
    setSelectedMember('')
    setImageFiles([])
    setImagePreviews([])
  }

  const getPhotos = (sub: any): string[] => {
    if (sub.image_urls && sub.image_urls.length > 0) return sub.image_urls
    if (sub.image_url) return [sub.image_url]
    return []
  }

  return (
    <DashboardLayout title="미션 인증">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">미션 인증</h2>
          <p className="text-gray-500 text-sm mt-1">전체 인증 {submissions.length}건 · 누구나 볼 수 있어요</p>
        </div>
        {user && (
          <Button onClick={() => setShowModal(true)}><Plus size={16} /> 인증 제출</Button>
        )}
      </div>

      {/* 미션 필터 */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <button onClick={() => setFilterMission('all')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filterMission === 'all' ? 'bg-brand-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
          전체
        </button>
        {missions.map(m => (
          <button key={m.id} onClick={() => setFilterMission(m.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all truncate max-w-[180px] ${filterMission === m.id ? 'bg-brand-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
            {m.title}
          </button>
        ))}
      </div>

      {/* 선생님 필터 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setFilterMember('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterMember === 'all' ? 'bg-navy-800 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
          전체 선생님
        </button>
        {teamMembers.map(m => (
          <button key={m.id} onClick={() => setFilterMember(m.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterMember === m.id ? 'bg-navy-800 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
            {m.name}
          </button>
        ))}
      </div>

      {/* 미션별 제출 현황 */}
      {availableMissions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {availableMissions.map(mission => {
            const mSubs = submissions.filter(s => s.mission_id === mission.id)
            const memberCount = teamMembers.length
            return (
              <Card key={mission.id} className="p-4">
                <h4 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-1">{mission.title}</h4>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>제출 현황</span>
                  <span className="font-bold text-brand-600">{mSubs.length}/{memberCount}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-gradient rounded-full transition-all"
                    style={{ width: `${Math.min((mSubs.length / Math.max(memberCount, 1)) * 100, 100)}%` }} />
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* 카드 목록 */}
      {loading ? <LoadingSpinner /> : filteredSubs.length === 0 ? (
        <EmptyState icon={Upload} title="제출된 인증이 없습니다" description="아직 제출된 인증이 없습니다."
          action={user ? <Button onClick={() => setShowModal(true)}>인증 제출하기</Button> : undefined} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSubs.map(sub => {
            const photos = getPhotos(sub)
            return (
              <Card key={sub.id} className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {sub.member_name?.[0] || <User size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800 text-sm">{sub.member_name}</span>
                      <Badge variant="success"><CheckCircle size={10} className="inline mr-1" />제출 완료</Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {sub.mission_title && <span className="text-brand-600 font-medium">{sub.mission_title}</span>}
                      {' · '}{formatDateTime(sub.submitted_at)}
                    </p>
                  </div>
                </div>
                {photos.length > 0 && (
                  <div className={`mb-3 grid gap-1.5 rounded-xl overflow-hidden ${photos.length === 1 ? 'grid-cols-1' : photos.length === 2 ? 'grid-cols-2' : photos.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    {photos.slice(0, 4).map((url: string, i: number) => (
                      <div key={i} className="relative cursor-pointer overflow-hidden bg-gray-100"
                        style={{ aspectRatio: photos.length === 1 ? 'auto' : '1' }}
                        onClick={() => setLightbox({ urls: photos, idx: i })}>
                        <img src={url} alt={`인증 ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" />
                        {i === 3 && photos.length > 4 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">+{photos.length - 4}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm text-gray-700 leading-relaxed">{sub.content}</p>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* 라이트박스 */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightbox(null)}><X size={28} /></button>
          <button className="absolute left-4 text-white disabled:opacity-30" disabled={lightbox.idx === 0}
            onClick={e => { e.stopPropagation(); setLightbox(l => l ? { ...l, idx: l.idx - 1 } : null) }}>
            <ChevronLeft size={36} />
          </button>
          <img src={lightbox.urls[lightbox.idx]} alt="" className="max-w-full max-h-[85vh] object-contain rounded-xl" onClick={e => e.stopPropagation()} />
          <button className="absolute right-4 text-white disabled:opacity-30" disabled={lightbox.idx === lightbox.urls.length - 1}
            onClick={e => { e.stopPropagation(); setLightbox(l => l ? { ...l, idx: l.idx + 1 } : null) }}>
            <ChevronRight size={36} />
          </button>
          <div className="absolute bottom-4 text-white text-sm">{lightbox.idx + 1} / {lightbox.urls.length}</div>
        </div>
      )}

      {/* 제출 모달 */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="미션 인증 제출">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">미션 선택 <span className="text-red-400">*</span></label>
            <select value={selectedMission} onChange={e => setSelectedMission(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option value="">미션을 선택하세요</option>
              <optgroup label="진행중">
                {missions.filter(m => m.status === 'active').map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </optgroup>
              <optgroup label="완료된 미션">
                {missions.filter(m => m.status === 'completed').map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">팀원 선택 <span className="text-red-400">*</span></label>
            <select value={selectedMember} onChange={e => setSelectedMember(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option value="">팀원을 선택하세요</option>
              {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">사진 첨부 ({imageFiles.length}장) · 여러 장 선택 가능</label>
            <input type="file" accept="image/*" multiple onChange={handleImageChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
            {imagePreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {imagePreviews.map((url: string, i: number) => (
                  <div key={i} className="relative rounded-xl overflow-hidden aspect-square">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white"><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">내용 (선택)</label>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="인증 내용을 입력하세요 (선택사항)"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={() => setShowModal(false)} variant="secondary" className="flex-1">취소</Button>
            <Button onClick={handleSubmit} disabled={saving || !selectedMission || !selectedMember} className="flex-1">
              {saving ? '제출 중...' : '인증 제출'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
