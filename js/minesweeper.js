function Cell(i, j, w) {
  this.i = i;
  this.j = j;
  this.x = i * w;
  this.y = j * w;
  this.w = w;
  this.neighborCount = 0;

  this.bomb = false;
  this.revealed = false;
  this.flaged = false;
}

Cell.prototype.show = function() {
  stroke(0);
  noFill();
  rect(this.x, this.y, this.w, this.w);
  if (this.revealed && !this.flaged) {
    if (this.bomb) {
      fill(0);
      ellipse(this.x + this.w * 0.5, this.y + this.w * 0.5, this.w * 0.5)
    }
    else {
      fill(200);
      rect(this.x, this.y, this.w, this.w);
      if (this.neighborCount > 0) {
        textAlign(CENTER);
        fill(0);
        text(this.neighborCount, this.x + this.w * 0.5, this.y + 20);
      }
    }
  } else if(this.flaged){
    fill(900);
    triangle(this.x + (0.2 * this.w), this.y + (0.2 * this.w), this.x + (0.8 * this.w), this.y + this.w * 0.5, this.x + (0.2 * this.w), this.y + (0.8 * this.w));
    rect(this.x + (0.2 * this.w), this.y + (0.2 * this.w), this.w * 0.1, this.w * 0.8);
  }
}

Cell.prototype.contains = function(x, y){
  return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.w)
}

Cell.prototype.countBombs = function() {
  if (this.bomb) {
    this.neighborCount = -1;
    return;
  }
  var total = 0;
  for (var xoff = -1; xoff <= 1; xoff++) {
    for (var yoff = -1; yoff <= 1; yoff++) {
      var i = this.i + xoff;
      var j = this.j + yoff;
      if (i > -1 && i < cols && j > -1 && j < rows) {
        var neighbor = grid[i][j];
        if (neighbor.bomb) {
          total++;
        }
      }
    }
  }
  this.neighborCount = total;
}

Cell.prototype.reveal = function(){
  if(!this.flaged){
    this.revealed = true;
    if (this.neighborCount == 0) {
      this.floodFill();
    }
  }
}
bombCounter = 100;
Cell.prototype.flag = function(){
  if(!this.flaged && !this.revealed){
    this.flaged = true;
    bombCounter--
    bombs.innerText = bombCounter;
  } else if(this.flaged){
    this.flaged = false;
  }
}

Cell.prototype.floodFill = function() {
  for (var xoff = -1; xoff <= 1; xoff++) {
    for (var yoff = -1; yoff <= 1; yoff++) {
      var i = this.i + xoff;
      var j = this.j + yoff;
      if (i > -1 && i < cols && j > -1 && j < rows) {
        var neighbor = grid[i][j];
        if (!neighbor.bomb && !neighbor.revealed) {
          neighbor.reveal();
        }
      }
    }
  }
}

function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}

var grid;
var cols;
var rows;
var w = 30;
var totalBombs = 100;

function setup() {
  createCanvas(901, 601);
  cols = floor(width / w);
  rows = floor(height / w);
  grid = make2DArray(cols, rows);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = new Cell(i, j, w);
    }
  }
  var options = [];
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      options.push([i, j]);
    }
  }

  // Pick totalBombs spots
  for (var n = 0; n < totalBombs; n++) {
    var index = floor(random(options.length));
    var choice = options[index];
    var i = choice[0];
    var j = choice[1];
    options.splice(index, 1);
    grid[i][j].bomb = true;
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].countBombs();
    }
  }

  let counter = 0;
  let timer = document.getElementById('timer');
  timer.innerText = '0';

  function timeIt(){
    counter++;
    timer.innerText = counter;
  }
  setInterval(timeIt, 1000);

  var bombs = document.getElementById('bombs');
  bombs.innerText = bombCounter;

}

function gameOver() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].revealed = true;
    }
  }
  var status = document.getElementById("status");
  status.innerText = "Game over :("

}

document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
}, false);

function mousePressed() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j].contains(mouseX, mouseY)&& mouseButton == LEFT) {
        grid[i][j].reveal();
        if (grid[i][j].bomb) {
          gameOver();
        }
      } else if (grid[i][j].contains(mouseX, mouseY)&& mouseButton == RIGHT) {
        grid[i][j].flag()
      }
    }
  }
}

function draw() {
  background(90);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].show();
    }
  }
}
