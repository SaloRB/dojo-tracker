import { useState, useEffect, useMemo } from 'react'
import { getActiveStudents, exportData } from './db'
import StudentRow from './components/StudentRow'
import StudentModal from './components/StudentModal'
import AddStudentModal from './components/AddStudentModal'
import HistoryModal from './components/HistoryModal'
import ArchivedModal from './components/ArchivedModal'

const SORT_OPTIONS = [
  { value: 'name', label: 'A–Z' },
  { value: 'balance', label: 'Disponibles' },
]

export default function App() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('name')
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null) // 'add' | 'history' | 'archived'

  async function loadStudents() {
    const data = await getActiveStudents()
    setStudents(data)
  }

  useEffect(() => { loadStudents() }, [])

  const filtered = useMemo(() => {
    let list = students
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((s) => s.name.toLowerCase().includes(q))
    }
    if (sort === 'balance') {
      list = [...list].sort((a, b) => b.balance - a.balance)
    }
    return list
  }, [students, search, sort])

  const zeroCount = students.filter((s) => s.balance === 0).length

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 sticky top-0 z-10">
        <div className="flex items-center justify-between py-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dojo Tracker</h1>
            <p className="text-xs text-gray-400">
              {students.length} alumnos
              {zeroCount > 0 && (
                <span className="text-red-500 ml-1">· {zeroCount} sin clases</span>
              )}
            </p>
          </div>
          <button
            onClick={() => setModal('add')}
            className="w-10 h-10 bg-blue-600 text-white rounded-full text-2xl flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          >
            +
          </button>
        </div>

        {/* Search + Sort */}
        <div className="flex gap-2 pb-3">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar alumno…"
              className="w-full bg-gray-100 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-base"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sort === opt.value ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Student list */}
      <main className="flex-1 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🥋</p>
            <p className="text-sm">
              {search ? 'Sin resultados para esa búsqueda' : 'Sin alumnos activos. Agrega uno con +'}
            </p>
          </div>
        ) : (
          filtered.map((student) => (
            <StudentRow
              key={student.id}
              student={student}
              onUpdate={loadStudents}
              onSelect={setSelected}
            />
          ))
        )}
      </main>

      {/* Bottom nav */}
      <nav className="bg-white border-t border-gray-100 flex sticky bottom-0">
        <button
          onClick={() => setModal('history')}
          className="flex-1 py-3 flex flex-col items-center gap-0.5 text-gray-500 active:bg-gray-50"
        >
          <span className="text-lg">📋</span>
          <span className="text-xs">Historial</span>
        </button>
        <button
          onClick={() => setModal('archived')}
          className="flex-1 py-3 flex flex-col items-center gap-0.5 text-gray-500 active:bg-gray-50"
        >
          <span className="text-lg">📦</span>
          <span className="text-xs">Archivados</span>
        </button>
        <button
          onClick={exportData}
          className="flex-1 py-3 flex flex-col items-center gap-0.5 text-gray-500 active:bg-gray-50"
        >
          <span className="text-lg">💾</span>
          <span className="text-xs">Respaldo</span>
        </button>
      </nav>

      {/* Modals */}
      {selected && (
        <StudentModal
          student={selected}
          onClose={() => { setSelected(null); loadStudents() }}
          onUpdate={loadStudents}
        />
      )}
      {modal === 'add' && (
        <AddStudentModal onClose={() => setModal(null)} onAdd={loadStudents} />
      )}
      {modal === 'history' && (
        <HistoryModal onClose={() => setModal(null)} />
      )}
      {modal === 'archived' && (
        <ArchivedModal onClose={() => setModal(null)} onUpdate={loadStudents} />
      )}
    </div>
  )
}
