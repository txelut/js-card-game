const ask = require("readline-sync").question;
const { CardSet, Deck } = require("./cards");

class Player {
  constructor(nickname) {
    this.nickname = nickname;
    this.hand = new CardSet(); // Cards on hand, always hidden
    this.table = new CardSet(); // Cards on table, hidden or not
    this.status = "idle";
    this.points = 0; // Game points
  }
}

// status: idle, in-turn, done, dealer...
class Game {
  constructor(deckType, players = []) {
    this.players = players;
    this.stock = new Deck(deckType);
    this.wastepile = new CardSet();
    this.tableau = new CardSet();
  }
  redistribute(num, from, to = [], facedown = true) {
    // TODO: Check there are enough cards in the from CardSet to avoid having undefined cards
    to.forEach((player) => {
      let count = num;
      while (count > 0) {
        let card = from.values().next().value;
        card.facedown = facedown;
        player.table.add(card);
        from.delete(card);
        count--;
      }
    });
  }

  /*
      (each round 1 player owns the "dealer" role and is who redistribute the cards)
      Step1: The lader redistribute (anticlockwise) 1 facedown card to each player and 1 to itself
            >> The first player is the one at the dealer's right side
    */
  start() {
    // By default let's assign the 1st player in the list is the "dealer"
    this.players[0].status = "dealer";
    // Sort the players anticlockwise, being the dealer the last one
    this.players.reverse();
    // Shuffle the cards in the stock and redistribute 1 card to each player
    this.stock.shuffle();
    this.redistribute(1, this.stock, this.players);
    // Assign the player in-turn before the next step
    this.players[0].status = "in-turn";
  }
  /*
      Step2: The player in turn checks the card and asks for another card or sticks with its card(s)
          Opt1 >> Another card is requested and the player choose to keep its current card faced down on the table
          Opt2 >> Another card is requested and the player choose to face up its current card on the table
          Opt3 >> The player decides to stick with its game
      
      Step3: 
          Scenario1 >> Total points exceed 7.5
          Scenario2 >> Total points don't reach 7.5 (then repeat from Step2)
          Scenario3 >> Total points are 7.5, the player wins and sticks 
    */
  askCards(player) {
    // RULE >> There is only 1 card faced down for each player
    // Unhide the 1st redestributed card when the player is the "dealer"
    if (player.status == "dealer") {
      [...player.table][0].facedown = false;
    }
    while (player.status != "done" && player.table.points < 7.5) {
      this.printCards(player);
      let options = Game.askCardsMsg(player);
      let response = ask(options);
      // TODO: Implement options check to verify correct input and allow exiting the Game at any time
      switch (response) {
        case "1":
          // The received card is faced up
          this.redistribute(1, this.stock, [player], false);
          break;
        case "2":
          if (player.status == "dealer") {
            console.log("Option >" + response + "< not available.");
            break;
          }
          // Search the current "facedown" card and update it to false
          [...player.table].some((card) => {
            if (card.facedown == true) {
              card.facedown = false;
              return true; // stop the iteration
            }
          });
          // Then, the received card is redistributed faced down
          this.redistribute(1, this.stock, [player], true);
          break;
        case "3":
          player.status = "done";
          break;
        default:
          console.log("Option >" + response + "< not available.");
          break;
      }
    }
    player.status = "done";
    this.printCards(player);
    Game.nextUser(this.players);
  }

  // Step4: The next player in turn is the one on its right (repeat from Step2 "askCards")
  // Step5: After all players are done is the dealers turn. All its cards are always faced up.
  //       1.- Uncover the first card recieved
  //       2.- Ask for more cards or stick (depending if it's already 7.5 or could win the non-exceeded players)
  play() {
    this.players.forEach((player) => this.askCards(player));
    //     3.- The dealer always wins if its points are higher or equals respect to the other players
    //     4.- The player who wins will be the dealer for the next round
    //     5.- Sum all points to the winner
    //
    // TODO: Some implemenation guideline is ready dor debugging
    // Game.nextRound(this);
  }

  static nextRound(game) {
    // TODO:
    //   - Update to manage tie situations
    //   - Calculate and add the game points to the winner
    //   - Clear all user cards, stock, tableau and wastepile
    //   - Create a fresh new deck
    let winner = game.players.reduce(function (pre, cur) {
      return pre.table.points > cur.table.points ? pre : cur;
    }, 0);
    // TODO: Dummy data, ready for development...
    console.log("The winner is " + winner.nickname + "!");
    game.players.forEach((player) => {
      player.hand.clear();
      player.table.clear();
      player.status = "idle";
    });
    winner.status = "dealer";
    winner.points = winner.table.points;
    game.stock.clear();
    game.wastepile.clear();
    game.tableau.clear();
    game.stock = new Deck(deckType);
    // TODO: Sort the players anticlockwise, being the dealer the last one
    game.players.delete(winner);
    game.players.reverse();
    game.players.add(winner);
    // Shuffle the cards in the stock and redistribute 1 card to each player
    game.stock.shuffle();
    game.redistribute(1, game.stock, game.players);
    // Assign the player in-turn before the next step
    game.players[0].status = "in-turn";
  }

  static nextUser(players) {
    // If found, update the first "idle" user to "in-turn"
    players.some((player) => {
      if (player.status == "idle") {
        player.status = "in-turn";
        return true; // stop the iteration
      }
    });
    // Otherwise the next player is the last one, the "dealer"
    // if (!found) [...players][players.size] = "in-turn";
  }

  static askCardsMsg(player) {
    let message = "'1' >> request card \n";
    if (player.status != "dealer") {
      message = message + "'2' >> face up and request card \n";
    }
    message = message + "'3' >> sticks with your game \n";
    return message;
  }

  // TODO: Clear screen before printing, now keeping it for logging
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

module.exports = { Player, Game };
