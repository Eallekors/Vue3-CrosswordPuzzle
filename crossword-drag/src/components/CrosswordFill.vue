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
                :class="{'incorrect': isIncorrect(rowIndex, colIndex)}"
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
  <h3 v-if="allCorrect">Congratulations! You solved the crossword!</h3>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const grid = ref([]);
const userGrid = ref([]);
const words = ref([]);
const incorrectNumbers = ref([]);
const saveLoading = ref(false);
const allCorrect = ref(false);
const gridContainerRef = ref(null);
const token = decodeURIComponent(new URL(window.location).searchParams.get("token"));
const urlBase = decodeURIComponent(new URL(window.location).searchParams.get("urlBase"));

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
        incorrectNumbers.value.push(`${rowIndex},${colIndex}`);
        allCorrect.value = false;
      }
    });
  });
};

const onInput = (event, rowIndex, colIndex) => {
  const value = event.target.value.toUpperCase();
  userGrid.value[rowIndex][colIndex] = value;
};

const isIncorrect = (rowIndex, colIndex) => {
  return incorrectNumbers.value.includes(`${rowIndex},${colIndex}`);
};

const load = async () => {
  saveLoading.value = true;
  try {
    const res = await fetch(
      `${urlBase}/api/widget/v1/settings?token=${token}`,
      {
        method: "GET",
      }
    );

    const crosswordData = await res.json();
    console.log("Game loaded: ", crosswordData);

    if (crosswordData && crosswordData.grid && crosswordData.words) {
      grid.value = crosswordData.grid;
      words.value = crosswordData.words;
      userGrid.value = grid.value.map(row => row.map(cell => (isNaN(cell) && cell !== '' ? '' : cell)));
    } else {
      grid.value = Array.from({ length: 10 }, () => Array(10).fill(''));
      userGrid.value = Array.from({ length: 10 }, () => Array(10).fill(''));
    }
  } catch (error) {
    console.log("Load error", error);
    grid.value = Array.from({ length: 10 }, () => Array(10).fill(''));
    userGrid.value = Array.from({ length: 10 }, () => Array(10).fill(''));
  } finally {
    saveLoading.value = false;
  }
};

onMounted(() => {
  loadGridFromLocalStorage();
  //load(); 
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

.hints {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

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
.hint {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  color: #333;
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
  border: none;
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

.incorrect {
  border: 2px solid red;
}
</style>
