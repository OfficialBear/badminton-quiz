import { useI18n } from '@/i18n/I18nContext'
import { SegmentedControl } from '@/components/ui'
import type { Language } from '@/types/common'

const LANGUAGE_LABELS: Record<Language, string> = {
  zh: '简体中文',
  en: 'English',
}

export function LanguageSwitcher() {
  const { language, setLanguage, t, languages } = useI18n()

  return (
    <SegmentedControl
      ariaLabel={t('common.language')}
      size="sm"
      value={language}
      onChange={(value) => {
        if (value === 'zh' || value === 'en') setLanguage(value)
      }}
      options={languages.map((lang) => ({
        value: lang,
        label: LANGUAGE_LABELS[lang] ?? lang,
      }))}
    />
  )
}
