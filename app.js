const svg = document.getElementById("achievementSvg");
const dpiInfo = document.getElementById("dpiInfo");

const $ = (id) => document.getElementById(id);

const CANVAS = { width: 1932, height: 1360 };

const state = {
  logo: "",
  background: "",
  customFontName: "",
  width: CANVAS.width,
  height: CANVAS.height,
  mainTitle: "人类的护道者",
  subTitle: "成就解锁",
  description: "世界需要人类，而人类需要护道者。上传你的 Logo 与底图，生成一张具有高级玻璃质感的游戏成就介绍卡片。",
  accentColor: "#f5f7ff",
  textColor: "#ffffff",
  cardOpacity: 38,
  glassDepth: 66,
  glassDispersion: 30,
  backgroundScale: 100,
  backgroundX: 0,
  backgroundY: 0,
  logoScale: 120,
  logoX: 0,
  logoY: 0,
  fontFamily: "system",
  zoom: 72
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

function imageLayer(src, clipId, area, scale, offsetX, offsetY, preserve = "xMidYMid slice") {
  const width = area.width * (scale / 100);
  const height = area.height * (scale / 100);
  const maxPanX = Math.max(0, (width - area.width) / 2);
  const maxPanY = Math.max(0, (height - area.height) / 2);
  const x = area.x + (area.width - width) / 2 + (offsetX / 100) * maxPanX;
  const y = area.y + (area.height - height) / 2 + (offsetY / 100) * maxPanY;
  return `<image href="${src}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="${preserve}" clip-path="url(#${clipId})"/>`;
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
  const edgeOpacity = 0.18 + dispersion * 0.44;
  const cardOpacity = state.cardOpacity / 100;
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
        <stop offset="0" stop-color="#ffffff" stop-opacity="${0.78 + depth * 0.18}"/>
        <stop offset="0.28" stop-color="#ffffff" stop-opacity="${0.28 + depth * 0.16}"/>
        <stop offset="0.62" stop-color="#9db4ff" stop-opacity="${0.18 + dispersion * 0.26}"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="${0.36 + depth * 0.18}"/>
      </linearGradient>
      <radialGradient id="glassGlowA" cx="10%" cy="8%" r="60%">
        <stop stop-color="#ffffff" stop-opacity="${0.28 + depth * 0.22}"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glassGlowB" cx="82%" cy="86%" r="58%">
        <stop stop-color="#7d63ff" stop-opacity="${0.18 + dispersion * 0.18}"/>
        <stop offset="1" stop-color="#7d63ff" stop-opacity="0"/>
      </radialGradient>
      <filter id="liquidShadow" x="-20%" y="-30%" width="140%" height="170%">
        <feDropShadow dx="0" dy="${22 + depth * 18}" stdDeviation="${blur}" flood-color="#000000" flood-opacity="${shadowOpacity}"/>
      </filter>
      <filter id="softLogoShadow" x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000000" flood-opacity=".32"/>
      </filter>
      <filter id="cardBlur" x="-4%" y="-8%" width="108%" height="116%">
        <feGaussianBlur stdDeviation="${0.6 + depth * 1.2}"/>
      </filter>
      <filter id="bgVignette" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="0"/>
      </filter>
      <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#000" stop-opacity=".18"/>
        <stop offset=".5" stop-color="#000" stop-opacity=".04"/>
        <stop offset="1" stop-color="#000" stop-opacity=".28"/>
      </linearGradient>
      <g id="appleSmoothCard">
        <rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" ry="${card.radius}"/>
      </g>
    </defs>
    <clipPath id="cardClip"><rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" ry="${card.radius}"/></clipPath>
    <clipPath id="innerCardClip"><rect x="${card.x + 8}" y="${card.y + 8}" width="${card.width - 16}" height="${card.height - 16}" rx="${card.radius - 8}" ry="${card.radius - 8}"/></clipPath>
    <g id="dispersionSettings" data-edge-opacity="${edgeOpacity}"></g>`;
}

function renderCard(card, logoBox) {
  const depth = state.glassDepth / 100;
  const dispersion = state.glassDispersion / 100;
  const edgeOpacity = 0.18 + dispersion * 0.44;
  const redOffset = 2 + dispersion * 9;
  const blueOffset = 1.5 + dispersion * 8;
  const logoSrc = state.logo || buildDefaultLogo();
  const descLines = wrapText(state.description, 24, 3);
  const contentX = logoBox.x + logoBox.width + 78;
  const titleY = card.y + 210;
  const lineY = card.y + 326;
  const logoImage = imageLayer(logoSrc, "logoClip", logoBox, state.logoScale, state.logoX, state.logoY, "xMidYMid slice");

  return `
    <g filter="url(#liquidShadow)">
      <rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="rgba(255,255,255,${0.04 + depth * 0.04})"/>
      <rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="url(#glassFill)"/>
      <rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="url(#glassGlowA)"/>
      <rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="url(#glassGlowB)"/>
      <rect x="${card.x + redOffset}" y="${card.y + redOffset * 0.32}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="none" stroke="#ff7adf" stroke-opacity="${edgeOpacity}" stroke-width="${3 + dispersion * 4}"/>
      <rect x="${card.x - blueOffset}" y="${card.y - blueOffset * 0.22}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="none" stroke="#83e9ff" stroke-opacity="${edgeOpacity * 0.82}" stroke-width="${2 + dispersion * 3}"/>
      <rect x="${card.x + 2}" y="${card.y + 2}" width="${card.width - 4}" height="${card.height - 4}" rx="${card.radius - 2}" fill="none" stroke="url(#glassBorder)" stroke-width="5"/>
      <rect x="${card.x + 18}" y="${card.y + 18}" width="${card.width - 36}" height="${card.height - 36}" rx="${card.radius - 18}" fill="none" stroke="#ffffff" stroke-opacity="${0.18 + depth * 0.18}" stroke-width="1.8"/>
      <path d="M${card.x + 90} ${card.y + 76} C${card.x + 360} ${card.y + 10}, ${card.x + 700} ${card.y + 20}, ${card.x + 1020} ${card.y + 82}" fill="none" stroke="#fff" stroke-opacity="${0.22 + depth * 0.24}" stroke-width="7" stroke-linecap="round"/>
      <path d="M${card.x + 60} ${card.y + card.height - 88} C${card.x + 380} ${card.y + card.height - 22}, ${card.x + card.width - 360} ${card.y + card.height - 12}, ${card.x + card.width - 88} ${card.y + card.height - 86}" fill="none" stroke="#ffffff" stroke-opacity="${0.11 + depth * 0.15}" stroke-width="3" stroke-linecap="round"/>
    </g>
    <g filter="url(#softLogoShadow)">
      <rect x="${logoBox.x}" y="${logoBox.y}" width="${logoBox.width}" height="${logoBox.height}" rx="44" fill="rgba(255,255,255,.16)" stroke="#ffffff" stroke-opacity=".5" stroke-width="2.4"/>
      ${logoImage}
      <rect x="${logoBox.x + 8}" y="${logoBox.y + 8}" width="${logoBox.width - 16}" height="${logoBox.height - 16}" rx="36" fill="none" stroke="#ffffff" stroke-opacity=".28" stroke-width="1.4"/>
    </g>
    <g class="font-main textFill">
      <text x="${contentX}" y="${card.y + 134}" class="subtitle" font-size="42" opacity=".88">${escapeXml(state.subTitle)}</text>
      <text x="${contentX}" y="${titleY}" class="title" font-size="84">${escapeXml(state.mainTitle)}</text>
      <line x1="${contentX}" y1="${lineY}" x2="${card.x + card.width - 126}" y2="${lineY}" stroke="#ffffff" stroke-opacity="${0.25 + depth * 0.18}" stroke-width="2"/>
      <text x="${contentX}" y="${lineY + 82}" class="desc mutedFill" font-size="44">
        ${descLines.map((line, i) => `<tspan x="${contentX}" dy="${i === 0 ? 0 : 64}">${escapeXml(line)}</tspan>`).join("")}
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
    ${imageLayer(bgSrc, "canvasClip", bgArea, state.backgroundScale, state.backgroundX, state.backgroundY, "xMidYMid slice")}
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

function bindEvents() {
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

  [
    "backgroundScale", "backgroundX", "backgroundY",
    "logoScale", "logoX", "logoY",
    "glassDepth", "glassDispersion", "cardOpacity", "previewZoom"
  ].forEach((id) => {
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

  $("logoInput").addEventListener("change", (event) => readFileAsDataUrl(event.target.files[0], (url) => {
    state.logo = url;
    renderSvg();
  }));

  $("backgroundInput").addEventListener("change", (event) => readFileAsDataUrl(event.target.files[0], (url) => {
    state.background = url;
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
    $("backgroundInput").value = "";
    renderSvg();
  });

  $("downloadPng").addEventListener("click", downloadPng);
  $("downloadSvg").addEventListener("click", () => {
    const blob = new Blob([serializeSvg()], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(blob);
    download(`liquid-glass-achievement-${state.width}x${state.height}.svg`, svgUrl);
    setTimeout(() => URL.revokeObjectURL(svgUrl), 1000);
  });

  $("resetDemo").addEventListener("click", () => {
    Object.assign(state, {
      logo: "",
      background: "",
      customFontName: "",
      mainTitle: "人类的护道者",
      subTitle: "成就解锁",
      description: "世界需要人类，而人类需要护道者。上传你的 Logo 与底图，生成一张具有高级玻璃质感的游戏成就介绍卡片。",
      accentColor: "#f5f7ff",
      textColor: "#ffffff",
      cardOpacity: 38,
      glassDepth: 66,
      glassDispersion: 30,
      backgroundScale: 100,
      backgroundX: 0,
      backgroundY: 0,
      logoScale: 120,
      logoX: 0,
      logoY: 0,
      fontFamily: "system",
      zoom: 72
    });
    ["mainTitle", "subTitle", "description", "accentColor", "textColor", "cardOpacity", "glassDepth", "glassDispersion", "backgroundScale", "backgroundX", "backgroundY", "logoScale", "logoX", "logoY", "fontFamily", "previewZoom"].forEach((id) => {
      const key = id === "previewZoom" ? "zoom" : id;
      $(id).value = state[key];
    });
    $("logoInput").value = "";
    $("backgroundInput").value = "";
    renderSvg();
  });
}

bindEvents();
renderSvg();
