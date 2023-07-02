import { parse } from '../utils/csv'

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

export class MonthlyRecord {
  id: number = 0
  date: string = ''
  kari: number = 0
  kashi: number = 0
  last: boolean = false
}
