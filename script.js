/**
 * Pokédex — cliente PokeAPI (async/await + fetch)
 * Endpoints: /pokemon/{id|name}, /pokemon-species/{id|name}, /type/{name}
 */

const API_BASE = "https://pokeapi.co/api/v2";

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const randomButton = document.getElementById("random-button");
const statusLoading = document.getElementById("status-loading");
const statusError = document.getElementById("status-error");
const pokemonSection = document.getElementById("pokemon-section");
const blackjackEmpty = document.getElementById("blackjack-empty");
const pokemonDexTl = document.getElementById("pokemon-dex-tl");
const pokemonPipTl = document.getElementById("pokemon-pip-tl");
const playingCardRoot = document.getElementById("playing-card-root");
const pokemonName = document.getElementById("pokemon-name");
const pokemonImageContainer = document.getElementById("pokemon-image-container");
const pokemonWeight = document.getElementById("pokemon-weight");
const pokemonDescription = document.getElementById("pokemon-description");
const pokemonTypes = document.getElementById("pokemon-types");
const typeExploreSection = document.getElementById("type-explore-section");
const typeExploreHint = document.getElementById("type-explore-hint");
const typePokemonList = document.getElementById("type-pokemon-list");

const TYPE_LIST_LIMIT = 36;

/** Color del “palo” / acento según tipo principal (estilo baraja) */
const TYPE_ACCENT = {
  normal: "#a8a878",
  fire: "#c03028",
  water: "#6890f0",
  electric: "#c9a019",
  grass: "#3d8f3d",
  ice: "#4a9ea8",
  fighting: "#a02028",
  poison: "#803080",
  ground: "#b89a3c",
  flying: "#7868c8",
  psychic: "#d04070",
  bug: "#8a9a20",
  rock: "#908030",
  ghost: "#604878",
  dragon: "#5038d8",
  dark: "#504038",
  steel: "#788898",
  fairy: "#d06090",
};

function accentForTypes(types) {
  const ordered = [...types].sort((a, b) => a.slot - b.slot);
  const primary = ordered[0]?.type?.name;
  return TYPE_ACCENT[primary] || "#3b4cca";
}

function typePipLabel(types) {
  return [...types]
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name.slice(0, 2).toUpperCase())
    .join("·");
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function setLoading(on) {
  statusLoading.hidden = !on;
}

function showError(message) {
  statusError.textContent = message;
  statusError.hidden = false;
}

function clearError() {
  statusError.textContent = "";
  statusError.hidden = true;
}

/** Mano vacía (mensaje en mesa) vs carta Pokémon visible */
function setHandEmpty(empty) {
  if (blackjackEmpty) blackjackEmpty.hidden = !empty;
  pokemonSection.hidden = empty;
}

