// Two small interactives for the Catan post: a dice roller and a board explorer.
(function () {
  var PIPS = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1 };
  var FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  function d6() { return 1 + Math.floor(Math.random() * 6); }

  // ---------- Dice roller ----------
  var dice = document.getElementById("catan-dice");
  if (dice) {
    var counts = {}, total = 0, s;
    dice.innerHTML =
      '<div class="cw-head"><span class="cw-label">Roll the dice</span><span class="cw-last"></span></div>' +
      '<div class="cw-bars"></div>' +
      '<p class="cw-note"></p>' +
      '<div class="cw-actions">' +
      [1, 10, 100, 1000].map(function (n) {
        return '<button type="button" class="cw-btn' + (n === 1 ? " cw-primary" : "") + '" data-roll="' + n + '">Roll ' +
          (n === 1 ? "once" : n.toLocaleString() + " times") + "</button>";
      }).join("") +
      '<button type="button" class="cw-btn" data-roll="0">Reset</button></div>';
    var bars = dice.querySelector(".cw-bars");
    var html = "";
    for (s = 2; s <= 12; s++) {
      html += '<div class="cw-col' + (s === 7 ? " seven" : "") + '"><span class="cw-count" data-s="' + s + '"></span>' +
        '<div class="cw-track"><div class="cw-expect" style="bottom:' + (PIPS[s] / 6) * 100 + '%"></div>' +
        '<div class="cw-fill" data-s="' + s + '"></div></div><span class="cw-sum">' + s + "</span></div>";
    }
    bars.innerHTML = html;

    function renderDice(last) {
      var max = 0, k;
      for (k = 2; k <= 12; k++) max = Math.max(max, (counts[k] || 0) / Math.max(total, 1));
      var top = Math.max(max, 6 / 36) * 1.08;
      for (k = 2; k <= 12; k++) {
        var share = (counts[k] || 0) / Math.max(total, 1);
        dice.querySelector('.cw-fill[data-s="' + k + '"]').style.height = (share / top) * 100 + "%";
        dice.querySelector('.cw-count[data-s="' + k + '"]').textContent = total ? Math.round(share * 100) + "%" : "";
        dice.querySelector('.cw-col:nth-child(' + (k - 1) + ") .cw-expect").style.bottom = ((PIPS[k] / 36) / top) * 100 + "%";
      }
      dice.querySelector(".cw-last").textContent = last ? last[0] + " " + last[1] + "  = " + (last[2]) : "";
      var sevens = total ? Math.round(((counts[7] || 0) / total) * 1000) / 10 : 0;
      dice.querySelector(".cw-note").textContent = total
        ? total.toLocaleString() + " rolls so far. Sevens: " + sevens + "% (the math says 16.7%). The dashes mark the exact odds."
        : "Each bar shows how often a sum has come up. The dashes mark the exact odds.";
    }

    dice.addEventListener("click", function (ev) {
      var b = ev.target.closest("button[data-roll]");
      if (!b) return;
      var n = Number(b.getAttribute("data-roll")), last = null;
      if (n === 0) { counts = {}; total = 0; }
      for (var i = 0; i < n; i++) {
        var a = d6(), c = d6();
        counts[a + c] = (counts[a + c] || 0) + 1;
        total++;
        last = [FACES[a], FACES[c], a + c];
      }
      renderDice(last);
    });
    renderDice(null);
  }

  // ---------- Board explorer ----------
  var boardRoot = document.getElementById("catan-board");
  if (!boardRoot) return;

  var TERRAIN = {
    forest: { color: "#5d9a55", icon: "🌲", res: "lumber" },
    hills: { color: "#c97b4a", icon: "🧱", res: "brick" },
    pasture: { color: "#a8d07a", icon: "🐑", res: "wool" },
    fields: { color: "#e6c55e", icon: "🌾", res: "grain" },
    mountains: { color: "#a3a3a3", icon: "⛰️", res: "ore" },
    desert: { color: "#e9dcb0", icon: "🏜️", res: null }
  };
  var TILES = [].concat(rep("forest", 4), rep("pasture", 4), rep("fields", 4), rep("hills", 3), rep("mountains", 3), ["desert"]);
  var TOKENS = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];
  function rep(x, k) { var a = []; while (k--) a.push(x); return a; }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Geometry: 19 pointy-top hexes, 54 corners.
  var SIZE = 44, hexes = [], corners = [], cornerKey = {};
  for (var q = -2; q <= 2; q++) {
    for (var r = -2; r <= 2; r++) {
      if (Math.abs(q + r) > 2) continue;
      var cx = SIZE * Math.sqrt(3) * (q + r / 2), cy = SIZE * 1.5 * r, ids = [];
      for (var i = 0; i < 6; i++) {
        var a = (Math.PI / 180) * (60 * i - 30);
        var x = cx + SIZE * Math.cos(a), y = cy + SIZE * Math.sin(a);
        var key = Math.round(x) + "," + Math.round(y);
        if (!(key in cornerKey)) { cornerKey[key] = corners.length; corners.push({ x: x, y: y, hexes: [] }); }
        ids.push(cornerKey[key]);
        corners[cornerKey[key]].hexes.push(hexes.length);
      }
      hexes.push({ q: q, r: r, x: cx, y: cy, corners: ids });
    }
  }
  function adjacent(h1, h2) {
    var dq = hexes[h1].q - hexes[h2].q, dr = hexes[h1].r - hexes[h2].r;
    return Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr) === 2;
  }

  var board = null, selected = null;

  function deal() {
    while (true) {
      var terrain = shuffle(TILES.slice()), tokens = shuffle(TOKENS.slice()), ok = true;
      var number = terrain.map(function (t) { return t === "desert" ? null : tokens.pop(); });
      for (var h1 = 0; h1 < 19 && ok; h1++) {
        for (var h2 = h1 + 1; h2 < 19; h2++) {
          if ((number[h1] === 6 || number[h1] === 8) && (number[h2] === 6 || number[h2] === 8) && adjacent(h1, h2)) { ok = false; break; }
        }
      }
      if (ok) return { terrain: terrain, number: number };
    }
  }

  function cornerPips(c) {
    return corners[c].hexes.reduce(function (sum, h) { return sum + (board.number[h] ? PIPS[board.number[h]] : 0); }, 0);
  }

  function hexPoints(h) {
    var pts = [];
    for (var i = 0; i < 6; i++) {
      var a = (Math.PI / 180) * (60 * i - 30);
      pts.push((h.x + (SIZE - 1.5) * Math.cos(a)).toFixed(1) + "," + (h.y + (SIZE - 1.5) * Math.sin(a)).toFixed(1));
    }
    return pts.join(" ");
  }

  boardRoot.innerHTML =
    '<div class="cw-head"><span class="cw-label">Explore a board</span><span class="cw-last cw-board-roll"></span></div>' +
    '<svg class="cb-svg" viewBox="-205 -185 410 370" role="img" aria-label="A random Catan board"></svg>' +
    '<div class="cb-info"></div>' +
    '<div class="cw-actions">' +
    '<button type="button" class="cw-btn cw-primary" data-act="roll">Roll the dice</button>' +
    '<button type="button" class="cw-btn" data-act="best">Show the best 5 corners</button>' +
    '<button type="button" class="cw-btn" data-act="new">Deal a new board</button></div>';
  var svgEl = boardRoot.querySelector(".cb-svg"), info = boardRoot.querySelector(".cb-info");

  function renderBoard() {
    var out = "";
    hexes.forEach(function (h, i) {
      var t = TERRAIN[board.terrain[i]], n = board.number[i];
      out += '<g class="cb-hex" data-h="' + i + '"><polygon points="' + hexPoints(h) + '" fill="' + t.color + '"/>' +
        '<text x="' + h.x + '" y="' + (h.y - 17) + '" class="cb-icon">' + t.icon + "</text>";
      if (n) {
        var red = n === 6 || n === 8;
        out += '<circle cx="' + h.x + '" cy="' + (h.y + 7) + '" r="13" class="cb-token"/>' +
          '<text x="' + h.x + '" y="' + (h.y + 11) + '" class="cb-num' + (red ? " red" : "") + '">' + n + "</text>";
        for (var p = 0; p < PIPS[n]; p++) {
          out += '<circle cx="' + (h.x + (p - (PIPS[n] - 1) / 2) * 3.4).toFixed(1) + '" cy="' + (h.y + 15.5) + '" r="1.1" class="cb-pip' + (red ? " red" : "") + '"/>';
        }
      } else {
        out += '<text x="' + h.x + '" y="' + (h.y + 12) + '" class="cb-robber">robber</text>';
      }
      out += "</g>";
    });
    corners.forEach(function (c, i) {
      out += '<g class="cb-corner" data-c="' + i + '" tabindex="0"><circle cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) +
        '" r="11" class="cb-hit"/><circle cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) + '" r="5" class="cb-dot"/>' +
        '<text x="' + c.x.toFixed(1) + '" y="' + (c.y + 3.5).toFixed(1) + '" class="cb-rank"></text></g>';
    });
    svgEl.innerHTML = out;
    selected = null;
    info.innerHTML = '<p class="cb-hint">Click any corner where hexes meet to see what a settlement there would collect.</p>';
    boardRoot.querySelector(".cw-board-roll").textContent = "";
  }

  function describeCorner(c) {
    var rows = corners[c].hexes.map(function (h) {
      var t = TERRAIN[board.terrain[h]], n = board.number[h];
      if (!n) return "<li>" + t.icon + " desert: nothing</li>";
      return "<li>" + t.icon + " " + t.res + " on a " + n + ": <b>" + PIPS[n] + "</b> pip" + (PIPS[n] > 1 ? "s" : "") + "</li>";
    });
    var pips = cornerPips(c);
    var all = corners.map(function (_, i) { return cornerPips(i); }).sort(function (a, b) { return b - a; });
    var rank = all.indexOf(pips) + 1;
    return '<p class="cb-title">This corner touches ' + corners[c].hexes.length + " hex" + (corners[c].hexes.length > 1 ? "es" : "") + ":</p>" +
      "<ul>" + rows.join("") + "</ul>" +
      '<p class="cb-sum"><b>' + pips + " pips</b>, so a settlement here collects about <b>" + pips +
      " cards every 36 rolls</b>" + (pips ? " (one every " + (36 / pips).toFixed(1) + " rolls)" : "") +
      ". That ranks #" + rank + " of 54 corners on this board.</p>";
  }

  function select(c) {
    selected = c;
    svgEl.querySelectorAll(".cb-corner").forEach(function (g) { g.classList.toggle("on", Number(g.getAttribute("data-c")) === c); });
    svgEl.querySelectorAll(".cb-hex").forEach(function (g) {
      g.classList.toggle("lit", corners[c].hexes.indexOf(Number(g.getAttribute("data-h"))) !== -1);
    });
    info.innerHTML = describeCorner(c);
  }

  function showBest() {
    var order = corners.map(function (_, i) { return i; }).sort(function (a, b) { return cornerPips(b) - cornerPips(a); });
    svgEl.querySelectorAll(".cb-corner").forEach(function (g) {
      g.classList.remove("best");
      g.querySelector(".cb-rank").textContent = "";
    });
    order.slice(0, 5).forEach(function (c, k) {
      var g = svgEl.querySelector('.cb-corner[data-c="' + c + '"]');
      g.classList.add("best");
      g.querySelector(".cb-rank").textContent = k + 1;
    });
    info.innerHTML = '<p class="cb-hint">The numbered corners have the most pips. In a real game they go fast, and the best one is rarely the best <i>pair</i> of resources. Click one to see why it ranks where it does.</p>';
  }

  function roll() {
    var a = d6(), b = d6(), s = a + b;
    boardRoot.querySelector(".cw-board-roll").textContent = FACES[a] + " " + FACES[b] + "  = " + s;
    svgEl.querySelectorAll(".cb-hex").forEach(function (g) {
      g.classList.remove("produce");
      void g.getBoundingClientRect();
      if (board.number[Number(g.getAttribute("data-h"))] === s) g.classList.add("produce");
    });
    if (s === 7) {
      info.innerHTML = '<p class="cb-hint"><b>A 7.</b> Nothing produces. Anyone holding more than 7 cards discards half, and the roller moves the robber and steals a card.</p>';
    } else if (selected !== null) {
      var gain = corners[selected].hexes.filter(function (h) { return board.number[h] === s; }).length;
      info.innerHTML = describeCorner(selected) + '<p class="cb-roll">Rolled ' + s + ": your corner collects <b>" + gain + " card" + (gain === 1 ? "" : "s") + "</b>.</p>";
    } else {
      info.innerHTML = '<p class="cb-hint">Rolled ' + s + ". The glowing hexes produce: every settlement touching them collects one card, every city two.</p>";
    }
  }

  boardRoot.addEventListener("click", function (ev) {
    var g = ev.target.closest(".cb-corner");
    if (g) return select(Number(g.getAttribute("data-c")));
    var b = ev.target.closest("button[data-act]");
    if (!b) return;
    var act = b.getAttribute("data-act");
    if (act === "new") { board = deal(); renderBoard(); }
    if (act === "best") showBest();
    if (act === "roll") roll();
  });
  boardRoot.addEventListener("keydown", function (ev) {
    var g = ev.target.closest(".cb-corner");
    if (g && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); select(Number(g.getAttribute("data-c"))); }
  });

  board = deal();
  renderBoard();
})();
