import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const achievementsDir = join(root, "public", "images", "achievements");
mkdirSync(achievementsDir, { recursive: true });

const palettes = [
  ["#0b5f43", "#138b60", "#7ed0b0"],
  ["#0d3b52", "#13708b", "#7fd0d6"],
  ["#6b4a12", "#b47a1e", "#f2c879"],
  ["#0a5138", "#1a9a6d", "#a7e3c8"],
  ["#16263f", "#2c4a73", "#9db8dd"],
  ["#6d3216", "#b45a24", "#f0b184"],
  ["#3f2359", "#6b3f8f", "#c9a8e6"],
  ["#123a5c", "#1e6a9e", "#9ccbe8"],
  ["#5c2333", "#a13d55", "#e9a7b8"],
];

function achievementSvg(index, [deep, mid, accent]) {
  const motif =
    index % 3 === 0
      ? `<g opacity="0.92" transform="translate(400 250)">
          <path d="M-150 40 L0 -40 L150 40 L0 120 Z" fill="none" stroke="${accent}" stroke-width="10" stroke-linejoin="round"/>
          <path d="M-95 65 L-95 145 Q0 205 95 145 L95 65" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
          <path d="M150 40 L150 150" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
          <circle cx="150" cy="165" r="16" fill="${accent}"/>
        </g>`
      : index % 3 === 1
        ? `<g opacity="0.92" transform="translate(400 260)">
          <rect x="-150" y="-70" width="300" height="200" rx="22" fill="none" stroke="${accent}" stroke-width="10"/>
          <path d="M-150 -20 Q-40 -70 0 -10 Q40 -70 150 -20" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
          <path d="M0 -10 L0 130" stroke="${accent}" stroke-width="10"/>
        </g>`
        : `<g opacity="0.92" transform="translate(400 250)">
          <circle cx="0" cy="0" r="120" fill="none" stroke="${accent}" stroke-width="10"/>
          <path d="M0 -70 L0 70 M-70 0 L70 0" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
          <circle cx="0" cy="0" r="30" fill="${accent}"/>
        </g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500" role="img" aria-label="CEBBD achievement artwork">
  <defs>
    <linearGradient id="bg${index}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${deep}"/>
      <stop offset="100%" stop-color="${mid}"/>
    </linearGradient>
    <pattern id="dots${index}" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="2" fill="${accent}" opacity="0.18"/>
    </pattern>
  </defs>
  <rect width="800" height="500" fill="url(#bg${index})"/>
  <rect width="800" height="500" fill="url(#dots${index})"/>
  <circle cx="690" cy="90" r="170" fill="${accent}" opacity="0.08"/>
  <circle cx="90" cy="440" r="150" fill="${accent}" opacity="0.06"/>
  <path d="M0 420 Q200 340 400 420 T800 420" fill="none" stroke="${accent}" stroke-width="2" opacity="0.25"/>
  <path d="M0 450 Q200 370 400 450 T800 450" fill="none" stroke="${accent}" stroke-width="2" opacity="0.18"/>
  ${motif}
  <text x="46" y="64" fill="${accent}" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="4">CEBBD</text>
  <text x="754" y="470" fill="${accent}" opacity="0.55" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="72" font-weight="800">${String(index).padStart(2, "0")}</text>
</svg>`;
}

palettes.forEach((palette, index) => {
  writeFileSync(
    join(achievementsDir, `achievement-${index + 1}.svg`),
    achievementSvg(index + 1, palette),
    "utf8",
  );
});

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#138b60"/>
      <stop offset="100%" stop-color="#054d36"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="120" fill="url(#g)"/>
  <path d="M128 236 L256 168 L384 236 L256 304 Z" fill="#ffffff"/>
  <path d="M170 270 L170 334 Q256 386 342 334 L342 270" fill="none" stroke="#ffffff" stroke-width="26" stroke-linecap="round"/>
  <path d="M384 236 L384 330" stroke="#ffffff" stroke-width="24" stroke-linecap="round"/>
  <circle cx="384" cy="354" r="22" fill="#7ed0b0"/>
</svg>`;

writeFileSync(join(root, "public", "images", "logo-mark.svg"), logoSvg, "utf8");
writeFileSync(join(root, "src", "app", "icon.svg"), logoSvg, "utf8");

const patternSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <g fill="none" stroke="#ffffff" stroke-opacity="0.06" stroke-width="1">
    <path d="M0 60 H120 M60 0 V120"/>
    <circle cx="60" cy="60" r="38"/>
  </g>
</svg>`;
writeFileSync(join(root, "public", "images", "pattern.svg"), patternSvg, "utf8");

console.log("Generated logo, icon, pattern and 9 achievement images.");
