import { describe, it, expect, beforeEach } from 'vitest'
import { db, addStudent, adjustBalance, getStudentHistory, getHistoryByDateRange } from '../db.js'

beforeEach(async () => {
  await db.students.clear()
  await db.movements.clear()
})

describe('getHistoryByDateRange', () => {
  it('incluye movimientos del mismo día aunque la hora UTC caiga al día siguiente', async () => {
    const id = await addStudent('Ana')
    // Movimiento a las 11pm hora local (puede ser UTC del día siguiente en UTC-)
    const elevenPmLocal = new Date(2026, 2, 23, 23, 0, 0, 0)
    await db.movements.add({
      studentId: id, type: '+1',
      date: elevenPmLocal.toISOString(),
      balanceBefore: 0, balanceAfter: 1,
    })
    const results = await getHistoryByDateRange('2026-03-23', '2026-03-23')
    expect(results).toHaveLength(1)
  })

  it('excluye movimientos fuera del rango', async () => {
    const id = await addStudent('Ana')
    // Fechas en hora local para ser timezone-independent
    const dec31 = new Date(2025, 11, 31, 12, 0, 0, 0)  // 31 dic, mediodía local
    const jan15 = new Date(2026, 0, 15, 12, 0, 0, 0)   // 15 ene, mediodía local
    const feb1  = new Date(2026, 1,  1, 12, 0, 0, 0)   // 1 feb, mediodía local
    await db.movements.bulkAdd([
      { studentId: id, type: '+1', date: dec31.toISOString(), balanceBefore: 0, balanceAfter: 1 },
      { studentId: id, type: '+1', date: jan15.toISOString(), balanceBefore: 1, balanceAfter: 2 },
      { studentId: id, type: '+1', date: feb1.toISOString(),  balanceBefore: 2, balanceAfter: 3 },
    ])

    const results = await getHistoryByDateRange('2026-01-01', '2026-01-31')
    expect(results).toHaveLength(1)
    expect(results[0].date).toBe(jan15.toISOString())
  })

  it('incluye movimientos en los extremos del rango (inicio y fin del día local)', async () => {
    const id = await addStudent('Ana')
    const jan1Start = new Date(2026, 0, 1,  0,  0,  0,   0) // medianoche local
    const jan15Mid  = new Date(2026, 0, 15, 12,  0,  0,   0) // mediodía local
    const jan31End  = new Date(2026, 0, 31, 23, 59, 59, 999) // fin del día local
    await db.movements.bulkAdd([
      { studentId: id, type: '+1', date: jan1Start.toISOString(), balanceBefore: 0, balanceAfter: 1 },
      { studentId: id, type: '+1', date: jan15Mid.toISOString(),  balanceBefore: 1, balanceAfter: 2 },
      { studentId: id, type: '+1', date: jan31End.toISOString(),  balanceBefore: 2, balanceAfter: 3 },
    ])

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
