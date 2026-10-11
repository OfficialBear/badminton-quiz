import { describe, expect, it } from 'vitest'
import { DEFAULT_LANGUAGE, checkTranslationParity, en, translate, zh } from '@/i18n'
import type { MessageKey } from '@/i18n'

describe('i18n', () => {
  it('defaults to Chinese', () => {
    expect(DEFAULT_LANGUAGE).toBe('zh')
  })

  it('has identical key sets in zh and en', () => {
    const { missingInEn, missingInZh } = checkTranslationParity()
    expect(missingInEn).toEqual([])
    expect(missingInZh).toEqual([])
  })

  it('translates a known key for each language', () => {
    expect(translate('zh', 'nav.home')).toBe(zh['nav.home'])
    expect(translate('en', 'nav.home')).toBe(en['nav.home'])
    expect(translate('en', 'nav.home')).not.toBe(translate('zh', 'nav.home'))
  })

  it('returns the key itself and does not throw for an unknown key', () => {
    const unknown = 'does.not.exist' as MessageKey
    expect(translate('zh', unknown)).toBe('does.not.exist')
  })

  it('leaves templates without placeholders unchanged when params are passed', () => {
    expect(translate('en', 'nav.home', { unused: 'x' })).toBe(en['nav.home'])
  })

  it('has no empty or placeholder translation values in either language', () => {
    const keys = Object.keys(zh) as MessageKey[]
    for (const key of keys) {
      expect(zh[key].trim(), `zh:${key}`).not.toBe('')
      expect(en[key].trim(), `en:${key}`).not.toBe('')
    }
  })

  it('translates the vast majority of keys rather than copying the Chinese text', () => {
    const keys = Object.keys(zh) as MessageKey[]
    const untranslated = keys.filter((key) => en[key] === zh[key])
    expect(untranslated.length).toBeLessThan(keys.length * 0.1)
  })
})
