function Cell(i, j, w) {
  this.i = i;
  this.j = j;
  this.x = i * w;
  this.y = j * w;
  this.w = w;
  this.neighborCount = 0;
  this.neighborFlag = 0;

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
    revealed++
    if (this.neighborCount == 0) {
      this.floodFill();
    }
  }
}

// bombCounter = totalBombs;
Cell.prototype.flag = function(){
  if(!this.flaged && !this.revealed){
    this.flaged = true;
    totalBombs--
    bombs.innerText = totalBombs;
    for (var xoff = -1; xoff <= 1; xoff++) {
      for (var yoff = -1; yoff <= 1; yoff++) {
        var i = this.i + xoff;
        var j = this.j + yoff;
        if (i > -1 && i < cols && j > -1 && j < rows) {
          var neighbor = grid[i][j];
          neighbor.neighborFlag++
        }
      }
    }
  } else if(this.flaged){
    this.flaged = false;
    totalBombs++
    bombs.innerText = totalBombs;
    for (var xoff = -1; xoff <= 1; xoff++) {
      for (var yoff = -1; yoff <= 1; yoff++) {
        var i = this.i + xoff;
        var j = this.j + yoff;
        if (i > -1 && i < cols && j > -1 && j < rows) {
          grid[i][j].neighborFlag--
        }
      }
    }
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

var timerId;
var counter = 0;
function tick() {
  clearInterval(timerId)
  var timer = document.getElementById('timer');
  timer.innerText = '0';
  function timeIt(){
    counter++;
    timer.innerText = counter;
  }
  timerId = setInterval(timeIt, 1000);
}

function stop() {
  clearInterval(timerId)
}

function reset() {
  counter = 0;
}

function gameOver() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].revealed = true;
    }
  }
  var status = document.getElementById("status");
  status.innerText = "Game over :("
  stop();
}

function gameWon() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].revealed = !grid[i][j].bomb;
    }
  }
  var status = document.getElementById("status");
  status.innerText = "Won :)"
  stop();
}

var grid;
var cols;
var rows;
var w = 30;
var totalBombs;
var allBombs;
var firstClick = true;
var revealed = 0;
var gameStats = document.getElementsByTagName('h3')

function setup() {
  let status = document.getElementById("status");
  status.innerText = " "
  revealed = 0
  firstClick = true;
  reset();

  if (document.querySelector('input[name="field"]:checked').id == 'beginner') {
    cols = 9;
    rows = 9;
    totalBombs = 10;
    allBombs = 10;
  } else if (document.querySelector('input[name="field"]:checked').id == 'intermediate') {
    cols = 16;
    rows = 16;
    totalBombs = 40;
    allBombs = 40;
    gameStats['0'].style.width = 271 + 'px';
  } else if (document.querySelector('input[name="field"]:checked').id == 'expert') {
    cols = 30;
    rows = 16;
    totalBombs = 99;
    allBombs= 99;
  } else {
    cols = parseInt(document.getElementById('custom_cols').value);
    rows = parseInt(document.getElementById('custom_rows').value);
    totalBombs = parseInt(document.getElementById('custom_bombs').value);
    allBombs = parseInt(document.getElementById('custom_bombs').value);
  }
  gameStats['0'].style.width = (cols*30+1) + 'px';
  createCanvas((cols*w)+1, (rows*w)+1);
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

  var bombs = document.getElementById('bombs');
  bombs.innerText = totalBombs;

}



document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
}, false);



function doubleClicked(){
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j].contains(mouseX, mouseY) && grid[i][j].revealed && grid[i][j].neighborCount == grid[i][j].neighborFlag) {
        for (let x = -1; x<2; x++){
          for (let y = -1; y<2; y++){
            if( i + x > -1 && i + x < cols && j + y > -1 && j + y < rows) {
              grid[i+x][j+y].reveal();
              if (grid[i+x][j+y].bomb && !grid[i+x][j+y].flaged){
                gameOver();
              }
            }
          }
        }
      }
    }
  }
}

function mousePressed() {
  if (firstClick) {
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (grid[i][j].contains(mouseX, mouseY)) {
           tick();
        }
        if (grid[i][j].contains(mouseX, mouseY)&& mouseButton == LEFT && !grid[i][j].flaged) {
          do {
            setup();
          }
          while (grid[i][j].bomb);
          grid[i][j].reveal();
          firstClick = false;
          if (grid[i][j].revealed) {
            if (cols*rows-allBombs == revealed) {
              gameWon();
            }
          }
        }
      }
    }
  } else {
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (grid[i][j].contains(mouseX, mouseY)&& mouseButton == LEFT) {
          grid[i][j].reveal();
          if (grid[i][j].bomb) {
            gameOver();
          }
          if (grid[i][j].revealed) {
            if (cols*rows-allBombs == revealed) {
              gameWon();
            }
          }
        } else if (grid[i][j].contains(mouseX, mouseY)&& mouseButton == RIGHT) {
          grid[i][j].flag()
        }
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
