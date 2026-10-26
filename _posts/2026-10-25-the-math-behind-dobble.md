---
layout: post
title: "The Math Behind Dobble"
date: 2026-10-25
---

<div class="tldr" markdown="1">

**TL;DR**

- Dobble's one rule: any two cards share exactly one symbol.
- If you think of symbols as points and cards as lines, that rule becomes "any two lines meet in exactly one point". Mathematicians call this a projective plane.
- With 8 symbols per card, simple counting forces the deck to have exactly 57 symbols and 57 cards. The box ships 55.
- You can build such a deck from a grid and some modular arithmetic, whenever the number of symbols per card minus one is a prime.
- Some deck sizes are impossible. One size, 13 symbols per card, is still an open problem.

</div>

I was playing Dobble with friends recently and couldn't stop wondering how the deck is built. Every pair of cards matches on exactly one symbol, and there are 55 cards. That doesn't happen by accident.

In this post we'll start from nothing and build our way up to the full deck, one small step at a time. You won't need any math beyond counting and a bit of school algebra.

## The Rule

A Dobble deck has 55 round cards. Each card has 8 symbols on it. The whole game depends on one rule:

**Any two cards share exactly one symbol.**

Not zero, not two. Exactly one. You flip a card, compare it with yours, and race to spot the match.

<figure>
  <img src="/assets/posts/dobble/two-cards.svg" alt="Two Dobble cards with eight symbols each. The only symbol on both is a star.">
  <figcaption>Figure 1: Two cards. The star is the only symbol they have in common.</figcaption>
</figure>

The idea is older than the game. In 1976, a French puzzle enthusiast named Jacques Cottereau made a set of 31 cards with 6 insect pictures each, where any two cards shared exactly one insect. Decades later, Denis Blanchot turned it into Dobble, released in 2009 and sold as *Spot It!* in the US [1].

Our goal is to understand how to design a deck that follows this rule, and why the numbers come out the way they do.

## The Cheat

Here's an easy way to satisfy the rule. Put a star on every card, and fill the rest of each card with symbols that appear nowhere else.

Any two cards now share exactly one symbol: the star. You can make as many cards as you like.

It follows the rule, but the game is ruined. The answer is always the star.

So the rule alone isn't enough. We need to say what a *fair* deck looks like. A natural way is to ask that no pair of symbols is special either:

**Any two symbols appear together on exactly one card.**

Now every symbol has to pair up with every other symbol somewhere in the deck, and no single symbol can dominate. From here on, a "deck" means one that follows both rules.

## Start Tiny: 2 Symbols per Card

Let's build the smallest fair deck we can, with just 2 symbols per card.

Start with one card: 🍎 ⚓.

The apple and anchor are now paired, so no other card can contain both. Add a third symbol, 🔥. It has to pair with the apple once and with the anchor once. That gives two more cards: 🍎 🔥 and ⚓ 🔥.

<figure>
  <img src="/assets/posts/dobble/triangle.svg" alt="A triangle with three symbols at the corners. Each side of the triangle is a card with two symbols.">
  <figcaption>Figure 2: The smallest fair deck. Each side of the triangle is a card.</figcaption>
</figure>

Check both rules. Any two cards share exactly one symbol. Any two symbols sit together on exactly one card. That's a complete deck: **3 symbols, 3 cards.**

Notice the picture. Symbols are corners and cards are sides. Two sides of a triangle always meet at exactly one corner. Keep that in mind, it's going to come back.

## One Step Up: 3 Symbols per Card

Now give each card 3 symbols. Trying this by hand takes a few minutes of crossing things out, but you'll end up with exactly 7 symbols and 7 cards. Here's one way to draw the result:

<figure>
  <img src="/assets/posts/dobble/fano.svg" alt="The Fano plane: a triangle with its three medians and an inscribed circle, giving seven points and seven lines. Each line is listed as a card of three symbols.">
  <figcaption>Figure 3: A fair deck with 3 symbols per card. Each straight line, and the circle, is one card.</figcaption>
</figure>

Each straight line through three symbols is a card, and so is the circle. Pick any two cards and they meet at exactly one symbol. Pick any two symbols and exactly one line passes through both.

This drawing is called the **Fano plane**. Again, symbols behave like points and cards behave like lines.

## Cards Are Lines

Let's make that idea official. Call each symbol a **point** and each card a **line**. A card "contains" a symbol in the same way a line passes through a point. Our two rules become:

