-- ================================================
-- D.A.E.X. Club 박윤영팀 - Supabase DB 스키마
-- Supabase SQL Editor에 복붙해서 실행하세요
-- ================================================

-- 1. profiles 테이블 (사용자 프로필)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'observer')) DEFAULT 'member',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. notices 테이블 (공지사항)
CREATE TABLE IF NOT EXISTS notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. schedules 테이블 (일정)
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. missions 테이블 (미션)
CREATE TABLE IF NOT EXISTS missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'active', 'completed')) DEFAULT 'active',
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. submissions 테이블 (미션 인증 제출)
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mission_id, member_id)
);

-- 6. attendance 테이블 (출석)
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, date)
);

-- ================================================
-- RLS (Row Level Security) 설정
-- ================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- profiles: 로그인한 사용자는 모두 볼 수 있음
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- notices: 모두 읽기 가능, admin만 쓰기
CREATE POLICY "notices_select" ON notices FOR SELECT TO authenticated USING (true);
CREATE POLICY "notices_insert" ON notices FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "notices_update" ON notices FOR UPDATE TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "notices_delete" ON notices FOR DELETE TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- schedules: 모두 읽기 가능, admin만 쓰기
CREATE POLICY "schedules_select" ON schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "schedules_insert" ON schedules FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "schedules_update" ON schedules FOR UPDATE TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "schedules_delete" ON schedules FOR DELETE TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- missions: 모두 읽기 가능, admin만 쓰기
CREATE POLICY "missions_select" ON missions FOR SELECT TO authenticated USING (true);
CREATE POLICY "missions_insert" ON missions FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "missions_update" ON missions FOR UPDATE TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "missions_delete" ON missions FOR DELETE TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- submissions: 모두 읽기, member/admin은 제출 가능
CREATE POLICY "submissions_select" ON submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "submissions_insert" ON submissions FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = member_id AND
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'member')
  );

-- attendance: 모두 읽기, 본인만 체크인
CREATE POLICY "attendance_select" ON attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "attendance_insert" ON attendance FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = member_id);

-- ================================================
-- trigger: 회원가입 시 profiles 자동 생성
-- ================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- 샘플 데이터 (선택사항)
-- 아래 INSERT는 auth.users에 직접 계정 생성 후 실행하세요
-- ================================================

-- 공지사항 샘플
INSERT INTO notices (title, content, is_pinned) VALUES
  ('🌟 D.A.E.X. Club 박윤영팀 오픈 안내', '팀 관리 시스템이 오픈되었습니다! 공지, 출석, 미션을 이곳에서 관리해 주세요. 💜', true),
  ('7월 정기 모임 일정 안내', '7월 20일 토요일 오후 2시, 강남 코워킹 스페이스 3층에서 정기 모임이 있습니다.', false),
  ('미션 제출 마감 리마인더', '이번 주 금요일까지 브랜드 아이덴티티 분석 미션을 제출해 주세요!', false);

-- 미션 샘플
INSERT INTO missions (title, description, deadline, status) VALUES
  ('브랜드 아이덴티티 분석', '좋아하는 브랜드 1개를 선정하여 브랜드 아이덴티티, 컬러 시스템, 타겟 고객층을 분석하세요.', NOW() + INTERVAL '2 days', 'active'),
  ('경쟁사 벤치마킹 리포트', '경쟁사 3곳을 선정하여 강점, 약점, 마케팅 전략을 분석하세요.', NOW() + INTERVAL '14 days', 'upcoming'),
  ('개인 브랜딩 SNS 피드 기획', '인스타그램 피드 9장을 기획하고 톤앤매너 전략을 수립하세요.', NOW() - INTERVAL '3 days', 'completed');

-- 스케줄 샘플
INSERT INTO schedules (title, description, start_date, location) VALUES
  ('정기 모임', '월간 정기 팀 미팅 및 성과 공유', NOW() + INTERVAL '5 days', '강남 코워킹 스페이스 3층'),
  ('미션 마감', '브랜드 아이덴티티 분석 미션 마감', NOW() + INTERVAL '2 days', NULL),
  ('특강 세션', 'SNS 마케팅 전략 특강', NOW() + INTERVAL '10 days', '온라인 (Zoom)');
