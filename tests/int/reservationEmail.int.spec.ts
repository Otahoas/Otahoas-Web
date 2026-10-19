import { describe, it, expect } from 'vitest'

import type { ReservationTarget } from '@/payload-types'
import type { AccessRequestBody } from '@/utilities/reservationMessage'
import {
  buildReservationEmail,
  DEFAULT_REPLY_TO,
  fillPlaceholders,
  pickReplyTo,
} from '@/utilities/reservationEmail'

const target = { labelFi: 'Kerhohuone', labelEn: 'Club room' } as ReservationTarget

const request = (overrides: Partial<AccessRequestBody> = {}): AccessRequestBody => ({
  targetId: '1',
  language: 'fi',
  name: 'Maija Meikäläinen',
  email: 'maija@example.com',
  startDate: '2026-11-01',
  endDate: '2026-11-01',
  startTime: '18:00',
  endTime: '22:00',
  ...overrides,
})

const decider = { name: 'Anna Avain', email: 'anna@example.com', telegram: 'anna' }

describe('buildReservationEmail', () => {
  it('confirms a received request in Finnish without a contact block', () => {
    const email = buildReservationEmail({ type: 'received', data: request(), target })

    expect(email.subject).toBe('Varauspyyntö vastaanotettu: Kerhohuone')
    expect(email.text).toContain('Hei Maija Meikäläinen')
    expect(email.text).toContain('Alkaa: 01.11.2026 18:00')
    expect(email.text).not.toContain('Yhteyshenkilö')
  })

  it('gives the accepted requester the decider as a contact, in their language', () => {
    const email = buildReservationEmail({
      type: 'accepted',
      data: request({ language: 'en' }),
      target,
      decider,
    })

    expect(email.subject).toBe('Reservation accepted: Club room')
    expect(email.html).toContain('<a href="https://t.me/anna">@anna</a>')
    expect(email.html).toContain('<a href="mailto:anna@example.com">anna@example.com</a>')
    expect(email.text).toContain('Contact person:\nAnna Avain')
  })

  it('names the decider on a decline too, with the reason when there is one', () => {
    const email = buildReservationEmail({
      type: 'declined',
      data: request(),
      target,
      decider: { name: 'Pekka', telegram: '@pekka' },
      declineReason: 'Tila on remontissa',
    })

    expect(email.text).toContain('Syy: Tila on remontissa')
    expect(email.text).toContain('Telegram: @pekka')
    // No email on file: the line is left out rather than shown empty.
    expect(email.text).not.toContain('Sähköposti: \n')
  })

  it('uses the edited wording and keeps the details the code adds', () => {
    const email = buildReservationEmail({
      type: 'accepted',
      data: request(),
      target,
      decider,
      template: {
        subject: 'Varaus {space}\n{start}',
        intro: 'Moi {name}! {decidedBy} avaa oven. {typo}',
      },
    })

    expect(email.subject).toBe('Varaus Kerhohuone 01.11.2026 18:00')
    expect(email.text).toContain('Moi Maija Meikäläinen! Anna Avain avaa oven. {typo}')
    expect(email.text).toContain('Varauksen tiedot:')
    expect(email.text).toContain('Yhteyshenkilö:')
  })

  it('falls back to the default when a text is left empty', () => {
    const email = buildReservationEmail({
      type: 'received',
      data: request(),
      target,
      template: { subject: '  ', intro: null },
    })

    expect(email.subject).toBe('Varauspyyntö vastaanotettu: Kerhohuone')
  })

  it('escapes what the requester typed', () => {
    const email = buildReservationEmail({
      type: 'received',
      data: request({ name: '<script>x</script>', details: 'a & b' }),
      target,
    })

    expect(email.html).not.toContain('<script>')
    expect(email.html).toContain('&lt;script&gt;x&lt;/script&gt;')
    expect(email.html).toContain('a &amp; b')
  })

  it('closes with the committee signature and says where a reply goes', () => {
    const received = buildReservationEmail({ type: 'received', data: request(), target })
    const accepted = buildReservationEmail({ type: 'accepted', data: request(), target, decider })

    expect(received.text).toContain('tavoitat asukastoimikunnan')
    expect(accepted.text).toContain('tavoitat yhteyshenkilön')
    expect(received.text).toContain('OtaHoas – Otaniemen asukastoimikunta')
    expect(received.html).toContain('<a href="mailto:otahoas@otahoas.fi">otahoas@otahoas.fi</a>')
    expect(received.html).toContain('<a href="https://otahoas.fi">https://otahoas.fi</a>')
  })

  it('says replies reach the committee when the contact has no email', () => {
    const email = buildReservationEmail({
      type: 'declined',
      data: request(),
      target,
      decider: { name: 'Pekka', telegram: 'pekka' },
    })

    expect(email.text).toContain('tavoitat asukastoimikunnan')
  })

  it('uses an edited signature, escaped', () => {
    const email = buildReservationEmail({
      type: 'received',
      data: request({ language: 'en' }),
      target,
      signature: 'Cheers <b>team</b>\nhallitus@otahoas.fi',
    })

    expect(email.text).toContain('--\nCheers <b>team</b>')
    expect(email.html).toContain('Cheers &lt;b&gt;team&lt;/b&gt;')
    expect(email.html).toContain('<a href="mailto:hallitus@otahoas.fi">')
    expect(email.text).not.toContain('Best regards')
  })
})

describe('pickReplyTo', () => {
  it('replies to the contact person once someone has decided', () => {
    expect(pickReplyTo('accepted', decider, DEFAULT_REPLY_TO)).toBe('anna@example.com')
    expect(pickReplyTo('declined', decider, DEFAULT_REPLY_TO)).toBe('anna@example.com')
  })

  it('replies to the committee before a decision or without a contact email', () => {
    expect(pickReplyTo('received', decider, DEFAULT_REPLY_TO)).toBe(DEFAULT_REPLY_TO)
    expect(pickReplyTo('accepted', { name: 'Pekka', email: ' ' }, DEFAULT_REPLY_TO)).toBe(
      DEFAULT_REPLY_TO,
    )
  })
})

describe('fillPlaceholders', () => {
  it('leaves unknown placeholders visible', () => {
    expect(fillPlaceholders('{a} {b}', { a: '1' })).toBe('1 {b}')
  })
})
