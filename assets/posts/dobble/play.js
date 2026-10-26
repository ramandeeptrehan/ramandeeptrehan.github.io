// Interactive Dobble: draw two cards, find the match, then see both cards as lines on the grid.
(function () {
  var root = document.getElementById("dobble-play");
  if (!root) return;

  var EMOJI = ["🍎", "⚓", "🔥", "🌙", "⭐", "🐢", "🔑", "❄️", "🎈", "💡", "🌵", "🐞", "✂️", "🎵", "☀️",
    "🍀", "🐬", "🎸", "🚲", "🍕", "🦋", "🐘", "🌈", "🍩", "⚽", "🎁", "🐱", "🐶", "🌻", "🍌",
    "🚀", "⏰", "🔔", "🎩", "🐙", "🍉", "🦊", "🐝", "🧩", "🎯", "🍄", "🐧", "🦉", "🍒", "🌍",
    "⚡", "💎", "🧲", "🐸", "🍦", "🥕", "🧀", "🦖", "🎲", "🍋", "🐳", "🌮"];

  var SIZES = [
    { n: 2, label: "3 per card · 7 cards" },
    { n: 3, label: "4 per card · 13 cards" },
    { n: 7, label: "8 per card · 57 cards" }
  ];

  var n = 7, deck = [], pair = [], solved = false, startedAt = 0, rounds = 0;

  function mod(a) { return ((a % n) + n) % n; }
  function inverse(a) {
    a = mod(a);
    for (var i = 1; i < n; i++) if ((a * i) % n === 1) return i;
    return 1;
  }
  function pointId(x, y) { return x * n + y; }
  function slopeId(m) { return n * n + m; }
  function verticalId() { return n * n + n; }

  function buildDeck() {
    var cards = [], m, b, x, c, y, syms;
    for (m = 0; m < n; m++) {
      for (b = 0; b < n; b++) {
        syms = [];
        for (x = 0; x < n; x++) syms.push(pointId(x, (m * x + b) % n));
        syms.push(slopeId(m));
        cards.push({ kind: "line", m: m, b: b, syms: syms });
      }
    }
    for (c = 0; c < n; c++) {
      syms = [];
      for (y = 0; y < n; y++) syms.push(pointId(c, y));
      syms.push(verticalId());
      cards.push({ kind: "vert", c: c, syms: syms });
    }
    syms = [];
    for (m = 0; m < n; m++) syms.push(slopeId(m));
    syms.push(verticalId());
    cards.push({ kind: "inf", syms: syms });
    return cards;
  }

  function rhs(m, b) {
    var t = m === 0 ? "" : m === 1 ? "x" : m + "x";
    if (!t) return String(b);
    return b ? t + " + " + b : t;
  }
  function equation(card) {
    if (card.kind === "line") return "y = " + rhs(card.m, card.b);
    if (card.kind === "vert") return "x = " + card.c;
    return "line at infinity";
  }
  function shared(a, b) {
    return a.syms.filter(function (s) { return b.syms.indexOf(s) !== -1; });
  }

  function explain(a, b, s) {
    var e = EMOJI[s], text;
    if (a.kind === "inf" || b.kind === "inf") {
      var other = a.kind === "inf" ? b : a;
      text = "One card is the line at infinity, which holds every slope symbol. The other is " +
        (other.kind === "line"
          ? "the line " + equation(other) + ", and every line with slope " + other.m + " carries " + e + "."
          : "the vertical line " + equation(other) + ", and every vertical line carries " + e + ".");
    } else if (a.kind === "vert" && b.kind === "vert") {
      text = "Both cards are vertical lines (" + equation(a) + " and " + equation(b) +
        "). They're parallel, so they never cross on the grid. They meet at infinity, at the shared vertical symbol " + e + ".";
    } else if (a.kind === "vert" || b.kind === "vert") {
      var v = a.kind === "vert" ? a : b, l = a.kind === "vert" ? b : a;
      text = "The vertical line " + equation(v) + " crosses " + equation(l) + " at y = " +
        mod(l.m * v.c + l.b) + " (mod " + n + "). That grid point is " + e + ".";
    } else if (a.m === b.m) {
      text = "Both cards are parallel lines with slope " + a.m + ": " + equation(a) + " and " + equation(b) +
        ". They never cross on the grid, so the deck gives every line with that slope the same extra symbol, " + e + ".";
    } else {
      var x = mod((b.b - a.b) * inverse(a.m - b.m)), y = mod(a.m * x + a.b);
      text = "Left card: " + equation(a) + ". Right card: " + equation(b) + ". Working mod " + n +
        ", they cross where " + rhs(a.m, a.b) + " = " + rhs(b.m, b.b) + ", at x = " + x + ", y = " + y +
        ". That grid point is " + e + ".";
    }
    return text + " Two different lines always meet exactly once, so every pair you draw has exactly one match.";
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  }

  function layout(k) {
    // Positions (in % of the card) for k symbols: a ring, plus a centre symbol when there are 8.
    var pts = [], ring = k >= 8 ? k - 1 : k, r = k >= 8 ? 31 : 24, offset = Math.random() * Math.PI * 2;
    if (k >= 8) pts.push([50, 50]);
    for (var i = 0; i < ring; i++) {
      var a = offset + (2 * Math.PI * i) / ring;
      pts.push([50 + r * Math.cos(a), 50 + r * Math.sin(a)]);
    }
    return pts;
  }

  root.innerHTML =
    '<div class="dp-head"><span class="dp-label">Try it</span><div class="dp-sizes">' +
    SIZES.map(function (s) {
      return '<button type="button" class="dp-size" data-n="' + s.n + '">' + s.label + "</button>";
    }).join("") +
    "</div></div>" +
    '<div class="dp-table">' +
    '<div class="dp-slot"><div class="dp-card"></div><span class="dp-eq"></span></div>' +
    '<div class="dp-slot"><div class="dp-card"></div><span class="dp-eq"></span></div>' +
    "</div>" +
    '<p class="dp-status"></p>' +
    '<div class="dp-actions">' +
    '<button type="button" class="dp-btn dp-primary" data-act="draw">Draw two new cards</button>' +
    '<button type="button" class="dp-btn" data-act="reveal">Show me</button>' +
    "</div>" +
    '<div class="dp-why" hidden><p class="dp-why-label">See it as lines</p><p class="dp-why-text"></p>' +
    '<div class="dp-grid"></div><div class="dp-inf"></div>' +
    '<p class="dp-legend"><span class="dp-key a"></span>left card <span class="dp-key b"></span>right card <span class="dp-key hit"></span>shared</p></div>' +
    '<p class="dp-stats"></p>';

  var cardEls = root.querySelectorAll(".dp-card");
  var eqEls = root.querySelectorAll(".dp-eq");
  var statusEl = root.querySelector(".dp-status");
  var whyEl = root.querySelector(".dp-why");
  var statsEl = root.querySelector(".dp-stats");

  function renderCard(el, card) {
    var syms = shuffle(card.syms.slice()), pts = layout(syms.length);
    var base = syms.length >= 8 ? 15 : syms.length === 4 ? 21 : 24;
    el.innerHTML = syms.map(function (s, i) {
      var size = base * (0.8 + Math.random() * 0.4), rot = Math.round(Math.random() * 80 - 40);
      return '<button type="button" class="dp-sym" data-s="' + s + '" aria-label="symbol" style="left:' +
        pts[i][0].toFixed(1) + "%;top:" + pts[i][1].toFixed(1) + "%;--s:" + size.toFixed(1) + ";--r:" + rot + 'deg">' +
        EMOJI[s] + "</button>";
    }).join("");
    el.classList.remove("dp-deal");
    void el.offsetWidth;
    el.classList.add("dp-deal");
  }

  function renderGrid() {
    var a = pair[0], b = pair[1], s = shared(a, b)[0];
    function cls(id) {
      if (id === s) return "dp-cell hit";
      var inA = a.syms.indexOf(id) !== -1, inB = b.syms.indexOf(id) !== -1;
      return "dp-cell" + (inA ? " a" : "") + (inB ? " b" : "");
    }
    var grid = root.querySelector(".dp-grid"), html = "";
    grid.style.gridTemplateColumns = "repeat(" + n + ", 1fr)";
    grid.style.maxWidth = n * 34 + "px";
    for (var y = n - 1; y >= 0; y--) {
      for (var x = 0; x < n; x++) html += '<span class="' + cls(pointId(x, y)) + '">' + EMOJI[pointId(x, y)] + "</span>";
    }
    grid.innerHTML = html;
    var inf = '<span class="dp-inf-label">at infinity</span>';
    for (var m = 0; m <= n; m++) inf += '<span class="' + cls(n * n + m) + '">' + EMOJI[n * n + m] + "</span>";
    root.querySelector(".dp-inf").innerHTML = inf;
    root.querySelector(".dp-why-text").textContent = explain(a, b, s);
    eqEls[0].textContent = equation(a);
    eqEls[1].textContent = equation(b);
    whyEl.hidden = false;
  }

  function finish(s, message) {
    solved = true;
    root.querySelectorAll('.dp-sym[data-s="' + s + '"]').forEach(function (el) { el.classList.add("dp-hit"); });
    statusEl.textContent = message;
    rounds++;
    statsEl.textContent = "Pairs drawn: " + rounds + ". Every single one had exactly one match.";
    renderGrid();
  }

  function draw() {
    var i = Math.floor(Math.random() * deck.length), j;
    do { j = Math.floor(Math.random() * deck.length); } while (j === i);
    pair = [deck[i], deck[j]];
    solved = false;
    renderCard(cardEls[0], pair[0]);
    renderCard(cardEls[1], pair[1]);
    eqEls[0].textContent = "";
    eqEls[1].textContent = "";
    whyEl.hidden = true;
    statusEl.textContent = "Tap the symbol both cards share.";
    startedAt = Date.now();
  }

  function setSize(size) {
    n = size;
    deck = buildDeck();
    root.querySelectorAll(".dp-size").forEach(function (el) {
      el.classList.toggle("active", Number(el.getAttribute("data-n")) === n);
    });
    draw();
  }

  root.addEventListener("click", function (ev) {
    var t = ev.target.closest("button");
    if (!t || !root.contains(t)) return;
    if (t.classList.contains("dp-size")) return setSize(Number(t.getAttribute("data-n")));
    if (t.getAttribute("data-act") === "draw") return draw();
    if (t.getAttribute("data-act") === "reveal") {
      if (!solved) finish(shared(pair[0], pair[1])[0], "Here it is: " + EMOJI[shared(pair[0], pair[1])[0]] + ".");
      return;
    }
    if (t.classList.contains("dp-sym") && !solved) {
      var s = Number(t.getAttribute("data-s"));
      if (shared(pair[0], pair[1])[0] === s) {
        finish(s, "Found it in " + ((Date.now() - startedAt) / 1000).toFixed(1) + "s. " + EMOJI[s] + " is on both cards.");
      } else {
        t.classList.remove("dp-miss");
        void t.offsetWidth;
        t.classList.add("dp-miss");
        statusEl.textContent = "Not that one. " + EMOJI[s] + " is only on one card.";
      }
    }
  });

  setSize(7);
})();
