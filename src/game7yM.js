// ****************************************************************
// * Main implementation of "7 y Media"
// ****************************************************************

/*

>>> Game and steps description used in the code below

  (each round 1 player owns the "dealer" role and is who redistribute the cards)
  Step1: The lader redistribute (anticlockwise) 1 facedown card to each player and 1 to itself
         >> The first player is the one at the dealer's right side

  Step2: The player in turn checks the card and asks for another card or sticks with its card(s)
         Opt1 >> Another card is requested and the player choose to keep its current card faced down on the table
         Opt2 >> Another card is requested and the player choose to face up its current card on the table
         Opt3 >> The player decides to stick with its game
    
  Step3: 
         Scenario1 >> Total points exceed 7.5
         Scenario2 >> Total points don't reach 7.5 (then repeat from Step2)
         Scenario3 >> Total points are 7.5, the player wins and sticks 

  Step4: The next player in turn is the one on its right (repeat from Step2 "askCards")
  Step5: After all players are done is the dealers turn. All its cards are always faced up.
         1.- Uncover the first card recieved
         2.- Ask for more cards or stick (depending if it's already 7.5 or could win the non-exceeded players)
         3.- The dealer always wins if its points are higher or equals respect to the other players
         4.- The player who wins will be the dealer for the next round
         5.- Sum all points to the winner
*/

const ask = require("readline-sync").question;
const { Deck } = require("./cards");
const { Player, Game } = require("./game");

const STATUS = Player.STATUS;

class Game7yM extends Game {
  constructor(players) {
    super(Deck.spanish40(), players);
  }
  // Step 1
  start() {
    // By default let's assign the 1st player in the list is the "dealer"
    this.players[0].status = STATUS.dealer;
    // Sort the players anticlockwise, being the dealer the last one
    this.players.reverse();
    // Shuffle the cards in the stock and redistribute 1 card to each player
    this.stock.shuffle();
    this.redistribute(1, this.stock, this.tables);
    // Assign the player in-turn before the next step
    this.players[0].status = STATUS.inturn;
  }

  // Step 2 & 3
  askCards(player) {
    // RULE >> There is only 1 card faced down for each player
    // Unhide the 1st redistributed card when the player is the "dealer"
    if (player.status == STATUS.dealer) {
      [...player.table][0].facedown = false;
    }
    while (player.status != STATUS.done && player.table.points < 7.5) {
      this.printCards(player);
      let options = Game7yM.askCardsMsg(player);
      let response = ask(options);
      // TODO: Implement options check to verify correct input and allow exiting the Game at any time
      switch (response) {
        case "1":
          this.redistribute(1, this.stock, player.table, false);
          break;
        case "2":
          if (player.status == STATUS.dealer) {
            console.log("Option >" + response + "< not available.");
            break;
          }
          player.table.unhideAll();
          this.redistribute(1, this.stock, player.table, true);
          break;
        case "3":
          player.status = STATUS.done;
          break;
        default:
          console.log("Option >" + response + "< not available.");
          break;
      }
    }
    player.status = STATUS.done;
    this.printCards(player);
    Game7yM.nextUser(this.players);
  }

  // Step 4 & 5
  play() {
    this.players.forEach((player) => this.askCards(player));
    this.nextRound();
  }

  // - Update to manage tie situations
  // - Calculate and add the game points to the winner
  // - Clear all user cards, stock, tableau and wastepile
  // - Create a fresh new deck
  nextRound() {
    // TODO: Some "dummy" implemenation is ready for debugging
    let winner = this.players[0];
    console.log("The winner is " + winner.nickname + "!");
    this.players.forEach((player) => {
      player.hand.clear();
      player.table.clear();
      player.status = STATUS.idle;
    });
    winner.status = STATUS.dealer;
    winner.points = winner.table.points;
    this.stock.clear();
    this.wastepile.clear();
    this.tableau.clear();
    this.stock = new Deck(Deck.spanish40());
    // TODO: Sort the players anticlockwise, being the dealer the last one
    this.players[winner.nickname] = winner;
    this.players.reverse();
    // Shuffle the cards in the stock and redistribute 1 card to each player
    this.stock.shuffle();
    this.redistribute(1, this.stock, this.tables);
    // Assign the player in-turn before the next step
    this.players[0].status = STATUS.inturn;
    this.play();
  }

  static nextUser(players) {
    // If found, update the first "idle" user to "in-turn"
    players.some((player) => {
      if (player.status == STATUS.idle) {
        player.status = STATUS.inturn;
        return true; // stop the iteration
      }
    });
    // Otherwise the next player is the last one, AKA the "dealer"
    // if (!found) [...players][players.size] = "in-turn";
  }

  static askCardsMsg(player) {
    let message = "'1' >> request card \n";
    if (player.status != STATUS.dealer) {
      message = message + "'2' >> face up and request card \n";
    }
    message = message + "'3' >> sticks with your game \n";
    return message;
  }
}

module.exports = { Player, Game7yM };
