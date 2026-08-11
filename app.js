const svg = document.getElementById("achievementSvg");
const dpiInfo = document.getElementById("dpiInfo");

const $ = (id) => document.getElementById(id);

const CANVAS = { width: 1932, height: 1360 };

const DEFAULTS = {
  width: CANVAS.width,
  height: CANVAS.height,
  mainTitle: "人类的护道者",
  subTitle: "成就解锁",
  description: "世界需要人类，而人类需要护道者。\n上传你的 Logo 与底图，生成一张具有高级玻璃质感的游戏成就介绍卡片。",
  accentColor: "#f5f7ff",
  textColor: "#ffffff",
  cardOpacity: 38,
  glassDepth: 66,
  glassDispersion: 30,
  backgroundScale: 100,
  backgroundX: 0,
  backgroundY: 0,
  backgroundOpacity: 100,
  logoScale: 120,
  logoX: 0,
  logoY: 0,
  descriptionBoxWidth: 930,
  descriptionBoxHeight: 210,
  fontFamily: "system",
  zoom: 72
};

const state = {
  ...DEFAULTS,
  logo: "",
  background: "",
  customFontName: "",
  themes: []
};

const rangeIds = [
  "backgroundScale", "backgroundX", "backgroundY", "backgroundOpacity",
  "logoScale", "logoX", "logoY",
  "glassDepth", "glassDispersion", "cardOpacity",
  "descriptionBoxWidth", "descriptionBoxHeight", "previewZoom"
];

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const value = parseInt(clean.length === 3 ? clean.split("").map((x) => x + x).join("") : clean, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function luminance({ r, g, b }) {
  const channel = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channel[0] + 0.7152 * channel[1] + 0.0722 * channel[2];
}

function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, l };
}

function hslToRgb({ h, s, l }) {
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r;
  let g;
  let b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: r * 255, g: g * 255, b: b * 255 };
}

function shiftColor(rgb, { hue = 0, saturation = 0, lightness = 0 } = {}) {
  const hsl = rgbToHsl(rgb);
  return hslToRgb({
    h: (hsl.h + hue + 1) % 1,
    s: Math.max(0, Math.min(1, hsl.s + saturation)),
    l: Math.max(0.08, Math.min(0.92, hsl.l + lightness))
  });
}

