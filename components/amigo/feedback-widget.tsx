'use client'

import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/lib/i18n/language-context'
import { submitFeedback, type FeedbackInput } from '@/lib/admin/actions'
import type { FeedbackContactMethod, FeedbackType } from '@/lib/admin/types'

const COPY = {
  ar: {
    open: 'شكوى أو اقتراح',
    title: 'قولنا رأيك',
    subtitle: 'شكوتك أو اقتراحك بيوصل مباشرة لإدارة أميجو.',
    typeLabel: 'نوع الرسالة',
    complaint: 'شكوى',
    suggestion: 'اقتراح',
    nameLabel: 'اسمك (اختياري)',
    namePlaceholder: 'مثال: محمد',
    contactLabel: 'طريقة التواصل (اختياري)',
    none: 'بدون',
    phone: 'تليفون',
    whatsapp: 'واتساب',
    email: 'إيميل',
    instagram: 'إنستجرام',
    contactValuePlaceholder: 'بياناتك للتواصل',
    messageLabel: 'رسالتك',
    messagePlaceholder: 'اكتب شكوتك أو اقتراحك بالتفصيل...',
    send: 'إرسال',
    sending: 'جاري الإرسال...',
    successTitle: 'وصلتنا رسالتك',
    successBody: 'شكراً ليك! هنراجعها في أقرب وقت.',
    again: 'إرسال رسالة تانية',
    close: 'إغلاق',
    required: 'من فضلك اكتب رسالتك',
  },
  en: {
    open: 'Feedback',
    title: 'Tell us what you think',
    subtitle: 'Your complaint or suggestion goes straight to Amigo management.',
    typeLabel: 'Message type',
    complaint: 'Complaint',
    suggestion: 'Suggestion',
    nameLabel: 'Your name (optional)',
    namePlaceholder: 'e.g. Mohamed',
    contactLabel: 'Contact method (optional)',
    none: 'None',
    phone: 'Phone',
    whatsapp: 'WhatsApp',
    email: 'Email',
    instagram: 'Instagram',
    contactValuePlaceholder: 'Your contact details',
    messageLabel: 'Your message',
    messagePlaceholder: 'Describe your complaint or suggestion...',
    send: 'Send',
    sending: 'Sending...',
    successTitle: 'Message received',
    successBody: 'Thank you! We will review it shortly.',
    again: 'Send another',
    close: 'Close',
    required: 'Please write your message',
  },
}

const CONTACT_METHODS: FeedbackContactMethod[] = [
  'none',
  'phone',
  'whatsapp',
  'email',
  'instagram',
]

export function FeedbackWidget() {
  const { locale, dir } = useLanguage()
  const c = COPY[locale === 'ar' ? 'ar' : 'en']

  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [type, setType] = useState<FeedbackType>('complaint')
  const [name, setName] = useState('')
  const [contactMethod, setContactMethod] = useState<FeedbackContactMethod>('none')
  const [contactValue, setContactValue] = useState('')
  const [message, setMessage] = useState('')

  const dialogRef = useRef<HTMLDivElement>(null)

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Lock body scroll while open.
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [open])

  function resetForm() {
    setType('complaint')
    setName('')
    setContactMethod('none')
    setContactValue('')
    setMessage('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (message.trim().length < 3) {
      setError(c.required)
      return
    }
    setPending(true)
    setError(null)
    const payload: FeedbackInput = {
      type,
      name,
      contact_method: contactMethod,
      contact_value: contactValue,
      message,
    }
    const res = await submitFeedback(payload)
    setPending(false)
    if (!res.ok) {
      setError(res.error ?? c.required)
      return
    }
    setDone(true)
    resetForm()
  }

  const contactLabels: Record<FeedbackContactMethod, string> = {
    none: c.none,
    phone: c.phone,
    whatsapp: c.whatsapp,
    email: c.email,
    instagram: c.instagram,
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => {
          setOpen(true)
          setDone(false)
        }}
        aria-label={c.open}
        className="fixed bottom-5 z-[60] flex items-center gap-2 rounded-full bg-[var(--caramel)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/30 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ltr:right-5 rtl:left-5"
      >
        <ChatIcon />
        <span className="hidden sm:inline">{c.open}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={c.title}
          dir={dir}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label={c.close}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Panel */}
          <div
            ref={dialogRef}
            className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#1a1410] p-6 text-white shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={c.close}
              className="absolute top-4 text-white/50 transition-colors hover:text-white ltr:right-4 rtl:left-4"
            >
              <CloseIcon />
            </button>

            {done ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--caramel)]/20 text-[var(--caramel)]">
                  <CheckIcon />
                </div>
                <h2 className="font-heading text-2xl">{c.successTitle}</h2>
                <p className="text-sm leading-relaxed text-white/60">{c.successBody}</p>
                <div className="mt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDone(false)}
                    className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/5"
                  >
                    {c.again}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg bg-[var(--caramel)] px-4 py-2 text-sm font-semibold text-white"
                  >
                    {c.close}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <header className="ltr:pr-8 rtl:pl-8">
                  <h2 className="font-heading text-2xl">{c.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-white/55">{c.subtitle}</p>
                </header>

                {/* Type toggle */}
                <div>
                  <span className="mb-2 block text-xs font-medium text-white/60">
                    {c.typeLabel}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['complaint', 'suggestion'] as FeedbackType[]).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setType(opt)}
                        className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                          type === opt
                            ? 'border-[var(--caramel)] bg-[var(--caramel)]/15 text-white'
                            : 'border-white/12 text-white/60 hover:border-white/25'
                        }`}
                      >
                        {opt === 'complaint' ? c.complaint : c.suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-white/60">
                    {c.nameLabel}
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={c.namePlaceholder}
                    className="w-full rounded-lg border border-white/12 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[var(--caramel)] focus:outline-none"
                  />
                </label>

                {/* Contact method */}
                <div>
                  <span className="mb-1.5 block text-xs font-medium text-white/60">
                    {c.contactLabel}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {CONTACT_METHODS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setContactMethod(m)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          contactMethod === m
                            ? 'border-[var(--caramel)] bg-[var(--caramel)]/15 text-white'
                            : 'border-white/12 text-white/55 hover:border-white/25'
                        }`}
                      >
                        {contactLabels[m]}
                      </button>
                    ))}
                  </div>
                  {contactMethod !== 'none' && (
                    <input
                      type="text"
                      value={contactValue}
                      onChange={(e) => setContactValue(e.target.value)}
                      placeholder={c.contactValuePlaceholder}
                      className="mt-2 w-full rounded-lg border border-white/12 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[var(--caramel)] focus:outline-none"
                    />
                  )}
                </div>

                {/* Message */}
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-white/60">
                    {c.messageLabel}
                  </span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={c.messagePlaceholder}
                    rows={4}
                    className="w-full resize-none rounded-lg border border-white/12 bg-black/30 px-3 py-2.5 text-sm leading-relaxed text-white placeholder:text-white/30 focus:border-[var(--caramel)] focus:outline-none"
                  />
                </label>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={pending}
                  className="mt-1 w-full rounded-lg bg-[var(--caramel)] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {pending ? c.sending : c.send}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
