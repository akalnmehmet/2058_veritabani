// Path: @/scenes/projeekle/pdf/pdfCommon.ts
// import { jsPDF } from "jspdf";
// import autoTableDefault from "jspdf-autotable";

// /** dışa export: PdfEngine.js şunu import ediyor */
// export const autoTable = autoTableDefault;

// /* -----------------------------------------------------------
//  * Küçük yardımcılar
//  * --------------------------------------------------------- */
// function arrayBufferToBase64(buf) {
//   return new Promise((resolve, reject) => {
//     const blob = new Blob([buf], { type: "font/ttf" });
//     const reader = new FileReader();
//     reader.onloadend = () => resolve(reader.result.split(",")[1]); // "data:...;base64,..." kısmını kes
//     reader.onerror = reject;
//     reader.readAsDataURL(blob);
//   });
// }

// async function fetchFontBase64(path) {
//   const url = `${import.meta.env.BASE_URL}fonts/${path}`;
//   const resp = await fetch(url);
//   if (!resp.ok) throw new Error(`Font indirilemedi: ${url}`);
//   const buf = await resp.arrayBuffer();
//   return await arrayBufferToBase64(buf);
// }

// /** ctx içinden "a.b.c" gibi path okumak için */
// export function pick(obj, path) {
//   if (!obj || !path) return "";
//   return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj) ?? "";
// }

// /** Basit expression desteği: "date(fieldPath)" */
// function evalValueExpr(expr, ctx) {
//   try {
//     const m = String(expr).match(/^date\((.+)\)$/i);
//     if (m) {
//       const fieldPath = m[1].trim();
//       const val = pick(ctx, fieldPath);
//       const dt = val ? new Date(val) : null;
//       if (dt && !isNaN(dt.getTime())) {
//         // TR format: GG.AA.YYYY
//         const dd = String(dt.getDate()).padStart(2, "0");
//         const mm = String(dt.getMonth() + 1).padStart(2, "0");
//         const yy = dt.getFullYear();
//         return `${dd}.${mm}.${yy}`;
//       }
//       return "";
//     }
//   } catch (_) {}
//   return "";
// }

// function getLineHeight(doc) {
//   // jsPDF default lineHeightFactor ~1.15, fontSize'e göre hesaplamak istersen:
//   return (doc.getFontSize?.() || 10) * 1.35;
// }

// /* -----------------------------------------------------------
//  * Font Yönetimi
//  * --------------------------------------------------------- */

// /**
//  * İstenen family+style varsa onu set eder; yoksa önce same-family normal,
//  * o da yoksa helvetica'ya düşer. Böylece widths undefined hatası engellenir.
//  */
// export function setFontSafe(doc, family, style = "normal") {
//   try {
//     const list = doc.getFontList?.() || {};
//     const styles = list?.[family];
//     if (Array.isArray(styles)) {
//       if (styles.includes(style)) {
//         doc.setFont(family, style);
//         return { family, style };
//       }
//       if (styles.includes("normal")) {
//         doc.setFont(family, "normal");
//         return { family, style: "normal" };
//       }
//     } else if (styles) {
//       // bazı paketlerde object dönebiliyor; yine deneyelim
//       try {
//         doc.setFont(family, style);
//         return { family, style };
//       } catch (_) {}
//       try {
//         doc.setFont(family, "normal");
//         return { family, style: "normal" };
//       } catch (_) {}
//     }
//   } catch (_) {}

//   // family hiç yoksa yerleşik fontlara düş
//   try {
//     doc.setFont("helvetica", style);
//     return { family: "helvetica", style };
//   } catch (_) {}
//   doc.setFont("helvetica", "normal");
//   return { family: "helvetica", style: "normal" };
// }

// /**
//  * Ölçüm almadan önce mutlaka uygun fontu güvenle seç.
//  */
// function getTextWidthSafe(doc, text, family = "Roboto", style = "normal") {
//   setFontSafe(doc, family, style);
//   return doc.getTextWidth(String(text ?? ""));
// }
// async function fetchToBase64Public(relPath) {
//   // Vite base path ile public altındaki dosyayı getirir
//   const url = `${import.meta.env.BASE_URL}${relPath}`;
//   const resp = await fetch(url);
//   // try/catch yok; burada 200 dönmek ZORUNDA
//   const buf = await resp.arrayBuffer();
//   return toBase64FromArrayBuffer(buf);
// }

// /* -----------------------------------------------------------
//  * jsPDF doc oluşturma (Roboto Regular + Bold yükler)
//  * --------------------------------------------------------- */
// export async function createPdfDoc() {
//   const doc = new jsPDF({ unit: "pt", format: "a4" });

