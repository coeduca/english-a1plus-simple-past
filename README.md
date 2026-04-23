# Simple Past - English A1+ | COEDUCA

Web app de ejercicios interactivos sobre el tema **Simple Past** para estudiantes de Noveno, 1er Año y 2do Año de Bachillerato.

## 📋 Características

- ✅ 13 ejercicios variados + juego bonus de Tic-Tac-Toe (XO)
- ✅ 2 versiones aleatorias de cada ejercicio
- ✅ Diseño 100% responsive (PC y móvil)
- ✅ Drag & Drop con soporte táctil y auto-scroll
- ✅ Guardado automático con `localStorage`
- ✅ Autocalificación con escala 1-10
- ✅ Descarga de PDF con jsPDF (compatible con iOS)
- ✅ Acceso por NIE con base de datos de estudiantes
- ✅ Función "Agregar compañero" para trabajos grupales
- ✅ Bloqueo de copiar/pegar y traducción de página

## 🗂️ Estructura de archivos

```
english-a1plus-simple-past/
├── index.html          # Página principal
├── styles.css          # Estilos
├── students.js         # Base de datos de NIEs
├── exercises.js        # Banco de ejercicios (2 versiones c/u)
├── app.js              # Lógica principal
├── README.md           # Este archivo
└── files/              # Imágenes y audio
    ├── audio.mp3
    ├── babyboycrying.jpg
    ├── boyandgirlcooking.jpg
    ├── boydrinkinglemonade.jpg
    ├── boyeatingpizza.jpg
    ├── boylisteningwithheadphones.jpg
    ├── girlreadingbook.jpg
    ├── girlrunning.jpg
    ├── sheteacherteachingthealphabet.jpg
    ├── threeboysplayingcoccer.jpg
    └── whitecatsleeping.jpg
```

## 🚀 Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (ej. `english-a1plus-simple-past`).
2. Sube **todos los archivos** (incluyendo la carpeta `files/` con las imágenes y `audio.mp3`).
3. Ve a **Settings → Pages**.
4. En **Source**, selecciona la rama `main` y la carpeta `/ (root)`.
5. Guarda. En unos minutos tu web estará disponible en:
   `https://TU-USUARIO.github.io/english-a1plus-simple-past/`

## 🔑 NIE de prueba

Usa el NIE **`12379`** para probar como profesor (José Eliseo Martínez).

## 🎮 Ejercicios incluidos

1. **Selección múltiple** — Verbos en pasado
2. **Completar el espacio en blanco** — Escribiendo
3. **Drag & Drop** — Arrastrar palabras
4. **Reordenar letras** — Forma el verbo en pasado
5. **Ordenar oraciones** — Con audio
6. **Verdadero/Falso** — Gramática
7. **Sopa de letras** — Arrastrar para marcar
8. **Clasificación** — Regulares vs Irregulares
9. **Menú desplegable** — Elegir conjugación
10. **Identificar errores** — Click en palabra incorrecta
11. **Crear oraciones con emojis**
12. **Emparejar con imágenes**
13. **Unir con líneas (SVG)** — Presente → Pasado
14. **Tic-Tac-Toe (Bonus)** — 1 punto extra si ganas, 0.5 si empatas

## 📊 Cálculo de nota

- Se promedia el porcentaje de aciertos de cada ejercicio.
- Se convierte a escala 1-10.
- Se suman puntos extra del juego XO (0.5 empate / 1 victoria).
- El PDF muestra la nota final y los puntos extra visibles en la esquina.

## 🛠️ Notas técnicas

- **jsPDF** se carga desde CDN (`cdnjs`).
- El sanitizador de texto elimina HTML, reemplaza tildes/emojis por ASCII, y previene símbolos `&` en el PDF.
- En iOS, si la descarga directa falla, aparece un botón verde para abrir/compartir el PDF manualmente.
- Los datos se guardan en `localStorage` bajo la clave `simplePast_v1_state`.

---

**Profesor:** José Eliseo Martínez
**Escuela:** COEDUCA
**Sección:** A
**Nivel:** English A1+