function cleanFlavorText(text) {
  return String(text)
    .replace(/\f/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickFlavorText(species) {
  const entries = species.flavor_text_entries || [];
  const es = entries.find((e) => e.language.name === "es");
  if (es) return cleanFlavorText(es.flavor_text);
  const en = entries.find((e) => e.language.name === "en");
  if (en) return cleanFlavorText(en.flavor_text);
  if (entries[0]) return cleanFlavorText(entries[0].flavor_text);
  return "Sin descripción en la API para este Pokémon.";
}

function spriteUrl(pokemon) {
  const official =
    pokemon.sprites?.other?.["official-artwork"]?.front_default;
  if (official) return official;
  return pokemon.sprites?.front_default || "";
}

function renderPokemonCard(pokemon, description) {
  const playingCard = playingCardRoot || pokemonSection.querySelector(".playing-card");
  if (playingCard) {
    playingCard.style.setProperty("--card-accent", accentForTypes(pokemon.types));
    playingCard.classList.remove("playing-card--deal-in");
    void playingCard.offsetWidth;
    playingCard.classList.add("playing-card--deal-in");
  }

  const dexLabel = `#${String(pokemon.id).padStart(3, "0")}`;
  const pipText = typePipLabel(pokemon.types);
  pokemonDexTl.textContent = dexLabel;
  pokemonPipTl.textContent = pipText;

  pokemonName.textContent = pokemon.name;
  const kg = (pokemon.weight / 10).toLocaleString("es", {
    minimumFractionDigits: Number.isInteger(pokemon.weight / 10) ? 0 : 1,
    maximumFractionDigits: 1,
  });
  pokemonWeight.textContent = `${kg} kg`;
  pokemonDescription.textContent = description;

  pokemonImageContainer.replaceChildren();
  const imgUrl = spriteUrl(pokemon);
  if (imgUrl) {
    const img = document.createElement("img");
    img.src = imgUrl;
    img.alt = `Ilustración de ${pokemon.name}`;
    img.width = 256;
    img.height = 256;
    pokemonImageContainer.appendChild(img);
  } else {
    const p = document.createElement("p");
    p.textContent = "Sin imagen disponible.";
    pokemonImageContainer.appendChild(p);
  }

  pokemonTypes.replaceChildren();
  for (const slot of pokemon.types) {
    const typeName = slot.type.name;
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = typeName;
    btn.addEventListener("click", () => loadTypeExplore(typeName));
    li.appendChild(btn);
    pokemonTypes.appendChild(li);
  }

  setHandEmpty(false);
}

async function loadPokemonByQuery(query) {
  const q = String(query).trim().toLowerCase();
  if (!q) {
    showError("Escribe un nombre o un número.");
    return;
  }

  clearError();
  setLoading(true);
  setHandEmpty(true);
  typeExploreSection.hidden = true;

  try {
    const pokemon = await fetchJson(`${API_BASE}/pokemon/${encodeURIComponent(q)}`);

    let description = "No se pudo cargar la descripción.";
    try {
      const species = await fetchJson(pokemon.species.url);
      description = pickFlavorText(species);
    } catch {
      /* opcional: solo ficha principal */
    }

    renderPokemonCard(pokemon, description);
  } catch (e) {
    const msg =
      e.status === 404
        ? "No se encontró ese Pokémon. Prueba otro nombre o número."
        : "No se pudo conectar con la API. Comprueba tu red e inténtalo de nuevo.";
    showError(msg);
    setHandEmpty(true);
  } finally {
    setLoading(false);
  }
}

async function loadRandomPokemon() {
  clearError();
  setLoading(true);
  setHandEmpty(true);
  typeExploreSection.hidden = true;

  try {
    const meta = await fetchJson(`${API_BASE}/pokemon?limit=1`);
    const count = meta.count;
    const offset = Math.floor(Math.random() * count);
    const page = await fetchJson(
      `${API_BASE}/pokemon?limit=1&offset=${offset}`
    );
    const name = page.results[0].name;
    const pokemon = await fetchJson(`${API_BASE}/pokemon/${name}`);

    let description = "No se pudo cargar la descripción.";
    try {
      const species = await fetchJson(pokemon.species.url);
      description = pickFlavorText(species);
    } catch {
      /* */
    }

    renderPokemonCard(pokemon, description);
    searchInput.value = pokemon.name;
  } catch {
    showError("No se pudo obtener un Pokémon al azar. Inténtalo de nuevo.");
    setHandEmpty(true);
  } finally {
    setLoading(false);
  }
}

async function loadTypeExplore(typeName) {
  clearError();
  setLoading(true);

  try {
    const data = await fetchJson(`${API_BASE}/type/${encodeURIComponent(typeName)}`);
    const all = data.pokemon || [];
    const slice = all.slice(0, TYPE_LIST_LIMIT);

    typeExploreHint.textContent = `Tipo «${data.names?.find((n) => n.language.name === "es")?.name || typeName}»: mostrando ${slice.length} de ${all.length} Pokémon en la API. Pulsa un nombre para ver su ficha.`;

    typePokemonList.replaceChildren();
    for (const entry of slice) {
      const p = entry.pokemon;
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = p.name.replace(/-/g, " ");
      btn.addEventListener("click", () => {
        searchInput.value = p.name;
        loadPokemonByQuery(p.name);
      });
      li.appendChild(btn);
      typePokemonList.appendChild(li);
    }

    typeExploreSection.hidden = false;
  } catch (e) {
    showError(
      e.status === 404
        ? "No se encontró información de ese tipo."
        : "Error al cargar Pokémon por tipo."
    );
  } finally {
    setLoading(false);
  }
}

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  loadPokemonByQuery(searchInput.value);
});

randomButton.addEventListener("click", () => {
  loadRandomPokemon();
});
