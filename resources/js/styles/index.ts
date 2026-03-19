import type { StyleConfig } from '@/types/style';

import arcticWhite from './arctic-white.json';
import aurora from './aurora.json';
import browserDark from './browser-dark.json';
import browserLight from './browser-light.json';
import cyberPink from './cyber-pink.json';
import darkStudio from './dark-studio.json';
import forestDark from './forest-dark.json';
import gridLight from './grid-light.json';
import neonHalo from './neon-halo.json';
import obsidianGlass from './obsidian-glass.json';
import ogMinimal from './og-minimal.json';
import paperWhite from './paper-white.json';
import productHunt from './product-hunt.json';
import retroAmber from './retro-amber.json';
import sakuraMesh from './sakura-mesh.json';
import slateCard from './slate-card.json';
import terminalDark from './terminal-dark.json';
import warmStudio from './warm-studio.json';

const styles: StyleConfig[] = [
    obsidianGlass,
    neonHalo,
    arcticWhite,
    terminalDark,
    sakuraMesh,
    aurora,
    productHunt,
    ogMinimal,
    gridLight,
    darkStudio,
    browserLight,
    browserDark,
    warmStudio,
    cyberPink,
    slateCard,
    forestDark,
    paperWhite,
    retroAmber,
] as StyleConfig[];

export default styles;
