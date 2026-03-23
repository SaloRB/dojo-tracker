import { useState } from 'react'
import { addStudent } from '../db'

export default function AddStudentModal({ onClose, onAdd }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await addStudent(name)
    setLoading(false)
    onAdd()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Nuevo alumno</h2>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre completo"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-40"
            >
              {loading ? 'Guardando…' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
