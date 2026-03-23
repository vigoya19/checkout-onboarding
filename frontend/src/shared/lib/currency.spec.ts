import { formatCurrency } from '@/shared/lib/currency'

describe('formatCurrency', () => {
  it('formats cent values in COP', () => {
    const formatted = formatCurrency(299900000, 'COP')

    expect(formatted).toContain('2.999.000')
  })
})
