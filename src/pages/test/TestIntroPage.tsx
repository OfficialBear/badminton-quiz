import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Field, Input, Surface } from '@/components/ui'
import { useI18n } from '@/i18n/I18nContext'
import { ROUTES } from '@/router/paths'
import {
  NICKNAME_MAX_LENGTH,
  createTestState,
  isValidNickname,
  saveTestState,
} from '@/services/officialTestService'

export function TestIntroPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [unavailable, setUnavailable] = useState(false)

  const start = () => {
    if (!isValidNickname(nickname)) {
      setError(
        nickname.trim().length > NICKNAME_MAX_LENGTH
          ? t('test.nickname.tooLong', { count: NICKNAME_MAX_LENGTH })
          : t('test.nickname.required'),
      )
      return
    }
    const state = createTestState(nickname)
    if (!state) {
      setUnavailable(true)
      return
    }
    saveTestState(state)
    navigate(ROUTES.testPaper)
  }

  return (
    <main className="bg-background flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-[720px] flex-1 flex-col justify-center gap-5 px-4 py-10">
      <h1 className="text-[length:var(--font-size-h1)] text-center font-bold tracking-tight">{t('test.title')}</h1>

      <Surface className="flex flex-col gap-4">
        <p className="leading-relaxed">{t('test.intro')}</p>
        <ul className="text-muted-foreground flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed">
          <li>{t('test.paperSize')}</li>
          <li>{t('test.timeLimit')}</li>
          <li>{t('test.scoring')}</li>
          <li>{t('test.discipline')}</li>
        </ul>
      </Surface>

      {unavailable ? <Alert variant="warning" title={t('test.unavailable')} /> : null}

      <Surface className="flex flex-col gap-3">
        <Field
          label={t('test.nickname.label')}
          htmlFor="test-nickname"
          error={error ?? undefined}
        >
          <Input
            id="test-nickname"
            value={nickname}
            maxLength={NICKNAME_MAX_LENGTH}
            placeholder={t('test.nickname.placeholder')}
            onChange={(event) => {
              setNickname(event.target.value)
              setError(null)
            }}
          />
        </Field>
        <p className="text-muted-foreground text-xs leading-relaxed">{t('test.nickname.note')}</p>
        <Button size="lg" onClick={start}>
          {t('test.start')}
        </Button>
      </Surface>
      </div>
    </main>
  )
}
