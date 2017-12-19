(function(){
	'use strict';

	module.exports = deckService;

	deckService.$inject = [];

	function deckService(){
		var self = this;

		var suits = [
			{
				name: 'spade',
				symbol: '♠'
			},
			{
				name: 'club',
				symbol: '♣'
			},
			{
				name: 'heart',
				symbol: '♥'
			},
			{
				name: 'diamond',
				symbol: '♦'
			}
		];
		var faceValues = ['two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'jack', 'queen', 'king', 'ace'];

		self.Card = Card;
		self.Deck = Deck;
		self.Hand = Hand;

		//////

		/**
		 * @summary
		 *  Card constructor
		 * @note
		 *  Can output all 52 standard cards plus a blank card used as a weightless (valueless) placeholder
		 */
		function Card(suit, faceValue) {
			this.suit = suit || { name: 'blank' };
			this.faceValue = faceValue || 'blank';
			this.template = 'card-' + this.faceValue;

			var faceValueIndex = faceValues.indexOf(this.faceValue);
			this.weight = faceValueIndex !== -1 ? faceValueIndex + 2 : 0;

			this.description = suit && suit.name && faceValue ? (faceValue + ' of ' + suit.name + 's') : 'blank';
		}

		/**
		 * @summary
		 *  Deck constructor
		 */
		function Deck() {
			// populates itself with a full deck of cards
			this._cards = (function() {
				var cards = [];
				suits.forEach(function(suit){
					faceValues.forEach(function(faceValue, index){
						cards.push(new Card(suit, faceValue));
					});
				});
				return cards;
			})();
			// returns all the cards in the deck
			this.getCards = function() {
				return this._cards;
			};
			// shuffles the current cards in the deck into a new random order
			this.shuffle = function() {
				var currentDeck = angular.copy(this._cards);
				var shuffledDeck = [];

				while (currentDeck.length > 0) {
					var randomSourceDeckIndex = Math.floor(Math.random() * currentDeck.length);
					shuffledDeck.push(currentDeck.splice(randomSourceDeckIndex, 1)[0]);
				}

				this._cards = shuffledDeck;
			};
			// returns an array of Hand objects to which all the deck's cards are assigned in order
			this.dealHands = function(numPlayers) {
				// create a Hand for each player
				var hands = [];
				for (var h = 0; h < numPlayers; h++) {
					hands.push(new Hand());
				}
				// assign (deal) the cards in turn to the hands
				var deckCards = this._cards;
				deckCards.forEach(function(deckCard, deckIndex){
					var playerIndex = deckIndex % numPlayers;
					hands[playerIndex].acceptCard(deckCard);
				});
				return hands;
			};
		}

		/**
		 * @summary
		 *  Hand constructor
		 * @note
		 *  Hands are the cards each player holds; regiments (played cards) are derived from hands
		 */
		function Hand() {
			// collection of cards currently in the Hand
			this._cards = [];
			// card - a Card object
			this.acceptCard = function(card) {
				this._cards.push(card);
			};
			// cards - an array of Card objects
			this.acceptCards = function(cards) {
				this._cards = this._cards.concat(cards);
			};
			// returns the current collection of cards
			this.getCards = function() {
				return this._cards;
			};

			// current collection of cards "in play" in the current battle
			this._cardsBeingPlayed = [],
			// adds the next card from the Hand to the collection of cards "in play"
			this.playNextCard = function() {
				if (this._cards.length > this._cardsBeingPlayed.length) {
					this._cardsBeingPlayed.push(this._cards[this._cardsBeingPlayed.length]);
				} else {
					this.playBlankCard();
				}
			};
			// add a blank card to the collection of cards "in play"
			this.playBlankCard = function() {
				this._cardsBeingPlayed.push(new Card());
			};
			// returns the collection of cards "in play"
			this.getCardsBeingPlayed = function() {
				return this._cardsBeingPlayed;
			};
			// returns the last item in the collection of cards "in play"
			this.getLastCardPlayed = function() {
				return this._cardsBeingPlayed[this._cardsBeingPlayed.length - 1];
			};
			// empty the the collection of "in-play" cards
			// remove the given number of items from the cards collection and return them
			this.forfeitCards = function(numCards) {
				this._cardsBeingPlayed = [];
				return this._cards.splice(0, numCards);
			};

			// empty the "in-play" cards collection
			// move the first cards of the cards collection to the end
			this.skipHand = function() {
				this._cardsBeingPlayed = [];
				if (this._cards.length > 1) {
					var firstCard = this._cards.shift();
					this._cards.push(firstCard);
				}
			};
		}


		return self;
	}

})();
