const TILE_SIZE = 32;

const NO_OF_COLUMNS = 15;
const NO_OF_ROWS = 11;

const WINDOW_WIDTH = TILE_SIZE * NO_OF_COLUMNS;
const WINDOW_HEIGHT = TILE_SIZE * NO_OF_ROWS;

const FOV_ANGLE = 60 * (Math.PI / 180);

const WALL_STRIP_WIDTH = 1;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

let grid;
let player;
let rays;

let patternCanvas;
let patternContext;

let canvasImage;

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
    let mapGridIndexX = Math.floor(x / TILE_SIZE);
    let mapGridIndexY = Math.floor(y / TILE_SIZE);
    return (this.grid[mapGridIndexY][mapGridIndexX] == 1);
  }

  render() {
    for (let i = 0; i < NO_OF_ROWS; i++) {
      for (let j = 0; j < NO_OF_COLUMNS; j++) {
        let tileColor = (this.grid[i][j] == 1 ? "#111" : "#fff");

        stroke("#111");
        if (this.grid[i][j] == 1) {
          image(canvasImage,
            j * TILE_SIZE,
            i * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE
          );
        } else {
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
}

class Player {
  constructor() {
    this.x = 52;
    this.y = 303;
    this.radius = 4;
    this.turnDirection = 0;
    this.walkDirection = 0;
    this.rotationAngle = 0;
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
    this.rayAngle = normalizeAngle(rayAngle);
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
    let xintercept, yintercept;
    let xstep, ystep;

    /////////////////////////// HORIZONTAL-GRID INTERSECTION ////////////////////////////////////
    let foundHorzWallHit = false;
    let horzWallHitX = 0;
    let horzWallHitY = 0;

    // Find the y-coordinate of the closest horizontal grid intersenction
    yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
    yintercept += this.isRayFacingDown ? TILE_SIZE : 0;

    // Find the x-coordinate of the closest horizontal grid intersection
    xintercept = player.x + (yintercept - player.y) / Math.tan(this.rayAngle);

    // Calculate the increment xstep and ystep
    ystep = TILE_SIZE;
    ystep *= this.isRayFacingUp ? -1 : 1;

    xstep = TILE_SIZE / Math.tan(this.rayAngle);
    xstep *= (this.isRayFacingLeft && xstep > 0) ? -1 : 1;
    xstep *= (this.isRayFacingRight && xstep < 0) ? -1 : 1;

    let nextHorzTouchX = xintercept;
    let nextHorzTouchY = yintercept;

    // Increment xstep and ystep until we find a wall
    while (nextHorzTouchX >= 0 && nextHorzTouchX <= WINDOW_WIDTH && nextHorzTouchY >= 0 && nextHorzTouchY <= WINDOW_HEIGHT) {
      if (grid.hasWallAt(nextHorzTouchX, nextHorzTouchY - (this.isRayFacingUp ? 1 : 0))) {
        foundHorzWallHit = true;
        horzWallHitX = nextHorzTouchX;
        horzWallHitY = nextHorzTouchY;
        break;
      } else {
        nextHorzTouchX += xstep;
        nextHorzTouchY += ystep;
      }
    }

    //////////////////////////// VERTICAL-GRID INTERSECTION /////////////////////////////////////
    let foundVertWallHit = false;
    let vertWallHitX = 0;
    let vertWallHitY = 0;

    // Find the x-coordinate of the closest vertical grid intersenction
    xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
    xintercept += this.isRayFacingRight ? TILE_SIZE : 0;

    // Find the y-coordinate of the closest vertical grid intersection
    yintercept = player.y + (xintercept - player.x) * Math.tan(this.rayAngle);

    // Calculate the increment xstep and ystep
    xstep = TILE_SIZE;
    xstep *= this.isRayFacingLeft ? -1 : 1;

    ystep = TILE_SIZE * Math.tan(this.rayAngle);
    ystep *= (this.isRayFacingUp && ystep > 0) ? -1 : 1;
    ystep *= (this.isRayFacingDown && ystep < 0) ? -1 : 1;

    let nextVertTouchX = xintercept;
    let nextVertTouchY = yintercept;

    // Increment xstep and ystep until we find a wall
    while (nextVertTouchX >= 0 && nextVertTouchX <= WINDOW_WIDTH && nextVertTouchY >= 0 && nextVertTouchY <= WINDOW_HEIGHT) {
      if (grid.hasWallAt(nextVertTouchX - (this.isRayFacingLeft ? 1 : 0), nextVertTouchY)) {
        foundVertWallHit = true;
        vertWallHitX = nextVertTouchX;
        vertWallHitY = nextVertTouchY;
        break;
      } else {
        nextVertTouchX += xstep;
        nextVertTouchY += ystep;
      }
    }

    // Calculate both horizontal and vertical distances and choose the smallest value
    let horzHitDistance = (foundHorzWallHit)
      ? distanceBetweenPoints(player.x, player.y, horzWallHitX, horzWallHitY)
      : Number.MAX_VALUE;
    let vertHitDistance = (foundVertWallHit)
      ? distanceBetweenPoints(player.x, player.y, vertWallHitX, vertWallHitY)
      : Number.MAX_VALUE;

    // only store the smallest of the distances
    if (vertHitDistance < horzHitDistance) {
      this.wallHitX = vertWallHitX;
      this.wallHitY = vertWallHitY;
      this.distance = vertHitDistance;
      this.wasHitVertical = true;
    } else {
      this.wallHitX = horzWallHitX;
      this.wallHitY = horzWallHitY;
      this.distance = horzHitDistance;
      this.wasHitVertical = false;
    }
  }
  render() {
    stroke("red");
    line(
      player.x,
      player.y,
      this.wallHitX,
      this.wallHitY
    );
  }
}

/*

class Ray {
  constructor(rayAngle) {
    this.rayAngle = normalizeAngle(rayAngle);
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
    let xintercept, yintercept;
    let xstep, ystep;
    /////////////////////////// HORIZONTAL-GRID INTERSECTION ////////////////////////////////////
    let foundHorzWallHit = false;
    let horzWallHitX = 0, horzWallHitY = 0;

    yintercept = parseInt(player.y / TILE_SIZE) * TILE_SIZE;
    yintercept += this.isRayFacingDown ? TILE_SIZE : 0;

    xintercept = player.x + (yintercept - player.y) / Math.tan(this.rayAngle);

    ystep = TILE_SIZE;
    ystep *= this.isRayFacingUp ? -1 : +1;

    xstep = TILE_SIZE / Math.tan(this.rayAngle);
    xstep *= (this.isRayFacingLeft && xstep > 0) ? -1 : +1;
    xstep *= (this.isRayFacingRight && xstep < 0) ? -1 : +1;

    let nextHorzTouchX = xintercept;
    let nextHorzTouchY = yintercept;

    while (nextHorzTouchX >= 0 && nextHorzTouchX <= WINDOW_WIDTH && nextHorzTouchY >= 0 && nextHorzTouchY <= WINDOW_HEIGHT) {
      if (grid.hasWallAt(nextHorzTouchX, nextHorzTouchY - (this.isRayFacingUp ? 1 : 0))) {
        foundHorzWallHit = true;
        horzWallHitX = nextHorzTouchX;
        horzWallHitY = nextHorzTouchY;
      } else {
        nextHorzTouchX += xstep;
        nextHorzTouchY += ystep;
      }
    }

    //////////////////////////// VERTICAL-GRID INTERSECTION /////////////////////////////////////
    let foundVertWallHit = false;
    let vertWallHitX = 0, vertWallHitY = 0;

    xintercept = parseInt(player.x / TILE_SIZE) * TILE_SIZE;
    xintercept += this.isRayFacingRight ? TILE_SIZE : 0;

    yintercept = player.y + (xintercept - player.x) * Math.tan(this.rayAngle);

    xstep = TILE_SIZE;
    xstep *= this.isRayFacingLeft ? -1 : +1;

    ystep = TILE_SIZE * Math.tan(this.rayAngle);
    ystep *= (this.isRayFacingUp && ystep > 0) ? -1 : +1;
    ystep *= (this.isRayFacingDown && ystep < 0) ? -1 : +1;

    let nextVertTouchX = xintercept;
    let nextVertTouchY = yintercept;

    while (nextVertTouchX >= 0 && nextVertTouchX <= WINDOW_WIDTH && nextVertTouchY >= 0 && nextVertTouchY <= WINDOW_HEIGHT) {
      if (grid.hasWallAt(nextVertTouchX - (this.isRayFacingLeft ? 1 : 0), nextVertTouchY)) {
        foundVertWallHit = true;
        vertWallHitX = nextVertTouchX;
        vertWallHitY = nextVertTouchY;
      } else {
        nextVertTouchX += xstep;
        nextVertTouchY += ystep;
      }
    }

    let horzHitDistance = (foundHorzWallHit) ? distanceBetweenPoints(player.x, player.y, horzWallHitX, horzWallHitY) : Number.MAX_VALUE;
    let vertHitDistance = (foundVertWallHit) ? distanceBetweenPoints(player.x, player.y, vertWallHitX, vertWallHitY) : Number.MAX_VALUE;

    if (vertHitDistance < horzHitDistance) {
      this.wallHitX = vertWallHitX;
      this.wallHitY = vertWallHitY;
      this.distance = vertHitDistance;
      this.wasHitVertical = true;
    } else {
      this.wallHitX = horzWallHitX;
      this.wallHitY = horzWallHitY;
      this.distance = horzHitDistance;
      this.wasHitVertical = false;
    }
  }

  render() {
    stroke('red');
    line(player.x, player.y, this.wallHitX, this.wallHitY);
  }
}

*/

function castAllRays() {
  let rayAngle = player.rotationAngle - (FOV_ANGLE / 2);

  rays = [];

  for (let i = 0; i < NUM_RAYS; i++) {
    let ray = new Ray(rayAngle);
    ray.cast();
    rays.push(ray);

    rayAngle += FOV_ANGLE / NUM_RAYS;
  }
}

function distanceBetweenPoints(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function convertCanvasToImage(canvas) {
  return loadImage(canvas.toDataURL("image/png"));
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
  patternCanvas = document.createElement('canvas');
  patternContext = patternCanvas.getContext('2d');

  patternCanvas.width = TILE_SIZE;
  patternCanvas.height = TILE_SIZE;

  patternContext.fillStyle = '#fec';
  patternContext.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
  patternContext.arc(0, 0, TILE_SIZE, 0, 0.5 * Math.PI);
  patternContext.stroke();

  canvasImage = convertCanvasToImage(patternCanvas);
}

function update() {
  player.update();
  castAllRays();
}

function draw() {
  update();
  grid.render();
  for (ray of rays) {
    ray.render();
  }
  player.render();
}
