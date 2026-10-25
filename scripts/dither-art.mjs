// Regenerates the site artwork in public/assets/art/ from public-domain
// originals on Wikimedia Commons: crop → grayscale → error-diffusion dither
// into a small blue palette. Also renders the favicons and og.png.
//
// sharp is deliberately not a project dependency (this runs rarely):
//   npm i --no-save sharp && npm run art
//   npm run art -- --preview   (writes small previews of the originals instead)

import sharp from "sharp";
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import { join } from "node:path";

const CACHE = ".cache/art";
const OUT = "public/assets/art";
const PUBLIC = "public";
const COMMONS = "https://upload.wikimedia.org/wikipedia/commons/";

const BLUE = [0, 0, 242];
const PAPER = [242, 242, 242];
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

// crop: [x, y, w, h] as fractions of the original image.
// tone: { contrast, brightness, gamma } applied before dithering.
const ART = [
  { name: "hero", file: "8/87/Flammarion.jpg", mode: "inverted", size: [680, 743], crop: [0.068, 0.088, 0.62, 0.81] },
  { name: "demo", file: "7/7d/James_Abbott_McNeill_Whistler_-_Nocturne-_Blue_and_Silver_-_Chelsea_-_Google_Art_Project.jpg", mode: "natural", size: [1620, 948], tone: { brightness: 0.68 } },
  { name: "why", file: "a/a5/Tsunami_by_hokusai_19th_century.jpg", mode: "duotone", size: [1200, 760] },
  { name: "service-apps", file: "1/18/D%C3%BCrer_Melancholia_I.jpg", mode: "duotone", size: [680, 420], crop: [0.4, 0.2, 0.6, 0.29] },
  { name: "service-models", file: "0/0c/Haeckel_Spumellaria.jpg", mode: "duotone", size: [680, 420], crop: [0.05, 0.25, 0.9, 0.39] },
  { name: "service-automation", file: "f/f8/A_la_m%C3%A9moire_de_J.M._Jacquard.jpg", mode: "duotone", size: [680, 420], crop: [0, 0.14, 1, 0.41], tone: { contrast: 1.35, brightness: -30 } },
  { name: "service-agents", file: "8/8b/Tuerkischer_schachspieler_windisch4.jpg", mode: "duotone", size: [680, 420], crop: [0, 0, 1, 0.72], tone: { contrast: 1.4, brightness: -40 } },
  { name: "contact", file: "d/d2/Paradiso_Canto_31.jpg", mode: "duotone", size: [1080, 340], crop: [0, 0.3, 1, 0.28], tone: { contrast: 1.6, brightness: -45 } },
  { name: "footer", file: "b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg", mode: "duotone", size: [1440, 900], crop: [0, 0.25, 1, 0.49] },
];

const PALETTES = {
  duotone: [BLUE, mix(BLUE, PAPER, 0.5), PAPER],
  inverted: [BLUE, mix(BLUE, PAPER, 0.5), PAPER],
};

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function original(file) {
  const local = join(CACHE, decodeURIComponent(file.split("/").pop()));
  if (await exists(local)) return local;
  // Wikimedia rate-limits bursts (429), so back off and retry.
  for (let attempt = 1; attempt <= 6; attempt++) {
    const res = await fetch(COMMONS + file, {
      headers: { "User-Agent": "magnisale-site-art/1.0 (https://magnisale.com; hello@magnisale.com)" },
    });
    if (res.ok) {
      await writeFile(local, Buffer.from(await res.arrayBuffer()));
      return local;
    }
    if (res.status !== 429 && res.status < 500) throw new Error(`${res.status} fetching ${file}`);
    const wait = Number(res.headers.get("retry-after")) * 1000 || attempt * 5000;
    console.log(`  ${res.status} on ${file}, retrying in ${wait / 1000}s`);
    await new Promise((r) => setTimeout(r, wait));
  }
  throw new Error(`gave up fetching ${file}`);
}

async function cropped(src, crop) {
  const img = sharp(src);
  if (!crop) return img;
  const { width, height } = await img.metadata();
  const [x, y, w, h] = crop;
  return sharp(src).extract({
    left: Math.round(x * width),
    top: Math.round(y * height),
    width: Math.round(w * width),
    height: Math.round(h * height),
  });
}

