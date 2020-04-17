/*
function component() {
  const element = document.createElement("div");
  element.innerHTML = "Hello webpack!";
  return element;
}
document.body.appendChild(component());
*/

const { Player, Game7yM } = require("./game7yM");

// TODO: Ask for players nicknames
const players = [
  new Player("player1"),
  new Player("player2"),
  new Player("player3"),
];

let game7yM = new Game7yM(players);
game7yM.start();
game7yM.play();
