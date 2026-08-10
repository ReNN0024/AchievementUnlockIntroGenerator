const svg = document.getElementById("achievementSvg");
const stage = document.getElementById("previewStage");
const dpiInfo = document.getElementById("dpiInfo");

const $ = (id) => document.getElementById(id);

const state = {
  logo: "",
  background: "",
  customFontName: "",
  layout: "wide",
  width: 1800,
  height: 900,
  preset: "verdant",
  mainTitle: "人类的护道者",
  subTitle: "恭喜获得新成就！",
  description: "世界需要人类，而人类需要护道者。上传你的 Logo，生成一张带有游戏成就感的介绍卡片。",
  footerText: "UNLOCKED · DESIGN READY · 300DPI",
  bgColor: "#1b260f",
  accentColor: "#b5d65a",
  borderColor: "#e9efd2",
  textColor: "#f6f7ed",
  panelOpacity: 72,
  ornamentLevel: 0,
  backgroundOpacity: 34,
  logoScale: 100,
  fontFamily: "system",
  zoom: 72
};

const presets = {
  verdant: {
    name: "暗绿成就",
    bgColor: "#1b260f",
    accentColor: "#b5d65a",
    borderColor: "#e9efd2",
    textColor: "#f6f7ed",
    panelOpacity: 72,
    ornamentLevel: 0,
    backgroundOpacity: 34
  },
  gold: {
    name: "鎏金典藏",
    bgColor: "#efe6d4",
    accentColor: "#c9932d",
    borderColor: "#f7d580",
    textColor: "#5b4936",
    panelOpacity: 82,
    ornamentLevel: 0,
    backgroundOpacity: 34
  },
  neon: {
    name: "霓虹赛博",
    bgColor: "#141327",
    accentColor: "#ff4fd8",
    borderColor: "#7af7ff",
    textColor: "#f9fbff",
    panelOpacity: 66,
    ornamentLevel: 0,
    backgroundOpacity: 34
  },
  parchment: {
    name: "羊皮幻想",
    bgColor: "#f1eadc",
    accentColor: "#9f7047",
    borderColor: "#d9b985",
    textColor: "#654d37",
    panelOpacity: 76,
    ornamentLevel: 0,
    backgroundOpacity: 34
  }
};

