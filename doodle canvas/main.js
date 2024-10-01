const canvaSize = { width: 560, height: 720 };
const canvas = document.getElementById("field");
canvas.setAttribute("height", `${canvaSize.height}`);
canvas.setAttribute("width", `${canvaSize.width}`);
const field = canvas.getContext("2d");
field.lineJoin = "round";
//field.lineWidth = 5;

// default -- остается всегда
// moving -- двигается
// jumping -- отталкивается дальше, чем на стандартный прыжок
// flash -- взрывается после одного приземления
const platformSize = { width: 90, height: 20 };
const platformTypes = ["jumping", "moving", "flash", "default"];
const platformStyles = {
  moving: "blue",
  jumping: "red",
  flash: "rgba(0, 0, 0, 0.2)",
  default: "green",
};
let platforms = [
  {
    x: 0,
    y: canvaSize.height - platformSize.height,
    type: "default",
  },
  {
    x: 100,
    y: canvaSize.height - 5 * platformSize.height,
    type: "jumping",
  },
  {
    x: 200,
    y: canvaSize.height - 10 * platformSize.height,
    type: "default",
  },
];

const doodleSize = { width: 50, height: 80 };
let doodleCoordinates = {
  x: 10,
  y: canvaSize.height - doodleSize.height - platformSize.height,
};

let isMoving = false;
let directionCode = "";
let score = 0;
let speedJump = 1;
const speed = 1;
let fallId = -1;

function platformWithProbability() {
  const helpArray = [0, 0, 2, 2, 2, 3, 3, 3, 3, 3];
  const index = Math.floor(Math.random() * 10);
  return platformTypes[helpArray[index]];
}

function randomGap() {
  return (
    10 + platformSize.width + Math.floor(Math.random() * 3 * platformSize.width)
  );
}

function randomHeight() {
  return (
    5 +
    platformSize.height +
    Math.floor(Math.random() * 5 * platformSize.height)
  );
}

function createPlatforms() {
  const endLevel = -canvaSize.height;
  if (platforms[platforms.length - 1].y > -doodleSize.height * 2) {
    let startLevel = platforms[platforms.length - 1].y;
    const maxX = canvaSize.width - platformSize.width;

    while (startLevel > endLevel) {
      const h = randomHeight();
      startLevel -= h;
      let minX = randomGap();
      let isMovingAvailable = false;
      if (minX % 10 === 0) {
        isMovingAvailable = true;
      }
      while (maxX > minX) {
        platforms.push({
          x: minX,
          y: startLevel,
          type: isMovingAvailable ? "moving" : platformWithProbability(),
        });
        if (isMovingAvailable) {
          minX = maxX;
        } else {
          minX += platformSize.width + randomGap();
        }
      }
    }
  }
}

function overridedMod(coordX) {
  if (coordX < -doodleSize.width / 2)
    return canvaSize.width - doodleSize.width / 2;
  if (coordX + doodleSize.width / 2 > canvaSize.width)
    return -doodleSize.width / 2;
  return coordX;
}

function moving() {
  if (isMoving) {
    if (directionCode === "ArrowLeft") {
      doodleCoordinates.x =
        overridedMod(doodleCoordinates.x - 1) % canvaSize.width;
    } else if (directionCode === "ArrowRight") {
      doodleCoordinates.x =
        overridedMod(doodleCoordinates.x + 1) % canvaSize.width;
    }
  }
}

function jump(upOrDown) {
  doodleCoordinates.y -= upOrDown;
  field.clearRect(0, 0, canvaSize.width, canvaSize.height);

  upOrDown < 0 && stopFall();

  if (doodleCoordinates.y < canvaSize.height / 2) {
    platforms.map((plat) => {
      plat.y += speedJump;
    });
    doodleCoordinates.y += speedJump;
  }

  platforms = platforms.filter((plat) => plat.y <= canvaSize.height);

  if (doodleCoordinates.y > canvaSize.height) {
    clearInterval(fallId);
    console.log("Проигрыш!");
  } else {
    moving();
    drawPlatforms();
    drawDoodle();
  }
}

function stopFall() {
  const underDoddlePlat = platforms.find(
    (plat) =>
      plat.x < doodleCoordinates.x + doodleSize.width &&
      plat.x + platformSize.width > doodleCoordinates.x &&
      plat.y === doodleCoordinates.y + doodleSize.height
  );
  if (underDoddlePlat) {
    speedJump = 1;

    if (underDoddlePlat.type === "flash") {
      platforms = platforms.filter((plat) => plat !== underDoddlePlat);
    } else if (underDoddlePlat.type === "jumping") {
      speedJump = 5;
    }
    clearInterval(fallId);
    drawJump();
  }
}

function drawDoodle() {
  field.fillStyle = "violet";
  field.fillRect(
    doodleCoordinates.x,
    doodleCoordinates.y,
    doodleSize.width,
    doodleSize.height
  );
}

function drawPlatforms() {
  createPlatforms();

  platforms.map((plat) => {
    field.fillStyle = platformStyles[plat.type];
    if (plat.type === "moving") {
      plat.x = overridedMod(plat.x + 0.5);
    }

    field.fillRect(plat.x, plat.y, platformSize.width, platformSize.height);
  });
}

function drawJump() {
  const jumpId = setInterval(jump, speed, speedJump);
  setTimeout(() => {
    clearInterval(jumpId);

    fallId = setInterval(jump, speed, -1);
  }, speed * 500);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    isMoving = true;
    directionCode = event.key;
  }
});
document.addEventListener("keyup", () => {
  isMoving = false;
  directionCode = "";
});

drawJump();
