(function () {
  function img(src, x, y, w, h, t, rot) {
    var layer = { src: src, x: x, y: y, w: w, h: h };
    if (t) layer.t = t;
    if (rot) layer.rot = rot;
    return layer;
  }
  function yPair(x, y) {
    return img("assets/y-pair.svg", x, y, 717.662, 70.171);
  }
  function portrait() {
    return { mask: "assets/social-mask.svg", x: 624, y: 230, w: 181.133, h: 181.133, src: "assets/social-photo.png", photo: [-109.2557, -106.9648, 387.5648, 382.9509] };
  }
  function marks() {
    return [img("assets/social-ys.svg", 502, 300, 425, 42), img("assets/social-ring.svg", 631, 237, 168, 168)];
  }
  var jerseyBoxes = [
    [186, -242, 1069, 1058, [[0.9687, 0, 0.0165], [0, 1.4182, -0.4358]]],
    [0, -162.7865, 1440, 1788, [[0.9322, 0, 0.0339], [0, 1, -0.0621]]],
    [181, 119, 1062, 745, [[0.8984, 0, 0.0508], [0, 0.9092, 0.0908]]],
    [0, -148, 1440, 1788, [[1.7184, 0, -0.3592], [0, 2.1337, -0.2348]]],
    [-45.2725, -145.7305, 1499.7365, 1861.7418, [[1, 0, 0], [0, 1.2417, -0.1209]], 0.9654],
    [0.2001, -156.6738, 1440, 1788, [[1.7184, 0, -0.3592], [0, 2.1337, -0.2348]]],
    [0, -138.8328, 1440, 1788, [[0.9322, 0, 0.0339], [0, 1, -0.0524]]],
    [320.6001, 24, 770, 955, [[0.9996, 0, 0.0002], [0, 1, 0]]],
    [0, -102.3535, 1440, 1788, [[0.9322, 0, 0.0339], [0, 1, -0.0524]]],
    [-45.2725, -145.7312, 1499.7365, 1861.7418, [[1, 0, 0], [0, 1.2417, -0.1209]], 0.9654],
    [-45.9111, -157.6759, 1496.0532, 1857.1696, [[1, 0, 0], [0, 1.2417, -0.1356]], 1.1231],
    [0, -87, 1442, 1790, [[0.9322, 0, 0.0339], [0, 1, -0.0524]]],
    [335, 70, 770, 815, [[0.9996, 0, 0.0002], [0, 0.8534, 0.0733]]],
    [-51.844, -211.561, 1501.916, 1864.4475, [[0.9619, 0.0182, 0.0086], [-0.0123, 0.9999, 0.2735]], 1.1231],
    [-51.844, -211.561, 1501.916, 1864.4475, [[0.9619, 0.0182, 0.0086], [-0.0123, 0.9999, 0.2735]], 1.1231],
    [-51.844, -211.561, 1501.916, 1864.4475, [[0.9619, 0.0182, 0.0086], [-0.0123, 0.9999, 0.2735]], 1.1231]
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
      img("assets/home.png", 259, 136, 921, 628.3533, [[0.8203, 0, 0.0902], [0, 1.0027, 0.0025]]),
      yPair(360.27, 415.09)
    ]] },
    { id: "neck-label", label: "Neck Label", slides: neckBoxes.map(function (box, index) {
      return [img("assets/neck-" + (index + 1) + ".png", box[0], 262, box[1], box[2])];
    }) },
    { id: "on-jersey", label: "On jersey", slides: jerseyBoxes.map(function (box, index) {
      return [img("assets/jersey-" + (index + 1) + ".png", box[0], box[1], box[2], box[3], box[4], box[5])];
    }) },
    { id: "on-footwear", label: "On footwear", slides: [
      [img("assets/boot-1.png", 259, 177, 922, 546)],
      [
        img("assets/boot-left.png", 224, 256, 396, 395),
        img("assets/boot-back.png", 640, 250, 161, 395, [[0.4092, 0, 0.2954], [0, 1, 0]]),
        img("assets/boot-right.png", 821, 250, 396, 395)
      ],
      [img("assets/boot-3.png", 259, 177, 922, 546)],
      [
        img("assets/boot-side-left.png", 70, 210, 526, 527),
        img("assets/boot-side-back.png", 468, 221, 503, 503),
        img("assets/boot-side-right.png", 826, 210, 544, 545)
      ],
      [img("assets/boot-stealth.png", 218, 160, 994, 565, [[0.9823, 0, 0.0088], [0, 0.9899, 0.0051]])]
    ] },
    { id: "socials", label: "Socials", slides: [
      [
        img("assets/social.png", 229, 175, 1211, 725, [[0.5863, 0, 0.1229], [0, 0.4861, 0]]),
        { kind: "fill", x: 933, y: 389, w: 350, h: 33 },
        portrait()
      ],
      [
        Object.assign(img("assets/social.png", 229, 175, 1568, 1250, [[0.7591, 0, 0.1229], [0, 0.8381, 0]]), { opacity: 0.3 }),
        { kind: "fill", x: 933, y: 389, w: 350, h: 33 },
        portrait()
      ].concat(marks()),
      [portrait()].concat(marks())
    ] },
    { id: "hardware", label: "Hardware", slides: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (n) {
      return [img("assets/patch-" + n + ".png", 247, 311, 946.3883, 278.3495)];
    }) },
    { id: "imagery", label: "Imagery", slides: [
      [
        img("assets/home.png", 259, 153.9992, 921, 628.3533, [[0.8203, 0, 0.0902], [0, 1.0027, 0.0025]]),
        yPair(361.17, 433.09)
      ],
      [
        img("assets/imagery-2.png", 259, 195, 922, 514),
        yPair(361.17, 433.09)
      ],
      [img("assets/imagery-3.png", 424, 92.4198, 592.8254, 726.1604, [[0.4898, 0, 0.0297], [0, 1, 0]])],
      [
        img("assets/imagery-4.png", 423.9998, 104.5, 592.8, 741),
        yPair(361, 271)
      ],
      [
        img("assets/imagery-5.png", 259, 142, 922, 616, [[1, 0, 0], [0, 0.8908, 0.0764]]),
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
    var scale = Math.min(window.innerWidth / 1440, window.innerHeight / 900);
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
    if (layer.rot) {
      box.style.transformOrigin = "center center";
      box.style.transform = "rotate(" + layer.rot + "deg)";
    }
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
      image.style.objectFit = "fill";
    } else if (layer.t) {
      var a = layer.t[0][0], b = layer.t[0][1], tx = layer.t[0][2];
      var c = layer.t[1][0], d = layer.t[1][1], ty = layer.t[1][2];
      var det = a * d - b * c;
      var ia = d / det, ib = -b / det, itx = (b * ty - d * tx) / det;
      var ic = -c / det, id_ = a / det, ity = (c * tx - a * ty) / det;
      image.style.left = "0";
      image.style.top = "0";
      image.style.width = "100%";
      image.style.height = "100%";
      image.style.objectFit = "fill";
      image.style.transformOrigin = "0 0";
      image.style.transform = "matrix(" + [ia, ic, ib, id_, itx * layer.w, ity * layer.h].join(",") + ")";
    } else {
      image.style.inset = "0";
      image.style.width = "100%";
      image.style.height = "100%";
      image.style.objectFit = "fill";
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

