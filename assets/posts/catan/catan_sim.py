"""Monte Carlo experiments for Catan.

Run:  python3 catan_sim.py            (about 30 seconds)
      python3 catan_sim.py --games 500 (a quick run)

It builds the real 19-hex board, generates random legal boards, and plays a
simplified solo race to 10 victory points to compare opening placements and
strategies. Three opponents claim spots during setup, so the best corners are
contested, but they don't build, trade or move the robber afterwards.
"""
import argparse
import math
import random
from collections import Counter
from statistics import mean, median

RESOURCES = ["lumber", "brick", "wool", "grain", "ore"]
TERRAIN = ["lumber"] * 4 + ["wool"] * 4 + ["grain"] * 4 + ["brick"] * 3 + ["ore"] * 3 + ["desert"]
TOKENS = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12]
PIPS = {n: 6 - abs(n - 7) for n in range(2, 13)}  # ways to roll n with two dice
COST = {
    "road": {"lumber": 1, "brick": 1},
    "settlement": {"lumber": 1, "brick": 1, "wool": 1, "grain": 1},
    "city": {"grain": 2, "ore": 3},
    "dev": {"wool": 1, "grain": 1, "ore": 1},
}
DEV_DECK = ["knight"] * 14 + ["vp"] * 5 + ["road_building"] * 2 + ["plenty"] * 2 + ["monopoly"] * 2


# ---------- Board geometry ----------

def build_geometry():
    """19 hexes in axial coordinates; corners (54) and the edges (72) between them."""
    hexes = [(q, r) for q in range(-2, 3) for r in range(-2, 3) if abs(q + r) <= 2]
    corner_id, hex_corners = {}, []
    for q, r in hexes:
        cx, cy = math.sqrt(3) * (q + r / 2), 1.5 * r
        ids = []
        for i in range(6):
            a = math.radians(60 * i - 30)
            key = (round(cx + math.cos(a), 3) + 0.0, round(cy + math.sin(a), 3) + 0.0)
            ids.append(corner_id.setdefault(key, len(corner_id)))
        hex_corners.append(ids)
    neighbors = {v: set() for v in range(len(corner_id))}
    for ids in hex_corners:
        for i in range(6):
            a, b = ids[i], ids[(i + 1) % 6]
            neighbors[a].add(b)
            neighbors[b].add(a)
    touching = {v: [] for v in range(len(corner_id))}
    for h, ids in enumerate(hex_corners):
        for v in ids:
            touching[v].append(h)
    return hexes, neighbors, touching


HEXES, NEIGHBORS, TOUCHING = build_geometry()
HEX_INDEX = {h: i for i, h in enumerate(HEXES)}
ADJACENT_HEXES = [
    [HEX_INDEX[(q + dq, r + dr)] for dq, dr in [(1, 0), (-1, 0), (0, 1), (0, -1), (1, -1), (-1, 1)]
     if (q + dq, r + dr) in HEX_INDEX]
    for q, r in HEXES
]


def random_board(rng):
    """Shuffle terrain and number tokens, rejecting boards where a 6 or 8 touches another 6 or 8."""
    while True:
        terrain = TERRAIN[:]
        rng.shuffle(terrain)
        tokens = TOKENS[:]
        rng.shuffle(tokens)
        number = [None if t == "desert" else tokens.pop() for t in terrain]
        red = [n in (6, 8) for n in number]
        if not any(red[h] and red[j] for h in range(19) for j in ADJACENT_HEXES[h]):
            return terrain, number


def spot_pips(board, v):
    terrain, number = board
    return sum(PIPS[number[h]] for h in TOUCHING[v] if number[h])


def spot_production(board, v):
    """Pips per resource at a corner."""
    terrain, number = board
    out = Counter()
    for h in TOUCHING[v]:
        if number[h]:
            out[terrain[h]] += PIPS[number[h]]
    return out


# ---------- Strategies ----------

STRATEGIES = {
    # name: (resource weights for picking spots, build priority)
    "Balanced": ({r: 1.0 for r in RESOURCES}, ["city", "settlement", "road", "dev"]),
    "Ore-Wheat": ({"lumber": 0.6, "brick": 0.6, "wool": 1.0, "grain": 1.4, "ore": 1.4},
                  ["city", "dev", "settlement", "road"]),
    "Wood-Brick": ({"lumber": 1.4, "brick": 1.4, "wool": 1.0, "grain": 1.0, "ore": 0.6},
                   ["settlement", "road", "city", "dev"]),
    "Random opening": (None, ["city", "settlement", "road", "dev"]),
}


def spot_score(board, v, weights):
    prod = spot_production(board, v)
    return sum(weights[r] * p for r, p in prod.items()) + 1.5 * len(prod)  # small bonus for variety


