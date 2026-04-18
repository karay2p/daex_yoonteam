export type Role = 'admin' | 'member' | 'observer'

export type Profile = {
  id: string
  name: string
  email: string
  role: Role
  avatar_url?: string
  created_at: string
}

export type Notice = {
  id: string
  title: string
  content: string
  author_id: string
  author_name?: string
  is_pinned: boolean
  image_url?: string
  created_at: string
  updated_at: string
}

export type Schedule = {
  id: string
  title: string
  description?: string
  start_date: string
  end_date?: string
  location?: string
  author_id: string
  created_at: string
}

export type MissionStatus = 'upcoming' | 'active' | 'completed'

export type Mission = {
  id: string
  title: string
  description: string
  deadline: string
  status: MissionStatus
  author_id: string
  created_at: string
}

export type Submission = {
  id: string
  mission_id: string
  member_id: string
  member_name?: string
  mission_title?: string
  content: string
  image_url?: string
  image_urls?: string[]
  submitted_at: string
}

export type Attendance = {
  id: string
  member_id: string
  member_name?: string
  schedule_id?: string
  date: string
  checked_at: string
}

export type DashboardStats = {
  totalMembers: number
  todayAttendance: number
  activeMissions: number
  pendingSubmissions: number
  recentNotices: Notice[]
  weekSchedules: Schedule[]
}
