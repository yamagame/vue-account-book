<script setup lang="ts">
import { computed } from "vue";
import { readCSVToDeal, listDeals, listJournalDeals, monthlyReport, settlementReport } from "../entity/deal"
import DealTable from "../components/DealTable.vue"
import SumTable from "../components/SumTable.vue"
import ReportTable from "../components/ReportTable.vue"
const props = defineProps<{
  csv: string
  year: string
  month: number
  subject: string
  book: string
}>()

// 取引
const deals = computed(() => {
  let deals = readCSVToDeal(props.csv)
  return listDeals(deals, props)
})

// 仕訳帳
const fields = computed(() => {
  return listJournalDeals(deals.value)
})

// 月締合計計算
const monthly = computed(() => {
  return monthlyReport(deals.value)
})

// 決算書
const report = computed(() => {
  let deals = readCSVToDeal(props.csv)
  return settlementReport(deals, props.year)
})
</script>

<template>
  <div class="mark-body-container">
    <div class="tbl-bdr">
      <div style="display:inline-block">
        <div style="margin:10px;">
          <ReportTable :report="report" sumBGColor="#E0F0FF" />
        </div>
        <div style="margin:10px;">
          <SumTable :monthly="monthly" sumBGColor="#E0F0FF" />
        </div>
      </div>
      <div style="display:inline-block;vertical-align: top;margin:10px;">
        <DealTable :fields="fields" sumBGColor="#E0F0FF" />
      </div>
    </div>
  </div>
</template>
