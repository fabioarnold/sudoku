function isValid(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    // Check if num is already in the row or column, ignoring the (row, col) cell itself
    if (board[row][i] === num && i !== col) return false;
    if (board[i][col] === num && i !== row) return false;

    // Check if num is in the 3x3 subgrid, ignoring the (row, col) cell itself
    const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
    const boxCol = 3 * Math.floor(col / 3) + (i % 3);
    if (board[boxRow][boxCol] === num && (boxRow !== row || boxCol !== col)) return false;
  }
  return true;
}

// Fill the board with a valid Sudoku solution using backtracking
function fillBoard(board) {
  function fillBoardRecursively(board) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (const num of numbers) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (fillBoardRecursively(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  fillBoardRecursively(board);
}

// Utility to shuffle an array (Fisher-Yates shuffle)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Solver function to count the number of solutions
function countSolutions(board) {
  let solutions = 0;

  function solve(board) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              solve(board);
              board[row][col] = 0;
            }
          }
          return;
        }
      }
    }
    solutions++;
  }

  solve(board);
  return solutions;
}

// Remove cells to create a puzzle with a unique solution
function removeCellsForUniquePuzzle(board, numCellsToRemove) {
  let attempts = numCellsToRemove;
  while (attempts > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);

    if (board[row][col] !== 0) {
      const backup = board[row][col];
      board[row][col] = 0;

      // Check if the board has exactly one solution
      if (countSolutions(board) !== 1) {
        // If not unique, restore the cell
        board[row][col] = backup;
      } else {
        // Confirm the removal if it keeps the puzzle uniquely solvable
        attempts--;
      }
    }
  }
}

// Placeholder for generating and solving functions
function generateSudoku() {
  // Use the logic provided in the previous JavaScript solution to generate a Sudoku puzzle
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillBoard(board);
  removeCellsForUniquePuzzle(board, 40);
  return board;
}

// easy = 43
// medium = 43
// hard = 81 - 30
// master = 81 - 27
// extreme = 81 - 23

let selectedCol = 0;
let selectedRow = 0;

// Render the generated puzzle on the UI
const canvas = document.querySelector("canvas#sudokuGrid");
function renderPuzzle() {
  const ctx = canvas.getContext("2d");
  ctx.font = "20px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.scale(2, 2);

  const selectedValue = puzzle[selectedRow][selectedCol];
  const selectedGroup = Math.floor(selectedRow / 3) * 3 + Math.floor(selectedCol / 3);

  puzzle.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      const readonly = puzzleReadonly[rowIndex][colIndex];
      const valid = readonly || isValid(puzzle, rowIndex, colIndex, value);
      ctx.fillStyle = "#fff";
      const groupIndex = Math.floor(rowIndex / 3) * 3 + Math.floor(colIndex / 3);
      if (value && value === selectedValue) ctx.fillStyle = "rgb(196 215 234)";
      if (rowIndex === selectedRow || colIndex === selectedCol || groupIndex === selectedGroup)
        ctx.fillStyle = "rgb(227 235 243)";
      if (rowIndex === selectedRow && colIndex === selectedCol) ctx.fillStyle = "rgb(178 223 254)";
      if (value && !valid) ctx.fillStyle = "rgb(247, 205, 213)";
      ctx.fillRect(40 * colIndex, 40 * rowIndex, 40, 40);
      if (value) {
        ctx.fillStyle = "#000";
        if (!readonly) ctx.fillStyle = "rgb(60, 89, 169)";
        if (!valid) ctx.fillStyle = "rgb(215, 46, 63)";
        ctx.fillText(value, 40 * colIndex + 21, rowIndex * 40 + 21);
      }
    });
  });

  // Draw grid lines
  ctx.fillStyle = "#ccc";
  for (let i = 0; i < 9; i++) {
    if (i % 3 === 0) continue;
    ctx.fillRect(i * 40, 0, 1, 9 * 40);
    ctx.fillRect(0, i * 40, 9 * 40, 1);
  }
  ctx.fillStyle = "#000";
  for (let i = 0; i <= 9; i++) {
    if (i % 3 !== 0) continue;
    ctx.fillRect(i * 40, 0, 2, 9 * 40 + 2);
    ctx.fillRect(0, i * 40, 9 * 40 + 2, 2);
  }

  ctx.resetTransform();
}

// Generate and display a new puzzle
let puzzle = undefined;
let puzzleReadonly = undefined;
function generatePuzzle() {
  puzzle = generateSudoku();
  puzzleReadonly = puzzle.map((row) => row.map((cell) => cell !== 0));
  renderPuzzle();
}

// Check if the current board is solved correctly
function checkSolution() {
  const isComplete = puzzle.every((row, rowIndex) =>
    row.every((cell, colIndex) => isValid(puzzle, rowIndex, colIndex, cell)),
  );
  alert(
    isComplete ? "Congratulations! Puzzle solved correctly." : "There are errors in your solution.",
  );
}

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowLeft":
      selectedCol = Math.max(0, selectedCol - 1);
      break;
    case "ArrowRight":
      selectedCol = Math.min(8, selectedCol + 1);
      break;
    case "ArrowUp":
      selectedRow = Math.max(0, selectedRow - 1);
      break;
    case "ArrowDown":
      selectedRow = Math.min(8, selectedRow + 1);
      break;
    case "Backspace":
    case "Delete":
      if (!puzzleReadonly[selectedRow][selectedCol]) {
        puzzle[selectedRow][selectedCol] = 0;
      }
      break;
  }
  if (e.key >= 1 && e.key <= 9 && !puzzleReadonly[selectedRow][selectedCol]) {
    puzzle[selectedRow][selectedCol] = parseInt(e.key);
  }
  renderPuzzle();
});
canvas.addEventListener("pointerdown", (e) => {
  selectedCol = Math.min(8, Math.floor(e.offsetX / 40));
  selectedRow = Math.min(8, Math.floor(e.offsetY / 40));
  renderPuzzle();
});

// Initial puzzle generation
generatePuzzle();