function fontStack() {
  if (state.customFontName) return `'${state.customFontName}', 'PingFang SC', sans-serif`;
  const map = {
    system: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif`,
    song: `'Songti SC', SimSun, STSong, serif`,
    kai: `'Kaiti SC', KaiTi, STKaiti, serif`,
    hei: `'Source Han Sans SC', 'Noto Sans CJK SC', 'PingFang SC', 'Microsoft YaHei', sans-serif`
  };
  return map[state.fontFamily] || map.system;
}

function wrapLineByWidth(line, maxChars) {
  const pieces = [];
  let current = "";
  for (const ch of Array.from(line || "")) {
    if (current.length >= maxChars && /[，。！？、,.!?\s]/.test(ch)) {
      pieces.push(current + ch);
      current = "";
    } else if (current.length >= maxChars) {
      pieces.push(current);
      current = ch;
    } else {
      current += ch;
    }
  }
  pieces.push(current);
  return pieces;
}

function formatDescriptionLines(text, boxWidth, boxHeight) {
  const maxChars = Math.max(6, Math.floor(boxWidth / 41));
  const maxLines = Math.max(1, Math.floor(boxHeight / 64));
  const manualLines = String(text || "").split(/\r?\n/);
  const lines = [];
  for (const manualLine of manualLines) {
    const wrapped = wrapLineByWidth(manualLine, maxChars);
    for (const line of wrapped) {
      lines.push(line);
      if (lines.length >= maxLines) return lines;
    }
  }
  return lines;
}

function buildDefaultBackground() {
  const markup = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}">
      <defs>
        <radialGradient id="pink" cx="18%" cy="10%" r="48%"><stop stop-color="#ff66d6"/><stop offset=".62" stop-color="#ffd3a8"/><stop offset="1" stop-color="#050714" stop-opacity="0"/></radialGradient>
        <radialGradient id="purple" cx="78%" cy="78%" r="46%"><stop stop-color="#8347ff"/><stop offset=".62" stop-color="#8fa2ff"/><stop offset="1" stop-color="#050714" stop-opacity="0"/></radialGradient>
        <linearGradient id="base" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#02040f"/><stop offset="1" stop-color="#0c1028"/></linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#base)"/>
      <circle cx="205" cy="115" r="630" fill="url(#pink)" opacity=".96"/>
      <circle cx="1605" cy="1135" r="620" fill="url(#purple)" opacity=".98"/>
      <rect width="100%" height="100%" fill="#02040f" opacity=".18"/>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}

function buildDefaultLogo() {
  const markup = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#dce6ff"/></linearGradient>
        <filter id="s"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000" flood-opacity=".24"/></filter>
      </defs>
      <rect width="500" height="500" fill="none"/>
      <g filter="url(#s)">
        <path d="M250 58 412 152v196L250 442 88 348V152Z" fill="rgba(255,255,255,.16)" stroke="url(#g)" stroke-width="18"/>
        <path d="M156 250h188M250 156v188" stroke="url(#g)" stroke-width="32" stroke-linecap="round"/>
        <circle cx="250" cy="250" r="78" fill="none" stroke="url(#g)" stroke-width="22"/>
      </g>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}

function imageLayer(src, clipId, area, scale, offsetX, offsetY, preserve = "xMidYMid slice", opacity = 1) {
  const width = area.width * (scale / 100);
  const height = area.height * (scale / 100);
  const maxPanX = Math.max(0, (width - area.width) / 2);
  const maxPanY = Math.max(0, (height - area.height) / 2);
  const x = area.x + (area.width - width) / 2 + (offsetX / 100) * maxPanX;
  const y = area.y + (area.height - height) / 2 + (offsetY / 100) * maxPanY;
  return `<image href="${src}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="${preserve}" opacity="${opacity}" clip-path="url(#${clipId})"/>`;
}

function styleBlock() {
  const textSoft = rgba(state.textColor, 0.72);
  return `
    <style>
      .font-main { font-family: ${fontStack()}; }
      .subtitle { font-weight: 850; letter-spacing: .14em; }
      .title { font-weight: 900; letter-spacing: .04em; }
      .desc { font-weight: 650; line-height: 1.48; }
      .textFill { fill: ${state.textColor}; }
      .mutedFill { fill: ${textSoft}; }
      .accentStroke { stroke: ${state.accentColor}; }
      .accentFill { fill: ${state.accentColor}; }
    </style>`;
}

function buildDefs(card, logoBox) {
  const depth = state.glassDepth / 100;
  const dispersion = state.glassDispersion / 100;
  const shadowOpacity = 0.22 + depth * 0.28;
  const blur = 18 + depth * 34;
  const cardOpacity = state.cardOpacity / 100;
  const roughScale = 4 + depth * 5 + dispersion * 6;
  return `
    <defs>
      <clipPath id="canvasClip"><rect x="0" y="0" width="${state.width}" height="${state.height}"/></clipPath>
      <clipPath id="logoClip"><rect x="${logoBox.x}" y="${logoBox.y}" width="${logoBox.width}" height="${logoBox.height}" rx="44" ry="44"/></clipPath>
      <linearGradient id="glassFill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffffff" stop-opacity="${cardOpacity + 0.14}"/>
        <stop offset="0.42" stop-color="#ffffff" stop-opacity="${cardOpacity * 0.62}"/>
        <stop offset="1" stop-color="#d7deff" stop-opacity="${Math.max(0.08, cardOpacity * 0.34)}"/>
      </linearGradient>
      <linearGradient id="glassBorder" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffffff" stop-opacity="${0.86 + depth * 0.12}"/>
        <stop offset="0.22" stop-color="#ffffff" stop-opacity="${0.26 + depth * 0.18}"/>
        <stop offset="0.56" stop-color="${state.accentColor}" stop-opacity="${0.2 + dispersion * 0.32}"/>
        <stop offset="0.76" stop-color="#80eaff" stop-opacity="${0.12 + dispersion * 0.22}"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="${0.42 + depth * 0.24}"/>
      </linearGradient>
      <radialGradient id="glassGlowA" cx="10%" cy="8%" r="60%">
        <stop stop-color="#ffffff" stop-opacity="${0.26 + depth * 0.22}"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glassGlowB" cx="82%" cy="86%" r="58%">
        <stop stop-color="${state.accentColor}" stop-opacity="${0.15 + dispersion * 0.2}"/>
        <stop offset="1" stop-color="${state.accentColor}" stop-opacity="0"/>
      </radialGradient>
      <filter id="liquidShadow" x="-20%" y="-30%" width="140%" height="170%">
        <feDropShadow dx="0" dy="${22 + depth * 18}" stdDeviation="${blur}" flood-color="#000000" flood-opacity="${shadowOpacity}"/>
      </filter>
      <filter id="roughGlassEdge" x="-8%" y="-14%" width="116%" height="128%">
        <feTurbulence type="fractalNoise" baseFrequency="0.018 0.08" numOctaves="2" seed="12" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="${roughScale}" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
        <feGaussianBlur in="displaced" stdDeviation="${0.25 + depth * 0.55}" result="soft"/>
        <feMerge>
          <feMergeNode in="soft"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="edgeBloom" x="-12%" y="-18%" width="124%" height="136%">
        <feDropShadow dx="${2 + dispersion * 5}" dy="${1 + dispersion * 3}" stdDeviation="${2 + dispersion * 3}" flood-color="#ff7adf" flood-opacity="${0.16 + dispersion * 0.34}"/>
        <feDropShadow dx="${-2 - dispersion * 5}" dy="${-1 - dispersion * 3}" stdDeviation="${2 + dispersion * 3}" flood-color="#83e9ff" flood-opacity="${0.14 + dispersion * 0.3}"/>
      </filter>
      <filter id="softLogoShadow" x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000000" flood-opacity=".32"/>
      </filter>
      <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#000" stop-opacity=".18"/>
        <stop offset=".5" stop-color="#000" stop-opacity=".04"/>
        <stop offset="1" stop-color="#000" stop-opacity=".28"/>
      </linearGradient>
    </defs>`;
}

function renderCard(card, logoBox) {
  const depth = state.glassDepth / 100;
  const dispersion = state.glassDispersion / 100;
  const edgeOpacity = 0.2 + dispersion * 0.48;
  const redOffset = 2 + dispersion * 9;
  const blueOffset = 1.5 + dispersion * 8;
  const logoSrc = state.logo || buildDefaultLogo();
  const contentX = logoBox.x + logoBox.width + 78;
  const titleY = card.y + 210;
  const lineY = card.y + 326;
  const descX = contentX;
  const descY = lineY + 82;
  const descLines = formatDescriptionLines(state.description, state.descriptionBoxWidth, state.descriptionBoxHeight);
  const logoImage = imageLayer(logoSrc, "logoClip", logoBox, state.logoScale, state.logoX, state.logoY, "xMidYMid slice");

  return `
    <g filter="url(#liquidShadow)">
      <rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="rgba(255,255,255,${0.04 + depth * 0.04})"/>
      <rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="url(#glassFill)"/>
      <rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="url(#glassGlowA)"/>
      <rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="url(#glassGlowB)"/>
      <rect x="${card.x + redOffset}" y="${card.y + redOffset * 0.32}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="none" stroke="#ff7adf" stroke-opacity="${edgeOpacity}" stroke-width="${3 + dispersion * 4}" filter="url(#roughGlassEdge)"/>
      <rect x="${card.x - blueOffset}" y="${card.y - blueOffset * 0.22}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="none" stroke="#83e9ff" stroke-opacity="${edgeOpacity * 0.82}" stroke-width="${2 + dispersion * 3}" filter="url(#roughGlassEdge)"/>
      <rect x="${card.x + 1}" y="${card.y + 1}" width="${card.width - 2}" height="${card.height - 2}" rx="${card.radius - 1}" fill="none" stroke="url(#glassBorder)" stroke-width="${7 + depth * 5}" stroke-opacity="${0.72 + depth * 0.2}" filter="url(#edgeBloom)"/>
      <rect x="${card.x + 2}" y="${card.y + 2}" width="${card.width - 4}" height="${card.height - 4}" rx="${card.radius - 2}" fill="none" stroke="#ffffff" stroke-opacity="${0.12 + depth * 0.16}" stroke-width="${18 + depth * 12}" filter="url(#roughGlassEdge)"/>
    </g>
    <g filter="url(#softLogoShadow)">
      <rect x="${logoBox.x}" y="${logoBox.y}" width="${logoBox.width}" height="${logoBox.height}" rx="44" fill="rgba(255,255,255,.16)" stroke="#ffffff" stroke-opacity=".5" stroke-width="2.4"/>
      ${logoImage}
    </g>
    <g class="font-main textFill">
      <text x="${contentX}" y="${card.y + 134}" class="subtitle" font-size="42" opacity=".88">${escapeXml(state.subTitle)}</text>
      <text x="${contentX}" y="${titleY}" class="title" font-size="84">${escapeXml(state.mainTitle)}</text>
      <line x1="${contentX}" y1="${lineY}" x2="${Math.min(card.x + card.width - 126, descX + state.descriptionBoxWidth)}" y2="${lineY}" stroke="#ffffff" stroke-opacity="${0.25 + depth * 0.18}" stroke-width="2"/>
      <text x="${descX}" y="${descY}" class="desc mutedFill" font-size="44">
        ${descLines.map((line, i) => `<tspan x="${descX}" dy="${i === 0 ? 0 : 64}">${escapeXml(line)}</tspan>`).join("")}
      </text>
    </g>`;
}

function renderSvg() {
  const w = state.width;
  const h = state.height;
  const bgSrc = state.background || buildDefaultBackground();
  const card = { x: 188, y: 236, width: 1556, height: 690, radius: 126 };
  const logoBox = { x: card.x + 118, y: card.y + 172, width: 340, height: 340 };
  const bgArea = { x: 0, y: 0, width: w, height: h };

  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svg.setAttribute("width", w);
  svg.setAttribute("height", h);
  svg.innerHTML = `
    ${styleBlock()}
    ${buildDefs(card, logoBox)}
    <rect width="100%" height="100%" fill="#02040f"/>
    ${imageLayer(bgSrc, "canvasClip", bgArea, state.backgroundScale, state.backgroundX, state.backgroundY, "xMidYMid slice", state.backgroundOpacity / 100)}
    <rect width="100%" height="100%" fill="url(#shade)"/>
    ${renderCard(card, logoBox)}
  `;
  svg.style.width = `${state.zoom}%`;
  dpiInfo.textContent = `300dpi · ${w}×${h}px · 参考图比例`;
}

function readFileAsDataUrl(file, callback) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => callback(String(reader.result));
  reader.readAsDataURL(file);
}

function download(filename, href) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function serializeSvg() {
  return new XMLSerializer().serializeToString(svg);
}

async function downloadPng() {
  const svgText = serializeSvg();
  const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = state.width;
    canvas.height = state.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    canvas.toBlob((pngBlob) => {
      if (!pngBlob) return;
      const pngUrl = URL.createObjectURL(pngBlob);
      download(`liquid-glass-achievement-${state.width}x${state.height}-300dpi.png`, pngUrl);
      setTimeout(() => URL.revokeObjectURL(pngUrl), 1000);
    }, "image/png", 1);
  };
  img.src = url;
}

