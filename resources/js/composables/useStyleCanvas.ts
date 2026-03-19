/**
 * Shared canvas rendering utility for style thumbnails.
 * Used by the landing page style gallery and the editor style picker.
 */
import type { StyleConfig } from '@/types/style';

// ── Demo image (inline SVG, no file asset needed) ─────────────────────────────
const DEMO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <rect width="800" height="500" fill="#0f0f13"/>
  <rect y="0" width="800" height="44" fill="#1a1a20"/>
  <rect x="16" y="14" width="60" height="16" rx="4" fill="#e0ff4f" opacity="0.9"/>
  <rect x="96" y="15" width="50" height="14" rx="3" fill="#3a3a45"/>
  <rect x="155" y="15" width="50" height="14" rx="3" fill="#3a3a45"/>
  <rect x="214" y="15" width="50" height="14" rx="3" fill="#3a3a45"/>
  <circle cx="768" cy="22" r="12" fill="#2a2a35"/>
  <rect x="0" y="44" width="180" height="456" fill="#13131a"/>
  <rect x="12" y="64" width="156" height="12" rx="3" fill="#2a2a35"/>
  <rect x="12" y="86" width="156" height="32" rx="6" fill="#e0ff4f" opacity="0.12"/>
  <rect x="20" y="98" width="8" height="8" rx="2" fill="#e0ff4f" opacity="0.6"/>
  <rect x="34" y="98" width="80" height="8" rx="2" fill="#e0ff4f" opacity="0.7"/>
  <rect x="12" y="128" width="156" height="32" rx="6"/>
  <rect x="20" y="141" width="8" height="8" rx="2" fill="#4a4a58"/>
  <rect x="34" y="141" width="70" height="8" rx="2" fill="#4a4a58"/>
  <rect x="12" y="170" width="156" height="32" rx="6"/>
  <rect x="20" y="183" width="8" height="8" rx="2" fill="#4a4a58"/>
  <rect x="34" y="183" width="55" height="8" rx="2" fill="#4a4a58"/>
  <rect x="196" y="60" width="148" height="80" rx="8" fill="#1a1a22"/>
  <rect x="208" y="72" width="60" height="8" rx="2" fill="#3a3a45"/>
  <rect x="208" y="90" width="90" height="20" rx="3" fill="#f0f0f2" opacity="0.8"/>
  <rect x="208" y="118" width="45" height="8" rx="2" fill="#4fff8a" opacity="0.6"/>
  <rect x="352" y="60" width="148" height="80" rx="8" fill="#1a1a22"/>
  <rect x="364" y="72" width="60" height="8" rx="2" fill="#3a3a45"/>
  <rect x="364" y="90" width="90" height="20" rx="3" fill="#f0f0f2" opacity="0.8"/>
  <rect x="364" y="118" width="45" height="8" rx="2" fill="#e0ff4f" opacity="0.6"/>
  <rect x="508" y="60" width="148" height="80" rx="8" fill="#1a1a22"/>
  <rect x="520" y="72" width="60" height="8" rx="2" fill="#3a3a45"/>
  <rect x="520" y="90" width="90" height="20" rx="3" fill="#f0f0f2" opacity="0.8"/>
  <rect x="520" y="118" width="45" height="8" rx="2" fill="#ff4f4f" opacity="0.6"/>
  <rect x="664" y="60" width="120" height="80" rx="8" fill="#1a1a22"/>
  <rect x="676" y="72" width="60" height="8" rx="2" fill="#3a3a45"/>
  <rect x="676" y="90" width="80" height="20" rx="3" fill="#f0f0f2" opacity="0.8"/>
  <rect x="196" y="156" width="588" height="288" rx="8" fill="#1a1a22"/>
  <rect x="196" y="156" width="588" height="36" rx="8" fill="#1e1e28"/>
  <rect x="212" y="170" width="60" height="8" rx="2" fill="#3a3a45"/>
  <rect x="380" y="170" width="50" height="8" rx="2" fill="#3a3a45"/>
  <rect x="500" y="170" width="50" height="8" rx="2" fill="#3a3a45"/>
  <rect x="640" y="170" width="50" height="8" rx="2" fill="#3a3a45"/>
  <rect x="212" y="200" width="80" height="8" rx="2" fill="#6a6a78"/>
  <rect x="380" y="200" width="40" height="8" rx="2" fill="#6a6a78"/>
  <rect x="500" y="200" width="60" height="8" rx="2" fill="#6a6a78"/>
  <rect x="640" y="200" width="30" height="8" rx="2" fill="#4fff8a" opacity="0.7"/>
  <rect x="212" y="224" width="100" height="8" rx="2" fill="#6a6a78"/>
  <rect x="380" y="224" width="45" height="8" rx="2" fill="#6a6a78"/>
  <rect x="500" y="224" width="50" height="8" rx="2" fill="#6a6a78"/>
  <rect x="640" y="224" width="30" height="8" rx="2" fill="#ff4f4f" opacity="0.7"/>
  <rect x="212" y="248" width="70" height="8" rx="2" fill="#6a6a78"/>
  <rect x="380" y="248" width="55" height="8" rx="2" fill="#6a6a78"/>
  <rect x="500" y="248" width="45" height="8" rx="2" fill="#6a6a78"/>
  <rect x="640" y="248" width="30" height="8" rx="2" fill="#4fff8a" opacity="0.7"/>
  <rect x="212" y="272" width="90" height="8" rx="2" fill="#6a6a78"/>
  <rect x="380" y="272" width="35" height="8" rx="2" fill="#6a6a78"/>
  <rect x="500" y="272" width="65" height="8" rx="2" fill="#6a6a78"/>
  <rect x="640" y="272" width="30" height="8" rx="2" fill="#4fff8a" opacity="0.7"/>
  <rect x="212" y="296" width="85" height="8" rx="2" fill="#6a6a78"/>
  <rect x="380" y="296" width="40" height="8" rx="2" fill="#6a6a78"/>
  <rect x="500" y="296" width="55" height="8" rx="2" fill="#6a6a78"/>
  <rect x="640" y="296" width="30" height="8" rx="2" fill="#e0ff4f" opacity="0.7"/>
  <rect x="196" y="456" width="280" height="84" rx="8" fill="#1a1a22"/>
  <rect x="208" y="468" width="80" height="8" rx="2" fill="#3a3a45"/>
  <rect x="214" y="500" width="20" height="32" rx="2" fill="#e0ff4f" opacity="0.4"/>
  <rect x="240" y="492" width="20" height="40" rx="2" fill="#e0ff4f" opacity="0.5"/>
  <rect x="266" y="484" width="20" height="48" rx="2" fill="#e0ff4f" opacity="0.6"/>
  <rect x="292" y="476" width="20" height="56" rx="2" fill="#e0ff4f" opacity="0.7"/>
  <rect x="318" y="488" width="20" height="44" rx="2" fill="#e0ff4f" opacity="0.55"/>
  <rect x="344" y="472" width="20" height="60" rx="2" fill="#e0ff4f" opacity="0.8"/>
  <rect x="370" y="468" width="20" height="64" rx="2" fill="#e0ff4f" opacity="0.9"/>
  <rect x="484" y="456" width="300" height="84" rx="8" fill="#1a1a22"/>
  <rect x="496" y="468" width="80" height="8" rx="2" fill="#3a3a45"/>
  <rect x="496" y="484" width="200" height="8" rx="2" fill="#2a2a35"/>
  <rect x="496" y="500" width="160" height="8" rx="2" fill="#2a2a35"/>
  <rect x="496" y="516" width="120" height="8" rx="2" fill="#2a2a35"/>
