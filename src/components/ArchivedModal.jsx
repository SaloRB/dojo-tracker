import { useState, useEffect } from 'react'
import { getArchivedStudents, unarchiveStudent } from '../db'

export default function ArchivedModal({ onClose, onUpdate }) {
  const [students, setStudents] = useState([])

  useEffect(() => {
    getArchivedStudents().then(setStudents)
  }, [])

  async function handleUnarchive(id) {
    await unarchiveStudent(id)
    const updated = await getArchivedStudents()
    setStudents(updated)
    onUpdate()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Alumnos archivados</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none px-1">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {students.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">Sin alumnos archivados</p>
          ) : (
            students.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <span className="text-gray-700 font-medium">{s.name}</span>
                <button
                  onClick={() => handleUnarchive(s.id)}
                  className="text-sm px-3 py-1.5 bg-green-50 text-green-700 rounded-lg"
                >
                  Reactivar
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
