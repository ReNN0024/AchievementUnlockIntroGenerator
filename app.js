const svg = document.getElementById("achievementSvg");
const $ = (id) => document.getElementById(id);
const CANVAS = { width: 1932, height: 1360 };
const STORAGE_KEY = "achievement-unlock-editor-v3";
const DB_NAME = "achievement-unlock-assets";
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const DEFAULTS = {
  width: CANVAS.width, height: CANVAS.height,
  mainTitle: "人类的护道者", subTitle: "成就解锁",
  description: "世界需要人类，而人类需要护道者。\n上传你的 Logo 与底图，生成一张具有高级玻璃质感的游戏成就介绍卡片。",
  accentColor: "#F5F7FF", textColor: "#FFFFFF", fontFamily: "system",
  backgroundScale: 100, backgroundX: 0, backgroundY: 0, backgroundOpacity: 100,
  logoScale: 120, logoX: 0, logoY: 0, logoStyle: "floating",
  glassPreset: "standard", glassDepth: 58, cardOpacity: 22, glassDispersion: 0,
  subtitleTitleGap: 126, titleRuleGap: 156, ruleDescGap: 106, descLineGap: 76,
  subtitleLetterSpacing: 6, titleLetterSpacing: 1.5, descLetterSpacing: .5,
  descriptionBoxWidth: 930, descriptionBoxHeight: 210, zoom: 72
};
const GLASS_PRESETS = {
  clear: { label: "清透", glassDepth: 32, cardOpacity: 12, glassDispersion: 0 },
  standard: { label: "标准", glassDepth: 58, cardOpacity: 22, glassDispersion: 0 },
  dark: { label: "深色", glassDepth: 76, cardOpacity: 42, glassDispersion: 0 }
};
const RANGE_GROUPS = {
  background: ["backgroundScale", "backgroundX", "backgroundY", "backgroundOpacity"],
  logo: ["logoScale", "logoX", "logoY"],
  glass: ["glassDepth", "cardOpacity", "glassDispersion"],
  type: ["subtitleTitleGap", "titleRuleGap", "ruleDescGap", "descLineGap", "subtitleLetterSpacing", "titleLetterSpacing", "descLetterSpacing", "descriptionBoxWidth", "descriptionBoxHeight", "previewZoom"]
};
const RANGE_LABELS = {
  backgroundScale: "底图缩放", backgroundX: "水平位置", backgroundY: "垂直位置", backgroundOpacity: "底图不透明度",
  logoScale: "Logo 缩放", logoX: "水平位置", logoY: "垂直位置",
  glassDepth: "玻璃深度", cardOpacity: "卡片透明度", glassDispersion: "边缘色散",
  subtitleTitleGap: "副标题到主标题间距", titleRuleGap: "主标题到分隔线间距", ruleDescGap: "分隔线到正文间距", descLineGap: "正文行距",
  subtitleLetterSpacing: "副标题字距", titleLetterSpacing: "主标题字距", descLetterSpacing: "正文字距",
  descriptionBoxWidth: "文案框宽度", descriptionBoxHeight: "文案框高度", previewZoom: "预览缩放"
};
const RANGE_CONFIG = {
  backgroundScale: [100, 240, 1], backgroundX: [-100, 100, 1], backgroundY: [-100, 100, 1], backgroundOpacity: [0, 100, 1],
  logoScale: [70, 260, 1], logoX: [-100, 100, 1], logoY: [-100, 100, 1],
  glassDepth: [0, 100, 1], cardOpacity: [0, 60, 1], glassDispersion: [0, 20, 1],
  subtitleTitleGap: [72, 230, 1], titleRuleGap: [96, 260, 1], ruleDescGap: [62, 180, 1], descLineGap: [54, 112, 1],
  subtitleLetterSpacing: [0, 18, .5], titleLetterSpacing: [0, 14, .5], descLetterSpacing: [0, 10, .5],
  descriptionBoxWidth: [520, 1060, 1], descriptionBoxHeight: [90, 300, 1], previewZoom: [42, 100, 1]
};
const state = { ...DEFAULTS, background: "", logo: "", customFontName: "", customFontData: "", customFontFormat: "", customFontFileName: "", themes: [], selectedTheme: -1, editorTarget: "background" };
let history = [], future = [], renderQueued = false, interactionStart = null, pointerState = null, exportBusy = false;

