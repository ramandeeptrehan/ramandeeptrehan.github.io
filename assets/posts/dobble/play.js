// Interactive Dobble: draw two cards, find the match, then walk through why it matches using the grid.
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

  var n = 7, deck = [], pair = [], solved = false, startedAt = 0, rounds = 0, timers = [];

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

  // One sentence describing where a card's symbols sit.
  function describe(card, side, color) {
    var who = "The <b>" + side + " card</b>";
    var line = '<span class="dp-ink ' + color + '">';
    if (card.kind === "line") {
      var shape = card.m === 0 ? "a flat line, " : "a line with slope " + card.m + ", ";
      return who + " is " + line + shape + equation(card) + "</span>. That's " + n +
        " spots on the grid, plus " + EMOJI[slopeId(card.m)] + " in the “at infinity” row, the symbol every line with slope " +
        card.m + " shares.";
    }
    if (card.kind === "vert") {
      return who + " is " + line + "the vertical line " + equation(card) + "</span>. That's the " + n +
        " spots in column " + card.c + ", plus " + EMOJI[verticalId()] + " at infinity, the symbol every vertical line shares.";
    }
    return who + " is " + line + "the “at infinity” row itself</span>: one symbol for each slope, and nothing on the grid.";
  }

  // The final step: where the two lines meet, and why only there.
  function meeting(a, b, s) {
    var e = "<b>" + EMOJI[s] + "</b>";
    if (a.kind === "inf" || b.kind === "inf") {
      return "The other card's slope symbol sits in that row, so the only spot they share is " + e + ". That's your match.";
    }
    if (a.kind === "vert" && b.kind === "vert") {
      return "Two vertical lines are parallel, so they never cross on the grid. What they do share is the vertical symbol at infinity, " +
        e + ". That's your match.";
    }
    if (a.kind === "line" && b.kind === "line" && a.m === b.m) {
      return "Both lines have slope " + a.m + ", so they're parallel and never cross on the grid. What they do share is the slope-" +
        a.m + " symbol at infinity, " + e + ". That's your match.";
    }
    var x, y;
    if (a.kind === "vert" || b.kind === "vert") {
      var v = a.kind === "vert" ? a : b, l = a.kind === "vert" ? b : a;
      x = v.c;
      y = mod(l.m * x + l.b);
    } else {
      x = mod((b.b - a.b) * inverse(a.m - b.m));
      y = mod(a.m * x + a.b);
    }
    return "The two lines cross at exactly one spot, x = " + x + ", y = " + y + ", which is " + e +
      ". That's your match. Two lines with different directions can only cross once, so there can't be a second match.";
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
    '<div class="dp-slot"><div class="dp-card"></div><span class="dp-eq a"></span></div>' +
    '<div class="dp-slot"><div class="dp-card"></div><span class="dp-eq b"></span></div>' +
    "</div>" +
    '<p class="dp-status"></p>' +
    '<div class="dp-actions">' +
    '<button type="button" class="dp-btn dp-primary" data-act="draw">Draw two new cards</button>' +
    '<button type="button" class="dp-btn" data-act="reveal">Show me</button>' +
    "</div>" +
    '<div class="dp-why" hidden>' +
    '<p class="dp-why-label">Why is that the only match?</p>' +
    '<p class="dp-intro"></p>' +
    '<ol class="dp-steps"><li class="a"></li><li class="b"></li><li class="hit"></li></ol>' +
    '<div class="dp-board"><div class="dp-grid"></div><p class="dp-inf-title">At infinity: one extra symbol per direction</p>' +
    '<div class="dp-inf"></div></div>' +
    '<p class="dp-note">Lines wrap around the edges, like Pac-Man, because we count mod <span class="dp-n"></span>. ' +
    "That's why some lines look broken.</p>" +
    '<div class="dp-actions"><button type="button" class="dp-btn" data-act="replay">Replay</button></div>' +
    "</div>" +
    '<p class="dp-stats"></p>';

  var cardEls = root.querySelectorAll(".dp-card");
  var eqEls = root.querySelectorAll(".dp-eq");
  var statusEl = root.querySelector(".dp-status");
  var whyEl = root.querySelector(".dp-why");
  var statsEl = root.querySelector(".dp-stats");
  var stepEls = root.querySelectorAll(".dp-steps li");

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

  function cell(id, extra) {
    return '<span class="dp-cell" data-id="' + id + '">' + EMOJI[id] + (extra || "") + "</span>";
  }

  function renderBoard() {
    var grid = root.querySelector(".dp-grid"), html = "", x, y, m;
    grid.style.gridTemplateColumns = "1.2em repeat(" + n + ", 1fr)";
    grid.style.maxWidth = n * 34 + 20 + "px";
    for (y = n - 1; y >= 0; y--) {
      html += '<span class="dp-axis">' + y + "</span>";
      for (x = 0; x < n; x++) html += cell(pointId(x, y));
    }
    html += '<span class="dp-axis">y/x</span>';
    for (x = 0; x < n; x++) html += '<span class="dp-axis">' + x + "</span>";
    grid.innerHTML = html;
    var inf = "";
    for (m = 0; m < n; m++) inf += cell(slopeId(m), '<small>slope ' + m + "</small>");
    inf += cell(verticalId(), "<small>vertical</small>");
    root.querySelector(".dp-inf").innerHTML = inf;
    root.querySelector(".dp-n").textContent = n;
  }

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  // Light up the left card, then the right card, then the one spot they share.
  function playSteps() {
    clearTimers();
    var a = pair[0], b = pair[1], s = shared(a, b)[0];
    var cells = root.querySelectorAll(".dp-board .dp-cell");
    cells.forEach(function (c) { c.classList.remove("a", "b", "hit"); });
    stepEls.forEach(function (li) { li.classList.remove("on"); });
    function mark(card, cls) {
      cells.forEach(function (c) {
        if (card.syms.indexOf(Number(c.getAttribute("data-id"))) !== -1) c.classList.add(cls);
      });
    }
    timers.push(setTimeout(function () { mark(a, "a"); stepEls[0].classList.add("on"); }, 150));
    timers.push(setTimeout(function () { mark(b, "b"); stepEls[1].classList.add("on"); }, 1300));
    timers.push(setTimeout(function () {
      root.querySelector('.dp-board .dp-cell[data-id="' + s + '"]').classList.add("hit");
      stepEls[2].classList.add("on");
    }, 2450));
  }

  function explain() {
    var a = pair[0], b = pair[1], s = shared(a, b)[0];
    root.querySelector(".dp-intro").textContent =
      "Every symbol in the deck has its own spot: " + n * n + " on this grid, and " + (n + 1) +
      " more in the row below it. Each card is the set of spots along one straight line. Watch:";
    stepEls[0].innerHTML = describe(a, "left", "a");
    stepEls[1].innerHTML = describe(b, "right", "b");
    stepEls[2].innerHTML = meeting(a, b, s);
    eqEls[0].textContent = equation(a);
    eqEls[1].textContent = equation(b);
    whyEl.hidden = false;
    playSteps();
  }

  function finish(s, message) {
    solved = true;
    root.querySelectorAll('.dp-sym[data-s="' + s + '"]').forEach(function (el) { el.classList.add("dp-hit"); });
    statusEl.textContent = message;
    rounds++;
    statsEl.textContent = "Pairs drawn: " + rounds + ". Every single one had exactly one match.";
    explain();
  }

  function draw() {
    clearTimers();
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
    renderBoard();
    root.querySelectorAll(".dp-size").forEach(function (el) {
      el.classList.toggle("active", Number(el.getAttribute("data-n")) === n);
    });
    draw();
  }

  root.addEventListener("click", function (ev) {
    var t = ev.target.closest("button");
    if (!t || !root.contains(t)) return;
    var act = t.getAttribute("data-act");
    if (t.classList.contains("dp-size")) return setSize(Number(t.getAttribute("data-n")));
    if (act === "draw") return draw();
    if (act === "replay") return playSteps();
    if (act === "reveal") {
      var s0 = shared(pair[0], pair[1])[0];
      if (!solved) finish(s0, "Here it is: " + EMOJI[s0] + ".");
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
