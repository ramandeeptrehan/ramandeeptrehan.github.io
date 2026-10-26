---
layout: post
title: "Catan, From First Principles"
date: 2026-09-15
---

<div class="tldr" markdown="1">

**TL;DR**

- Catan is a trading game played on an island of hexes. You build settlements on corners, collect resources when the dice roll your numbers, and race to 10 victory points.
- Two dice are not fair: 7 comes up six times as often as 2. Every number token on the board carries dots that tell you exactly how often it pays.
- A corner's value is the sum of those dots. The best corner on a typical board is worth about twice the average one, and in a simulation of 4,000+ games, the starting spots alone separated a 23-round game from an 83-round one.
- Ore and brick are scarce by design, cities double your income, and a 7 has about a 52% chance of showing up before your next turn.
- Expansions like Seafarers and Cities & Knights each change one piece of this model: the map, the economy, or the threat.

</div>

There's a moment in every game of Catan when someone at the table says "anyone have wood for sheep?" and nobody does. It's a joke at this point, but it's also the whole game in one sentence. Catan is about producing what you can, trading for what you can't, and hoping the dice cooperate. In this post we'll learn the game one step at a time, from the board to the last victory point, and then look underneath it: the probability that drives every roll, what makes a good spot, which strategies work, and what happens when you simulate thousands of games in code.

## Where Catan Came From

Catan was designed by Klaus Teuber, a dental technician from Germany who made board games in his spare time. He was fascinated by the Vikings who settled Iceland, and the game grew out of that idea: arrive on an empty island, claim land, and build a society out of whatever the land gives you. It was published in 1995 as *Die Siedler von Catan* ("The Settlers of Catan") and won the Spiel des Jahres, Germany's game of the year award, that same year [1].

At the time, most popular board games were either pure luck or long games about knocking other players out. Catan was different. Nobody gets eliminated, games take about an hour, and you're talking to the other players the entire time because trading is built into every turn. It became one of the games that brought modern "Euro-style" board games to the rest of the world. It has sold tens of millions of copies, was renamed simply *Catan* in 2015, and Teuber kept designing for it until he died in 2023 [1].

## Step 1: The Island

The board is an island made of 19 hexagonal tiles, surrounded by sea. Each tile is a kind of land, and each kind of land produces one resource:

- **Forest** produces lumber 🌲 (4 tiles)
- **Pasture** produces wool 🐑 (4 tiles)
- **Fields** produce grain 🌾 (4 tiles)
- **Hills** produce brick 🧱 (3 tiles)
- **Mountains** produce ore ⛰️ (3 tiles)
- **Desert** produces nothing (1 tile), and it's where the robber starts

Every tile except the desert gets a number token from 2 to 12. When the dice show that number, the tile produces. The tokens also have small dots on them, and those dots turn out to be the most important thing on the board. We'll come back to them in a moment.

You don't build on the tiles themselves. You build on the **corners** where tiles meet and on the **edges** between them. A settlement sits on a corner and collects from every tile touching that corner, usually three. A road sits on an edge. Around the coast there are also nine **harbors**, which give better trading rates to anyone who settles next to them.

<figure>
  <img src="/assets/posts/catan/anatomy.svg" alt="Three hexes (forest with a 6, hills with a 9, fields with a 4) meeting at one corner, with a settlement on that corner and a road on an edge.">
  <figcaption>Figure 1: Settlements go on corners, roads go on edges, and number tokens decide when a tile produces.</figcaption>
</figure>

## Step 2: What You Can Build

Everything in Catan costs resource cards, and you spend them on four things:

<figure>
  <img src="/assets/posts/catan/costs.svg" alt="Building costs. Road: lumber and brick. Settlement: lumber, brick, wool and grain. City: two grain and three ore. Development card: wool, grain and ore.">
  <figcaption>Figure 2: The four things you can buy, and what they cost.</figcaption>
</figure>

A **settlement** is worth 1 victory point and collects 1 card whenever a tile next to it produces. A **city** is an upgrade of a settlement you already have: it's worth 2 points and collects 2 cards instead of 1. **Roads** don't score by themselves, but you need them to reach new corners, since every new settlement has to connect to your road network. **Development cards** are a mystery box: most are knights, a few are one-time bonuses, and five of them are secretly worth a victory point.

