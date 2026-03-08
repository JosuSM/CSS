import json
import os
from datetime import datetime
from pathlib import Path

# System configurations with core information
SYSTEM_INFO = {
    "atari2600": {
        "name": "Atari 2600",
        "core": "stella",
        "extensions": [".a26", ".bin"],
        "description": "Atari 2600 - Video Computer System"
    },
    "atari7800": {
        "name": "Atari 7800",
        "core": "prosystem",
        "extensions": [".a78"],
        "description": "Atari 7800 ProSystem"
    },
    "atarilynx": {
        "name": "Atari Lynx",
        "core": "handy",
        "extensions": [".lnx"],
        "description": "Atari Lynx - Handheld Console"
    },
    "fds": {
        "name": "Famicom Disk System",
        "core": "fceumm",
        "extensions": [".fds"],
        "description": "Nintendo Famicom Disk System"
    },
    "gamegear": {
        "name": "Game Gear",
        "core": "genesis_plus_gx",
        "extensions": [".gg"],
        "description": "Sega Game Gear - Handheld Console"
    },
    "gb": {
        "name": "Game Boy",
        "core": "gambatte",
        "extensions": [".gb"],
        "description": "Nintendo Game Boy"
    },
    "gba": {
        "name": "Game Boy Advance",
        "core": "mgba",
        "extensions": [".gba"],
        "description": "Nintendo Game Boy Advance"
    },
    "gbc": {
        "name": "Game Boy Color",
        "core": "gambatte",
        "extensions": [".gbc"],
        "description": "Nintendo Game Boy Color"
    },
    "mastersystem": {
        "name": "Master System",
        "core": "genesis_plus_gx",
        "extensions": [".sms"],
        "description": "Sega Master System"
    },
    "n64": {
        "name": "Nintendo 64",
        "core": "mupen64plus_next",
        "extensions": [".n64", ".z64", ".v64"],
        "description": "Nintendo 64"
    },
    "nds": {
        "name": "Nintendo DS",
        "core": "desmume",
        "extensions": [".nds"],
        "description": "Nintendo DS - Dual Screen Handheld"
    },
    "nes": {
        "name": "Nintendo Entertainment System",
        "core": "fceumm",
        "extensions": [".nes"],
        "description": "Nintendo Entertainment System / Famicom"
    },
    "ngp": {
        "name": "Neo Geo Pocket",
        "core": "mednafen_ngp",
        "extensions": [".ngp"],
        "description": "SNK Neo Geo Pocket"
    },
    "ngpc": {
        "name": "Neo Geo Pocket Color",
        "core": "mednafen_ngp",
        "extensions": [".ngc"],
        "description": "SNK Neo Geo Pocket Color"
    },
    "pcengine": {
        "name": "PC Engine / TurboGrafx-16",
        "core": "mednafen_pce",
        "extensions": [".pce"],
        "description": "NEC PC Engine / TurboGrafx-16"
    },
    "sega32x": {
        "name": "Sega 32X",
        "core": "picodrive",
        "extensions": [".32x"],
        "description": "Sega 32X - Genesis/Mega Drive Add-on"
    },
    "sg-1000": {
        "name": "SG-1000",
        "core": "genesis_plus_gx",
        "extensions": [".sg"],
        "description": "Sega SG-1000"
    },
    "snes": {
        "name": "Super Nintendo",
        "core": "snes9x",
        "extensions": [".smc", ".sfc"],
        "description": "Super Nintendo Entertainment System"
    }
}

def scan_roms():
    """Scan all ROM directories and build catalog"""
    catalog = {
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "version": "2.0",
        "description": "Complete ROM catalog for all emulator systems with core information",
        "systems": {}
    }
    
    base_path = Path(".")
    
    for system_id, system_info in SYSTEM_INFO.items():
        system_path = base_path / system_id
        
        if not system_path.exists():
            print(f"Warning: Directory not found for {system_id}")
            continue
            
        # Get all ROM files from the directory
        rom_files = []
        for file_path in sorted(system_path.iterdir()):
            if file_path.is_file():
                rom_files.append(file_path.name)
        
        catalog["systems"][system_id] = {
            "systemName": system_info["name"],
            "core": system_info["core"],
            "extensions": system_info["extensions"],
            "description": system_info["description"],
            "romCount": len(rom_files),
            "roms": rom_files
        }
        
        print(f"✓ {system_info['name']}: {len(rom_files)} ROMs")
    
    return catalog

# Generate the catalog
print("Scanning ROM directories...")
print("-" * 50)
catalog_data = scan_roms()
print("-" * 50)
print(f"Total systems: {len(catalog_data['systems'])}")

# Save with proper formatting
with open('catalog.json', 'w', encoding='utf-8') as f:
    json.dump(catalog_data, f, indent=2, ensure_ascii=False)

print("\n✓ catalog.json generated successfully!")
print("  - Properly formatted with 2-space indentation")
print("  - Includes system metadata and core information")
print("  - All ROMs from all systems included")