function escapeXml(value = "") { return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;"); }
function hexToRgb(hex) { const value = parseInt(hex.replace("#", ""), 16); return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 }; }
function rgba(hex, alpha) { const { r, g, b } = hexToRgb(hex); return `rgba(${r},${g},${b},${alpha})`; }
function luminance({ r, g, b }) { const v = [r,g,b].map(x => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }); return .2126*v[0] + .7152*v[1] + .0722*v[2]; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value))); }
function fontStack() { if (state.customFontName) return `'${state.customFontName}', 'PingFang SC', sans-serif`; return { system: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif", song: "'Songti SC', SimSun, STSong, serif", kai: "'Kaiti SC', KaiTi, STKaiti, serif", hei: "'Source Han Sans SC', 'Noto Sans CJK SC', 'PingFang SC', 'Microsoft YaHei', sans-serif" }[state.fontFamily] || "sans-serif"; }
function safeFilename(value) { return String(value || "achievement").replace(/[\\/:*?\"<>|\n\r]+/g, "-").trim().replace(/\s+/g, "-").slice(0, 60) || "achievement"; }
function timestamp() { const d = new Date(); const p = n => String(n).padStart(2,"0"); return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`; }
function showToast(message, type = "success", persistent = false) { const toast = document.createElement("div"); toast.className = `toast ${type}`; toast.textContent = message; $("toastRegion").append(toast); if (!persistent) setTimeout(() => toast.remove(), 3400); return toast; }

function snapshot() { const copy = {}; Object.keys(DEFAULTS).forEach(k => copy[k] = state[k]); ["background", "logo", "customFontName", "customFontData", "customFontFormat", "customFontFileName", "selectedTheme"].forEach(k => copy[k] = state[k]); return copy; }
function restoreSnapshot(data) { Object.assign(state, data); state.themes = state.background ? state.themes : []; syncUi(); scheduleRender(); }
function recordHistory() { const value = JSON.stringify(snapshot()); if (history.at(-1) === value) return; history.push(value); if (history.length > 30) history.shift(); future = []; updateHistoryButtons(); }
function beginInteraction() { interactionStart = JSON.stringify(snapshot()); }
function endInteraction() { if (interactionStart && interactionStart !== JSON.stringify(snapshot())) recordHistory(); interactionStart = null; persist(); updateHistoryButtons(); }
function undo() { if (history.length < 2) return; future.push(history.pop()); restoreSnapshot(JSON.parse(history.at(-1))); persist(); updateHistoryButtons(); }
function redo() { const next = future.pop(); if (!next) return; history.push(next); restoreSnapshot(JSON.parse(next)); persist(); updateHistoryButtons(); }
function updateHistoryButtons() { $("undoButton").disabled = history.length < 2; $("redoButton").disabled = !future.length; }

function saveState() { const plain = snapshot(); plain.background = ""; plain.logo = ""; plain.customFontData = ""; localStorage.setItem(STORAGE_KEY, JSON.stringify(plain)); }
function openDb() { return new Promise((resolve, reject) => { const req = indexedDB.open(DB_NAME, 1); req.onupgradeneeded = () => req.result.createObjectStore("assets"); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); }); }
async function dbPut(key, value) { try { const db = await openDb(); await new Promise((resolve, reject) => { const tx = db.transaction("assets", "readwrite"); tx.objectStore("assets").put(value, key); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); }); db.close(); } catch (_) {} }
async function dbGet(key) { try { const db = await openDb(); const val = await new Promise((resolve, reject) => { const tx = db.transaction("assets", "readonly"); const req = tx.objectStore("assets").get(key); req.onsuccess = () => resolve(req.result || ""); req.onerror = () => reject(req.error); }); db.close(); return val; } catch (_) { return ""; } }
function persist() { saveState(); dbPut("background", state.background); dbPut("logo", state.logo); dbPut("font", state.customFontData); }
async function restorePersisted() { try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); if (!saved) return; Object.assign(state, saved); state.background = await dbGet("background"); state.logo = await dbGet("logo"); state.customFontData = await dbGet("font"); if (state.customFontData && state.customFontName) await registerCustomFont(false); if (state.background) extractThemeColors(state.background); showToast("已恢复上次编辑"); } catch (_) {} }

function buildDefaultBackground() {
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1932 1360"><defs><linearGradient id="base" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#070A12"/><stop offset="1" stop-color="#111827"/></linearGradient><radialGradient id="warm" cx="13%" cy="10%" r="62%"><stop stop-color="#f0c9be" stop-opacity=".30"/><stop offset="1" stop-color="#f0c9be" stop-opacity="0"/></radialGradient><radialGradient id="cool" cx="83%" cy="85%" r="68%"><stop stop-color="#6e83d3" stop-opacity=".36"/><stop offset="1" stop-color="#6e83d3" stop-opacity="0"/></radialGradient><radialGradient id="vignette" cx="50%" cy="48%" r="74%"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".15"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#base)"/><rect width="100%" height="100%" fill="url(#warm)"/><rect width="100%" height="100%" fill="url(#cool)"/><rect width="100%" height="100%" fill="url(#vignette)"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}
function buildDefaultLogo() { const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#dce6ff"/></linearGradient></defs><path d="M250 58 412 152v196L250 442 88 348V152Z" fill="rgba(255,255,255,.12)" stroke="url(#g)" stroke-width="18"/><path d="M156 250h188M250 156v188" stroke="url(#g)" stroke-width="30" stroke-linecap="round"/><circle cx="250" cy="250" r="78" fill="none" stroke="url(#g)" stroke-width="20"/></svg>`; return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`; }

function getImagePlacement(area, scale, offsetX, offsetY, expand = 1) {
  const baseWidth = area.width * (scale / 100), baseHeight = area.height * (scale / 100);
  const maxX = Math.max(0, (baseWidth - area.width) / 2), maxY = Math.max(0, (baseHeight - area.height) / 2);
  const width = baseWidth * expand, height = baseHeight * expand;
  return { x: area.x + (area.width - baseWidth) / 2 + offsetX / 100 * maxX - (width - baseWidth) / 2, y: area.y + (area.height - baseHeight) / 2 + offsetY / 100 * maxY - (height - baseHeight) / 2, width, height };
}
function imageLayer(src, clipId, area, scale, offsetX, offsetY, { opacity = 1, filter = "", expand = 1, preserve = "xMidYMid slice" } = {}) { const p = getImagePlacement(area, scale, offsetX, offsetY, expand); return `<image href="${src}" x="${p.x}" y="${p.y}" width="${p.width}" height="${p.height}" preserveAspectRatio="${preserve}" opacity="${opacity}" clip-path="url(#${clipId})"${filter ? ` filter="${filter}"` : ""}/>`; }
function svgFontFace() { return state.customFontData && state.customFontName ? `@font-face{font-family:'${state.customFontName}';src:url('${state.customFontData}') format('${state.customFontFormat || "truetype"}');font-display:block;}` : ""; }
function styleBlock() { return `<style>${svgFontFace()}.font-main{font-family:${fontStack()}}.subtitle{font-size:34px;font-weight:600;letter-spacing:${state.subtitleLetterSpacing}px;opacity:.78}.title{font-weight:700;letter-spacing:${state.titleLetterSpacing}px}.desc{font-size:36px;font-weight:500;letter-spacing:${state.descLetterSpacing}px;opacity:.74}.text-fill{fill:${state.textColor};filter:url(#textShadow)}</style>`; }

function buildDefs(card, logoBox) {
  const depth = state.glassDepth / 100;
  const blur = 12 + depth * 24;
  const tintAlpha = .06 + state.cardOpacity / 100 * .28;
  const ambientAlpha = .14 + depth * .12;
  const contactAlpha = .10 + depth * .06;
  const logoRadius = 60;
  return `<defs>
    <clipPath id="canvasClip"><rect width="${state.width}" height="${state.height}"/></clipPath>
    <clipPath id="cardClip"><rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}"/></clipPath>
    <clipPath id="logoClip"><rect x="${logoBox.x}" y="${logoBox.y}" width="${logoBox.width}" height="${logoBox.height}" rx="${logoRadius}"/></clipPath>
    <filter id="frostedBlur" x="-10%" y="-14%" width="120%" height="128%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${blur}" edgeMode="duplicate" result="blur"/><feColorMatrix in="blur" type="saturate" values="1.08" result="sat"/><feComponentTransfer in="sat"><feFuncR type="linear" slope="1.04" intercept="-.02"/><feFuncG type="linear" slope="1.04" intercept="-.02"/><feFuncB type="linear" slope="1.04" intercept="-.02"/></feComponentTransfer></filter>
    <filter id="contactShadow" x="-8%" y="-10%" width="116%" height="124%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity="${contactAlpha}"/></filter>
    <filter id="ambientShadow" x="-16%" y="-28%" width="132%" height="164%"><feDropShadow dx="0" dy="28" stdDeviation="35" flood-color="#000" flood-opacity="${ambientAlpha}"/></filter>
    <filter id="floatingLogoShadow" x="-26%" y="-30%" width="152%" height="160%"><feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#000" flood-opacity=".18"/></filter>
    <filter id="textShadow" x="-8%" y="-12%" width="116%" height="124%"><feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity=".18"/></filter>
    <linearGradient id="glassTint" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity="${tintAlpha}"/><stop offset=".45" stop-color="#fff" stop-opacity="${tintAlpha*.56}"/><stop offset="1" stop-color="#ebf0f8" stop-opacity="${tintAlpha*.42}"/></linearGradient>
    <linearGradient id="borderGradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".62"/><stop offset=".32" stop-color="#fff" stop-opacity=".40"/><stop offset=".66" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity=".24"/></linearGradient>
    <linearGradient id="topHighlight" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".28"/><stop offset=".50" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="bottomShade" x1="0" y1="0" x2="0" y2="1"><stop offset=".68" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
    <radialGradient id="surfaceHighlight" cx="10%" cy="8%" r="60%"><stop stop-color="#fff" stop-opacity=".14"/><stop offset=".58" stop-color="#fff" stop-opacity=".035"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <radialGradient id="coolReflection" cx="90%" cy="90%" r="52%"><stop stop-color="#dce7ff" stop-opacity=".055"/><stop offset="1" stop-color="#dce7ff" stop-opacity="0"/></radialGradient>
    <g id="cardShape"><rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}"/></g>
    <g id="logoShape"><rect x="${logoBox.x}" y="${logoBox.y}" width="${logoBox.width}" height="${logoBox.height}" rx="${logoRadius}"/></g>
  </defs>`;
}

function measureText(text, size, weight, spacing = 0) { const c = document.createElement("canvas"), ctx = c.getContext("2d"); ctx.font = `${weight} ${size}px ${fontStack()}`; return ctx.measureText(text).width + Math.max(0, Array.from(text).length - 1) * spacing; }
function fitTitle(text, maxWidth) { let size = 80; while (size > 56 && measureText(text, size, 700, state.titleLetterSpacing) > maxWidth) size -= 1; return { size, overflow: measureText(text, size, 700, state.titleLetterSpacing) > maxWidth }; }
function wrapMeasuredLine(line, maxWidth, size, weight, spacing) {
  const chars = Array.from(line); if (!chars.length) return [""]; const lines = []; let current = "";
  for (const char of chars) { const test = current + char; if (current && measureText(test, size, weight, spacing) > maxWidth) { const breakAt = Math.max(current.lastIndexOf(" "), current.lastIndexOf("，"), current.lastIndexOf("。"), current.lastIndexOf("、"), current.lastIndexOf(","), current.lastIndexOf(".")); if (breakAt > Math.floor(current.length * .45)) { lines.push(current.slice(0, breakAt + 1).trimEnd()); current = current.slice(breakAt + 1).trimStart() + char; } else { lines.push(current); current = char; } } else current = test; }
  lines.push(current); return lines;
}
function descriptionLines() {
  const maxLines = Math.max(1, Math.floor(state.descriptionBoxHeight / state.descLineGap)); const lines = [];
  for (const manual of String(state.description || "").split(/\r?\n/)) lines.push(...wrapMeasuredLine(manual, state.descriptionBoxWidth, 36, 500, state.descLetterSpacing));
  const overflow = lines.length > maxLines; const shown = lines.slice(0, maxLines); if (overflow && shown.length) { let last = shown.at(-1); while (last.length && measureText(`${last}…`, 36, 500, state.descLetterSpacing) > state.descriptionBoxWidth) last = last.slice(0, -1); shown[shown.length - 1] = `${last}…`; }
  return { lines: shown, overflow };
}
function renderCard(card, logoBox) {
  const bg = state.background || buildDefaultBackground(), logo = state.logo || buildDefaultLogo();
  const contentX = logoBox.x + logoBox.width + 78, subtitleY = card.y + 116, titleY = subtitleY + state.subtitleTitleGap, lineY = titleY + state.titleRuleGap, descY = lineY + state.ruleDescGap;
  const title = fitTitle(state.mainTitle, card.x + card.width - 118 - contentX); const desc = descriptionLines();
  $("titleWarning").textContent = title.overflow ? "标题过长，已缩小至最小字号；请缩短文字以避免导出溢出。" : "";
  $("descriptionWarning").textContent = desc.overflow ? "内容过长，导出时将以省略号显示最后一行。" : "";
  const dispersion = state.glassDispersion ? state.glassDispersion / 20 : 0;
  const glass = `<g aria-label="system frosted glass card"><use href="#cardShape" filter="url(#ambientShadow)"/><use href="#cardShape" filter="url(#contactShadow)"/>${imageLayer(bg,"cardClip",{x:0,y:0,width:state.width,height:state.height},state.backgroundScale,state.backgroundX,state.backgroundY,{filter:"url(#frostedBlur)",expand:1.04})}<rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="url(#glassTint)" clip-path="url(#cardClip)"/><rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="url(#surfaceHighlight)" clip-path="url(#cardClip)"/><rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="url(#coolReflection)" clip-path="url(#cardClip)"/>${dispersion ? `<use href="#cardShape" transform="translate(${-dispersion},0)" fill="none" stroke="#79b7ff" stroke-opacity=".055" stroke-width="1"/><use href="#cardShape" transform="translate(${dispersion},0)" fill="none" stroke="#ff8a9d" stroke-opacity=".045" stroke-width="1"/>` : ""}<use href="#cardShape" fill="none" stroke="url(#borderGradient)" stroke-width="2.5"/><use href="#cardShape" fill="none" stroke="url(#topHighlight)" stroke-width="1"/><use href="#cardShape" fill="none" stroke="url(#bottomShade)" stroke-width="1"/></g>`;
  const logoPlacement = imageLayer(logo, "logoClip", logoBox, state.logoScale, state.logoX, state.logoY, { preserve: "xMidYMid slice" });
  const logoLayer = state.logoStyle === "glass" ? `<g aria-label="logo glass container"><use href="#logoShape" filter="url(#floatingLogoShadow)"/>${imageLayer(bg,"logoClip",{x:0,y:0,width:state.width,height:state.height},state.backgroundScale,state.backgroundX,state.backgroundY,{filter:"url(#frostedBlur)",expand:1.04})}<use href="#logoShape" fill="url(#glassTint)"/><use href="#logoShape" fill="none" stroke="url(#borderGradient)" stroke-width="2"/><use href="#logoShape" fill="none" stroke="url(#topHighlight)" stroke-width="1"/>${logoPlacement}</g>` : `<g filter="url(#floatingLogoShadow)" aria-label="floating logo">${logoPlacement}</g>`;
  const lineEnd = Math.min(card.x + card.width - 118, contentX + state.descriptionBoxWidth);
  return `${glass}${logoLayer}<g class="font-main text-fill"><text x="${contentX}" y="${subtitleY}" class="subtitle">${escapeXml(state.subTitle)}</text><text x="${contentX}" y="${titleY}" class="title" font-size="${title.size}">${escapeXml(state.mainTitle)}</text><line x1="${contentX}" y1="${lineY}" x2="${lineEnd}" y2="${lineY}" stroke="#fff" stroke-opacity=".12" stroke-width="1.25"/><text x="${contentX}" y="${descY}" class="desc">${desc.lines.map((line,i) => `<tspan x="${contentX}" dy="${i ? state.descLineGap : 0}">${escapeXml(line)}</tspan>`).join("")}</text></g>`;
}
function renderSvg() {
  const card = { x: 188, y: 355, width: 1556, height: 650, radius: 92 }, logoBox = { x: 306, y: 520, width: 312, height: 312 };
  const bg = state.background || buildDefaultBackground();
  svg.setAttribute("viewBox", `0 0 ${state.width} ${state.height}`); svg.setAttribute("width", state.width); svg.setAttribute("height", state.height);
  svg.innerHTML = `${styleBlock()}${buildDefs(card,logoBox)}<rect width="100%" height="100%" fill="#070A12"/>${imageLayer(bg,"canvasClip",{x:0,y:0,width:state.width,height:state.height},state.backgroundScale,state.backgroundX,state.backgroundY,{opacity:state.backgroundOpacity/100})}${renderCard(card,logoBox)}`;
  svg.style.width = `${state.zoom}%`; $("zoomReadout").textContent = `${state.zoom}%`; $("dpiInfo").textContent = `${state.width}×${state.height} 高清 PNG`;
  renderSelection(card, logoBox); updateAssetCards();
}
function scheduleRender() { if (renderQueued) return; renderQueued = true; requestAnimationFrame(() => { renderQueued = false; renderSvg(); }); }

function createRange(key) { const [min,max,step] = RANGE_CONFIG[key]; const wrap = document.createElement("label"); wrap.textContent = RANGE_LABELS[key]; const control = document.createElement("div"); control.className = "range-control"; const range = document.createElement("input"); range.type = "range"; range.min = min; range.max = max; range.step = step; range.value = state[key]; range.id = key; range.setAttribute("aria-label", RANGE_LABELS[key]); const number = document.createElement("input"); number.type = "number"; number.min = min; number.max = max; number.step = step; number.value = state[key]; number.id = `${key}Number`; number.className = "range-number"; const reset = document.createElement("button"); reset.type = "button"; reset.className = "reset-mini"; reset.textContent = "复原"; reset.title = "复原此项默认值"; control.append(range,number,reset); wrap.append(control);
  const set = v => { state[key] = clamp(v,min,max); syncRange(key); if (["glassDepth","cardOpacity","glassDispersion"].includes(key)) markPresetCustom(); scheduleRender(); persist(); };
  range.addEventListener("pointerdown", beginInteraction); range.addEventListener("input", e => set(e.target.value)); range.addEventListener("change", endInteraction); number.addEventListener("focus", beginInteraction); number.addEventListener("input", e => set(e.target.value)); number.addEventListener("change", endInteraction); reset.addEventListener("click", () => { beginInteraction(); set(DEFAULTS[key]); endInteraction(); }); return wrap;
}
function setupRanges() { Object.entries(RANGE_GROUPS).forEach(([group,keys]) => { const target = $(`${group}RangeControls`); if (!target) return; target.innerHTML = ""; keys.forEach(k => target.append(createRange(k))); }); }
function syncRange(key) { [$(key), $(`${key}Number`)].forEach(el => { if (el) el.value = state[key]; }); }
function syncUi() { Object.keys(RANGE_CONFIG).forEach(syncRange); ["mainTitle","subTitle","description","fontFamily","logoStyle","accentColor","textColor"].forEach(key => { if ($(key)) $(key).value = state[key]; }); $("glassPresetLabel").textContent = state.glassPreset === "custom" ? "自定义" : GLASS_PRESETS[state.glassPreset]?.label || "标准"; renderGlassPresets(); renderThemeChoices(); }

function renderGlassPresets() { const host = $("glassPresets"); host.innerHTML = Object.entries(GLASS_PRESETS).map(([key,p]) => `<button class="glass-preset ${state.glassPreset===key?"active":""}" type="button" data-preset="${key}"><span>${p.label}</span></button>`).join(""); host.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => { beginInteraction(); const key=btn.dataset.preset; Object.assign(state, GLASS_PRESETS[key], { glassPreset:key }); syncUi(); scheduleRender(); endInteraction(); })); }
function markPresetCustom() { const p = GLASS_PRESETS[state.glassPreset]; if (!p || p.glassDepth !== state.glassDepth || p.cardOpacity !== state.cardOpacity || p.glassDispersion !== state.glassDispersion) state.glassPreset = "custom"; $("glassPresetLabel").textContent = state.glassPreset === "custom" ? "自定义" : GLASS_PRESETS[state.glassPreset].label; renderGlassPresets(); }
function renderThemeChoices() { const host = $("themePalette"); if (!state.themes.length) { host.innerHTML = `<p class="theme-empty">上传底图后，将自动生成可读性更稳妥的配色。</p>`; return; } host.innerHTML = state.themes.map((theme,i) => `<button type="button" class="theme-option ${state.selectedTheme===i?"selected":""}" data-index="${i}" aria-label="应用${theme.name}"><span class="theme-swatches"><i style="background:${theme.accentColor}"></i><i style="background:${theme.textColor}"></i></span><span>${theme.name}</span><small>${theme.accentColor} / ${theme.textColor}</small></button>`).join(""); host.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => { beginInteraction(); const i=Number(btn.dataset.index), t=state.themes[i]; state.accentColor=t.accentColor; state.textColor=t.textColor; state.selectedTheme=i; syncUi(); scheduleRender(); endInteraction(); })); }
function extractThemeColors(dataUrl) { const img = new Image(); img.onload = () => { const canvas=document.createElement("canvas"), ctx=canvas.getContext("2d",{willReadFrequently:true}); canvas.width=canvas.height=72; ctx.drawImage(img,0,0,72,72); const d=ctx.getImageData(0,0,72,72).data; const bins=new Map(); for(let i=0;i<d.length;i+=32){if(d[i+3]<160)continue;const r=d[i],g=d[i+1],b=d[i+2];const k=[r,g,b].map(v=>Math.floor(v/32)*32).join(",");const v=bins.get(k)||{r:0,g:0,b:0,c:0};v.r+=r;v.g+=g;v.b+=b;v.c++;bins.set(k,v);} const colors=[...bins.values()].sort((a,b)=>b.c-a.c).slice(0,4).map(v=>({r:v.r/v.c,g:v.g/v.c,b:v.b/v.c})); const textFor=c=>luminance(c)>.48?"#111318":"#FFFFFF"; state.themes=colors.map((c,i)=>({name:["主色平衡","柔和对比","明亮强调","深色强调"][i],accentColor:`#${[c.r,c.g,c.b].map(v=>Math.round(v).toString(16).padStart(2,"0")).join("")}`,textColor:textFor(c)})); renderThemeChoices(); }; img.src=dataUrl; }

function updateAssetCards() { const pairs=[ ["background","backgroundThumb","backgroundFileName","backgroundUploadTitle"], ["logo","logoThumb","logoFileName","logoUploadTitle"] ]; pairs.forEach(([kind,thumb,name,title])=>{const data=state[kind]; $(thumb).style.backgroundImage=data?`url("${data}")`:""; $(name).textContent=data?(kind==="background"?"已载入底图":"已载入 Logo"):(kind==="background"?"PNG、JPEG、WebP，最大 20MB":"PNG、JPEG、WebP，最大 20MB"); $(title).textContent=data?(kind==="background"?"当前底图":"当前 Logo"):(kind==="background"?"上传底图":"上传 Logo");}); $("fontStatus").textContent=state.customFontFileName?`${state.customFontFileName} 已加载`:"未上传"; }
function validateImage(file) { if (!file) return ""; if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return "只支持 PNG、JPEG 或 WebP 图片。"; if (file.size > MAX_FILE_SIZE) return "图片超过 20MB，请压缩后重试。"; return ""; }
async function readAsset(file, kind) { const error=$(kind==="background"?"backgroundError":"logoError"), msg=validateImage(file); error.textContent=msg; if(msg)return; try { const url=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsDataURL(file);}); const probe=new Image(); probe.src=url; await probe.decode(); beginInteraction(); state[kind]=url; if(kind==="background"){extractThemeColors(url);state.backgroundScale=100;state.backgroundX=0;state.backgroundY=0;} else {state.logoScale=120;state.logoX=0;state.logoY=0;} syncUi(); scheduleRender(); endInteraction(); } catch (_) { error.textContent="图片无法解码，请更换一个有效文件。"; } }
function setupUpload(kind) { const card=$(kind==="background"?"backgroundUploadCard":"logoUploadCard"), input=$(kind==="background"?"backgroundInput":"logoInput"), replace=$(kind==="background"?"replaceBackground":"replaceLogo"), clear=$(kind==="background"?"clearBackground":"clearLogo"); const trigger=()=>input.click(); card.addEventListener("click",trigger); card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();trigger();}}); replace.addEventListener("click",trigger); input.addEventListener("change",e=>readAsset(e.target.files[0],kind)); ["dragenter","dragover"].forEach(t=>card.addEventListener(t,e=>{e.preventDefault();card.classList.add("drag-over");})); ["dragleave","drop"].forEach(t=>card.addEventListener(t,e=>{e.preventDefault();card.classList.remove("drag-over");})); card.addEventListener("drop",e=>readAsset(e.dataTransfer.files[0],kind)); clear.addEventListener("click",()=>{beginInteraction();state[kind]="";if(kind==="background"){state.themes=[];state.selectedTheme=-1;}input.value="";syncUi();scheduleRender();endInteraction();}); }
async function registerCustomFont(show = true) { if (!state.customFontData || !state.customFontName) return; const face=new FontFace(state.customFontName,`url(${state.customFontData})`); try { await face.load(); document.fonts.add(face); if(show)showToast("自定义字体已加载"); } catch (_) { $("fontStatus").textContent="字体加载失败"; showToast("字体加载失败，无法可靠导出。","error",true); } }
function setupFontUpload() { $("fontInput").addEventListener("change", async e=>{const file=e.target.files[0];if(!file)return; if(file.size>MAX_FILE_SIZE){$("fontStatus").textContent="字体超过 20MB";return;} const ext=(file.name.split(".").pop()||"ttf").toLowerCase(); const fmt={ttf:"truetype",otf:"opentype",woff:"woff",woff2:"woff2"}[ext]; if(!fmt){$("fontStatus").textContent="不支持该字体格式";return;} const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsDataURL(file);}); beginInteraction();state.customFontName=`UserFont${Date.now()}`;state.customFontData=data;state.customFontFormat=fmt;state.customFontFileName=file.name;await registerCustomFont();scheduleRender();endInteraction();}); }

