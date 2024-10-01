const canvaSize = { width: 560, height: 720 };

// default -- остается всегда
// moving -- двигается
// jumping -- отталкивается дальше, чем на стандартный прыжок
// flash -- взрывается после одного приземления
const platformSize = { width: 90, height: 20 };
const platformTypes = ["jumping", "moving", "flash", "default"];
const platformStyles = {
  moving: "url(assets/sapphir.svg)",
  jumping: "url(assets/ruby.svg)",
  flash: "url(assets/black-diamond.svg)",
  default: "url(assets/emerald.svg)",
};

const doodleSize = { width: 50, height: 80 };
let doodleCoordinates = {
  x: 10,
  y: 10 + platformSize.height,
};

let isMoving = false;
let directionCode = "";
let score = 0;
let jumpDistance = 0;
let speedJump = 1;
const speed = 1;
let fallId = -1;

let platforms = [
  {
    id: "pl-0",
    x: 10,
    y: 10,
    type: "default",
  },
  {
    id: "pl-1",
    x: 100,
    y: 4 * platformSize.height,
    type: "flash",
  },
  {
    id: "pl-2",
    x: 0,
    y: 9 * platformSize.height,
    type: "moving",
  },

  {
    id: "pl-3",
    x: 300,
    y: 13 * platformSize.height,
    type: "jumping",
  },
];
let platformsCount = 4;

const doodle = document.createElement("div");
doodle.className = "doodle";

const container = document.getElementById("main");
container.appendChild(doodle);
platforms.map((plat) => addPlatform(plat));

const input = document.getElementById("score");

let isSound = false;
const audio = document.getElementById("audio");
const audioContainer = document.getElementById("sound");
audioContainer.onclick = function () {
  const method = isSound ? "pause" : "play";
  isSound = !isSound;
  audio[method]();
  audioContainer.style.backgroundImage = isSound
    ? "url(assets/audio-on.svg)"
    : "url(assets/audio-mute.svg)";
};

const dialog = document.getElementById("dialog");
const button = document.getElementById("new-game");
button.onclick = function () {
  window.location.reload();
};


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
    Math.floor(Math.random() * 4.5 * platformSize.height)
  );
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

function drawJump() {
  const jumpId = setInterval(jump, speed, speedJump);
  setTimeout(() => {
    clearInterval(jumpId);

    fallId = setInterval(jump, speed, -1);
  }, speed * 500);
}
function jump(upOrDown) {
  doodleCoordinates.y += upOrDown;
  jumpDistance += upOrDown;

  input.value = score;

  upOrDown < 0 && stopFall();

  if (doodleCoordinates.y > canvaSize.height / 2) {
    platforms.map((plat) => {
      plat.y -= speedJump;
    });
    doodleCoordinates.y -= speedJump;
  }

  if (doodleCoordinates.y <= -doodleSize.height / 2) {
    clearInterval(fallId);
    console.log("Проигрыш!");
    dialog.showModal();
  } else {
    moving();
    drawDoodle();
    drawPlatforms();
  }
}
function stopFall() {
  const underDoddlePlat = platforms.find(
    (plat) =>
      plat.x < doodleCoordinates.x + doodleSize.width &&
      plat.x + platformSize.width > doodleCoordinates.x &&
      plat.y + platformSize.height === doodleCoordinates.y
  );
  if (underDoddlePlat) {
    if (jumpDistance > 0) {
      score += jumpDistance;
    }
    jumpDistance = 0;
    speedJump = 1;
    if (underDoddlePlat.type === "flash") {
      platforms = platforms.filter((plat) => plat !== underDoddlePlat);
      document.getElementById(underDoddlePlat.id).remove();
    } else if (underDoddlePlat.type === "jumping") {
      speedJump = 5;
    }
    clearInterval(fallId);
    drawJump();
  }
}

function drawDoodle() {
  doodle.style.bottom = `${doodleCoordinates.y}px`;
  doodle.style.left = `${doodleCoordinates.x}px`;
}

function createPlatforms() {
  const endLevel = 2 * canvaSize.height;
  if (
    platforms[platforms.length - 1].y <
    canvaSize.height + 2 * doodleSize.height
  ) {
    let startLevel = platforms[platforms.length - 1].y;
    const maxX = canvaSize.width - platformSize.width;

    while (startLevel < endLevel) {
      const h = randomHeight();
      startLevel += h;
      let minX = randomGap();
      let isMovingAvailable = false;
      if (minX % 10 === 0) {
        isMovingAvailable = true;
      }
      while (maxX > minX) {
        const platform = {
          id: `pl-${platformsCount}`,
          x: minX,
          y: startLevel,
          type: isMovingAvailable ? "moving" : platformWithProbability(),
        };
        platforms.push(platform);
        platformsCount += 1;
        addPlatform(platform);
        if (isMovingAvailable) {
          minX = maxX;
        } else {
          minX += platformSize.width + randomGap();
        }
      }
    }
  }
}
function addPlatform(platform) {
  const platformDiv = document.createElement("div");
  platformDiv.id = platform.id;
  platformDiv.className = "platform";
  platformDiv.style.bottom = `${platform.y}px`;
  platformDiv.style.left = `${platform.x}px`;
  platformDiv.style.backgroundImage = platformStyles[platform.type];
  container.appendChild(platformDiv);
}
function drawPlatforms() {
  createPlatforms();

  platforms.map((plat) => {
    if (plat.type === "moving") {
      plat.x = overridedMod(plat.x + 0.5);
    }

    const platformDiv = document.getElementById(plat.id);
    if (plat.y < -2 * platformSize.height) {
      document.getElementById(plat.id).remove();
    } else {
      platformDiv.style.bottom = `${plat.y}px`;
      platformDiv.style.left = `${plat.x}px`;
    }
  });

  platforms = platforms.filter((plat) => {
    return plat.y > -platformSize.height;
  });
}



drawJump();
