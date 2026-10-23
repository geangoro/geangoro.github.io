/* ============================================================
   Del TIC al TAC — OVA · Grupo 9 MITE
   Lógica: navegación por pasos, progreso persistente, glosario,
   autodiagnóstico, casos con retroalimentación e intentos
   múltiples, plantilla con autoguardado, lista de cotejo,
   descarga e impresión. Sin dependencias externas: funciona
   sin conexión una vez cargado o descargado.
   ============================================================ */
(function () {
  "use strict";

  var CLAVE = "ova-tic-tac-v1";

  /* ---------- Estado persistente ---------- */
  var estado = { paso: "bienvenida", maximo: 0, plantilla: {}, cotejo: {}, diagnostico: {} };
  try {
    var guardado = localStorage.getItem(CLAVE);
    if (guardado) estado = Object.assign(estado, JSON.parse(guardado));
  } catch (e) { /* sin almacenamiento: el OVA funciona igual en memoria */ }

  function persistir() {
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) {}
  }

  /* ---------- Recorrido ---------- */
  var PASOS = [
    { id: "bienvenida",     nombre: "Bienvenida" },
    { id: "m1-continuum",   nombre: "Momento 1 · El continuo TIC–TAC" },
    { id: "m1-diagnostico", nombre: "Momento 1 · ¿Cómo usas hoy la tecnología?" },
    { id: "m2-criterios",   nombre: "Momento 2 · Cuatro criterios para elegir" },
    { id: "m2-componentes", nombre: "Momento 2 · Las tres piezas de una actividad" },
    { id: "m2-casos",       nombre: "Momento 2 · Analiza tres casos" },
    { id: "m3-plantilla",   nombre: "Momento 3 · Diseña tu actividad" },
    { id: "m3-revision",    nombre: "Momento 3 · Verifica, descarga y reflexiona" },
    { id: "creditos",       nombre: "Créditos y licencia" }
  ];

  function indicePaso(id) {
    for (var i = 0; i < PASOS.length; i++) if (PASOS[i].id === id) return i;
    return 0;
  }

  function irA(id, empujarHash) {
    var idx = indicePaso(id);
    document.querySelectorAll(".paso").forEach(function (s) { s.hidden = true; });
    var seccion = document.querySelector('[data-paso="' + id + '"]');
    if (!seccion) return;
    seccion.hidden = false;
    estado.paso = id;
    if (idx > estado.maximo) estado.maximo = idx;
    persistir();

    /* Progreso */
    var pct = Math.round(((idx + 1) / PASOS.length) * 100);
    var relleno = document.getElementById("progreso-relleno");
    relleno.style.width = pct + "%";
    var cont = document.getElementById("progreso-barra-cont");
    cont.setAttribute("aria-valuenow", pct);
    document.getElementById("progreso-texto").textContent =
      "Paso " + (idx + 1) + " de " + PASOS.length + " · " + PASOS[idx].nombre;

    /* Color de acento por momento */
    var color = "#3a5a8f";
    if (id.indexOf("m1") === 0) color = "#9c4a1c";
    if (id.indexOf("m3") === 0) color = "#2c5c41";
    relleno.style.background = color;

    construirMenu();
    if (empujarHash !== false) {
      try { history.replaceState(null, "", "#" + id); } catch (e) {}
    }
    window.scrollTo({ top: 0, behavior: "auto" });
    var titulo = seccion.querySelector("h1, h2");
    if (titulo) { titulo.setAttribute("tabindex", "-1"); titulo.focus({ preventScroll: true }); }
  }

  /* Botones con data-goto */
  document.querySelectorAll("[data-goto]").forEach(function (b) {
    b.addEventListener("click", function () { irA(b.getAttribute("data-goto")); });
  });

  /* ---------- Paneles Menú / Ayuda ---------- */
  function alternarPanel(boton, panel) {
    var abierto = !panel.hidden;
    document.querySelectorAll(".panel").forEach(function (p) { p.hidden = true; });
    document.querySelectorAll(".menu-boton").forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    if (!abierto) { panel.hidden = false; boton.setAttribute("aria-expanded", "true"); }
  }
  var botonMenu = document.getElementById("boton-menu");
  var botonAyuda = document.getElementById("boton-ayuda");
  var panelMenu = document.getElementById("panel-menu");
  var panelAyuda = document.getElementById("panel-ayuda");
  botonMenu.addEventListener("click", function () { alternarPanel(botonMenu, panelMenu); });
  botonAyuda.addEventListener("click", function () { alternarPanel(botonAyuda, panelAyuda); });
  document.addEventListener("click", function (ev) {
    if (!ev.target.closest(".panel") && !ev.target.closest(".menu-boton")) {
      panelMenu.hidden = true; panelAyuda.hidden = true;
      botonMenu.setAttribute("aria-expanded", "false");
      botonAyuda.setAttribute("aria-expanded", "false");
    }
  });

  function construirMenu() {
    var lista = document.getElementById("lista-pasos");
    lista.innerHTML = "";
    PASOS.forEach(function (p, i) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.textContent = p.nombre;
      if (i === indicePaso(estado.paso)) b.className = "actual";
      if (i > estado.maximo) {
        b.disabled = true;
        b.title = "Aún no has llegado a este paso";
      } else {
        b.addEventListener("click", function () {
          panelMenu.hidden = true;
          botonMenu.setAttribute("aria-expanded", "false");
          irA(p.id);
        });
      }
      li.appendChild(b);
      lista.appendChild(li);
    });
  }

  /* ---------- Glosario ---------- */
  var GLOSARIO = {
    tic: { termino: "TIC (Tecnologías de la Información y la Comunicación)",
      definicion: "Uso de la tecnología como apoyo de la clase: proyectar, mostrar, consultar. La forma de enseñar y aprender no cambia; solo cambia el recurso." },
    tac: { termino: "TAC (Tecnologías para el Aprendizaje y el Conocimiento)",
      definicion: "Uso de la tecnología como medio de aprendizaje: los estudiantes la usan para crear, simular, colaborar o representar lo que entienden. La actividad de aprendizaje se transforma." },
    tep: { termino: "TEP (Tecnologías para la Empoderación y la Participación)",
      definicion: "El nivel más amplio del continuo: la tecnología transforma las prácticas y la cultura de toda la comunidad educativa, no solo una clase." },
    proposito: { termino: "Propósito pedagógico",
      definicion: "La razón de aprendizaje que justifica cada decisión de la clase: qué deben lograr los estudiantes y por qué. La herramienta se elige después de definir el propósito, nunca antes." },
    objetivo: { termino: "Objetivo de aprendizaje",
      definicion: "Lo que se espera que los estudiantes puedan hacer al terminar la actividad, descrito de forma observable: «podrán resolver…», «podrán explicar…», «podrán crear…»." }
  };

  var dl = document.getElementById("glosario-lista");
  Object.keys(GLOSARIO).forEach(function (k) {
    var dt = document.createElement("dt"); dt.textContent = GLOSARIO[k].termino;
    var dd = document.createElement("dd"); dd.textContent = GLOSARIO[k].definicion;
    dl.appendChild(dt); dl.appendChild(dd);
  });

  /* Popover de término en el texto */
  var popover = document.createElement("div");
  popover.className = "panel";
  popover.setAttribute("role", "note");
  popover.style.display = "none";
  popover.style.position = "absolute";
  document.body.appendChild(popover);

  document.querySelectorAll(".termino").forEach(function (b) {
    b.addEventListener("click", function (ev) {
      ev.stopPropagation();
      var g = GLOSARIO[b.getAttribute("data-termino")];
      if (!g) return;
      popover.innerHTML = "<p class='panel-titulo'>" + g.termino + "</p><p style='margin:.2rem 0'>" + g.definicion + "</p>";
      var r = b.getBoundingClientRect();
      popover.style.top = (r.bottom + window.scrollY + 8) + "px";
      popover.style.left = Math.max(10, Math.min(r.left, window.innerWidth - 400)) + "px";
      popover.hidden = false;
      popover.style.display = "block";
    });
  });
  document.addEventListener("click", function (ev) {
    if (!ev.target.closest(".termino")) popover.style.display = "none";
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") popover.style.display = "none";
  });

  /* ---------- Autodiagnóstico ---------- */
  var ESCALA = ["Nunca", "A veces", "Casi siempre", "Siempre"];
  document.querySelectorAll(".opciones-escala").forEach(function (cont) {
    var nombre = cont.getAttribute("data-pregunta");
    ESCALA.forEach(function (etiqueta, i) {
      var id = nombre + "-" + i;
      var label = document.createElement("label");
      label.setAttribute("for", id);
      var input = document.createElement("input");
      input.type = "radio"; input.name = nombre; input.id = id; input.value = i + 1;
      if (estado.diagnostico[nombre] === i + 1) input.checked = true;
      label.appendChild(input);
      label.appendChild(document.createTextNode(etiqueta));
      cont.appendChild(label);
    });
  });

  document.getElementById("form-diagnostico").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var total = 0, respondidas = 0;
    ["d1", "d2", "d3", "d4", "d5"].forEach(function (n) {
      var sel = document.querySelector('input[name="' + n + '"]:checked');
      if (sel) { total += parseInt(sel.value, 10); respondidas++; estado.diagnostico[n] = parseInt(sel.value, 10); }
    });
    persistir();
    var salida = document.getElementById("resultado-diagnostico");
    if (respondidas < 5) {
      salida.hidden = false;
      salida.innerHTML = "<strong>Te faltan preguntas por responder.</strong> Responde las cinco afirmaciones para ver tu resultado.";
      return;
    }
    var titulo, texto;
    if (total <= 9) {
      titulo = "Punto de partida: uso ocasional de apoyo";
      texto = "Hoy la tecnología aparece en tu clase sobre todo para mostrar contenido. Es un inicio completamente normal —y es exactamente para lo que existe este recurso—. En el Momento 2 encontrarás criterios sencillos para dar el siguiente paso sin necesidad de ser un experto en herramientas.";
    } else if (total <= 14) {
      titulo = "Punto de partida: en transición";
      texto = "Ya hay momentos en que tus estudiantes hacen cosas con la tecnología, aunque no siempre con un propósito planeado. Tu reto no es empezar de cero, sino hacer conscientes las decisiones: elegir la herramienta después del objetivo y saber explicar por qué.";
    } else {
      titulo = "Punto de partida: integración en marcha";
      texto = "Ya integras la tecnología con intención pedagógica en varias de tus clases. Este recurso te servirá para sistematizar lo que haces, ganar argumentos para justificar tus diseños y compartir tu experiencia con tus colegas en los espacios de formación.";
    }
    salida.hidden = false;
    salida.innerHTML = "<strong>" + titulo + "</strong>" + texto +
      "<p class='nota' style='margin:.6rem 0 0'>Este resultado es orientativo y privado: solo lo ves tú y nadie lo registra.</p>";
    salida.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  /* ---------- Casos con retroalimentación ---------- */
  var CASOS = [
    {
      asignatura: "Matemáticas · Sexto",
      escenario: "La profesora Ángela proyecta un video de 15 minutos sobre fracciones equivalentes. Los estudiantes lo ven en silencio y luego resuelven en el cuaderno los ejercicios del libro, como siempre. Al final, ella pregunta si el video les gustó.",
      pregunta: "¿En qué nivel del continuo se ubica principalmente este uso de la tecnología?",
      opciones: [
        { texto: "TAC, porque los estudiantes usaron un recurso digital para aprender fracciones.",
          correcta: false,
          retro: "Mira lo que hicieron los estudiantes: vieron un video y resolvieron los mismos ejercicios de siempre. La herramienta es digital, pero la actividad de aprendizaje no cambió. Recuerda: TAC no se define por la herramienta, sino por lo que los estudiantes hacen con ella." },
        { texto: "TIC, porque la tecnología apoyó la clase, pero la forma de aprender siguió siendo la misma.",
          correcta: true,
          retro: "Exacto. El video es un apoyo: podría reemplazarse por una explicación al tablero sin que la actividad cambie. Si la profesora quisiera subir al nivel TAC, podría pedirles, por ejemplo, que usaran una herramienta de fracciones interactiva para descubrir las equivalencias por sí mismos y explicarlas con sus propios ejemplos." },
        { texto: "TEP, porque el video transforma la cultura del aula.",
          correcta: false,
          retro: "TEP es el nivel institucional: transforma las prácticas de toda la comunidad educativa. Un video proyectado en una clase está muy lejos de eso. Intenta de nuevo fijándote en qué cambió (o no cambió) la actividad de los estudiantes." }
      ]
    },
    {
      asignatura: "Lengua castellana · Séptimo",
      escenario: "El profesor Mario pide a sus estudiantes escribir un cuento corto en un procesador de texto en línea y publicarlo en el blog del curso. Cada estudiante debe leer los cuentos de dos compañeros y dejar comentarios constructivos, que el profesor evalúa con una rúbrica de calidad de la retroalimentación.",
      pregunta: "¿Qué es lo que convierte esta actividad en un uso TAC?",
      opciones: [
        { texto: "Que usan internet y computadores en lugar de papel y lápiz.",
          correcta: false,
          retro: "Eso describe el medio, no el aprendizaje. Escribir en el computador, por sí solo, sería solo digitalizar la tarea de siempre. Busca qué hace posible la tecnología que antes no ocurría. Intenta otra opción." },
        { texto: "Que el blog es una herramienta más moderna que el cuaderno.",
          correcta: false,
          retro: "La novedad de la herramienta no es un criterio pedagógico: recuerda que la pertinencia importa más que lo llamativo. Pregúntate qué pueden hacer los estudiantes con el blog que no podrían con el cuaderno." },
        { texto: "Que la tecnología hace posible crear, publicar y colaborar con una audiencia real, y la evaluación mira precisamente eso.",
          correcta: true,
          retro: "Correcto. Aquí las tres piezas cuentan la misma historia: el objetivo (escribir y retroalimentar), la actividad (crear y comentar en el blog) y la evaluación (rúbrica de comentarios) se alinean, y la tecnología aporta algo nuevo: una audiencia real para los textos. Eso es valor agregado." }
      ]
    },
    {
      asignatura: "Ciencias Naturales · Sexto",
      escenario: "La docente Patricia encontró un simulador de ecosistemas muy completo, pero exige una licencia de pago y los computadores del colegio no soportan la versión web. Decide pedir a los estudiantes que lo descarguen en casa con ayuda de sus padres.",
      pregunta: "¿Qué criterio de selección está fallando en esta decisión?",
      opciones: [
        { texto: "El propósito: el simulador no tiene relación con el aprendizaje de ecosistemas.",
          correcta: false,
          retro: "En realidad el propósito está bien: un simulador de ecosistemas sí sirve para aprender sobre ecosistemas. El problema está en otra parte. Relee las condiciones: licencia de pago, equipos que no lo soportan, descarga en casa…" },
        { texto: "La viabilidad: la herramienta no funciona en las condiciones reales del colegio ni garantiza acceso equitativo.",
          correcta: true,
          retro: "Así es. La intención pedagógica era buena, pero una herramienta que no funciona en los equipos del colegio, que cuesta dinero y que depende de lo que cada familia tenga en casa, excluye estudiantes y fracasará en la práctica. La salida no es abandonar la idea, sino buscar un simulador gratuito que sí corra en el contexto real." },
        { texto: "El valor agregado: la simulación podría hacerse igual con un dibujo en el tablero.",
          correcta: false,
          retro: "Un dibujo estático no permite experimentar con variables de un ecosistema; el simulador sí aporta valor agregado. El problema de este caso no es pedagógico sino práctico. Intenta de nuevo." }
      ]
    }
  ];

  var casosResueltos = {};

  function construirCasos() {
    var cont = document.getElementById("casos-contenedor");
    cont.innerHTML = "";
    CASOS.forEach(function (caso, idx) {
      var div = document.createElement("div");
      div.className = "caso";
      div.id = "caso-" + idx;

      var cab = document.createElement("div");
      cab.className = "caso-encabezado";
      var h3 = document.createElement("h3");
      h3.textContent = "Caso " + (idx + 1);
      var asig = document.createElement("span");
      asig.className = "caso-asignatura";
      asig.textContent = caso.asignatura;
      cab.appendChild(h3); cab.appendChild(asig);

      var esc = document.createElement("p");
      esc.className = "caso-escenario";
      esc.textContent = caso.escenario;

      var preg = document.createElement("p");
      preg.className = "caso-pregunta";
      preg.textContent = caso.pregunta;

      var ops = document.createElement("div");
      ops.className = "caso-opciones";
      caso.opciones.forEach(function (op, oi) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "caso-opcion";
        b.textContent = op.texto;
        b.addEventListener("click", function () { responderCaso(idx, oi, div); });
        ops.appendChild(b);
      });

      var retro = document.createElement("div");
      retro.className = "retroalimentacion";
      retro.hidden = true;
      retro.setAttribute("aria-live", "polite");

      var acciones = document.createElement("div");
      acciones.className = "caso-acciones";

      div.appendChild(cab); div.appendChild(esc); div.appendChild(preg);
      div.appendChild(ops); div.appendChild(retro); div.appendChild(acciones);
      cont.appendChild(div);
    });
  }

  function responderCaso(idx, oi, div) {
    var caso = CASOS[idx];
    var op = caso.opciones[oi];
    var retro = div.querySelector(".retroalimentacion");
    var acciones = div.querySelector(".caso-acciones");
    var botones = div.querySelectorAll(".caso-opcion");

    botones.forEach(function (b, i) {
      b.disabled = true;
      if (i === oi) b.classList.add(op.correcta ? "correcta" : "incorrecta");
    });

    retro.hidden = false;
    if (op.correcta) {
      retro.className = "retroalimentacion exito";
      retro.innerHTML = "<strong>✔ Bien analizado.</strong>" + op.retro;
      acciones.innerHTML = "";
      casosResueltos[idx] = true;
      if (Object.keys(casosResueltos).length === CASOS.length) {
        var cierre = document.getElementById("casos-cierre");
        cierre.hidden = false;
        cierre.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    } else {
      retro.className = "retroalimentacion reintento";
      retro.innerHTML = "<strong>Aún no — revisemos el criterio.</strong>" + op.retro;
      acciones.innerHTML = "";
      var re = document.createElement("button");
      re.type = "button";
      re.className = "btn";
      re.textContent = "Reintentar este caso";
      re.addEventListener("click", function () {
        botones.forEach(function (b) { b.disabled = false; b.classList.remove("correcta", "incorrecta"); });
        retro.hidden = true;
        acciones.innerHTML = "";
      });
      acciones.appendChild(re);
    }
    retro.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  construirCasos();

  /* ---------- Plantilla: autoguardado ---------- */
  var CAMPOS = ["p-nombre", "p-asignatura", "p-grado", "p-objetivo", "p-actividad", "p-herramienta", "p-justificacion", "p-evaluacion"];
  CAMPOS.forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (estado.plantilla[id]) el.value = estado.plantilla[id];
    el.addEventListener("input", function () {
      estado.plantilla[id] = el.value;
      persistir();
    });
  });

  function datosPlantilla() {
    var d = {};
    CAMPOS.forEach(function (id) {
      var el = document.getElementById(id);
      d[id] = el ? el.value.trim() : "";
    });
    return d;
  }

  /* ---------- Lista de cotejo ---------- */
  document.querySelectorAll("[data-cotejo]").forEach(function (cb) {
    var k = cb.getAttribute("data-cotejo");
    if (estado.cotejo[k]) cb.checked = true;
    cb.addEventListener("change", function () {
      estado.cotejo[k] = cb.checked;
      persistir();
      actualizarCotejo();
    });
  });

  function actualizarCotejo() {
    var total = document.querySelectorAll("[data-cotejo]").length;
    var marcados = document.querySelectorAll("[data-cotejo]:checked").length;
    var salida = document.getElementById("resultado-cotejo");
    if (marcados === 0) { salida.innerHTML = ""; return; }
    if (marcados === total) {
      salida.innerHTML = "<strong>✔ Tu diseño pasa la lista completa.</strong>Tienes una actividad TAC bien fundamentada: propósito claro, herramienta justificada y evaluación alineada. Descárgala y compártela con el docente insignia.";
    } else {
      salida.innerHTML = "<strong>Llevas " + marcados + " de " + total + " criterios.</strong>Regresa a la plantilla con el botón Anterior y ajusta lo que falta; la lista estará aquí cuando vuelvas.";
    }
  }
  actualizarCotejo();

  /* ---------- Descarga ---------- */
  function textoActividad() {
    var d = datosPlantilla();
    var linea = "----------------------------------------";
    return [
      "DEL TIC AL TAC — MI ACTIVIDAD DE ENSEÑANZA CON TAC",
      "OVA de formación docente · Colegio Colsubsidio Maiporé",
      "Grupo 9 · Maestría MITE · Universidad El Bosque",
      linea,
      "Docente:   " + (d["p-nombre"] || "(sin diligenciar)"),
      "Asignatura:" + " " + (d["p-asignatura"] || "(sin diligenciar)"),
      "Grado:     " + (d["p-grado"] || "(sin diligenciar)"),
      linea,
      "A. OBJETIVO DE APRENDIZAJE",
      d["p-objetivo"] || "(sin diligenciar)",
      "",
      "B. ACTIVIDAD",
      d["p-actividad"] || "(sin diligenciar)",
      "",
      "HERRAMIENTA DIGITAL ELEGIDA",
      d["p-herramienta"] || "(sin diligenciar)",
      "",
      "JUSTIFICACIÓN DE LA HERRAMIENTA (criterios)",
      d["p-justificacion"] || "(sin diligenciar)",
      "",
      "C. EVALUACIÓN",
      d["p-evaluacion"] || "(sin diligenciar)",
      linea,
      "Este documento es la evidencia del recorrido por el OVA.",
      "Compártelo con el docente insignia para recibir",
      "retroalimentación en los espacios de formación.",
      "Licencia del OVA: CC BY-NC-SA 4.0"
    ].join("\n");
  }

  document.getElementById("btn-descargar").addEventListener("click", function () {
    var blob = new Blob([textoActividad()], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "mi-actividad-tac.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  });

  /* ---------- Impresión / PDF ---------- */
  document.getElementById("btn-imprimir").addEventListener("click", function () {
    var d = datosPlantilla();
    var area = document.getElementById("area-impresion");
    function esc(t) { var s = document.createElement("span"); s.textContent = t; return s.innerHTML; }
    area.innerHTML =
      "<h1>Mi actividad de enseñanza con TAC</h1>" +
      "<p class='doc-meta'>Del TIC al TAC · OVA de formación docente · Colegio Colsubsidio Maiporé · Grupo 9 MITE</p>" +
      "<p><strong>Docente:</strong> " + esc(d["p-nombre"] || "—") + " &nbsp;·&nbsp; <strong>Asignatura:</strong> " + esc(d["p-asignatura"] || "—") + " &nbsp;·&nbsp; <strong>Grado:</strong> " + esc(d["p-grado"] || "—") + "</p>" +
      "<h2>A. Objetivo de aprendizaje</h2><p>" + esc(d["p-objetivo"] || "—") + "</p>" +
      "<h2>B. Actividad</h2><p>" + esc(d["p-actividad"] || "—") + "</p>" +
      "<h2>Herramienta digital elegida</h2><p>" + esc(d["p-herramienta"] || "—") + "</p>" +
      "<h2>Justificación (criterios)</h2><p>" + esc(d["p-justificacion"] || "—") + "</p>" +
      "<h2>C. Evaluación</h2><p>" + esc(d["p-evaluacion"] || "—") + "</p>" +
      "<p class='doc-meta'>Evidencia del recorrido por el OVA · Licencia CC BY-NC-SA 4.0</p>";
    window.print();
  });

  /* ---------- Inicio ---------- */
  var hashInicial = (location.hash || "").replace("#", "");
  var pasoInicial = estado.paso;
  if (hashInicial && indicePaso(hashInicial) <= estado.maximo) pasoInicial = hashInicial;
  irA(pasoInicial, false);

  window.addEventListener("hashchange", function () {
    var h = (location.hash || "").replace("#", "");
    if (h && h !== estado.paso && indicePaso(h) <= estado.maximo) irA(h, false);
  });
})();
