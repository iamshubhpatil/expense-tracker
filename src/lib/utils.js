// import { format } from 'date-fns'

// Currency configuration
const currencyConfig = {
  USD: { symbol: '$', locale: 'en-US' },
  INR: { symbol: '₹', locale: 'en-IN' },
  EUR: { symbol: '€', locale: 'de-DE' },
  GBP: { symbol: '£', locale: 'en-GB' },
  JPY: { symbol: '¥', locale: 'ja-JP' },
  CNY: { symbol: '¥', locale: 'zh-CN' },
  AUD: { symbol: 'A$', locale: 'en-AU' },
  CAD: { symbol: 'C$', locale: 'en-CA' },
  CHF: { symbol: 'CHF', locale: 'de-CH' },
  SGD: { symbol: 'S$', locale: 'en-SG' },
  BRL: { symbol: 'R$', locale: 'pt-BR' },
  KRW: { symbol: '₩', locale: 'ko-KR' },
}

// Get user's preferred currency from localStorage or default to USD
export const getPreferredCurrency = () => {
  return localStorage.getItem('preferredCurrency') || 'INR'
}

// Set user's preferred currency
export const setPreferredCurrency = (currency) => {
  localStorage.setItem('preferredCurrency', currency)
  return currency
}

// Get available currencies
export const getAvailableCurrencies = () => Object.keys(currencyConfig)

// Get currency symbol
export const getCurrencySymbol = (currency) => {
  return currencyConfig[currency]?.symbol || currencyConfig.INR.symbol
}

export const formatCurrency = (value, currency = null) => {
  const numValue = Number(value) || 0
  const selectedCurrency = currency || getPreferredCurrency()
  const config = currencyConfig[selectedCurrency] || currencyConfig.USD
  return `${config.symbol}${numValue.toFixed(2)}`
}

export const formatDate = (date) => {
  try {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  } catch (error) {
    return date
  }
}

export const formatDateTime = (date) => {
  try {
    const d = new Date(date)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } catch (error) {
    return date
  }
}

// Convert ISO or Date to a string suitable for <input type="datetime-local"> (YYYY-MM-DDTHH:mm)
export const toDatetimeLocal = (isoOrDate) => {
  if (!isoOrDate) return ''
  const d = new Date(isoOrDate)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

// Convert a datetime-local value (YYYY-MM-DDTHH:mm) to an ISO string without timezone shift.
// This preserves the local date/time values when sending them to the backend.
export const localToISOString = (localValue) => {
  if (!localValue) return null
  const d = typeof localValue === 'string' ? new Date(localValue) : new Date(localValue)
  if (Number.isNaN(d.getTime())) return null
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`
}

export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
