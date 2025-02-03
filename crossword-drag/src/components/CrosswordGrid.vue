<script setup>
import { ref } from 'vue';

const gridSize = ref(10);
const grid = ref(Array.from({ length: gridSize.value }, () => Array(gridSize.value).fill('')));
const words = ref([
  {
    text: 'TEST',
    number: 1,
    id: Date.now(),
    alignment: 'horizontal',
    hint: 'A trial or experiment',
  },
  {
    text: 'LONGWORD',
    number: 2,
    id: Date.now(),
    alignment: 'horizontal',
    hint: 'A word with many letters',
  },
]);
const currentWord = ref('');
const currentHint = ref('');
const nextWordNumber = ref(1);
const draggedWord = ref(null);
const dragGrid = ref(null); 
const dragGridPosition = ref({ x: 0, y: 0 }); 
const currentAlignment = ref('horizontal');

const addWord = () => {
  if (currentWord.value && currentHint.value) {
    words.value.push({
      text: currentWord.value.toUpperCase(), // Store words in uppercase for consistency
      number: nextWordNumber.value,
      id: Date.now(),
      alignment: 'horizontal',
      hint: currentHint.value,
    });
    currentWord.value = '';
    currentHint.value = '';
    nextWordNumber.value++;
  }
};

const toggleAlignment = (word) => {
  word.alignment = word.alignment === 'horizontal' ? 'vertical' : 'horizontal';
};

const resizeGrid = () => {
  grid.value = Array.from({ length: gridSize.value }, () => Array(gridSize.value).fill(''));
};

const dragStart = (event, word) => {
  event.dataTransfer.setData('text/plain', JSON.stringify(word));
  currentAlignment.value = word.alignment; 

  // Create a new grid for the word being dragged
  const length = word.text.length;

  if (word.alignment === 'horizontal') {
    dragGrid.value = Array.from({ length: 1 }, () => Array(length + 1).fill(''));
  } else {
    dragGrid.value = Array.from({ length: length + 1 }, () => Array(1).fill(''));
  }

  // Fill the drag grid with the word's letters
  for (let i = 0; i < length; i++) {
    if (word.alignment === 'horizontal') {
      dragGrid.value[0][i + 1] = word.text[i];  
    } else {
      dragGrid.value[i + 1][0] = word.text[i];  
    }
  }

  // Place the word number in the first cell (index 0)
  if (word.alignment === 'horizontal') {
    dragGrid.value[0][0] = word.number + '.'; 
  } else {
    dragGrid.value[0][0] = word.number + '.'; 
  }

  // Create a temporary element to display the number 1
  const numberElement = document.createElement('div');
  numberElement.textContent = ' ';  
  numberElement.style.background = 'transparent';
  numberElement.style.border = '1px solid transparent';
  numberElement.style.position = 'absolute'; 
  numberElement.style.pointerEvents = 'none';  

  // Append to body temporarily to capture it as a drag image
  document.body.appendChild(numberElement);

  

  event.dataTransfer.setDragImage(numberElement, 0, 0);

  
  setTimeout(() => {
    document.body.removeChild(numberElement);
  }, 0);
};

const dragEnd = () => {
  dragGrid.value = null;
};

const dropWord = (event, row, col) => {
  event.preventDefault();
  const word = JSON.parse(event.dataTransfer.getData('text/plain'));
  if (canPlaceWord(row, col, word)) {
    placeWord(row, col, word);  
  } else {
    alert("Word can't be placed here! It must connect correctly.");
  }
};

const allowDrop = (event) => {
  event.preventDefault();
};

// Validate word placement with proper connections

const canPlaceWord = (row, col, word) => {
  const length = word.text.length;

  if (word.alignment === 'horizontal') {
    // Check if the word goes out of bounds horizontally
    if (col + length > gridSize.value) return false; // Out of bounds horizontally
    
    // Check if the number will be clipped
    if (col <= 0) return false;  // The number will be out of bounds if placed at column 0
    
    // Check if the number cell is empty
    if (col > 0 && grid.value[row][col - 1] !== '') return false; // Number cell is not empty
    
    for (let i = 0; i < length; i++) {
      // Allow overlap if the letter matches or the grid space is empty
      if (grid.value[row][col + i] !== '' && grid.value[row][col + i] !== word.text[i]) {
        return false; // Prevent overlapping with a different letter
      }
    }
  } else { // Vertical
    // Check if the word goes out of bounds vertically
    if (row + length > gridSize.value) return false; // Out of bounds vertically
    
    // Check if the number will be clipped
    if (row <= 0) return false;  // The number will be out of bounds if placed at row 0
    
    // Check if the number cell is empty
    if (row > 0 && grid.value[row - 1][col] !== '') return false; // Number cell is not empty
    
    for (let i = 0; i < length; i++) {
      // Allow overlap if the letter matches or the grid space is empty
      if (grid.value[row + i][col] !== '' && grid.value[row + i][col] !== word.text[i]) {
        return false; // Prevent overlapping with a different letter
      }
    }
  }

  return true; // Word can be placed
};


