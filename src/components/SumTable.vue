<script setup lang="ts">
import { MonthlyRecord } from "../entity/deal"
defineProps<{
  monthly: MonthlyRecord[]
  sumBGColor: string
}>()
const getBackgroundColor = (d: { last: boolean }, sumBGColor: string) => {
  if (d.last) return sumBGColor
  return
}
</script>

<template>
  <table style="display:inline-table;margin:10px;">
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
</template>
