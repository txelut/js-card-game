// ****************************************************************
// * Game base model to be used for a new card game implementation
// ****************************************************************

const { CardSet, Deck } = require("./cards");

const STATUS = {
  idle: "idle",
  inturn: "in-turn",
  done: "done",
  dealer: "dealer",
};

class Player {
  constructor(nickname) {
    this.nickname = nickname;
    this.hand = new CardSet(); // Cards on hand, always hidden
    this.table = new CardSet(); // Cards on table, hidden or not
    this.status = STATUS.idle;
    this.points = 0; // Game points
  }
}

class Game {
  constructor(deckType, players = []) {
    this.players = players;
    this.stock = new Deck(deckType);
    this.wastepile = new CardSet(); // Discarded cards
    this.tableau = new CardSet(); // Cards in the middle, not assigned to any player
  }
  get hands() {
    return this.players.map((player) => player.hand);
  }
  get tables() {
    return this.players.map((player) => player.table);
  }
  //TODO: Validate points results
  get points() {
    return this.players.map((player) => {
      player.nickname, player.points;
    });
  }

  // From 1 CardSet to 1 CardSet or array of CardSets (AKA players "hands" or "tables")
  redistribute(num, from, to, facedown = true) {
    if (!Array.isArray(to)) to = [to];
    to.forEach((cardset) => {
      let count = num;
      while (count > 0 && from.size > 0) {
        let card = from.values().next().value;
        card.facedown = facedown;
        cardset.add(card);
        from.delete(card);
        count--;
      }
      if (count > 0 && from.size == 0) {
        // TODO: Consider adding (or asking to add) the cards from "wastepile" before throwing the error
        throw new Error(
          "The game stock is empty but " +
            count +
            " cards remain to be redistributed."
        );
      }
    });
  }

  // TODO: Clear screen before printing, now keeping it for debugging
  printPublic() {
    let message = this.players.flatMap(
      (player) => player.nickname + " >> " + player.table.printPublic()
    );
    console.log(message);
  }
  printCards(player) {
    this.printPublic();
    console.log(
      player.nickname + " (" + player.status + ") \n" + player.table.printAll()
    );
  }
}

module.exports = { Player, Game, STATUS };
