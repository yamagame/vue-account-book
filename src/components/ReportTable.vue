<script setup lang="ts">
import { ReportRecord } from "../entity/deal"
defineProps<{
  report: ReportRecord[]
  sumBGColor: string
}>()
</script>

<template>
  <table style="display:inline-table;margin:10px;">
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
        <td>{{ deal.value }}</td>
      </tr>
    </tbody>
  </table>
</template>
