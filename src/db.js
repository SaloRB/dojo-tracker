import Dexie from 'dexie'

export const db = new Dexie('dojo-tracker')

db.version(1).stores({
  students: '++id, name, balance, status, createdAt',
  movements: '++id, studentId, type, date, balanceBefore, balanceAfter',
})

// Student management
export async function addStudent(name) {
  return db.students.add({
    name: name.trim(),
    balance: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
  })
}

export async function editStudent(id, name) {
  return db.students.update(id, { name: name.trim() })
}

export async function archiveStudent(id) {
  return db.students.update(id, { status: 'archived' })
}

export async function unarchiveStudent(id) {
  return db.students.update(id, { status: 'active' })
}

export async function getActiveStudents() {
  return db.students.where('status').equals('active').sortBy('name')
}

export async function getArchivedStudents() {
  return db.students.where('status').equals('archived').sortBy('name')
}

// Balance module
export async function adjustBalance(studentId, delta) {
  return db.transaction('rw', db.students, db.movements, async () => {
    const student = await db.students.get(studentId)
    if (!student) throw new Error('Alumno no encontrado')

    const newBalance = student.balance + delta
    if (newBalance < 0) throw new Error('El alumno no tiene clases disponibles')

    await db.students.update(studentId, { balance: newBalance })
    await db.movements.add({
      studentId,
      type: delta > 0 ? `+${delta}` : `${delta}`,
      date: new Date().toISOString(),
      balanceBefore: student.balance,
      balanceAfter: newBalance,
    })

    return newBalance
  })
}

// History module
export async function getStudentHistory(studentId) {
  return db.movements
    .where('studentId')
    .equals(studentId)
    .reverse()
    .sortBy('date')
}

export async function getHistoryByDateRange(startDate, endDate) {
  const start = new Date(startDate).toISOString()
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)
  const endIso = end.toISOString()

  const movements = await db.movements
    .where('date')
    .between(start, endIso, true, true)
    .reverse()
    .sortBy('date')

  // Enrich with student names
  const studentIds = [...new Set(movements.map((m) => m.studentId))]
  const students = await db.students.bulkGet(studentIds)
  const studentMap = Object.fromEntries(
    students.filter(Boolean).map((s) => [s.id, s.name])
  )

  return movements.map((m) => ({ ...m, studentName: studentMap[m.studentId] || 'Desconocido' }))
}

// Backup / export
export async function exportData() {
  const students = await db.students.toArray()
  const movements = await db.movements.toArray()
  const data = { exportedAt: new Date().toISOString(), students, movements }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dojo-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
