/* ============================================================
   Del TIC al TAC — OVA · Grupo 9 MITE
   Lógica: navegación por pasos con historial del navegador,
   progreso persistente, glosario, autodiagnóstico con ruta
   sugerida, casos con retroalimentación e intentos múltiples,
   plantilla con autoguardado, retroalimentación automática del
   borrador, lista de cotejo, descarga e impresión, y modo sin
   conexión. Sin dependencias externas.
   ============================================================ */
(function () {
  "use strict";

  var CLAVE = "ova-tic-tac-v1";

  /* ---------- Estado persistente ---------- */
  function estadoInicial() {
    return { paso: "bienvenida", maximo: 0, plantilla: {}, cotejo: {}, diagnostico: {}, casos: {} };
  }
  var estado = estadoInicial();
  try {
    var guardado = localStorage.getItem(CLAVE);
    if (guardado) estado = Object.assign(estado, JSON.parse(guardado));
  } catch (e) { /* sin almacenamiento: el OVA funciona igual en memoria */ }

  function persistir() {
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) {}
  }

  function escaparHtml(t) {
    var s = document.createElement("span");
    s.textContent = t == null ? "" : String(t);
    return s.innerHTML;
  }

  /* Texto en minúsculas y sin tildes, para comparar palabras clave */
  function normalizar(t) {
    return (t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  /* ---------- Recorrido ---------- */
  var PASOS = [
    { id: "bienvenida",     nombre: "Bienvenida", momento: 0 },
    { id: "m1-continuum",   nombre: "El continuo TIC–TAC", momento: 1 },
    { id: "m1-diagnostico", nombre: "¿Cómo usas hoy la tecnología?", momento: 1 },
    { id: "m2-criterios",   nombre: "Cuatro criterios para elegir", momento: 2 },
    { id: "m2-componentes", nombre: "Las tres piezas de una actividad", momento: 2 },
    { id: "m2-casos",       nombre: "Analiza tres casos", momento: 2 },
    { id: "m3-plantilla",   nombre: "Diseña tu actividad", momento: 3 },
    { id: "m3-revision",    nombre: "Revisa, descarga y reflexiona", momento: 3 },
    { id: "creditos",       nombre: "Créditos y licencia", momento: 0 }
  ];
  var MOMENTOS = ["", "Momento 1: Reconocer", "Momento 2: Aprender y practicar", "Momento 3: Crear"];

  /* Pista de progreso: un tramo por paso, con el color de su momento */
  var pista = document.getElementById("pista");
  PASOS.forEach(function (p) {
    var li = document.createElement("li");
    li.className = "tramo tramo-m" + p.momento;
    pista.appendChild(li);
  });

  /* Devuelve -1 si el id no es un paso (por ejemplo, #contenido) */
  function indicePaso(id) {
    for (var i = 0; i < PASOS.length; i++) if (PASOS[i].id === id) return i;
    return -1;
  }

  /* modoHistorial: "push" (por defecto) agrega una entrada al historial
     para que el botón «atrás» regrese al paso anterior; "replace" la
     reemplaza; "none" no toca el historial (al responder a «atrás»). */
  function irA(id, modoHistorial) {
    var idx = indicePaso(id);
    if (idx < 0) return;
    var seccion = document.querySelector('[data-paso="' + id + '"]');
    if (!seccion) return;
    document.querySelectorAll(".paso").forEach(function (s) { s.hidden = true; });
    seccion.hidden = false;
    var cambio = estado.paso !== id;
    estado.paso = id;
    if (idx > estado.maximo) estado.maximo = idx;
    persistir();

    /* Progreso */
    var pct = Math.round(((idx + 1) / PASOS.length) * 100);
    var cont = document.getElementById("progreso-barra-cont");
    cont.setAttribute("aria-valuenow", pct);
    cont.setAttribute("aria-valuetext", "Paso " + (idx + 1) + " de " + PASOS.length);
    pista.querySelectorAll(".tramo").forEach(function (t, i) {
      t.classList.toggle("hecho", i < idx);
      t.classList.toggle("actual", i === idx);
    });
    var momento = MOMENTOS[PASOS[idx].momento];
    document.getElementById("progreso-texto").innerHTML =
      "<span class='progreso-paso'>Paso " + (idx + 1) + " de " + PASOS.length + "</span> " +
      (momento ? "<span class='progreso-momento m" + PASOS[idx].momento + "'>" + momento + "</span> " : "") +
      "<span>" + PASOS[idx].nombre + "</span>";
    document.body.setAttribute("data-momento", PASOS[idx].momento);

    construirMenu();
    if (id === "m3-revision") mostrarRetroBorrador();

    var modo = modoHistorial || "push";
    try {
      if (modo === "push" && cambio) history.pushState({ paso: id }, "", "#" + id);
      else if (modo === "replace" || (modo === "push" && !cambio)) history.replaceState({ paso: id }, "", "#" + id);
    } catch (e) {}

    window.scrollTo({ top: 0, behavior: "auto" });
    var titulo = seccion.querySelector("h1, h2");
    if (titulo) { titulo.setAttribute("tabindex", "-1"); titulo.focus({ preventScroll: true }); }
  }

  /* Botones con data-goto (delegado: sirve también para los botones
     que se crean después, como los de la ruta sugerida) */
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-goto]");
    if (b) irA(b.getAttribute("data-goto"));
  });

  /* Enlace «Saltar al contenido»: lleva el foco al contenido sin
     agregar una entrada al historial del navegador */
  document.querySelector(".saltar").addEventListener("click", function (ev) {
    ev.preventDefault();
    var principal = document.getElementById("contenido");
    principal.focus();
    principal.scrollIntoView();
  });

  /* ---------- Paneles Menú / Ayuda ---------- */
  var botonMenu = document.getElementById("boton-menu");
  var botonAyuda = document.getElementById("boton-ayuda");
  var panelMenu = document.getElementById("panel-menu");
  var panelAyuda = document.getElementById("panel-ayuda");

  function cerrarPaneles() {
    panelMenu.hidden = true; panelAyuda.hidden = true;
    botonMenu.setAttribute("aria-expanded", "false");
    botonAyuda.setAttribute("aria-expanded", "false");
  }
  function alternarPanel(boton, panel) {
    var abierto = !panel.hidden;
    cerrarPaneles();
    if (!abierto) { panel.hidden = false; boton.setAttribute("aria-expanded", "true"); }
  }
  botonMenu.addEventListener("click", function () { alternarPanel(botonMenu, panelMenu); });
  botonAyuda.addEventListener("click", function () { alternarPanel(botonAyuda, panelAyuda); });
  document.addEventListener("click", function (ev) {
    if (!ev.target.closest(".panel") && !ev.target.closest(".menu-boton")) cerrarPaneles();
  });

  function construirMenu() {
    var lista = document.getElementById("lista-pasos");
    lista.innerHTML = "";
    var actual = indicePaso(estado.paso);
    PASOS.forEach(function (p, i) {
      var li = document.createElement("li");
      li.className = "menu-m" + p.momento;
      if (p.momento && (i === 0 || PASOS[i - 1].momento !== p.momento)) {
        var grupo = document.createElement("span");
        grupo.className = "menu-grupo";
        grupo.textContent = MOMENTOS[p.momento];
        li.appendChild(grupo);
      }
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = p.nombre;
      if (i === actual) { b.className = "actual"; b.setAttribute("aria-current", "step"); }
      if (i > estado.maximo) {
        b.disabled = true;
        b.title = "Aún no has llegado a este paso";
      } else {
        b.addEventListener("click", function () {
          cerrarPaneles();
          irA(p.id);
        });
      }
      li.appendChild(b);
      lista.appendChild(li);
    });
  }

  /* ---------- Reiniciar (computadores compartidos) ---------- */
  document.getElementById("btn-reiniciar").addEventListener("click", function () {
    if (!window.confirm("Esto borra tu avance, tus respuestas y tu actividad de este dispositivo. ¿Quieres continuar?")) return;
    try { localStorage.removeItem(CLAVE); } catch (e) {}
    location.replace(location.pathname + location.search);
  });

  /* ---------- Glosario ---------- */
  var GLOSARIO = {
    tic: { termino: "TIC (Tecnologías de la Información y la Comunicación)",
      definicion: "Cuando la tecnología se usa como apoyo de la clase, para proyectar, mostrar o consultar. La forma de enseñar y de aprender sigue igual. Lo único que cambia es el recurso." },
    tac: { termino: "TAC (Tecnologías para el Aprendizaje y el Conocimiento)",
      definicion: "Cuando los estudiantes usan la tecnología para aprender: crean, simulan, colaboran o muestran lo que entendieron. En este caso la actividad sí cambia." },
    tep: { termino: "TEP (Tecnologías para el Empoderamiento y la Participación)",
      definicion: "El nivel más amplio del continuo. La tecnología cambia las prácticas y la cultura de toda la comunidad educativa, no solo de una clase." },
    proposito: { termino: "Propósito pedagógico",
      definicion: "Lo que quieres que tus estudiantes logren y por qué. Es lo que justifica cada decisión de la clase, y por eso se define antes de elegir la herramienta." },
    objetivo: { termino: "Objetivo de aprendizaje",
      definicion: "Lo que los estudiantes podrán hacer al terminar la actividad, dicho de forma que se pueda ver: «podrán resolver…», «podrán explicar…», «podrán crear…»." }
  };

  var dl = document.getElementById("glosario-lista");
  Object.keys(GLOSARIO).forEach(function (k) {
    var dt = document.createElement("dt"); dt.textContent = GLOSARIO[k].termino;
    var dd = document.createElement("dd"); dd.textContent = GLOSARIO[k].definicion;
    dl.appendChild(dt); dl.appendChild(dd);
  });

  /* Definición emergente de un término del texto. Se anuncia a los
     lectores de pantalla y se cierra con Esc o con un clic fuera. */
  var popover = document.createElement("div");
  popover.className = "panel definicion";
  popover.id = "definicion-termino";
  popover.setAttribute("role", "status");
  popover.style.display = "none";
  document.body.appendChild(popover);
  var terminoActivo = null;

  function cerrarDefinicion(devolverFoco) {
    if (popover.style.display === "none") return;
    popover.style.display = "none";
    if (terminoActivo) {
      terminoActivo.setAttribute("aria-expanded", "false");
      if (devolverFoco) terminoActivo.focus();
    }
    terminoActivo = null;
  }

  document.querySelectorAll(".termino").forEach(function (b) {
    b.setAttribute("aria-expanded", "false");
    b.setAttribute("aria-controls", "definicion-termino");
    b.addEventListener("click", function (ev) {
      ev.stopPropagation();
      if (terminoActivo === b) { cerrarDefinicion(false); return; }
      cerrarDefinicion(false);
      var g = GLOSARIO[b.getAttribute("data-termino")];
      if (!g) return;
      popover.innerHTML = "<p class='panel-titulo'>" + escaparHtml(g.termino) + "</p><p>" + escaparHtml(g.definicion) + "</p>";
      var r = b.getBoundingClientRect();
      popover.style.display = "block";
      var ancho = popover.offsetWidth;
      popover.style.top = (r.bottom + window.scrollY + 8) + "px";
      popover.style.left = Math.max(10, Math.min(r.left + window.scrollX, window.scrollX + document.documentElement.clientWidth - ancho - 10)) + "px";
      b.setAttribute("aria-expanded", "true");
      terminoActivo = b;
    });
  });
  document.addEventListener("click", function (ev) {
    if (!ev.target.closest(".termino") && !ev.target.closest(".definicion")) cerrarDefinicion(false);
  });

  /* Esc cierra la definición y los paneles, y devuelve el foco */
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Escape") return;
    if (popover.style.display !== "none") { cerrarDefinicion(true); return; }
    if (!panelMenu.hidden) { cerrarPaneles(); botonMenu.focus(); return; }
    if (!panelAyuda.hidden) { cerrarPaneles(); botonAyuda.focus(); }
  });

  /* ---------- Video de bienvenida (opcional) ---------- */
  (function () {
    var marco = document.getElementById("video-bienvenida");
    var src = marco && marco.getAttribute("data-video");
    if (!src) return;
    var iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = "Video de bienvenida al recurso Del TIC al TAC";
    iframe.loading = "lazy";
    iframe.allow = "accelerometer; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    marco.appendChild(iframe);
    marco.hidden = false;
    document.getElementById("titulo-mensaje").textContent = "Versión en texto del video";
  })();

  /* ---------- Autodiagnóstico y ruta sugerida ---------- */
  var ESCALA = ["Nunca", "A veces", "Casi siempre", "Siempre"];
  var PREGUNTAS = ["d1", "d2", "d3", "d4", "d5"];
  document.querySelectorAll(".opciones-escala").forEach(function (cont) {
    var nombre = cont.getAttribute("data-pregunta");
    ESCALA.forEach(function (etiqueta, i) {
      var id = nombre + "-" + i;
      var label = document.createElement("label");
      label.setAttribute("for", id);
      var input = document.createElement("input");
      input.type = "radio"; input.name = nombre; input.id = id; input.value = i + 1;
      if (estado.diagnostico[nombre] === i + 1) input.checked = true;
      input.addEventListener("change", function () {
        estado.diagnostico[nombre] = i + 1;
        persistir();
      });
      label.appendChild(input);
      label.appendChild(document.createTextNode(etiqueta));
      cont.appendChild(label);
    });
  });

  var RUTAS = {
    inicial: {
      titulo: "Tu punto de partida: la tecnología como apoyo",
      texto: "Por ahora, la tecnología aparece en tu clase sobre todo para mostrar contenido. Es un punto de partida muy común, y justo para eso hicimos este recurso. En el Momento 2 vas a encontrar criterios sencillos para dar el siguiente paso, sin necesidad de ser experto en herramientas.",
      ruta: "Te sugerimos hacer el recorrido completo, paso a paso.",
      botones: [{ paso: "m2-criterios", texto: "Seguir con los cuatro criterios", principal: true }]
    },
    transicion: {
      titulo: "Tu punto de partida: en transición",
      texto: "Tus estudiantes ya hacen cosas con la tecnología en algunas clases, aunque no siempre con un propósito planeado. No tienes que empezar de cero. Lo que falta es volver conscientes esas decisiones: elegir la herramienta después del objetivo y poder explicar por qué.",
      ruta: "Te sugerimos repasar los cuatro criterios y las tres piezas. Si ya los conoces, puedes ir directo a los casos.",
      botones: [
        { paso: "m2-criterios", texto: "Repasar los criterios", principal: true },
        { paso: "m2-casos", texto: "Ir directo a los casos" }
      ]
    },
    integracion: {
      titulo: "Tu punto de partida: ya integras la tecnología",
      texto: "Ya usas la tecnología con intención pedagógica en varias de tus clases. Este recurso te puede servir para ordenar lo que haces, tener más argumentos para justificar tus diseños y compartir tu experiencia con tus colegas.",
      ruta: "Te sugerimos poner a prueba tu criterio con los casos o pasar directo a diseñar tu actividad.",
      botones: [
        { paso: "m2-casos", texto: "Ir directo a los casos", principal: true },
        { paso: "m3-plantilla", texto: "Ir directo a diseñar mi actividad" }
      ]
    }
  };

  function mostrarDiagnostico(desplazar) {
    var total = 0, respondidas = 0;
    PREGUNTAS.forEach(function (n) {
      var sel = document.querySelector('input[name="' + n + '"]:checked');
      if (sel) { total += parseInt(sel.value, 10); respondidas++; estado.diagnostico[n] = parseInt(sel.value, 10); }
    });
    persistir();
    var salida = document.getElementById("resultado-diagnostico");
    salida.hidden = false;
    if (respondidas < PREGUNTAS.length) {
      salida.innerHTML = "<strong>Te faltan " + (PREGUNTAS.length - respondidas) + " afirmaciones por responder.</strong>Responde las cinco para ver tu resultado y la ruta que te sugerimos.";
      var primera = PREGUNTAS.filter(function (n) { return !document.querySelector('input[name="' + n + '"]:checked'); })[0];
      if (primera && desplazar) document.getElementById(primera + "-0").focus();
      return;
    }
    var r = total <= 9 ? RUTAS.inicial : (total <= 14 ? RUTAS.transicion : RUTAS.integracion);
    var botones = r.botones.map(function (b) {
      return "<button type='button' class='btn" + (b.principal ? " btn-principal" : "") + "' data-goto='" + b.paso + "'>" + escaparHtml(b.texto) + "&nbsp;<span aria-hidden='true'>→</span></button>";
    }).join("");
    salida.innerHTML = "<strong>" + r.titulo + "</strong><p>" + r.texto + "</p>" +
      "<p class='ruta-sugerida'>" + r.ruta + "</p>" +
      "<div class='ruta-acciones'>" + botones + "</div>" +
      "<p class='nota'>Los demás pasos siguen disponibles en el <strong>Menú</strong>. Este resultado es solo una guía, y nadie más lo ve.</p>";
    if (desplazar) salida.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  document.getElementById("form-diagnostico").addEventListener("submit", function (ev) {
    ev.preventDefault();
    mostrarDiagnostico(true);
  });
  if (PREGUNTAS.every(function (n) { return estado.diagnostico[n]; })) mostrarDiagnostico(false);

  /* ---------- Casos con retroalimentación ---------- */
  var CASOS = [
    {
      asignatura: "Matemáticas · Sexto",
      escenario: "La profesora Ángela proyecta un video de 15 minutos sobre fracciones equivalentes. Los estudiantes lo ven en silencio y luego resuelven en el cuaderno los ejercicios del libro, como siempre. Al final, ella pregunta si el video les gustó.",
      pregunta: "¿En qué nivel del continuo se ubica principalmente este uso de la tecnología?",
      opciones: [
        { texto: "TAC, porque los estudiantes usaron un recurso digital para aprender fracciones.",
          correcta: false,
          retro: "Fíjate en lo que hicieron los estudiantes: vieron un video y resolvieron los mismos ejercicios de siempre. La herramienta es digital, pero la forma de aprender no cambió. Lo que define el uso TAC es lo que los estudiantes hacen con la tecnología." },
        { texto: "TIC, porque la tecnología apoyó la clase, pero la forma de aprender siguió siendo la misma.",
          correcta: true,
          retro: "El video es un apoyo: la profesora podría haber explicado lo mismo en el tablero y la clase no habría cambiado. Para pasar a TAC, podría pedirles que usaran una herramienta interactiva de fracciones, que descubrieran las equivalencias por su cuenta y que las explicaran con sus propios ejemplos." },
        { texto: "TEP, porque el video transforma la cultura del aula.",
          correcta: false,
          retro: "TEP es el nivel de toda la institución, cuando cambian las prácticas de la comunidad educativa. Un video en una clase está lejos de eso. Intenta otra vez y fíjate si cambió o no lo que hacían los estudiantes." }
      ]
    },
    {
      asignatura: "Lengua castellana · Séptimo",
      escenario: "El profesor Mario pide a sus estudiantes escribir un cuento corto en un procesador de texto en línea y publicarlo en el blog del curso. Cada estudiante debe leer los cuentos de dos compañeros y dejar comentarios constructivos, que el profesor evalúa con una rúbrica de calidad de la retroalimentación.",
      pregunta: "¿Qué es lo que convierte esta actividad en un uso TAC?",
      opciones: [
        { texto: "Que usan internet y computadores en lugar de papel y lápiz.",
          correcta: false,
          retro: "Eso habla del medio, no del aprendizaje. Escribir en el computador en lugar del cuaderno es hacer la misma tarea en otro formato. Piensa en qué permite la tecnología que antes no pasaba." },
        { texto: "Que el blog es una herramienta más moderna que el cuaderno.",
          correcta: false,
          retro: "Que algo sea moderno no lo hace mejor para aprender. Importa más la pertinencia que lo llamativo. ¿Qué pueden hacer los estudiantes con el blog que no podrían hacer con el cuaderno?" },
        { texto: "Que la tecnología hace posible crear, publicar y colaborar con una audiencia real, y la evaluación se fija justo en eso.",
          correcta: true,
          retro: "Aquí las tres piezas coinciden: el objetivo es escribir y retroalimentar, la actividad es crear y comentar en el blog, y la evaluación revisa los comentarios con una rúbrica. Además, la tecnología aporta algo nuevo: los textos tienen lectores reales. Ese es el valor agregado." }
      ]
    },
    {
      asignatura: "Ciencias Naturales · Sexto",
      escenario: "La docente Patricia encontró un simulador de ecosistemas muy completo, pero exige una licencia de pago y los computadores del colegio no soportan la versión web. Decide pedir a los estudiantes que lo descarguen en casa con ayuda de sus padres.",
      pregunta: "¿Qué criterio de selección está fallando en esta decisión?",
      opciones: [
        { texto: "El propósito: el simulador no tiene relación con el aprendizaje de ecosistemas.",
          correcta: false,
          retro: "En realidad el propósito está bien, porque un simulador de ecosistemas sí sirve para aprender sobre ecosistemas. El problema está en otro lado. Vuelve a leer las condiciones: licencia de pago, equipos que no lo soportan, descarga en casa…" },
        { texto: "La viabilidad: la herramienta no funciona en las condiciones reales del colegio ni garantiza acceso equitativo.",
          correcta: true,
          retro: "La idea pedagógica era buena, pero una herramienta que no funciona en los equipos del colegio, que cuesta y que depende de lo que cada familia tenga en casa deja estudiantes por fuera, y lo más probable es que no funcione. No hay que abandonar la idea: basta con buscar un simulador gratuito que corra en los equipos del colegio." },
        { texto: "El valor agregado: la simulación podría hacerse igual con un dibujo en el tablero.",
          correcta: false,
          retro: "Un dibujo en el tablero no deja experimentar con las variables de un ecosistema, así que el simulador sí aporta valor agregado. Aquí el problema no es pedagógico, es práctico. Intenta otra vez." }
      ]
    }
  ];

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
      preg.id = "caso-pregunta-" + idx;
      preg.textContent = caso.pregunta;

      var ops = document.createElement("div");
      ops.className = "caso-opciones";
      ops.setAttribute("role", "group");
      ops.setAttribute("aria-labelledby", preg.id);
      caso.opciones.forEach(function (op, oi) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "caso-opcion";
        b.textContent = op.texto;
        b.addEventListener("click", function () { responderCaso(idx, oi, div, true); });
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

      /* Restaurar casos ya resueltos en visitas anteriores */
      if (estado.casos[idx]) {
        var correcta = 0;
        caso.opciones.forEach(function (op, oi) { if (op.correcta) correcta = oi; });
        responderCaso(idx, correcta, div, false);
      }
    });
  }

  function responderCaso(idx, oi, div, interactivo) {
    var caso = CASOS[idx];
    var op = caso.opciones[oi];
    var retro = div.querySelector(".retroalimentacion");
    var acciones = div.querySelector(".caso-acciones");
    var botones = div.querySelectorAll(".caso-opcion");

    botones.forEach(function (b, i) {
      b.disabled = true;
      if (i === oi) {
        b.classList.add(op.correcta ? "correcta" : "incorrecta");
        b.setAttribute("aria-label", (op.correcta ? "Respuesta correcta: " : "Respuesta elegida, no es la mejor: ") + caso.opciones[i].texto);
      }
    });

    retro.hidden = false;
    acciones.innerHTML = "";
    if (op.correcta) {
      retro.className = "retroalimentacion exito";
      retro.innerHTML = "<strong>✔ Muy bien.</strong>" + escaparHtml(op.retro);
      estado.casos[idx] = true;
      persistir();
      actualizarCierreCasos(interactivo);
    } else {
      retro.className = "retroalimentacion reintento";
      retro.innerHTML = "<strong>Todavía no es la mejor opción.</strong>" + escaparHtml(op.retro);
      var re = document.createElement("button");
      re.type = "button";
      re.className = "btn";
      re.textContent = "Reintentar este caso";
      re.addEventListener("click", function () {
        botones.forEach(function (b) {
          b.disabled = false;
          b.classList.remove("correcta", "incorrecta");
          b.removeAttribute("aria-label");
        });
        retro.hidden = true;
        acciones.innerHTML = "";
        botones[0].focus();
      });
      acciones.appendChild(re);
    }
    if (interactivo) {
      retro.scrollIntoView({ behavior: "smooth", block: "nearest" });
      if (!op.correcta) acciones.querySelector("button").focus({ preventScroll: true });
    }
  }

  function actualizarCierreCasos(desplazar) {
    var resueltos = CASOS.filter(function (c, i) { return estado.casos[i]; }).length;
    var cierre = document.getElementById("casos-cierre");
    if (resueltos === CASOS.length) {
      cierre.hidden = false;
      if (desplazar) cierre.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  construirCasos();

  /* ---------- Plantilla: autoguardado ---------- */
  var CAMPOS = ["p-nombre", "p-asignatura", "p-grado", "p-objetivo", "p-actividad", "p-herramienta", "p-justificacion", "p-evaluacion"];
  CAMPOS.forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (estado.plantilla[id]) el.value = estado.plantilla[id];
    var evento = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(evento, function () {
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

  /* ---------- Retroalimentación automática del borrador ----------
     Revisión orientativa por palabras clave, alineada con los cuatro
     criterios y las tres piezas que se trabajan en el Momento 2. */
  var VERBOS_OBSERVABLES = /\b(resolv|resuelv|explic|crea|cre[ae]n|interpret|compar|argument|disen|identific|clasific|formul|constru|represent|analiz|describ|elabor|produc|propon|calcul|redact|escrib|investig|evalu|justific|organiz|grab|demostr|relacion|distingu|diferenci|model|simul|debat|sintetiz|resum|ejemplific|graf|registr|expon|expli)\w*/g;
  var VERBOS_VAGOS = /\b(comprend|entiend|entend|conozc|conoc|sab[eir]|aprend|apropi|reflexion)\w*/;
  var CRITERIOS = [
    { nombre: "propósito", patron: /proposito|objetivo|para que (los estudiantes|aprendan)|permite (a los estudiantes|que)/ },
    { nombre: "pertinencia", patron: /pertinen|mejor opcion|se ajusta|adecuad|apropiad|mas sencill/ },
    { nombre: "viabilidad", patron: /viab|gratuit|gratis|libre acceso|conectividad|equipos|sin instal|sin conexion|celular|funciona en|disponible/ },
    { nombre: "valor agregado", patron: /valor agregado|sin (la )?tecnologia|no (se )?podria|no (se )?podrian|antes no|aporta|nuevo|nueva|audiencia|colabor|en tiempo real/ }
  ];

  function revisarBorrador(d) {
    var items = [];
    var obj = normalizar(d["p-objetivo"]);
    var act = normalizar(d["p-actividad"]);
    var herr = normalizar(d["p-herramienta"]);
    var just = normalizar(d["p-justificacion"]);
    var eva = normalizar(d["p-evaluacion"]);

    /* Datos básicos */
    var faltanDatos = [];
    if (!d["p-asignatura"]) faltanDatos.push("asignatura");
    if (!d["p-grado"]) faltanDatos.push("grado");
    if (faltanDatos.length) items.push({ tipo: "falta", texto: "Completa los datos de la clase: " + faltanDatos.join(" y ") + "." });

    /* A. Objetivo */
    var verbosObj = obj.match(VERBOS_OBSERVABLES) || [];
    if (!obj) {
      items.push({ tipo: "falta", texto: "<strong>Objetivo:</strong> todavía está vacío. Empieza por aquí, porque la herramienta se elige después del objetivo." });
    } else if (verbosObj.length) {
      items.push({ tipo: "ok", texto: "<strong>Objetivo:</strong> usa una acción que se puede ver («" + escaparHtml(verbosObj[0]) + "»), así vas a poder saber si se logró." });
    } else if (VERBOS_VAGOS.test(obj)) {
      items.push({ tipo: "mejora", texto: "<strong>Objetivo:</strong> usa verbos difíciles de ver en la práctica, como «comprender» o «conocer». Prueba con uno como resolver, explicar, crear, comparar o argumentar." });
    } else {
      items.push({ tipo: "mejora", texto: "<strong>Objetivo:</strong> no encontramos una acción que se pueda ver. Escríbelo como «Los estudiantes podrán…» seguido de un verbo como resolver, explicar o crear." });
    }

    /* B. Actividad y herramienta */
    if (!act) {
      items.push({ tipo: "falta", texto: "<strong>Actividad:</strong> todavía está vacía. Describe paso a paso qué van a hacer los estudiantes." });
    } else if (act.length < 80) {
      items.push({ tipo: "mejora", texto: "<strong>Actividad:</strong> está muy corta. Agrega los pasos que van a seguir los estudiantes y qué van a entregar al final." });
    } else {
      items.push({ tipo: "ok", texto: "<strong>Actividad:</strong> tiene suficiente detalle para que otra persona entienda qué van a hacer los estudiantes." });
    }

    if (!herr) {
      items.push({ tipo: "falta", texto: "<strong>Herramienta:</strong> todavía no la has elegido." });
    } else if (act) {
      var palabrasHerr = herr.split(/[^a-z0-9ñ]+/).filter(function (p) { return p.length > 3 && ["hoja", "hojas", "google", "calculo", "linea", "editor", "herramienta"].indexOf(p) === -1; });
      var mencionada = palabrasHerr.length === 0 || palabrasHerr.some(function (p) { return act.indexOf(p) !== -1; }) || /herramienta|aplicacion|plataforma/.test(act);
      if (mencionada) {
        items.push({ tipo: "ok", texto: "<strong>Herramienta:</strong> aparece dentro de la actividad, con un papel concreto." });
      } else {
        items.push({ tipo: "mejora", texto: "<strong>Herramienta:</strong> elegiste «" + escaparHtml(d["p-herramienta"]) + "», pero la actividad no dice para qué la van a usar los estudiantes. Nómbrala en el paso donde la necesitan." });
      }
    }

    /* Justificación con criterios */
    var encontrados = CRITERIOS.filter(function (c) { return c.patron.test(just); }).map(function (c) { return c.nombre; });
    if (!just) {
      items.push({ tipo: "falta", texto: "<strong>Justificación:</strong> todavía está vacía. Explica por qué elegiste la herramienta usando por lo menos dos de los cuatro criterios." });
    } else if (encontrados.length >= 2) {
      items.push({ tipo: "ok", texto: "<strong>Justificación:</strong> se apoya en " + encontrados.length + " criterios (" + encontrados.join(", ") + ")." });
    } else {
      var faltan = CRITERIOS.map(function (c) { return c.nombre; }).filter(function (n) { return encontrados.indexOf(n) === -1; });
      items.push({ tipo: "mejora", texto: "<strong>Justificación:</strong> " + (encontrados.length ? "solo encontramos el criterio de " + encontrados[0] + "." : "no encontramos ninguno de los cuatro criterios.") + " Agrega por lo menos otro: " + faltan.join(", ") + "." });
    }

    /* C. Evaluación */
    if (!eva) {
      items.push({ tipo: "falta", texto: "<strong>Evaluación:</strong> todavía está vacía. ¿Qué evidencia vas a recoger y cómo la vas a valorar?" });
    } else {
      var tieneCriterios = /criteri|rubrica|valorar|valorare|lista de cotejo|indicador|nivel|que (la|el|las|los) .* (sea|este|represente|se apoye)/.test(eva);
      if (tieneCriterios) {
        items.push({ tipo: "ok", texto: "<strong>Evaluación:</strong> dice qué vas a tener en cuenta para valorar la evidencia." });
      } else {
        items.push({ tipo: "mejora", texto: "<strong>Evaluación:</strong> dice qué evidencia vas a recoger, pero no cómo la vas a valorar. Agrega dos o tres aspectos concretos o una rúbrica sencilla." });
      }
      /* Alineación objetivo–evaluación: ¿la evaluación mira la acción del objetivo? */
      if (verbosObj.length) {
        var raices = verbosObj.map(function (v) { return v.replace(VERBOS_OBSERVABLES, "$1"); });
        var alineada = raices.some(function (r) { return new RegExp("\\b" + r).test(eva); });
        if (alineada) {
          items.push({ tipo: "ok", texto: "<strong>Alineación:</strong> la evaluación se fija en la misma acción que plantea el objetivo. Las piezas coinciden." });
        } else {
          items.push({ tipo: "mejora", texto: "<strong>Alineación:</strong> tu objetivo habla de «" + escaparHtml(verbosObj[0]) + "», pero la evaluación no lo menciona. Revisa que estés valorando justo eso." });
        }
      }
    }
    return items;
  }

  var ICONOS = { ok: "✔", mejora: "✎", falta: "○" };
  var ETIQUETAS = { ok: "Va bien", mejora: "Puedes mejorarlo", falta: "Falta" };

  function mostrarRetroBorrador() {
    var items = revisarBorrador(datosPlantilla());
    var bien = items.filter(function (i) { return i.tipo === "ok"; }).length;
    var cont = document.getElementById("retro-borrador");
    var resumen = bien === items.length
      ? "<p class='retro-resumen'><strong>Tu borrador va bien en los " + items.length + " aspectos que revisamos.</strong> Confírmalo con la lista de abajo.</p>"
      : "<p class='retro-resumen'><strong>" + bien + " de " + items.length + " aspectos van bien.</strong> Revisa los demás y ajústalos con el botón Anterior.</p>";
    cont.innerHTML = resumen + "<ul class='retro-lista'>" + items.map(function (i) {
      return "<li class='retro-item " + i.tipo + "'><span class='retro-icono' aria-hidden='true'>" + ICONOS[i.tipo] + "</span>" +
        "<span><span class='retro-etiqueta'>" + ETIQUETAS[i.tipo] + ".</span> " + i.texto + "</span></li>";
    }).join("") + "</ul>";
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
      salida.innerHTML = "<strong>✔ Tu diseño cumple toda la lista.</strong>Tu actividad tiene un propósito claro, una herramienta bien justificada y una evaluación que coincide con el objetivo. Ya puedes descargarla y compartirla con el docente insignia.";
    } else {
      salida.innerHTML = "<strong>Llevas " + marcados + " de " + total + " criterios.</strong>Vuelve a la plantilla con el botón Anterior y ajusta lo que falta. Tus marcas quedan guardadas.";
    }
  }
  actualizarCotejo();

  /* ---------- Descarga en texto ---------- */
  function textoActividad() {
    var d = datosPlantilla();
    var linea = "----------------------------------------";
    return [
      "DEL TIC AL TAC — MI ACTIVIDAD DE ENSEÑANZA CON TAC",
      "OVA de formación docente · Colegio Colsubsidio Maiporé",
      "Grupo 9 · Maestría MITE · Universidad El Bosque",
      linea,
      "Docente:    " + (d["p-nombre"] || "(sin diligenciar)"),
      "Asignatura: " + (d["p-asignatura"] || "(sin diligenciar)"),
      "Grado:      " + (d["p-grado"] || "(sin diligenciar)"),
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
      "Diseñaste esta actividad en el OVA Del TIC al TAC.",
      "Compártela con el docente insignia para recibir",
      "comentarios en los espacios de formación.",
      "Licencia del OVA: CC BY-NC-SA 4.0"
    ].join("\r\n");
  }

  function nombreArchivo() {
    var n = normalizar(datosPlantilla()["p-nombre"]).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return "mi-actividad-tac" + (n ? "-" + n : "") + ".txt";
  }

  document.getElementById("btn-descargar").addEventListener("click", function () {
    /* El BOM ayuda a que el Bloc de notas de Windows muestre bien las tildes */
    var blob = new Blob(["﻿" + textoActividad()], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  });

  /* ---------- Impresión / PDF ---------- */
  var SECCIONES_IMPRESION = [
    { id: "p-objetivo", titulo: "A. Objetivo de aprendizaje", ayuda: "¿Qué van a aprender? Empieza con «Los estudiantes podrán…» y usa una acción que se pueda ver." },
    { id: "p-actividad", titulo: "B. Actividad", ayuda: "¿Qué van a hacer los estudiantes? Describe la tarea paso a paso y qué van a entregar." },
    { id: "p-herramienta", titulo: "Herramienta digital elegida", ayuda: "Que sea gratuita o de libre acceso, y que funcione con los equipos y el internet del colegio." },
    { id: "p-justificacion", titulo: "Justificación (criterios)", ayuda: "¿Por qué elegiste esa herramienta? Usa por lo menos dos criterios: propósito, pertinencia, viabilidad o valor agregado." },
    { id: "p-evaluacion", titulo: "C. Evaluación", ayuda: "¿Cómo vas a saber que aprendieron? Cuenta qué evidencia vas a recoger y cómo la vas a valorar." }
  ];

  function prepararImpresion(enBlanco) {
    var d = enBlanco ? {} : datosPlantilla();
    var area = document.getElementById("area-impresion");
    function valor(id) {
      if (enBlanco) return "<div class='linea-blanco'></div>";
      return "<p>" + escaparHtml(d[id] || "—") + "</p>";
    }
    var html =
      "<h1>" + (enBlanco ? "Plantilla: mi actividad de enseñanza con TAC" : "Mi actividad de enseñanza con TAC") + "</h1>" +
      "<p class='doc-meta'>Del TIC al TAC · OVA de formación docente · Colegio Colsubsidio Maiporé · Grupo 9 MITE</p>";
    if (enBlanco) {
      html += "<p><strong>Docente:</strong> ______________________ &nbsp; <strong>Asignatura:</strong> ________________ &nbsp; <strong>Grado:</strong> __________</p>";
    } else {
      html += "<p><strong>Docente:</strong> " + escaparHtml(d["p-nombre"] || "—") + " &nbsp;·&nbsp; <strong>Asignatura:</strong> " + escaparHtml(d["p-asignatura"] || "—") + " &nbsp;·&nbsp; <strong>Grado:</strong> " + escaparHtml(d["p-grado"] || "—") + "</p>";
    }
    SECCIONES_IMPRESION.forEach(function (s) {
      html += "<h2>" + s.titulo + "</h2>";
      if (enBlanco) html += "<p class='doc-ayuda'>" + s.ayuda + "</p>";
      html += valor(s.id);
    });
    html += enBlanco
      ? "<p class='doc-meta'>Cuando tengas internet, pasa tu diseño al OVA para que lo revise automáticamente. Licencia CC BY-NC-SA 4.0</p>"
      : "<p class='doc-meta'>Evidencia del recorrido por el OVA · Licencia CC BY-NC-SA 4.0</p>";
    area.innerHTML = html;
  }

  var impresionPreparada = false;
  function imprimir(enBlanco) {
    prepararImpresion(enBlanco);
    impresionPreparada = true;
    window.print();
  }
  document.getElementById("btn-imprimir").addEventListener("click", function () { imprimir(false); });
  document.getElementById("btn-plantilla-blanco").addEventListener("click", function () { imprimir(true); });
  /* Si se imprime con Ctrl+P / Cmd+P, sale la actividad actual en vez de una página en blanco */
  window.addEventListener("beforeprint", function () {
    if (!impresionPreparada) prepararImpresion(false);
  });
  window.addEventListener("afterprint", function () { impresionPreparada = false; });

  /* ---------- Inicio ---------- */
  var hashInicial = (location.hash || "").replace("#", "");
  var pasoInicial = indicePaso(estado.paso) >= 0 ? estado.paso : "bienvenida";
  var idxHash = indicePaso(hashInicial);
  if (idxHash >= 0 && idxHash <= estado.maximo) pasoInicial = hashInicial;
  irA(pasoInicial, "replace");

  /* Botón «atrás» / «adelante» del navegador */
  window.addEventListener("popstate", function (ev) {
    var id = (ev.state && ev.state.paso) || (location.hash || "").replace("#", "");
    var idx = indicePaso(id);
    if (idx >= 0 && idx <= estado.maximo && id !== estado.paso) irA(id, "none");
  });

  /* ---------- Modo sin conexión ---------- */
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
