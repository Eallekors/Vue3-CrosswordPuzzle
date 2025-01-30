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
  },
  {
    text: 'LONGWORD',
    number: 2,
    id: Date.now(),
    alignment: 'horizontal',
  },
]);
const currentWord = ref('');
const nextWordNumber = ref(1);
const draggedWord = ref(null);
const dragGrid = ref(null); // New grid for the word being dragged
const dragGridPosition = ref({ x: 0, y: 0 }); // Position of the drag grid
const currentAlignment = ref('horizontal'); // Add this line

const addWord = () => {
  if (currentWord.value.trim()) {
    words.value.push({
      text: currentWord.value.toUpperCase(), // Store words in uppercase for consistency
      number: nextWordNumber.value,
      id: Date.now(),
      alignment: 'horizontal',
    });
    currentWord.value = '';
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
  currentAlignment.value = word.alignment; // Add this line

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
      dragGrid.value[0][i + 1] = word.text[i];  // Horizontal alignment (shift right for number)
    } else {
      dragGrid.value[i + 1][0] = word.text[i];  // Vertical alignment (shift down for number)
    }
  }

  // Place the word number in the first cell (index 0)
  if (word.alignment === 'horizontal') {
    dragGrid.value[0][0] = word.number + '.'; // For horizontal, place number at the beginning of the row
  } else {
    dragGrid.value[0][0] = word.number + '.'; // For vertical, place number at the beginning of the column
  }

  // Create a temporary element to display the number 1
  const numberElement = document.createElement('div');
  numberElement.textContent = ' ';  // Display the number 1
  numberElement.style.background = 'transparent';
  numberElement.style.border = '1px solid transparent';
  numberElement.style.position = 'absolute';  // Ensure it can be used as a drag image
  numberElement.style.pointerEvents = 'none';  // Prevent interaction with the element

  // Append to body temporarily to capture it as a drag image
  document.body.appendChild(numberElement);

  
  // Set the drag image to be the number element
  event.dataTransfer.setDragImage(numberElement, 0, 0);

  // Remove the temporary number element from the DOM
  setTimeout(() => {
    document.body.removeChild(numberElement);
  }, 0); // Remove immediately after setting the drag image
};






const dragEnd = () => {
  dragGrid.value = null; // Clear the drag grid when dragging ends
};

const dropWord = (event, row, col) => {
  event.preventDefault();
  const word = JSON.parse(event.dataTransfer.getData('text/plain'));
  if (canPlaceWord(row, col, word)) {
    placeWord(row, col, word);  // Now places the word and its number
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
    dragGridPosition.value.x = event.clientX - 50;
    dragGridPosition.value.y = event.clientY - 20;
  } else if (currentAlignment.value === 'vertical') {
    dragGridPosition.value.x = event.clientX - 20;
    dragGridPosition.value.y = event.clientY - 50;
  }
};

const saveGridToLocalStorage = () => {
  localStorage.setItem('crosswordGrid', JSON.stringify(grid.value));
};

</script>

<template>
  <div @dragover="updateDragGridPosition">
    <h2>Crossword Builder</h2>
    <input v-model="gridSize" type="number" min="5" max="20" />
    <button @click="resizeGrid">Resize Grid</button>
    
    <div>
      <input v-model="currentWord" placeholder="Enter word" />
      <button @click="addWord">Add Word</button>
    </div>
    
    <div class="word-list">
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
    <button @click="saveGridToLocalStorage">Save Grid</button>
  </div>
</template>

<style scoped>
.grid {
  display: inline-block;
  border: 2px solid black;
  margin-top: 10px;
}
.row {
  display: flex;
}
.cell {
  width: 30px;
  height: 30px;
  border: 1px solid rgb(57, 53, 53);
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  line-height: 30px;
}
.word-list {
  margin-top: 10px;
}
.draggable-word {
  cursor: grab;
  padding: 5px;
  border: 0px solid black;
  display: inline-block;
  margin: 5px;
}
.drag-grid {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none; /* Ensure it doesn't interfere with dragging */
  opacity: 0.7; /* Make it semi-transparent */
}
.drag-grid .cell {
  background-color: transparent; /* Transparent background */
  border: 1px dashed #000; /* Dashed border for visibility */
}
</style>