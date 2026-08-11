const svg = document.getElementById("achievementSvg");
const $ = (id) => document.getElementById(id);
const CANVAS = { width: 1932, height: 1360 };
const STORAGE_KEY = "achievement-unlock-editor-v4";
const LEGACY_STORAGE_KEY = "achievement-unlock-editor-v3";
const DB_NAME = "achievement-unlock-assets";
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const MATERIAL_PRESETS = {
  standard: { id: "standard", label: "标准", description: "清透均衡", blur: 26, saturation: 1.07, contrast: 1.03, tintColor: "#FFFFFF", tintOpacity: .12, secondaryTintColor: "#EBF0F8", secondaryTintOpacity: .05, borderColor: "#FFFFFF", borderOpacity: .40, innerHighlightColor: "#FFFFFF", innerHighlightOpacity: .22, bottomShadeOpacity: .12, shadowColor: "#000000", contactShadowOpacity: .14, ambientShadowOpacity: .21, reflectionAColor: "#FFFFFF", reflectionAOpacity: .10, reflectionBColor: "#DCE7FF", reflectionBOpacity: .04, dispersionAmount: 0, dispersionOpacity: 0, recommendedTextColor: "#FFFFFF", recommendedAccentColor: "#F5F7FF", glassDepth: 58, cardOpacity: 22, glassDispersion: 0 },
  glacier: { id: "glacier", label: "冰川白", description: "柔和冰霜", blur: 32, saturation: .86, contrast: 1.01, tintColor: "#F2F6FA", tintOpacity: .25, secondaryTintColor: "#DDE8F2", secondaryTintOpacity: .07, borderColor: "#FFFFFF", borderOpacity: .48, innerHighlightColor: "#FFFFFF", innerHighlightOpacity: .30, bottomShadeOpacity: .06, shadowColor: "#253241", contactShadowOpacity: .08, ambientShadowOpacity: .14, reflectionAColor: "#FFFFFF", reflectionAOpacity: .08, reflectionBColor: "#BFD6EA", reflectionBOpacity: .045, dispersionAmount: 0, dispersionOpacity: 0, recommendedTextColor: "#17202B", recommendedAccentColor: "#66839E", glassDepth: 78, cardOpacity: 43, glassDispersion: 0 },
  obsidian: { id: "obsidian", label: "黑曜石", description: "深邃烟熏", blur: 26, saturation: .88, contrast: 1.04, tintColor: "#090E16", tintOpacity: .34, secondaryTintColor: "#182231", secondaryTintOpacity: .08, borderColor: "#DCE7F2", borderOpacity: .22, innerHighlightColor: "#EAF4FF", innerHighlightOpacity: .15, bottomShadeOpacity: .16, shadowColor: "#000000", contactShadowOpacity: .20, ambientShadowOpacity: .30, reflectionAColor: "#B9D4EE", reflectionAOpacity: .035, reflectionBColor: "#6B88A8", reflectionBOpacity: .025, dispersionAmount: 0, dispersionOpacity: 0, recommendedTextColor: "#FFFFFF", recommendedAccentColor: "#B9D4EE", glassDepth: 58, cardOpacity: 60, glassDispersion: 0 },
  champagne: { id: "champagne", label: "香槟金", description: "温润典藏", blur: 28, saturation: .98, contrast: 1.02, tintColor: "#E6D3B7", tintOpacity: .17, secondaryTintColor: "#B99464", secondaryTintOpacity: .055, borderColor: "#F6DFC0", borderOpacity: .40, innerHighlightColor: "#FFF8EC", innerHighlightOpacity: .24, bottomShadeOpacity: .10, shadowColor: "#24190F", contactShadowOpacity: .13, ambientShadowOpacity: .22, reflectionAColor: "#FFF8EC", reflectionAOpacity: .06, reflectionBColor: "#C89D68", reflectionBOpacity: .045, dispersionAmount: 0, dispersionOpacity: 0, recommendedTextColor: "#FFF9F0", recommendedAccentColor: "#E7C58E", glassDepth: 66, cardOpacity: 32, glassDispersion: 0 },
  aurora: { id: "aurora", label: "极光", description: "冷色反射", blur: 27, saturation: 1.12, contrast: 1.02, tintColor: "#F4F7FB", tintOpacity: .12, secondaryTintColor: "#EAF2FF", secondaryTintOpacity: .04, borderColor: "#FFFFFF", borderOpacity: .34, innerHighlightColor: "#FFFFFF", innerHighlightOpacity: .22, bottomShadeOpacity: .10, shadowColor: "#07111C", contactShadowOpacity: .13, ambientShadowOpacity: .22, reflectionAColor: "#7DE4E4", reflectionAOpacity: .075, reflectionBColor: "#A997FF", reflectionBOpacity: .07, dispersionAmount: .12, dispersionOpacity: .025, recommendedTextColor: "#FFFFFF", recommendedAccentColor: "#B8C6FF", glassDepth: 62, cardOpacity: 23, glassDispersion: 0 },
  prism: { id: "prism", label: "棱镜", description: "微光色散", blur: 22, saturation: 1.05, contrast: 1.04, tintColor: "#FFFFFF", tintOpacity: .10, secondaryTintColor: "#F4F7FF", secondaryTintOpacity: .035, borderColor: "#FFFFFF", borderOpacity: .43, innerHighlightColor: "#FFFFFF", innerHighlightOpacity: .24, bottomShadeOpacity: .08, shadowColor: "#07111C", contactShadowOpacity: .10, ambientShadowOpacity: .17, reflectionAColor: "#FFFFFF", reflectionAOpacity: .07, reflectionBColor: "#DDE7FF", reflectionBOpacity: .04, dispersionAmount: .58, dispersionOpacity: .065, recommendedTextColor: "#FFFFFF", recommendedAccentColor: "#DDE7FF", glassDepth: 42, cardOpacity: 18, glassDispersion: 12 },
  silver: { id: "silver", label: "雾银", description: "低饱和磨砂", blur: 33, saturation: .60, contrast: 1.03, tintColor: "#D8DEE6", tintOpacity: .23, secondaryTintColor: "#AEB7C2", secondaryTintOpacity: .07, borderColor: "#EEF1F5", borderOpacity: .36, innerHighlightColor: "#FFFFFF", innerHighlightOpacity: .20, bottomShadeOpacity: .10, shadowColor: "#111820", contactShadowOpacity: .11, ambientShadowOpacity: .18, reflectionAColor: "#FFFFFF", reflectionAOpacity: .055, reflectionBColor: "#AEB7C2", reflectionBOpacity: .04, dispersionAmount: 0, dispersionOpacity: 0, recommendedTextColor: "#1D222B", recommendedAccentColor: "#8B99AA", glassDepth: 82, cardOpacity: 39, glassDispersion: 0 }
};
const MATERIAL_ORDER = ["standard", "glacier", "obsidian", "champagne", "aurora", "prism", "silver"];
const LEGACY_MATERIAL_MAP = { clear: "glacier", dark: "obsidian", standard: "standard" };

const LAYOUT_PRESETS = {
  system: { id: "system", label: "系统通知" },
  certificate: { id: "certificate", label: "典藏证书" }
};

const SMART_THRESHOLDS = {
  veryBright: .70,
  dark: .28,
  lowSaturation: .24,
  highSaturation: .46,
  complexStd: .20,
  warmHueMin: 18,
  warmHueMax: 62,
  cyanHueMin: 165,
  cyanHueMax: 205,
  purpleHueMin: 245,
  purpleHueMax: 292,
  minAccentSat: .18,
  maxAccentSat: .62,
  minAccentLum: .35,
  maxAccentLum: .72
};

