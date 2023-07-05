import { parse } from '../utils/csv'
import { getFormattedDate } from '../utils/date'

class Subject {
  name: string
  category: string

  constructor(value: string) {
    const s = value.split(':')
    if (s.length < 2) {
      this.name = value
      this.category = value
    } else {
      this.name = s[1]
      this.category = s[0]
    }
  }

  string() {
    if (this.category === '' && this.name === '') {
      return ''
    }
    return `${this.category}:${this.name}`
  }
}

export class Deal {
  id: number
  name: string
  date: Date | undefined
  kari: Subject
  kashi: Subject
  value: number
  comment: string

  constructor(
    id: number,
    name: string,
    kari: string,
    kashi: string,
    value: number,
    date: Date | undefined,
  ) {
    this.id = id
    this.name = name
    this.kari = new Subject(kari)
    this.kashi = new Subject(kashi)
    this.value = value
    this.comment = ''
    this.date = date
  }

  copy() {
    return new Deal(
      this.id,
      this.name,
      this.kari.string(),
      this.kashi.string(),
      this.value,
      this.date,
    )
  }
}

function parseDate(date: string) {
  const isInvalidDate = (date: Date) => Number.isNaN(date.getTime())
  const r = new Date(date)
  if (isInvalidDate(r)) {
    return undefined
  }
  return r
}

export function readCSVToDeal(csv: string) {
  const deals = parse(csv)
  const ret = deals
    .filter(
      (v) =>
        v.length > 4 &&
        v
          .map((v) => v.value)
          .join('')
          .trim() != '',
    )
    .map(
      (v, i) =>
        new Deal(
          i,
          v.length > 4 ? v[4].value : '', // 名目
          v.length > 1 ? v[1].value : '', // 借り
          v.length > 2 ? v[2].value : '', // 貸し
          v.length > 3 ? +v[3].value : 0, // 金額
          v.length > 0 ? parseDate(v[0].value) : new Date(), // 日付
        ),
    )
  return ret
}

export class DealRecord {
  id: number = 0
  month: string = ''
  date: string = ''
  kari: string = ''
  karivalue: number | string = ''
  kashi: string = ''
  kashivalue: number | string = ''
  name: string = ''
  last: boolean = false
}

export const listDeals = (
  deals: Deal[],
  props: { year: string; month: number; subject: string; book: string },
) => {
  const isSameSubject = (subject: string, key: string) => {
    if (key.indexOf(':') >= 0) {
      return subject === key
    }
    return subject.indexOf(key) === 0
  }
  deals = deals.map((d) => d.copy())
  if (props.year !== 'ALL') {
    deals = deals.filter((v) => getFormattedDate(v.date, 'yyyy') === props.year)
  }
  if (props.month !== 0) {
    deals = deals.filter((v) => getFormattedDate(v.date, 'M') === `${props.month}`)
  }
  if (props.subject !== 'ALL') {
    deals = deals.filter((v) => {
      return (
        isSameSubject(v.kari.string(), props.subject) ||
        isSameSubject(v.kashi.string(), props.subject)
      )
    })
  }
  if (props.book === '総勘定元帳') {
    deals = deals.map((v) => {
      if (isSameSubject(v.kari.string(), props.subject)) {
        v.kari.category = ''
        v.kari.name = ''
      }
      if (isSameSubject(v.kashi.string(), props.subject)) {
        v.kashi.category = ''
        v.kashi.name = ''
      }
      return v
    })
  }
  if (props.book === '出納帳') {
    deals = deals.map((v) => {
      if (!isSameSubject(v.kari.string(), props.subject)) {
        v.kari.category = ''
        v.kari.name = ''
      }
      if (!isSameSubject(v.kashi.string(), props.subject)) {
        v.kashi.category = ''
        v.kashi.name = ''
      }
      return v
    })
  }
  return deals
}

export const listSubjects = (
  deals: Deal[],
  props: { year: string; month: number; subject: string },
) => {
  const isSameSubject = (subject: string, key: string) => {
    if (key.indexOf(':') >= 0) {
      return subject === key
    }
    return subject.indexOf(key) === 0
  }
  deals = deals.map((d) => d.copy())
  if (props.year !== 'ALL') {
    deals = deals.filter((v) => getFormattedDate(v.date, 'yyyy') === props.year)
  }
  if (props.month !== 0) {
    deals = deals.filter((v) => getFormattedDate(v.date, 'M') === `${props.month}`)
  }
  const subjects = deals.reduce((a, v) => {
    if (props.subject !== 'ALL') {
      if (isSameSubject(v.kari.string(), props.subject)) {
        a[v.kari.string()] = true
      }
      if (isSameSubject(v.kashi.string(), props.subject)) {
        a[v.kashi.string()] = true
      }
    } else {
      a[v.kari.string()] = true
      a[v.kashi.string()] = true
    }
    return a
  }, {} as { [index: string]: boolean })
  return subjects
}

