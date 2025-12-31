"use client"

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 disabled:opacity-50"
        onClick={() => onPageChange(Math.max(page - 1, 0))}
        disabled={page === 0}
      >
        Previous
      </button>
      <span className="text-xs text-slate-500">
        Page {page + 1} of {totalPages}
      </span>
      <button
        className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 disabled:opacity-50"
        onClick={() => onPageChange(Math.min(page + 1, totalPages - 1))}
        disabled={page >= totalPages - 1}
      >
        Next
      </button>
    </div>
  )
}
