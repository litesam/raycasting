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
      [1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1],
      [1, 0, 1, 0, 0, 2, 0, 0, 0, 1, 0, 1, 0, 2, 1],
      [1, 0, 1, 3, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 2, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 2, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];
  }

  render() {
    for (let i = 0; i < WINDOW_HEIGHT; i++) {
      for (let j = 0; j < WINDOW_WIDTH; j++) {
        let tileColor = (this.grid[i][j] != 0 ? "#111" : "#fff");
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


function setup() {
  createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
  grid = new Map();
}

function update() {
  grid.render();
}

function draw() {
  update();
}