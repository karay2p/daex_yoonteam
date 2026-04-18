import { Profile, Notice, Schedule, Mission, Submission, Attendance } from '@/types'

export const MOCK_PROFILES: Profile[] = [
  { id: 'admin-001', name: '박윤영', email: 'admin@daex.club', role: 'admin', created_at: '2024-01-01T00:00:00Z' },
  { id: 'mem-001', name: '김아람', email: 'aram@daex.club', role: 'member', created_at: '2024-01-02T00:00:00Z' },
  { id: 'mem-002', name: '김문희', email: 'munhee@daex.club', role: 'member', created_at: '2024-01-02T00:00:00Z' },
  { id: 'mem-003', name: '손다빈', email: 'dabin@daex.club', role: 'member', created_at: '2024-01-02T00:00:00Z' },
  { id: 'mem-004', name: '양진아', email: 'jina@daex.club', role: 'member', created_at: '2024-01-02T00:00:00Z' },
  { id: 'mem-005', name: '이혜진', email: 'hyejin@daex.club', role: 'member', created_at: '2024-01-02T00:00:00Z' },
  { id: 'mem-006', name: '장주희', email: 'juhee@daex.club', role: 'member', created_at: '2024-01-02T00:00:00Z' },
  { id: 'mem-007', name: '정승안', email: 'seungan@daex.club', role: 'member', created_at: '2024-01-02T00:00:00Z' },
  { id: 'mem-008', name: '조혜령', email: 'hyeryung@daex.club', role: 'member', created_at: '2024-01-02T00:00:00Z' },
  { id: 'mem-009', name: '황민희', email: 'minhee@daex.club', role: 'member', created_at: '2024-01-02T00:00:00Z' },
  { id: 'obs-001', name: '김은진', email: 'director@daex.club', role: 'observer', created_at: '2024-01-01T00:00:00Z' },
]

const now = new Date()
const today = now.toISOString().split('T')[0]

export const MOCK_NOTICES: Notice[] = [
  {
    id: 'notice-001',
    title: '🌟 D.A.E.X. Club 박윤영팀 오픈 안내',
    content: '안녕하세요, 팀원 여러분! 드디어 우리 팀의 관리 시스템이 오픈되었습니다. 이 플랫폼을 통해 공지사항 확인, 출석 체크, 미션 제출 등을 진행해 주세요. 모두 함께 성장하는 D.A.E.X. Club이 되길 바랍니다! 💜',
    author_id: 'admin-001',
    author_name: '박윤영',
    is_pinned: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notice-002',
    title: '7월 정기 모임 일정 안내',
    content: '이번 달 정기 모임은 7월 20일 토요일 오후 2시에 진행됩니다. 장소는 강남 코워킹 스페이스 3층 세미나실입니다. 반드시 출석 체크를 해주시고, 늦으실 경우 미리 연락 바랍니다.',
    author_id: 'admin-001',
    author_name: '박윤영',
    is_pinned: false,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notice-003',
    title: '미션 제출 마감 리마인더',
    content: '이번 주 금요일까지 "브랜드 아이덴티티 분석" 미션 제출을 완료해 주세요. 아직 제출하지 않은 팀원은 서둘러 주시기 바랍니다.',
    author_id: 'admin-001',
    author_name: '박윤영',
    is_pinned: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const MOCK_SCHEDULES: Schedule[] = [
  {
    id: 'sch-001',
    title: '정기 모임',
    description: '월간 정기 팀 미팅 및 성과 공유',
    start_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    location: '강남 코워킹 스페이스 3층',
    author_id: 'admin-001',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sch-002',
    title: '미션 마감',
    description: '브랜드 아이덴티티 분석 미션 제출 마감',
    start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    author_id: 'admin-001',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sch-003',
    title: '특강 세션',
    description: 'SNS 마케팅 전략 특강',
    start_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    location: '온라인 (Zoom)',
    author_id: 'admin-001',
    created_at: new Date().toISOString(),
  },
]

export const MOCK_MISSIONS: Mission[] = [
  {
    id: 'mission-001',
    title: '브랜드 아이덴티티 분석',
    description: '좋아하는 브랜드 1개를 선정하여 브랜드 아이덴티티, 컬러 시스템, 타겟 고객층을 분석하는 보고서를 작성하세요. A4 1~2장 분량으로 작성해 주세요.',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    author_id: 'admin-001',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mission-002',
    title: '경쟁사 벤치마킹 리포트',
    description: '우리 산업 내 경쟁사 3곳을 선정하여 강점, 약점, 마케팅 전략을 분석하고 인사이트를 도출하세요.',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'upcoming',
    author_id: 'admin-001',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mission-003',
    title: '개인 브랜딩 SNS 피드 기획',
    description: '인스타그램 피드 9장을 기획하고 시각적 톤앤매너, 카피라이팅, 해시태그 전략을 수립하세요.',
    deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    author_id: 'admin-001',
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const MOCK_SUBMISSIONS: Submission[] = [
  { id: 'sub-001', mission_id: 'mission-001', member_id: 'mem-001', member_name: '김아람', mission_title: '브랜드 아이덴티티 분석', content: '나이키의 브랜드 아이덴티티를 분석했습니다. Just Do It 슬로건을 중심으로...', submitted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'sub-002', mission_id: 'mission-001', member_id: 'mem-003', member_name: '손다빈', mission_title: '브랜드 아이덴티티 분석', content: '애플의 미니멀리즘 브랜딩 전략을 분석했습니다...', submitted_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
  { id: 'sub-003', mission_id: 'mission-003', member_id: 'mem-001', member_name: '김아람', mission_title: '개인 브랜딩 SNS 피드 기획', content: '라이프스타일 계정 콘셉트로 기획했습니다...', submitted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'sub-004', mission_id: 'mission-003', member_id: 'mem-005', member_name: '이혜진', mission_title: '개인 브랜딩 SNS 피드 기획', content: '뷰티 크리에이터 콘셉트로 9장 피드를 기획했습니다...', submitted_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
]

export const MOCK_ATTENDANCE: Attendance[] = [
  { id: 'att-001', member_id: 'mem-001', member_name: '김아람', date: today, checked_at: new Date().toISOString() },
  { id: 'att-002', member_id: 'mem-003', member_name: '손다빈', date: today, checked_at: new Date().toISOString() },
  { id: 'att-003', member_id: 'mem-005', member_name: '이혜진', date: today, checked_at: new Date().toISOString() },
  { id: 'att-004', member_id: 'mem-007', member_name: '정승안', date: today, checked_at: new Date().toISOString() },
]
