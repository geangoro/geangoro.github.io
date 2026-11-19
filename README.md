# Del TIC al TAC

**Objeto Virtual de Aprendizaje (OVA)**: *Diseña tu actividad de clase con propósito pedagógico.*

Recurso de formación para docentes de sexto y séptimo del Colegio Colsubsidio Maiporé, creado por un grupo de trabajo de la Maestría en Innovación y Tecnologías para la Educación (MITE), Universidad El Bosque.

**Autores:** Angie Johana Álvarez Marín, Tania Carolina Galindo Vargas, Daniel Ramiro Salazar Mendoza, Germán Andrés Gómez Rodríguez y Omaira María del Pilar Ramírez.

Enlace del OVA: **https://geangoro.github.io/**

## Estructura

```
index.html      Página única con todo el recorrido (ruta, tres momentos,
                revisión entre pares, fundamentos y créditos)
css/styles.css  Estilos (accesibilidad, contraste AA, impresión)
js/app.js       Lógica (navegación, progreso, ruta sugerida, casos,
                plantilla, retroalimentación automática, descarga)
images/         Infografía del recorrido para elegir una herramienta
documents/      Resultado de aprendizaje y rúbrica formativa (Word)
sw.js           Modo sin conexión (copia del OVA en el navegador)
LICENSE         Licencia CC BY-NC-SA 4.0
```

No requiere servidor, base de datos ni dependencias. Funciona abriendo
`index.html` en cualquier navegador. Publicado en GitHub Pages, después de la
primera visita también funciona sin conexión en ese mismo navegador.

## Qué hace el OVA

- **Resultado de aprendizaje y ruta completa** de la experiencia (una semana,
  modelo híbrido de tipología 3 con aula invertida): entorno digital antes del
  encuentro, aula presencial con el facilitador (docente insignia) y
  continuidad en el entorno digital, con la modalidad, temporalidad y espacio
  de cada etapa. La experiencia termina con el ajuste de la guía; no incluye
  su implementación con estudiantes.
- **Herramientas tecnológicas** (OVA, aula virtual institucional en Google
  Classroom, Moodle o Colegium con foro de dudas y tablero colaborativo,
  correo institucional y videoconferencia por Google Meet, Zoom o Microsoft
  Teams) con la función de cada una, y la ficha de integración didáctica.
- **Revisión entre pares en el tablero colaborativo**: cada docente publica
  su aporte según el rol asignado y retroalimenta el aporte de dos compañeros.
- **Recorrido en tres momentos** (reconocer, aprender y practicar, crear), con
  menú, barra de progreso y soporte del botón «atrás» del navegador.
- **Autodiagnóstico con ruta sugerida**: según el resultado, propone el
  recorrido completo o ir directo a los casos o a la plantilla.
- **Tres casos** con retroalimentación inmediata e intentos ilimitados.
- **Plantilla guiada** con autoguardado y **retroalimentación automática** del
  borrador (objetivo observable, criterios de la justificación, alineación
  objetivo–evaluación).
- **Lista de cotejo** para la primera revisión personal y **rúbrica formativa**
  visible como tabla (con descarga en Word) para la autoevaluación y la
  revisión entre pares.
- Descarga del borrador en PDF o texto, y plantilla en blanco para imprimir y
  trabajar sin conexión.
- **Instrucciones para la revisión entre pares** (autor y revisor) y
  **fundamentos de la ruta**: tabla de los cinco tipos de mediación
  (pedagógica, didáctica, evaluativa, organizativa y comunicativa) con enlaces
  a cada elemento, origen de los cuatro criterios de selección (elaboración propia
  derivada de TPACK, DUA y SAMR), fases de Design Thinking con sus evidencias,
  aplicación del DUA y referencias. Los fundamentos y los créditos se pueden
  consultar en cualquier momento desde el menú o el pie de página.
- **Reinicio del avance** desde el panel Ayuda, pensado para computadores
  compartidos.
- **Videos de apoyo** en la bienvenida y en el Momento 1, una **encuesta
  inicial opcional** en Google Forms y una **infografía** con un ejemplo
  completo de selección de herramienta (con versión en texto y enlace a Canva).

## Agregar o cambiar un video

En `index.html`, cada video es un bloque como este. Cambia el ID del video en
`data-video` y su nombre en `data-titulo`:

```html
<div class="video-marco" data-video="https://www.youtube-nocookie.com/embed/ID_DEL_VIDEO" data-titulo="Video: nombre del video" hidden></div>
```

Para un video corto (*short*) vertical, agrega la clase `video-vertical`.
Los videos necesitan internet; sin conexión, el OVA muestra un aviso en su
lugar. Recuerda dar el crédito del video en la sección «Recursos utilizados».

## Publicar cambios

Este repositorio ya está configurado para GitHub Pages (rama `main`, carpeta
raíz). Cada vez que subas cambios a `main`, el sitio se actualiza en uno o dos
minutos.

El modo sin conexión siempre pide primero la versión más reciente cuando hay
internet, así que los cambios llegan a los docentes sin pasos adicionales.

## Enlaces institucionales pendientes

El OVA describe la función del aula virtual, el tablero colaborativo, el
correo institucional y la videoconferencia, pero no enlaza a ningún aula,
tablero o sesión. Cuando el facilitador tenga los enlaces reales, se pueden agregar en el paso «La ruta completa de la
experiencia» (`index.html`, sección `#herramientas-comunicacion`).
