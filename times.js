const archiveSearch = document.getElementById('archive-search');
const archiveCount = document.getElementById('archive-count');
const filterButtons = document.querySelectorAll('.archive-filter');
const magazineGrid = document.getElementById('magazine-grid');
const posterGrid = document.getElementById('poster-grid');

const magazineCatalog = [
    {
        title: 'Computer and Video Games #1',
        year: 1981,
        decade: '1980s',
        publisher: 'EMAP',
        region: 'UK',
        spotlight: 'First issue launch',
        type: 'Magazine'
    },
    {
        title: 'Crash #14',
        year: 1985,
        decade: '1980s',
        publisher: 'Newsfield',
        region: 'UK',
        spotlight: 'Knight Lore cover feature',
        type: 'Magazine'
    },
    {
        title: 'Nintendo Power #1',
        year: 1988,
        decade: '1980s',
        publisher: 'Nintendo of America',
        region: 'US',
        spotlight: 'Super Mario Bros. 2 strategy',
        type: 'Magazine'
    },
    {
        title: 'Mean Machines #1',
        year: 1990,
        decade: '1990s',
        publisher: 'EMAP',
        region: 'UK',
        spotlight: '16-bit launch preview',
        type: 'Magazine'
    },
    {
        title: 'EGM #38',
        year: 1992,
        decade: '1990s',
        publisher: 'Sendai Publishing',
        region: 'US',
        spotlight: 'Street Fighter II guide',
        type: 'Magazine'
    },
    {
        title: 'Super Play #3',
        year: 1993,
        decade: '1990s',
        publisher: 'Future Publishing',
        region: 'UK',
        spotlight: 'Import SNES feature',
        type: 'Magazine'
    },
    {
        title: 'Official Sega Saturn Magazine #2',
        year: 1995,
        decade: '1990s',
        publisher: 'Future Publishing',
        region: 'EU',
        spotlight: 'Virtua Fighter 2 deep dive',
        type: 'Magazine'
    },
    {
        title: 'Dreamcast Magazine #5',
        year: 2000,
        decade: '2000s',
        publisher: 'Paragon Publishing',
        region: 'UK',
        spotlight: 'Shenmue launch dossier',
        type: 'Magazine'
    }
];

const posterCatalog = [
    {
        title: 'Space Invaders Cabinet Poster',
        year: 1979,
        decade: '1970s',
        publisher: 'Taito',
        region: 'JP',
        spotlight: 'Operator kit promo art',
        type: 'Poster'
    },
    {
        title: 'Pac-Man Marquee Campaign',
        year: 1980,
        decade: '1980s',
        publisher: 'Namco',
        region: 'JP',
        spotlight: 'Arcade launch wave',
        type: 'Poster'
    },
    {
        title: 'Donkey Kong Street Banner',
        year: 1981,
        decade: '1980s',
        publisher: 'Nintendo',
        region: 'US',
        spotlight: 'City cabinet rollout',
        type: 'Poster'
    },
    {
        title: 'Out Run Deluxe Cabinet Art',
        year: 1986,
        decade: '1980s',
        publisher: 'Sega',
        region: 'JP',
        spotlight: 'Moving cabinet campaign',
        type: 'Poster'
    },
    {
        title: 'Metal Slug Operator Display',
        year: 1996,
        decade: '1990s',
        publisher: 'SNK',
        region: 'JP',
        spotlight: 'Neo Geo MVS package',
        type: 'Poster'
    },
    {
        title: 'Dance Dance Revolution Tournament Poster',
        year: 1999,
        decade: '1990s',
        publisher: 'Konami',
        region: 'JP',
        spotlight: 'Local championship season',
        type: 'Poster'
    },
    {
        title: 'Crazy Taxi Arcade Location Promo',
        year: 2000,
        decade: '2000s',
        publisher: 'Sega',
        region: 'US',
        spotlight: 'Cab relocation campaign',
        type: 'Poster'
    },
    {
        title: 'Initial D Stage 3 Store Sheet',
        year: 2001,
        decade: '2000s',
        publisher: 'Sega',
        region: 'JP',
        spotlight: 'Arcade floor marketing',
        type: 'Poster'
    }
];

function filterByDecade(items, decade) {
    if (decade === 'all') {
        return items;
    }
    return items.filter((item) => item.decade === decade);
}

function filterBySearch(items, searchQuery) {
    if (!searchQuery) {
        return items;
    }

    const normalized = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
        const indexableText = `${item.title} ${item.publisher} ${item.region} ${item.spotlight}`.toLowerCase();
        return indexableText.includes(normalized);
    });
}

function buildArchiveCard(item) {
    return `
        <article class="archive-card">
            <div class="archive-card__header">
                <span class="archive-card__type">${item.type}</span>
                <span class="archive-card__year">${item.year}</span>
            </div>
            <h3>${item.title}</h3>
            <p class="archive-card__publisher">${item.publisher} · ${item.region}</p>
            <p class="archive-card__spotlight">${item.spotlight}</p>
            <span class="archive-card__decade">${item.decade}</span>
        </article>
    `;
}

function renderGrid(target, items) {
    if (!target) {
        return;
    }

    if (items.length === 0) {
        target.innerHTML = '<p class="archive-empty">No matching entries for this filter.</p>';
        return;
    }

    target.innerHTML = items.map((item) => buildArchiveCard(item)).join('');
}

function setCounter(totalMagazines, totalPosters) {
    if (!archiveCount) {
        return;
    }

    const total = totalMagazines + totalPosters;
    const label = total === 1 ? 'entry' : 'entries';
    archiveCount.textContent = `Showing ${total} ${label} (${totalMagazines} magazines, ${totalPosters} posters)`;
}

function applyFilters() {
    const activeFilter = document.querySelector('.archive-filter.is-active');
    const decade = activeFilter ? activeFilter.dataset.filter || 'all' : 'all';
    const query = archiveSearch ? archiveSearch.value : '';

    const filteredMagazines = filterBySearch(filterByDecade(magazineCatalog, decade), query);
    const filteredPosters = filterBySearch(filterByDecade(posterCatalog, decade), query);

    renderGrid(magazineGrid, filteredMagazines);
    renderGrid(posterGrid, filteredPosters);
    setCounter(filteredMagazines.length, filteredPosters.length);
}

if (filterButtons.length > 0) {
    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            filterButtons.forEach((candidate) => {
                candidate.classList.remove('is-active');
                candidate.setAttribute('aria-pressed', 'false');
            });

            button.classList.add('is-active');
            button.setAttribute('aria-pressed', 'true');

            applyFilters();
        });
    });
}

if (archiveSearch) {
    archiveSearch.addEventListener('input', applyFilters);
}

applyFilters();
