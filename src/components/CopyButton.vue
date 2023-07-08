<script setup lang="ts">
const props = defineProps<{
  text: string
}>()
const changeMessage = function () {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(props.text).then(() => {
      alert("コピーしました")
    })
  }
  return false;
};
</script>

<template>
  <div style="text-align:right;">
    <div class="copycontainer" @click="changeMessage">
      CSVをコピー
    </div>
  </div>
</template>
