const sketch = (p5) => {

let listItem = [];
var grid;
var cols;
var rows;
var w = 30;
var totalBombs;
var allBombs;
var firstClick = true;
var revealed = 0;
var gameStats = document.getElementsByTagName('h3');

var timerId;
var counter = 0;

function tick() {
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

p5.setup = () => {
  let newGame = document.getElementById("newGame")
  newGame.addEventListener("click", p5.setup);

  let radio;
  function checkRadio() {
    let radio = document.getElementsByName('field')
    for (let i = 0; i < radio.length; i++){
      radio[i].addEventListener('click', p5.setup);
      radio[i].addEventListener('click', () => stop());
    }
  }
  checkRadio()

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
    // p5.setup()
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
    if (cols > 30) {
      cols = 30;
      document.getElementById('custom_cols').value = 30;
    }
    rows = parseInt(document.getElementById('custom_rows').value);
    if (rows > 30) {
      rows = 30;
      document.getElementById('custom_rows').value = 30;
    }
    totalBombs = parseInt(document.getElementById('custom_bombs').value);
    allBombs = parseInt(document.getElementById('custom_bombs').value);
    if (totalBombs > cols*rows*0.5) {
      totalBombs = cols*rows*0.5;
      allBombs = cols*rows*0.5;
      document.getElementById('custom_bombs').value = cols*rows*0.5;
    }
  }
  gameStats['0'].style.width = (cols*30+1) + 'px';
  p5.createCanvas((cols*w)+1, (rows*w)+1);
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
    var index = p5.floor(p5.random(options.length));
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

const create = (score) => {
  let item = document.createElement('li');
  item.innerText = `${score.score} - ${score.item} - ${score.lvl}`;
  item.setAttribute('data-id', score.id);
  listItem.push(item);
};


const newScore = () => {
  name = prompt("What's your name", "lubię placki");
  let result = counter;
  let lvl = document.querySelector('input[name="field"]:checked').id
  if (name != null){
    console.log(`${result} - ${name} - ${lvl}`);
  }
  var blebleble = {item: name, score: result, diff:lvl}
  console.log(blebleble);
  fetch(`http://todo-lidia.fatco.de/todo/`, {
    method: 'POST',
    body: JSON.stringify({item: name, score: result, diff:lvl})
  })
    .then(todo => todo.json().then(result => create(result)))
    .catch(err => console.log(err))
    location.reload();
}

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
  p5.stroke(0);
  p5.noFill();
  p5.rect(this.x, this.y, this.w, this.w);
  if (this.revealed && !this.flaged) {
    if (this.bomb) {
      p5.fill(0);
      p5.ellipse(this.x + this.w * 0.5, this.y + this.w * 0.5, this.w * 0.5)
    }
    else {
      p5.fill(200);
      p5.rect(this.x, this.y, this.w, this.w);
      if (this.neighborCount > 0) {
        p5.textAlign(p5.CENTER);
        p5.fill(0);
        p5.text(this.neighborCount, this.x + this.w * 0.5, this.y + 20);
      }
    }
  } else if(this.flaged){
    p5.fill(900);
    p5.triangle(this.x + (0.2 * this.w), this.y + (0.2 * this.w), this.x + (0.8 * this.w), this.y + this.w * 0.5, this.x + (0.2 * this.w), this.y + (0.8 * this.w));
    p5.rect(this.x + (0.2 * this.w), this.y + (0.2 * this.w), this.w * 0.1, this.w * 0.8);
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
  if(!this.flaged && !this.revealed){
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
  newScore();
}



document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
}, false);

p5.doubleClicked = () => {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j].contains(p5.mouseX, p5.mouseY) && grid[i][j].revealed && grid[i][j].neighborCount == grid[i][j].neighborFlag) {
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
  if (cols*rows-allBombs == revealed) {
    gameWon();
  }
}

p5.mousePressed = () => {
  if (firstClick) {
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (grid[i][j].contains(p5.mouseX, p5.mouseY)) {
           tick();
        }
        if (grid[i][j].contains(p5.mouseX, p5.mouseY)&& p5.mouseButton == p5.LEFT && !grid[i][j].flaged) {
          do {
            p5.setup();
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
        if (grid[i][j].contains(p5.mouseX, p5.mouseY)&& p5.mouseButton === p5.LEFT && !grid[i][j].flaged) {
          grid[i][j].reveal();
          if (grid[i][j].bomb) {
            gameOver();
          }
          if (grid[i][j].revealed) {
            if (cols*rows-allBombs == revealed) {
              gameWon();

            }
          }
        } else if (grid[i][j].contains(p5.mouseX, p5.mouseY)&& p5.mouseButton === p5.RIGHT) {
          grid[i][j].flag()
        }
      }
    }
  }
}

p5.draw = () => {
  p5.background(90);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].show();
    }
  }
}

}


export default sketch;
