const svg = document.getElementById("achievementSvg");
const $ = (id) => document.getElementById(id);
const CANVAS = { width: 1932, height: 1360 };
const STORAGE_KEY = "achievement-unlock-editor-v6";
const LEGACY_STORAGE_KEYS = ["achievement-unlock-editor-v5", "achievement-unlock-editor-v4", "achievement-unlock-editor-v3"];
const DB_NAME = "achievement-unlock-assets";
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_WORK_IMAGE_EDGE = 4096;
const LAYOUT_STATE_VERSION = 2;
const ALPHA_SCAN_EDGE = 256;
const ALPHA_MIN = 16;
const LOGO_CROP_PADDING = .065;
const LOGO_OFFSET_RANGE = { x: 300, y: 190 };

const FONT_STACKS = {
  system: "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'PingFang SC', 'Segoe UI', 'Microsoft YaHei', sans-serif",
  song: "'Songti SC', 'STSong', 'SimSun', serif",
  kai: "'Kaiti SC', 'KaiTi', 'STKaiti', serif",
  hei: "'Source Han Sans SC', 'Noto Sans CJK SC', 'PingFang SC', 'Microsoft YaHei', sans-serif"
};
const FONT_KEYS = new Set(["follow", "system", "song", "kai", "hei", "custom"]);

const TYPOGRAPHY_PRESETS = {
  system: {
    subtitle: { fontSize: 29, fontWeight: 600, letterSpacing: 4, opacity: .88, color: "subtitle", shadowOpacity: 0, shadowBlur: 0, shadowOffsetY: 0, lineHeight: 1 },
    title: { fontSize: 76, minFontSize: 54, fontWeight: 600, letterSpacing: -.5, opacity: .94, color: "title", shadowColor: "#000000", shadowOpacity: .04, shadowBlur: 1.2, shadowOffsetY: 1, lineHeight: 1.08 },
    description: { fontSize: 34, fontWeight: 400, letterSpacing: 0, opacity: .80, color: "body", shadowColor: "#000000", shadowOpacity: .04, shadowBlur: 1, shadowOffsetY: 1, lineHeight: 54 },
    divider: { width: 260, opacity: .28 }
  },
  certificate: {
    subtitle: { fontSize: 26, fontWeight: 600, letterSpacing: 8, opacity: .88, color: "subtitle", shadowOpacity: 0, shadowBlur: 0, shadowOffsetY: 0, lineHeight: 1 },
    title: { fontSize: 72, minFontSize: 52, fontWeight: 600, letterSpacing: 1, opacity: .94, color: "title", shadowColor: "#000000", shadowOpacity: .04, shadowBlur: 1.25, shadowOffsetY: 1, lineHeight: 1.12 },
    description: { fontSize: 30, fontWeight: 400, letterSpacing: 0, opacity: .80, color: "body", shadowColor: "#000000", shadowOpacity: .04, shadowBlur: 1, shadowOffsetY: 1, lineHeight: 52 },
    divider: { width: 240, opacity: .20 }
  }
};

const MATERIAL_PRESETS = {
  standard: { id: "standard", label: "标准", description: "清透均衡", blur: 26, saturation: 1.07, contrast: 1.03, tintColor: "#FFFFFF", tintOpacity: .12, secondaryTintColor: "#EBF0F8", secondaryTintOpacity: .05, borderColor: "#FFFFFF", borderOpacity: .40, innerHighlightColor: "#FFFFFF", innerHighlightOpacity: .22, bottomShadeOpacity: .12, shadowColor: "#000000", contactShadowOpacity: .14, ambientShadowOpacity: .21, reflectionAColor: "#FFFFFF", reflectionAOpacity: .10, reflectionBColor: "#DCE7FF", reflectionBOpacity: .04, dispersionAmount: 0, dispersionOpacity: 0, recommendedTextColor: "#FFFFFF", recommendedAccentColor: "#F5F7FF", glassDepth: 58, cardOpacity: 22, glassDispersion: 0, typographyRecommendation: { titleFontFamily: "system", bodyFontFamily: "system", titleWeight: 600, bodyWeight: 400, subtitleShadow: 0, titleShadow: .14, descriptionShadow: .11 } },
  glacier: { id: "glacier", label: "冰川白", description: "柔和冰霜", blur: 32, saturation: .86, contrast: 1.01, tintColor: "#F2F6FA", tintOpacity: .25, secondaryTintColor: "#DDE8F2", secondaryTintOpacity: .07, borderColor: "#FFFFFF", borderOpacity: .48, innerHighlightColor: "#FFFFFF", innerHighlightOpacity: .30, bottomShadeOpacity: .06, shadowColor: "#253241", contactShadowOpacity: .08, ambientShadowOpacity: .14, reflectionAColor: "#FFFFFF", reflectionAOpacity: .08, reflectionBColor: "#BFD6EA", reflectionBOpacity: .045, dispersionAmount: 0, dispersionOpacity: 0, recommendedTextColor: "#17202B", recommendedAccentColor: "#66839E", glassDepth: 78, cardOpacity: 43, glassDispersion: 0, typographyRecommendation: { titleFontFamily: "system", bodyFontFamily: "system", titleWeight: 600, bodyWeight: 400, subtitleShadow: 0, titleShadow: 0, descriptionShadow: .05 } },
  obsidian: { id: "obsidian", label: "黑曜石", description: "深邃烟熏", blur: 26, saturation: .88, contrast: 1.04, tintColor: "#090E16", tintOpacity: .34, secondaryTintColor: "#182231", secondaryTintOpacity: .08, borderColor: "#DCE7F2", borderOpacity: .22, innerHighlightColor: "#EAF4FF", innerHighlightOpacity: .15, bottomShadeOpacity: .16, shadowColor: "#000000", contactShadowOpacity: .20, ambientShadowOpacity: .30, reflectionAColor: "#B9D4EE", reflectionAOpacity: .035, reflectionBColor: "#6B88A8", reflectionBOpacity: .025, dispersionAmount: 0, dispersionOpacity: 0, recommendedTextColor: "#FFFFFF", recommendedAccentColor: "#B9D4EE", glassDepth: 58, cardOpacity: 60, glassDispersion: 0, typographyRecommendation: { titleFontFamily: "system", bodyFontFamily: "system", titleWeight: 600, bodyWeight: 400, subtitleShadow: 0, titleShadow: .14, descriptionShadow: .10 } },
  champagne: { id: "champagne", label: "香槟金", description: "温润典藏", blur: 28, saturation: .98, contrast: 1.02, tintColor: "#E6D3B7", tintOpacity: .17, secondaryTintColor: "#B99464", secondaryTintOpacity: .055, borderColor: "#F6DFC0", borderOpacity: .40, innerHighlightColor: "#FFF8EC", innerHighlightOpacity: .24, bottomShadeOpacity: .10, shadowColor: "#24190F", contactShadowOpacity: .13, ambientShadowOpacity: .22, reflectionAColor: "#FFF8EC", reflectionAOpacity: .06, reflectionBColor: "#C89D68", reflectionBOpacity: .045, dispersionAmount: 0, dispersionOpacity: 0, recommendedTextColor: "#FFF9F0", recommendedAccentColor: "#E7C58E", glassDepth: 66, cardOpacity: 32, glassDispersion: 0, typographyRecommendation: { titleFontFamily: "song", bodyFontFamily: "system", titleWeight: 600, bodyWeight: 400, subtitleShadow: 0, titleShadow: .10, descriptionShadow: .08 } },
  aurora: { id: "aurora", label: "极光", description: "冷色反射", blur: 27, saturation: 1.12, contrast: 1.02, tintColor: "#F4F7FB", tintOpacity: .12, secondaryTintColor: "#EAF2FF", secondaryTintOpacity: .04, borderColor: "#FFFFFF", borderOpacity: .34, innerHighlightColor: "#FFFFFF", innerHighlightOpacity: .22, bottomShadeOpacity: .10, shadowColor: "#07111C", contactShadowOpacity: .13, ambientShadowOpacity: .22, reflectionAColor: "#7DE4E4", reflectionAOpacity: .075, reflectionBColor: "#A997FF", reflectionBOpacity: .07, dispersionAmount: .12, dispersionOpacity: .025, recommendedTextColor: "#FFFFFF", recommendedAccentColor: "#B8C6FF", glassDepth: 62, cardOpacity: 23, glassDispersion: 0, typographyRecommendation: { titleFontFamily: "system", bodyFontFamily: "system", titleWeight: 600, bodyWeight: 400, subtitleShadow: 0, titleShadow: .12, descriptionShadow: .10 } },
  prism: { id: "prism", label: "棱镜", description: "微光色散", blur: 22, saturation: 1.05, contrast: 1.04, tintColor: "#FFFFFF", tintOpacity: .10, secondaryTintColor: "#F4F7FF", secondaryTintOpacity: .035, borderColor: "#FFFFFF", borderOpacity: .43, innerHighlightColor: "#FFFFFF", innerHighlightOpacity: .24, bottomShadeOpacity: .08, shadowColor: "#07111C", contactShadowOpacity: .10, ambientShadowOpacity: .17, reflectionAColor: "#FFFFFF", reflectionAOpacity: .07, reflectionBColor: "#DDE7FF", reflectionBOpacity: .04, dispersionAmount: .58, dispersionOpacity: .065, recommendedTextColor: "#FFFFFF", recommendedAccentColor: "#DDE7FF", glassDepth: 42, cardOpacity: 18, glassDispersion: 12, typographyRecommendation: { titleFontFamily: "hei", bodyFontFamily: "system", titleWeight: 560, bodyWeight: 400, subtitleShadow: 0, titleShadow: .10, descriptionShadow: .08, titleLetterSpacing: -1 } },
  silver: { id: "silver", label: "雾银", description: "低饱和磨砂", blur: 33, saturation: .60, contrast: 1.03, tintColor: "#D8DEE6", tintOpacity: .23, secondaryTintColor: "#AEB7C2", secondaryTintOpacity: .07, borderColor: "#EEF1F5", borderOpacity: .36, innerHighlightColor: "#FFFFFF", innerHighlightOpacity: .20, bottomShadeOpacity: .10, shadowColor: "#111820", contactShadowOpacity: .11, ambientShadowOpacity: .18, reflectionAColor: "#FFFFFF", reflectionAOpacity: .055, reflectionBColor: "#AEB7C2", reflectionBOpacity: .04, dispersionAmount: 0, dispersionOpacity: 0, recommendedTextColor: "#1D222B", recommendedAccentColor: "#8B99AA", glassDepth: 82, cardOpacity: 39, glassDispersion: 0, typographyRecommendation: { titleFontFamily: "hei", bodyFontFamily: "system", titleWeight: 560, bodyWeight: 400, subtitleShadow: 0, titleShadow: 0, descriptionShadow: .05 } }
};
const MATERIAL_ORDER = ["standard", "glacier", "obsidian", "champagne", "aurora", "prism", "silver"];
const LEGACY_MATERIAL_MAP = { clear: "glacier", dark: "obsidian", standard: "standard" };
const LAYOUT_PRESETS = { system: { id: "system", label: "系统通知" }, certificate: { id: "certificate", label: "典藏证书" } };
const SMART_THRESHOLDS = {
  veryBright: .70, dark: .28, lowSaturation: .24, highSaturation: .46, complexStd: .20,
  warmHueMin: 18, warmHueMax: 62, cyanHueMin: 165, cyanHueMax: 205, purpleHueMin: 245, purpleHueMax: 292,
  warmDominance: .28, coldDominance: .42, textureComplexity: .18, accentContrast: 3,
  minAccentChroma: .045, maxAccentChroma: .18, minAccentLum: .48, maxAccentLum: .86,
  warmSaturation: .30, warmHighlightStd: .12
};
const AUTO_LAYOUT = {
  system: {
    0: { height: 510, radius: 84, subtitleTitleVisualGap: 24, titleDividerVisualGap: 0, dividerDescriptionVisualGap: 0, descriptionLineBaselineGap: 54, descFontSize: 34, descOpacity: .80, dividerWidth: 0, logoOffset: 0, textOffset: 0, logoTarget: 236, logoContainerSize: 300 },
    1: { height: 570, radius: 84, subtitleTitleVisualGap: 24, titleDividerVisualGap: 48, dividerDescriptionVisualGap: 44, descriptionLineBaselineGap: 54, descFontSize: 34, descOpacity: .80, dividerWidth: 260, logoOffset: 0, textOffset: 8, logoTarget: 246, logoContainerSize: 312 },
    2: { height: 630, radius: 88, subtitleTitleVisualGap: 24, titleDividerVisualGap: 54, dividerDescriptionVisualGap: 50, descriptionLineBaselineGap: 54, descFontSize: 32, descOpacity: .76, dividerWidth: 300, logoOffset: 0, textOffset: 4, logoTarget: 270, logoContainerSize: 340 },
    3: { height: 700, radius: 92, subtitleTitleVisualGap: 24, titleDividerVisualGap: 60, dividerDescriptionVisualGap: 56, descriptionLineBaselineGap: 54, descFontSize: 32, descOpacity: .76, dividerWidth: 320, logoOffset: 0, textOffset: 0, logoTarget: 290, logoContainerSize: 368 }
  }
};

const DEFAULTS = {
  width: CANVAS.width, height: CANVAS.height,
  layoutStateVersion: LAYOUT_STATE_VERSION,
  mainTitle: "雕像也无法让她回心转意", subTitle: "碎片解锁", description: "它们毫无意义",
  colorStateVersion: 2,
  accentColor: "#D989A8", textColor: "#655A61", primaryAccent: "#D989A8", secondaryAccent: "",
  titleColorMode: "auto", titleColor: "#655A61", titleOpacity: 94, titleOpacityManuallyEdited: false, titleColorSource: "自动：深灰紫标题", titleContrast: 3.7,
  subtitleColorMode: "followAccent", subtitleColor: "#D989A8", subtitleOpacity: 88, subtitleOpacityManuallyEdited: false, subtitleColorSource: "跟随强调色", subtitleContrast: 3.1,
  bodyTextColorMode: "auto", bodyTextColor: "#746A70", bodyTextOpacity: 80, bodyTextOpacityManuallyEdited: false, bodyTextColorSource: "自动：暖灰正文", bodyTextContrast: 4.5,
  dividerOpacity: 100,
  fontFamily: "system", titleFontFamily: "system", bodyFontFamily: "system", customFontScope: "title", showSubtitleMarker: true, typographyManuallyEdited: false,
  backgroundScale: 100, backgroundX: 0, backgroundY: 0, backgroundOpacity: 100,
  logoScale: 160, logoX: -7, logoY: 0, logoStyle: "floating", logoOpticalOffsetY: 0,
  logoCropMode: "auto", logoCropBounds: null, logoContainerSize: 312,
  glassPreset: "standard", materialBase: "standard", glassDepth: 58, cardOpacity: 22, glassDispersion: 0,
  glassSaturation: 1.07, glassContrast: 1.03, glassTintColor: "#FFFFFF", glassTintOpacity: .12,
  layoutPreset: "system", smartSummary: "", smartConfidence: "low", smartDiagnostics: null,
  smartSecondaryTintColor: "", smartSecondaryTintOpacity: 0, smartReflectionColor: "", smartReflectionOpacity: 0,
  titleShadowOpacity: .04, descShadowOpacity: .04,
  cardHeightMode: "auto", dividerMode: "auto", cardPositionMode: "auto", layoutDensityMode: "auto",
  cardX: 0, cardY: 0, cardScale: 100, cardHeight: 570,
  subtitleTitleVisualGap: 24, titleDividerVisualGap: 48, dividerDescriptionVisualGap: 44, descriptionLineBaselineGap: 54,
  textOpticalOffsetY: 8,
  subtitleLetterSpacing: 4, titleLetterSpacing: -.5, descLetterSpacing: 0,
  dividerWidth: 260, descriptionBoxWidth: 900, descriptionBoxHeight: 240, zoom: 72
};
const RANGE_GROUPS = {
  background: ["backgroundScale", "backgroundX", "backgroundY", "backgroundOpacity"],
  logo: ["logoScale", "logoX", "logoY", "logoOpticalOffsetY", "logoContainerSize"],
  glass: ["glassDepth", "cardOpacity", "glassDispersion", "glassSaturation", "glassContrast", "glassTintOpacity"],
  type: ["textOpticalOffsetY", "subtitleTitleVisualGap", "titleDividerVisualGap", "dividerDescriptionVisualGap", "descriptionLineBaselineGap", "subtitleLetterSpacing", "titleLetterSpacing", "descLetterSpacing", "dividerWidth", "dividerOpacity", "descriptionBoxWidth", "cardHeight", "cardX", "cardY", "cardScale", "zoom"]
};
const RANGE_LABELS = {
  backgroundScale: "底图缩放", backgroundX: "水平位置", backgroundY: "垂直位置", backgroundOpacity: "底图不透明度",
  logoScale: "Logo 缩放", logoX: "水平位置", logoY: "垂直位置", logoOpticalOffsetY: "Logo 光学垂直位置", logoContainerSize: "玻璃容器尺寸",
  glassDepth: "玻璃深度", cardOpacity: "卡片透明度", glassDispersion: "边缘色散", glassSaturation: "玻璃饱和度", glassContrast: "玻璃对比度", glassTintOpacity: "玻璃染色强度",
  textOpticalOffsetY: "文字整体垂直位置",
  subtitleTitleVisualGap: "副标题到主标题（可见距离）", titleDividerVisualGap: "主标题到分割线（可见距离）", dividerDescriptionVisualGap: "分割线到正文（可见距离）", descriptionLineBaselineGap: "正文行距（基线）",
  subtitleLetterSpacing: "副标题字距", titleLetterSpacing: "主标题字距", descLetterSpacing: "正文字距", dividerWidth: "分割线宽度", dividerOpacity: "分割线透明度",
  descriptionBoxWidth: "文案框宽度", descriptionBoxHeight: "文案框高度", cardHeight: "固定卡片高度", cardX: "卡片水平位置", cardY: "卡片垂直位置", cardScale: "卡片缩放", zoom: "预览缩放"
};
const RANGE_CONFIG = {
  backgroundScale: [100, 240, 1], backgroundX: [-100, 100, 1], backgroundY: [-100, 100, 1], backgroundOpacity: [0, 100, 1],
  logoScale: [40, 500, 1], logoX: [-100, 100, 1], logoY: [-100, 100, 1], logoOpticalOffsetY: [-80, 80, 1], logoContainerSize: [220, 460, 1],
  glassDepth: [0, 100, 1], cardOpacity: [0, 60, 1], glassDispersion: [0, 20, 1], glassSaturation: [.50, 1.25, .01], glassContrast: [.90, 1.14, .01], glassTintOpacity: [.04, .42, .01],
  textOpticalOffsetY: [-80, 80, 1],
  subtitleTitleVisualGap: [0, 120, 1], titleDividerVisualGap: [0, 160, 1], dividerDescriptionVisualGap: [0, 140, 1], descriptionLineBaselineGap: [40, 112, 1],
  subtitleLetterSpacing: [0, 10, .5], titleLetterSpacing: [-2, 8, .25], descLetterSpacing: [-.5, 4, .25], dividerWidth: [120, 600, 1], dividerOpacity: [0, 100, 1],
  descriptionBoxWidth: [520, 1060, 1], descriptionBoxHeight: [90, 300, 1], cardHeight: [480, 760, 1], cardX: [-160, 160, 1], cardY: [-120, 120, 1], cardScale: [86, 108, 1], zoom: [42, 100, 1]
};
const RANGE_INPUT_MAX = { logoScale: 600 };
const state = { ...DEFAULTS, background: "", logo: "", customFontName: "", customFontData: "", customFontFormat: "", customFontFileName: "", themes: [], selectedTheme: -1, editorTarget: null };
let history = [], future = [], renderQueued = false, persistTimer = 0, interactionStart = null, exportBusy = false, smartBusy = false, smartCache = null, suppressSmartManual = false;
let dbWarningShown = false, storageWarningShown = false, exportCapability = null, lastExportFile = null, lastExportUrl = "", layoutQueued = false;
const activePointers = new Map();
let gesture = null;

