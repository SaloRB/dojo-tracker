import { describe, it, expect, beforeEach } from 'vitest'
import { db, addStudent, archiveStudent, unarchiveStudent, getActiveStudents, getArchivedStudents } from '../db.js'

beforeEach(async () => {
  await db.students.clear()
  await db.movements.clear()
})

describe('archiveStudent', () => {
  it('excluye al alumno de la lista de activos', async () => {
    const id = await addStudent('Ana')
    await archiveStudent(id)
    const activos = await getActiveStudents()
    expect(activos.some((s) => s.id === id)).toBe(false)
  })

  it('incluye al alumno en la lista de archivados', async () => {
    const id = await addStudent('Ana')
    await archiveStudent(id)
    const archivados = await getArchivedStudents()
    expect(archivados.some((s) => s.id === id)).toBe(true)
  })
})

describe('unarchiveStudent', () => {
  it('devuelve al alumno a la lista de activos', async () => {
    const id = await addStudent('Ana')
    await archiveStudent(id)
    await unarchiveStudent(id)
    const activos = await getActiveStudents()
    expect(activos.some((s) => s.id === id)).toBe(true)
  })

  it('no crea un nuevo registro — el alumno mantiene su id original', async () => {
    const id = await addStudent('Ana')
    await archiveStudent(id)
    await unarchiveStudent(id)
    const activos = await getActiveStudents()
    const alumno = activos.find((s) => s.name === 'Ana')
    expect(alumno.id).toBe(id)
    expect(activos.filter((s) => s.name === 'Ana')).toHaveLength(1)
  })
})
