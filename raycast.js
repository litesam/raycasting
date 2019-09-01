const TILE_SIZE = 32;

const NO_OF_COLUMNS = 15;
const NO_OF_ROWS = 11;

const WINDOW_WIDTH = TILE_SIZE * NO_OF_COLUMNS;
const WINDOW_HEIGHT = TILE_SIZE * NO_OF_ROWS;

let grid;
let player;

class Map {
  constructor() {
    this.grid = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1],
      [1, 0, 1, 0, 0, 2, 0, 0, 0, 1, 0, 1, 0, 2, 1],
      [1, 0, 1, 3, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 2, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 2, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 8],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 8, 9]
    ];
  }

  hasWallAt(x, y) {
    if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT) {
      return true;
    }
    var mapGridIndexX = Math.floor(x / TILE_SIZE);
    var mapGridIndexY = Math.floor(y / TILE_SIZE);
    return (this.grid[mapGridIndexY][mapGridIndexX] == 1);
  }

  render() {
    for (let i = 0; i < NO_OF_ROWS; i++) {
      for (let j = 0; j < NO_OF_COLUMNS; j++) {
        let tileColor = (this.grid[i][j] == 1 ? "#111" : "#fff");
        stroke("#111");
        fill(tileColor);
        rect(j * TILE_SIZE,
          i * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE
        );
      }
    }
  }
}

class Player {
  constructor() {
    this.x = WINDOW_WIDTH / 2;
    this.y = WINDOW_HEIGHT / 7;
    this.radius = 4;
    this.turnDirection = 0;
    this.walkDirection = 0;
    this.rotationAngle = Math.PI / 2;
    this.moveSpeed = 2.0;
    this.rotationSpeed = 2.0 * (Math.PI / 180);
  }

  update() {
    this.rotationAngle += this.turnDirection * this.rotationSpeed;

    let moveStep = this.walkDirection * this.moveSpeed;

    let playerX = this.x + Math.cos(this.rotationAngle) * moveStep;
    let playerY = this.y + Math.sin(this.rotationAngle) * moveStep;

    if (!grid.hasWallAt(playerX, playerY)) {
      this.x = playerX;
      this.y = playerY;
    }
  }

  render() {
    noStroke();
    fill("red");
    circle(this.x,
      this.y,
      this.radius
    );
    stroke("red");
    line(this.x,
      this.y,
      this.x + Math.cos(this.rotationAngle) * 30,
      this.y + Math.sin(this.rotationAngle) * 30
    );
  }
}

class Ray {
  constructor(rayAngle) {
    this.rayAngle = normalizeAngle(angle);
    this.wallHitX = 0;
    this.wallHitY = 0;
    this.distance = 0;
    this.wasHitVertical = false;

    this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
    this.isRayFacingUp = !this.isRayFacingDown;

    this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
    this.isRayFacingLeft = !this.isRayFacingRight;
  }

  cast() {

  }
}

function normalizeAngle(angle) {
  angle = angle % (2 * Math.PI);
  if (angle < 0) {
    angle = (2 * Math.PI) + angle;
  }
  return angle;
}

function keyPressed() {
  if (keyCode == UP_ARROW) {
    player.walkDirection = +1;
  } else if (keyCode == DOWN_ARROW) {
    player.walkDirection = -1;
  } else if (keyCode == RIGHT_ARROW) {
    player.turnDirection = +1;
  } else if (keyCode == LEFT_ARROW) {
    player.turnDirection = -1;
  }
}

function keyReleased() {
  if (keyCode == UP_ARROW) {
    player.walkDirection = 0;
  } else if (keyCode == DOWN_ARROW) {
    player.walkDirection = 0;
  } else if (keyCode == RIGHT_ARROW) {
    player.turnDirection = 0;
  } else if (keyCode == LEFT_ARROW) {
    player.turnDirection = 0;
  }
}

function setup() {
  createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
  grid = new Map();
  player = new Player();
}

function update() {
  player.update();
}

function draw() {
  update();
  grid.render();
  player.render();
}