export const listJournalDeals = (deals: Deal[]) => {
  let month = ''
  const d = deals
    .map((deal) => deal)
    .sort((a, b) => {
      if (a.date == undefined || b.date == undefined) return 0
      return a.date.getTime() - b.date.getTime()
    })
    .map<DealRecord>((deal, i) => ({
      id: i,
      month: getFormattedDate(deal.date, 'yyyy/MM'),
      date: getFormattedDate(deal.date, 'yyyy/MM/dd'),
      kari: deal.kari.string(),
      karivalue: deal.kari.string() !== '' ? deal.value : '',
      kashi: deal.kashi.string(),
      kashivalue: deal.kashi.string() !== '' ? deal.value : '',
      name: deal.name,
      last: false,
    }))
    .reduce((a, deal) => {
      if (month != '' && month != deal.month) {
        a.push({
          id: 0,
          month: '',
          date: '',
          kari: '',
          karivalue: '',
          kashi: '',
          kashivalue: '',
          name: '',
          last: false,
        })
      }
      month = deal.month
      a.push(deal)
      return a
    }, [] as DealRecord[])
  // 合計値計算
  const total = {
    id: d.length,
    month: '',
    date: '合計',
    kari: '',
    karivalue: d.reduce((a, v) => {
      if (typeof v.karivalue === 'number') {
        a += v.karivalue
      }
      return a
    }, 0),
    kashi: '',
    kashivalue: d.reduce((a, v) => {
      if (typeof v.kashivalue === 'number') {
        a += v.kashivalue
      }
      return a
    }, 0),
    name: '',
    last: true,
  }
  d.push(total)
  const balance = (value: number) => {
    return {
      id: 0,
      month: '',
      date: '残高',
      kari: '',
      karivalue: value,
      kashi: '',
      kashivalue: -value,
      name: '',
      last: true,
    }
  }
  d.push(balance(total.karivalue - total.kashivalue))
  return d.map((d, i) => {
    d.id = i
    return d
  })
}

export class MonthlyRecord {
  id: number = 0
  date: string = ''
  kari: number | string = 0
  kashi: number | string = 0
  last: boolean = false
}

export const monthlyReport = (deals: Deal[]) => {
  const add = (a: number | string, b: number | string) => {
    if (typeof a === 'string' || typeof b === 'string') {
      return a
    }
    return a + b
  }

  const sub = (a: number | string, b: number | string) => {
    if (typeof a === 'string' || typeof b === 'string') {
      return 0
    }
    return a - b
  }
  const monthly = deals.reduce((a, deal) => {
    const date = getFormattedDate(deal.date, 'yyyy/MM')
    if (date === '') return a
    if (a[date] === undefined) {
      a[date] = { id: 0, date: '', kari: 0, kashi: 0, last: false }
    }
    if (deal.kari.string() !== '') {
      a[date].kari = add(a[date].kari, deal.value)
    }
    if (deal.kashi.string() !== '') {
      a[date].kashi = add(a[date].kashi, deal.value)
    }
    return a
  }, {} as { [index: string]: MonthlyRecord })
  const d = Object.keys(monthly)
    .sort()
    .map((v, i) => ({
      id: i,
      date: v,
      kari: monthly[v].kari,
      kashi: monthly[v].kashi,
      last: false,
    }))
  const total = d.reduce(
    (a, v) => {
      a.kari = add(a.kari, v.kari)
      a.kashi = add(a.kashi, v.kashi)
      return a
    },
    { id: d.length, date: '合計', kari: 0, kashi: 0, last: true } as MonthlyRecord,
  )
  d.push(total)
  const balance = (value: number) => {
    return {
      id: d.length,
      date: '残高',
      kari: value,
      kashi: -value,
      last: true,
    }
  }
  d.push(balance(sub(total.kari, total.kashi)))
  return d
}

export class ReportRecord {
  id: number = 0
  name: string = ''
  subject: string = ''
  value: number | string = ''
  color: string | undefined

  constructor(name: string = '', subject: string = '', value: number | string = '') {
    this.name = name
    this.subject = subject
    this.value = value
  }
}

export const settlementReport = (deals: Deal[], year: string) => {
  const result = (subject: string) => {
    const d = listJournalDeals(listDeals(deals, { year, month: 0, subject, book: '総勘定元帳' }))
    const last = d[d.length - 1]
    if (typeof last.kashivalue === 'string') {
      return parseInt(last.kashivalue)
    }
    return last.kashivalue
  }
  const sum = (subjects: string[]) => {
    return subjects.reduce((a, v) => {
      a += result(v)
      return a
    }, 0)
  }
  const assets = listSubjects(deals, { year, month: 0, subject: '資産' })
  const capital = listSubjects(deals, { year, month: 0, subject: '資本' })
  const income = listSubjects(deals, { year, month: 0, subject: '収益' })
  const cost = listSubjects(deals, { year, month: 0, subject: '費用' })
  // const debt = listSubjects(deals, { year, month: 0, subject: '負債' })
  const r: ReportRecord[] = []
  r.push(new ReportRecord('貸借対照表'))
  r.push(new ReportRecord('資産の部'))
  Object.keys(assets).forEach((k) => {
    r.push(new ReportRecord('', k, result(k)))
  })
  r.push(new ReportRecord('', '資産合計', sum(Object.keys(assets))))
  r.push(new ReportRecord('資本の部'))
  Object.keys(capital).forEach((k) => {
    r.push(new ReportRecord('', k, -result(k)))
  })
  // r.push(new ReportRecord('', '負債', -sum(Object.keys(debt))))
  r.push(new ReportRecord('', '所得', -(sum(Object.keys(income)) + sum(Object.keys(cost)))))
  r.push(
    new ReportRecord(
      '',
      '資本合計',
      -sum(Object.keys(capital)) - (sum(Object.keys(income)) + sum(Object.keys(cost))),
    ),
  )
  r.push(new ReportRecord())
  r.push(new ReportRecord('損益計算書'))
  r.push(new ReportRecord('', '売上', -sum(Object.keys(income))))
  r.push(new ReportRecord('', '費用合計', sum(Object.keys(cost))))
  Object.keys(cost).forEach((k) => {
    r.push(new ReportRecord('', k, result(k)))
  })
  r.push(new ReportRecord('', '所得', -(sum(Object.keys(income)) + sum(Object.keys(cost)))))
  r.push(new ReportRecord())
  return r.map((v, i) => ({ ...v, id: i })).filter((v) => v.value != 0 || v.name !== '')
}
