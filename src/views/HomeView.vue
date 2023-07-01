<script setup lang="ts">
import { computed } from "vue";
import { readCSVToDeal } from "../entity/deal"
import { getFormattedDate } from "../utils/date"
const props = defineProps<{
  csv: string
  year: string
  month: number
  subject: string
  book: string
}>()
const deals = computed(() => {
  let deals = readCSVToDeal(props.csv)
  if (props.year !== "ALL") {
    deals = deals.filter(v => getFormattedDate(v.date, "yyyy") === props.year)
  }
  if (props.month !== 0) {
    deals = deals.filter(v => getFormattedDate(v.date, "M") === `${props.month}`)
  }
  if (props.subject !== "ALL") {
    deals = deals.filter(v => v.kari.string().indexOf(props.subject) === 0 || v.kashi.string().indexOf(props.subject) === 0)
  }
  if (props.book === "総勘定元帳") {
    deals = deals.map(v => {
      if (v.kari.string() === props.subject) {
        v.kari.category = ""
        v.kari.name = ""
      }
      if (v.kashi.string() === props.subject) {
        v.kashi.category = ""
        v.kashi.name = ""
      }
      return v
    })
  }
  if (props.book === "出納帳") {
    deals = deals.map(v => {
      if (v.kari.string() !== props.subject) {
        v.kari.category = ""
        v.kari.name = ""
      }
      if (v.kashi.string() !== props.subject) {
        v.kashi.category = ""
        v.kashi.name = ""
      }
      return v
    })
  }
  return deals;
})
type Record = {
  id: number
  month: string
  date: string
  kari: string
  karivalue: number | string
  kashi: string
  kashivalue: number | string
  name: string
  last: boolean
}
const fields = computed(() => {
  let month = ""
  const d = deals.value.map(deal => deal)
    .sort((a, b) => {
      if (a.date == undefined || b.date == undefined) return 0
      return a.date.getTime() - b.date.getTime()
    })
    .map<Record>((deal, i) => ({
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
    }, [] as Record[])
  // 合計値計算
  const total = {
    id: d.length,
    month: "",
    date: "",
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
  return d.map((d, i) => {
    d.id = i
    return d
  })
})

// 月締合計計算
const monthly = computed(() => {
  const monthly = deals.value.reduce((a, deal) => {
    const date = getFormattedDate(deal.date, "yyyy/MM")
    if (date === "") return a
    if (a[date] === undefined) {
      a[date] = { kari: 0, kashi: 0 }
    }
    if (deal.kari.string() !== "") {
      a[date].kari += deal.value
    }
    if (deal.kashi.string() !== "") {
      a[date].kashi += deal.value
    }
    return a
  }, {} as { [index: string]: { kari: number, kashi: number } })
  const d = Object.keys(monthly).sort().map((v, i) => (
    {
      id: i,
      date: v,
      kari: monthly[v].kari,
      kashi: monthly[v].kashi,
      last: false,
    }
  ))
  d.push(d.reduce((a, v) => {
    a.kari += v.kari
    a.kashi += v.kashi
    return a
  }, { id: d.length, date: "", kari: 0, kashi: 0, last: true }))
  return d
})

const getBackgroundColor = (d: { last: boolean }) => {
  if (d.last) return `#E0F0FF`
  return
}
</script>

<template>
  <div class="mark-body-container">
    <div class="tbl-bdr">
      <div style="display:inline;">
        <table style="display:inline-table;margin:10px;">
          <thead>
            <tr :style="{ 'background-color': '#E0E0E0' }">
              <th style=" width:70px">日付</th>
              <th style="width:100px">借り方合計</th>
              <th style="width:100px">貸し方合計</th>
            </tr>
          </thead>
          <tbody v-for="deal of monthly" :key="deal.id">
            <tr :style="{ 'background-color': getBackgroundColor(deal) }">
              <td>{{ deal.date }}</td>
              <td>{{ deal.kari }}</td>
              <td>{{ deal.kashi }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="display:inline">
        <table style="display:inline-table;margin:10px;">
          <thead>
            <tr :style="{ 'background-color': '#E0E0E0' }">
              <th style=" width:70px">日付</th>
              <th style="width:100px">借り方</th>
              <th style="width:100px">金額</th>
              <th style="width:100px">貸し方</th>
              <th style="width:100px">金額</th>
              <th style="width:200px">名目</th>
            </tr>
          </thead>
          <tbody v-for="deal of fields" :key="deal.id">
            <tr :style="{ 'background-color': getBackgroundColor(deal) }">
              <td>{{ deal.date }}</td>
              <td>{{ deal.kari }}</td>
              <td>{{ deal.karivalue }}</td>
              <td>{{ deal.kashi }}</td>
              <td>{{ deal.kashivalue }}</td>
              <td>{{ deal.name }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