function renderSelection(card, logoBox) { const layer=$("selectionLayer"), host=$("canvasHost"), hostRect=host.getBoundingClientRect(), svgRect=svg.getBoundingClientRect(); const target=state.editorTarget; const chosen=target==="logo"?logoBox:{x:0,y:0,width:state.width,height:state.height}; const left=(svgRect.left-hostRect.left)+chosen.x/state.width*svgRect.width, top=(svgRect.top-hostRect.top)+chosen.y/state.height*svgRect.height, w=chosen.width/state.width*svgRect.width,h=chosen.height/state.height*svgRect.height; layer.innerHTML=`<div class="selection-box" data-label="${target==="logo"?"Logo":"底图"}" style="left:${left}px;top:${top}px;width:${w}px;height:${h}px"></div>`; }
function logicalPoint(event) { const rect=svg.getBoundingClientRect(); return { x:(event.clientX-rect.left)/rect.width*state.width, y:(event.clientY-rect.top)/rect.height*state.height }; }
function hitLogo(p) { return p.x>=306&&p.x<=618&&p.y>=520&&p.y<=832; }
function setupCanvasEditing() { const stage=$("previewStage"); stage.addEventListener("pointerdown",e=>{const p=logicalPoint(e);state.editorTarget=hitLogo(p)?"logo":"background";pointerState={id:e.pointerId,start:p,target:state.editorTarget,original:{x:state[`${state.editorTarget}X`],y:state[`${state.editorTarget}Y`]}};beginInteraction();stage.setPointerCapture(e.pointerId);renderSelection({x:188,y:355,width:1556,height:650,radius:92},{x:306,y:520,width:312,height:312});e.preventDefault();}); stage.addEventListener("pointermove",e=>{if(!pointerState)return;const p=logicalPoint(e),dx=p.x-pointerState.start.x,dy=p.y-pointerState.start.y,key=pointerState.target; const scale=state[`${key}Scale`],den=Math.max(1,(scale/100-1)); state[`${key}X`]=clamp(pointerState.original.x+dx/(state.width*.5*den)*100,-100,100);state[`${key}Y`]=clamp(pointerState.original.y+dy/(state.height*.5*den)*100,-100,100);syncRange(`${key}X`);syncRange(`${key}Y`);scheduleRender();e.preventDefault();}); const end=e=>{if(!pointerState)return;pointerState=null;endInteraction();};stage.addEventListener("pointerup",end);stage.addEventListener("pointercancel",end);stage.addEventListener("wheel",e=>{const key=state.editorTarget;beginInteraction();state[`${key}Scale`]=clamp(state[`${key}Scale`]+(e.deltaY<0?4:-4),RANGE_CONFIG[`${key}Scale`][0],RANGE_CONFIG[`${key}Scale`][1]);syncRange(`${key}Scale`);scheduleRender();endInteraction();e.preventDefault();},{passive:false}); window.addEventListener("resize",()=>scheduleRender()); }
function assetQuickActions() { document.querySelectorAll(".quick-actions button").forEach(btn=>btn.addEventListener("click",()=>{const asset=btn.closest(".quick-actions").dataset.asset,action=btn.dataset.action;beginInteraction();if(action==="fit")state[`${asset}Scale`]=100;if(action==="fill")state[`${asset}Scale`]=asset==="background"?130:145;if(action==="center"){state[`${asset}X`]=0;state[`${asset}Y`]=0;}if(action==="reset"){["Scale","X","Y"].forEach(k=>state[`${asset}${k}`]=DEFAULTS[`${asset}${k}`]);} ["Scale","X","Y"].forEach(k=>syncRange(`${asset}${k}`));scheduleRender();endInteraction();})); }

