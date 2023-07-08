<script setup lang="ts">
import { stringify } from '../utils/csv'
import { computed } from "vue";
import { DealRecord } from "../entity/deal"
import CopyButton from "./CopyButton.vue"
const props = defineProps<{
  fields: DealRecord[]
  sumBGColor: string
}>()
const getBackgroundColor = (d: { last: boolean }, sumBGColor: string) => {
  if (d.last) return sumBGColor
  return
}
const csvText = computed(() => {
  const csv: string[][] = []
  csv.push(["日付", "借り方", "金額", "貸し方", "金額", "名目"])
  props.fields.forEach(deal => {
    csv.push([deal.date, deal.kari, deal.karivalue + "", deal.kashi, deal.kashivalue + "", deal.name])
  })
  return stringify(csv)
})
</script>

<template>
  <div style="display:inline">
    <table style="display:inline-table;">
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
        <tr :style="{ 'background-color': getBackgroundColor(deal, sumBGColor) }">
          <td>{{ deal.date }}</td>
          <td>{{ deal.kari }}</td>
          <td style="text-align: right;">{{ deal.karivalue }}</td>
          <td>{{ deal.kashi }}</td>
          <td style="text-align: right;">{{ deal.kashivalue }}</td>
          <td>{{ deal.name }}</td>
        </tr>
      </tbody>
    </table>
    <CopyButton :text="csvText" />
  </div>
</template>