const DEFAULTS = {
  width: CANVAS.width, height: CANVAS.height,
  mainTitle: "雕像也无法让她回心转意", subTitle: "成就解锁",
  description: "它们毫无意义",
  accentColor: "#F5F7FF", textColor: "#FFFFFF", fontFamily: "system",
  backgroundScale: 100, backgroundX: 0, backgroundY: 0, backgroundOpacity: 100,
  logoScale: 120, logoX: 0, logoY: 0, logoStyle: "floating",
  glassPreset: "standard", materialBase: "standard", glassDepth: 58, cardOpacity: 22, glassDispersion: 0,
  layoutPreset: "system", smartSummary: "",
  subtitleTitleGap: 110, titleRuleGap: 118, ruleDescGap: 88, descLineGap: 62,
  subtitleLetterSpacing: 4, titleLetterSpacing: 0, descLetterSpacing: 0,
  descriptionBoxWidth: 930, descriptionBoxHeight: 240, zoom: 72
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
const state = { ...DEFAULTS, background: "", logo: "", customFontName: "", customFontData: "", customFontFormat: "", customFontFileName: "", themes: [], selectedTheme: -1, editorTarget: null };
let history = [], future = [], renderQueued = false, interactionStart = null, pointerState = null, exportBusy = false, smartBusy = false, smartCache = null, suppressSmartManual = false;

function escapeXml(value = "") { return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;"); }
function hexToRgb(hex) { const h = String(hex || "#000000").replace("#", ""); const value = parseInt(h.length === 3 ? h.split("").map(x => x + x).join("") : h, 16) || 0; return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 }; }
function rgbToHex({ r, g, b }) { return `#${[r,g,b].map(v => Math.round(clamp(v,0,255)).toString(16).padStart(2,"0")).join("")}`; }
function luminance({ r, g, b }) { const v = [r,g,b].map(x => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }); return .2126*v[0] + .7152*v[1] + .0722*v[2]; }
function contrastRatio(a, b) { const l1 = Math.max(a,b), l2 = Math.min(a,b); return (l1 + .05) / (l2 + .05); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value))); }
function mixRgb(a, b, t) { return { r: a.r * (1 - t) + b.r * t, g: a.g * (1 - t) + b.g * t, b: a.b * (1 - t) + b.b * t }; }
function fontStack() { if (state.customFontName) return `'${state.customFontName}', 'PingFang SC', sans-serif`; return { system: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif", song: "'Songti SC', SimSun, STSong, serif", kai: "'Kaiti SC', KaiTi, STKaiti, serif", hei: "'Source Han Sans SC', 'Noto Sans CJK SC', 'PingFang SC', 'Microsoft YaHei', sans-serif" }[state.fontFamily] || "sans-serif"; }
function safeFilename(value) { return String(value || "achievement").replace(/[\\/:*?\"<>|\n\r]+/g, "-").trim().replace(/\s+/g, "-").slice(0, 60) || "achievement"; }
function timestamp() { const d = new Date(); const p = n => String(n).padStart(2,"0"); return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`; }
function showToast(message, type = "success", persistent = false) { const toast = document.createElement("div"); toast.className = `toast ${type}`; toast.textContent = message; $("toastRegion").append(toast); if (!persistent) setTimeout(() => toast.remove(), 3400); return toast; }

function normalizeState() {
  const migrated = LEGACY_MATERIAL_MAP[state.glassPreset] || (MATERIAL_PRESETS[state.glassPreset] ? state.glassPreset : null) || (MATERIAL_PRESETS[state.materialBase] ? state.materialBase : "standard");
  if (!MATERIAL_PRESETS[state.materialBase]) state.materialBase = migrated;
  if (state.glassPreset !== "custom") state.glassPreset = migrated;
  if (!MATERIAL_PRESETS[state.glassPreset] && state.glassPreset !== "custom") state.glassPreset = "standard";
  if (!MATERIAL_PRESETS[state.materialBase]) state.materialBase = "standard";
  if (!LAYOUT_PRESETS[state.layoutPreset]) state.layoutPreset = "system";
}
function snapshot() { const copy = {}; Object.keys(DEFAULTS).forEach(k => copy[k] = state[k]); ["background", "logo", "customFontName", "customFontData", "customFontFormat", "customFontFileName", "selectedTheme"].forEach(k => copy[k] = state[k]); return copy; }
function restoreSnapshot(data) { Object.assign(state, data); normalizeState(); state.themes = state.background ? state.themes : []; syncUi(); scheduleRender(); }
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
async function restorePersisted() { try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY) || "null"); if (!saved) return; const legacyPreset = saved.glassPreset; const hadMaterialBase = Object.prototype.hasOwnProperty.call(saved, "materialBase"); Object.assign(state, saved); normalizeState(); if (!hadMaterialBase && LEGACY_MATERIAL_MAP[legacyPreset]) { const p = MATERIAL_PRESETS[state.materialBase]; state.glassDepth = p.glassDepth; state.cardOpacity = p.cardOpacity; state.glassDispersion = p.glassDispersion; } state.background = await dbGet("background"); state.logo = await dbGet("logo"); state.customFontData = await dbGet("font"); if (state.customFontData && state.customFontName) await registerCustomFont(false); if (state.background) extractThemeColors(state.background); showToast("已恢复上次编辑"); } catch (_) {} }

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

function currentMaterialBase() { return MATERIAL_PRESETS[state.materialBase] ? state.materialBase : "standard"; }
function currentMaterialToken() {
  const base = { ...MATERIAL_PRESETS[currentMaterialBase()] };
  const depthDelta = state.glassDepth - base.glassDepth;
  const opacityDelta = state.cardOpacity - base.cardOpacity;
  const dispersionDelta = state.glassDispersion - base.glassDispersion;
  base.blur = clamp(base.blur + depthDelta * .18, 14, 38);
  base.tintOpacity = clamp(base.tintOpacity + opacityDelta * .004, .04, .42);
  base.secondaryTintOpacity = clamp(base.secondaryTintOpacity + opacityDelta * .0015, 0, .10);
  base.ambientShadowOpacity = clamp(base.ambientShadowOpacity + depthDelta * .002, .08, .34);
  base.contactShadowOpacity = clamp(base.contactShadowOpacity + depthDelta * .0012, .06, .22);
  base.dispersionAmount = clamp(base.dispersionAmount + dispersionDelta * .045, 0, .75);
  base.dispersionOpacity = base.dispersionAmount ? clamp(base.dispersionOpacity + Math.max(0, dispersionDelta) * .0025, .02, .08) : 0;
  return base;
}
function applyMaterial(key, source = "manual") {
  const preset = MATERIAL_PRESETS[key] || MATERIAL_PRESETS.standard;
  state.materialBase = preset.id;
  state.glassPreset = preset.id;
  state.glassDepth = preset.glassDepth;
  state.cardOpacity = preset.cardOpacity;
  state.glassDispersion = preset.glassDispersion;
  state.textColor = preset.recommendedTextColor;
  state.accentColor = preset.recommendedAccentColor;
  state.selectedTheme = -1;
  if (source === "manual") markSmartManual();
}
function markPresetCustom() {
  const p = MATERIAL_PRESETS[currentMaterialBase()];
  if (!p || p.glassDepth !== state.glassDepth || p.cardOpacity !== state.cardOpacity || p.glassDispersion !== state.glassDispersion) state.glassPreset = "custom";
  $("glassPresetLabel").textContent = state.glassPreset === "custom" ? `${MATERIAL_PRESETS[currentMaterialBase()].label} · 自定义` : MATERIAL_PRESETS[currentMaterialBase()].label;
  renderGlassPresets();
}
function markSmartManual() { if (suppressSmartManual || !state.smartSummary) return; state.smartSummary = "已手动调整"; if ($("smartSummary")) $("smartSummary").textContent = state.smartSummary; }
function invalidateSmartCache() { smartCache = null; }

function buildDefs(card, logoBox, material) {
  const logoRadius = state.layoutPreset === "certificate" ? 44 : 60;
  const contrastIntercept = (1 - material.contrast) / 2;
  const edgeA = `M ${card.x + card.radius} ${card.y} H ${card.x + card.width - card.radius} Q ${card.x + card.width} ${card.y} ${card.x + card.width} ${card.y + card.radius} V ${card.y + card.height * .26}`;
  const edgeB = `M ${card.x + card.width - card.radius} ${card.y + card.height} H ${card.x + card.radius} Q ${card.x} ${card.y + card.height} ${card.x} ${card.y + card.height - card.radius} V ${card.y + card.height * .74}`;
  return `<defs>
    <clipPath id="canvasClip"><rect width="${state.width}" height="${state.height}"/></clipPath>
    <clipPath id="cardClip"><rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}"/></clipPath>
    <clipPath id="logoClip"><rect x="${logoBox.x}" y="${logoBox.y}" width="${logoBox.width}" height="${logoBox.height}" rx="${logoRadius}"/></clipPath>
    <filter id="frostedBlur" x="-10%" y="-14%" width="120%" height="128%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${material.blur}" edgeMode="duplicate" result="blur"/><feColorMatrix in="blur" type="saturate" values="${material.saturation}" result="sat"/><feComponentTransfer in="sat"><feFuncR type="linear" slope="${material.contrast}" intercept="${contrastIntercept}"/><feFuncG type="linear" slope="${material.contrast}" intercept="${contrastIntercept}"/><feFuncB type="linear" slope="${material.contrast}" intercept="${contrastIntercept}"/></feComponentTransfer></filter>
    <filter id="contactShadow" x="-8%" y="-10%" width="116%" height="124%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="${material.shadowColor}" flood-opacity="${material.contactShadowOpacity}"/></filter>
    <filter id="ambientShadow" x="-16%" y="-28%" width="132%" height="164%"><feDropShadow dx="0" dy="28" stdDeviation="35" flood-color="${material.shadowColor}" flood-opacity="${material.ambientShadowOpacity}"/></filter>
    <filter id="floatingLogoShadow" x="-26%" y="-30%" width="152%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="${material.shadowColor}" flood-opacity="${state.layoutPreset === "certificate" ? .10 : .16}"/></filter>
    <filter id="textShadow" x="-8%" y="-12%" width="116%" height="124%"><feDropShadow dx="0" dy="1.4" stdDeviation="1.5" flood-color="#000" flood-opacity=".18"/></filter>
    <linearGradient id="glassTint" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${material.tintColor}" stop-opacity="${material.tintOpacity}"/><stop offset=".52" stop-color="${material.tintColor}" stop-opacity="${material.tintOpacity * .60}"/><stop offset="1" stop-color="${material.secondaryTintColor}" stop-opacity="${material.secondaryTintOpacity}"/></linearGradient>
    <linearGradient id="borderGradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${material.borderColor}" stop-opacity="${material.borderOpacity}"/><stop offset=".34" stop-color="${material.borderColor}" stop-opacity="${material.borderOpacity * .68}"/><stop offset=".72" stop-color="${material.borderColor}" stop-opacity="${material.borderOpacity * .28}"/><stop offset="1" stop-color="${material.borderColor}" stop-opacity="${material.borderOpacity * .52}"/></linearGradient>
    <linearGradient id="topHighlight" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${material.innerHighlightColor}" stop-opacity="${material.innerHighlightOpacity}"/><stop offset=".50" stop-color="${material.innerHighlightColor}" stop-opacity="${material.innerHighlightOpacity * .30}"/><stop offset="1" stop-color="${material.innerHighlightColor}" stop-opacity="0"/></linearGradient>
    <linearGradient id="bottomShade" x1="0" y1="0" x2="0" y2="1"><stop offset=".66" stop-color="${material.shadowColor}" stop-opacity="0"/><stop offset="1" stop-color="${material.shadowColor}" stop-opacity="${material.bottomShadeOpacity}"/></linearGradient>
    <radialGradient id="surfaceHighlight" cx="12%" cy="10%" r="62%"><stop stop-color="${material.reflectionAColor}" stop-opacity="${material.reflectionAOpacity}"/><stop offset=".60" stop-color="${material.reflectionAColor}" stop-opacity="${material.reflectionAOpacity * .20}"/><stop offset="1" stop-color="${material.reflectionAColor}" stop-opacity="0"/></radialGradient>
    <radialGradient id="coolReflection" cx="88%" cy="88%" r="58%"><stop stop-color="${material.reflectionBColor}" stop-opacity="${material.reflectionBOpacity}"/><stop offset=".62" stop-color="${material.reflectionBColor}" stop-opacity="${material.reflectionBOpacity * .22}"/><stop offset="1" stop-color="${material.reflectionBColor}" stop-opacity="0"/></radialGradient>
    <g id="cardShape"><rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}"/></g>
    <g id="logoShape"><rect x="${logoBox.x}" y="${logoBox.y}" width="${logoBox.width}" height="${logoBox.height}" rx="${logoRadius}"/></g>
    <path id="edgeA" d="${edgeA}"/><path id="edgeB" d="${edgeB}"/>
  </defs>`;
}

function measureText(text, size, weight, spacing = 0) { const c = document.createElement("canvas"), ctx = c.getContext("2d"); ctx.font = `${weight} ${size}px ${fontStack()}`; return ctx.measureText(text).width + Math.max(0, Array.from(text).length - 1) * spacing; }
function fitTitle(text, maxWidth, start = 80, min = 56, weight = 700, spacing = state.titleLetterSpacing) { let size = start; while (size > min && measureText(text, size, weight, spacing) > maxWidth) size -= 1; return { size, overflow: measureText(text, size, weight, spacing) > maxWidth }; }
function wrapMeasuredLine(line, maxWidth, size, weight, spacing) {
  const chars = Array.from(line); if (!chars.length) return [""]; const lines = []; let current = "";
  for (const char of chars) { const test = current + char; if (current && measureText(test, size, weight, spacing) > maxWidth) { const breakAt = Math.max(current.lastIndexOf(" "), current.lastIndexOf("，"), current.lastIndexOf("。"), current.lastIndexOf("、"), current.lastIndexOf(","), current.lastIndexOf(".")); if (breakAt > Math.floor(current.length * .45)) { lines.push(current.slice(0, breakAt + 1).trimEnd()); current = current.slice(breakAt + 1).trimStart() + char; } else { lines.push(current); current = char; } } else current = test; }
  lines.push(current); return lines;
}
function textMetrics(size, weight) { const canvas = document.createElement("canvas"); const ctx = canvas.getContext("2d"); ctx.font = `${weight} ${size}px ${fontStack()}`; const metrics = ctx.measureText("成就 Achievement 0123"); return { ascent: metrics.actualBoundingBoxAscent || size * .78, descent: metrics.actualBoundingBoxDescent || size * .22 }; }
function descriptionLines(maxLines, maxWidth = state.descriptionBoxWidth, size = 36, weight = 500, spacing = state.descLetterSpacing) {
  const lines = [];
  for (const manual of String(state.description || "").split(/\r?\n/)) lines.push(...wrapMeasuredLine(manual, maxWidth, size, weight, spacing));
  const overflow = lines.length > maxLines; const shown = lines.slice(0, maxLines); if (overflow && shown.length) { let last = shown.at(-1); while (last.length && measureText(`${last}…`, size, weight, spacing) > maxWidth) last = last.slice(0, -1); shown[shown.length - 1] = `${last}…`; }
  return { lines: shown, overflow };
}
function renderGlass(card, logoBox, material, bg) {
  const dispersion = material.dispersionAmount;
  return `<g aria-label="system frosted glass card"><use href="#cardShape" filter="url(#ambientShadow)"/><use href="#cardShape" filter="url(#contactShadow)"/>${imageLayer(bg,"cardClip",{x:0,y:0,width:state.width,height:state.height},state.backgroundScale,state.backgroundX,state.backgroundY,{filter:"url(#frostedBlur)",expand:1.04})}<rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="url(#glassTint)" clip-path="url(#cardClip)"/><rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="url(#surfaceHighlight)" clip-path="url(#cardClip)"/><rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="url(#coolReflection)" clip-path="url(#cardClip)"/>${dispersion ? `<use href="#edgeA" transform="translate(${-dispersion},0)" fill="none" stroke="#79b7ff" stroke-opacity="${material.dispersionOpacity}" stroke-width="1"/><use href="#edgeB" transform="translate(${dispersion},0)" fill="none" stroke="#ff8a9d" stroke-opacity="${material.dispersionOpacity}" stroke-width="1"/>` : ""}<use href="#cardShape" fill="none" stroke="url(#borderGradient)" stroke-width="2.5"/><use href="#cardShape" fill="none" stroke="url(#topHighlight)" stroke-width="1"/><use href="#cardShape" fill="none" stroke="url(#bottomShade)" stroke-width="1"/></g>`;
}
function renderLogoLayer(logoBox, material, bg) {
  const logo = state.logo || buildDefaultLogo();
  const logoPlacement = imageLayer(logo, "logoClip", logoBox, state.logoScale, state.logoX, state.logoY, { preserve: "xMidYMid slice" });
  return state.logoStyle === "glass" ? `<g aria-label="logo glass container"><use href="#logoShape" filter="url(#floatingLogoShadow)"/>${imageLayer(bg,"logoClip",{x:0,y:0,width:state.width,height:state.height},state.backgroundScale,state.backgroundX,state.backgroundY,{filter:"url(#frostedBlur)",expand:1.04})}<use href="#logoShape" fill="url(#glassTint)"/><use href="#logoShape" fill="none" stroke="url(#borderGradient)" stroke-width="2"/><use href="#logoShape" fill="none" stroke="url(#topHighlight)" stroke-width="1"/>${logoPlacement}</g>` : `<g filter="url(#floatingLogoShadow)" aria-label="floating logo">${logoPlacement}</g>`;
}
function renderSystemCard(card, logoBox, material) {
  const bg = state.background || buildDefaultBackground();
  const contentX = logoBox.x + logoBox.width + 78;
  const contentRight = card.x + card.width - 110;
  const subtitleY = card.y + 110;
  const titleY = subtitleY + state.subtitleTitleGap;
  const lineY = titleY + state.titleRuleGap;
  const descFontSize = 36, bottomSafePadding = 48;
  const descMetrics = textMetrics(descFontSize, 500);
  const descTopY = lineY + state.ruleDescGap;
  const descBaselineY = descTopY + descMetrics.ascent;
  const availableHeight = card.y + card.height - bottomSafePadding - descTopY;
  const cardMaxLines = Math.max(1, 1 + Math.floor(Math.max(0, availableHeight - descFontSize) / state.descLineGap));
  const boxMaxLines = Math.max(1, 1 + Math.floor(Math.max(0, state.descriptionBoxHeight - descFontSize) / state.descLineGap));
  const maxLines = Math.max(1, Math.min(3, boxMaxLines, cardMaxLines));
  const title = fitTitle(state.mainTitle, contentRight - contentX, 80, 56, 700, state.titleLetterSpacing);
  const desc = descriptionLines(maxLines, state.descriptionBoxWidth, 36, 500, state.descLetterSpacing);
  $("titleWarning").textContent = title.overflow ? "标题过长，已缩小至最小字号；请缩短文字以避免导出溢出。" : "";
  $("descriptionWarning").textContent = desc.overflow ? "内容过长，导出时将以省略号显示最后一行。" : "";
  const lineWidth = Math.min(state.descriptionBoxWidth, contentRight - contentX);
  return `${renderGlass(card, logoBox, material, bg)}${renderLogoLayer(logoBox, material, bg)}<g class="font-main text-fill"><text x="${contentX}" y="${subtitleY}" class="subtitle">${escapeXml(state.subTitle)}</text><text x="${contentX}" y="${titleY}" class="title" font-size="${title.size}">${escapeXml(state.mainTitle)}</text><line x1="${contentX}" y1="${lineY}" x2="${contentX + lineWidth}" y2="${lineY}" stroke="${state.accentColor}" stroke-opacity=".22" stroke-width="1.25"/><text x="${contentX}" y="${descBaselineY}" class="desc">${desc.lines.map((line,i) => `<tspan x="${contentX}" dy="${i ? state.descLineGap : 0}">${escapeXml(line)}</tspan>`).join("")}</text></g>`;
}
function renderCertificateCard(card, logoBox, material) {
  const bg = state.background || buildDefaultBackground();
  const centerX = card.x + card.width / 2;
  const subtitleY = logoBox.y + logoBox.height + 74;
  const certSubtitleSpacing = Math.max(8, state.subtitleLetterSpacing + 4);
  const titleY = subtitleY + 104;
  const lineY = titleY + 108;
  const descFontSize = 36, descLineGap = Math.max(56, state.descLineGap), descWidth = Math.min(980, state.descriptionBoxWidth + 40);
  const descTopY = lineY + 82;
  const descMetrics = textMetrics(descFontSize, 500);
  const availableHeight = card.y + card.height - 60 - descTopY;
  const maxLines = Math.max(1, Math.min(3, 1 + Math.floor(Math.max(0, availableHeight - descFontSize) / descLineGap)));
  const title = fitTitle(state.mainTitle, card.width - 250, 78, 52, 700, Math.max(1, state.titleLetterSpacing));
  const desc = descriptionLines(maxLines, descWidth, descFontSize, 500, state.descLetterSpacing);
  $("titleWarning").textContent = title.overflow ? "标题过长，已缩小至最小字号；请缩短文字以避免导出溢出。" : "";
  $("descriptionWarning").textContent = desc.overflow ? "内容过长，导出时将以省略号显示最后一行。" : "";
  const lineHalf = 168, dot = 4.5;
  return `${renderGlass(card, logoBox, material, bg)}${renderLogoLayer(logoBox, material, bg)}<g class="font-main text-fill" text-anchor="middle"><text x="${centerX}" y="${subtitleY}" font-size="30" font-weight="600" letter-spacing="${certSubtitleSpacing}" opacity=".70">${escapeXml(state.subTitle)}</text><text x="${centerX}" y="${titleY}" class="title" font-size="${title.size}" font-weight="700" letter-spacing="${Math.max(1, state.titleLetterSpacing)}">${escapeXml(state.mainTitle)}</text><line x1="${centerX - lineHalf}" y1="${lineY}" x2="${centerX - 16}" y2="${lineY}" stroke="${state.accentColor}" stroke-opacity=".18" stroke-width="1.2"/><rect x="${centerX - dot / 2}" y="${lineY - dot / 2}" width="${dot}" height="${dot}" transform="rotate(45 ${centerX} ${lineY})" fill="${state.accentColor}" opacity=".18"/><line x1="${centerX + 16}" y1="${lineY}" x2="${centerX + lineHalf}" y2="${lineY}" stroke="${state.accentColor}" stroke-opacity=".18" stroke-width="1.2"/><text x="${centerX}" y="${descTopY + descMetrics.ascent}" class="desc" font-weight="500">${desc.lines.map((line,i) => `<tspan x="${centerX}" dy="${i ? descLineGap : 0}">${escapeXml(line)}</tspan>`).join("")}</text></g>`;
}
function layoutGeometry() {
  if (state.layoutPreset === "certificate") {
    const card = { x: 226, y: 245, width: 1480, height: 870, radius: 84 };
    const size = 210;
    const logoBox = { x: card.x + (card.width - size) / 2, y: card.y + 92, width: size, height: size };
    return { card, logoBox };
  }
  const card = { x: 188, y: 330, width: 1556, height: 700, radius: 92 };
  const logoBox = { x: 306, width: 312, height: 312 };
  logoBox.y = card.y + (card.height - logoBox.height) / 2;
  return { card, logoBox };
}
function textAreaGeometry(card, logoBox) {
  if (state.layoutPreset === "certificate") return { x: card.x + 250, y: card.y + 450, width: card.width - 500, height: 360 };
  const contentX = logoBox.x + logoBox.width + 78;
  return { x: contentX, y: card.y + 70, width: Math.min(state.descriptionBoxWidth, card.x + card.width - 110 - contentX), height: card.height - 140 };
}
function renderSvg() {
  const { card, logoBox } = layoutGeometry();
  const material = currentMaterialToken();
  const bg = state.background || buildDefaultBackground();
  svg.setAttribute("viewBox", `0 0 ${state.width} ${state.height}`); svg.setAttribute("width", state.width); svg.setAttribute("height", state.height);
  const cardMarkup = state.layoutPreset === "certificate" ? renderCertificateCard(card, logoBox, material) : renderSystemCard(card, logoBox, material);
  svg.innerHTML = `${styleBlock()}${buildDefs(card,logoBox,material)}<rect width="100%" height="100%" fill="#070A12"/>${imageLayer(bg,"canvasClip",{x:0,y:0,width:state.width,height:state.height},state.backgroundScale,state.backgroundX,state.backgroundY,{opacity:state.backgroundOpacity/100})}${cardMarkup}`;
  svg.style.width = `${state.zoom}%`; $("zoomReadout").textContent = `${state.zoom}%`; $("dpiInfo").textContent = `${state.width}×${state.height} 高清 PNG`;
  renderSelection(card, logoBox); updateAssetCards();
}
function scheduleRender() { if (renderQueued) return; renderQueued = true; requestAnimationFrame(() => { renderQueued = false; renderSvg(); }); }

function createRange(key) { const [min,max,step] = RANGE_CONFIG[key]; const wrap = document.createElement("label"); wrap.textContent = RANGE_LABELS[key]; const control = document.createElement("div"); control.className = "range-control"; const range = document.createElement("input"); range.type = "range"; range.min = min; range.max = max; range.step = step; range.value = state[key]; range.id = key; range.setAttribute("aria-label", RANGE_LABELS[key]); const number = document.createElement("input"); number.type = "number"; number.min = min; number.max = max; number.step = step; number.value = state[key]; number.id = `${key}Number`; number.className = "range-number"; const reset = document.createElement("button"); reset.type = "button"; reset.className = "reset-mini"; reset.textContent = "复原"; reset.title = "复原此项默认值"; control.append(range,number,reset); wrap.append(control);
  const set = v => { state[key] = clamp(v,min,max); syncRange(key); if (["glassDepth","cardOpacity","glassDispersion"].includes(key)) { markPresetCustom(); markSmartManual(); } if (["backgroundScale","backgroundX","backgroundY","backgroundOpacity"].includes(key)) invalidateSmartCache(); scheduleRender(); persist(); };
  range.addEventListener("pointerdown", beginInteraction); range.addEventListener("input", e => set(e.target.value)); range.addEventListener("change", endInteraction); number.addEventListener("focus", beginInteraction); number.addEventListener("input", e => set(e.target.value)); number.addEventListener("change", endInteraction); reset.addEventListener("click", () => { beginInteraction(); set(DEFAULTS[key]); endInteraction(); }); return wrap;
}
function setupRanges() { Object.entries(RANGE_GROUPS).forEach(([group,keys]) => { const target = $(`${group}RangeControls`); if (!target) return; target.innerHTML = ""; keys.forEach(k => target.append(createRange(k))); }); }
function syncRange(key) { [$(key), $(`${key}Number`)].forEach(el => { if (el) el.value = state[key]; }); }
function syncUi() { normalizeState(); Object.keys(RANGE_CONFIG).forEach(syncRange); ["mainTitle","subTitle","description","fontFamily","logoStyle","accentColor","textColor"].forEach(key => { if ($(key)) $(key).value = state[key]; }); $("glassPresetLabel").textContent = state.glassPreset === "custom" ? `${MATERIAL_PRESETS[currentMaterialBase()].label} · 自定义` : MATERIAL_PRESETS[currentMaterialBase()].label; if ($("smartSummary")) $("smartSummary").textContent = state.smartSummary || ""; renderGlassPresets(); renderLayoutPresets(); renderThemeChoices(); }

function materialSwatchStyle(p) { return `--m-tint:${p.tintColor};--m-tint2:${p.secondaryTintColor};--m-border:${p.borderColor};--m-ref-a:${p.reflectionAColor};--m-ref-b:${p.reflectionBColor};--m-alpha:${p.tintOpacity};--m-b:${p.borderOpacity};--m-ra:${p.reflectionAOpacity};--m-rb:${p.reflectionBOpacity};`; }
function renderGlassPresets() { const host = $("glassPresets"); host.innerHTML = MATERIAL_ORDER.map(key => { const p = MATERIAL_PRESETS[key], active = currentMaterialBase() === key; return `<button class="glass-preset material-${key} ${active ? "active" : ""}" type="button" data-preset="${key}" aria-pressed="${active}" style="${materialSwatchStyle(p)}"><span class="preset-swatch" aria-hidden="true"><i></i><b></b></span><span>${p.label}</span><small>${p.description}</small></button>`; }).join(""); host.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => { beginInteraction(); applyMaterial(btn.dataset.preset, "manual"); syncUi(); scheduleRender(); endInteraction(); })); }
function renderLayoutPresets() { const host = $("layoutPresets"); if (!host) return; host.innerHTML = Object.values(LAYOUT_PRESETS).map(p => `<button type="button" class="layout-preset ${state.layoutPreset === p.id ? "active" : ""}" data-layout="${p.id}" aria-pressed="${state.layoutPreset === p.id}">${p.label}</button>`).join(""); host.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => { beginInteraction(); const next = btn.dataset.layout; state.layoutPreset = next; if (next === "certificate" && !state.customFontName && state.fontFamily === "system") state.fontFamily = "song"; syncUi(); scheduleRender(); endInteraction(); })); }
function renderThemeChoices() { const host = $("themePalette"); if (!state.themes.length) { host.innerHTML = `<p class="theme-empty">上传底图后，将自动生成可读性更稳妥的配色。</p>`; return; } host.innerHTML = state.themes.map((theme,i) => `<button type="button" class="theme-option ${state.selectedTheme===i?"selected":""}" data-index="${i}" aria-label="应用${theme.name}"><span class="theme-swatches"><i style="background:${theme.accentColor}"></i><i style="background:${theme.textColor}"></i></span><span>${theme.name}</span><small>${theme.accentColor} / ${theme.textColor}</small></button>`).join(""); host.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => { beginInteraction(); const i=Number(btn.dataset.index), t=state.themes[i]; state.accentColor=t.accentColor; state.textColor=t.textColor; state.selectedTheme=i; markSmartManual(); syncUi(); scheduleRender(); endInteraction(); })); }
function extractThemeColors(dataUrl) { const img = new Image(); img.onload = () => { const canvas=document.createElement("canvas"), ctx=canvas.getContext("2d",{willReadFrequently:true}); canvas.width=canvas.height=72; ctx.drawImage(img,0,0,72,72); const d=ctx.getImageData(0,0,72,72).data; const bins=new Map(); for(let i=0;i<d.length;i+=32){if(d[i+3]<160)continue;const r=d[i],g=d[i+1],b=d[i+2];const k=[r,g,b].map(v=>Math.floor(v/32)*32).join(",");const v=bins.get(k)||{r:0,g:0,b:0,c:0};v.r+=r;v.g+=g;v.b+=b;v.c++;bins.set(k,v);} const colors=[...bins.values()].sort((a,b)=>b.c-a.c).slice(0,4).map(v=>({r:v.r/v.c,g:v.g/v.c,b:v.b/v.c})); const textFor=c=>luminance(c)>.48?"#111318":"#FFFFFF"; state.themes=colors.map((c,i)=>({name:["主色平衡","柔和对比","明亮强调","深色强调"][i],accentColor:rgbToHex(c),textColor:textFor(c)})); renderThemeChoices(); }; img.src=dataUrl; }

function updateAssetCards() { const pairs=[ ["background","backgroundThumb","backgroundFileName","backgroundUploadTitle"], ["logo","logoThumb","logoFileName","logoUploadTitle"] ]; pairs.forEach(([kind,thumb,name,title])=>{const data=state[kind]; $(thumb).style.backgroundImage=data?`url("${data}")`:""; $(name).textContent=data?(kind==="background"?"已载入底图":"已载入 Logo"):(kind==="background"?"PNG、JPEG、WebP，最大 20MB":"PNG、JPEG、WebP，最大 20MB"); $(title).textContent=data?(kind==="background"?"当前底图":"当前 Logo"):(kind==="background"?"上传底图":"上传 Logo");}); $("fontStatus").textContent=state.customFontFileName?`${state.customFontFileName} 已加载`:"未上传"; }
function validateImage(file) { if (!file) return ""; if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return "只支持 PNG、JPEG 或 WebP 图片。"; if (file.size > MAX_FILE_SIZE) return "图片超过 20MB，请压缩后重试。"; return ""; }
async function readAsset(file, kind) { const error=$(kind==="background"?"backgroundError":"logoError"), msg=validateImage(file); error.textContent=msg; if(msg)return; try { const url=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsDataURL(file);}); const probe=new Image(); probe.src=url; await probe.decode(); beginInteraction(); state.editorTarget=kind; state[kind]=url; if(kind==="background"){extractThemeColors(url);state.backgroundScale=100;state.backgroundX=0;state.backgroundY=0;invalidateSmartCache();} else {state.logoScale=120;state.logoX=0;state.logoY=0;} syncUi(); scheduleRender(); endInteraction(); } catch (_) { error.textContent="图片无法解码，请更换一个有效文件。"; } }
function setupUpload(kind) { const card=$(kind==="background"?"backgroundUploadCard":"logoUploadCard"), input=$(kind==="background"?"backgroundInput":"logoInput"), replace=$(kind==="background"?"replaceBackground":"replaceLogo"), clear=$(kind==="background"?"clearBackground":"clearLogo"); const trigger=()=>{state.editorTarget=kind; input.click();}; card.addEventListener("click",trigger); card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();trigger();}}); replace.addEventListener("click",trigger); input.addEventListener("change",e=>readAsset(e.target.files[0],kind)); ["dragenter","dragover"].forEach(t=>card.addEventListener(t,e=>{e.preventDefault();state.editorTarget=kind;card.classList.add("drag-over");})); ["dragleave","drop"].forEach(t=>card.addEventListener(t,e=>{e.preventDefault();card.classList.remove("drag-over");})); card.addEventListener("drop",e=>readAsset(e.dataTransfer.files[0],kind)); clear.addEventListener("click",()=>{beginInteraction();state.editorTarget=kind;state[kind]="";if(kind==="background"){state.themes=[];state.selectedTheme=-1;invalidateSmartCache();}input.value="";syncUi();scheduleRender();endInteraction();}); }
async function registerCustomFont(show = true) { if (!state.customFontData || !state.customFontName) return; const face=new FontFace(state.customFontName,`url(${state.customFontData})`); try { await face.load(); document.fonts.add(face); if(show)showToast("自定义字体已加载"); } catch (_) { $("fontStatus").textContent="字体加载失败"; showToast("字体加载失败，无法可靠导出。","error",true); } }
function setupFontUpload() { $("fontInput").addEventListener("change", async e=>{const file=e.target.files[0];if(!file)return; if(file.size>MAX_FILE_SIZE){$("fontStatus").textContent="字体超过 20MB";return;} const ext=(file.name.split(".").pop()||"ttf").toLowerCase(); const fmt={ttf:"truetype",otf:"opentype",woff:"woff",woff2:"woff2"}[ext]; if(!fmt){$("fontStatus").textContent="不支持该字体格式";return;} const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsDataURL(file);}); beginInteraction();state.customFontName=`UserFont${Date.now()}`;state.customFontData=data;state.customFontFormat=fmt;state.customFontFileName=file.name;await registerCustomFont();scheduleRender();endInteraction();}); }

function renderSelection(card, logoBox) { const layer=$("selectionLayer"), target=state.editorTarget; if (!target) { layer.innerHTML=""; return; } const host=$("canvasHost"), hostRect=host.getBoundingClientRect(), svgRect=svg.getBoundingClientRect(); const chosen=target==="logo"?logoBox:{x:0,y:0,width:state.width,height:state.height}; const left=(svgRect.left-hostRect.left)+chosen.x/state.width*svgRect.width, top=(svgRect.top-hostRect.top)+chosen.y/state.height*svgRect.height, w=chosen.width/state.width*svgRect.width,h=chosen.height/state.height*svgRect.height; layer.innerHTML=`<div class="selection-box" data-label="${target==="logo"?"Logo":"底图"}" style="left:${left}px;top:${top}px;width:${w}px;height:${h}px"></div>`; }
function logicalPoint(event) { const rect=svg.getBoundingClientRect(); return { x:(event.clientX-rect.left)/rect.width*state.width, y:(event.clientY-rect.top)/rect.height*state.height }; }
function hitLogo(p, logoBox) { return p.x>=logoBox.x&&p.x<=logoBox.x+logoBox.width&&p.y>=logoBox.y&&p.y<=logoBox.y+logoBox.height; }
function clearEditorTarget() { if (!state.editorTarget) return; state.editorTarget=null; scheduleRender(); }
function setupCanvasEditing() { const stage=$("previewStage"); stage.addEventListener("pointerdown",e=>{if(e.target!==svg && !svg.contains(e.target)){clearEditorTarget();return;}const p=logicalPoint(e),{card,logoBox}=layoutGeometry();state.editorTarget=hitLogo(p,logoBox)?"logo":"background";pointerState={id:e.pointerId,start:p,target:state.editorTarget,original:{x:state[`${state.editorTarget}X`],y:state[`${state.editorTarget}Y`]}};beginInteraction();stage.setPointerCapture(e.pointerId);renderSelection(card,logoBox);e.preventDefault();}); stage.addEventListener("pointermove",e=>{if(!pointerState)return;const p=logicalPoint(e),dx=p.x-pointerState.start.x,dy=p.y-pointerState.start.y,key=pointerState.target; const scale=state[`${key}Scale`],den=Math.max(1,(scale/100-1)); state[`${key}X`]=clamp(pointerState.original.x+dx/(state.width*.5*den)*100,-100,100);state[`${key}Y`]=clamp(pointerState.original.y+dy/(state.height*.5*den)*100,-100,100);syncRange(`${key}X`);syncRange(`${key}Y`);if(key==="background")invalidateSmartCache();scheduleRender();e.preventDefault();}); const end=()=>{if(!pointerState)return;pointerState=null;endInteraction();};stage.addEventListener("pointerup",end);stage.addEventListener("pointercancel",end);stage.addEventListener("wheel",e=>{const key=state.editorTarget;if(!key)return;beginInteraction();state[`${key}Scale`]=clamp(state[`${key}Scale`]+(e.deltaY<0?4:-4),RANGE_CONFIG[`${key}Scale`][0],RANGE_CONFIG[`${key}Scale`][1]);syncRange(`${key}Scale`);if(key==="background")invalidateSmartCache();scheduleRender();endInteraction();e.preventDefault();},{passive:false}); window.addEventListener("resize",()=>scheduleRender()); }
function assetQuickActions() { document.querySelectorAll(".quick-actions button").forEach(btn=>btn.addEventListener("click",()=>{const asset=btn.closest(".quick-actions").dataset.asset,action=btn.dataset.action;state.editorTarget=asset;beginInteraction();if(action==="fit")state[`${asset}Scale`]=100;if(action==="fill")state[`${asset}Scale`]=asset==="background"?130:145;if(action==="center"){state[`${asset}X`]=0;state[`${asset}Y`]=0;}if(action==="reset"){["Scale","X","Y"].forEach(k=>state[`${asset}${k}`]=DEFAULTS[`${asset}${k}`]);} if(asset==="background")invalidateSmartCache();["Scale","X","Y"].forEach(k=>syncRange(`${asset}${k}`));scheduleRender();endInteraction();})); }

function rgbToHsl({ r, g, b }) { r/=255; g/=255; b/=255; const max=Math.max(r,g,b), min=Math.min(r,g,b); let h=0, s=0, l=(max+min)/2; if(max!==min){const d=max-min; s=l>.5?d/(2-max-min):d/(max+min); h=max===r?(g-b)/d+(g<b?6:0):max===g?(b-r)/d+2:(r-g)/d+4; h*=60;} return { h, s, l }; }
function hslToRgb({ h, s, l }) { const c=(1-Math.abs(2*l-1))*s, x=c*(1-Math.abs((h/60)%2-1)), m=l-c/2; let r=0,g=0,b=0; if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;} return { r:(r+m)*255, g:(g+m)*255, b:(b+m)*255 }; }
async function imageFromSource(src) { const img = new Image(); img.src = src; await img.decode(); return img; }
function drawBackgroundSample(ctx, img, w, h) { const p = getImagePlacement({x:0,y:0,width:state.width,height:state.height}, state.backgroundScale, state.backgroundX, state.backgroundY); ctx.drawImage(img, p.x / state.width * w, p.y / state.height * h, p.width / state.width * w, p.height / state.height * h); }
function analyzePixels(data) {
  const lums=[], sats=[], bins=new Map(); let rSum=0,gSum=0,bSum=0,count=0;
  for(let i=0;i<data.length;i+=4){ if(data[i+3]<20)continue; const rgb={r:data[i],g:data[i+1],b:data[i+2]}, lum=luminance(rgb), hsl=rgbToHsl(rgb); lums.push(lum); sats.push(hsl.s); rSum+=rgb.r; gSum+=rgb.g; bSum+=rgb.b; count++; if(hsl.l>.16&&hsl.l<.86&&hsl.s>.10){const key=[Math.floor(rgb.r/32)*32,Math.floor(rgb.g/32)*32,Math.floor(rgb.b/32)*32].join(","); const v=bins.get(key)||{r:0,g:0,b:0,c:0}; v.r+=rgb.r; v.g+=rgb.g; v.b+=rgb.b; v.c++; bins.set(key,v);} }
  lums.sort((a,b)=>a-b); const avgLum=lums.reduce((a,b)=>a+b,0)/Math.max(1,lums.length), avgSat=sats.reduce((a,b)=>a+b,0)/Math.max(1,sats.length); const std=Math.sqrt(lums.reduce((a,b)=>a+Math.pow(b-avgLum,2),0)/Math.max(1,lums.length)); const colors=[...bins.values()].sort((a,b)=>b.c-a.c).slice(0,2).map(v=>({r:v.r/v.c,g:v.g/v.c,b:v.b/v.c})); return { avgLum, medianLum:lums[Math.floor(lums.length/2)]||0, stdLum:std, avgSat, p10:lums[Math.floor(lums.length*.10)]||0, p90:lums[Math.floor(lums.length*.90)]||0, avgRgb:{r:rSum/Math.max(1,count),g:gSum/Math.max(1,count),b:bSum/Math.max(1,count)}, primary:colors[0]||{r:180,g:195,b:225}, secondary:colors[1]||colors[0]||{r:150,g:165,b:190} };
}
async function analyzeBackground() {
  const key = [state.background ? `${state.background.length}:${state.background.slice(0,64)}` : "default", state.backgroundScale, state.backgroundX, state.backgroundY, state.layoutPreset].join("|");
  if (smartCache?.key === key) return smartCache.result;
  const src = state.background || buildDefaultBackground(); const img = await imageFromSource(src); const w=128,h=90, canvas=document.createElement("canvas"), ctx=canvas.getContext("2d",{willReadFrequently:true}); canvas.width=w; canvas.height=h; drawBackgroundSample(ctx,img,w,h);
  const { card, logoBox } = layoutGeometry(), textArea = textAreaGeometry(card, logoBox);
  const sampleArea = area => { const x=clamp(Math.round(area.x/state.width*w),0,w-1), y=clamp(Math.round(area.y/state.height*h),0,h-1), aw=clamp(Math.round(area.width/state.width*w),1,w-x), ah=clamp(Math.round(area.height/state.height*h),1,h-y); return analyzePixels(ctx.getImageData(x,y,aw,ah).data); };
  const result = { full: sampleArea({x:0,y:0,width:state.width,height:state.height}), card: sampleArea(card), text: sampleArea(textArea), logo: sampleArea(logoBox), usedDefault: !state.background };
  smartCache = { key, result }; return result;
}
function expectedLum(region, materialKey) { const p=MATERIAL_PRESETS[materialKey], mixed=mixRgb(region.avgRgb, hexToRgb(p.tintColor), p.tintOpacity); return luminance(mixed); }
function bestTextColor(region, materialKey) { const bgLum = expectedLum(region, materialKey); const candidates = ["#FFFFFF", "#F7F8FA", "#1D222B", "#111318"]; return candidates.map(color=>({color,ratio:contrastRatio(luminance(hexToRgb(color)), bgLum)})).sort((a,b)=>b.ratio-a.ratio)[0]; }
function safeAccent(analysis, materialKey, textColor) { const fallback = MATERIAL_PRESETS[materialKey].recommendedAccentColor; for (const c of [analysis.full.primary, analysis.full.secondary, analysis.card.primary, analysis.text.primary]) { const hsl = rgbToHsl(c); const textDistance = Math.abs(luminance(c) - luminance(hexToRgb(textColor))); if (hsl.s < .10 || hsl.l < .18 || hsl.l > .88 || textDistance < .10) continue; hsl.s = clamp(hsl.s, SMART_THRESHOLDS.minAccentSat, SMART_THRESHOLDS.maxAccentSat); hsl.l = clamp(hsl.l, SMART_THRESHOLDS.minAccentLum, SMART_THRESHOLDS.maxAccentLum); return rgbToHex(hslToRgb(hsl)); } return fallback; }
function chooseSmartMaterial(analysis) { const t=analysis.text, f=analysis.full, hsl=rgbToHsl(f.primary); if (t.medianLum > SMART_THRESHOLDS.veryBright) return { key:"obsidian", reason:"文字区域较亮，已增强整体玻璃对比度。" }; if (f.avgSat > SMART_THRESHOLDS.highSaturation || t.stdLum > SMART_THRESHOLDS.complexStd) return { key:"silver", reason:"底图色彩较复杂，已降低整体饱和度。" }; if (t.medianLum < SMART_THRESHOLDS.dark && f.avgSat < SMART_THRESHOLDS.lowSaturation) { const glacier = bestTextColor(t,"glacier"), standard = bestTextColor(t,"standard"); return glacier.ratio >= standard.ratio ? { key:"glacier", reason:"文字区域偏暗，已使用浅色整体玻璃。" } : { key:"standard", reason:"底图较暗，已保持克制透明材质。" }; } if (hsl.h >= SMART_THRESHOLDS.warmHueMin && hsl.h <= SMART_THRESHOLDS.warmHueMax && f.avgLum > .32 && f.avgLum < .66 && bestTextColor(t,"champagne").ratio >= 3) return { key:"champagne", reason:"底图偏暖，已应用温润典藏材质。" }; if (((hsl.h >= SMART_THRESHOLDS.cyanHueMin && hsl.h <= SMART_THRESHOLDS.cyanHueMax) || (hsl.h >= SMART_THRESHOLDS.purpleHueMin && hsl.h <= SMART_THRESHOLDS.purpleHueMax)) && f.avgSat > .22) return { key:"aurora", reason:"底图有冷色特征，已加入克制反射。" }; return { key:"standard", reason:"未发现强特征，已使用通用标准材质。" }; }
async function smartFitBackground() { if (smartBusy) return; const btn=$("smartFit"); smartBusy=true; btn.disabled=true; btn.dataset.label=btn.textContent; btn.textContent="正在分析…"; try { beginInteraction(); const analysis = await analyzeBackground(); const chosen = chooseSmartMaterial(analysis); suppressSmartManual = true; applyMaterial(chosen.key, "smart"); const text = bestTextColor(analysis.text, chosen.key); state.textColor = text.color; state.accentColor = safeAccent(analysis, chosen.key, state.textColor); state.smartSummary = `已应用：${MATERIAL_PRESETS[chosen.key].label} · ${luminance(hexToRgb(state.textColor)) > .5 ? "浅色文字" : "深色文字"} · ${state.accentColor}`; if (analysis.usedDefault) showToast("已根据默认背景生成推荐方案"); showToast(chosen.reason); suppressSmartManual = false; syncUi(); scheduleRender(); endInteraction(); } catch (err) { suppressSmartManual = true; applyMaterial("standard", "smart"); state.smartSummary = "分析失败，已回退标准材质"; suppressSmartManual = false; syncUi(); scheduleRender(); endInteraction(); showToast("智能适配失败，已回退标准材质。", "error", true); } finally { smartBusy=false; btn.disabled=false; btn.textContent=btn.dataset.label||"智能适配底图"; } }

function crc32(bytes) { let c=0xffffffff; for(const b of bytes){c^=b;for(let k=0;k<8;k++)c=c&1?(c>>>1)^0xedb88320:c>>>1;} return (c^0xffffffff)>>>0; }
function withPngDpi(blob) { return blob.arrayBuffer().then(buffer=>{const data=new Uint8Array(buffer), physData=new Uint8Array(9), view=new DataView(physData.buffer);view.setUint32(0,11811);view.setUint32(4,11811);physData[8]=1;const type=new TextEncoder().encode("pHYs"),chunk=new Uint8Array(4+4+9+4),v=new DataView(chunk.buffer);v.setUint32(0,9);chunk.set(type,4);chunk.set(physData,8);v.setUint32(17,crc32(chunk.slice(4,17)));const result=new Uint8Array(data.length+chunk.length);result.set(data.slice(0,33),0);result.set(chunk,33);result.set(data.slice(33),33+chunk.length);return new Blob([result],{type:"image/png"});}); }
function serializeSvg() { return new XMLSerializer().serializeToString(svg); }
function download(filename, blob) { const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000); }
async function ensureResources() { if(document.fonts?.ready)await document.fonts.ready; const urls=[state.background,state.logo].filter(Boolean); await Promise.all(urls.map(src=>{const img=new Image();img.src=src;return img.decode().catch(()=>{});})); }
async function downloadPng() { if(exportBusy)return; exportBusy=true; const buttons=[$("downloadPng"),$("headerExportPng"),$("mobileExport")].filter(Boolean);buttons.forEach(b=>{b.disabled=true;b.dataset.label=b.textContent;b.textContent="正在导出…";});try{await ensureResources();const markup=serializeSvg(),url=URL.createObjectURL(new Blob([markup],{type:"image/svg+xml;charset=utf-8"}));const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error("SVG 图片加载失败"));img.src=url;});const canvas=document.createElement("canvas");canvas.width=state.width;canvas.height=state.height;const ctx=canvas.getContext("2d");if(!ctx)throw new Error("浏览器无法创建导出画布");ctx.drawImage(img,0,0);URL.revokeObjectURL(url);const raw=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("PNG 编码失败")),"image/png",1));const finalBlob=await withPngDpi(raw);download(`${safeFilename(state.mainTitle)}-${state.width}x${state.height}-${timestamp()}.png`,finalBlob);showToast("PNG 已导出，已写入 300dpi 元数据。");}catch(err){showToast(`导出失败：${err.message||"未知错误"}`,"error",true);}finally{exportBusy=false;buttons.forEach(b=>{b.disabled=false;b.textContent=b.dataset.label||"导出 PNG";});}}
async function downloadSvg() { try { await ensureResources(); download(`${safeFilename(state.mainTitle)}-${state.width}x${state.height}-${timestamp()}.svg`,new Blob([serializeSvg()],{type:"image/svg+xml;charset=utf-8"}));showToast("SVG 已导出。"); } catch(err){showToast(`导出失败：${err.message||"未知错误"}`,"error",true);} }

function resetAdjustments() { beginInteraction(); Object.keys(DEFAULTS).forEach(k=>{if(k!=="mainTitle"&&k!=="subTitle"&&k!=="description")state[k]=DEFAULTS[k];}); syncUi(); scheduleRender(); endInteraction(); }
function applyExampleReset() { beginInteraction(); Object.assign(state,{...DEFAULTS,background:"",logo:"",customFontName:"",customFontData:"",customFontFormat:"",customFontFileName:"",themes:[],selectedTheme:-1}); syncUi(); scheduleRender(); endInteraction(); }
function resetExample() { if(!confirm("恢复示例会清空已上传的底图、Logo 和自定义字体，是否继续？")) return; applyExampleReset(); }
function newArtwork(){ if(!confirm("新建作品会清空当前素材与内容，是否继续？")) return; applyExampleReset(); showToast("已新建空白作品。"); }
function bindBasicInputs(){["mainTitle","subTitle","description"].forEach(k=>$(k).addEventListener("focus",beginInteraction));["mainTitle","subTitle","description"].forEach(k=>$(k).addEventListener("input",e=>{state[k]=e.target.value;scheduleRender();persist();}));["mainTitle","subTitle","description"].forEach(k=>$(k).addEventListener("change",endInteraction));["accentColor","textColor"].forEach(k=>$(k).addEventListener("input",e=>{beginInteraction();state[k]=e.target.value;state.selectedTheme=-1;markSmartManual();syncUi();scheduleRender();endInteraction();}));$("fontFamily").addEventListener("change",e=>{beginInteraction();state.fontFamily=e.target.value;scheduleRender();endInteraction();});$("logoStyle").addEventListener("change",e=>{beginInteraction();state.logoStyle=e.target.value;scheduleRender();endInteraction();});}
function setupClipboard(){window.addEventListener("paste",e=>{const item=[...e.clipboardData.items].find(i=>i.type.startsWith("image/"));if(!item)return;readAsset(item.getAsFile(),state.editorTarget==="logo"?"logo":"background");showToast(`已粘贴到${state.editorTarget==="logo"?" Logo":"底图"}`);});}
function setupMobile(){document.querySelectorAll("[data-mobile-tab]").forEach(b=>b.addEventListener("click",()=>{const tab=b.dataset.mobileTab;document.body.classList.toggle("mobile-preview",tab==="preview");document.body.classList.toggle("mobile-editor",tab==="editor");document.querySelectorAll("[data-mobile-tab]").forEach(x=>{x.classList.toggle("active",x===b);x.setAttribute("aria-selected",x===b?"true":"false");});}));$("mobilePreview").addEventListener("click",()=>document.querySelector('[data-mobile-tab="preview"]').click());}
function bindShortcuts(){window.addEventListener("keydown",e=>{if(!(e.metaKey||e.ctrlKey))return;if(e.key.toLowerCase()==="z"){e.preventDefault();e.shiftKey?redo():undo();}else if(e.key.toLowerCase()==="y"){e.preventDefault();redo();}});}
function init(){setupRanges();setupUpload("background");setupUpload("logo");setupFontUpload();assetQuickActions();bindBasicInputs();setupCanvasEditing();setupClipboard();setupMobile();bindShortcuts();$("downloadPng").addEventListener("click",downloadPng);$("headerExportPng").addEventListener("click",downloadPng);$("mobileExport").addEventListener("click",downloadPng);$("downloadSvg").addEventListener("click",downloadSvg);$("undoButton").addEventListener("click",undo);$("redoButton").addEventListener("click",redo);$("resetAdjustments").addEventListener("click",resetAdjustments);$("resetDemo").addEventListener("click",resetExample);$("newArtwork").addEventListener("click",newArtwork);$("smartFit").addEventListener("click",smartFitBackground);syncUi();renderSvg();recordHistory();restorePersisted().then(()=>{syncUi();scheduleRender();recordHistory();});}
init();
