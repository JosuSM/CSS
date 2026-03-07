const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.navbar__menu');
const navAnchors = document.querySelectorAll('.navbar__links, .navbar__btn .button');

const universalBase = 'emulators/universal/index.html';

function buildUniversalLink(core, name) {
    return `${universalBase}?core=${encodeURIComponent(core)}&name=${encodeURIComponent(name)}`;
}

function compatibilityClass(level) {
    if (level === 'Stable') {
        return 'emu-compat--stable';
    }
    if (level === 'Good') {
        return 'emu-compat--good';
    }
    return 'emu-compat--experimental';
}

function mobileClass(isMobileReady) {
    return isMobileReady ? 'emu-mobile--ready' : 'emu-mobile--limited';
}

if (menu && menuLinks) {
    menu.addEventListener('click', () => {
        menu.classList.toggle('active');
        menuLinks.classList.toggle('active');
    });

    navAnchors.forEach((anchor) => {
        anchor.addEventListener('click', () => {
            if (menu.classList.contains('active')) {
                menu.classList.remove('active');
                menuLinks.classList.remove('active');
            }
        });
    });
}

const emulatorCatalog = [
    { name: 'Game Boy', manufacturer: 'Nintendo', type: 'Handheld', status: 'Playable', compatibility: 'Stable', mobileReady: true, page: buildUniversalLink('gb', 'Game Boy') },
    { name: 'Game Boy Color', manufacturer: 'Nintendo', type: 'Handheld', status: 'Playable', compatibility: 'Stable', mobileReady: true, page: buildUniversalLink('gbc', 'Game Boy Color') },
    { name: 'Game Boy Advance', manufacturer: 'Nintendo', type: 'Handheld', status: 'Playable', compatibility: 'Stable', mobileReady: true, page: buildUniversalLink('gba', 'Game Boy Advance') },
    { name: 'NES', manufacturer: 'Nintendo', type: 'Console', status: 'Playable', compatibility: 'Stable', mobileReady: true, page: buildUniversalLink('nes', 'NES') },
    { name: 'SNES', manufacturer: 'Nintendo', type: 'Console', status: 'Playable', compatibility: 'Stable', mobileReady: true, page: buildUniversalLink('snes', 'SNES') },
    { name: 'Nintendo 64', manufacturer: 'Nintendo', type: 'Console', status: 'Playable', compatibility: 'Good', mobileReady: true, page: buildUniversalLink('n64', 'Nintendo 64') },
    { name: 'Nintendo DS', manufacturer: 'Nintendo', type: 'Handheld', status: 'Playable', compatibility: 'Good', mobileReady: true, page: buildUniversalLink('nds', 'Nintendo DS') },
    { name: 'Virtual Boy', manufacturer: 'Nintendo', type: 'Console', status: 'Playable', compatibility: 'Good', mobileReady: false, page: buildUniversalLink('vb', 'Virtual Boy') },
    { name: 'Sega Master System', manufacturer: 'Sega', type: 'Console', status: 'Playable', compatibility: 'Stable', mobileReady: true, page: buildUniversalLink('segaMS', 'Sega Master System') },
    { name: 'Sega Genesis', manufacturer: 'Sega', type: 'Console', status: 'Playable', compatibility: 'Stable', mobileReady: true, page: buildUniversalLink('segaMD', 'Sega Genesis') },
    { name: 'Sega Game Gear', manufacturer: 'Sega', type: 'Handheld', status: 'Playable', compatibility: 'Stable', mobileReady: true, page: buildUniversalLink('segaGG', 'Sega Game Gear') },
    { name: 'Sega CD', manufacturer: 'Sega', type: 'Console', status: 'Playable', compatibility: 'Good', mobileReady: false, page: buildUniversalLink('segaCD', 'Sega CD') },
    { name: 'PlayStation 1', manufacturer: 'Sony', type: 'Console', status: 'Playable', compatibility: 'Good', mobileReady: false, page: buildUniversalLink('psx', 'PlayStation 1') },
    { name: 'Atari 2600', manufacturer: 'Atari', type: 'Console', status: 'Playable', compatibility: 'Stable', mobileReady: true, page: buildUniversalLink('atari2600', 'Atari 2600') },
    { name: 'Atari 5200', manufacturer: 'Atari', type: 'Console', status: 'Playable', compatibility: 'Good', mobileReady: true, page: buildUniversalLink('atari5200', 'Atari 5200') },
    { name: 'Atari 7800', manufacturer: 'Atari', type: 'Console', status: 'Playable', compatibility: 'Good', mobileReady: true, page: buildUniversalLink('atari7800', 'Atari 7800') },
    { name: 'Atari Lynx', manufacturer: 'Atari', type: 'Handheld', status: 'Playable', compatibility: 'Good', mobileReady: true, page: buildUniversalLink('lynx', 'Atari Lynx') },
    { name: 'WonderSwan', manufacturer: 'Bandai', type: 'Handheld', status: 'Playable', compatibility: 'Good', mobileReady: true, page: buildUniversalLink('ws', 'WonderSwan') },
    { name: 'WonderSwan Color', manufacturer: 'Bandai', type: 'Handheld', status: 'Playable', compatibility: 'Good', mobileReady: true, page: buildUniversalLink('wsc', 'WonderSwan Color') },
    { name: 'Arcade (MAME 2003)', manufacturer: 'Multiple', type: 'Arcade', status: 'Playable', compatibility: 'Experimental', mobileReady: false, page: buildUniversalLink('mame2003', 'Arcade MAME 2003') }
];

