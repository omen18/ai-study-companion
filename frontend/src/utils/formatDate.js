/**
 * Format a date (Date | string | number) into a short human string.
 * Examples: "Apr 23, 2026", "Apr 23, 2026 14:05"
 */
export function formatDate(value, { withTime = false } = {}) {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''

  const opts = { year: 'numeric', month: 'short', day: 'numeric' }
  if (withTime) {
    opts.hour = '2-digit'
    opts.minute = '2-digit'
  }
  return d.toLocaleString(undefined, opts)
}

export function timeAgo(value) {
  const d = value instanceof Date ? value : new Date(value)
  const diffSec = (Date.now() - d.getTime()) / 1000
  if (diffSec < 60) return 'just now'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  return `${Math.floor(diffSec / 86400)}d ago`
}