//   // Roboto Regular
//   const reg64 = await fetchFontBase64("Roboto-Regular.ttf");
//   doc.addFileToVFS("Roboto-Regular.ttf", reg64);
//   doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");

//   // Roboto Bold
//   const bold64 = await fetchFontBase64("Roboto-Bold.ttf");
//   doc.addFileToVFS("Roboto-Bold.ttf", bold64);
//   doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");

//   doc.setFont("Roboto", "normal");
//   return doc;
// }

// /* -----------------------------------------------------------
//  * PDF Aç/Kaydet
//  * --------------------------------------------------------- */
// export function openPdf(doc, filename = "output.pdf") {
//   const blob = doc.output("blob");
//   const url = URL.createObjectURL(blob);
//   const win = window.open(url, "_blank");
//   if (!win) {
//     doc.save(filename);
//     URL.revokeObjectURL(url);
//   }
// }

// /* -----------------------------------------------------------
//  * Header: splitBrand çizimi
//  * headerCfg yapısı:
//  * {
//  *   leftImage: { width, height, type, src? },
//  *   rightBox: {
//  *     title: "Şirket",
//  *     lines: [
//  *       { type: "labelValue", label: "Adres", value: "..." },
//  *       { type: "link", text: "site", href: "https://..." },
//  *       { type: "text", text: "..." }
//  *     ]
//  *   },
//  *   infoRowsLayout: { columnsPerRow: 3, cellPaddingX: 6, cellPaddingY: 6 },
//  *   infoRows: [
//  *     { label: "Müşteri", valueField: "requirements.customer.name", enabled: true,  hAlign: "left",   vAlign: "middle", labelMode: "inline" },
//  *     { label: "Tarih",   valueExpr:  "date(proje.created_at)",    enabled: true,  hAlign: "center", vAlign: "middle", labelMode: "inline" },
//  *     ...
//  *   ]
//  * }
//  * ctx: { proje, requirements, projectName, ... , assets: { leftImageDataUrl } }
//  * --------------------------------------------------------- */

// export async function drawSplitHeader(doc, headerCfg, ctx) {
//   const pageW       = doc.internal.pageSize.getWidth();
//   const leftMargin  = 40;
//   const rightMargin = 40;
//   const gapX        = 0;    // LOGO ↔ rightBox arası boşluk KALMASIN
//   const padX        = 8;    // rightBox iç yatay padding
//   const padY        = 6;    // rightBox iç dikey padding

//   // Font varsayılanları
//   const baseFontSize  = 10;
//   const headFontSize  = 11;
//   const titleFontSize = 12;
//   const lineFactor    = (typeof doc.getLineHeightFactor === "function") ? doc.getLineHeightFactor() : 1.15;

//   // Kullanılacak font
//   const fontName = (doc.getFontList && doc.getFontList()["Roboto"])
//     ? "Roboto"
//     : (doc.getFont().fontName || "helvetica");

//   // --- SOL: Logo alanı (DİKKAT: dikdörtgeni sağ kutuya göre SONDA çizeceğiz) ---
//   const leftRequestedW = Number(headerCfg?.leftImage?.width  || 260);
//   const leftRequestedH = Number(headerCfg?.leftImage?.height || 90); // sadece ilk tahmin; finali sağ kutu belirleyecek
//   const leftX = leftMargin;
//   const topY  = 40;

//   // --- SAĞ: Firma kutuları ---
//   const rightX = leftX + leftRequestedW + gapX;     // yapışık
//   const rightW = Math.max(180, pageW - rightMargin - rightX);
//   let   rightCursorY = topY;

//   // Başlık kutusu
//   if (headerCfg?.rightBox?.title) {
//     doc.setFont(fontName, "normal");
//     doc.setFontSize(titleFontSize);
//     const t = String(headerCfg.rightBox.title);
//     const titleH = titleFontSize * lineFactor + padY * 2;
//     doc.setLineWidth(0.8);
//     doc.rect(rightX, rightCursorY, rightW, titleH, "S");
//     doc.text(t, rightX + padX, rightCursorY + padY + titleFontSize, { align: "left" });
//     rightCursorY += titleH;
//   }

//   // Satırlar (adres/tel/web/mail) – her biri ayrı kutu
//   const rLines = Array.isArray(headerCfg?.rightBox?.lines) ? headerCfg.rightBox.lines : [];
//   for (const line of rLines) {
//     doc.setFont(fontName, "normal");

