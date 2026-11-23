(function () {
  var pages = [
    { id: "hangtags", label: "Hangtags", kind: "tags" },
    { id: "neck-label", label: "Neck Label", kind: "necks" },
    { id: "on-jersey", label: "On jersey", kind: "jersey" },
    { id: "on-footwear", label: "On footwear", kind: "empty" },
    { id: "architectural", label: "architectural", kind: "empty" },
    { id: "socials", label: "Socials", kind: "empty" },
    { id: "conceptual", label: "conceptual", kind: "empty" },
    { id: "hardware", label: "Hardware", kind: "empty" },
    { id: "misc", label: "Misc", kind: "empty" }
  ];

  var sheet = document.getElementById("sheet");
  var menu = document.getElementById("menu");
  var stage = document.getElementById("stage");

  pages.forEach(function (page) {
    var link = document.createElement("a");
    link.href = "#" + page.id;
    link.dataset.page = page.id;
    var mark = document.createElement("img");
    mark.src = "assets/plus.svg";
    mark.alt = "";
    mark.width = 5;
    mark.height = 5;
    link.appendChild(mark);
    link.appendChild(document.createTextNode(page.label));
    menu.appendChild(link);
  });

  var jersey = document.createElement("img");
  jersey.className = "jersey";
  jersey.src = "assets/jersey.png";
  jersey.alt = "";
  jersey.hidden = true;
  sheet.appendChild(jersey);

  function pageFromHash() {
    var id = (location.hash || "").replace(/^#/, "");
    for (var i = 0; i < pages.length; i++) {
      if (pages[i].id === id) return pages[i];
    }
    return pages[0];
  }

  function necks() {
    return (
      '<img class="neck neck-1" src="assets/neck-1.png" alt="">' +
      '<img class="neck neck-6" src="assets/neck-6.png" alt="">' +
      '<img class="neck neck-5" src="assets/neck-5.png" alt="">'
    );
  }

  function tags() {
    return (
      '<div class="tags">' +
        '<div class="tag tag-1"><img src="assets/tag-1.png" alt=""></div>' +
        '<div class="tag tag-2"><img src="assets/tag-2.png" alt=""></div>' +
        '<div class="tag tag-3"><img src="assets/tag-3.png" alt=""></div>' +
        '<div class="tag tag-4"><img src="assets/tag-4.png" alt=""></div>' +
      "</div>"
    );
  }

  function show() {
    var page = pageFromHash();
    if (location.hash !== "#" + page.id) {
      history.replaceState(null, "", "#" + page.id);
    }

    var links = menu.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      var on = links[i].dataset.page === page.id;
      links[i].classList.toggle("is-current", on);
      if (on) links[i].setAttribute("aria-current", "page");
      else links[i].removeAttribute("aria-current");
    }

    sheet.dataset.page = page.id;
    jersey.hidden = page.kind !== "jersey";

    if (page.kind === "necks") stage.innerHTML = necks();
    else if (page.kind === "tags") stage.innerHTML = tags();
    else if (page.kind === "empty") {
      stage.innerHTML = '<p class="empty">' + page.label + "</p>";
    } else stage.innerHTML = "";

    document.title = page.label + " — YZY - GEMINI SYSTEM";
  }

  window.addEventListener("hashchange", show);
  show();
})();