There's one placement rule worth remembering, the **distance rule**: no settlement can be on a corner right next to another settlement, yours or anyone else's. There always has to be at least one empty corner between them. Each player also has a limited supply of pieces: 5 settlements, 4 cities and 15 roads.

## Step 3: Taking a Turn

On your turn you do three things, in order.

First, you **roll two dice**. Every tile showing that number produces, and *every player* with a settlement or city touching it collects cards, not just you. This is a big deal: you collect resources on everyone's turn, so a four-player game hands you cards four times per round.

Second, you **trade**. You can trade with other players, any ratio you can agree on, which is where the table talk comes in. You can also trade with the bank at 4 of one resource for 1 of anything, or better if you own a harbor: a generic harbor lets you trade 3:1, and a special harbor trades one specific resource at 2:1.

Third, you **build**: roads, settlements, cities, development cards, as many as you can afford. Then you pass the dice.

> Everyone collects on every roll, but you can only trade and build on your own turn.

## Step 4: The Robber and the 7

The number 7 has no token on the board. When someone rolls a 7, nothing produces. Instead, two things happen. Anyone holding more than 7 cards has to discard half of them, rounded down. Then the player who rolled moves the **robber** to any tile and steals one random card from a player with a settlement or city next to it.

The robber stays where it is until the next 7, and while it sits on a tile, that tile produces nothing for anyone. So the robber is both a tax on hoarding and a weapon. Most players use it on whoever is winning, which is one of the quiet ways Catan keeps the leader in check.

## Step 5: Development Cards

There are 25 development cards, and you buy them blind:

- **14 Knights.** Move the robber and steal a card, just like rolling a 7, but on your terms. You can play one before you roll.
- **5 Victory Points.** Worth 1 point each. You keep them hidden until you win.
- **2 Road Building.** Build two roads for free.
- **2 Year of Plenty.** Take any two resources from the bank.
- **2 Monopoly.** Name a resource, and every other player hands you all of theirs. It's the card that ends friendships.

You can play at most one development card per turn, and never on the turn you bought it.

## Step 6: Winning

The first player to reach **10 victory points** on their own turn wins. Points come from five places:

- Each settlement: 1 point
- Each city: 2 points
- Each victory point card: 1 point
- **Longest Road**: 2 points for the first player with an unbroken road of at least 5 segments. If someone builds a longer one, they take it.
- **Largest Army**: 2 points for the first player to play 3 knights. If someone plays more, they take it.

The last two are worth noticing, because they can move. A 2-point swing in a race to 10 is huge, and a lot of late-game drama is people fighting over them.

## Step 7: Setting Up

The game starts with each player placing two settlements, each with a road attached, in a **snake draft**. Player 1 places first, then player 2, 3 and 4. Then the order reverses: player 4 places their second settlement immediately, then 3, 2, and finally player 1. The second settlement pays out right away, one card from each tile next to it, so nobody starts empty-handed.

The snake draft is fair-ish: going first gets you the best spot on the board, going last gets you two spots in a row. As we'll see, these first two placements matter more than anything else you'll do all game.

That's the whole game [2]. Now let's look at why it plays the way it does.

## The Math: Two Dice Are Not Fair

Each die has 6 faces, so two dice have 6 × 6 = 36 equally likely outcomes. But the *sums* are not equally likely. There's only one way to roll a 2 (⚀⚀), while there are six ways to roll a 7: 1+6, 2+5, 3+4, 4+3, 5+2 and 6+1. In general:

> The number of ways to roll a sum *s* is 6 − |*s* − 7|, out of 36.

That gives the triangle in Figure 3. A 6 or an 8 comes up 5 times in 36 rolls, while a 2 or a 12 comes up once. The dots on each number token are exactly this count. A 6 has five dots, a 3 has two, a 12 has one. Catan prints the probability on the board, so you don't need to calculate it.

<figure>
  <img src="/assets/posts/catan/dice.svg" alt="Bar chart of the number of ways to roll each sum with two dice, from 1 for a 2, rising to 6 for a 7, and back down to 1 for a 12.">
  <figcaption>Figure 3: Ways to roll each sum with two dice. The 7, which triggers the robber, is the most likely roll.</figcaption>
</figure>

You can check this with a few lines of Python. Paste this into any Python 3 prompt:

