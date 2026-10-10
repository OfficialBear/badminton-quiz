import { useTheme } from '@/theme/ThemeContext'
import { useI18n } from '@/i18n/I18nContext'
import { SegmentedControl } from '@/components/ui'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()

  return (
    <SegmentedControl
      ariaLabel={t('common.theme')}
      size="sm"
      value={theme}
      onChange={(value) => {
        if (value === 'light' || value === 'dark' || value === 'system') setTheme(value)
      }}
      options={[
        { value: 'light', label: t('common.theme.light') },
        { value: 'dark', label: t('common.theme.dark') },
        { value: 'system', label: t('common.theme.system') },
      ]}
    />
  )
}
