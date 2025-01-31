<template>
  <div>
    <h1 style="text-align: center;">Edit Crossword</h1>
    <CrosswordGrid @save="saveCrossword" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CrosswordGrid from '@/components/CrosswordGrid.vue'

const crosswordData = ref({})

const saveCrossword = (data) => {
  crosswordData.value = data
  localStorage.setItem('crossword', JSON.stringify(crosswordData.value))
}
</script>