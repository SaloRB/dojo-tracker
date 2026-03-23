import { useState } from 'react'
import { adjustBalance } from '../db'

export default function StudentRow({ student, onUpdate, onSelect }) {
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState(null)

  async function handleAdjust(delta) {
    setLoading(delta)
    setError(null)
    try {
      await adjustBalance(student.id, delta)
      onUpdate()
    } catch (e) {
      setError(e.message)
      setTimeout(() => setError(null), 2000)
    } finally {
      setLoading(null)
    }
  }

  const canAttend = student.balance > 0

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0">
      {/* Status dot */}
      <div
        className={`w-2.5 h-2.5 rounded-full shrink-0 ${canAttend ? 'bg-green-500' : 'bg-red-500'}`}
      />

      {/* Name + error */}
      <button
        onClick={() => onSelect(student)}
        className="flex-1 text-left min-w-0"
      >
        <span className="font-medium text-gray-900 truncate block">{student.name}</span>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </button>

      {/* Balance badge */}
      <span
        className={`text-sm font-bold w-8 text-center shrink-0 ${
          canAttend ? 'text-green-600' : 'text-red-500'
        }`}
      >
        {student.balance}
      </span>

      {/* Action buttons */}
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => handleAdjust(-1)}
          disabled={!canAttend || loading !== null}
          className="w-10 h-10 rounded-lg bg-red-100 text-red-700 font-bold text-sm disabled:opacity-40 active:scale-95 transition-transform"
        >
          {loading === -1 ? '…' : '-1'}
        </button>
        <button
          onClick={() => handleAdjust(1)}
          disabled={loading !== null}
          className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 font-bold text-sm disabled:opacity-40 active:scale-95 transition-transform"
        >
          {loading === 1 ? '…' : '+1'}
        </button>
        <button
          onClick={() => handleAdjust(10)}
          disabled={loading !== null}
          className="w-10 h-10 rounded-lg bg-green-100 text-green-700 font-bold text-sm disabled:opacity-40 active:scale-95 transition-transform"
        >
          {loading === 10 ? '…' : '+10'}
        </button>
      </div>
    </div>
  )
}
