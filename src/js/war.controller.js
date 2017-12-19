(function(){
	'use strict';
	
	module.exports = WarController;
	
	WarController.$inject = ['deckService', '$filter', '$timeout'];
	
	function WarController(deckService, $filter, $timeout){
		var vm = this;
		
		var minPlayers = 2;
		var maxPlayers = 6;
		vm.playerCountOptions = [];
		vm.playerCount = 0;
		
		var deck;
		vm.hands = [];
		vm.regiments = [];
		
		vm.winningHandIndex = -1;
		
		var autoplayTimeout;
		vm.autoplayEnabled = false;
		vm.autoplayRateMs = 750;
		// hard-coding min/max-range values in HTML due to Angular bug:
		// https://github.com/driftyco/ionic/issues/1948
		// vm.autoplayMinMs = 250;
		// vm.autoplayMaxMs = 2000;
		// vm.autoplayStepMs = 250;
		
		vm.initWar = initWar;
		vm.battle = battle;
		vm.toggleAutoplay = toggleAutoplay;
		vm.playAgain = playAgain;
		
		activate();
		
		//////
		
		
		/**
		 * @summary
		 *  Initialize the controller, including creating and shuffling a new deck of cards
		 */	
		function activate() {
			deck = new deckService.Deck();
			deck.shuffle();
			
			// Build an array of possible player count values using the minPlayers and maxPlayers values.
			// I wish there was a really elegant way to do this, but there's really not.
			// http://stackoverflow.com/questions/16824853
			for (var q = minPlayers; q <= maxPlayers; q++) {
				vm.playerCountOptions.push(q);
			}
		}
		
		
		
		/*******************************/
		/** GAME INITIATION FUNCTIONS **/
		/*******************************/
		
		/**
		 * @summary
		 *  Start a new war with the given number of players
		 */	
		function initWar(playerCount) {
			vm.playerCount = playerCount;
			vm.hands = deck.dealHands(playerCount);
			updateRegiments();
		}
		
		/**
		 * @summary
		 *  Reset all values for a new game
		 */	
		function playAgain() {
			vm.playerCount = 0;
			vm.winningHandIndex = -1;
			vm.regiments = [];
			
			deck.shuffle();
		}
		
		/**
		 * @summary
		 *  Update regiments (cards in play) from Hands
		 */	
		function updateRegiments() {
			vm.regiments = vm.hands.map(function(hand) {
				return {
					cards: hand.getCardsBeingPlayed(),
					winner: false
				}
			});
			// console.log('updateRegiments ...');
			// consoleRegiments(vm.regiments);
		}
		
		
		
		/**********************/
		/** BATTLE FUNCTIONS **/
		/**********************/
		
		/**
		 * @summary
		 *  Battle! Play a hand with as many cards as needed
		 */	
		function battle() {
			// console.log('BATTLE!');
			
			// reset regiments to empty arrays
			updateRegiments();
			
			// send first card for each regiment
			for (var i = 0; i < vm.hands.length; i++) {
				vm.hands[i].playNextCard();
			}
			updateRegiments();
			
			var winningRegiments = determineWinningRegiments();
			// console.log('battle: winningRegiments (first cards) = ' + JSON.stringify(winningRegiments));
			
			// there are a surprising amount of edge cases in this stupid game.
			// in order to avoid a freeze in case of an unhandled edge case, 
			// let's make sure we avoid any endless loops.
			var loopCount = 0;
			
			// if we have a tie of 2 or more cards ...
			while(winningRegiments.length > 1 && loopCount < 100) {
				//console.log("winningRegiments = " + JSON.stringify(winningRegiments));
				
				// ... send two more cards for each of the tying regiments 
				var totalCardFaceUpWeight = 0;
				for (var j = 0; j < winningRegiments.length; j++) {
					// two cards face-down
					vm.hands[winningRegiments[j]].playNextCard();
					vm.hands[winningRegiments[j]].playNextCard();
					// one card face-up
					vm.hands[winningRegiments[j]].playNextCard();
					
					totalCardFaceUpWeight += vm.hands[winningRegiments[j]].getLastCardPlayed().weight;
				}
				updateRegiments();
				
				// console.log("totalCardFaceUpWeight = " + totalCardFaceUpWeight);
				
				// check for a failed battle
				if (totalCardFaceUpWeight === 0) {
					// So. We had one or more tying cards... and then all the tying players ran out of cards. 
					// Believe it or not, I've actually witnessed this. My decision for this edge case: skip this hand.
					$timeout(skipToNextBattle, 0);
					return;
				} else {
					// otherwise, let's check again for a new winner
					winningRegiments = determineWinningRegiments();
				}
				
				loopCount++;
			} 
			// we got stuck in a loop: skip this battle
			if (loopCount === 100) { 
				$timeout(skipToNextBattle, 0);
				return;
			}
			// console.log('battle: winningRegiments (tie-breaking cards) = ' + JSON.stringify(winningRegiments));
			
			// flag the winner 
			if (winningRegiments.length && vm.regiments[winningRegiments[0]]) {
				vm.regiments[winningRegiments[0]].winner = true;
				
				takePrisoners();
				
				checkForVictory();
			
				// if autoplay is enabled, queue the next battle
				if (vm.autoplayEnabled && vm.winningHandIndex == -1) {
					autoplayTimeout = $timeout(function() {
						// console.log('$timeout for battle');
						battle();
					}, vm.autoplayRateMs);
					
				}
				
			} else {
				// nobody wins -- everybody dies!
				vm.winningHandIndex = -99;
			}
		}
		
		/**
		 * @summary
		 *  Determine which of the current regiments (cards in play) is the winner
		 * @notes
		 *  Returns an array of indices of the hand or hands that have the highest last card value
		 */	
		function determineWinningRegiments() {
			// console.log('determineWinningRegiments: vm.regiments ...');
			// consoleRegiments(vm.regiments);
			
			var winningRegimentIndices = [];
			var winningRegimentWeight = 0;
			
			// since we only want to examine the largest current regiments, find the max regiment cards length
			var maxRegimentLength = 0;
			vm.regiments.forEach(function(regiment) {
				maxRegimentLength = Math.max(maxRegimentLength, regiment.cards.length);
			});
			
			// of the largest regiments, determine the winning weights and add their index to the winners' collection
			vm.regiments.forEach(function(regiment, index) {
				if (regiment.cards.length === maxRegimentLength) {
					var regimentWeight = regiment.cards[regiment.cards.length - 1].weight;
					if (regimentWeight > winningRegimentWeight) {
						// current front-runner
						winningRegimentIndices = [index];
						winningRegimentWeight = regimentWeight;
					} 
					else if (regimentWeight === winningRegimentWeight) {
						// tied with front-runner
						winningRegimentIndices.push(index);
					}
				}
			});
			
			// check if all the weights were 0
			if (winningRegimentWeight === 0) {
				// no one is left alive: there are no winners
				winningRegimentIndices = [];
			}
			
			// console.debug('determineWinningRegiments: winningRegimentWeight = ' + winningRegimentWeight);
			// console.debug('determineWinningRegiments: winningRegimentIndices = ' + winningRegimentIndices.join(', '));
			
			return winningRegimentIndices;
		}
		
		
		/**
		 * @summary
		 *  This game has a lot of edge cases.
		 *  Sometimes it's unclear how to proceed.
		 *  At those times, the best thing to do is
		 *  ignore the current battle and skip to the next one.
		 */	
		function skipToNextBattle() {
			console.log('skipToNextBattle');
			for (var d = 0; d < vm.hands.length; d++) {
				vm.hands[d].skipHand();
			}
			battle();
		}
		
		/**
		 * @summary
		 *  Return index of winning regiment
		 */	
		function getWinningRegimentIndex() {
			var winningRegimentIndex = -1;
			for (var y = 0; y < vm.regiments.length; y++) {
				if (vm.regiments[y].winner) {
					winningRegimentIndex = y;
					break;
				}
			}
			return winningRegimentIndex
		}
		
		/**
		 * @summary
		 *  After a decisive battle, move the losers' cards to the winner's hand
		 */	
		function takePrisoners() {
			var winningRegimentIndex = getWinningRegimentIndex();
			if (winningRegimentIndex > -1) {
				
				function captureRegiment(index) {
					var regimentCount = vm.regiments[index].cards.length;
					var prisoners = vm.hands[index].forfeitCards(regimentCount);
					vm.hands[winningRegimentIndex].acceptCards(prisoners);
				}
				
				// randomize the order in which prisoners are grabbed
				// if not randomized, endless loops will result
				if (Math.random() < 0.5) {
					// console.log('takePrisoners in reverse');
					for (var x = vm.regiments.length - 1; x > -1; x--) {
						captureRegiment(x);
					}
				}
				else {
					// console.log('takePrisoners in order');
					for (var x = 0; x < vm.regiments.length; x++) {
						captureRegiment(x);
					}
				}
			}
		}
		
		/**
		 * @summary
		 *  Check to see if we have an overall winner for this game
		 */	
		function checkForVictory() {
			
			var hasCards = [];
			vm.hands.forEach(function(hand, index) {
				if (hand.getCards().length > 0) {
					hasCards.push(index);
				}
			});
			
			if (hasCards.length === 1) {
				console.log('VICTORY!');
				
				if (vm.autoplayEnabled) { toggleAutoplay(); }
				
				vm.winningHandIndex = hasCards[0];
			}
		}
		
		
		/************************/
		/** AUTOPLAY FUNCTIONS **/
		/************************/
		
		/**
		 * @summary
		 *  If autoplay was off, turn it on and initiate a battle
		 *  If autoplay was on, turn it off and cancel the pending battle
		 */	
		function toggleAutoplay() {
			if (vm.autoplayEnabled) {
				vm.autoplayEnabled = false;
				cancelPendingAutoplay();
			} else {
				vm.autoplayEnabled = true;
				battle();
			}
		}
		
		/**
		 * @summary
		 *  Cancel the pending autoplay battle
		 */	
		function cancelPendingAutoplay() {
			$timeout.cancel(autoplayTimeout);
		}
		
		
		/***********************/
		/** UTILITY FUNCTIONS **/
		/***********************/
		
		/**
		 * @summary
		 *  Log an readable state of the current regiments
		 */	
		function consoleRegiments() {
			var o = {};
			
			vm.regiments.forEach(function(regiment, regimentIndex) {
				var player = "Player " + (regimentIndex + 1);
				o[player] = [];
				regiment.cards.forEach(function(card) {
					o[player].push(card.description);
				});
			});
			
			console.log(JSON.stringify(o, null, '\t'));
		}
		
	}
	
})();