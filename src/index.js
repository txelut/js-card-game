/*
function component() {
  const element = document.createElement("div");
  element.innerHTML = "Hello webpack!";
  return element;
}
document.body.appendChild(component());
*/

// const { inspect } = require("util");
const ask = require("readline-sync").question;
const { deckType } = require("./cards");
const { Player, Game } = require("./game");

// TODO: Ask for players nicknames by console
let players = [
  new Player("player1"),
  new Player("player2"),
  new Player("player3"),
];

let deck = deckType.spanish40;
let game7yM = new Game(deck, players);
game7yM.start();
game7yM.play();
