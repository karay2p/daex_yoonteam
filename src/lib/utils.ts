import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getDaysUntil(dateString: string): number {
  const target = new Date(dateString)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getMissionStatusLabel(status: string): string {
  switch (status) {
    case 'upcoming': return '예정'
    case 'active': return '진행중'
    case 'completed': return '완료'
    default: return status
  }
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case 'admin': return '관리자'
    case 'member': return '팀원'
    case 'observer': return '옵저버'
    default: return role
  }
}
