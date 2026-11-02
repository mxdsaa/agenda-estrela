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
    base: { rot: 0, op: 1, font: "Quicksand", size: 11, color: "#555555", tColor: "#E88AA6", bold: false, italic: false, align: "left", lineColor: "#D9CFD5", lineStyle: "solid", lineW: 0.25, boxBg: null, boxBorder: "none", boxColor: "#E88AA6", flipH: false, flipV: false, lock: false, grp: null, ls: 0, lh: 1.25, tgap: 1.2, bw: 0, bc: "#E88AA6", crop: null },
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
    if (type === "svg") { var it = EL.byId[e.lib]; if (it && !it.remote) setCols(e, it, true); }
    return e;
  }

  /* cores do elemento: c1..c4 (só as partes que o desenho tem) */
  var CKEYS = ["c1", "c2", "c3", "c4"];
  function setCols(e, it, keep) {
    CKEYS.forEach(function (k, i) {
      if (it.remote || i >= Math.max(it.n, 2)) { if (i >= 2) delete e[k]; if (it.remote) delete e[k]; return; }
      if (!keep || !e[k]) e[k] = (it.cols && it.cols[i]) || e[k];
    });
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
      settings: { start: "2027-01-01", end: "2027-12-31", holidays: true, cutLine: true, slots: defaultSlots(), quality: "150", twoSides: false }
    };
  }

  var P = newProject();
  var ST = { side: "frente", sel: null, sels: [], zoom: 1, sheet: null, step: 1, fontOpen: false, libCat: null, multiMode: false, colorOpen: null, editId: null, guides: [], nudge: 1, alignMargin: true, replaceId: null };
  /* uma folha só (padrão). "Frente e verso diferentes" é opção avançada; desligada, o Verso é ignorado */
  function twoS() { return !!(P && P.settings && P.settings.twoSides); }
  function M() { return P.models[P.fmt][twoS() ? ST.side : "frente"]; }
  function usedModels() { var mm = P.models[P.fmt]; return twoS() ? [mm.frente, mm.verso] : [mm.frente]; }
  function byId(id) { var m = M(); for (var i = 0; i < m.els.length; i++) if (m.els[i].id === id) return m.els[i]; return null; }
  function selEl() { return ST.sel ? byId(ST.sel) : null; }
  function selAll() { var m = M(), set = {}; ST.sels.forEach(function (id) { set[id] = 1; }); return m.els.filter(function (e) { return set[e.id]; }); }
  function isMulti() { return selAll().length > 1; }

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
  function savedUI(st) { var el = $("saved"); if (!el) return; el.textContent = st === 1 ? "Salvando…" : st === 2 ? "⚠ Não salvo" : "✓ Salvo"; el.classList.toggle("busy", st !== 0); }
  function save() {
    clearTimeout(saveT); savedUI(1);
    saveT = setTimeout(function () {
      pruneImages();
      idbSet("project", JSON.stringify(P)).then(function () { savedUI(0); }).catch(function () {
        try { localStorage.setItem("agenda-estrela", JSON.stringify(P)); savedUI(0); } catch (e) { savedUI(2); toast("Não consegui salvar no celular. Use “Salvar modelo”."); }
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
  function restore(s) { var o = JSON.parse(s); P.fmt = o.fmt; P.models = o.models; ST.sels = ST.sels.filter(byId); if (!selEl()) ST.sel = ST.sels[0] || null; if (ST.editId) { ST.editId = null; ied.hidden = true; } syncTop(); layout(); renderPanel(); save(); }
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
  function svgKey(e) { var it = EL.byId[e.lib]; if (it && it.remote) return e.lib; return e.lib + "|" + e.c1 + "|" + e.c2 + "|" + (e.c3 || "") + "|" + (e.c4 || "") + (it && it.stretch ? "|" + (e.w / e.h).toFixed(2) : ""); }
  /* ilustrações da internet: o SVG é baixado como texto (fica guardado no celular) e vira data: URL,
     assim a imagem não "suja" o canvas e sai no PDF e na impressão */
  var stkMem = {};
  function stkText(it) {
    if (stkMem[it.id]) return stkMem[it.id];
    var p = idbGet("stk:" + it.id).catch(function () { return null; }).then(function (t) {
      if (t) return t;
      return fetch(it.url, { mode: "cors", credentials: "omit" }).then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.text(); }).then(function (t2) {
        if (t2.indexOf("<svg") < 0) throw new Error("svg");
        idbSet("stk:" + it.id, t2).catch(function () {});
        return t2;
      });
    });
    stkMem[it.id] = p;
    p.catch(function () { setTimeout(function () { delete stkMem[it.id]; }, 8000); });
    return p;
  }
  function sizedSvg(t, W, H) {
    return t.replace(/<svg\b([^>]*)>/, function (m, a) { a = a.replace(/\s(width|height)="[^"]*"/g, ""); if (a.indexOf("xmlns=") < 0) a += ' xmlns="http://www.w3.org/2000/svg"'; return "<svg" + a + ' width="' + W + '" height="' + H + '">'; });
  }
  function svgImg(e) {
    var it = EL.byId[e.lib]; if (!it) return null;
    var key = svgKey(e), c = svgCache[key];
    if (it.remote) {
      if (!c) {
        c = svgCache[key] = { img: new Image(), ok: false, remote: true };
        c.p = stkText(it).then(function (t) {
          return new Promise(function (res) {
            c.img.onload = function () { c.ok = true; res(); draw(); };
            c.img.onerror = function () { c.bad = true; res(); };
            c.img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(sizedSvg(t, 1000, 1000));
          });
        }).catch(function () { c.bad = true; setTimeout(function () { if (svgCache[key] === c) delete svgCache[key]; }, 8000); });
      }
      return c;
    }
    if (!c) {
      var a = it.stretch ? e.w / e.h : EL.aspect(e.lib), W = a >= 1 ? 1000 : 1000 * a, H = a >= 1 ? 1000 / a : 1000;
      c = svgCache[key] = { img: new Image(), ok: false };
      c.p = new Promise(function (res) {
        c.img.onload = function () { c.ok = true; svgLast[e.lib] = c; res(); draw(); };
        c.img.onerror = res;
      });
      c.img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(EL.svg(e.lib, [e.c1, e.c2, e.c3, e.c4], W, H));
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
  /* espaço entre letras desenhado letra por letra (o letterSpacing do canvas falha em letras pequenas) */
  var CUR_LS = 0;
  function mT(ctx, s) { var w = ctx.measureText(s).width / TS; return CUR_LS ? w + CUR_LS * Math.max(0, Array.from(s).length - 1) : w; }
  function fT(ctx, s, x, y) {
    if (DBG === "lines") return;
    ctx.save(); ctx.scale(1 / TS, 1 / TS); x *= TS; y *= TS;
    if (!CUR_LS) ctx.fillText(s, x, y);
    else Array.from(s).forEach(function (c) { ctx.fillText(c, x, y); x += ctx.measureText(c).width + CUR_LS * TS; });
    ctx.restore();
  }
  /* o texto é desenhado 16× maior e reduzido: letras pequenas ficam com espaçamento certo */
  var TS = 16;
  function fontStr(e, mm, bold) { return (e.italic ? "italic " : "") + ((bold == null ? e.bold : bold) ? "700 " : "400 ") + (mm * TS).toFixed(2) + "px \"" + e.font + "\", sans-serif"; }
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
    var tw = mT(ctx, txt);
    if (tw > w && tw > 0) { var k0 = w / tw; fs = fs * k0; CUR_LS *= k0; ctx.font = fontStr(e, fs); tw = mT(ctx, txt); }
    if (fs * 1.1 > h && h > 0) { var k1 = h / (fs * 1.1); fs *= k1; CUR_LS *= k1; ctx.font = fontStr(e, fs); tw = mT(ctx, txt); }
    ctx.fillStyle = e.color; ctx.textBaseline = "middle";
    fT(ctx, txt, alignX(e, w, tw), h / 2);
  }
  function wrap(ctx, text, maxW) {
    var out = [];
    String(text).split("\n").forEach(function (para) {
      var words = para.split(" "), line = "";
      words.forEach(function (w) {
        var t = line ? line + " " + w : w;
        if (mT(ctx, t) > maxW && line) { out.push(line); line = w; } else line = t;
      });
      out.push(line);
    });
    return out;
  }
  /* espaço entre letras e linhas (mm) — as letras nunca encostam nas linhas */
  function tg(e) { var g = e.tgap == null ? 1.2 : +e.tgap; return Math.max(0.3, Math.min(6, g)); }
  var DBG = null; /* teste automático: "text" desenha só letras, "lines" só linhas */
  function blockTitle(ctx, e, w) {
    if (!e.title) return 0;
    var fs = e.size * PT * 1.12;
    ctx.font = fontStr(e, fs, true); ctx.fillStyle = e.tColor; ctx.textBaseline = "alphabetic";
    var tw = mT(ctx, e.title), x = alignX(e, w, tw);
    fT(ctx, e.title, x, fs * 0.92);
    return fs * 0.92 + fs * 0.3 + tg(e);
  }
  function hline(ctx, e, x1, x2, y) { if (DBG === "text" || x2 - x1 < 0.5) return; ctx.save(); ctx.strokeStyle = e.lineColor; ctx.lineWidth = e.lineW; dash(ctx, e.lineStyle, e.lineW); ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke(); ctx.restore(); }

  function drawEl(ctx, e, data) {
    var w = e.w, h = e.h;
    ctx.save();
    ctx.globalAlpha = e.op == null ? 1 : e.op;
    ctx.translate(e.x + w / 2, e.y + h / 2);
    if (e.rot) ctx.rotate(e.rot * Math.PI / 180);
    if ((e.flipH || e.flipV) && (e.type === "svg" || e.type === "img")) ctx.scale(e.flipH ? -1 : 1, e.flipV ? -1 : 1);
    ctx.translate(-w / 2, -h / 2);
    CUR_LS = e.ls ? e.ls * e.size * PT : 0;
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
      if (t === "footer") { if (data.skip !== e.id) oneLine(ctx, e, e.text || "", w, h); }
      else if (data.skip !== e.id) wrap(ctx, e.text || "", w).forEach(function (ln, i) { fT(ctx, ln, alignX(e, w, mT(ctx, ln)), fs * (e.lh || 1.25) * (i + 0.5)); });
    } else if (t === "holiday") {
      var hol = data.sample ? "Natal (só nos feriados)" : data.hol;
      if (hol) oneLine(ctx, e, e.upper ? hol.toUpperCase() : hol, w, h);
    } else if (t === "date") {
      if (data.date) { if (e.style === "grande") { CUR_LS = 0; drawBigDate(ctx, e, data.date, w, h); } else oneLine(ctx, e, dateText(e, data.date), w, h); }
    } else if (t === "hours") {
      var top = blockTitle(ctx, e, w), labels = slotLabels(e), n = labels.length;
      if (n) {
        var g = tg(e), f = e.size * PT, avail = h - top, rowsFit = Math.max(1, Math.floor(avail / (f * 1.9))), cols = Math.min(3, Math.ceil(n / rowsFit)), rows = Math.ceil(n / cols), rowH = avail / rows;
        /* a linha de cada horário: as letras ficam em cima dela, com folga, e a altura das letras cabe na fileira */
        if (rowH < f * 0.8 + g + 0.5) f = Math.max(1.2, (rowH - g - 0.5) / 0.8);
        var gap = 3, cw = (w - gap * (cols - 1)) / cols;
        ctx.font = fontStr(e, f); ctx.fillStyle = e.color; ctx.textBaseline = "alphabetic";
        /* coluna própria para o horário: a linha de escrever começa depois do texto */
        var lw = 0; labels.forEach(function (lb) { lw = Math.max(lw, mT(ctx, lb)); });
        var lgap = Math.max(1.5, g);
        labels.forEach(function (lb, i) {
          var c = Math.floor(i / rows), r = i % rows, x = c * (cw + gap), yb = top + (r + 1) * rowH;
          fT(ctx, lb, x, yb - g);
          hline(ctx, e, x + lw + lgap, x + cw, yb);
        });
      }
    } else if (t === "tasks") {
      var tp = blockTitle(ctx, e, w), cnt = Math.max(1, e.count | 0), rh = (h - tp) / cnt, tgt = tg(e), bx = Math.max(1, Math.min(rh * 0.55, e.size * PT * 1.1, rh - tgt - 0.4));
      for (var i = 0; i < cnt; i++) {
        var yb = tp + (i + 1) * rh;
        if (DBG !== "text") { ctx.save(); ctx.strokeStyle = e.tColor; ctx.lineWidth = 0.25; rr(ctx, 0.2, yb - bx - tgt, bx, bx, bx * 0.2); ctx.stroke(); ctx.restore(); }
        hline(ctx, e, bx + Math.max(1.5, tgt), w, yb);
      }
    } else if (t === "notes") {
      var tn = blockTitle(ctx, e, w), sp = Math.max(2, +e.spacing || 6);
      if (e.kind === "pontilhado") {
        ctx.fillStyle = e.lineColor;
        var r0 = Math.max(0.22, e.lineW * 1.1);
        if (DBG !== "text") for (var yy = tn + sp / 2; yy <= h; yy += sp) for (var xx = sp / 2; xx <= w; xx += sp) { ctx.beginPath(); ctx.arc(xx, yy, r0, 0, 7); ctx.fill(); }
      } else if (e.kind === "linhas") {
        for (var y2 = tn + sp; y2 <= h + 0.01; y2 += sp) hline(ctx, e, 0, w, y2);
      }
    } else if (t === "svg") {
      var c = svgImg(e);
      if (c && c.ok) ctx.drawImage(c.img, 0, 0, w, h);
      else if (c && c.remote && data.editor) { ctx.fillStyle = c.bad ? "#f6e3e3" : "#f3edf7"; rr(ctx, 0, 0, w, h, Math.min(w, h) * 0.2); ctx.fill(); }
    } else if (t === "img") {
      var ci = upImg(e.img);
      if (ci && ci.ok) {
        var cr = e.crop, iw = ci.img.naturalWidth, ih = ci.img.naturalHeight;
        if (cr) ctx.drawImage(ci.img, cr.l * iw, cr.t * ih, Math.max(1, iw * (1 - cr.l - cr.r)), Math.max(1, ih * (1 - cr.t - cr.b)), 0, 0, w, h);
        else ctx.drawImage(ci.img, 0, 0, w, h);
      } else if (data.sample) { ctx.fillStyle = "#f3e8ee"; ctx.fillRect(0, 0, w, h); }
      if (e.bw > 0) { ctx.strokeStyle = e.bc || "#E88AA6"; ctx.lineWidth = e.bw; ctx.strokeRect(e.bw / 2, e.bw / 2, w - e.bw, h - e.bw); }
    }
    ctx.restore(); CUR_LS = 0;
  }
  function drawBigDate(ctx, e, d, w, h) {
    var p = dateParts(d), num = p.dd, wd = p.sem.toUpperCase(), mo = p.mes3.toUpperCase();
    ctx.fillStyle = e.color; ctx.textBaseline = "alphabetic";
    var big = function (s) { ctx.font = fontStr(e, s, true); }, small = function (s) { ctx.font = fontStr(e, s); };
    if (w >= h * 1.3) { // horizontal: 07 | QUI / JAN
      var F = h * 1.05, S, nw, sw, tot;
      for (var k = 0; k < 2; k++) {
        S = F * 0.36; big(F); nw = mT(ctx, num); small(S); sw = Math.max(mT(ctx, wd), mT(ctx, mo));
        tot = nw + F * 0.12 + sw; if (tot > w) F *= w / tot; else break;
      }
      S = F * 0.36; big(F); nw = mT(ctx, num); small(S); sw = Math.max(mT(ctx, wd), mT(ctx, mo));
      tot = nw + F * 0.12 + sw;
      var x0 = alignX(e, w, tot), base = h / 2 + F * 0.36;
      big(F); fT(ctx, num, x0, base);
      small(S); fT(ctx, wd, x0 + nw + F * 0.12, base - F * 0.72 + S * 0.85); fT(ctx, mo, x0 + nw + F * 0.12, base);
    } else { // vertical: 07 / QUI / JAN
      var F2 = h * 0.5, S2;
      for (var j = 0; j < 3; j++) {
        S2 = F2 * 0.34; big(F2); var w1 = mT(ctx, num); small(S2); var w2 = Math.max(mT(ctx, wd), mT(ctx, mo));
        var mw = Math.max(w1, w2), th = F2 * 0.75 + S2 * 2.6;
        var sc = Math.min(w / mw, h / th); if (sc < 1 || j === 0) F2 *= Math.min(sc, 1.6); else break;
      }
      S2 = F2 * 0.34;
      var total = F2 * 0.75 + S2 * 2.6, y0 = (h - total) / 2 + F2 * 0.75;
      var cx = function (s) { var tw = mT(ctx, s); return e.align === "left" ? 0 : e.align === "right" ? w - tw : (w - tw) / 2; };
      big(F2); fT(ctx, num, cx(num), y0);
      small(S2); fT(ctx, wd, cx(wd), y0 + S2 * 1.35); fT(ctx, mo, cx(mo), y0 + S2 * 2.6);
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
    var side = twoS() && pi % 2 === 1 ? "verso" : "frente", m = P.models[P.fmt][side];
    if (P.fmt === 2) {
      for (var j = 0; j < 2; j++) {
        var d = days[pi * 2 + j];
        if (!d) continue;
        ctx.save(); ctx.translate(0, j * 105); drawModel(ctx, m, dayData(d)); ctx.restore();
      }
      if (P.settings.cutLine) { ctx.save(); ctx.strokeStyle = "#cccccc"; ctx.lineWidth = 0.2; ctx.setLineDash([1.5, 1.5]); ctx.beginPath(); ctx.moveTo(0, 105); ctx.lineTo(148, 105); ctx.stroke(); ctx.restore(); }
    } else drawModel(ctx, m, dayData(days[pi]));
  }

  /* ---------------- Ícones ---------------- */
  var IC = {
    modelos: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
    elementos: '<circle cx="7.5" cy="7.5" r="4"/><path d="M16.5 3.5l4 7h-8z"/><rect x="13" y="13.5" width="7.5" height="7.5" rx="1"/><path d="M7.5 13l4 4-4 4-4-4z"/>',
    texto: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>',
    midia: '<polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>',
    fundo: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    agenda: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h2M14 14h2M8 18h2"/>',
    camadas: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    dup: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    lock: '<rect x="4" y="11" width="16" height="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    unlock: '<rect x="4" y="11" width="16" height="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.9-1"/>',
    more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
    rotate: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
    crop: '<path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"/><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"/>',
    move: '<polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>',
    "align-left": '<line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>',
    "align-center": '<line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/>',
    "align-right": '<line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
    sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
    swap: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    borda: '<rect x="3" y="3" width="18" height="18" rx="3"/><rect x="7.5" y="7.5" width="9" height="9" rx="1" stroke-dasharray="2 2"/>',
    flip: '<path d="M12 3v18" stroke-dasharray="2 2"/><path d="M9 6L3 18h6z"/><path d="M15 6l6 12h-6z"/>',
    opac: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
    spacing: '<path d="M3 4v16M21 4v16"/><path d="M7 12h10M9 9l-3 3 3 3M15 9l3 3-3 3"/>',
    font: '<path d="M3 19l5-14 5 14M5 14h6"/><path d="M20 19v-6.5a3 3 0 0 0-5.5-1.5M20 15.5c-1-1.5-5-2-5.5.5s2.5 3.5 5.5 0"/>',
    size: '<path d="M4 20L9.5 5 15 20M6.2 15h6.6"/><path d="M19 5v14M17 7l2-2 2 2M17 17l2 2 2-2"/>',
    bold: '<path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z"/>',
    italic: '<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>',
    roller: '<rect x="3" y="3" width="15" height="6" rx="1.5"/><path d="M18 6h3v6h-9v3"/><rect x="10" y="15" width="4" height="6" rx="1"/>',
    paste: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 14l2 2 4-4"/>',
    group: '<rect x="2" y="2" width="9" height="9" rx="1"/><rect x="13" y="13" width="9" height="9" rx="1"/><path d="M15 2h7v7M2 15v7h7" stroke-dasharray="2 2"/>',
    multi: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    alinhar: '<path d="M3 3v18"/><rect x="7" y="6" width="13" height="4" rx="1"/><rect x="7" y="14" width="8" height="4" rx="1"/>',
    "al-left": '<path d="M4 3v18"/><rect x="8" y="6" width="12" height="4" rx="1"/><rect x="8" y="14" width="7" height="4" rx="1"/>',
    "al-center": '<path d="M12 3v18"/><rect x="5" y="6" width="14" height="4" rx="1"/><rect x="8" y="14" width="8" height="4" rx="1"/>',
    "al-right": '<path d="M20 3v18"/><rect x="4" y="6" width="12" height="4" rx="1"/><rect x="9" y="14" width="7" height="4" rx="1"/>',
    "al-top": '<path d="M3 4h18"/><rect x="6" y="8" width="4" height="12" rx="1"/><rect x="14" y="8" width="4" height="7" rx="1"/>',
    "al-middle": '<path d="M3 12h18"/><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="8" width="4" height="8" rx="1"/>',
    "al-bottom": '<path d="M3 20h18"/><rect x="6" y="4" width="4" height="12" rx="1"/><rect x="14" y="9" width="4" height="7" rx="1"/>',
    up: '<polyline points="18 15 12 9 6 15"/>', down: '<polyline points="6 9 12 15 18 9"/>',
    front: '<rect x="8" y="8" width="13" height="13" rx="2" fill="currentColor"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/>',
    back: '<rect x="8" y="8" width="13" height="13" rx="2"/><rect x="3" y="3" width="10" height="10" rx="2" fill="currentColor"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'
  };
  function ic(n, cls) { return '<svg viewBox="0 0 24 24"' + (cls ? ' class="' + cls + '"' : "") + ">" + (IC[n] || "") + "</svg>"; }
  document.querySelectorAll("[data-ic]").forEach(function (i) { i.innerHTML = ic(i.dataset.ic); });
  function r1(v) { return Math.round(v * 10) / 10; }

  /* ---------------- Editor: palco ---------------- */
  var cv = $("cv"), cx = cv.getContext("2d"), stage = $("stage"), wrapEl = $("stageWrap"), selBox = $("sel"), mini = $("mini"), ied = $("ied");
  var sheet = $("sheet"), body = $("sheetBody"), ctxbar = $("ctxbar");
  var scale = 3; // px por mm (CSS)
  var fitH = 0, MARGIN = 9;
  function frozen() { return document.body.classList.contains("sheet-open") || !!ST.editId; }
  function fitScale() {
    var m = M(), aw = wrapEl.clientWidth - 24;
    if (!frozen() || !fitH) fitH = wrapEl.clientHeight - 24 - (ctxbar.hidden ? 64 : 0);
    return Math.max(0.5, Math.min(aw / m.w, fitH > 100 ? fitH / m.h : 99));
  }
  function bb(e) {
    var a = (e.rot || 0) * Math.PI / 180, c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a)), w = e.w * c + e.h * s, h = e.w * s + e.h * c, x = e.x + e.w / 2, y = e.y + e.h / 2;
    return { l: x - w / 2, t: y - h / 2, r: x + w / 2, b: y + h / 2 };
  }
  function unionBB(list) {
    var u = null;
    list.forEach(function (e) { var b = bb(e); if (!u) u = { l: b.l, t: b.t, r: b.r, b: b.b }; else { u.l = Math.min(u.l, b.l); u.t = Math.min(u.t, b.t); u.r = Math.max(u.r, b.r); u.b = Math.max(u.b, b.b); } });
    return u;
  }
  function showSel() {
    var list = selAll(); if (!list.length) return;
    var u = unionBB(list), top = u.t * scale + 12 - 60, bot = u.b * scale + 12 + 60, vh = wrapEl.clientHeight;
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
      drawModel(cx, m, { date: SAMPLE, hol: "", sample: true, skip: ST.editId, editor: true });
      var list = selAll();
      if (list.length > 1) {
        cx.save(); cx.strokeStyle = "#8B3DFF"; cx.lineWidth = 1.5 / scale; cx.setLineDash([4 / scale, 3 / scale]);
        list.forEach(function (e) { cx.save(); cx.translate(e.x + e.w / 2, e.y + e.h / 2); cx.rotate((e.rot || 0) * Math.PI / 180); cx.strokeRect(-e.w / 2, -e.h / 2, e.w, e.h); cx.restore(); });
        cx.restore();
      }
      if (ST.guides.length) {
        cx.save(); cx.strokeStyle = "#FF2E93"; cx.lineWidth = 1.4 / scale;
        ST.guides.forEach(function (g) { cx.beginPath(); if (g.x != null) { cx.moveTo(g.x, 0); cx.lineTo(g.x, m.h); } else { cx.moveTo(0, g.y); cx.lineTo(m.w, g.y); } cx.stroke(); });
        cx.restore();
      }
      updSel();
    });
  }
  function aspectLocked(e) { return e.type === "img" || (e.type === "svg" && EL.byId[e.lib] && !EL.byId[e.lib].stretch); }
  var miniKey = "";
  function updSel() {
    var list = ST.step === 1 ? selAll() : [];
    if (!list.length) { selBox.hidden = true; mini.hidden = true; return; }
    var multi = list.length > 1, e = selEl() || list[0], locked = list.some(function (x) { return x.lock; });
    selBox.hidden = false;
    selBox.classList.toggle("multi", multi); selBox.classList.toggle("locked", locked);
    selBox.classList.toggle("noh", multi || aspectLocked(e) || e.w * scale < 56 || e.h * scale < 50); selBox.classList.toggle("drag", !!(G && G.moved) || !!ST.editId);
    var u;
    if (multi) {
      u = unionBB(list);
      selBox.style.left = u.l * scale + "px"; selBox.style.top = u.t * scale + "px";
      selBox.style.width = (u.r - u.l) * scale + "px"; selBox.style.height = (u.b - u.t) * scale + "px"; selBox.style.transform = "none";
    } else {
      u = bb(e);
      selBox.style.left = e.x * scale + "px"; selBox.style.top = e.y * scale + "px";
      selBox.style.width = Math.max(4, e.w * scale) + "px"; selBox.style.height = Math.max(4, e.h * scale) + "px";
      selBox.style.transform = "rotate(" + (e.rot || 0) + "deg)";
    }
    if (ST.editId) { var ee = byId(ST.editId); if (ee) posEditor(ee); }
    if ((G && G.moved) || ST.editId || ST.sheet || ST.multiMode) { mini.hidden = true; return; }
    var key = (locked ? "L" : "U");
    if (key !== miniKey) {
      miniKey = key;
      mini.innerHTML = locked
        ? '<button type="button" data-a="lock">' + ic("unlock") + "Desbloquear</button>" + '<button type="button" data-a="menu">' + ic("more") + "Mais</button>"
        : '<button type="button" data-a="dup">' + ic("dup") + 'Duplicar</button><button type="button" data-a="del">' + ic("trash") + 'Apagar</button><button type="button" data-a="lock">' + ic("lock") + 'Bloquear</button><button type="button" data-a="menu">' + ic("more") + "Mais</button>";
    }
    mini.hidden = false;
    var mw = mini.offsetWidth || 200, sw = stage.offsetWidth, cxp = (u.l + u.r) / 2 * scale;
    cxp = Math.max(mw / 2 - 8, Math.min(sw - mw / 2 + 8, cxp));
    var top = u.t * scale - 60;
    if (top < -8) top = Math.min(u.b * scale + 62, stage.offsetHeight - 50);
    if (top < -8) top = 4;
    mini.style.left = cxp + "px"; mini.style.top = top + "px";
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
      if (l.x >= -tx && l.x <= e.w + tx && l.y >= -ty && l.y <= e.h + ty) {
        if (e.type === "text" && !e.text && !e.boxBg && Math.min(l.x, l.y, e.w - l.x, e.h - l.y) > 3) continue; // moldura vazia: só pega na borda
        return e;
      }
    }
    return null;
  }

  /* ----- seleção ----- */
  function groupIds(e) { if (!e.grp) return [e.id]; return M().els.filter(function (x) { return x.grp === e.grp; }).map(function (x) { return x.id; }); }
  function setSelIds(ids, primary) {
    var u = []; ids.forEach(function (id) { if (u.indexOf(id) < 0 && byId(id)) u.push(id); });
    ST.sels = u; ST.sel = primary && u.indexOf(primary) > -1 ? primary : (u[u.length - 1] || null);
  }
  function selectEl(e) { setSelIds(e ? groupIds(e) : [], e && e.id); }
  function clearSel() { ST.sels = []; ST.sel = null; }
  function toggleSel(e) {
    var ids = groupIds(e), has = ST.sels.indexOf(e.id) > -1;
    setSelIds(has ? ST.sels.filter(function (id) { return ids.indexOf(id) < 0; }) : ST.sels.concat(ids), has ? ST.sel : e.id);
  }

  /* ----- ímã e guias ----- */
  function snapTargets(list) {
    var m = M(), ids = {}; list.forEach(function (x) { ids[x.id] = 1; });
    var X = [0, MARGIN, m.w / 2, m.w - MARGIN, m.w], Y = [0, MARGIN, m.h / 2, m.h - MARGIN, m.h];
    m.els.forEach(function (e) {
      if (ids[e.id]) return; var b = bb(e);
      if (b.r - b.l > m.w * 0.97 && b.b - b.t > m.h * 0.97) return;
      X.push(b.l, (b.l + b.r) / 2, b.r); Y.push(b.t, (b.t + b.b) / 2, b.b);
    });
    return { X: X, Y: Y };
  }
  function snap1(edges, targets, th) {
    var best = null;
    edges.forEach(function (ev) { targets.forEach(function (t) { var d = t - ev; if (Math.abs(d) <= th && (!best || Math.abs(d) < Math.abs(best.d))) best = { d: d, v: t }; }); });
    return best;
  }

  /* ----- toque e arraste ----- */
  var ptrs = {}, G = null, LP = null, lastTap = { id: null, t: 0 }, moveEv = null, moveRaf = 0;
  function pdist() { var k = Object.keys(ptrs); if (k.length < 2) return 0; var a = ptrs[k[0]], b = ptrs[k[1]]; return Math.hypot(a.x - b.x, a.y - b.y); }
  function pmid() { var k = Object.keys(ptrs), a = ptrs[k[0]], b = ptrs[k[1]]; return { clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 }; }
  function cancelLP() { if (LP) { clearTimeout(LP); LP = null; } }
  function undoDrag(g) {
    if (g && g.origs) g.origs.forEach(function (o) { o.e.x = o.x; o.e.y = o.y; });
    if (g && g.orig && g.el) Object.assign(g.el, g.orig);
  }
  wrapEl.addEventListener("pointerdown", function (ev) {
    if (ev.target.closest && ev.target.closest(".nostage")) return;
    if (ev.pointerType === "mouse" && ev.button !== 0) return;
    if (ST.editId) { endEdit(true); ev.preventDefault(); return; }
    if (ST.sheet && !ELSHEETS[ST.sheet]) closeSheet();
    ptrs[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
    try { wrapEl.setPointerCapture(ev.pointerId); } catch (x) {}
    var n = Object.keys(ptrs).length;
    if (n === 2) {
      cancelLP();
      if (G && G.moved) undoDrag(G);
      if (G && G.newSel) { setSelIds(G.prevSels, G.prevSel); renderUI(); }
      ST.guides = [];
      G = { mode: "pinch", d0: pdist(), z0: ST.zoom, mm: toMm(pmid()) };
      draw(); return;
    }
    if (n > 2) return;
    var p = toMm(ev), hEl = ev.target.closest && ev.target.closest("[data-h]"), e = selEl();
    if (hEl && e && !isMulti() && !e.lock) {
      G = { mode: hEl.dataset.h, el: e, orig: { x: e.x, y: e.y, w: e.w, h: e.h, rot: e.rot }, p0: p, moved: false };
      ev.preventDefault(); return;
    }
    var t = hit(p);
    if (t) {
      var inSel = ST.sels.indexOf(t.id) > -1, prevSels = ST.sels.slice(), prevSel = ST.sel;
      if (!ST.multiMode && !inSel) { selectEl(t); renderUI(); }
      G = { mode: "drag", el: t, p0: p, c0: { x: ev.clientX, y: ev.clientY }, moved: false, newSel: !ST.multiMode && !inSel, prevSels: prevSels, prevSel: prevSel, wasSel: inSel, toggle: ST.multiMode };
      var cxy = { x: ev.clientX, y: ev.clientY };
      LP = setTimeout(function () { LP = null; if (!G || G.moved || G.mode !== "drag" || G.el !== t) return; G.long = true; longPress(t, cxy.x, cxy.y, prevSels); }, 520);
    } else {
      G = { mode: "pan", sx: wrapEl.scrollLeft, sy: wrapEl.scrollTop, c0: { x: ev.clientX, y: ev.clientY }, moved: false };
    }
    ev.preventDefault();
  });
  wrapEl.addEventListener("pointermove", function (ev) {
    if (!ptrs[ev.pointerId]) return;
    ptrs[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
    moveEv = { clientX: ev.clientX, clientY: ev.clientY };
    if (!moveRaf) moveRaf = requestAnimationFrame(function () { moveRaf = 0; var me = moveEv; moveEv = null; if (me) onMove(me); });
  });
  function onMove(ev) {
    if (!G) return;
    var m = M();
    if (G.mode === "pinch") { var d = pdist(); if (!G.d0 || !d) return; setZoom(G.z0 * d / G.d0, pmid(), G.mm); return; }
    if (G.mode === "pan") {
      var dx0 = ev.clientX - G.c0.x, dy0 = ev.clientY - G.c0.y;
      if (Math.abs(dx0) + Math.abs(dy0) > 6) { G.moved = true; cancelLP(); }
      wrapEl.scrollLeft = G.sx - dx0; wrapEl.scrollTop = G.sy - dy0; return;
    }
    if (G.long || G.mode === "none") return;
    var p = toMm(ev), e = G.el, o = G.orig;
    if (!G.moved) {
      if (Math.hypot(p.x - G.p0.x, p.y - G.p0.y) * scale < 7) return;
      G.moved = true; cancelLP();
      if (G.mode === "drag") {
        if (G.toggle && ST.sels.indexOf(e.id) < 0) { toggleSel(e); renderUI(); }
        var list = selAll();
        if (list.some(function (x) { return x.lock; })) { G = { mode: "pan", sx: wrapEl.scrollLeft, sy: wrapEl.scrollTop, c0: G.c0, moved: true }; return onMove(ev); }
        G.origs = list.map(function (x) { return { e: x, x: x.x, y: x.y }; });
        G.ub = unionBB(list); G.tg = snapTargets(list);
      }
    }
    if (G.mode === "drag") {
      var dx = p.x - G.p0.x, dy = p.y - G.p0.y, u = G.ub, th = 7 / scale;
      ST.guides = [];
      var sx = snap1([u.l + dx, (u.l + u.r) / 2 + dx, u.r + dx], G.tg.X, th);
      if (sx) { dx += sx.d; ST.guides.push({ x: sx.v }); }
      var sy = snap1([u.t + dy, (u.t + u.b) / 2 + dy, u.b + dy], G.tg.Y, th);
      if (sy) { dy += sy.d; ST.guides.push({ y: sy.v }); }
      G.origs.forEach(function (q) { q.e.x = Math.round((q.x + dx) * 100) / 100; q.e.y = Math.round((q.y + dy) * 100) / 100; });
    } else if (G.mode === "res" || G.mode === "rw" || G.mode === "rh") {
      var a = (o.rot || 0) * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux;
      var ocx = o.x + o.w / 2, ocy = o.y + o.h / 2;
      var Ax = ocx - ux * o.w / 2 - vx * o.h / 2, Ay = ocy - uy * o.w / 2 - vy * o.h / 2; // canto sup. esq.
      var dxp = p.x - Ax, dyp = p.y - Ay, nw = Math.max(3, dxp * ux + dyp * uy), nh = Math.max(2, dxp * vx + dyp * vy);
      if (G.mode === "rw") nh = o.h; if (G.mode === "rh") nw = o.w;
      if (G.mode === "res" && aspectLocked(e)) { var r = o.h / o.w; if (nh / nw > r) nw = nh / r; else nh = nw * r; }
      e.w = r1(nw); e.h = r1(nh);
      var ncx = Ax + ux * e.w / 2 + vx * e.h / 2, ncy = Ay + uy * e.w / 2 + vy * e.h / 2;
      e.x = r1(ncx - e.w / 2); e.y = r1(ncy - e.h / 2);
    } else if (G.mode === "rot") {
      var ccx = o.x + o.w / 2, ccy = o.y + o.h / 2, ang = Math.atan2(p.y - ccy, p.x - ccx) * 180 / Math.PI - 90;
      ang = ((ang % 360) + 360) % 360; if (ang > 180) ang -= 360;
      [0, 45, -45, 90, -90, 135, -135, 180, -180].forEach(function (s) { if (Math.abs(ang - s) < 4) ang = s; });
      e.rot = Math.round(ang);
    }
    draw();
  }
  function pend(ev) {
    if (!ptrs[ev.pointerId]) return;
    if (moveEv && G && G.mode !== "pinch") { var me = moveEv; moveEv = null; if (moveRaf) { cancelAnimationFrame(moveRaf); moveRaf = 0; } onMove(me); }
    delete ptrs[ev.pointerId]; cancelLP();
    if (!G) return;
    if (G.mode === "pinch") { if (Object.keys(ptrs).length === 0) G = null; else G = { mode: "none" }; return; }
    var g = G; G = null;
    if (g.mode === "none") return;
    if (g.mode === "pan") {
      if (!g.moved && ev.type === "pointerup" && !ST.multiMode && ST.sels.length) { clearSel(); closeSheet(); renderUI(); }
      return;
    }
    if (g.long) return;
    if (g.moved) { ST.guides = []; commit(); draw(); renderUI(); return; }
    if (g.mode !== "drag" && g.el && ev.type === "pointerup") g = { mode: "drag", el: g.el, wasSel: true };
    if (g.mode === "drag" && ev.type === "pointerup") {
      if (g.toggle) { toggleSel(g.el); renderUI(); return; }
      var now = Date.now();
      if (g.wasSel && lastTap.id === g.el.id && now - lastTap.t < 450) { lastTap = { id: null, t: 0 }; onDoubleTap(g.el); return; }
      lastTap = { id: g.el.id, t: now };
      if (isMulti() && g.wasSel && !g.el.grp) { selectEl(g.el); renderUI(); }
    }
    updSel();
  }
  wrapEl.addEventListener("pointerup", pend);
  wrapEl.addEventListener("pointercancel", pend);
  wrapEl.addEventListener("contextmenu", function (ev) { ev.preventDefault(); });
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
  window.addEventListener("resize", function () { clearTimeout(layout.t); layout.t = setTimeout(function () { layout(); if (ST.editId) showSel(); }, 150); });

  function longPress(t, x, y, prevSels) {
    try { if (navigator.vibrate) navigator.vibrate(15); } catch (er) {}
    if (prevSels.length && prevSels.indexOf(t.id) < 0) {
      setSelIds(prevSels.concat(groupIds(t)), t.id); renderUI();
      toast(selAll().length + " itens selecionados · segure em outro para juntar mais");
    } else { if (ST.sels.indexOf(t.id) < 0) selectEl(t); renderUI(); openMenu(x, y); }
  }
  function onDoubleTap(e) {
    if (e.lock) { toast("Item bloqueado · toque em Desbloquear"); return; }
    if (e.type === "text" || e.type === "footer") startEdit(e);
    else if (e.type === "svg") openSheet("cor");
    else if (e.type === "img") openSheet("recortar");
    else openSheet("ajustes");
  }

  /* ----- editar texto direto na folha ----- */
  function posEditor(e) {
    var fs = e.size * PT * scale, st = ied.style;
    st.font = (e.italic ? "italic " : "") + (e.bold ? "700 " : "400 ") + fs.toFixed(2) + "px '" + e.font + "', sans-serif";
    st.lineHeight = e.type === "footer" ? Math.max(fs * 1.2, e.h * scale - 4) + "px" : (fs * (e.lh || 1.25)).toFixed(2) + "px";
    st.letterSpacing = ((e.ls || 0) * fs).toFixed(2) + "px";
    st.color = e.color; st.textAlign = e.align || "left";
    st.left = e.x * scale - 2 + "px"; st.top = e.y * scale - 2 + "px"; st.width = e.w * scale + 4 + "px";
    st.height = "auto"; st.height = Math.max(e.h * scale + 4, ied.scrollHeight) + "px";
    st.transform = "rotate(" + (e.rot || 0) + "deg)";
  }
  function startEdit(e) {
    closeSheet(); closeMenu();
    ST.editId = e.id; selectEl(e);
    fontCss(e.font);
    var px = e.size * PT * scale; ST.preEditZoom = null;
    if (px < 15) { ST.preEditZoom = ST.zoom; setZoom(Math.min(5, ST.zoom * 16 / px)); var r0 = cv.getBoundingClientRect(), wr = wrapEl.getBoundingClientRect(); wrapEl.scrollLeft += r0.left + (e.x + e.w / 2) * scale - (wr.left + wr.width / 2); }
    ied.hidden = false; ied.value = e.text || "";
    posEditor(e); mini.hidden = true;
    ied.focus();
    if (e.text === DEF.text.text || e.text === "Título" || e.text === "Subtítulo") ied.select(); else ied.setSelectionRange(ied.value.length, ied.value.length);
    draw(); renderCtx();
    setTimeout(showSel, 350);
  }
  function fitTextH(e) {
    if (e.type !== "text") return;
    var fs = e.size * PT;
    cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); cx.font = fontStr(e, fs);
    CUR_LS = e.ls ? e.ls * fs : 0;
    var lines = wrap(cx, e.text || "", e.w).length; cx.restore(); CUR_LS = 0;
    var need = r1(lines * fs * (e.lh || 1.25) + 0.6);
    if (need > e.h) e.h = need;
  }
  function endEdit(save1) {
    if (!ST.editId) return;
    var e = byId(ST.editId); ST.editId = null; ied.hidden = true;
    if (e) { e.text = ied.value; fitTextH(e); }
    try { ied.blur(); } catch (x) {}
    if (ST.preEditZoom != null) { var z = ST.preEditZoom; ST.preEditZoom = null; setZoom(z); setTimeout(showSel, 30); }
    if (save1) commit();
    draw(); renderUI();
  }
  ied.addEventListener("input", function () { var e = byId(ST.editId); if (!e) return; e.text = ied.value; posEditor(e); later(); });
  ied.addEventListener("blur", function () { setTimeout(function () { if (ST.editId && document.activeElement !== ied) endEdit(true); }, 0); });
  ied.addEventListener("keydown", function (ev) { var e = byId(ST.editId); if (ev.key === "Escape" || (ev.key === "Enter" && e && e.type === "footer")) { ev.preventDefault(); endEdit(true); } });

  /* ---------------- Ações sobre a seleção ---------------- */
  var STYLE_KEYS = ["font", "size", "color", "tColor", "bold", "italic", "align", "lineColor", "lineStyle", "lineW", "boxBg", "boxBorder", "boxColor", "op", "c1", "c2", "c3", "c4", "ls", "lh", "tgap", "bw", "bc"];
  var TEXTISH = { text: 1, footer: 1, date: 1, holiday: 1, hours: 1, tasks: 1, notes: 1 };
  function styleOk(x, k, from) {
    if (k === "op") return true;
    if (CKEYS.indexOf(k) > -1) return x.type === "svg" && from === "svg" && colorKeys(x).indexOf(k) > -1;
    if (k === "bw" || k === "bc") return x.type === "img";
    return !!TEXTISH[x.type] && !!TEXTISH[from];
  }
  function units(list) {
    var map = {}, out = [];
    list.forEach(function (e) { var k = e.grp || e.id; if (!map[k]) { map[k] = []; out.push(map[k]); } map[k].push(e); });
    return out;
  }
  function alignSel(kind) {
    var list = selAll().filter(function (e) { return !e.lock; }); if (!list.length) return;
    var m = M(), us = units(list), ref;
    if (us.length > 1) ref = unionBB(list);
    else { var mg = ST.alignMargin ? MARGIN : 0; ref = { l: mg, t: mg, r: m.w - mg, b: m.h - mg }; }
    us.forEach(function (u) {
      var b = unionBB(u), dx = 0, dy = 0;
      if (kind === "left") dx = ref.l - b.l; else if (kind === "center") dx = (ref.l + ref.r) / 2 - (b.l + b.r) / 2; else if (kind === "right") dx = ref.r - b.r;
      else if (kind === "top") dy = ref.t - b.t; else if (kind === "middle") dy = (ref.t + ref.b) / 2 - (b.t + b.b) / 2; else if (kind === "bottom") dy = ref.b - b.b;
      u.forEach(function (e) { e.x = r1(e.x + dx); e.y = r1(e.y + dy); });
    });
    commit(); draw(); renderUI();
  }
  function setCrop(e, nc) {
    var oc = e.crop || { l: 0, t: 0, r: 0, b: 0 };
    nc = { l: Math.max(0, Math.min(0.45, nc.l)), t: Math.max(0, Math.min(0.45, nc.t)), r: Math.max(0, Math.min(0.45, nc.r)), b: Math.max(0, Math.min(0.45, nc.b)) };
    var fw = e.w / (1 - oc.l - oc.r), fh = e.h / (1 - oc.t - oc.b), fx = e.x - oc.l * fw, fy = e.y - oc.t * fh;
    e.x = r1(fx + nc.l * fw); e.y = r1(fy + nc.t * fh); e.w = r1(fw * (1 - nc.l - nc.r)); e.h = r1(fh * (1 - nc.t - nc.b));
    e.crop = nc.l || nc.t || nc.r || nc.b ? nc : null;
  }
  function doAct(a, arg) {
    var list = selAll(), e = selEl() || list[0], m = M();
    if (a === "menu") { var r = (arg && arg.getBoundingClientRect) ? arg.getBoundingClientRect() : null; openMenu(r ? r.left + r.width / 2 : innerWidth / 2, r ? r.bottom : innerHeight / 2); return; }
    if (a === "multi") { ST.multiMode = !ST.multiMode; closeSheet(); renderUI(); if (ST.multiMode) toast("Toque nos itens que quer juntar"); return; }
    if (!list.length) return;
    var unl = list.filter(function (x) { return !x.lock; });
    if (a === "dup") {
      var gmap = {}, ids = [];
      list.forEach(function (x) { var c = clone(x); c.id = uid(); c.x = r1(c.x + 5); c.y = r1(c.y + 5); c.lock = false; if (c.grp) { gmap[c.grp] = gmap[c.grp] || "g" + uid(); c.grp = gmap[c.grp]; } m.els.push(c); ids.push(c.id); });
      setSelIds(ids, ids[ids.length - 1]); toast(ids.length > 1 ? ids.length + " itens duplicados" : "Duplicado");
    } else if (a === "del") {
      if (!unl.length) { toast("Item bloqueado · desbloqueie para apagar"); return; }
      var dset = {}; unl.forEach(function (x) { dset[x.id] = 1; });
      m.els = m.els.filter(function (x) { return !dset[x.id]; });
      clearSel(); closeSheet(); toast((unl.length > 1 ? unl.length + " itens apagados" : "Apagado") + " · ↶ desfaz");
    } else if (a === "lock") {
      var lk = list.some(function (x) { return !x.lock; });
      list.forEach(function (x) { x.lock = lk; }); toast(lk ? "Bloqueado · não sai do lugar" : "Desbloqueado"); closeSheet();
    } else if (a === "edit") { if (e && (e.type === "text" || e.type === "footer")) startEdit(e); return; }
    else if (a === "copyStyle") {
      var v = {}; STYLE_KEYS.forEach(function (k) { if (k in e) v[k] = e[k]; }); ST.styleClip = { type: e.type, v: v };
      toast("Estilo copiado · escolha outro item e toque em Colar estilo"); renderCtx(); return;
    } else if (a === "pasteStyle") {
      var c0 = ST.styleClip; if (!c0) return;
      list.forEach(function (x) { STYLE_KEYS.forEach(function (k) { if (k in c0.v && styleOk(x, k, c0.type)) x[k] = c0.v[k]; }); if (x.font) loadFont(x.font, x.bold, x.italic).then(draw); });
      toast("Estilo colado");
    } else if (a === "group") {
      if (list.length < 2) return; var g = "g" + uid(); list.forEach(function (x) { x.grp = g; }); toast("Agrupado · agora se movem juntos");
    } else if (a === "ungroup") { list.forEach(function (x) { x.grp = null; }); toast("Desagrupado"); }
    else if (a === "front" || a === "back") {
      var set = {}; list.forEach(function (x) { set[x.id] = 1; });
      var rest = m.els.filter(function (x) { return !set[x.id]; }), mine = m.els.filter(function (x) { return set[x.id]; });
      m.els = a === "front" ? rest.concat(mine) : mine.concat(rest);
    } else if (a === "fwd" || a === "bwd") {
      var i = m.els.indexOf(e);
      if (a === "fwd" && i < m.els.length - 1) { m.els.splice(i, 1); m.els.splice(i + 1, 0, e); }
      if (a === "bwd" && i > 0) { m.els.splice(i, 1); m.els.splice(i - 1, 0, e); }
    } else if (a === "bold" || a === "italic") { var nv = !e[a]; list.forEach(function (x) { x[a] = nv; }); loadFont(e.font, e.bold, e.italic).then(draw); }
    else if (a === "alignTxt") { var nx = { left: "center", center: "right", right: "left" }[e.align] || "left"; list.forEach(function (x) { x.align = nx; }); toast(nx === "left" ? "Texto à esquerda" : nx === "center" ? "Texto centralizado" : "Texto à direita", 1200); }
    else if (a === "flipH" || a === "flipV") { list.forEach(function (x) { x[a] = !x[a]; }); }
    else if (a === "toBg") { if (e.type !== "img") return; m.bg.img = e.img; m.bg.op = e.op; m.els.splice(m.els.indexOf(e), 1); clearSel(); closeSheet(); toast("Agora é o fundo da folha"); }
    else if (a.indexOf("al-") === 0) { alignSel(a.slice(3)); return; }
    else if (a === "rot90") { list.forEach(function (x) { x.rot = ((x.rot || 0) + 90 + 180) % 360 - 180; }); }
    else if (a === "rot-90") { list.forEach(function (x) { x.rot = ((x.rot || 0) - 90 + 540) % 360 - 180; }); }
    else if (a === "rot0") { list.forEach(function (x) { x.rot = 0; }); }
    else if (a === "fullW") { e.x = MARGIN; e.w = m.w - MARGIN * 2; }
    else if (a === "cropReset") { setCrop(e, { l: 0, t: 0, r: 0, b: 0 }); }
    commit(); draw(); renderUI();
  }
  function nudge(dx, dy) {
    var list = selAll().filter(function (x) { return !x.lock; }); if (!list.length) return;
    list.forEach(function (x) { x.x = r1(x.x + dx * ST.nudge); x.y = r1(x.y + dy * ST.nudge); });
    draw(); later();
    body.querySelectorAll('input[data-k="x"],input[data-k="y"]').forEach(function (inp) { inp.value = list[0][inp.dataset.k]; });
  }

  /* ----- menu de contexto ----- */
  var cm = $("cmenu"), cmBack = $("cmBack");
  function openMenu(x, y) {
    var list = selAll(); if (!list.length) return;
    var e = selEl() || list[0], locked = list.some(function (z) { return z.lock; }), multi = list.length > 1, grouped = list.some(function (z) { return z.grp; });
    var it = [];
    function I(a, l, i, cls) { it.push('<button type="button" data-cm="' + a + '"' + (cls ? ' class="' + cls + '"' : "") + ">" + ic(i) + "<span>" + l + "</span></button>"); }
    if (!multi && (e.type === "text" || e.type === "footer") && !locked) I("edit", "Editar texto", "edit");
    I("dup", "Duplicar", "dup");
    I("lock", locked ? "Desbloquear" : "Bloquear", locked ? "unlock" : "lock");
    if (!locked) {
      I("copyStyle", "Copiar estilo", "roller");
      if (ST.styleClip) I("pasteStyle", "Colar estilo", "paste");
      it.push("<hr>");
      I("front", "Trazer para frente", "front"); I("back", "Enviar para trás", "back");
      I("sheet:alinhar", "Alinhar…", "alinhar");
      if (multi && !grouped) I("group", "Agrupar", "group");
      if (grouped) I("ungroup", "Desagrupar", "group");
      I("multi", ST.multiMode ? "Parar de selecionar vários" : "Selecionar vários", "multi");
      it.push("<hr>");
      I("del", "Apagar", "trash", "danger");
    }
    cm.innerHTML = it.join(""); cm.hidden = false; cmBack.hidden = false; mini.hidden = true;
    var w = cm.offsetWidth, h = cm.offsetHeight;
    cm.style.left = Math.max(8, Math.min(innerWidth - w - 8, x - w / 2)) + "px";
    var top = y + 24 + h < innerHeight - 8 ? y + 24 : y - 24 - h > 8 ? y - 24 - h : Math.max(8, innerHeight - h - 8);
    cm.style.top = top + "px"; cm._open = Date.now();
    pushBack();
  }
  function closeMenu() { if (cm.hidden) return; cm.hidden = true; cmBack.hidden = true; popBack(); updSel(); }
  cmBack.addEventListener("pointerdown", function (ev) { ev.preventDefault(); closeMenu(); });
  cm.addEventListener("click", function (ev) {
    var b = ev.target.closest("button[data-cm]"); if (!b || Date.now() - (cm._open || 0) < 450) return;
    var a = b.dataset.cm; closeMenu();
    if (a.indexOf("sheet:") === 0) openSheet(a.slice(6)); else doAct(a);
  });
  mini.addEventListener("click", function (ev) { var b = ev.target.closest("button[data-a]"); if (b) doAct(b.dataset.a, b); });

  /* ----- botão voltar do Android fecha painel/menu ----- */
  var backPushed = false;
  function pushBack() { if (!backPushed) { try { history.pushState({ ae: 1 }, ""); backPushed = true; } catch (x) {} } }
  function popBack() { if (backPushed && cm.hidden && !ST.sheet) { backPushed = false; try { history.back(); } catch (x) {} } }
  window.addEventListener("popstate", function () {
    if (!backPushed) return; backPushed = false;
    if (!cm.hidden) { cm.hidden = true; cmBack.hidden = true; }
    if (ST.sheet) { ST.sheet = null; ST.replaceId = null; sheet.classList.add("closed"); document.body.classList.remove("sheet-open"); renderUI(); }
  });

  /* ---------------- Adicionar elementos ---------------- */
  function place(e) {
    var m = M(), k = m.h < 150 ? 0.6 : 1;
    if (e.type !== "img" && e.type !== "svg" && e.type !== "text") { e.h = Math.min(e.h * k, m.h * 0.8); e.w = Math.min(e.w, m.w - 10); }
    e.x = r1((m.w - e.w) / 2); e.y = r1(Math.max(2, (m.h - e.h) / 2));
    m.els.push(e); ST.multiMode = false; selectEl(e); closeSheet(); commit(); draw(); renderUI(); setTimeout(showSel, 40);
  }
  function addAgenda(t) {
    var e = mk(t);
    if (t === "tasks" || t === "hours" || t === "notes") e.tColor = "#E88AA6";
    fontCss(e.font); place(e);
  }
  var TEXT_PRESETS = {
    titulo: { text: "Título", font: "Playfair Display", size: 22, bold: true, color: "#5B2A3C", w: 100, align: "center", label: "Adicionar um título" },
    subtitulo: { text: "Subtítulo", font: "Quicksand", size: 14, bold: true, color: "#C9607F", w: 90, align: "center", label: "Adicionar um subtítulo" },
    corpo: { text: "Seu texto aqui", font: "Quicksand", size: 11, color: "#555555", w: 70, label: "Adicionar um texto" },
    frase: { text: "Frase do dia", font: "Dancing Script", size: 20, color: "#E88AA6", bold: true, w: 90, align: "center", label: "Frase do dia" },
    lembrete: { text: "Não esquecer:", font: "Caveat", size: 15, color: "#555555", bold: true, w: 80, label: "Lembrete à mão" },
    etiqueta: { text: "PALAVRA", font: "Montserrat", size: 8, color: "#333333", bold: true, ls: 0.25, w: 50, align: "center", label: "PALAVRA ESPAÇADA" }
  };
  function addText(kind) {
    var p = Object.assign({}, TEXT_PRESETS[kind]); delete p.label;
    p.h = r1(p.size * PT * 1.25 + 0.8);
    var e = mk("text", p); fontCss(e.font); loadFont(e.font, e.bold, e.italic).then(draw);
    place(e);
  }
  function addSvg(id) {
    var it = EL.byId[id], a = EL.aspect(id), m = M(), base = it.stretch && a > 2.5 ? 90 : it.remote ? 36 : 34;
    if (!it.stretch && a > 2.5) base = 80;
    if (m.h < 150) base *= 0.7;
    var w = a >= 1 ? base : base * a, h = a >= 1 ? base / a : base;
    if (h > m.h * 0.9) { h = m.h * 0.9; w = h * a; }
    if (w > m.w * 0.9) { w = m.w * 0.9; h = w / a; }
    libRecent(id);
    place(mk("svg", { lib: id, w: r1(w), h: r1(h) }));
    toast("“" + it.name + "” adicionado", 1500);
  }
  function replaceSvg(id) {
    var e = byId(ST.replaceId); if (!e) return;
    var it = EL.byId[id], a = EL.aspect(id), cxm = e.x + e.w / 2, cym = e.y + e.h / 2, size = Math.max(e.w, e.h);
    e.lib = id; setCols(e, it, false);
    if (!it.stretch) { e.w = r1(a >= 1 ? size : size * a); e.h = r1(a >= 1 ? size / a : size); }
    e.x = r1(cxm - e.w / 2); e.y = r1(cym - e.h / 2);
    libRecent(id);
    ST.replaceId = null; closeSheet(); commit(); draw(); renderUI(); toast("Trocado por “" + it.name + "”", 1500);
  }
  /* ----- biblioteca de elementos (estilo Canva) ----- */
  var libTiles = {};
  function tileSrc(id) {
    var it = EL.byId[id]; if (it.remote) return it.url;
    return libTiles[id] || (libTiles[id] = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(EL.svg(id)));
  }
  var RECENT_KEY = "agenda-elementos-recentes";
  function libRecentList() { var a = []; try { a = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch (x) {} return a.filter(function (id) { return EL.byId[id]; }); }
  function libRecent(id) { var a = libRecentList().filter(function (x) { return x !== id; }); a.unshift(id); try { localStorage.setItem(RECENT_KEY, JSON.stringify(a.slice(0, 24))); } catch (x) {} }
  var GROUP_TITLES = { "Ilustrações": "Ilustrações coloridas", "Decorados": "Decorados · troque as cores de cada parte", "Básicos": "Básicos e formas · mudam de cor" };
  function libItems(cat) { return EL.list.filter(function (e) { return e.cats.indexOf(cat) > -1; }); }
  function tile(e, named) {
    var wide = EL.aspect(e.id) > 2.4;
    return '<button type="button" class="lt' + (wide ? " wide" : "") + (e.remote ? " ill" : "") + '" data-lib="' + e.id + '" title="' + esc(e.name) + '" aria-label="' + esc(e.name) + '"><img alt="" data-src="' + esc(tileSrc(e.id)) + '">' + (named ? "<span>" + esc(e.name) + "</span>" : "") + "</button>";
  }
  function row(title, items, cat) {
    return '<section class="lib-row"><div class="lib-rh"><b>' + esc(title) + "</b>" + (cat && items.length > 10 ? '<button type="button" data-libcat="' + esc(cat) + '">Ver tudo ›</button>' : "") + '</div><div class="lib-scroll">' +
      items.slice(0, 12).map(function (e) { return tile(e); }).join("") + (cat && items.length > 12 ? '<button type="button" class="lt more" data-libcat="' + esc(cat) + '">Ver<br>tudo ›</button>' : "") + "</div></section>";
  }
  var libIO = null, libQT;
  function libLazy() {
    var root = $("libBody"); if (!root) return;
    if (libIO) libIO.disconnect();
    var show = function (im) { if (im && im.dataset.src) { im.src = im.dataset.src; im.removeAttribute("data-src"); } };
    libIO = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        var b = en.target; show(b.querySelector("img")); libIO.unobserve(b);
        /* numa fileira, já carrega os próximos para o deslize ficar suave */
        if (b.parentNode.classList.contains("lib-scroll")) { var n = b.nextElementSibling, k = 0; while (n && k < 4) { show(n.querySelector("img")); n = n.nextElementSibling; k++; } }
      });
    }, { root: body, rootMargin: "250px 0px" });
    root.querySelectorAll(".lt img[data-src]").forEach(function (im) { libIO.observe(im.parentNode); });
  }
  function renderLib() {
    var s = $("libSearch"), box = $("libBody"); if (!s || !box) return;
    var q = s.value.trim(), h = "";
    ST.libQ = s.value;
    if (q) {
      var seen = {}, items = EL.search(q).filter(function (e) { return seen[e.id] ? false : (seen[e.id] = 1); });
      h = items.length ? '<p class="lib-count">' + items.length + " elemento" + (items.length > 1 ? "s" : "") + ' para “' + esc(q) + '”</p><div class="lib-grid">' + items.slice(0, 400).map(function (e) { return tile(e, true); }).join("") + "</div>"
        : '<p class="lib-empty">Nada encontrado para “' + esc(q) + '”.<br>Tente outra palavra, como flor, coração, café, estrela, natal.</p>';
    } else if (ST.libView) {
      var list = ST.libView === "__recentes" ? libRecentList().map(function (id) { return EL.byId[id]; }) : libItems(ST.libView);
      h = '<div class="lib-head"><button type="button" class="btn" data-libback="1">‹ Voltar</button><b>' + esc(ST.libView === "__recentes" ? "Recentes" : ST.libView) + "</b><span>" + list.length + "</span></div>" +
        '<div class="lib-grid">' + list.map(function (e) { return tile(e, true); }).join("") + "</div>";
    } else {
      var rec = libRecentList();
      if (rec.length) h += row("Recentes", rec.map(function (id) { return EL.byId[id]; }), rec.length > 12 ? "__recentes" : null);
      ["Ilustrações", "Decorados", "Básicos"].forEach(function (g) {
        h += '<h3 class="lib-group">' + esc(GROUP_TITLES[g]) + "</h3>";
        (EL.groups[g] || []).forEach(function (c) { var it = libItems(c); if (it.length) h += row(c, it, c); });
      });
    }
    box.innerHTML = h;
    libLazy();
  }
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
  function imgEl(id, w0, h0, n) {
    var m = M(), a = w0 / h0, base = Math.min(60, m.w * 0.45), w = a >= 1 ? base : base * a, h = a >= 1 ? base / a : base;
    var e = mk("img", { img: id, w: r1(w), h: r1(h) });
    e.x = r1((m.w - w) / 2 + (n || 0) * 6); e.y = r1(Math.max(2, (m.h - h) / 2 + (n || 0) * 6));
    return e;
  }
  $("fileImg").addEventListener("change", function () {
    var files = Array.prototype.slice.call(this.files || []); this.value = "";
    if (!files.length) return;
    var m = M(), n = 0, ids = [];
    files.reduce(function (pr, f) {
      return pr.then(function () {
        return readImage(f).then(function (r) {
          var id = "im" + uid(); P.images[id] = r.url;
          var e = imgEl(id, r.w, r.h, n); n++;
          m.els.push(e); ids.push(e.id); upImg(id);
        }).catch(function () { toast("Não consegui abrir uma das imagens."); });
      });
    }, Promise.resolve()).then(function () {
      if (!n) return;
      setSelIds(ids, ids[ids.length - 1]); closeSheet(); commit(); draw(); renderUI();
      toast(n === 1 ? "Imagem adicionada" : n + " imagens adicionadas");
    });
  });
  $("fileBg").addEventListener("change", function () {
    var f = this.files && this.files[0]; this.value = ""; if (!f) return;
    readImage(f).then(function (r) { var id = "im" + uid(); P.images[id] = r.url; M().bg.img = id; upImg(id); commit(); draw(); renderUI(); toast("Fundo da folha colocado"); });
  });

  /* ---------------- Modelos (Frente e Verso) ---------------- */
  var TPL = window.AGENDA_TEMPLATES || [];
  function buildTpl(t, W, H, side) {
    var half = H < 150, k = H / 210, fs = half ? 0.78 : 1, els = [], bg = { color: "#FFFFFF", img: null, op: 1 };
    function push(e) { els.push(e); }
    var T = {
      W: W, H: H, half: half, verso: side === "verso", k: k,
      bg: function (c) { bg.color = c; },
      mx: function (x, w) { return side === "verso" ? r1(W - x - w) : x; },
      el: function (type, x, y, w, h, p) { p = Object.assign({}, p || {}); if (p.size) p.size = r1(p.size * fs); push(mk(type, Object.assign({ x: x, y: r1(y * k), w: w, h: r1(h * k) }, p))); },
      s: function (lib, x, y, size, p) {
        if (!EL.byId[lib]) return;
        var a = EL.aspect(lib), fw = a >= 1 ? size : size * a, fh = a >= 1 ? size / a : size, sz = size * (half ? 0.62 : 1);
        var w = a >= 1 ? sz : sz * a, h = a >= 1 ? sz / a : sz;
        push(mk("svg", Object.assign({ lib: lib, w: r1(w), h: r1(h), x: r1(x + fw / 2 - w / 2), y: r1((y + fh / 2) * k - h / 2) }, p || {})));
      },
      r: function (lib, x, y, w, h, p) { if (!EL.byId[lib]) return; push(mk("svg", Object.assign({ lib: lib, x: x, y: r1(y * k), w: w, h: r1(h * k) }, p || {}))); }
    };
    t.build(T);
    return { w: W, h: H, bg: bg, els: els };
  }
  var tplCache = {};
  function tplModels(fmt) {
    if (tplCache[fmt]) return tplCache[fmt];
    var H = fmt === 2 ? 105 : 210;
    return (tplCache[fmt] = TPL.map(function (t) { return { f: buildTpl(t, 148, H, "frente"), v: buildTpl(t, 148, H, "verso") }; }));
  }
  function drawThumbs() {
    var ms = tplModels(P.fmt);
    body.querySelectorAll("canvas[data-tc]").forEach(function (c) {
      var i = parseInt(c.dataset.tc, 10), side = c.dataset.tc.slice(-1), m = ms[i] && ms[i][side]; if (!m) return;
      var d = Math.min(2, window.devicePixelRatio || 1), cw = c.clientWidth || 64, k = cw * d / m.w;
      c.width = Math.round(cw * d); c.height = Math.round(m.h * k);
      var g = c.getContext("2d"); g.setTransform(k, 0, 0, k, 0, 0); drawModel(g, m, { date: SAMPLE, hol: "", sample: true });
    });
  }
  function applyTpl(i) {
    var t = TPL[i]; if (!t) return;
    ask("Isso troca o que está na folha. Continuar?", "O modelo “" + t.name + "” vale para todas as páginas" + (twoS() ? " (Frente e Verso)" : "") + ". Dá para voltar com ↶ Desfazer.", "Usar modelo").then(function (ok) {
      if (!ok) return;
      var H = P.fmt === 2 ? 105 : 210, f = buildTpl(t, 148, H, "frente"), v = buildTpl(t, 148, H, "verso");
      P.models[P.fmt].frente = f; P.models[P.fmt].verso = v;
      ST.side = "frente"; clearSel(); closeSheet(); syncTop(); commit(); layout(); renderUI();
      ensureAssets([f, v]).then(draw);
      toast("Modelo “" + t.name + "” aplicado em todas as páginas · ↶ desfaz", 3500);
    });
  }

  /* ---------------- Painel de baixo (bottom sheet) ---------------- */
  var ELSHEETS = { ajustes: 1, trocar: 1, recortar: 1, fonte: 1, tamanho: 1, cor: 1, espaco: 1, borda: 1, opac: 1, girar: 1, virar: 1, pos: 1, alinhar: 1 };
  var TITLES = { modelos: "Modelos", elementos: "Elementos", texto: "Texto", midia: "Mídia", fundo: "Fundo da folha", agenda: "Itens da agenda", camadas: "Camadas",
    ajustes: "Ajustes", trocar: "Trocar elemento", recortar: "Recortar imagem", fonte: "Fonte", tamanho: "Tamanho da letra", cor: "Cor", espaco: "Espaçamento", borda: "Caixa e borda",
    opac: "Opacidade", girar: "Girar", virar: "Virar", pos: "Posição e tamanho", alinhar: "Alinhar" };
  var TALL = { modelos: 1, elementos: 1, trocar: 1, fonte: 1 };
  function sheetOk(name, e, multi) {
    if (!ELSHEETS[name]) return true;
    if (!e) return false;
    if (multi) return name === "pos" || name === "alinhar" || name === "opac";
    var t = e.type;
    if (name === "ajustes") return !!TEXTISH[t];
    if (name === "fonte" || name === "tamanho" || name === "espaco") return !!TEXTISH[t];
    if (name === "trocar") return t === "svg";
    if (name === "recortar") return t === "img";
    if (name === "virar") return t === "svg" || t === "img";
    if (name === "cor") return t !== "img" && colorKeys(e).length > 0;
    if (name === "borda") return t !== "svg";
    return true;
  }
  function colorKeys(e) {
    if (!e) return [];
    if (e.type === "svg") { var it = EL.byId[e.lib]; return !it || it.remote ? [] : CKEYS.slice(0, Math.max(1, it.n)); }
    if (e.type === "img") return [];
    if (e.type === "hours" || e.type === "tasks" || e.type === "notes") return ["color", "tColor", "lineColor"];
    return ["color"];
  }
  function openSheet(name) {
    var e = selEl();
    if (ELSHEETS[name] && !sheetOk(name, e, isMulti())) return;
    if (ST.editId) endEdit(true);
    closeMenu();
    ST.sheet = name; ST.fontOpen = name === "fonte";
    ST.colorOpen = name === "cor" ? colorKeys(e)[0] : name === "fundo" ? "bg.color" : name === "borda" && e && e.type === "img" ? "bc" : null;
    if (name === "trocar") { ST.replaceId = e && e.id; ST.libView = (EL.byId[e.lib] || {}).cat || null; ST.libQ = ""; }
    if (name === "elementos") { ST.replaceId = null; ST.libView = null; ST.libQ = ""; }
    sheet.classList.remove("closed"); sheet.classList.toggle("tall", !!TALL[name]); sheet.style.transform = "";
    document.body.classList.add("sheet-open");
    pushBack();
    renderUI(); body.scrollTop = 0;
    setTimeout(showSel, 40);
  }
  function closeSheet() {
    if (!ST.sheet) return;
    ST.sheet = null; ST.replaceId = null; ST.fontOpen = false;
    sheet.classList.add("closed"); document.body.classList.remove("sheet-open");
    popBack(); renderUI();
  }
  $("btnDone").onclick = function () { closeSheet(); };
  /* arrastar o painel para baixo fecha */
  (function () {
    var head = $("sheetHead"), SW = null;
    head.addEventListener("pointerdown", function (ev) { if (ev.target.closest("button")) return; SW = { y0: ev.clientY, dy: 0 }; try { head.setPointerCapture(ev.pointerId); } catch (x) {} sheet.style.transition = "none"; });
    head.addEventListener("pointermove", function (ev) { if (!SW) return; SW.dy = Math.max(0, ev.clientY - SW.y0); sheet.style.transform = "translateY(" + SW.dy + "px)"; });
    function up() { if (!SW) return; var dy = SW.dy; SW = null; sheet.style.transition = ""; sheet.style.transform = ""; if (dy > 60) closeSheet(); }
    head.addEventListener("pointerup", up); head.addEventListener("pointercancel", up);
  })();
  $("mainbar").addEventListener("click", function (ev) {
    var b = ev.target.closest("button[data-main]"); if (!b) return;
    var n = b.dataset.main;
    if (ST.sheet === n) { closeSheet(); return; }
    ST.multiMode = false;
    if (n !== "camadas") { clearSel(); }
    openSheet(n);
  });
  ctxbar.addEventListener("click", function (ev) {
    var b = ev.target.closest("button[data-a]"); if (!b) return;
    var a = b.dataset.a;
    if (a.indexOf("sheet:") === 0) { var n = a.slice(6); if (ST.sheet === n) closeSheet(); else openSheet(n); } else doAct(a, b);
  });
  $("multiDone").onclick = function () { ST.multiMode = false; renderUI(); };

  function elLabel(e) {
    if (e.type === "svg") return (EL.byId[e.lib] || {}).name || "Elemento";
    if (e.type === "text" || e.type === "footer") return TYPE_NAMES[e.type] + ": " + (e.text || "").slice(0, 22);
    return TYPE_NAMES[e.type];
  }
  /* ----- Painel de cores ----- */
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
    var set = {}, keys = ["color", "tColor", "lineColor", "boxBg", "boxColor", "c1", "c2", "c3", "c4", "bc"];
    usedModels().forEach(function (m) { if (m.bg.color && up(m.bg.color) !== "#FFFFFF") set[up(m.bg.color)] = 1; m.els.forEach(function (e) { keys.forEach(function (k) { if (e[k] && /^#[0-9a-f]{6}$/i.test(e[k])) set[up(e[k])] = 1; }); }); });
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
    var pp = body.querySelector('.part[data-ck="' + pk + '"] .sw'); if (pp) pp.style.background = hex;
    var cb = body.querySelector('.colorbtn[data-ck="' + pk + '"]'); if (cb) { cb.querySelector(".sw").style.background = hex; cb.querySelector(".sw").classList.remove("none"); cb.children[1].textContent = hex; }
    setK(pk, hex);
    if (final) { addRecent(hex); commit(); renderCtx(); }
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
  function range(k, v, min, max, step, lbl, fmt) {
    return F(lbl, '<div class="rangeval"><input type="range" min="' + min + '" max="' + max + '" step="' + step + '" data-k="' + k + '" data-num="1" data-fmt="' + (fmt || "") + '" value="' + v + '"><b>' + fmtV(v, fmt) + "</b></div>");
  }
  function fmtV(v, fmt) { v = +v; return fmt === "%" ? Math.round(v * 100) + "%" : fmt === "°" ? Math.round(v) + "°" : fmt === "x" ? v.toFixed(2) + "×" : fmt === "mm" ? v.toFixed(1) + " mm" : String(v); }

  /* conteúdo de cada painel */
  function sheetModelos() {
    var half = P.fmt === 2, tw = twoS(), s = '<p class="lbl">Modelos prontos · valem para todas as páginas</p><div class="tpl-grid' + (tw ? "" : " one") + '">';
    TPL.forEach(function (t, i) { s += '<button type="button" class="tpl' + (half ? " half" : "") + '" data-tpl="' + i + '"><div class="pair"><canvas data-tc="' + i + 'f"></canvas>' + (tw ? '<canvas data-tc="' + i + 'v"></canvas>' : "") + "</div>" + esc(t.name) + "</button>"; });
    s += "</div>";
    s += '<p class="lbl">Arrumações rápidas' + (tw ? " · só na folha aberta (" + (ST.side === "frente" ? "Frente" : "Verso") + ")" : "") + "</p>" + '<div class="opts"><button type="button" class="btn" data-preset="classico">Clássico</button><button type="button" class="btn" data-preset="lateral">Data grande lateral</button><button type="button" class="btn" data-preset="tarefas">Tarefas em cima</button></div>';
    s += '<p class="lbl">Folha</p><div class="opts"><button type="button" class="btn" data-act="reset">Voltar ao padrão</button>' + (tw ? '<button type="button" class="btn" data-act="copySide">Copiar da outra folha</button>' : "") + '<button type="button" class="btn danger" data-act="blank">Começar do zero</button></div>';
    s += '<p class="lbl">Arquivo</p><div class="opts"><button type="button" class="btn" data-act="saveJson">Salvar modelo</button><button type="button" class="btn" data-act="openJson">Abrir modelo</button></div>';
    s += '<p class="hint">Seu trabalho fica salvo sozinho neste celular. “Salvar modelo” baixa um arquivo para guardar ou passar para outro aparelho.</p>';
    s += '<details class="adv"' + (tw ? " open" : "") + '><summary>Avançado</summary><label class="switch"><input type="checkbox" data-act="twoSides"' + (tw ? " checked" : "") + '><span>Frente e verso diferentes (avançado)</span></label>' +
      '<p class="hint">' + (tw ? "Ligado: páginas ímpares usam a Frente e as pares usam o Verso. Escolha a folha nas abas Frente / Verso em cima." : "Desligado: a mesma folha vale para todas as páginas.") + "</p></details>";
    return s;
  }
  function sheetLib() {
    var s = ST.sheet === "trocar" ? '<p class="hint">Escolha o elemento novo. Ele fica no mesmo lugar.</p>' : "";
    return s + '<div class="lib-top"><input type="search" id="libSearch" placeholder="Buscar: flor, café, natal, washi…" value="' + esc(ST.libQ || "") + '" enterkeyhint="search" autocomplete="off">' +
      '<button type="button" class="lib-info" data-act="libInfo" aria-label="Créditos das ilustrações" title="Créditos">i</button></div>' +
      '<div class="lib-credits" id="libCredits"' + (ST.libInfo ? "" : " hidden") + '><b>Créditos</b><br>Ilustrações coloridas: <b>Microsoft Fluent Emoji</b> © Microsoft, licença MIT (github.com/microsoft/fluentui-emoji), entregues pela jsDelivr. ' +
      'Na primeira vez elas vêm da internet; depois ficam guardadas no celular e funcionam sem internet.<br>Básicos e Decorados: desenhos próprios da Agenda Estrela.</div><div id="libBody"></div>';
  }
  function sheetTexto() {
    var s = "";
    Object.keys(TEXT_PRESETS).forEach(function (k) {
      var p = TEXT_PRESETS[k], fz = Math.min(26, Math.max(13, p.size * 1.15));
      fontCss(p.font);
      s += '<button type="button" class="txtadd" data-addtext="' + k + '" style="font-family:\'' + p.font + '\',sans-serif;font-size:' + fz + "px;font-weight:" + (p.bold ? 700 : 400) + ";color:" + p.color + ";letter-spacing:" + (p.ls ? p.ls + "em" : "0") + '">' + esc(p.label) + "</button>";
    });
    return s + '<p class="hint">Toque para colocar no meio da folha. Depois toque 2 vezes no texto para escrever.</p>';
  }
  function sheetMidia() {
    var s = '<button type="button" class="bigup" data-act="pickImg">' + ic("midia") + "Carregar do celular</button>";
    var ids = Object.keys(P.images);
    if (ids.length) {
      s += '<p class="lbl">Imagens desta agenda · toque para usar de novo</p><div class="media-grid">';
      ids.forEach(function (id) { s += '<button type="button" data-media="' + id + '" style="background-image:url(\'' + P.images[id] + '\')" aria-label="Imagem"></button>'; });
      s += "</div>";
    } else s += '<p class="hint">Fotos, logos e adesivos do seu celular. Pode escolher várias de uma vez.</p>';
    return s;
  }
  function sheetFundo() {
    var m = M(), s = F("Cor de fundo da folha", pal("bg.color", m.bg.color));
    s += F("Imagem de fundo", '<div class="opts"><button type="button" class="btn" data-act="pickBg">' + (m.bg.img ? "Trocar imagem de fundo" : "Carregar imagem de fundo") + "</button>" + (m.bg.img ? '<button type="button" class="btn danger" data-act="bgDel">Tirar fundo</button>' : "") + "</div>");
    if (m.bg.img) s += range("bg.op", m.bg.op, 0.05, 1, 0.05, "Transparência do fundo", "%");
    return s;
  }
  function sheetAgenda() {
    var T2 = [["date", "Data", "o dia de cada página", "agenda"], ["hours", "Horários", "lista de horas", "clock"], ["tasks", "Tarefas", "quadradinhos", "multi"], ["notes", "Anotações", "linhas ou pontinhos", "edit"], ["holiday", "Feriado", "nome do feriado", "agenda"], ["footer", "Rodapé", "texto do pé da folha", "texto"]];
    IC.clock = '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>';
    return '<div class="tiles">' + T2.map(function (x) { return '<button type="button" class="tile" data-add="' + x[0] + '">' + ic(x[3]) + x[1] + "<small>" + x[2] + "</small></button>"; }).join("") + '</div><p class="hint">A data, os feriados e os horários mudam sozinhos em cada página do PDF.</p>';
  }
  function sheetCamadas() {
    var els = M().els, e = selEl(), s = "";
    if (e) s += '<div class="opts" style="margin-bottom:10px"><button type="button" class="btn" data-act="front">⇈ Para frente</button><button type="button" class="btn" data-act="fwd">↑ Um</button><button type="button" class="btn" data-act="bwd">↓ Um</button><button type="button" class="btn" data-act="back">⇊ Para trás</button></div>';
    s += '<p class="lbl">Itens da folha (o de cima fica na frente)</p><div class="layers">';
    var set = {}; ST.sels.forEach(function (id) { set[id] = 1; });
    for (var i = els.length - 1; i >= 0; i--) {
      var x = els[i];
      s += '<div class="layer-row"><button type="button" class="lname' + (set[x.id] ? " on" : "") + '" data-pick="' + x.id + '">' + (x.grp ? "⧉ " : "") + esc(elLabel(x)) + '</button><button type="button" class="lb" data-lockid="' + x.id + '" aria-label="Bloquear">' + (x.lock ? "🔒" : "🔓") + '</button><button type="button" class="lb" data-lup="' + x.id + '" aria-label="Para frente">↑</button><button type="button" class="lb" data-ldown="' + x.id + '" aria-label="Para trás">↓</button></div>';
    }
    if (!els.length) s += '<p class="hint">A folha está vazia. Use Modelos, Elementos ou Agenda para começar.</p>';
    return s + "</div>";
  }
  function sheetAjustes(e) {
    var t = e.type, s = "";
    if (t === "text" || t === "footer") s += F("Texto", '<textarea data-k="text" rows="' + (t === "footer" ? 1 : 3) + '">' + esc(e.text) + "</textarea>") + '<p class="hint">Dica: toque 2 vezes no texto da folha para escrever direto nele.</p>';
    if (t === "date") {
      s += F("Estilo da data", opts("style", e.style, [["extenso", "Quinta-feira, 7 de janeiro"], ["numerico", "07/01/2027 · quinta"], ["grande", "07 QUI JAN"], ["custom", "Do meu jeito"]]));
      if (e.style === "custom") s += F("Meu jeito", '<input type="text" data-k="template" value="' + esc(e.template) + '"><p class="hint">Use: {dia} {dd} {semana} {sem} {mes} {mes3} {mm} {ano}</p>');
      if (e.style === "extenso") s += '<label class="switch"><input type="checkbox" data-k="showYear"' + (e.showYear ? " checked" : "") + "><span>Mostrar o ano</span></label>";
      if (e.style !== "grande") s += '<label class="switch"><input type="checkbox" data-k="upper"' + (e.upper ? " checked" : "") + "><span>TUDO MAIÚSCULO</span></label>";
      else s += '<p class="hint">No estilo grande o tamanho segue a caixa: arraste a bolinha do canto.</p>';
    }
    if (t === "holiday") s += '<p class="hint">Mostra o nome do feriado só nos dias de feriado (ex.: Natal). Liga e desliga no passo 2.</p><label class="switch"><input type="checkbox" data-k="upper"' + (e.upper ? " checked" : "") + "><span>TUDO MAIÚSCULO</span></label>";
    if (t === "hours" || t === "tasks" || t === "notes") s += F("Título (deixe vazio para não ter)", '<input type="text" data-k="title" value="' + esc(e.title) + '">');
    if (t === "hours") s += F("Jeito do horário", opts("hfmt", e.hfmt, [["h", "07h · 07h30"], [":", "07:00 · 07:30"]])) + '<p class="hint">Quais horários aparecem você escolhe no passo 2. Se forem muitos, vira 2 ou 3 colunas.</p>';
    if (t === "tasks") s += stepper("count", e.count, 1, "Quantas tarefas");
    if (t === "notes") { s += F("Tipo", opts("kind", e.kind, [["linhas", "Linhas"], ["pontilhado", "Pontilhado"], ["branco", "Em branco"]])); if (e.kind !== "branco") s += stepper("spacing", e.spacing, 0.5, "Espaço entre linhas (mm)"); }
    if (t === "hours" || t === "tasks" || t === "notes") s += range("tgap", e.tgap == null ? 1.2 : e.tgap, 0.5, 4, 0.1, "Espaço entre letras e linhas", "mm");
    if (t === "hours" || t === "tasks" || t === "notes") s += F("Tipo de linha", opts("lineStyle", e.lineStyle, [["solid", "Contínua"], ["tracejada", "Tracejada"], ["pontilhada", "Pontilhada"]])) + stepper("lineW", e.lineW, 0.05, "Espessura da linha (mm)");
    return s;
  }
  function sheetFonte(e) {
    var s = '<div class="fontlist" id="fontList">';
    FONT_GROUPS.forEach(function (g) {
      s += "<h4>" + g[0] + "</h4>";
      g[1].forEach(function (f) { s += '<button type="button" class="' + (f === e.font ? "on" : "") + '" data-k="font" data-v="' + f + '" data-lazyfont="' + f + '">' + f + "</button>"; });
    });
    return s + "</div>";
  }
  function sheetCor(e) {
    var t = e.type, s = "";
    if (t === "svg") {
      var ks = colorKeys(e), lb = EL.labels(e.lib);
      if (ks.length > 1) {
        if (ks.indexOf(ST.colorOpen) < 0) ST.colorOpen = ks[0];
        s += '<p class="hint">Toque numa parte e escolha a cor dela.</p><div class="parts">' + ks.map(function (k, i) {
          return '<button type="button" class="part' + (ST.colorOpen === k ? " on" : "") + '" data-act="partPick" data-ck="' + k + '"><span class="sw" style="background:' + swBg(up(e[k])) + '"></span><span>' + esc(lb[i]) + "</span></button>";
        }).join("") + "</div>";
        s += pal(ST.colorOpen, e[ST.colorOpen]);
      } else s += F(lb[0] || "Cor", pal("c1", e.c1));
    }
    else s += F(t === "hours" || t === "tasks" || t === "notes" ? "Cor do texto" : "Cor da letra", pal("color", e.color));
    if (t === "hours" || t === "tasks" || t === "notes") { s += F("Cor do título e quadradinhos", pal("tColor", e.tColor)); s += F("Cor das linhas", pal("lineColor", e.lineColor)); }
    return s;
  }
  function sheetBorda(e) {
    if (e.type === "img") return stepper("bw", e.bw || 0, 0.25, "Espessura da borda (mm) · 0 = sem borda") + F("Cor da borda", pal("bc", e.bc));
    var s = F("Fundo da caixa", pal("boxBg", e.boxBg, true));
    s += F("Borda", opts("boxBorder", e.boxBorder, [["none", "Nenhuma"], ["fina", "Fina"], ["arredondada", "Arredondada"]]));
    if (e.boxBorder !== "none") s += F("Cor da borda", pal("boxColor", e.boxColor));
    return s;
  }
  function sheetPos(e, multi) {
    var m = M(), s = '<div class="nudge"><span></span><button type="button" data-nudge="0,-1" aria-label="Subir">↑</button><span></span><button type="button" data-nudge="-1,0" aria-label="Esquerda">←</button><span class="c">' + ST.nudge + ' mm</span><button type="button" data-nudge="1,0" aria-label="Direita">→</button><span></span><button type="button" data-nudge="0,1" aria-label="Descer">↓</button><span></span></div>';
    s += F("Cada toque anda", opts("nudgeStep", ST.nudge, [["0.5", "0,5 mm"], ["1", "1 mm"], ["5", "5 mm"]]));
    if (!multi) {
      s += '<div class="grid2">' +
        '<label>Esquerda (mm)<input type="number" inputmode="decimal" step="0.5" data-k="x" data-num="1" value="' + e.x + '"></label>' +
        '<label>Topo (mm)<input type="number" inputmode="decimal" step="0.5" data-k="y" data-num="1" value="' + e.y + '"></label>' +
        '<label>Largura (mm)<input type="number" inputmode="decimal" step="0.5" data-k="w" data-num="1" value="' + e.w + '"></label>' +
        '<label>Altura (mm)<input type="number" inputmode="decimal" step="0.5" data-k="h" data-num="1" value="' + e.h + '"></label></div>';
      s += '<div class="opts" style="margin-top:8px"><button type="button" class="btn" data-act="fullW">Largura toda (dentro da margem)</button></div>';
    }
    s += F("Alinhar", alignBtns());
    return s + '<p class="hint">Folha: ' + m.w + " × " + m.h + " mm · margem " + MARGIN + " mm.</p>";
  }
  function alignBtns() {
    return '<div class="aligns">' + [["left", "Esquerda"], ["center", "Centro"], ["right", "Direita"], ["top", "Topo"], ["middle", "Meio"], ["bottom", "Base"]].map(function (a) { return '<button type="button" data-act="al-' + a[0] + '">' + ic("al-" + a[0]) + a[1] + "</button>"; }).join("") + "</div>";
  }
  function sheetAlinhar(multi) {
    var s = '<p class="hint">' + (multi ? "Alinha os itens escolhidos entre si." : "Alinha o item na folha.") + "</p>" + alignBtns();
    if (!multi) s += '<label class="switch"><input type="checkbox" data-act="alignMargin"' + (ST.alignMargin ? " checked" : "") + "><span>Respeitar a margem de " + MARGIN + " mm</span></label>";
    return s;
  }
  function renderSheet() {
    if (!ST.sheet) return;
    var e = selEl(), multi = isMulti(), n = ST.sheet;
    if (!sheetOk(n, e, multi)) { closeSheet(); return; }
    $("sheetTitle").textContent = TITLES[n] + (ELSHEETS[n] && e && !multi ? " · " + elLabel(e) : multi && ELSHEETS[n] ? " · " + selAll().length + " itens" : "");
    var st = body.scrollTop, h;
    if (n === "modelos") h = sheetModelos();
    else if (n === "elementos" || n === "trocar") h = sheetLib();
    else if (n === "texto") h = sheetTexto();
    else if (n === "midia") h = sheetMidia();
    else if (n === "fundo") h = sheetFundo();
    else if (n === "agenda") h = sheetAgenda();
    else if (n === "camadas") h = sheetCamadas();
    else if (n === "ajustes") h = sheetAjustes(e);
    else if (n === "fonte") h = sheetFonte(e);
    else if (n === "tamanho") h = stepper("size", e.size, 1, "Tamanho da letra (pt)") + range("size", e.size, 4, 96, 0.5, "Arraste para mudar");
    else if (n === "cor") h = sheetCor(e);
    else if (n === "espaco") h = range("ls", e.ls || 0, -0.1, 0.8, 0.02, "Espaço entre as letras", "x") + (e.type === "text" ? range("lh", e.lh || 1.25, 0.8, 2.5, 0.05, "Espaço entre as linhas", "x") : "") + (e.type === "hours" || e.type === "tasks" || e.type === "notes" ? range("tgap", e.tgap == null ? 1.2 : e.tgap, 0.5, 4, 0.1, "Espaço entre letras e linhas", "mm") : "");
    else if (n === "borda") h = sheetBorda(e);
    else if (n === "opac") h = range("op", e.op == null ? 1 : e.op, 0.05, 1, 0.05, "Opacidade (transparência)", "%");
    else if (n === "girar") h = range("rot", e.rot || 0, -180, 180, 1, "Ângulo", "°") + '<div class="opts"><button type="button" class="btn" data-act="rot-90">↺ 90°</button><button type="button" class="btn" data-act="rot0">Reto (0°)</button><button type="button" class="btn" data-act="rot90">↻ 90°</button></div><p class="hint">Na folha, arraste a bolinha ⟳ embaixo do item.</p>';
    else if (n === "virar") h = '<div class="bigbtns"><button type="button" class="btn' + (e.flipH ? " on" : "") + '" data-act="flipH"><span style="font-size:22px">⇆</span>Virar na horizontal</button><button type="button" class="btn' + (e.flipV ? " on" : "") + '" data-act="flipV"><span style="font-size:22px">⇅</span>Virar na vertical</button></div>';
    else if (n === "recortar") { var c = e.crop || { l: 0, t: 0, r: 0, b: 0 }; h = '<p class="hint">Arraste para cortar as bordas da imagem.</p>' + ["l", "r", "t", "b"].map(function (k) { return F({ l: "Cortar da esquerda", r: "Cortar da direita", t: "Cortar de cima", b: "Cortar de baixo" }[k], '<div class="rangeval"><input type="range" min="0" max="0.45" step="0.01" data-crop="' + k + '" value="' + c[k] + '"><b>' + Math.round(c[k] * 100) + "%</b></div>"); }).join("") + '<button type="button" class="btn wide" data-act="cropReset">Sem recorte (imagem inteira)</button>'; }
    else if (n === "pos") h = sheetPos(e, multi);
    else if (n === "alinhar") h = sheetAlinhar(multi);
    body.innerHTML = h || "";
    body.scrollTop = st;
    if (n === "elementos" || n === "trocar") renderLib();
    if (n === "fonte") lazyFonts();
    if (n === "modelos") { drawThumbs(); var ms = tplModels(P.fmt), all = []; ms.forEach(function (x) { all.push(x.f, x.v); }); ensureAssets(all).then(function () { if (ST.sheet === "modelos") drawThumbs(); }); }
    document.querySelectorAll("#mainbar button").forEach(function (b) { b.classList.toggle("on", b.dataset.main === n); });
  }
  var fio;
  function lazyFonts() {
    var list = $("fontList"); if (!list) return;
    if (fio) fio.disconnect();
    fio = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { var f = en.target.dataset.lazyfont; fontCss(f); en.target.style.fontFamily = "'" + f + "', sans-serif"; fio.unobserve(en.target); } });
    }, { root: body, rootMargin: "120px" });
    list.querySelectorAll("[data-lazyfont]").forEach(function (b) { fio.observe(b); });
    var on = list.querySelector(".on"); if (on) body.scrollTop = on.offsetTop - 60;
  }

  /* ----- barra de contexto ----- */
  var ctxKey = "";
  function renderCtx() {
    var list = ST.step === 1 ? selAll() : [];
    if (!list.length || ST.editId) { ctxbar.hidden = true; ctxKey = ""; return; }
    var e = selEl() || list[0], t = e.type, multi = list.length > 1, locked = list.some(function (x) { return x.lock; }), grouped = list.some(function (x) { return x.grp; });
    var it = [];
    function B(a, l, i, cls) { it.push('<button type="button" data-a="' + a + '"' + (cls ? ' class="' + cls + '"' : "") + ">" + (i.charAt(0) === "<" ? i : ic(i)) + "<span>" + l + "</span></button>"); }
    function sep() { it.push('<i class="sep"></i>'); }
    if (locked) { B("lock", "Desbloquear", "unlock", "on"); B("dup", "Duplicar", "dup"); B("sheet:camadas", "Camadas", "camadas"); B("menu", "Mais", "more"); }
    else if (multi) {
      B("sheet:alinhar", "Alinhar", "alinhar"); B(grouped ? "ungroup" : "group", grouped ? "Desagrupar" : "Agrupar", "group");
      B("sheet:pos", "Posição", "move"); B("sheet:opac", "Opacidade", "opac"); B("front", "Para frente", "front"); B("back", "Para trás", "back"); sep();
      B("multi", "Selecionar vários", "multi", ST.multiMode ? "on" : ""); B("dup", "Duplicar", "dup"); B("lock", "Bloquear", "lock"); B("del", "Apagar", "trash", "danger");
    } else {
      var tx = !!TEXTISH[t];
      if (t === "text" || t === "footer") B("edit", "Editar", "edit");
      if (t !== "text" && t !== "footer" && tx) B("sheet:ajustes", "Ajustes", "sliders");
      if (t === "svg") B("sheet:trocar", "Trocar", "swap");
      if (t === "img") B("sheet:recortar", "Recortar", "crop");
      if (tx) { B("sheet:fonte", "Fonte", "font"); B("sheet:tamanho", "Tamanho", '<span class="ab">' + (Math.round(e.size * 10) / 10) + "</span>"); }
      if (t === "svg") { var cks = colorKeys(e); if (cks.length) B("sheet:cor", "Cor", cks.length > 1 ? '<span class="cdots">' + cks.map(function (k) { return '<i style="background:' + swBg(up(e[k])) + '"></i>'; }).join("") + "</span>" : '<span class="cdot" style="background:' + swBg(up(e.c1)) + '"></span>'); }
      else if (t !== "img") B("sheet:cor", "Cor", '<span class="cdot" style="background:' + swBg(up(e.color)) + '"></span>');
      if (tx) { B("bold", "Negrito", "bold", e.bold ? "on" : ""); B("italic", "Itálico", "italic", e.italic ? "on" : ""); B("alignTxt", "Alinhamento", "align-" + (e.align || "left")); B("sheet:espaco", "Espaçamento", "spacing"); }
      if (t !== "svg") B("sheet:borda", t === "img" ? "Borda" : "Caixa/Borda", "borda");
      if (t === "text" || t === "footer") B("sheet:ajustes", "Ajustes", "sliders");
      B("sheet:opac", "Opacidade", "opac"); B("sheet:girar", "Girar", "rotate");
      if (t === "svg" || t === "img") B("sheet:virar", "Virar", "flip");
      B("sheet:pos", "Posição", "move"); B("sheet:alinhar", "Alinhar", "alinhar"); B("sheet:camadas", "Camadas", "camadas"); sep();
      B("copyStyle", "Copiar estilo", "roller"); if (ST.styleClip) B("pasteStyle", "Colar estilo", "paste");
      if (t === "img") B("toBg", "Usar de fundo", "fundo");
      B("multi", "Selecionar vários", "multi", ST.multiMode ? "on" : ""); B("dup", "Duplicar", "dup"); B("lock", "Bloquear", "lock"); B("del", "Apagar", "trash", "danger");
    }
    var html = it.join(""), key = (multi ? "m" : e.id) + (locked ? "L" : "");
    var sl = key === ctxKey ? ctxbar.scrollLeft : 0;
    if (ctxbar.innerHTML !== html) ctxbar.innerHTML = html;
    var was = ctxbar.hidden; ctxbar.hidden = false; ctxbar.scrollLeft = sl; ctxKey = key;
    if (was && !ST.sheet) { /* espaço reservado já conta com a barra */ }
  }
  function renderUI() {
    if (ST.sheet) renderSheet();
    else document.querySelectorAll("#mainbar button").forEach(function (b) { b.classList.remove("on"); });
    renderCtx();
    $("multiBar").hidden = !ST.multiMode || ST.step !== 1;
    if (ST.multiMode) $("multiTxt").textContent = ST.sels.length ? ST.sels.length + " selecionado" + (ST.sels.length > 1 ? "s" : "") + " · toque para juntar ou tirar" : "Toque nos itens para selecionar";
    draw(); updSel();
  }
  var renderPanel = renderUI;

  function setK(k, v) {
    if (k.indexOf("bg.") === 0) { M().bg[k.slice(3)] = v; draw(); return; }
    var list = selAll(); if (!list.length) return;
    list.forEach(function (e) { e[k] = v; });
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
    if (t.id === "libSearch") { ST.libQ = t.value; clearTimeout(libQT); libQT = setTimeout(function () { renderLib(); body.scrollTop = 0; }, 160); return; }
    if (t.classList.contains("hue")) { PK.h = +t.value; var bx = t.parentNode; bx.querySelector(".sv").style.backgroundColor = "hsl(" + PK.h + ",100%,50%)"; pickerApply(bx.dataset.pk, hsv2hex(PK.h, PK.s, PK.v)); return; }
    if (t.classList.contains("hex")) { var v0 = t.value.trim(); if (v0[0] !== "#") v0 = "#" + v0; if (/^#[0-9a-f]{6}$/i.test(v0)) { PK = hex2hsv(v0); pickerApply(t.closest(".picker").dataset.pk, up(v0)); } return; }
    if (t.dataset.crop) { var e0 = selEl(); if (!e0) return; var c = Object.assign({ l: 0, t: 0, r: 0, b: 0 }, e0.crop || {}); c[t.dataset.crop] = +t.value; setCrop(e0, c); t.nextElementSibling.textContent = Math.round(+t.value * 100) + "%"; draw(); later(); return; }
    var k = t.dataset.k; if (!k) return;
    var v = t.type === "checkbox" ? t.checked : parseV(t, t.value);
    if (v === null) return;
    if (k === "boxBg" && v === "") v = null;
    if (k === "size") v = Math.max(4, Math.min(200, v));
    setK(k, v);
    if (t.type === "range" && t.nextElementSibling) t.nextElementSibling.textContent = fmtV(v, t.dataset.fmt);
    if (k === "size") { var other = body.querySelectorAll('[data-k="size"]'); other.forEach(function (o) { if (o !== t) o.value = v; }); }
    if (t.type === "checkbox") renderUI();
    later();
  });
  body.addEventListener("change", function (ev) {
    var t = ev.target;
    if (t.dataset.act === "alignMargin") { ST.alignMargin = t.checked; return; }
    if (t.dataset.act === "twoSides") {
      var mm = P.models[P.fmt];
      P.settings.twoSides = t.checked; ST.side = "frente"; clearSel(); ST.multiMode = false;
      if (t.checked) { mm.verso = clone(mm.frente); mm.verso.els.forEach(function (z) { z.id = uid(); }); }
      syncTop(); commit(); save(); layout(); renderUI();
      toast(t.checked ? "Frente e verso diferentes ligado · o Verso começou igual à Frente" : "Uma folha só para todas as páginas", 3500); return;
    }
    if (t.classList.contains("hue")) { addRecent(hsv2hex(PK.h, PK.s, PK.v)); }
    if (t.classList.contains("hex")) { var v1 = up(t.value.trim()); if (v1[0] !== "#") v1 = "#" + v1; if (/^#[0-9A-F]{6}$/.test(v1)) addRecent(v1); }
    if (t.id === "libSearch") return;
    commit(); renderCtx(); updSel();
  });
  body.addEventListener("click", function (ev) {
    var b = ev.target.closest("button"); if (!b) return;
    var e = selEl(), m = M();
    if (b.dataset.tpl) { applyTpl(+b.dataset.tpl); return; }
    if (b.dataset.libcat) { ST.libView = b.dataset.libcat; $("libSearch").value = ""; renderLib(); body.scrollTop = 0; return; }
    if (b.dataset.libback) { ST.libView = null; renderLib(); body.scrollTop = 0; return; }
    if (b.dataset.lib) { if (ST.sheet === "trocar") replaceSvg(b.dataset.lib); else addSvg(b.dataset.lib); return; }
    if (b.dataset.addtext) { addText(b.dataset.addtext); return; }
    if (b.dataset.add) { addAgenda(b.dataset.add); return; }
    if (b.dataset.media) { var c = upImg(b.dataset.media), im = c && c.img; place(imgEl(b.dataset.media, (im && im.naturalWidth) || 1, (im && im.naturalHeight) || 1)); return; }
    if (b.dataset.preset) {
      m.els = preset(b.dataset.preset, m.w, m.h); clearSel(); ensureFonts([m]).then(draw); commit(); closeSheet(); draw(); renderUI();
      toast("Arrumação “" + b.textContent + "” aplicada · ↶ desfaz"); return;
    }
    if (b.dataset.pick) { var pe = byId(b.dataset.pick); if (pe) { ST.multiMode = false; selectEl(pe); renderUI(); showSel(); } return; }
    if (b.dataset.lockid) { var le = byId(b.dataset.lockid); if (le) { le.lock = !le.lock; commit(); renderUI(); } return; }
    if (b.dataset.lup || b.dataset.ldown) {
      var id = b.dataset.lup || b.dataset.ldown, x = byId(id), i = m.els.indexOf(x);
      if (b.dataset.lup && i < m.els.length - 1) { m.els.splice(i, 1); m.els.splice(i + 1, 0, x); }
      if (b.dataset.ldown && i > 0) { m.els.splice(i, 1); m.els.splice(i - 1, 0, x); }
      commit(); draw(); renderUI(); return;
    }
    if (b.dataset.nudge) { var d = b.dataset.nudge.split(","); nudge(+d[0], +d[1]); return; }
    if (b.dataset.step) {
      if (!e) return;
      var k = b.dataset.step, cur = e[k] || 0, dd = parseFloat(b.dataset.d), nv = Math.round((cur + dd) * 100) / 100;
      if (k === "count") nv = Math.max(1, Math.min(40, nv)); if (k === "size") nv = Math.max(4, Math.min(200, nv));
      if (k === "spacing") nv = Math.max(2, nv); if (k === "lineW") nv = Math.max(0.05, nv); if (k === "bw") nv = Math.max(0, Math.min(10, nv));
      setK(k, nv); body.querySelectorAll('[data-k="' + k + '"]').forEach(function (inp) { inp.value = nv; if (inp.nextElementSibling && inp.type === "range") inp.nextElementSibling.textContent = fmtV(nv); }); later(); renderCtx(); return;
    }
    if (b.dataset.k) {
      var v = b.dataset.v; v = v === "true" ? true : v === "false" ? false : v;
      if (b.dataset.k === "nudgeStep") { ST.nudge = +v; renderUI(); return; }
      if (b.dataset.k === "boxBg" && v === "") v = null;
      if (b.dataset.k === "rot") v = +v;
      if (b.dataset.k === "bg.color" && v === "") v = "#FFFFFF";
      setK(b.dataset.k, v);
      if (b.classList.contains("sw") && v) addRecent(v);
      if (b.dataset.k === "font") { loadFont(v, e && e.bold, e && e.italic).then(draw); }
      commit(); renderUI(); return;
    }
    var a = b.dataset.act;
    if (!a) return;
    if (a === "partPick") { ST.colorOpen = b.dataset.ck; renderUI(); return; }
    if (a === "libInfo") { ST.libInfo = !ST.libInfo; var cr = $("libCredits"); if (cr) cr.hidden = !ST.libInfo; return; }
    if (a === "colorToggle") { ST.colorOpen = ST.colorOpen === b.dataset.ck ? null : b.dataset.ck; renderUI(); if (ST.colorOpen) { var cbn = body.querySelector('.colorbtn[data-ck="' + ST.colorOpen + '"]'); if (cbn) body.scrollTop = cbn.offsetTop - 8; } return; }
    if (a === "hexOk") { var pkb = b.closest(".picker"), hv = up(pkb.querySelector(".hex").value.trim()); if (hv[0] !== "#") hv = "#" + hv; if (/^#[0-9A-F]{6}$/.test(hv)) { PK = hex2hsv(hv); pickerApply(pkb.dataset.pk, hv, true); renderUI(); } else toast("Código de cor inválido. Ex.: #E88AA6"); return; }
    if (a === "pickImg") { $("fileImg").click(); return; }
    if (a === "pickBg") { $("fileBg").click(); return; }
    if (a === "bgDel") { m.bg.img = null; commit(); draw(); renderUI(); return; }
    if (a === "reset") { m.els = preset("classico", m.w, m.h); m.bg = { color: "#FFFFFF", img: null, op: 1 }; clearSel(); commit(); closeSheet(); draw(); renderUI(); toast("Voltou ao padrão · ↶ desfaz"); return; }
    if (a === "copySide") {
      var other = P.models[P.fmt][ST.side === "frente" ? "verso" : "frente"];
      m.els = clone(other.els).map(function (z) { z.id = uid(); return z; }); m.bg = clone(other.bg); clearSel(); commit(); closeSheet(); draw(); renderUI();
      toast("Copiado da " + (ST.side === "frente" ? "folha do Verso" : "Frente")); return;
    }
    if (a === "blank") {
      ask("Apagar tudo da folha?", "A folha fica em branco. Dá para voltar com ↶ Desfazer.", "Apagar tudo").then(function (ok) {
        if (!ok) return;
        ["frente", "verso"].forEach(function (s) { var mm = P.models[P.fmt][s]; mm.els = []; mm.bg = { color: "#FFFFFF", img: null, op: 1 }; });
        clearSel(); commit(); closeSheet(); draw(); renderUI(); toast("Folha em branco · ↶ desfaz");
      }); return;
    }
    if (a === "saveJson") { pruneImages(); downloadBlob(new Blob([JSON.stringify(P)], { type: "application/json" }), "modelo-agenda-estrela.json"); toast("Modelo salvo nos downloads"); return; }
    if (a === "openJson") { $("fileJson").click(); return; }
    doAct(a);
  });
  bindPicker();

  /* ----- confirmação ----- */
  function ask(msg, sub, yes) {
    return new Promise(function (res) {
      $("modalMsg").textContent = msg; $("modalSub").textContent = sub || ""; $("modalYes").textContent = yes || "Continuar";
      $("modal").hidden = false;
      $("modalYes").onclick = function () { $("modal").hidden = true; res(true); };
      $("modalNo").onclick = function () { $("modal").hidden = true; res(false); };
    });
  }

  /* ----- dicas da primeira vez ----- */
  var TIPS = [
    ["Toque num item da folha para editar. Toque 2 vezes num texto para escrever nele.", "stage"],
    ["Aqui embaixo você coloca Modelos prontos, Elementos, Texto, Fundo e os itens da Agenda.", "mainbar"],
    ["Segure o dedo num item para ver mais opções e juntar vários. ↶ desfaz qualquer coisa.", "top"]
  ], tipI = 0;
  function showTip(i) {
    var tip = $("tip");
    if (i >= TIPS.length || ST.step !== 1) { endTips(); return; }
    tipI = i; $("tipTxt").textContent = TIPS[i][0]; $("tipNext").textContent = i === TIPS.length - 1 ? "Entendi" : "Próxima (" + (i + 1) + "/" + TIPS.length + ")";
    tip.hidden = false; tip.className = "tip"; tip.style.top = tip.style.bottom = "";
    var where = TIPS[i][1], arrow = $("tipArrow");
    if (where === "stage") { var r = wrapEl.getBoundingClientRect(); tip.style.top = (r.top + r.height * 0.35) + "px"; arrow.style.display = "none"; }
    else if (where === "mainbar") { var rb = $("mainbar").getBoundingClientRect(); tip.classList.add("down"); tip.style.bottom = (innerHeight - rb.top + 12) + "px"; arrow.style.display = ""; }
    else { var rt = $("btnUndo").getBoundingClientRect(); tip.classList.add("up"); tip.style.top = (rt.bottom + 12) + "px"; arrow.style.display = ""; arrow.style.left = Math.min(innerWidth - 40, rt.left + rt.width / 2 - tip.getBoundingClientRect().left) + "px"; }
    if (where !== "top") arrow.style.left = "";
  }
  function endTips() { $("tip").hidden = true; try { localStorage.setItem("agenda-tips-v1", "1"); } catch (x) {} }
  $("tipNext").onclick = function () { showTip(tipI + 1); };
  $("tipSkip").onclick = endTips;
  function maybeTips() { var seen = false; try { seen = !!localStorage.getItem("agenda-tips-v1"); } catch (x) {} if (!seen) setTimeout(function () { if (ST.step === 1) showTip(0); }, 700); }

  /* ---------------- Barra de cima (formato, frente/verso) ---------------- */
  function syncTop() {
    $("fmtSel").value = String(P.fmt);
    if (!twoS()) ST.side = "frente";
    $("sideSeg").hidden = !twoS();
    document.querySelectorAll("#sideSeg button").forEach(function (b) { b.classList.toggle("on", b.dataset.side === ST.side); });
  }
  $("fmtSel").addEventListener("change", function () { P.fmt = +this.value; clearSel(); closeSheet(); ST.zoom = 1; syncTop(); layout(); renderUI(); commit(); save(); });
  $("sideSeg").addEventListener("click", function (ev) { var b = ev.target.closest("button"); if (!b) return; if (ST.editId) endEdit(true); ST.side = b.dataset.side; clearSel(); ST.multiMode = false; syncTop(); layout(); renderUI(); });
  $("fileJson").addEventListener("change", function () {
    var f = this.files && this.files[0]; this.value = ""; if (!f) return;
    var fr = new FileReader();
    fr.onload = function () {
      try { var o = JSON.parse(fr.result); if (!o.models || !o.models["1"]) throw 0; loadProject(o); commit(); closeSheet(); toast("Modelo aberto"); }
      catch (x) { alert("Esse arquivo não é um modelo da Agenda Estrela."); }
    };
    fr.readAsText(f);
  });
  $("btnUndo").onclick = undo; $("btnRedo").onclick = redo;
  document.addEventListener("keydown", function (ev) {
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "z") { ev.preventDefault(); ev.shiftKey ? redo() : undo(); }
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "d" && selAll().length) { ev.preventDefault(); doAct("dup"); }
    if ((ev.key === "Delete" || ev.key === "Backspace") && selAll().length && ST.step === 1) { ev.preventDefault(); doAct("del"); }
    if (ev.key === "Escape") { if (!cm.hidden) closeMenu(); else if (ST.sheet) closeSheet(); else if (ST.sels.length) { clearSel(); ST.multiMode = false; renderUI(); } }
    var ar = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[ev.key];
    if (ar && selAll().length && ST.step === 1) { ev.preventDefault(); nudge(ar[0], ar[1]); }
  });
  function loadProject(o) {
    var d = newProject();
    P = Object.assign(d, o); P.settings = Object.assign(d.settings, o.settings || {}); P.images = o.images || {};
    ["1", "2"].forEach(function (f) { P.models[f] = P.models[f] || d.models[f]; ["frente", "verso"].forEach(function (s) { var m = P.models[f][s] = P.models[f][s] || d.models[f][s]; m.bg = Object.assign({ color: "#FFFFFF", img: null, op: 1 }, m.bg || {}); m.els = (m.els || []).map(function (e) { return Object.assign({}, DEF.base, DEF[e.type] || {}, e); }); }); });
    /* projeto antigo (v3) sem a opção: se Frente e Verso eram diferentes, liga "Frente e verso diferentes" para não perder o Verso */
    if (!o.settings || o.settings.twoSides == null) {
      var sig = function (m) { return JSON.stringify({ bg: m.bg, els: m.els.map(function (e) { var c = Object.assign({}, e); delete c.id; delete c.grp; return c; }) }); };
      P.settings.twoSides = ["1", "2"].some(function (f) { return sig(P.models[f].frente) !== sig(P.models[f].verso); });
    }
    imgCache = {}; clearSel(); tplCache = {};
    syncTop(); syncS2(); layout(); renderUI(); ensureFonts(usedModels()).then(draw);
  }

  /* ---------------- Passos ---------------- */
  function go(n) {
    commit();
    ST.step = n;
    [1, 2, 3].forEach(function (i) { $("step" + i).hidden = i !== n; });
    document.querySelectorAll("#steps button").forEach(function (b) { b.classList.toggle("on", +b.dataset.step === n); });
    document.body.classList.toggle("s1", n === 1);
    if (n !== 1) { if (ST.editId) endEdit(true); closeSheet(); closeMenu(); clearSel(); ST.multiMode = false; $("tip").hidden = true; renderUI(); }
    window.scrollTo(0, 0);
    if (n === 1) { layout(); renderUI(); }
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
    var models = usedModels();
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
        var sp = document.createElement("span"); sp.textContent = "Página " + (i + 1) + (twoS() ? " · " + (i % 2 ? "Verso" : "Frente") : ""); wrapD.appendChild(sp);
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
    var mods = usedModels();
    return ensureAssets(mods).then(function () {
      var miss = 0; mods.forEach(function (m) { m.els.forEach(function (e) { if (e.type === "svg" && (EL.byId[e.lib] || {}).remote) { var c = svgCache[svgKey(e)]; if (!c || !c.ok) miss++; } }); });
      if (miss) toast("Atenção: " + miss + " ilustração(ões) não carregou(aram) — confira a internet. Elas vão faltar nas folhas.", 6000);
    }).then(step).then(function (ok) { c.width = c.height = 1; return { ok: ok, days: days }; });
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
    go(1); savedUI(0); maybeTips();
    ensureFonts(usedModels()).then(function () { draw(); });
  }
  idbGet("project").then(function (v) { boot(v || localStorage.getItem("agenda-estrela")); }).catch(function () { boot(localStorage.getItem("agenda-estrela")); });
  window.addEventListener("pagehide", function () { pruneImages(); try { idbSet("project", JSON.stringify(P)); } catch (x) {} });

  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(function () {});
  window.__agendaDbg = function (v) { DBG = v; };
  window.__agenda = { renderPage: function (ctx, days, i, pxmm) { renderPage(ctx, days, i, pxmm); }, dayList: function () { return dayList(); }, ensureAssets: function () { return ensureAssets(usedModels()); }, buildTpl: buildTpl, P: function () { return P; }, ST: ST, go: go, M: M, layout: layout, scale: function () { return scale; }, selAll: selAll, TPL: TPL, applyTplNow: function (i) { var t = TPL[i], H = P.fmt === 2 ? 105 : 210; P.models[P.fmt].frente = buildTpl(t, 148, H, "frente"); P.models[P.fmt].verso = buildTpl(t, 148, H, "verso"); clearSel(); commit(); layout(); renderUI(); } };
})();
