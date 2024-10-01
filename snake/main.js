const cellSize = 50;
const cellCount = 10;
const canvaSize = cellSize * cellCount;
const canvas = document.getElementById("field");
canvas.setAttribute("height", `${canvaSize}`);
canvas.setAttribute("width", `${canvaSize}`);
const field = canvas.getContext("2d");
const input = document.getElementById("input");
input.value = "";
let snake = [{ x: 0, y: 0 }];

let food = {
  x: 50,
  y: 50,
  new: () => {
    x = Math.floor(Math.random() * 10) * cellSize;
    y = Math.floor(Math.random() * 10) * cellSize;
    while (!isFree(x, y)) {
      x = Math.floor(Math.random() * 10) * cellSize;
      y = Math.floor(Math.random() * 10) * cellSize;
    }
    food.x = x;
    food.y = y;
  },
};

let direction = "right";
function changeDirection(event) {
  if (event.which === 37) direction = "left";
  else if (event.which === 38) direction = "up";
  else if (event.which === 39) direction = "right";
  else if (event.which === 40) direction = "down";
}
function overridedAbs(num) {
  if (num < 0) return cellSize * (cellCount - 1);
  return num;
}
document.addEventListener("keydown", (e) => changeDirection(e));

function moveForward() {
  const previousHead = snake[0];
  const previousTail = snake.pop();

  let newHead;
  if (direction === "right") {
    newHead = {
      x: (previousHead.x + cellSize) % canvaSize,
      y: previousHead.y,
    };
  } else if (direction === "left") {
    newHead = {
      x: overridedAbs(previousHead.x - cellSize) % canvaSize,
      y: previousHead.y,
    };
  } else if (direction === "up") {
    newHead = {
      x: previousHead.x,
      y: overridedAbs(previousHead.y - cellSize) % canvaSize,
    };
  } else if (direction === "down") {
    newHead = {
      x: previousHead.x,
      y: (previousHead.y + cellSize) % canvaSize,
    };
  }
  snake.unshift(newHead);
  return previousTail;
}

function drawFood() {
  field.fillStyle = "purple";
  field.fillRect(food.x, food.y, cellSize, cellSize);
}

function drawSnake() {
  field.fillStyle = "dimgrey";
  snake.map((cell) => field.fillRect(cell.x, cell.y, cellSize - 1, cellSize - 1));
  field.fillStyle = "violet";
  const head = snake[0];
  field.fillRect(head.x, head.y, cellSize, cellSize);
}

function drawGame() {
  field.clearRect(0, 0, canvaSize, canvaSize);
  drawFood();
  const previousTail = moveForward();
  drawSnake();

  const head = snake[0];
  if (head.x === food.x && head.y === food.y) {
    snake.push(previousTail);
    food.new();
  }

  if (isDead()) {
    clearInterval(gameId);
    console.log("death");
    input.value = "Вы проиграли. Перезагрузите страницу, чтобы начать заново";
  }
}

function isDead() {
  for (let i = 1; i < snake.length; i++) {
    if (snake[0].x == snake[i].x && snake[0].y == snake[i].y) return true;
  }
  return false;
}

function isFree(x, y) {
  for (let i = 0; i < snake.length; i++) {
    if (snake[i].x == x && snake[i].y == y) return false;
  }
  return true;
}

drawSnake();
drawFood();
let gameId = setInterval(drawGame, 300);