# ---------- A simplified solo game ----------

class Game:
    def __init__(self, board, strategy, rng):
        self.board, self.rng = board, rng
        self.weights, self.priority = STRATEGIES[strategy]
        self.hand = Counter()
        self.settlements, self.cities, self.roads = set(), set(), set()
        self.blocked = set()  # corners taken by opponents
        self.deck = DEV_DECK[:]
        rng.shuffle(self.deck)
        self.new_cards, self.cards = [], []
        self.knights = self.vp_cards = 0

    # --- placement rules ---
    def occupied(self):
        return self.settlements | self.cities | self.blocked

    def legal_spot(self, v):
        taken = self.occupied()
        return v not in taken and not (NEIGHBORS[v] & taken)

    def network(self):
        verts = set(self.settlements | self.cities)
        for e in self.roads:
            verts |= e
        return verts - self.blocked

    def best(self, spots):
        if self.weights is None:
            return self.rng.choice(spots)
        return max(spots, key=lambda v: spot_score(self.board, v, self.weights))

    def setup(self, opponents=3):
        """Snake draft: you pick first, then each opponent picks twice, then your second pick."""
        def opponent_pick():
            spots = [v for v in NEIGHBORS if self.legal_spot(v)]
            self.blocked.add(max(spots, key=lambda v: spot_pips(self.board, v)))

        first = self.best([v for v in NEIGHBORS if self.legal_spot(v)])
        self.place_settlement(first)
        for _ in range(2 * opponents):
            opponent_pick()
        second = self.best([v for v in NEIGHBORS if self.legal_spot(v)])
        self.place_settlement(second)
        for h in TOUCHING[second]:  # the second settlement pays out immediately
            if self.board[1][h]:
                self.hand[self.board[0][h]] += 1

    def place_settlement(self, v):
        self.settlements.add(v)
        free = [u for u in NEIGHBORS[v] if frozenset((v, u)) not in self.roads]
        if len(self.settlements) <= 2 and free:  # setup settlements come with a free road
            self.roads.add(frozenset((v, max(free, key=lambda u: spot_pips(self.board, u)))))

    # --- scoring ---
    def longest_road(self):
        adj = {}
        for e in self.roads:
            a, b = tuple(e)
            adj.setdefault(a, []).append((b, e))
            adj.setdefault(b, []).append((a, e))

        def walk(v, used):
            best_len = 0
            for u, e in adj.get(v, []):
                if e not in used and (v not in self.blocked):
                    best_len = max(best_len, 1 + walk(u, used | {e}))
            return best_len

        return max((walk(v, frozenset()) for v in adj), default=0)

    def points(self):
        vp = len(self.settlements) + 2 * len(self.cities) + self.vp_cards
        vp += 2 if self.knights >= 3 else 0          # largest army (solo: you hold it at 3 knights)
        vp += 2 if len(self.roads) >= 5 and self.longest_road() >= 5 else 0  # longest road
        return vp

    # --- economy ---
    def produce(self, roll):
        terrain, number = self.board
        for v in self.settlements | self.cities:
            gain = 2 if v in self.cities else 1
            for h in TOUCHING[v]:
                if number[h] == roll:
                    self.hand[terrain[h]] += gain

    def discard_on_seven(self):
        total = sum(self.hand.values())
        if total > 7:
            for _ in range(total // 2):
                r = max(self.hand, key=lambda k: self.hand[k])  # throw away what you have most of
                self.hand[r] -= 1

    def afford(self, item):
        """Pay for item, trading 4:1 with the bank if needed. Returns True if bought."""
        need = COST[item]
        short = sum(max(0, n - self.hand[r]) for r, n in need.items())
        spare = sum((self.hand[r] - need.get(r, 0)) // 4 for r in RESOURCES if self.hand[r] > need.get(r, 0))
        if short > spare:
            return False
        for r, n in need.items():
            while self.hand[r] < n:
                give = max((k for k in RESOURCES if self.hand[k] - need.get(k, 0) >= 4),
                           key=lambda k: self.hand[k] - need.get(k, 0))
                self.hand[give] -= 4
                self.hand[r] += 1
        for r, n in need.items():
            self.hand[r] -= n
        return True

    def settlement_targets(self):
        return [v for v in self.network() if self.legal_spot(v)]

    def road_target(self):
        """First edge of the shortest path to the best reachable open spot (within 3 roads)."""
        start = self.network()
        frontier, seen, first_edge = list(start), set(start), {}
        for _ in range(3):
            nxt = []
            for v in frontier:
                if v in self.blocked:
                    continue
                for u in NEIGHBORS[v]:
                    e = frozenset((v, u))
                    if u in seen or e in self.roads:
                        continue
                    seen.add(u)
                    first_edge[u] = first_edge.get(v, e)
                    nxt.append(u)
            frontier = nxt
        options = [u for u in first_edge if self.legal_spot(u)]
        if not options or len(self.roads) >= 15:
            return None
        return first_edge[self.best(options)]

    def try_build(self, item):
        if item == "city" and self.settlements and len(self.cities) < 4 and self.afford("city"):
            v = max(self.settlements, key=lambda s: spot_pips(self.board, s))
            self.settlements.remove(v)
            self.cities.add(v)
            return True
        if item == "settlement" and len(self.settlements) < 5:
            targets = self.settlement_targets()
            if targets and self.afford("settlement"):
                self.place_settlement(self.best(targets))
                return True
        if item == "road" and not self.settlement_targets():
            edge = self.road_target()
            if edge and self.afford("road"):
                self.roads.add(edge)
                return True
        if item == "dev" and self.deck and self.afford("dev"):
            card = self.deck.pop()
            if card == "vp":
                self.vp_cards += 1
            else:
                self.new_cards.append(card)  # can't be played on the turn it was bought
            return True
        return False

    def play_card(self):
        for card in ["knight", "road_building", "plenty"]:
            if card in self.cards:
                self.cards.remove(card)
                if card == "knight":
                    self.knights += 1
                elif card == "road_building":
                    for _ in range(2):
                        edge = self.road_target()
                        if edge:
                            self.roads.add(edge)
                else:
                    self.hand["ore"] += 1
                    self.hand["grain"] += 1
                return  # one development card per turn

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


def rounds_to_win(board, strategy, rng, limit=200):
    game = Game(board, strategy, rng)
    game.setup()
    start_pips = sum(spot_pips(board, v) for v in game.settlements)
    for rnd in range(1, limit + 1):
        game.take_turn()
        if game.points() >= 10:
            return rnd, start_pips
    return limit, start_pips


# ---------- Experiments ----------

def dice_experiment(rng, rolls=1_000_000):
    counts = Counter(rng.randint(1, 6) + rng.randint(1, 6) for _ in range(rolls))
    print("Sum  simulated  exact")
    for s in range(2, 13):
        print(f"{s:>3}  {counts[s] / rolls:9.4f}  {PIPS[s] / 36:6.4f}")


def spot_experiment(rng, boards=10_000):
    best, typical = [], []
    for _ in range(boards):
        board = random_board(rng)
        pips = sorted((spot_pips(board, v) for v in NEIGHBORS), reverse=True)
        best.append(pips[0])
        typical.append(median(pips))
    print(f"Best corner on a board:   {mean(best):.1f} pips on average")
    print(f"Median corner on a board: {mean(typical):.1f} pips on average")


def strategy_experiment(rng, games=4_000):
    print(f"Strategy         median rounds   finished within 30 rounds   ({games:,} games each)")
    results = {}
    for name in STRATEGIES:
        runs = [rounds_to_win(random_board(rng), name, rng) for _ in range(games)]
        rounds = [r for r, _ in runs]
        results[name] = runs
        within = sum(r <= 30 for r in rounds) / len(rounds)
        print(f"{name:<15}  {median(rounds):>13.0f}   {within:>25.0%}", flush=True)
    return results


def opening_experiment(results):
    runs = results["Balanced"] + results["Random opening"]
    buckets = {}
    for rounds, pips in runs:
        buckets.setdefault(min(pips // 4 * 4, 28), []).append(rounds)
    print("Starting pips   games   median rounds to 10 VP   (200 = most games never got there)")
    for b in sorted(buckets):
        if len(buckets[b]) >= 50:
            print(f"   {b:>2}-{b + 3:<2}      {len(buckets[b]):>5}   {median(buckets[b]):>8.0f}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Monte Carlo experiments for Catan.")
    parser.add_argument("--games", type=int, default=4_000, help="games per strategy (default 4000, about 30 seconds)")
    parser.add_argument("--seed", type=int, default=15, help="random seed (default 15 reproduces the blog post)")
    args = parser.parse_args()

    rng = random.Random(args.seed)
    print(f"Board: {len(HEXES)} hexes, {len(NEIGHBORS)} corners, "
          f"{sum(len(n) for n in NEIGHBORS.values()) // 2} edges\n")
    print("1. Rolling two dice a million times...", flush=True)
    dice_experiment(rng)
    print("\n2. Scoring every corner on 10,000 random boards...", flush=True)
    spot_experiment(rng)
    print(f"\n3. Playing {args.games:,} games for each strategy (try --games 500 for a quick run)...", flush=True)
    results = strategy_experiment(rng, args.games)
    print("\n4. How much the opening matters...", flush=True)
    opening_experiment(results)
