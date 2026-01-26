'use client'

import React, { useEffect, useState } from 'react'
import type { AccessRequestFormBlock as AccessRequestFormBlockProps } from '@/payload-types'
import RichText from '@/components/RichText'

interface ReservationTarget {
  id: string
  emailPrefix: string
  labelFi: string
  labelEn: string
  category: string
}

interface FormData {
  targetId: string
  name: string
  email: string
  phone: string
  telegram: string
  address: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  participants: string
  useType: string
  details: string
}

interface FormErrors {
  [key: string]: string
}

const translations = {
  fi: {
    selectTarget: 'Valitse kohde',
    name: 'Nimi',
    email: 'Sähköposti',
    phone: 'Puhelin',
    telegram: 'Telegram-käyttäjänimi',
    address: 'Osoite',
    startDate: 'Alkupäivä',
    endDate: 'Loppupäivä',
    startTime: 'Alkuaika',
    endTime: 'Loppuaika',
    participants: 'Osallistujien määrä',
    useType: 'Käyttötarkoitus',
    details: 'Lisätiedot',
    submit: 'Lähetä käyttöpyyntö',
    submitting: 'Lähetetään...',
    required: 'Pakollinen kenttä',
    invalidEmail: 'Virheellinen sähköpostiosoite',
    invalidDate: 'Virheellinen päivämäärä (PP.KK.VVVV)',
    invalidTime: 'Virheellinen aika (TT:MM)',
    successTitle: 'Käyttöpyyntö lähetetty!',
    errorTitle: 'Virhe',
    loadingTargets: 'Ladataan kohteita...',
    noTargets: 'Ei kohteita saatavilla',
    category: {
      'club-room': 'Kerhohuoneet',
      workshop: 'Pajat',
      'music-room': 'Soittohuoneet',
      storage: 'Varastot',
      equipment: 'Välineet',
    },
    placeholders: {
      name: 'Etunimi Sukunimi',
      email: 'nimi@esimerkki.fi',
      phone: '+358 40 123 4567',
      telegram: '@kayttajanimi',
      address: 'Katuosoite, Postinumero Kaupunki',
      date: 'PP.KK.VVVV',
      time: 'TT:MM',
      participants: 'esim. 5',
      useType: 'esim. Kerhoilta, Bänditreenit, Työpaja',
      details: 'Lisätietoja varauksesta...',
    },
  },
  en: {
    selectTarget: 'Select target',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    telegram: 'Telegram username',
    address: 'Address',
    startDate: 'Start date',
    endDate: 'End date',
    startTime: 'Start time',
    endTime: 'End time',
    participants: 'Number of participants',
    useType: 'Purpose of use',
    details: 'Additional details',
    submit: 'Send access request',
    submitting: 'Sending...',
    required: 'Required field',
    invalidEmail: 'Invalid email address',
    invalidDate: 'Invalid date (DD.MM.YYYY)',
    invalidTime: 'Invalid time (HH:MM)',
    successTitle: 'Access request sent!',
    errorTitle: 'Error',
    loadingTargets: 'Loading targets...',
    noTargets: 'No targets available',
    category: {
      'club-room': 'Club Rooms',
      workshop: 'Workshops',
      'music-room': 'Music Rooms',
      storage: 'Storage',
      equipment: 'Equipment',
    },
    placeholders: {
      name: 'First Last',
      email: 'name@example.com',
      phone: '+358 40 123 4567',
      telegram: '@username',
      address: 'Street Address, Postal Code City',
      date: 'DD.MM.YYYY',
      time: 'HH:MM',
      participants: 'e.g. 5',
      useType: 'e.g. Club night, Band practice, Workshop',
      details: 'Additional information about the reservation...',
    },
  },
}

// Validate Finnish date format (DD.MM.YYYY)
const validateDate = (value: string): boolean => {
  if (!value) return false
  const regex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/
  const match = value.match(regex)
  if (!match) return false

  const day = parseInt(match[1], 10)
  const month = parseInt(match[2], 10)
  const year = parseInt(match[3], 10)

  if (month < 1 || month > 12) return false
  if (day < 1 || day > 31) return false
  if (year < 2020 || year > 2100) return false

  return true
}

