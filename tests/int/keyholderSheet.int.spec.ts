import { describe, it, expect } from 'vitest'

import { parseKeyholderSheet, normalizeUsername } from '@/utilities/google/keyholders'

/**
 * The keyholder tab is maintained by hand, so parsing has to survive reordered
 * columns, extra columns, @-prefixes, blank rows and whatever the committee
 * types into the ATMK-jäsen column.
 */

describe('parseKeyholderSheet', () => {
  it('matches columns by header name regardless of order or extra columns', () => {
    const sheet = parseKeyholderSheet([
      ['Osoite', 'Nimi', 'Puhelinnumero', 'ATMK-jäsen', 'Telegram', 'Telegram ID'],
      ['Jämeräntaival 1', 'Matti Meikäläinen', '+358401234567', '', '@matti', '111'],
      ['Otakaari 2', 'Anna Avain', '+358407654321', 'TRUE', 'anna', ''],
    ])

    expect(sheet.userIdColumn).toBe('F')
    expect(sheet.rows).toEqual([
      {
        rowNumber: 2,
        name: 'Matti Meikäläinen',
        username: 'matti',
        telegramUserId: '111',
        isCommittee: false,
        email: '',
      },
      {
        rowNumber: 3,
        name: 'Anna Avain',
        username: 'anna',
        telegramUserId: '',
        isCommittee: true,
        email: '',
      },
    ])
  })

  it('reads the real Avaimelliset header row', () => {
    const sheet = parseKeyholderSheet([
      ['Nimi', 'ATMK-jäsen', 'Telegram', 'Puhelinnumero', 'Sähköposti', 'Osoite', 'Telegram UUID'],
      ['Matti Meikäläinen', 'TOSI', '@matti', '+358401234567', 'matti@example.com', 'JMT 1', ''],
    ])

    expect(sheet.userIdColumn).toBe('G')
    expect(sheet.rows).toEqual([
      {
        rowNumber: 2,
        name: 'Matti Meikäläinen',
        username: 'matti',
        telegramUserId: '',
        isCommittee: true,
        email: 'matti@example.com',
      },
    ])
  })

  it('reads the email column by its other spellings', () => {
    const sheet = parseKeyholderSheet([
      ['Nimi', 'Telegram', 'Email'],
      ['A', '@a', ' a@example.com '],
    ])

    expect(sheet.rows[0].email).toBe('a@example.com')
  })

  it('accepts the Finnish header spellings and several truthy markers', () => {
    const sheet = parseKeyholderSheet([
      ['Nimi', 'ATMK-jäsen', 'Telegram', 'Telegram ID (automaattinen)'],
      ['A', 'x', '@a', ''],
      ['B', 'Kyllä', '@b', ''],
      ['C', '1', '@c', ''],
      ['D', 'TOSI', '@d', ''], // what a checkbox returns in a Finnish sheet
      ['E', 'EPÄTOSI', '@e', ''],
      ['F', 'ei', '@f', ''],
    ])

    expect(sheet.userIdColumn).toBe('D')
    expect(sheet.rows.map((row) => row.isCommittee)).toEqual([true, true, true, true, false, false])
  })

  it('reports no ID column when the committee has not added one', () => {
    const sheet = parseKeyholderSheet([
      ['Nimi', 'Telegram'],
      ['A', '@a'],
    ])

    expect(sheet.userIdColumn).toBeNull()
    expect(sheet.rows[0].telegramUserId).toBe('')
  })

  it('skips fully blank rows and keeps 1-based row numbers for the rest', () => {
    const sheet = parseKeyholderSheet([
      ['Nimi', 'Telegram', 'Telegram ID'],
      ['A', '@a', ''],
      ['', '', ''],
      ['C', '@c', ''],
    ])

    expect(sheet.rows.map((row) => [row.name, row.rowNumber])).toEqual([
      ['A', 2],
      ['C', 4],
    ])
  })

  it('refuses a tab without the columns it needs', () => {
    expect(() => parseKeyholderSheet([['Avaintyyppi', 'Avainleima', 'Status']])).toThrow(/Nimi/)
  })
})

describe('normalizeUsername', () => {
  it('strips the @ and folds case', () => {
    expect(normalizeUsername('@Matti')).toBe('matti')
    expect(normalizeUsername('  matti ')).toBe('matti')
    expect(normalizeUsername(undefined)).toBe('')
  })

  it('ignores a Telegram id that is not a plain number', () => {
    // A committee member typing a placeholder into the id column must not lock
    // that person out: the row has to stay claimable by username.
    const { rows } = parseKeyholderSheet([
      ['Nimi', 'ATMK-jäsen', 'Telegram', 'Telegram UUID'],
      ['Jaakko Laitinen', 'EPÄTOSI', '@jaakko', '??'],
      ['Anna Avaimellinen', 'TOSI', '@anna', ' 123456789 '],
      ['Pekka Placeholder', 'EPÄTOSI', '@pekka', 'ei tiedossa'],
    ])

    expect(rows[0].telegramUserId).toBe('')
    expect(rows[1].telegramUserId).toBe('123456789')
    expect(rows[2].telegramUserId).toBe('')
  })
})
