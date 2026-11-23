(function () {
  var PATCH = ["-1.31%", "-116.24%", "102.63%", "332.47%"];
  function img(src, x, y, w, h, crop) {
    return { src: src, x: x, y: y, w: w, h: h, crop: crop || null };
  }
  function social(dim) {
    var layers = [
      img("assets/social.png", 229, 175, 1568, 1250, ["-16.19%", "0%", "131.73%", "119.31%"]),
      { kind: "fill", x: 933, y: 389, w: 350, h: 33 },
      { mask: "assets/social-mask.svg", x: 624, y: 230, w: 181.133, h: 181.133, src: "assets/social-photo.png", photo: [-109.256, -106.965, 387.565, 382.951] }
    ];
    if (dim) layers[0].opacity = 0.3;
    if (dim) {
      layers.push(img("assets/social-ys.svg", 502, 300, 425, 42));
      layers.push(img("assets/social-ring.svg", 631, 237, 168, 168));
    }
    return layers;
  }
  function neck(files, tops, heights) {
    return files.map(function (file, i) { return img(file, 407, tops[i], 626, heights[i]); });
  }
  var pages = [
    { id: "home", label: null, slides: [[
      img("assets/model.png", 259, 154, 921, 628.353, ["-11%", "-0.24%", "121.9%", "99.73%"]),
      img("assets/y-pair.svg", 360.27, 433.09, 717.662, 70.171)
    ]] },
    { id: "hangtags", label: "Hangtags", slides: [
      [img("assets/hangtag.png", 98, 0, 1243, 1559)],
      [img("assets/hangtag.png", 98, 0, 1243, 1559)]
    ] },
    { id: "neck-label", label: "Neck Label", slides: [
      neck(["assets/neck-1.png", "assets/neck-6.png", "assets/neck-5.png"], [174, 347, 520], [230, 230, 231]),
      neck(["assets/neck-2.png", "assets/neck-3.png", "assets/neck-4.png"], [162, 336, 509], [231, 230, 230])
    ] },
    { id: "on-jersey", label: "On jersey", slides: [[img("assets/jersey.png", 217, -315, 1008, 1215, ["2.18%", "2.41%", "95.63%", "98.54%"])]] },
    { id: "on-footwear", label: "On footwear", slides: [[img("assets/footwear.png", 360, 168, 797, 537, ["-8.04%", "-22.46%", "108.04%", "160.46%"])]] },
    { id: "architectural", label: "architectural", slides: [[img("assets/arch.png", 310, 107, 821, 731, ["-58.22%", "-45.3%", "216.2%", "181.3%"])]] },
    { id: "socials", label: "Socials", slides: [
      social(false),
      social(true),
      [
        { mask: "assets/social-mask.svg", x: 624, y: 230, w: 181.133, h: 181.133, src: "assets/social-photo.png", photo: [-109.256, -106.965, 387.565, 382.951] },
        img("assets/social-ys.svg", 502, 300, 425, 42),
        img("assets/social-ring.svg", 631, 237, 168, 168)
      ]
    ] },
    { id: "conceptual", label: "conceptual", slides: [[]] },
    { id: "hardware", label: "Hardware", slides: [1, 2, 3, 4, 5].map(function (n) { return [img("assets/patch-" + n + ".png", 150, 245, 1141, 437, PATCH)]; }) },
    { id: "misc", label: "Misc", slides: [[]] }
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
  function render() {
    var route = pageFromHash();
    var page = route.page;
    if (slide < 0) slide = 0;
    if (slide > page.slides.length - 1) slide = page.slides.length - 1;
    stage.innerHTML = "";
    page.slides[slide].forEach(function (layer) { stage.appendChild(piece(layer)); });
    menu.querySelectorAll("a").forEach(function (link) {
      var on = page.id !== "home" && link.dataset.page === page.id;
      link.classList.toggle("is-current", on);
      if (on) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
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
  function go(page, index) {
    slide = index;
    var hash = "#" + page.id + (index > 0 ? "/" + (index + 1) : "");
    if (location.hash !== hash) location.hash = hash;
    render();
  }
  dots.addEventListener("click", function (event) {
    var button = event.target.closest("button");
    if (!button) return;
    var page = pageFromHash().page;
    var index = parseInt(button.dataset.slide, 10);
    if (index > page.slides.length - 1) index = page.slides.length - 1;
    go(page, index);
  });
  window.addEventListener("hashchange", function () {
    var route = pageFromHash();
    slide = Math.max(0, Math.min(route.index, route.page.slides.length - 1));
    render();
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
  render();
})();

