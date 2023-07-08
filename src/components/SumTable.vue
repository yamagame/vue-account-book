<script setup lang="ts">
import { stringify } from '../utils/csv'
import { computed } from "vue";
import { MonthlyRecord } from "../entity/deal"
import CopyButton from "./CopyButton.vue"
const props = defineProps<{
  monthly: MonthlyRecord[]
  sumBGColor: string
}>()
const getBackgroundColor = (d: { last: boolean }, sumBGColor: string) => {
  if (d.last) return sumBGColor
  return
}
const csvText = computed(() => {
  const csv: string[][] = []
  csv.push(["日付", "借り方合計", "貸し方合計"])
  props.monthly.forEach(deal => {
    csv.push([deal.date, deal.kari + "", deal.kashi + ""])
  })
  return stringify(csv)
})
</script>

<template>
  <table style="display:inline-table;">
    <thead>
      <tr :style="{ 'background-color': '#E0E0E0' }">
        <th style=" width:70px">日付</th>
        <th style="width:100px">借り方合計</th>
        <th style="width:100px">貸し方合計</th>
      </tr>
    </thead>
    <tbody v-for="deal of monthly" :key="deal.id">
      <tr :style="{ 'background-color': getBackgroundColor(deal, sumBGColor) }">
        <td>{{ deal.date }}</td>
        <td style="text-align: right;">{{ deal.kari }}</td>
        <td style="text-align: right;">{{ deal.kashi }}</td>
      </tr>
    </tbody>
  </table>
  <CopyButton :text="csvText" />
</template>
