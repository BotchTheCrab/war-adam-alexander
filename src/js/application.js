(function(){
	'use strict';
	
	//require('angular');
	
	angular.module('war-card-game', [])
		.controller('WarController', require('./war.controller'))
		.factory('deckService', require('./deck.service'));
	
})();