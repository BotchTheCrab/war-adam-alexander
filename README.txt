WAR
Adam Alexander
botch53@gmail.com
www.botchthecrab.com

Hi! This zip contains my response to a code test: reproduce the card game "War" using front-end web development technology.

Allow me to share some thoughts, notes and comments:

• Wow! The given rules don't cover a lot of common and uncommon edge cases. For instance, what if a player runs out of cards during a tie-breaking "war"? My answer is that if you run out of cards, you lose. Sure, but what if two out of four players tie for the initial win, then both run out of cards during their tie-breaking war? Do they both lose, even though they won the initial hand? My answer for that is a do-over: all players take their cards back into their hand, move their top card to the bottom of their stack, then start a new round. I figure it's as good an answer as any that a group of 8-year-olds would come up with.  I spent WAY too much time encountering and devising solutions for edge cases like these.

• Also, I opted to use the two-cards-down-during-a-war variant that was the way I played as a kid. (It makes the game go faster.)

• For my deck, I used http://donpark.github.io/scalable-css-playing-cards/, which provided a stylesheet allowed me to size the cards by font-weight. It also provided mustache templates (https://mustache.github.io/) which I used Gulp to convert to Angular templates and insert into my HTML during build.

• The display is responsive, but I wish it was more so. It would take a lot more design effort to figure out how to accomodate 6 players on a mobile view. That said, it's not like anyone would actually *play* this. It's not even really a game.

• Speaking of the deterministic nature of the game, I initially found that it was startlingly common for the final two players to wind up in a loop that never resolved: they would just trade the same cards back and forth endlessly. I don't remember having this problem when I was 8, and I realized why: in real life, we didn't always collect our winning cards after each hand in the exact same order. Even if we rigidly put all our winnings at the bottom of our hand, there was randomness in the order of our winnings themselves. As such, I put in code to randomize the order in which the winnings are collected (clockwise or counter-clockwise, effectively) which solved the problem.

• I had an idea that I thought would be a little sexy: displaying all the cards with a random slight rotation, just one or two degrees left or right, to simulate cards played by hand. Once in place, though, I found it remarkably distracting. I commented it out, but if you want to see it, just uncomment lines 161-182 of application.scss and re-compile the CSS. 

• My unit tests aren't truly complete -- I didn't exercise *all* of the code -- but I think I gave a good representation. 

• I'm sorry this took nearly two weeks to deliver. It was a busy two weeks of: full-time job; 2+ hours of daily commuting; house guests; two new rambunctious kittens; trick-or-treaters; and a mild cold. Still, I always prefer to deliver something done right than sloppy.


- Adam, 11/6/2016