// Serpentine Floyd–Steinberg to `levels` evenly spaced grey levels.
function dither(gray, w, h, levels) {
  const buf = Float32Array.from(gray);
  const out = new Uint8Array(w * h);
  const step = 255 / (levels - 1);
  for (let y = 0; y < h; y++) {
    const ltr = y % 2 === 0;
    for (let i = 0; i < w; i++) {
      const x = ltr ? i : w - 1 - i;
      const idx = y * w + x;
      const q = Math.max(0, Math.min(levels - 1, Math.round(buf[idx] / step)));
      out[idx] = q;
      const err = buf[idx] - q * step;
      const dx = ltr ? 1 : -1;
      if (x + dx >= 0 && x + dx < w) buf[idx + dx] += (err * 7) / 16;
      if (y + 1 < h) {
        if (x - dx >= 0 && x - dx < w) buf[idx + w - dx] += (err * 3) / 16;
        buf[idx + w] += (err * 5) / 16;
        if (x + dx >= 0 && x + dx < w) buf[idx + w + dx] += err / 16;
      }
    }
  }
  return out;
}

async function render(art) {
  const src = await original(art.file);
  const [w, h] = art.size;
  const base = (await cropped(src, art.crop)).resize(w, h, { fit: "cover", position: art.position ?? "centre" });

  if (art.mode === "natural") {
    await base
      .modulate({ brightness: art.tone?.brightness ?? 0.72, saturation: 0.9 })
      .webp({ quality: 70 })
      .toFile(join(OUT, `${art.name}.webp`));
    return `${art.name}.webp`;
  }

  const { contrast = 1.15, brightness = 0, gamma } = art.tone ?? {};
  let pipeline = base.grayscale().normalise({ lower: 1, upper: 99 });
  if (gamma) pipeline = pipeline.gamma(gamma);
  if (art.mode === "inverted") pipeline = pipeline.negate({ alpha: false });
  pipeline = pipeline.linear(contrast, -(128 * contrast) + 128 + brightness);

  const gray = await pipeline.extractChannel(0).raw().toBuffer();
  const palette = PALETTES[art.mode];
  const levels = dither(gray, w, h, palette.length);
  const rgb = Buffer.alloc(w * h * 3);
  levels.forEach((l, i) => rgb.set(palette[l], i * 3));

  await sharp(rgb, { raw: { width: w, height: h, channels: 3 } })
    .png({ palette: true, colours: palette.length, dither: 0, compressionLevel: 9, effort: 10 })
    .toFile(join(OUT, `${art.name}.png`));
  return `${art.name}.png`;
}

async function icons() {
  const logo = await readFile(join(PUBLIC, "assets/logo.svg"), "utf8");
  const mark = (color) => Buffer.from(logo.replace(/currentColor/g, color));
  await sharp(mark("#0000F2"), { density: 300 }).resize(32, 32, { fit: "contain", background: "#0000" }).png().toFile(join(PUBLIC, "favicon.png"));
  const markPaper = await sharp(mark("#F2F2F2"), { density: 600 }).resize(110, 110, { fit: "contain", background: "#0000" }).png().toBuffer();
  await sharp({ create: { width: 180, height: 180, channels: 3, background: "#0000F2" } })
    .composite([{ input: markPaper, gravity: "centre" }])
    .png()
    .toFile(join(PUBLIC, "apple-touch-icon.png"));

  // og.png: hero art on the right, logo mark on the left, on Hermes blue.
  const art = await sharp(join(OUT, "hero.png")).resize(504, 630, { fit: "cover" }).toBuffer();
  const ogMark = await sharp(mark("#F2F2F2"), { density: 900 }).resize(220, 220, { fit: "contain", background: "#0000" }).png().toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#0000F2" } })
    .composite([
      { input: art, left: 696, top: 0 },
      { input: ogMark, left: 238, top: 205 },
    ])
    .png({ palette: true, colours: 16 })
    .toFile(join(PUBLIC, "og.png"));
}

async function preview() {
  const dir = join(CACHE, "preview");
  await mkdir(dir, { recursive: true });
  for (const art of ART) {
    const src = await original(art.file);
    await sharp(src).resize(600, 600, { fit: "inside" }).jpeg({ quality: 70 }).toFile(join(dir, `${art.name}.jpg`));
    console.log("preview", art.name);
  }
}

await mkdir(CACHE, { recursive: true });
await mkdir(OUT, { recursive: true });

if (process.argv.includes("--preview")) {
  await preview();
} else {
  const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
  for (const art of ART) {
    if (only && art.name !== only) continue;
    console.log("art", await render(art));
  }
  if (!only) {
    await icons();
    console.log("icons favicon.png apple-touch-icon.png og.png");
  }
}