const layouts = {
  wide: { width: 1800, height: 900, label: "横版 6×3 inch / 1800×900px" },
  square: { width: 1200, height: 1200, label: "方图 4×4 inch / 1200×1200px" },
  poster: { width: 1200, height: 1800, label: "竖版 4×6 inch / 1200×1800px" }
};

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const value = parseInt(clean.length === 3 ? clean.split("").map((x) => x + x).join("") : clean, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

function wrapText(text, maxChars, maxLines) {
  const chars = Array.from(text || "");
  const lines = [];
  let line = "";
  for (const ch of chars) {
    if (ch === "\n") {
      lines.push(line);
      line = "";
    } else if (line.length >= maxChars && /[，。！？、,.!?\s]/.test(ch)) {
      lines.push(line + ch);
      line = "";
    } else if (line.length >= maxChars) {
      lines.push(line);
      line = ch;
    } else {
      line += ch;
    }
    if (lines.length >= maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

function buildDefaultLogo() {
  const bg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${state.accentColor}"/><stop offset="1" stop-color="${state.borderColor}"/></linearGradient>
      </defs>
      <rect width="420" height="420" fill="${state.bgColor}"/>
      <path d="M40 40h340v340H40z" fill="none" stroke="${state.borderColor}" stroke-width="14"/>
      <path d="M82 82h256v256H82z" fill="none" stroke="${state.accentColor}" stroke-width="6" opacity=".75"/>
      <circle cx="210" cy="150" r="55" fill="none" stroke="url(#g)" stroke-width="10"/>
      <path d="M140 300l70-175 70 175-70-48z" fill="url(#g)" opacity=".88"/>
      <path d="M120 210h180M105 250h210" stroke="${state.borderColor}" stroke-width="5" opacity=".55"/>
    </svg>
  `);
  return `data:image/svg+xml;charset=utf-8,${bg}`;
}

function styleBlock() {
  const panel = rgba(state.bgColor, state.panelOpacity / 100);
  const accentSoft = rgba(state.accentColor, 0.22);
  const borderSoft = rgba(state.borderColor, 0.45);
  return `
    <style>
      .font-main { font-family: ${fontStack()}; }
      .title { font-weight: 900; letter-spacing: .02em; }
      .subtitle { font-weight: 850; letter-spacing: .08em; }
      .desc { font-weight: 650; line-height: 1.5; }
      .tiny { font-weight: 800; letter-spacing: .16em; }
      .panelFill { fill: ${panel}; }
      .accentFill { fill: ${state.accentColor}; }
      .accentStroke { stroke: ${state.accentColor}; }
      .borderStroke { stroke: ${state.borderColor}; }
      .textFill { fill: ${state.textColor}; }
      .mutedFill { fill: ${rgba(state.textColor, 0.72)}; }
      .glow { filter: drop-shadow(0 0 16px ${accentSoft}); }
      .line { stroke: ${borderSoft}; }
    </style>
  `;
}

function buildDefs() {
  const bgImage = state.background ? `<image href="${state.background}" x="0" y="0" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" opacity="${state.backgroundOpacity / 100}"/>` : "";
  const ornament = state.ornamentLevel > 0 ? `<rect width="100%" height="100%" fill="url(#ornamentPattern)" opacity="0.92"/>` : "";
  return `
    <defs>
      <linearGradient id="panelGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${state.bgColor}" stop-opacity="${state.panelOpacity / 100}"/>
        <stop offset=".5" stop-color="${state.bgColor}" stop-opacity="${Math.max(0.38, state.panelOpacity / 130)}"/>
        <stop offset="1" stop-color="${state.bgColor}" stop-opacity="${Math.max(0.18, state.panelOpacity / 230)}"/>
      </linearGradient>
      <radialGradient id="spot" cx="22%" cy="45%" r="70%">
        <stop offset="0" stop-color="${state.accentColor}" stop-opacity="0.28"/>
        <stop offset="1" stop-color="${state.bgColor}" stop-opacity="0"/>
      </radialGradient>
      <pattern id="ornamentPattern" width="360" height="360" patternUnits="userSpaceOnUse">
        <path d="M40 290 C120 160 190 170 260 40 M92 306 C124 244 174 226 238 222 M246 62 C296 100 314 150 308 220" fill="none" stroke="${state.accentColor}" stroke-width="12" opacity="${state.ornamentLevel / 190}" stroke-linecap="round"/>
        <circle cx="298" cy="238" r="32" fill="none" stroke="${state.borderColor}" stroke-width="10" opacity="${state.ornamentLevel / 220}"/>
      </pattern>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="22" stdDeviation="22" flood-color="#000000" flood-opacity="0.28"/>
      </filter>
      <clipPath id="logoClip"><rect id="logoClipRect" rx="0"/></clipPath>
    </defs>
    <rect width="100%" height="100%" fill="${state.bgColor}"/>
    ${bgImage}
    <rect width="100%" height="100%" fill="url(#spot)"/>
    ${ornament}
  `;
}

function renderWide() {
  const w = state.width;
  const h = state.height;
  const pad = Math.round(w * 0.055);
  const logoFrame = Math.round(h * 0.5);
  const logoImage = Math.round(logoFrame * state.logoScale / 100);
  const x = pad;
  const y = Math.round((h - logoFrame) / 2);
  const imageX = x + Math.round((logoFrame - logoImage) / 2);
  const imageY = y + Math.round((logoFrame - logoImage) / 2);
  const contentX = x + logoFrame + Math.round(w * 0.065);
  const contentW = w - contentX - pad;
  const descLines = wrapText(state.description, 26, 4);
  const panelH = Math.round(h * 0.62);
  const panelY = Math.round((h - panelH) / 2);
  const logoSrc = state.logo || buildDefaultLogo();
  const footer = state.footerText.trim();

  return `
    <rect x="${pad * 0.45}" y="${panelY}" width="${w - pad * 0.9}" height="${panelH}" rx="20" fill="url(#panelGrad)" filter="url(#softShadow)"/>
    <path d="M${pad * 0.45} ${panelY + panelH} H${w - pad * 0.45}" stroke="#000" stroke-opacity="0.14" stroke-width="2"/>
    <g class="glow">
      <rect x="${x - 18}" y="${y - 18}" width="${logoFrame + 36}" height="${logoFrame + 36}" fill="none" class="borderStroke" stroke-width="8"/>
      <rect x="${x}" y="${y}" width="${logoFrame}" height="${logoFrame}" fill="${rgba(state.bgColor, 0.35)}" class="borderStroke" stroke-width="4"/>
      <image href="${logoSrc}" x="${imageX}" y="${imageY}" width="${logoImage}" height="${logoImage}" preserveAspectRatio="xMidYMid meet"/>
      <path d="M${x-18} ${y+42} V${y-18} H${x+42} M${x+logoFrame-42} ${y-18} H${x+logoFrame+18} V${y+42} M${x+logoFrame+18} ${y+logoFrame-42} V${y+logoFrame+18} H${x+logoFrame-42} M${x+42} ${y+logoFrame+18} H${x-18} V${y+logoFrame-42}" fill="none" class="accentStroke" stroke-width="7"/>
    </g>
    <g class="font-main textFill">
      <text x="${contentX}" y="${panelY + 98}" class="subtitle" font-size="38">${escapeXml(state.subTitle)}</text>
      <text x="${contentX}" y="${panelY + 220}" class="title" font-size="70">${escapeXml(state.mainTitle)}</text>
      <line x1="${contentX}" y1="${panelY + 278}" x2="${contentX + contentW}" y2="${panelY + 278}" class="line" stroke-width="3"/>
      <text x="${contentX}" y="${panelY + 362}" class="desc mutedFill" font-size="42">
        ${descLines.map((line, i) => `<tspan x="${contentX}" dy="${i === 0 ? 0 : 62}">${escapeXml(line)}</tspan>`).join("")}
      </text>
      ${footer ? `<text x="${contentX}" y="${panelY + panelH - 58}" class="tiny accentFill" font-size="24">${escapeXml(footer)}</text>` : ""}
    </g>
  `;
}

function renderSquareOrPoster() {
  const w = state.width;
  const h = state.height;
  const pad = Math.round(w * 0.075);
  const logoFrame = state.layout === "square" ? 430 : 420;
  const logoImage = Math.round(logoFrame * state.logoScale / 100);
  const logoX = Math.round((w - logoFrame) / 2);
  const imageX = Math.round((w - logoImage) / 2);
  const top = pad + 80;
  const imageY = top + Math.round((logoFrame - logoImage) / 2);
  const titleY = top + logoFrame + 140;
  const descY = titleY + 190;
  const descLines = wrapText(state.description, state.layout === "square" ? 20 : 18, state.layout === "square" ? 5 : 7);
  const logoSrc = state.logo || buildDefaultLogo();
  const footer = state.footerText.trim();

  return `
    <rect x="${pad}" y="${pad}" width="${w - pad * 2}" height="${h - pad * 2}" rx="36" fill="${rgba(state.bgColor, state.panelOpacity / 100)}" class="borderStroke" stroke-width="8" filter="url(#softShadow)"/>
    <path d="M${pad + 42} ${pad} H${w - pad - 42} M${pad + 42} ${h-pad} H${w-pad-42} M${pad} ${pad+42} V${h-pad-42} M${w-pad} ${pad+42} V${h-pad-42}" class="accentStroke" stroke-width="6" opacity=".82"/>
    <g class="glow">
      <rect x="${logoX - 22}" y="${top - 22}" width="${logoFrame + 44}" height="${logoFrame + 44}" fill="none" class="borderStroke" stroke-width="7"/>
      <image href="${logoSrc}" x="${imageX}" y="${imageY}" width="${logoImage}" height="${logoImage}" preserveAspectRatio="xMidYMid meet"/>
    </g>
    <g class="font-main textFill" text-anchor="middle">
      <text x="${w/2}" y="${titleY}" class="subtitle" font-size="40">${escapeXml(state.subTitle)}</text>
      <text x="${w/2}" y="${titleY + 100}" class="title" font-size="76">${escapeXml(state.mainTitle)}</text>
      <line x1="${pad + 90}" y1="${titleY + 155}" x2="${w - pad - 90}" y2="${titleY + 155}" class="line" stroke-width="3"/>
      <text x="${w/2}" y="${descY}" class="desc mutedFill" font-size="42">
        ${descLines.map((line, i) => `<tspan x="${w/2}" dy="${i === 0 ? 0 : 64}">${escapeXml(line)}</tspan>`).join("")}
      </text>
      ${footer ? `<text x="${w/2}" y="${h - pad - 78}" class="tiny accentFill" font-size="24">${escapeXml(footer)}</text>` : ""}
    </g>
  `;
}

function renderSvg() {
  svg.setAttribute("viewBox", `0 0 ${state.width} ${state.height}`);
  svg.setAttribute("width", state.width);
  svg.setAttribute("height", state.height);
  const content = state.layout === "wide" ? renderWide() : renderSquareOrPoster();
  svg.innerHTML = `${styleBlock()}${buildDefs()}${content}`;
  svg.style.width = `${state.zoom}%`;
  dpiInfo.textContent = `300dpi · ${state.width}×${state.height}px`;
}

function applyPreset(key) {
  const preset = presets[key];
  state.preset = key;
  Object.assign(state, preset);
  $("bgColor").value = state.bgColor;
  $("accentColor").value = state.accentColor;
  $("borderColor").value = state.borderColor;
  $("textColor").value = state.textColor;
  $("panelOpacity").value = state.panelOpacity;
  $("ornamentLevel").value = state.ornamentLevel;
  $("backgroundOpacity").value = state.backgroundOpacity;
  document.querySelectorAll(".preset-card").forEach((card) => card.classList.toggle("active", card.dataset.preset === key));
  renderSvg();
}

function setLayout(layout) {
  Object.assign(state, { layout }, layouts[layout]);
  $("sizePreset").value = layout;
  document.querySelectorAll("#layoutGroup button").forEach((button) => button.classList.toggle("active", button.dataset.layout === layout));
  renderSvg();
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
    ctx.fillStyle = state.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    canvas.toBlob((pngBlob) => {
      if (!pngBlob) return;
      download(`achievement-unlock-${state.width}x${state.height}-300dpi.png`, URL.createObjectURL(pngBlob));
    }, "image/png", 1);
  };
  img.src = url;
}

function buildPresetGrid() {
  const grid = $("presetGrid");
  grid.innerHTML = Object.entries(presets).map(([key, preset]) => `
    <button class="preset-card ${key === state.preset ? "active" : ""}" data-preset="${key}">
      <span class="preset-swatch"><i style="background:${preset.bgColor}"></i><i style="background:${preset.accentColor}"></i><i style="background:${preset.borderColor}"></i></span>
      ${preset.name}
    </button>
  `).join("");
  grid.addEventListener("click", (event) => {
    const card = event.target.closest(".preset-card");
    if (card) applyPreset(card.dataset.preset);
  });
}

function bindEvents() {
  ["mainTitle", "subTitle", "description", "footerText"].forEach((id) => {
    $(id).addEventListener("input", (event) => {
      state[id] = event.target.value;
      renderSvg();
    });
  });
  ["bgColor", "accentColor", "borderColor", "textColor"].forEach((id) => {
    $(id).addEventListener("input", (event) => {
      state[id] = event.target.value;
      renderSvg();
    });
  });
  ["panelOpacity", "ornamentLevel", "backgroundOpacity", "logoScale", "previewZoom"].forEach((id) => {
    $(id).addEventListener("input", (event) => {
      const key = id === "previewZoom" ? "zoom" : id;
      state[key] = Number(event.target.value);
      renderSvg();
    });
  });
  $("fontFamily").addEventListener("change", (event) => {
    state.fontFamily = event.target.value;
    renderSvg();
  });
  $("logoInput").addEventListener("change", (event) => readFileAsDataUrl(event.target.files[0], (url) => { state.logo = url; renderSvg(); }));
  $("backgroundInput").addEventListener("change", (event) => readFileAsDataUrl(event.target.files[0], (url) => { state.background = url; renderSvg(); }));
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
  $("clearBackground").addEventListener("click", () => { state.background = ""; $("backgroundInput").value = ""; renderSvg(); });
  $("layoutGroup").addEventListener("click", (event) => {
    if (event.target.dataset.layout) setLayout(event.target.dataset.layout);
  });
  $("sizePreset").addEventListener("change", (event) => setLayout(event.target.value));
  $("downloadPng").addEventListener("click", downloadPng);
  $("downloadSvg").addEventListener("click", () => {
    const blob = new Blob([serializeSvg()], { type: "image/svg+xml;charset=utf-8" });
    download(`achievement-unlock-${state.width}x${state.height}.svg`, URL.createObjectURL(blob));
  });
  $("resetDemo").addEventListener("click", () => {
    Object.assign(state, {
      logo: "",
      background: "",
      customFontName: "",
      mainTitle: "人类的护道者",
      subTitle: "恭喜获得新成就！",
      description: "世界需要人类，而人类需要护道者。上传你的 Logo，生成一张带有游戏成就感的介绍卡片。",
      footerText: "UNLOCKED · DESIGN READY · 300DPI",
      ornamentLevel: 0,
      backgroundOpacity: 34,
      logoScale: 100,
      fontFamily: "system",
      zoom: 72
    });
    $("mainTitle").value = state.mainTitle;
    $("subTitle").value = state.subTitle;
    $("description").value = state.description;
    $("footerText").value = state.footerText;
    $("ornamentLevel").value = state.ornamentLevel;
    $("backgroundOpacity").value = state.backgroundOpacity;
    $("logoScale").value = state.logoScale;
    $("fontFamily").value = state.fontFamily;
    $("previewZoom").value = state.zoom;
    applyPreset("verdant");
  });
}

buildPresetGrid();
bindEvents();
renderSvg();
