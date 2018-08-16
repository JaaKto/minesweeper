document.addEventListener('DOMContentLoaded', () => {

const scoresList = 'http://todo-lidia.fatco.de/todo/';

let beginnerList = [];
let intermediateList = [];
let expertList = [];
const scores = [beginnerList, intermediateList, expertList];

const beginner = document.getElementById("Beginner");
const intermediate = document.getElementById("Intermediate");
const expert = document.getElementById("Expert");
const lvl = [beginner, intermediate, expert];

fetch(scoresList)
  .then(resp => resp.json())
  .then(result => result.forEach(getScores))
  .then(sortScores)
  .catch(err => console.log(err))

// create list elements
const getScores = (score) => {
  let item = document.createElement('li');
  item.innerHTML = `<strong><u>${score.score}</u> - ${score.item}</strong>`;
  item.setAttribute('data-score', score.score);
  item.setAttribute('data-diff', score.diff);
  if (score.diff === 'beginner') {
    beginnerList.push(item);
  } else if (score.diff === 'intermediate') {
    intermediateList.push(item);
  } else if (score.diff === 'expert'){
    expertList.push(item);
  }
};

function sortScores() {
  for (let i=0; i<scores.length;i++){
    scores[i] =  Array.prototype.slice.call( scores[i], 0 );
    scores[i].sort((a, b) =>a.getAttribute('data-score')- b.getAttribute('data-score'));

    scores[i] = scores[i].splice(0, 10);
    scores[i].forEach(item => lvl[i].appendChild(item));
  }
};

})
