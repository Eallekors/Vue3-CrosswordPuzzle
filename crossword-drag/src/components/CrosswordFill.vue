<template>
  <div>
    <table>
      <tbody>
        <tr v-for="(row, rowIndex) in grid" :key="rowIndex">
          <td v-for="(cell, colIndex) in row" :key="colIndex">
            <template v-if="cell !== ''">
              <input 
                v-if="isNaN(cell)" 
                v-model="userGrid[rowIndex][colIndex]" 
                class="grid-input" 
                @input="onInput($event, rowIndex, colIndex)" 
                maxlength="1" 
              />
              <span v-else>{{ cell }}</span>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
    <button @click="checkGrid">Check</button>
    <div v-if="incorrectNumbers.length > 0">
      <p>Incorrect numbers: {{ incorrectNumbers.join(', ') }}</p>
    </div>
    <div v-else-if="allCorrect">
      <p>You have solved the crossword!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const grid = ref([]);
const userGrid = ref([]);
const incorrectNumbers = ref([]);
const allCorrect = ref(false);

const loadGridFromLocalStorage = () => {
  const savedGrid = localStorage.getItem('crosswordGrid');
  if (savedGrid) {
    grid.value = JSON.parse(savedGrid);
    userGrid.value = grid.value.map(row => row.map(cell => (isNaN(cell) && cell !== '' ? '' : cell)));
  } else {
    grid.value = Array.from({ length: 10 }, () => Array(10).fill(''));
    userGrid.value = Array.from({ length: 10 }, () => Array(10).fill(''));
  }
};

const checkGrid = () => {
  incorrectNumbers.value = [];
  allCorrect.value = true;
  grid.value.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (isNaN(cell) && cell !== userGrid.value[rowIndex][colIndex]) {
        incorrectNumbers.value.push(cell);
        allCorrect.value = false;
      }
    });
  });
};

const onInput = (event, rowIndex, colIndex) => {
  const value = event.target.value.toUpperCase();
  userGrid.value[rowIndex][colIndex] = value;
};

onMounted(() => {
  loadGridFromLocalStorage();
});
</script>

<style scoped>
table {
  border-collapse: collapse;
}

td {
  border: 1px solid black;
  width: 30px;
  height: 30px;
  text-align: center;
  vertical-align: middle;
}

.grid-input {
  width: 30px;
  height: 30px;
  text-align: center;
  border: none;
  outline: none;
  text-transform: uppercase;
}
</style>