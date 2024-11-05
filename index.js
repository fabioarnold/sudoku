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

// easy = 43
// medium = 43
// hard = 81 - 30
// master = 81 - 27
// extreme = 81 - 23

// Placeholder for generating and solving functions
function generateSudoku() {
  // Use the logic provided in the previous JavaScript solution to generate a Sudoku puzzle
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillBoard(board);
  removeCellsForUniquePuzzle(board, 40);
  return board;
}

// Generate and display a new puzzle
let puzzle = undefined;
function generatePuzzle() {
  puzzle = generateSudoku();
  grid.querySelectorAll(".cell").forEach((c) => {
    const value = puzzle[c.dataset.row][c.dataset.col];
    if (value > 0) {
      c.innerText = value;
      c.classList.add("readonly");
    } else {
      c.innerText = "";
      c.classList.remove("readonly");
    }
  });
  updateClasses();
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
  if (!selectedCell) return;
  e.preventDefault();
  let selectedRow = parseInt(selectedCell.dataset.row);
  let selectedCol = parseInt(selectedCell.dataset.col);
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
      if (!selectedCell.classList.contains("readonly")) {
        puzzle[selectedRow][selectedCol] = 0;
        selectedCell.innerText = "";
      }
      break;
  }
  selectedCell = grid.querySelector(`[data-row="${selectedRow}"][data-col="${selectedCol}"]`);
  if (e.key >= 1 && e.key <= 9 && !selectedCell.classList.contains("readonly")) {
    puzzle[selectedRow][selectedCol] = parseInt(e.key);
    selectedCell.innerText = puzzle[selectedRow][selectedCol];
  }
  updateClasses();
});

let selectedCell = undefined;
const grid = document.querySelector("#sudokuGrid");
function generateDom() {
  for (let bi = 0; bi < 9; bi++) {
    const box = document.createElement("div");
    box.classList.add("box");
    grid.appendChild(box);
    for (let ci = 0; ci < 9; ci++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.box = bi;
      cell.dataset.row = Math.floor(bi / 3) * 3 + Math.floor(ci / 3);
      cell.dataset.col = (bi % 3) * 3 + (ci % 3);
      cell.addEventListener("click", (e) => {
        selectedCell = e.target;
        updateClasses();
      });
      box.appendChild(cell);
    }
  }
}

function updateClasses() {
  grid.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove("selected");
    cell.classList.remove("group");
    cell.classList.remove("same");
    cell.classList.remove("invalid");
    if (cell.innerText) {
      if (!cell.classList.contains("readonly")) {
        if (
          !isValid(
            puzzle,
            parseInt(cell.dataset.row),
            parseInt(cell.dataset.col),
            parseInt(cell.innerText),
          )
        ) {
          cell.classList.add("invalid");
        }
      }
      if (cell.innerText === selectedCell.innerText) {
        cell.classList.add("same");
      }
    }
    if (
      cell.dataset.box === selectedCell.dataset.box ||
      cell.dataset.row === selectedCell.dataset.row ||
      cell.dataset.col === selectedCell.dataset.col
    ) {
      cell.classList.add("group");
    }
  });
  selectedCell.classList.add("selected");
}

generateDom();

// Initial puzzle generation
generatePuzzle();
