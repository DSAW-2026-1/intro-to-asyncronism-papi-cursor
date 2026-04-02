# Memoria del proyecto — Pokédex (PokeAPI)

Este documento resume acuerdos, requisitos y estado del trabajo para que cualquier sesión o persona pueda continuar sin perder contexto.

## Enunciado (README del repo)

- **API obligatoria:** [PokeAPI](https://pokeapi.co/) (`https://pokeapi.co/`).
- **Por cada consulta** la app desplegada debe mostrar **como mínimo:** nombre del Pokémon, peso, nombre (en el texto del README aparece repetido) y **foto** del personaje.
- **Al menos 3 endpoints distintos** (libertad de cuáles y cómo usarlos).
- **Requisitos de entrega:** marcar el repositorio con nombre (si no, calificación cero); **desplegar** la página (si no, calificación cero).
- **Rúbrica:** creatividad, diseño, calidad de código, funcionalidad.

## Decisiones acordadas con la usuaria

- En lugar de un “segundo nombre”, se mostrará una **pequeña descripción** del Pokémon. En PokeAPI suele obtenerse desde **`pokemon-species`**, campo **`flavor_text_entries`** (priorizar texto en **es**, con respaldo en **en** si hace falta).
- **Despliegue:** pendiente de confirmación entre **Vercel** o **Netlify**; no está hecho aún.
- **Paleta CSS (oficial Pokédex en `styles.css`):** variables `--pk-red` `#ff0000`, `--pk-blue` `#3b4cca`, `--pk-yellow` `#ffde00`, `--pk-green` `#008000`, `--pk-black` `#000000`, `--pk-brown` `#a52a2a`, `--pk-purple` `#800080`, `--pk-gray` `#808080`, `--pk-white` `#ffffff`, `--pk-pink` `#ffc0cb`. La UI usa tema **claro** (fondo blanco/rosa suave), **cabecera roja** tipo dispositivo, acentos **azul** (enlaces, títulos de ficha), **amarillo** (botón Buscar), **morado/rosa** en tipos y sección por tipo, **verde/marrón** en hovers y etiquetas. Actualizar esta lista si cambia la paleta o el uso.

## Plan técnico acordado (resumen)

1. **HTML:** estructura semántica, formulario de búsqueda, estados de carga/error, tarjeta con nombre/peso/descripción/imagen, tipos, sección para listar Pokémon por tipo (tercer endpoint).
2. **CSS:** estilos en archivo aparte, enlazado desde `index.html`.
3. **JS (implementado en `script.js`):** `fetch` + `async/await` contra `https://pokeapi.co/api/v2/`:
   - **`GET /pokemon/{id or name}`** — ficha: nombre, peso (mostrado en kg a partir de hectogramas), sprite (`official-artwork` si existe, si no `front_default`), tipos como botones.
   - **`GET`** desde la URL de **`pokemon.species`** (equivale a `pokemon-species/{id}`) — descripción vía `flavor_text_entries` (**es**, respaldo **en**).
   - **`GET /pokemon?limit=1&offset=…`** — elegir un Pokémon al azar dentro del `count` total de la API.
   - **`GET /type/{name}`** — al pulsar un tipo, se rellena `#type-explore-section` (hasta 36 Pokémon de ese tipo; cada ítem carga otra ficha).
4. **Despliegue:** cuando se elija plataforma, configurar proyecto estático y probar URL pública.

## Archivos en el repo (estado actual)

| Archivo        | Rol |
|----------------|-----|
| `README.md`    | Enunciado de la tarea (GitHub Classroom). |
| `index.html`   | Marcado: cabecera, búsqueda (`#search-form`, `#search-input`, `#random-button`), estados (`#status-loading`, `#status-error`), tarjeta (`#pokemon-section`, `#pokemon-name`, `#pokemon-image-container`, `#pokemon-weight`, `#pokemon-description`, `#pokemon-types`), sección tipo (`#type-explore-section`, `#type-explore-hint`, `#type-pokemon-list`). Incluye `<script src="script.js" defer></script>`. |
| `styles.css`   | Estilos con **paleta oficial Pokédex** (`:root` con `--pk-*` + roles semánticos). Tema claro, cabecera roja. Enlazado con `<link rel="stylesheet" href="styles.css" />`. |
| `script.js`    | Lógica de PokeAPI: búsqueda por formulario, Pokémon aleatorio, estados de carga/error, tarjeta con especies/descripción, exploración por tipo (`#pokemon-types` → `/type/{name}`). |
| `Cursor.md`    | Esta memoria de contexto. |

## IDs y hooks (referencia; usados por `script.js`)

- Formulario: `#search-form`, input `#search-input`, botón aleatorio `#random-button`.
- UI de estado: `#status-loading`, `#status-error`.
- Detalle: `#pokemon-section`, `#pokemon-name`, `#pokemon-image-container`, `#pokemon-weight`, `#pokemon-description`, `#pokemon-types`.
- Por tipo: `#type-explore-section`, `#type-explore-hint`, `#type-pokemon-list`.

## Mantenimiento de este archivo

- Tras **cada cambio relevante** en acuerdos, paleta, archivos o plan, actualizar `Cursor.md` para que una sesión nueva retome el mismo contexto.

## Notas para quien continúe

- Para la rúbrica de **al menos 3 endpoints distintos** cuentan sobre todo **`/pokemon/{…}`**, la especie (**`/pokemon-species/…`** vía `pokemon.species.url`) y **`/type/{…}`**; el listado **`/pokemon?limit=1&offset=…`** es auxiliar para el aleatorio. La búsqueda y el aleatorio muestran nombre, peso, descripción y foto.
- Los tipos en la ficha son **botones** que llaman a `/type/{name}`; la lista usa `.type-explore__list li button` para cargar otra ficha.
- Pendiente principal: **despliegue** (Vercel o Netlify) y comprobar la URL pública.
- No asumir que el README fue modificado localmente; la fuente de verdad del enunciado sigue siendo el README del assignment si difiere.
