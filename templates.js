/* Modelos completos (Frente e Verso) da Agenda Estrela.
   Cada modelo monta a folha com os elementos SVG e as fontes do app.
   T.el(tipo, x, y, w, h, props)  -> y e h na escala de 210 mm (encolhem no formato 2 dias)
   T.s(lib, x, y, tamanho, props) -> elemento SVG que mantém a proporção
   T.r(lib, x, y, w, h, props)    -> elemento SVG que estica
   T.mx(x, w) -> espelha a posição no Verso */
(function () {
  var FOOT = "Estrela de Maria";
  var L = [];
  function add(id, name, sw, build) { L.push({ id: id, name: name, sw: sw, build: build }); }

  add("floral", "Floral rosa", ["#FFF8FA", "#D9758F"], function (T) {
    var c = "#D9758F", ln = "#F1D2DB", v = T.verso;
    T.bg("#FFF8FA");
    T.s("rose", T.mx(117, 26), -3, 30, { c1: "#F2A7BC", c2: "#8DBF95", rot: v ? -22 : 22 });
    T.s("sprig", T.mx(104, 14), 3, 22, { c1: "#8DBF95", rot: v ? -48 : 48 });
    T.s("sakura", T.mx(132, 9), 30, 9, { c1: "#F7C6D3", c2: "#E8C468" });
    T.el("date", T.mx(9, 100), 10, 100, 15, { style: "extenso", font: "Dancing Script", size: 24, color: c, bold: true, align: v ? "right" : "left" });
    T.r("div-leaves", 29, 26, 90, 8, { c1: "#A9CDB0" });
    T.el("holiday", 9, 35, 130, 6, { color: c, size: 9, align: "center", font: "Quicksand" });
    T.el("hours", T.mx(9, 62), 43, 62, 144, { font: "Quicksand", size: 8, tColor: c, lineColor: ln });
    T.el("tasks", T.mx(77, 62), 43, 62, 56, { font: "Quicksand", size: 8, count: T.half ? 4 : 7, tColor: c, lineColor: ln });
    T.el("notes", T.mx(77, 62), 104, 62, 83, { font: "Quicksand", size: 8, tColor: c, lineColor: ln, boxBorder: "arredondada", boxColor: "#F2C4D1" });
    T.s("branch", T.mx(5, 34), 191, 34, { c1: "#8DBF95", flipH: v });
    T.el("footer", T.mx(44, 95), 194, 95, 7, { text: FOOT, font: "Dancing Script", size: 10, color: c, align: v ? "left" : "right" });
  });

  add("minimal", "Minimalista", ["#FFFFFF", "#333333"], function (T) {
    var c = "#333333", g = "#9A9A9A", ln = "#E4E4E4";
    T.bg("#FFFFFF");
    T.el("date", 9, 10, 130, 10, { style: "extenso", font: "Montserrat", size: 12, color: c, bold: true, upper: true, ls: 0.18 });
    T.r("line", 9, 22, 130, 1.2, { c1: c });
    T.el("holiday", 9, 25, 130, 6, { color: g, size: 8, font: "Montserrat", upper: true, ls: 0.12, bold: false });
    T.el("hours", 9, 35, 62, 152, { font: "Montserrat", size: 7.5, tColor: c, lineColor: ln, title: "AGENDA", ls: 0.08 });
    T.el("tasks", 77, 35, 62, 56, { font: "Montserrat", size: 7.5, count: T.half ? 4 : 7, tColor: c, lineColor: ln, title: "TAREFAS", ls: 0.08 });
    T.el("notes", 77, 97, 62, 90, { font: "Montserrat", size: 7.5, tColor: c, lineColor: "#CFCFCF", kind: "pontilhado", spacing: 5, title: "NOTAS", ls: 0.08 });
    T.el("footer", 9, 196, 130, 6, { text: FOOT.toUpperCase(), font: "Montserrat", size: 6.5, color: g, align: T.verso ? "left" : "right", ls: 0.2 });
  });

  add("boho", "Boho terroso", ["#FBF3EA", "#B5651D"], function (T) {
    var t = "#B5651D", tt = "#9C4A3B", sage = "#8F9A6B", ln = "#E6D2BF", v = T.verso;
    T.bg("#FBF3EA");
    T.s("arc", T.mx(104, 38), 7, 38, { c1: "#C68B59" });
    T.s("arc", T.mx(110, 26), 13.5, 26, { c1: "#D9A679" });
    T.s("arc", T.mx(116, 14), 19.5, 14, { c1: sage });
    T.el("date", T.mx(9, 92), 9, 92, 15, { style: "extenso", font: "Cormorant Garamond", size: 22, color: tt, bold: true, italic: true, align: v ? "right" : "left" });
    T.el("holiday", T.mx(9, 92), 24, 92, 6, { color: sage, size: 9, font: "Cormorant Garamond", bold: true, italic: true, align: v ? "right" : "left" });
    T.r("div-dots", 9, 33, 130, 3, { c1: "#D9A679" });
    T.el("hours", T.mx(9, 62), 40, 62, 147, { font: "Josefin Sans", size: 8, tColor: t, lineColor: ln });
    T.el("tasks", T.mx(77, 62), 40, 62, 56, { font: "Josefin Sans", size: 8, count: T.half ? 4 : 7, tColor: t, lineColor: ln });
    T.el("notes", T.mx(77, 62), 101, 62, 76, { font: "Josefin Sans", size: 8, tColor: t, lineColor: ln, boxBg: "#F5E6D6", boxBorder: "arredondada", boxColor: "#F5E6D6" });
    T.s("sprig", T.mx(128, 12), 178, 24, { c1: sage, rot: v ? 20 : -20 });
    T.s("leaf", T.mx(116, 10), 188, 10, { c1: "#B9C29A", rot: v ? 60 : -30 });
    T.el("footer", T.mx(9, 100), 195, 100, 7, { text: FOOT, font: "Cormorant Garamond", size: 9, color: tt, italic: true, align: v ? "right" : "left" });
  });

  add("lilas", "Lilás com estrelas", ["#F6F2FD", "#8E6CC9"], function (T) {
    var c = "#8E6CC9", ln = "#DCD0F2", v = T.verso;
    T.bg("#F6F2FD");
    T.s("moon-stars", T.mx(118, 22), 6, 22, { c1: "#B9A2E8", c2: "#E8C468", flipH: v });
    T.s("sparkle", T.mx(108, 7), 6, 7, { c1: "#E8C468" });
    T.s("star", T.mx(140, 5), 32, 5, { c1: "#CDBDF0" });
    T.el("date", T.mx(9, 100), 9, 100, 15, { style: "extenso", font: "Satisfy", size: 24, color: c, align: v ? "right" : "left" });
    T.el("holiday", T.mx(9, 100), 24, 100, 6, { color: "#B08BD8", size: 9, font: "Quicksand", bold: true, align: v ? "right" : "left" });
    T.r("div-star", 9, 32, 130, 6, { c1: "#CDBDF0", c2: "#E8C468" });
    T.el("hours", T.mx(9, 62), 42, 62, 145, { font: "Quicksand", size: 8, tColor: c, lineColor: ln });
    T.el("tasks", T.mx(77, 62), 42, 62, 56, { font: "Quicksand", size: 8, count: T.half ? 4 : 7, tColor: c, lineColor: ln, title: "Tarefas ✦" });
    T.el("notes", T.mx(77, 62), 103, 62, 84, { font: "Quicksand", size: 8, tColor: c, lineColor: "#C9B8EC", kind: "pontilhado", spacing: 5, boxBg: "#FFFFFF", boxBorder: "arredondada", boxColor: "#DCD0F2" });
    T.s("twinkle", T.mx(10, 12), 190, 12, { c1: "#CDBDF0" });
    T.el("footer", T.mx(44, 95), 195, 95, 7, { text: FOOT, font: "Satisfy", size: 10, color: c, align: v ? "left" : "right" });
  });

  add("infantil", "Infantil colorido", ["#FFFDF4", "#FF8A1F"], function (T) {
    var v = T.verso, ln = "#F1E4C8";
    T.bg("#FFFDF4");
    T.r("bunting-colors", 0, 0, 148, 24, { c1: "#FF5C8A", c2: "#8E44D9" });
    T.el("date", 9, 25, 130, 15, { style: "extenso", font: "Fredoka", size: 20, color: "#FF8A1F", bold: true, align: "center" });
    T.el("holiday", 9, 39, 130, 6, { color: "#3D6BE0", size: 9, font: "Fredoka", bold: true, align: "center" });
    T.el("hours", T.mx(9, 62), 47, 62, 140, { font: "Fredoka", size: 8, tColor: "#3D6BE0", lineColor: "#CFE0F7", boxBg: "#F2F7FF", boxBorder: "arredondada", boxColor: "#CFE0F7" });
    T.el("tasks", T.mx(77, 62), 47, 62, 58, { font: "Fredoka", size: 8, count: T.half ? 3 : 6, tColor: "#FF5C8A", lineColor: "#F9C6D3", boxBg: "#FFF2F6", boxBorder: "arredondada", boxColor: "#F9C6D3" });
    T.el("notes", T.mx(77, 62), 110, 62, 64, { font: "Fredoka", size: 8, tColor: "#14B39A", lineColor: "#CDEFD7", boxBg: "#F1FBF5", boxBorder: "arredondada", boxColor: "#CDEFD7" });
    T.s("rainbow", T.mx(79, 26), 178, 26, {});
    T.s("cloud", T.mx(98, 14), 186, 14, { c1: "#CFE0F7" });
    T.s("balloon", T.mx(125, 9), 176, 16, { c1: "#FF5C8A" });
    T.s("star-round", T.mx(113, 7), 179, 7, { c1: "#F5C518" });
    T.el("footer", T.mx(9, 66), 195, 66, 7, { text: FOOT, font: "Fredoka", size: 8, color: "#8E44D9", bold: true, align: v ? "right" : "left" });
  });

  add("dourado", "Elegante dourado", ["#FFFCF6", "#C9A227"], function (T) {
    var g = "#C9A227", gd = "#A8842A", ln = "#EBDFC2";
    T.bg("#FFFCF6");
    T.el("text", 4, 4, 140, 202, { text: "", boxBorder: "fina", boxColor: "#D8BE6A", lock: true });
    T.el("text", 6, 6, 136, 198, { text: "", boxBorder: "fina", boxColor: "#E6D3A0", lock: true });
    T.el("date", 12, 12, 124, 15, { style: "extenso", font: "Playfair Display", size: 19, color: gd, italic: true, bold: true, align: "center" });
    T.r("div-star", 39, 28, 70, 7, { c1: "#D8BE6A", c2: g });
    T.el("holiday", 12, 37, 124, 6, { color: g, size: 8, font: "Cinzel", align: "center", bold: true });
    T.el("hours", T.mx(13, 58), 46, 58, 138, { font: "Lora", size: 8, tColor: gd, lineColor: ln, title: "Compromissos" });
    T.el("tasks", T.mx(77, 58), 46, 58, 54, { font: "Lora", size: 8, count: T.half ? 3 : 6, tColor: gd, lineColor: ln });
    T.el("notes", T.mx(77, 58), 105, 58, 79, { font: "Lora", size: 8, tColor: gd, lineColor: ln });
    T.s("star", 71.5, 188, 5, { c1: g });
    T.el("footer", 12, 194, 124, 6, { text: FOOT.toUpperCase(), font: "Cinzel", size: 7, color: gd, align: "center", ls: 0.15 });
  });

  add("washi", "Washi tape", ["#FFFFFF", "#E88AA6"], function (T) {
    var v = T.verso, c = "#C9607F", ln = "#EADCE2";
    T.bg("#FFFFFF");
    T.r("washi-stripe", T.mx(6, 98), 7, 98, 17, { c1: "#F9C6D3", c2: "#FFFFFF", rot: v ? 1.5 : -1.5 });
    T.el("date", T.mx(12, 88), 8, 88, 15, { style: "extenso", font: "Caveat", size: 22, color: "#5B2A3C", bold: true, align: "center", rot: v ? 1.5 : -1.5 });
    T.el("holiday", T.mx(12, 88), 25, 88, 6, { color: c, size: 9, font: "Caveat", bold: true, align: "center" });
    T.s("sticky-tape", T.mx(110, 30), 4, 30, { c1: "#FFF4C2", c2: "#C9EEF0", rot: v ? -5 : 5 });
    T.el("text", T.mx(114, 24), 12, 24, 18, { text: "Meta do dia:", font: "Caveat", size: 11, color: "#7A6A45", align: "center", rot: v ? -5 : 5 });
    T.el("hours", T.mx(9, 62), 40, 62, 147, { font: "Patrick Hand", size: 9, tColor: c, lineColor: ln });
    T.r("washi-dots", T.mx(77, 30), 40, 30, 7, { c1: "#CFE0F7", c2: "#FFFFFF", rot: v ? 4 : -4 });
    T.el("tasks", T.mx(77, 62), 48, 62, 54, { font: "Patrick Hand", size: 9, count: T.half ? 3 : 6, tColor: c, lineColor: ln, title: "" });
    T.s("sticky", T.mx(77, 62), 107, 62, { c1: "#FCE3EA" });
    T.r("washi-hearts", T.mx(95, 26), 104, 26, 7, { c1: "#E8C468", c2: "#FFFFFF", rot: v ? -3 : 3 });
    T.el("notes", T.mx(81, 54), 114, 54, 50, { font: "Patrick Hand", size: 9, tColor: c, lineColor: "#F3BFCD", title: "Notas" });
    T.el("footer", T.mx(9, 62), 195, 62, 7, { text: FOOT, font: "Caveat", size: 11, color: c, align: v ? "right" : "left" });
  });

  add("planner", "Planner produtividade", ["#2E3A59", "#3D6BE0"], function (T) {
    var nav = "#2E3A59", ac = "#3D6BE0", ln = "#DFE5F1";
    T.bg("#FFFFFF");
    T.r("rect", 0, 0, 148, 30, { c1: nav, lock: true });
    T.el("date", 9, 6, 110, 12, { style: "extenso", font: "Poppins", size: 16, color: "#FFFFFF", bold: true });
    T.el("holiday", 9, 19, 110, 6, { color: "#AFC4F5", size: 8, font: "Poppins" });
    T.s("check-done", 127, 8, 13, { c1: "#FFFFFF" });
    T.el("tasks", 9, 36, 130, 30, { font: "Poppins", size: 8, count: 3, tColor: ac, lineColor: ln, title: "3 prioridades", boxBg: "#F2F6FE", boxBorder: "arredondada", boxColor: "#C9D6F5" });
    T.el("hours", T.mx(9, 62), 72, 62, 115, { font: "Poppins", size: 7.5, tColor: nav, lineColor: ln, title: "Horários" });
    T.el("tasks", T.mx(77, 62), 72, 62, 52, { font: "Poppins", size: 7.5, count: T.half ? 3 : 6, tColor: nav, lineColor: ln, title: "A fazer" });
    T.el("notes", T.mx(77, 62), 129, 62, 58, { font: "Poppins", size: 7.5, tColor: nav, lineColor: "#C5CEE0", kind: "pontilhado", spacing: 5, title: "Notas" });
    T.r("line", 9, 192, 130, 0.8, { c1: ln });
    T.el("footer", 9, 195, 130, 6, { text: "Foco · Disciplina · " + FOOT, font: "Poppins", size: 7, color: "#8A94AD", align: "center" });
  });

  add("fitness", "Fitness e água", ["#F2FAFD", "#1FA6D9"], function (T) {
    var dk = "#1F4E5F", aq = "#1FA6D9", gr = "#14B39A", ln = "#D3E9F0";
    T.bg("#F2FAFD");
    T.el("date", 9, 8, 110, 14, { style: "extenso", font: "Bebas Neue", size: 26, color: dk, ls: 0.04 });
    T.s("dumbbell", 121, 9, 18, { c1: gr, c2: dk });
    T.el("holiday", 9, 22, 130, 6, { color: aq, size: 8.5, font: "Montserrat", bold: true });
    T.el("text", 9, 30, 40, 6, { text: "Água (8 copos)", font: "Montserrat", size: 8, color: aq, bold: true });
    for (var i = 0; i < 8; i++) T.s("water", 50 + i * 11.2, 29, 9, { c1: aq });
    T.el("hours", T.mx(9, 62), 43, 62, 144, { font: "Montserrat", size: 7.5, tColor: dk, lineColor: ln });
    T.el("tasks", T.mx(77, 62), 43, 62, 50, { font: "Montserrat", size: 7.5, count: T.half ? 3 : 5, tColor: gr, lineColor: ln, title: "Treino do dia" });
    T.el("notes", T.mx(77, 62), 98, 62, 89, { font: "Montserrat", size: 7.5, tColor: gr, lineColor: ln, title: "Refeições", boxBg: "#FFFFFF", boxBorder: "arredondada", boxColor: ln });
    T.el("footer", 9, 195, 130, 6, { text: "Corpo em movimento · " + FOOT, font: "Montserrat", size: 7, color: "#6A8C99", align: "center" });
  });

  add("estudos", "Estudos", ["#FFFEF7", "#3D6BE0"], function (T) {
    var bl = "#3D6BE0", dk = "#2E3A59", ln = "#DCE4F5", v = T.verso;
    T.bg("#FFFEF7");
    T.el("date", T.mx(9, 100), 9, 100, 14, { style: "extenso", font: "Kalam", size: 19, color: bl, bold: true, align: v ? "right" : "left" });
    T.el("holiday", T.mx(9, 100), 23, 100, 6, { color: "#E8946A", size: 9, font: "Kalam", bold: true, align: v ? "right" : "left" });
    T.s("book", T.mx(116, 23), 7, 23, { c1: "#6FA3D8", c2: "#A88BD8" });
    T.s("pencil", T.mx(108, 30), 25, 30, { c1: "#E8C468", c2: "#E88AA6", rot: v ? 12 : -12 });
    T.r("label-box", 9, 37, 130, 11, { c1: "#E6EEFC" });
    T.el("text", 15, 38.5, 118, 8, { text: "Meta de hoje: ______________________", font: "Kalam", size: 10, color: dk });
    T.el("hours", T.mx(9, 62), 53, 62, 134, { font: "Kalam", size: 8.5, tColor: bl, lineColor: ln, title: "Cronograma" });
    T.el("tasks", T.mx(77, 62), 53, 62, 50, { font: "Kalam", size: 8.5, count: T.half ? 3 : 5, tColor: bl, lineColor: ln, title: "Matérias de hoje" });
    T.el("notes", T.mx(77, 62), 108, 62, 79, { font: "Kalam", size: 8.5, tColor: bl, lineColor: "#C2D0EE", kind: "pontilhado", spacing: 4, title: "Resumo" });
    T.s("lightbulb", T.mx(10, 6), 192, 9, { c1: "#E8C468" });
    T.el("footer", T.mx(18, 121), 195, 121, 7, { text: "Um pouquinho todo dia · " + FOOT, font: "Kalam", size: 8, color: "#7A86A6", align: v ? "right" : "left" });
  });

  add("cafe", "Café aconchegante", ["#FAF5EF", "#8A5A3C"], function (T) {
    var br = "#8A5A3C", be = "#C9A982", ln = "#E9DCCB", v = T.verso;
    T.bg("#FAF5EF");
    T.s("coffee", T.mx(118, 22), 6, 22, { c1: "#A86B4A", c2: be });
    T.el("date", T.mx(9, 104), 9, 104, 15, { style: "extenso", font: "Lora", size: 18, color: br, italic: true, bold: true, align: v ? "right" : "left" });
    T.el("holiday", T.mx(9, 104), 23, 104, 6, { color: be, size: 9, font: "Lora", italic: true, align: v ? "right" : "left" });
    T.r("div-heart", 9, 31, 130, 6, { c1: be, c2: "#E88AA6" });
    T.el("hours", T.mx(9, 62), 41, 62, 146, { font: "Nunito", size: 8, tColor: br, lineColor: ln });
    T.el("tasks", T.mx(77, 62), 41, 62, 56, { font: "Nunito", size: 8, count: T.half ? 4 : 7, tColor: br, lineColor: ln });
    T.el("notes", T.mx(77, 62), 102, 62, 85, { font: "Nunito", size: 8, tColor: br, lineColor: ln, boxBg: "#FFFFFF", boxBorder: "arredondada", boxColor: ln, title: "Gratidão & notas" });
    T.el("footer", 9, 195, 130, 7, { text: FOOT, font: "Lora", size: 8, color: br, italic: true, align: "center" });
  });

  window.AGENDA_TEMPLATES = L;
})();