</svg>`;

let demoImgCache: HTMLImageElement | null = null;

export function loadDemoImage(): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
        if (demoImgCache) {
            resolve(demoImgCache);

            return;
        }

        const blob = new Blob([DEMO_SVG], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            demoImgCache = img;
            resolve(img);
        };
        img.src = url;
    });
}

function rrPath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
): void {
    const cr = Math.min(Math.max(r, 0), w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + cr, y);
    ctx.lineTo(x + w - cr, y);

    if (cr > 0) {
ctx.arcTo(x + w, y, x + w, y + cr, cr);
} else {
ctx.lineTo(x + w, y);
}

    ctx.lineTo(x + w, y + h - cr);

    if (cr > 0) {
ctx.arcTo(x + w, y + h, x + w - cr, y + h, cr);
} else {
ctx.lineTo(x + w, y + h);
}

    ctx.lineTo(x + cr, y + h);

    if (cr > 0) {
ctx.arcTo(x, y + h, x, y + h - cr, cr);
} else {
ctx.lineTo(x, y + h);
}

    ctx.lineTo(x, y + cr);

    if (cr > 0) {
ctx.arcTo(x, y, x + cr, y, cr);
} else {
ctx.lineTo(x, y);
}

    ctx.closePath();
}

export function renderStyleFrame(
    canvas: HTMLCanvasElement,
    style: StyleConfig,
    img: HTMLImageElement | null,
): void {
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    const cssW = canvas.offsetWidth || 200;
    const cssH = canvas.offsetHeight || 130;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
return;
}

    ctx.scale(dpr, dpr);

    // Stage background
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, cssW, cssH);

    // Card with 8% margin
    const margin = cssW * 0.08;
    const cardX = margin;
    const cardY = margin;
    const cardW = cssW - margin * 2;
    const cardH = cssH - margin * 2;

    const rScale = cardW / 280;
    const r = Math.min(style.radius * rScale, cardH / 3, cardW / 3);

    // Shadow
    if (style.shadow.opacity > 0) {
        ctx.save();
        ctx.shadowColor = style.shadow.color;
        ctx.shadowBlur = style.shadow.blur * rScale * 0.5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = style.shadow.offsetY * rScale * 0.4;
        ctx.globalAlpha = Math.min(style.shadow.opacity * 0.8, 0.9);
        rrPath(ctx, cardX, cardY, cardW, cardH, r);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.restore();
    }

    // Clip to card
    ctx.save();
    rrPath(ctx, cardX, cardY, cardW, cardH, r);
    ctx.clip();

    // Background
    const { background } = style;

    if (background.type === 'solid') {
        ctx.fillStyle = background.colors[0];
        ctx.fillRect(cardX, cardY, cardW, cardH);
    } else {
        const angleRad = (background.angle * Math.PI) / 180;
        const dx = Math.sin(angleRad);
        const dy = -Math.cos(angleRad);
        const halfDiag = Math.sqrt(cardW * cardW + cardH * cardH) / 2;
        const cx = cardX + cardW / 2;
        const cy = cardY + cardH / 2;
        const grad = ctx.createLinearGradient(
            cx - dx * halfDiag,
            cy - dy * halfDiag,
            cx + dx * halfDiag,
            cy + dy * halfDiag,
        );
        grad.addColorStop(0, background.colors[0]);
        grad.addColorStop(1, background.colors[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(cardX, cardY, cardW, cardH);
    }

    // Image
    if (img) {
        const padScale = cardW / 280;
        const pad = Math.max(style.padding * padScale * 0.38, 4);
        const imgAreaW = cardW - pad * 2;
        const imgAreaH = cardH - pad * 2;

        if (imgAreaW > 0 && imgAreaH > 0) {
            const scale = Math.min(imgAreaW / img.naturalWidth, imgAreaH / img.naturalHeight);
            const scaledW = img.naturalWidth * scale;
            const scaledH = img.naturalHeight * scale;
            ctx.drawImage(
                img,
                cardX + pad + (imgAreaW - scaledW) / 2,
                cardY + pad + (imgAreaH - scaledH) / 2,
                scaledW,
                scaledH,
            );
        }
    }

    ctx.restore();

    // Border
    if (style.border.opacity > 0) {
        ctx.save();
        rrPath(ctx, cardX, cardY, cardW, cardH, r);
        ctx.strokeStyle = `rgba(255,255,255,${style.border.opacity})`;
        ctx.lineWidth = Math.max(style.border.width, 0.5);
        ctx.stroke();
        ctx.restore();
    }
}
