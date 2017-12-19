describe('WarController', function(){

	beforeEach(module('war-card-game'));
	
	var ctrl, $filter, $timeout, deckService;
	
	beforeEach(inject(function($controller, _$filter_, _$timeout_, _deckService_){
		$filter = _$filter_;
		$timeout = _$timeout_;
		deckService = _deckService_;
		ctrl = $controller('WarController');
	}));
	
	var spade = { name: 'spade' },
		diamond = { name: 'diamond' },
		club = { name: 'club' },
		heart = { name: 'heart' };
	
	function returnHandCards(source, startIndex, endIndex){
		var destination = [];
		source.forEach(function(card, index) {
			if (index >= startIndex && index <= endIndex) {
				destination.push(card);
			}
		});
		return destination;
	}
	
	var handCardTallies = [0, 0];
	
	
	describe('activated Controller', function(){
		
		it('should have default values for all public parameter', function(){
			
			expect(ctrl.playerCountOptions).toEqual([2, 3, 4, 5, 6]);
			expect(ctrl.playerCount).toEqual(0);
			
			expect(ctrl.hands).toEqual([]);
			expect(ctrl.regiments).toEqual([]);
			
			expect(ctrl.winningHandIndex).toEqual(-1);
			
			expect(ctrl.autoplayEnabled).toEqual(false);
			expect(ctrl.autoplayRateMs).toEqual(750);
		});
		
	});

	describe('initWar', function(){
		
		it('should update the player count', function(){
			var playerCountSelection = 6;
			ctrl.initWar(playerCountSelection);
			expect(ctrl.playerCount).toEqual(playerCountSelection);
		});
		
		it('hands should be the appropriate length with the appropriate amount of cards based on the player count', function(){
			ctrl.initWar(2);
			expect(ctrl.hands.length).toEqual(2);
			expect(ctrl.hands[0].getCards().length).toEqual(26);
			expect(ctrl.hands[1].getCards().length).toEqual(26);
			
			ctrl.initWar(3);
			expect(ctrl.hands.length).toEqual(3);
			expect(ctrl.hands[0].getCards().length).toEqual(18);
			expect(ctrl.hands[1].getCards().length).toEqual(17);
			expect(ctrl.hands[2].getCards().length).toEqual(17);
			
			ctrl.initWar(4);
			expect(ctrl.hands.length).toEqual(4);
			expect(ctrl.hands[0].getCards().length).toEqual(13);
			expect(ctrl.hands[1].getCards().length).toEqual(13);
			expect(ctrl.hands[2].getCards().length).toEqual(13);
			expect(ctrl.hands[3].getCards().length).toEqual(13);
			
			ctrl.initWar(5);
			expect(ctrl.hands.length).toEqual(5);
			expect(ctrl.hands[0].getCards().length).toEqual(11);
			expect(ctrl.hands[1].getCards().length).toEqual(11);
			expect(ctrl.hands[2].getCards().length).toEqual(10);
			expect(ctrl.hands[3].getCards().length).toEqual(10);
			expect(ctrl.hands[4].getCards().length).toEqual(10);
			
			ctrl.initWar(6);
			expect(ctrl.hands.length).toEqual(6);
			expect(ctrl.hands[0].getCards().length).toEqual(9);
			expect(ctrl.hands[1].getCards().length).toEqual(9);
			expect(ctrl.hands[2].getCards().length).toEqual(9);
			expect(ctrl.hands[3].getCards().length).toEqual(9);
			expect(ctrl.hands[4].getCards().length).toEqual(8);
			expect(ctrl.hands[5].getCards().length).toEqual(8);
		});
		
		it('should create default (empty) regiments', function(){
			
			for (var x = 2; x <= 6; x++) {
				ctrl.initWar(x);
				expect(ctrl.regiments.length).toEqual(x);
				
				ctrl.regiments.forEach(function(regiment) {
					expect(regiment).toEqual({
						cards: [],
						winner: false
					});
				});
			}
			
		});
	});
	
	describe('battle', function(){
		
		beforeEach(function() {
			ctrl.initWar(2);
			
			ctrl.hands[0]._cards = [
				// battle #1 - winner
				new deckService.Card(spade, 'ace'),
				// battle #2
				new deckService.Card(spade, 'three'),
				new deckService.Card(spade, 'jack'),
				new deckService.Card(spade, 'queen'),
				new deckService.Card(spade, 'king'),
				// battle #3 - winner
				new deckService.Card(diamond, 'two'),
				new deckService.Card(diamond, 'three'),
				new deckService.Card(diamond, 'four'),
				new deckService.Card(diamond, 'five'),
				new deckService.Card(diamond, 'six'),
				new deckService.Card(diamond, 'seven'),
				new deckService.Card(diamond, 'eight'),
				new deckService.Card(diamond, 'nine'),
				new deckService.Card(diamond, 'ten'),
				new deckService.Card(diamond, 'queen')
			];
			// dump(ctrl.hands[0].getCards());
			
			ctrl.hands[1]._cards = [
				// battle #1
				new deckService.Card(club, 'two'),
				// battle #2 - winner
				new deckService.Card(club, 'three'),
				new deckService.Card(club, 'jack'),
				new deckService.Card(club, 'queen'),
				new deckService.Card(club, 'ace'),
				// battle #3
				new deckService.Card(heart, 'two'),
				new deckService.Card(heart, 'three'),
				new deckService.Card(heart, 'four'),
				new deckService.Card(heart, 'five'),
				new deckService.Card(heart, 'six'),
				new deckService.Card(heart, 'seven'),
				new deckService.Card(heart, 'eight'),
				new deckService.Card(heart, 'nine'),
				new deckService.Card(heart, 'ten'),
				new deckService.Card(heart, 'jack')
			];
			// dump(ctrl.hands[1].getCards());
		});
		
		describe('a clear winner in the first round with only one face-up card played each', function(){
			
			// NOTE: Hand #1 wins the first round
			
			var winningHandIndex, losingHandIndex, winningHand, losingHand, winningCards, losingCards;
			
			beforeEach(function() {
				winningHandIndex = 0;
				losingHandIndex = 1;
				
				winningHand = ctrl.hands[winningHandIndex];
				losingHand = ctrl.hands[losingHandIndex];
				
				winningCards = returnHandCards(winningHand._cards, 0, 0);
				losingCards = returnHandCards(losingHand._cards, 0, 0);
				
				// dump(winningCards[winningCards.length - 1].description);
				// dump(losingCards[losingCards.length - 1].description);
				
				handCardTallies[0] = ctrl.hands[0]._cards.length;
				handCardTallies[1] = ctrl.hands[1]._cards.length;
				
				ctrl.battle();
			});
			
			it('should populate the regiments with the played cards from each respective hand', function() {
				expect(ctrl.regiments[winningHandIndex].cards.length).toEqual(winningCards.length);
				expect(ctrl.regiments[winningHandIndex].cards).toEqual(winningCards);
				expect(ctrl.regiments[losingHandIndex].cards.length).toEqual(winningCards.length);
				expect(ctrl.regiments[losingHandIndex].cards).toEqual(losingCards);
			});
			
			it('should mark the appropriate regiment as the winner', function() {
				expect(ctrl.regiments[winningHandIndex].winner).toEqual(true);
				expect(ctrl.regiments[losingHandIndex].winner).toEqual(false);
			});
			
			it('should redistribute the played cards of the losing hand to the winning hand', function() {
				var winningHandCards = winningHand._cards;
				var losingHandCards = losingHand._cards;
				
				// dump('handCardTallies[0] (first round before update) = ' + handCardTallies[0])
				// dump('handCardTallies[1] (first round before update) = ' + handCardTallies[1])
				
				// remember: hand #1 won this round
				handCardTallies[0] += losingCards.length;
				handCardTallies[1] -= losingCards.length;
				
				// dump('handCardTallies[0] (first round after update) = ' + handCardTallies[0])
				// dump('handCardTallies[1] (first round after update) = ' + handCardTallies[1])
				
				expect(winningHandCards.length).toEqual(handCardTallies[0]);
				expect(losingHandCards.length).toEqual(handCardTallies[1]);
				
				winningCards.forEach(function(wonCard){
					expect(winningHand._cards.indexOf(wonCard)).not.toEqual(-1);
					expect(losingHand._cards.indexOf(wonCard)).toEqual(-1);
				});
				
				losingCards.forEach(function(wonCard){
					expect(winningHand._cards.indexOf(wonCard)).not.toEqual(-1);
					expect(losingHand._cards.indexOf(wonCard)).toEqual(-1);
				});
			});
			
		});
		
		describe('a clear winner in the second round with four cards played each', function(){
			
			// NOTE: Hand #1 won the first round
			// NOTE: Hand #2 wins the first round
			
			var winningHandIndex, losingHandIndex, winningHand, losingHand, winningCards, losingCards;
			
			beforeEach(function() {
				winningHandIndex = 1;
				losingHandIndex = 0;
				
				winningHand = ctrl.hands[winningHandIndex];
				losingHand = ctrl.hands[losingHandIndex];
				
				winningCards = returnHandCards(winningHand._cards, 1, 4);
				losingCards = returnHandCards(losingHand._cards, 1, 4);
				
				// dump(winningCards);
				// dump(losingCards);
				
				ctrl.battle();
				
				handCardTallies[0] = ctrl.hands[0]._cards.length;
				handCardTallies[1] = ctrl.hands[1]._cards.length;
				
				ctrl.battle();
			});
			
			it('should populate the regiments with the played cards from each respective hand', function() {
				expect(ctrl.regiments[winningHandIndex].cards.length).toEqual(winningCards.length);
				expect(ctrl.regiments[winningHandIndex].cards).toEqual(winningCards);
				expect(ctrl.regiments[losingHandIndex].cards.length).toEqual(winningCards.length);
				expect(ctrl.regiments[losingHandIndex].cards).toEqual(losingCards);
			});
			
			it('should mark the appropriate regiment as the winner', function() {
				expect(ctrl.regiments[winningHandIndex].winner).toEqual(true);
				expect(ctrl.regiments[losingHandIndex].winner).toEqual(false);
			});
			
			it('should redistribute the played cards of the losing hand to the winning hand', function() {
				var winningHandCards = winningHand._cards;
				var losingHandCards = losingHand._cards;
				
				// dump('handCardTallies[0] (second round before update) = ' + handCardTallies[0])
				// dump('handCardTallies[1] (second round before update) = ' + handCardTallies[1])
				
				// remember: hand #1 won this round
				handCardTallies[0] -= losingCards.length;
				handCardTallies[1] += losingCards.length;
				
				// dump('handCardTallies[0] (second round after update) = ' + handCardTallies[0])
				// dump('handCardTallies[1] (second round after update) = ' + handCardTallies[1])
				
				expect(winningHandCards.length).toEqual(handCardTallies[1]);
				expect(losingHandCards.length).toEqual(handCardTallies[0]);
				
				winningCards.forEach(function(wonCard){
					expect(winningHand._cards.indexOf(wonCard)).not.toEqual(-1);
					expect(losingHand._cards.indexOf(wonCard)).toEqual(-1);
				});
				
				losingCards.forEach(function(wonCard){
					expect(winningHand._cards.indexOf(wonCard)).not.toEqual(-1);
					expect(losingHand._cards.indexOf(wonCard)).toEqual(-1);
				});
			});
			
		});
		
		describe('a clear winner in the third round with 10 cards played each', function(){
			
			// NOTE: Hand #1 won the first round
			// NOTE: Hand #2 won the second round
			// NOTE: Hand #1 wins the third round
			
			var winningHandIndex, losingHandIndex, winningHand, losingHand, winningCards, losingCards;
			
			beforeEach(function() {
				winningHandIndex = 0;
				losingHandIndex = 1;
				
				winningHand = ctrl.hands[winningHandIndex];
				losingHand = ctrl.hands[losingHandIndex];
				
				winningCards = returnHandCards(winningHand._cards, 5, 14);
				losingCards = returnHandCards(losingHand._cards, 5, 14);
				
				// dump(winningCards);
				// dump(losingCards);
				
				ctrl.battle();
				ctrl.battle();
				
				handCardTallies[0] = ctrl.hands[0]._cards.length;
				handCardTallies[1] = ctrl.hands[1]._cards.length;
				
				ctrl.battle();
			});
			
			it('should populate the regiments with the played cards from each respective hand', function() {
				expect(ctrl.regiments[winningHandIndex].cards.length).toEqual(winningCards.length);
				expect(ctrl.regiments[winningHandIndex].cards).toEqual(winningCards);
				expect(ctrl.regiments[losingHandIndex].cards.length).toEqual(winningCards.length);
				expect(ctrl.regiments[losingHandIndex].cards).toEqual(losingCards);
			});
			
			it('should mark the appropriate regiment as the winner', function() {
				expect(ctrl.regiments[winningHandIndex].winner).toEqual(true);
				expect(ctrl.regiments[losingHandIndex].winner).toEqual(false);
			});
			
			it('should redistribute the played cards of the losing hand to the winning hand', function() {
				var winningHandCards = winningHand._cards;
				var losingHandCards = losingHand._cards;
				
				// dump('handCardTallies[0] (third round before update) = ' + handCardTallies[0])
				// dump('handCardTallies[1] (third round before update) = ' + handCardTallies[1])
				
				// remember: hand #1 won this round
				handCardTallies[0] += losingCards.length;
				handCardTallies[1] -= losingCards.length;
				
				// dump('handCardTallies[0] (third round after update) = ' + handCardTallies[0])
				// dump('handCardTallies[1] (third round after update) = ' + handCardTallies[1])
				
				expect(winningHandCards.length).toEqual(handCardTallies[0]);
				expect(losingHandCards.length).toEqual(handCardTallies[1]);
				
				winningCards.forEach(function(wonCard){
					expect(winningHand._cards.indexOf(wonCard)).not.toEqual(-1);
					expect(losingHand._cards.indexOf(wonCard)).toEqual(-1);
				});
				
				losingCards.forEach(function(wonCard){
					expect(winningHand._cards.indexOf(wonCard)).not.toEqual(-1);
					expect(losingHand._cards.indexOf(wonCard)).toEqual(-1);
				});
			});
			
		});
		
		describe('if a player runs out of cards in a battle, they lose the hand', function(){
			
			beforeEach(function(){
				ctrl.hands[0]._cards = returnHandCards(ctrl.hands[0]._cards, 1, 4);
				ctrl.hands[1]._cards = returnHandCards(ctrl.hands[1]._cards, 1, 3);
				
				ctrl.battle();
			});
			
			it('should mark the appropriate regiment as the winner', function() {
				expect(ctrl.regiments[0].winner).toEqual(true);
				expect(ctrl.regiments[1].winner).toEqual(false);
			});
		});
		
		describe('end game scenarios', function() {
			
			it('it should declare a winner if a player runs out of cards', function() {
				while(ctrl.hands[0]._cards.length && ctrl.hands[1]._cards.length) {
					ctrl.battle();
				}
				
				expect(ctrl.winningHandIndex).not.toEqual(-1);
			});
			
		});
		
	});
	
	describe('toggleAutoplay', function(){
		
		it('should toggle autoplayEnabled', function(){
			ctrl.autoplayEnabled = false;
			ctrl.toggleAutoplay();
			expect(ctrl.autoplayEnabled).toEqual(true);
			ctrl.toggleAutoplay();
			expect(ctrl.autoplayEnabled).toEqual(false);
		});
	});
	
	describe('playAgain', function(){
		
		it('should reset game settings', function(){
			ctrl.initWar(2);
			
			ctrl.battle();
			ctrl.battle();
			ctrl.battle();
			
			ctrl.winningHandIndex = 1;
			
			ctrl.playAgain();
			expect(ctrl.playerCount).toEqual(0);
			expect(ctrl.winningHandIndex).toEqual(-1);
			expect(ctrl.regiments).toEqual([]);
			
		});
	});
	
});