const emuList = document.getElementById('emu-list');
const emuCount = document.getElementById('emu-count');
const filterButtons = document.querySelectorAll('.emu-filter');

function filterCatalog(catalog, filter) {
    if (filter === 'mobile') {
        return catalog.filter((emulator) => emulator.mobileReady === true);
    }
    if (filter === 'stable') {
        return catalog.filter((emulator) => emulator.compatibility === 'Stable');
    }
    return catalog;
}

function renderCatalog(catalog) {
    if (!emuList) {
        return;
    }

    if (emuCount) {
        const label = catalog.length === 1 ? 'emulator' : 'emulators';
        emuCount.textContent = `Showing ${catalog.length} ${label}`;
    }

    emuList.innerHTML = catalog
        .map((emulator) => {
            const isPlayable = emulator.status === 'Playable' && emulator.page;
            const compatibility = emulator.compatibility || 'Experimental';
            const isMobileReady = emulator.mobileReady === true;
            const action = isPlayable
                ? `<a class="button emu-card__button" href="${emulator.page}">Launch</a>`
                : '<span class="emu-card__button emu-card__button--disabled">Unavailable</span>';

            return `
                <article class="emu-card">
                    <h3>${emulator.name}</h3>
                    <p>${emulator.manufacturer} - ${emulator.type}</p>
                    <div class="emu-meta">
                        <span class="emu-compat ${compatibilityClass(compatibility)}">${compatibility}</span>
                        <span class="emu-mobile ${mobileClass(isMobileReady)}">${isMobileReady ? 'Mobile Ready' : 'Desktop Best'}</span>
                    </div>
                    <span class="emu-status ${isPlayable ? 'emu-status--playable' : 'emu-status--soon'}">${emulator.status}</span>
                    ${action}
                </article>
            `;
        })
        .join('');
}

if (emuList) {
    renderCatalog(emulatorCatalog);
}

if (filterButtons.length > 0) {
    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter || 'all';

            filterButtons.forEach((candidate) => {
                candidate.classList.remove('is-active');
                candidate.setAttribute('aria-pressed', 'false');
            });

            button.classList.add('is-active');
            button.setAttribute('aria-pressed', 'true');

            renderCatalog(filterCatalog(emulatorCatalog, filter));
        });
    });
}