<script setup lang="ts">
import { computed } from "vue";
import { readCSVToDeal, DealRecord, MonthlyRecord } from "../entity/deal"
import { getFormattedDate } from "../utils/date"
import DealTable from "../components/DealTable.vue"
import SumTable from "../components/SumTable.vue"
const props = defineProps<{
  csv: string
  year: string
  month: number
  subject: string
  book: string
}>()
const isSameSubject = (subject: string, key: string) => {
  if (key.indexOf(":") >= 0) {
    return subject === key
  }
  return subject.indexOf(key) === 0
}
const deals = computed(() => {
  let deals = readCSVToDeal(props.csv)
  if (props.year !== "ALL") {
    deals = deals.filter(v => getFormattedDate(v.date, "yyyy") === props.year)
  }
  if (props.month !== 0) {
    deals = deals.filter(v => getFormattedDate(v.date, "M") === `${props.month}`)
  }
  if (props.subject !== "ALL") {
    deals = deals.filter(v => isSameSubject(v.kari.string(), props.subject) || isSameSubject(v.kashi.string(), props.subject))
  }
  if (props.book === "総勘定元帳") {
    deals = deals.map(v => {
      if (isSameSubject(v.kari.string(), props.subject)) {
        v.kari.category = ""
        v.kari.name = ""
      }
      if (isSameSubject(v.kashi.string(), props.subject)) {
        v.kashi.category = ""
        v.kashi.name = ""
      }
      return v
    })
  }
  if (props.book === "出納帳") {
    deals = deals.map(v => {
      if (!isSameSubject(v.kari.string(), props.subject)) {
        v.kari.category = ""
        v.kari.name = ""
      }
      if (!isSameSubject(v.kashi.string(), props.subject)) {
        v.kashi.category = ""
        v.kashi.name = ""
      }
      return v
    })
  }
  return deals;
})
const fields = computed(() => {
  let month = ""
  const d = deals.value.map(deal => deal)
    .sort((a, b) => {
      if (a.date == undefined || b.date == undefined) return 0
      return a.date.getTime() - b.date.getTime()
    })
    .map<DealRecord>((deal, i) => ({
      id: i,
      month: getFormattedDate(deal.date, "yyyy/MM"),
      date: getFormattedDate(deal.date, "yyyy/MM/dd"),
      kari: deal.kari.string(),
      karivalue: deal.kari.string() !== "" ? deal.value : "",
      kashi: (deal.kashi.string()),
      kashivalue: deal.kashi.string() !== "" ? deal.value : "",
      name: deal.name,
      last: false,
    }))
    .reduce((a, deal) => {
      if (month != "" && month != deal.month) {
        a.push({
          id: 0,
          month: "",
          date: "",
          kari: "",
          karivalue: "",
          kashi: "",
          kashivalue: "",
          name: "",
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
    month: "",
    date: "合計",
    kari: "",
    karivalue: d.reduce((a, v) => {
      if (typeof v.karivalue === "number") {
        a += v.karivalue
      }
      return a;
    }, 0),
    kashi: "",
    kashivalue: d.reduce((a, v) => {
      if (typeof v.kashivalue === "number") {
        a += v.kashivalue
      }
      return a;
    }, 0),
    name: "",
    last: true,
  }
  d.push(total)
  const balance = (value: number) => {
    return ({
      id: 0,
      month: "",
      date: "残高",
      kari: "",
      karivalue: "",
      kashi: "",
      kashivalue: value,
      name: "",
      last: true,
    })
  }
  d.push(balance(total.karivalue - total.kashivalue))
  return d.map((d, i) => {
    d.id = i
    return d
  })
})

const add = (a: number | string, b: number | string) => {
  if (typeof a === "string" || typeof b === "string") {
    return a
  }
  return a + b
}

const sub = (a: number | string, b: number | string) => {
  if (typeof a === "string" || typeof b === "string") {
    return 0
  }
  return a - b
}

// 月締合計計算
const monthly = computed(() => {
  const monthly = deals.value.reduce((a, deal) => {
    const date = getFormattedDate(deal.date, "yyyy/MM")
    if (date === "") return a
    if (a[date] === undefined) {
      a[date] = { id: 0, date: "", kari: 0, kashi: 0, last: false, }
    }
    if (deal.kari.string() !== "") {
      a[date].kari = add(a[date].kari, deal.value)
    }
    if (deal.kashi.string() !== "") {
      a[date].kashi = add(a[date].kashi, deal.value)
    }
    return a
  }, {} as { [index: string]: MonthlyRecord })
  const d = Object.keys(monthly).sort().map((v, i) => (
    {
      id: i,
      date: v,
      kari: monthly[v].kari,
      kashi: monthly[v].kashi,
      last: false,
    }
  ))
  const total = d.reduce((a, v) => {
    a.kari = add(a.kari, v.kari)
    a.kashi = add(a.kashi, v.kashi)
    return a
  }, { id: d.length, date: "合計", kari: 0, kashi: 0, last: true } as MonthlyRecord)
  d.push(total)
  const balance = (value: number) => {
    return {
      id: d.length,
      date: "残高",
      kari: "",
      kashi: value,
      last: true,
    }
  }
  d.push(balance(sub(total.kari, total.kashi)))
  return d
})
</script>

<template>
  <div class="mark-body-container">
    <div class="tbl-bdr">
      <div style="display:inline;">
        <SumTable :monthly="monthly" sumBGColor="#E0F0FF" />
      </div>
      <div style="display:inline">
        <DealTable :fields="fields" sumBGColor="#E0F0FF" />
      </div>
    </div>
  </div>
</template>