- Any two lines meet in exactly one point.
- Any two points lie on exactly one line.

The second rule is just ordinary geometry: through two points you can draw one line. The first rule is ordinary geometry too, except for one thing. In the geometry we learn at school, parallel lines never meet. The geometry of Dobble has no parallel lines.

A geometry like this is called a **projective plane**. The Fano plane is the smallest one. (The triangle follows the same pattern, but mathematicians usually treat it as too small to count.) Dobble is a much bigger one. So the question becomes: how big?

## Counting: Why 57?

So far we have two data points:

- 2 symbols per card → 3 symbols in total
- 3 symbols per card → 7 symbols in total

Let's find the pattern instead of guessing it. To keep the formula tidy, say each card has *n* + 1 symbols. For the triangle *n* = 1, for Fano *n* = 2, and for Dobble *n* = 7.

**Step 1: how many cards does one symbol appear on?**

Pick any symbol, say the star, and pick a card X that doesn't have the star. X has *n* + 1 symbols on it.

By the second rule, each symbol on X appears together with the star on exactly one card. Those cards are all different, because any card with the star meets X at only one symbol. And there are no other cards with the star, because every card has to meet X somewhere.

So the star appears on exactly *n* + 1 cards. Nothing was special about the star, so this is true for every symbol.

**Step 2: how many symbols are there in total?**

Look at the deck from the star's point of view. It sits on *n* + 1 cards. Each of those cards has *n* other symbols on it.

These symbols never repeat, because two cards that share the star can't share anything else. And every symbol in the deck appears on one of them, because every symbol pairs with the star somewhere.

<figure>
  <img src="/assets/posts/dobble/counting.svg" alt="A star in the centre connected to eight cards, each adding seven new symbols, for a total of 57.">
  <figcaption>Figure 4: Counting every symbol in the deck from the point of view of the star, for 8 symbols per card.</figcaption>
</figure>

So the total is the star, plus *n* new symbols on each of its *n* + 1 cards:

1 + (*n* + 1) × *n* = ***n*² + *n* + 1**

Check it against our small decks. For *n* = 1: 1 + 1 + 1 = 3. For *n* = 2: 4 + 2 + 1 = 7. Both match.

Now Dobble. Each card has 8 symbols, so *n* = 7:

49 + 7 + 1 = **57 symbols.**

The same argument with the words "card" and "symbol" swapped shows the deck also has exactly 57 cards. Nobody chose 57. Once you pick 8 symbols per card, the rules force it.

## Where Did Two Cards Go?

The box says 55 cards, not 57. As far as I know the publisher has never said why. The usual guess is that 55 cards fit their printing sheets better.

It doesn't hurt the game. Taking cards out of a deck can't break the rule that any two remaining cards share one symbol.

