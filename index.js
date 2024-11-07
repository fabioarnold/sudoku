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

let puzzle = undefined;
function generatePuzzle() {
  puzzle = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillBoard(puzzle);
  removeCellsForUniquePuzzle(puzzle, 40);

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
  selectedCell = document.querySelector(".cell:not(.readonly)");
  updateClasses();
}

function checkSolution() {
  const isComplete = puzzle.every((row, rowIndex) =>
    row.every((cell, colIndex) => cell && isValid(puzzle, rowIndex, colIndex, cell)),
  );
  if (isComplete && timerInterval) {
    clearInterval(timerInterval);
    timerInterval = undefined;
    alert(`Congratulations! Puzzle solved correctly in ${timeSpan.innerText}.`);
  }
}

function setValue(value) {
  const selectedRow = parseInt(selectedCell.dataset.row);
  const selectedCol = parseInt(selectedCell.dataset.col);
  puzzle[selectedRow][selectedCol] = value;
  selectedCell.innerText = value;
  checkSolution();
}

function clearValue() {
  const selectedRow = parseInt(selectedCell.dataset.row);
  const selectedCol = parseInt(selectedCell.dataset.col);
  puzzle[selectedRow][selectedCol] = 0;
  selectedCell.innerText = "";
}

document.addEventListener("keydown", (e) => {
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
        clearValue();
      }
      break;
  }
  selectedCell = grid.querySelector(`[data-row="${selectedRow}"][data-col="${selectedCol}"]`);
  if (e.key >= 1 && e.key <= 9 && !selectedCell.classList.contains("readonly")) {
    setValue(parseInt(e.key));
  }
  updateClasses();
});

let selectedCell;
const timeSpan = document.querySelector("#time span");
const grid = document.querySelector("#sudokuGrid");
const candidates = document.querySelector("#candidates");
const deleteButton = document.querySelector("#delete.button");
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
      cell.addEventListener("pointerdown", (e) => {
        selectedCell = e.target;
        updateClasses();
      });
      box.appendChild(cell);
    }
  }
  for (let i = 0; i < 9; i++) {
    const candidate = document.createElement("div");
    candidate.classList.add("button");
    candidate.innerText = i + 1;
    candidate.addEventListener("pointerdown", (e) => {
      setValue(parseInt(e.target.innerText));
      updateClasses();
    });
    candidates.appendChild(candidate);
  }
  deleteButton.addEventListener("pointerdown", (e) => {
    selectedCell.innerText = "";
    const selectedRow = parseInt(selectedCell.dataset.row);
    const selectedCol = parseInt(selectedCell.dataset.col);
    puzzle[selectedRow][selectedCol] = 0;
    updateClasses();
  });
}

function updateClasses() {
  const counts = {};
  for (let i = 1; i <= 9; i++) {
    counts[i.toString()] = 0;
  }

  grid.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove("selected");
    cell.classList.remove("group");
    cell.classList.remove("same");
    cell.classList.remove("invalid");
    if (cell.innerText) {
      counts[cell.innerText]++;
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

  candidates.querySelectorAll(".button").forEach((candidate) => {
    candidate.classList.remove("disabled");
    candidate.classList.remove("hidden");
    if (selectedCell.classList.contains("readonly")) {
      candidate.classList.add("disabled");
    }
    if (counts[candidate.innerText] >= 9) {
      candidate.classList.add("hidden");
    }
  });

  if (selectedCell.classList.contains("readonly") || !selectedCell.innerText) {
    deleteButton.classList.add("disabled");
  } else {
    deleteButton.classList.remove("disabled");
  }
}

let timerSeconds = 0;
let timerInterval;
function startTimer() {
  timerInterval = setInterval(() => {
    timerSeconds++;
    const minutes = String(Math.floor(timerSeconds / 60)).padStart(2, "0");
    const seconds = String(timerSeconds % 60).padStart(2, "0");
    timeSpan.innerText = `${minutes}:${seconds}`;
  }, 1000);
}

generateDom();

generatePuzzle();

startTimer();