function stateKeyFromRangeId(id) {
  return id === "previewZoom" ? "zoom" : id;
}

function clampToInput(id, value) {
  const input = $(id);
  const min = Number(input.min || -Infinity);
  const max = Number(input.max || Infinity);
  return Math.max(min, Math.min(max, Number(value)));
}

function syncRangeUi(id) {
  const key = stateKeyFromRangeId(id);
  const value = state[key];
  if ($(id)) $(id).value = value;
  if ($(`${id}Number`)) $(`${id}Number`).value = value;
}

function syncAllRangeUi() {
  rangeIds.forEach(syncRangeUi);
}

function setRangeValue(id, value) {
  const key = stateKeyFromRangeId(id);
  state[key] = clampToInput(id, value);
  syncRangeUi(id);
  renderSvg();
}

function setupRangeControls() {
  rangeIds.forEach((id) => {
    const input = $(id);
    if (!input || input.dataset.enhanced === "true") return;
    input.dataset.enhanced = "true";
    const wrapper = document.createElement("div");
    wrapper.className = "range-control";
    const number = document.createElement("input");
    number.type = "number";
    number.id = `${id}Number`;
    number.className = "range-number";
    number.min = input.min;
    number.max = input.max;
    number.step = input.step || "1";
    number.value = input.value;
    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "reset-mini";
    reset.textContent = "复原";
    reset.title = "复原此项默认值";
    input.parentNode.insertBefore(wrapper, input);
    wrapper.append(input, number, reset);
    input.addEventListener("input", (event) => setRangeValue(id, event.target.value));
    number.addEventListener("input", (event) => setRangeValue(id, event.target.value));
    reset.addEventListener("click", () => setRangeValue(id, DEFAULTS[stateKeyFromRangeId(id)]));
  });
}

