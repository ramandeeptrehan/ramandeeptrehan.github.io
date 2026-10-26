---
layout: post
title: "The Math Behind Dobble"
date: 2026-10-25
---

In 1976, a French puzzle enthusiast named Jacques Cottereau made a set of 31 cards with 6 insect pictures on each. Any two of his cards had exactly one insect in common. He was inspired by Kirkman's schoolgirl problem, a 19th century puzzle about arranging girls into rows so that no two of them walk together twice [1].

Decades later, Denis Blanchot picked up the idea, swapped the insects for everyday symbols and turned it into a game. It came out as *Dobble* in 2009 (it is sold as *Spot It!* in the US) [1].

I was playing Dobble with friends recently and couldn't stop wondering how the deck is built. It is not obvious that such a deck should exist at all. In this post we'll work out the math from scratch: what has to be true about the deck, how many symbols it needs, and how to actually build one.

## The Game

A Dobble deck has 55 round cards. Each card has 8 symbols on it, and the key property is:

**Any two cards share exactly one symbol.**

Not zero, not two. Exactly one. The game is a race to spot that one shared symbol between your card and the one in the middle.

<figure>
  <img src="/assets/posts/dobble/two-cards.svg" alt="Two Dobble cards with eight symbols each. The only symbol on both is a star.">
  <figcaption>Figure 1: Two cards. The star is the only symbol they have in common.</figcaption>
</figure>

If you try to design such a deck by hand, you will get stuck quickly. Five or six cards is easy. Fifty-five is not. Every new card has to hit every existing card exactly once, and the constraints pile up fast.

## Cards as Lines

The trick is to stop thinking about cards and start thinking about geometry.

Call each symbol a **point** and each card a **line**. A card "contains" a symbol in the same way a line passes through a point. Then the rule of the game becomes:

**Any two lines meet in exactly one point.**

This should sound familiar. In ordinary geometry, two lines meet in exactly one point, except when they are parallel. The game simply asks for a geometry with no parallel lines.

It also helps to ask for the mirror image of that rule:

**Any two points lie on exactly one line.**

In game terms: any two symbols appear together on exactly one card. Dobble doesn't need this to be playable, but a deck that satisfies both rules is as balanced as it can possibly be, and it is much easier to reason about. A structure where both rules hold (plus a small non-degeneracy condition, so we don't count a single line as a geometry) is called a **projective plane**.

## A Small Deck

The smallest projective plane has 7 points and 7 lines, with 3 points on every line. It is called the **Fano plane**, and it is usually drawn like this:

<figure>
  <img src="/assets/posts/dobble/fano.svg" alt="The Fano plane: a triangle with its three medians and an inscribed circle, giving seven points and seven lines. Each line is listed as a card of three symbols.">
  <figcaption>Figure 2: The Fano plane as a 7-card deck. Each side of the triangle, each middle line and the circle is one card.</figcaption>
</figure>

Read each line as a card. The three sides of the triangle are three cards, the three lines through the centre are three more, and the circle counts as the seventh. Pick any two cards on the right and you will find exactly one shared symbol.

So this is a valid Dobble deck: 7 symbols, 7 cards, 3 symbols per card. The real game is the same idea, just bigger.

## How Many Symbols Do We Need?

Say every card has *n* + 1 symbols. (Writing it this way makes the formulas cleaner. For Dobble, *n* + 1 = 8, so *n* = 7.)

**Lemma 1.** In a deck where every two cards share exactly one symbol and every two symbols share exactly one card, each symbol appears on exactly *n* + 1 cards.

*Proof.* Pick a symbol, say the star, and a card X that does not have the star on it. X has *n* + 1 symbols. Each of those symbols appears together with the star on exactly one card, and that card meets X only at that symbol. So each symbol of X gives us a different card through the star, which gives *n* + 1 cards with the star.

Can there be a card with the star that we missed? No. Any such card has to share a symbol with X, so we already counted it. ∎

**Lemma 2.** Such a deck has exactly *n*² + *n* + 1 symbols.

*Proof.* Again pick the star. By Lemma 1 it sits on *n* + 1 cards. Each of those cards has *n* other symbols besides the star. These symbols are all different from one another, because two cards that share the star can't share anything else. And every symbol in the deck shows up on one of these cards, because every symbol appears together with the star somewhere.

So the total is the star itself, plus *n* new symbols on each of the *n* + 1 cards:

1 + (*n* + 1) · *n* = *n*² + *n* + 1. ∎

<figure>
  <img src="/assets/posts/dobble/counting.svg" alt="A star in the centre connected to eight cards, each adding seven new symbols, for a total of 57.">
  <figcaption>Figure 3: Counting the symbols from the point of view of one symbol.</figcaption>
</figure>

The same argument with cards and symbols swapped shows there are also *n*² + *n* + 1 cards.

For the Fano plane, *n* = 2: 4 + 2 + 1 = 7 symbols and 7 cards. For Dobble, *n* = 7: 49 + 7 + 1 = **57 symbols and 57 cards**.

