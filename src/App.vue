<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { readCSVToDeal } from "./entity/deal"
import { getFormattedDate } from "./utils/date"
const accountCSV = ref(``);
const deals = computed(() => readCSVToDeal(accountCSV.value))
const years = computed(() => {
  return ["ALL", ...Object.keys(deals.value.map(v => getFormattedDate(v.date, "yyyy")).reduce((a, v) => { a[v] = true; return a; }, {}))]
})
const accountYear = ref("ALL")
const months = ref([...Array(13).keys()])
const accountMonth = ref(0)
const accountSubject = ref("ALL")
const subjects = computed(() => {
  return ["ALL", ...Object.keys(deals.value.reduce((a, v) => { a[v.kari.string()] = true; a[v.kashi.string()] = true; return a; }, {})).sort()]
})
const bookType = ref("仕訳帳")
const books = ["仕訳帳", "総勘定元帳", "出納帳"]
onMounted(() => {
  const data = localStorage.getItem("vue-account-book");
  accountCSV.value = data
});
const inputEvent = (e) => {
  localStorage.setItem('vue-account-book', e.target.value)
}
</script>

<template>
  <div class="mark-top-header" @click.stop>
    <div class="mark-container" @click.stop>
      <div class="mark-cell">
        <textarea placeholder="Paste the account csv here." className="csv-textarea" v-model="accountCSV"
          @input="inputEvent" />
      </div>
      <div class="mark-cell">
        年:
        <select name="account-year" v-model="accountYear">
          <option v-for="year of years" :key="year" :value="year">
            {{ year === "ALL" ? "すべて" : year }}
          </option>
        </select>
      </div>
      <div class="mark-cell">
        月:
        <select name="account-month" v-model="accountMonth">
          <option v-for="month of months" :key="month" :value="month">
            {{ month === 0 ? "すべて" : month + "月" }}
          </option>
        </select>
      </div>
      <div class="mark-cell">
        科目:
        <select name="account-subject" v-model="accountSubject">
          <option v-for="subject of subjects" :key="subject" :value="subject">
            {{ subject === "ALL" ? "すべて" : subject }}
          </option>
        </select>
      </div>
      <div class="mark-cell">
        形式:
        <select name="book-type" v-model="bookType">
          <option v-for="book of books" :key="book" :value="book">
            {{ book }}
          </option>
        </select>
      </div>
    </div>
  </div>
  <div class="mark-body-container">
    <RouterView :csv="accountCSV" :year="accountYear" :month="accountMonth" :subject="accountSubject" :book="bookType" />
  </div>
</template>

<style scoped></style>
