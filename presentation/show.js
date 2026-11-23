(function () {
  function img(src, x, y, w, h, crop) {
    return { src: src, x: x, y: y, w: w, h: h, crop: crop || null };
  }
  function yPair(x, y) {
    return img("assets/y-pair.svg", x, y, 717.662, 70.171);
  }
  function portrait() {
    return { mask: "assets/social-mask.svg", x: 624, y: 230, w: 181.133, h: 181.133, src: "assets/social-photo.png", photo: [-109.256, -106.965, 387.565, 382.951] };
  }
  function marks() {
    return [img("assets/social-ys.svg", 502, 300, 425, 42), img("assets/social-ring.svg", 631, 237, 168, 168)];
  }
  var jerseyBoxes = [
    [186, -242, 1069, 1058, ["-1.71%", "30.73%", "103.23%", "70.51%"]],
    [0, -162.8, 1440, 1788, ["-3.64%", "6.21%", "107.28%", "100%"]],
    [181, 119, 1062, 745, ["-5.65%", "-9.99%", "111.31%", "109.99%"]],
    [0, -148, 1440, 1788, ["20.9%", "11%", "58.19%", "46.87%"]],
    [-45.3, -145.7, 1530.9, 1886.7, ["0%", "9.74%", "100%", "80.54%"]],
    [0.2, -156.7, 1440, 1788, ["20.9%", "11%", "58.19%", "46.87%"]],
    [0, -138.8, 1440, 1788, ["-3.64%", "5.24%", "107.28%", "100%"]],
    [320.6, 24, 770, 955, ["-0.02%", "0%", "100.04%", "100%"]],
    [0, -102.4, 1440, 1788, ["-3.64%", "5.24%", "107.28%", "100%"]],
    [-45.3, -145.7, 1530.9, 1886.7, ["0%", "9.74%", "100%", "80.54%"]],
    [-45.9, -157.7, 1532.2, 1886.1, ["0%", "10.92%", "100%", "80.54%"]],
    [0, -87, 1442, 1790, ["-3.64%", "5.24%", "107.28%", "100%"]],
    [335, 70, 770, 815, ["-0.02%", "-8.59%", "100.04%", "117.18%"]],
    [-51.8, -211.6, 1538.2, 1893.5, ["-0.89%", "-27.35%", "103.97%", "100.01%"]],
    [-51.8, -211.6, 1538.2, 1893.5, ["-0.89%", "-27.35%", "103.97%", "100.01%"]],
    [-51.8, -211.6, 1538.2, 1893.5, ["-0.89%", "-27.35%", "103.97%", "100.01%"]]
  ];
  var neckBoxes = [
    [209, 1023, 376],
    [208, 1025, 377],
    [209, 1023, 376],
    [209, 1023, 376],
    [209, 1023, 376],
    [208, 1025, 377],
    [208, 1025, 377],
    [209, 1023, 376]
  ];
  var pages = [
    { id: "home", label: "Homepage", slides: [[
      img("assets/home.png", 259, 136, 921, 628.353, ["-11%", "-0.24%", "121.9%", "99.73%"]),
      yPair(360.27, 415.09)
    ]] },
    { id: "neck-label", label: "Neck Label", slides: neckBoxes.map(function (box, index) {
      return [img("assets/neck-" + (index + 1) + ".png", box[0], 262, box[1], box[2])];
    }) },
    { id: "on-jersey", label: "On jersey", slides: jerseyBoxes.map(function (box, index) {
      return [img("assets/jersey-" + (index + 1) + ".png", box[0], box[1], box[2], box[3], box[4])];
    }) },
    { id: "on-footwear", label: "On footwear", slides: [
      [img("assets/boot-1.png", 259, 177, 922, 546)],
      [
        img("assets/boot-left.png", 224, 256, 396, 395),
        img("assets/boot-back.png", 640, 250, 161, 395, ["-72.19%", "0%", "244.37%", "100%"]),
        img("assets/boot-right.png", 821, 250, 396, 395)
      ],
      [img("assets/boot-3.png", 259, 177, 922, 546)],
      [
        img("assets/boot-side-left.png", 70, 210, 526, 527),
        img("assets/boot-side-back.png", 468, 221, 503, 503),
        img("assets/boot-side-right.png", 826, 210, 544, 545)
      ],
      [img("assets/boot-stealth.png", 218, 160, 994, 565, ["-0.9%", "-0.51%", "101.8%", "101.02%"])]
    ] },
    { id: "socials", label: "Socials", slides: [
      [
        img("assets/social.png", 229, 175, 1211, 725, ["-20.96%", "0%", "170.56%", "205.71%"]),
        { kind: "fill", x: 933, y: 389, w: 350, h: 33 },
        portrait()
      ],
      [
        Object.assign(img("assets/social.png", 229, 175, 1568, 1250, ["-16.19%", "0%", "131.73%", "119.31%"]), { opacity: 0.3 }),
        { kind: "fill", x: 933, y: 389, w: 350, h: 33 },
        portrait()
      ].concat(marks()),
      [portrait()].concat(marks())
    ] },
    { id: "hardware", label: "Hardware", slides: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (n) {
      return [img("assets/patch-" + n + ".png", 247, 311, 946.4, 278.3)];
    }) },
    { id: "imagery", label: "Imagery", slides: [
      [
        img("assets/home.png", 259, 154, 921, 628.353, ["-11%", "-0.24%", "121.9%", "99.73%"]),
        yPair(361.17, 433.09)
      ],
      [
        img("assets/imagery-2.png", 259, 195, 922, 514),
        yPair(361.17, 433.09)
      ],
      [img("assets/imagery-3.png", 424, 92.42, 592.83, 726.16, ["-6.07%", "0%", "204.15%", "100%"])],
      [
        img("assets/imagery-4.png", 424, 104.5, 592.8, 741),
        yPair(361, 271)
      ],
      [
        img("assets/imagery-5.png", 259, 142, 922, 616, ["0%", "-8.58%", "100%", "112.26%"]),
        yPair(361, 379.83)
      ]
    ] }
  ];
  var menuItems = pages.filter(function (page) { return page.label; });
  var board = document.getElementById("board");
  var menu = document.getElementById("nav");
  var stage = document.getElementById("slide");
  var dots = document.getElementById("dots");
  var slide = 0;
  menuItems.forEach(function (page) {
    var link = document.createElement("a");
    link.href = "#" + page.id;
    link.dataset.page = page.id;
    link.textContent = page.label;
    menu.appendChild(link);
  });
  function fit() {
    var scale = Math.max(window.innerWidth / 1440, window.innerHeight / 900);
    document.documentElement.style.setProperty("--fit", String(scale));
    board.style.left = ((window.innerWidth - 1440 * scale) / 2) + "px";
    board.style.top = ((window.innerHeight - 900 * scale) / 2) + "px";
  }
  function pageFromHash() {
    var id = (location.hash || "").replace(/^#/, "").split("/")[0];
    var found = pages[0];
    pages.forEach(function (page) { if (page.id === id) found = page; });
    var n = parseInt((location.hash || "").split("/")[1], 10);
    return { page: found, index: isNaN(n) ? 0 : n - 1 };
  }
  function piece(layer) {
    var box = document.createElement("div");
    box.className = "crop";
    box.style.left = layer.x + "px";
    box.style.top = layer.y + "px";
    box.style.width = layer.w + "px";
    box.style.height = layer.h + "px";
    if (layer.kind === "fill") { box.style.background = "#fff"; return box; }
    if (layer.opacity) box.style.opacity = String(layer.opacity);
    var image = document.createElement("img");
    image.src = layer.src;
    image.alt = "";
    if (layer.mask) {
      box.style.webkitMaskImage = "url(" + layer.mask + ")";
      box.style.maskImage = "url(" + layer.mask + ")";
      box.style.webkitMaskSize = "100% 100%";
      box.style.maskSize = "100% 100%";
      box.style.webkitMaskRepeat = "no-repeat";
      box.style.maskRepeat = "no-repeat";
      image.style.left = (layer.photo[0] / layer.w * 100) + "%";
      image.style.top = (layer.photo[1] / layer.h * 100) + "%";
      image.style.width = (layer.photo[2] / layer.w * 100) + "%";
      image.style.height = (layer.photo[3] / layer.h * 100) + "%";
      image.style.objectFit = "cover";
    } else if (layer.crop) {
      image.style.left = layer.crop[0];
      image.style.top = layer.crop[1];
      image.style.width = layer.crop[2];
      image.style.height = layer.crop[3];
    } else {
      image.style.inset = "0";
      image.style.width = "100%";
      image.style.height = "100%";
      image.style.objectFit = "cover";
    }
    box.appendChild(image);
    return box;
  }
  var painted = "";
  var generation = 0;
  function preload(layers) {
    layers.forEach(function (layer) {
      if (!layer.src) return;
      var image = new Image();
      image.src = layer.src;
    });
  }
  function paintChrome(page) {
    menu.querySelectorAll("a").forEach(function (link) {
      var on = link.dataset.page === page.id;
      link.classList.toggle("is-current", on);
      if (on) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    dots.innerHTML = "";
    if (page.id !== "home") {
      page.slides.forEach(function (_, index) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = index === slide ? "is-on" : "";
        dot.setAttribute("aria-label", "Image " + (index + 1));
        dot.dataset.slide = String(index);
        dots.appendChild(dot);
      });
    }
    document.title = (page.label || "YZY") + " — YZY - GEMINI SYSTEM";
  }
  function loaded(frame) {
    var images = [].slice.call(frame.querySelectorAll("img"));
    return Promise.all(images.map(function (image) {
      if (image.complete) return Promise.resolve();
      return new Promise(function (resolve) {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    }));
  }
  var FADE = 450;
  function fadeTo(element, opacity) {
    var animation = element.animate(
      [{ opacity: getComputedStyle(element).opacity }, { opacity: opacity }],
      { duration: FADE, easing: "ease", fill: "forwards" }
    );
    return new Promise(function (resolve) {
      var settled = false;
      function finish() {
        if (settled) return;
        settled = true;
        element.style.opacity = String(opacity);
        animation.cancel();
        resolve();
      }
      animation.onfinish = finish;
      setTimeout(finish, FADE + 40);
    });
  }
  function show(page, animate) {
    var key = page.id + "/" + slide;
    paintChrome(page);
    var ahead = page.slides[(slide + 1) % page.slides.length];
    if (ahead) preload(ahead);
    if (key === painted && stage.querySelector(".frame")) return;
    var token = ++generation;
    painted = key;
    var incoming = document.createElement("div");
    incoming.className = "frame";
    incoming.style.opacity = "0";
    page.slides[slide].forEach(function (layer) { incoming.appendChild(piece(layer)); });
    var ready = loaded(incoming);
    var previous = [].slice.call(stage.querySelectorAll(".frame"));
    if (!animate) {
      incoming.style.opacity = "1";
      stage.innerHTML = "";
      stage.appendChild(incoming);
      return;
    }
    Promise.all(previous.map(function (frame) { return fadeTo(frame, 0); })).then(function () {
      if (token !== generation) return;
      previous.forEach(function (frame) {
        if (frame.parentNode) frame.parentNode.removeChild(frame);
      });
      stage.appendChild(incoming);
      return ready;
    }).then(function () {
      if (token !== generation || !incoming.parentNode) return;
      return fadeTo(incoming, 1);
    });
  }
  function go(page, index) {
    slide = index;
    var hash = "#" + page.id + (index > 0 ? "/" + (index + 1) : "");
    if (location.hash !== hash) location.hash = hash;
    else show(page, true);
  }
  dots.addEventListener("click", function (event) {
    var button = event.target.closest("button");
    if (!button) return;
    event.stopPropagation();
    var page = pageFromHash().page;
    var index = parseInt(button.dataset.slide, 10);
    if (index === slide) return;
    go(page, index);
  });
  dots.addEventListener("mouseover", function (event) {
    var button = event.target.closest("button");
    if (!button) return;
    var page = pageFromHash().page;
    var index = parseInt(button.dataset.slide, 10);
    if (page.slides[index]) preload(page.slides[index]);
  });
  menu.addEventListener("mouseover", function (event) {
    var link = event.target.closest("a");
    if (!link) return;
    pages.forEach(function (page) {
      if (page.id === link.dataset.page) preload(page.slides[0]);
    });
  });
  document.querySelector(".viewport").addEventListener("click", function (event) {
    if (event.target.closest("a, button")) return;
    var page = pageFromHash().page;
    if (page.slides.length < 2) return;
    go(page, (slide + 1) % page.slides.length);
  });
  window.addEventListener("hashchange", function () {
    var route = pageFromHash();
    slide = Math.max(0, Math.min(route.index, route.page.slides.length - 1));
    show(route.page, true);
  });
  window.addEventListener("keydown", function (event) {
    var page = pageFromHash().page;
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    var next = slide + (event.key === "ArrowRight" ? 1 : -1);
    if (next < 0) next = page.slides.length - 1;
    if (next > page.slides.length - 1) next = 0;
    go(page, next);
  });
  window.addEventListener("resize", fit);
  var start = pageFromHash();
  slide = Math.max(0, start.index);
  if (!location.hash) history.replaceState(null, "", "#home");
  fit();
  show(start.page, false);
})();

