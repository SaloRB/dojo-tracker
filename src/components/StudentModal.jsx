import { useState, useEffect } from 'react'
import { getStudentHistory, archiveStudent, unarchiveStudent, editStudent } from '../db'

function formatDate(iso) {
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const TYPE_LABEL = { '-1': 'Asistencia', '+1': 'Pago 1 clase', '+10': 'Pago 10 clases' }
const TYPE_COLOR = { '-1': 'text-red-600', '+1': 'text-blue-600', '+10': 'text-green-600' }

export default function StudentModal({ student, onClose, onUpdate }) {
  const [history, setHistory] = useState([])
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(student.name)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getStudentHistory(student.id).then(setHistory)
  }, [student.id])

  async function handleSaveName() {
    if (!name.trim() || name.trim() === student.name) { setEditing(false); return }
    setLoading(true)
    await editStudent(student.id, name)
    setLoading(false)
    setEditing(false)
    onUpdate()
  }

  async function handleArchive() {
    if (student.status === 'active') {
      await archiveStudent(student.id)
    } else {
      await unarchiveStudent(student.id)
    }
    onUpdate()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {editing ? (
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-lg font-semibold mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <h2 className="text-lg font-semibold text-gray-900 flex-1">{student.name}</h2>
          )}
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={handleSaveName} disabled={loading} className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg">
                  Guardar
                </button>
                <button onClick={() => { setEditing(false); setName(student.name) }} className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg">
                  Cancelar
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg">
                Editar
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none px-1">✕</button>
          </div>
        </div>

        {/* Balance summary */}
        <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-500">Clases disponibles</span>
          <span className={`text-2xl font-bold ${student.balance > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {student.balance}
          </span>
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">Sin movimientos registrados</p>
          ) : (
            history.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <div>
                  <span className={`text-sm font-semibold ${TYPE_COLOR[m.type]}`}>
                    {TYPE_LABEL[m.type] || m.type}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(m.date)}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400">{m.balanceBefore} → {m.balanceAfter}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Archive action */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleArchive}
            className={`w-full py-2.5 rounded-xl text-sm font-medium ${
              student.status === 'active'
                ? 'bg-orange-50 text-orange-700'
                : 'bg-green-50 text-green-700'
            }`}
          >
            {student.status === 'active' ? 'Archivar alumno' : 'Reactivar alumno'}
          </button>
        </div>
      </div>
    </div>
  )
}