// Validate time format (HH:MM)
const validateTime = (value: string): boolean => {
  if (!value) return false
  const regex = /^(\d{1,2}):(\d{2})$/
  const match = value.match(regex)
  if (!match) return false

  const hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)

  if (hours < 0 || hours > 23) return false
  if (minutes < 0 || minutes > 59) return false

  return true
}

// Convert Finnish date to ISO format for API
const finnishDateToISO = (finnishDate: string): string => {
  const [day, month, year] = finnishDate.split('.')
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export const AccessRequestFormBlock: React.FC<AccessRequestFormBlockProps> = (props) => {
  const {
    language = 'fi',
    introContent,
    rulesPageLink,
    spacesInfoLink,
    calendarLink,
    confirmationMessage,
  } = props

  const t = translations[language as 'fi' | 'en'] || translations.fi

  const [targets, setTargets] = useState<ReservationTarget[]>([])
  const [loadingTargets, setLoadingTargets] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    targetId: '',
    name: '',
    email: '',
    phone: '',
    telegram: '',
    address: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    participants: '',
    useType: '',
    details: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)

  // Fetch targets on mount
  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const response = await fetch('/api/reservation-targets?where[active][equals]=true&sort=sortOrder&limit=100')
        const data = await response.json()
        setTargets(data.docs || [])
      } catch (error) {
        console.error('Failed to fetch targets:', error)
      } finally {
        setLoadingTargets(false)
      }
    }

    fetchTargets()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.targetId) newErrors.targetId = t.required
    if (!formData.name.trim()) newErrors.name = t.required
    if (!formData.email.trim()) {
      newErrors.email = t.required
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.invalidEmail
    }
    if (!formData.startDate.trim()) {
      newErrors.startDate = t.required
    } else if (!validateDate(formData.startDate)) {
      newErrors.startDate = t.invalidDate
    }
    if (!formData.endDate.trim()) {
      newErrors.endDate = t.required
    } else if (!validateDate(formData.endDate)) {
      newErrors.endDate = t.invalidDate
    }
    if (!formData.startTime.trim()) {
      newErrors.startTime = t.required
    } else if (!validateTime(formData.startTime)) {
      newErrors.startTime = t.invalidTime
    }
    if (!formData.endTime.trim()) {
      newErrors.endTime = t.required
    } else if (!validateTime(formData.endTime)) {
      newErrors.endTime = t.invalidTime
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      const response = await fetch('/api/access-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          language,
          startDate: finnishDateToISO(formData.startDate),
          endDate: finnishDateToISO(formData.endDate),
          participants: formData.participants ? parseInt(formData.participants, 10) : undefined,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitResult({ success: true, message: data.message })
        // Reset form
        setFormData({
          targetId: '',
          name: '',
          email: '',
          phone: '',
          telegram: '',
          address: '',
          startDate: '',
          endDate: '',
          startTime: '',
          endTime: '',
          participants: '',
          useType: '',
          details: '',
        })
      } else {
        setSubmitResult({ success: false, message: data.error || 'An error occurred' })
      }
    } catch (error) {
      console.error('Submit error:', error)
      setSubmitResult({
        success: false,
        message: language === 'fi' ? 'Virhe lähetyksessä' : 'Submission error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Group targets by category
  const groupedTargets = targets.reduce(
    (acc, target) => {
      const category = target.category
      if (!acc[category]) acc[category] = []
      acc[category].push(target)
      return acc
    },
    {} as Record<string, ReservationTarget[]>,
  )

  const inputClassName =
    'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
  const labelClassName = 'block text-sm font-medium text-gray-700 mb-1'
  const errorClassName = 'text-red-600 text-sm mt-1'

  return (
    <div className="container my-16">
      {/* Intro Content */}
      {introContent && (
        <div className="mb-8">
          <RichText data={introContent} enableGutter={false} />
        </div>
      )}

      {/* Quick Links */}
      {(rulesPageLink || spacesInfoLink || calendarLink) && (
        <div className="mb-8 flex flex-wrap gap-4">
          {rulesPageLink && (
            <a
              href={rulesPageLink}
              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              {language === 'fi' ? 'Säännöt' : 'Rules'}
            </a>
          )}
          {spacesInfoLink && (
            <a
              href={spacesInfoLink}
              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              {language === 'fi' ? 'Tilat' : 'Spaces'}
            </a>
          )}
          {calendarLink && (
            <a
              href={calendarLink}
              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              {language === 'fi' ? 'Kalenteri' : 'Calendar'}
            </a>
          )}
        </div>
      )}

      {/* Success/Error Message */}
      {submitResult && (
        <div
          className={`mb-8 p-4 rounded-lg ${
            submitResult.success
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <h3 className="font-bold mb-2">
            {submitResult.success ? t.successTitle : t.errorTitle}
          </h3>
          {submitResult.success && confirmationMessage ? (
            <RichText data={confirmationMessage} enableGutter={false} />
          ) : (
            <p>{submitResult.message}</p>
          )}
        </div>
      )}

      {/* Form */}
      {!submitResult?.success && (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          {/* Target Selection */}
          <div>
            <label htmlFor="targetId" className={labelClassName}>
              {t.selectTarget} *
            </label>
            {loadingTargets ? (
              <p className="text-gray-500">{t.loadingTargets}</p>
            ) : targets.length === 0 ? (
              <p className="text-gray-500">{t.noTargets}</p>
            ) : (
              <select
                id="targetId"
                name="targetId"
                value={formData.targetId}
                onChange={handleChange}
                className={inputClassName}
              >
                <option value="">{t.selectTarget}</option>
                {Object.entries(groupedTargets).map(([category, categoryTargets]) => (
                  <optgroup
                    key={category}
                    label={t.category[category as keyof typeof t.category] || category}
                  >
                    {categoryTargets.map((target) => (
                      <option key={target.id} value={target.id}>
                        {language === 'fi' ? target.labelFi : target.labelEn}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
            {errors.targetId && <p className={errorClassName}>{errors.targetId}</p>}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className={labelClassName}>
                {t.name} *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t.placeholders.name}
                className={inputClassName}
              />
              {errors.name && <p className={errorClassName}>{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className={labelClassName}>
                {t.email} *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t.placeholders.email}
                className={inputClassName}
              />
              {errors.email && <p className={errorClassName}>{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className={labelClassName}>
                {t.phone}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t.placeholders.phone}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="telegram" className={labelClassName}>
                {t.telegram}
              </label>
              <input
                type="text"
                id="telegram"
                name="telegram"
                value={formData.telegram}
                onChange={handleChange}
                placeholder={t.placeholders.telegram}
                className={inputClassName}
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className={labelClassName}>
              {t.address}
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder={t.placeholders.address}
              className={inputClassName}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className={labelClassName}>
                {t.startDate} *
              </label>
              <input
                type="text"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                placeholder={t.placeholders.date}
                className={inputClassName}
              />
              {errors.startDate && <p className={errorClassName}>{errors.startDate}</p>}
            </div>

            <div>
              <label htmlFor="endDate" className={labelClassName}>
                {t.endDate} *
              </label>
              <input
                type="text"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                placeholder={t.placeholders.date}
                className={inputClassName}
              />
              {errors.endDate && <p className={errorClassName}>{errors.endDate}</p>}
            </div>

            <div>
              <label htmlFor="startTime" className={labelClassName}>
                {t.startTime} *
              </label>
              <input
                type="text"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                placeholder={t.placeholders.time}
                className={inputClassName}
              />
              {errors.startTime && <p className={errorClassName}>{errors.startTime}</p>}
            </div>

            <div>
              <label htmlFor="endTime" className={labelClassName}>
                {t.endTime} *
              </label>
              <input
                type="text"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                placeholder={t.placeholders.time}
                className={inputClassName}
              />
              {errors.endTime && <p className={errorClassName}>{errors.endTime}</p>}
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="participants" className={labelClassName}>
                {t.participants}
              </label>
              <input
                type="number"
                id="participants"
                name="participants"
                value={formData.participants}
                onChange={handleChange}
                placeholder={t.placeholders.participants}
                min="1"
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="useType" className={labelClassName}>
                {t.useType}
              </label>
              <input
                type="text"
                id="useType"
                name="useType"
                value={formData.useType}
                onChange={handleChange}
                placeholder={t.placeholders.useType}
                className={inputClassName}
              />
            </div>
          </div>

          <div>
            <label htmlFor="details" className={labelClassName}>
              {t.details}
            </label>
            <textarea
              id="details"
              name="details"
              value={formData.details}
              onChange={handleChange}
              placeholder={t.placeholders.details}
              rows={4}
              className={inputClassName}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || loadingTargets}
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? t.submitting : t.submit}
          </button>
        </form>
      )}
    </div>
  )
}
