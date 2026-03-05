"use strict";
import {DMG} from "./src/dmg.js";

let gb = undefined;
const audioContexts = new Set();
let selectedQuality = 2;

function applyQualityToCurrentGame() {
    if (gb?.ppu?.setQuality) {
        gb.ppu.setQuality(selectedQuality);
    }
}

function trackAudioContext(ctorName) {
    const OriginalCtor = window[ctorName];
    if (typeof OriginalCtor !== "function") {
        return;
    }

    function WrappedAudioContext(...args) {
        const ctx = new OriginalCtor(...args);
        audioContexts.add(ctx);
        return ctx;
    }

    WrappedAudioContext.prototype = OriginalCtor.prototype;
    window[ctorName] = WrappedAudioContext;
}

function applySoundState(enabled) {
    audioContexts.forEach(ctx => {
        if (enabled) {
            ctx.resume?.().catch(() => {});
            return;
        }

        ctx.suspend?.().catch(() => {});
    });

    document.querySelectorAll("audio, video").forEach(media => {
        media.muted = !enabled;
    });
}

function updateFullscreenScale() {
    const gameboy = document.getElementById("gameboy");
    if (!document.fullscreenElement || !gameboy) {
        return;
    }

    const baseWidth = 320;
    const baseHeight = 288;
    const scale = Math.min(window.innerWidth / baseWidth, window.innerHeight / baseHeight) * 0.98;
    gameboy.style.setProperty("--screen-scale", String(Math.max(scale, 0.1)));
}

function toggleFullscreen() {
    const gameboy = document.getElementById("gameboy");
    if (!gameboy) {
        return;
    }

    if (document.fullscreenElement) {
        document.exitFullscreen?.();
        return;
    }

    gameboy.requestFullscreen?.();
}

function saveState() {
    document.activeElement.blur();
    if (gb.gameTitle) {
        const stateName = gb.gameTitle;
        localforage.setItem(stateName, gb.saveState())
            .then(function (value) {
                console.log('State saved.');
            });
    }
}

function loadState() {
    document.activeElement.blur();
    if (gb.gameTitle) {
        const stateName = gb.gameTitle;
        localforage.getItem(stateName)
            .then(function (value) {
                gb.loadState(value);
            })
            .catch(function (err) {
                console.log(`Error loading state: ${err}`);
            });
    }
}

function reset() {
    gb?.stop();
    document.activeElement.blur();
    document.getElementById("serial-output").innerText = "";
    const romSelect = document.getElementById("rom-select");
    const skipBoot = document.getElementById("skip-boot").checked;
    const selectedRom = romSelect.value;
    const romPath = /\.(gb|gbc)$/i.test(selectedRom)
        ? `rom/${selectedRom}`
        : `rom/${selectedRom}.gb`;
    gb = new DMG();
    window.gb = gb;
    applyQualityToCurrentGame();
    const soundEnabled = document.getElementById("sound-toggle")?.checked ?? true;
    gb.apu?.setEnabled(soundEnabled);
    gb.loadRom(romPath, !skipBoot);
}

window.addEventListener("load", () => {
    trackAudioContext("AudioContext");
    trackAudioContext("webkitAudioContext");

    // Execution buttons
    document.getElementById("start-button").addEventListener("click", e => {
        gb.toggleStart();
    });
    document.getElementById("frame-button").addEventListener("click", e => {
        gb.execFrame();
        if (!gb.shouldUpdateEachFrame) {
            gb.updateInfo();
        }
    });
    document.getElementById("step-button").addEventListener("click", e => {
        gb.cpuStep();
        gb.updateInfo();
    });
    document.getElementById("reset-button").addEventListener("click", reset);
    document.getElementById("refresh-button").addEventListener("click", e => gb.updateInfo());
    document.getElementById("savestate-button").addEventListener("click", saveState);
    document.getElementById("loadstate-button").addEventListener("click", loadState);
    document.getElementById("fullscreen-button").addEventListener("click", toggleFullscreen);

    const soundToggle = document.getElementById("sound-toggle");
    soundToggle.addEventListener("change", e => {
        applySoundState(e.target.checked);
        gb?.apu?.setEnabled(e.target.checked);
    });
    applySoundState(soundToggle.checked);

    const qualitySelect = document.getElementById("quality-select");
    selectedQuality = Number(qualitySelect.value) || 2;
    qualitySelect.addEventListener("change", (e) => {
        selectedQuality = Number(e.target.value) || 2;
        applyQualityToCurrentGame();
    });

    document.addEventListener("fullscreenchange", () => {
        const fullscreenButton = document.getElementById("fullscreen-button");
        const gameboy = document.getElementById("gameboy");
        const isFullscreen = document.fullscreenElement === gameboy;
        fullscreenButton.innerText = isFullscreen ? "Sair do Ecrã Completo" : "Ecrã Completo";
        document.body.classList.toggle("fullscreen-mode", isFullscreen);
        if (!isFullscreen && gameboy) {
            gameboy.style.removeProperty("--screen-scale");
        }
        updateFullscreenScale();
    });

    window.addEventListener("resize", updateFullscreenScale);

    // ROM select
    document.getElementById("rom-select").addEventListener("change", () => {
        reset();
    });

    // Update each frame checkbox
    document.getElementById("update-each-frame").addEventListener("change", e => {
        gb.shouldUpdateEachFrame = e.target.checked;
    });

    // Tiles and BG canvas
    const tilesCanvas = document.getElementById("tiles");
    tilesCanvas.width = 128;
    tilesCanvas.height = 192;
    tilesCanvas.getContext("2d").imageSmoothingEnabled = false;
    const bgCanvas0 = document.getElementById("background0");
    bgCanvas0.width = 256;
    bgCanvas0.height = 256;
    bgCanvas0.getContext("2d").imageSmoothingEnabled = false;
    const bgCanvas1 = document.getElementById("background1");
    bgCanvas1.width = 256;
    bgCanvas1.height = 256;
    bgCanvas1.getContext("2d").imageSmoothingEnabled = false;

    // Address view buttons
    document.getElementById("address")
        .addEventListener(
            "keydown",
            e => {
                if (e.key === 'Enter') {
                    gb.setViewAddress(parseInt(e.target.value, 16));
                }
            });
    document.getElementById("address-down-button")
        .addEventListener(
            "click",
            e => {
                gb.setViewAddress(gb.viewAddress + 0x80);
            });
    document.getElementById("address-up-button")
        .addEventListener(
            "click",
            e => {
                gb.setViewAddress(gb.viewAddress - 0x80);
            });

    reset();
});
