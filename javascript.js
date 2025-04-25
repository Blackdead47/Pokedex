let allPokemons = [];

let offset = 0;

async function Render() {
  await getPokeData();
  await loadDetailsforAllpokemons();
  renderPokeCards();
}

async function getPokeData() {
  const url = `https://pokeapi.co/api/v2/pokemon?limit=10&offset=${offset}`; // jetzt korrekt!

  try {
    let respons = await fetch(url);
    if (!respons.ok) {
      throw new Error("Fehler beim Laden von :" + respons.status);
    }

    let responsJSON = await respons.json();
    console.log("Erfolgreich geladen:", responsJSON);

    responsJSON.results.forEach((pokemon) => {
      allPokemons.push({
        name: pokemon.name,
        url: pokemon.url,
      });
    });
  } catch (error) {
    console.error("Fehler beim Abrufen der Pokémon-Daten:", error.message);
  }
}

function renderPokeCards() {
  let content = document.getElementById("startSection");
  content.innerHTML = "";
  for (let i = 0; i < allPokemons.length; i++) {
    const pokemon = allPokemons[i];
    content.innerHTML += getPokeCardHTML(pokemon, i);
  }
}

function getPokeCardHTML(pokemon, i) {
  return `<div onclick="OpenCard(${i})" class="pokecard ${pokemon.type[0]}">
  <div class="pokeTitel" >
  <h3>${pokemon.name}</h3>
  </div>
  <div class ="pokeIMG"><img src="${pokemon.image}"></div>
  <div class="pokeType"><p> ${pokemon.type}</p></div>
  </div>`;
}

async function loadDetailsforAllpokemons(startIndex = 0) {
  for (let index = startIndex; index < allPokemons.length; index++) {
    try {
      const respons = await fetch(allPokemons[index].url);
      if (!respons.ok) {
        throw new Error(
          "Fehler beim Laden der Details für: " + allPokemons[index].name
        );
      }
      const details = await respons.json();
      allPokemons[index].image =
        details.sprites.other.dream_world.front_default;
      allPokemons[index].type = details.types.map((t) => t.type.name);
    } catch (error) {
      console.error(
        "Detail-Fehler bei Pokemon:",
        allPokemons[index].name,
        error.message
      );
    }
  }
}

async function loadMorePokemons() {
  let previousLength = allPokemons.length;
  offset += 10;
  await getPokeData();
  await loadDetailsforAllpokemons(previousLength);
  renderPokeCards();
}

function getLoadingCardHTML() {
  return `
      <div class="pokecard loading">
        <div class="pokeTitel shimmer"></div>
        <div class="pokeIMG shimmer"></div>
        <div class="pokeType shimmer"></div>
      </div>
    `;
}

function searchPokemonAPI() {
  const input = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();
  const content = document.getElementById("startSection");
  content.innerHTML = "";

  if (input === "") {
    renderPokeCards();
    return;
  }

  // 🔍 Lokaler Suchfilter (z. B. "char" findet charmander, charmeleon, charizard)
  const filtered = allPokemons.filter((p) =>
    p.name.toLowerCase().includes(input)
  );

  if (filtered.length > 0) {
    filtered.forEach((p) => {
      content.innerHTML += getPokeCardHTML(p);
    });
  } else {
    content.innerHTML = `<p style="color: white;">Kein Pokémon gefunden.</p>`;
  }
}

function OpenCard(i) {
  let modal = document.getElementById("modal");
  modal.innerHTML = "";
  modal.classList.add("modal_open");
  modal.classList.remove("modal_closed");
  modal.innerHTML += getTemplate(i);
}

function getTemplate(i) {
  const p = allPokemons[i];
  return `
    <div class="modal_Card ${p.type[0]}">
    <div class="open_CardHeader">
      <h2>${p.name}</h2>
      </div>
      <div class="open_CardIMG">
      <img src="${p.image}" alt="${p.name}">
      </div>
     
      <p><strong>Typ:</strong> ${p.type.join(", ")}</p>
       <div class="modalContent">
       <div class="modalMenu">
       <div onclick="showStats(${i})"  Class="modalStats"><p>Stats</p></div>
       <div onclick="ShowAbility(${i})" Class="modalAbility"><p>Ability</p></div>
       <div Class="modalForms"><p>Forms</p></div>
       </div>
       </div>

      <button onclick="closeModal()">Schließen</button>
    </div>
  `;
}

function closeModal(i) {
  const modal = document.getElementById("modal");
  modal.classList.remove("modal_open");
  modal.classList.add("modal_closed");
  modal.innerHTML = "";
}

async function showStats(i) {
  const p = allPokemons[i];
  const modalContent = document.querySelector(".modalContent");

  try {
    const response = await fetch(p.url);
    if (!response.ok) throw new Error("Fehler beim Laden der Stats");

    const data = await response.json();

    const hp = getStat(data, "hp");
    const attack = getStat(data, "attack");
    const defense = getStat(data, "defense");

    modalContent.innerHTML = `
      <div class="modalMenu">
        <div onclick="showStats(${i})" class="modalStats"><p>Stats</p></div>
        <div onclick="ShowAbility(${i})" class="modalAbility"><p>Ability</p></div>
        <div class="modalForms"><p>Forms</p></div>
      </div>
      <div class="modalStatsContent">
        <p><strong>HP:</strong> ${hp}</p>
        <p><strong>Attack:</strong> ${attack}</p>
        <p><strong>Defense:</strong> ${defense}</p>
      </div>
    `;
  } catch (error) {
    console.error("Fehler beim Laden der Stats:", error.message);
    modalContent.innerHTML = `<p style="color:red;">Stats konnten nicht geladen werden.</p>`;
  }
}
function getStat(data, statName) {
  return data.stats.find((s) => s.stat.name === statName)?.base_stat || 0;
}

async function ShowAbility(i) {
  const p = allPokemons[i];

  const modalContent = document.querySelector(".modalContent");

  try {
    const respons = await fetch(p.url);
    if (!respons.ok) throw new Error("Fehler beim Laden der Abality");

    const data = await respons.json();

    const limber = getAbility(data, "limber");
    const imposter = getAbility(data, "imposter");

    modalContent.innerHTML = `
    <div class="modalMenu">
      <div onclick="showStats(${i})" class="modalStats"><p>Stats</p></div>
      <div onclick="ShowAbility(${i})" class="modalAbility"><p>Ability</p></div>
      <div class="modalForms"><p>Forms</p></div>
    </div>
          <div class="modalStatsContent">
        <p><strong>HP:</strong> ${limber}</p>
        <p><strong>Attack:</strong> ${imposter}</p>
        
      </div>
  `;
  } catch (error) {
    console.error("Fehler beim Laden der Ability:", error.message);
    modalContent.innerHTML = `<p style="color:red;">Stats konnten nicht geladen werden.</p>`;
  }
}

function getAbility(data, abilityName) {
  return (
    data.abilities.find((s) => s.ability.name === abilityName)?.base_stat ||
    "no ability found"
  );
}