```python
import random
from collections import Counter

rolls = Counter(random.randint(1, 6) + random.randint(1, 6) for _ in range(100_000))
for s in range(2, 13):
    print(f"{s:>2}  rolled {rolls[s] / 100_000:6.2%}   exact {(6 - abs(s - 7)) / 36:6.2%}")
```

Or try it right here. A handful of rolls look random, but roll a thousand times and every row settles onto its exact odds.

<div class="catan-widget" id="catan-dice"></div>

## The Math: What a Corner Is Worth

If the dots tell you how often a tile pays, then the value of a corner is just the sum of the dots on the tiles around it. We'll call these **pips**. A corner touching a 6, a 9 and a 4 has 5 + 4 + 3 = 12 pips, so a settlement there collects about **12 cards every 36 rolls**, or one card every three rolls.

That one number explains most of the opening. In the simulation later in this post, I generated 10,000 random boards. The best corner on a board averaged **12.5 pips**, while the median corner averaged only **6.4**. The best spot on the board is worth about twice a typical one, and you get to pick two spots for the whole game.

Click around the board below. Pick a corner to see what it collects, roll the dice to watch tiles produce, and ask it for the best five corners. Every new board follows the official setup rule that two red numbers (6 and 8) can't touch.

<div class="catan-widget" id="catan-board"></div>

Pips aren't everything, though. A corner with 13 pips of wool is worse than a corner with 11 pips spread across brick, lumber and grain, because you can't build anything with wool alone. Good spots balance *how much* you get with *what* you get.

## The Math: Some Resources Are Scarce on Purpose

Look again at the tile counts: four forests, pastures and fields, but only three hills and three mountains. On my 10,000 random boards, lumber, wool and grain each averaged **12.9 pips** of production across the whole board, while brick and ore averaged **9.7**. That's 25% less, and it's deliberate. Brick is what you need to expand early, and ore is what you need for cities later. Making them scarce means a corner on a good mountain or hills tile is worth more than its pips suggest, because those cards are harder to trade for.

## The Math: Luck Is Loud in the Short Run

Five pips sounds reliable, but it's still a 5-in-36 chance per roll. The chance that a 6 *doesn't* come up in 10 rolls is (31/36)¹⁰, about **22%**. Over 20 rolls it drops to about **5%**. So over a whole game the dice even out, but over the first few rounds, which are exactly when you need resources most, they can be cruel.

There's a simple way to soften this: spread your bets. A start on a 6, a 5 and a 9 has fewer pips than one on two 6s, but it pays on three different numbers, so you're much less likely to go several turns with nothing. Number diversity is the Catan version of not putting all your eggs in one basket.

## The Math: The 7 Tax

A 7 comes up 1 time in 6. In a four-player game, four dice rolls happen between your turns, so the chance that at least one of them is a 7 is 1 − (5/6)⁴, about **52%**. That means if you end your turn holding 8 or more cards, it's a coin flip whether you lose half of them before you get to spend them.

> If you're holding 8 cards at the end of your turn, you have about even odds of losing 4 of them.

This is why experienced players spend down, even on things they don't urgently need, and why they trade aggressively when they're close to the limit.

## The Math: The Price of a Point

Since the goal is 10 points, it helps to know what each point costs in cards:

- **A settlement** costs 4 cards, plus usually 2 roads (4 more) to reach a new corner. That's about 8 cards for 1 point. It also produces from then on, so it pays you back over time.
- **A city** costs 5 cards for 1 extra point, and it doubles the production of that corner. It needs no roads and no new space on the board.
- **A development card** costs 3 cards. On average 1 in 5 is a point, and more than half are knights, which count toward Largest Army. If you'd end up with Largest Army, each card is worth a bit more than half a point, so roughly 5 cards per point. If you wouldn't, it's closer to 15.

Settlements and cities also *compound*. A settlement on a 10-pip corner collects about 1.1 cards per round in a four-player game (10/36 per roll, four rolls a round), so it pays back its 4-card cost in under four rounds and keeps paying after that. Early in the game, anything that increases production beats anything that only scores points.

## The Math: Trading Rates

The bank trades at 4:1, which is expensive: you give up four cards to get one. A 3:1 harbor cuts that cost by a quarter. A 2:1 harbor is only as good as how much of that resource you produce. If you collect 10 pips of wheat, you make about 10 wheat every 36 rolls, which is 5 cards of anything else through a 2:1 wheat harbor. The harbor and the production go together.

