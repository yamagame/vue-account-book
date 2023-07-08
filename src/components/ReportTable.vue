<script setup lang="ts">
import { stringify } from '../utils/csv'
import { computed } from "vue";
import { ReportRecord } from "../entity/deal"
import CopyButton from "./CopyButton.vue"
const props = defineProps<{
  report: ReportRecord[]
  sumBGColor: string
}>()
const csvText = computed(() => {
  const csv: string[][] = []
  csv.push(["大項目", "小項目", "金額"])
  props.report.forEach(deal => {
    csv.push([deal.name, deal.subject, deal.value + ""])
  })
  return stringify(csv)
})
</script>

<template>
  <table style="display:inline-table;">
    <thead>
      <tr :style="{ 'background-color': '#E0E0E0' }">
        <th style=" width:70px">大項目</th>
        <th style="width:100px">小項目</th>
        <th style="width:100px">金額</th>
      </tr>
    </thead>
    <tbody v-for="deal of report" :key="deal.id">
      <tr>
        <td>{{ deal.name }}</td>
        <td>{{ deal.subject }}</td>
        <td :style="{ 'text-align': 'right', 'color': deal.color }">{{ deal.value }}</td>
      </tr>
    </tbody>
  </table>
  <CopyButton :text="csvText" />
</template>
