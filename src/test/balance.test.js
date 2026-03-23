import { describe, it, expect, beforeEach } from 'vitest'
import { db, addStudent, adjustBalance } from '../db.js'

beforeEach(async () => {
  await db.students.clear()
  await db.movements.clear()
})

describe('adjustBalance', () => {
  it('+1 incrementa el balance en 1', async () => {
    const id = await addStudent('Ana')
    await adjustBalance(id, 1)
    const student = await db.students.get(id)
    expect(student.balance).toBe(1)
  })

  it('+10 incrementa el balance en 10', async () => {
    const id = await addStudent('Ana')
    await adjustBalance(id, 10)
    const student = await db.students.get(id)
    expect(student.balance).toBe(10)
  })

  it('-1 decrementa el balance en 1', async () => {
    const id = await addStudent('Ana')
    await adjustBalance(id, 5)
    await adjustBalance(id, -1)
    const student = await db.students.get(id)
    expect(student.balance).toBe(4)
  })

  it('-1 con balance = 0 lanza error y no modifica el alumno', async () => {
    const id = await addStudent('Ana')
    await expect(adjustBalance(id, -1)).rejects.toThrow()
    const student = await db.students.get(id)
    expect(student.balance).toBe(0)
  })

  it('operación exitosa genera registro en movements con campos correctos', async () => {
    const id = await addStudent('Ana')
    await adjustBalance(id, 3)
    const movements = await db.movements.where('studentId').equals(id).toArray()
    expect(movements).toHaveLength(1)
    const [mov] = movements
    expect(mov.studentId).toBe(id)
    expect(mov.type).toBe('+3')
    expect(mov.balanceBefore).toBe(0)
    expect(mov.balanceAfter).toBe(3)
    expect(mov.date).toBeDefined()
  })
})