function crc32(bytes) { let c=0xffffffff; for(const b of bytes){c^=b;for(let k=0;k<8;k++)c=c&1?(c>>>1)^0xedb88320:c>>>1;} return (c^0xffffffff)>>>0; }
function withPngDpi(blob) { return blob.arrayBuffer().then(buffer=>{const data=new Uint8Array(buffer), physData=new Uint8Array(9), view=new DataView(physData.buffer);view.setUint32(0,11811);view.setUint32(4,11811);physData[8]=1;const type=new TextEncoder().encode("pHYs"),chunk=new Uint8Array(4+4+9+4),v=new DataView(chunk.buffer);v.setUint32(0,9);chunk.set(type,4);chunk.set(physData,8);v.setUint32(17,crc32(chunk.slice(4,17)));const result=new Uint8Array(data.length+chunk.length);result.set(data.slice(0,33),0);result.set(chunk,33);result.set(data.slice(33),33+chunk.length);return new Blob([result],{type:"image/png"});}); }
function serializeSvg() { return new XMLSerializer().serializeToString(svg); }
function download(filename, blob) { const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000); }
async function ensureResources() { if(document.fonts?.ready)await document.fonts.ready; const urls=[state.background,state.logo].filter(Boolean); await Promise.all(urls.map(src=>{const img=new Image();img.src=src;return img.decode().catch(()=>{});})); }
async function downloadPng() { if(exportBusy)return; exportBusy=true; const buttons=[$("downloadPng"),$("headerExportPng"),$("mobileExport")].filter(Boolean);buttons.forEach(b=>{b.disabled=true;b.dataset.label=b.textContent;b.textContent="正在导出…";});try{await ensureResources();const markup=serializeSvg(),url=URL.createObjectURL(new Blob([markup],{type:"image/svg+xml;charset=utf-8"}));const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error("SVG 图片加载失败"));img.src=url;});const canvas=document.createElement("canvas");canvas.width=state.width;canvas.height=state.height;const ctx=canvas.getContext("2d");if(!ctx)throw new Error("浏览器无法创建导出画布");ctx.drawImage(img,0,0);URL.revokeObjectURL(url);const raw=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("PNG 编码失败")),"image/png",1));const finalBlob=await withPngDpi(raw);download(`${safeFilename(state.mainTitle)}-${state.width}x${state.height}-${timestamp()}.png`,finalBlob);showToast("PNG 已导出，已写入 300dpi 元数据。");}catch(err){showToast(`导出失败：${err.message||"未知错误"}`,"error",true);}finally{exportBusy=false;buttons.forEach(b=>{b.disabled=false;b.textContent=b.dataset.label||"导出 PNG";});}}
async function downloadSvg() { try { await ensureResources(); download(`${safeFilename(state.mainTitle)}-${state.width}x${state.height}-${timestamp()}.svg`,new Blob([serializeSvg()],{type:"image/svg+xml;charset=utf-8"}));showToast("SVG 已导出。"); } catch(err){showToast(`导出失败：${err.message||"未知错误"}`,"error",true);} }