## Where Did Two Cards Go?

The box says 55 cards, not 57. As far as I know the publisher has never explained why, and the most common guess is that 55 cards fit the printing sheets better. The game doesn't care: removing cards can't break the rule that any two remaining cards share exactly one symbol.

You can even find which cards are missing. In a full deck every symbol appears 8 times (Lemma 1). The two missing cards share exactly one symbol, so in the shipped deck that symbol appears only 6 times, the other 14 symbols on those two cards appear 7 times, and everything else appears 8 times. Count the symbols in your box and you can rebuild the two lost cards.

## Building a Deck

Knowing the size of the deck is one thing. Building it is another. Here is a construction that works whenever *n* is a prime number.

Start with an *n* × *n* grid of points. These are the first *n*² symbols. Now draw straight lines through the grid, using arithmetic modulo *n* so that lines wrap around the edges:

- the lines *y* = *mx* + *b*, for every slope *m* and every offset *b*, which gives *n*² lines;
- the vertical lines *x* = *c*, which gives another *n* lines.

Each of these lines passes through exactly *n* grid points. Two lines with different slopes meet in exactly one point. But two lines with the same slope are parallel and never meet, and that breaks the rule.

The fix is the same one painters discovered with perspective: parallel lines meet "at infinity". We add one extra symbol for each slope, *n* + 1 of them in total (the *n* slopes plus vertical), and put it on every line of that slope. Now parallel lines meet at their shared extra symbol. Finally, we add one more card holding all *n* + 1 extra symbols, the **line at infinity**.

<figure>
  <img src="/assets/posts/dobble/grid.svg" alt="Four 3 by 3 grids, one per slope family, with points coloured by which line they belong to. Each family gets an extra symbol.">
  <figcaption>Figure 4: The construction for n = 3. Each colour in a panel is one line of that slope, and each family gets its own extra symbol.</figcaption>
</figure>

Count the cards: *n*² + *n* + 1. Count the symbols: *n*² grid points plus *n* + 1 extra ones, also *n*² + *n* + 1. Every card has *n* + 1 symbols. It matches Lemma 2 exactly.

Why do we need *n* to be prime? Two lines *y* = *m*₁*x* + *b*₁ and *y* = *m*₂*x* + *b*₂ meet where

*x* = (*b*₂ − *b*₁) / (*m*₁ − *m*₂).

That needs division modulo *n*, and division modulo *n* only works for every nonzero number when *n* is prime. Try *n* = 4: the number 2 has no inverse modulo 4, and some pairs of lines end up meeting twice or not at all.

Here is the construction in Python, with a check that it really works for *n* = 7:

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

Replace the tuples with pictures and you have Dobble.

## Which Sizes Are Possible?

The grid construction works for primes. A more general version, using finite fields instead of plain arithmetic modulo *n*, works for every prime power: 2, 3, 4, 5, 7, 8, 9, 11, and so on. So you can build a deck with 3, 4, 5, 6, 8, 9, 10 or 12 symbols per card.

What about 7 symbols per card, meaning *n* = 6? That one is impossible. In 1782 Euler asked whether 36 officers from 6 regiments and 6 ranks could be arranged in a 6 × 6 square with no repeated regiment or rank in any row or column. He suspected not, and Gaston Tarry confirmed it in 1901 by checking the cases. A projective plane of order 6 would give you such an arrangement, so it can't exist either [2].

In 1949, Bruck and Ryser proved a more general result: if *n* leaves a remainder of 1 or 2 when divided by 4, and *n* is not a sum of two squares, then there is no plane of order *n* [2]. That rules out 6, 14, 21, 22 and many more.

Order 10 passes that test (10 = 1 + 9), so it needed a different approach. In 1989, Clement Lam and his colleagues settled it with a computer search that ran for thousands of hours: no plane of order 10 exists [3].

Every order we know of is a prime power. Whether any other kind exists is still an open problem. The smallest unknown case is *n* = 12, which would be a Dobble deck with 13 symbols per card. Nobody knows if you can build it.

## Conclusion

I went into this thinking the deck was built with clever trial and error. It turns out the designers didn't need to be clever at all once they picked 8 symbols per card. Seven is prime, so the geometry hands you the deck for free.

What I liked most is how small the core argument is. Two lemmas, both proved by looking at the deck from the point of view of a single symbol, and the number 57 falls out. The game feels like it is about fast eyes, but underneath it sits a question from the 1700s that we still haven't fully answered.

Next time someone at the table asks why there are 55 cards, you'll know the real answer is 57.

## References

[1] [Wikipedia: Dobble](https://en.wikipedia.org/wiki/Dobble)

[2] [Wikipedia: Projective plane, finite projective planes](https://en.wikipedia.org/wiki/Projective_plane#Finite_projective_planes)

[3] C. W. H. Lam, "The Search for a Finite Projective Plane of Order 10", *The American Mathematical Monthly*, 1991.
