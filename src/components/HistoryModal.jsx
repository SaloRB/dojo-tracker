import { useState } from 'react'
import { getHistoryByDateRange } from '../db'

function formatDate(iso) {
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const TYPE_LABEL = { '-1': 'Asistencia', '+1': 'Pago 1', '+10': 'Pago 10' }
const TYPE_COLOR = { '-1': 'text-red-600', '+1': 'text-blue-600', '+10': 'text-green-600' }

export default function HistoryModal({ onClose }) {
  const today = new Date().toISOString().slice(0, 10)
  const [start, setStart] = useState(today)
  const [end, setEnd] = useState(today)
  const [movements, setMovements] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSearch() {
    setLoading(true)
    const results = await getHistoryByDateRange(start, end)
    setMovements(results)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Historial general</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none px-1">✕</button>
        </div>

        <div className="p-4 flex gap-2 items-end border-b border-gray-100">
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Desde</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Hasta</label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-40 shrink-0"
          >
            {loading ? '…' : 'Buscar'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {movements === null ? (
            <p className="text-center text-gray-400 py-8 text-sm">Selecciona un rango y presiona Buscar</p>
          ) : movements.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">Sin movimientos en este período</p>
          ) : (
            movements.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.studentName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(m.date)}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-semibold ${TYPE_COLOR[m.type]}`}>
                    {TYPE_LABEL[m.type] || m.type}
                  </span>
                  <p className="text-xs text-gray-400">{m.balanceBefore} → {m.balanceAfter}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
