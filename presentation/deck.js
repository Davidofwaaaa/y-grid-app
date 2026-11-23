(function () {
  var TAG = ["-76.62%", "-10.37%", "253.25%", "120.74%"];
  var MODEL = ["-11%", "-0.24%", "121.9%", "99.73%"];
  var SHOE = ["9.95%", "-62.91%", "78.98%", "174.57%"];
  var ARCH = ["-29.5%", "-45.3%", "153.55%", "181.3%"];
  var PATCH = ["-1.31%", "-116.24%", "102.63%", "332.47%"];
  var FOOT = ["-8.04%", "-22.46%", "108.04%", "160.46%"];

  function img(src, x, y, w, h, crop) {
    return { src: src, x: x, y: y, w: w, h: h, crop: crop || null };
  }

  function tags(x0, y, s) {
    return [
      img("assets/tag.png", x0, y, 244.134 * s, 512.048 * s, TAG),
      img("assets/tag.png", x0 + 245.316 * s, y, 243.751 * s, 511.245 * s, TAG),
      img("assets/tag.png", x0 + 489.866 * s, y, 244.134 * s, 512.048 * s, TAG)
    ];
  }

  function necks(files, x, ys, w, hs) {
    return files.map(function (file, i) {
      return img(file, x, ys[i], w, hs[i]);
    });
  }

  function social(box, photo, ys, ring) {
    return [
      { src: "assets/social-ys.svg", x: ys[0], y: ys[1], w: ys[2], h: ys[3] },
      { src: "assets/social-ring.svg", x: ring[0], y: ring[1], w: ring[2], h: ring[3] },
      {
        mask: "assets/social-mask.svg",
        x: box[0], y: box[1], w: box[2], h: box[3],
        src: "assets/social.png",
        photo: photo
      }
    ];
  }

  var neckA = ["assets/neck-1.png", "assets/neck-6.png", "assets/neck-5.png"];
  var neckB = ["assets/neck-2.png", "assets/neck-3.png", "assets/neck-4.png"];

  var pages = [
    {
      id: "home",
      label: null,
      slides: [
        {
          desk: [
            img("assets/model.jpg", 259, 154, 921, 628.353, MODEL),
            img("assets/y-pair.svg", 360.27, 433.09, 717.662, 70.171)
          ],
          mob: [
            img("assets/model.jpg", 15, 277, 368, 251, MODEL),
            img("assets/y-mark.svg", 72.35, 401.79, 12.255, 10.83),
            img("assets/y-mark.svg", 321.76, 401.79, 12.255, 10.83)
          ]
        },
        {
          desk: [img("assets/home-2.png", 259, 167, 1156, 578)],
          mob: [img("assets/home-2.png", 12, 270, 369, 184)]
        }
      ]
    },
    {
      id: "hangtags",
      label: "Hangtags",
      slides: [
        {
          desk: tags(353, 200.98, 1),
          mob: [
            img("assets/model.jpg", 12, 276, 369, 252, MODEL),
            img("assets/y-mark.svg", 66, 401.79, 12.255, 10.83),
            img("assets/y-mark.svg", 315.4, 401.79, 12.255, 10.83)
          ]
        },
        {
          desk: [img("assets/hangtag-photo.png", 142, 24, 1156, 876)],
          mob: [img("assets/hangtag-photo.png", 12, 248, 369, 280)]
        }
      ]
    },
    {
      id: "neck-label",
      label: "Neck Label",
      slides: [
        {
          desk: necks(neckA, 407, [174, 347, 520], 626, [230, 230, 231]),
          mob: necks(neckA, 15, [261, 362, 462], 363, [134, 133, 134])
        },
        {
          desk: necks(neckB, 407, [162, 336, 509], 626, [231, 230, 230]),
          mob: necks(neckB, 15, [261, 362, 462], 363, [134, 133, 133])
        }
      ]
    },
    {
      id: "on-jersey",
      label: "On jersey",
      slides: [
        {
          desk: [img("assets/jersey.png", 333, -315, 1008, 1215, ["2.18%", "2.41%", "95.63%", "98.54%"])],
          mob: [img("assets/jersey.png", -307, 240, 1008, 837, ["2.18%", "-41.67%", "95.63%", "143.05%"])]
        }
      ]
    },
    {
      id: "on-footwear",
      label: "On footwear",
      slides: [
        {
          desk: [img("assets/footwear-desk.png", 301, 60, 1157, 779)],
          mob: [img("assets/footwear.png", 32, 309, 383, 258, FOOT)]
        },
        {
          desk: [img("assets/shoe.png", 259, 189, 1156, 523, SHOE)],
          mob: [img("assets/shoe.png", 12, 300, 369, 167, SHOE)]
        }
      ]
    },
    {
      id: "architectural",
      label: "architectural",
      slides: [
        {
          desk: [img("assets/arch.png", 259, 107, 1156, 731, ARCH)],
          mob: [img("assets/arch.png", -39, 332, 494, 313, ARCH)]
        },
        {
          desk: [img("assets/arch-2.png", 262, 67, 1151, 782)],
          mob: [img("assets/arch-2.png", 12, 270, 369, 251)]
        }
      ]
    },
    {
      id: "socials",
      label: "Socials",
      slides: [
        {
          desk: social(
            [690.6, 298.49, 292.91, 292.91],
            [-176.68, -172.97, 626.74, 619.28],
            [493, 413.16, 688, 63.4],
            [702, 309, 270, 271]
          ),
          mob: social(
            [129.33, 381.76, 135.39, 135.39],
            [-81.66, -79.95, 289.69, 286.24],
            [38, 434.77, 318, 29.31],
            [134.6, 386.62, 124.8, 125.26]
          )
        }
      ]
    },
    {
      id: "conceptual",
      label: "conceptual",
      slides: [{
        desk: [],
        mob: social(
          [129.33, 381.76, 135.39, 135.39],
          [-81.66, -79.95, 289.69, 286.24],
          [38, 434.77, 318, 29.31],
          [134.6, 386.62, 124.8, 125.26]
        )
      }]
    },
    {
      id: "hardware",
      label: "Hardware",
      slides: [1, 2, 3, 4, 5].map(function (n) {
        var src = "assets/patch-" + n + ".png";
        var crop = n < 3 ? PATCH : null;
        return {
          desk: [img(src, 259, 245, 1141, 437, crop)],
          mob: [img(src, -2, 389, 395, 151, crop)]
        };
      })
    },
    {
      id: "misc",
      label: "Misc",
      slides: [{ desk: [], mob: [] }]
    }
  ];

  var menuItems = pages.filter(function (page) { return page.label; });
  var board = document.getElementById("frame");
  var menu = document.getElementById("nav");
  var stage = document.getElementById("slide");
  var count = null;
  var dots = document.getElementById("dots");
  var slide = 0;
  var layout = "desktop";

  menuItems.forEach(function (page, index) {
    var link = document.createElement("a");
    link.href = "#" + page.id;
    link.dataset.page = page.id;
    link.textContent = page.label;
    menu.appendChild(link);
    link.dataset.index = String(index);
  });

  function mobileQuery() {
    return window.matchMedia("(max-width: 900px)").matches;
  }

  function designSize() {
    return layout === "mobile" ? { w: 393, h: 852 } : { w: 1440, h: 900 };
  }

  function fit() {
    var next = mobileQuery() ? "mobile" : "desktop";
    var changed = next !== layout;
    layout = next;
    document.body.dataset.layout = layout;
    if (changed) render();
  }

  function pageFromHash() {
    var raw = (location.hash || "").replace(/^#/, "");
    var parts = raw.split("/");
    var id = parts[0];
    var found = pages[0];
    for (var i = 0; i < pages.length; i++) {
      if (pages[i].id === id) found = pages[i];
    }
    var n = parseInt(parts[1], 10);
    return { page: found, index: isNaN(n) ? 0 : n - 1 };
  }

  function piece(layer) {
    var size = designSize();
    var box = document.createElement("div");
    box.className = "crop";
    box.style.left = (layer.x / size.w * 100) + "%";
    box.style.top = (layer.y / size.h * 100) + "%";
    box.style.width = (layer.w / size.w * 100) + "%";
    box.style.aspectRatio = layer.w + " / " + layer.h;
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
      image.style.objectFit = "fill";
    }
    box.appendChild(image);
    return box;
  }

  function render() {
    var route = pageFromHash();
    var page = route.page;
    if (slide < 0) slide = 0;
    if (slide > page.slides.length - 1) slide = page.slides.length - 1;
    var key = layout === "mobile" ? "mob" : "desk";
    stage.innerHTML = "";
    page.slides[slide][key].forEach(function (layer) {
      stage.appendChild(piece(layer));
    });
    board.classList.toggle("is-home", page.id === "home");
    var links = menu.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      var on = links[i].dataset.page === page.id;
      links[i].classList.toggle("is-current", on);
      if (on) links[i].setAttribute("aria-current", "page");
      else links[i].removeAttribute("aria-current");
    }
    dots.innerHTML = "";
    for (var d = 0; d < 4; d++) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = d === Math.min(slide, 3) ? "is-on" : "";
      dot.setAttribute("aria-label", "Slide " + (d + 1));
      dot.dataset.slide = String(d);
      dots.appendChild(dot);
    }
    document.title = (page.label || "YZY") + " — YZY - GEMINI SYSTEM";
  }

  function go(page, index, replace) {
    slide = index;
    var hash = "#" + page.id + (index > 0 ? "/" + (index + 1) : "");
    if (location.hash !== hash) {
      if (replace) history.replaceState(null, "", hash);
      else location.hash = hash;
    }
    render();
  }

  function current() {
    return pageFromHash().page;
  }

  function step(delta) {
    var page = current();
    var next = slide + delta;
    if (next < 0) next = page.slides.length - 1;
    if (next > page.slides.length - 1) next = 0;
    go(page, next, false);
  }

  dots.addEventListener("click", function (event) {
    var button = event.target.closest("button");
    if (!button) return;
    var page = current();
    var index = parseInt(button.dataset.slide, 10);
    if (index > page.slides.length - 1) index = page.slides.length - 1;
    go(page, index, false);
  });

  window.addEventListener("hashchange", function () {
    var route = pageFromHash();
    slide = Math.max(0, Math.min(route.index, route.page.slides.length - 1));
    render();
  });

  window.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") step(1);
    if (event.key === "ArrowLeft") step(-1);
  });

  var touchX = null;
  board.addEventListener("touchstart", function (event) {
    touchX = event.changedTouches[0].clientX;
  }, { passive: true });
  board.addEventListener("touchend", function (event) {
    if (touchX == null) return;
    var dx = event.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) < 40) return;
    step(dx < 0 ? 1 : -1);
  }, { passive: true });

  window.addEventListener("resize", fit);

  var start = pageFromHash();
  slide = Math.max(0, start.index);
  if (!location.hash) history.replaceState(null, "", "#home");
  fit();
  render();
})();
