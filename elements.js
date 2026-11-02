/* Biblioteca de elementos SVG da Agenda Estrela.
   {1} = cor principal, {2} = cor 2. Cada item: id, nome, categoria, viewBox, svg (conteúdo), stretch (pode esticar), tags (busca) */
(function () {
  var L = [];
  function add(cat, id, name, vb, svg, o) {
    o = o || {};
    L.push({ id: id, name: name, cat: cat, vb: vb || "0 0 100 100", svg: svg, stretch: !!o.stretch, c2: o.c2 || "#A88BD8", c1: o.c1 || "#E88AA6", tags: (o.tags || "") });
  }
  function pts(n, cx, cy, r1, r2, rot) {
    var s = [], k = n * 2;
    for (var i = 0; i < k; i++) {
      var r = i % 2 ? r2 : r1, a = (rot || -90) * Math.PI / 180 + i * Math.PI / n;
      s.push((cx + r * Math.cos(a)).toFixed(2) + "," + (cy + r * Math.sin(a)).toFixed(2));
    }
    return s.join(" ");
  }
  function poly(n, cx, cy, r, rot) {
    var s = [];
    for (var i = 0; i < n; i++) { var a = ((rot || -90) + i * 360 / n) * Math.PI / 180; s.push((cx + r * Math.cos(a)).toFixed(2) + "," + (cy + r * Math.sin(a)).toFixed(2)); }
    return s.join(" ");
  }
  var HEART = "M50 88 C20 66 6 50 6 32 C6 18 17 8 30 8 C39 8 46 13 50 21 C54 13 61 8 70 8 C83 8 94 18 94 32 C94 50 80 66 50 88Z";
  function heartAt(x, y, s) { return '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" d="' + HEART + '"/>'; }
  var SPARK = "M50 2 C54 34 66 46 98 50 C66 54 54 66 50 98 C46 66 34 54 2 50 C34 46 46 34 50 2Z";
  function sparkAt(x, y, s) { return '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" d="' + SPARK + '"/>'; }

  /* ---------- Formas ---------- */
  var F = "Formas";
  add(F, "rect", "Retângulo", "0 0 100 70", '<rect x="1" y="1" width="98" height="68" fill="{1}"/>', { stretch: 1, tags: "quadrado caixa" });
  add(F, "rect-round", "Retângulo arredondado", "0 0 100 70", '<rect x="1" y="1" width="98" height="68" rx="12" fill="{1}"/>', { stretch: 1, tags: "caixa" });
  add(F, "rect-line", "Retângulo contorno", "0 0 100 70", '<rect x="3" y="3" width="94" height="64" rx="4" fill="none" stroke="{1}" stroke-width="3"/>', { stretch: 1, tags: "caixa borda" });
  add(F, "circle", "Círculo", "0 0 100 100", '<circle cx="50" cy="50" r="49" fill="{1}"/>', { stretch: 1, tags: "bola redondo oval" });
  add(F, "circle-line", "Círculo contorno", "0 0 100 100", '<circle cx="50" cy="50" r="46" fill="none" stroke="{1}" stroke-width="4"/>', { tags: "anel redondo" });
  add(F, "ring", "Anel duas cores", "0 0 100 100", '<circle cx="50" cy="50" r="48" fill="{1}"/><circle cx="50" cy="50" r="34" fill="{2}"/>', { c2: "#ffffff", tags: "circulo" });
  add(F, "triangle", "Triângulo", "0 0 100 90", '<polygon points="50,2 98,88 2,88" fill="{1}"/>', { stretch: 1 });
  add(F, "hexagon", "Hexágono", "0 0 100 100", '<polygon points="' + poly(6, 50, 50, 48, 0) + '" fill="{1}"/>');
  add(F, "pentagon", "Pentágono", "0 0 100 100", '<polygon points="' + poly(5, 50, 53, 48) + '" fill="{1}"/>');
  add(F, "diamond", "Losango", "0 0 100 100", '<polygon points="50,2 98,50 50,98 2,50" fill="{1}"/>', { stretch: 1, tags: "diamante" });
  add(F, "blob1", "Blob", "0 0 100 100", '<path fill="{1}" d="M70 10C86 18 96 36 92 56C88 76 70 92 48 92C26 92 8 78 8 56C8 34 18 16 36 9C48 4 60 5 70 10Z"/>', { tags: "mancha orgânica" });
  add(F, "blob2", "Blob ondulado", "0 0 100 100", '<path fill="{1}" d="M52 6C66 4 78 14 84 26C92 40 98 52 90 66C82 80 68 94 50 92C32 90 14 84 8 66C2 48 10 34 20 22C28 12 40 7 52 6Z"/><path fill="{2}" opacity=".5" d="M60 22C72 24 80 36 76 50C72 62 58 70 46 66C32 62 26 48 32 36C36 26 48 20 60 22Z"/>', { c2: "#ffffff", tags: "mancha" });
  add(F, "blob3", "Blob nuvem", "0 0 100 100", '<path fill="{1}" d="M30 14C42 2 62 6 68 18C82 14 96 28 90 44C100 56 92 76 76 78C72 94 50 98 40 86C24 94 6 82 10 66C0 56 4 36 18 32C16 24 22 18 30 14Z"/>', { tags: "mancha" });
  add(F, "arc", "Arco", "0 0 100 55", '<path d="M6 52 A44 44 0 0 1 94 52" fill="none" stroke="{1}" stroke-width="8" stroke-linecap="round"/>', { tags: "meia lua curva" });
  add(F, "semicircle", "Meio círculo", "0 0 100 52", '<path d="M2 50 A48 48 0 0 1 98 50Z" fill="{1}"/>', { stretch: 1 });
  add(F, "line", "Linha", "0 0 200 10", '<line x1="2" y1="5" x2="198" y2="5" stroke="{1}" stroke-width="3" stroke-linecap="round"/>', { stretch: 1, tags: "traço reta" });

  /* ---------- Corações ---------- */
  var C = "Corações";
  add(C, "heart", "Coração", "0 0 100 96", '<path fill="{1}" d="' + HEART + '"/>', { tags: "amor" });
  add(C, "heart-line", "Coração contorno", "0 0 100 96", '<path fill="none" stroke="{1}" stroke-width="5" stroke-linejoin="round" d="' + HEART + '"/>', { tags: "amor" });
  add(C, "heart-double", "Coração duplo", "0 0 100 96", '<path fill="{1}" d="' + HEART + '"/><path transform="translate(25 22) scale(.5)" fill="{2}" d="' + HEART + '"/>', { c2: "#ffffff", tags: "amor" });
  add(C, "heart-two", "Dois corações", "0 0 120 90", heartAt(0, 10, .7).replace("<path", '<path fill="{1}"') + heartAt(46, 0, .7).replace("<path", '<path fill="{2}"'), { tags: "amor casal" });
  add(C, "hearts-cluster", "Chuva de corações", "0 0 100 100", heartAt(4, 6, .38).replace("<path", '<path fill="{1}"') + heartAt(52, 2, .28).replace("<path", '<path fill="{2}"') + heartAt(40, 44, .5).replace("<path", '<path fill="{1}"') + heartAt(6, 62, .26).replace("<path", '<path fill="{2}"'), { tags: "amor" });
  add(C, "heart-stripe", "Coração listrado", "0 0 100 96", '<defs><clipPath id="hc"><path d="' + HEART + '"/></clipPath></defs><g clip-path="url(#hc)"><rect width="100" height="96" fill="{1}"/><g fill="{2}"><rect y="14" width="100" height="8"/><rect y="34" width="100" height="8"/><rect y="54" width="100" height="8"/><rect y="74" width="100" height="8"/></g></g>', { c2: "#ffffff", tags: "amor" });
  add(C, "heart-dots", "Coração de poá", "0 0 100 96", '<defs><clipPath id="hd"><path d="' + HEART + '"/></clipPath><pattern id="pd" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="3.5" fill="{2}"/></pattern></defs><g clip-path="url(#hd)"><rect width="100" height="96" fill="{1}"/><rect width="100" height="96" fill="url(#pd)"/></g>', { c2: "#ffffff", tags: "amor bolinhas" });
  add(C, "heart-sketch", "Coração rabiscado", "0 0 100 96", '<path fill="none" stroke="{1}" stroke-width="3.5" stroke-linecap="round" d="M50 86C22 64 8 50 8 33 8 19 18 10 30 10c9 0 16 5 20 13 4-8 11-13 20-13 13 0 22 10 22 23 0 17-13 31-42 53"/><path fill="none" stroke="{1}" stroke-width="2" stroke-linecap="round" d="M47 82C20 62 12 48 12 34 12 22 21 14 31 14c8 0 14 4 17 11"/>', { tags: "amor desenho" });
  add(C, "heart-wings", "Coração com asas", "0 0 140 80", '<path fill="{2}" d="M42 30C26 14 6 16 2 24c10 0 16 4 18 8-10-2-16 2-18 8 10-2 18 0 22 4-6 2-8 6-8 10 10-6 20-6 28-4Z"/><path fill="{2}" d="M98 30c16-16 36-14 40-6-10 0-16 4-18 8 10-2 16 2 18 8-10-2-18 0-22 4 6 2 8 6 8 10-10-6-20-6-28-4Z"/><path transform="translate(40 4) scale(.6)" fill="{1}" d="' + HEART + '"/>', { c2: "#C9A982", tags: "amor anjo" });
  add(C, "heart-arrow", "Coração com flecha", "0 0 120 100", '<path transform="translate(10 4) scale(.95)" fill="{1}" d="' + HEART + '"/><line x1="4" y1="88" x2="112" y2="14" stroke="{2}" stroke-width="4"/><polygon points="116,10 100,14 110,24" fill="{2}"/><path d="M4 88l-2-10M4 88l10 2" stroke="{2}" stroke-width="3"/>', { c2: "#C9A982", tags: "amor cupido" });

  /* ---------- Estrelas e brilhos ---------- */
  var E = "Estrelas e brilhos";
  add(E, "star", "Estrela", "0 0 100 96", '<polygon fill="{1}" points="' + pts(5, 50, 52, 48, 20) + '"/>');
  add(E, "star-line", "Estrela contorno", "0 0 100 96", '<polygon fill="none" stroke="{1}" stroke-width="4" stroke-linejoin="round" points="' + pts(5, 50, 52, 44, 19) + '"/>');
  add(E, "star-round", "Estrela fofinha", "0 0 100 96", '<polygon fill="{1}" stroke="{1}" stroke-width="10" stroke-linejoin="round" points="' + pts(5, 50, 52, 40, 19) + '"/>', { tags: "arredondada" });
  add(E, "star-two", "Estrela duas cores", "0 0 100 96", '<polygon fill="{1}" points="' + pts(5, 50, 52, 48, 20) + '"/><polygon fill="{2}" points="' + pts(5, 50, 52, 24, 10) + '"/>', { c2: "#ffffff" });
  add(E, "star6", "Estrela de 6 pontas", "0 0 100 100", '<polygon fill="{1}" points="' + pts(6, 50, 50, 48, 26) + '"/>');
  add(E, "starburst", "Explosão", "0 0 100 100", '<polygon fill="{1}" points="' + pts(16, 50, 50, 48, 38) + '"/>', { tags: "selo oferta" });
  add(E, "sparkle", "Brilho", "0 0 100 100", '<path fill="{1}" d="' + SPARK + '"/>', { tags: "brilho cintilante" });
  add(E, "sparkles", "Brilhos", "0 0 100 100", sparkAt(0, 18, .62).replace("<path", '<path fill="{1}"') + sparkAt(58, 2, .36).replace("<path", '<path fill="{2}"') + sparkAt(64, 62, .3).replace("<path", '<path fill="{1}"'), { c2: "#E8C468", tags: "brilho" });
  add(E, "shooting-star", "Estrela cadente", "0 0 140 80", '<path d="M10 70 Q50 60 86 34" fill="none" stroke="{2}" stroke-width="5" stroke-linecap="round"/><path d="M14 52 Q46 46 80 26" fill="none" stroke="{2}" stroke-width="3" stroke-linecap="round" opacity=".6"/><polygon fill="{1}" points="' + pts(5, 106, 30, 28, 12) + '"/>', { c2: "#E8C468", tags: "cometa" });
  add(E, "twinkle", "Pontinhos de brilho", "0 0 100 100", '<g fill="{1}"><circle cx="20" cy="22" r="5"/><circle cx="70" cy="16" r="3"/><circle cx="84" cy="56" r="6"/><circle cx="34" cy="70" r="3.5"/><circle cx="56" cy="88" r="4"/></g>' + sparkAt(38, 30, .3).replace("<path", '<path fill="{2}"'), { c2: "#E8C468", tags: "brilho confete" });
  add(E, "stars-row", "Fileira de estrelas", "0 0 200 40", [0, 1, 2, 3, 4].map(function (i) { return '<polygon fill="' + (i % 2 ? "{2}" : "{1}") + '" points="' + pts(5, 20 + i * 40, 21, 18, 8) + '"/>'; }).join(""), { c2: "#E8C468", tags: "avaliação" });

  /* ---------- Flores e folhas ---------- */
  var FL = "Flores e folhas";
  function petals(n, cx, cy, rx, ry, d, col) { var s = ""; for (var i = 0; i < n; i++) s += '<ellipse cx="' + cx + '" cy="' + (cy - d) + '" rx="' + rx + '" ry="' + ry + '" fill="' + col + '" transform="rotate(' + (i * 360 / n) + ' ' + cx + ' ' + cy + ')"/>'; return s; }
  add(FL, "flower", "Flor", "0 0 100 100", petals(5, 50, 50, 16, 22, 24, "{1}") + '<circle cx="50" cy="50" r="13" fill="{2}"/>', { c2: "#E8C468", tags: "florzinha" });
  add(FL, "daisy", "Margarida", "0 0 100 100", petals(12, 50, 50, 7, 20, 26, "{2}") + '<circle cx="50" cy="50" r="13" fill="{1}"/>', { c1: "#E8C468", c2: "#F5C3D3", tags: "flor" });
  add(FL, "flower-line", "Flor contorno", "0 0 100 100", '<g fill="none" stroke="{1}" stroke-width="3">' + petals(6, 50, 50, 12, 18, 22, "none").replace(/fill="none"/g, "") + '<circle cx="50" cy="50" r="9"/></g>', { tags: "flor" });
  add(FL, "tulip", "Tulipa", "0 0 80 120", '<path d="M40 60V116" stroke="{2}" stroke-width="5"/><path d="M40 100C28 86 16 84 8 86c6 12 18 18 32 16zM40 92c10-14 22-16 30-14-6 12-18 18-30 16z" fill="{2}"/><path fill="{1}" d="M14 18l14 12L40 8l12 22 14-12c4 26-2 46-26 46S10 44 14 18z"/>', { c2: "#7FB98A", tags: "flor" });
  add(FL, "rose", "Rosa", "0 0 100 120", '<path d="M50 62V116" stroke="{2}" stroke-width="5"/><path d="M50 96c-12-10-24-10-30-6 8 10 20 12 30 8z" fill="{2}"/><circle cx="50" cy="40" r="34" fill="{1}"/><path fill="none" stroke="#ffffff" stroke-width="3" opacity=".7" stroke-linecap="round" d="M50 40c6-2 6-10 0-10s-12 6-10 14 14 12 22 6 8-22-4-26-28 2-28 18"/>', { c2: "#7FB98A", tags: "flor" });
  add(FL, "sakura", "Flor de cerejeira", "0 0 100 100", (function () { var s = ""; for (var i = 0; i < 5; i++) s += '<path transform="rotate(' + i * 72 + ' 50 50)" fill="{1}" d="M50 50C36 40 34 18 44 8l6 6 6-6c10 10 8 32-6 42z"/>'; return s; })() + '<circle cx="50" cy="50" r="7" fill="{2}"/>', { c1: "#F2B6C8", c2: "#E88AA6", tags: "flor japonesa" });
  add(FL, "sunflower", "Girassol", "0 0 100 100", petals(14, 50, 50, 7, 16, 30, "{1}") + '<circle cx="50" cy="50" r="20" fill="{2}"/>', { c1: "#E8C468", c2: "#8a5a3c", tags: "flor" });
  add(FL, "leaf", "Folha", "0 0 100 100", '<path fill="{1}" d="M12 88C8 46 36 12 90 10c2 50-30 82-78 78z"/><path d="M12 88L70 30" stroke="#ffffff" stroke-width="3" opacity=".7"/>', { c1: "#7FB98A" });
  add(FL, "branch", "Galho com folhas", "0 0 140 60", '<path d="M4 50Q70 20 136 30" fill="none" stroke="{1}" stroke-width="3"/>' + [20, 44, 68, 92, 116].map(function (x, i) { var y = 50 - x * 0.16; return '<ellipse cx="' + x + '" cy="' + (y + (i % 2 ? 10 : -10)) + '" rx="10" ry="5" fill="{1}" transform="rotate(' + (i % 2 ? 30 : -30) + ' ' + x + ' ' + y + ')"/>'; }).join(""), { c1: "#7FB98A", tags: "ramo folha" });
  add(FL, "sprig", "Raminho", "0 0 60 120", '<path d="M30 118V10" stroke="{1}" stroke-width="3"/>' + [20, 40, 60, 80].map(function (y) { return '<ellipse cx="18" cy="' + y + '" rx="12" ry="6" fill="{1}" transform="rotate(-35 30 ' + (y + 6) + ')"/><ellipse cx="42" cy="' + y + '" rx="12" ry="6" fill="{1}" transform="rotate(35 30 ' + (y + 6) + ')"/>'; }).join("") + '<ellipse cx="30" cy="8" rx="5" ry="9" fill="{1}"/>', { c1: "#7FB98A", tags: "ramo folha lavanda" });
  add(FL, "monstera", "Folha costela-de-adão", "0 0 100 100", '<path fill="{1}" d="M50 96C20 90 6 66 8 40 10 18 30 4 52 6c24 2 42 20 40 46-2 24-18 42-42 44z"/><g stroke="#ffffff" stroke-width="5" stroke-linecap="round"><path d="M50 94V40"/><path d="M14 40l20 6M10 62l22 0M16 80l18-8M88 40l-20 6M90 60l-22 2M82 80l-16-8"/></g>', { c1: "#5f9e6e", tags: "folha planta" });
  add(FL, "cactus", "Cacto", "0 0 80 110", '<path fill="{1}" d="M32 100V20a8 8 0 0 1 16 0v80zM32 64H20a8 8 0 0 1-8-8V36a5 5 0 0 1 10 0v18h10zM48 54h10V30a5 5 0 0 1 10 0v24a8 8 0 0 1-8 8H48z"/><path fill="{2}" d="M18 96h44l-6 14H24z"/>', { c1: "#7FB98A", c2: "#E8946A", tags: "planta" });
  add(FL, "wreath", "Guirlanda", "0 0 100 100", '<circle cx="50" cy="50" r="36" fill="none" stroke="{1}" stroke-width="3"/>' + (function () { var s = ""; for (var i = 0; i < 16; i++) { var a = i * 22.5; s += '<ellipse cx="50" cy="14" rx="4" ry="8" fill="{1}" transform="rotate(' + a + ' 50 50) rotate(40 50 14)"/>'; } return s; })() + '<circle cx="50" cy="86" r="5" fill="{2}"/><circle cx="14" cy="50" r="4" fill="{2}"/><circle cx="86" cy="50" r="4" fill="{2}"/>', { c1: "#7FB98A", c2: "#E88AA6", tags: "coroa folhas moldura" });

  /* ---------- Nuvens, sol, lua, arco-íris ---------- */
  var N = "Nuvens, sol e lua";
  var CLOUD = "M24 76C10 76 2 66 2 56s8-20 20-20c2-16 14-28 30-28 14 0 26 10 30 24 10 0 16 8 16 18 0 14-10 26-24 26z";
  add(N, "cloud", "Nuvem", "0 0 100 84", '<path fill="{1}" d="' + CLOUD + '"/>', { c1: "#9EC3E6", tags: "nuvem tempo" });
  add(N, "cloud-line", "Nuvem contorno", "0 0 100 84", '<path fill="none" stroke="{1}" stroke-width="4" stroke-linejoin="round" d="' + CLOUD + '"/>', { c1: "#6FA3D8", tags: "nuvem" });
  add(N, "cloud-rain", "Chuva", "0 0 100 110", '<path fill="{1}" d="' + CLOUD + '"/><g stroke="{2}" stroke-width="4" stroke-linecap="round"><path d="M30 86l-4 14M50 86l-4 14M70 86l-4 14"/></g>', { c1: "#9EC3E6", c2: "#6FA3D8", tags: "nuvem tempo" });
  add(N, "sun", "Sol", "0 0 100 100", '<g stroke="{1}" stroke-width="6" stroke-linecap="round">' + (function () { var s = ""; for (var i = 0; i < 12; i++) s += '<line x1="50" y1="4" x2="50" y2="16" transform="rotate(' + i * 30 + ' 50 50)"/>'; return s; })() + '</g><circle cx="50" cy="50" r="24" fill="{1}"/>', { c1: "#E8C468", tags: "sol verão dia" });
  add(N, "sun-cloud", "Sol com nuvem", "0 0 110 90", '<g stroke="{1}" stroke-width="5" stroke-linecap="round">' + (function () { var s = ""; for (var i = 0; i < 9; i++) s += '<line x1="66" y1="2" x2="66" y2="10" transform="rotate(' + (i * 40 - 80) + ' 66 32)"/>'; return s; })() + '</g><circle cx="66" cy="32" r="17" fill="{1}"/><path transform="translate(0 20) scale(.75)" fill="{2}" d="' + CLOUD + '"/>', { c1: "#E8C468", c2: "#9EC3E6", tags: "tempo" });
  add(N, "moon", "Lua", "0 0 100 100", '<path fill="{1}" d="M62 6A46 46 0 1 0 94 70 38 38 0 1 1 62 6z"/>', { c1: "#E8C468", tags: "lua noite" });
  add(N, "moon-stars", "Lua e estrelas", "0 0 100 100", '<path fill="{1}" d="M54 12A40 40 0 1 0 84 74 32 32 0 1 1 54 12z"/><polygon fill="{2}" points="' + pts(5, 78, 22, 12, 5) + '"/><polygon fill="{2}" points="' + pts(5, 88, 48, 7, 3) + '"/>', { c1: "#A88BD8", c2: "#E8C468", tags: "noite" });
  add(N, "rainbow", "Arco-íris", "0 0 120 66", '<g fill="none" stroke-width="9"><path d="M8 64A52 52 0 0 1 112 64" stroke="{1}"/><path d="M18 64A42 42 0 0 1 102 64" stroke="#E8C468"/><path d="M28 64A32 32 0 0 1 92 64" stroke="#7FB98A"/><path d="M38 64A22 22 0 0 1 82 64" stroke="{2}"/></g>', { c2: "#6FA3D8", tags: "arco iris" });
  add(N, "rainbow-cloud", "Arco-íris com nuvens", "0 0 130 80", '<g fill="none" stroke-width="10"><path d="M20 66A45 45 0 0 1 110 66" stroke="{1}"/><path d="M31 66A34 34 0 0 1 99 66" stroke="{2}"/><path d="M42 66A23 23 0 0 1 88 66" stroke="#E8C468"/></g><path transform="translate(0 48) scale(.4)" fill="#ffffff" stroke="#d9e6f2" stroke-width="3" d="' + CLOUD + '"/><path transform="translate(88 48) scale(.4)" fill="#ffffff" stroke="#d9e6f2" stroke-width="3" d="' + CLOUD + '"/>', { c2: "#A88BD8", tags: "arco iris" });
  add(N, "drop", "Gota", "0 0 70 100", '<path fill="{1}" d="M35 4C50 30 66 46 66 64a31 31 0 0 1-62 0C4 46 20 30 35 4z"/><path d="M20 62a15 15 0 0 0 12 18" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>', { c1: "#6FA3D8", tags: "água chuva" });
  add(N, "umbrella", "Guarda-chuva", "0 0 100 100", '<path fill="{1}" d="M50 8C24 8 4 26 4 50c6-6 14-6 18 0 4-6 12-6 16 0 4-6 8-6 12-6s8 0 12 6c4-6 12-6 16 0 4-6 12-6 18 0C96 26 76 8 50 8z"/><path d="M50 44v40a8 8 0 0 1-16 0" fill="none" stroke="{2}" stroke-width="5" stroke-linecap="round"/>', { c2: "#555555", tags: "chuva" });
  add(N, "snowflake", "Floco de neve", "0 0 100 100", '<g stroke="{1}" stroke-width="5" stroke-linecap="round">' + [0, 60, 120].map(function (a) { return '<g transform="rotate(' + a + ' 50 50)"><line x1="50" y1="4" x2="50" y2="96"/><path d="M40 14l10 10 10-10M40 86l10-10 10 10" fill="none"/></g>'; }).join("") + "</g>", { c1: "#6FA3D8", tags: "neve inverno frio" });

  /* ---------- Laços e fitas ---------- */
  var LA = "Laços e fitas";
  add(LA, "bow", "Laço", "0 0 120 80", '<path fill="{1}" d="M60 38C40 14 14 6 8 14s-2 46 6 52 32-6 46-24zM60 38c20-24 46-32 52-24s2 46-6 52-32-6-46-24z"/><path fill="{1}" d="M54 44l-14 34 12-4 6 6 2-34zM66 44l14 34-12-4-6 6-2-34z"/><ellipse cx="60" cy="40" rx="10" ry="12" fill="{2}"/>', { c2: "#C9607F", tags: "laço fita" });
  add(LA, "bow-line", "Laço contorno", "0 0 120 80", '<g fill="none" stroke="{1}" stroke-width="3.5" stroke-linejoin="round"><path d="M60 38C40 14 14 6 8 14s-2 46 6 52 32-6 46-24zM60 38c20-24 46-32 52-24s2 46-6 52-32-6-46-24z"/><path d="M54 46l-12 30 10-4 6 6M66 46l12 30-10-4-6 6"/><ellipse cx="60" cy="40" rx="8" ry="10"/></g>', { tags: "laço" });
  add(LA, "bow-dots", "Laço de poá", "0 0 120 80", '<defs><pattern id="bp" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="2.5" fill="{2}"/></pattern></defs><path id="bwp" fill="{1}" d="M60 38C40 14 14 6 8 14s-2 46 6 52 32-6 46-24zM60 38c20-24 46-32 52-24s2 46-6 52-32-6-46-24z"/><path fill="url(#bp)" d="M60 38C40 14 14 6 8 14s-2 46 6 52 32-6 46-24zM60 38c20-24 46-32 52-24s2 46-6 52-32-6-46-24z"/><ellipse cx="60" cy="40" rx="10" ry="12" fill="{1}" stroke="{2}" stroke-width="2"/>', { c2: "#ffffff", tags: "laço bolinhas" });
  add(LA, "ribbon-banner", "Faixa", "0 0 200 60", '<path fill="{2}" d="M0 18h30v34H0l10-17zM200 18h-30v34h30l-10-17z"/><path fill="{1}" d="M20 6h160v40H20z"/><path fill="{2}" opacity=".6" d="M20 46l10 8V46zM180 46l-10 8V46z"/>', { stretch: 1, c2: "#C9607F", tags: "faixa título banner" });
  add(LA, "ribbon-award", "Roseta", "0 0 80 110", '<path fill="{2}" d="M24 60L10 106l16-8 10 12 8-46zM56 60l14 46-16-8-10 12-8-46z"/><polygon fill="{1}" points="' + pts(14, 40, 40, 38, 32) + '"/><circle cx="40" cy="40" r="24" fill="#ffffff" opacity=".5"/>', { c2: "#A88BD8", tags: "prêmio medalha selo" });
  add(LA, "ribbon-scroll", "Pergaminho", "0 0 200 70", '<path fill="{2}" d="M14 10a10 10 0 0 0 0 20h12V10zM186 40a10 10 0 0 1 0 20h-12V40z"/><path fill="{1}" d="M14 10h162a10 10 0 0 1 10 10v30H24a10 10 0 0 0-10 10z"/>', { stretch: 1, c2: "#C9A982", tags: "faixa título" });
  add(LA, "ribbon-curly", "Fita enrolada", "0 0 200 60", '<path d="M4 30C24 4 40 56 60 30S96 4 116 30s36 26 56 0 22-10 24 0" fill="none" stroke="{1}" stroke-width="6" stroke-linecap="round"/>', { stretch: 1, tags: "fita" });
  add(LA, "ribbon-corner", "Fita de canto", "0 0 100 100", '<path fill="{1}" d="M40 0h26L0 66V40z"/><path fill="{2}" d="M68 0h14L0 82V68z"/>', { c2: "#A88BD8", tags: "canto" });

  /* ---------- Washi tapes ---------- */
  var W = "Washi tapes";
  var TORN = "M6 0h188l-4 6 6 6-6 6 6 6-6 6 6 6-6 6 6 6-2 2H6l4-6-6-6 6-6-6-6 6-6-6-6 6-6-6-6z";
  function tape(id, name, fill, defs, o) {
    add(W, id, name, "0 0 200 50", '<defs><clipPath id="tc' + id + '"><path d="' + TORN + '"/></clipPath>' + (defs || "") + '</defs><g clip-path="url(#tc' + id + ')" opacity=".92"><rect width="200" height="50" fill="{1}"/>' + fill + "</g>", Object.assign({ stretch: 1, tags: "fita adesiva washi" }, o || {}));
  }
  tape("washi-solid", "Washi lisa", "");
  tape("washi-stripe", "Washi listrada", '<rect width="200" height="50" fill="url(#ps)"/>', '<pattern id="ps" width="14" height="50" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><rect width="6" height="50" fill="{2}"/></pattern>', { c2: "#ffffff" });
  tape("washi-dots", "Washi poá", '<rect width="200" height="50" fill="url(#pp)"/>', '<pattern id="pp" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2.6" fill="{2}"/><circle cx="11" cy="11" r="2.6" fill="{2}"/></pattern>', { c2: "#ffffff" });
  tape("washi-plaid", "Washi xadrez", '<rect width="200" height="50" fill="url(#px)"/>', '<pattern id="px" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="8" height="20" fill="{2}" opacity=".45"/><rect width="20" height="8" fill="{2}" opacity=".45"/><rect x="13" width="2" height="20" fill="#fff" opacity=".6"/><rect y="13" width="20" height="2" fill="#fff" opacity=".6"/></pattern>', { c2: "#A88BD8" });
  tape("washi-zigzag", "Washi zigue-zague", '<path d="M0 25' + (function () { var s = ""; for (var x = 0; x <= 200; x += 10) s += "L" + x + " " + (x % 20 ? 15 : 35); return s; })() + '" fill="none" stroke="{2}" stroke-width="4"/>', "", { c2: "#ffffff" });
  tape("washi-hearts", "Washi corações", [10, 50, 90, 130, 170].map(function (x) { return heartAt(x, 15, .2).replace("<path", '<path fill="{2}"'); }).join(""), "", { c2: "#ffffff" });
  tape("washi-stars", "Washi estrelas", [16, 56, 96, 136, 176].map(function (x, i) { return '<polygon fill="{2}" points="' + pts(5, x, i % 2 ? 18 : 30, 8, 3.5) + '"/>'; }).join(""), "", { c2: "#E8C468" });
  tape("washi-grid", "Washi quadriculada", '<rect width="200" height="50" fill="url(#pg)"/>', '<pattern id="pg" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="{2}" stroke-width="1"/></pattern>', { c2: "#ffffff" });

  /* ---------- Molduras e bordas ---------- */
  var M = "Molduras e bordas";
  add(M, "frame", "Moldura simples", "0 0 100 140", '<rect x="3" y="3" width="94" height="134" fill="none" stroke="{1}" stroke-width="3"/>', { stretch: 1, tags: "borda quadro" });
  add(M, "frame-double", "Moldura dupla", "0 0 100 140", '<rect x="2" y="2" width="96" height="136" fill="none" stroke="{1}" stroke-width="2.5"/><rect x="8" y="8" width="84" height="124" fill="none" stroke="{1}" stroke-width="1"/>', { stretch: 1, tags: "borda" });
  add(M, "frame-round", "Moldura arredondada", "0 0 100 140", '<rect x="3" y="3" width="94" height="134" rx="12" fill="none" stroke="{1}" stroke-width="3"/>', { stretch: 1, tags: "borda" });
  add(M, "frame-dashed", "Moldura tracejada", "0 0 100 140", '<rect x="3" y="3" width="94" height="134" rx="6" fill="none" stroke="{1}" stroke-width="2.5" stroke-dasharray="6 4"/>', { stretch: 1, tags: "borda pontilhada recorte" });
  add(M, "frame-scallop", "Moldura ondulada", "0 0 100 100", '<path fill="{1}" d="' + (function () { var s = "", n = 24; for (var i = 0; i <= n; i++) { var a = i / n * Math.PI * 2, r = i % 2 ? 44 : 49; s += (i ? "L" : "M") + (50 + r * Math.cos(a)).toFixed(1) + " " + (50 + r * Math.sin(a)).toFixed(1); } return s + "Z"; })() + '"/><circle cx="50" cy="50" r="36" fill="{2}"/>', { c2: "#ffffff", tags: "selo etiqueta redonda" });
  add(M, "frame-circle", "Moldura redonda", "0 0 100 100", '<circle cx="50" cy="50" r="46" fill="none" stroke="{1}" stroke-width="3"/><circle cx="50" cy="50" r="41" fill="none" stroke="{1}" stroke-width="1" stroke-dasharray="3 3"/>', { tags: "borda círculo" });
  add(M, "frame-polaroid", "Polaroid", "0 0 100 120", '<rect x="2" y="2" width="96" height="116" rx="3" fill="#ffffff" stroke="{1}" stroke-width="2"/><rect x="10" y="10" width="80" height="78" fill="{2}" opacity=".35"/>', { c1: "#cccccc", tags: "foto" });
  add(M, "frame-stamp", "Selo picotado", "0 0 100 120", '<rect x="0" y="0" width="100" height="120" fill="{1}"/><g fill="#ffffff">' + (function () { var s = ""; for (var x = 5; x < 100; x += 10) s += '<circle cx="' + x + '" cy="0" r="3.5"/><circle cx="' + x + '" cy="120" r="3.5"/>'; for (var y = 5; y < 120; y += 10) s += '<circle cx="0" cy="' + y + '" r="3.5"/><circle cx="100" cy="' + y + '" r="3.5"/>'; return s; })() + '</g><rect x="10" y="10" width="80" height="100" fill="{2}"/>', { c2: "#ffffff", tags: "carimbo" });
  add(M, "frame-corners", "Cantoneiras", "0 0 100 140", '<g fill="none" stroke="{1}" stroke-width="3" stroke-linecap="round"><path d="M4 26V4h22M74 4h22v22M96 114v22H74M26 136H4v-22"/></g><g fill="{1}"><circle cx="4" cy="4" r="3"/><circle cx="96" cy="4" r="3"/><circle cx="96" cy="136" r="3"/><circle cx="4" cy="136" r="3"/></g>', { stretch: 1, tags: "canto borda" });
  add(M, "frame-ornament", "Canto floral", "0 0 100 100", '<path fill="none" stroke="{1}" stroke-width="2.5" stroke-linecap="round" d="M4 96V30C4 14 14 4 30 4h66M14 86V36c0-12 10-22 22-22h50"/><path fill="{1}" d="M30 30c-8-14 4-22 12-16-2 10-6 14-12 16zM30 30c14-8 22 4 16 12-10-2-14-6-16-12z"/><circle cx="30" cy="30" r="4" fill="{2}"/>', { c2: "#E8C468", tags: "canto ornamento" });
  add(M, "frame-hearts", "Moldura de corações", "0 0 100 140", '<rect x="6" y="6" width="88" height="128" fill="none" stroke="{1}" stroke-width="1.5"/>' + [[0, 0], [86, 0], [0, 126], [86, 126]].map(function (p) { return heartAt(p[0], p[1], .15).replace("<path", '<path fill="{1}"'); }).join(""), { stretch: 1, tags: "borda amor" });
  add(M, "label-box", "Caixa de título", "0 0 160 50", '<rect x="2" y="2" width="156" height="46" rx="23" fill="{1}"/><rect x="7" y="7" width="146" height="36" rx="18" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="4 3"/>', { stretch: 1, tags: "etiqueta título faixa" });

  /* ---------- Divisores ---------- */
  var D = "Divisores";
  add(D, "div-wave", "Linha ondulada", "0 0 200 20", '<path d="M2 10' + (function () { var s = ""; for (var x = 2; x < 198; x += 16) s += "q4-8 8 0t8 0"; return s; })() + '" fill="none" stroke="{1}" stroke-width="2.5" stroke-linecap="round"/>', { stretch: 1, tags: "onda" });
  add(D, "div-dots", "Linha de bolinhas", "0 0 200 10", '<line x1="4" y1="5" x2="196" y2="5" stroke="{1}" stroke-width="4" stroke-linecap="round" stroke-dasharray="0 10"/>', { stretch: 1, tags: "pontilhada" });
  add(D, "div-dash", "Linha tracejada", "0 0 200 10", '<line x1="2" y1="5" x2="198" y2="5" stroke="{1}" stroke-width="2.5" stroke-dasharray="10 6"/>', { stretch: 1, tags: "recorte" });
  add(D, "div-double", "Linha dupla", "0 0 200 12", '<line x1="0" y1="3" x2="200" y2="3" stroke="{1}" stroke-width="2"/><line x1="0" y1="9" x2="200" y2="9" stroke="{1}" stroke-width="1"/>', { stretch: 1 });
  add(D, "div-heart", "Linha com coração", "0 0 200 24", '<line x1="2" y1="12" x2="84" y2="12" stroke="{1}" stroke-width="2"/><line x1="116" y1="12" x2="198" y2="12" stroke="{1}" stroke-width="2"/>' + heartAt(89, 1, .23).replace("<path", '<path fill="{2}"'), { stretch: 1, tags: "amor" });
  add(D, "div-star", "Linha com estrela", "0 0 200 24", '<line x1="2" y1="12" x2="84" y2="12" stroke="{1}" stroke-width="2"/><line x1="116" y1="12" x2="198" y2="12" stroke="{1}" stroke-width="2"/><polygon fill="{2}" points="' + pts(5, 100, 13, 11, 4.5) + '"/>', { stretch: 1, c2: "#E8C468" });
  add(D, "div-zigzag", "Zigue-zague", "0 0 200 16", '<polyline fill="none" stroke="{1}" stroke-width="2.5" stroke-linejoin="round" points="' + (function () { var s = []; for (var x = 0; x <= 200; x += 10) s.push(x + "," + (x % 20 ? 3 : 13)); return s.join(" "); })() + '"/>', { stretch: 1 });
  add(D, "div-scallop", "Babado", "0 0 200 16", '<path fill="{1}" d="M0 0H200V6' + (function () { var s = ""; for (var x = 200; x > 0; x -= 10) s += "A5 5 0 0 1 " + (x - 10) + " 6"; return s; })() + 'Z"/>', { stretch: 1, tags: "renda borda" });
  add(D, "div-flourish", "Arabesco", "0 0 200 40", '<path fill="none" stroke="{1}" stroke-width="2.5" stroke-linecap="round" d="M4 20H70c10 0 14-12 6-14s-10 8-2 10M196 20H130c-10 0-14-12-6-14s10 8 2 10M70 20c10 0 14 12 6 14s-10-8-2-10M130 20c-10 0-14 12-6 14s10-8 2-10"/><path fill="{2}" d="M100 8l6 12-6 12-6-12z"/>', { stretch: 1, c2: "#E88AA6", c1: "#A88BD8", tags: "ornamento elegante" });
  add(D, "div-leaves", "Linha de folhinhas", "0 0 200 24", '<line x1="2" y1="12" x2="198" y2="12" stroke="{1}" stroke-width="1.5"/>' + (function () { var s = ""; for (var x = 14; x < 200; x += 24) s += '<ellipse cx="' + x + '" cy="7" rx="6" ry="3" fill="{1}" transform="rotate(-25 ' + x + ' 12)"/><ellipse cx="' + (x + 8) + '" cy="17" rx="6" ry="3" fill="{1}" transform="rotate(25 ' + (x + 8) + ' 12)"/>'; return s; })(), { stretch: 1, c1: "#7FB98A", tags: "folha" });
  add(D, "div-dots-big", "Bolinhas coloridas", "0 0 200 14", (function () { var s = ""; for (var x = 7, i = 0; x < 200; x += 16, i++) s += '<circle cx="' + x + '" cy="7" r="5" fill="' + (i % 2 ? "{2}" : "{1}") + '"/>'; return s; })(), { stretch: 1, tags: "confete" });

  /* ---------- Setas ---------- */
  var S = "Setas";
  add(S, "arrow", "Seta", "0 0 120 50", '<path fill="{1}" d="M2 18h80V4l36 21-36 21V32H2z"/>', { stretch: 1, tags: "direita" });
  add(S, "arrow-line", "Seta fina", "0 0 120 30", '<path d="M4 15h108M96 4l14 11-14 11" fill="none" stroke="{1}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>', { stretch: 1 });
  add(S, "arrow-curve", "Seta curva", "0 0 100 80", '<path d="M8 70C14 30 44 12 84 18" fill="none" stroke="{1}" stroke-width="4" stroke-linecap="round"/><path d="M70 6l16 12-14 14" fill="none" stroke="{1}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>');
  add(S, "arrow-loop", "Seta com laço", "0 0 140 70", '<path d="M6 54C30 60 50 50 56 34c6-18-14-26-20-12s12 30 40 30 40-12 52-22" fill="none" stroke="{1}" stroke-width="3.5" stroke-linecap="round"/><path d="M114 18l16 12-18 8" fill="none" stroke="{1}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>', { tags: "rabisco" });
  add(S, "arrow-double", "Seta dupla", "0 0 120 40", '<path fill="{1}" d="M2 20L26 2v12h68V2l24 18-24 18V26H26v12z"/>', { stretch: 1 });
  add(S, "chevron", "Chevron", "0 0 60 80", '<path d="M10 6l36 34-36 34" fill="none" stroke="{1}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>', { tags: "seta" });
  add(S, "arrow-circle", "Seta circular", "0 0 100 100", '<path d="M82 34A36 36 0 1 0 86 58" fill="none" stroke="{1}" stroke-width="6" stroke-linecap="round"/><path fill="{1}" d="M70 26l20 4-4 20z"/>', { tags: "repetir girar" });
  add(S, "arrow-down", "Seta para baixo", "0 0 60 100", '<path fill="{1}" d="M18 2h24v58h16L30 98 2 60h16z"/>');
  add(S, "pointer", "Mãozinha", "0 0 110 60", '<path fill="{1}" d="M2 26h58l-6-10c-2-6 6-10 10-6l18 18c6 6 6 16 0 22-6 6-14 8-22 8H40c-6 0-8-8-2-10-6 0-8-8-2-10-6 0-8-8-2-10H2z"/>', { tags: "apontar dedo" });

  /* ---------- Balões e etiquetas ---------- */
  var B = "Balões e etiquetas";
  add(B, "bubble", "Balão de fala", "0 0 120 100", '<path fill="{1}" d="M60 4C30 4 4 22 4 44c0 14 10 26 26 33l-6 19 22-14c4 1 9 1 14 1 30 0 56-17 56-39S90 4 60 4z"/>', { tags: "fala conversa" });
  add(B, "bubble-line", "Balão contorno", "0 0 120 100", '<path fill="#ffffff" stroke="{1}" stroke-width="3.5" stroke-linejoin="round" d="M60 6C31 6 6 23 6 44c0 14 10 25 25 32l-6 18 21-13c4 1 9 1 14 1 29 0 54-17 54-38S89 6 60 6z"/>', { tags: "fala" });
  add(B, "bubble-rect", "Balão retangular", "0 0 120 90", '<path fill="{1}" d="M12 4h96a8 8 0 0 1 8 8v48a8 8 0 0 1-8 8H44L24 86l4-18H12a8 8 0 0 1-8-8V12a8 8 0 0 1 8-8z"/>', { tags: "fala mensagem" });
  add(B, "bubble-think", "Balão de pensamento", "0 0 120 100", '<path fill="{1}" d="M30 14c10-12 30-12 38-2 12-8 32-2 34 12 14 4 18 24 6 32 4 14-12 24-26 18-8 10-30 10-38 0-14 4-30-6-26-20C6 48 8 30 20 26c0-6 4-10 10-12z"/><circle cx="22" cy="80" r="7" fill="{1}"/><circle cx="10" cy="94" r="4" fill="{1}"/>', { tags: "pensar ideia" });
  add(B, "tag", "Etiqueta", "0 0 120 60", '<path fill="{1}" d="M30 2h84a4 4 0 0 1 4 4v48a4 4 0 0 1-4 4H30L2 30z"/><circle cx="24" cy="30" r="6" fill="#ffffff"/>', { stretch: 1, tags: "tag preço" });
  add(B, "tag-round", "Tag arredondada", "0 0 70 110", '<path fill="{1}" d="M8 30L35 4l27 26v70a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6z"/><circle cx="35" cy="26" r="6" fill="#ffffff"/><path d="M35 20C30 8 20 2 12 4" fill="none" stroke="{2}" stroke-width="2"/>', { c2: "#C9A982", tags: "tag presente" });
  add(B, "label-notch", "Etiqueta recortada", "0 0 160 50", '<path fill="{1}" d="M0 0h160l-12 25 12 25H0l12-25z"/>', { stretch: 1, tags: "faixa título" });
  add(B, "sticky", "Post-it", "0 0 100 100", '<path fill="{1}" d="M4 4h92v70L74 96H4z"/><path fill="#000" opacity=".12" d="M96 74H74v22z"/>', { c1: "#F5DE8A", tags: "bilhete lembrete nota" });
  add(B, "sticky-tape", "Bilhete com fita", "0 0 100 110", '<rect x="6" y="14" width="88" height="92" fill="{1}" transform="rotate(-2 50 60)"/><rect x="34" y="4" width="34" height="16" fill="{2}" opacity=".8" transform="rotate(4 50 12)"/>', { c1: "#FCE4EC", c2: "#A88BD8", tags: "nota post-it" });
  add(B, "badge", "Selo redondo", "0 0 100 100", '<circle cx="50" cy="50" r="48" fill="{1}"/><circle cx="50" cy="50" r="40" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="4 3"/>', { tags: "círculo carimbo" });
  add(B, "bookmark", "Marcador de página", "0 0 60 110", '<path fill="{1}" d="M4 2h52v104L30 84 4 106z"/>', { tags: "favorito" });
  add(B, "index-tab", "Aba de divisória", "0 0 120 40", '<path fill="{1}" d="M0 40L14 4a6 6 0 0 1 6-4h80a6 6 0 0 1 6 4l14 36z"/>', { stretch: 1, tags: "aba" });

  /* ---------- Bandeirinhas ---------- */
  var BA = "Bandeirinhas";
  add(BA, "bunting", "Varal de bandeirinhas", "0 0 200 60", '<path d="M0 6Q100 24 200 6" fill="none" stroke="#999" stroke-width="1.5"/>' + [0, 1, 2, 3, 4, 5, 6].map(function (i) { var x = 6 + i * 27, y = 6 + Math.sin((i + .5) / 7 * Math.PI) * 9; return '<polygon fill="' + (i % 2 ? "{2}" : "{1}") + '" points="' + x + "," + y + " " + (x + 22) + "," + y + " " + (x + 11) + "," + (y + 34) + '"/>'; }).join(""), { stretch: 1, tags: "festa junina varal" });
  add(BA, "bunting-round", "Bandeirinhas arredondadas", "0 0 200 60", '<path d="M0 6Q100 24 200 6" fill="none" stroke="#999" stroke-width="1.5"/>' + [0, 1, 2, 3, 4, 5, 6].map(function (i) { var x = 6 + i * 27, y = 6 + Math.sin((i + .5) / 7 * Math.PI) * 9; return '<path fill="' + (i % 2 ? "{2}" : "{1}") + '" d="M' + x + " " + y + "h22v18a11 11 0 0 1-22 0z" + '"/>'; }).join(""), { stretch: 1, tags: "festa varal" });
  add(BA, "bunting-colors", "Bandeirinhas coloridas", "0 0 200 60", '<path d="M0 6Q100 24 200 6" fill="none" stroke="#999" stroke-width="1.5"/>' + ["{1}", "#E8C468", "#7FB98A", "#6FA3D8", "{2}", "#E8946A", "{1}"].map(function (c, i) { var x = 6 + i * 27, y = 6 + Math.sin((i + .5) / 7 * Math.PI) * 9; return '<polygon fill="' + c + '" points="' + x + "," + y + " " + (x + 22) + "," + y + " " + (x + 11) + "," + (y + 34) + '"/>'; }).join(""), { stretch: 1, tags: "festa arco-íris" });
  add(BA, "flag", "Bandeira", "0 0 80 100", '<rect x="6" y="4" width="5" height="94" rx="2" fill="#888"/><path fill="{1}" d="M11 8c20-8 30 8 60 0v40c-30 8-40-8-60 0z"/>', { tags: "meta objetivo" });
  add(BA, "pennant", "Flâmula", "0 0 120 60", '<path fill="{1}" d="M4 4l112 26L4 56z"/><rect x="0" y="0" width="6" height="60" fill="{2}"/>', { stretch: 1, c2: "#888888", tags: "bandeira" });
  add(BA, "flag-banner", "Faixa com pontas", "0 0 200 60", '<path fill="{1}" d="M0 6h200l-14 24 14 24H0l14-24z"/><path fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="5 4" d="M20 12h160M20 48h160"/>', { stretch: 1, tags: "título faixa" });

  /* ---------- Checkboxes e marcadores ---------- */
  var K = "Checkboxes e marcadores";
  add(K, "check-empty", "Quadradinho", "0 0 50 50", '<rect x="4" y="4" width="42" height="42" rx="6" fill="none" stroke="{1}" stroke-width="4"/>', { tags: "checkbox caixa tarefa" });
  add(K, "check-done", "Quadradinho marcado", "0 0 50 50", '<rect x="4" y="4" width="42" height="42" rx="6" fill="none" stroke="{1}" stroke-width="4"/><path d="M12 26l9 9 18-20" fill="none" stroke="{2}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>', { c2: "#7FB98A", tags: "checkbox feito" });
  add(K, "check-circle", "Bolinha marcada", "0 0 50 50", '<circle cx="25" cy="25" r="21" fill="{1}"/><path d="M14 26l8 8 15-16" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>', { c1: "#7FB98A", tags: "feito ok" });
  add(K, "circle-empty", "Bolinha vazia", "0 0 50 50", '<circle cx="25" cy="25" r="20" fill="none" stroke="{1}" stroke-width="4"/>', { tags: "checkbox" });
  add(K, "checkmark", "Visto", "0 0 60 50", '<path d="M4 26l16 16L56 6" fill="none" stroke="{1}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>', { c1: "#7FB98A", tags: "ok certo" });
  add(K, "xmark", "Xis", "0 0 50 50", '<path d="M8 8l34 34M42 8L8 42" stroke="{1}" stroke-width="7" stroke-linecap="round"/>', { tags: "errado cancelar" });
  add(K, "bullet", "Bolinha", "0 0 30 30", '<circle cx="15" cy="15" r="11" fill="{1}"/>', { tags: "marcador ponto" });
  add(K, "bullet-star", "Marcador estrela", "0 0 40 40", '<polygon fill="{1}" points="' + pts(5, 20, 21, 19, 8) + '"/>', { tags: "marcador" });
  add(K, "bullet-heart", "Marcador coração", "0 0 40 40", '<path transform="scale(.4)" fill="{1}" d="' + HEART + '"/>', { tags: "marcador amor" });
  add(K, "check-heart", "Coração marcado", "0 0 50 50", '<path transform="translate(2 4) scale(.46)" fill="none" stroke="{1}" stroke-width="7" d="' + HEART + '"/><path d="M15 22l7 7 14-14" fill="none" stroke="{2}" stroke-width="4.5" stroke-linecap="round"/>', { c2: "#7FB98A", tags: "checkbox" });
  add(K, "priority", "Exclamação", "0 0 40 60", '<rect x="13" y="4" width="14" height="36" rx="7" fill="{1}"/><circle cx="20" cy="51" r="7" fill="{1}"/>', { tags: "importante urgente" });
  add(K, "number-1", "Número em círculo", "0 0 50 50", '<circle cx="25" cy="25" r="22" fill="{1}"/><path d="M20 15l7-4v28" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>', { tags: "primeiro" });

  /* ---------- Ícones úteis ---------- */
  var I = "Ícones úteis";
  add(I, "water", "Copo de água", "0 0 70 100", '<path fill="none" stroke="{1}" stroke-width="4" stroke-linejoin="round" d="M6 6h58l-8 88H14z"/><path fill="{1}" opacity=".55" d="M10 40h50l-5 52H15z"/>', { c1: "#6FA3D8", tags: "água beber hidratação" });
  add(I, "bottle", "Garrafinha", "0 0 50 110", '<rect x="16" y="2" width="18" height="12" rx="2" fill="{2}"/><path fill="{1}" d="M14 14h22v10l8 10v66a8 8 0 0 1-8 8H14a8 8 0 0 1-8-8V34l8-10z"/><rect x="6" y="50" width="38" height="24" fill="#ffffff" opacity=".5"/>', { c1: "#6FA3D8", c2: "#555555", tags: "água beber" });
  add(I, "coffee", "Café", "0 0 100 100", '<path fill="{1}" d="M10 38h62v30a24 24 0 0 1-24 24H34a24 24 0 0 1-24-24z"/><path d="M72 46h8a12 12 0 0 1 0 24h-9" fill="none" stroke="{1}" stroke-width="6"/><g fill="none" stroke="{2}" stroke-width="4" stroke-linecap="round"><path d="M28 30c-6-8 6-12 0-22M42 30c-6-8 6-12 0-22M56 30c-6-8 6-12 0-22"/></g>', { c1: "#8a5a3c", c2: "#C9A982", tags: "xícara café chá" });
  add(I, "book", "Livro", "0 0 110 80", '<path fill="{1}" d="M55 14C42 4 22 2 4 6v66c18-4 38-2 51 8z"/><path fill="{2}" d="M55 14c13-10 33-12 51-8v66c-18-4-38-2-51 8z"/><path d="M55 14v66" stroke="#ffffff" stroke-width="2"/>', { tags: "ler leitura estudo" });
  add(I, "dumbbell", "Academia", "0 0 120 50", '<rect x="30" y="21" width="60" height="8" fill="{2}"/><rect x="14" y="6" width="16" height="38" rx="4" fill="{1}"/><rect x="90" y="6" width="16" height="38" rx="4" fill="{1}"/><rect x="2" y="14" width="12" height="22" rx="3" fill="{1}"/><rect x="106" y="14" width="12" height="22" rx="3" fill="{1}"/>', { c2: "#888888", tags: "halter treino exercício" });
  add(I, "money", "Dinheiro", "0 0 120 70", '<rect x="2" y="6" width="116" height="58" rx="6" fill="{1}"/><circle cx="60" cy="35" r="16" fill="#ffffff" opacity=".7"/><text x="60" y="44" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="24" fill="{1}">$</text><circle cx="18" cy="35" r="5" fill="#fff" opacity=".6"/><circle cx="102" cy="35" r="5" fill="#fff" opacity=".6"/>', { c1: "#7FB98A", tags: "nota real conta pagar finanças" });
  add(I, "coins", "Moedas", "0 0 100 90", '<ellipse cx="38" cy="70" rx="32" ry="12" fill="{2}"/><rect x="6" y="52" width="64" height="18" fill="{2}"/><ellipse cx="38" cy="52" rx="32" ry="12" fill="{1}"/><circle cx="72" cy="34" r="24" fill="{1}" stroke="{2}" stroke-width="4"/><text x="72" y="43" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="24" fill="{2}">$</text>', { c1: "#E8C468", c2: "#C9A982", tags: "dinheiro poupança cofre" });
  add(I, "piggy", "Cofrinho", "0 0 110 90", '<ellipse cx="54" cy="48" rx="40" ry="30" fill="{1}"/><circle cx="96" cy="44" r="10" fill="{1}"/><circle cx="98" cy="44" r="2" fill="#555"/><path fill="{1}" d="M30 26l-6-18 18 10zM28 72h10v14H28zM66 72h10v14H66z"/><circle cx="76" cy="38" r="3" fill="#555"/><rect x="44" y="20" width="18" height="4" rx="2" fill="#555"/>', { c1: "#F2B6C8", tags: "dinheiro poupança economia" });
  add(I, "phone", "Telefone", "0 0 60 100", '<rect x="4" y="2" width="52" height="96" rx="9" fill="{1}"/><rect x="10" y="12" width="40" height="70" rx="2" fill="#ffffff"/><circle cx="30" cy="90" r="4" fill="#ffffff"/>', { tags: "celular ligar contato" });
  add(I, "phone-classic", "Telefone fixo", "0 0 100 100", '<path fill="{1}" d="M24 8c6-2 10 2 12 8l6 16c2 6-2 10-6 12l-6 4c4 12 14 22 26 26l4-6c2-4 6-8 12-6l16 6c6 2 10 6 8 12l-4 12c-2 6-8 8-14 8C40 98 2 60 4 22c0-6 2-12 8-14z"/>', { tags: "ligar ligação" });
  add(I, "cake", "Bolo de aniversário", "0 0 100 100", '<rect x="12" y="50" width="76" height="44" rx="6" fill="{1}"/><path fill="{2}" d="M12 58c8 8 12 8 19 0s12 8 19 0 12 8 19 0 12 8 19 0V54a6 6 0 0 0-6-6H18a6 6 0 0 0-6 6z"/><g fill="#E8C468"><rect x="30" y="28" width="6" height="20"/><rect x="47" y="24" width="6" height="24"/><rect x="64" y="28" width="6" height="20"/></g><g fill="#E8946A"><path d="M33 16c4 4 4 10 0 10s-4-6 0-10zM50 12c4 4 4 10 0 10s-4-6 0-10zM67 16c4 4 4 10 0 10s-4-6 0-10z"/></g>', { c2: "#ffffff", tags: "aniversário festa parabéns" });
  add(I, "gift", "Presente", "0 0 100 100", '<rect x="8" y="38" width="84" height="20" rx="3" fill="{1}"/><rect x="14" y="58" width="72" height="38" fill="{1}"/><rect x="44" y="38" width="12" height="58" fill="{2}"/><path fill="none" stroke="{2}" stroke-width="6" d="M50 38C40 20 22 20 24 32s20 6 26 6c6 0 24 6 26-6s-16-12-26 6"/>', { c2: "#A88BD8", tags: "aniversário presente" });
  add(I, "balloon", "Balão de festa", "0 0 60 110", '<ellipse cx="30" cy="34" rx="26" ry="32" fill="{1}"/><path fill="{1}" d="M26 66h8l-4 6z"/><path d="M30 72c-6 10 6 18 0 36" fill="none" stroke="#999" stroke-width="1.5"/><ellipse cx="20" cy="22" rx="5" ry="9" fill="#ffffff" opacity=".5"/>', { tags: "festa aniversário bexiga" });
  add(I, "plane", "Avião", "0 0 100 100", '<path fill="{1}" d="M92 8c4 4 2 10-2 14L72 40l10 44-8 8-20-36-18 18 2 14-6 6-8-16-16-8 6-6 14 2 18-18L10 26l8-8 44 10L80 10c4-4 10-6 12-2z"/>', { c1: "#6FA3D8", tags: "viagem férias voo" });
  add(I, "suitcase", "Mala", "0 0 100 100", '<rect x="34" y="8" width="32" height="20" rx="5" fill="none" stroke="{2}" stroke-width="6"/><rect x="8" y="26" width="84" height="66" rx="10" fill="{1}"/><rect x="28" y="26" width="8" height="66" fill="{2}" opacity=".5"/><rect x="64" y="26" width="8" height="66" fill="{2}" opacity=".5"/>', { c2: "#8a5a3c", tags: "viagem férias" });
  add(I, "map-pin", "Local", "0 0 70 100", '<path fill="{1}" d="M35 2a33 33 0 0 0-33 33c0 26 33 63 33 63s33-37 33-63A33 33 0 0 0 35 2z"/><circle cx="35" cy="35" r="12" fill="#ffffff"/>', { tags: "endereço lugar viagem mapa" });
  add(I, "house", "Casa", "0 0 100 100", '<path fill="{1}" d="M50 6l44 40h-12v48H18V46H6z"/><rect x="40" y="62" width="20" height="32" fill="#ffffff"/>', { tags: "lar casa limpeza" });
  add(I, "cart", "Carrinho de compras", "0 0 100 90", '<path fill="none" stroke="{1}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" d="M4 8h14l12 50h52l10-36H24"/><circle cx="36" cy="78" r="7" fill="{1}"/><circle cx="76" cy="78" r="7" fill="{1}"/>', { tags: "compras mercado lista" });
  add(I, "pencil", "Lápis", "0 0 120 40", '<path fill="{1}" d="M22 6h86v28H22z"/><path fill="{2}" d="M108 6h10v28h-10z"/><path fill="#F2D4A8" d="M22 6L2 20l20 14z"/><path fill="#555" d="M8 16L2 20l6 4z"/>', { c1: "#E8C468", c2: "#E88AA6", tags: "escrever estudo escola" });
  add(I, "pill", "Remédio", "0 0 100 100", '<g transform="rotate(-45 50 50)"><rect x="14" y="34" width="72" height="32" rx="16" fill="{1}"/><path fill="{2}" d="M50 34h20a16 16 0 0 1 0 32H50z"/></g>', { c2: "#ffffff", tags: "saúde médico remédio" });
  add(I, "clock", "Relógio", "0 0 100 100", '<circle cx="50" cy="50" r="44" fill="{1}"/><circle cx="50" cy="50" r="36" fill="#ffffff"/><path d="M50 24v26l16 10" fill="none" stroke="{1}" stroke-width="6" stroke-linecap="round"/>', { tags: "hora tempo horário" });
  add(I, "alarm", "Despertador", "0 0 100 100", '<circle cx="50" cy="56" r="36" fill="{1}"/><circle cx="50" cy="56" r="28" fill="#ffffff"/><path d="M50 38v18l12 8" fill="none" stroke="{1}" stroke-width="5" stroke-linecap="round"/><circle cx="18" cy="16" r="12" fill="{1}"/><circle cx="82" cy="16" r="12" fill="{1}"/>', { tags: "acordar lembrete" });
  add(I, "bell", "Sino", "0 0 90 100", '<path fill="{1}" d="M45 6a6 6 0 0 1 6 6v3c16 4 24 18 24 34v20l10 12H5l10-12V49c0-16 8-30 24-34v-3a6 6 0 0 1 6-6z"/><circle cx="45" cy="90" r="9" fill="{1}"/>', { c1: "#E8C468", tags: "lembrete aviso notificação" });
  add(I, "calendar", "Calendário", "0 0 100 100", '<rect x="6" y="14" width="88" height="80" rx="8" fill="#ffffff" stroke="{1}" stroke-width="5"/><path fill="{1}" d="M6 22a8 8 0 0 1 8-8h72a8 8 0 0 1 8 8v12H6z"/><rect x="24" y="4" width="8" height="18" rx="3" fill="{2}"/><rect x="68" y="4" width="8" height="18" rx="3" fill="{2}"/><g fill="{1}"><rect x="18" y="46" width="12" height="10"/><rect x="44" y="46" width="12" height="10"/><rect x="70" y="46" width="12" height="10"/><rect x="18" y="68" width="12" height="10"/><rect x="44" y="68" width="12" height="10"/></g>', { c2: "#555555", tags: "data agenda compromisso" });
  add(I, "heart-pulse", "Saúde", "0 0 100 96", '<path fill="{1}" d="' + HEART + '"/><path d="M14 46h22l6-12 10 24 6-12h28" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>', { tags: "saúde médico batimento" });
  add(I, "apple", "Maçã", "0 0 90 100", '<path fill="{1}" d="M45 28c-14-8-40-4-40 26 0 26 18 44 30 44 4 0 6-2 10-2s6 2 10 2c12 0 30-18 30-44 0-30-26-34-40-26z"/><path d="M45 28c0-10 4-18 10-22" fill="none" stroke="#8a5a3c" stroke-width="4" stroke-linecap="round"/><path fill="{2}" d="M50 20c4-12 18-14 22-10-4 10-14 12-22 10z"/>', { c2: "#7FB98A", tags: "fruta dieta alimentação escola" });
  add(I, "lightbulb", "Ideia", "0 0 70 100", '<path fill="{1}" d="M35 4a30 30 0 0 0-18 54c4 4 6 8 6 14h24c0-6 2-10 6-14A30 30 0 0 0 35 4z"/><rect x="23" y="76" width="24" height="8" rx="3" fill="#888"/><rect x="26" y="86" width="18" height="8" rx="3" fill="#888"/>', { c1: "#E8C468", tags: "lâmpada ideia" });
  add(I, "camera", "Câmera", "0 0 110 80", '<path fill="{1}" d="M10 18h22l8-12h30l8 12h22a8 8 0 0 1 8 8v44a8 8 0 0 1-8 8H10a8 8 0 0 1-8-8V26a8 8 0 0 1 8-8z"/><circle cx="55" cy="46" r="20" fill="#ffffff"/><circle cx="55" cy="46" r="12" fill="{1}"/>', { tags: "foto" });
  add(I, "music", "Música", "0 0 80 100", '<path fill="{1}" d="M28 14l46-10v62a12 12 0 1 1-8-11V24L36 30v48a12 12 0 1 1-8-11z"/>', { tags: "nota musical" });
  add(I, "paw", "Patinha", "0 0 100 100", '<g fill="{1}"><ellipse cx="50" cy="66" rx="24" ry="20"/><ellipse cx="22" cy="40" rx="9" ry="12"/><ellipse cx="40" cy="24" rx="9" ry="12"/><ellipse cx="60" cy="24" rx="9" ry="12"/><ellipse cx="78" cy="40" rx="9" ry="12"/></g>', { tags: "pet cachorro gato" });

  /* ---------- Carinhas de humor ---------- */
  var H = "Carinhas de humor";
  function face(inner) { return '<circle cx="50" cy="50" r="46" fill="{1}"/>' + inner; }
  var EYES = '<circle cx="34" cy="40" r="5" fill="{2}"/><circle cx="66" cy="40" r="5" fill="{2}"/>';
  add(H, "face-happy", "Feliz", "0 0 100 100", face(EYES + '<path d="M30 60q20 18 40 0" fill="none" stroke="{2}" stroke-width="5" stroke-linecap="round"/>'), { c1: "#E8C468", c2: "#5a4636", tags: "humor alegre sorriso" });
  add(H, "face-very-happy", "Muito feliz", "0 0 100 100", face('<path d="M26 42q8-10 16 0M58 42q8-10 16 0" fill="none" stroke="{2}" stroke-width="5" stroke-linecap="round"/><path fill="{2}" d="M28 56h44q-4 24-22 24T28 56z"/><circle cx="24" cy="58" r="6" fill="#E88AA6" opacity=".6"/><circle cx="76" cy="58" r="6" fill="#E88AA6" opacity=".6"/>'), { c1: "#E8C468", c2: "#5a4636", tags: "humor alegre" });
  add(H, "face-love", "Apaixonada", "0 0 100 100", face(heartAt(22, 30, .2).replace("<path", '<path fill="#E04E78"') + heartAt(58, 30, .2).replace("<path", '<path fill="#E04E78"') + '<path d="M32 62q18 16 36 0" fill="none" stroke="{2}" stroke-width="5" stroke-linecap="round"/>'), { c1: "#E8C468", c2: "#5a4636", tags: "humor amor" });
  add(H, "face-neutral", "Normal", "0 0 100 100", face(EYES + '<line x1="34" y1="66" x2="66" y2="66" stroke="{2}" stroke-width="5" stroke-linecap="round"/>'), { c1: "#E8C468", c2: "#5a4636", tags: "humor ok" });
  add(H, "face-sad", "Triste", "0 0 100 100", face(EYES + '<path d="M32 72q18-16 36 0" fill="none" stroke="{2}" stroke-width="5" stroke-linecap="round"/><path fill="#6FA3D8" d="M66 48c4 6 6 10 3 13s-7 0-6-4z"/>'), { c1: "#9EC3E6", c2: "#3d4a5a", tags: "humor chateada" });
  add(H, "face-angry", "Brava", "0 0 100 100", face('<path d="M24 30l18 8M76 30l-18 8" stroke="{2}" stroke-width="5" stroke-linecap="round"/>' + EYES.replace(/cy="40"/g, 'cy="44"') + '<path d="M34 72q16-12 32 0" fill="none" stroke="{2}" stroke-width="5" stroke-linecap="round"/>'), { c1: "#E8946A", c2: "#4a2f26", tags: "humor raiva" });
  add(H, "face-tired", "Cansada", "0 0 100 100", face('<path d="M26 42q8 6 16 0M58 42q8 6 16 0" fill="none" stroke="{2}" stroke-width="5" stroke-linecap="round"/><ellipse cx="50" cy="68" rx="8" ry="6" fill="{2}"/><text x="74" y="26" font-family="Arial,sans-serif" font-weight="700" font-size="18" fill="{2}">z</text><text x="84" y="14" font-family="Arial,sans-serif" font-weight="700" font-size="12" fill="{2}">z</text>'), { c1: "#C9B8EA", c2: "#4a3d63", tags: "humor sono dormir" });
  add(H, "face-wink", "Piscando", "0 0 100 100", face('<circle cx="34" cy="40" r="5" fill="{2}"/><path d="M58 42q8-8 16 0" fill="none" stroke="{2}" stroke-width="5" stroke-linecap="round"/><path d="M30 60q20 18 40 0" fill="none" stroke="{2}" stroke-width="5" stroke-linecap="round"/>'), { c1: "#E8C468", c2: "#5a4636", tags: "humor brincadeira" });
  add(H, "face-surprised", "Surpresa", "0 0 100 100", face('<circle cx="34" cy="40" r="6" fill="{2}"/><circle cx="66" cy="40" r="6" fill="{2}"/><ellipse cx="50" cy="68" rx="9" ry="11" fill="{2}"/>'), { c1: "#E8C468", c2: "#5a4636", tags: "humor uau" });
  add(H, "face-sick", "Doente", "0 0 100 100", face(EYES + '<rect x="30" y="56" width="40" height="22" rx="6" fill="#ffffff" stroke="#cfd8dc" stroke-width="2"/><path d="M30 60L8 52M70 60l22-8" stroke="#cfd8dc" stroke-width="2"/>'), { c1: "#B9DDB5", c2: "#3d5a40", tags: "humor gripe doente" });
  add(H, "face-cool", "Tranquila", "0 0 100 100", face('<path fill="{2}" d="M18 34h28v8c0 8-6 12-14 12s-14-4-14-12zM54 34h28v8c0 8-6 12-14 12s-14-4-14-12z"/><path d="M46 38h8" stroke="{2}" stroke-width="4"/><path d="M34 68q16 10 32 0" fill="none" stroke="{2}" stroke-width="5" stroke-linecap="round"/>'), { c1: "#E8C468", c2: "#3a3340", tags: "humor óculos" });
  add(H, "face-cry", "Chorando", "0 0 100 100", face('<path d="M26 42q8-6 16 0M58 42q8-6 16 0" fill="none" stroke="{2}" stroke-width="5" stroke-linecap="round"/><path fill="#6FA3D8" d="M30 46h8v40h-8zM62 46h8v40h-8z" opacity=".8"/><path d="M38 72q12-8 24 0" fill="none" stroke="{2}" stroke-width="5" stroke-linecap="round"/>'), { c1: "#9EC3E6", c2: "#3d4a5a", tags: "humor triste" });

  var CATS = [];
  L.forEach(function (e) { if (CATS.indexOf(e.cat) < 0) CATS.push(e.cat); });
  var BY = {};
  L.forEach(function (e) { BY[e.id] = e; });
  function norm(s) { return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  window.ELEMENTOS = {
    list: L, cats: CATS, byId: BY,
    /* gera o texto SVG com as cores; w,h em px (para manter o formato do item) */
    svg: function (id, c1, c2, w, h) {
      var e = BY[id]; if (!e) return "";
      var body = e.svg.replace(/\{1\}/g, c1 || e.c1).replace(/\{2\}/g, c2 || e.c2);
      var size = w && h ? ' width="' + Math.round(w) + '" height="' + Math.round(h) + '"' : "";
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + e.vb + '"' + size + ' preserveAspectRatio="' + (e.stretch ? "none" : "xMidYMid meet") + '">' + body + "</svg>";
    },
    aspect: function (id) { var v = BY[id].vb.split(/\s+/).map(Number); return v[2] / v[3]; },
    search: function (q) { q = norm(q).trim(); if (!q) return L; return L.filter(function (e) { return norm(e.name + " " + e.cat + " " + e.tags).indexOf(q) > -1; }); }
  };
})();