You can even work out which two cards are missing. In a full deck every symbol appears on 8 cards (that's Step 1, with *n* = 7). The two missing cards share one symbol, so in your box that symbol appears only 6 times. The other 14 symbols on the missing cards appear 7 times. Everything else appears 8 times. Count the symbols and you can rebuild the lost cards.

## Building a Deck

Knowing a deck's size doesn't tell us how to make one. For that we'll go back to the picture we started with: real lines on a grid.

Here's the recipe, using *n* = 3 as the example (4 symbols per card, 13 cards).

**Step 1: lay out the points.** Draw a 3 × 3 grid of dots. That gives 9 symbols.

**Step 2: draw lines.** Use lines of the form *y* = *mx* + *b*, where we do all the arithmetic modulo 3. "Modulo 3" means we only keep the remainder after dividing by 3, so a line that runs off the right edge wraps around to the left, like Pac-Man. With 3 slopes (0, 1, 2) and 3 offsets each, plus 3 vertical lines, that's 12 lines. Each line passes through 3 dots.

**Step 3: fix the parallel lines.** Two lines with different slopes meet at exactly one dot. But two lines with the same slope never meet, and that breaks our rule. The fix is the same trick painters use for perspective: parallel lines meet "at infinity". So we give each slope its own extra symbol and add it to every line with that slope. Now parallel lines share exactly that symbol.

<figure>
  <img src="/assets/posts/dobble/grid.svg" alt="Four 3 by 3 grids, one per slope family, with points coloured by which line they belong to. Each family gets an extra symbol.">
  <figcaption>Figure 5: The 12 lines for n = 3. Each colour in a panel is one line. All lines in a panel are parallel, so they share that panel's extra symbol.</figcaption>
</figure>

**Step 4: add the last card.** The four extra symbols need a card of their own, so that any two of them appear together exactly once. That card is called the **line at infinity**.

Now count. Cards: 12 + 1 = 13. Symbols: 9 dots + 4 extra = 13. Symbols per card: 3 dots + 1 extra = 4. That's *n*² + *n* + 1 = 13, exactly what the counting argument predicted.

### Why *n* Has to Be Prime

Two lines *y* = *m*₁*x* + *b*₁ and *y* = *m*₂*x* + *b*₂ meet where

*x* = (*b*₂ − *b*₁) ÷ (*m*₁ − *m*₂)

That step divides, and division modulo *n* only works reliably when *n* is prime. Try *n* = 4. The lines *y* = 0 and *y* = 2*x* meet wherever 2*x* is a multiple of 4, which happens at *x* = 0 and at *x* = 2. Two lines meeting twice is exactly what we can't have.

Dobble uses *n* = 7, which is prime, so the recipe works. Here it is in Python, with a check over all 57 cards:

```python
from itertools import combinations

def dobble_deck(n):
    """Build a deck for a prime n: n*n + n + 1 cards, n + 1 symbols per card."""
    cards = []
    # Slanted lines: y = m*x + b, plus the symbol for slope m
    for m in range(n):
        for b in range(n):
            cards.append([(x, (m * x + b) % n) for x in range(n)] + [f"slope {m}"])
    # Vertical lines: x = c, plus the symbol for "vertical"
    for c in range(n):
        cards.append([(c, y) for y in range(n)] + ["vertical"])
    # The line at infinity: every slope symbol together
    cards.append([f"slope {m}" for m in range(n)] + ["vertical"])
    return cards

deck = dobble_deck(7)
print(len(deck))  # 57
print(all(len(set(a) & set(b)) == 1 for a, b in combinations(deck, 2)))  # True
```

Swap the coordinates for pictures and you have Dobble.

## Which Sizes Are Possible?

The grid recipe works whenever *n* is prime. A more general version, using structures called finite fields in place of plain remainders, also works when *n* is a power of a prime, like 4, 8 or 9. So you can build fair decks with 3, 4, 5, 6, 8, 9, 10 or 12 symbols per card.

What about 7 symbols per card, so *n* = 6? That one doesn't exist. The story goes back to Euler, who asked in 1782 whether 36 officers from 6 regiments and 6 ranks could stand in a 6 × 6 square with no regiment or rank repeated in any row or column. Gaston Tarry proved in 1901 that it can't be done. A projective plane with *n* = 6 would give you such an arrangement, so it can't exist either [2].

In 1949, Bruck and Ryser found a more general rule that rules out many more sizes, including *n* = 14 and *n* = 21 [2].

Their rule doesn't cover *n* = 10. That case was settled only in 1989, when Clement Lam and his colleagues finished a computer search that took years. No plane with *n* = 10 exists [3].

Every projective plane anyone has ever found has a prime power for *n*. Nobody knows if that's always true. The smallest open case is *n* = 12, a Dobble deck with 13 symbols per card. We don't know if it can be built.

## Wrapping Up

Let's retrace the steps:

1. Dobble's rule is "any two cards share exactly one symbol". To stop one symbol from taking over, we added "any two symbols appear together on exactly one card".
2. Small decks showed us that symbols act like points and cards act like lines, in a geometry with no parallel lines.
3. Counting from a single symbol's point of view forced the size: *n*² + *n* + 1. With 8 symbols per card, that's 57.
4. A grid, modular arithmetic and one extra symbol per slope let us build the deck, as long as *n* is prime.

The game feels like it's about fast eyes. Underneath, it's a question Euler was already circling in the 1700s, and part of it is still open.

Next time someone at the table asks why there are 55 cards, you can tell them the real number is 57.

## References

[1] [Wikipedia: Dobble](https://en.wikipedia.org/wiki/Dobble)

[2] [Wikipedia: Projective plane, finite projective planes](https://en.wikipedia.org/wiki/Projective_plane#Finite_projective_planes)

[3] C. W. H. Lam, "The Search for a Finite Projective Plane of Order 10", *The American Mathematical Monthly*, 1991.
