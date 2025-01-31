<template>
  <div>
    <h3>Hints</h3>
    <ul class="hints">
      <li v-for="word in words" :key="word.id">
        {{ word.number }}. {{ word.hint }}
      </li>
    </ul>
  </div>
  <div class="grid-container" >
    <table>
      <tbody class="grid">
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
    <div class="button-container">
      <button @click="checkGrid">Check</button>
    </div>
  </div>
  <div v-if="incorrectNumbers.length > 0">
    <p>Incorrect numbers: {{ incorrectNumbers.join(', ') }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const grid = ref([]);
const userGrid = ref([]);
const words = ref([]);
const incorrectNumbers = ref([]);
const allCorrect = ref(false);
const gridContainerRef = ref(null);

const loadGridFromLocalStorage = () => {
  const savedData = localStorage.getItem('crosswordGrid');
  if (savedData) {
    const crosswordData = JSON.parse(savedData);
    grid.value = crosswordData.grid;
    words.value = crosswordData.words;
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
.grid {
  display: inline-block;
  border: 1px solid #ccc;
  margin-top: 10px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.1);
 
}

table {
  border-collapse: collapse;
  max-width: 100%;
  margin: auto;

}

td {
  border: 1px solid #ddd;
  width: 30px;
  height: 30px;
  text-align: center;
  vertical-align: middle;
  font-weight: bold;
  font-size: 20px;
  transition: background-color 0.3s, color 0.3s;

}

td:hover {
  background-color: #f0f0f0;
}

.grid-input {
  width: 100%;
  height: 100%;
  text-align: center;
  outline: none;
  padding: 0;
  margin: 0;
  text-transform: uppercase;
  background-color: #cccccc;
  font-weight: bold;
  transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.grid-input:focus {
  background-color: #e0e0e0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}

.grid-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px auto;
  width: 100%;
  max-width: 600px;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s;
}

button:hover {
  background-color: #0056b3;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-top: 20px;
  font-size: 1.5em;
  color: #333;
  text-align: center;
}

ul {
  list-style-type: none;
  padding: 0;
  text-align: center;
}

li {
  margin: 5px 0;
  padding: 5px;
  border-radius: 4px;
}

/* Responsive Design */
@media (max-width: 600px) {
  td {
    width: 25px;
    height: 25px;
    font-size: 16px;
  }
  .grid-container {
    width: 90%;
  }
  h3 {
    font-size: 1.2em;
  }
  button {
    width: 100%;
  }
}
</style>
