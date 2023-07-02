<script setup lang="ts">
import { DealRecord } from "../entity/deal"
defineProps<{
  fields: DealRecord[]
  sumBGColor: string
}>()
const getBackgroundColor = (d: { last: boolean }, sumBGColor: string) => {
  if (d.last) return sumBGColor
  return
}
</script>

<template>
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
        <tr :style="{ 'background-color': getBackgroundColor(deal, sumBGColor) }">
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
</template>