function syncColorUi() {
  ["accentColor", "textColor"].forEach((id) => {
    if ($(id)) $(id).value = state[id];
  });
}

function renderThemeChoices(themes = state.themes) {
  const container = $("themePalette");
  if (!container) return;
  if (!themes.length) {
    container.innerHTML = `<p class="theme-empty">上传底图后，将自动生成强调色 / 文字色组合。</p>`;
    return;
  }
  container.innerHTML = themes.map((theme, index) => `
    <button class="theme-option" type="button" data-theme-index="${index}" aria-label="应用主题色 ${theme.name}">
      <span class="theme-swatches">
        <i style="background:${theme.accentColor}"></i>
        <i style="background:${theme.textColor}"></i>
      </span>
      <span>${theme.name}</span>
      <small>${theme.accentColor} / ${theme.textColor}</small>
    </button>
  `).join("");
  container.querySelectorAll(".theme-option").forEach((button) => {
    button.addEventListener("click", () => {
      const theme = themes[Number(button.dataset.themeIndex)];
      state.accentColor = theme.accentColor;
      state.textColor = theme.textColor;
      syncColorUi();
      renderSvg();
    });
  });
}

function extractThemeColors(dataUrl) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const size = 96;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);
    const buckets = new Map();
    let total = { r: 0, g: 0, b: 0, count: 0 };
    let darkest = { r: 255, g: 255, b: 255 };
    let lightest = { r: 0, g: 0, b: 0 };

    for (let i = 0; i < data.length; i += 16) {
      const a = data[i + 3];
      if (a < 160) continue;
      const rgb = { r: data[i], g: data[i + 1], b: data[i + 2] };
      const lum = luminance(rgb);
      if (lum < 0.025 || lum > 0.98) continue;
      total.r += rgb.r; total.g += rgb.g; total.b += rgb.b; total.count += 1;
      if (lum < luminance(darkest)) darkest = rgb;
      if (lum > luminance(lightest)) lightest = rgb;
      const key = [rgb.r, rgb.g, rgb.b].map((v) => Math.floor(v / 32) * 32).join(",");
      const bucket = buckets.get(key) || { r: 0, g: 0, b: 0, count: 0 };
      bucket.r += rgb.r; bucket.g += rgb.g; bucket.b += rgb.b; bucket.count += 1;
      buckets.set(key, bucket);
    }

    if (!total.count) {
      state.themes = [];
      renderThemeChoices();
      return;
    }

    const average = { r: total.r / total.count, g: total.g / total.count, b: total.b / total.count };
    const candidates = Array.from(buckets.values()).map((bucket) => {
      const rgb = { r: bucket.r / bucket.count, g: bucket.g / bucket.count, b: bucket.b / bucket.count };
      const hsl = rgbToHsl(rgb);
      return { rgb, hsl, score: bucket.count * (0.75 + hsl.s) * (0.75 + Math.abs(hsl.l - 0.5)) };
    }).filter((item) => item.hsl.s > 0.08 && item.hsl.l > 0.08 && item.hsl.l < 0.9)
      .sort((a, b) => b.score - a.score);

    const primary = candidates[0]?.rgb || average;
    const secondary = candidates.find((item) => Math.abs(item.hsl.h - rgbToHsl(primary).h) > 0.08)?.rgb || shiftColor(primary, { hue: 0.08, saturation: 0.06, lightness: 0.08 });
    const brightAccent = shiftColor(lightest, { saturation: 0.1, lightness: 0.04 });
    const deepAccent = shiftColor(primary, { saturation: 0.12, lightness: -0.08 });
    const avgLum = luminance(average);
    const safeLightText = avgLum < 0.72 ? "#ffffff" : "#1a1d2a";
    const softLightText = rgbToHex(shiftColor(lightest, { saturation: -0.12, lightness: 0.02 }));
    const deepText = rgbToHex(shiftColor(darkest, { saturation: 0.04, lightness: -0.02 }));

    state.themes = [
      { name: "主色高亮", accentColor: rgbToHex(shiftColor(primary, { saturation: 0.08, lightness: 0.06 })), textColor: safeLightText },
      { name: "柔和亮字", accentColor: rgbToHex(secondary), textColor: softLightText },
      { name: "深色文字", accentColor: rgbToHex(brightAccent), textColor: deepText },
      { name: "浓郁边缘", accentColor: rgbToHex(deepAccent), textColor: safeLightText }
    ];
    renderThemeChoices();
  };
  img.src = dataUrl;
}

