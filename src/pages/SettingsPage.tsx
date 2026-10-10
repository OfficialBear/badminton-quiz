import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon, DownloadIcon, TrashIcon } from '@/components/icons'
import { Alert, Button, Dialog, IconButton, SectionHeader, Surface } from '@/components/ui'
import { useI18n } from '@/i18n/I18nContext'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/layout/ThemeSwitcher'
import { APP_VERSION } from '@/config'
import { QUESTION_BANK_VERSION, RULE_VERSION } from '@/data/questionBank'
import { ROUTES } from '@/router/paths'
import { clearAttempts, clearReview, exportData } from '@/services/storageService'

type PendingAction = 'attempts' | 'review' | null

export function SettingsPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingAction>(null)

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `badminton-iq-${Date.now()}.json`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
    setMessage(t('settings.data.exported'))
  }

  const confirmPending = () => {
    if (pending === 'attempts') clearAttempts()
    if (pending === 'review') clearReview()
    setPending(null)
  }

  const goBack = () => {
    const state = window.history.state as { idx?: number } | null
    if (state && typeof state.idx === 'number' && state.idx > 0) {
      navigate(-1)
    } else {
      navigate(ROUTES.home)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col gap-5">
      <div className="flex items-center gap-2">
        <IconButton label={t('common.back')} onClick={goBack}>
          <ChevronLeftIcon />
        </IconButton>
        <h1 className="text-[length:var(--font-size-h1)] font-bold tracking-tight">
          {t('settings.title')}
        </h1>
      </div>

      {message ? <Alert variant="info" title={message} /> : null}

      <Surface>
        <SectionHeader title={t('settings.appearance')} />
        <div className="mt-4 flex flex-col">
          <div className="border-[var(--color-divider)] flex items-center justify-between gap-3 border-b py-3 last:border-b-0 max-sm:flex-col max-sm:items-start">
            <span className="text-muted-foreground">{t('settings.language.label')}</span>
            <LanguageSwitcher />
          </div>
          <div className="border-[var(--color-divider)] flex items-center justify-between gap-3 border-b py-3 last:border-b-0 max-sm:flex-col max-sm:items-start">
            <span className="text-muted-foreground">{t('settings.theme.label')}</span>
            <ThemeSwitcher />
          </div>
        </div>
      </Surface>

      <Surface>
        <SectionHeader title={t('settings.data')} description={t('settings.data.description')} />
        <div className="mt-4 grid grid-cols-2 gap-2 max-sm:grid-cols-1">
          <Button
            fullWidth
            variant="secondary"
            onClick={handleExport}
            className="col-span-2 max-sm:col-span-1"
          >
            <DownloadIcon size={18} />
            {t('settings.data.export')}
          </Button>
          <Button fullWidth variant="secondary" onClick={() => setPending('attempts')}>
            <TrashIcon size={18} />
            {t('settings.data.clearAttempts')}
          </Button>
          <Button fullWidth variant="secondary" onClick={() => setPending('review')}>
            <TrashIcon size={18} />
            {t('settings.data.clearReview')}
          </Button>
        </div>
      </Surface>

      <Surface>
        <SectionHeader title={t('settings.about')} />
        <dl className="mt-4 flex flex-col gap-2">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t('settings.version')}</dt>
            <dd className="font-medium">{APP_VERSION}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t('settings.bankVersion')}</dt>
            <dd className="font-medium">{QUESTION_BANK_VERSION}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t('settings.ruleVersion')}</dt>
            <dd className="font-medium">
              {RULE_VERSION === 'pending' ? t('settings.ruleVersion.pending') : RULE_VERSION}
            </dd>
          </div>
        </dl>
      </Surface>

      <Dialog
        open={pending !== null}
        onClose={() => setPending(null)}
        title={t('settings.data.clearConfirm.title')}
        closeLabel={t('common.close')}
        description={t('settings.data.clearConfirm.body')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPending(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={confirmPending}>
              {t('common.delete')}
            </Button>
          </>
        }
      />
    </div>
  )
}
