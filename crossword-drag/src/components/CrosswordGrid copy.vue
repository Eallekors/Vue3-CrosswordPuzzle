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
  draggedWord.value = word;
  const dragImage = document.createElement('div');
  dragImage.style.display = 'flex';
  dragImage.style.gap = '15px';
  dragImage.style.fontSize = '20px';
  dragImage.style.fontWeight = 'bold';
  dragImage.style.padding = '5px';

  // Add the number to the drag image first
  const numberDiv = document.createElement('div');
  numberDiv.textContent = word.number + '.'; // Add the word's number
  numberDiv.style.fontSize = '20px'; // Slightly larger font for the number
  numberDiv.style.fontWeight = 'bold';
  numberDiv.style.marginRight = '5px'; // Space between number and word letters
  dragImage.appendChild(numberDiv);

  if (word.alignment === 'horizontal') {
    dragImage.style.flexDirection = 'row';
  } else {
    dragImage.style.flexDirection = 'column';
    dragImage.style.gap = '0px';
    dragImage.style.padding = '0px';
    dragImage.style.margin = '0px';
  }

  // Add the letters to the drag image
  word.text.split('').forEach(letter => {
    const letterDiv = document.createElement('div');
    letterDiv.textContent = letter;
    dragImage.appendChild(letterDiv);
  });

  document.body.appendChild(dragImage);
  // Set different drag image offset depending on alignment
  if (word.alignment === 'horizontal') {
    event.dataTransfer.setDragImage(dragImage, 60, 30); // Horizontal alignment
  } else {
    event.dataTransfer.setDragImage(dragImage, 0, 50); // Vertical alignment
  }

  setTimeout(() => document.body.removeChild(dragImage), 0);
  event.dataTransfer.setData('text/plain', JSON.stringify(word));
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

</script>

<template>
  <div>
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
  cursor: pointer;
  margin: 5px 0;
}
</style>