/* Elementos decorados da Agenda Estrela: várias cores editáveis ({1}..{4}).
   Desenhos próprios do app. */
(function () {
  var E = window.ELEMENTOS; if (!E) return;
  function add(cat, id, name, vb, svg, cols, labels, o) {
    o = o || {};
    E.add({ id: id, name: name, cats: [cat], group: "Decorados", vb: vb, svg: svg, cols: cols, labels: labels, stretch: !!o.stretch, tags: o.tags || "" });
  }
  function f(n) { return Math.round(n * 100) / 100; }
  var HEART = "M50 88 C20 66 6 50 6 32 C6 18 17 8 30 8 C39 8 46 13 50 21 C54 13 61 8 70 8 C83 8 94 18 94 32 C94 50 80 66 50 88Z";
  function heart(x, y, s, fill, extra) { return '<path transform="translate(' + f(x - 50 * s) + " " + f(y - 48 * s) + ") scale(" + s + ')" d="' + HEART + '" fill="' + fill + '"' + (extra || "") + "/>"; }
  function star(cx, cy, r1, r2, fill, n, rot) {
    n = n || 5; var s = [];
    for (var i = 0; i < n * 2; i++) { var r = i % 2 ? r2 : r1, a = ((rot || -90) * Math.PI / 180) + i * Math.PI / n; s.push(f(cx + r * Math.cos(a)) + "," + f(cy + r * Math.sin(a))); }
    return '<polygon points="' + s.join(" ") + '" fill="' + fill + '" stroke="' + fill + '" stroke-width="' + f(r1 * 0.12) + '" stroke-linejoin="round"/>';
  }
  function flower(cx, cy, r, petal, center, n) {
    n = n || 5; var s = "";
    for (var i = 0; i < n; i++) { var a = i * 360 / n; s += '<ellipse cx="' + f(cx) + '" cy="' + f(cy - r * 0.62) + '" rx="' + f(r * 0.42) + '" ry="' + f(r * 0.6) + '" transform="rotate(' + a + " " + f(cx) + " " + f(cy) + ')" fill="' + petal + '"/>'; }
    return s + '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r * 0.34) + '" fill="' + center + '"/>';
  }
  function leaf(x, y, len, ang, fill) { return '<path transform="translate(' + f(x) + " " + f(y) + ") rotate(" + ang + ')" d="M0 0 C' + f(len * 0.3) + " " + f(-len * 0.32) + " " + f(len * 0.75) + " " + f(-len * 0.3) + " " + f(len) + " 0 C" + f(len * 0.75) + " " + f(len * 0.3) + " " + f(len * 0.3) + " " + f(len * 0.32) + ' 0 0Z" fill="' + fill + '"/>'; }
  function sparkle(cx, cy, r, fill) { return '<path d="M' + f(cx) + " " + f(cy - r) + " C" + f(cx + r * 0.12) + " " + f(cy - r * 0.12) + " " + f(cx + r * 0.12) + " " + f(cy - r * 0.12) + " " + f(cx + r) + " " + f(cy) + " C" + f(cx + r * 0.12) + " " + f(cy + r * 0.12) + " " + f(cx + r * 0.12) + " " + f(cy + r * 0.12) + " " + f(cx) + " " + f(cy + r) + " C" + f(cx - r * 0.12) + " " + f(cy + r * 0.12) + " " + f(cx - r * 0.12) + " " + f(cy + r * 0.12) + " " + f(cx - r) + " " + f(cy) + " C" + f(cx - r * 0.12) + " " + f(cy - r * 0.12) + " " + f(cx - r * 0.12) + " " + f(cy - r * 0.12) + " " + f(cx) + " " + f(cy - r) + 'Z" fill="' + fill + '"/>'; }

  /* ---------- Washi tapes decoradas (esticam) ---------- */
  var W = "Washi tapes decoradas";
  var TORN = "M4 0 L196 0 L199 4 L195 9 L199 14 L196 19 L199 24 L195 29 L199 34 L195 39 L198 44 L196 46 L4 46 L1 42 L5 37 L1 32 L5 27 L1 22 L5 17 L1 12 L5 7 L1 3Z";
  function tape(id, name, cols, labels, inner, defs, tags) {
    add(W, id, name, "0 0 200 46", '<defs><clipPath id="t"><path d="' + TORN + '"/></clipPath>' + (defs || "") + '</defs><g clip-path="url(#t)" opacity=".94"><rect width="200" height="46" fill="{1}"/>' + inner +
      '<rect width="200" height="46" fill="#ffffff" opacity=".08"/></g>', cols, labels, { stretch: 1, tags: "fita adesiva washi tape " + (tags || "") });
  }
  var dots = "", i, j;
  for (i = 0; i < 15; i++) for (j = 0; j < 3; j++) dots += '<circle cx="' + (6 + i * 14 + (j % 2) * 7) + '" cy="' + (8 + j * 15) + '" r="3.2"/>';
  tape("wd-poa", "Washi poá", ["#F7C6D4", "#FFFFFF"], ["Fita", "Bolinhas"], '<g fill="{2}">' + dots + "</g>", "", "bolinhas poá");
  tape("wd-xadrez", "Washi xadrez", ["#FFFFFF", "#E88AA6"], ["Fundo", "Xadrez"], '<rect width="200" height="46" fill="url(#gv)" opacity=".5"/><rect width="200" height="46" fill="url(#gh)" opacity=".5"/>',
    '<pattern id="gv" width="16" height="46" patternUnits="userSpaceOnUse"><rect width="8" height="46" fill="{2}"/></pattern><pattern id="gh" width="200" height="16" patternUnits="userSpaceOnUse"><rect width="200" height="8" fill="{2}"/></pattern>', "xadrez vichy gingham");
  tape("wd-listras3", "Washi listras coloridas", ["#FFF4C2", "#A88BD8", "#7FB98A"], ["Fundo", "Listra 1", "Listra 2"], '<rect width="200" height="46" fill="url(#l3)"/>',
    '<pattern id="l3" width="24" height="46" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="5" height="46" fill="{2}"/><rect x="12" width="5" height="46" fill="{3}"/></pattern>', "listras diagonal");
  var hs = ""; for (i = 0; i < 9; i++) hs += heart(12 + i * 22, i % 2 ? 30 : 16, 0.11, "{2}");
  tape("wd-coracoes", "Washi corações", ["#FCE4EC", "#E53950"], ["Fita", "Corações"], hs, "", "coração amor");
  var st = ""; for (i = 0; i < 9; i++) { st += star(12 + i * 22, i % 2 ? 29 : 16, 6.5, 2.8, "{2}"); st += '<circle cx="' + (23 + i * 22) + '" cy="' + (i % 2 ? 14 : 33) + '" r="1.8" fill="{3}"/>'; }
  tape("wd-estrelas", "Washi estrelinhas", ["#2E3A59", "#F5C518", "#FFFFFF"], ["Fita", "Estrelas", "Pontinhos"], st, "", "estrela noite céu");
  var fl = ""; for (i = 0; i < 7; i++) fl += flower(14 + i * 29, i % 2 ? 29 : 17, 9, "{2}", "{3}");
  tape("wd-flores", "Washi florzinhas", ["#DCCFF5", "#FFFFFF", "#F5C518"], ["Fita", "Pétalas", "Miolo"], fl, "", "flor floral");
  tape("wd-ondas", "Washi ondinhas", ["#CFE0F7", "#6FA3D8"], ["Fita", "Ondas"], '<path d="M0 16 q12.5 -8 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 M0 32 q12.5 -8 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0" fill="none" stroke="{2}" stroke-width="4" stroke-linecap="round"/>', "", "onda mar");
  tape("wd-zigue", "Washi zigue-zague", ["#FFE0C7", "#E8946A"], ["Fita", "Zigue-zague"], '<path d="M0 30 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l10 12" fill="none" stroke="{2}" stroke-width="4.5" stroke-linejoin="round"/>', "", "chevron");
  var lz = ""; for (i = 0; i < 9; i++) lz += '<path d="M' + (i * 24) + ' 23 l12 -20 l12 20 l-12 20z" fill="' + (i % 2 ? "{2}" : "{3}") + '"/>';
  tape("wd-losangos", "Washi losangos", ["#E6F5C8", "#7FB98A", "#C9EEF0"], ["Fita", "Losango 1", "Losango 2"], lz, "", "losango argyle");
  var cf = "", CC = ["{2}", "{3}", "{4}"];
  for (i = 0; i < 24; i++) { var cx = 5 + (i * 37) % 196, cy = 6 + (i * 17) % 36; cf += i % 3 === 0 ? '<circle cx="' + cx + '" cy="' + cy + '" r="2.6" fill="' + CC[i % 3] + '"/>' : '<rect x="' + cx + '" y="' + cy + '" width="7" height="3" rx="1.5" transform="rotate(' + (i * 47 % 180) + " " + cx + " " + cy + ')" fill="' + CC[i % 3] + '"/>'; }
  tape("wd-confete", "Washi confete", ["#FDF3E7", "#E88AA6", "#6FA3D8", "#E8C468"], ["Fita", "Confete 1", "Confete 2", "Confete 3"], cf, "", "festa confete aniversário");
  tape("wd-arcoiris", "Washi arco-íris", ["#F9C6D3", "#FFF4C2", "#CDEFD7", "#CFE0F7"], ["Faixa 1", "Faixa 2", "Faixa 3", "Faixa 4"], '<rect y="11.5" width="200" height="11.5" fill="{2}"/><rect y="23" width="200" height="11.5" fill="{3}"/><rect y="34.5" width="200" height="11.5" fill="{4}"/>', "", "listras arco-íris");
  var lv = ""; for (i = 0; i < 10; i++) lv += leaf(4 + i * 21, i % 2 ? 30 : 18, 14, i % 2 ? -25 : 25, "{2}");
  tape("wd-folhas", "Washi folhinhas", ["#F7F4F2", "#7FB98A"], ["Fita", "Folhas"], lv, "", "folha planta verde");
  var pd = ""; for (i = 0; i < 20; i++) pd += '<circle cx="' + (5 + i * 10) + '" cy="23" r="2.5"/>';
  tape("wd-borda", "Washi com bordinha", ["#E8B4A8", "#FFFFFF", "#B76E79"], ["Fita", "Bordas", "Pontinhos"], '<rect y="4" width="200" height="2" fill="{2}"/><rect y="40" width="200" height="2" fill="{2}"/><g fill="{3}">' + pd + "</g>", "", "bordinha pontos");

  /* ---------- Molduras florais ---------- */
  var MF = "Molduras florais";
  function corner(x, y, s, rot) {
    return '<g transform="translate(' + x + " " + y + ") rotate(" + rot + ") scale(" + s + ')">' + leaf(0, 0, 26, -10, "{4}") + leaf(0, 0, 24, 100, "{4}") + leaf(2, 2, 18, 45, "{4}") +
      flower(4, 4, 13, "{2}", "{3}") + flower(26, -4, 8, "{3}", "{2}") + flower(-4, 26, 8, "{3}", "{2}") + "</g>";
  }
  add(MF, "mf-cantos", "Moldura com flores nos cantos", "-10 -10 220 160", '<rect x="12" y="12" width="176" height="116" rx="6" fill="none" stroke="{1}" stroke-width="2.5"/>' + corner(16, 16, 1, 0) + corner(184, 124, 1, 180),
    ["#C9A982", "#F9C6D3", "#E8C468", "#7FB98A"], ["Borda", "Flores", "Miolo", "Folhas"], { tags: "moldura quadro floral flores" });
  var wr = ""; for (i = 0; i < 18; i++) { var a = i * 20, rr = 78; wr += leaf(100 + rr * Math.cos(a * Math.PI / 180), 100 + rr * Math.sin(a * Math.PI / 180), 20, a + 100, "{4}"); }
  var wf = ""; [[-60, 13], [-20, 9], [30, 12], [80, 9], [130, 13], [180, 9], [230, 12]].forEach(function (p, k) { wf += flower(100 + 78 * Math.cos(p[0] * Math.PI / 180), 100 + 78 * Math.sin(p[0] * Math.PI / 180), p[1], k % 2 ? "{3}" : "{2}", k % 2 ? "{2}" : "{1}"); });
  add(MF, "mf-guirlanda", "Guirlanda de flores", "0 0 200 200", '<circle cx="100" cy="100" r="78" fill="none" stroke="{4}" stroke-width="2"/>' + wr + wf,
    ["#E8C468", "#E88AA6", "#FFFFFF", "#7FB98A"], ["Miolo", "Flores 1", "Flores 2", "Folhas"], { tags: "moldura redonda guirlanda coroa floral círculo" });
  var lw = ""; for (i = 0; i < 16; i++) { var b = i * 22.5; lw += leaf(100 + 80 * Math.cos(b * Math.PI / 180), 100 + 80 * Math.sin(b * Math.PI / 180), 22, b + (i % 2 ? 80 : 110), "{1}"); }
  var be = ""; for (i = 0; i < 8; i++) { var c = i * 45 + 11; be += '<circle cx="' + f(100 + 84 * Math.cos(c * Math.PI / 180)) + '" cy="' + f(100 + 84 * Math.sin(c * Math.PI / 180)) + '" r="4.5" fill="{2}"/>'; }
  add(MF, "mf-folhas", "Guirlanda de folhas", "0 0 200 200", '<circle cx="100" cy="100" r="80" fill="none" stroke="{1}" stroke-width="2.5"/>' + lw + be,
    ["#7FB98A", "#E53950"], ["Folhas", "Frutinhas"], { tags: "moldura redonda guirlanda folhas natal" });
  add(MF, "mf-arco", "Arco floral", "0 0 160 200", '<path d="M14 196 V80 A66 66 0 0 1 146 80 V196Z" fill="{1}"/><path d="M14 196 V80 A66 66 0 0 1 146 80 V196" fill="none" stroke="{3}" stroke-width="2.5"/>' +
    leaf(30, 40, 26, -40, "{3}") + leaf(40, 30, 22, -80, "{3}") + leaf(118, 30, 22, -110, "{3}") + leaf(132, 44, 26, -140, "{3}") + flower(40, 42, 15, "{2}", "{4}") + flower(120, 40, 12, "{2}", "{4}") + flower(80, 15, 10, "{2}", "{4}") +
    leaf(14, 180, 24, -70, "{3}") + leaf(14, 180, 20, -20, "{3}") + flower(18, 178, 11, "{2}", "{4}"),
    ["#FFF4F7", "#E88AA6", "#7FB98A", "#E8C468"], ["Fundo", "Flores", "Folhas", "Miolo"], { tags: "moldura arco janela floral" });
  var mh = ""; for (i = 0; i < 9; i++) { mh += heart(20 + i * 20, 12, 0.08, "{2}"); mh += heart(20 + i * 20, 128, 0.08, "{2}"); }
  for (i = 1; i < 6; i++) { mh += heart(12, 12 + i * 19.5, 0.08, "{2}"); mh += heart(188, 12 + i * 19.5, 0.08, "{2}"); }
  add(MF, "mf-coracoes", "Moldura de corações", "0 0 200 140", '<rect x="22" y="22" width="156" height="96" rx="8" fill="none" stroke="{1}" stroke-width="2" stroke-dasharray="5 4"/>' + mh,
    ["#E88AA6", "#E53950"], ["Pontilhado", "Corações"], { tags: "moldura coração amor" });
  add(MF, "mf-polaroid", "Polaroid com fita", "0 0 140 166", '<rect x="8" y="12" width="124" height="148" rx="3" fill="{1}" stroke="#00000014" stroke-width="2"/><rect x="18" y="22" width="104" height="104" fill="{2}"/>' +
    '<rect x="44" y="0" width="52" height="20" transform="rotate(-6 70 10)" fill="{3}" opacity=".85"/>',
    ["#FFFFFF", "#EDE8E4", "#F9C6D3"], ["Papel", "Foto", "Fita"], { tags: "moldura polaroid foto quadro" });
  var sc = "M20 10"; for (i = 0; i < 8; i++) sc += " a10 10 0 0 1 20 0"; sc += " "; for (i = 0; i < 6; i++) sc += " a10 10 0 0 1 0 20"; for (i = 0; i < 8; i++) sc += " a10 10 0 0 1 -20 0"; for (i = 0; i < 6; i++) sc += " a10 10 0 0 1 0 -20"; sc += "Z";
  add(MF, "mf-recortada", "Moldura recortada", "0 0 200 150", '<path d="' + sc + '" fill="{1}"/><rect x="26" y="20" width="148" height="110" rx="4" fill="{2}"/><rect x="31" y="25" width="138" height="100" rx="3" fill="none" stroke="{3}" stroke-width="1.5" stroke-dasharray="4 3"/>',
    ["#DCCFF5", "#FFFFFF", "#A88BD8"], ["Recorte", "Dentro", "Pontilhado"], { tags: "moldura ondulada scallop" });
  add(MF, "mf-topo", "Moldura com buquê", "0 0 200 140", '<rect x="10" y="20" width="180" height="110" rx="10" fill="none" stroke="{1}" stroke-width="2"/>' +
    leaf(150, 22, 30, -160, "{4}") + leaf(150, 22, 28, -20, "{4}") + leaf(150, 22, 24, -90, "{4}") + leaf(150, 22, 22, 30, "{4}") + leaf(150, 22, 22, 150, "{4}") +
    flower(150, 22, 16, "{2}", "{3}") + flower(128, 14, 11, "{3}", "{2}") + flower(172, 14, 11, "{3}", "{2}") + flower(140, 38, 8, "{2}", "{3}"),
    ["#A88BD8", "#E88AA6", "#FFF4C2", "#7FB98A"], ["Borda", "Flor grande", "Flores", "Folhas"], { tags: "moldura floral buquê" });

  /* ---------- Etiquetas e tags ---------- */
  var ET = "Etiquetas e tags";
  add(ET, "et-presente", "Tag de presente", "0 0 180 90", '<path d="M50 6 H170 a8 8 0 0 1 8 8 V76 a8 8 0 0 1 -8 8 H50 L8 45Z" fill="{1}" stroke="{1}" stroke-width="4" stroke-linejoin="round"/><path d="M54 14 H164 a6 6 0 0 1 6 6 V70 a6 6 0 0 1 -6 6 H54 L22 45Z" fill="none" stroke="{2}" stroke-width="1.6" stroke-dasharray="4 3"/>' +
    '<circle cx="40" cy="45" r="7" fill="#fff" stroke="{2}" stroke-width="2.5"/><path d="M40 45 C20 30 10 60 0 40" fill="none" stroke="{3}" stroke-width="2.5"/>',
    ["#F9C6D3", "#E88AA6", "#C9A982"], ["Tag", "Detalhes", "Barbante"], { tags: "etiqueta tag presente" });
  var sl = "M24 10"; for (i = 0; i < 7; i++) sl += " q8 -8 16 0"; sl += " q8 0 8 8"; for (i = 0; i < 3; i++) sl += " q8 8 0 16"; sl += " q0 8 -8 8"; for (i = 0; i < 7; i++) sl += " q-8 8 -16 0"; sl += " q-8 0 -8 -8"; for (i = 0; i < 3; i++) sl += " q-8 -8 0 -16"; sl += "Z";
  add(ET, "et-recortada", "Etiqueta recortada", "0 0 160 80", '<path d="' + sl.replace("M24 10", "M24 12") + '" fill="{1}"/><rect x="22" y="18" width="116" height="44" rx="6" fill="none" stroke="{2}" stroke-width="2" stroke-dasharray="4 3"/>',
    ["#CFE0F7", "#6FA3D8"], ["Etiqueta", "Pontilhado"], { tags: "etiqueta label ondulada" });
  add(ET, "et-laco", "Etiqueta com laço", "0 0 180 90", '<rect x="10" y="22" width="160" height="58" rx="12" fill="{1}"/><rect x="16" y="28" width="148" height="46" rx="9" fill="none" stroke="{3}" stroke-width="1.5"/>' +
    '<path d="M90 22 C70 0 50 8 62 22 C50 34 70 40 90 22Z M90 22 C110 0 130 8 118 22 C130 34 110 40 90 22Z" fill="{2}"/><path d="M90 22 l-12 22 M90 22 l12 22" stroke="{2}" stroke-width="5" stroke-linecap="round"/><circle cx="90" cy="22" r="6" fill="{2}" stroke="#00000022"/>',
    ["#FFF4C2", "#E88AA6", "#E8C468"], ["Etiqueta", "Laço", "Borda"], { tags: "etiqueta laço fita" });
  add(ET, "et-faixa", "Faixa de título", "0 0 240 70", '<path d="M8 22 H40 V58 H8 L20 40Z" fill="{2}"/><path d="M232 22 H200 V58 H232 L220 40Z" fill="{2}"/><path d="M40 58 L52 66 V52Z M200 58 L188 66 V52Z" fill="{3}"/><rect x="30" y="8" width="180" height="44" rx="3" fill="{1}"/>',
    ["#E88AA6", "#C9607F", "#8F3D57"], ["Faixa", "Pontas", "Dobras"], { tags: "faixa banner fita título" });
  add(ET, "et-bandeira", "Etiqueta bandeira", "0 0 200 60", '<path d="M4 6 H196 L180 30 L196 54 H4 L20 30Z" fill="{1}"/><path d="M14 13 H183 L172 30 L183 47 H14 L25 30Z" fill="none" stroke="{2}" stroke-width="1.6" stroke-dasharray="5 3"/>',
    ["#A88BD8", "#FFFFFF"], ["Etiqueta", "Costura"], { tags: "etiqueta fita bandeira" });
  add(ET, "et-flor", "Etiqueta com flor", "0 0 200 80", '<rect x="30" y="16" width="164" height="50" rx="25" fill="{1}"/>' + leaf(36, 46, 22, 150, "#7FB98A") + leaf(36, 46, 20, 40, "#7FB98A") + flower(36, 40, 26, "{2}", "{3}"),
    ["#FDE7EF", "#F28CB1", "#F5C518"], ["Etiqueta", "Pétalas", "Miolo"], { tags: "etiqueta flor" });
  add(ET, "et-nuvem", "Etiqueta nuvem", "0 0 200 110", '<path d="M50 96 C20 96 8 76 18 60 C6 44 22 22 44 28 C50 8 80 4 94 20 C108 2 140 6 146 28 C170 20 194 40 184 62 C198 80 180 100 158 96Z" fill="{1}" stroke="{2}" stroke-width="3"/>',
    ["#FFFFFF", "#9EC3E6"], ["Nuvem", "Contorno"], { tags: "etiqueta nuvem balão" });
  add(ET, "et-coracao", "Etiqueta coração", "0 0 100 92", heart(50, 46, 0.98, "{1}", ' stroke="{2}" stroke-width="3"') + heart(50, 46, 0.8, "none", ' stroke="{2}" stroke-width="2" stroke-dasharray="4 3"') + heart(74, 26, 0.14, "{3}"),
    ["#F9C6D3", "#E88AA6", "#FFFFFF"], ["Coração", "Bordas", "Detalhe"], { tags: "etiqueta coração amor" });
  add(ET, "et-ingresso", "Etiqueta ingresso", "0 0 200 80", '<path d="M8 8 H192 V30 a10 10 0 0 0 0 20 V72 H8 V50 a10 10 0 0 0 0 -20Z" fill="{1}"/><path d="M150 12 V68" stroke="{2}" stroke-width="2" stroke-dasharray="4 4"/>' + star(172, 40, 11, 5, "{3}"),
    ["#FFE0C7", "#E8946A", "#E8946A"], ["Ingresso", "Picote", "Estrela"], { tags: "etiqueta ingresso ticket cupom" });

  /* ---------- Divisórias decoradas ---------- */
  var DV = "Divisórias decoradas";
  add(DV, "dv-flores", "Divisória de flores", "0 0 300 40", '<path d="M10 20 H120 M180 20 H290" stroke="{1}" stroke-width="2" stroke-linecap="round"/>' + leaf(150, 20, 26, 160, "{3}") + leaf(150, 20, 26, 20, "{3}") + leaf(150, 20, 22, 200, "{3}") + leaf(150, 20, 22, -20, "{3}") + flower(150, 20, 14, "{2}", "{1}") + flower(126, 20, 7, "{2}", "{1}") + flower(174, 20, 7, "{2}", "{1}"),
    ["#E8C468", "#E88AA6", "#7FB98A"], ["Linha", "Flores", "Folhas"], { tags: "divisória divisor separador flor" });
  var dh = '<path d="M10 20 H290" stroke="{1}" stroke-width="1.5" stroke-dasharray="2 5" stroke-linecap="round"/>'; [60, 105, 150, 195, 240].forEach(function (x, k) { dh += heart(x, 21, k === 2 ? 0.26 : 0.16, "{2}"); });
  add(DV, "dv-coracoes", "Divisória de corações", "0 0 300 40", dh, ["#E88AA6", "#E53950"], ["Linha", "Corações"], { tags: "divisória coração amor" });
  var ds = '<path d="M10 20 H130 M170 20 H290" stroke="{1}" stroke-width="2" stroke-linecap="round"/>' + star(150, 20, 14, 6, "{2}");
  [100, 200].forEach(function (x) { ds += star(x, 20, 6, 2.6, "{2}"); }); [40, 70, 230, 260].forEach(function (x) { ds += '<circle cx="' + x + '" cy="20" r="3.5" fill="{3}"/>'; });
  add(DV, "dv-estrelas", "Divisória de estrelas", "0 0 300 40", ds, ["#C9A982", "#E8C468", "#A88BD8"], ["Linha", "Estrelas", "Bolinhas"], { tags: "divisória estrela" });
  var dw = "M6 20"; for (i = 0; i < 12; i++) dw += " q12 " + (i % 2 ? 12 : -12) + " 24 0"; var dd = ""; for (i = 0; i < 12; i++) dd += '<circle cx="' + (18 + i * 24) + '" cy="' + (i % 2 ? 32 : 8) + '" r="2.6"/>';
  add(DV, "dv-ondas", "Divisória ondinha", "0 0 300 40", '<path d="' + dw + '" fill="none" stroke="{1}" stroke-width="3" stroke-linecap="round"/><g fill="{2}">' + dd + "</g>", ["#6FA3D8", "#E88AA6"], ["Onda", "Pontinhos"], { tags: "divisória onda" });
  var dl = '<path d="M8 22 C60 8 100 34 150 20 C200 8 240 34 292 20" fill="none" stroke="{1}" stroke-width="2.4" stroke-linecap="round"/>';
  for (i = 0; i < 11; i++) { var lx = 24 + i * 25; dl += leaf(lx, 21 + (i % 2 ? -1 : 1) * 2, 15, i % 2 ? -50 : 50, "{2}"); }
  add(DV, "dv-ramo", "Divisória de ramo", "0 0 300 40", dl, ["#5E8C61", "#7FB98A"], ["Galho", "Folhas"], { tags: "divisória folhas galho ramo" });
  add(DV, "dv-laco", "Divisória com laço", "0 0 300 40", '<path d="M10 20 H128 M172 20 H290" stroke="{1}" stroke-width="2" stroke-linecap="round"/><path d="M10 25 H128 M172 25 H290" stroke="{1}" stroke-width="1" stroke-linecap="round" opacity=".6"/>' +
    '<path d="M150 20 C134 4 120 10 126 20 C120 32 134 36 150 20Z M150 20 C166 4 180 10 174 20 C180 32 166 36 150 20Z" fill="{2}"/><path d="M150 20 l-9 17 M150 20 l9 17" stroke="{2}" stroke-width="4" stroke-linecap="round"/><circle cx="150" cy="20" r="5" fill="{3}"/>',
    ["#C9A982", "#E88AA6", "#C9607F"], ["Linha", "Laço", "Nó"], { tags: "divisória laço" });
  var rd = "", RC = ["{1}", "{2}", "{3}", "{4}"]; for (i = 0; i < 24; i++) rd += '<circle cx="' + (12 + i * 12) + '" cy="20" r="' + (i % 2 ? 3 : 4.5) + '" fill="' + RC[i % 4] + '"/>';
  add(DV, "dv-pontos", "Divisória de bolinhas coloridas", "0 0 300 40", rd, ["#E88AA6", "#E8C468", "#7FB98A", "#6FA3D8"], ["Cor 1", "Cor 2", "Cor 3", "Cor 4"], { tags: "divisória bolinhas pontos arco-íris" });
  var cr = "M6 12"; for (i = 0; i < 18; i++) cr += " a8 8 0 0 0 16 0"; var cd = ""; for (i = 0; i < 18; i++) cd += '<circle cx="' + (14 + i * 16) + '" cy="14" r="2"/>';
  add(DV, "dv-croche", "Divisória de crochê", "0 0 300 40", '<path d="M6 12 H294" stroke="{1}" stroke-width="2"/><path d="' + cr + '" fill="{1}" opacity=".35"/><path d="' + cr + '" fill="none" stroke="{1}" stroke-width="2"/><g fill="{2}">' + cd + "</g>",
    ["#A88BD8", "#FFFFFF"], ["Renda", "Furinhos"], { tags: "divisória renda crochê barrado" });

  /* ---------- Bandeirinhas coloridas ---------- */
  var BD = "Bandeirinhas coloridas";
  function varal(shape, n) {
    var s = '<path d="M4 10 Q150 34 296 10" fill="none" stroke="{1}" stroke-width="2"/>', k;
    for (k = 0; k < n; k++) {
      var t = (k + 0.5) / n, x = 4 + 292 * t, y = 10 + 24 * 2 * t * (1 - t) * 1, col = ["{2}", "{3}", "{4}"][k % 3];
      s += shape(x, y, col, k);
    }
    return s;
  }
  add(BD, "bd-triangulo", "Varal de bandeirinhas", "0 0 300 80", varal(function (x, y, c) { return '<path d="M' + f(x - 13) + " " + f(y) + " H" + f(x + 13) + " L" + f(x) + " " + f(y + 36) + 'Z" fill="' + c + '"/>'; }, 9),
    ["#8A5A3C", "#E88AA6", "#E8C468", "#6FA3D8"], ["Cordão", "Cor 1", "Cor 2", "Cor 3"], { tags: "bandeirinha varal festa junina aniversário" });
  add(BD, "bd-junina", "Bandeirinhas juninas", "0 0 300 80", varal(function (x, y, c) { return '<path d="M' + f(x - 13) + " " + f(y) + " H" + f(x + 13) + " V" + f(y + 34) + " L" + f(x) + " " + f(y + 25) + " L" + f(x - 13) + " " + f(y + 34) + 'Z" fill="' + c + '"/>'; }, 9),
    ["#8A5A3C", "#E53950", "#3DBE55", "#F5C518"], ["Cordão", "Cor 1", "Cor 2", "Cor 3"], { tags: "bandeirinha festa junina são joão arraiá" });
  add(BD, "bd-redonda", "Bandeirinhas arredondadas", "0 0 300 80", varal(function (x, y, c) { return '<path d="M' + f(x - 13) + " " + f(y) + " H" + f(x + 13) + " V" + f(y + 18) + " A13 13 0 0 1 " + f(x - 13) + " " + f(y + 18) + 'Z" fill="' + c + '"/>'; }, 9),
    ["#C9A982", "#F9C6D3", "#DCCFF5", "#CDEFD7"], ["Cordão", "Cor 1", "Cor 2", "Cor 3"], { tags: "bandeirinha varal pastel" });
  add(BD, "bd-coracoes", "Varal de corações", "0 0 300 80", varal(function (x, y, c) { return '<path d="M' + f(x) + " " + f(y) + " v4" + '" stroke="#8A5A3C" stroke-width="1.5"/>' + heart(x, y + 18, 0.2, c); }, 8),
    ["#8A5A3C", "#E53950", "#E88AA6", "#F9C6D3"], ["Cordão", "Cor 1", "Cor 2", "Cor 3"], { tags: "varal coração amor namorados" });
  add(BD, "bd-bolinhas", "Bandeirinhas de bolinhas", "0 0 300 80", varal(function (x, y, c, k) {
    return '<path d="M' + f(x - 13) + " " + f(y) + " H" + f(x + 13) + " L" + f(x) + " " + f(y + 36) + 'Z" fill="' + c + '"/><g fill="#ffffff" opacity=".85"><circle cx="' + f(x - 5) + '" cy="' + f(y + 7) + '" r="2"/><circle cx="' + f(x + 5) + '" cy="' + f(y + 7) + '" r="2"/><circle cx="' + f(x) + '" cy="' + f(y + 16) + '" r="2"/></g>';
  }, 9), ["#333333", "#A88BD8", "#E88AA6", "#6FA3D8"], ["Cordão", "Cor 1", "Cor 2", "Cor 3"], { tags: "bandeirinha bolinhas festa" });

  /* ---------- Post-its e papéis ---------- */
  var PI = "Post-its e papéis";
  add(PI, "pi-fita", "Post-it com fita", "0 0 100 106", '<path d="M8 12 H92 V96 Q60 92 8 100Z" fill="{1}"/><path d="M8 100 Q60 92 92 96 L92 100 Q60 96 8 104Z" fill="#000" opacity=".06"/><rect x="32" y="2" width="36" height="16" transform="rotate(-4 50 10)" fill="{2}" opacity=".8"/>',
    ["#FFF4C2", "#F9C6D3"], ["Papel", "Fita"], { tags: "post-it nota recado bilhete" });
  add(PI, "pi-dobra", "Post-it com dobrinha", "0 0 100 100", '<path d="M6 6 H94 V72 L72 94 H6Z" fill="{1}"/><path d="M94 72 H76 a4 4 0 0 0 -4 4 V94Z" fill="{2}"/>',
    ["#F9C6D3", "#E88AA6"], ["Papel", "Dobra"], { tags: "post-it nota dobra" });
  var pl = ""; for (i = 0; i < 7; i++) pl += '<path d="M8 ' + (28 + i * 10) + ' H92" stroke="{2}" stroke-width="1"/>';
  add(PI, "pi-pautado", "Post-it pautado", "0 0 100 100", '<rect x="6" y="6" width="88" height="88" rx="2" fill="{1}"/>' + pl + '<path d="M22 8 V92" stroke="{3}" stroke-width="1.2"/>',
    ["#CFE0F7", "#9EC3E6", "#E88AA6"], ["Papel", "Linhas", "Margem"], { tags: "post-it pautado linhas nota" });
  add(PI, "pi-coracao", "Bilhete de coração", "0 0 100 100", heart(50, 52, 0.92, "{1}") + '<circle cx="50" cy="16" r="7" fill="{2}"/><circle cx="48" cy="14" r="2.2" fill="#fff" opacity=".7"/>',
    ["#FADADD", "#E53950"], ["Papel", "Tachinha"], { tags: "post-it coração bilhete" });
  add(PI, "pi-tachinha", "Post-it com tachinha", "0 0 100 106", '<rect x="8" y="12" width="84" height="88" rx="2" transform="rotate(2 50 56)" fill="{1}"/><circle cx="50" cy="14" r="9" fill="{2}"/><circle cx="47" cy="11" r="3" fill="#fff" opacity=".6"/>',
    ["#CDEFD7", "#E8946A"], ["Papel", "Tachinha"], { tags: "post-it tachinha mural" });
  var gr = ""; for (i = 1; i < 9; i++) gr += '<path d="M' + (6 + i * 10) + ' 20 V94 M6 ' + (20 + i * 9.25) + ' H94" stroke="{2}" stroke-width=".8"/>';
  var rg = ""; for (i = 0; i < 9; i++) rg += '<circle cx="' + (12 + i * 10) + '" cy="14" r="2.8" fill="#fff" stroke="{3}" stroke-width="1.5"/>';
  add(PI, "pi-quadriculado", "Bloco quadriculado", "0 0 100 100", '<rect x="6" y="10" width="88" height="84" rx="2" fill="{1}"/>' + gr + '<rect x="6" y="10" width="88" height="10" fill="{3}" opacity=".25"/>' + rg,
    ["#FFFFFF", "#CFE0F7", "#A88BD8"], ["Papel", "Quadriculado", "Espiral"], { tags: "papel bloco quadriculado caderno espiral" });
  var tornT = "M4 10 L12 4 L20 9 L30 3 L40 8 L52 2 L62 8 L74 3 L84 9 L96 4 L104 8 L116 3 L126 9 L138 4 L148 8 L160 3 L172 9 L184 4 L196 10 L196 50 L188 56 L176 51 L166 57 L154 52 L142 57 L130 51 L118 56 L106 51 L94 57 L82 52 L70 56 L58 51 L46 57 L34 52 L22 57 L12 51 L4 56Z";
  var SH = '<path d="' + tornT + '" fill="#000000" opacity=".12" transform="translate(1.5 2.5)"/>';
  add(PI, "pi-rasgado", "Papel rasgado", "0 0 200 60", '<path d="' + tornT + '" fill="{2}" transform="translate(1.5 2.5)" opacity=".6"/><path d="' + tornT + '" fill="{1}"/>', ["#FFFDF6", "#C9A982"], ["Papel", "Sombra"], { stretch: 1, tags: "papel rasgado tira" });
  add(PI, "pi-rasgado-pauta", "Papel rasgado pautado", "0 0 200 60", SH + '<path d="' + tornT + '" fill="{1}"/><path d="M4 22 H196 M4 34 H196 M4 46 H196" stroke="{2}" stroke-width="1"/><path d="M24 6 V56" stroke="{3}" stroke-width="1.2"/>',
    ["#FFFFFF", "#9EC3E6", "#E88AA6"], ["Papel", "Linhas", "Margem"], { stretch: 1, tags: "papel rasgado caderno pautado" });
  add(PI, "pi-kraft", "Papel kraft rasgado", "0 0 200 60", '<path d="' + tornT + '" fill="{1}"/><path d="' + tornT + '" fill="none" stroke="{2}" stroke-width="1.2" opacity=".6"/>', ["#D9A679", "#A86B4A"], ["Papel", "Borda"], { stretch: 1, tags: "papel kraft rasgado" });
  var gq = ""; for (i = 1; i < 20; i++) gq += '<path d="M' + (4 + i * 10) + ' 0 V60" stroke="{2}" stroke-width=".7"/>'; for (i = 1; i < 6; i++) gq += '<path d="M0 ' + (i * 10) + ' H200" stroke="{2}" stroke-width=".7"/>';
  add(PI, "pi-rasgado-quad", "Papel rasgado quadriculado", "0 0 200 60", SH + '<defs><clipPath id="q"><path d="' + tornT + '"/></clipPath></defs><g clip-path="url(#q)"><rect width="200" height="60" fill="{1}"/>' + gq + "</g>", ["#FFFFFF", "#B9DDB5"], ["Papel", "Quadriculado"], { stretch: 1, tags: "papel rasgado quadriculado" });

  /* ---------- Clipes e pins ---------- */
  var CP = "Clipes e pins";
  add(CP, "cp-clipe", "Clipe colorido", "0 0 40 100", '<path d="M14 70 V22 a8 8 0 0 1 16 0 V80 a12 12 0 0 1 -24 0 V14 a14 14 0 0 1 28 0" fill="none" stroke="{1}" stroke-width="5" stroke-linecap="round" transform="translate(0 6)"/>', ["#E88AA6"], ["Clipe"], { tags: "clipe papel prender" });
  add(CP, "cp-clipe-coracao", "Clipe de coração", "0 0 70 100", '<path d="M35 92 C12 72 6 58 6 44 C6 32 15 24 25 24 C30 24 33 27 35 31 C37 27 40 24 45 24 C55 24 64 32 64 44 C64 58 58 72 35 92Z M35 80 C20 66 16 56 16 46 C16 38 21 34 26 34 C30 34 33 38 35 42 V8" fill="none" stroke="{1}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>', ["#E53950"], ["Clipe"], { tags: "clipe coração" });
  add(CP, "cp-clipe-flor", "Clipe com flor", "0 0 70 110", '<path d="M28 100 V50 a7 7 0 0 1 14 0 V92 a10 10 0 0 1 -20 0 V44" fill="none" stroke="{1}" stroke-width="4" stroke-linecap="round"/>' + flower(35, 26, 24, "{2}", "{3}", 6),
    ["#B8BCC2", "#F9C6D3", "#E8C468"], ["Clipe", "Pétalas", "Miolo"], { tags: "clipe flor" });
  add(CP, "cp-tachinha", "Tachinha", "0 0 60 80", '<path d="M30 46 L30 78" stroke="#9aa0a6" stroke-width="3" stroke-linecap="round"/><ellipse cx="30" cy="44" rx="20" ry="7" fill="{2}"/><path d="M20 20 H40 L36 42 H24Z" fill="{1}"/><ellipse cx="30" cy="18" rx="14" ry="10" fill="{1}"/><ellipse cx="25" cy="14" rx="4" ry="2.5" fill="#fff" opacity=".6"/>',
    ["#E88AA6", "#C9607F"], ["Tachinha", "Base"], { tags: "tachinha pin alfinete mural" });
  add(CP, "cp-alfinete", "Alfinete de coração", "0 0 60 90", '<path d="M30 44 L30 88" stroke="#9aa0a6" stroke-width="2.5" stroke-linecap="round"/>' + heart(30, 24, 0.5, "{1}") + '<ellipse cx="20" cy="16" rx="5" ry="3" fill="#fff" opacity=".55"/>', ["#E53950"], ["Coração"], { tags: "alfinete pin coração" });
  add(CP, "cp-prendedor", "Prendedor de madeira", "0 0 40 120", '<rect x="6" y="4" width="13" height="112" rx="4" fill="{1}"/><rect x="21" y="4" width="13" height="112" rx="4" fill="{1}"/><path d="M19 4 V116" stroke="#0000001a" stroke-width="2"/><rect x="4" y="52" width="32" height="12" rx="3" fill="{2}"/>' + heart(20, 30, 0.15, "{3}"),
    ["#E6C9A3", "#B8BCC2", "#E88AA6"], ["Madeira", "Mola", "Coração"], { tags: "prendedor pregador madeira varal" });
  add(CP, "cp-durex", "Pedaço de fita", "0 0 100 34", '<path d="M3 3 L97 1 L95 8 L98 15 L95 22 L98 29 L96 33 L2 33 L5 26 L2 19 L5 12 L2 6Z" fill="{1}" opacity=".7"/>', ["#F3D1F4"], ["Fita"], { stretch: 1, tags: "fita durex adesiva pedaço" });
  add(CP, "cp-botao", "Botão de roupa", "0 0 80 80", '<circle cx="40" cy="40" r="36" fill="{1}"/><circle cx="40" cy="40" r="27" fill="none" stroke="{2}" stroke-width="2.5"/><g fill="{2}"><circle cx="32" cy="32" r="4.5"/><circle cx="48" cy="32" r="4.5"/><circle cx="32" cy="48" r="4.5"/><circle cx="48" cy="48" r="4.5"/></g><path d="M32 32 L48 48 M48 32 L32 48" stroke="{3}" stroke-width="2.5"/>',
    ["#A88BD8", "#7C5FB5", "#FFFFFF"], ["Botão", "Furos", "Linha"], { tags: "botão costura" });

  /* ---------- Rabiscos e doodles ---------- */
  var RB = "Rabiscos e doodles";
  add(RB, "rb-espiral", "Rabisco espiral", "0 0 200 60", '<path d="M6 40 C20 10 36 10 34 30 C32 48 18 44 26 30 C36 12 56 12 56 32 C56 48 42 44 50 30 C60 12 80 12 80 32 C80 48 66 44 74 30 C84 12 104 12 104 32 C104 48 90 44 98 30 C108 12 128 12 128 32 C128 48 114 44 122 30 C132 12 152 12 152 32 C152 48 138 44 146 30 C156 12 176 14 194 24" fill="none" stroke="{1}" stroke-width="3" stroke-linecap="round"/>', ["#A88BD8"], ["Rabisco"], { tags: "rabisco doodle espiral mola" });
  add(RB, "rb-sublinhado", "Sublinhado à mão", "0 0 200 30", '<path d="M6 18 C50 10 120 8 194 12 M20 24 C80 18 140 18 186 20" fill="none" stroke="{1}" stroke-width="4" stroke-linecap="round"/>', ["#E88AA6"], ["Traço"], { stretch: 1, tags: "rabisco sublinhar destaque traço" });
  add(RB, "rb-circulo", "Círculo rabiscado", "0 0 200 120", '<path d="M150 18 C110 4 40 8 16 42 C-4 74 40 110 104 108 C170 106 196 74 186 46 C176 18 120 6 70 16" fill="none" stroke="{1}" stroke-width="3.5" stroke-linecap="round"/>', ["#E53950"], ["Traço"], { stretch: 1, tags: "rabisco círculo destaque marcar" });
  add(RB, "rb-seta", "Setinha desenhada", "0 0 160 80", '<path d="M8 64 C40 70 80 60 100 36 C110 24 104 10 94 16 C84 22 96 40 120 36 C134 34 144 26 150 18 M150 18 L134 18 M150 18 L148 34" fill="none" stroke="{1}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>', ["#333333"], ["Seta"], { tags: "seta rabisco doodle" });
  add(RB, "rb-estrelas", "Estrelinhas desenhadas", "0 0 120 100", star(42, 52, 30, 13, "{1}") + star(92, 22, 14, 6, "{2}") + star(98, 76, 10, 4.5, "{2}") + '<path d="M14 18 l6 6 M20 18 l-6 6" stroke="{2}" stroke-width="2.5" stroke-linecap="round"/>', ["#F5C518", "#E88AA6"], ["Estrela grande", "Estrelinhas"], { tags: "estrela doodle brilho" });
  add(RB, "rb-brilhos", "Brilhos", "0 0 100 100", sparkle(40, 56, 34, "{1}") + sparkle(78, 22, 16, "{2}") + sparkle(80, 80, 10, "{3}"), ["#E8C468", "#A88BD8", "#E88AA6"], ["Brilho grande", "Brilho médio", "Brilho pequeno"], { tags: "brilho estrela sparkle mágico" });
  add(RB, "rb-coracoes", "Coraçõezinhos", "0 0 120 100", heart(46, 56, 0.66, "{1}") + heart(96, 26, 0.3, "{2}") + heart(98, 78, 0.2, "{1}") + '<path d="M16 26 q-6 -10 4 -14 M24 20 q4 -10 12 -4" fill="none" stroke="{2}" stroke-width="2.5" stroke-linecap="round"/>', ["#E88AA6", "#E53950"], ["Coração grande", "Coração pequeno"], { tags: "coração doodle amor" });
  add(RB, "rb-nuvem", "Nuvenzinha", "0 0 140 90", '<path d="M36 78 C16 78 8 62 18 50 C10 34 28 20 44 28 C50 10 80 6 90 24 C108 14 130 26 124 46 C138 56 128 78 110 78Z" fill="{1}" stroke="{2}" stroke-width="3" stroke-linejoin="round"/><circle cx="56" cy="52" r="3" fill="{2}"/><circle cx="84" cy="52" r="3" fill="{2}"/><path d="M64 60 q6 6 12 0" fill="none" stroke="{2}" stroke-width="2.5" stroke-linecap="round"/><circle cx="48" cy="60" r="5" fill="{3}" opacity=".7"/><circle cx="92" cy="60" r="5" fill="{3}" opacity=".7"/>',
    ["#FFFFFF", "#6FA3D8", "#F9C6D3"], ["Nuvem", "Contorno", "Bochechas"], { tags: "nuvem fofa doodle" });
  add(RB, "rb-flor", "Florzinha desenhada", "0 0 80 120", '<path d="M40 50 C38 80 44 96 40 116" fill="none" stroke="{3}" stroke-width="3" stroke-linecap="round"/>' + leaf(40, 92, 22, -30, "{3}") + leaf(40, 100, 20, 200, "{3}") + flower(40, 36, 30, "{1}", "{2}", 6),
    ["#E88AA6", "#E8C468", "#7FB98A"], ["Pétalas", "Miolo", "Caule"], { tags: "flor doodle desenho" });
  add(RB, "rb-arcoiris", "Arco-íris fofo", "0 0 160 100", '<path d="M18 86 A62 62 0 0 1 142 86" fill="none" stroke="{1}" stroke-width="12"/><path d="M30 86 A50 50 0 0 1 130 86" fill="none" stroke="{2}" stroke-width="12"/><path d="M42 86 A38 38 0 0 1 118 86" fill="none" stroke="{3}" stroke-width="12"/><path d="M54 86 A26 26 0 0 1 106 86" fill="none" stroke="{4}" stroke-width="12"/>' +
    '<path d="M2 92 C2 78 22 74 28 84 C36 76 50 84 44 94Z M158 92 C158 78 138 74 132 84 C124 76 110 84 116 94Z" fill="#fff" stroke="#E0DCDA" stroke-width="2"/>',
    ["#F28CB1", "#F5C518", "#7FB98A", "#6FA3D8"], ["Faixa 1", "Faixa 2", "Faixa 3", "Faixa 4"], { tags: "arco-íris colorido doodle" });
  add(RB, "rb-pontinhos", "Respingos", "0 0 100 100", '<g fill="{1}"><circle cx="30" cy="30" r="9"/><circle cx="70" cy="60" r="12"/><circle cx="20" cy="74" r="5"/><circle cx="84" cy="22" r="4"/></g><g fill="{2}"><circle cx="54" cy="24" r="6"/><circle cx="44" cy="80" r="7"/><circle cx="88" cy="88" r="4"/><circle cx="12" cy="48" r="3"/></g>', ["#F9C6D3", "#DCCFF5"], ["Bolinhas 1", "Bolinhas 2"], { tags: "pontos bolinhas confete respingo" });

  /* ---------- Laços ---------- */
  var LC = "Laços";
  function bow(fill, knot, extra) {
    return '<path d="M60 40 C40 10 8 8 8 30 C8 52 40 56 60 40Z M60 40 C80 10 112 8 112 30 C112 52 80 56 60 40Z" fill="' + fill + '"/>' + (extra || "") +
      '<path d="M54 44 L34 92 L44 86 L50 96 L58 48Z M66 44 L86 92 L76 86 L70 96 L62 48Z" fill="' + fill + '"/><ellipse cx="60" cy="41" rx="10" ry="12" fill="' + knot + '"/>';
  }
  add(LC, "lc-fita", "Laço de fita", "0 0 120 100", bow("{1}", "{2}", '<path d="M56 36 C40 22 22 20 18 30 M64 36 C80 22 98 20 102 30" fill="none" stroke="#00000026" stroke-width="2.5" stroke-linecap="round"/>'), ["#E88AA6", "#C9607F"], ["Laço", "Nó"], { tags: "laço fita presente" });
  var bdots = '<g fill="{2}"><circle cx="24" cy="26" r="3.5"/><circle cx="38" cy="36" r="3.5"/><circle cx="22" cy="40" r="3"/><circle cx="96" cy="26" r="3.5"/><circle cx="82" cy="36" r="3.5"/><circle cx="98" cy="40" r="3"/><circle cx="44" cy="70" r="3"/><circle cx="76" cy="70" r="3"/></g>';
  add(LC, "lc-poa", "Laço de bolinhas", "0 0 120 100", '<defs><clipPath id="b"><path d="M60 40 C40 10 8 8 8 30 C8 52 40 56 60 40Z M60 40 C80 10 112 8 112 30 C112 52 80 56 60 40Z M54 44 L34 92 L44 86 L50 96 L58 48Z M66 44 L86 92 L76 86 L70 96 L62 48Z"/></clipPath></defs>' + bow("{1}", "{3}", "") + '<g clip-path="url(#b)">' + bdots + '</g><ellipse cx="60" cy="41" rx="10" ry="12" fill="{3}"/>',
    ["#E53950", "#FFFFFF", "#B5283B"], ["Laço", "Bolinhas", "Nó"], { tags: "laço bolinhas poá minnie" });
  add(LC, "lc-listrado", "Laço listrado", "0 0 120 100", '<defs><pattern id="s" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="{1}"/><rect width="4" height="10" fill="{2}"/></pattern></defs>' + bow("url(#s)", "{1}", ""),
    ["#A88BD8", "#FFFFFF"], ["Laço", "Listras"], { tags: "laço listras" });
  add(LC, "lc-longo", "Laço de pontas longas", "0 0 120 140", '<path d="M56 44 C40 80 20 100 14 136 L26 128 L34 138 C40 104 56 80 62 48Z M64 44 C80 80 100 100 106 136 L94 128 L86 138 C80 104 64 80 58 48Z" fill="{2}"/>' +
    '<path d="M60 40 C40 10 8 8 8 30 C8 52 40 56 60 40Z M60 40 C80 10 112 8 112 30 C112 52 80 56 60 40Z" fill="{1}"/><ellipse cx="60" cy="41" rx="10" ry="12" fill="{3}"/>',
    ["#6FA3D8", "#9EC3E6", "#3D6BE0"], ["Laço", "Pontas", "Nó"], { tags: "laço fita pontas" });
  add(LC, "lc-xadrez", "Laço xadrez", "0 0 120 100", '<defs><pattern id="x" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="{1}"/><rect width="6" height="12" fill="{2}" opacity=".5"/><rect width="12" height="6" fill="{2}" opacity=".5"/></pattern></defs>' + bow("url(#x)", "{3}", ""),
    ["#FFFFFF", "#E53950", "#B5283B"], ["Fundo", "Xadrez", "Nó"], { tags: "laço xadrez natal" });
  add(LC, "lc-perola", "Laço com pérola", "0 0 120 100", bow("{1}", "{1}", "") + '<circle cx="60" cy="41" r="9" fill="{2}"/><circle cx="57" cy="38" r="3" fill="#fff" opacity=".8"/>', ["#F3D1F4", "#FFFFFF"], ["Laço", "Pérola"], { tags: "laço pérola delicado" });
})();