## Strategy From First Principles

Put the math together and most good Catan strategy falls out on its own.

**Your opening is your economy.** Aim for high pips, a spread of numbers, and access to the scarce resources (brick and ore). The two starting settlements produce for the entire game, so a small edge there pays out over and over.

**Pick a direction.** There are two classic ways to play, and they come from what you produce:

- **Wood-Brick (expansion).** Lots of lumber and brick means cheap roads and settlements. You spread out, grab more corners, and often go for Longest Road.
- **Ore-Wheat (cities and cards).** Lots of grain and ore means cities and development cards. You stay compact, double your production, and chase Largest Army and hidden points.

**Spend before the 7 does.** With a 52% chance of a 7 between your turns, holding 8+ cards is a real risk. Building a road you don't strictly need is often better than losing four cards.

**Use the robber on the leader.** Blocking a 6 or 8 tile removes 5 pips from everyone on it. Put it where it hurts the player closest to winning, and preferably not on a tile you share.

**Trade, but watch who you're helping.** Every trade helps both sides. That's fine when you're helping someone in last place. It's a bad idea when it's the player one turn away from winning.

**Count the 2-point swings.** Longest Road and Largest Army move between players. Keep track of how close everyone is to taking them, including you.

## Simulating Catan

Rules of thumb are nice, but it's more fun to test them. I wrote a small simulator in Python that builds the real board (19 hexes, 54 corners and 72 edges), deals random legal boards, and plays thousands of games. You can [download the full script](/assets/posts/catan/catan_sim.py) and run it yourself. It needs nothing beyond Python 3:

```text
python3 catan_sim.py              # about 30 seconds, reproduces every number in this post
python3 catan_sim.py --games 500  # a quick run in a few seconds
```

