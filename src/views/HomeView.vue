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
    deals = deals.filter(v => v.kari.string() === props.subject || v.kashi.string() === props.subject)
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
type deal = {
  id: number;
  date: string;
  kari: string;
  karivalue: number | string;
  kashi: string;
  kashivalue: number | string;
  name: string;
  last: boolean;
}
const fields = computed(() => {
  const d = deals.value.map((deal, i) => ({
    id: i,
    date: getFormattedDate(deal.date, "yyyy/MM/dd"),
    kari: deal.kari.string(),
    karivalue: deal.kari.string() !== "" ? deal.value : "",
    kashi: (deal.kashi.string()),
    kashivalue: deal.kashi.string() !== "" ? deal.value : "",
    name: deal.name,
    last: false,
  }))
  d.push({
    id: d.length,
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
  })
  return d
})
const getBackgroundColor = (d: deal) => {
  if (d.last) return `#E0F0FF`
  return
}
</script>

<template>
  <div class="mark-body-container">
    <div class="tbl-bdr">
      <table>
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
</template>