// Place the word and its number in the grid
const placeWord = (row, col, word) => {
  const length = word.text.length;

  // Place the word number in the previous cell (one cell before the starting position)
  if (word.alignment === 'horizontal') {
    if (col > 0 && grid.value[row][col - 1] === '') {
      grid.value[row][col - 1] = word.number + '.';  // For horizontal, number goes one cell left
    }
  } else {
    if (row > 0 && grid.value[row - 1][col] === '') {
      grid.value[row - 1][col] = word.number + '.';  // For vertical, number goes one cell above
    }
  }

  // Now place the word's letters, starting from the dropped position
  for (let i = 0; i < length; i++) {
    if (word.alignment === 'horizontal') {
      // Place the word's letters horizontally
      grid.value[row][col + i] = word.text[i];
    } else {
      // Place the word's letters vertically
      grid.value[row + i][col] = word.text[i];
    }
  }
};

const updateDragGridPosition = (event) => {
  if (currentAlignment.value === 'horizontal') {
    dragGridPosition.value.x = event.pageX - 45;
    dragGridPosition.value.y = event.pageY - 15;
  } else if (currentAlignment.value === 'vertical') {
    dragGridPosition.value.x = event.pageX - 15;
    dragGridPosition.value.y = event.pageY - 45;
  }
};

const saveGridToLocalStorage = () => {
  const crosswordData = {
    grid: grid.value,
    words: words.value,
  };
  localStorage.setItem('crosswordGrid', JSON.stringify(crosswordData));
};

const clearGrid = () => {
  grid.value = Array.from({ length: gridSize.value }, () => Array(gridSize.value).fill(''));
  words.value = [];
  nextWordNumber.value = 1;
};


const saveLoading = ref(false);
const token = decodeURIComponent(new URL(window.location).searchParams.get("token"));
const urlBase = decodeURIComponent(new URL(window.location).searchParams.get("urlBase"));

const save = async () => {
  saveLoading.value = true;
  try {
    const crosswordData = {
      grid: grid.value,
      words: words.value,
    };
    console.log("Posting game data to API:", crosswordData);

    const res = await fetch(
      `${urlBase}/api/widget/v1/settings?token=${token}`,
      {
        body: JSON.stringify(crosswordData),
        method: "POST",
      }
    );

    console.log("Game saved: ", res);
  } catch (error) {
    console.log("Save error", error);
 } finally {
    saveLoading.value = false;
  }
};

</script>

<template>
  <div @dragover="updateDragGridPosition">
    <h2 style="text-align: center;">Crossword Builder</h2>
    
      <div style="text-align: center;">
        <input v-model="gridSize" type="number" min="5" max="20" />
        <button @click="resizeGrid">Resize Grid</button>
      </div>
      
      <div :style="{ textAlign: 'center', marginTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }">
        <input v-model="currentWord" placeholder="Enter word" />
        <input v-model="currentHint" placeholder="Enter hint" />
        <button @click="addWord" style="margin: 5px;">Add Word</button>
      </div>
      
      <div style="text-align: center;">
        <div class="word-list" style="display: inline-block; max-width: 415px;">
          <div 
            v-for="word in words" 
            :key="word.id" 
            @click="toggleAlignment(word)"
            @dragstart="dragStart($event, word)"
            @dragend="dragEnd"
            draggable="true"
            class="draggable-word"
          >
            {{ word.number }}. {{ word.text }} ({{ word.alignment }})
          </div>
        </div>
      </div>
    <div class="container">
      <div class="grid">
        <div v-for="(row, r) in grid" :key="r" class="row">
          <div 
            v-for="(cell, c) in row" 
            :key="c" 
            class="cell"
            @dragover="allowDrop"
            @drop="dropWord($event, r, c)"
          >
            {{ cell }}
          </div>
        </div>
      </div>
    </div>

    <!-- Drag Grid -->
    <div v-if="dragGrid" class="drag-grid" :style="{ top: dragGridPosition.y + 'px', left: dragGridPosition.x + 'px' }">
      <div v-for="(row, r) in dragGrid" :key="r" class="row">
        <div 
          v-for="(cell, c) in row" 
          :key="c" 
          class="cell"
        >
          {{ cell }}
        </div>
      </div>
    </div>

    <div class="button-container">
      <button @click="saveGridToLocalStorage">Save Grid</button>
      <button @click="clearGrid">Clear Grid</button>
      <button @click="save" :disabled="saveLoading">Save to Server</button>
    </div>

    <div class="hints">
      <h3 style="text-align: center;">Hints</h3>
      <ul style="text-align: center; list-style-type: none;">
        <li v-for="word in words" :key="word.id">
          {{ word.number }}. {{ word.hint }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
input {
  padding: 10px;
  border: 2px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  width: 200px;
  transition: border-color 0.3s, box-shadow 0.3s;
  margin-right: 10px;
  margin-bottom: 10;
}

input:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  outline: none;
}

button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #0056b3;
}

.word-list {
  margin-top: 10px;
}

.draggable-word {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin: 5px 0;
  background-color: #f8f9fa;
  cursor: grab;
  transition: background-color 0.3s;
}

.draggable-word:hover {
  background-color: #e2e6ea;
}
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.row {
  display: flex;
}
.cell {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  line-height: 30px;
  transition: background-color 0.3s, color 0.3s;
}
.cell:hover {
  background-color: #f0f0f0;
}
.word-list {
  margin-top: 10px;
}
.draggable-word {
  cursor: grab;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: inline-block;
  margin: 5px;
  background-color: #f9f9f9;
  transition: background-color 0.3s, box-shadow 0.3s;
}
.draggable-word:hover {
  background-color: #e9e9e9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.drag-grid {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  opacity: 0.8;
}
.drag-grid .cell {
  background-color: transparent;
  border: 1px dashed #000;
}
.button-container {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  justify-content: center;
}
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
 
}
</style>