import { describe, it, expect } from 'vitest'
import { db, addStudent, getActiveStudents } from '../db.js'

describe('db', () => {
  it('can add a student and retrieve it', async () => {
    await db.open()
    await addStudent('Taro')
    const students = await getActiveStudents()
    expect(students.some((s) => s.name === 'Taro')).toBe(true)
  })
})
