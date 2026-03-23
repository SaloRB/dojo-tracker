import { describe, it, expect, beforeEach } from 'vitest'
import { db, addStudent, adjustBalance, getStudentHistory, getHistoryByDateRange } from '../db.js'

beforeEach(async () => {
  await db.students.clear()
  await db.movements.clear()
})

describe('getHistoryByDateRange', () => {
  it('excluye movimientos fuera del rango', async () => {
    const id = await addStudent('Ana')
    await db.movements.bulkAdd([
      { studentId: id, type: '+1', date: '2025-12-31T23:59:59.999Z', balanceBefore: 0, balanceAfter: 1 },
      { studentId: id, type: '+1', date: '2026-01-15T12:00:00.000Z', balanceBefore: 1, balanceAfter: 2 },
      { studentId: id, type: '+1', date: '2026-02-01T00:00:00.000Z', balanceBefore: 2, balanceAfter: 3 },
    ])

    const results = await getHistoryByDateRange('2026-01-01', '2026-01-31')
    expect(results).toHaveLength(1)
    expect(results[0].date).toBe('2026-01-15T12:00:00.000Z')
  })

  it('incluye movimientos en los extremos del rango', async () => {
    const id = await addStudent('Ana')
    await db.movements.bulkAdd([
      { studentId: id, type: '+1', date: '2026-01-01T00:00:00.000Z', balanceBefore: 0, balanceAfter: 1 },
      { studentId: id, type: '+1', date: '2026-01-15T12:00:00.000Z', balanceBefore: 1, balanceAfter: 2 },
      { studentId: id, type: '+1', date: '2026-01-31T23:59:59.999Z', balanceBefore: 2, balanceAfter: 3 },
    ])
    await db.students.update(id, { balance: 3 })

    const results = await getHistoryByDateRange('2026-01-01', '2026-01-31')
    expect(results).toHaveLength(3)
  })
})

describe('getStudentHistory', () => {
  it('retorna solo los movimientos del alumno indicado', async () => {
    const idA = await addStudent('Ana')
    const idB = await addStudent('Bob')
    await adjustBalance(idA, 1)
    await adjustBalance(idB, 1)
    await adjustBalance(idA, 1)

    const history = await getStudentHistory(idA)
    expect(history.every((m) => m.studentId === idA)).toBe(true)
    expect(history).toHaveLength(2)
  })

  it('retorna los movimientos en orden cronológico inverso (más reciente primero)', async () => {
    const id = await addStudent('Ana')
    await db.movements.bulkAdd([
      { studentId: id, type: '+1', date: '2026-01-01T10:00:00.000Z', balanceBefore: 0, balanceAfter: 1 },
      { studentId: id, type: '+1', date: '2026-01-03T10:00:00.000Z', balanceBefore: 1, balanceAfter: 2 },
      { studentId: id, type: '+1', date: '2026-01-02T10:00:00.000Z', balanceBefore: 2, balanceAfter: 3 },
    ])

    const history = await getStudentHistory(id)
    expect(history[0].date).toBe('2026-01-03T10:00:00.000Z')
    expect(history[2].date).toBe('2026-01-01T10:00:00.000Z')
  })
})
