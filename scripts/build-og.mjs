import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const svg = readFileSync(resolve(root, 'resources/og/og-polsh.svg'));

await sharp(Buffer.from(svg))
    .resize(1200, 630)
    .png({ quality: 95 })
    .toFile(resolve(root, 'public/images/og-polsh.png'));

console.log('✓ OG image generated: public/images/og-polsh.png');
