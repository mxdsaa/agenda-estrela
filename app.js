/* Agenda Estrela — editor de folhas A5 e gerador de PDF */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var EL = window.ELEMENTOS;
  var WD = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  var MO = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  var PAL = [["Rosa", "#E88AA6"], ["Lilás", "#A88BD8"], ["Azul", "#6FA3D8"], ["Verde", "#7FB98A"], ["Amarelo", "#E8C468"], ["Laranja", "#E8946A"], ["Preto", "#333333"], ["Bege", "#C9A982"], ["Cinza", "#999999"], ["Branco", "#FFFFFF"]];
  var FONT_GROUPS = [
    ["Manuscritas e delicadas", ["Dancing Script|wght@400;700", "Great Vibes", "Sacramento", "Satisfy", "Allura", "Parisienne", "Alex Brush", "Homemade Apple"]],
    ["Divertidas", ["Pacifico", "Caveat|wght@400;700", "Indie Flower", "Shadows Into Light", "Patrick Hand", "Gloria Hallelujah", "Amatic SC|wght@400;700", "Kalam|wght@400;700", "Handlee", "Coming Soon", "Lobster"]],
    ["Arredondadas", ["Comfortaa|wght@400;700", "Fredoka|wght@400;700", "Baloo 2|wght@400;700", "Quicksand|wght@400;700", "Nunito|ital,wght@0,400;0,700;1,400;1,700", "Varela Round"]],
    ["Modernas", ["Poppins|ital,wght@0,400;0,700;1,400;1,700", "Montserrat|ital,wght@0,400;0,700;1,400;1,700", "Raleway|ital,wght@0,400;0,700;1,400;1,700", "Josefin Sans|ital,wght@0,400;0,700;1,400;1,700", "Lato|ital,wght@0,400;0,700;1,400;1,700", "Bebas Neue"]],
    ["Elegantes", ["Playfair Display|ital,wght@0,400;0,700;1,400;1,700", "Lora|ital,wght@0,400;0,700;1,400;1,700", "Cormorant Garamond|ital,wght@0,400;0,700;1,400;1,700", "Libre Baskerville|ital,wght@0,400;0,700;1,400", "Abril Fatface", "Cinzel|wght@400;700", "DM Serif Display|ital@0;1"]],
    ["Retrô", ["Special Elite", "Courier Prime|ital,wght@0,400;0,700;1,400;1,700"]]
  ];
  var FONT_AXES = {}, FONT_NAMES = [];
  FONT_GROUPS.forEach(function (g) { g[1] = g[1].map(function (f) { var p = f.split("|"); FONT_AXES[p[0]] = p[1] || ""; FONT_NAMES.push(p[0]); return p[0]; }); });
  var TYPE_NAMES = { text: "Texto", date: "Data", hours: "Horários", tasks: "Tarefas", notes: "Anotações", holiday: "Feriado", footer: "Rodapé", svg: "Elemento", img: "Imagem" };
  var PT = 0.3528; // 1pt em mm
  var SAMPLE = new Date(2027, 0, 7);

  function two(n) { return (n < 10 ? "0" : "") + n; }
  function uid() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function toast(msg, ms) { var t = $("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { t.hidden = true; }, ms || 2600); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function timeout(p, ms) { return Promise.race([p, sleep(ms)]); }

  /* ---------------- Fontes ---------------- */
  var fontLinks = {};
  function fontCss(name) {
    if (fontLinks[name] || !(name in FONT_AXES)) return;
    var ax = FONT_AXES[name], l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=" + name.replace(/ /g, "+") + (ax ? ":" + ax : "") + "&display=swap";
    fontLinks[name] = new Promise(function (res) { l.onload = res; l.onerror = res; setTimeout(res, 5000); });
    document.head.appendChild(l);
  }
  var SAMPLE_TXT = "Quinta-feira 0123456789 ÁÉÍÓÚçãõâêô Horários Anotações";
  function loadFont(name, bold, italic) {
    fontCss(name);
    return timeout((fontLinks[name] || Promise.resolve()).then(function () {
      return document.fonts.load((italic ? "italic " : "") + (bold ? "700 " : "400 ") + "20px \"" + name + "\"", SAMPLE_TXT);
    }).catch(function () {}), 6000);
  }
  function fontsOfModels(models) {
    var s = {};
    models.forEach(function (m) { m.els.forEach(function (e) { if (e.font) s[e.font + "|" + (e.bold ? 1 : 0) + "|" + (e.italic ? 1 : 0)] = 1; if (e.font && "hours tasks notes".indexOf(e.type) > -1) s[e.font + "|1|0"] = 1; }); });
    return Object.keys(s);
  }
  function ensureFonts(models) {
    return Promise.all(fontsOfModels(models).map(function (k) { var p = k.split("|"); return loadFont(p[0], p[1] === "1", p[2] === "1"); }));
  }
  if (document.fonts) document.fonts.addEventListener("loadingdone", function () { draw(); });

  /* ---------------- Feriados ---------------- */
  var hc = {};
  function hkey(d) { return d.getMonth() + 1 + "-" + d.getDate(); }
  function holidays(y) {
    if (hc[y]) return hc[y];
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4,
      f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
      i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
      mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1;
    var r = { "1-1": "Confraternização Universal", "4-21": "Tiradentes", "5-1": "Dia do Trabalho", "9-7": "Independência do Brasil",
      "10-12": "Nossa Senhora Aparecida", "11-2": "Finados", "11-15": "Proclamação da República", "11-20": "Consciência Negra", "12-25": "Natal" };
    [[-48, "Carnaval"], [-47, "Carnaval"], [-2, "Sexta-feira Santa"], [60, "Corpus Christi"]].forEach(function (x) { r[hkey(new Date(y, mo - 1, da + x[0]))] = x[1]; });
    return (hc[y] = r);
  }

  /* ---------------- Projeto ---------------- */
  var DEF = {
    base: { rot: 0, op: 1, font: "Quicksand", size: 11, color: "#555555", tColor: "#E88AA6", bold: false, italic: false, align: "left", lineColor: "#D9CFD5", lineStyle: "solid", lineW: 0.25, boxBg: null, boxBorder: "none", boxColor: "#E88AA6" },
    text: { text: "Seu texto aqui", w: 70, h: 12, size: 14, color: "#555555" },
    date: { style: "extenso", template: "{semana}, {dia} de {mes}", showYear: false, upper: false, font: "Dancing Script", size: 22, color: "#E88AA6", bold: true, w: 130, h: 15 },
    hours: { title: "Horários", hfmt: "h", w: 62, h: 120, size: 8 },
    tasks: { title: "Tarefas", count: 6, w: 62, h: 50, size: 8 },
    notes: { title: "Anotações", kind: "linhas", spacing: 6, w: 62, h: 60, size: 8 },
    holiday: { size: 9, color: "#E88AA6", bold: true, w: 100, h: 6 },
    footer: { text: "Estrela de Maria", align: "center", size: 8, color: "#888888", w: 130, h: 6 },
    svg: { lib: "heart", c1: null, c2: null, w: 30, h: 30 },
    img: { img: null, w: 50, h: 50 }
  };
  function mk(type, p) {
    var e = Object.assign({ id: uid(), type: type, x: 20, y: 20 }, DEF.base, DEF[type], p || {});
    if (type === "svg") { var it = EL.byId[e.lib]; if (it) { e.c1 = e.c1 || it.c1; e.c2 = e.c2 || it.c2; } }
    return e;
  }

  function preset(name, W, H) {
    var half = H < 150, k = H / 210, fs = half ? 0.78 : 1, els = [];
    function P(type, x, y, w, h, p) { p = p || {}; if (p.size) p.size = Math.round(p.size * fs * 10) / 10; els.push(mk(type, Object.assign({ x: x, y: y * k, w: w, h: h * k }, p))); }
    var rosa = "#E88AA6", lil = "#A88BD8", foot = "Estrela de Maria";
    if (name === "lateral") {
      P("svg", 0, 0, 36, 210, { lib: "rect", c1: "#F9E1E9" });
      P("date", 3, half ? 12 : 14, 30, 64, { style: "grande", font: "Fredoka", bold: true, color: "#C9607F", align: "center" });
      P("holiday", 3, 80, 30, 14, { size: 8, align: "center", color: "#C9607F" });
      P("svg", 10, 180, 16, 16, { lib: "star", c1: rosa });
      P("hours", 42, 9, 97, 102, { font: "Quicksand", size: 8, tColor: "#C9607F" });
      P("tasks", 42, 117, 46, 74, { font: "Quicksand", size: 8, count: 6, tColor: "#C9607F" });
      P("notes", 93, 117, 46, 74, { font: "Quicksand", size: 8, tColor: "#C9607F" });
      P("footer", 42, 195, 97, 7, { text: foot, size: 8, font: "Dancing Script", color: "#C9607F" });
    } else if (name === "tarefas") {
      P("date", 9, 8, 130, 15, { style: "extenso", font: "Playfair Display", size: 20, color: lil, bold: true, italic: true });
      P("svg", 9, 23.5, 130, 3, { lib: "div-dots", c1: lil });
      P("holiday", 9, 27, 130, 6, { color: lil, size: 9 });
      P("tasks", 9, 34, 130, 44, { font: "Nunito", size: 9, count: half ? 3 : 5, tColor: lil, title: "Tarefas do dia" });
      P("hours", 9, 83, 62, 105, { font: "Nunito", size: 8, tColor: lil });
      P("notes", 77, 83, 62, 105, { font: "Nunito", size: 8, kind: "pontilhado", spacing: 5, tColor: lil, boxBorder: "arredondada", boxColor: "#D9CCF0" });
      P("footer", 9, 194, 130, 7, { text: foot, size: 8, color: lil });
    } else { // clássico
      P("date", 9, 8, 130, 16, { style: "extenso", font: "Dancing Script", size: 24, color: rosa, bold: true });
      P("svg", 9, 24.5, 130, 2, { lib: "line", c1: rosa });
      P("holiday", 9, 27.5, 130, 6, { color: rosa, size: 9, font: "Quicksand" });
      P("hours", 9, 35, 62, 152, { font: "Quicksand", size: 8, tColor: rosa });
      P("tasks", 77, 35, 62, 56, { font: "Quicksand", size: 8, count: half ? 4 : 7, tColor: rosa });
      P("notes", 77, 96, 62, 91, { font: "Quicksand", size: 8, tColor: rosa });
      P("svg", 70, 193.5, 8, 8, { lib: "star", c1: rosa });
      P("footer", 9, 194, 50, 7, { text: foot, size: 8, color: "#999999", align: "left" });
    }
    return els;
  }
  function newModel(W, H, presetName) { return { w: W, h: H, bg: { color: "#FFFFFF", img: null, op: 1 }, els: presetName ? preset(presetName, W, H) : [] }; }
  function defaultSlots() { var s = []; for (var h = 7; h <= 21; h++) s.push(h * 60); return s; }
  function newProject() {
    return {
      v: 1, fmt: 1, images: {},
      models: {
        "1": { frente: newModel(148, 210, "classico"), verso: newModel(148, 210, "classico") },
        "2": { frente: newModel(148, 105, "classico"), verso: newModel(148, 105, "classico") }
      },
      settings: { start: "2027-01-01", end: "2027-12-31", holidays: true, cutLine: true, slots: defaultSlots(), quality: "150" }
    };
  }

  var P = newProject();
  var ST = { side: "frente", sel: null, zoom: 1, tab: "texto", sheetOpen: true, step: 1, fontOpen: false, libCat: null };
  function M() { return P.models[P.fmt][ST.side]; }
  function selEl() { if (!ST.sel) return null; var m = M(); for (var i = 0; i < m.els.length; i++) if (m.els[i].id === ST.sel) return m.els[i]; return null; }

  /* ---------------- Armazenamento (IndexedDB) ---------------- */
  var dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise(function (res, rej) {
      var r = indexedDB.open("agenda-estrela", 1);
      r.onupgradeneeded = function () { r.result.createObjectStore("kv"); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
    return dbp;
  }
  function idbSet(k, v) { return db().then(function (d) { return new Promise(function (res, rej) { var t = d.transaction("kv", "readwrite"); t.objectStore("kv").put(v, k); t.oncomplete = res; t.onerror = function () { rej(t.error); }; }); }); }
  function idbGet(k) { return db().then(function (d) { return new Promise(function (res, rej) { var r = d.transaction("kv").objectStore("kv").get(k); r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; }); }); }
  function pruneImages() {
    var used = {};
    ["1", "2"].forEach(function (f) { ["frente", "verso"].forEach(function (s) { var m = P.models[f][s]; if (m.bg.img) used[m.bg.img] = 1; m.els.forEach(function (e) { if (e.img) used[e.img] = 1; }); }); });
    hist.forEach(function (h) { (h.match(/"img":"[^"]+"/g) || []).forEach(function (x) { used[x.slice(7, -1)] = 1; }); });
    Object.keys(P.images).forEach(function (k) { if (!used[k]) delete P.images[k]; });
  }
  var saveT;
  function save() {
    clearTimeout(saveT);
    saveT = setTimeout(function () {
      pruneImages();
      idbSet("project", JSON.stringify(P)).catch(function () {
        try { localStorage.setItem("agenda-estrela", JSON.stringify(P)); } catch (e) { toast("Não consegui salvar no celular. Use “Salvar modelo”."); }
      });
    }, 600);
  }

  /* ---------------- Histórico (desfazer/refazer) ---------------- */
  var hist = [], hi = -1, commitT;
  function snap() { return JSON.stringify({ fmt: P.fmt, models: P.models }); }
  function commit() {
    clearTimeout(commitT);
    var s = snap();
    if (hist[hi] === s) return;
    hist = hist.slice(0, hi + 1); hist.push(s);
    if (hist.length > 60) hist.shift();
    hi = hist.length - 1; undoBtns(); save();
  }
  function later() { clearTimeout(commitT); commitT = setTimeout(commit, 450); }
  function restore(s) { var o = JSON.parse(s); P.fmt = o.fmt; P.models = o.models; if (!selEl()) ST.sel = null; syncTop(); layout(); renderPanel(); save(); }
  function undo() { commit(); if (hi > 0) { hi--; restore(hist[hi]); undoBtns(); } }
  function redo() { if (hi < hist.length - 1) { hi++; restore(hist[hi]); undoBtns(); } }
  function undoBtns() { $("btnUndo").disabled = hi <= 0; $("btnRedo").disabled = hi >= hist.length - 1; }

  /* ---------------- Imagens e elementos SVG ---------------- */
  var imgCache = {}, svgCache = {}, svgLast = {};
  function upImg(id) {
    if (!id || !P.images[id]) return null;
    var c = imgCache[id];
    if (!c) {
      c = imgCache[id] = { img: new Image(), ok: false };
      c.p = new Promise(function (res) { c.img.onload = function () { c.ok = true; res(); draw(); }; c.img.onerror = res; });
      c.img.src = P.images[id];
    }
    return c;
  }
  function svgKey(e) { var it = EL.byId[e.lib]; return e.lib + "|" + e.c1 + "|" + e.c2 + (it && it.stretch ? "|" + (e.w / e.h).toFixed(2) : ""); }
  function svgImg(e) {
    var it = EL.byId[e.lib]; if (!it) return null;
    var key = svgKey(e), c = svgCache[key];
    if (!c) {
      var a = it.stretch ? e.w / e.h : EL.aspect(e.lib), W = a >= 1 ? 1000 : 1000 * a, H = a >= 1 ? 1000 / a : 1000;
      c = svgCache[key] = { img: new Image(), ok: false };
      c.p = new Promise(function (res) {
        c.img.onload = function () { c.ok = true; svgLast[e.lib] = c; res(); draw(); };
        c.img.onerror = res;
      });
      c.img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(EL.svg(e.lib, e.c1, e.c2, W, H));
    }
    return c.ok ? c : (svgLast[e.lib] || c);
  }
  function ensureAssets(models) {
    var ps = [ensureFonts(models)];
    models.forEach(function (m) {
      if (m.bg.img) { var b = upImg(m.bg.img); if (b) ps.push(b.p); }
      m.els.forEach(function (e) {
        if (e.type === "img") { var c = upImg(e.img); if (c) ps.push(c.p); }
        if (e.type === "svg") { svgImg(e); var s = svgCache[svgKey(e)]; if (s) ps.push(s.p); }
      });
    });
    return timeout(Promise.all(ps), 15000);
  }

  /* ---------------- Desenho ---------------- */
  function fontStr(e, mm, bold) { return (e.italic ? "italic " : "") + ((bold == null ? e.bold : bold) ? "700 " : "400 ") + mm.toFixed(3) + "px \"" + e.font + "\", sans-serif"; }
  function dash(ctx, st, w) { ctx.setLineDash(st === "tracejada" ? [w * 5, w * 3.5] : st === "pontilhada" ? [0.01, w * 3.2] : []); ctx.lineCap = st === "pontilhada" ? "round" : "butt"; if (st === "pontilhada") ctx.lineWidth = w * 1.8; }
  function rr(ctx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function dateParts(d) {
    var wd = WD[d.getDay()];
    return { dia: String(d.getDate()), dd: two(d.getDate()), semana: cap(wd), sem: wd.slice(0, 3), mes: MO[d.getMonth()], mm: two(d.getMonth() + 1), mes3: MO[d.getMonth()].slice(0, 3), ano: String(d.getFullYear()), curta: wd.split("-")[0] };
  }
  function dateText(e, d) {
    var p = dateParts(d), t;
    if (e.style === "numerico") t = p.dd + "/" + p.mm + "/" + p.ano + " · " + p.curta;
    else if (e.style === "custom") t = (e.template || "").replace(/\{(\w+)\}/g, function (m, k) { return p[k] != null ? p[k] : m; });
    else t = p.semana + ", " + p.dia + " de " + p.mes + (e.showYear ? " de " + p.ano : "");
    return e.upper ? t.toUpperCase() : t;
  }
  function slotLabels(e) {
    return P.settings.slots.slice().sort(function (a, b) { return a - b; }).map(function (m) {
      var h = Math.floor(m / 60), mi = m % 60;
      return e.hfmt === ":" ? two(h) + ":" + two(mi) : two(h) + "h" + (mi ? two(mi) : "");
    });
  }
  function alignX(e, w, tw) { return e.align === "center" ? (w - tw) / 2 : e.align === "right" ? w - tw : 0; }
  function oneLine(ctx, e, txt, w, h) {
    var fs = e.size * PT;
    ctx.font = fontStr(e, fs);
    var tw = ctx.measureText(txt).width;
    if (tw > w && tw > 0) { fs = fs * w / tw; ctx.font = fontStr(e, fs); tw = ctx.measureText(txt).width; }
    ctx.fillStyle = e.color; ctx.textBaseline = "middle";
    ctx.fillText(txt, alignX(e, w, tw), h / 2);
  }
  function wrap(ctx, text, maxW) {
    var out = [];
    String(text).split("\n").forEach(function (para) {
      var words = para.split(" "), line = "";
      words.forEach(function (w) {
        var t = line ? line + " " + w : w;
        if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t;
      });
      out.push(line);
    });
    return out;
  }
  function blockTitle(ctx, e, w) {
    if (!e.title) return 0;
    var fs = e.size * PT * 1.12;
    ctx.font = fontStr(e, fs, true); ctx.fillStyle = e.tColor; ctx.textBaseline = "alphabetic";
    var tw = ctx.measureText(e.title).width, x = alignX(e, w, tw);
    ctx.fillText(e.title, x, fs * 0.95);
    return fs * 1.55;
  }
  function hline(ctx, e, x1, x2, y) { ctx.save(); ctx.strokeStyle = e.lineColor; ctx.lineWidth = e.lineW; dash(ctx, e.lineStyle, e.lineW); ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke(); ctx.restore(); }

  function drawEl(ctx, e, data) {
    var w = e.w, h = e.h;
    ctx.save();
    ctx.globalAlpha = e.op == null ? 1 : e.op;
    ctx.translate(e.x + w / 2, e.y + h / 2);
    if (e.rot) ctx.rotate(e.rot * Math.PI / 180);
    ctx.translate(-w / 2, -h / 2);
    var hasBox = e.boxBg || (e.boxBorder && e.boxBorder !== "none");
    if (hasBox && e.type !== "svg" && e.type !== "img") {
      rr(ctx, 0, 0, w, h, e.boxBorder === "arredondada" ? 3 : 0);
      if (e.boxBg) { ctx.fillStyle = e.boxBg; ctx.fill(); }
      if (e.boxBorder !== "none") { ctx.strokeStyle = e.boxColor; ctx.lineWidth = 0.3; ctx.stroke(); }
      var pad = 2; ctx.translate(pad, pad); w -= pad * 2; h -= pad * 2;
    }
    var t = e.type;
    if (t === "text" || t === "footer") {
      var fs = e.size * PT; ctx.font = fontStr(e, fs); ctx.fillStyle = e.color; ctx.textBaseline = "middle";
      if (t === "footer") oneLine(ctx, e, e.text || "", w, h);
      else wrap(ctx, e.text || "", w).forEach(function (ln, i) { ctx.fillText(ln, alignX(e, w, ctx.measureText(ln).width), fs * 1.25 * (i + 0.5)); });
    } else if (t === "holiday") {
      var hol = data.sample ? "Natal (só nos feriados)" : data.hol;
      if (hol) oneLine(ctx, e, e.upper ? hol.toUpperCase() : hol, w, h);
    } else if (t === "date") {
      if (data.date) { if (e.style === "grande") drawBigDate(ctx, e, data.date, w, h); else oneLine(ctx, e, dateText(e, data.date), w, h); }
    } else if (t === "hours") {
      var top = blockTitle(ctx, e, w), labels = slotLabels(e), n = labels.length;
      if (n) {
        var f = e.size * PT, avail = h - top, rowsFit = Math.max(1, Math.floor(avail / (f * 1.9))), cols = Math.min(3, Math.ceil(n / rowsFit)), rows = Math.ceil(n / cols), rowH = avail / rows;
        if (rowH < f * 1.35) f = rowH / 1.35;
        var gap = 3, cw = (w - gap * (cols - 1)) / cols;
        ctx.font = fontStr(e, f); ctx.fillStyle = e.color; ctx.textBaseline = "alphabetic";
        labels.forEach(function (lb, i) {
          var c = Math.floor(i / rows), r = i % rows, x = c * (cw + gap), yb = top + (r + 1) * rowH;
          ctx.fillText(lb, x, yb - Math.max(0.6, rowH * 0.14));
          hline(ctx, e, x, x + cw, yb);
        });
      }
    } else if (t === "tasks") {
      var tp = blockTitle(ctx, e, w), cnt = Math.max(1, e.count | 0), rh = (h - tp) / cnt, bx = Math.min(rh * 0.55, e.size * PT * 1.1);
      for (var i = 0; i < cnt; i++) {
        var yb = tp + (i + 1) * rh;
        ctx.save(); ctx.strokeStyle = e.tColor; ctx.lineWidth = 0.25; rr(ctx, 0.2, yb - bx - Math.max(0.6, rh * 0.15), bx, bx, bx * 0.2); ctx.stroke(); ctx.restore();
        hline(ctx, e, bx + 1.5, w, yb);
      }
    } else if (t === "notes") {
      var tn = blockTitle(ctx, e, w), sp = Math.max(2, +e.spacing || 6);
      if (e.kind === "pontilhado") {
        ctx.fillStyle = e.lineColor;
        var r0 = Math.max(0.22, e.lineW * 1.1);
        for (var yy = tn + sp / 2; yy <= h; yy += sp) for (var xx = sp / 2; xx <= w; xx += sp) { ctx.beginPath(); ctx.arc(xx, yy, r0, 0, 7); ctx.fill(); }
      } else if (e.kind === "linhas") {
        for (var y2 = tn + sp; y2 <= h + 0.01; y2 += sp) hline(ctx, e, 0, w, y2);
      }
    } else if (t === "svg") {
      var c = svgImg(e);
      if (c && c.ok) ctx.drawImage(c.img, 0, 0, w, h);
    } else if (t === "img") {
      var ci = upImg(e.img);
      if (ci && ci.ok) ctx.drawImage(ci.img, 0, 0, w, h);
      else if (data.sample) { ctx.fillStyle = "#f3e8ee"; ctx.fillRect(0, 0, w, h); }
    }
    ctx.restore();
  }
  function drawBigDate(ctx, e, d, w, h) {
    var p = dateParts(d), num = p.dd, wd = p.sem.toUpperCase(), mo = p.mes3.toUpperCase();
    ctx.fillStyle = e.color; ctx.textBaseline = "alphabetic";
    var big = function (s) { ctx.font = fontStr(e, s, true); }, small = function (s) { ctx.font = fontStr(e, s); };
    if (w >= h * 1.3) { // horizontal: 07 | QUI / JAN
      var F = h * 1.05, S, nw, sw, tot;
      for (var k = 0; k < 2; k++) {
        S = F * 0.36; big(F); nw = ctx.measureText(num).width; small(S); sw = Math.max(ctx.measureText(wd).width, ctx.measureText(mo).width);
        tot = nw + F * 0.12 + sw; if (tot > w) F *= w / tot; else break;
      }
      S = F * 0.36; big(F); nw = ctx.measureText(num).width; small(S); sw = Math.max(ctx.measureText(wd).width, ctx.measureText(mo).width);
      tot = nw + F * 0.12 + sw;
      var x0 = alignX(e, w, tot), base = h / 2 + F * 0.36;
      big(F); ctx.fillText(num, x0, base);
      small(S); ctx.fillText(wd, x0 + nw + F * 0.12, base - F * 0.72 + S * 0.85); ctx.fillText(mo, x0 + nw + F * 0.12, base);
    } else { // vertical: 07 / QUI / JAN
      var F2 = h * 0.5, S2;
      for (var j = 0; j < 3; j++) {
        S2 = F2 * 0.34; big(F2); var w1 = ctx.measureText(num).width; small(S2); var w2 = Math.max(ctx.measureText(wd).width, ctx.measureText(mo).width);
        var mw = Math.max(w1, w2), th = F2 * 0.75 + S2 * 2.6;
        var sc = Math.min(w / mw, h / th); if (sc < 1 || j === 0) F2 *= Math.min(sc, 1.6); else break;
      }
      S2 = F2 * 0.34;
      var total = F2 * 0.75 + S2 * 2.6, y0 = (h - total) / 2 + F2 * 0.75;
      var cx = function (s) { var tw = ctx.measureText(s).width; return e.align === "left" ? 0 : e.align === "right" ? w - tw : (w - tw) / 2; };
      big(F2); ctx.fillText(num, cx(num), y0);
      small(S2); ctx.fillText(wd, cx(wd), y0 + S2 * 1.35); ctx.fillText(mo, cx(mo), y0 + S2 * 2.6);
    }
  }
  function drawModel(ctx, m, data) {
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, m.w, m.h); ctx.clip();
    ctx.fillStyle = m.bg.color || "#fff"; ctx.fillRect(0, 0, m.w, m.h);
    if (m.bg.img) {
      var c = upImg(m.bg.img);
      if (c && c.ok) {
        var iw = c.img.naturalWidth, ih = c.img.naturalHeight, s = Math.max(m.w / iw, m.h / ih);
        ctx.globalAlpha = m.bg.op == null ? 1 : m.bg.op;
        ctx.drawImage(c.img, (m.w - iw * s) / 2, (m.h - ih * s) / 2, iw * s, ih * s);
        ctx.globalAlpha = 1;
      }
    }
    m.els.forEach(function (e) { drawEl(ctx, e, data); });
    ctx.restore();
  }

  /* ---------------- Dias e páginas ---------------- */
  function parseD(v) { var p = (v || "").split("-"); return p.length === 3 ? new Date(+p[0], p[1] - 1, +p[2]) : null; }
  function dayList() {
    var a = parseD(P.settings.start), b = parseD(P.settings.end);
    if (!a || !b || b < a) return null;
    var n = Math.round((b - a) / 864e5) + 1;
    if (n > 800) return null;
    var out = [];
    for (var i = 0; i < n; i++) out.push(new Date(a.getFullYear(), a.getMonth(), a.getDate() + i));
    return out;
  }
  function dayData(d) { return { date: d, hol: d && P.settings.holidays ? holidays(d.getFullYear())[hkey(d)] || "" : "", sample: false }; }
  function pageCount(days) { return Math.ceil(days.length / (P.fmt === 2 ? 2 : 1)); }
  function renderPage(ctx, days, pi, pxmm) {
    ctx.setTransform(pxmm, 0, 0, pxmm, 0, 0);
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 148, 210);
    var side = pi % 2 === 0 ? "frente" : "verso", m = P.models[P.fmt][side];
    if (P.fmt === 2) {
      for (var j = 0; j < 2; j++) {
        var d = days[pi * 2 + j];
        if (!d) continue;
        ctx.save(); ctx.translate(0, j * 105); drawModel(ctx, m, dayData(d)); ctx.restore();
      }
      if (P.settings.cutLine) { ctx.save(); ctx.strokeStyle = "#cccccc"; ctx.lineWidth = 0.2; ctx.setLineDash([1.5, 1.5]); ctx.beginPath(); ctx.moveTo(0, 105); ctx.lineTo(148, 105); ctx.stroke(); ctx.restore(); }
    } else drawModel(ctx, m, dayData(days[pi]));
  }

  /* ---------------- Editor: palco ---------------- */
  var cv = $("cv"), cx = cv.getContext("2d"), stage = $("stage"), wrapEl = $("stageWrap"), selBox = $("sel");
  var scale = 3; // px por mm (CSS)
  var fitH = 0;
  function fitScale() {
    var m = M(), aw = wrapEl.clientWidth - 24;
    if (!document.body.classList.contains("editing") || !fitH) fitH = wrapEl.clientHeight - 24;
    return Math.max(0.5, Math.min(aw / m.w, fitH > 100 ? fitH / m.h : 99));
  }
  function showSel() {
    var e = selEl(); if (!e) return;
    var top = e.y * scale + 12, bot = (e.y + e.h) * scale + 12, vh = wrapEl.clientHeight;
    if (top < wrapEl.scrollTop || bot > wrapEl.scrollTop + vh) wrapEl.scrollTop = Math.max(0, (top + bot) / 2 - vh / 2);
  }
  function layout() {
    var m = M(); scale = fitScale() * ST.zoom;
    var cw = m.w * scale, ch = m.h * scale;
    stage.style.width = cw + "px"; stage.style.height = ch + "px";
    var dpr = Math.min(window.devicePixelRatio || 1, 3);
    while (cw * dpr * ch * dpr > 16e6 && dpr > 0.5) dpr -= 0.25;
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr); cv._dpr = dpr;
    $("zFit").textContent = Math.round(ST.zoom * 100) + "%";
    draw();
  }
  var rafP = false;
  function draw() {
    if (rafP) return; rafP = true;
    requestAnimationFrame(function () {
      rafP = false;
      if (ST.step !== 1) return;
      var m = M(), k = scale * (cv._dpr || 1);
      cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, cv.width, cv.height);
      cx.setTransform(k, 0, 0, k, 0, 0);
      drawModel(cx, m, { date: SAMPLE, hol: "", sample: true });
      updSel();
    });
  }
  function updSel() {
    var e = selEl();
    if (!e) { selBox.hidden = true; return; }
    selBox.hidden = false;
    selBox.style.left = e.x * scale + "px"; selBox.style.top = e.y * scale + "px";
    selBox.style.width = Math.max(4, e.w * scale) + "px"; selBox.style.height = Math.max(4, e.h * scale) + "px";
    selBox.style.transform = "rotate(" + (e.rot || 0) + "deg)";
  }
  function toMm(ev) { var r = cv.getBoundingClientRect(); return { x: (ev.clientX - r.left) / scale, y: (ev.clientY - r.top) / scale }; }
  function local(e, p) {
    var cxm = e.x + e.w / 2, cym = e.y + e.h / 2, a = -(e.rot || 0) * Math.PI / 180, dx = p.x - cxm, dy = p.y - cym;
    return { x: dx * Math.cos(a) - dy * Math.sin(a) + e.w / 2, y: dx * Math.sin(a) + dy * Math.cos(a) + e.h / 2 };
  }
  function hit(p) {
    var els = M().els, tol = 2.5 / Math.max(1, scale / 3);
    for (var i = els.length - 1; i >= 0; i--) {
      var e = els[i], l = local(e, p), tx = Math.max(tol, (6 - e.w) / 2), ty = Math.max(tol, (6 - e.h) / 2);
      if (l.x >= -tx && l.x <= e.w + tx && l.y >= -ty && l.y <= e.h + ty) return e;
    }
    return null;
  }
  var ptrs = {}, G = null;
  function pdist() { var k = Object.keys(ptrs); if (k.length < 2) return 0; var a = ptrs[k[0]], b = ptrs[k[1]]; return Math.hypot(a.x - b.x, a.y - b.y); }
  function pmid() { var k = Object.keys(ptrs), a = ptrs[k[0]], b = ptrs[k[1]]; return { clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 }; }
  wrapEl.addEventListener("pointerdown", function (ev) {
    ptrs[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
    try { wrapEl.setPointerCapture(ev.pointerId); } catch (x) {}
    var n = Object.keys(ptrs).length;
    if (n === 2) {
      if (G && G.moved && G.orig) { Object.assign(G.el, G.orig); }
      if (G && G.mode === "drag" && G.opened) { ST.sel = G.prevSel; renderPanel(); }
      var mid = pmid(), mm = toMm(mid);
      G = { mode: "pinch", d0: pdist(), z0: ST.zoom, mm: mm };
      return;
    }
    if (n > 2) return;
    var p = toMm(ev), h = ev.target.dataset && ev.target.dataset.h, e = selEl();
    if (h && e) {
      G = { mode: h, el: e, orig: { x: e.x, y: e.y, w: e.w, h: e.h, rot: e.rot }, p0: p, moved: false };
    } else {
      var t = hit(p);
      if (t) {
        var changed = ST.sel !== t.id, prevSel = ST.sel;
        ST.sel = t.id; if (changed) renderPanel();
        G = { mode: "drag", el: t, orig: { x: t.x, y: t.y }, p0: p, moved: false, opened: changed, prevSel: prevSel };
        updSel();
      } else {
        G = { mode: "pan", sx: wrapEl.scrollLeft, sy: wrapEl.scrollTop, c0: { x: ev.clientX, y: ev.clientY }, moved: false };
      }
    }
    ev.preventDefault();
  });
  wrapEl.addEventListener("pointermove", function (ev) {
    if (!ptrs[ev.pointerId]) return;
    ptrs[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
    if (!G) return;
    var m = M();
    if (G.mode === "pinch") {
      var d = pdist(); if (!G.d0 || !d) return;
      setZoom(G.z0 * d / G.d0, pmid(), G.mm); return;
    }
    if (G.mode === "pan") {
      var dx = ev.clientX - G.c0.x, dy = ev.clientY - G.c0.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) G.moved = true;
      wrapEl.scrollLeft = G.sx - dx; wrapEl.scrollTop = G.sy - dy; return;
    }
    var p = toMm(ev), e = G.el, o = G.orig;
    if (!G.moved && Math.hypot(p.x - G.p0.x, p.y - G.p0.y) * scale < 4) return;
    G.moved = true;
    if (G.mode === "drag") {
      var nx = o.x + p.x - G.p0.x, ny = o.y + p.y - G.p0.y;
      var c = nx + e.w / 2; if (Math.abs(c - m.w / 2) < 1.2) nx = m.w / 2 - e.w / 2; // ímã no centro
      e.x = Math.round(nx * 10) / 10; e.y = Math.round(ny * 10) / 10;
    } else if (G.mode === "res") {
      var a = (o.rot || 0) * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux;
      var ocx = o.x + o.w / 2, ocy = o.y + o.h / 2;
      var Ax = ocx - ux * o.w / 2 - vx * o.h / 2, Ay = ocy - uy * o.w / 2 - vy * o.h / 2; // canto sup. esq.
      var dxp = p.x - Ax, dyp = p.y - Ay, nw = Math.max(3, dxp * ux + dyp * uy), nh = Math.max(2, dxp * vx + dyp * vy);
      var lock = e.type === "img" || (e.type === "svg" && EL.byId[e.lib] && !EL.byId[e.lib].stretch);
      if (lock) { var r = o.h / o.w; if (nh / nw > r) nw = nh / r; else nh = nw * r; }
      e.w = Math.round(nw * 10) / 10; e.h = Math.round(nh * 10) / 10;
      var ncx = Ax + ux * e.w / 2 + vx * e.h / 2, ncy = Ay + uy * e.w / 2 + vy * e.h / 2;
      e.x = Math.round((ncx - e.w / 2) * 10) / 10; e.y = Math.round((ncy - e.h / 2) * 10) / 10;
    } else if (G.mode === "rot") {
      var ccx = o.x + o.w / 2, ccy = o.y + o.h / 2, ang = Math.atan2(p.y - ccy, p.x - ccx) * 180 / Math.PI + 90;
      ang = ((ang % 360) + 360) % 360; if (ang > 180) ang -= 360;
      [0, 90, -90, 180, -180].forEach(function (s) { if (Math.abs(ang - s) < 4) ang = s; });
      e.rot = Math.round(ang);
    }
    draw();
  });
  function pend(ev) {
    if (!ptrs[ev.pointerId]) return;
    delete ptrs[ev.pointerId];
    if (!G) return;
    if (G.mode === "pinch") { if (Object.keys(ptrs).length === 0) G = null; else G = { mode: "none" }; return; }
    if (G.mode === "pan" && !G.moved && ev.type === "pointerup" && ST.sel) { ST.sel = null; updSel(); renderPanel(); openSheet(false); }
    if (G.moved && G.el) { commit(); if (ST.tab === "pos") renderPanel(); }
    if (G.mode === "drag" && !G.moved && !ST.sheetOpen && $("libPanel").hidden) openSheet(true);
    G = null;
  }
  wrapEl.addEventListener("pointerup", pend);
  wrapEl.addEventListener("pointercancel", pend);
  wrapEl.addEventListener("wheel", function (ev) { if (ev.ctrlKey) { ev.preventDefault(); setZoom(ST.zoom * (ev.deltaY < 0 ? 1.1 : 0.9), ev, toMm(ev)); } }, { passive: false });
  function setZoom(z, anchorClient, anchorMm) {
    ST.zoom = Math.max(0.5, Math.min(5, z));
    layout();
    if (anchorClient && anchorMm) {
      var r = cv.getBoundingClientRect();
      var nowX = r.left + anchorMm.x * scale, nowY = r.top + anchorMm.y * scale;
      wrapEl.scrollLeft += nowX - anchorClient.clientX; wrapEl.scrollTop += nowY - anchorClient.clientY;
    }
  }
  $("zIn").onclick = function () { setZoom(ST.zoom * 1.25); };
  $("zOut").onclick = function () { setZoom(ST.zoom / 1.25); };
  $("zFit").onclick = function () { setZoom(1); wrapEl.scrollTop = 0; wrapEl.scrollLeft = 0; };
  window.addEventListener("resize", function () { clearTimeout(layout.t); layout.t = setTimeout(layout, 150); });

  /* ---------------- Adicionar elementos ---------------- */
  function place(e) {
    var m = M(), k = m.h < 150 ? 0.6 : 1;
    if (e.type !== "img" && e.type !== "svg") { e.h = Math.min(e.h * k, m.h * 0.8); e.w = Math.min(e.w, m.w - 10); }
    var n = m.els.length % 6;
    e.x = Math.round((m.w - e.w) / 2 + n * 3); e.y = Math.round(Math.max(2, (m.h - e.h) / 2 + n * 3));
    m.els.push(e); ST.sel = e.id; commit(); draw(); renderPanel(); if ($("libPanel").hidden) openSheet(true); else updSel();
  }
  $("addbar").addEventListener("click", function (ev) {
    var b = ev.target.closest("button[data-add]"); if (!b) return;
    var t = b.dataset.add;
    if (t === "shape") { openLib("Formas"); return; }
    var e = mk(t);
    if (t === "tasks" || t === "hours" || t === "notes") e.tColor = "#E88AA6";
    fontCss(e.font);
    place(e);
  });
  function addSvg(id) {
    var it = EL.byId[id], a = EL.aspect(id), m = M(), base = it.stretch && a > 2.5 ? 90 : 34;
    if (m.h < 150) base *= 0.7;
    var w = a >= 1 ? base : base * a, h = a >= 1 ? base / a : base;
    if (h > m.h * 0.9) { h = m.h * 0.9; w = h * a; }
    place(mk("svg", { lib: id, w: Math.round(w * 10) / 10, h: Math.round(h * 10) / 10 }));
    toast("“" + it.name + "” adicionado");
  }
  /* biblioteca */
  var libTiles = {};
  function tileSrc(id) { return libTiles[id] || (libTiles[id] = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(EL.svg(id))); }
  function renderLib() {
    var q = $("libSearch").value.trim(), items = q ? EL.search(q) : EL.list.filter(function (e) { return e.cat === ST.libCat; });
    $("libCats").innerHTML = EL.cats.map(function (c) { return '<button type="button" data-cat="' + esc(c) + '" class="' + (!q && c === ST.libCat ? "on" : "") + '">' + esc(c) + "</button>"; }).join("");
    $("libGrid").innerHTML = items.length ? items.map(function (e) {
      return '<button type="button" data-lib="' + e.id + '" title="' + esc(e.name) + '"><img loading="lazy" alt="" src="' + tileSrc(e.id) + '"><span>' + esc(e.name) + "</span></button>";
    }).join("") : "<p>Nada encontrado. Tente outra palavra.</p>";
  }
  function openLib(cat) { ST.libCat = cat || ST.libCat || EL.cats[0]; $("libSearch").value = ""; $("libPanel").hidden = false; renderLib(); openSheet(false); }
  $("btnLib").onclick = function () { if ($("libPanel").hidden) openLib(); else $("libPanel").hidden = true; };
  $("libClose").onclick = function () { $("libPanel").hidden = true; if (selEl()) openSheet(true); };
  $("libSearch").addEventListener("input", renderLib);
  $("libCats").addEventListener("click", function (ev) { var b = ev.target.closest("button"); if (!b) return; ST.libCat = b.dataset.cat; $("libSearch").value = ""; renderLib(); $("libGrid").scrollTop = 0; });
  $("libGrid").addEventListener("click", function (ev) { var b = ev.target.closest("button[data-lib]"); if (b) addSvg(b.dataset.lib); });

  /* imagens da usuária */
  function readImage(file) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () {
        var im = new Image();
        im.onload = function () {
          var max = 1800, w = im.naturalWidth, h = im.naturalHeight, s = Math.min(1, max / Math.max(w, h));
          var keepPng = !/jpe?g/i.test(file.type);
          if (s === 1 && fr.result.length < 3e6) return res({ url: fr.result, w: w, h: h });
          var c = document.createElement("canvas"); c.width = Math.round(w * s); c.height = Math.round(h * s);
          c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
          res({ url: c.toDataURL(keepPng ? "image/png" : "image/jpeg", 0.9), w: c.width, h: c.height });
        };
        im.onerror = function () { rej(new Error("img")); };
        im.src = fr.result;
      };
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }
  $("fileImg").addEventListener("change", function () {
    var files = Array.prototype.slice.call(this.files || []); this.value = "";
    if (!files.length) return;
    var m = M(), n = 0;
    files.reduce(function (pr, f) {
      return pr.then(function () {
        return readImage(f).then(function (r) {
          var id = "im" + uid(); P.images[id] = r.url;
          var a = r.w / r.h, base = Math.min(60, m.w * 0.45), w = a >= 1 ? base : base * a, h = a >= 1 ? base / a : base;
          var e = mk("img", { img: id, w: Math.round(w * 10) / 10, h: Math.round(h * 10) / 10 });
          e.x = Math.round((m.w - w) / 2 + n * 6); e.y = Math.round(Math.max(2, (m.h - h) / 2 + n * 6)); n++;
          m.els.push(e); ST.sel = e.id; upImg(id);
        }).catch(function () { toast("Não consegui abrir uma das imagens."); });
      });
    }, Promise.resolve()).then(function () { commit(); draw(); renderPanel(); openSheet(true); if (n) toast(n === 1 ? "Imagem adicionada" : n + " imagens adicionadas"); });
  });
  $("fileBg").addEventListener("change", function () {
    var f = this.files && this.files[0]; this.value = ""; if (!f) return;
    readImage(f).then(function (r) { var id = "im" + uid(); P.images[id] = r.url; M().bg.img = id; upImg(id); commit(); draw(); ST.sel = null; renderPanel(); toast("Fundo da folha colocado"); });
  });

  /* ---------------- Painel inferior ---------------- */
  var sheet = $("sheet"), body = $("sheetBody");
  function openSheet(o) {
    ST.sheetOpen = o; sheet.classList.toggle("closed", !o);
    document.body.classList.toggle("editing", !!(o && selEl()));
    setTimeout(showSel, 30);
  }
  $("btnDone").onclick = function () { ST.sel = null; ST.fontOpen = false; renderPanel(); openSheet(false); updSel(); };
  $("sheetToggle").onclick = function () { openSheet(!ST.sheetOpen); };
  $("tabs").addEventListener("click", function (ev) { var b = ev.target.closest("button"); if (!b) return; ST.tab = b.dataset.tab; ST.fontOpen = false; ST.colorOpen = null; openSheet(true); renderPanel(); });
  function elLabel(e) {
    if (e.type === "svg") return (EL.byId[e.lib] || {}).name || "Elemento";
    if (e.type === "text" || e.type === "footer") return TYPE_NAMES[e.type] + ": " + (e.text || "").slice(0, 22);
    return TYPE_NAMES[e.type];
  }
  /* ----- Painel de cores (o mesmo para todas as opções de cor) ----- */
  var COLOR_GROUPS = [
    ["Estrela de Maria", ["#E88AA6", "#A88BD8", "#6FA3D8", "#7FB98A", "#E8C468", "#E8946A", "#333333", "#C9A982"]],
    ["Tons pastel", ["#FADADD", "#F9C6D3", "#F3D1F4", "#DCCFF5", "#CFE0F7", "#C9EEF0", "#CDEFD7", "#E6F5C8", "#FFF4C2", "#FFE0C7"]],
    ["Vivos", ["#E53950", "#FF5C8A", "#D63CA8", "#8E44D9", "#3D6BE0", "#1FA6D9", "#14B39A", "#3DBE55", "#F5C518", "#FF8A1F"]],
    ["Terrosos", ["#8A5A3C", "#A86B4A", "#C68B59", "#D9A679", "#B5651D", "#9C4A3B", "#7A6A45", "#8F9A6B", "#6B7F5A", "#C2A88F"]],
    ["Neutros e cinzas", ["#FFFFFF", "#F7F4F2", "#EDE8E4", "#E0DCDA", "#CCCCCC", "#B3B3B3", "#999999", "#808080", "#666666", "#4D4D4D"]],
    ["Escuros", ["#333333", "#1F1F1F", "#000000", "#2E3A59", "#1F4E5F", "#2F4F3A", "#5B2A3C", "#4A2C6B", "#5C3A21", "#3B3B4F"]],
    ["Metálicos", ["#D4AF37", "#E6C77A", "#C0C0C0", "#B8BCC2", "#B76E79", "#E8B4A8", "#CD7F32", "#B87333"]]
  ];
  var METAL = { "#D4AF37": "Dourado", "#E6C77A": "Ouro claro", "#C0C0C0": "Prata", "#B8BCC2": "Platina", "#B76E79": "Rosé gold", "#E8B4A8": "Rosé claro", "#CD7F32": "Bronze", "#B87333": "Cobre" };
  function swBg(c) { return METAL[c] ? "linear-gradient(135deg," + c + " 0%,#ffffff 45%," + c + " 60%," + c + " 100%)" : c; }
  function up(c) { return (c || "").toUpperCase(); }
  function docColors() {
    var set = {}, keys = ["color", "tColor", "lineColor", "boxBg", "boxColor", "c1", "c2"];
    ["frente", "verso"].forEach(function (sd) { var m = P.models[P.fmt][sd]; if (m.bg.color && up(m.bg.color) !== "#FFFFFF") set[up(m.bg.color)] = 1; m.els.forEach(function (e) { keys.forEach(function (k) { if (e[k] && /^#[0-9a-f]{6}$/i.test(e[k])) set[up(e[k])] = 1; }); }); });
    return Object.keys(set).slice(0, 24);
  }
  function addRecent(c) { if (!c) return; c = up(c); P.recent = (P.recent || []).filter(function (x) { return x !== c; }); P.recent.unshift(c); P.recent = P.recent.slice(0, 12); }
  function swRow(k, cur, list) { return '<div class="pal">' + list.map(function (c) { return '<button type="button" class="sw' + (up(cur) === up(c) ? " on" : "") + '" style="background:' + swBg(up(c)) + '" data-k="' + k + '" data-v="' + up(c) + '" aria-label="' + (METAL[up(c)] || c) + '" title="' + (METAL[up(c)] || c) + '"></button>'; }).join("") + "</div>"; }
  function hex2hsv(h) {
    var r = parseInt(h.substr(1, 2), 16) / 255, g = parseInt(h.substr(3, 2), 16) / 255, b = parseInt(h.substr(5, 2), 16) / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, hh = 0;
    if (d) { hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh *= 60; if (hh < 0) hh += 360; }
    return { h: hh, s: mx ? d / mx : 0, v: mx };
  }
  function hsv2hex(h, s, v) {
    var f = function (n) { var k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
    return "#" + [f(5), f(3), f(1)].map(function (x) { return two0(Math.round(x * 255).toString(16)); }).join("").toUpperCase();
  }
  function two0(x) { return x.length < 2 ? "0" + x : x; }
  var PK = { h: 340, s: 0.4, v: 0.9 };
  function pal(k, cur, allowNone) {
    var open = ST.colorOpen === k, label = cur ? (METAL[up(cur)] || up(cur)) : "Sem cor";
    var s = '<button type="button" class="colorbtn' + (open ? " open" : "") + '" data-act="colorToggle" data-ck="' + k + '"><span class="sw' + (cur ? "" : " none") + '" style="background:' + (cur ? swBg(up(cur)) : "") + '"></span><span>' + esc(label) + '</span><b>' + (open ? "▴" : "▾") + "</b></button>";
    if (!open) return s;
    s += '<div class="cpanel">';
    if (allowNone) s += '<div class="pal"><button type="button" class="btn' + (!cur ? " on" : "") + '" data-k="' + k + '" data-v="">Sem cor</button></div>';
    var dc = docColors(); if (dc.length) s += '<p class="clbl">Cores do documento</p>' + swRow(k, cur, dc);
    if (P.recent && P.recent.length) s += '<p class="clbl">Cores usadas recentemente</p>' + swRow(k, cur, P.recent);
    COLOR_GROUPS.forEach(function (g) { s += '<p class="clbl">' + g[0] + "</p>" + swRow(k, cur, g[1]); });
    if (cur && /^#[0-9a-f]{6}$/i.test(cur)) PK = hex2hsv(cur);
    var hx = cur && /^#[0-9a-f]{6}$/i.test(cur) ? up(cur) : hsv2hex(PK.h, PK.s, PK.v);
    s += '<p class="clbl">Escolher qualquer cor</p><div class="picker" data-pk="' + k + '">' +
      '<div class="sv" style="background-color:hsl(' + Math.round(PK.h) + ',100%,50%)"><i style="left:' + PK.s * 100 + "%;top:" + (1 - PK.v) * 100 + '%"></i></div>' +
      '<input type="range" class="hue" min="0" max="360" step="1" value="' + Math.round(PK.h) + '" aria-label="Matiz">' +
      '<div class="hexrow"><span class="sw" style="background:' + hx + '"></span><input type="text" class="hex" maxlength="7" value="' + hx + '" aria-label="Código da cor" autocapitalize="characters"><button type="button" class="btn" data-act="hexOk">Usar</button></div></div>';
    return s + "</div>";
  }
  function pickerApply(pk, hex, final) {
    var box = body.querySelector('.picker[data-pk="' + pk + '"]'); if (!box) return;
    box.querySelector(".hexrow .sw").style.background = hex;
    var hx = box.querySelector(".hex"); if (document.activeElement !== hx) hx.value = hex;
    var cb = body.querySelector('.colorbtn[data-ck="' + pk + '"]'); if (cb) { cb.querySelector(".sw").style.background = hex; cb.querySelector(".sw").classList.remove("none"); cb.children[1].textContent = hex; }
    setK(pk, hex);
    if (final) { addRecent(hex); commit(); }
  }
  function svFrom(ev, sv) {
    var r = sv.getBoundingClientRect();
    PK.s = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)); PK.v = 1 - Math.max(0, Math.min(1, (ev.clientY - r.top) / r.height));
    var th = sv.querySelector("i"); th.style.left = PK.s * 100 + "%"; th.style.top = (1 - PK.v) * 100 + "%";
  }
  var svDrag = null;
  function bindPicker() {
    body.addEventListener("pointerdown", function (ev) {
      var sv = ev.target.closest(".sv"); if (!sv) return;
      ev.preventDefault(); svDrag = sv; try { sv.setPointerCapture(ev.pointerId); } catch (x) {}
      svFrom(ev, sv); pickerApply(sv.parentNode.dataset.pk, hsv2hex(PK.h, PK.s, PK.v));
    });
    body.addEventListener("pointermove", function (ev) { if (!svDrag) return; svFrom(ev, svDrag); pickerApply(svDrag.parentNode.dataset.pk, hsv2hex(PK.h, PK.s, PK.v)); });
    var endSv = function () { if (!svDrag) return; var pk = svDrag.parentNode.dataset.pk; svDrag = null; pickerApply(pk, hsv2hex(PK.h, PK.s, PK.v), true); };
    body.addEventListener("pointerup", endSv); body.addEventListener("pointercancel", endSv);
  }
  function opts(k, cur, list) { return '<div class="opts">' + list.map(function (o) { return '<button type="button" class="btn' + (String(cur) === String(o[0]) ? " on" : "") + '" data-k="' + k + '" data-v="' + esc(o[0]) + '">' + o[1] + "</button>"; }).join("") + "</div>"; }
  function stepper(k, v, step, lbl) { return '<div class="f"><p class="lbl">' + lbl + '</p><div class="stepper"><button type="button" data-step="' + k + '" data-d="-' + step + '">−</button><input type="number" inputmode="decimal" data-k="' + k + '" data-num="1" value="' + v + '"><button type="button" data-step="' + k + '" data-d="' + step + '">+</button></div></div>'; }
  function F(lbl, html) { return '<div class="f"><p class="lbl">' + lbl + "</p>" + html + "</div>"; }
  function fontPicker(e) {
    var s = '<button type="button" class="fontbtn" data-act="fontToggle" style="font-family:\'' + e.font + '\'">' + esc(e.font) + " ▾</button>";
    if (ST.fontOpen) {
      s += '<div class="fontlist" id="fontList">';
      FONT_GROUPS.forEach(function (g) {
        s += "<h4>" + g[0] + "</h4>";
        g[1].forEach(function (f) { s += '<button type="button" class="' + (f === e.font ? "on" : "") + '" data-k="font" data-v="' + f + '" data-lazyfont="' + f + '">' + f + "</button>"; });
      });
      s += "</div>";
    }
    return s;
  }
  function tabTexto(e) {
    var t = e.type, s = "";
    if (t === "svg") {
      return F("Elemento", "<p>" + esc(elLabel(e)) + '</p><button type="button" class="btn" data-act="openLib">Trocar por outro elemento</button>') + '<p class="hint">Mude as cores na aba Cor e o tamanho arrastando a bolinha ⤡ do canto.</p>';
    }
    if (t === "img") return '<p class="hint">Imagem carregada por você. Use as abas Cor (transparência), Posição e Camadas.</p><button type="button" class="btn wide" data-act="toBg">Usar como fundo da folha</button>';
    if (t === "text" || t === "footer") s += F("Texto", '<textarea data-k="text" rows="' + (t === "footer" ? 1 : 3) + '">' + esc(e.text) + "</textarea>");
    if (t === "date") {
      s += F("Estilo da data", opts("style", e.style, [["extenso", "Quinta-feira, 7 de janeiro"], ["numerico", "07/01/2027 · quinta"], ["grande", "07 QUI JAN"], ["custom", "Do meu jeito"]]));
      if (e.style === "custom") s += F("Meu jeito", '<input type="text" data-k="template" value="' + esc(e.template) + '"><p class="hint">Use: {dia} {dd} {semana} {sem} {mes} {mes3} {mm} {ano}</p>');
      if (e.style === "extenso") s += '<label class="switch"><input type="checkbox" data-k="showYear"' + (e.showYear ? " checked" : "") + "><span>Mostrar o ano</span></label>";
      if (e.style !== "grande") s += '<label class="switch"><input type="checkbox" data-k="upper"' + (e.upper ? " checked" : "") + "><span>TUDO MAIÚSCULO</span></label>";
      else s += '<p class="hint">No estilo grande o tamanho segue a caixa: arraste a bolinha ⤡.</p>';
    }
    if (t === "holiday") s += '<p class="hint">Mostra o nome do feriado só nos dias de feriado (ex.: Natal). Liga e desliga no passo 2.</p><label class="switch"><input type="checkbox" data-k="upper"' + (e.upper ? " checked" : "") + "><span>TUDO MAIÚSCULO</span></label>";
    if (t === "hours" || t === "tasks" || t === "notes") s += F("Título (deixe vazio para não ter)", '<input type="text" data-k="title" value="' + esc(e.title) + '">');
    if (t === "hours") s += F("Jeito do horário", opts("hfmt", e.hfmt, [["h", "07h · 07h30"], [":", "07:00 · 07:30"]])) + '<p class="hint">Quais horários aparecem você escolhe no passo 2. Se forem muitos, vira 2 ou 3 colunas.</p>';
    if (t === "tasks") s += stepper("count", e.count, 1, "Quantas tarefas");
    if (t === "notes") { s += F("Tipo", opts("kind", e.kind, [["linhas", "Linhas"], ["pontilhado", "Pontilhado"], ["branco", "Em branco"]])); if (e.kind !== "branco") s += stepper("spacing", e.spacing, 0.5, "Espaço entre linhas (mm)"); }
    s += F("Fonte", fontPicker(e));
    s += stepper("size", e.size, 1, "Tamanho da letra");
    s += F("Estilo", '<div class="opts"><button type="button" class="btn' + (e.bold ? " on" : "") + '" data-k="bold" data-v="' + !e.bold + '"><b>N</b>&nbsp;Negrito</button><button type="button" class="btn' + (e.italic ? " on" : "") + '" data-k="italic" data-v="' + !e.italic + '"><i>I</i>&nbsp;Itálico</button></div>');
    s += F("Alinhamento", opts("align", e.align, [["left", "⇤ Esquerda"], ["center", "↔ Centro"], ["right", "⇥ Direita"]]));
    return s;
  }
  function tabCor(e) {
    var t = e.type, s = "";
    if (t === "svg") { s += F("Cor principal", pal("c1", e.c1)); if (/\{2\}/.test((EL.byId[e.lib] || {}).svg || "")) s += F("Cor 2", pal("c2", e.c2)); }
    else if (t !== "img") s += F(t === "hours" || t === "tasks" || t === "notes" ? "Cor do texto" : "Cor da letra", pal("color", e.color));
    if (t === "hours" || t === "tasks" || t === "notes") {
      s += F("Cor do título e quadradinhos", pal("tColor", e.tColor));
      s += F("Cor das linhas", pal("lineColor", e.lineColor));
      s += F("Tipo de linha", opts("lineStyle", e.lineStyle, [["solid", "Contínua"], ["tracejada", "Tracejada"], ["pontilhada", "Pontilhada"]]));
      s += stepper("lineW", e.lineW, 0.05, "Espessura da linha (mm)");
    }
    if (t !== "svg" && t !== "img") {
      s += F("Caixa: fundo", pal("boxBg", e.boxBg, true));
      s += F("Caixa: borda", opts("boxBorder", e.boxBorder, [["none", "Nenhuma"], ["fina", "Fina"], ["arredondada", "Arredondada"]]));
      if (e.boxBorder !== "none") s += F("Cor da borda", pal("boxColor", e.boxColor));
    }
    s += F("Transparência", '<input type="range" min="0.05" max="1" step="0.05" data-k="op" data-num="1" value="' + e.op + '">');
    return s;
  }
  function tabPos(e) {
    var m = M();
    return '<div class="grid2">' +
      '<label>Esquerda (mm)<input type="number" inputmode="decimal" data-k="x" data-num="1" value="' + e.x + '"></label>' +
      '<label>Topo (mm)<input type="number" inputmode="decimal" data-k="y" data-num="1" value="' + e.y + '"></label>' +
      '<label>Largura (mm)<input type="number" inputmode="decimal" data-k="w" data-num="1" value="' + e.w + '"></label>' +
      '<label>Altura (mm)<input type="number" inputmode="decimal" data-k="h" data-num="1" value="' + e.h + '"></label></div>' +
      F("Girar: " + (e.rot || 0) + "°", '<input type="range" min="-180" max="180" step="1" data-k="rot" data-num="1" value="' + (e.rot || 0) + '"><div class="opts"><button type="button" class="btn" data-k="rot" data-v="0">Reto (0°)</button><button type="button" class="btn" data-act="rot90">Girar 90°</button></div>') +
      F("Centralizar", '<div class="opts"><button type="button" class="btn" data-act="cH">↔ No meio (lado a lado)</button><button type="button" class="btn" data-act="cV">↕ No meio (altura)</button><button type="button" class="btn" data-act="fullW">Largura toda</button></div>') +
      '<p class="hint">Folha: ' + m.w + " × " + m.h + " mm.</p>";
  }
  function tabCamadas(e) {
    var els = M().els, s = '<div class="opts">' +
      '<button type="button" class="btn" data-act="front">⇈ Trazer para frente</button><button type="button" class="btn" data-act="fwd">↑ Um para frente</button>' +
      '<button type="button" class="btn" data-act="bwd">↓ Um para trás</button><button type="button" class="btn" data-act="back">⇊ Enviar para trás</button>' +
      '<button type="button" class="btn" data-act="dup">⧉ Duplicar</button><button type="button" class="btn danger" data-act="del">🗑 Excluir</button></div>';
    if (e.type === "img") s += '<button type="button" class="btn wide" data-act="toBg" style="margin-top:8px">Usar como fundo da folha</button>';
    return s + layerList(els);
  }
  function layerList(els) {
    var s = '<p class="lbl" style="margin-top:12px">Itens da folha (o de cima fica na frente)</p><div class="layers">';
    for (var i = els.length - 1; i >= 0; i--) s += '<button type="button" data-pick="' + els[i].id + '" class="' + (els[i].id === ST.sel ? "on" : "") + '">' + esc(elLabel(els[i])) + "</button>";
    return s + "</div>";
  }
  function tabFolha() {
    var m = M(), s = '<p class="hint">Toque num item da folha para editar. Ou ajuste a folha aqui:</p>';
    s += F("Cor de fundo da folha", pal("bg.color", m.bg.color));
    s += F("Fundo da folha (imagem)", '<label class="btn">' + (m.bg.img ? "Trocar imagem de fundo" : "Carregar imagem de fundo") + '<input type="file" accept="image/*" data-act="bgfile" hidden></label>' + (m.bg.img ? ' <button type="button" class="btn danger" data-act="bgDel">Tirar fundo</button>' : ""));
    if (m.bg.img) s += F("Transparência do fundo", '<input type="range" min="0.05" max="1" step="0.05" data-k="bg.op" data-num="1" value="' + m.bg.op + '">');
    return s + layerList(m.els);
  }
  var lastSel = null;
  function renderPanel() {
    var e = selEl();
    if ((e && e.id) !== lastSel) { ST.colorOpen = null; ST.fontOpen = false; lastSel = e && e.id; }
    $("tabs").hidden = !e;
    document.body.classList.toggle("editing", !!(e && ST.sheetOpen && ST.step === 1));
    $("sheetTitle").textContent = e ? elLabel(e) : "Folha " + (ST.side === "frente" ? "da Frente" : "do Verso") + " · toque num item para editar";
    document.querySelectorAll("#tabs button").forEach(function (b) { b.classList.toggle("on", b.dataset.tab === ST.tab); });
    var st = body.scrollTop;
    body.innerHTML = !e ? tabFolha() : ST.tab === "cor" ? tabCor(e) : ST.tab === "pos" ? tabPos(e) : ST.tab === "camadas" ? tabCamadas(e) : tabTexto(e);
    body.scrollTop = st;
    if (ST.fontOpen) lazyFonts();
    updSel();
  }
  var fio;
  function lazyFonts() {
    var list = $("fontList"); if (!list) return;
    if (fio) fio.disconnect();
    fio = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { var f = en.target.dataset.lazyfont; fontCss(f); en.target.style.fontFamily = "'" + f + "', sans-serif"; fio.unobserve(en.target); } });
    }, { root: list, rootMargin: "120px" });
    list.querySelectorAll("[data-lazyfont]").forEach(function (b) { fio.observe(b); });
    var on = list.querySelector(".on"); if (on) list.scrollTop = on.offsetTop - 60;
  }
  function setK(k, v) {
    if (k.indexOf("bg.") === 0) { M().bg[k.slice(3)] = v; draw(); return; }
    var e = selEl(); if (!e) return;
    e[k] = v;
    if (k === "font") fontCss(v);
    draw();
  }
  function parseV(el, v) {
    if (v === "true") return true; if (v === "false") return false;
    if (el.dataset.num) { var n = parseFloat(String(v).replace(",", ".")); return isNaN(n) ? null : n; }
    return v;
  }
  body.addEventListener("input", function (ev) {
    var t = ev.target;
    if (t.classList.contains("hue")) { PK.h = +t.value; var bx = t.parentNode; bx.querySelector(".sv").style.backgroundColor = "hsl(" + PK.h + ",100%,50%)"; pickerApply(bx.dataset.pk, hsv2hex(PK.h, PK.s, PK.v)); return; }
    if (t.classList.contains("hex")) { var v0 = t.value.trim(); if (v0[0] !== "#") v0 = "#" + v0; if (/^#[0-9a-f]{6}$/i.test(v0)) { PK = hex2hsv(v0); pickerApply(t.closest(".picker").dataset.pk, up(v0)); } return; }
    var k = t.dataset.k; if (!k) return;
    var v = t.type === "checkbox" ? t.checked : parseV(t, t.value);
    if (v === null) return;
    if (k === "boxBg" && v === "") v = null;
    setK(k, v);
    if (k === "rot") { var l = t.closest(".f"); if (l) l.querySelector(".lbl").textContent = "Girar: " + v + "°"; }
    if (t.type === "checkbox") renderPanel();
    later();
  });
  body.addEventListener("change", function (ev) {
    var t = ev.target;
    if (t.dataset.act === "bgfile") { var f = t.files && t.files[0]; if (!f) return; readImage(f).then(function (r) { var id = "im" + uid(); P.images[id] = r.url; M().bg.img = id; upImg(id); commit(); draw(); renderPanel(); }); return; }
    if (t.classList.contains("hue")) { addRecent(hsv2hex(PK.h, PK.s, PK.v)); }
    if (t.classList.contains("hex")) { var v1 = up(t.value.trim()); if (v1[0] !== "#") v1 = "#" + v1; if (/^#[0-9A-F]{6}$/.test(v1)) addRecent(v1); }
    commit();
  });
  body.addEventListener("click", function (ev) {
    var b = ev.target.closest("button"); if (!b) return;
    var e = selEl(), m = M();
    if (b.dataset.pick) { ST.sel = b.dataset.pick; renderPanel(); openSheet(true); return; }
    if (b.dataset.step) {
      var k = b.dataset.step, cur = e[k] || 0, d = parseFloat(b.dataset.d), nv = Math.round((cur + d) * 100) / 100;
      if (k === "count") nv = Math.max(1, Math.min(40, nv)); if (k === "size") nv = Math.max(4, Math.min(200, nv));
      if (k === "spacing") nv = Math.max(2, nv); if (k === "lineW") nv = Math.max(0.05, nv);
      setK(k, nv); b.parentNode.querySelector("input").value = nv; later(); return;
    }
    if (b.dataset.k) {
      var v = b.dataset.v; v = v === "true" ? true : v === "false" ? false : v;
      if (b.dataset.k === "boxBg" && v === "") v = null;
      if (b.dataset.k === "rot") v = +v;
      if (b.dataset.k === "bg.color" && v === "") v = "#FFFFFF";
      setK(b.dataset.k, v);
      if (b.classList.contains("sw") && v) addRecent(v);
      if (b.dataset.k === "font") { ST.fontOpen = false; loadFont(v, e && e.bold, e && e.italic).then(draw); }
      commit(); renderPanel(); return;
    }
    var a = b.dataset.act, i = e ? m.els.indexOf(e) : -1;
    if (a === "fontToggle") { ST.fontOpen = !ST.fontOpen; renderPanel(); return; }
    if (a === "colorToggle") { ST.colorOpen = ST.colorOpen === b.dataset.ck ? null : b.dataset.ck; renderPanel(); if (ST.colorOpen) { var cbn = body.querySelector('.colorbtn[data-ck="' + ST.colorOpen + '"]'); if (cbn) body.scrollTop = cbn.offsetTop - 8; } return; }
    if (a === "hexOk") { var pkb = b.closest(".picker"), hv = up(pkb.querySelector(".hex").value.trim()); if (hv[0] !== "#") hv = "#" + hv; if (/^#[0-9A-F]{6}$/.test(hv)) { PK = hex2hsv(hv); pickerApply(pkb.dataset.pk, hv, true); renderPanel(); } else toast("Código de cor inválido. Ex.: #E88AA6"); return; }
    if (a === "openLib") { openLib(e && EL.byId[e.lib] ? EL.byId[e.lib].cat : null); return; }
    if (a === "bgDel") { m.bg.img = null; }
    else if (!e) return;
    else if (a === "front") { m.els.splice(i, 1); m.els.push(e); }
    else if (a === "back") { m.els.splice(i, 1); m.els.unshift(e); }
    else if (a === "fwd" && i < m.els.length - 1) { m.els.splice(i, 1); m.els.splice(i + 1, 0, e); }
    else if (a === "bwd" && i > 0) { m.els.splice(i, 1); m.els.splice(i - 1, 0, e); }
    else if (a === "dup") { var c = clone(e); c.id = uid(); c.x += 4; c.y += 4; m.els.splice(i + 1, 0, c); ST.sel = c.id; toast("Duplicado"); }
    else if (a === "del") { m.els.splice(i, 1); ST.sel = null; toast("Excluído · use ↶ Desfazer se precisar"); }
    else if (a === "toBg") { m.bg.img = e.img; m.bg.op = e.op; m.els.splice(i, 1); ST.sel = null; toast("Agora é o fundo da folha"); }
    else if (a === "rot90") { e.rot = ((e.rot || 0) + 90 + 180) % 360 - 180; }
    else if (a === "cH") { e.x = Math.round((m.w - e.w) / 2 * 10) / 10; }
    else if (a === "cV") { e.y = Math.round((m.h - e.h) / 2 * 10) / 10; }
    else if (a === "fullW") { e.x = 9; e.w = m.w - 18; }
    commit(); draw(); renderPanel();
  });

  bindPicker();

  /* ---------------- Barra de cima (formato, frente/verso, modelos) ---------------- */
  function syncTop() {
    $("fmtSel").value = String(P.fmt);
    document.querySelectorAll("#sideSeg button").forEach(function (b) { b.classList.toggle("on", b.dataset.side === ST.side); });
  }
  $("fmtSel").addEventListener("change", function () { P.fmt = +this.value; ST.sel = null; ST.zoom = 1; syncTop(); layout(); renderPanel(); commit(); save(); });
  $("sideSeg").addEventListener("click", function (ev) { var b = ev.target.closest("button"); if (!b) return; ST.side = b.dataset.side; ST.sel = null; syncTop(); layout(); renderPanel(); });
  $("presets").addEventListener("click", function (ev) {
    var b = ev.target.closest("button"); if (!b) return; var m = M();
    m.els = preset(b.dataset.preset, m.w, m.h); ST.sel = null; ensureFonts([m]).then(draw); commit(); draw(); renderPanel();
    toast("Modelo “" + b.textContent + "” aplicado · ↶ Desfazer volta");
  });
  $("btnReset").onclick = function () { var m = M(); m.els = preset("classico", m.w, m.h); m.bg = { color: "#FFFFFF", img: null, op: 1 }; ST.sel = null; commit(); draw(); renderPanel(); toast("Voltou ao padrão · ↶ Desfazer volta"); };
  $("btnCopySide").onclick = function () {
    var other = P.models[P.fmt][ST.side === "frente" ? "verso" : "frente"], m = M();
    m.els = clone(other.els).map(function (e) { e.id = uid(); return e; }); m.bg = clone(other.bg); ST.sel = null; commit(); draw(); renderPanel();
    toast("Copiado da " + (ST.side === "frente" ? "folha do Verso" : "Frente"));
  };
  $("btnBlank").onclick = function () {
    if (!confirm("Apagar tudo da Frente e do Verso e começar com folhas em branco?")) return;
    ["frente", "verso"].forEach(function (s) { var m = P.models[P.fmt][s]; m.els = []; m.bg = { color: "#FFFFFF", img: null, op: 1 }; });
    ST.sel = null; commit(); draw(); renderPanel(); toast("Folhas em branco · ↶ Desfazer volta");
  };
  $("btnSaveJson").onclick = function () {
    pruneImages();
    var blob = new Blob([JSON.stringify(P)], { type: "application/json" });
    downloadBlob(blob, "modelo-agenda-estrela.json"); toast("Modelo salvo nos downloads");
  };
  $("fileJson").addEventListener("change", function () {
    var f = this.files && this.files[0]; this.value = ""; if (!f) return;
    var fr = new FileReader();
    fr.onload = function () {
      try { var o = JSON.parse(fr.result); if (!o.models || !o.models["1"]) throw 0; loadProject(o); commit(); toast("Modelo aberto"); }
      catch (x) { alert("Esse arquivo não é um modelo da Agenda Estrela."); }
    };
    fr.readAsText(f);
  });
  $("btnUndo").onclick = undo; $("btnRedo").onclick = redo;
  document.addEventListener("keydown", function (ev) {
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "z") { ev.preventDefault(); ev.shiftKey ? redo() : undo(); }
    if ((ev.key === "Delete" || ev.key === "Backspace") && selEl() && ST.step === 1) { var m = M(); m.els.splice(m.els.indexOf(selEl()), 1); ST.sel = null; commit(); draw(); renderPanel(); }
  });
  function loadProject(o) {
    var d = newProject();
    P = Object.assign(d, o); P.settings = Object.assign(d.settings, o.settings || {}); P.images = o.images || {};
    ["1", "2"].forEach(function (f) { P.models[f] = P.models[f] || d.models[f]; ["frente", "verso"].forEach(function (s) { var m = P.models[f][s] = P.models[f][s] || d.models[f][s]; m.bg = Object.assign({ color: "#FFFFFF", img: null, op: 1 }, m.bg || {}); m.els = (m.els || []).map(function (e) { return Object.assign({}, DEF.base, DEF[e.type] || {}, e); }); }); });
    imgCache = {}; ST.sel = null;
    syncTop(); syncS2(); layout(); renderPanel(); ensureFonts([P.models[P.fmt].frente, P.models[P.fmt].verso]).then(draw);
  }

  /* ---------------- Passos ---------------- */
  function go(n) {
    commit();
    ST.step = n;
    [1, 2, 3].forEach(function (i) { $("step" + i).hidden = i !== n; });
    document.querySelectorAll("#steps button").forEach(function (b) { b.classList.toggle("on", +b.dataset.step === n); });
    document.body.classList.toggle("s1", n === 1);
    if (n !== 1) document.body.classList.remove("editing");
    window.scrollTo(0, 0);
    if (n === 1) layout();
    if (n === 2) syncS2();
    if (n === 3) { previewN = 6; renderPreview(); }
  }
  $("steps").addEventListener("click", function (ev) { var b = ev.target.closest("button"); if (b) go(+b.dataset.step); });
  document.querySelectorAll("[data-go]").forEach(function (b) { b.addEventListener("click", function () { go(+b.dataset.go); }); });

  /* ---------------- Passo 2 ---------------- */
  var YEARS = [2026, 2027, 2028, 2029, 2030, 2031];
  $("years").innerHTML = YEARS.map(function (y) { return '<button type="button" data-y="' + y + '">' + y + "</button>"; }).join("");
  $("years").addEventListener("click", function (ev) { var b = ev.target.closest("button"); if (!b) return; P.settings.start = b.dataset.y + "-01-01"; P.settings.end = b.dataset.y + "-12-31"; syncS2(); save(); });
  ["d1", "d2"].forEach(function (id, i) { $(id).addEventListener("change", function () { P.settings[i ? "end" : "start"] = this.value; syncS2(); save(); }); });
  $("hol").addEventListener("change", function () { P.settings.holidays = this.checked; save(); });
  $("cutLine").addEventListener("change", function () { P.settings.cutLine = this.checked; save(); });
  $("quality").addEventListener("change", function () { P.settings.quality = this.value; save(); });
  var hopt = ""; for (var hh = 0; hh < 24; hh++) hopt += '<option value="' + hh + '">' + two(hh) + "h</option>";
  $("hDe").innerHTML = hopt; $("hAte").innerHTML = hopt; $("hDe").value = "7"; $("hAte").value = "21";
  function hm(m) { return two(Math.floor(m / 60)) + ":" + two(m % 60); }
  function syncS2() {
    var s = P.settings;
    $("d1").value = s.start; $("d2").value = s.end; $("hol").checked = s.holidays; $("cutLine").checked = s.cutLine; $("quality").value = s.quality || "150";
    var y = /^(\d{4})-01-01$/.exec(s.start), yy = y && s.end === y[1] + "-12-31" ? y[1] : "";
    document.querySelectorAll("#years button").forEach(function (b) { b.classList.toggle("on", b.dataset.y === yy); });
    var days = dayList(), c = $("count");
    if (!days) { c.textContent = "Confira as datas: a data final precisa ser depois da inicial (máximo 800 dias)."; c.classList.add("bad"); }
    else { c.classList.remove("bad"); var pg = pageCount(days); c.textContent = days.length + " dias · " + pg + " páginas A5" + (P.fmt === 2 ? " (2 dias por página)" : ""); }
    drawChips();
  }
  function drawChips() {
    var sl = P.settings.slots.slice().sort(function (a, b) { return a - b; }), set = {};
    sl.forEach(function (m) { set[m] = 1; });
    var s = "";
    for (var m = 0; m < 1440; m += 30) s += '<button type="button" data-m="' + m + '" class="' + (set[m] ? "on" : "") + '">' + hm(m) + "</button>";
    sl.filter(function (m) { return m % 30; }).forEach(function (m) { s += '<button type="button" class="cust" data-c="' + m + '" aria-label="Remover ' + hm(m) + '">' + hm(m) + " ×</button>"; });
    $("hChips").innerHTML = s;
    var n = sl.length, rng = n ? " · " + two(Math.floor(sl[0] / 60)) + "h às " + two(Math.floor(sl[n - 1] / 60)) + "h" + (sl[n - 1] % 60 ? two(sl[n - 1] % 60) : "") : "";
    $("hBtn").textContent = "Escolher horários · " + n + (n === 1 ? " marcado" : " marcados") + rng + ($("hPanel").hidden ? " ▾" : " ▴");
  }
  $("hBtn").onclick = function () { $("hPanel").hidden = !$("hPanel").hidden; drawChips(); };
  function setSlots(a) { var u = {}; a.forEach(function (m) { u[m] = 1; }); P.settings.slots = Object.keys(u).map(Number).sort(function (x, y) { return x - y; }); drawChips(); save(); }
  $("hChips").addEventListener("click", function (ev) {
    var b = ev.target.closest("button"); if (!b) return; var sl = P.settings.slots.slice();
    if (b.dataset.c) { setSlots(sl.filter(function (m) { return m !== +b.dataset.c; })); return; }
    var m = +b.dataset.m, i = sl.indexOf(m); if (i > -1) sl.splice(i, 1); else sl.push(m); setSlots(sl);
  });
  $("hFill").onclick = function () { var a = +$("hDe").value, b = +$("hAte").value, iv = +$("hIv").value; if (b < a) { var t = a; a = b; b = t; } var s = []; for (var m = a * 60; m <= b * 60; m += iv) s.push(m); setSlots(s); };
  $("hAll").onclick = function () { var s = []; for (var m = 0; m < 1440; m += 30) s.push(m); setSlots(s); };
  $("hNone").onclick = function () { setSlots([]); };
  $("hFull").onclick = function () { setSlots(P.settings.slots.filter(function (m) { return m % 60 === 0; })); };
  function addTime() { var v = /^(\d{1,2}):(\d{2})/.exec($("hOut").value); if (!v) { $("hOut").focus(); return; } setSlots(P.settings.slots.concat([+v[1] * 60 + +v[2]])); $("hOut").value = ""; }
  $("hAdd").onclick = addTime;

  /* ---------------- Passo 3: prévia, PDF, imprimir ---------------- */
  var previewN = 6, prevJob = 0;
  function renderPreview() {
    var days = dayList(), box = $("pages"), job = ++prevJob;
    if (!days) { $("sum").textContent = "Confira as datas no passo 2."; box.innerHTML = ""; $("btnMore").hidden = true; $("btnPdf").disabled = true; return; }
    $("btnPdf").disabled = false;
    var pages = pageCount(days), lim = Math.min(previewN, pages);
    $("sumTitle").textContent = "Agenda " + days[0].getFullYear() + (days[days.length - 1].getFullYear() !== days[0].getFullYear() ? "–" + days[days.length - 1].getFullYear() : "");
    $("sum").textContent = days.length + " dias · " + pages + " páginas A5 · " + (P.fmt === 2 ? "2 dias" : "1 dia") + " por página";
    $("btnMore").hidden = lim >= pages;
    $("btnMore").textContent = "Mostrar mais páginas (vendo " + lim + " de " + pages + ")";
    var have = box.children.length;
    if (have > lim) { box.innerHTML = ""; have = 0; }
    var models = [P.models[P.fmt].frente, P.models[P.fmt].verso];
    ensureAssets(models).then(function () {
      var i = have;
      function next() {
        if (job !== prevJob || i >= lim) return;
        var wrapD = box.children[i];
        if (!wrapD) { wrapD = document.createElement("div"); wrapD.className = "pg"; box.appendChild(wrapD); }
        var c = document.createElement("canvas"), pxmm = 2.2 * Math.min(2, window.devicePixelRatio || 1);
        c.width = Math.round(148 * pxmm); c.height = Math.round(210 * pxmm);
        renderPage(c.getContext("2d"), days, i, pxmm);
        wrapD.innerHTML = ""; wrapD.appendChild(c);
        var sp = document.createElement("span"); sp.textContent = "Página " + (i + 1) + " · " + (i % 2 ? "Verso" : "Frente"); wrapD.appendChild(sp);
        i++; setTimeout(next, 0);
      }
      next();
    });
  }
  $("btnMore").onclick = function () { previewN += 8; renderPreview(); };
  function downloadBlob(blob, name) {
    var url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }
  function canvasJpeg(c, q) { return new Promise(function (res) { c.toBlob(function (b) { res(b); }, "image/jpeg", q); }); }
  var cancelPdf = false, busy = false;
  $("btnCancel").onclick = function () { cancelPdf = true; };
  function progress(on, txt, frac) { $("prog").hidden = !on; if (txt) $("progTxt").textContent = txt; if (frac != null) $("pbarFill").style.width = Math.round(frac * 100) + "%"; }
  function renderAll(onPage) {
    var days = dayList(); if (!days) return Promise.reject(new Error("datas"));
    var pages = pageCount(days), dpi = +(P.settings.quality || 150), pxmm = dpi / 25.4;
    var c = document.createElement("canvas"); c.width = Math.round(148 * pxmm); c.height = Math.round(210 * pxmm);
    var ctx = c.getContext("2d");
    var i = 0;
    function step() {
      if (cancelPdf) return Promise.resolve(false);
      if (i >= pages) return Promise.resolve(true);
      renderPage(ctx, days, i, pxmm);
      return canvasJpeg(c, 0.92).then(function (b) { return onPage(b, i, pages); }).then(function () { i++; return sleep(0).then(step); });
    }
    return ensureAssets([P.models[P.fmt].frente, P.models[P.fmt].verso]).then(step).then(function (ok) { c.width = c.height = 1; return { ok: ok, days: days }; });
  }
  window.__agendaPdf = function () { return makePdf(true); };
  function makePdf(returnBlob) {
    if (busy) return Promise.resolve(); busy = true; cancelPdf = false;
    $("btnPdf").disabled = true; progress(true, "Preparando fontes e imagens…", 0);
    var doc = new window.jspdf.jsPDF({ unit: "mm", format: "a5", orientation: "portrait", compress: true });
    return renderAll(function (blob, i, n) {
      return blob.arrayBuffer().then(function (buf) {
        if (i > 0) doc.addPage("a5", "portrait");
        doc.addImage(new Uint8Array(buf), "JPEG", 0, 0, 148, 210, "p" + i, "NONE");
        progress(true, "Gerando PDF… página " + (i + 1) + " de " + n, (i + 1) / n);
      });
    }).then(function (r) {
      if (!r.ok) { toast("PDF cancelado"); return; }
      progress(true, "Finalizando o arquivo…", 1);
      return sleep(30).then(function () {
        var out = doc.output("blob"), name = "agenda-" + r.days[0].getFullYear() + ".pdf";
        window.__lastPdf = { size: out.size, name: name, pages: doc.getNumberOfPages() };
        if (returnBlob === true) window.__lastPdfBlob = out;
        downloadBlob(out, name);
        toast("PDF pronto: " + name + " (" + (out.size / 1048576).toFixed(1) + " MB)", 5000);
      });
    }).catch(function (err) {
      console.error(err); alert("Não consegui gerar o PDF. Tente a qualidade Normal ou um período menor.");
    }).then(function () { busy = false; doc = null; $("btnPdf").disabled = false; progress(false); });
  }
  $("btnPdf").onclick = function () { makePdf(); };
  var printUrls = [];
  function clearPrint() { printUrls.forEach(URL.revokeObjectURL); printUrls = []; $("printArea").innerHTML = ""; }
  window.addEventListener("afterprint", clearPrint);
  $("btnPrint").onclick = function () {
    if (busy) return; busy = true; cancelPdf = false; clearPrint();
    progress(true, "Preparando páginas para imprimir…", 0);
    var area = $("printArea"), imgs = [];
    renderAll(function (blob, i, n) {
      var u = URL.createObjectURL(blob); printUrls.push(u);
      var im = new Image(); im.src = u; area.appendChild(im); imgs.push(im);
      progress(true, "Preparando página " + (i + 1) + " de " + n, (i + 1) / n);
    }).then(function (r) {
      busy = false; progress(false);
      if (!r.ok) { clearPrint(); return; }
      return Promise.all(imgs.map(function (im) { return im.decode ? im.decode().catch(function () {}) : null; })).then(function () {
        if (navigator.webdriver) { window.__printed = imgs.length; return; }
        window.print();
      });
    }).catch(function () { busy = false; progress(false); });
  };

  /* ---------------- Início ---------------- */
  function boot(saved) {
    if (saved) { try { loadProject(JSON.parse(saved)); } catch (x) { loadProject(newProject()); } }
    else loadProject(newProject());
    hist = [snap()]; hi = 0; undoBtns();
    go(1);
    ensureFonts([P.models[P.fmt].frente, P.models[P.fmt].verso]).then(function () { draw(); });
  }
  openSheet(false);
  idbGet("project").then(function (v) { boot(v || localStorage.getItem("agenda-estrela")); }).catch(function () { boot(localStorage.getItem("agenda-estrela")); });
  window.addEventListener("pagehide", function () { pruneImages(); try { idbSet("project", JSON.stringify(P)); } catch (x) {} });

  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(function () {});
  window.__agenda = { P: function () { return P; }, ST: ST, go: go, M: M, layout: layout };
})();