function escapeXml(value = "") { return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;"); }
function hexToRgb(hex) { const h = String(hex || "#000000").replace("#", ""); const value = parseInt(h.length === 3 ? h.split("").map(x => x + x).join("") : h, 16) || 0; return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 }; }
function rgbToHex({ r, g, b }) { return `#${[r,g,b].map(v => Math.round(clamp(v,0,255)).toString(16).padStart(2,"0")).join("")}`; }
function luminance({ r, g, b }) { const v = [r,g,b].map(x => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }); return .2126*v[0] + .7152*v[1] + .0722*v[2]; }
function contrastRatio(a, b) { const l1 = Math.max(a,b), l2 = Math.min(a,b); return (l1 + .05) / (l2 + .05); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value))); }
function mixRgb(a, b, t) { return { r: a.r * (1 - t) + b.r * t, g: a.g * (1 - t) + b.g * t, b: a.b * (1 - t) + b.b * t }; }
function safeFilename(value) { return String(value || "achievement").replace(/[\\/:*?\"<>|\n\r]+/g, "-").trim().replace(/\s+/g, "-").slice(0, 60) || "achievement"; }
function timestamp() { const d = new Date(); const p = n => String(n).padStart(2,"0"); return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`; }
function showToast(message, type = "success", persistent = false) { const host = $("toastRegion"); if (!host) return null; const toast = document.createElement("div"); toast.className = `toast ${type}`; toast.textContent = message; host.append(toast); if (!persistent) setTimeout(() => toast.remove(), 3600); return toast; }
function isCoarsePointer() { return matchMedia("(pointer: coarse)").matches || innerWidth < 768; }
function isLikelyMobileSafari() { return /Safari/i.test(navigator.userAgent) && /Mobile|iPad|iPhone|iPod/i.test(navigator.userAgent) && !/CriOS|FxiOS|EdgiOS/i.test(navigator.userAgent); }
function normalizeHex(value) { const raw = String(value || "").trim(); const m3 = raw.match(/^#?([0-9a-f]{3})$/i); if (m3) return `#${m3[1].split("").map(ch => ch + ch).join("").toUpperCase()}`; const m6 = raw.match(/^#?([0-9a-f]{6})$/i); if (m6) return `#${m6[1].toUpperCase()}`; return ""; }
function isValidHex(value) { return !!normalizeHex(value); }
function rgbString(hex, opacityPercent) { const rgb = hexToRgb(normalizeHex(hex) || "#000000"), a = clamp(opacityPercent, 0, 100) / 100; return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${a.toFixed(2)})`; }
function compositeRgb(fg, bg, alpha) { return { r: fg.r * alpha + bg.r * (1 - alpha), g: fg.g * alpha + bg.g * (1 - alpha), b: fg.b * alpha + bg.b * (1 - alpha) }; }
function srgbToLinear(channel) { const value = clamp(channel, 0, 255) / 255; return value <= .04045 ? value / 12.92 : Math.pow((value + .055) / 1.055, 2.4); }
function linearToSrgb(channel) { const value = clamp(channel, 0, 1); return 255 * (value <= .0031308 ? value * 12.92 : 1.055 * Math.pow(value, 1 / 2.4) - .055); }
function relativeLuminance(rgb) { return .2126 * srgbToLinear(rgb.r) + .7152 * srgbToLinear(rgb.g) + .0722 * srgbToLinear(rgb.b); }
function alphaCompositeLinearSrgb(foregroundRgb, backgroundRgb, opacity) { const alpha = clamp(opacity, 0, 1); return { r: linearToSrgb(srgbToLinear(foregroundRgb.r) * alpha + srgbToLinear(backgroundRgb.r) * (1 - alpha)), g: linearToSrgb(srgbToLinear(foregroundRgb.g) * alpha + srgbToLinear(backgroundRgb.g) * (1 - alpha)), b: linearToSrgb(srgbToLinear(foregroundRgb.b) * alpha + srgbToLinear(backgroundRgb.b) * (1 - alpha)) }; }
function contrastWithOpacity(foreground, opacityPercent, actualBackgroundRgb) { const fg = typeof foreground === "string" ? hexToRgb(normalizeHex(foreground) || "#000000") : foreground; const bg = actualBackgroundRgb && typeof actualBackgroundRgb === "object" ? actualBackgroundRgb : { r: 128, g: 128, b: 128 }; const composited = alphaCompositeLinearSrgb(fg, bg, clamp(opacityPercent, 0, 100) / 100); return contrastRatio(relativeLuminance(composited), relativeLuminance(bg)); }
function resolvedTextColor(role) { if (role === "title") return state.titleColorMode === "followBody" ? (state.bodyTextColorMode === "followTitle" ? state.titleColor : state.bodyTextColor) : state.titleColor; if (role === "subtitle") return state.subtitleColorMode === "followAccent" ? state.accentColor : state.subtitleColor; if (role === "body" || role === "description") return state.bodyTextColorMode === "followTitle" ? (state.titleColorMode === "followBody" ? state.bodyTextColor : state.titleColor) : state.bodyTextColor; return state.textColor || state.titleColor || "#FFFFFF"; }
function colorOpacity(role) { if (role === "title") return clamp(state.titleOpacity, 0, 100) / 100; if (role === "subtitle") return clamp(state.subtitleOpacity, 0, 100) / 100; if (role === "body" || role === "description") return clamp(state.bodyTextOpacity, 0, 100) / 100; return 1; }
function syncLegacyTextColor() { state.accentColor = normalizeHex(state.accentColor) || normalizeHex(state.primaryAccent) || "#D989A8"; state.primaryAccent = state.accentColor; state.titleColor = normalizeHex(state.titleColor) || "#655A61"; state.subtitleColor = normalizeHex(state.subtitleColor) || state.accentColor; state.bodyTextColor = normalizeHex(state.bodyTextColor) || state.titleColor; state.textColor = resolvedTextColor("title"); }

function normalizeState() {
  const migrated = LEGACY_MATERIAL_MAP[state.glassPreset] || (MATERIAL_PRESETS[state.glassPreset] ? state.glassPreset : null) || (MATERIAL_PRESETS[state.materialBase] ? state.materialBase : "standard");
  if (!MATERIAL_PRESETS[state.materialBase]) state.materialBase = migrated;
  if (state.glassPreset !== "custom") state.glassPreset = migrated;
  if (!MATERIAL_PRESETS[state.glassPreset] && state.glassPreset !== "custom") state.glassPreset = "standard";
  if (!MATERIAL_PRESETS[state.materialBase]) state.materialBase = "standard";
  if (!LAYOUT_PRESETS[state.layoutPreset]) state.layoutPreset = "system";
  if (!FONT_KEYS.has(state.titleFontFamily)) state.titleFontFamily = state.fontFamily && FONT_KEYS.has(state.fontFamily) ? state.fontFamily : "system";
  if (!FONT_KEYS.has(state.bodyFontFamily) || state.bodyFontFamily === "follow") state.bodyFontFamily = state.fontFamily && FONT_KEYS.has(state.fontFamily) && state.fontFamily !== "follow" ? state.fontFamily : "system";
  if (!state.customFontScope) state.customFontScope = "title";
  if (typeof state.showSubtitleMarker !== "boolean") state.showSubtitleMarker = state.showSubtitleMarker !== "false";
  if (!Number.isFinite(Number(state.dividerWidth))) state.dividerWidth = DEFAULTS.dividerWidth;
  if (!Number.isFinite(Number(state.cardHeight))) state.cardHeight = DEFAULTS.cardHeight;
  if (!Number.isFinite(Number(state.cardX))) state.cardX = DEFAULTS.cardX;
  if (!Number.isFinite(Number(state.cardY))) state.cardY = DEFAULTS.cardY;
  if (!Number.isFinite(Number(state.cardScale))) state.cardScale = DEFAULTS.cardScale;
  if (!Number.isFinite(Number(state.logoOpticalOffsetY))) state.logoOpticalOffsetY = DEFAULTS.logoOpticalOffsetY;
  if (!Number.isFinite(Number(state.glassSaturation))) state.glassSaturation = MATERIAL_PRESETS[state.materialBase]?.saturation || DEFAULTS.glassSaturation;
  if (!Number.isFinite(Number(state.glassContrast))) state.glassContrast = MATERIAL_PRESETS[state.materialBase]?.contrast || DEFAULTS.glassContrast;
  if (!state.glassTintColor) state.glassTintColor = MATERIAL_PRESETS[state.materialBase]?.tintColor || DEFAULTS.glassTintColor;
  if (!Number.isFinite(Number(state.glassTintOpacity))) state.glassTintOpacity = MATERIAL_PRESETS[state.materialBase]?.tintOpacity || DEFAULTS.glassTintOpacity;
  if (!state.primaryAccent) state.primaryAccent = state.accentColor || DEFAULTS.primaryAccent;
  if (state.colorStateVersion !== 2) {
    const oldText = normalizeHex(state.textColor) || "#FFFFFF";
    const oldAccent = normalizeHex(state.accentColor || state.primaryAccent) || DEFAULTS.subtitleColor;
    state.titleColor = normalizeHex(state.titleColor) || oldText;
    state.bodyTextColor = normalizeHex(state.bodyTextColor) || oldText;
    state.subtitleColor = normalizeHex(state.subtitleColor) || oldAccent;
    state.titleColorMode = oldText === "#FFFFFF" ? "followBody" : "manual";
    state.bodyTextColorMode = oldText === "#FFFFFF" ? "followTitle" : "manual";
    state.subtitleColorMode = "followAccent";
    state.titleOpacity = 94;
    state.bodyTextOpacity = 80;
    state.subtitleOpacity = 88;
    state.titleColorSource = "迁移自旧文字色";
    state.bodyTextColorSource = "迁移自旧文字色";
    state.subtitleColorSource = "迁移自强调色";
    state.colorStateVersion = 2;
  }
  if (!["auto","manual","followBody"].includes(state.titleColorMode)) state.titleColorMode = "auto";
  if (!["auto","manual","followAccent"].includes(state.subtitleColorMode)) state.subtitleColorMode = "followAccent";
  if (!["auto","manual","followTitle"].includes(state.bodyTextColorMode)) state.bodyTextColorMode = "auto";
  state.titleOpacity = Number.isFinite(Number(state.titleOpacity)) ? clamp(Number(state.titleOpacity), 40, 100) : DEFAULTS.titleOpacity;
  state.subtitleOpacity = Number.isFinite(Number(state.subtitleOpacity)) ? clamp(Number(state.subtitleOpacity), 30, 100) : DEFAULTS.subtitleOpacity;
  state.bodyTextOpacity = Number.isFinite(Number(state.bodyTextOpacity)) ? clamp(Number(state.bodyTextOpacity), 40, 100) : DEFAULTS.bodyTextOpacity;
  if (!Number.isFinite(Number(state.dividerOpacity))) state.dividerOpacity = DEFAULTS.dividerOpacity;
  syncLegacyTextColor();
  if (!Number.isFinite(Number(state.titleShadowOpacity))) state.titleShadowOpacity = DEFAULTS.titleShadowOpacity;
  if (!Number.isFinite(Number(state.descShadowOpacity))) state.descShadowOpacity = DEFAULTS.descShadowOpacity;
  if (!state.cardHeightMode) state.cardHeightMode = "auto";
  if (!state.dividerMode) state.dividerMode = "auto";
  if (!state.cardPositionMode) state.cardPositionMode = "auto";
  if (!state.layoutDensityMode) state.layoutDensityMode = "auto";
  if (!["auto", "original", "custom"].includes(state.logoCropMode)) state.logoCropMode = "auto";
  if (!Number.isFinite(Number(state.logoScale))) state.logoScale = DEFAULTS.logoScale;
  state.logoScale = clamp(Number(state.logoScale), 40, 600);
  if (!Number.isFinite(Number(state.logoContainerSize))) state.logoContainerSize = DEFAULTS.logoContainerSize;
  ["subtitleTitleVisualGap", "titleDividerVisualGap", "dividerDescriptionVisualGap", "descriptionLineBaselineGap", "textOpticalOffsetY"].forEach(k => { if (!Number.isFinite(Number(state[k]))) state[k] = DEFAULTS[k]; });
  if (state.logoCropBounds && typeof state.logoCropBounds !== "object") state.logoCropBounds = null;
  if (state.fontFamily && (!state.titleFontFamily || !state.bodyFontFamily)) { state.titleFontFamily = state.fontFamily; state.bodyFontFamily = state.fontFamily; }
}
/* ---- layoutStateVersion 2 migration ----
   Converts legacy baseline-difference gaps into the new visible-gap model, keeps
   text/assets/material/fonts untouched, and never re-runs once stamped. */
function migrateLayoutState(saved) {
  if (!saved || Number(saved.layoutStateVersion) >= LAYOUT_STATE_VERSION) { state.layoutStateVersion = LAYOUT_STATE_VERSION; return false; }
  const auto = AUTO_LAYOUT.system[1];
  const wasAutoDensity = !saved.layoutDensityMode || saved.layoutDensityMode === "auto";
  if (wasAutoDensity) {
    // Auto layout: adopt the new visible-gap defaults outright.
    state.subtitleTitleVisualGap = DEFAULTS.subtitleTitleVisualGap;
    state.titleDividerVisualGap = DEFAULTS.titleDividerVisualGap;
    state.dividerDescriptionVisualGap = DEFAULTS.dividerDescriptionVisualGap;
    state.descriptionLineBaselineGap = DEFAULTS.descriptionLineBaselineGap;
    state.textOpticalOffsetY = DEFAULTS.textOpticalOffsetY;
  } else {
    // Custom layout: convert baseline deltas into approximate visible distances.
    const titleSize = Number(saved.titleSize) || TYPOGRAPHY_PRESETS.system.title.fontSize;
    const subSize = TYPOGRAPHY_PRESETS.system.subtitle.fontSize;
    const descSize = Number(saved.descFontSize) || TYPOGRAPHY_PRESETS.system.description.fontSize;
    const toVisible = (baselineGap, upperDescent, lowerAscent, fallback) => {
      const v = Number(baselineGap);
      if (!Number.isFinite(v)) return fallback;
      return clamp(Math.round(v - upperDescent - lowerAscent), 0, 160);
    };
    state.subtitleTitleVisualGap = toVisible(saved.subtitleTitleGap, subSize * .22, titleSize * .78, DEFAULTS.subtitleTitleVisualGap);
    state.titleDividerVisualGap = toVisible(saved.titleRuleGap, 0, 0, DEFAULTS.titleDividerVisualGap);
    state.dividerDescriptionVisualGap = toVisible(saved.ruleDescGap, 0, 0, DEFAULTS.dividerDescriptionVisualGap);
    state.descriptionLineBaselineGap = Number.isFinite(Number(saved.descLineGap)) ? clamp(Number(saved.descLineGap), 40, 112) : DEFAULTS.descriptionLineBaselineGap;
    state.textOpticalOffsetY = 0;
  }
  // Legacy fixed offsets are intentionally dropped; nothing reads subtitleY anymore.
  ["subtitleTitleGap", "titleRuleGap", "ruleDescGap", "descLineGap", "subtitleY"].forEach(k => { delete state[k]; });
  // Preserve the previous visual logo size: legacy scale was relative to the raw
  // PNG canvas, so keep the number and do NOT re-fit to the new crop.
  if (Number.isFinite(Number(saved.logoScale))) state.logoScale = clamp(Number(saved.logoScale), 40, 600);
  if (!saved.logoCropMode) state.logoCropMode = "auto";
  if (saved.cardPositionMode !== "custom") { state.cardX = 0; state.cardY = 0; }
  state.layoutStateVersion = LAYOUT_STATE_VERSION;
  return true;
}
function snapshot() { const copy = {}; Object.keys(DEFAULTS).forEach(k => copy[k] = state[k]); ["customFontName", "customFontFormat", "customFontFileName", "selectedTheme", "editorTarget"].forEach(k => copy[k] = state[k]); return copy; }
function restoreSnapshot(data) { Object.assign(state, data); normalizeState(); state.themes = state.background ? state.themes : []; syncUi(); scheduleRender(); }
function recordHistory() { const value = JSON.stringify(snapshot()); if (history.at(-1) === value) return; history.push(value); if (history.length > 30) history.shift(); future = []; updateHistoryButtons(); }
function beginInteraction() { if (!interactionStart) interactionStart = JSON.stringify(snapshot()); }
function endInteraction() { if (interactionStart && interactionStart !== JSON.stringify(snapshot())) recordHistory(); interactionStart = null; persist(); updateHistoryButtons(); }
function undo() { if (history.length < 2) return; future.push(history.pop()); restoreSnapshot(JSON.parse(history.at(-1))); persist(); updateHistoryButtons(); }
function redo() { const next = future.pop(); if (!next) return; history.push(next); restoreSnapshot(JSON.parse(next)); persist(); updateHistoryButtons(); }
function updateHistoryButtons() { if ($("undoButton")) $("undoButton").disabled = history.length < 2; if ($("redoButton")) $("redoButton").disabled = !future.length; }

function saveState() { try { const plain = snapshot(); localStorage.setItem(STORAGE_KEY, JSON.stringify(plain)); } catch (err) { if (!storageWarningShown) { storageWarningShown = true; showToast("存储空间不足，已优先保留当前会话，请尽快导出作品。", "error", true); } } }
function openDb() { return new Promise((resolve, reject) => { if (!window.indexedDB) return reject(new Error("IndexedDB unavailable")); const req = indexedDB.open(DB_NAME, 1); req.onupgradeneeded = () => req.result.createObjectStore("assets"); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); }); }
async function dbPut(key, value) { try { const db = await openDb(); await new Promise((resolve, reject) => { const tx = db.transaction("assets", "readwrite"); tx.objectStore("assets").put(value, key); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); }); db.close(); } catch (_) { if (!dbWarningShown) { dbWarningShown = true; showToast("当前浏览器无法长期保存素材，关闭页面前请先导出作品。", "error", true); } } }
async function dbGet(key) { try { const db = await openDb(); const val = await new Promise((resolve, reject) => { const tx = db.transaction("assets", "readonly"); const req = tx.objectStore("assets").get(key); req.onsuccess = () => resolve(req.result || ""); req.onerror = () => reject(req.error); }); db.close(); return val; } catch (_) { if (!dbWarningShown) { dbWarningShown = true; showToast("当前浏览器无法长期保存素材，关闭页面前请先导出作品。", "error", true); } return ""; } }
function persist() { clearTimeout(persistTimer); persistTimer = setTimeout(() => { saveState(); dbPut("background", state.background); dbPut("logo", state.logo); dbPut("font", state.customFontData); }, 180); }
async function restorePersisted() { try { const source = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS].map(k => localStorage.getItem(k)).find(Boolean); const saved = JSON.parse(source || "null"); if (!saved) return false; const legacyPreset = saved.glassPreset; const hadMaterialBase = Object.prototype.hasOwnProperty.call(saved, "materialBase"); const oldFont = saved.fontFamily; Object.assign(state, saved); if (oldFont && !saved.titleFontFamily) state.titleFontFamily = oldFont; if (oldFont && !saved.bodyFontFamily) state.bodyFontFamily = oldFont; if (!saved.customFontScope) state.customFontScope = "title"; const migrated = migrateLayoutState(saved); normalizeState(); if (!hadMaterialBase && LEGACY_MATERIAL_MAP[legacyPreset]) { const p = MATERIAL_PRESETS[state.materialBase]; state.glassDepth = p.glassDepth; state.cardOpacity = p.cardOpacity; state.glassDispersion = p.glassDispersion; } state.background = await dbGet("background"); state.logo = await dbGet("logo"); state.customFontData = await dbGet("font"); if (state.customFontData && state.customFontName) await registerCustomFont(false); await refreshLogoAspect(); if (state.logo && !state.logoCropBounds) await refreshLogoCropBounds(); if (state.background) extractThemeColors(state.background); showToast(migrated ? "已恢复上次编辑，并已迁移到新的可见间距排版。" : "已恢复上次编辑"); return true; } catch (_) { return false; } }

function buildDefaultBackground() { const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1932 1360"><defs><linearGradient id="base" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#070A12"/><stop offset="1" stop-color="#111827"/></linearGradient><radialGradient id="warm" cx="13%" cy="10%" r="62%"><stop stop-color="#f0c9be" stop-opacity=".30"/><stop offset="1" stop-color="#f0c9be" stop-opacity="0"/></radialGradient><radialGradient id="cool" cx="83%" cy="85%" r="68%"><stop stop-color="#6e83d3" stop-opacity=".36"/><stop offset="1" stop-color="#6e83d3" stop-opacity="0"/></radialGradient><radialGradient id="vignette" cx="50%" cy="48%" r="74%"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".15"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#base)"/><rect width="100%" height="100%" fill="url(#warm)"/><rect width="100%" height="100%" fill="url(#cool)"/><rect width="100%" height="100%" fill="url(#vignette)"/></svg>`; return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`; }
function buildDefaultLogo() { const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#dce6ff"/></linearGradient></defs><path d="M250 58 412 152v196L250 442 88 348V152Z" fill="rgba(255,255,255,.12)" stroke="url(#g)" stroke-width="18"/><path d="M156 250h188M250 156v188" stroke="url(#g)" stroke-width="30" stroke-linecap="round"/><circle cx="250" cy="250" r="78" fill="none" stroke="url(#g)" stroke-width="20"/></svg>`; return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`; }

function resolvedFontKey(role) { const usesCustomByScope = state.customFontName && (state.customFontScope === "all" || (state.customFontScope === "title-desc" && role !== "subtitle") || (state.customFontScope === "title" && role === "title")); if (usesCustomByScope) return "custom"; if (role === "title") return state.titleFontFamily === "follow" ? state.bodyFontFamily : state.titleFontFamily; return state.bodyFontFamily; }
function fontStackForRole(role) { const key = resolvedFontKey(role); if (key === "custom" && state.customFontName) return `'${state.customFontName}', ${FONT_STACKS.system}`; return FONT_STACKS[key] || FONT_STACKS.system; }
function svgFontFace() { return state.customFontData && state.customFontName ? `@font-face{font-family:'${state.customFontName}';src:url('${state.customFontData}') format('${state.customFontFormat || "truetype"}');font-display:block;}` : ""; }
function roleColor(token) { if (token.color === "accent" || token.color === "subtitle") return resolvedTextColor("subtitle"); if (token.color === "body" || token.color === "description") return resolvedTextColor("body"); if (token.color === "title" || token.color === "text") return resolvedTextColor("title"); return normalizeHex(token.color) || resolvedTextColor("title"); }
function currentTypography() {
  const layout = state.layoutPreset === "certificate" ? "certificate" : "system";
  const src = TYPOGRAPHY_PRESETS[layout];
  const rec = MATERIAL_PRESETS[currentMaterialBase()]?.typographyRecommendation || {};
  const clone = JSON.parse(JSON.stringify(src));
  const density = layout === "system" && state.layoutDensityMode === "auto" ? computeSystemAutoLayout() : null;
  clone.subtitle.letterSpacing = state.subtitleLetterSpacing;
  clone.subtitle.opacity = colorOpacity("subtitle");
  clone.title.letterSpacing = state.titleLetterSpacing;
  clone.description.letterSpacing = state.descLetterSpacing;
  clone.title.opacity = colorOpacity("title");
  clone.description.fontSize = density?.descFontSize || clone.description.fontSize;
  clone.description.opacity = colorOpacity("body");
  clone.description.lineHeight = state.descriptionLineBaselineGap;
  clone.divider.width = state.dividerWidth || density?.dividerWidth || src.divider.width;
  clone.title.fontWeight = rec.titleWeight || clone.title.fontWeight;
  clone.description.fontWeight = rec.bodyWeight || clone.description.fontWeight;
  clone.title.shadowOpacity = Math.min(Number.isFinite(Number(state.titleShadowOpacity)) ? Number(state.titleShadowOpacity) : clone.title.shadowOpacity, rec.titleShadow ?? clone.title.shadowOpacity);
  clone.description.shadowOpacity = Math.min(Number.isFinite(Number(state.descShadowOpacity)) ? Number(state.descShadowOpacity) : clone.description.shadowOpacity, rec.descriptionShadow ?? clone.description.shadowOpacity);
  return clone;
}
function styleBlock() { return `<style>${svgFontFace()}text{font-kerning:normal;font-optical-sizing:auto;font-feature-settings:'kern' 1;text-rendering:geometricPrecision}.subtitle-text{font-family:${fontStackForRole("subtitle")};font-size:var(--subtitle-size);font-weight:var(--subtitle-weight);letter-spacing:var(--subtitle-spacing)}.title-text{font-family:${fontStackForRole("title")};font-weight:var(--title-weight);letter-spacing:var(--title-spacing)}.description-text{font-family:${fontStackForRole("description")};font-size:var(--desc-size);font-weight:var(--desc-weight);letter-spacing:var(--desc-spacing)}</style>`; }

function textContext(fontFamily, size, weight) { const canvas = document.createElement("canvas"); const ctx = canvas.getContext("2d"); ctx.font = `${weight} ${size}px ${fontFamily}`; ctx.fontKerning = "normal"; return ctx; }
function graphemes(value) { const text = String(value || ""); if (window.Intl?.Segmenter) return Array.from(new Intl.Segmenter("zh", { granularity: "grapheme" }).segment(text), s => s.segment); return Array.from(text); }
function measureText(text, size, weight, spacing = 0, family = fontStackForRole("title")) { const chars = graphemes(text); const ctx = textContext(family, size, weight); return ctx.measureText(text).width + Math.max(0, chars.length - 1) * spacing; }
function textMetrics(size, weight, family = fontStackForRole("description")) { const ctx = textContext(family, size, weight); const metrics = ctx.measureText("成就 Achievement 0123"); return { ascent: metrics.actualBoundingBoxAscent || size * .78, descent: metrics.actualBoundingBoxDescent || size * .22 }; }
/* Phase 1 measurement: real glyph ink bounds for one concrete string.
   Falls back to fontSize ratios only when actualBoundingBox* is unavailable. */
function glyphMetrics(text, size, weight, family) {
  const fallback = { ascent: size * .78, descent: size * .22, measured: false };
  const value = String(text ?? "");
  if (!value.trim()) return { ascent: 0, descent: 0, measured: true, empty: true };
  try {
    const m = textContext(family, size, weight).measureText(value);
    const ascent = Number(m.actualBoundingBoxAscent), descent = Number(m.actualBoundingBoxDescent);
    if (Number.isFinite(ascent) && Number.isFinite(descent) && (ascent > 0 || descent > 0)) return { ascent, descent, measured: true };
  } catch (_) {}
  return fallback;
}
const NO_LINE_START = new Set("，。！？、；：）】》」』…％,.;:!?)]}%".split(""));
const NO_LINE_END = new Set("（【《「『([{".split(""));
function validBreak(prev, next) { if (!prev || !next) return true; if (NO_LINE_START.has(next)) return false; if (NO_LINE_END.has(prev)) return false; return true; }
function wrapMeasuredLine(line, maxWidth, size, weight, spacing, family) {
  const source = graphemes(line); if (!source.length) return [""];
  const lines = []; let current = "";
  const pushCurrent = () => { if (current) { lines.push(current.trimEnd()); current = ""; } };
  for (const ch of source) {
    const test = current + ch;
    if (current && measureText(test, size, weight, spacing, family) > maxWidth) {
      const chars = graphemes(current); let breakIndex = -1;
      for (let i = chars.length - 1; i > Math.floor(chars.length * .45); i--) {
        const prev = chars[i - 1], next = chars[i];
        if ((/\s/.test(prev) || /[，。、；：,.;:!?！？\-—]/.test(prev) || /\s/.test(next)) && validBreak(prev, next)) { breakIndex = i; break; }
      }
      if (breakIndex > 0) { lines.push(chars.slice(0, breakIndex).join("").trimEnd()); current = chars.slice(breakIndex).join("").trimStart() + ch; }
      else { pushCurrent(); current = ch; }
    } else current = test;
  }
  pushCurrent();
  return balanceLines(lines, maxWidth, size, weight, spacing, family);
}
function balanceLines(lines, maxWidth, size, weight, spacing, family) {
  if (lines.length < 2) return lines;
  const out = lines.slice();
  for (let i = 1; i < out.length; i++) {
    let prev = graphemes(out[i - 1]), last = graphemes(out[i]);
    let lastWidth = measureText(out[i], size, weight, spacing, family);
    if (lastWidth >= maxWidth * .32) continue;
    while (prev.length > 2 && lastWidth < maxWidth * .48) {
      const moved = prev.pop();
      if (!validBreak(prev.at(-1), moved)) { prev.push(moved); break; }
      const candidateLast = moved + last.join("");
      const candidatePrev = prev.join("");
      if (measureText(candidateLast, size, weight, spacing, family) > maxWidth || measureText(candidatePrev, size, weight, spacing, family) < maxWidth * .42) { prev.push(moved); break; }
      last.unshift(moved); out[i - 1] = candidatePrev; out[i] = candidateLast; lastWidth = measureText(out[i], size, weight, spacing, family);
    }
  }
  return out;
}
function descriptionLines(maxLines, maxWidth, size, weight, spacing, family) {
  const lines = [];
  for (const manual of String(state.description || "").split(/\r?\n/)) lines.push(...wrapMeasuredLine(manual, maxWidth, size, weight, spacing, family));
  const overflow = lines.length > maxLines; const shown = lines.slice(0, maxLines);
  if (overflow && shown.length) { let last = shown.at(-1); while (last.length && measureText(`${last}…`, size, weight, spacing, family) > maxWidth) last = graphemes(last).slice(0, -1).join(""); shown[shown.length - 1] = `${last}…`; }
  return { lines: shown, overflow };
}
function suggestedTitleStart(text, base) { const chars = graphemes(String(text || "")).filter(ch => /[\u3400-\u9fff]/.test(ch)).length; if (chars >= 11) return Math.min(base, 70); if (chars >= 8) return Math.min(base, 73); return base; }
function fitTitleSingle(text, maxWidth, start, min, weight, spacing, family) { let size = suggestedTitleStart(text, start); while (size > min && measureText(text, size, weight, spacing, family) > maxWidth) size -= 1; return { size, lines: [text], overflow: measureText(text, size, weight, spacing, family) > maxWidth }; }
function fitCertificateTitle(text, maxWidth, start, min, weight, spacing, family) {
  const single = fitTitleSingle(text, maxWidth, start, min, weight, spacing, family);
  if (!single.overflow) return single;
  const lines = wrapMeasuredLine(text, maxWidth, min, weight, spacing, family).slice(0, 2);
  if (lines.length > 1 && graphemes(lines[1]).length > 1) return { size: min, lines, overflow: measureText(lines.at(-1), min, weight, spacing, family) > maxWidth };
  return single;
}

function getImagePlacement(area, scale, offsetX, offsetY, expand = 1) { const baseWidth = area.width * (scale / 100), baseHeight = area.height * (scale / 100); const maxX = Math.max(0, (baseWidth - area.width) / 2), maxY = Math.max(0, (baseHeight - area.height) / 2); const width = baseWidth * expand, height = baseHeight * expand; return { x: area.x + (area.width - baseWidth) / 2 + offsetX / 100 * maxX - (width - baseWidth) / 2, y: area.y + (area.height - baseHeight) / 2 + offsetY / 100 * maxY - (height - baseHeight) / 2, width, height }; }
function imageLayer(src, clipId, area, scale, offsetX, offsetY, { opacity = 1, filter = "", expand = 1, preserve = "xMidYMid slice" } = {}) { const p = getImagePlacement(area, scale, offsetX, offsetY, expand); return `<image href="${src}" xlink:href="${src}" x="${p.x}" y="${p.y}" width="${p.width}" height="${p.height}" preserveAspectRatio="${preserve}" opacity="${opacity}" clip-path="url(#${clipId})"${filter ? ` filter="${filter}"` : ""}/>`; }
function currentMaterialBase() { return MATERIAL_PRESETS[state.materialBase] ? state.materialBase : "standard"; }
function currentMaterialToken() { const base = { ...MATERIAL_PRESETS[currentMaterialBase()] }; const depthDelta = state.glassDepth - base.glassDepth, opacityDelta = state.cardOpacity - base.cardOpacity, dispersionDelta = state.glassDispersion - base.glassDispersion; base.blur = clamp(base.blur + depthDelta * .18, 14, 38); base.saturation = clamp(Number(state.glassSaturation) || base.saturation, .50, 1.25); base.contrast = clamp(Number(state.glassContrast) || base.contrast, .90, 1.14); base.tintColor = state.glassTintColor || base.tintColor; base.tintOpacity = clamp(Number(state.glassTintOpacity) || base.tintOpacity, .04, .42); base.tintOpacity = clamp(base.tintOpacity + opacityDelta * .004, .04, .42); base.secondaryTintOpacity = clamp(base.secondaryTintOpacity + opacityDelta * .0015, 0, .10); base.ambientShadowOpacity = clamp(base.ambientShadowOpacity + depthDelta * .002, .08, .34); base.contactShadowOpacity = clamp(base.contactShadowOpacity + depthDelta * .0012, .06, .22); base.dispersionAmount = clamp(base.dispersionAmount + dispersionDelta * .045, 0, .75); base.dispersionOpacity = base.dispersionAmount ? clamp(base.dispersionOpacity + Math.max(0, dispersionDelta) * .0025, .02, .08) : 0; if (state.secondaryAccent && base.id !== "prism") { base.reflectionBColor = state.secondaryAccent; base.reflectionBOpacity = Math.min(base.reflectionBOpacity || .04, .055); } if (state.smartSecondaryTintColor) { base.secondaryTintColor = state.smartSecondaryTintColor; base.secondaryTintOpacity = clamp(state.smartSecondaryTintOpacity, 0, .035); } if (state.smartReflectionColor) { base.reflectionAColor = state.smartReflectionColor; base.reflectionAOpacity = clamp(state.smartReflectionOpacity, 0, .04); } base.recommendedTextColor = state.textColor || base.recommendedTextColor; base.recommendedAccentColor = state.accentColor || base.recommendedAccentColor; return base; }
function applyMaterial(key, source = "manual") { const preset = MATERIAL_PRESETS[key] || MATERIAL_PRESETS.standard; state.materialBase = preset.id; state.glassPreset = preset.id; state.glassDepth = preset.glassDepth; state.cardOpacity = preset.cardOpacity; state.glassDispersion = preset.glassDispersion; state.glassSaturation = preset.saturation; state.glassContrast = preset.contrast; state.glassTintColor = preset.tintColor; state.glassTintOpacity = preset.tintOpacity; state.primaryAccent = preset.recommendedAccentColor; state.accentColor = preset.recommendedAccentColor; if (source === "manual" && state.subtitleColorMode === "followAccent") state.subtitleColor = state.accentColor; syncLegacyTextColor(); state.selectedTheme = -1; const rec = preset.typographyRecommendation || {}; if (!state.typographyManuallyEdited && !state.customFontName) { state.titleFontFamily = rec.titleFontFamily || state.titleFontFamily; state.bodyFontFamily = rec.bodyFontFamily || state.bodyFontFamily; if (Number.isFinite(rec.titleLetterSpacing)) state.titleLetterSpacing = rec.titleLetterSpacing; } if (source === "manual") markSmartManual(); }
function markPresetCustom() { const p = MATERIAL_PRESETS[currentMaterialBase()]; if (!p || p.glassDepth !== state.glassDepth || p.cardOpacity !== state.cardOpacity || p.glassDispersion !== state.glassDispersion || Math.abs(p.saturation - state.glassSaturation) > .001 || Math.abs(p.contrast - state.glassContrast) > .001 || Math.abs(p.tintOpacity - state.glassTintOpacity) > .001) state.glassPreset = "custom"; if ($("glassPresetLabel")) $("glassPresetLabel").textContent = state.glassPreset === "custom" ? `${MATERIAL_PRESETS[currentMaterialBase()].label} · 自定义` : MATERIAL_PRESETS[currentMaterialBase()].label; renderGlassPresets(); }
function markSmartManual() { if (suppressSmartManual || !state.smartSummary) return; state.smartSummary = "已手动调整"; if ($("smartSummary")) $("smartSummary").textContent = state.smartSummary; }
function invalidateSmartCache() { smartCache = null; }

function buildDefs(card, logoBox, material, typography) { const logoRadius = state.layoutPreset === "certificate" ? 44 : 60; const contrastIntercept = (1 - material.contrast) / 2; const edgeA = `M ${card.x + card.radius} ${card.y} H ${card.x + card.width - card.radius} Q ${card.x + card.width} ${card.y} ${card.x + card.width} ${card.y + card.radius} V ${card.y + card.height * .26}`; const edgeB = `M ${card.x + card.width - card.radius} ${card.y + card.height} H ${card.x + card.radius} Q ${card.x} ${card.y + card.height} ${card.x} ${card.y + card.height - card.radius} V ${card.y + card.height * .74}`; return `<defs>
    <clipPath id="canvasClip"><rect width="${state.width}" height="${state.height}"/></clipPath>
    <clipPath id="cardClip"><rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}"/></clipPath>
    <clipPath id="logoClip"><rect x="${logoBox.x}" y="${logoBox.y}" width="${logoBox.width}" height="${logoBox.height}" rx="${logoRadius}"/></clipPath>
    <filter id="frostedBlur" x="-10%" y="-14%" width="120%" height="128%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${material.blur}" edgeMode="duplicate" result="blur"/><feColorMatrix in="blur" type="saturate" values="${material.saturation}" result="sat"/><feComponentTransfer in="sat"><feFuncR type="linear" slope="${material.contrast}" intercept="${contrastIntercept}"/><feFuncG type="linear" slope="${material.contrast}" intercept="${contrastIntercept}"/><feFuncB type="linear" slope="${material.contrast}" intercept="${contrastIntercept}"/></feComponentTransfer></filter>
    <filter id="contactShadow" x="-8%" y="-10%" width="116%" height="124%" color-interpolation-filters="sRGB"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="${material.shadowColor}" flood-opacity="${material.contactShadowOpacity}"/></filter>
    <filter id="ambientShadow" x="-16%" y="-28%" width="132%" height="164%" color-interpolation-filters="sRGB"><feDropShadow dx="0" dy="28" stdDeviation="35" flood-color="${material.shadowColor}" flood-opacity="${material.ambientShadowOpacity}"/></filter>
    <filter id="floatingLogoShadow" x="-26%" y="-30%" width="152%" height="160%" color-interpolation-filters="sRGB"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="${material.shadowColor}" flood-opacity="${state.layoutPreset === "certificate" ? .10 : .16}"/></filter>
    <filter id="titleShadow" x="-8%" y="-12%" width="116%" height="124%" color-interpolation-filters="sRGB"><feDropShadow dx="0" dy="${typography.title.shadowOffsetY}" stdDeviation="${typography.title.shadowBlur}" flood-color="${typography.title.shadowColor}" flood-opacity="${typography.title.shadowOpacity}"/></filter>
    <filter id="descriptionShadow" x="-8%" y="-12%" width="116%" height="124%" color-interpolation-filters="sRGB"><feDropShadow dx="0" dy="${typography.description.shadowOffsetY}" stdDeviation="${typography.description.shadowBlur}" flood-color="${typography.description.shadowColor}" flood-opacity="${typography.description.shadowOpacity}"/></filter>
    <linearGradient id="glassTint" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${material.tintColor}" stop-opacity="${material.tintOpacity}"/><stop offset=".52" stop-color="${material.tintColor}" stop-opacity="${material.tintOpacity * .60}"/><stop offset="1" stop-color="${material.secondaryTintColor}" stop-opacity="${material.secondaryTintOpacity}"/></linearGradient>
    <linearGradient id="borderGradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${material.borderColor}" stop-opacity="${material.borderOpacity}"/><stop offset=".34" stop-color="${material.borderColor}" stop-opacity="${material.borderOpacity * .68}"/><stop offset=".72" stop-color="${material.borderColor}" stop-opacity="${material.borderOpacity * .28}"/><stop offset="1" stop-color="${material.borderColor}" stop-opacity="${material.borderOpacity * .52}"/></linearGradient>
    <linearGradient id="topHighlight" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${material.innerHighlightColor}" stop-opacity="${material.innerHighlightOpacity}"/><stop offset=".50" stop-color="${material.innerHighlightColor}" stop-opacity="${material.innerHighlightOpacity * .30}"/><stop offset="1" stop-color="${material.innerHighlightColor}" stop-opacity="0"/></linearGradient>
    <linearGradient id="bottomShade" x1="0" y1="0" x2="0" y2="1"><stop offset=".66" stop-color="${material.shadowColor}" stop-opacity="0"/><stop offset="1" stop-color="${material.shadowColor}" stop-opacity="${material.bottomShadeOpacity}"/></linearGradient>
    <radialGradient id="surfaceHighlight" cx="12%" cy="10%" r="62%"><stop stop-color="${material.reflectionAColor}" stop-opacity="${material.reflectionAOpacity}"/><stop offset=".60" stop-color="${material.reflectionAColor}" stop-opacity="${material.reflectionAOpacity * .20}"/><stop offset="1" stop-color="${material.reflectionAColor}" stop-opacity="0"/></radialGradient>
    <radialGradient id="coolReflection" cx="88%" cy="88%" r="58%"><stop stop-color="${material.reflectionBColor}" stop-opacity="${material.reflectionBOpacity}"/><stop offset=".62" stop-color="${material.reflectionBColor}" stop-opacity="${material.reflectionBOpacity * .22}"/><stop offset="1" stop-color="${material.reflectionBColor}" stop-opacity="0"/></radialGradient>
    <radialGradient id="secondaryAccentReflection" cx="94%" cy="16%" r="44%"><stop stop-color="${state.secondaryAccent || material.reflectionBColor}" stop-opacity="${state.secondaryAccent ? .045 : 0}"/><stop offset=".55" stop-color="${state.secondaryAccent || material.reflectionBColor}" stop-opacity="${state.secondaryAccent ? .014 : 0}"/><stop offset="1" stop-color="${state.secondaryAccent || material.reflectionBColor}" stop-opacity="0"/></radialGradient>
    <linearGradient id="systemTitleRule" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${resolvedTextColor("subtitle")}" stop-opacity="${0.28 * colorOpacity("subtitle") * clamp(state.dividerOpacity,0,100) / 100}"/><stop offset=".42" stop-color="${resolvedTextColor("title")}" stop-opacity="${0.12 * clamp(state.dividerOpacity,0,100) / 100}"/><stop offset="1" stop-color="${resolvedTextColor("title")}" stop-opacity="0"/></linearGradient>
    <linearGradient id="certificateRule" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${state.accentColor}" stop-opacity="0"/><stop offset=".5" stop-color="${state.accentColor}" stop-opacity=".20"/><stop offset="1" stop-color="${state.accentColor}" stop-opacity="0"/></linearGradient>
    <path id="edgeA" d="${edgeA}"/><path id="edgeB" d="${edgeB}"/>
  </defs>`; }
function renderGlass(card, logoBox, material, bg) { const dispersion = material.dispersionAmount; return `<g aria-label="system frosted glass card"><rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="${material.shadowColor}" fill-opacity=".01" filter="url(#ambientShadow)"/><rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="${material.shadowColor}" fill-opacity=".01" filter="url(#contactShadow)"/>${imageLayer(bg,"cardClip",{x:0,y:0,width:state.width,height:state.height},state.backgroundScale,state.backgroundX,state.backgroundY,{filter:"url(#frostedBlur)",expand:1.04})}<rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="url(#glassTint)" clip-path="url(#cardClip)"/><rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="url(#surfaceHighlight)" clip-path="url(#cardClip)"/><rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="url(#coolReflection)" clip-path="url(#cardClip)"/><rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="url(#secondaryAccentReflection)" clip-path="url(#cardClip)"/>${dispersion ? `<use href="#edgeA" xlink:href="#edgeA" transform="translate(${-dispersion},0)" fill="none" stroke="#79b7ff" stroke-opacity="${material.dispersionOpacity}" stroke-width="1"/><use href="#edgeB" xlink:href="#edgeB" transform="translate(${dispersion},0)" fill="none" stroke="#ff8a9d" stroke-opacity="${material.dispersionOpacity}" stroke-width="1"/>` : ""}<rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="none" stroke="url(#borderGradient)" stroke-width="2.5"/><rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="none" stroke="url(#topHighlight)" stroke-width="1"/><rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="none" stroke="url(#bottomShade)" stroke-width="1"/></g>`; }
function renderLogoLayer(logoBox, material, bg) {
  const logo = state.logo || buildDefaultLogo();
  const logoRadius = state.layoutPreset === "certificate" ? 44 : 60;
  const geo = logoContentGeometry(logoBox);
  const p = geo.image;
  // floating: only the card clip constrains the logo, so scaling up can never be
  // truncated by the old fixed logoBox. glass: keep the container clip.
  const clipId = state.logoStyle === "glass" ? "logoClip" : "cardClip";
  const logoPlacement = `<image href="${logo}" xlink:href="${logo}" x="${p.x}" y="${p.y}" width="${p.width}" height="${p.height}" preserveAspectRatio="none" clip-path="url(#${clipId})"/>`;
  return state.logoStyle === "glass"
    ? `<g aria-label="logo glass container"><rect x="${logoBox.x}" y="${logoBox.y}" width="${logoBox.width}" height="${logoBox.height}" rx="${logoRadius}" fill="${material.shadowColor}" fill-opacity=".01" filter="url(#floatingLogoShadow)"/>${imageLayer(bg,"logoClip",{x:0,y:0,width:state.width,height:state.height},state.backgroundScale,state.backgroundX,state.backgroundY,{filter:"url(#frostedBlur)",expand:1.04})}<rect x="${logoBox.x}" y="${logoBox.y}" width="${logoBox.width}" height="${logoBox.height}" rx="${logoRadius}" fill="url(#glassTint)"/><rect x="${logoBox.x}" y="${logoBox.y}" width="${logoBox.width}" height="${logoBox.height}" rx="${logoRadius}" fill="none" stroke="url(#borderGradient)" stroke-width="2"/><rect x="${logoBox.x}" y="${logoBox.y}" width="${logoBox.width}" height="${logoBox.height}" rx="${logoRadius}" fill="none" stroke="url(#topHighlight)" stroke-width="1"/>${logoPlacement}</g>`
    : `<g filter="url(#floatingLogoShadow)" aria-label="floating logo">${logoPlacement}</g>`;
}

/* Two-phase system typography layout.
   Phase 1 measures every glyph run's real ink bounds; phase 2 derives the whole
   text block height from those bounds and centres it on the card, then walks
   baselines back out from textBlockTop. No baseline is ever anchored to the
   card top or to the logo box. */
function layoutSystemTypography({ card, logoBox, subtitle, title, descriptionLines: descLines, typographyTokens, visibleGaps, dividerMode: dividerVisible }) {
  const t = typographyTokens;
  const hasSubtitle = Boolean(String(subtitle ?? "").trim());
  const hasDescription = Array.isArray(descLines) && descLines.length > 0;

  /* ---- Phase 1: measure ---- */
  const subtitleInk = hasSubtitle ? glyphMetrics(subtitle, t.subtitle.fontSize, t.subtitle.fontWeight, t.subtitle.family) : { ascent: 0, descent: 0, empty: true };
  const titleInk = glyphMetrics(title, t.title.fontSize, t.title.fontWeight, t.title.family);
  const descInk = hasDescription ? descLines.map(line => glyphMetrics(line, t.description.fontSize, t.description.fontWeight, t.description.family)) : [];
  const dividerHeight = dividerVisible ? 1 : 0;
  const lineGap = visibleGaps.descriptionLineBaselineGap;

  /* ---- Phase 2: arrange from a measured total height ---- */
  const segments = [];
  if (hasSubtitle) segments.push({ role: "subtitle", ink: subtitleInk });
  segments.push({ role: "title", ink: titleInk });
  if (dividerVisible) segments.push({ role: "divider", ink: { ascent: dividerHeight, descent: 0 } });
  if (hasDescription) segments.push({ role: "description", ink: descInk[0], tail: descInk.slice(1) });

  const gapBefore = (role, prevRole) => {
    if (!prevRole) return 0;
    if (role === "title" && prevRole === "subtitle") return visibleGaps.subtitleTitleVisualGap;
    if (role === "divider") return visibleGaps.titleDividerVisualGap;
    if (role === "description") return prevRole === "divider" ? visibleGaps.dividerDescriptionVisualGap : visibleGaps.titleDividerVisualGap;
    return 0;
  };

  // Total visible height = sum of ink heights + visible gaps + trailing description lines.
  let textBlockHeight = 0, prevRole = null;
  segments.forEach(seg => {
    textBlockHeight += gapBefore(seg.role, prevRole);
    textBlockHeight += seg.ink.ascent + seg.ink.descent;
    if (seg.role === "description" && seg.tail?.length) {
      // subsequent lines advance by baseline gap; the block bottom is the last line's descent
      textBlockHeight += seg.tail.length * lineGap - seg.ink.descent + seg.tail.at(-1).descent;
    }
    prevRole = seg.role;
  });

  const targetCenterY = card.y + card.height / 2 + visibleGaps.textOpticalOffsetY;
  const textBlockTop = targetCenterY - textBlockHeight / 2;

  // Walk baselines out from the measured top.
  const positions = {};
  let cursor = textBlockTop;
  prevRole = null;
  segments.forEach(seg => {
    cursor += gapBefore(seg.role, prevRole);
    if (seg.role === "divider") {
      positions.dividerY = cursor + dividerHeight / 2;
      cursor += dividerHeight;
    } else {
      const baseline = cursor + seg.ink.ascent;
      if (seg.role === "subtitle") positions.subtitleBaselineY = baseline;
      if (seg.role === "title") positions.titleBaselineY = baseline;
      if (seg.role === "description") {
        positions.descriptionBaselines = [baseline, ...(seg.tail || []).map((_, i) => baseline + (i + 1) * lineGap)];
        cursor = positions.descriptionBaselines.at(-1) + (seg.tail?.length ? seg.tail.at(-1).descent : seg.ink.descent);
        prevRole = seg.role;
        return;
      }
      // Advance past the full ink height of this run, not just its descent.
      cursor = baseline + seg.ink.descent;
    }
    prevRole = seg.role;
  });

  const textBlockBottom = textBlockTop + textBlockHeight;
  return {
    ...positions,
    textBlockTop, textBlockBottom, textBlockHeight,
    textBlockVisualCenterY: textBlockTop + textBlockHeight / 2,
    cardCenterY: card.y + card.height / 2,
    subtitleInk, titleInk, descInk, hasSubtitle, hasDescription
  };
}

function systemColumns(card, logoBox) {
  const contentX = logoBox.x + logoBox.width + Math.max(70, Math.min(86, 78));
  return { contentX, contentRight: card.x + card.width - 110 };
}
function systemTextPlan(card, logoBox, typography) {
  const { contentX, contentRight } = systemColumns(card, logoBox);
  const subtitle = typography.subtitle, titleToken = typography.title, descToken = typography.description;
  const titleFamily = fontStackForRole("title"), subtitleFamily = fontStackForRole("subtitle"), descFamily = fontStackForRole("description");
  const columnWidth = Math.max(120, contentRight - contentX);
  const title = fitTitleSingle(state.mainTitle, columnWidth, titleToken.fontSize, titleToken.minFontSize, titleToken.fontWeight, titleToken.letterSpacing, titleFamily);
  const descWidth = Math.min(state.descriptionBoxWidth, columnWidth);
  const lineCountEstimate = estimateDescriptionLineCount(descWidth, descToken.fontSize, descToken.fontWeight, descToken.letterSpacing, descFamily);
  const showDivider = shouldShowDivider(lineCountEstimate);
  const maxLines = String(state.description || "").trim() ? Math.max(1, Math.min(3, lineCountEstimate)) : 0;
  const desc = maxLines ? descriptionLines(maxLines, descWidth, descToken.fontSize, descToken.fontWeight, descToken.letterSpacing, descFamily) : { lines: [], overflow: false };
  const layout = layoutSystemTypography({
    card, logoBox,
    subtitle: state.subTitle, title: state.mainTitle, descriptionLines: desc.lines,
    typographyTokens: {
      subtitle: { ...subtitle, family: subtitleFamily },
      title: { ...titleToken, fontSize: title.size, family: titleFamily },
      description: { ...descToken, family: descFamily }
    },
    visibleGaps: {
      subtitleTitleVisualGap: Number(state.subtitleTitleVisualGap),
      titleDividerVisualGap: Number(state.titleDividerVisualGap),
      dividerDescriptionVisualGap: Number(state.dividerDescriptionVisualGap),
      descriptionLineBaselineGap: Number(state.descriptionLineBaselineGap),
      textOpticalOffsetY: Number(state.textOpticalOffsetY) || 0
    },
    dividerMode: showDivider
  });
  return { contentX, contentRight, columnWidth, title, desc, showDivider, layout, subtitle, titleToken, descToken, subtitleFamily };
}
/* ---------- Logo transparent-padding auto crop ----------
   Scans the alpha channel on a downscaled offscreen canvas (256px max edge for
   mobile performance), computes the non-transparent bounding box, pads it and
   stores it as a NORMALISED rect so no large bitmap is ever persisted. */
let logoCropCache = null;
let logoCropPending = false;
function normalizedCropFull() { return { cropX: 0, cropY: 0, cropWidth: 1, cropHeight: 1, cropped: false }; }
async function computeLogoCropBounds(src) {
  if (!src) return normalizedCropFull();
  if (logoCropCache?.src === src) return logoCropCache.bounds;
  let bounds = normalizedCropFull();
  try {
    const img = await imageFromSource(src);
    const sw = img.naturalWidth || img.width, sh = img.naturalHeight || img.height;
    if (!sw || !sh) return bounds;
    bounds.srcAspect = sw / sh;
    const ratio = Math.min(1, ALPHA_SCAN_EDGE / Math.max(sw, sh));
    const w = Math.max(1, Math.round(sw * ratio)), h = Math.max(1, Math.round(sh * ratio));
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = w; canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    let minX = w, minY = h, maxX = -1, maxY = -1, opaque = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] < ALPHA_MIN) continue;
        opaque++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    canvas.width = canvas.height = 0;
    // No transparency at all (or fully transparent) -> keep the original canvas.
    if (maxX < 0 || opaque === w * h) return (logoCropCache = { src, bounds }).bounds;
    let bx = minX / w, by = minY / h, bw = (maxX - minX + 1) / w, bh = (maxY - minY + 1) / h;
    if (bw >= .995 && bh >= .995) return (logoCropCache = { src, bounds }).bounds;
    const padX = bw * LOGO_CROP_PADDING, padY = bh * LOGO_CROP_PADDING;
    bx = Math.max(0, bx - padX); by = Math.max(0, by - padY);
    bw = Math.min(1 - bx, bw + padX * 2); bh = Math.min(1 - by, bh + padY * 2);
    bounds = { cropX: bx, cropY: by, cropWidth: bw, cropHeight: bh, cropped: true, srcAspect: sw / sh };
  } catch (_) { bounds = normalizedCropFull(); }
  logoCropCache = { src, bounds };
  return bounds;
}
function activeLogoCrop() {
  const b = state.logoCropBounds;
  const srcAspect = Number(b?.srcAspect);
  if (state.logoCropMode === "original") return { ...normalizedCropFull(), srcAspect };
  if (!b || !Number.isFinite(b.cropWidth) || !Number.isFinite(b.cropHeight) || b.cropWidth <= 0 || b.cropHeight <= 0) return { ...normalizedCropFull(), srcAspect };
  return { cropX: b.cropX || 0, cropY: b.cropY || 0, cropWidth: b.cropWidth, cropHeight: b.cropHeight, cropped: b.cropped !== false, srcAspect };
}
async function refreshLogoCropBounds({ recomputeScale = false } = {}) {
  if (!state.logo) { state.logoCropBounds = null; return; }
  state.logoCropBounds = await computeLogoCropBounds(state.logo);
  if (recomputeScale) state.logoScale = DEFAULTS.logoScale;
}
/* Geometry of the visible (effective) logo content, honouring the crop.
   The placement rect is expanded so the CROPPED content — not the raw PNG —
   ends up at the requested visual size, keeping aspect ratio intact. */
function logoContentGeometry(logoBox) {
  const crop = activeLogoCrop();
  // Self-heal: if bounds/aspect are missing (e.g. restored from an older cache),
  // schedule a recompute so the badge never stays at a wrong 1:1 ratio.
  if (state.logo && !state.logoCropBounds && !logoCropPending) { logoCropPending = true; refreshLogoCropBounds().then(() => { logoCropPending = false; scheduleRender(); }).catch(() => { logoCropPending = false; }); }
  const scale = clamp(Number(state.logoScale) || 100, 40, 600) / 100;
  const targetBase = Math.min(logoBox.width, logoBox.height);
  const aspect = logoNaturalAspect();
  // Effective content box before user scaling: fit inside the logo box.
  let contentW = targetBase, contentH = targetBase;
  if (aspect > 1) contentH = targetBase / aspect; else if (aspect < 1) contentW = targetBase * aspect;
  contentW *= scale; contentH *= scale;
  const centerX = logoBox.x + logoBox.width / 2 + (Number(state.logoX) || 0) / 100 * LOGO_OFFSET_RANGE.x;
  const centerY = logoBox.y + logoBox.height / 2 + (Number(state.logoY) || 0) / 100 * LOGO_OFFSET_RANGE.y;
  // Expand the drawn image so that only the crop region covers the content box.
  const drawW = contentW / crop.cropWidth, drawH = contentH / crop.cropHeight;
  const image = { x: centerX - contentW / 2 - crop.cropX * drawW, y: centerY - contentH / 2 - crop.cropY * drawH, width: drawW, height: drawH };
  // True visible ink extent. With auto crop this equals the content box; with
  // "original canvas" the artwork keeps its transparent margins, so the badge
  // the user actually sees is proportionally smaller.
  const raw = state.logoCropBounds;
  const hasInk = raw && raw.cropped !== false && Number.isFinite(Number(raw.cropWidth)) && Number.isFinite(Number(raw.cropHeight));
  const visible = crop.cropped || !hasInk
    ? { x: centerX - contentW / 2, y: centerY - contentH / 2, width: contentW, height: contentH }
    : { x: image.x + Number(raw.cropX) * drawW, y: image.y + Number(raw.cropY) * drawH, width: drawW * Number(raw.cropWidth), height: drawH * Number(raw.cropHeight) };
  return {
    crop,
    content: { x: centerX - contentW / 2, y: centerY - contentH / 2, width: contentW, height: contentH },
    visible,
    image: { x: centerX - contentW / 2 - crop.cropX * drawW, y: centerY - contentH / 2 - crop.cropY * drawH, width: drawW, height: drawH },
    centerX, centerY
  };
}
/* Source aspect is stored alongside the normalised crop so geometry is fully
   synchronous after restore — otherwise the first paint could use a stale 1:1
   ratio and the badge would visibly resize once the async probe resolved. */
let logoAspectCache = { src: "", aspect: 1 };
function logoNaturalAspect() {
  const crop = activeLogoCrop();
  const stored = Number(state.logoCropBounds?.srcAspect);
  const base = Number.isFinite(stored) && stored > 0 ? stored : (logoAspectCache.aspect || 1);
  return base * (crop.cropWidth / crop.cropHeight);
}
async function refreshLogoAspect() {
  const src = state.logo;
  if (!src) { logoAspectCache = { src: "", aspect: 1 }; return; }
  if (logoAspectCache.src === src) return;
  try { const img = await imageFromSource(src); const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height; logoAspectCache = { src, aspect: h ? w / h : 1 }; }
  catch (_) { logoAspectCache = { src, aspect: 1 }; }
}
function updateLayoutDiagnostics(card, logoBox, layout) {
  const el = $("layoutDiagnostics");
  if (!el) return;
  const delta = Math.abs(layout.textBlockVisualCenterY - layout.cardCenterY - (Number(state.textOpticalOffsetY) || 0));
  const geo = logoContentGeometry(logoBox);
  const box = geo.visible || geo.content;
  const safeTop = box.y - card.y, safeBottom = card.y + card.height - (box.y + box.height);
  const clipped = safeTop < 0 || safeBottom < 0;
  const warn = $("logoSafeWarning");
  if (warn) warn.textContent = clipped ? "Logo 已超出卡片安全区域，导出时将被裁切。" : "";
  el.textContent = `文字块 ${Math.round(layout.textBlockHeight)}px · 居中偏差 ${delta.toFixed(1)}px · Logo 有效 ${Math.round(box.width)}×${Math.round(box.height)}px`;
}

function renderSystemCard(card, logoBox, material, typography) {
  const bg = state.background || buildDefaultBackground();
  const plan = systemTextPlan(card, logoBox, typography);
  const { contentX, contentRight, title, desc, showDivider, layout, subtitle, titleToken, descToken } = plan;
  const subtitleMetrics = layout.subtitleInk;
  const subtitleBaselineY = layout.subtitleBaselineY;
  const titleBaselineY = layout.titleBaselineY;
  const lineY = layout.dividerY;
  const descBaselines = layout.descriptionBaselines || [];
  if ($("titleWarning")) $("titleWarning").textContent = title.overflow ? "标题过长，已缩小至最小字号；请缩短文字以避免导出溢出。" : "";
  if ($("descriptionWarning")) $("descriptionWarning").textContent = desc.overflow ? "内容过长，导出时将以省略号显示最后一行。" : "";
  updateLayoutDiagnostics(card, logoBox, layout);
  const marker = state.showSubtitleMarker && layout.hasSubtitle ? `<circle cx="${contentX + 4}" cy="${subtitleBaselineY - subtitleMetrics.ascent / 2 + subtitleMetrics.descent / 2}" r="4" fill="${resolvedTextColor("subtitle")}" opacity="${Math.min(.82, colorOpacity("subtitle"))}"/>` : "";
  const subtitleX = state.showSubtitleMarker ? contentX + 23 : contentX;
  const dividerW = Math.min(state.dividerWidth, contentRight - contentX);
  return `${renderGlass(card, logoBox, material, bg)}${renderLogoLayer(logoBox, material, bg)}<g aria-label="typography" clip-path="url(#cardClip)" style="--subtitle-size:${subtitle.fontSize}px;--subtitle-weight:${subtitle.fontWeight};--subtitle-spacing:${subtitle.letterSpacing}px;--title-weight:${titleToken.fontWeight};--title-spacing:${titleToken.letterSpacing}px;--desc-size:${descToken.fontSize}px;--desc-weight:${descToken.fontWeight};--desc-spacing:${descToken.letterSpacing}px">${marker}${layout.hasSubtitle ? `<text x="${subtitleX}" y="${subtitleBaselineY}" class="subtitle-text" fill="${roleColor(subtitle)}" opacity="${colorOpacity("subtitle")}">${escapeXml(state.subTitle)}</text>` : ""}<text x="${contentX}" y="${titleBaselineY}" class="title-text" font-size="${title.size}" fill="${roleColor(titleToken)}" opacity="${colorOpacity("title")}" filter="url(#titleShadow)">${escapeXml(state.mainTitle)}</text>${showDivider ? `<rect x="${contentX}" y="${lineY - .5}" width="${dividerW}" height="1" fill="url(#systemTitleRule)"/>` : ""}${desc.lines.length ? `<text x="${contentX}" y="${descBaselines[0]}" class="description-text" fill="${roleColor(descToken)}" opacity="${colorOpacity("body")}" filter="url(#descriptionShadow)">${desc.lines.map((line,i) => `<tspan x="${contentX}" y="${descBaselines[i]}">${escapeXml(line)}</tspan>`).join("")}</text>` : ""}</g>`;
}
function renderCertificateCard(card, logoBox, material, typography) {
  const bg = state.background || buildDefaultBackground();
  const centerX = card.x + card.width / 2;
  const subtitle = typography.subtitle, titleToken = typography.title, descToken = typography.description;
  const titleFamily = fontStackForRole("title"), descFamily = fontStackForRole("description");
  const subtitleY = logoBox.y + logoBox.height + 70;
  const titleMaxWidth = card.width - 230;
  const title = fitCertificateTitle(state.mainTitle, titleMaxWidth, titleToken.fontSize, titleToken.minFontSize, titleToken.fontWeight, Math.max(1, titleToken.letterSpacing), titleFamily);
  const firstTitleBaseline = subtitleY + 98;
  const titleLineGap = title.size * titleToken.lineHeight;
  const lineY = firstTitleBaseline + (title.lines.length - 1) * titleLineGap + title.size * .42 + 80;
  const descWidth = Math.min(820, state.descriptionBoxWidth);
  const descMetrics = textMetrics(descToken.fontSize, descToken.fontWeight, descFamily);
  const descTopY = lineY + 78;
  const availableHeight = card.y + card.height - 60 - descTopY;
  const maxLines = Math.max(1, Math.min(3, 1 + Math.floor(Math.max(0, availableHeight - descToken.fontSize) / state.descriptionLineBaselineGap)));
  const desc = descriptionLines(maxLines, descWidth, descToken.fontSize, descToken.fontWeight, descToken.letterSpacing, descFamily);
  if ($("titleWarning")) $("titleWarning").textContent = title.overflow ? "标题过长，已尽量缩小；典藏证书最多显示两行。" : "";
  if ($("descriptionWarning")) $("descriptionWarning").textContent = desc.overflow ? "内容过长，导出时将以省略号显示最后一行。" : "";
  const dot = 4;
  return `${renderGlass(card, logoBox, material, bg)}${renderLogoLayer(logoBox, material, bg)}<g aria-label="certificate typography" text-anchor="middle" style="--subtitle-size:${subtitle.fontSize}px;--subtitle-weight:${subtitle.fontWeight};--subtitle-spacing:${subtitle.letterSpacing}px;--title-weight:${titleToken.fontWeight};--title-spacing:${Math.max(1, titleToken.letterSpacing)}px;--desc-size:${descToken.fontSize}px;--desc-weight:${descToken.fontWeight};--desc-spacing:${descToken.letterSpacing}px"><text x="${centerX}" y="${subtitleY}" class="subtitle-text" fill="${roleColor(subtitle)}" opacity="${colorOpacity("subtitle")}">${escapeXml(state.subTitle)}</text><text x="${centerX}" y="${firstTitleBaseline}" class="title-text" font-size="${title.size}" fill="${roleColor(titleToken)}" opacity="${colorOpacity("title")}" filter="url(#titleShadow)">${title.lines.map((line,i) => `<tspan x="${centerX}" dy="${i ? titleLineGap : 0}">${escapeXml(line)}</tspan>`).join("")}</text><rect x="${centerX - Math.min(state.dividerWidth, 360) / 2}" y="${lineY - .5}" width="${Math.min(state.dividerWidth, 360)}" height="1" fill="url(#certificateRule)"/><rect x="${centerX - dot / 2}" y="${lineY - dot / 2}" width="${dot}" height="${dot}" transform="rotate(45 ${centerX} ${lineY})" fill="${state.accentColor}" opacity=".28"/><text x="${centerX}" y="${descTopY + descMetrics.ascent}" class="description-text" fill="${roleColor(descToken)}" opacity="${colorOpacity("body")}" filter="url(#descriptionShadow)">${desc.lines.map((line,i) => `<tspan x="${centerX}" dy="${i ? state.descriptionLineBaselineGap : 0}">${escapeXml(line)}</tspan>`).join("")}</text></g>`;
}
function estimateDescriptionLineCount(width = state.descriptionBoxWidth, size = 32, weight = 400, spacing = state.descLetterSpacing, family = fontStackForRole("description")) { const text = String(state.description || "").trim(); if (!text) return 0; const lines=[]; for (const manual of text.split(/\r?\n/)) lines.push(...wrapMeasuredLine(manual, width, size, weight, spacing, family)); return Math.max(1, Math.min(3, lines.length)); }
function computeSystemAutoLayout() { const lineCount = estimateDescriptionLineCount(860, 32, 400, state.descLetterSpacing, fontStackForRole("description")); const base = AUTO_LAYOUT.system[Math.max(0, Math.min(3, lineCount))] || AUTO_LAYOUT.system[3]; return { ...base, lineCount }; }
function shouldShowDivider(lineCount) { if (state.dividerMode === "show") return true; if (state.dividerMode === "hide") return false; return lineCount > 0; }
function layoutGeometry() {
  if (state.layoutPreset === "certificate") { const base = { x: 226, y: 245, width: 1480, height: 870, radius: 84 }; const scale = clamp(state.cardScale || 100, 86, 108) / 100; const card = { width: base.width * scale, height: base.height * scale, radius: base.radius * scale }; card.x = base.x + (base.width - card.width) / 2 + (state.cardPositionMode === "custom" ? state.cardX : 0); card.y = base.y + (base.height - card.height) / 2 + (state.cardPositionMode === "custom" ? state.cardY : 0); const size = 210 * scale; const logoBox = { x: card.x + (card.width - size) / 2, y: card.y + 92 * scale + state.logoOpticalOffsetY, width: size, height: size }; return { card, logoBox }; }
  const auto = computeSystemAutoLayout();
  const baseWidth = 1556, scale = clamp(state.cardScale || 100, 86, 108) / 100;
  const height = (state.cardHeightMode === "fixed" ? state.cardHeight : auto.height) * scale;
  const width = baseWidth * scale;
  const card = {
    x: (state.width - width) / 2 + (state.cardPositionMode === "custom" ? state.cardX : 0),
    y: (state.height - height) / 2 + (state.cardPositionMode === "custom" ? state.cardY : 0),
    width, height,
    radius: (state.cardHeightMode === "fixed" ? 92 : auto.radius) * scale
  };
  // Logo column: fixed 320px column, content area independently centred on the card.
  const columnWidth = 320 * scale;
  const boxSize = (state.logoStyle === "glass" ? clamp(Number(state.logoContainerSize) || auto.logoContainerSize, 220, 460) : auto.logoTarget) * scale;
  const logoBox = { x: card.x + 118 * scale + (columnWidth - boxSize) / 2, width: boxSize, height: boxSize };
  logoBox.y = card.y + (card.height - boxSize) / 2 + (Number(state.logoOpticalOffsetY) || 0);
  logoBox.columnX = card.x + 118 * scale;
  logoBox.columnWidth = columnWidth;
  return { card, logoBox };
}
function textAreaGeometry(card, logoBox) { if (state.layoutPreset === "certificate") return { x: card.x + 330, y: card.y + 555, width: Math.min(820, state.descriptionBoxWidth), height: 260 }; const contentX = logoBox.x + logoBox.width + 78; return { x: contentX, y: logoBox.y, width: Math.min(state.descriptionBoxWidth, card.x + card.width - 110 - contentX), height: card.height - 140 }; }
function renderSvg() { const { card, logoBox } = layoutGeometry(); const material = currentMaterialToken(); const typography = currentTypography(); const bg = state.background || buildDefaultBackground(); svg.setAttribute("viewBox", `0 0 ${state.width} ${state.height}`); svg.setAttribute("width", state.width); svg.setAttribute("height", state.height); svg.setAttribute("xmlns", "http://www.w3.org/2000/svg"); svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink"); const cardMarkup = state.layoutPreset === "certificate" ? renderCertificateCard(card, logoBox, material, typography) : renderSystemCard(card, logoBox, material, typography); svg.innerHTML = `${styleBlock()}${buildDefs(card,logoBox,material,typography)}<rect width="100%" height="100%" fill="#070A12"/>${imageLayer(bg,"canvasClip",{x:0,y:0,width:state.width,height:state.height},state.backgroundScale,state.backgroundX,state.backgroundY,{opacity:state.backgroundOpacity/100})}${cardMarkup}`; svg.style.width = `${state.zoom}%`; if ($("zoomReadout")) $("zoomReadout").textContent = `${state.zoom}%`; if ($("dpiInfo")) $("dpiInfo").textContent = `${state.width}×${state.height} 高清 PNG`; renderSelection(card, logoBox); updateAssetCards(); }
function scheduleRender() { if (renderQueued) return; renderQueued = true; requestAnimationFrame(() => { renderQueued = false; renderSvg(); }); }

function createRange(key) { const [min,max,step] = RANGE_CONFIG[key]; const wrap = document.createElement("label"); wrap.textContent = RANGE_LABELS[key]; const control = document.createElement("div"); control.className = "range-control"; const range = document.createElement("input"); range.type = "range"; range.min = min; range.max = max; range.step = step; range.value = state[key]; range.id = key; range.setAttribute("aria-label", RANGE_LABELS[key]); const number = document.createElement("input"); number.type = "number"; number.min = min; number.max = RANGE_INPUT_MAX[key] ?? max; number.step = step; number.value = state[key]; number.id = `${key}Number`; number.className = "range-number"; const reset = document.createElement("button"); reset.type = "button"; reset.className = "reset-mini"; reset.textContent = "复原"; reset.title = "复原此项默认值"; control.append(range,number,reset); wrap.append(control); const inputMax = RANGE_INPUT_MAX[key] ?? max; const set = (v, viaNumber = false) => { state[key] = clamp(v, min, viaNumber ? inputMax : max); if (["subtitleTitleVisualGap","titleDividerVisualGap","dividerDescriptionVisualGap","descriptionLineBaselineGap","dividerWidth","textOpticalOffsetY","logoOpticalOffsetY"].includes(key)) state.layoutDensityMode = "custom"; if (["cardHeight"].includes(key)) state.cardHeightMode = "fixed"; if (["cardX","cardY","cardScale"].includes(key)) state.cardPositionMode = "custom"; syncRange(key); if (["glassDepth","cardOpacity","glassDispersion","glassSaturation","glassContrast","glassTintOpacity"].includes(key)) { markPresetCustom(); markSmartManual(); invalidateSmartCache(); } if (["backgroundScale","backgroundX","backgroundY","backgroundOpacity","cardX","cardY","cardScale","textOpticalOffsetY","subtitleTitleVisualGap","titleDividerVisualGap","dividerDescriptionVisualGap","descriptionLineBaselineGap","descriptionBoxWidth","cardHeight"].includes(key)) invalidateSmartCache(); scheduleRender(); queuePersist(); }; range.addEventListener("pointerdown", beginInteraction); range.addEventListener("input", e => set(e.target.value)); range.addEventListener("change", endInteraction); number.addEventListener("focus", beginInteraction); number.addEventListener("input", e => set(e.target.value, true)); number.addEventListener("change", endInteraction); reset.addEventListener("click", () => { beginInteraction(); set(DEFAULTS[key]); endInteraction(); }); return wrap; }
function setupRanges() { Object.entries(RANGE_GROUPS).forEach(([group,keys]) => { const target = $(`${group}RangeControls`); if (!target) return; target.innerHTML = ""; keys.forEach(k => target.append(createRange(k))); }); }
function syncRange(key) { [$(key), $(`${key}Number`)].forEach(el => { if (el) el.value = Number.isFinite(Number(state[key])) ? Number(state[key]).toFixed(RANGE_CONFIG[key]?.[2] < 1 ? 2 : 0).replace(/\.00$/, "") : state[key]; }); }
function textRoleConfig(role) { return {
  title: { colorKey:"titleColor", modeKey:"titleColorMode", opacityKey:"titleOpacity", sourceKey:"titleColorSource", contrastKey:"titleContrast", minContrast:3, picker:"titleColorPicker", hex:"titleColorHex", range:"titleOpacity", number:"titleOpacityNumber", meta:"titleColorMeta", error:"titleColorError", label:"主标题" },
  subtitle: { colorKey:"subtitleColor", modeKey:"subtitleColorMode", opacityKey:"subtitleOpacity", sourceKey:"subtitleColorSource", contrastKey:"subtitleContrast", minContrast:3, picker:"subtitleColorPicker", hex:"subtitleColorHex", range:"subtitleOpacity", number:"subtitleOpacityNumber", meta:"subtitleColorMeta", error:"subtitleColorError", label:"副标题" },
  body: { colorKey:"bodyTextColor", modeKey:"bodyTextColorMode", opacityKey:"bodyTextOpacity", sourceKey:"bodyTextColorSource", contrastKey:"bodyTextContrast", minContrast:4.5, picker:"bodyTextColorPicker", hex:"bodyTextColorHex", range:"bodyTextOpacity", number:"bodyTextOpacityNumber", meta:"bodyTextColorMeta", error:"bodyTextColorError", label:"正文" }
}[role]; }
function syncTextColorControls() { ["title","subtitle","body"].forEach(role => { const c=textRoleConfig(role), color=normalizeHex(state[c.colorKey]) || DEFAULTS[c.colorKey], opacity=clamp(state[c.opacityKey],0,100); const picker=$(c.picker), hex=$(c.hex), range=$(c.range), num=$(c.number), mode=$(c.modeKey), meta=$(c.meta), err=$(c.error); if (picker) picker.value = color; if (hex && document.activeElement !== hex) hex.value = color; if (range) range.value = opacity; if (num) num.value = opacity; if (mode) mode.value = state[c.modeKey]; if (err && document.activeElement !== hex) err.textContent = ""; if (meta) { const ratio=Number(state[c.contrastKey] || 0); meta.textContent = `HEX：${color} · 透明度：${Math.round(opacity)}% · ${rgbString(color, opacity)} · 预计对比度：${ratio ? ratio.toFixed(1) : "--"}:1 · 来源：${state[c.modeKey] === "manual" ? "手动" : (state[c.sourceKey] || "自动")}`; meta.classList.toggle("warning", !!ratio && ratio < c.minContrast); } }); }
function commitTextColor(role, raw, source="manual") { const c=textRoleConfig(role), hex=normalizeHex(raw); if (!hex) { const err=$(c.error); if (err) err.textContent="请输入 #RGB 或 #RRGGBB"; return false; } state[c.colorKey]=hex; state[c.modeKey]="manual"; state[c.sourceKey]=source === "picker" ? "手动颜色选择器" : "手动 HEX"; syncLegacyTextColor(); syncTextColorControls(); scheduleRender(); queuePersist(); return true; }
function setTextOpacity(role, value) { const c=textRoleConfig(role); state[c.opacityKey]=clamp(Number(value), Number($(c.range)?.min || 0), Number($(c.range)?.max || 100)); state[`${c.opacityKey}ManuallyEdited`] = true; syncTextColorControls(); scheduleRender(); queuePersist(); }
function syncUi() { normalizeState(); Object.keys(RANGE_CONFIG).forEach(syncRange); ["mainTitle","subTitle","description","fontFamily","titleFontFamily","bodyFontFamily","customFontScope","logoStyle","accentColor","glassTintColor","cardHeightMode","dividerMode","cardPositionMode","layoutDensityMode","logoCropMode","titleColorMode","subtitleColorMode","bodyTextColorMode"].forEach(key => { if ($(key)) $(key).value = state[key]; }); syncTextColorControls(); if ($("showSubtitleMarker")) $("showSubtitleMarker").value = String(state.showSubtitleMarker); if ($("logoContainerSize")) { const wrap = $("logoContainerSize").closest("label"); if (wrap) wrap.hidden = state.logoStyle !== "glass"; } if ($("glassPresetLabel")) $("glassPresetLabel").textContent = state.glassPreset === "custom" ? `${MATERIAL_PRESETS[currentMaterialBase()].label} · 自定义` : MATERIAL_PRESETS[currentMaterialBase()].label; if ($("smartSummary")) $("smartSummary").textContent = state.smartSummary || ""; renderGlassPresets(); renderLayoutPresets(); renderThemeChoices(); }
function queuePersist() { clearTimeout(persistTimer); persistTimer = setTimeout(persist, 220); }
function materialSwatchStyle(p) { return `--m-tint:${p.tintColor};--m-tint2:${p.secondaryTintColor};--m-border:${p.borderColor};--m-ref-a:${p.reflectionAColor};--m-ref-b:${p.reflectionBColor};--m-alpha:${p.tintOpacity};--m-b:${p.borderOpacity};`; }
function renderGlassPresets() { const host = $("glassPresets"); if (!host) return; host.innerHTML = MATERIAL_ORDER.map(key => { const p = MATERIAL_PRESETS[key], active = currentMaterialBase() === key; return `<button class="glass-preset material-${key} ${active ? "active" : ""}" type="button" data-preset="${key}" aria-pressed="${active}" style="${materialSwatchStyle(p)}"><span class="preset-swatch" aria-hidden="true"><i></i><b></b></span><span>${p.label}</span><small>${p.description}</small></button>`; }).join(""); host.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => { beginInteraction(); applyMaterial(btn.dataset.preset, "manual"); syncUi(); scheduleRender(); endInteraction(); })); }
function renderLayoutPresets() { const host = $("layoutPresets"); if (!host) return; host.innerHTML = Object.values(LAYOUT_PRESETS).map(p => `<button type="button" class="layout-preset ${state.layoutPreset === p.id ? "active" : ""}" data-layout="${p.id}" aria-pressed="${state.layoutPreset === p.id}">${p.label}</button>`).join(""); host.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => { beginInteraction(); const next = btn.dataset.layout; state.layoutPreset = next; if (next === "certificate") { state.showSubtitleMarker = false; if (!state.customFontName && !state.typographyManuallyEdited && (state.titleFontFamily === "system" || state.titleFontFamily === "follow")) state.titleFontFamily = "song"; } syncUi(); scheduleRender(); endInteraction(); })); }
function renderThemeChoices() { const host = $("themePalette"); if (!host) return; if (!state.themes.length) { host.innerHTML = `<p class="theme-empty">上传底图后，将自动生成对比更稳妥的配色。</p>`; return; } host.innerHTML = state.themes.map((theme,i) => `<button type="button" class="theme-option ${state.selectedTheme===i?"selected":""}" data-index="${i}" aria-label="应用${theme.name}"><span class="theme-swatches"><i style="background:${theme.accentColor}"></i><i style="background:${theme.textColor}"></i></span><span>${theme.name}</span><small>${theme.accentColor} / ${theme.textColor}</small></button>`).join(""); host.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => { beginInteraction(); const i=Number(btn.dataset.index), t=state.themes[i]; state.accentColor=t.accentColor; state.primaryAccent=t.accentColor; if (state.subtitleColorMode==="followAccent") state.subtitleColor=t.accentColor; if (state.titleColorMode!=="manual") state.titleColor=t.textColor; if (state.bodyTextColorMode!=="manual") state.bodyTextColor=t.textColor; syncLegacyTextColor(); state.selectedTheme=i; markSmartManual(); syncUi(); scheduleRender(); endInteraction(); })); }
function extractThemeColors(dataUrl) { const img = new Image(); img.onload = () => { const canvas=document.createElement("canvas"), ctx=canvas.getContext("2d",{willReadFrequently:true}); canvas.width=canvas.height=72; ctx.drawImage(img,0,0,72,72); const d=ctx.getImageData(0,0,72,72).data; const bins=new Map(); for(let i=0;i<d.length;i+=32){if(d[i+3]<160)continue;const r=d[i],g=d[i+1],b=d[i+2];const k=[r,g,b].map(v=>Math.floor(v/32)*32).join(",");const v=bins.get(k)||{r:0,g:0,b:0,c:0};v.r+=r;v.g+=g;v.b+=b;v.c++;bins.set(k,v);} const colors=[...bins.values()].sort((a,b)=>b.c-a.c).slice(0,4).map(v=>({r:v.r/v.c,g:v.g/v.c,b:v.b/v.c})); const textFor=c=>luminance(c)>.48?"#111318":"#FFFFFF"; state.themes=colors.map((c,i)=>({name:["主色平衡","柔和对比","明亮强调","深色强调"][i],accentColor:rgbToHex(c),textColor:textFor(c)})); renderThemeChoices(); canvas.width = canvas.height = 0; }; img.src=dataUrl; }

function updateAssetCards() { const pairs=[ ["background","backgroundThumb","backgroundFileName","backgroundUploadTitle"], ["logo","logoThumb","logoFileName","logoUploadTitle"] ]; pairs.forEach(([kind,thumb,name,title])=>{const data=state[kind]; if ($(thumb)) $(thumb).style.backgroundImage=data?`url("${data}")`:""; if ($(name)) $(name).textContent=data?(kind==="background"?"已载入底图":"已载入 Logo"):(kind==="background"?"PNG、JPEG、WebP、浏览器可解码照片，最大 20MB":"PNG、JPEG、WebP，最大 20MB"); if ($(title)) $(title).textContent=data?(kind==="background"?"当前底图":"当前 Logo"):(kind==="background"?"上传底图":"上传 Logo");}); if ($("fontStatus")) $("fontStatus").textContent=state.customFontFileName?`${state.customFontFileName} 已加载`:"未上传"; }
function validateImage(file) { if (!file) return ""; if (!file.type.startsWith("image/")) return "请选择图片文件。"; if (file.size > MAX_FILE_SIZE) return "图片超过 20MB，请压缩后重试。"; return ""; }
async function decodeImageBlob(blob) { if (window.createImageBitmap) { try { return await createImageBitmap(blob, { imageOrientation: "from-image" }); } catch (_) {} } const url = URL.createObjectURL(blob); try { const img = new Image(); img.decoding = "async"; img.src = url; await img.decode(); return img; } finally { setTimeout(() => URL.revokeObjectURL(url), 5000); } }
async function downsampleImage(file, kind) { const decoded = await decodeImageBlob(file); const sourceWidth = decoded.width, sourceHeight = decoded.height; const edge = Math.max(sourceWidth, sourceHeight); const ratio = Math.min(1, MAX_WORK_IMAGE_EDGE / edge); const targetWidth = Math.max(1, Math.round(sourceWidth * ratio)); const targetHeight = Math.max(1, Math.round(sourceHeight * ratio)); const canvas = document.createElement("canvas"), ctx = canvas.getContext("2d"); canvas.width = targetWidth; canvas.height = targetHeight; if (!ctx) throw new Error("浏览器无法处理图片画布"); ctx.drawImage(decoded, 0, 0, targetWidth, targetHeight); if (decoded.close) decoded.close(); const type = file.type === "image/png" && kind === "logo" ? "image/png" : "image/jpeg"; const quality = type === "image/jpeg" ? .92 : undefined; const blob = await new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("图片转换失败")), type, quality)); canvas.width = canvas.height = 0; return await new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = reject; r.readAsDataURL(blob); }); }
async function readAsset(file, kind) { const error=$(kind==="background"?"backgroundError":"logoError"), msg=validateImage(file); if (error) error.textContent=msg; if(msg)return; try { const url=await downsampleImage(file, kind); beginInteraction(); state.editorTarget=kind; state[kind]=url; if(kind==="background"){extractThemeColors(url);state.backgroundScale=100;state.backgroundX=0;state.backgroundY=0;invalidateSmartCache();} else {state.logoScale=DEFAULTS.logoScale;state.logoX=0;state.logoY=0;logoCropCache=null;logoAspectCache={src:"",aspect:1};await refreshLogoAspect();await refreshLogoCropBounds();} syncUi(); scheduleRender(); endInteraction(); } catch (_) { const heic = /hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name); if (error) error.textContent = heic ? "当前浏览器无法读取该照片格式，请在照片中导出为 JPEG/PNG 后重试。" : "图片无法解码，请更换一个有效文件。"; } }
function setupUpload(kind) { const card=$(kind==="background"?"backgroundUploadCard":"logoUploadCard"), input=$(kind==="background"?"backgroundInput":"logoInput"), replace=$(kind==="background"?"replaceBackground":"replaceLogo"), clear=$(kind==="background"?"clearBackground":"clearLogo"); const trigger=()=>{state.editorTarget=kind; input.click();}; card.addEventListener("click",trigger); card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();trigger();}}); replace.addEventListener("click",trigger); input.addEventListener("change",e=>readAsset(e.target.files[0],kind)); ["dragenter","dragover"].forEach(t=>card.addEventListener(t,e=>{e.preventDefault();state.editorTarget=kind;card.classList.add("drag-over");})); ["dragleave","drop"].forEach(t=>card.addEventListener(t,e=>{e.preventDefault();card.classList.remove("drag-over");})); card.addEventListener("drop",e=>readAsset(e.dataTransfer.files[0],kind)); clear.addEventListener("click",()=>{beginInteraction();state.editorTarget=kind;state[kind]="";if(kind==="background"){state.themes=[];state.selectedTheme=-1;invalidateSmartCache();}input.value="";syncUi();scheduleRender();endInteraction();}); }
async function registerCustomFont(show = true) { if (!state.customFontData || !state.customFontName) return; if (!window.FontFace || !document.fonts) { showToast("当前浏览器不支持可靠加载自定义字体。", "error", true); return; } const face=new FontFace(state.customFontName,`url(${state.customFontData})`); try { await face.load(); document.fonts.add(face); await document.fonts.ready; if(show)showToast("自定义字体已加载"); } catch (_) { if ($("fontStatus")) $("fontStatus").textContent="字体加载失败"; showToast("字体加载失败，无法可靠导出。","error",true); } }
function setupFontUpload() { $("fontInput").addEventListener("change", async e=>{const file=e.target.files[0];if(!file)return; if(file.size>MAX_FILE_SIZE){$("fontStatus").textContent="字体超过 20MB";return;} const ext=(file.name.split(".").pop()||"ttf").toLowerCase(); const fmt={ttf:"truetype",otf:"opentype",woff:"woff",woff2:"woff2"}[ext]; if(!fmt){$("fontStatus").textContent="不支持该字体格式";return;} const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsDataURL(file);}); beginInteraction();state.customFontName=`UserFont${Date.now()}`;state.customFontData=data;state.customFontFormat=fmt;state.customFontFileName=file.name;state.customFontScope=state.customFontScope||"title";await registerCustomFont();syncUi();scheduleRender();endInteraction();}); }

function renderSelection(card, logoBox) { const layer=$("selectionLayer"), target=state.editorTarget; if (!layer) return; if (!target) { layer.innerHTML=""; return; } const host=$("canvasHost"), hostRect=host.getBoundingClientRect(), svgRect=svg.getBoundingClientRect(); const chosen=target==="logo"?logoContentGeometry(logoBox).content:(target==="card"?card:{x:0,y:0,width:state.width,height:state.height}); const left=(svgRect.left-hostRect.left)+chosen.x/state.width*svgRect.width, top=(svgRect.top-hostRect.top)+chosen.y/state.height*svgRect.height, w=chosen.width/state.width*svgRect.width,h=chosen.height/state.height*svgRect.height; const label = target==="logo"?"Logo":(target==="card"?"卡片":"底图"); layer.innerHTML=`<div class="selection-box" data-label="${label}" style="left:${left}px;top:${top}px;width:${w}px;height:${h}px"></div>`; }
function logicalPoint(event) { const rect=svg.getBoundingClientRect(); return { x:(event.clientX-rect.left)/rect.width*state.width, y:(event.clientY-rect.top)/rect.height*state.height }; }
function hitLogo(p, logoBox) { const b = logoContentGeometry(logoBox).content; return p.x>=b.x&&p.x<=b.x+b.width&&p.y>=b.y&&p.y<=b.y+b.height; }
function clearEditorTarget() { if (!state.editorTarget) return; state.editorTarget=null; scheduleRender(); }
function assetArea(asset) { if (asset === "logo") return layoutGeometry().logoBox; if (asset === "card") return layoutGeometry().card; return { x:0, y:0, width:state.width, height:state.height }; }
function dragAsset(asset, start, point, original) {
  const dx = point.x - start.x, dy = point.y - start.y;
  if (asset === "card") { state.cardPositionMode = "custom"; state.cardX = clamp(original.x + dx, -160, 160); state.cardY = clamp(original.y + dy, -120, 120); syncRange("cardX"); syncRange("cardY"); scheduleRender(); return; }
  if (asset === "logo") {
    // Logo offsets are percentages of a fixed pixel range around the content
    // centre, so dragging stays linear no matter how large logoScale gets.
    state.logoX = clamp(original.x + dx / LOGO_OFFSET_RANGE.x * 100, -100, 100);
    state.logoY = clamp(original.y + dy / LOGO_OFFSET_RANGE.y * 100, -100, 100);
    syncRange("logoX"); syncRange("logoY"); scheduleRender(); return;
  }
  const scale = state[`${asset}Scale`], den = Math.max(.01, (scale / 100 - 1));
  state[`${asset}X`] = clamp(original.x + dx / (assetArea(asset).width * .5 * den) * 100, -100, 100);
  state[`${asset}Y`] = clamp(original.y + dy / (assetArea(asset).height * .5 * den) * 100, -100, 100);
  syncRange(`${asset}X`); syncRange(`${asset}Y`); if (asset === "background") invalidateSmartCache(); scheduleRender();
}
function scaleAround(asset, center, oldScale, newScale, oldX, oldY) {
  if (asset === "card") { state.cardPositionMode = "custom"; state.cardScale = newScale; state.cardX = oldX; state.cardY = oldY; ["cardScale","cardX","cardY"].forEach(syncRange); scheduleRender(); return; }
  if (asset === "logo") {
    // Scale about the effective content centre; keep the pinch focus anchored so
    // the badge neither jumps nor distorts while zooming.
    const { logoBox } = layoutGeometry();
    const prevScale = oldScale;
    state.logoScale = clamp(newScale, 40, 600);
    const baseCenterX = logoBox.x + logoBox.width / 2, baseCenterY = logoBox.y + logoBox.height / 2;
    const prevCenterX = baseCenterX + oldX / 100 * LOGO_OFFSET_RANGE.x, prevCenterY = baseCenterY + oldY / 100 * LOGO_OFFSET_RANGE.y;
    const factor = state.logoScale / Math.max(1, prevScale);
    const nextCenterX = center.x - (center.x - prevCenterX) * factor;
    const nextCenterY = center.y - (center.y - prevCenterY) * factor;
    state.logoX = clamp((nextCenterX - baseCenterX) / LOGO_OFFSET_RANGE.x * 100, -100, 100);
    state.logoY = clamp((nextCenterY - baseCenterY) / LOGO_OFFSET_RANGE.y * 100, -100, 100);
    ["Scale","X","Y"].forEach(k => syncRange(`logo${k}`));
    scheduleRender(); return;
  }
  const area = assetArea(asset); const oldP = getImagePlacement(area, oldScale, oldX, oldY);
  const relX = (center.x - oldP.x) / oldP.width, relY = (center.y - oldP.y) / oldP.height;
  const baseWidth = area.width * (newScale / 100), baseHeight = area.height * (newScale / 100);
  const maxX = Math.max(.001, (baseWidth - area.width) / 2), maxY = Math.max(.001, (baseHeight - area.height) / 2);
  const desiredX = center.x - relX * baseWidth, desiredY = center.y - relY * baseHeight;
  state[`${asset}Scale`] = newScale;
  state[`${asset}X`] = clamp((desiredX - (area.x + (area.width - baseWidth) / 2)) / maxX * 100, -100, 100);
  state[`${asset}Y`] = clamp((desiredY - (area.y + (area.height - baseHeight) / 2)) / maxY * 100, -100, 100);
  ["Scale","X","Y"].forEach(k=>syncRange(`${asset}${k}`)); if(asset==="background")invalidateSmartCache(); scheduleRender();
}
function pointerDistance(a,b){return Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);}
function pointerCenter(a,b){ const rect=svg.getBoundingClientRect(); return { x:((a.clientX+b.clientX)/2-rect.left)/rect.width*state.width, y:((a.clientY+b.clientY)/2-rect.top)/rect.height*state.height }; }
function endCanvasGesture(stage) { if (!gesture) return; gesture = null; activePointers.clear(); $("canvasHost").classList.remove("canvas-editing"); stage.classList.remove("canvas-editing"); endInteraction(); }
function setupCanvasEditing() { const stage=$("previewStage"); if (window.PointerEvent) { stage.addEventListener("pointerdown",e=>{if(e.target!==svg && !svg.contains(e.target)){clearEditorTarget();return;} const p=logicalPoint(e),{card,logoBox}=layoutGeometry(); if(!gesture){state.editorTarget=hitLogo(p,logoBox)?"logo":(p.x>=card.x&&p.x<=card.x+card.width&&p.y>=card.y&&p.y<=card.y+card.height?"card":"background"); beginInteraction(); gesture={target:state.editorTarget,startPoint:p,original:state.editorTarget==="card"?{x:state.cardX,y:state.cardY,scale:state.cardScale}:{x:state[`${state.editorTarget}X`],y:state[`${state.editorTarget}Y`],scale:state[`${state.editorTarget}Scale`]}};} activePointers.set(e.pointerId,e); stage.setPointerCapture?.(e.pointerId); stage.classList.add("canvas-editing"); $("canvasHost").classList.add("canvas-editing"); renderSelection(card,logoBox); e.preventDefault();},{passive:false}); stage.addEventListener("pointermove",e=>{if(!gesture||!activePointers.has(e.pointerId))return; activePointers.set(e.pointerId,e); const points=[...activePointers.values()]; if(points.length>=2){ if(!gesture.pinchStart){ gesture.pinchStart={distance:pointerDistance(points[0],points[1]),scale:state[`${gesture.target}Scale`],x:state[`${gesture.target}X`],y:state[`${gesture.target}Y`]}; } const factor=pointerDistance(points[0],points[1])/Math.max(1,gesture.pinchStart.distance); const key=gesture.target==="card"?"cardScale":`${gesture.target}Scale`; const newScale=clamp(gesture.pinchStart.scale*factor,RANGE_CONFIG[key][0],RANGE_CONFIG[key][1]); scaleAround(gesture.target,pointerCenter(points[0],points[1]),gesture.pinchStart.scale,newScale,gesture.pinchStart.x,gesture.pinchStart.y); } else { gesture.pinchStart=null; dragAsset(gesture.target,gesture.startPoint,logicalPoint(e),gesture.original); } e.preventDefault();},{passive:false}); const finish=e=>{ if(activePointers.has(e.pointerId)){ activePointers.delete(e.pointerId); try{stage.releasePointerCapture?.(e.pointerId);}catch(_){} } if(activePointers.size===1 && gesture){ const remain=[...activePointers.values()][0]; gesture.startPoint=logicalPoint(remain); gesture.original={x:state[`${gesture.target}X`],y:state[`${gesture.target}Y`],scale:state[`${gesture.target}Scale`]}; gesture.pinchStart=null; return; } if(activePointers.size===0) endCanvasGesture(stage); }; stage.addEventListener("pointerup",finish); stage.addEventListener("pointercancel",finish); } else { setupTouchFallback(stage); }
  stage.addEventListener("wheel",e=>{const key=state.editorTarget;if(!key)return;beginInteraction();const scaleKey=key==="card"?"cardScale":`${key}Scale`;state[scaleKey]=clamp(state[scaleKey]+(e.deltaY<0?4:-4),RANGE_CONFIG[scaleKey][0],RANGE_CONFIG[scaleKey][1]);if(key==="card")state.cardPositionMode="custom";syncRange(scaleKey);if(key==="background")invalidateSmartCache();scheduleRender();endInteraction();e.preventDefault();},{passive:false}); window.addEventListener("resize",queueLayoutUpdate); window.addEventListener("orientationchange",()=>{endCanvasGesture(stage);queueLayoutUpdate();}); }
function setupTouchFallback(stage) { let touchState=null; stage.addEventListener("touchstart",e=>{if(e.target!==svg && !svg.contains(e.target))return; const t=e.touches[0], p=logicalPoint(t), {logoBox}=layoutGeometry(); state.editorTarget=hitLogo(p,logoBox)?"logo":"background"; beginInteraction(); touchState={target:state.editorTarget,start:p,original:{x:state[`${state.editorTarget}X`],y:state[`${state.editorTarget}Y`],scale:state[`${state.editorTarget}Scale`]}}; stage.classList.add("canvas-editing");}, {passive:true}); stage.addEventListener("touchmove",e=>{if(!touchState)return; if(e.touches.length===1){dragAsset(touchState.target,touchState.start,logicalPoint(e.touches[0]),touchState.original);} else if(e.touches.length>=2){const a=e.touches[0],b=e.touches[1]; if(!touchState.pinchStart) touchState.pinchStart={distance:pointerDistance(a,b),scale:state[`${touchState.target}Scale`],x:state[`${touchState.target}X`],y:state[`${touchState.target}Y`]}; const touchScaleKey=touchState.target==="card"?"cardScale":`${touchState.target}Scale`; const newScale=clamp(touchState.pinchStart.scale*(pointerDistance(a,b)/Math.max(1,touchState.pinchStart.distance)),RANGE_CONFIG[touchScaleKey][0],RANGE_CONFIG[touchScaleKey][1]); scaleAround(touchState.target,pointerCenter(a,b),touchState.pinchStart.scale,newScale,touchState.pinchStart.x,touchState.pinchStart.y);} e.preventDefault();},{passive:false}); const end=()=>{if(!touchState)return;touchState=null;stage.classList.remove("canvas-editing");endInteraction();}; stage.addEventListener("touchend",end); stage.addEventListener("touchcancel",end); }
function assetQuickActions() {
  document.querySelectorAll(".quick-actions button").forEach(btn => btn.addEventListener("click", async () => {
    const asset = btn.closest(".quick-actions").dataset.asset, action = btn.dataset.action;
    beginInteraction();
    if (asset === "card") {
      if (action === "center") { state.cardX = 0; state.cardY = 0; state.cardPositionMode = "custom"; }
      if (action === "smart") { state.cardX = 0; state.cardY = 0; state.cardPositionMode = "auto"; }
      if (action === "auto") applySmartLayoutForContent();
      if (action === "fixed") { state.cardHeightMode = "fixed"; state.cardHeight = layoutGeometry().card.height; }
      if (action === "text-center") { state.textOpticalOffsetY = 0; syncRange("textOpticalOffsetY"); }
      if (action === "logo-center") { state.logoX = 0; state.logoY = 0; state.logoOpticalOffsetY = 0; ["logoX", "logoY", "logoOpticalOffsetY"].forEach(syncRange); }
      syncUi(); scheduleRender(); endInteraction(); return;
    }
    if (asset === "logo") {
      state.editorTarget = "logo";
      const { card, logoBox } = layoutGeometry();
      // Scale is expressed against the alpha-cropped content, so 100% == "fit".
      if (action === "fit") state.logoScale = 100;
      if (action === "fill") state.logoScale = 130;
      if (action === "emphasize") {
        // Target ~51% of card height for the effective badge content.
        const geo = logoContentGeometry(logoBox);
        const currentH = geo.content.height || 1;
        const desired = card.height * .51;
        state.logoScale = clamp(state.logoScale * (desired / currentH), 40, 600);
      }
      if (action === "original") { state.logoCropMode = "auto"; await refreshLogoCropBounds(); state.logoScale = 100; }
      if (action === "center") { state.logoX = 0; state.logoY = 0; state.logoOpticalOffsetY = 0; syncRange("logoOpticalOffsetY"); }
      if (action === "reset") { ["Scale", "X", "Y"].forEach(k => state[`logo${k}`] = DEFAULTS[`logo${k}`]); state.logoOpticalOffsetY = 0; state.logoCropMode = "auto"; await refreshLogoCropBounds(); }
      ["Scale", "X", "Y"].forEach(k => syncRange(`logo${k}`));
      syncUi(); scheduleRender(); endInteraction(); return;
    }
    state.editorTarget = asset;
    if (action === "fit") state[`${asset}Scale`] = 100;
    if (action === "fill") state[`${asset}Scale`] = 130;
    if (action === "center") { state[`${asset}X`] = 0; state[`${asset}Y`] = 0; }
    if (action === "reset") ["Scale", "X", "Y"].forEach(k => state[`${asset}${k}`] = DEFAULTS[`${asset}${k}`]);
    if (asset === "background") invalidateSmartCache();
    ["Scale", "X", "Y"].forEach(k => syncRange(`${asset}${k}`));
    scheduleRender(); endInteraction();
  }));
}

function rgbToHsl({ r, g, b }) { r/=255; g/=255; b/=255; const max=Math.max(r,g,b), min=Math.min(r,g,b); let h=0, s=0, l=(max+min)/2; if(max!==min){const d=max-min; s=l>.5?d/(2-max-min):d/(max+min); h=max===r?(g-b)/d+(g<b?6:0):max===g?(b-r)/d+2:(r-g)/d+4; h*=60;} return { h, s, l }; }
function hslToRgb({ h, s, l }) { h=((h%360)+360)%360; const c=(1-Math.abs(2*l-1))*s, x=c*(1-Math.abs((h/60)%2-1)), m=l-c/2; let r=0,g=0,b=0; if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;} return { r:(r+m)*255, g:(g+m)*255, b:(b+m)*255 }; }
function srgbToLinear(v) { v /= 255; return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }
function linearToSrgb(v) { v = clamp(v, 0, 1); return 255 * (v <= .0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - .055); }
function rgbToOklab(rgb) { const r=srgbToLinear(rgb.r), g=srgbToLinear(rgb.g), b=srgbToLinear(rgb.b); const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b), m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b), s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b); return { L:.2104542553*l+.793617785*m-.0040720468*s, a:1.9779984951*l-2.428592205*m+.4505937099*s, b:.0259040371*l+.7827717662*m-.808675766*s }; }
function oklabToRgb({ L, a, b }) { const l=Math.pow(L+.3963377774*a+.2158037573*b,3), m=Math.pow(L-.1055613458*a-.0638541728*b,3), s=Math.pow(L-.0894841775*a-1.291485548*b,3); return { r:linearToSrgb(4.0767416621*l-3.3077115913*m+.2309699292*s), g:linearToSrgb(-1.2684380046*l+2.6097574011*m-.3413193965*s), b:linearToSrgb(-.0041960863*l-.7034186147*m+1.707614701*s) }; }
function rgbToOklch(rgb) { const lab=rgbToOklab(rgb); return { L:lab.L, C:Math.hypot(lab.a, lab.b), h:(Math.atan2(lab.b, lab.a) * 180 / Math.PI + 360) % 360 }; }
function oklchToRgb({ L, C, h }) { const rad=h*Math.PI/180; return oklabToRgb({ L, a:Math.cos(rad)*C, b:Math.sin(rad)*C }); }
function hueDistance(a,b){const d=Math.abs(a-b)%360;return Math.min(d,360-d);}
async function imageFromSource(src) { const img = new Image(); img.src = src; await img.decode(); return img; }
function drawBackgroundSample(ctx, img, w, h) { const p = getImagePlacement({x:0,y:0,width:state.width,height:state.height}, state.backgroundScale, state.backgroundX, state.backgroundY); ctx.drawImage(img, p.x / state.width * w, p.y / state.height * h, p.width / state.width * w, p.height / state.height * h); }
function analyzePixels(data) { const lums=[], sats=[], bins=new Map(); let rSum=0,gSum=0,bSum=0,count=0,warm=0,cold=0; for(let i=0;i<data.length;i+=4){ if(data[i+3]<20)continue; const rgb={r:data[i],g:data[i+1],b:data[i+2]}, lum=luminance(rgb), hsl=rgbToHsl(rgb); lums.push(lum); sats.push(hsl.s); rSum+=rgb.r; gSum+=rgb.g; bSum+=rgb.b; count++; if(hsl.s>.22 && ((hsl.h>=SMART_THRESHOLDS.warmHueMin&&hsl.h<=SMART_THRESHOLDS.warmHueMax)||(hsl.h>=330))) warm++; if(hsl.s>.22 && ((hsl.h>=SMART_THRESHOLDS.cyanHueMin&&hsl.h<=SMART_THRESHOLDS.cyanHueMax)||(hsl.h>=SMART_THRESHOLDS.purpleHueMin&&hsl.h<=SMART_THRESHOLDS.purpleHueMax))) cold++; if(hsl.l>.12&&hsl.l<.90&&hsl.s>.08){const key=[Math.floor(rgb.r/32)*32,Math.floor(rgb.g/32)*32,Math.floor(rgb.b/32)*32].join(","); const v=bins.get(key)||{r:0,g:0,b:0,c:0}; v.r+=rgb.r;v.g+=rgb.g;v.b+=rgb.b;v.c++;bins.set(key,v);} } lums.sort((a,b)=>a-b); const avgLum=lums.reduce((a,b)=>a+b,0)/Math.max(1,lums.length), avgSat=sats.reduce((a,b)=>a+b,0)/Math.max(1,sats.length); const std=Math.sqrt(lums.reduce((a,b)=>a+Math.pow(b-avgLum,2),0)/Math.max(1,lums.length)); const sliceAvg=(from,to)=>{const a=lums.slice(Math.floor(lums.length*from),Math.max(Math.floor(lums.length*to),Math.floor(lums.length*from)+1));return a.reduce((x,y)=>x+y,0)/Math.max(1,a.length);}; const colors=[...bins.values()].sort((a,b)=>b.c-a.c).slice(0,3).map(v=>({r:v.r/v.c,g:v.g/v.c,b:v.b/v.c})); return { avgLum, medianLum:lums[Math.floor(lums.length/2)]||0, stdLum:std, avgSat, warmRatio:warm/Math.max(1,count), coldRatio:cold/Math.max(1,count), texture:std+avgSat*.28, p10:lums[Math.floor(lums.length*.10)]||0, p20:lums[Math.floor(lums.length*.20)]||0, p80:lums[Math.floor(lums.length*.80)]||0, p90:lums[Math.floor(lums.length*.90)]||0, dark15:sliceAvg(0,.15), bright15:sliceAvg(.85,1), avgRgb:{r:rSum/Math.max(1,count),g:gSum/Math.max(1,count),b:bSum/Math.max(1,count)}, primary:colors[0]||{r:180,g:195,b:225}, secondary:colors[1]||colors[0]||{r:150,g:165,b:190}, tertiary:colors[2]||colors[1]||colors[0]||{r:150,g:165,b:190} }; }
function smartRawCacheKey() { return [state.background ? `${state.background.length}:${state.background.slice(0,64)}` : "default", state.backgroundScale, state.backgroundX, state.backgroundY, state.backgroundOpacity, state.layoutPreset, state.cardHeightMode, state.cardX, state.cardY, state.cardScale, state.textOpticalOffsetY, state.subtitleTitleVisualGap, state.titleDividerVisualGap, state.dividerDescriptionVisualGap, state.descriptionLineBaselineGap, state.descriptionBoxWidth].join("|"); }
function smartFinalCacheKey() { return [smartRawCacheKey(), state.materialBase, state.glassPreset, state.glassSaturation, state.glassContrast, state.glassTintColor, state.glassTintOpacity, state.cardOpacity, state.glassDepth, state.smartSecondaryTintColor, state.smartSecondaryTintOpacity, state.smartReflectionColor, state.smartReflectionOpacity].join("|"); }
async function analyzeBackground() { const key = smartRawCacheKey(); if (smartCache?.raw?.key === key) return smartCache.raw.result; const src = state.background || buildDefaultBackground(); const img = await imageFromSource(src); const w=128,h=90, canvas=document.createElement("canvas"), ctx=canvas.getContext("2d",{willReadFrequently:true}); canvas.width=w; canvas.height=h; drawBackgroundSample(ctx,img,w,h); const { card, logoBox } = layoutGeometry(), textArea = textAreaGeometry(card, logoBox); const sampleArea = area => { const x=clamp(Math.round(area.x/state.width*w),0,w-1), y=clamp(Math.round(area.y/state.height*h),0,h-1), aw=clamp(Math.round(area.width/state.width*w),1,w-x), ah=clamp(Math.round(area.height/state.height*h),1,h-y); return analyzePixels(ctx.getImageData(x,y,aw,ah).data); }; const result = { full: sampleArea({x:0,y:0,width:state.width,height:state.height}), card: sampleArea(card), text: sampleArea(textArea), logo: sampleArea(logoBox), usedDefault: !state.background }; canvas.width = canvas.height = 0; smartCache = { ...(smartCache || {}), raw: { key, result } }; return result; }
/* Logo accent extraction. Samples only the effective (alpha-cropped) content so
   large transparent margins cannot dilute the histogram, then scores candidates
   with an explicit preference for luminous metallic hues (gold/champagne) over
   large but dark blocks (deep red), which read better as an accent on glass. */
async function analyzeLogoColors(materialKey, textRegion) {
  if (!state.logo) return { usable: false, candidates: [], reason: "未上传 Logo" };
  try {
    const img = await imageFromSource(state.logo);
    const crop = activeLogoCrop();
    const sw = img.naturalWidth || img.width, sh = img.naturalHeight || img.height;
    const sx = crop.cropX * sw, sy = crop.cropY * sh, sWidth = Math.max(1, crop.cropWidth * sw), sHeight = Math.max(1, crop.cropHeight * sh);
    const size = 128;
    const canvas = document.createElement("canvas"), ctx = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = canvas.height = size;
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data, bins = new Map();
    let valid = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 64) continue;
      valid++;
      const rgb = { r: data[i], g: data[i + 1], b: data[i + 2] }, lch = rgbToOklch(rgb);
      if ((lch.L > .96 || lch.L < .07 || lch.C < .025) && valid > 48) continue;
      const key = `${Math.round(lch.L * 18)}:${Math.round(lch.C * 18)}:${Math.round(lch.h / 18)}`;
      const v = bins.get(key) || { r: 0, g: 0, b: 0, count: 0, L: 0, C: 0, hx: 0, hy: 0 };
      v.r += rgb.r; v.g += rgb.g; v.b += rgb.b; v.count++; v.L += lch.L; v.C += lch.C;
      v.hx += Math.cos(lch.h * Math.PI / 180); v.hy += Math.sin(lch.h * Math.PI / 180);
      bins.set(key, v);
    }
    canvas.width = canvas.height = 0;
    if (valid < 20) return { usable: false, candidates: [], reason: "Logo 几乎透明" };
    const material = MATERIAL_PRESETS[materialKey] || MATERIAL_PRESETS.standard, glassLum = textRegion?.avgRgb ? relativeLuminance(textRegion.avgRgb) : expectedLumWithMaterial(textRegion || { avgRgb: { r: 128, g: 128, b: 128 } }, material);
    const candidates = [...bins.values()].map(v => {
      const rgb = { r: v.r / v.count, g: v.g / v.count, b: v.b / v.count }, lch = rgbToOklch(rgb);
      const h = (Math.atan2(v.hy, v.hx) * 180 / Math.PI + 360) % 360;
      const adjusted = adjustAccentForContrast({ L: v.L / v.count, C: v.C / v.count, h, rgb }, glassLum);
      return { rgb, hex: rgbToHex(rgb), adjusted, area: v.count / valid, L: v.L / v.count, C: v.C / v.count, h, contrast: contrastRatio(luminance(hexToRgb(adjusted)), glassLum) };
    }).filter(c => c.area > .006).sort((a, b) => b.area - a.area).slice(0, 8);
    candidates.forEach(c => {
      const areaScore = clamp(c.area / .42, 0, 1);
      const chromaScore = 1 - Math.abs(clamp(c.C, .04, .20) - .12) / .10;
      const contrastScore = clamp((c.contrast - 2.2) / 3.2, 0, 1);
      const lightnessFitness = 1 - Math.abs(c.L - .72) / .34;
      // Metallic warm hues (gold / champagne / brass) make the strongest accents.
      const metallicGold = (c.h >= 55 && c.h <= 110 && c.L > .38) ? .26 : 0;
      // Dark saturated reds stay available as a secondary reflection colour only.
      const darkRedPenalty = ((c.h < 35 || c.h > 345) && c.L < .45) ? -.24 : 0;
      c.score = areaScore * .24 + chromaScore * .22 + contrastScore * .32 + lightnessFitness * .12 + metallicGold + darkRedPenalty;
    });
    candidates.sort((a, b) => b.score - a.score);
    candidates.forEach(c => { const hsl=rgbToHsl(c.rgb); c.semantic = c.L > .82 && c.C < .06 ? "lightNeutral" : ((c.h >= 330 || c.h <= 30) && c.C > .05 ? "warmAccent" : ((c.h >= 45 && c.h <= 115) ? "metallicAccent" : ((c.h >= 165 && c.h <= 255) ? "coolAccent" : (c.L < .42 ? "darkAccent" : "vividAccent")))); });
    const warmAccent = candidates.filter(c=>c.semantic==="warmAccent" && c.L>.42).sort((a,b)=>(b.area*.6+b.C*.3+b.L*.1)-(a.area*.6+a.C*.3+a.L*.1))[0];
    const metallicAccent = candidates.filter(c=>c.semantic==="metallicAccent" && c.L>.40).sort((a,b)=>b.score-a.score)[0];
    const primary = warmAccent || metallicAccent || candidates.find(c=>c.semantic!=="lightNeutral") || candidates[0];
    const secondary = candidates.find(c => primary && hueDistance(c.h, primary.h) > 25 && c.area > .01) || null;
    return { usable: !!primary, candidates, roles: { lightNeutral:candidates.find(c=>c.semantic==="lightNeutral")||null, warmAccent:warmAccent||null, metallicAccent:metallicAccent||null, coolAccent:candidates.find(c=>c.semantic==="coolAccent")||null, vividAccent:candidates.find(c=>c.semantic==="vividAccent")||null, darkAccent:candidates.find(c=>c.semantic==="darkAccent")||null }, primaryAccent: primary?.adjusted, secondaryAccent: secondary?.hex || "", reason: primary ? "强调色取自 Logo。" : "Logo 色彩较弱" };
  } catch (_) { return { usable: false, candidates: [], reason: "Logo 解码失败" }; }
}
function expectedLumWithMaterial(region, material) { const mixed=mixRgb(region.avgRgb, hexToRgb(material.tintColor), material.tintOpacity); return luminance(mixed); }
function expectedLum(region, materialKey) { return expectedLumWithMaterial(region, MATERIAL_PRESETS[materialKey] || MATERIAL_PRESETS.standard); }
function bestTextColorForMaterial(region, material) { const bgLum = expectedLumWithMaterial(region, material); const candidates = ["#FFFFFF", "#F7F8FA", "#1D222B", "#111318"]; return candidates.map(color=>({color,ratio:contrastRatio(luminance(hexToRgb(color)), bgLum)})).sort((a,b)=>b.ratio-a.ratio)[0]; }
function bestTextColor(region, materialKey) { return bestTextColorForMaterial(region, MATERIAL_PRESETS[materialKey] || MATERIAL_PRESETS.standard); }
/* Pick an accent that keeps the source hue but lands in a comfortable lightness
   band for the current glass. Previously this returned the FIRST value that met
   the minimum contrast, which on dark glass produced muddy, under-lit accents
   (dark brass instead of champagne gold). Now we score the whole ramp and
   prefer the luminous band, only relaxing when contrast cannot be met. */
function adjustAccentForContrast(color, bgLum) {
  let lch = color.h !== undefined ? { L: color.L, C: color.C, h: color.h } : rgbToOklch(color.rgb || color);
  const originalHue = lch.h;
  const chroma = clamp(lch.C, SMART_THRESHOLDS.minAccentChroma, SMART_THRESHOLDS.maxAccentChroma);
  const preferLight = bgLum < .42;
  const minL = preferLight ? .60 : .24, maxL = preferLight ? .90 : .58;
  const preferredL = preferLight ? .84 : .40;
  const steps = 30;
  let best = null, fallback = { hex: rgbToHex(oklchToRgb({ L: preferredL, C: chroma, h: originalHue })), ratio: 0 };
  for (let i = 0; i <= steps; i++) {
    const L = minL + i * (maxL - minL) / steps;
    const hex = rgbToHex(oklchToRgb({ L, C: chroma, h: originalHue }));
    const ratio = contrastRatio(luminance(hexToRgb(hex)), bgLum);
    if (ratio > fallback.ratio) fallback = { hex, ratio };
    if (ratio < SMART_THRESHOLDS.accentContrast) continue;
    const score = -Math.abs(L - preferredL);
    if (!best || score > best.score) best = { hex, ratio, score };
  }
  return best ? best.hex : fallback.hex;
}
function safeAccentFromBackground(analysis, material) { const bgLum=expectedLumWithMaterial(analysis.text, material); for (const c of [analysis.full.primary, analysis.full.secondary, analysis.card.primary, analysis.text.primary]) { const lch=rgbToOklch(c), hsl=rgbToHsl(c); if (hsl.s < .10 || lch.L < .12 || lch.L > .90) continue; return adjustAccentForContrast({ ...lch, rgb:c }, bgLum); } return material.recommendedAccentColor || "#9AA8BB"; }
function chooseSmartMaterial(analysis) {
  const t = analysis.text, f = analysis.full, primaryHsl = rgbToHsl(f.primary);
  const complex = f.texture > SMART_THRESHOLDS.textureComplexity || t.stdLum > SMART_THRESHOLDS.complexStd;
  const dominantColors = [f.primary, f.secondary, f.tertiary].filter(Boolean).map(rgbToHsl);
  const hasPink = dominantColors.some(c => c.s > .20 && (c.h >= 315 || c.h <= 22));
  const hasColdGrayBlue = dominantColors.some(c => (c.s < .30 && c.l < .68) || (c.s > .16 && c.h >= 190 && c.h <= 255));
  const pastelComplex = f.avgSat >= .16 && f.avgSat <= .56 && f.stdLum >= .13 && hasPink && hasColdGrayBlue && f.warmRatio > .10;
  if (pastelComplex) return { key: "standard", backgroundClass: "pastelComplex", confidence: "high", glass: { saturation: .70, contrast: .99, tintColor: "#2B2932", tintOpacity: .26, secondaryTintOpacity: .03, reflectionOpacity: .035 }, reason: "背景包含粉色与冷灰色且明暗变化较大，已降低玻璃饱和度并使用冷烟紫灰统一材质。" };
  // Warm dominance is evaluated from BOTH the warm pixel ratio and hue of the
  // dominant colour, so mid-saturation warm art (fire/sunset/lantern scenes)
  // is still recognised instead of falling through to the generic branch.
  const warmHue = primaryHsl.h >= SMART_THRESHOLDS.warmHueMin && primaryHsl.h <= SMART_THRESHOLDS.warmHueMax;
  const warmRatio = f.warmRatio || 0;
  const warmScore = warmRatio + (warmHue ? .12 : 0) + (f.avgSat > SMART_THRESHOLDS.warmSaturation ? .08 : 0);
  const warm = warmScore >= SMART_THRESHOLDS.warmDominance && f.avgSat > .22 && warmRatio > .16;
  const cool = f.coldRatio > SMART_THRESHOLDS.coldDominance;
  // Strong local highlights over a dark base need an opaque smoky glass.
  const highContrastWarm = warm && (t.stdLum > SMART_THRESHOLDS.warmHighlightStd || complex);
  if (highContrastWarm) {
    const tintOpacity = clamp(.30 + (f.avgSat - .30) * .20 + (t.stdLum - .12) * .18, .28, .36);
    const saturation = clamp(.82 - (f.avgSat - .30) * .30, .74, .84);
    return { key: "obsidian", confidence: "high", glass: { saturation: Number(saturation.toFixed(2)), contrast: 1.03, tintColor: "#0B1018", tintOpacity: Number(tintOpacity.toFixed(2)) }, reason: "背景暖色较强，已降低玻璃饱和度；强调色取自 Logo 金色。" };
  }
  if (warm && f.avgSat > .34) return { key: "obsidian", confidence: "high", glass: { saturation: .79, contrast: 1.04, tintColor: "#0B1018", tintOpacity: .31 }, reason: "背景暖色饱和度较高，已使用中性烟熏玻璃。" };
  if (t.medianLum > SMART_THRESHOLDS.veryBright || (f.avgLum > .62 && complex)) return { key: "obsidian", confidence: "high", glass: { saturation: .82, contrast: 1.04, tintColor: "#0B1018", tintOpacity: .33 }, reason: "文字区域较亮，已使用深色整体玻璃。" };
  if (f.avgSat > SMART_THRESHOLDS.highSaturation || complex) return { key: "silver", confidence: "medium", glass: { saturation: cool ? .90 : .76, contrast: 1.03, tintColor: "#D8DEE6", tintOpacity: .24 }, reason: "底图色彩较复杂，已降低玻璃内部饱和度。" };
  if (t.medianLum < SMART_THRESHOLDS.dark && f.avgSat < SMART_THRESHOLDS.lowSaturation) { const glacier = bestTextColor(t, "glacier"), standard = bestTextColor(t, "standard"); return glacier.ratio >= standard.ratio ? { key: "glacier", confidence: "medium", glass: { saturation: .86, contrast: 1.01, tintColor: "#F2F6FA", tintOpacity: .25 }, reason: "背景偏暗低饱和，已比较后使用浅色玻璃。" } : { key: "standard", confidence: "medium", glass: { saturation: .96, contrast: 1.03, tintColor: "#FFFFFF", tintOpacity: .12 }, reason: "背景偏暗，已使用克制标准材质。" }; }
  if (cool && f.avgSat > .22) return { key: "aurora", confidence: "medium", glass: { saturation: .92, contrast: 1.02, tintColor: "#F4F7FB", tintOpacity: .12 }, reason: "背景有冷色特征，已使用透明玻璃与局部冷反射。" };
  return { key: "standard", confidence: "low", glass: { saturation: .96, contrast: 1.03, tintColor: "#FFFFFF", tintOpacity: .12 }, reason: "特征较弱，已应用稳妥方案。" };
}
function roleBounds(card, logoBox, typography = currentTypography()) {
  if (state.layoutPreset === "certificate") { const cx=card.x+card.width/2, subY=logoBox.y+logoBox.height+70, title=fitCertificateTitle(state.mainTitle,card.width-230,typography.title.fontSize,typography.title.minFontSize,typography.title.fontWeight,Math.max(1,typography.title.letterSpacing),fontStackForRole("title")), lineGap=title.size*typography.title.lineHeight, lineY=subY+98+(title.lines.length-1)*lineGap+title.size*.42+80, desc=descriptionLines(3,Math.min(820,state.descriptionBoxWidth),typography.description.fontSize,typography.description.fontWeight,typography.description.letterSpacing,fontStackForRole("description")); const centered=(width,top,height,padding)=>({x:cx-width/2-padding,y:top-padding,width:width+padding*2,height:height+padding*2}); return { subtitle:centered(measureText(state.subTitle,typography.subtitle.fontSize,typography.subtitle.fontWeight,typography.subtitle.letterSpacing,fontStackForRole("subtitle")),subY-typography.subtitle.fontSize,typography.subtitle.fontSize,12), title:centered(Math.max(...title.lines.map(line=>measureText(line,title.size,typography.title.fontWeight,typography.title.letterSpacing,fontStackForRole("title")))),subY+98-title.size,title.lines.length*lineGap,18), body:centered(Math.min(820,state.descriptionBoxWidth),lineY+78,Math.max(1,desc.lines.length)*state.descriptionLineBaselineGap,14) }; }
  const plan=systemTextPlan(card,logoBox,typography), x=plan.contentX; const bounds=(width,top,height,padding)=>({x:x-padding,y:top-padding,width:Math.min(width+padding*2,card.x+card.width-x+padding),height:height+padding*2}); const subtitleX=state.showSubtitleMarker?x+23:x; return { subtitle:plan.layout.hasSubtitle?{x:subtitleX-12,y:plan.layout.subtitleBaselineY-plan.layout.subtitleInk.ascent-12,width:measureText(state.subTitle,typography.subtitle.fontSize,typography.subtitle.fontWeight,typography.subtitle.letterSpacing,fontStackForRole("subtitle"))+24,height:plan.layout.subtitleInk.ascent+plan.layout.subtitleInk.descent+24}:null, title:bounds(measureText(state.mainTitle,plan.title.size,typography.title.fontWeight,typography.title.letterSpacing,fontStackForRole("title")),plan.layout.titleBaselineY-plan.layout.titleInk.ascent,plan.layout.titleInk.ascent+plan.layout.titleInk.descent,18), body:plan.desc.lines.length?bounds(Math.min(state.descriptionBoxWidth,plan.columnWidth),plan.layout.descriptionBaselines[0]-plan.layout.descInk[0].ascent,(plan.layout.descriptionBaselines.at(-1)-plan.layout.descriptionBaselines[0])+plan.layout.descInk.at(-1).ascent+plan.layout.descInk.at(-1).descent,14):null }; }
function applyImageFilterApprox(ctx, canvas, material) { const image=ctx.getImageData(0,0,canvas.width,canvas.height), data=image.data, tint=hexToRgb(material.tintColor), secondary=hexToRgb(material.secondaryTintColor), reflection=hexToRgb(material.reflectionAColor); for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){const i=(y*canvas.width+x)*4, rgb={r:data[i],g:data[i+1],b:data[i+2]}, hsl=rgbToHsl(rgb), adjusted=hslToRgb({h:hsl.h,s:clamp(hsl.s*material.saturation,0,1),l:clamp(.5+(hsl.l-.5)*material.contrast,0,1)}), nx=x/Math.max(1,canvas.width-1), ny=y/Math.max(1,canvas.height-1), primaryAlpha=material.tintOpacity*(1-.40*(nx*.55+ny*.45)), secondaryAlpha=material.secondaryTintOpacity*(.15+.85*nx*.70+.30*ny), reflectAlpha=(material.reflectionAOpacity||0)*Math.max(0,1-Math.hypot(nx*.95,ny*1.15))*0.62; let mixed=alphaCompositeLinearSrgb(adjusted,tint,primaryAlpha); mixed=alphaCompositeLinearSrgb(mixed,secondary,secondaryAlpha); mixed=alphaCompositeLinearSrgb(mixed,reflection,reflectAlpha); data[i]=mixed.r;data[i+1]=mixed.g;data[i+2]=mixed.b;} ctx.putImageData(image,0,0); }
async function renderSmartAnalysisCanvas() { const key=smartFinalCacheKey(); if(smartCache?.final?.key===key)return smartCache.final.result; const mobile=isCoarsePointer(), w=mobile?192:256,h=mobile?135:180, canvas=document.createElement("canvas"),ctx=canvas.getContext("2d",{willReadFrequently:true}),src=state.background||buildDefaultBackground(),img=await imageFromSource(src),material=currentMaterialToken(); canvas.width=w;canvas.height=h; ctx.filter=`blur(${Math.max(1,material.blur*w/state.width)}px)`; drawBackgroundSample(ctx,img,w,h); ctx.filter="none"; applyImageFilterApprox(ctx,canvas,material); const {card,logoBox}=layoutGeometry(),bounds=roleBounds(card,logoBox); const toSample=(area,cols,rows)=>{if(!area)return null;const x=clamp(Math.round(area.x/state.width*w),0,w-1),y=clamp(Math.round(area.y/state.height*h),0,h-1),aw=clamp(Math.round(area.width/state.width*w),1,w-x),ah=clamp(Math.round(area.height/state.height*h),1,h-y),data=ctx.getImageData(x,y,aw,ah).data,grid=[];for(let gy=0;gy<rows;gy++)for(let gx=0;gx<cols;gx++){const sx=Math.min(aw-1,Math.floor((gx+.5)*aw/cols)),sy=Math.min(ah-1,Math.floor((gy+.5)*ah/rows)),i=(sy*aw+sx)*4;grid.push({r:data[i],g:data[i+1],b:data[i+2]});}const stats=analyzePixels(data);return {...stats,grid,bounds:area};}; const result={canvas,card:toSample(card,12,6),subtitle:toSample(bounds.subtitle,8,3),title:toSample(bounds.title,12,4),body:toSample(bounds.body,12,4),bounds}; smartCache={...(smartCache||{}),final:{key,result}};return result; }
function regionLumStats(region) { return { avg: region.avgLum ?? .5, median: region.medianLum ?? .5, p20: region.p20 ?? region.p10 ?? .35, p80: region.p80 ?? region.p90 ?? .75, bright15: region.bright15 ?? region.p90 ?? .82, dark15: region.dark15 ?? region.p10 ?? .22, std: region.stdLum ?? 0 }; }
function contrastMetrics(hex,opacity,region) { const values=(region?.grid||[region?.avgRgb||{r:128,g:128,b:128}]).map(bg=>contrastWithOpacity(hex,opacity,bg)).sort((a,b)=>a-b),pick=q=>values[Math.min(values.length-1,Math.floor((values.length-1)*q))]||0, p10=pick(.10),median=pick(.50),average=values.reduce((a,b)=>a+b,0)/Math.max(1,values.length),worst10=values.slice(0,Math.max(1,Math.ceil(values.length*.10))).reduce((a,b)=>a+b,0)/Math.max(1,Math.ceil(values.length*.10));return {p10,median,average,worst10,score:p10*.45+median*.35+average*.20}; }
function generateTextColorCandidates(logoAnalysis) { const logo=logoAnalysis?.roles?.warmAccent||logoAnalysis?.candidates?.[0], hue=logo?.h??345; return {light:["#F3EEF0","#E7E0E3","#F4F1EC",rgbToHex(oklchToRgb({L:.92,C:.035,h:hue}))],dark:["#1D222B","#514C52","#655A61","#4F5358"].map(normalizeHex)}; }
function bestRoleCandidate(candidates,region,role,logoAnalysis,keepOpacity){const thresholds={title:{p10:2.8,median:3.4},subtitle:{p10:2.8,median:3.2},body:{p10:3.6,median:4.5}}[role], baseOpacity=keepOpacity??({title:94,subtitle:94,body:84}[role]);const pool=[...candidates.light.map(hex=>({hex,family:"light"})),...candidates.dark.map(hex=>({hex,family:"dark"}))].flatMap(candidate=>[baseOpacity,Math.min(96,baseOpacity+6),100].map(opacity=>({...candidate,opacity,contrast:contrastMetrics(candidate.hex,opacity,region)}))).map(candidate=>({...candidate,passes:candidate.contrast.p10>=thresholds.p10&&candidate.contrast.median>=thresholds.median,score:candidate.contrast.score+(candidate.family==="light"&&region.medianLum<.46?.22:0)+(candidate.family==="dark"&&region.medianLum>.52?.22:0)})).sort((a,b)=>(Number(b.passes)-Number(a.passes))||b.score-a.score);return pool[0];}
function deriveSubtitleColor(logoAnalysis,region,material){const warm=logoAnalysis?.roles?.warmAccent,metallic=logoAnalysis?.roles?.metallicAccent;const ordered=[warm,metallic].filter(Boolean), variants=[];ordered.forEach(c=>[.68,.76,.84].forEach(L=>variants.push(rgbToHex(oklchToRgb({L,C:clamp(c.C*.65,.045,.11),h:c.h})))));variants.push("#F2A0B5","#EDA0B1","#F3C99B");const unique=[...new Set(variants.map(normalizeHex).filter(Boolean))];const ranked=unique.map(hex=>({hex,opacity:94,contrast:contrastMetrics(hex,94,region),source:hex==="#F2A0B5"?"Logo 暖色回退":"Logo 暖色强调"})).sort((a,b)=>((b.contrast.p10>=2.8?1:0)-(a.contrast.p10>=2.8?1:0))||b.contrast.score-a.contrast.score);return ranked.find(x=>x.contrast.p10>=2.8)||ranked[0];}
function computeAutoTextColorPlan(finalAnalysis,logoAnalysis) { const candidates=generateTextColorCandidates(logoAnalysis),pastelMaterial=normalizeHex(state.glassTintColor)==="#2B2932"&&Math.abs(state.glassSaturation-.70)<.08; let title=bestRoleCandidate(candidates,finalAnalysis.title,"title",logoAnalysis),body=bestRoleCandidate({light:["#E7E0E3","#ECE5E8",...candidates.light],dark:candidates.dark},finalAnalysis.body||finalAnalysis.title,"body",logoAnalysis),subtitle=deriveSubtitleColor(logoAnalysis,finalAnalysis.subtitle||finalAnalysis.title,currentMaterialToken()); if(pastelMaterial){const titleHex="#F3EEF0",bodyHex="#E7E0E3",subtitleHex="#F2A0B5";title={...title,hex:titleHex,opacity:94,family:"light",contrast:contrastMetrics(titleHex,94,finalAnalysis.title)};body={...body,hex:bodyHex,opacity:84,family:"light",contrast:contrastMetrics(bodyHex,84,finalAnalysis.body||finalAnalysis.title)};subtitle={...subtitle,hex:subtitleHex,opacity:94,contrast:contrastMetrics(subtitleHex,94,finalAnalysis.subtitle||finalAnalysis.title),source:"Logo 粉色暖强调"};}return {summaryFamily:title.family,title:{color:title.hex,opacity:title.opacity,contrast:title.contrast,source:title.family==="light"?"最终玻璃上的柔和冷粉白":"最终玻璃上的深色标题",shadow:title.family==="light"?.08:.02},body:{color:body.hex,opacity:body.opacity,contrast:body.contrast,source:body.family==="light"?"最终玻璃上的中性浅灰粉白":"最终玻璃上的深色正文",shadow:body.family==="light"?.08:.02},subtitle:{color:subtitle.hex,opacity:subtitle.opacity,contrast:subtitle.contrast,source:subtitle.source}}; }
async function applySmartTextColors({resetOpacity=false,finalAnalysis=null,logoAnalysis=null}={}) { const analysis=finalAnalysis||await renderSmartAnalysisCanvas(), logo=logoAnalysis||await analyzeLogoColors(currentMaterialBase(),analysis.subtitle||analysis.title),plan=computeAutoTextColorPlan(analysis,logo); if(state.titleColorMode!=="manual"){state.titleColor=plan.title.color;state.titleColorMode="auto";state.titleColorSource=plan.title.source;}if(state.bodyTextColorMode!=="manual"){state.bodyTextColor=plan.body.color;state.bodyTextColorMode="auto";state.bodyTextColorSource=plan.body.source;}if(state.subtitleColorMode!=="manual"){state.subtitleColor=plan.subtitle.color;state.subtitleColorMode="auto";state.subtitleColorSource=plan.subtitle.source;}if(resetOpacity||!state.titleOpacityManuallyEdited)state.titleOpacity=plan.title.opacity;if(resetOpacity||!state.bodyTextOpacityManuallyEdited)state.bodyTextOpacity=plan.body.opacity;if(resetOpacity||!state.subtitleOpacityManuallyEdited)state.subtitleOpacity=plan.subtitle.opacity;state.titleContrast=plan.title.contrast.score;state.bodyTextContrast=plan.body.contrast.score;state.subtitleContrast=plan.subtitle.contrast.score;state.titleShadowOpacity=plan.title.shadow;state.descShadowOpacity=plan.body.shadow;syncLegacyTextColor();return{plan,analysis,logoAnalysis:logo}; }
function applySmartLayoutForContent() {
  state.cardHeightMode = "auto"; state.layoutDensityMode = "auto";
  state.dividerMode = state.dividerMode || "auto";
  const metrics = computeSystemAutoLayout();
  state.cardHeight = metrics.height;
  state.subtitleTitleVisualGap = metrics.subtitleTitleVisualGap;
  state.titleDividerVisualGap = metrics.titleDividerVisualGap;
  state.dividerDescriptionVisualGap = metrics.dividerDescriptionVisualGap;
  state.descriptionLineBaselineGap = metrics.descriptionLineBaselineGap;
  state.dividerWidth = metrics.dividerWidth;
  state.textOpticalOffsetY = metrics.textOffset;
  state.logoOpticalOffsetY = metrics.logoOffset;
  state.logoContainerSize = metrics.logoContainerSize;
  state.cardX = 0; state.cardY = 0; state.cardPositionMode = "auto";
}
/* Human-readable accent name derived from the measured hue, never from a filename. */
function describeAccent(hex) {
  const hsl = rgbToHsl(hexToRgb(hex)), l = luminance(hexToRgb(hex));
  if (hsl.s < .12) return l > .5 ? "银白" : "石墨";
  const h = hsl.h;
  if (h >= 40 && h <= 70) return l > .45 ? "香槟金" : "古铜";
  if (h > 70 && h <= 105) return "橄榄金";
  if (h >= 20 && h < 40) return "琥珀";
  if (h < 20 || h > 345) return "赤红";
  if (h >= 165 && h <= 205) return "青蓝";
  if (h > 205 && h <= 250) return "钢蓝";
  if (h > 250 && h <= 300) return "紫罗兰";
  return "彩色";
}
function glassUniformity(region) { const g=region?.grid||[], mean=a=>a.reduce((x,y)=>x+y,0)/Math.max(1,a.length); if(!g.length)return {cardLuminanceStd:0,leftRightDifference:0,needsCorrection:false}; const l=g.map(relativeLuminance), std=Math.sqrt(mean(l.map(x=>(x-mean(l))**2))), half=Math.floor(g.length/2), lr=Math.abs(mean(l.slice(0,half))-mean(l.slice(half))); return {cardLuminanceStd:std,leftRightDifference:lr,needsCorrection:std>.18||lr>.16}; }
function materialSnapshot() { const m=currentMaterialToken(); return {materialBase:state.materialBase,blur:m.blur,saturation:state.glassSaturation,contrast:state.glassContrast,tintColor:state.glassTintColor,tintOpacity:state.glassTintOpacity,secondaryTintColor:state.smartSecondaryTintColor,secondaryTintOpacity:state.smartSecondaryTintOpacity}; }
async function smartFitBackground(options = {}) { if(smartBusy)return; const fullReset=!!options.fullReset,btn=options.button||$("smartFit"); if(fullReset&&!confirm("完全重新智能适配会替换手动文字颜色与透明度，是否继续？"))return; smartBusy=true; if(btn){btn.disabled=true;btn.dataset.label=btn.textContent;} try { beginInteraction(); if(state.logo&&state.logoCropMode==="auto")await refreshLogoCropBounds(); const raw=await analyzeBackground(), chosen=chooseSmartMaterial(raw); suppressSmartManual=true; applyMaterial(chosen.key,"smart"); Object.assign(state,{glassSaturation:chosen.glass.saturation,glassContrast:chosen.glass.contrast,glassTintColor:chosen.glass.tintColor,glassTintOpacity:chosen.glass.tintOpacity}); invalidateSmartCache(); const logo=await analyzeLogoColors(chosen.key,raw.text), warm=logo.roles?.warmAccent||logo.roles?.metallicAccent; state.primaryAccent=logo.usable?(warm?.adjusted||logo.primaryAccent):safeAccentFromBackground(raw,currentMaterialToken()); state.secondaryAccent=logo.usable?logo.secondaryAccent:""; state.accentColor=state.primaryAccent||currentMaterialToken().recommendedAccentColor||"#9AA8BB"; if(chosen.backgroundClass==="pastelComplex"){state.smartSecondaryTintColor=rgbToHex(oklchToRgb({L:.72,C:Math.min(.06,(warm?.C||.08)*.55),h:warm?.h??345}));state.smartSecondaryTintOpacity=.03;state.smartReflectionColor=rgbToHex(oklchToRgb({L:.88,C:.035,h:warm?.h??345}));state.smartReflectionOpacity=.035;}else Object.assign(state,{smartSecondaryTintColor:"",smartSecondaryTintOpacity:0,smartReflectionColor:"",smartReflectionOpacity:0}); invalidateSmartCache(); const before=materialSnapshot(); let final,text,uniformity,corrections=0; for(let i=0;i<3;i++){final=await renderSmartAnalysisCanvas(); text=await applySmartTextColors({resetOpacity:fullReset,finalAnalysis:final,logoAnalysis:logo}); uniformity=glassUniformity(final.card); if(!uniformity.needsCorrection||i===2)break; state.glassSaturation=clamp(state.glassSaturation-.04,.5,1.25);state.glassContrast=clamp(state.glassContrast-.01,.9,1.14);state.glassTintOpacity=clamp(state.glassTintOpacity+.015,.04,.42);state.glassDepth=clamp(state.glassDepth+4,0,100);invalidateSmartCache();corrections++;} applySmartLayoutForContent();invalidateSmartCache();final=await renderSmartAnalysisCanvas();text=await applySmartTextColors({resetOpacity:fullReset,finalAnalysis:final,logoAnalysis:logo});uniformity=glassUniformity(final.card);state.smartConfidence=chosen.confidence;state.smartDiagnostics={backgroundClass:chosen.backgroundClass||chosen.key,materialBeforeCorrection:before,materialAfterCorrection:materialSnapshot(),cardLuminanceStd:uniformity.cardLuminanceStd,leftRightDifference:uniformity.leftRightDifference,titleP10Contrast:text.plan.title.contrast.p10,titleMedianContrast:text.plan.title.contrast.median,subtitleP10Contrast:text.plan.subtitle.contrast.p10,bodyP10Contrast:text.plan.body.contrast.p10,analysisIterations:corrections+1,accentSource:warm?"Logo warmAccent":logo.usable?"Logo accent":"background safe accent"};const label=chosen.backgroundClass==="pastelComplex"?"粉彩复杂背景":MATERIAL_PRESETS[chosen.key].label;state.smartSummary=`${label} · ${corrections?`已进行 ${corrections} 次材质均匀性校正`:"玻璃均匀性已通过"} · ${text.plan.title.source} · ${text.plan.subtitle.source} · ${text.plan.body.source}`;syncLegacyTextColor();syncUi();scheduleRender();}catch(err){showToast(`智能适配失败：${err.message||"请检查图片格式"}`,"error",true);}finally{suppressSmartManual=false;smartBusy=false;if(btn){btn.disabled=false;btn.textContent=btn.dataset.label||"智能适配底图";}endInteraction();}}
function crc32(bytes) { let c=0xffffffff; for(const b of bytes){c^=b;for(let k=0;k<8;k++)c=c&1?(c>>>1)^0xedb88320:c>>>1;} return (c^0xffffffff)>>>0; }
function withPngDpi(blob) { return blob.arrayBuffer().then(buffer=>{const data=new Uint8Array(buffer), physData=new Uint8Array(9), view=new DataView(physData.buffer);view.setUint32(0,11811);view.setUint32(4,11811);physData[8]=1;const type=new TextEncoder().encode("pHYs"),chunk=new Uint8Array(4+4+9+4),v=new DataView(chunk.buffer);v.setUint32(0,9);chunk.set(type,4);chunk.set(physData,8);v.setUint32(17,crc32(chunk.slice(4,17)));const result=new Uint8Array(data.length+chunk.length);result.set(data.slice(0,33),0);result.set(chunk,33);result.set(data.slice(33),33+chunk.length);return new Blob([result],{type:"image/png"});}); }
function serializeSvg() { return new XMLSerializer().serializeToString(svg); }
function download(filename, blob) { const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000); }
async function ensureResources() { if(document.fonts?.ready)await document.fonts.ready; const urls=[state.background,state.logo].filter(Boolean); await Promise.all(urls.map(src=>{const img=new Image();img.src=src;return img.decode().catch(()=>{});})); }
async function detectSvgCanvasExport() { if (exportCapability !== null) return exportCapability; try { const sample = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="48"><defs><clipPath id="c"><rect x="4" y="4" width="56" height="40" rx="8"/></clipPath><filter id="b" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="2"/></filter></defs><rect width="64" height="48" fill="#123"/><rect x="8" y="8" width="48" height="32" fill="#fff" filter="url(#b)" clip-path="url(#c)"/><text x="12" y="28" fill="#000" font-size="12">OK</text></svg>`; const url = URL.createObjectURL(new Blob([sample], { type: "image/svg+xml;charset=utf-8" })); const img = new Image(); await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;}); const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d",{willReadFrequently:true}); canvas.width=64; canvas.height=48; ctx.drawImage(img,0,0); const data=ctx.getImageData(32,24,1,1).data; URL.revokeObjectURL(url); canvas.width=canvas.height=0; exportCapability = data[3] > 0; } catch (_) { exportCapability = false; } return exportCapability; }
function roundedRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
async function drawImageSource(ctx, src, area, scale, x, y, opacity=1) { const img = await imageFromSource(src); const p = getImagePlacement(area, scale, x, y); ctx.save(); ctx.globalAlpha = opacity; ctx.drawImage(img, p.x, p.y, p.width, p.height); ctx.restore(); }
function drawLetterSpacedText(ctx, text, x, y, spacing, align="left") { if ("letterSpacing" in ctx) { ctx.letterSpacing = `${spacing}px`; ctx.textAlign = align; ctx.fillText(text,x,y); ctx.letterSpacing = "0px"; return; } const chars=graphemes(text); const widths=chars.map(ch=>ctx.measureText(ch).width); const total=widths.reduce((a,b)=>a+b,0)+Math.max(0,chars.length-1)*spacing; let start=align==="center"?x-total/2:x; chars.forEach((ch,i)=>{ctx.fillText(ch,start,y);start+=widths[i]+spacing;}); }
/* Canvas fallback must mirror the SVG geometry exactly: same crop, same
   independent centring, same two-phase text layout. */
async function drawLogoContent(ctx, logoBox, card) {
  const src = state.logo || buildDefaultLogo();
  const img = await imageFromSource(src);
  const geo = logoContentGeometry(logoBox);
  const crop = geo.crop;
  const sw = img.naturalWidth || img.width, sh = img.naturalHeight || img.height;
  ctx.save();
  if (state.logoStyle === "glass") { roundedRect(ctx, logoBox.x, logoBox.y, logoBox.width, logoBox.height, state.layoutPreset === "certificate" ? 44 : 60); ctx.clip(); }
  else { roundedRect(ctx, card.x, card.y, card.width, card.height, card.radius); ctx.clip(); }
  ctx.drawImage(img, crop.cropX * sw, crop.cropY * sh, Math.max(1, crop.cropWidth * sw), Math.max(1, crop.cropHeight * sh), geo.content.x, geo.content.y, geo.content.width, geo.content.height);
  ctx.restore();
}
async function drawCompatiblePng() { const { card, logoBox } = layoutGeometry(), material=currentMaterialToken(), typography=currentTypography(); const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d"); canvas.width=state.width; canvas.height=state.height; ctx.fillStyle="#070A12"; ctx.fillRect(0,0,state.width,state.height); await drawImageSource(ctx, state.background || buildDefaultBackground(), {x:0,y:0,width:state.width,height:state.height}, state.backgroundScale,state.backgroundX,state.backgroundY,state.backgroundOpacity/100); ctx.save(); ctx.shadowColor=material.shadowColor; ctx.shadowBlur=32; ctx.shadowOffsetY=22; ctx.globalAlpha=material.ambientShadowOpacity; roundedRect(ctx,card.x,card.y,card.width,card.height,card.radius); ctx.fill(); ctx.restore(); ctx.save(); roundedRect(ctx,card.x,card.y,card.width,card.height,card.radius); ctx.clip(); ctx.fillStyle=material.tintColor; ctx.globalAlpha=material.tintOpacity+.10; ctx.fillRect(card.x,card.y,card.width,card.height); ctx.globalAlpha=material.secondaryTintOpacity; ctx.fillStyle=material.secondaryTintColor; ctx.fillRect(card.x,card.y+card.height*.55,card.width,card.height*.45); ctx.restore(); ctx.globalAlpha=1; ctx.strokeStyle=material.borderColor; ctx.globalAlpha=material.borderOpacity; ctx.lineWidth=2.5; roundedRect(ctx,card.x,card.y,card.width,card.height,card.radius); ctx.stroke(); ctx.globalAlpha=1; await drawLogoContent(ctx, logoBox, card); drawCompatibleTypography(ctx, card, logoBox, typography); const raw=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("PNG 编码失败")),"image/png",1)); canvas.width=canvas.height=0; return withPngDpi(raw); }
function drawCompatibleTypography(ctx, card, logoBox, typography) {
  ctx.save();
  const drawRole = (role, token, text, x, y, size, align = "left", filter = true) => { ctx.font = `${token.fontWeight} ${size}px ${fontStackForRole(role)}`; ctx.fillStyle = roleColor(token); ctx.globalAlpha = colorOpacity(role); ctx.textAlign = align; if (filter && token.shadowOpacity) { ctx.shadowColor = token.shadowColor; ctx.shadowBlur = token.shadowBlur; ctx.shadowOffsetY = token.shadowOffsetY; ctx.globalAlpha = colorOpacity(role); } else { ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; } drawLetterSpacedText(ctx, text, x, y, token.letterSpacing, align); ctx.shadowColor = "transparent"; };
  if (state.layoutPreset === "certificate") {
    const centerX = card.x + card.width / 2; const subY = logoBox.y + logoBox.height + 70;
    const title = fitCertificateTitle(state.mainTitle, card.width - 230, typography.title.fontSize, typography.title.minFontSize, typography.title.fontWeight, Math.max(1, typography.title.letterSpacing), fontStackForRole("title"));
    drawRole("subtitle", typography.subtitle, state.subTitle, centerX, subY, typography.subtitle.fontSize, "center", false);
    title.lines.forEach((line, i) => drawRole("title", typography.title, line, centerX, subY + 98 + i * title.size * typography.title.lineHeight, title.size, "center", true));
    const lineY = subY + 98 + (title.lines.length - 1) * title.size * typography.title.lineHeight + title.size * .42 + 80;
    const desc = descriptionLines(3, Math.min(820, state.descriptionBoxWidth), typography.description.fontSize, typography.description.fontWeight, typography.description.letterSpacing, fontStackForRole("description"));
    desc.lines.forEach((line, i) => drawRole("description", typography.description, line, centerX, lineY + 78 + textMetrics(typography.description.fontSize, typography.description.fontWeight, fontStackForRole("description")).ascent + i * state.descriptionLineBaselineGap, typography.description.fontSize, "center", true));
  } else {
    // Reuse the exact same measured plan as the SVG renderer.
    const plan = systemTextPlan(card, logoBox, typography);
    const { contentX, contentRight, title, desc, showDivider, layout } = plan;
    if (state.showSubtitleMarker && layout.hasSubtitle) { ctx.globalAlpha = .82; ctx.fillStyle = resolvedTextColor("subtitle"); ctx.globalAlpha = Math.min(.82, colorOpacity("subtitle")); ctx.beginPath(); ctx.arc(contentX + 4, layout.subtitleBaselineY - layout.subtitleInk.ascent / 2 + layout.subtitleInk.descent / 2, 4, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
    if (layout.hasSubtitle) drawRole("subtitle", typography.subtitle, state.subTitle, state.showSubtitleMarker ? contentX + 23 : contentX, layout.subtitleBaselineY, typography.subtitle.fontSize, "left", false);
    drawRole("title", typography.title, state.mainTitle, contentX, layout.titleBaselineY, title.size, "left", true);
    if (showDivider) {
      const w = Math.min(state.dividerWidth, contentRight - contentX);
      const grad = ctx.createLinearGradient(contentX, 0, contentX + w, 0);
      grad.addColorStop(0, hexToRgba(resolvedTextColor("subtitle"), .28 * colorOpacity("subtitle") * clamp(state.dividerOpacity,0,100) / 100));
      grad.addColorStop(.5, hexToRgba(resolvedTextColor("title"), .12 * clamp(state.dividerOpacity,0,100) / 100));
      grad.addColorStop(1, hexToRgba(resolvedTextColor("title"), 0));
      ctx.globalAlpha = 1; ctx.fillStyle = grad; ctx.fillRect(contentX, layout.dividerY - .5, w, 1);
    }
    const baselines = layout.descriptionBaselines || [];
    desc.lines.forEach((line, i) => drawRole("description", typography.description, line, contentX, baselines[i], typography.description.fontSize, "left", true));
  }
  ctx.restore();
}
function hexToRgba(hex, alpha) { const { r, g, b } = hexToRgb(hex); return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha})`; }
async function preparePngBlob() { await ensureResources(); const highQuality = await detectSvgCanvasExport(); if (!highQuality) { showToast("已使用兼容模式导出，视觉效果可能存在轻微差异。"); return drawCompatiblePng(); } const markup=serializeSvg(),url=URL.createObjectURL(new Blob([markup],{type:"image/svg+xml;charset=utf-8"})); try { const img=new Image(); await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error("SVG 图片加载失败"));img.src=url;}); const canvas=document.createElement("canvas");canvas.width=state.width;canvas.height=state.height;const ctx=canvas.getContext("2d");if(!ctx)throw new Error("浏览器无法创建导出画布");ctx.drawImage(img,0,0);const raw=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("PNG 编码失败")),"image/png",1));canvas.width=canvas.height=0;return await withPngDpi(raw); } catch (_) { showToast("已使用兼容模式导出，视觉效果可能存在轻微差异。"); return drawCompatiblePng(); } finally { setTimeout(()=>URL.revokeObjectURL(url),5000); } }
function canShareFile(file) { return !!(navigator.canShare && navigator.share && file && navigator.canShare({ files: [file] })); }
async function saveOrShareBlob(blob, filename, mime, preferShare=false) { const file = new File([blob], filename, { type: mime }); lastExportFile = file; if ($("sheetShare")) $("sheetShare").disabled = !canShareFile(file); if (preferShare && canShareFile(file)) { try { await navigator.share({ files:[file], title: filename }); return; } catch (err) { if (err?.name === "AbortError" || err?.name === "NotAllowedError") return; } } if (!isCoarsePointer()) { download(filename, blob); return; } const url = URL.createObjectURL(blob); if (lastExportUrl) setTimeout(()=>URL.revokeObjectURL(lastExportUrl),8000); lastExportUrl = url; const a = document.createElement("a"); a.href = url; a.download = filename; document.body.append(a); a.click(); a.remove(); if (isLikelyMobileSafari()) { window.open(url, "_blank"); showToast("图片已生成，请长按图片保存，或使用系统分享按钮存储到‘文件’或‘照片’。", "success", true); } else showToast("文件已生成，如未自动保存请在新页面长按保存。", "success"); }
async function downloadPng(options = {}) { if(exportBusy)return; exportBusy=true; const buttons=[$("downloadPng"),$("headerExportPng"),$("mobileExport"),$("sheetExportPng")].filter(Boolean);buttons.forEach(b=>{b.disabled=true;b.dataset.label=b.textContent;b.textContent="正在导出…";});try{const finalBlob=await preparePngBlob();const filename=`${safeFilename(state.mainTitle)}-${state.width}x${state.height}-${timestamp()}.png`;await saveOrShareBlob(finalBlob,filename,"image/png",options.share);if($("sheetNote"))$("sheetNote").textContent="PNG 已生成，可保存或分享。";showToast("PNG 已导出，已写入 300dpi 元数据。");}catch(err){showToast(`导出失败：${err.message||"未知错误"}`,"error",true);}finally{exportBusy=false;buttons.forEach(b=>{b.disabled=false;b.textContent=b.dataset.label||"导出 PNG";});}}
async function downloadSvg(options = {}) { try { await ensureResources(); const blob = new Blob([serializeSvg()],{type:"image/svg+xml;charset=utf-8"}); const filename = `${safeFilename(state.mainTitle)}-${state.width}x${state.height}-${timestamp()}.svg`; await saveOrShareBlob(blob, filename, "image/svg+xml", options.share); showToast("SVG 已导出。某些第三方应用可能不支持内嵌字体，跨应用展示建议使用 PNG。"); if($("sheetNote"))$("sheetNote").textContent="SVG 已生成，建议保存到‘文件’。"; } catch(err){showToast(`导出失败：${err.message||"未知错误"}`,"error",true);} }

function resetAdjustments() { beginInteraction(); Object.keys(DEFAULTS).forEach(k=>{if(k!=="mainTitle"&&k!=="subTitle"&&k!=="description")state[k]=DEFAULTS[k];}); syncUi(); scheduleRender(); endInteraction(); }
/* Clears assets and content back to the blank starting state. */
function applyExampleReset() { beginInteraction(); Object.assign(state,{...DEFAULTS,background:"",logo:"",customFontName:"",customFontData:"",customFontFormat:"",customFontFileName:"",themes:[],selectedTheme:-1,editorTarget:null,logoCropBounds:null}); logoCropCache=null; logoAspectCache={src:"",aspect:1}; invalidateSmartCache(); syncUi(); scheduleRender(); endInteraction(); }
function newArtwork(){ if(!confirm("新建作品会清空当前素材与内容，是否继续？")) return; applyExampleReset(); showToast("已新建空白作品。"); }
function bindTextColorControls() {
  ["title","subtitle","body"].forEach(role => {
    const c = textRoleConfig(role), picker=$(c.picker), hex=$(c.hex), range=$(c.range), num=$(c.number), mode=$(c.modeKey);
    picker?.addEventListener("focus", beginInteraction);
    picker?.addEventListener("input", e => commitTextColor(role, e.target.value, "picker"));
    picker?.addEventListener("change", endInteraction);
    hex?.addEventListener("focus", beginInteraction);
    hex?.addEventListener("input", e => { e.target.value = e.target.value.toUpperCase(); const err=$(c.error); if (err) err.textContent = isValidHex(e.target.value) || e.target.value.trim().length < 2 ? "" : "请输入 #RGB 或 #RRGGBB"; });
    hex?.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); if (commitTextColor(role, e.target.value, "hex")) { e.target.blur(); endInteraction(); } } });
    hex?.addEventListener("blur", e => { if (!commitTextColor(role, e.target.value, "hex")) e.target.value = normalizeHex(state[c.colorKey]) || DEFAULTS[c.colorKey]; endInteraction(); syncTextColorControls(); });
    const setOp = e => setTextOpacity(role, e.target.value);
    range?.addEventListener("pointerdown", beginInteraction);
    range?.addEventListener("input", setOp);
    range?.addEventListener("change", endInteraction);
    num?.addEventListener("focus", beginInteraction);
    num?.addEventListener("input", setOp);
    num?.addEventListener("change", endInteraction);
    mode?.addEventListener("change", e => { beginInteraction(); state[c.modeKey]=e.target.value; if (e.target.value !== "manual") applySmartTextColors({ resetOpacity:false }).finally(()=>{ syncUi(); scheduleRender(); endInteraction(); }); else { syncUi(); scheduleRender(); endInteraction(); } });
  });
  $("recalculateTextColors")?.addEventListener("click", async () => { beginInteraction(); await applySmartTextColors({ resetOpacity:false }); syncUi(); scheduleRender(); endInteraction(); showToast("已重新计算文字颜色，保留用户透明度。"); });
  $("fullSmartFit")?.addEventListener("click", () => smartFitBackground({ fullReset:true, button:$("fullSmartFit") }));
}
function bindBasicInputs(){["mainTitle","subTitle","description"].forEach(k=>$(k).addEventListener("focus",beginInteraction));["mainTitle","subTitle","description"].forEach(k=>$(k).addEventListener("input",e=>{state[k]=e.target.value;scheduleRender();queuePersist();}));["mainTitle","subTitle","description"].forEach(k=>$(k).addEventListener("change",endInteraction));["accentColor","glassTintColor"].forEach(k=>$(k)?.addEventListener("input",e=>{beginInteraction();state[k]=normalizeHex(e.target.value)||e.target.value;if(k==="accentColor"){state.primaryAccent=state.accentColor;if(state.subtitleColorMode==="followAccent")state.subtitleColor=state.accentColor;}state.selectedTheme=-1;markSmartManual();syncUi();scheduleRender();endInteraction();})); if ($("fontFamily")) $("fontFamily").addEventListener("change",e=>{beginInteraction();state.fontFamily=e.target.value;state.titleFontFamily=e.target.value;state.bodyFontFamily=e.target.value;state.typographyManuallyEdited=true;syncUi();scheduleRender();endInteraction();}); ["titleFontFamily","bodyFontFamily","customFontScope","showSubtitleMarker"].forEach(k=>$(k)?.addEventListener("change",e=>{beginInteraction();state[k]=k==="showSubtitleMarker"?e.target.value==="true":e.target.value;state.typographyManuallyEdited=true;syncUi();scheduleRender();endInteraction();}));["cardHeightMode","dividerMode","cardPositionMode","layoutDensityMode"].forEach(k=>$(k)?.addEventListener("change",e=>{beginInteraction();state[k]=e.target.value;if(k==="layoutDensityMode"&&state[k]==="auto")applySmartLayoutForContent();syncUi();scheduleRender();endInteraction();}));$("logoStyle").addEventListener("change",e=>{beginInteraction();state.logoStyle=e.target.value;syncUi();scheduleRender();endInteraction();}); bindTextColorControls();}
function setupClipboard(){window.addEventListener("paste",e=>{const item=[...e.clipboardData.items].find(i=>i.type.startsWith("image/"));if(!item)return;readAsset(item.getAsFile(),state.editorTarget==="logo"?"logo":"background");showToast(`已粘贴到${state.editorTarget==="logo"?" Logo":"底图"}`);});}
function setMobileTab(tab) { document.body.classList.toggle("mobile-preview",tab==="preview"); document.body.classList.toggle("mobile-editor",tab==="editor"); document.querySelectorAll("[data-mobile-tab]").forEach(x=>{const active=x.dataset.mobileTab===tab;x.classList.toggle("active",active);x.setAttribute("aria-selected",active?"true":"false");}); if ($("editorPanel")) $("editorPanel").hidden = false; if ($("previewPanel")) $("previewPanel").hidden = false; queueLayoutUpdate(); }
function openExportSheet(){ const sheet=$("exportSheet"); if(!sheet) return; sheet.hidden=false; document.body.classList.add("sheet-open"); $("sheetExportPng")?.focus(); }
function closeExportSheet(){ const sheet=$("exportSheet"); if(!sheet) return; sheet.hidden=true; document.body.classList.remove("sheet-open"); }
function setupMobile(){document.body.classList.add("mobile-editor");document.querySelectorAll("[data-mobile-tab]").forEach(b=>b.addEventListener("click",()=>setMobileTab(b.dataset.mobileTab)));$("mobilePreview")?.addEventListener("click",()=>setMobileTab("preview"));$("mobileExport")?.addEventListener("click",openExportSheet);$("sheetExportPng")?.addEventListener("click",()=>downloadPng({share:false}));$("sheetExportSvg")?.addEventListener("click",()=>downloadSvg({share:false}));$("sheetShare")?.addEventListener("click",async()=>{if(lastExportFile&&canShareFile(lastExportFile)){try{await navigator.share({files:[lastExportFile],title:lastExportFile.name});}catch(err){if(err?.name!=="AbortError"&&err?.name!=="NotAllowedError")showToast("分享失败，请尝试下载后手动保存。","error");}}});$("exportSheetScrim")?.addEventListener("click",closeExportSheet);$("sheetCancel")?.addEventListener("click",closeExportSheet); setupVisualViewport(); document.addEventListener("focusin",e=>{if(e.target.matches("input,textarea,select")){document.body.classList.add("keyboard-focus"); setTimeout(()=>e.target.scrollIntoView({block:"center",behavior:"smooth"}),80);}}); document.addEventListener("focusout",()=>setTimeout(()=>document.body.classList.remove("keyboard-focus"),180)); }
function setupVisualViewport(){ const vv=window.visualViewport; if(!vv)return; const update=()=>{const keyboardOpen=vv.height < window.innerHeight * .78 || vv.offsetTop > 0; document.body.classList.toggle("keyboard-open",keyboardOpen); document.documentElement.style.setProperty("--visual-height", `${vv.height}px`); queueLayoutUpdate();}; vv.addEventListener("resize",update); vv.addEventListener("scroll",update); update(); }
function queueLayoutUpdate(){ if(layoutQueued)return; layoutQueued=true; requestAnimationFrame(()=>{layoutQueued=false; scheduleRender();}); }
function setupResizeObserver(){ if(window.ResizeObserver){new ResizeObserver(queueLayoutUpdate).observe($("previewStage"));} window.addEventListener("resize",queueLayoutUpdate); window.addEventListener("orientationchange",queueLayoutUpdate); window.visualViewport?.addEventListener("resize",queueLayoutUpdate); }
function bindShortcuts(){window.addEventListener("keydown",e=>{if(!(e.metaKey||e.ctrlKey))return;if(e.key.toLowerCase()==="z"){e.preventDefault();e.shiftKey?redo():undo();}else if(e.key.toLowerCase()==="y"){e.preventDefault();redo();}});}
function init(){setupRanges();setupUpload("background");setupUpload("logo");setupFontUpload();assetQuickActions();bindBasicInputs();setupCanvasEditing();setupClipboard();setupMobile();setupResizeObserver();bindShortcuts();$("downloadPng").addEventListener("click",()=>downloadPng());$("headerExportPng").addEventListener("click",()=>downloadPng());$("downloadSvg").addEventListener("click",()=>downloadSvg());$("undoButton").addEventListener("click",undo);$("redoButton").addEventListener("click",redo);$("resetAdjustments").addEventListener("click",resetAdjustments);$("newArtwork").addEventListener("click",newArtwork);$("smartFit").addEventListener("click",smartFitBackground);
  $("logoCropMode")?.addEventListener("change",async e=>{beginInteraction();state.logoCropMode=e.target.value;if(state.logoCropMode==="auto")await refreshLogoCropBounds();syncUi();scheduleRender();endInteraction();});
  syncUi();renderSvg();recordHistory();
  restorePersisted().then(()=>{syncUi();scheduleRender();recordHistory();});
}
/* Layout introspection hook for the automated layout regression tests.
   Read-only, and only mounted for local development or when ?debug=layout is
   present, so production visitors never get the internal editor state. */
function layoutDebugEnabled() {
  try {
    const host = location.hostname;
    const local = host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "" || location.protocol === "file:";
    return local || new URLSearchParams(location.search).get("debug") === "layout";
  } catch (_) { return false; }
}
if (layoutDebugEnabled()) {
  window.__state = state;
  window.__debug = { layoutGeometry, systemTextPlan, currentTypography, logoContentGeometry, layoutSystemTypography, measureText, glyphMetrics, fontStackForRole, computeSystemAutoLayout, activeLogoCrop, chooseSmartMaterial, analyzeBackground, analyzeLogoColors, renderSmartAnalysisCanvas, roleBounds, glassUniformity, smartFitBackground, describeAccent };
  window.__pngFallback = drawCompatiblePng;
  window.__cropBench = () => computeLogoCropBounds(state.logo);
}
try { init(); } catch (err) { console.error(err); showToast("页面初始化失败，请刷新或更换浏览器重试。", "error", true); }
