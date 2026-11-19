(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var THEMES = {
    light: {
      red: "#c43b3b", ink: "#000000", paper: "#ffffff",
      fill: "#e4e4e4", edge: "#000000", tick: "#333333", axis: "#5c5c5c", arc: "#8a8a8a"
    },
    dark: {
      red: "#c43b3b", ink: "#ffffff", paper: "#000000",
      fill: "#1c1c1c", edge: "#ffffff", tick: "#d4d4d4", axis: "#8a8a8a", arc: "#6e6e6e"
    }
  };
  var RED = THEMES.light.red;
  var INK = THEMES.light.ink;
  var PAPER = THEMES.light.paper;
  var FILL = THEMES.light.fill;
  var EDGE = THEMES.light.edge;
  var TICKC = THEMES.light.tick;
  var AXIS = THEMES.light.axis;
  var ARC = THEMES.light.arc;

  function useTheme(next, persist) {
    var name = next === "dark" ? "dark" : "light";
    var palette = THEMES[name];
    RED = palette.red;
    INK = palette.ink;
    PAPER = palette.paper;
    FILL = palette.fill;
    EDGE = palette.edge;
    TICKC = palette.tick;
    AXIS = palette.axis;
    ARC = palette.arc;
    document.documentElement.setAttribute("data-theme", name);
    var meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.setAttribute("content", name);
    if (persist) {
      try { localStorage.setItem("y-grid-theme", name); } catch (err) {}
    }
    var lightBtn = document.getElementById("theme-light");
    var darkBtn = document.getElementById("theme-dark");
    if (lightBtn) lightBtn.setAttribute("aria-pressed", name === "light" ? "true" : "false");
    if (darkBtn) darkBtn.setAttribute("aria-pressed", name === "dark" ? "true" : "false");
  }

  useTheme(document.documentElement.getAttribute("data-theme"), false);

  var RAY_OUT = 1.16;
  var TICK = 0.1;
  var BASE = 0.26;

  var MIN_CELL = 28;
  var MM = 72 / 25.4;
  var PAGE_W = 420 * MM;
  var PAGE_H = 297 * MM;
  var MARGIN = 12.7 * MM;
  var GUTTER = 8 * MM;
  var HEADER_H = 12 * MM;
  var BLOCK_TITLE_H = 6 * MM;
  var SOLO_COLS = 6;
  var SOLO_ROWS = 11;

  var stage = document.getElementById("stage");
  var field = document.getElementById("field");
  var mode = "grid";
  var shapeOnly = false;
  var picked = [];
  var active = 0;
  var lastGood = null;
  var liveMetrics = null;

  var PARAMS = [
    { key: "arm", label: "ARM", lo: 14, hi: 68, digits: 1 },
    { key: "spread", label: "SPREAD", lo: 0.8, hi: 14, digits: 1 },
    { key: "length", label: "LENGTH", lo: 80, hi: 900, digits: 0 },
    { key: "stem", label: "STEM", lo: 60, hi: 1600, digits: 0 },
    { key: "offset", label: "OFFSET", lo: 0, hi: 2000, digits: 0 },
    { key: "radius", label: "RADIUS", lo: 0, hi: 2000, digits: 1 }
  ];
  // Seeded so the untouched sheet stays spread × arm × stem. New toggles append; a fourth drops the oldest.
  var axisOrder = ["spread", "arm", "stem"];
  var locks = {};
  var frozenRadius = null;
  var frozenCorners = null;
  PARAMS.forEach(function (item) { locks[item.key] = false; });

  var numFields = ["arm", "spread", "length", "stem", "offset", "page", "jump"];
  var ranges = { arm: "arm-range", spread: "spread-range", length: "length-range", stem: "stem-range", offset: "offset-range" };
  var last = {
    arm: 30,
    spread: 4.5,
    length: 440,
    stem: 440,
    offset: 0,
    radius: 34.5,
    "arm-start": 20,
    "arm-end": 40,
    "arm-step": 2,
    "spread-start": 2,
    "spread-end": 7,
    "spread-step": 0.5,
    "length-start": 330,
    "length-end": 550,
    "length-step": 22,
    "stem-start": 330,
    "stem-end": 550,
    "stem-step": 22,
    "offset-start": 0,
    "offset-end": 80,
    "offset-step": 8,
    "radius-start": 15,
    "radius-end": 55,
    "radius-step": 4,
    page: 1,
    jump: 1
  };

  var CORNER_LABELS = {
    tipL: "LEFT TIP",
    cutLU: "LEFT TIP UPPER",
    cutLL: "LEFT TIP LOWER",
    crotch: "CROTCH",
    tipR: "RIGHT TIP",
    cutRU: "RIGHT TIP UPPER",
    cutRL: "RIGHT TIP LOWER",
    shR: "RIGHT SHOULDER",
    tipB: "BOTTOM TIP",
    cutBR: "BASE RIGHT",
    cutBL: "BASE LEFT",
    shL: "LEFT SHOULDER"
  };
  var DISPLAY_ORDER = ["tipL", "cutLU", "cutLL", "crotch", "tipR", "cutRU", "cutRL", "shR", "tipB", "cutBR", "cutBL", "shL"];
  var cornerFollow = {};
  var cornerValue = {};
  Object.keys(CORNER_LABELS).forEach(function (id) { cornerFollow[id] = true; });
  var radiusFollow = true;
  var cornerListKey = "";

  var layers = {};
  document.querySelectorAll("[data-layer]").forEach(function (box) {
    layers[box.getAttribute("data-layer")] = box;
    box.addEventListener("change", function () {
      syncMaster();
      draw();
    });
  });

  document.getElementById("guides-all").addEventListener("change", function (event) {
    Object.keys(layers).forEach(function (key) {
      layers[key].checked = event.target.checked;
    });
    event.target.indeterminate = false;
    draw();
  });

  numFields.forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
      if (locks[id]) {
        var item = paramByKey(id);
        document.getElementById(id).value = format(last[id], item ? item.digits : 0);
        return;
      }
      var rangeId = ranges[id];
      if (rangeId) document.getElementById(rangeId).value = document.getElementById(id).value;
      draw();
    });
  });

  Object.keys(ranges).forEach(function (id) {
    document.getElementById(ranges[id]).addEventListener("input", function (event) {
      if (locks[id]) {
        event.target.value = String(last[id]);
        return;
      }
      document.getElementById(id).value = event.target.value;
      draw();
    });
  });

  function fitRange(id, value) {
    var slider = document.getElementById(id);
    if (!slider || !Number.isFinite(value)) return;
    if (value > parseFloat(slider.max)) slider.max = String(Math.ceil(value));
  }

  function cornerRequested(id, jointR) {
    if (cornerFollow[id] !== false || !Number.isFinite(cornerValue[id])) return jointR;
    return Math.max(0, cornerValue[id]);
  }

  function applyMaster(value, fromSlider) {
    if (locks.radius) return;
    radiusFollow = false;
    last.radius = Math.max(0, value);
    fitRange("radius-range", last.radius);
    var slider = document.getElementById("radius-range");
    if (slider) slider.value = String(last.radius);
    if (fromSlider) {
      var num = document.getElementById("radius");
      if (num) num.value = slider ? slider.value : String(last.radius);
    }
    Object.keys(CORNER_LABELS).forEach(function (id) {
      cornerFollow[id] = false;
      cornerValue[id] = last.radius;
    });
  }

  function trackJoint() {
    if (locks.radius) return;
    radiusFollow = true;
    Object.keys(CORNER_LABELS).forEach(function (id) { cornerFollow[id] = true; });
  }

  function renderCornerFields(ids) {
    var ordered = DISPLAY_ORDER.filter(function (id) { return ids.indexOf(id) !== -1; });
    var key = ordered.join(",");
    if (key === cornerListKey) return;
    cornerListKey = key;
    var host = document.getElementById("corners");
    if (!host) return;
    host.replaceChildren();
    ordered.forEach(function (id) {
      var label = document.createElement("label");
      label.className = "field-row";
      label.htmlFor = "corner-" + id;
      var span = document.createElement("span");
      span.textContent = CORNER_LABELS[id];
      var input = document.createElement("input");
      input.id = "corner-" + id;
      input.type = "number";
      input.min = "0";
      input.max = "2000";
      input.step = "0.1";
      input.setAttribute("autocomplete", "off");
      input.setAttribute("aria-label", CORNER_LABELS[id] + " radius");
      input.value = locks.radius && frozenCorners && Number.isFinite(frozenCorners[id])
        ? format(frozenCorners[id], 1)
        : (cornerFollow[id] === false ? format(cornerValue[id] || 0, 1) : "");
      if (locks.radius) input.disabled = true;
      label.appendChild(span);
      label.appendChild(input);
      host.appendChild(label);
    });
    host.classList.toggle("is-locked", !!locks.radius);
  }

  function syncTrackedRadii(joint) {
    var shown = format(joint, 1);
    var radiusNum = document.getElementById("radius");
    var radiusSlider = document.getElementById("radius-range");
    var trackBtn = document.getElementById("radius-track");
    if (trackBtn) trackBtn.setAttribute("aria-pressed", radiusFollow ? "true" : "false");
    if (locks.radius) {
      var held = format(frozenRadius != null ? frozenRadius : last.radius, 1);
      if (radiusNum) radiusNum.value = held;
      if (radiusSlider) radiusSlider.value = held;
      document.querySelectorAll("#corners input").forEach(function (input) {
        var id = input.id.replace(/^corner-/, "");
        input.disabled = true;
        if (frozenCorners && Number.isFinite(frozenCorners[id])) input.value = format(frozenCorners[id], 1);
      });
      return;
    }
    if (radiusFollow) {
      fitRange("radius-range", parseFloat(shown));
      if (radiusNum) radiusNum.value = shown;
      if (radiusSlider) radiusSlider.value = shown;
      last.radius = parseFloat(shown);
    }
    document.querySelectorAll("#corners input").forEach(function (input) {
      var id = input.id.replace(/^corner-/, "");
      if (cornerFollow[id] !== false) input.value = shown;
      else if (document.activeElement !== input) input.value = format(cornerValue[id] || 0, 1);
    });
  }

  var cornersHost = document.getElementById("corners");
  if (cornersHost) {
    cornersHost.addEventListener("input", function (event) {
      var input = event.target;
      if (!input.id || input.id.indexOf("corner-") !== 0) return;
      if (locks.radius) return;
      var id = input.id.replace(/^corner-/, "");
      if (input.value.trim() === "") {
        cornerFollow[id] = true;
      } else {
        var value = parseFloat(input.value);
        if (Number.isFinite(value)) {
          cornerFollow[id] = false;
          cornerValue[id] = Math.max(0, value);
        }
      }
      draw();
    });
  }

  var radiusNum = document.getElementById("radius");
  var radiusSlider = document.getElementById("radius-range");
  var radiusTrack = document.getElementById("radius-track");
  if (radiusNum) {
    radiusNum.addEventListener("input", function () {
      if (locks.radius) return;
      if (radiusNum.value.trim() === "") trackJoint();
      else {
        var value = parseFloat(radiusNum.value);
        if (Number.isFinite(value)) applyMaster(value, false);
      }
      draw();
    });
  }
  if (radiusSlider) {
    radiusSlider.addEventListener("input", function () {
      if (locks.radius) return;
      applyMaster(parseFloat(radiusSlider.value) || 0, true);
      draw();
    });
  }
  if (radiusTrack) {
    radiusTrack.addEventListener("click", function () {
      if (locks.radius) return;
      trackJoint();
      draw();
    });
  }

  discoverExtraParams();
  bindSheetRanges();
  document.querySelectorAll("[data-iter]").forEach(function (box) {
    box.checked = axisOrder.indexOf(box.getAttribute("data-iter")) !== -1;
    box.addEventListener("change", onIterToggle);
  });

  document.getElementById("view-grid").addEventListener("click", function () { setMode("grid"); });
  document.getElementById("view-sheet").addEventListener("click", function () { setMode("sheet"); });
  document.getElementById("theme-light").addEventListener("click", function () {
    useTheme("light", true);
    draw();
  });
  document.getElementById("theme-dark").addEventListener("click", function () {
    useTheme("dark", true);
    draw();
  });
  document.getElementById("shape").addEventListener("click", function () {
    shapeOnly = !shapeOnly;
    document.getElementById("shape").setAttribute("aria-pressed", shapeOnly ? "true" : "false");
    draw();
  });
  document.getElementById("page-prev").addEventListener("click", function () { stepPage(-1); });
  document.getElementById("page-next").addEventListener("click", function () { stepPage(1); });
  document.getElementById("jump-go").addEventListener("click", function () { singleOut(readNum("jump")); });
  document.getElementById("open-picked").addEventListener("click", openPicked);
  document.getElementById("clear-picked").addEventListener("click", function () {
    picked = [];
    active = 0;
    draw();
  });
  document.getElementById("export-svg").addEventListener("click", exportViewSvg);
  document.getElementById("export-pdf").addEventListener("click", exportViewPdf);
  document.getElementById("export-all").addEventListener("click", exportAllPdf);
  document.getElementById("export-picked-svg").addEventListener("click", exportPickedSvg);
  document.getElementById("export-picked-pdf").addEventListener("click", exportPickedPdf);

  stage.addEventListener("click", function (event) {
    var cell = event.target.closest("[data-shape]");
    if (!cell) return;
    var n = parseInt(cell.getAttribute("data-shape"), 10);
    if (event.shiftKey) {
      var at = picked.indexOf(n);
      if (at === -1) picked.push(n);
      else picked.splice(at, 1);
    } else {
      picked = [n];
    }
    active = n;
    document.getElementById("jump").value = String(n);
    last.jump = n;
    draw();
  });

  initLocks();
  draw();

  function loadLocks() {
    try {
      var saved = JSON.parse(localStorage.getItem("y-grid-locks") || "{}");
      PARAMS.forEach(function (item) {
        if (saved && saved[item.key]) locks[item.key] = true;
      });
    } catch (err) {}
  }

  function persistLocks() {
    try { localStorage.setItem("y-grid-locks", JSON.stringify(locks)); } catch (err) {}
  }

  function captureRadiusFreeze() {
    var live = params();
    var joint = live.length * Math.sin(live.spread * Math.PI / 180);
    frozenRadius = live.radius;
    last.radius = live.radius;
    frozenCorners = {};
    Object.keys(CORNER_LABELS).forEach(function (id) {
      frozenCorners[id] = cornerRequested(id, joint);
    });
    var shown = format(frozenRadius, 1);
    var radiusNum = document.getElementById("radius");
    var radiusSlider = document.getElementById("radius-range");
    if (radiusNum) radiusNum.value = shown;
    if (radiusSlider) {
      fitRange("radius-range", frozenRadius);
      radiusSlider.value = shown;
    }
    document.querySelectorAll("#corners input").forEach(function (input) {
      var id = input.id.replace(/^corner-/, "");
      if (Number.isFinite(frozenCorners[id])) input.value = format(frozenCorners[id], 1);
    });
  }

  function releaseAxis(key) {
    axisOrder = axisOrder.filter(function (item) { return item !== key; });
    var box = document.getElementById("iter-" + key);
    if (box) box.checked = false;
  }

  function releaseInterp(key) {
    if (typeof interpOrder !== "undefined" && interpOrder) {
      interpOrder = interpOrder.filter(function (item) { return item !== key; });
    }
    var box = document.getElementById("interp-" + key);
    if (box) box.checked = false;
  }

  function enforceLocks() {
    axisOrder = axisOrder.filter(function (key) { return !locks[key]; });
    if (typeof interpOrder !== "undefined" && interpOrder) {
      interpOrder = interpOrder.filter(function (key) { return !locks[key]; });
    }
    PARAMS.forEach(function (item) {
      if (!locks[item.key]) return;
      var box = document.getElementById("iter-" + item.key);
      if (box) box.checked = false;
      var interp = document.getElementById("interp-" + item.key);
      if (interp) interp.checked = false;
    });
  }

  function applyLockChrome(key) {
    var on = !!locks[key];
    var btn = document.querySelector('[data-lock="' + key + '"]');
    if (btn) btn.setAttribute("aria-pressed", on ? "true" : "false");
    var param = document.querySelector('.param[data-param="' + key + '"]');
    if (param) param.classList.toggle("is-locked", on);
    var num = document.getElementById(key);
    var range = document.getElementById(key + "-range");
    if (num) num.disabled = on;
    if (range) range.disabled = on;
    var iterBox = document.getElementById("iter-" + key);
    if (iterBox) {
      var iter = iterBox.closest(".iter-row");
      if (iter) iter.classList.toggle("is-locked", on);
      iterBox.disabled = on;
      if (on) iterBox.checked = false;
    }
    ["start", "end", "step"].forEach(function (part) {
      var node = document.getElementById(key + "-" + part);
      if (node) node.disabled = on;
    });
    var iterRange = document.getElementById("iter-" + key + "-range");
    if (iterRange) iterRange.hidden = on ? false : axisOrder.indexOf(key) === -1;
    var interp = document.getElementById("interp-" + key);
    if (interp) {
      var line = interp.closest(".interp-line");
      if (line) line.classList.toggle("is-locked", on);
      interp.disabled = on;
      if (on) interp.checked = false;
    }
    var step = document.getElementById("interp-" + key + "-step");
    if (step) step.disabled = on;
    if (key === "radius") {
      var corners = document.getElementById("corners");
      if (corners) {
        corners.classList.toggle("is-locked", on);
        corners.querySelectorAll("input").forEach(function (input) { input.disabled = on; });
      }
      var track = document.getElementById("radius-track");
      if (track) track.disabled = on;
    }
  }

  function setLocked(key, on, silent) {
    if (!paramByKey(key)) return;
    if (on && key === "radius") captureRadiusFreeze();
    locks[key] = !!on;
    if (!on && key === "radius") {
      frozenRadius = null;
      frozenCorners = null;
    }
    if (on) {
      releaseAxis(key);
      releaseInterp(key);
    }
    applyLockChrome(key);
    persistLocks();
    if (!silent) draw();
  }

  function initLocks() {
    loadLocks();
    document.querySelectorAll("[data-lock]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-lock");
        setLocked(key, !locks[key]);
      });
    });
    PARAMS.forEach(function (item) {
      if (locks[item.key]) setLocked(item.key, true, true);
      else applyLockChrome(item.key);
    });
  }

  function setMode(next) {
    mode = next;
    var sheet = next === "sheet";
    document.getElementById("view-grid").setAttribute("aria-pressed", sheet ? "false" : "true");
    document.getElementById("view-sheet").setAttribute("aria-pressed", sheet ? "true" : "false");
    document.getElementById("sheet-controls").hidden = !sheet;
    var columns = document.getElementById("columns");
    if (columns) columns.classList.toggle("sheet-open", sheet);
    var gridExports = document.getElementById("grid-exports");
    var sheetExports = document.getElementById("sheet-exports");
    var exportSvg = document.getElementById("export-svg");
    var exportPdf = document.getElementById("export-pdf");
    var exportAll = document.getElementById("export-all");
    if (sheet && sheetExports) {
      exportSvg.textContent = "EXPORT PAGE SVG";
      exportPdf.textContent = "EXPORT PAGE PDF";
      sheetExports.insertBefore(exportPdf, exportAll);
      sheetExports.insertBefore(exportSvg, exportPdf);
      exportAll.hidden = false;
    } else if (gridExports) {
      exportSvg.textContent = "EXPORT SVG";
      exportPdf.textContent = "EXPORT PDF";
      gridExports.appendChild(exportSvg);
      gridExports.appendChild(exportPdf);
      exportAll.hidden = true;
    }
    document.getElementById("mast-note").textContent = sheet ? "SHEET  1000" : "CONSTRUCTION";
    field.classList.toggle("sheet", sheet);
    stage.setAttribute("aria-label", sheet ? "Y sheet" : "Y construction");
    draw();
  }

  function stepPage(dir) {
    var page = clamp(Math.round(readNum("page")) + dir, 1, sheetPages());
    document.getElementById("page").value = String(page);
    last.page = page;
    draw();
  }

  function readNum(id) {
    var node = document.getElementById(id);
    if (!node) return last[id];
    var value = parseFloat(node.value);
    if (Number.isFinite(value)) last[id] = value;
    return last[id];
  }

  function params() {
    var p = {
      arm: readNum("arm"),
      spread: readNum("spread"),
      length: Math.max(1, readNum("length")),
      stem: Math.max(1, readNum("stem")),
    };
    PARAMS.forEach(function (item) {
      if (p[item.key] == null || !Number.isFinite(p[item.key])) p[item.key] = readNum(item.key);
    });
    p.offset = Math.max(0, p.offset || 0);
    if (locks.radius && frozenRadius != null) p.radius = frozenRadius;
    else if (radiusFollow) p.radius = p.length * Math.sin(p.spread * Math.PI / 180);
    else p.radius = Math.max(0, last.radius);
    return p;
  }

  function layerOn(name) {
    return !shapeOnly && layers[name] && layers[name].checked;
  }

  function syncMaster() {
    var boxes = Object.keys(layers).map(function (key) { return layers[key]; });
    var on = boxes.filter(function (box) { return box.checked; }).length;
    var master = document.getElementById("guides-all");
    master.checked = on === boxes.length;
    master.indeterminate = on > 0 && on < boxes.length;
  }

  function draw() {
    enforceLocks();
    var p = params();
    var jointShown = p.length * Math.sin(p.spread * Math.PI / 180);
    document.getElementById("joint-readout").textContent = "JOINT " + format(jointShown, 1);
    fitRange("offset-range", p.offset);
    var preview = geometry(p);
    if (preview) {
      renderCornerFields(preview.cornerIds);
      if (mode !== "sheet") lastGood = preview;
    }
    syncTrackedRadii(jointShown);
    stage.replaceChildren();
    if (mode === "sheet") {
      var metrics = sheetMetrics(p);
      refreshSheetChrome(metrics);
      stage.setAttribute("viewBox", "0 0 " + round(PAGE_W) + " " + round(PAGE_H));
      paintSheet(svgPainter(stage), pageIndex(), metrics);
      updatePicked(p, metrics);
      return;
    }
    var g = preview || lastGood;
    if (!g) return;
    lastGood = g;
    var box = frameOf(g);
    stage.setAttribute("viewBox", box.view);
    var root = svgEl("g");
    root.setAttribute("transform", "scale(1 -1)");
    stage.appendChild(root);
    paintConstruction(svgPainter(root), g, { hair: false, shapeBlack: shapeOnly });
    updatePicked(p);
  }

  function frameOf(g) {
    var pts = (g.samples || g.poly).slice();
    if (!shapeOnly) pts = pts.concat(g.guidePts);
    var b = bounds(pts);
    var span = Math.max(b.maxX - b.minX, b.maxY - b.minY, 1);
    var pad = span * 0.12;
    var x = b.minX - pad;
    var y = -(b.maxY + pad);
    var w = b.maxX - b.minX + pad * 2;
    var h = b.maxY - b.minY + pad * 2;
    return { view: round(x) + " " + round(y) + " " + round(w) + " " + round(h), w: w, h: h, x: x, yTop: b.maxY + pad, minX: b.minX, minY: b.minY, maxX: b.maxX, maxY: b.maxY };
  }

  // The six edge lines are the letter. Each edge passes through a tip
  // and sits `spread` degrees off that limb's centerline, so one circle
  // at the joint is tangent to the arm edges.
  function geometry(p) {
    var arm = clamp(p.arm, 8, 80) * Math.PI / 180;
    var spread = clamp(p.spread, 0.3, 20) * Math.PI / 180;
    if (spread >= arm - 0.01) return null;
    var length = p.length;
    var stem = p.stem;
    var leftTip = polar(Math.PI - arm, length);
    var rightTip = polar(arm, length);
    var bottomTip = polar(-Math.PI / 2, stem);
    var leftUpper = lineThrough(leftTip, Math.PI - arm + spread);
    var leftLower = lineThrough(leftTip, Math.PI - arm - spread);
    var rightUpper = lineThrough(rightTip, arm - spread);
    var rightLower = lineThrough(rightTip, arm + spread);
    var stemLeft = lineThrough(bottomTip, -Math.PI / 2 + spread);
    var stemRight = lineThrough(bottomTip, -Math.PI / 2 - spread);
    var crotch = intersect(leftUpper, rightUpper);
    var leftShoulder = intersect(leftLower, stemLeft);
    var rightShoulder = intersect(rightLower, stemRight);
    if (!crotch || !leftShoulder || !rightShoulder) return null;
    if (!(crotch.y < leftTip.y - length * 0.02)) return null;
    if (!(leftShoulder.x < -length * 0.002 && rightShoulder.x > length * 0.002)) return null;
    if (!(leftShoulder.y > bottomTip.y + stem * 0.04 && rightShoulder.y > bottomTip.y + stem * 0.04)) return null;
    if (!(leftShoulder.y < crotch.y && rightShoulder.y < crotch.y)) return null;
    var poly = [leftTip, crotch, rightTip, rightShoulder, bottomTip, leftShoulder];
    var edges = [
      [leftTip, crotch],
      [crotch, rightTip],
      [rightTip, rightShoulder],
      [rightShoulder, bottomTip],
      [bottomTip, leftShoulder],
      [leftShoulder, leftTip]
    ];
    var guidePts = [];
    edges.forEach(function (edge) {
      var grown = extend(edge[0], edge[1], 0.14);
      guidePts.push(grown[0], grown[1]);
    });
    var jointR = length * Math.sin(spread);
    var built = buildOutline(p, {
      leftTip: leftTip,
      rightTip: rightTip,
      bottomTip: bottomTip,
      crotch: crotch,
      leftShoulder: leftShoulder,
      rightShoulder: rightShoulder,
      leftUpper: leftUpper,
      leftLower: leftLower,
      rightUpper: rightUpper,
      rightLower: rightLower,
      stemLeft: stemLeft,
      stemRight: stemRight,
      leftDir: { x: Math.cos(Math.PI - arm), y: Math.sin(Math.PI - arm) },
      rightDir: { x: Math.cos(arm), y: Math.sin(arm) },
      stemDir: { x: Math.cos(-Math.PI / 2), y: Math.sin(-Math.PI / 2) },
      spread: spread,
      jointR: jointR
    });
    built.cuts.forEach(function (seg) {
      var grown = extend(seg[0], seg[1], 1.1);
      guidePts.push(grown[0], grown[1]);
    });
    built.circles.forEach(function (circle) {
      guidePts.push(
        { x: circle.c.x + circle.r, y: circle.c.y },
        { x: circle.c.x - circle.r, y: circle.c.y },
        { x: circle.c.x, y: circle.c.y + circle.r },
        { x: circle.c.x, y: circle.c.y - circle.r }
      );
    });
    var arms = [
      axis(Math.PI - arm, length, jointR * 1.7, RAY_OUT),
      axis(arm, length, jointR * 1.7, RAY_OUT)
    ];
    var stemAxis = axis(-Math.PI / 2, stem, jointR * 0.8, 1.03);
    arms.forEach(function (item) { guidePts.push(item.near, item.far); });
    guidePts.push(stemAxis.near, stemAxis.far);
    return {
      poly: poly,
      edges: edges,
      cuts: built.cuts,
      circles: built.circles,
      cornerIds: built.ids,
      arms: arms,
      stemAxis: stemAxis,
      leftTip: leftTip,
      rightTip: rightTip,
      bottomTip: bottomTip,
      jointR: jointR,
      shape: built.cmds,
      samples: built.samples,
      guidePts: guidePts,
      length: length,
      stem: stem
    };
  }

  // Offset is measured back from each tip along that limb's centerline.
  // The cut is the perpendicular through that station, and it stops short
  // of the crotch and the shoulders.
  function buildOutline(p, src) {
    var requested = Math.max(0, p.offset || 0);
    var leftOff = Math.min(requested, offsetCap(src.leftTip, src.crotch, src.leftShoulder, src.spread));
    var rightOff = Math.min(requested, offsetCap(src.rightTip, src.crotch, src.rightShoulder, src.spread));
    var baseOff = Math.min(requested, offsetCap(src.bottomTip, src.leftShoulder, src.rightShoulder, src.spread));
    var left = tipCut(src.leftTip, src.leftDir, src.leftUpper, src.leftLower, leftOff, src.crotch, src.leftShoulder);
    var right = tipCut(src.rightTip, src.rightDir, src.rightUpper, src.rightLower, rightOff, src.crotch, src.rightShoulder);
    var base = tipCut(src.bottomTip, src.stemDir, src.stemRight, src.stemLeft, baseOff, src.rightShoulder, src.leftShoulder);
    var poly = [];
    var ids = [];
    var cuts = [];
    if (left) {
      poly.push(left.a);
      ids.push("cutLU");
      cuts.push([left.a, left.b]);
    } else {
      poly.push(src.leftTip);
      ids.push("tipL");
    }
    poly.push(src.crotch);
    ids.push("crotch");
    if (right) {
      poly.push(right.a);
      ids.push("cutRU");
      poly.push(right.b);
      ids.push("cutRL");
      cuts.push([right.a, right.b]);
    } else {
      poly.push(src.rightTip);
      ids.push("tipR");
    }
    poly.push(src.rightShoulder);
    ids.push("shR");
    if (base) {
      poly.push(base.a);
      ids.push("cutBR");
      poly.push(base.b);
      ids.push("cutBL");
      cuts.push([base.a, base.b]);
    } else {
      poly.push(src.bottomTip);
      ids.push("tipB");
    }
    poly.push(src.leftShoulder);
    ids.push("shL");
    if (left) {
      poly.push(left.b);
      ids.push("cutLL");
    }
    var driven = !!p.radiusDriven && Number.isFinite(p.radius) && !locks.radius;
    var asks = ids.map(function (id) {
      if (locks.radius && frozenCorners && Number.isFinite(frozenCorners[id])) {
        return { r: frozenCorners[id], follow: false };
      }
      if (driven) return { r: Math.max(0, p.radius), follow: false };
      return { r: cornerRequested(id, src.jointR), follow: cornerFollow[id] !== false };
    });
    var shaped = filletPolygon(poly, asks);
    return {
      ids: ids,
      cuts: cuts,
      cmds: shaped.cmds,
      samples: shaped.samples,
      circles: shaped.circles
    };
  }

  function offsetCap(tip, cornerA, cornerB, spread) {
    var reach = 0.7 * Math.min(Math.hypot(tip.x - cornerA.x, tip.y - cornerA.y), Math.hypot(tip.x - cornerB.x, tip.y - cornerB.y));
    return Math.max(0, reach * Math.cos(spread));
  }

  function tipCut(tip, dir, lineA, lineB, off, cornerA, cornerB) {
    if (!(off > 0.05)) return null;
    var station = { x: tip.x - dir.x * off, y: tip.y - dir.y * off };
    var cutLine = { p: station, d: { x: -dir.y, y: dir.x } };
    var a = intersect(cutLine, lineA);
    var b = intersect(cutLine, lineB);
    if (!onSegment(tip, a, cornerA) || !onSegment(tip, b, cornerB)) return null;
    return { a: a, b: b };
  }

  function onSegment(tip, hit, corner) {
    if (!hit || !corner) return false;
    var span = Math.hypot(corner.x - tip.x, corner.y - tip.y);
    var along = Math.hypot(hit.x - tip.x, hit.y - tip.y);
    var rest = Math.hypot(hit.x - corner.x, hit.y - corner.y);
    return along > 0.05 && Math.abs(along + rest - span) < span * 0.02 + 0.05;
  }

  function filletPolygon(poly, asks) {
    var n = poly.length;
    var cuts = [];
    var circles = [];
    for (var i = 0; i < n; i++) {
      var prev = poly[(i - 1 + n) % n];
      var next = poly[(i + 1) % n];
      var ask = asks[i];
      var cut = null;
      if (ask && ask.r > 0 && (!ask.follow || radiusFits(prev, poly[i], next, ask.r))) {
        cut = cornerFillet(prev, poly[i], next, ask.r);
      }
      cuts.push(cut);
      if (cut) circles.push({ c: cut.c, r: cut.r });
    }
    var cmds = [];
    var samples = [];
    function addLine(p) {
      cmds.push({ t: cmds.length ? "L" : "M", x: p.x, y: p.y });
      samples.push(p);
    }
    function addArc(cut) {
      arcCubics(cut.c, cut.r, cut.a1, cut.a2, cut.ccw).forEach(function (curve) {
        cmds.push(curve);
        samples.push({ x: curve.x, y: curve.y });
        samples.push(arcPoint(cut.c, cut.r, curve.a0, curve.a1, 0.5));
      });
    }
    addLine(cuts[0] ? cuts[0].t2 : poly[0]);
    for (var k = 1; k < n; k++) {
      if (cuts[k]) {
        addLine(cuts[k].t1);
        addArc(cuts[k]);
      } else {
        addLine(poly[k]);
      }
    }
    if (cuts[0]) {
      addLine(cuts[0].t1);
      addArc(cuts[0]);
    }
    return { cmds: cmds, samples: samples, circles: circles };
  }

  // A tracked joint radius that cannot sit on the corner stays sharp.
  // An edited radius is clamped to about 45% of either adjacent edge.
  function radiusFits(A, V, B, R) {
    var lu = Math.hypot(A.x - V.x, A.y - V.y);
    var lw = Math.hypot(B.x - V.x, B.y - V.y);
    if (lu < 1e-6 || lw < 1e-6) return false;
    var cos = clamp(((A.x - V.x) / lu) * ((B.x - V.x) / lw) + ((A.y - V.y) / lu) * ((B.y - V.y) / lw), -1, 1);
    var theta = Math.acos(cos);
    if (theta < 0.02 || Math.PI - theta < 0.004) return false;
    var tanHalf = Math.tan(theta / 2);
    if (!(tanHalf > 1e-6)) return false;
    return R / tanHalf <= 0.45 * Math.min(lu, lw) + 1e-6;
  }

  function cornerFillet(A, V, B, R) {
    var ux = A.x - V.x;
    var uy = A.y - V.y;
    var wx = B.x - V.x;
    var wy = B.y - V.y;
    var lu = Math.hypot(ux, uy);
    var lw = Math.hypot(wx, wy);
    if (lu < 1e-6 || lw < 1e-6) return null;
    ux /= lu;
    uy /= lu;
    wx /= lw;
    wy /= lw;
    var cos = clamp(ux * wx + uy * wy, -1, 1);
    var theta = Math.acos(cos);
    if (theta < 0.02 || Math.PI - theta < 0.004) return null;
    var tanHalf = Math.tan(theta / 2);
    if (!(tanHalf > 1e-6)) return null;
    var t = R / tanHalf;
    var maxT = 0.45 * Math.min(lu, lw);
    var r = R;
    if (t > maxT) {
      t = maxT;
      r = t * tanHalf;
    }
    if (t < 1e-4 || r < 1e-4) return null;
    var bisX = ux + wx;
    var bisY = uy + wy;
    var bl = Math.hypot(bisX, bisY);
    if (bl < 1e-8) return null;
    bisX /= bl;
    bisY /= bl;
    var distC = r / Math.sin(theta / 2);
    var C = { x: V.x + bisX * distC, y: V.y + bisY * distC };
    var t1 = { x: V.x + ux * t, y: V.y + uy * t };
    var t2 = { x: V.x + wx * t, y: V.y + wy * t };
    var a1 = Math.atan2(t1.y - C.y, t1.x - C.x);
    var a2 = Math.atan2(t2.y - C.y, t2.x - C.x);
    var aV = Math.atan2(V.y - C.y, V.x - C.x);
    var ccwSpan = wrapTau(a2 - a1);
    var ccwToV = wrapTau(aV - a1);
    return { t1: t1, t2: t2, c: C, r: r, a1: a1, a2: a2, ccw: ccwToV <= ccwSpan + 1e-6 };
  }

  function wrapTau(a) {
    var turn = Math.PI * 2;
    while (a < 0) a += turn;
    while (a >= turn) a -= turn;
    return a;
  }

  function arcCubics(C, r, a1, a2, ccw) {
    var span = ccw ? wrapTau(a2 - a1) : -wrapTau(a1 - a2);
    var curves = [];
    var left = Math.abs(span);
    var dir = span >= 0 ? 1 : -1;
    var a = a1;
    while (left > 1e-6) {
      var step = Math.min(left, Math.PI / 2);
      var aNext = a + dir * step;
      curves.push(cubicArc(C, r, a, aNext));
      a = aNext;
      left -= step;
    }
    return curves;
  }

  function cubicArc(C, r, a0, a1) {
    var delta = a1 - a0;
    var k = (4 / 3) * Math.tan(delta / 4);
    var c0 = Math.cos(a0);
    var s0 = Math.sin(a0);
    var c1 = Math.cos(a1);
    var s1 = Math.sin(a1);
    return {
      t: "C",
      x1: C.x + r * (c0 - k * s0),
      y1: C.y + r * (s0 + k * c0),
      x2: C.x + r * (c1 + k * s1),
      y2: C.y + r * (s1 - k * c1),
      x: C.x + r * c1,
      y: C.y + r * s1,
      a0: a0,
      a1: a1
    };
  }

  function arcPoint(C, r, a0, a1, u) {
    var a = a0 + (a1 - a0) * u;
    return { x: C.x + r * Math.cos(a), y: C.y + r * Math.sin(a) };
  }

  function axis(angle, length, back, out) {
    var dir = { x: Math.cos(angle), y: Math.sin(angle) };
    var perp = { x: -dir.y, y: dir.x };
    return {
      near: { x: -dir.x * back, y: -dir.y * back },
      far: { x: dir.x * length * out, y: dir.y * length * out },
      tip: { x: dir.x * length, y: dir.y * length },
      dir: dir,
      perp: perp,
      length: length
    };
  }

  function paintConstruction(painter, g, opt) {
    var sw = Math.max(g.length, g.stem) * 0.0045;
    if (opt.hair) sw = 1.15;
    painter.fill(g.shape || g.poly, opt.shapeBlack ? INK : FILL);
    if (opt.shapeBlack) return;
    if (layerOn("rd")) {
      (g.circles || []).forEach(function (circle) {
        painter.circle(circle.c, circle.r, ARC, sw * 0.9, [sw * 0.7, sw * 1.15]);
      });
    }
    if (layerOn("jn")) painter.circle({ x: 0, y: 0 }, g.jointR, RED, sw * 1.05, [sw * 1.6, sw * 1.5]);
    if (layerOn("axarm")) {
      g.arms.forEach(function (item) { painter.line(item.near, item.far, AXIS, sw, [sw * 3.2, sw * 2.2]); });
    }
    if (layerOn("axstem")) painter.line(g.stemAxis.near, g.stemAxis.far, AXIS, sw, [sw * 3.2, sw * 2.2]);
    if (layerOn("tkarm")) {
      g.arms.forEach(function (item) {
        var h = item.length * TICK;
        painter.line(
          { x: item.far.x - item.perp.x * h, y: item.far.y - item.perp.y * h },
          { x: item.far.x + item.perp.x * h, y: item.far.y + item.perp.y * h },
          TICKC,
          sw,
          null
        );
      });
    }
    if (layerOn("tkbase")) {
      var bw = g.stem * BASE;
      painter.line(
        { x: g.bottomTip.x - bw, y: g.bottomTip.y },
        { x: g.bottomTip.x + bw, y: g.bottomTip.y },
        TICKC,
        sw * 1.15,
        null
      );
    }
    if (layerOn("gd")) {
      g.edges.forEach(function (edge) {
        var grown = extend(edge[0], edge[1], 0.14);
        painter.line(grown[0], grown[1], EDGE, sw, null);
      });
      (g.cuts || []).forEach(function (seg) {
        var grownCut = extend(seg[0], seg[1], 1.1);
        painter.line(grownCut[0], grownCut[1], TICKC, sw * 1.15, null);
      });
    }
  }

  function paramByKey(key) {
    for (var i = 0; i < PARAMS.length; i++) if (PARAMS[i].key === key) return PARAMS[i];
    return null;
  }

  function currentAxes() {
    return {
      col: axisOrder[0] || null,
      row: axisOrder[1] || null,
      block: axisOrder[2] || null
    };
  }

  function sheetPages() {
    return liveMetrics && liveMetrics.pages.length ? liveMetrics.pages.length : 1;
  }

  function bindSheetRanges() {
    PARAMS.forEach(function (item) {
      ["start", "end", "step"].forEach(function (part) {
        var node = document.getElementById(item.key + "-" + part);
        if (!node || node.getAttribute("data-bound") === "1") return;
        node.setAttribute("data-bound", "1");
        node.addEventListener("input", function () { draw(); });
      });
    });
  }

  function discoverExtraParams() {
    ["offset", "radius"].forEach(function (id) {
      var input = document.getElementById(id);
      if (!input || input.type === "checkbox" || input.type === "radio") return;
      if (PARAMS.some(function (item) { return item.key === id; })) return;
      var lo = parseFloat(input.min);
      var hi = parseFloat(input.max);
      if (!Number.isFinite(lo)) lo = 0;
      if (!Number.isFinite(hi) || hi <= lo) hi = lo + 100;
      var stepAttr = input.getAttribute("step") || "0.1";
      var digits = String(stepAttr).indexOf(".") === -1 ? 0 : 1;
      PARAMS.push({ key: id, label: id.toUpperCase(), lo: lo, hi: hi, digits: digits });
      if (!Number.isFinite(last[id])) last[id] = parseFloat(input.value) || lo;
      if (document.getElementById(id + "-start")) return;
      var current = Number.isFinite(last[id]) ? last[id] : lo;
      var width = Math.max((hi - lo) * 0.2, digits === 0 ? 10 : 1);
      var start = current - width / 2;
      var end = current + width / 2;
      var step = digits === 0 ? Math.max(1, Math.round((end - start) / 10)) : Math.max(0.1, Math.round(((end - start) / 10) * 10) / 10);
      var row = document.createElement("div");
      row.className = "iter-row";
      row.innerHTML =
        '<div class="iter-head"><label class="iter-name"><input type="checkbox" id="iter-' + id + '" data-iter="' + id + '" aria-label="Iterate ' + id + '"><span>' + id.toUpperCase() + "</span></label>" +
        '<span class="iter-role" id="iter-' + id + '-role"></span></div>' +
        '<div class="iter-range" id="iter-' + id + '-range" hidden>' +
        '<label for="' + id + '-start">START<input id="' + id + '-start" type="number" step="any" value="' + start + '" autocomplete="off"></label>' +
        '<label for="' + id + '-end">END<input id="' + id + '-end" type="number" step="any" value="' + end + '" autocomplete="off"></label>' +
        '<label for="' + id + '-step">STEP<input id="' + id + '-step" type="number" step="any" value="' + step + '" autocomplete="off"></label>' +
        '<span class="iter-count" id="' + id + '-count">' + sequenceCount(start, end, step) + "</span></div>";
      var host = document.getElementById("iters");
      if (host) host.appendChild(row);
      last[id + "-start"] = start;
      last[id + "-end"] = end;
      last[id + "-step"] = step;
    });
    bindSheetRanges();
  }

  function onIterToggle(event) {
    var key = event.target.getAttribute("data-iter");
    if (locks[key]) {
      event.target.checked = false;
      releaseAxis(key);
      applyLockChrome(key);
      draw();
      return;
    }
    var limit = document.getElementById("sheet-limit");
    if (event.target.checked) {
      if (axisOrder.indexOf(key) === -1) {
        if (axisOrder.length >= 3) {
          var dropped = axisOrder.shift();
          var droppedBox = document.querySelector('[data-iter="' + dropped + '"]');
          if (droppedBox) droppedBox.checked = false;
          var droppedParam = paramByKey(dropped);
          if (limit) {
            limit.hidden = false;
            limit.textContent = (droppedParam ? droppedParam.label : dropped) + " turned off. Three axes only.";
          }
        } else if (limit) {
          limit.hidden = true;
          limit.textContent = "";
        }
        axisOrder.push(key);
      }
    } else {
      axisOrder = axisOrder.filter(function (item) { return item !== key; });
      if (limit) {
        limit.hidden = true;
        limit.textContent = "";
      }
    }
    draw();
  }

  function endSlack(end, step) {
    return Math.max(Math.abs(step) * 1e-8, Math.abs(end) * 1e-9, 1e-9);
  }

  function sequenceCount(start, end, step) {
    if (!(step > 0) || !Number.isFinite(start) || !Number.isFinite(end)) return 0;
    if (end < start) {
      var swap = start;
      start = end;
      end = swap;
    }
    var count = Math.floor((end - start) / step + 1e-8) + 1;
    if (!Number.isFinite(count) || count < 1) return 0;
    if (count > 1000000) return Math.round(count);
    var slack = endSlack(end, step);
    var guard = 0;
    while (count > 0 && start + (count - 1) * step > end + slack && guard < 8) {
      count -= 1;
      guard += 1;
    }
    guard = 0;
    while (start + count * step <= end + slack && guard < 8) {
      count += 1;
      guard += 1;
    }
    return count;
  }

  function buildSeries(start, end, step) {
    var count = sequenceCount(start, end, step);
    if (!count) {
      return { start: start, end: end, step: step, values: [], count: 0, ok: false, held: true, limited: false };
    }
    if (end < start) {
      var swap = start;
      start = end;
      end = swap;
    }
    var limited = false;
    if (count > 20000) {
      var mult = Math.ceil(count / 20000);
      step = step * mult;
      count = sequenceCount(start, end, step);
      limited = true;
    }
    var values = new Array(count);
    var slack = endSlack(end, step);
    var n = 0;
    for (var i = 0; i < count; i++) {
      var value = start + i * step;
      if (value > end + slack) break;
      if (value > end) value = end;
      values[n++] = value;
    }
    values.length = n;
    return { start: start, end: end, step: step, values: values, count: values.length, ok: values.length > 0, held: false, limited: limited };
  }

  function readSeries(item) {
    var spec = buildSeries(readNum(item.key + "-start"), readNum(item.key + "-end"), readNum(item.key + "-step"));
    spec.requestedStep = readNum(item.key + "-step");
    return spec;
  }

  function capSeries(series, keys) {
    function product(mult) {
      var total = 1;
      keys.forEach(function (key) {
        var spec = series[key];
        if (!spec.ok) {
          total *= 1;
          return;
        }
        total *= Math.max(1, sequenceCount(spec.start, spec.end, spec.requestedStep * mult));
      });
      return total;
    }
    if (keys.length < 3 || product(1) <= 2000) return false;
    var lo = 1;
    var hi = 1;
    var guard = 0;
    while (product(hi) > 2000 && hi < 1e9 && guard < 80) {
      hi *= 1.5;
      guard += 1;
    }
    for (var i = 0; i < 28; i++) {
      var mid = (lo + hi) / 2;
      if (product(mid) > 2000) lo = mid;
      else hi = mid;
    }
    keys.forEach(function (key) {
      var spec = series[key];
      if (!spec.ok) return;
      var next = buildSeries(spec.start, spec.end, spec.requestedStep * hi);
      spec.start = next.start;
      spec.end = next.end;
      spec.step = next.step;
      spec.values = next.values;
      spec.count = next.count;
      spec.limited = spec.limited || next.limited;
      spec.capped = true;
    });
    return true;
  }

  function trimNum(n) {
    if (!Number.isFinite(n)) return "";
    var rounded = Math.round(n * 10000) / 10000;
    return String(rounded);
  }

  function axisPhrase(key, role, spec) {
    var name = paramByKey(key).label.toLowerCase();
    var where = role === "col" ? "columns" : role === "row" ? "rows" : "blocks";
    if (!spec || spec.held || !spec.ok) return name + ": " + where + ", step must be greater than 0";
    return name + ": " + where + ", " + trimNum(spec.start) + " to " + trimNum(spec.end) + " step " + trimNum(spec.step);
  }

  function sheetNote(metrics) {
    if (!axisOrder.length) return "No parameter iterated. One cell of the current shape.";
    if (metrics.flow === "wrap") {
      var solo = paramByKey(metrics.soloKey);
      var spec = metrics.series[metrics.soloKey];
      var name = solo.label.toLowerCase();
      var text = (!spec || spec.held || !spec.ok)
        ? name + ", step must be greater than 0."
        : name + ", " + trimNum(spec.start) + " to " + trimNum(spec.end) + " step " + trimNum(spec.step) + ".";
      if (metrics.limited) text += " A sequence longer than 20000 values was thinned.";
      var wrapPages = metrics.pages.length;
      text += " " + wrapPages + (wrapPages === 1 ? " page." : " pages.");
      return text;
    }
    var bits = [];
    ["col", "row", "block"].forEach(function (role) {
      var key = metrics.axes[role];
      if (key) bits.push(axisPhrase(key, role, metrics.series[key]));
    });
    var text = bits.join(". ") + ".";
    if (metrics.capped) text += " Steps increased so three axes stay within 2000 cells.";
    if (metrics.limited) text += " A sequence longer than 20000 values was thinned.";
    var pages = metrics.pages.length;
    text += " " + pages + (pages === 1 ? " page." : " pages.");
    return text;
  }

  function refreshSheetChrome(metrics) {
    var total = cellTotal(metrics);
    var pages = Math.max(1, metrics.pages.length);
    var pageInput = document.getElementById("page");
    var page = clamp(Math.round(readNum("page")), 1, pages);
    if (pageInput) {
      pageInput.max = String(pages);
      pageInput.value = String(page);
    }
    last.page = page;
    var readout = document.getElementById("page-readout");
    if (readout) readout.textContent = page + " / " + pages;
    var prevBtn = document.getElementById("page-prev");
    var nextBtn = document.getElementById("page-next");
    if (prevBtn) prevBtn.disabled = page <= 1;
    if (nextBtn) nextBtn.disabled = page >= pages;
    document.getElementById("jump").max = String(Math.max(1, total));
    document.getElementById("mast-note").textContent = "SHEET  " + total;
    var note = document.getElementById("sheet-note");
    if (note) note.textContent = sheetNote(metrics);
    PARAMS.forEach(function (item) {
      var role = document.getElementById("iter-" + item.key + "-role");
      if (role) {
        if (metrics.flow === "wrap") role.textContent = "";
        else {
          var at = axisOrder.indexOf(item.key);
          role.textContent = at === 0 ? "COL" : at === 1 ? "ROW" : at === 2 ? "BLK" : "";
        }
      }
      var range = document.getElementById("iter-" + item.key + "-range");
      if (range) range.hidden = !locks[item.key] && axisOrder.indexOf(item.key) === -1;
      var countEl = document.getElementById(item.key + "-count");
      if (countEl) countEl.textContent = String(sequenceCount(readNum(item.key + "-start"), readNum(item.key + "-end"), readNum(item.key + "-step")));
    });
    picked = picked.filter(function (n) { return n >= 1 && n <= total; });
    if (active > total) active = picked.length ? picked[picked.length - 1] : 0;
  }

  function specText(spec) {
    return PARAMS.map(function (item) {
      return item.label.toLowerCase() + " " + format(spec[item.key], item.digits);
    }).join("    ");
  }

  function pageIndex() {
    return clamp(Math.round(readNum("page")), 1, sheetPages()) - 1;
  }

  function inputLimit(item) {
    var node = document.getElementById(item.key);
    var lo = item.lo;
    var hi = item.hi;
    if (node) {
      var min = parseFloat(node.min);
      var max = parseFloat(node.max);
      if (Number.isFinite(min)) lo = min;
      if (Number.isFinite(max)) hi = max;
    }
    if (!(hi > lo)) hi = lo;
    return { lo: lo, hi: hi };
  }

  function instanceParams(base, colT, rowT, blockT) {
    var spec = {
      arm: base.arm,
      spread: base.spread,
      length: base.length,
      stem: base.stem
    };
    PARAMS.forEach(function (item) {
      if (spec[item.key] == null) spec[item.key] = base[item.key];
    });
    var axes = currentAxes();
    apply(axes.col, colT);
    apply(axes.row, rowT);
    apply(axes.block, blockT);
    spec.radiusDriven = !locks.radius && axisOrder.indexOf("radius") !== -1;
    return spec;

    function apply(key, value) {
      if (!key || locks[key] || value == null || !Number.isFinite(value)) return;
      var item = paramByKey(key);
      if (!item) return;
      var limit = inputLimit(item);
      spec[key] = clamp(value, limit.lo, limit.hi);
    }
  }

  function sheetMetrics(base) {
    enforceLocks();
    var axes = currentAxes();
    var series = {};
    var limited = false;
    axisOrder.forEach(function (key) {
      var spec = readSeries(paramByKey(key));
      if (!spec.ok) {
        spec.values = [base[key]];
        spec.count = 1;
        spec.held = true;
      }
      if (spec.limited) limited = true;
      series[key] = spec;
    });
    var capped = capSeries(series, axisOrder.slice());
    axisOrder.forEach(function (key) {
      if (series[key].limited) limited = true;
    });
    if (axisOrder.length === 1) return sheetMetricsWrap(base, axes, series, capped, limited);
    var cols = axes.col ? series[axes.col].values : [null];
    var rows = axes.row ? series[axes.row].values : [null];
    var blocks = axes.block ? series[axes.block].values : [null];
    var areaW = PAGE_W - 2 * MARGIN;
    var areaH = PAGE_H - 2 * MARGIN - HEADER_H;
    var titleH = axes.block ? BLOCK_TITLE_H : 0;
    var colN = Math.max(1, cols.length);
    var rowN = Math.max(1, rows.length);
    var blockN = Math.max(1, blocks.length);
    var colSlice = Math.max(1, Math.min(colN, Math.floor(areaW / MIN_CELL)));
    var rowRoom = Math.max(MIN_CELL, areaH - titleH);
    var rowSlice = Math.max(1, Math.min(rowN, Math.floor(rowRoom / MIN_CELL)));
    var capNc = Math.max(1, Math.min(colN, colSlice));
    var capNr = Math.max(1, Math.min(rowN, rowSlice));
    var capNeed = capNc * MIN_CELL;
    var capNb = Math.floor((areaW + GUTTER) / (capNeed + GUTTER));
    if (!axes.block || capNb < 1) capNb = 1;
    capNb = Math.min(capNb, blockN);
    var pageCapacity = capNc * capNr * capNb;
    var pages = [];
    for (var col0 = 0; col0 < colN; col0 += colSlice) {
      var nc = Math.min(colSlice, colN - col0);
      var need = nc * MIN_CELL;
      var nbFit = Math.floor((areaW + GUTTER) / (need + GUTTER));
      if (!axes.block || nbFit < 1) nbFit = 1;
      for (var block0 = 0; block0 < blockN; block0 += nbFit) {
        var nb = Math.min(nbFit, blockN - block0);
        var blockW = (areaW - (nb - 1) * GUTTER) / nb;
        var cellW = blockW / nc;
        for (var row0 = 0; row0 < rowN; row0 += rowSlice) {
          var nr = Math.min(rowSlice, rowN - row0);
          var cellH = (areaH - titleH) / nr;
          pages.push({
            col0: col0,
            nc: nc,
            row0: row0,
            nr: nr,
            block0: block0,
            nb: nb,
            blockW: blockW,
            cellW: cellW,
            cellH: cellH,
            titleH: titleH,
            full: nc * nr * nb === pageCapacity
          });
        }
      }
    }
    if (!pages.length) {
      pages.push({ col0: 0, nc: 1, row0: 0, nr: 1, block0: 0, nb: 1, blockW: areaW, cellW: areaW, cellH: areaH, titleH: 0, full: false });
    }
    var metrics = {
      base: base,
      axes: axes,
      series: series,
      capped: capped,
      limited: limited,
      cols: cols,
      rows: rows,
      blocks: blocks,
      pages: pages
    };
    liveMetrics = metrics;
    return metrics;
  }

  function sheetMetricsWrap(base, axes, series, capped, limited) {
    var key = axisOrder[0];
    var values = series[key].values.slice();
    if (!values.length) values = [base[key]];
    var areaW = PAGE_W - 2 * MARGIN;
    var areaH = PAGE_H - 2 * MARGIN - HEADER_H;
    var colsPer = SOLO_COLS;
    var rowsPer = SOLO_ROWS;
    var cellW = areaW / colsPer;
    var cellH = areaH / rowsPer;
    var perPage = colsPer * rowsPer;
    var pages = [];
    for (var i = 0; i < values.length; i += perPage) {
      var count = Math.min(perPage, values.length - i);
      pages.push({
        flow: "wrap",
        start: i,
        count: count,
        nc: colsPer,
        nr: Math.ceil(count / colsPer),
        cellW: cellW,
        cellH: cellH,
        full: count === perPage
      });
    }
    var metrics = {
      flow: "wrap",
      base: base,
      axes: axes,
      series: series,
      capped: capped,
      limited: limited,
      cols: values,
      rows: [null],
      blocks: [null],
      pages: pages,
      soloKey: key
    };
    liveMetrics = metrics;
    return metrics;
  }

  function cellTotal(metrics) {
    return Math.max(1, metrics.cols.length * metrics.rows.length * metrics.blocks.length);
  }

  function numberAt(c, r, b, metrics) {
    var cols = metrics.cols.length;
    var rows = metrics.rows.length;
    return b * cols * rows + r * cols + c + 1;
  }

  function locate(n, metrics) {
    if (metrics.flow === "wrap") {
      var totalWrap = cellTotal(metrics);
      if (n < 1 || n > totalWrap) return null;
      var index = n - 1;
      var wrapPage = 0;
      for (var w = 0; w < metrics.pages.length; w++) {
        var wrapSlot = metrics.pages[w];
        if (index >= wrapSlot.start && index < wrapSlot.start + wrapSlot.count) {
          wrapPage = w;
          break;
        }
      }
      return {
        page: wrapPage,
        colT: metrics.cols[index],
        rowT: null,
        blockT: null
      };
    }
    var cols = metrics.cols.length;
    var rows = metrics.rows.length;
    var total = cellTotal(metrics);
    if (n < 1 || n > total) return null;
    var left = n - 1;
    var per = cols * rows;
    var b = Math.floor(left / per);
    var rem = left % per;
    var r = Math.floor(rem / cols);
    var c = rem % cols;
    var page = 0;
    for (var i = 0; i < metrics.pages.length; i++) {
      var slot = metrics.pages[i];
      if (c >= slot.col0 && c < slot.col0 + slot.nc && r >= slot.row0 && r < slot.row0 + slot.nr && b >= slot.block0 && b < slot.block0 + slot.nb) {
        page = i;
        break;
      }
    }
    return {
      page: page,
      colT: metrics.axes.col ? metrics.cols[c] : null,
      rowT: metrics.axes.row ? metrics.rows[r] : null,
      blockT: metrics.axes.block ? metrics.blocks[b] : null
    };
  }

  function sheetHeader(index, metrics) {
    if (metrics.flow === "wrap") {
      var spec = metrics.series[metrics.soloKey];
      var name = paramByKey(metrics.soloKey).label.toLowerCase();
      var phrase = (!spec || spec.held || !spec.ok)
        ? name + ", step must be greater than 0"
        : name + ", " + trimNum(spec.start) + " to " + trimNum(spec.end) + " step " + trimNum(spec.step);
      return "Page " + (index + 1) + "/" + metrics.pages.length + "    " + phrase;
    }
    var bits = ["Page " + (index + 1) + "/" + metrics.pages.length];
    ["col", "row", "block"].forEach(function (role) {
      var key = metrics.axes[role];
      if (key) bits.push(axisPhrase(key, role, metrics.series[key]));
    });
    if (!metrics.axes.col && !metrics.axes.row && !metrics.axes.block) bits.push("current shape, no parameter iterated");
    return bits.join("    ");
  }

  function sheetSubhead(index, metrics) {
    if (!metrics.axes.col && !metrics.axes.row && !metrics.axes.block) return "held at the grid parameters";
    var page = metrics.pages[index];
    if (metrics.flow === "wrap") {
      var from = page.start + 1;
      var to = page.start + page.count;
      return from === to ? "cell " + from : "cells " + from + "–" + to;
    }
    var bits = [];
    if (metrics.axes.col) bits.push("columns " + (page.col0 + 1) + "–" + (page.col0 + page.nc));
    if (metrics.axes.row) bits.push("rows " + (page.row0 + 1) + "–" + (page.row0 + page.nr));
    if (metrics.axes.block) bits.push("blocks " + (page.block0 + 1) + "–" + (page.block0 + page.nb));
    var line = bits.join(", ");
    if (metrics.capped) line += "    steps increased to stay within 2000 cells";
    return line;
  }

  function paintSheet(painter, index, metrics) {
    if (metrics.flow === "wrap") {
      paintSheetWrap(painter, index, metrics);
      return;
    }
    var page = metrics.pages[index];
    if (!page) return;
    painter.rect(0, 0, PAGE_W, PAGE_H, PAPER);
    painter.text(sheetHeader(index, metrics), MARGIN, MARGIN + 9, 8);
    painter.text(sheetSubhead(index, metrics), MARGIN, MARGIN + 21, 8);
    var gridTop = MARGIN + HEADER_H;
    var cellsTop = gridTop + page.titleH;
    for (var bi = 0; bi < page.nb; bi++) {
      var b = page.block0 + bi;
      var blockT = metrics.axes.block ? metrics.blocks[b] : null;
      var bx = MARGIN + bi * (page.blockW + GUTTER);
      if (metrics.axes.block) {
        painter.text(paramByKey(metrics.axes.block).label.toLowerCase() + " " + trimNum(blockT), bx, gridTop + 12, 9);
      }
      for (var ri = 0; ri < page.nr; ri++) {
        var r = page.row0 + ri;
        var rowT = metrics.axes.row ? metrics.rows[r] : null;
        var cellTop = cellsTop + ri * page.cellH;
        for (var ci = 0; ci < page.nc; ci++) {
          var c = page.col0 + ci;
          var colT = metrics.axes.col ? metrics.cols[c] : null;
          var number = numberAt(c, r, b, metrics);
          var cellLeft = bx + ci * page.cellW;
          var spec = instanceParams(metrics.base, colT, rowT, blockT);
          var g = geometry(spec);
          if (g) {
            var box = bounds(g.samples || g.poly);
            var gw = Math.max(box.maxX - box.minX, 1);
            var gh = Math.max(box.maxY - box.minY, 1);
            var scale = Math.min((page.cellW * 0.74) / gw, (page.cellH * 0.62) / gh);
            painter.glyph(
              g.shape || g.poly,
              cellLeft + page.cellW / 2,
              cellTop + page.cellH / 2,
              scale,
              (box.minX + box.maxX) / 2,
              (box.minY + box.maxY) / 2
            );
          }
          painter.text(String(number), cellLeft + 2.2, cellTop + 7.4, 5.5);
          painter.cell(cellLeft, cellTop, page.cellW, page.cellH, number, picked.indexOf(number) !== -1, number === active);
        }
      }
    }
    paintFullCue(painter, index, metrics);
  }

  function paintSheetWrap(painter, index, metrics) {
    var page = metrics.pages[index];
    if (!page) return;
    painter.rect(0, 0, PAGE_W, PAGE_H, PAPER);
    painter.text(sheetHeader(index, metrics), MARGIN, MARGIN + 9, 8);
    painter.text(sheetSubhead(index, metrics), MARGIN, MARGIN + 21, 8);
    var gridTop = MARGIN + HEADER_H;
    for (var i = 0; i < page.count; i++) {
      var ci = i % page.nc;
      var ri = Math.floor(i / page.nc);
      var at = page.start + i;
      var number = at + 1;
      var cellLeft = MARGIN + ci * page.cellW;
      var cellTop = gridTop + ri * page.cellH;
      var spec = instanceParams(metrics.base, metrics.cols[at], null, null);
      var g = geometry(spec);
      if (g) {
        var box = bounds(g.samples || g.poly);
        var gw = Math.max(box.maxX - box.minX, 1);
        var gh = Math.max(box.maxY - box.minY, 1);
        var scale = Math.min((page.cellW * 0.74) / gw, (page.cellH * 0.62) / gh);
        painter.glyph(
          g.shape || g.poly,
          cellLeft + page.cellW / 2,
          cellTop + page.cellH / 2,
          scale,
          (box.minX + box.maxX) / 2,
          (box.minY + box.maxY) / 2
        );
      }
      painter.text(String(number), cellLeft + 2.2, cellTop + 7.4, 5.5);
      painter.cell(cellLeft, cellTop, page.cellW, page.cellH, number, picked.indexOf(number) !== -1, number === active);
    }
    paintFullCue(painter, index, metrics);
  }

  function paintFullCue(painter, index, metrics) {
    var page = metrics.pages[index];
    if (!page || !page.full || index >= metrics.pages.length - 1) return;
    var label = "MORE  " + (index + 1) + " / " + metrics.pages.length;
    var size = 8;
    var y = PAGE_H - 14;
    var right = PAGE_W - MARGIN;
    var labelW = label.length * size * 0.6;
    painter.line(
      { x: right - labelW - 28, y: y - size * 0.28 },
      { x: right - labelW - 8, y: y - size * 0.28 },
      INK,
      1.15,
      null
    );
    painter.text(label, right, y, size, "end");
  }

  function singleOut(n) {
    var metrics = sheetMetrics(params());
    n = clamp(Math.round(n), 1, cellTotal(metrics));
    var spot = locate(n, metrics);
    if (!spot) return;
    picked = [n];
    active = n;
    document.getElementById("jump").value = String(n);
    document.getElementById("page").value = String(spot.page + 1);
    last.page = spot.page + 1;
    last.jump = n;
    if (mode !== "sheet") setMode("sheet");
    else draw();
  }

  function updatePicked(base, metrics) {
    var has = picked.length > 0;
    ["open-picked", "export-picked-svg", "export-picked-pdf", "clear-picked"].forEach(function (id) {
      document.getElementById(id).hidden = !has || mode !== "sheet";
    });
    var meta = document.getElementById("picked-meta");
    if (mode !== "sheet") return;
    if (!has) {
      meta.textContent = "Click a cell. Shift-click adds another.";
      return;
    }
    if (!metrics) metrics = sheetMetrics(base);
    var focus = locate(active || picked[picked.length - 1], metrics);
    var spec = focus ? instanceParams(base, focus.colT, focus.rowT, focus.blockT) : null;
    var list = picked.slice().sort(function (a, b) { return a - b; }).join(", ");
    meta.textContent = (spec
      ? pad(active || picked[picked.length - 1]) + "   " + specText(spec) + "    "
      : "") + (picked.length === 1 ? "" : picked.length + " selected  " + list);
  }

  function openPicked() {
    var n = active || picked[picked.length - 1];
    var base = params();
    var spot = locate(n, sheetMetrics(base));
    if (!spot) return;
    var spec = instanceParams(base, spot.colT, spot.rowT, spot.blockT);
    PARAMS.forEach(function (item) {
      if (item.key === "radius" && axisOrder.indexOf("radius") === -1) return;
      setParam(item.key, spec[item.key]);
    });
    setMode("grid");
  }

  function setParam(id, value) {
    if (locks[id]) return;
    var item = paramByKey(id);
    var digits = item ? item.digits : (id === "stem" || id === "length" ? 0 : 1);
    var shown = format(value, digits);
    document.getElementById(id).value = shown;
    last[id] = parseFloat(shown);
    if (ranges[id]) document.getElementById(ranges[id]).value = shown;
    if (id === "offset") fitRange("offset-range", last[id]);
    if (id === "radius") applyMaster(last[id], true);
  }

  function shapeRecord(n) {
    var base = params();
    var spot = locate(n, sheetMetrics(base));
    if (!spot) return null;
    var spec = instanceParams(base, spot.colT, spot.rowT, spot.blockT);
    var g = geometry(spec);
    if (!g) return null;
    return { n: n, spec: spec, g: g, spot: spot };
  }

  function exportViewSvg() {
    if (mode === "sheet") {
      var metrics = sheetMetrics(params());
      var doc = blankSvg(PAGE_W, PAGE_H);
      paintSheet(svgPainter(doc), pageIndex(), metrics);
      download("y-sheet-p" + (pageIndex() + 1) + ".svg", serialize(doc), "image/svg+xml");
      return;
    }
    download("y-grid.svg", constructionSvg(shapeOnly), "image/svg+xml");
  }

  function exportViewPdf() {
    if (mode === "sheet") {
      var sheet = sheetMetrics(params());
      download("y-sheet-p" + (pageIndex() + 1) + ".pdf", buildPdf([sheetPage(pageIndex(), sheet)]), "application/pdf");
      return;
    }
    download("y-grid.pdf", buildPdf([constructionPage()]), "application/pdf");
  }

  function exportAllPdf() {
    var metrics = sheetMetrics(params());
    var pages = [];
    for (var i = 0; i < metrics.pages.length; i++) pages.push(sheetPage(i, metrics));
    download("y-sheet.pdf", buildPdf(pages), "application/pdf");
  }

  function exportPickedSvg() {
    var records = picked.slice().sort(function (a, b) { return a - b; }).map(shapeRecord).filter(Boolean);
    if (!records.length) return;
    if (records.length === 1) {
      download("y-" + pad(records[0].n) + ".svg", glyphSvg(records[0]), "image/svg+xml");
      return;
    }
    download("y-selected.svg", contactSvg(records), "image/svg+xml");
  }

  function exportPickedPdf() {
    var records = picked.slice().sort(function (a, b) { return a - b; }).map(shapeRecord).filter(Boolean);
    if (!records.length) return;
    download("y-selected.pdf", buildPdf(records.map(glyphPage)), "application/pdf");
  }

  function constructionSvg(black) {
    var g = geometry(params()) || lastGood;
    var box = frameOf(g);
    var doc = blankSvg(box.w, box.h);
    doc.setAttribute("viewBox", box.view);
    var parts = box.view.split(" ");
    var ground = svgEl("rect");
    ground.setAttribute("x", parts[0]);
    ground.setAttribute("y", parts[1]);
    ground.setAttribute("width", parts[2]);
    ground.setAttribute("height", parts[3]);
    ground.setAttribute("fill", PAPER);
    doc.appendChild(ground);
    var root = svgEl("g");
    root.setAttribute("transform", "scale(1 -1)");
    doc.appendChild(root);
    paintConstruction(svgPainter(root), g, { hair: false, shapeBlack: black });
    return serialize(doc);
  }

  function glyphSvg(record) {
    var b = bounds(record.g.samples || record.g.poly);
    var pad = Math.max(b.maxX - b.minX, b.maxY - b.minY) * 0.12;
    var x = b.minX - pad;
    var y = -(b.maxY + pad);
    var w = b.maxX - b.minX + pad * 2;
    var h = b.maxY - b.minY + pad * 2;
    var doc = blankSvg(w, h);
    doc.setAttribute("viewBox", round(x) + " " + round(y) + " " + round(w) + " " + round(h));
    var root = svgEl("g");
    root.setAttribute("transform", "scale(1 -1)");
    doc.appendChild(root);
    svgPainter(root).fill(record.g.shape || record.g.poly, INK);
    return serialize(doc);
  }

  function contactSvg(records) {
    var cell = 320;
    var gap = 28;
    var cols = Math.min(5, records.length);
    var rows = Math.ceil(records.length / cols);
    var w = cols * cell + (cols + 1) * gap;
    var h = rows * cell + (rows + 1) * gap;
    var doc = blankSvg(w, h);
    var painter = svgPainter(doc);
    painter.rect(0, 0, w, h, PAPER);
    records.forEach(function (record, i) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      var x = gap + col * (cell + gap);
      var y = gap + row * (cell + gap);
      var b = bounds(record.g.samples || record.g.poly);
      var scale = Math.min((cell * 0.78) / (b.maxX - b.minX), (cell * 0.7) / (b.maxY - b.minY));
      painter.glyph(record.g.shape || record.g.poly, x + cell / 2, y + cell / 2 + 8, scale, (b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2);
      painter.text(pad(record.n), x, y + 14, 12);
    });
    return serialize(doc);
  }

  function constructionPage() {
    var g = geometry(params()) || lastGood;
    var black = shapeOnly;
    var pts = (g.samples || g.poly).slice();
    if (!black) pts = pts.concat(g.guidePts);
    var b = bounds(pts);
    var span = Math.max(b.maxX - b.minX, b.maxY - b.minY, 1);
    var pad = span * 0.1;
    var w = b.maxX - b.minX + pad * 2;
    var h = b.maxY - b.minY + pad * 2;
    var page = pdfPage(w, h);
    page.ops.push(pdfColor(PAPER) + " rg");
    page.ops.push("0 0 " + fmt(w) + " " + fmt(h) + " re f");
    page.ops.push("q 1 0 0 1 " + fmt(pad - b.minX) + " " + fmt(pad - b.minY) + " cm");
    paintConstruction(page, g, { hair: false, shapeBlack: black });
    page.ops.push("Q");
    return { width: w, height: h, stream: page.ops.join("\n") };
  }

  function sheetPage(index, metrics) {
    metrics = metrics || sheetMetrics(params());
    var page = pdfPage(PAGE_W, PAGE_H);
    page.ops.push("q 1 0 0 -1 0 " + fmt(PAGE_H) + " cm");
    paintSheet(page, index, metrics);
    page.ops.push("Q");
    return { width: PAGE_W, height: PAGE_H, stream: page.ops.join("\n") };
  }

  function glyphPage(record) {
    var w = 420 * MM;
    var h = 297 * MM;
    var page = pdfPage(w, h);
    page.ops.push(pdfColor(PAPER) + " rg");
    page.ops.push("0 0 " + fmt(w) + " " + fmt(h) + " re f");
    var b = bounds(record.g.samples || record.g.poly);
    var scale = Math.min((w * 0.7) / (b.maxX - b.minX), (h * 0.62) / (b.maxY - b.minY));
    page.ops.push("q 1 0 0 -1 0 " + fmt(h) + " cm");
    page.text(
      pad(record.n) + "    " + specText(record.spec),
      MARGIN,
      MARGIN + 12,
      11
    );
    page.glyph(
      record.g.shape || record.g.poly,
      w / 2,
      h / 2 + 10,
      scale,
      (b.minX + b.maxX) / 2,
      (b.minY + b.maxY) / 2
    );
    page.ops.push("Q");
    return { width: w, height: h, stream: page.ops.join("\n") };
  }

  function svgPainter(parent) {
    return {
      fill: function (pts, color) { parent.appendChild(polyEl(pts, color, null, 0, null)); },
      line: function (a, b, color, width, dash) {
        var node = svgEl("line");
        node.setAttribute("x1", a.x);
        node.setAttribute("y1", a.y);
        node.setAttribute("x2", b.x);
        node.setAttribute("y2", b.y);
        node.setAttribute("stroke", color);
        node.setAttribute("stroke-width", width);
        node.setAttribute("fill", "none");
        node.setAttribute("stroke-linecap", "butt");
        if (dash) node.setAttribute("stroke-dasharray", dash.join(" "));
        parent.appendChild(node);
      },
      circle: function (c, r, color, width, dash) {
        var node = svgEl("circle");
        node.setAttribute("cx", c.x);
        node.setAttribute("cy", c.y);
        node.setAttribute("r", r);
        node.setAttribute("fill", "none");
        node.setAttribute("stroke", color);
        node.setAttribute("stroke-width", width);
        if (dash) node.setAttribute("stroke-dasharray", dash.join(" "));
        parent.appendChild(node);
      },
      rect: function (x, y, w, h, color) {
        var node = svgEl("rect");
        node.setAttribute("x", x);
        node.setAttribute("y", y);
        node.setAttribute("width", w);
        node.setAttribute("height", h);
        node.setAttribute("fill", color);
        parent.appendChild(node);
      },
      text: function (string, x, y, size, anchor) {
        var node = svgEl("text");
        node.setAttribute("x", x);
        node.setAttribute("y", y);
        node.setAttribute("fill", INK);
        node.setAttribute("font-family", "IBM Plex Mono, ui-monospace, monospace");
        node.setAttribute("font-size", size);
        if (anchor) node.setAttribute("text-anchor", anchor);
        node.textContent = string;
        parent.appendChild(node);
      },
      cell: function (x, y, w, h, n, on, isActive) {
        var hit = svgEl("rect");
        hit.setAttribute("x", x);
        hit.setAttribute("y", y);
        hit.setAttribute("width", w);
        hit.setAttribute("height", h);
        hit.setAttribute("fill", "transparent");
        hit.setAttribute("data-shape", String(n));
        hit.setAttribute("stroke", on ? INK : "none");
        hit.setAttribute("stroke-width", isActive ? 1.6 : 0.8);
        hit.setAttribute("vector-effect", "non-scaling-stroke");
        parent.appendChild(hit);
      },
      glyph: function (pts, cx, cy, scale, ox, oy) {
        var g = svgEl("g");
        g.setAttribute("transform", "translate(" + cx + " " + cy + ") scale(" + scale + " -" + scale + ") translate(" + (-ox) + " " + (-oy) + ")");
        g.appendChild(polyEl(pts, INK, null, 0, null));
        parent.appendChild(g);
      }
    };
  }

  function pdfPage(w, h) {
    var page = {
      w: w,
      h: h,
      ops: [],
      fill: function (pts, color) {
        this.ops.push(pdfColor(color) + " rg");
        this.ops.push(pdfPath(pts) + " f");
      },
      line: function (a, b, color, width, dash) {
        this.ops.push(pdfColor(color) + " RG");
        this.ops.push(fmt(width) + " w");
        this.ops.push(dash ? "[" + dash.map(fmt).join(" ") + "] 0 d" : "[] 0 d");
        this.ops.push(fmt(a.x) + " " + fmt(a.y) + " m " + fmt(b.x) + " " + fmt(b.y) + " l S");
      },
      circle: function (c, r, color, width, dash) {
        this.ops.push(pdfColor(color) + " RG");
        this.ops.push(fmt(width) + " w");
        this.ops.push(dash ? "[" + dash.map(fmt).join(" ") + "] 0 d" : "[] 0 d");
        var k = 0.551784;
        this.ops.push([
          fmt(c.x + r) + " " + fmt(c.y) + " m",
          fmt(c.x + r) + " " + fmt(c.y + r * k) + " " + fmt(c.x + r * k) + " " + fmt(c.y + r) + " " + fmt(c.x) + " " + fmt(c.y + r) + " c",
          fmt(c.x - r * k) + " " + fmt(c.y + r) + " " + fmt(c.x - r) + " " + fmt(c.y + r * k) + " " + fmt(c.x - r) + " " + fmt(c.y) + " c",
          fmt(c.x - r) + " " + fmt(c.y - r * k) + " " + fmt(c.x - r * k) + " " + fmt(c.y - r) + " " + fmt(c.x) + " " + fmt(c.y - r) + " c",
          fmt(c.x + r * k) + " " + fmt(c.y - r) + " " + fmt(c.x + r) + " " + fmt(c.y - r * k) + " " + fmt(c.x + r) + " " + fmt(c.y) + " c",
          "S"
        ].join("\n"));
      },
      rect: function (x, y, rw, rh, color) {
        this.ops.push(pdfColor(color) + " rg");
        this.ops.push(fmt(x) + " " + fmt(y) + " " + fmt(rw) + " " + fmt(rh) + " re f");
      },
      text: function (string, x, y, size, anchor) {
        var dx = anchor === "end" ? -String(string).length * size * 0.6 : 0;
        this.ops.push("q 1 0 0 -1 " + fmt(x + dx) + " " + fmt(y) + " cm BT /F1 " + fmt(size) + " Tf " + pdfColor(INK) + " rg (" + pdfEscape(string) + ") Tj ET Q");
      },
      cell: function () {},
      glyph: function (pts, cx, cy, scale, ox, oy) {
        this.ops.push("q");
        this.ops.push("1 0 0 1 " + fmt(cx) + " " + fmt(cy) + " cm");
        this.ops.push(fmt(scale) + " 0 0 " + fmt(-scale) + " 0 0 cm");
        this.ops.push("1 0 0 1 " + fmt(-ox) + " " + fmt(-oy) + " cm");
        this.ops.push(pdfColor(INK) + " rg");
        this.ops.push(pdfPath(pts) + " f");
        this.ops.push("Q");
      }
    };
    return page;
  }

  function buildPdf(pages) {
    var chunks = ["%PDF-1.4\n"];
    var pos = chunks[0].length;
    var offsets = [];
    function add(body) {
      offsets.push(pos);
      var block = (offsets.length) + " 0 obj\n" + body + "\nendobj\n";
      chunks.push(block);
      pos += block.length;
    }
    add("<< /Type /Catalog /Pages 2 0 R >>");
    add("<< /Type /Pages /Count " + pages.length + " /Kids [" + pages.map(function (_, i) {
      return (5 + i * 2) + " 0 R";
    }).join(" ") + "] >>");
    add("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>");
    pages.forEach(function (page) {
      add("<< /Length " + page.stream.length + " >>\nstream\n" + page.stream + "\nendstream");
      add("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + fmt(page.width) + " " + fmt(page.height) + "] /Contents " + offsets.length + " 0 R /Resources << /Font << /F1 3 0 R >> >> >>");
    });
    var xrefAt = pos;
    var xref = "xref\n0 " + (offsets.length + 1) + "\n0000000000 65535 f \n";
    offsets.forEach(function (offset) {
      xref += String(offset).padStart(10, "0") + " 00000 n \n";
    });
    xref += "trailer\n<< /Size " + (offsets.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xrefAt + "\n%%EOF";
    chunks.push(xref);
    return chunks.join("");
  }

  function blankSvg(w, h) {
    var doc = svgEl("svg");
    doc.setAttribute("xmlns", NS);
    doc.setAttribute("viewBox", "0 0 " + round(w) + " " + round(h));
    doc.setAttribute("width", round(w));
    doc.setAttribute("height", round(h));
    return doc;
  }

  function polyEl(pts, fill, stroke, width, dash) {
    var node = svgEl("path");
    node.setAttribute("d", pathData(pts));
    node.setAttribute("fill", fill || "none");
    if (stroke) {
      node.setAttribute("stroke", stroke);
      node.setAttribute("stroke-width", width);
      node.setAttribute("stroke-linejoin", "miter");
      if (dash) node.setAttribute("stroke-dasharray", dash.join(" "));
    }
    return node;
  }

  function pathData(pts) {
    if (pts.length && pts[0].t) {
      return pts.map(function (c) {
        if (c.t === "C") return "C" + round(c.x1) + " " + round(c.y1) + " " + round(c.x2) + " " + round(c.y2) + " " + round(c.x) + " " + round(c.y);
        return c.t + round(c.x) + " " + round(c.y);
      }).join(" ") + " Z";
    }
    return pts.map(function (p, i) {
      return (i ? "L" : "M") + round(p.x) + " " + round(p.y);
    }).join(" ") + " Z";
  }

  function pdfPath(pts) {
    if (pts.length && pts[0].t) {
      return pts.map(function (c) {
        if (c.t === "M") return fmt(c.x) + " " + fmt(c.y) + " m";
        if (c.t === "L") return fmt(c.x) + " " + fmt(c.y) + " l";
        return fmt(c.x1) + " " + fmt(c.y1) + " " + fmt(c.x2) + " " + fmt(c.y2) + " " + fmt(c.x) + " " + fmt(c.y) + " c";
      }).join(" ") + " h";
    }
    return pts.map(function (p, i) {
      return fmt(p.x) + " " + fmt(p.y) + (i ? " l" : " m");
    }).join(" ") + " h";
  }

  function svgEl(name) {
    return document.createElementNS(NS, name);
  }

  function polar(angle, radius) {
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  }

  function lineThrough(point, angle) {
    return { p: point, d: { x: Math.cos(angle), y: Math.sin(angle) } };
  }

  function intersect(a, b) {
    var det = a.d.x * b.d.y - a.d.y * b.d.x;
    if (Math.abs(det) < 1e-9) return null;
    var t = ((b.p.x - a.p.x) * b.d.y - (b.p.y - a.p.y) * b.d.x) / det;
    return { x: a.p.x + a.d.x * t, y: a.p.y + a.d.y * t };
  }

  function extend(a, b, portion) {
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    var len = Math.hypot(dx, dy) || 1;
    var extra = len * portion;
    return [
      { x: a.x - dx / len * extra, y: a.y - dy / len * extra },
      { x: b.x + dx / len * extra, y: b.y + dy / len * extra }
    ];
  }

  function bounds(pts) {
    var minX = Infinity;
    var maxX = -Infinity;
    var minY = Infinity;
    var maxY = -Infinity;
    pts.forEach(function (p) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
    return { minX: minX, maxX: maxX, minY: minY, maxY: maxY };
  }

  function serialize(svg) {
    if (!svg.getAttribute("xmlns")) svg.setAttribute("xmlns", NS);
    return '<?xml version="1.0" encoding="UTF-8"?>' + new XMLSerializer().serializeToString(svg);
  }

  function download(filename, text, type) {
    var blob = new Blob([text], { type: type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function pdfColor(hex) {
    var n = parseInt(hex.slice(1), 16);
    return fmt((n >> 16) / 255) + " " + fmt(((n >> 8) & 255) / 255) + " " + fmt((n & 255) / 255);
  }

  function pdfEscape(string) {
    return String(string).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  }

  function clamp(value, lo, hi) {
    return Math.min(hi, Math.max(lo, value));
  }

  function round(n) {
    return Math.round(n * 1000) / 1000;
  }

  function fmt(n) {
    return String(Math.round(n * 1000) / 1000);
  }

  function format(n, digits) {
    return n.toFixed(digits);
  }

  function pad(n) {
    n = String(n);
    while (n.length < 3) n = "0" + n;
    return n;
  }
})();