//     if (line.type === "labelValue") {
//       const lbl  = (line.label ? (String(line.label) + ": ") : "");
//       const text = lbl + (line.value ?? "");
//       const lines = doc.splitTextToSize(String(text), Math.max(10, rightW - 2 * padX));
//       const h = Math.max(22, lines.length * (baseFontSize * lineFactor) + 2 * padY);
//       doc.setLineWidth(0.8);
//       doc.rect(rightX, rightCursorY, rightW, h, "S");
//       doc.setFontSize(baseFontSize);
//       doc.text(lines, rightX + padX, rightCursorY + padY + baseFontSize, { align: "left" });
//       rightCursorY += h;
//       continue;
//     }

//     if (line.type === "link") {
//       const txt  = String(line.text || line.href || "");
//       const href = String(line.href || "");
//       const lines = doc.splitTextToSize(txt, Math.max(10, rightW - 2 * padX));
//       const h = Math.max(22, lines.length * (baseFontSize * lineFactor) + 2 * padY);
//       doc.setLineWidth(0.8);
//       doc.rect(rightX, rightCursorY, rightW, h, "S");
//       doc.setFontSize(baseFontSize);
//       doc.text(lines, rightX + padX, rightCursorY + padY + baseFontSize, { align: "left" });
//       try {
//         if (href) {
//           doc.link(rightX + padX, rightCursorY + padY, rightW - 2 * padX, baseFontSize * lineFactor, { url: href });
//         }
//       } catch (_) {}
//       rightCursorY += h;
//       continue;
//     }

//     // Diğer tipler: düz metin
//     const content = String(line.text || line.value || "");
//     const lines = doc.splitTextToSize(content, Math.max(10, rightW - 2 * padX));
//     const h = Math.max(22, lines.length * (baseFontSize * lineFactor) + 2 * padY);
//     doc.setLineWidth(0.8);
//     doc.rect(rightX, rightCursorY, rightW, h, "S");
//     doc.setFontSize(baseFontSize);
//     doc.text(lines, rightX + padX, rightCursorY + padY + baseFontSize, { align: "left" });
//     rightCursorY += h;
//   }

//   // ŞU AN: sağ kutu üst bloğu tamam. Logo dikdörtgenini bunun yüksekliğine eşitleyip şimdi çizeceğiz.
//   const rightBoxBottomY = rightCursorY;
//   const leftFinalW = leftRequestedW;
//   const leftFinalH = rightBoxBottomY - topY;   // LOGO YÜKSEKLİĞİ = SAĞ BLOK YÜKSEKLİĞİ

//   // Logo dikdörtgeni (şimdi çiz)
//   doc.setLineWidth(0.8);
//   doc.rect(leftX, topY, leftFinalW, leftFinalH, "S");

//   // Logo resmi (varsa) – orantılı sığdır, merkezle
//   const leftImg = ctx?.assets?.leftImageDataUrl; // "data:image/png;base64,...."
//   if (leftImg) {
//     try {
//       const inset = 2; // içten küçük boşluk
//       const boxW = leftFinalW - 2 * inset;
//       const boxH = Math.max(0, leftFinalH - 2 * inset);

//       // basit sığdırma: genişliğe göre ölçekle, yüksekliği aşarsa yüksekliğe göre
//       // (not: elimizde gerçek görsel orantısı yok; jsPDF addImage orantıyı korur)
//       let drawW = boxW;
//       let drawH = boxH;
//       // En azından logoyu kutuya sığdır (cover değil, contain mantığı)
//       // Çok uzun kutularda logonun aşırı uzamamasını sağlamak için yükseklik kadar sınırla
//       // (addImage'ta orana dikkat edemiyorsak full box'a koyuyoruz)
//       doc.addImage(leftImg, headerCfg?.leftImage?.type || "PNG", leftX + inset, topY + inset, drawW, drawH);
//     } catch (_) {}
//   }

//   // --- ALTTA: infoRows ızgarası >>> sağ üst blokla YAPIŞIK (boşluk YOK) ---
// // --- ALTTA: infoRows ızgarası (satır başına max 3; satır genişliği tam dolu) ---
// const layoutCfg = headerCfg?.infoRowsLayout || {};
// const COLS_MAX  = Math.min(3, Number(layoutCfg.columnsPerRow) || 3); // max 3
// const cellPadX  = Number(layoutCfg.cellPaddingX ?? 6);
// const cellPadY  = Number(layoutCfg.cellPaddingY ?? 6);

// const gridLeftX = leftMargin;
// const gridRight = pageW - rightMargin;
// const gridW     = gridRight - gridLeftX;