function resetAdjustments() {
  Object.assign(state, {
    accentColor: DEFAULTS.accentColor,
    textColor: DEFAULTS.textColor,
    cardOpacity: DEFAULTS.cardOpacity,
    glassDepth: DEFAULTS.glassDepth,
    glassDispersion: DEFAULTS.glassDispersion,
    backgroundScale: DEFAULTS.backgroundScale,
    backgroundX: DEFAULTS.backgroundX,
    backgroundY: DEFAULTS.backgroundY,
    backgroundOpacity: DEFAULTS.backgroundOpacity,
    logoScale: DEFAULTS.logoScale,
    logoX: DEFAULTS.logoX,
    logoY: DEFAULTS.logoY,
    descriptionBoxWidth: DEFAULTS.descriptionBoxWidth,
    descriptionBoxHeight: DEFAULTS.descriptionBoxHeight,
    fontFamily: DEFAULTS.fontFamily,
    zoom: DEFAULTS.zoom
  });
  syncAllRangeUi();
  syncColorUi();
  $("fontFamily").value = state.fontFamily;
  renderSvg();
}

function resetDemo() {
  Object.assign(state, {
    ...DEFAULTS,
    logo: "",
    background: "",
    customFontName: "",
    themes: []
  });
  ["mainTitle", "subTitle", "description", "fontFamily"].forEach((id) => {
    $(id).value = state[id];
  });
  syncColorUi();
  syncAllRangeUi();
  $("logoInput").value = "";
  $("backgroundInput").value = "";
  renderThemeChoices([]);
  renderSvg();
}