Here are the key pieces, taken straight from the script (they aren't meant to run on their own; the full file is). The dice probabilities come from the formula above, and a corner's value is the sum of the pips around it:

```python
PIPS = {n: 6 - abs(n - 7) for n in range(2, 13)}  # ways to roll n with two dice

def spot_pips(board, v):
    terrain, number = board
    return sum(PIPS[number[h]] for h in TOUCHING[v] if number[h])
```

Each round, everyone rolls once and you collect on every roll, then you build according to a strategy:

```python
def take_turn(self, rolls_per_round=4):
    """One round: everyone rolls once (you collect on every roll), then you build."""
    for _ in range(rolls_per_round):
        roll = self.rng.randint(1, 6) + self.rng.randint(1, 6)
        if roll == 7:
            self.discard_on_seven()
        else:
            self.produce(roll)
    self.cards += self.new_cards
    self.new_cards = []
    self.play_card()
    while any(self.try_build(item) for item in self.priority):
        if self.points() >= 10:
            break
```

The simulator is a simplified game, and it's worth being clear about what it leaves out. Three opponents take their best corners during setup, so the good spots are contested, but after that they don't build, trade or move the robber. You can trade with the bank at 4:1 but not with other players. The numbers below are useful for *comparing* choices, not for predicting how long your Friday night game will take.

First, a sanity check. A million simulated rolls landed within a fraction of a percent of the exact odds: 7 came up 16.69% of the time against an exact 16.67%.

Next, strategies. I played 4,000 games with each of four approaches. The three named strategies pick their starting spots by pips, weighted toward the resources they care about, and build in different priority orders. "Random opening" picks its starting spots at random.

<figure>
  <img src="/assets/posts/catan/strategies.svg" alt="Bar chart of the share of games that reached 10 points within 30 rounds. Balanced 77 percent, median 24 rounds. Wood-Brick 61 percent, median 28 rounds. Ore-Wheat 45 percent, median 32 rounds. Random opening 8 percent, median 69 rounds.">
  <figcaption>Figure 4: How often each strategy reached 10 points within 30 rounds, with the median number of rounds.</figcaption>
</figure>

Two things stand out. The first is how much the opening matters: random starting spots finished within 30 rounds only 8% of the time, against 77% for a balanced strategy that simply picks the most productive corners. The second is more interesting. Ore-Wheat did *worst* of the three real strategies, which seems to contradict how many strong players play. But look at what the simulator can't do: trade with other players. A specialist produces lots of a few resources and depends on trading for the rest. Take away trading partners and specialization stops working, while a balanced player can build a bit of everything on their own. That's not a flaw in the experiment, it's a lesson about the game: **trading is what makes specializing possible.**

Finally, the opening on its own. I grouped games by the total pips on the two starting settlements:

<figure>
  <img src="/assets/posts/catan/openings.svg" alt="Bar chart of median rounds to 10 points by starting pips. 8 to 11 pips: 83 rounds. 12 to 15 pips: 49 rounds. 16 to 19 pips: 28 rounds. 20 to 23 pips: 23 rounds.">
  <figcaption>Figure 5: Median rounds to reach 10 points, grouped by the pips on your two starting settlements.</figcaption>
</figure>

Going from 8–11 starting pips to 20–23 cuts the median game from 83 rounds to 23. Below 8 pips, most games never reached 10 points within the 200-round limit at all. Production compounds: a strong start buys settlements and cities sooner, which produce more, which buy more. A weak start falls behind and stays behind.

## Expansions: Changing One Piece of the Model

Once you see Catan as a system with a board, an economy and a threat, the expansions make a lot of sense. Each one changes one of those pieces.

**5–6 Player Extension.** More players means more competition for space, so the board grows from 19 to 30 tiles. It also adds a **Special Building Phase**: after each player's turn, everyone else gets a chance to build. With six players there are more rolls between your turns, and therefore more chances of a 7, so this phase is what keeps you from losing half your hand while you wait.

**Seafarers (1997).** This one changes the map. The island breaks into several islands, and you can build **ships** (lumber + wool) to cross the water. New **gold fields** produce any resource you want, a **pirate** does to the sea what the robber does to land, and scenarios often give bonus points for settling new islands. The math of pips still applies, but now *reaching* a good corner can take many turns of shipbuilding [4].

**Cities & Knights (1998).** This one changes the economy and adds a real threat. The goal rises to 13 points. Cities on forests, pastures and mountains produce new **commodities** (paper, cloth and coin), which you spend on city improvements that unlock powerful **progress cards** and can earn you a **metropolis** worth extra points. Meanwhile, a barbarian ship sails toward the island with every roll of a special event die. When it lands, the total strength of everyone's active **knights** has to match the number of cities on the board, or the players who defended least lose a city. It turns Catan from a pure race into a race that also requires cooperation, and it makes cities, which were already the strongest thing to build, even more central [3].

**Traders & Barbarians (2007).** This is a box of smaller variants that each tweak one rule: fishermen who give the coast something to produce, rivers that reward building along them, caravans, a two-player version, and a deck of **event cards** that can replace the dice. That last one is a nice connection to the math in this post. The deck contains the 36 dice outcomes as cards, so over a full deck every number comes up exactly as often as it should. It keeps the probabilities and removes most of the short-run luck.

## Wrapping Up

Here's the path we took:

1. Catan is an island of 19 resource tiles. You build settlements on corners, roads on edges, and collect when the dice roll your numbers.
2. Two dice make a triangle of probabilities. The dots on each token count the ways to roll it, out of 36.
3. A corner's value is the sum of those dots. The best spot is worth about twice a typical one, and ore and brick are scarce by design.
4. The 7 has about even odds of hitting you before your next turn, cities double income, and production compounds.
5. In simulation, good openings beat bad ones by a factor of three or more, and specializing only works when you can trade.
6. Each expansion changes one piece of the model: the map, the economy, or the threat.

What I like most about Catan is that the probability is printed right there on the board, in little dots, and yet the game never feels like a math exercise. The math tells you where to settle. Everything after that is people, trades, and a robber that always seems to land on your best tile.

## References

[1] [Wikipedia: Catan](https://en.wikipedia.org/wiki/Catan)

[2] [Catan GmbH: Official game rules](https://www.catan.com/understand-catan/game-rules)

[3] [Wikipedia: Catan: Cities & Knights](https://en.wikipedia.org/wiki/Catan:_Cities_%26_Knights)

[4] [Wikipedia: Catan: Seafarers](https://en.wikipedia.org/wiki/Catan:_Seafarers)

<script src="/assets/posts/catan/catan.js?v={{ site.time | date: '%s' }}" defer></script>
