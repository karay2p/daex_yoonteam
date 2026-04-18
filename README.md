# D.A.E.X. Club 박윤영팀 관리 웹앱

> 연결되고 실행되는 D.A.E.X. Club 박윤영팀 — 공지, 출석, 미션, 인증, 스케줄 통합 관리 시스템

## 🌟 주요 기능

| 기능 | 관리자 | 팀원 | 옵저버 |
|------|--------|------|--------|
| 대시보드 | ✅ 전체 현황 | ✅ 개인 현황 | ✅ 읽기 전용 |
| 공지사항 | ✅ 작성/수정/삭제 | 👁 읽기 | 👁 읽기 |
| 스케줄 | ✅ 추가/수정/삭제 | 👁 읽기 | 👁 읽기 |
| 미션 | ✅ 생성/수정/삭제 | 👁 읽기 | 👁 읽기 |
| 미션 인증 | ✅ 전체 확인 | ✅ 제출 + 본인 확인 | 👁 전체 읽기 |
| 출석 체크 | ✅ 전체 현황 | ✅ 본인 체크 | 👁 읽기 |
| 팀원 현황 | ✅ 전체 통계 | ✅ 팀원 목록 | 👁 읽기 |
| 관리자 페이지 | ✅ 접근 가능 | ❌ 차단 | ❌ 차단 |

---

## 🚀 빠른 시작 (데모 모드)

Supabase 없이도 바로 실행 가능합니다!

```bash
# 1. 의존성 설치
npm install

# 2. 실행
npm run dev

# 3. 브라우저에서 열기
open http://localhost:3000
```

### 데모 계정 (비밀번호: `daex2024!`)

| 이름 | 이메일 | 역할 |
|------|--------|------|
| 박윤영 | admin@daex.club | 관리자 |
| 김아람 | aram@daex.club | 팀원 |
| 김문희 | munhee@daex.club | 팀원 |
| 손다빈 | dabin@daex.club | 팀원 |
| 양진아 | jina@daex.club | 팀원 |
| 이혜진 | hyejin@daex.club | 팀원 |
| 장주희 | juhee@daex.club | 팀원 |
| 정승안 | seungan@daex.club | 팀원 |
| 조혜령 | hyeryung@daex.club | 팀원 |
| 황민희 | minhee@daex.club | 팀원 |
| 김은진 | director@daex.club | 옵저버 |

---

## 🛠 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **스타일링**: Tailwind CSS
- **백엔드/인증**: Supabase (PostgreSQL + Auth)
- **배포**: Vercel
- **아이콘**: Lucide React

---

## 📁 프로젝트 구조

```
daex-club/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 루트 (리다이렉트)
│   │   ├── globals.css         # 전역 스타일
│   │   ├── login/page.tsx      # 로그인 페이지
│   │   ├── dashboard/page.tsx  # 대시보드
│   │   ├── notices/page.tsx    # 공지사항
│   │   ├── schedule/page.tsx   # 스케줄
│   │   ├── missions/page.tsx   # 미션 관리
│   │   ├── submissions/page.tsx # 미션 인증
│   │   ├── attendance/page.tsx # 출석 체크
│   │   ├── members/page.tsx    # 팀원 현황
│   │   └── admin/page.tsx      # 관리자 페이지
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx     # 사이드바 네비게이션
│   │   │   ├── Header.tsx      # 상단 헤더
│   │   │   └── DashboardLayout.tsx
│   │   └── ui/
│   │       └── index.tsx       # 공통 UI 컴포넌트
│   ├── hooks/
│   │   ├── useAuth.tsx         # 인증 훅
│   │   └── useData.ts          # 데이터 패칭 훅
│   ├── lib/
│   │   ├── supabase.ts         # Supabase 클라이언트
│   │   ├── supabase-server.ts  # 서버 클라이언트
│   │   ├── mock-data.ts        # 데모용 샘플 데이터
│   │   └── utils.ts            # 유틸리티 함수
│   └── types/
│       └── index.ts            # TypeScript 타입 정의
├── supabase-schema.sql         # DB 스키마 (Supabase에서 실행)
├── .env.local.example          # 환경변수 예시
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 🗄 Supabase 연결 방법

### 1단계: Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 접속 → 회원가입 → New Project 생성
2. 프로젝트 이름 입력 (예: `daex-club`)
3. DB 비밀번호 설정 후 생성 기다리기

### 2단계: 환경변수 설정

```bash
# .env.local.example을 .env.local로 복사
cp .env.local.example .env.local
```

`.env.local` 파일 열고 수정:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

→ Supabase 대시보드 **Settings > API** 에서 확인

### 3단계: DB 스키마 실행

1. Supabase 대시보드 → **SQL Editor** 클릭
2. `supabase-schema.sql` 파일 전체 내용 복사
3. SQL Editor에 붙여넣기 → **Run** 클릭

### 4단계: 팀원 계정 생성 및 role 설정

**방법 A: Supabase Auth에서 직접 생성**

1. Supabase 대시보드 → **Authentication > Users** 클릭
2. **Invite User** 버튼으로 각 팀원 이메일 초대
3. 초대 후 SQL Editor에서 role 설정:

```sql
-- 관리자 설정 (박윤영)
UPDATE profiles SET role = 'admin' WHERE email = 'yoonyoung@email.com';

-- 옵저버 설정 (김은진)
UPDATE profiles SET role = 'observer' WHERE email = 'eunjin@email.com';

-- 나머지는 자동으로 'member' 역할
```

**방법 B: 회원가입 링크 활성화**

Supabase **Authentication > Settings** 에서 `Enable Email Signups` 활성화 후, 팀원들에게 직접 회원가입하도록 안내

---

## ▲ Vercel 배포 방법

### 방법 1: GitHub 연동 (권장)

1. 이 프로젝트를 GitHub에 push:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: D.A.E.X. Club 팀 관리 앱"
   git remote add origin https://github.com/YOUR_USERNAME/daex-club.git
   git push -u origin main
   ```

2. [vercel.com](https://vercel.com) → **New Project** → GitHub 레포 선택

3. **Environment Variables** 섹션에서 추가:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-anon-key`

4. **Deploy** 클릭 → 자동 배포!

### 방법 2: Vercel CLI

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 환경변수 설정
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# 프로덕션 배포
vercel --prod
```

---

## 📋 샘플 데이터 넣는 방법

`supabase-schema.sql` 파일 하단의 INSERT 구문을 실행하면 샘플 데이터가 생성됩니다.

또는 관리자 계정으로 로그인 후 직접 데이터를 입력하면 됩니다:
- 공지사항 페이지 → 공지 작성
- 스케줄 페이지 → 일정 추가
- 미션 페이지 → 미션 추가

---

## 🎨 디자인 시스템

- **Primary Color**: 보라 계열 (`#7c3aed`)
- **Secondary**: 딥 네이비 (`#1e1b4b`)
- **폰트**: DM Serif Display (제목) + DM Sans (본문)
- **스타일**: 카드형 UI, 둥근 코너, 부드러운 그림자

---

## ❓ 자주 묻는 질문

**Q: Supabase 없이도 작동하나요?**
A: 네! 데모 모드로 바로 실행 가능합니다. 데이터는 메모리에 임시 저장됩니다.

**Q: 비밀번호를 변경하고 싶어요.**
A: Supabase 연결 후 Authentication > Users에서 변경 가능합니다.

**Q: 이미지 업로드는 어떻게 하나요?**
A: Supabase Storage를 연결하면 미션 인증 시 이미지 업로드가 가능합니다.

---

**Made with 💜 for D.A.E.X. Club 박윤영팀**
