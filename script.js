const cells = document.querySelectorAll(".cell");

const statusText = document.querySelector("#statusText");
const turnIndicator = document.querySelector("#turnIndicator");

const modeSelect = document.querySelector("#modeSelect");
const difficultySelect = document.querySelector("#difficultySelect");
const difficultyBox = document.querySelector("#difficultyBox");

const xScore = document.querySelector("#xScore");
const oScore = document.querySelector("#oScore");
const roundNumber = document.querySelector("#roundNumber");

const xName = document.querySelector("#xName");
const oName = document.querySelector("#oName");
const hintText = document.querySelector("#hintText");

const xScoreCard = document.querySelector("#xScoreCard");
const oScoreCard = document.querySelector("#oScoreCard");

const newRoundBtn = document.querySelector("#newRoundBtn");
const resetBtn = document.querySelector("#resetBtn");
const themeBtn = document.querySelector("#themeBtn");

const resultModal = document.querySelector("#resultModal");
const resultIcon = document.querySelector("#resultIcon");
const resultTitle = document.querySelector("#resultTitle");
const resultMessage = document.querySelector("#resultMessage");
const modalNextBtn = document.querySelector("#modalNextBtn");

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

let boardState = Array(9).fill("");
let currentPlayer = "X";
let gameActive = true;
let round = 1;

let scores = {
  X: 0,
  O: 0
};

cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    const index = Number(cell.dataset.index);

    if (!gameActive || boardState[index] !== "") {
      return;
    }

    if (
      modeSelect.value === "computer" &&
      currentPlayer === "O"
    ) {
      return;
    }

    makeMove(index, currentPlayer);

    if (
      gameActive &&
      modeSelect.value === "computer" &&
      currentPlayer === "O"
    ) {
      setTimeout(computerMove, 500);
    }
  });
});

function makeMove(index, player) {
  boardState[index] = player;

  cells[index].textContent = player;
  cells[index].classList.add(player.toLowerCase());
  cells[index].disabled = true;

  const result = checkWinner(boardState);

  if (result.winner) {
    finishGame(result.winner, result.combo);
    return;
  }

  if (boardState.every((cell) => cell !== "")) {
    finishDraw();
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateTurn();
}

function checkWinner(state) {
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;

    if (
      state[a] &&
      state[a] === state[b] &&
      state[a] === state[c]
    ) {
      return {
        winner: state[a],
        combo: combination
      };
    }
  }

  return {
    winner: null,
    combo: []
  };
}

function finishGame(winner, combo) {
  gameActive = false;
  scores[winner]++;

  combo.forEach((index) => {
    cells[index].classList.add("win");
  });

  updateScoreboard();

  if (
    winner === "X" &&
    modeSelect.value === "computer"
  ) {
    showResult(
      "🏆",
      "Siz g‘alaba qozondingiz!",
      "Juda yaxshi o‘yin!"
    );
  } else if (
    winner === "O" &&
    modeSelect.value === "computer"
  ) {
    showResult(
      "🤖",
      "Kompyuter yutdi",
      "Keyingi raundda yana urinib ko‘ring."
    );
  } else {
    const winnerName =
      winner === "X"
        ? xName.textContent
        : oName.textContent;

    showResult(
      "🏆",
      `${winnerName} g‘alaba qozondi!`,
      "Ajoyib o‘yin!"
    );
  }
}

function finishDraw() {
  gameActive = false;

  showResult(
    "🤝",
    "Durang!",
    "Ikkala o‘yinchi ham yaxshi o‘ynadi."
  );
}

function computerMove() {
  if (!gameActive || currentPlayer !== "O") {
    return;
  }

  let move;

  if (difficultySelect.value === "easy") {
    move = getRandomMove();
  } else if (difficultySelect.value === "medium") {
    move = Math.random() < 0.55
      ? getBestMove()
      : getRandomMove();
  } else {
    move = getBestMove();
  }

  if (move !== null) {
    makeMove(move, "O");
  }
}

function getRandomMove() {
  const emptyCells = boardState
    .map((value, index) => {
      return value === "" ? index : null;
    })
    .filter((index) => index !== null);

  if (emptyCells.length === 0) {
    return null;
  }

  return emptyCells[
    Math.floor(Math.random() * emptyCells.length)
  ];
}

function getBestMove() {
  const winningMove = findWinningMove("O");

  if (winningMove !== null) {
    return winningMove;
  }

  const blockingMove = findWinningMove("X");

  if (blockingMove !== null) {
    return blockingMove;
  }

  if (boardState[4] === "") {
    return 4;
  }

  const corners = [0, 2, 6, 8];

  const emptyCorners = corners.filter((index) => {
    return boardState[index] === "";
  });

  if (emptyCorners.length > 0) {
    return emptyCorners[
      Math.floor(Math.random() * emptyCorners.length)
    ];
  }

  return getRandomMove();
}

function findWinningMove(player) {
  for (let index = 0; index < 9; index++) {
    if (boardState[index] !== "") {
      continue;
    }

    const testBoard = [...boardState];
    testBoard[index] = player;

    if (checkWinner(testBoard).winner === player) {
      return index;
    }
  }

  return null;
}

function updateTurn() {
  const playerName =
    currentPlayer === "X"
      ? xName.textContent
      : oName.textContent;

  statusText.textContent = `Navbat: ${playerName}`;

  const isX = currentPlayer === "X";

  turnIndicator.style.background = isX
    ? "var(--blue)"
    : "var(--purple)";

  turnIndicator.style.boxShadow = isX
    ? "0 0 12px var(--blue)"
    : "0 0 12px var(--purple)";

  xScoreCard.classList.toggle("active", isX);
  oScoreCard.classList.toggle("active", !isX);
}

function updateScoreboard() {
  xScore.textContent = scores.X;
  oScore.textContent = scores.O;
}

function startNewRound() {
  boardState = Array(9).fill("");
  currentPlayer = "X";
  gameActive = true;
  round++;

  roundNumber.textContent = round;

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.disabled = false;
    cell.className = "cell";
  });

  resultModal.classList.add("hidden");
  updateTurn();
}

function resetGame() {
  scores = {
    X: 0,
    O: 0
  };

  round = 0;

  updateScoreboard();
  startNewRound();
}

function showResult(icon, title, message) {
  resultIcon.textContent = icon;
  resultTitle.textContent = title;
  resultMessage.textContent = message;

  resultModal.classList.remove("hidden");
}

function updateMode() {
  const isComputer = modeSelect.value === "computer";

  difficultyBox.style.display = isComputer
    ? "flex"
    : "none";

  xName.textContent = isComputer
    ? "Siz"
    : "1-o‘yinchi";

  oName.textContent = isComputer
    ? "Kompyuter"
    : "2-o‘yinchi";

  hintText.textContent = isComputer
    ? "kompyuter"
    : "2-o‘yinchi";

  resetGame();
}

modeSelect.addEventListener("change", updateMode);

difficultySelect.addEventListener("change", () => {
  if (modeSelect.value === "computer") {
    startNewRound();
  }
});

newRoundBtn.addEventListener("click", startNewRound);

resetBtn.addEventListener("click", resetGame);

modalNextBtn.addEventListener("click", startNewRound);

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");

  themeBtn.textContent =
    document.body.classList.contains("light")
      ? "🌙"
      : "☀️";
});

updateMode();
updateScoreboard();
