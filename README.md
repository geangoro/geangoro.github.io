# Del TIC al TAC

**Objeto Virtual de Aprendizaje (OVA)**: *Diseña tu actividad de clase con propósito pedagógico.*

Recurso de formación para docentes de sexto y séptimo del Colegio Colsubsidio Maiporé, creado por el Grupo 9 de la Maestría en Innovación Educativa Mediada por TIC (MITE), Universidad El Bosque.

Enlace del OVA: **https://geangoro.github.io/**

## Estructura

```
index.html      Página única con todo el recorrido (tres momentos + créditos)
css/styles.css  Estilos (accesibilidad, contraste AA, impresión)
js/app.js       Lógica (navegación, progreso, ruta sugerida, casos,
                plantilla, retroalimentación automática, descarga)
sw.js           Modo sin conexión (copia del OVA en el navegador)
LICENSE         Licencia CC BY-NC-SA 4.0
```

No requiere servidor, base de datos ni dependencias. Funciona abriendo
`index.html` en cualquier navegador. Publicado en GitHub Pages, después de la
primera visita también funciona sin conexión en ese mismo navegador.

## Qué hace el OVA

- **Recorrido en tres momentos** (reconocer, aprender y practicar, crear), con
  menú, barra de progreso y soporte del botón «atrás» del navegador.
- **Autodiagnóstico con ruta sugerida**: según el resultado, propone el
  recorrido completo o ir directo a los casos o a la plantilla.
- **Tres casos** con retroalimentación inmediata e intentos ilimitados.
- **Plantilla guiada** con autoguardado y **retroalimentación automática** del
  borrador (objetivo observable, criterios de la justificación, alineación
  objetivo–evaluación).
- **Lista de cotejo**, descarga en PDF o texto, y plantilla en blanco para
  imprimir y trabajar sin conexión.
- **Reinicio del avance** desde el panel Ayuda, pensado para computadores
  compartidos.

## Agregar el video de bienvenida

En `index.html`, busca `id="video-bienvenida"` y pega la URL de inserción del
video en el atributo `data-video`, por ejemplo:

```html
<div class="video-marco" id="video-bienvenida" data-video="https://www.youtube-nocookie.com/embed/ID_DEL_VIDEO" hidden></div>
```

El texto de bienvenida queda debajo como versión en texto del video.

## Publicar cambios

Este repositorio ya está configurado para GitHub Pages (rama `main`, carpeta
raíz). Cada vez que subas cambios a `main`, el sitio se actualiza en uno o dos
minutos.

El modo sin conexión siempre pide primero la versión más reciente cuando hay
internet, así que los cambios llegan a los docentes sin pasos adicionales.
