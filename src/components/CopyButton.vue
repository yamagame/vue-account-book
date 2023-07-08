<script setup lang="ts">
interface Emits {
  (e: 'copy', // 関数名
    v: null // 引数の型
  ): void; // 返り値の型
}
const props = defineProps<{
  text: string
}>()
const emits = defineEmits<Emits>();
const changeMessage = function () {
  emits('copy', null);
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
