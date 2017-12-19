describe('deckService', function(){

	beforeEach(module('war-card-game'));
	
	var deckService;
	
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
	
	var deckLength = suits.length * faceValues.length;
	
	var minPlayers = 2;
	var maxPlayers = 6;
	
	beforeEach(inject(function(_deckService_){
		deckService = _deckService_;
	}));
	
	describe('Card', function(){
		
		it('should initialize its properties based on the creation parameters', function(){
			for (var s = 0; s < suits.length; s++) {
				for (var v = 0; v < faceValues.length; v++) {
					var card = new deckService.Card(suits[s], faceValues[v]);
					expect(card.suit).toEqual(suits[s]);
					expect(card.faceValue).toEqual(faceValues[v]);
					expect(card.template).toEqual('card-' + faceValues[v]);
					expect(card.weight).toEqual(v + 2);
					expect(card.description).toEqual(faceValues[v] + ' of ' + suits[s].name + 's');
				}
			}
		});
		
		it('should return a blank card when passed no parameters', function(){
			var card = new deckService.Card();
			expect(card.suit).toEqual({ name: 'blank' });
			expect(card.faceValue).toEqual('blank');
			expect(card.template).toEqual('card-blank');
			expect(card.weight).toEqual(0);
			expect(card.description).toEqual('blank');
		});
		
	});

	describe('Deck', function(){
		
		describe('_cards', function() {
			
			it('should have one of each card', function(){
				var deck = new deckService.Deck();
				expect(deck._cards.length).toEqual(deckLength);
				
				var deckCards = deck._cards.map(function(card){
					return card.description;
				});
				for (var s = 0; s < suits.length; s++) {
					for (var v = 0; v < faceValues.length; v++) {
						var card = new deckService.Card(suits[s], faceValues[v]);
						expect(deckCards.indexOf(card.description)).not.toEqual(-1);
					}
				}
			});
			
		});
		
		describe('getCards', function() {
			
			it('should return all the cards', function(){
				var deck = new deckService.Deck();
				expect(deck.getCards()).toEqual(deck._cards);
			});
			
		});
		
		describe('shuffle', function() {
			
			it('should maintain all the cards, but the order should no longer be the same', function(){
				var deck = new deckService.Deck();
				
				var unshuffledDeckCards = deck._cards.map(function(card){
					return card.description;
				});
				
				deck.shuffle();
				
				var shuffledDeckCards = deck._cards.map(function(card){
					return card.description;
				});
				
				expect(shuffledDeckCards.length).toEqual(unshuffledDeckCards.length);
				expect(shuffledDeckCards).not.toEqual(unshuffledDeckCards);
				
				for (var s = 0; s < shuffledDeckCards.length; s++) {
					expect(unshuffledDeckCards.indexOf(shuffledDeckCards[s])).not.toEqual(-1);
				}
			});
			
		});
		
		describe('dealHands', function() {
			
			it('should create a new hand for each player', function(){
				var deck = new deckService.Deck();
				
				for (var x = minPlayers; x <= maxPlayers; x++) {
					var hands = deck.dealHands(x);
					expect(hands.length).toEqual(x);
				}
			});
			
			it('should distribute the cards to the hands in order', function(){
				
				// unshuffled
				var deck = new deckService.Deck();
				var deckCards = deck.getCards();
				
				for (var x = minPlayers; x <= maxPlayers; x++) {
					var hands = deck.dealHands(x);
					for (var d = 0; d < 10; d++) {
						var cardIndex = Math.floor(d / hands.length);
						var hand = hands[d % x];
						expect(hand._cards[cardIndex].description).toEqual(deckCards[d].description);
					}
				}
				
				// shuffled
				deck.shuffle();
				deckCards = deck.getCards();
				
				for (var x = minPlayers; x <= maxPlayers; x++) {
					var hands = deck.dealHands(x);
					for (var d = 0; d < 10; d++) {
						var cardIndex = Math.floor(d / hands.length);
						var hand = hands[d % x];
						expect(hand._cards[cardIndex].description).toEqual(deckCards[d].description);
					}
				}
				
			});
			
		});
		
	});

	describe('Hand', function(){
		
		var deck, cards, twoCards, blankCard;
		
		beforeEach(function(){
			deck = new deckService.Deck();
			cards = deck.getCards();
			twoCards = [cards[0], cards[1]];
			blankCard = new deckService.Card();
		}); 
		
		it('should initialize with empty card arrays', function(){
			var hand = new deckService.Hand();
			expect(hand._cards).toEqual([]);
			expect(hand._cardsBeingPlayed).toEqual([]);
		});
		
		describe('acceptCard', function() {
			
			it('should add given cards to _cards', function(){
				var hand = new deckService.Hand();
				hand.acceptCard(cards[0]);
				
				expect(hand._cards.length).toEqual(1);
				expect(hand._cards[0]).toEqual(cards[0]);
				
				hand.acceptCard(cards[1]);
				
				expect(hand._cards.length).toEqual(2);
				expect(hand._cards[1]).toEqual(cards[1]);
			});
		});
		
		describe('acceptCards', function() {
			
			it('should add the given cards to _cards', function(){
				var hand = new deckService.Hand();
				hand.acceptCards(cards);
				
				expect(hand._cards.length).toEqual(cards.length);
				expect(hand._cards[0]).toEqual(cards[0]);
				expect(hand._cards[hand._cards.length - 1]).toEqual(cards[cards.length - 1]);
			});
		});
		
		describe('getCards', function() {
			
			it('should return _cards', function(){
				var hand = new deckService.Hand();
				
				hand.acceptCards(twoCards);
				
				expect(hand.getCards()).toEqual(hand._cards);
				expect(hand.getCards()).toEqual(twoCards);
			});
		});
		
		describe('playNextCard', function() {
			
			it('add the next card from the card collection to the in-play collection', function(){
				var hand = new deckService.Hand();
				
				hand.acceptCards(twoCards);
				
				hand.playNextCard();
				expect(hand._cardsBeingPlayed.length).toEqual(1);
				expect(hand._cardsBeingPlayed[0]).toEqual(twoCards[0]);
				
				hand.playNextCard();
				expect(hand._cardsBeingPlayed.length).toEqual(2);
				expect(hand._cardsBeingPlayed[0]).toEqual(twoCards[0]);
				expect(hand._cardsBeingPlayed[1]).toEqual(twoCards[1]);
				
			});
			
			it('should add a blank card if the card collection has no remaining cards', function(){
				var hand = new deckService.Hand();
				
				hand.acceptCards(twoCards);
				hand.playNextCard();
				hand.playNextCard();
				hand.playNextCard();
				hand.playNextCard();
				
				expect(hand._cardsBeingPlayed.length).toEqual(4);
				expect(hand._cardsBeingPlayed[0]).toEqual(twoCards[0]);
				expect(hand._cardsBeingPlayed[1]).toEqual(twoCards[1]);
				expect(hand._cardsBeingPlayed[2]).toEqual(blankCard);
				expect(hand._cardsBeingPlayed[3]).toEqual(blankCard);
				
			});
		});
		
		describe('playBlankCard', function() {
			
			it('should add a blank card to the collection of in-play cards', function(){
				var hand = new deckService.Hand();
				
				hand.playBlankCard();
				
				expect(hand._cardsBeingPlayed.length).toEqual(1);
				expect(hand._cardsBeingPlayed[0]).toEqual(blankCard);
				
			});
		});
		
		describe('getCardsBeingPlayed', function() {
			
			it('should return the collection of in-play cards', function(){
				var hand = new deckService.Hand();
				
				hand.acceptCards(twoCards);
				hand.playNextCard();
				hand.playNextCard();
				
				expect(hand.getCardsBeingPlayed()).toEqual(twoCards);
			});
		});
		
		describe('getLastCardPlayed', function() {
			
			it('should return the last item in the collection of in-play cards', function(){
				var hand = new deckService.Hand();
				
				hand.acceptCards(twoCards);
				hand.playNextCard();
				hand.playNextCard();
				
				expect(hand.getLastCardPlayed()).toEqual(twoCards[1]);
			});
		});
		
		describe('forfeitCards', function() {
			
			var hand;
			
			beforeEach(function(){
				hand = new deckService.Hand();
				hand.acceptCards(twoCards);
				hand.playNextCard();
			});
			
			it('should empty the collection of cards in-play', function(){
				hand.forfeitCards(1);
				
				expect(hand._cardsBeingPlayed).toEqual([]);
			});
			
			it('return the given number of cards from the cards collection', function(){
				var forfeitedCards = hand.forfeitCards(1);
				
				expect(forfeitedCards.length).toEqual(1);
				expect(forfeitedCards[0]).toEqual(twoCards[0]);
				
				expect(hand._cards.length).toEqual(1);
				expect(hand._cards[0]).toEqual(twoCards[1]);
			});
		});
		
		describe('skipHand', function() {
			
			var hand;
			
			beforeEach(function(){
				hand = new deckService.Hand();
				hand.acceptCards(twoCards);
				hand.playNextCard();
			});
			
			it('should empty the collection of cards in-play', function(){
				hand.skipHand();
				
				expect(hand._cardsBeingPlayed).toEqual([]);
			});
			
			it('should move the first card to the last position', function(){
				hand.skipHand();
				
				expect(hand._cards.length).toEqual(2);
				expect(hand._cards[0]).toEqual(twoCards[1]);
				expect(hand._cards[1]).toEqual(twoCards[0]);
			});
		});
		
	});

});
