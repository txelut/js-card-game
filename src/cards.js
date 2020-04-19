// *******************************************************
// * Cards classes definitions used in game.js base model
// *******************************************************

class Card {
  constructor(value, suit, points = 0) {
    this.value = value;
    this.suit = suit;
    this.facedown = true;
    this._id = value + "_" + suit;
    this._points = points;
  }
  get id() {
    return this._id;
  }
  set id(id) {
    throw new Error("Card ID is self-assigned and cannot be modified.");
  }
  get points() {
    return this._points;
  }
  set points(p) {
    this._points = p;
  }
}

class CardSet extends Set {
  constructor() {
    super();
  }
  get points() {
    return [...this].reduce(function (sum, cur) {
      return sum + cur.points;
    }, 0);
  }

  // Shuffles array in place using Fisher-Yates Algorithm
  static arrayShuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  shuffle() {
    let shuffledArray = CardSet.arrayShuffle([...this]);
    this.clear();
    shuffledArray.forEach((card) => {
      this.add(card);
    });
  }

  hideAll() {
    this.forEach((card) => {
      card.facedown = true;
    });
  }

  unhideAll() {
    this.forEach((card) => {
      card.facedown = false;
    });
  }

  // TODO:
  // unhide(id)
  /*
  [...player.table].some((card) => {
    if (card.facedown == true) {
      card.facedown = false;
      return true; // stop the iteration
    }
  });
  */

  // Print points and cards from unhidden cards in the set
  printPublic(show = false) {
    let message = [...this].flatMap((card) =>
      !card.facedown ? "[" + card.id + " " + card.points + "]" : "hidden"
    );
    let pubPoints = [...this].reduce(function (sum, cur) {
      if (!cur.facedown) return sum + cur.points;
      else return sum;
    }, 0);
    message = "Points " + pubPoints + " >> " + message;
    if (show) console.log(message);
    else return message;
  }

  // Print total points and cards in the set
  printAll(show = false) {
    let message = [...this].flatMap(
      (card) => card.id + " (" + card.points + ")"
    );
    message = "Points " + this.points + " >> " + message;
    if (show) console.log(message);
    else return String(message);
  }
}

class Deck extends CardSet {
  constructor(type) {
    super();
    type.suits.forEach((suit) => {
      type.values.forEach((value) => {
        this.add(new Card(value, suit, type.points(value)));
      });
    });
  }
  // Deck types
  static spanish40() {
    return {
      values: [1, 2, 3, 4, 5, 6, 7, "sota", "caballo", "rey"],
      suits: ["oros", "copas", "espadas", "bastos"],
      // Define points assignment conditions in "points" callback
      points: function (value) {
        if (Number(value)) return value;
        else return 0.5;
      },
    };
  }
}

module.exports = { CardSet, Deck };