function resetAdjustments() { beginInteraction(); Object.keys(DEFAULTS).forEach(k=>{if(k!=="mainTitle"&&k!=="subTitle"&&k!=="description")state[k]=DEFAULTS[k];});state.glassPreset="standard";syncUi();scheduleRender();endInteraction(); }
function applyExampleReset() { beginInteraction(); Object.assign(state,{...DEFAULTS,background:"",logo:"",customFontName:"",customFontData:"",customFontFormat:"",customFontFileName:"",themes:[],selectedTheme:-1}); syncUi(); scheduleRender(); endInteraction(); }
function resetExample() { if(!confirm("恢复示例会清空已上传的底图、Logo 和自定义字体，是否继续？")) return; applyExampleReset(); }
function newArtwork(){ if(!confirm("新建作品会清空当前素材与内容，是否继续？")) return; applyExampleReset(); showToast("已新建空白作品。"); }
function bindBasicInputs(){["mainTitle","subTitle","description"].forEach(k=>$(k).addEventListener("focus",beginInteraction));["mainTitle","subTitle","description"].forEach(k=>$(k).addEventListener("input",e=>{state[k]=e.target.value;scheduleRender();persist();}));["mainTitle","subTitle","description"].forEach(k=>$(k).addEventListener("change",endInteraction));["accentColor","textColor"].forEach(k=>$(k).addEventListener("input",e=>{beginInteraction();state[k]=e.target.value;state.selectedTheme=-1;syncUi();scheduleRender();endInteraction();}));$("fontFamily").addEventListener("change",e=>{beginInteraction();state.fontFamily=e.target.value;scheduleRender();endInteraction();});$("logoStyle").addEventListener("change",e=>{beginInteraction();state.logoStyle=e.target.value;scheduleRender();endInteraction();});}
function setupClipboard(){window.addEventListener("paste",e=>{const item=[...e.clipboardData.items].find(i=>i.type.startsWith("image/"));if(!item)return;readAsset(item.getAsFile(),state.editorTarget==="logo"?"logo":"background");showToast(`已粘贴到${state.editorTarget==="logo"?" Logo":"底图"}`);});}
function setupMobile(){document.querySelectorAll("[data-mobile-tab]").forEach(b=>b.addEventListener("click",()=>{const tab=b.dataset.mobileTab;document.body.classList.toggle("mobile-preview",tab==="preview");document.body.classList.toggle("mobile-editor",tab==="editor");document.querySelectorAll("[data-mobile-tab]").forEach(x=>{x.classList.toggle("active",x===b);x.setAttribute("aria-selected",x===b?"true":"false");});}));$("mobilePreview").addEventListener("click",()=>document.querySelector('[data-mobile-tab="preview"]').click());}
function bindShortcuts(){window.addEventListener("keydown",e=>{if(!(e.metaKey||e.ctrlKey))return;if(e.key.toLowerCase()==="z"){e.preventDefault();e.shiftKey?redo():undo();}else if(e.key.toLowerCase()==="y"){e.preventDefault();redo();}});}
function init(){setupRanges();setupUpload("background");setupUpload("logo");setupFontUpload();assetQuickActions();bindBasicInputs();setupCanvasEditing();setupClipboard();setupMobile();bindShortcuts();$("downloadPng").addEventListener("click",downloadPng);$("headerExportPng").addEventListener("click",downloadPng);$("mobileExport").addEventListener("click",downloadPng);$("downloadSvg").addEventListener("click",downloadSvg);$("undoButton").addEventListener("click",undo);$("redoButton").addEventListener("click",redo);$("resetAdjustments").addEventListener("click",resetAdjustments);$("resetDemo").addEventListener("click",resetExample);$("newArtwork").addEventListener("click",newArtwork);syncUi();renderSvg();recordHistory();restorePersisted().then(()=>{syncUi();scheduleRender();recordHistory();});}
init();
