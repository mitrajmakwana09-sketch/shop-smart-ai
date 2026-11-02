/* =========================================================
   wishlist.js | Shop Smart AI
   Badhi customer pages ma vapray tevu shared wishlist.
   Storage: localStorage "wishlist" = [productId, ...]
   ========================================================= */
(function (global) {
  "use strict";

  var KEY = "wishlist";
  var MAX = 200;
  var listeners = [];

  /* ---------- Storage (error vagar) ---------- */
  function toId(v) {
    var n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : 0;
  }

  function read() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY));
      if (!Array.isArray(raw)) return [];
      var seen = {}, out = [];
      raw.forEach(function (v) {
        var n = toId(v);
        if (n && !seen[n]) { seen[n] = 1; out.push(n); }
      });
      return out.slice(0, MAX);
    } catch (e) { return []; }
  }

  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); return true; }
    catch (e) { return false; }
  }

  /* ---------- Nano toast (page ma na hoy to pan chale) ---------- */
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (typeof global.showToast === "function") { global.showToast(msg); return; }
    if (!document.body) return;
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.setAttribute("role", "status");
      toastEl.style.cssText =
        "position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(80px);" +
        "background:#111827;color:#fff;padding:12px 22px;border-radius:10px;opacity:0;" +
        "transition:all .3s;pointer-events:none;z-index:99999;max-width:92%;text-align:center;" +
        "font-family:'Segoe UI',Arial,sans-serif;font-size:14px";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.opacity = "1";
    toastEl.style.transform = "translateX(-50%) translateY(0)";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.style.opacity = "0";
      toastEl.style.transform = "translateX(-50%) translateY(80px)";
    }, 2200);
  }

  /* ---------- Page ma heart, count badge update ---------- */
  function paint() {
    if (!document.querySelectorAll) return;
    var list = read(), count = list.length;

    /* Navi rit: <button data-wish-toggle="5"> */
    document.querySelectorAll("[data-wish-toggle]").forEach(function (el) {
      var id = toId(el.getAttribute("data-wish-toggle"));
      var on = list.indexOf(id) !== -1;
      el.classList.toggle("on", on);
      el.setAttribute("aria-pressed", on ? "true" : "false");
      el.setAttribute("title", on ? "Pasandida ma thi hatavo" : "Pasandida ma umero");
      if (el.getAttribute("data-wish-text") !== "keep" && el.children.length === 0) {
        el.textContent = on ? "❤️" : "🤍";
      }
    });

    /* Juni rit (products.html / index.html): <button class="heart" data-wish="5"> */
    document.querySelectorAll(".heart[data-wish]").forEach(function (el) {
      var id = toId(el.getAttribute("data-wish"));
      if (el.children.length === 0) el.textContent = list.indexOf(id) !== -1 ? "❤️" : "🤍";
    });

    /* Header badge: <span data-wish-count></span> */
    document.querySelectorAll("[data-wish-count]").forEach(function (el) {
      el.textContent = count;
      if (el.hasAttribute("data-wish-hide-zero")) el.style.display = count === 0 ? "none" : "";
    });
  }

  /* ---------- Badha ne khabar aapo ---------- */
  function emit(type, id) {
    var list = read();
    var detail = { type: type, id: id, list: list, count: list.length };
    listeners.slice().forEach(function (fn) { try { fn(detail); } catch (e) {} });
    try { global.dispatchEvent(new CustomEvent("wishlist:change", { detail: detail })); } catch (e) {}
    paint();
  }

  /* =========================================================
     PUBLIC API
     ========================================================= */
  var Wishlist = {
    /* Badha id nu array (navu pehela) */
    get: function () { return read(); },

    count: function () { return read().length; },

    has: function (id) { return read().indexOf(toId(id)) !== -1; },

    /* Umero. true = wishlist ma chhe */
    add: function (id) {
      id = toId(id);
      if (!id) return false;
      var list = read();
      if (list.indexOf(id) !== -1) return true;
      if (list.length >= MAX) { toast("Wishlist bharai gayi (maximum " + MAX + ")"); return false; }
      list.unshift(id);
      if (!write(list)) { toast("Save na thayu (browser storage block chhe)"); return false; }
      emit("add", id);
      return true;
    },

    /* Hatavo. true = hatavyu */
    remove: function (id) {
      id = toId(id);
      var list = read();
      var i = list.indexOf(id);
      if (!id || i === -1) return false;
      list.splice(i, 1);
      if (!write(list)) { toast("Save na thayu (browser storage block chhe)"); return false; }
      emit("remove", id);
      return true;
    },

    /* Chalu / band. Return: have wishlist ma chhe ke nahi */
    toggle: function (id) {
      id = toId(id);
      if (!id) return false;
      if (Wishlist.has(id)) { Wishlist.remove(id); return false; }
      return Wishlist.add(id);
    },

    /* Badhu khali karo */
    clear: function () {
      if (!write([])) { toast("Save na thayu (browser storage block chhe)"); return false; }
      emit("clear", 0);
      return true;
    },

    /* Product list mathi fakt wishlist na products (navu pehela) */
    products: function (all) {
      if (!Array.isArray(all)) return [];
      var ids = read();
      return ids
        .map(function (id) { return all.filter(function (p) { return p && Number(p.id) === id; })[0]; })
        .filter(Boolean);
    },

    /* Badlav sambhalo. Return: band karvanu function */
    onChange: function (fn) {
      if (typeof fn !== "function") return function () {};
      listeners.push(fn);
      return function () {
        var i = listeners.indexOf(fn);
        if (i !== -1) listeners.splice(i, 1);
      };
    },

    /* Page ma pachho paint karo (navi cards render karya pachi) */
    refresh: paint
  };

  /* =========================================================
     AUTO: click, paint, biji tab sathe sync
     ========================================================= */
  document.addEventListener("click", function (e) {
    var el = e.target && e.target.closest ? e.target.closest("[data-wish-toggle]") : null;
    if (!el) return;
    e.preventDefault();
    var id = toId(el.getAttribute("data-wish-toggle"));
    if (!id) return;
    var now = Wishlist.toggle(id);
    toast(now ? "Pasandida ma umeryu ❤️" : "Pasandida ma thi hatavyu");
    if (now) {
      el.classList.remove("beat"); void el.offsetWidth; el.classList.add("beat");
    }
  });

  global.addEventListener("storage", function (e) {
    if (e.key === KEY || e.key === null) emit("sync", 0);
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paint);
  else paint();

  global.Wishlist = Wishlist;
})(window);