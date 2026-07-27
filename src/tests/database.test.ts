import { beforeEach, describe, expect, it } from 'vitest'
import { db, defaultSettings, getSettings } from '../db/database'

describe('ajustes de la base de datos', () => {
  beforeEach(async () => {
    await db.settings.clear()
  })

  it('devuelve los ajustes predeterminados sin escribir desde una consulta', async () => {
    expect(await getSettings()).toEqual(defaultSettings)
    expect(await db.settings.count()).toBe(0)
  })

  it('devuelve los ajustes guardados cuando existen', async () => {
    const saved = { ...defaultSettings, nickname: 'Josema', onboardingDone: true }
    await db.settings.put(saved)
    expect(await getSettings()).toEqual(saved)
  })
})