// const itemsAll  = Array.isArray(headerCfg?.infoRows) ? headerCfg.infoRows : [];
// const items     = itemsAll.filter(it => it == null ? false : (it.enabled !== false));

// const getByPath = (obj, path) => {
//   if (!path) return "";
//   return String(path).split(".").reduce((acc, k) => (acc && acc[k] != null ? acc[k] : undefined), obj);
// };
// const evalExpr = (expr) => {
//   try {
//     if (/^date\(/i.test(expr)) {
//       const inner = expr.slice(expr.indexOf("(") + 1, expr.lastIndexOf(")")).trim();
//       const raw   = getByPath(ctx, inner);
//       if (!raw) return "";
//       const d = new Date(raw);
//       if (isNaN(d.getTime())) return "";
//       return d.toLocaleDateString();
//     }
//   } catch (_) {}
//   return "";
// };
// const getValue = (it) => it.valueExpr ? evalExpr(it.valueExpr)
//                      : it.valueField ? getByPath(ctx, it.valueField)
//                      : "";

// // 1) Öğeleri 3'lü satırlara böl
// const rows = [];
// for (let i = 0; i < items.length; i += COLS_MAX) {
//   rows.push(items.slice(i, i + COLS_MAX)); // her eleman bir satır: 1..3 hücre
// }

// let blockBottomY = rightBoxBottomY;
// if (rows.length) {
//   doc.setFont(fontName, "normal");
//   doc.setFontSize(baseFontSize);

//   // 2) ÖN ÖLÇÜM: tüm satırlar için hücre genişlikleri ve yükseklikler
//   const measuredRows = rows.map((rowItems) => {
//     const actualCols = rowItems.length;
//     const cellW = gridW / actualCols;

//     const cells = rowItems.map((it) => {
//       const label = String(it.label ?? "");
//       const val   = String(getValue(it) ?? "");
//       const mode  = it.labelMode || "inline"; // inline | stack | hidden

//       let textForMeasure = "";
//       if (mode === "hidden") {
//         textForMeasure = val;
//       } else if (mode === "stack") {
//         textForMeasure = (label ? (label + ":") : "") + "\n" + val;
//       } else {
//         textForMeasure = label ? (label + ": " + val) : val;
//       }

//       const lines    = doc.splitTextToSize(textForMeasure, Math.max(10, cellW - 2 * cellPadX));
//       const contentH = Math.max(baseFontSize * lineFactor, lines.length * (baseFontSize * lineFactor));
//       const boxH     = Math.max(22, contentH + 2 * cellPadY);
//       return { it, lines, boxH };
//     });

//     const rowMaxH = Math.max(...cells.map(c => c.boxH), 22);
//     return { rowItems, actualCols, cellW, cells, rowMaxH };
//   });

//   // 3) ORTAK SATIR YÜKSEKLİĞİ: tüm satırlardaki max
//   const commonRowH = Math.max(...measuredRows.map(r => r.rowMaxH));

//   // 4) ÇİZİM: her satırı commonRowH ile çiz
//   let gridY = blockBottomY; // yapışık
//   for (const r of measuredRows) {
//     const { rowItems, actualCols, cellW, cells } = r;

//     for (let c = 0; c < rowItems.length; c++) {
//       const cellX = gridLeftX + c * cellW;
//       const cellY = gridY;
//       const m     = cells[c];

//       // kutu
//       doc.setLineWidth(0.8);
//       doc.rect(cellX, cellY, cellW, commonRowH, "S");

//       // hizalama
//       const hAlign = (m.it.hAlign || "left");   // left|center|right
//       const vAlign = (m.it.vAlign || "middle"); // top|middle|bottom

//       let textX;
//       if (hAlign === "center")      textX = cellX + cellW / 2;
//       else if (hAlign === "right")  textX = cellX + cellW - cellPadX;
//       else                          textX = cellX + cellPadX;

//       const linesH = m.lines.length * (baseFontSize * lineFactor);
//       let textY;
//       if (vAlign === "top") {
//         textY = cellY + cellPadY + baseFontSize;
//       } else if (vAlign === "bottom") {
//         textY = cellY + commonRowH - cellPadY - (linesH - baseFontSize);
//       } else {
//         const topGap = (commonRowH - linesH) / 2;
//         textY = cellY + topGap + baseFontSize;
//       }

//       const alignOpt = (hAlign === "center") ? "center" : (hAlign === "right") ? "right" : "left";
//       doc.text(m.lines, textX, textY, { align: alignOpt });
//     }

//     gridY += commonRowH;
//   }

//   blockBottomY = gridY;
// }

// return { bottomY: blockBottomY };

// }