function bindEvents() {
  setupRangeControls();

  ["mainTitle", "subTitle", "description"].forEach((id) => {
    $(id).addEventListener("input", (event) => {
      state[id] = event.target.value;
      renderSvg();
    });
  });

  ["accentColor", "textColor"].forEach((id) => {
    $(id).addEventListener("input", (event) => {
      state[id] = event.target.value;
      renderSvg();
    });
  });

  $("fontFamily").addEventListener("change", (event) => {
    state.fontFamily = event.target.value;
    renderSvg();
  });

  $("logoInput").addEventListener("change", (event) => readFileAsDataUrl(event.target.files[0], (url) => {
    state.logo = url;
    renderSvg();
  }));

  $("backgroundInput").addEventListener("change", (event) => readFileAsDataUrl(event.target.files[0], (url) => {
    state.background = url;
    extractThemeColors(url);
    renderSvg();
  }));

  $("fontInput").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const name = `CustomFont${Date.now()}`;
    readFileAsDataUrl(file, (url) => {
      const style = document.createElement("style");
      style.textContent = `@font-face{font-family:'${name}';src:url('${url}');font-display:swap;}`;
      document.head.appendChild(style);
      state.customFontName = name;
      renderSvg();
    });
  });

  $("clearBackground").addEventListener("click", () => {
    state.background = "";
    state.themes = [];
    $("backgroundInput").value = "";
    renderThemeChoices([]);
    renderSvg();
  });

  $("resetAdjustments").addEventListener("click", resetAdjustments);
  $("downloadPng").addEventListener("click", downloadPng);
  $("downloadSvg").addEventListener("click", () => {
    const blob = new Blob([serializeSvg()], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(blob);
    download(`liquid-glass-achievement-${state.width}x${state.height}.svg`, svgUrl);
    setTimeout(() => URL.revokeObjectURL(svgUrl), 1000);
  });
  $("resetDemo").addEventListener("click", resetDemo);
}

bindEvents();
renderThemeChoices();
renderSvg();
