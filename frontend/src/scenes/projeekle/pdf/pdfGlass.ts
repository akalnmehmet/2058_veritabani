// Path: @/scenes/projeekle/pdf/pdfGlass.ts
// Path Alias: src/scenes/projeekle/pdf/pdfGlass.js
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { mapGlass } from "./mappers/glass.mapper";
import { getBrandImage } from "@/redux/actions/actionsPdf";
// ⬇️ senin projende nerede ise ordan import et
import { getSystemVariantPdfPhoto } from "@/redux/actions/actionsPdf";

/* ===================== ortak yardımcılar ===================== */
function arrayBufferToBase64(buf) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([buf], { type: "font/ttf" });
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
async function fetchFontBase64(path) {
  const url = `${import.meta.env.BASE_URL}fonts/${path}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Font indirilemedi: ${url}`);
  const buf = await resp.arrayBuffer();
  return await arrayBufferToBase64(buf);
}
async function createPdfDoc() {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  // Roboto Regular
  const reg64 = await fetchFontBase64("Roboto-Regular.ttf");
  doc.addFileToVFS("Roboto-Regular.ttf", reg64);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  // Roboto Bold
  const bold64 = await fetchFontBase64("Roboto-Bold.ttf");
  doc.addFileToVFS("Roboto-Bold.ttf", bold64);
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
  // Varsayılan: her yerde kalın yaz
  doc.setFont("Roboto", "bold");
  return doc;
}
// Artık her zaman BOLD ayarlar (style parametresi gözardı edilir)
function setFontSafe(doc, family, _style = "bold") {
  try {
    const list = doc.getFontList?.() || {};
    const styles = list?.[family];
    if (Array.isArray(styles)) {
      if (styles.includes("bold")) { doc.setFont(family, "bold"); return; }
      if (styles.includes("normal")) { doc.setFont(family, "normal"); return; }
    } else if (styles) {
      try { doc.setFont(family, "bold"); return; } catch {}
      try { doc.setFont(family, "normal"); return; } catch {}
    }
  } catch {}
  doc.setFont("helvetica", "bold");
}
function truncateTo(n, d = 0) {
  if (!Number.isFinite(n)) return n;
  const f = Math.pow(10, d);
  return Math.trunc(n * f) / f;   // kırp, yuvarlama yok
}
function pick(obj, path) {
  if (!obj || !path) return "";
  return path.split(".").reduce((acc, k) => (acc ? acc[k] : undefined), obj) ?? "";
}
function openPdf(doc, filename = "cam-ciktisi.pdf") {
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    doc.save(filename);
    URL.revokeObjectURL(url);
  }
}
function buildColumnStyles(cols = []) {
  const s = {};
  cols.forEach((c, i) => {
    s[i] = {};
    if (c.width) s[i].cellWidth = c.width;
    if (c.align === "right") s[i].halign = "right";
    if (c.align === "center") s[i].halign = "center";
  });
  return s;
}
function formatCell(v, f) {
  if (f == null) return v ?? "";
  const n = Number(v);
  if (f === "integer") return Number.isFinite(n) ? String(Math.round(n)) : (v ?? "");
  const m = String(f).match(/^number\((\d+)\)$/);
  if (m) {
    const d = +m[1] || 2;
    return Number.isFinite(n) ? n.toFixed(d) : (v ?? "");
  }
  const t = String(f).match(/^truncate\((\d+)\)$/);
  if (t) {
    const d = +t[1] || 0;
    if (!Number.isFinite(n)) return v ?? "";
    const cut = truncateTo(n, d);
    // her zaman sabit hane göstermek için toFixed kullanıyoruz
    return cut.toFixed(d);
  }
  return v ?? "";
}
function sumField(rows, f) {
  return (rows || []).reduce((s, r) => s + (Number(pick(r, f)) || 0), 0);
}

// --- ek: index'e güvenli ekleme yardımcıları ---
function clamp(n, min, max) {
  const x = Number(n);
  return Math.max(min, Math.min(max, Number.isFinite(x) ? x : min));
}
function insertAt(base, index, token) {
  const s = String(base ?? "");
  const i = clamp(index, 0, s.length); // boşluklar .length içinde doğal olarak sayılır
  return s.slice(0, i) + String(token ?? "") + s.slice(i);
}

/* ===================== PNG helper'ları ===================== */

// dataUrl'den doğal width/height oku (aspect için)
async function getImageSize(dataUrl) {
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.width, h: img.height });
    img.onerror = (e) => reject(e);
    img.src = dataUrl;
  });
}

// getSystemVariantPdfPhoto güvenli çalıştır (thunk dönerse dispatch ile)
async function fetchVariantPngSafe(systemVariantId, ctx) {
  try {
    let res = getSystemVariantPdfPhoto(systemVariantId);

    // thunk ise çalıştır
    if (typeof res === "function") {
      const dispatch =
        ctx?.dispatch ||
        ctx?.store?.dispatch ||
        (() => {}); // no-op

      res = await res(dispatch);
    }

    // bazı implementasyonlarda {dataUrl: "..."} gelebilir
    if (res && typeof res === "object" && res.dataUrl) return res.dataUrl;
    if (typeof res === "string") return res;

    return null;
  } catch (e) {
    console.warn("getSystemVariantPdfPhoto hata:", systemVariantId, e);
    return null;
  }
}

// PNG'leri tablo bittikten SONRA, sayfa üstünden AŞAĞI doğru çiz
// ve mevcut sabit genişliğin 5 KATI olacak şekilde (sayfa enini aşmayacak şekilde) büyüt
async function drawSystemVariantPngs(doc, requirements, ctx, startAfterY = 0) {
  const systems = requirements?.systems || [];
  const uniqIds = [];
  const seen = new Set();

  for (const s of systems) {
    const id = s?.system_variant_id;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    uniqIds.push(id);
  }
  if (!uniqIds.length) return;

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const leftMargin = 40;
  const rightMargin = 40;
  const topMargin = 20;
  const bottomMargin = 10;

  // =========================
  // 1) SABİT GENİŞLİK (5x)
  // =========================
  const cmToPt = (cm) => cm * 28.3464567;

  // Eski değer 7 cm idi → 5 katı:
  let FIXED_W = cmToPt(7) * 3;

  // Sayfada kullanılabilir alanı aşmasın
  const maxAllowedW = pageW - leftMargin - rightMargin;
  if (FIXED_W > maxAllowedW) FIXED_W = maxAllowedW;

  const GAP = 10; // pngler arası boşluk (pt)

  // 2) TABLODAN SONRA, ÜSTTEN AŞAĞI DOĞRU YERLEŞTİR
  let cursorY = Math.max(startAfterY + 20, topMargin);

  for (const variantId of uniqIds) {
    const dataUrl = await fetchVariantPngSafe(variantId, ctx);
    if (!dataUrl) continue;

    let size;
    try {
      size = await getImageSize(dataUrl); // doğal px ölçüleri
    } catch (e) {
      console.warn("PNG okunamadı:", variantId, e);
      continue;
    }

    // =========================
    // 3) ORANI KORUYARAK ÖLÇ
    // =========================
    const ratio = (size.w && size.h) ? (size.w / size.h) : 1;
    const drawW = FIXED_W;
    const drawH = drawW / ratio;

    // Bu sayfada altta yer kalmıyorsa yeni sayfaya geç
    const usableBottom = pageH - bottomMargin;
    if (cursorY + drawH > usableBottom) {
      doc.addPage();
      // Yeni sayfada en üstten başla
      cursorY = topMargin;
    }

    // Ortala ve yukarıdan aşağı doğru yerleştir
    const x = (pageW - drawW) / 2;  // yatay ortalama
    const y = cursorY;              // üstten aşağı doğru

    doc.addImage(dataUrl, "PNG", x, y, drawW, drawH);

    // bir sonraki PNG altta devam etsin
    cursorY = y + drawH + GAP;
  }
}


/* ============== split header (brand + pdf.infoRows merge) ============== */
async function drawSplitHeader(doc, brandConfig, pdfConfig, ctx) {
  // brandConfig: leftImage + rightBox
  // pdfConfig: infoRowsLayout + infoRows
  const headerCfg = {
    ...(brandConfig || {}),
    infoRowsLayout: pdfConfig?.infoRowsLayout,
    infoRows: pdfConfig?.infoRows
  };

  const pageW = doc.internal.pageSize.getWidth();
  const leftMargin = 40;
  const rightMargin = 40;
  const padX = 8;
  const padY = 6;
  const baseFontSize = 9;   // <- tüm fontlar 9
  const titleFontSize = 9;  // <- başlık da 9
  const lineFactor = (typeof doc.getLineHeightFactor === "function") ? doc.getLineHeightFactor() : 1.15;
  const fontName = (doc.getFontList && doc.getFontList()["Roboto"])
    ? "Roboto"
    : (doc.getFont().fontName || "helvetica");

  // SOL kutu (logo alanı)
  const leftRequestedW = Number(headerCfg?.leftImage?.width || 260);
  const leftX = leftMargin;
  const topY = 5;

  // SAĞ blok (firma kutuları)
  const rightX = leftX + leftRequestedW;
  const rightW = Math.max(180, pageW - rightMargin - rightX);
  let rightCursorY = topY;

  // Başlık
  if (headerCfg?.rightBox?.title) {
    setFontSafe(doc, fontName, "bold");
    doc.setFontSize(titleFontSize);
    const t = String(headerCfg.rightBox.title);
    const titleH = titleFontSize * lineFactor + 2 * padY;
    doc.setLineWidth(0.8);
    doc.rect(rightX, rightCursorY, rightW, titleH, "S");
    const centerX = rightX + rightW / 2;
    const centerY = rightCursorY + titleH / 2 + titleFontSize / 3; // optik dengeleme
    doc.text(t, centerX, centerY, { align: "center" });
    rightCursorY += titleH;
  }

  // Satırlar
  const rLines = Array.isArray(headerCfg?.rightBox?.lines) ? headerCfg.rightBox.lines : [];
  for (const line of rLines) {
    setFontSafe(doc, fontName, "bold");
    const txt = (line.type === "labelValue")
      ? ((line.label ? (String(line.label) + ": ") : "") + (line.value ?? ""))
      : (String(line.text || line.value || line.href || ""));
    const lines = doc.splitTextToSize(txt, Math.max(10, rightW - 2 * padX));
    const h = Math.max(22, lines.length * (baseFontSize * lineFactor) + 2 * padY);
    doc.setLineWidth(0.8);
    doc.rect(rightX, rightCursorY, rightW, h, "S");
    doc.setFontSize(baseFontSize);
    doc.text(lines, rightX + padX, rightCursorY + padY + baseFontSize, { align: "left" });
    if (line.type === "link" && line.href) {
      try { doc.link(rightX + padX, rightCursorY + padY, rightW - 2 * padX, baseFontSize * lineFactor, { url: line.href }); } catch { }
    }
    rightCursorY += h;
  }

  // Sol logo kutusu: sağ blok yüksekliğine eşit
  const rightBottomY = rightCursorY;
  const leftFinalW = leftRequestedW;
  const leftFinalH = rightBottomY - topY;
  doc.setLineWidth(0.8);
  doc.rect(leftX, topY, leftFinalW, leftFinalH, "S");

  try {
    // ✨ Marka logosunu doğrudan data URL olarak al
    const leftImg = await getBrandImage(); // "data:image/png;base64,..." string
    if (!leftImg) throw new Error("Boş logo yanıtı");

    const inset = 2;
    const boxW = leftFinalW - 2 * inset;           // max ~256 px
    const boxH = Math.max(0, leftFinalH - 2 * inset);

    // orijinal boyutları öğren
    const img = new Image();
    img.src = leftImg;
    await new Promise(r => { img.onload = r; });

    const imgW = img.width;
    const imgH = img.height;
    const ratio = imgW / imgH;

    // genişliği kutuya uydur, yüksekliği orantılı
    let drawW = boxW;
    let drawH = drawW / ratio;

    // eğer yüksekliğe sığmazsa yüksekliğe göre uyarla
    if (drawH > boxH) {
      drawH = boxH;
      drawW = drawH * ratio;
    }

    // ortala
    const x = leftX + inset + (boxW - drawW) / 2;
    const y = topY + inset + (boxH - drawH) / 2;

    doc.addImage(leftImg, "PNG", x, y, drawW, drawH);
  } catch (e) {
    console.warn("logo.png yüklenemedi:", e);
  }

  // infoRows grid
  const layoutCfg = headerCfg?.infoRowsLayout || {};
  const COLS_MAX = Math.min(3, Number(layoutCfg.columnsPerRow) || 3);
  const cellPadX = Number(layoutCfg.cellPaddingX ?? 6);
  const cellPadY = Number(layoutCfg.cellPaddingY ?? 6);

  const gridLeftX = leftMargin;
  const gridRight = pageW - rightMargin;
  const gridW = gridRight - gridLeftX;

  const itemsAll = Array.isArray(headerCfg?.infoRows) ? headerCfg.infoRows : [];
  const items = itemsAll.filter(it => it == null ? false : (it.enabled !== false));

  const getByPath = (o, p) => !o || !p ? "" : String(p).split(".").reduce((a, k) => (a && a[k] != null ? a[k] : undefined), o);
  const evalExpr = (expr) => /^date\(/i.test(expr)
    ? (() => {
      const inner = expr.slice(expr.indexOf("(") + 1, expr.lastIndexOf(")")).trim();
      const raw = getByPath(ctx, inner);
      if (!raw) return "";
      const d = new Date(raw);
      return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
    })()
    : "";
  const getValue = it => it.valueExpr ? evalExpr(it.valueExpr) : it.valueField ? (getByPath(ctx, it.valueField) ?? "") : "";

  const rows = [];
  for (let i = 0; i < items.length; i += COLS_MAX) rows.push(items.slice(i, i + COLS_MAX));

  let blockBottomY = rightBottomY;
  if (rows.length) {
    setFontSafe(doc, fontName, "bold");
    doc.setFontSize(baseFontSize);
    const lineFactor2 = (typeof doc.getLineHeightFactor === "function") ? doc.getLineHeightFactor() : 1.15;

    // ölç ve çiz
    let gridY = blockBottomY;
    for (const rowItems of rows) {
      const actualCols = rowItems.length;
      const cellW = gridW / actualCols;

      // satır yüksekliğini belirle
      let rowMaxH = 22;
      const prepared = rowItems.map(it => {
        const label = String(it.label ?? "");
        const val = String(getValue(it) ?? "");
        const mode = it.labelMode || "inline";
        let text = "";
        if (mode === "hidden") text = val;
        else if (mode === "stack") text = (label ? (label + ":") : "") + "\n" + val;
        else text = label ? (label + ": " + val) : val;

        const lines = doc.splitTextToSize(text, Math.max(10, cellW - 2 * cellPadX));
        const contentH = Math.max(baseFontSize * lineFactor2, lines.length * (baseFontSize * lineFactor2));
        const boxH = Math.max(22, contentH + 2 * cellPadY);
        rowMaxH = Math.max(rowMaxH, boxH);
        return { it, lines, boxH };
      });

      // çiz
      for (let c = 0; c < rowItems.length; c++) {
        const cellX = gridLeftX + c * cellW;
        const cellY = gridY;
        const m = prepared[c];

        doc.setLineWidth(0.8);
        doc.rect(cellX, cellY, cellW, rowMaxH, "S");

        const hAlign = (m.it.hAlign || "left");
        const vAlign = (m.it.vAlign || "middle");
        const alignOpt = hAlign === "center" ? "center" : (hAlign === "right" ? "right" : "left");

        let textX;
        if (hAlign === "center") textX = cellX + cellW / 2;
        else if (hAlign === "right") textX = cellX + cellPadX;
        else textX = cellX + cellPadX;

        const linesH = m.lines.length * (baseFontSize * lineFactor2);
        let textY;
        if (vAlign === "top") textY = cellY + cellPadY + baseFontSize;
        else if (vAlign === "bottom") textY = cellY + rowMaxH - cellPadY - (linesH - baseFontSize);
        else textY = cellY + (rowMaxH - linesH) / 2 + baseFontSize;

        doc.text(m.lines, textX, textY, { align: alignOpt });
      }

      gridY += rowMaxH;
    }

    blockBottomY = gridY;
  }

  return { bottomY: blockBottomY };
}

/* ===================== ANA: Cam Çıktısı ===================== */
export async function generateCamCiktisiPdf(ctx, pdfConfig, brandConfig) {
  const { requirements } = ctx;
  const doc = await createPdfDoc();
  const fontName = (doc.getFontList?.()["Roboto"] ? "Roboto" : "helvetica");

  // 1) Header
  const { bottomY } = await drawSplitHeader(doc, brandConfig, pdfConfig, ctx);
  let cursorY = bottomY;

  // 2) Camlar tablosu (sections DB’de yok; biz çiziyoruz)
  const columns = [
    { header: "Cam İsmi", field: "cam_full_name", align: "center", grow: 1 },
    { header: "Genişlik (mm)", field: "width_mm", align: "center", width: 90, format: "integer" },
    { header: "Yükseklik (mm)", field: "height_mm", align: "center", width: 100, format: "integer" },
    { header: "Adet", field: "count", align: "center", width: 60, format: "integer" },
    { header: "Metrekare (m²)", field: "m2", align: "center", width: 110, format: "number(2)" }
  ];

  // ✨ PDF render'ından hemen önce: sadece pdf.camCiktisi === true olan camları bırak
  const filteredRequirements = {
    ...requirements,
    systems: (requirements?.systems || []).map(sys => ({
      ...sys,
      glasses: (sys?.glasses || []).filter(g => g?.pdf?.camCiktisi === true)
    })),
    // extra_glasses de aynı kurala tabi olsun
    extra_glasses: (requirements?.extra_glasses || []).filter(g => g?.pdf?.camCiktisi === true)
  };

  const rowsRaw = mapGlass(filteredRequirements);

  const rows = rowsRaw.map(r => {
    const w = Number(pick(r, "width_mm")) || 0;
    const h = Number(pick(r, "height_mm")) || 0;
    const c = Number(pick(r, "count")) || 0;

    const m2Float = (w * h * c) / 1e6;

    const camIsim   = String(pick(r, "cam_isim") ?? "");
    const thick     = Number(pick(r, "thickness_mm")) || 0;
    const boya1     = String(pick(r, "color1_name") ?? "");
    const boya2     = String(pick(r, "color2_name") ?? "");
    const idx1      = Number(pick(r, "belirtec_1_value")) || 0;
    const idx2      = Number(pick(r, "belirtec_2_value")) + String(boya1).length || 0;

    let camFull = camIsim;
    if (boya1) camFull = insertAt(camFull, idx1, boya1);
    if (thick === 2 && boya2) camFull = insertAt(camFull, idx2, boya2);

    return { ...r, m2: m2Float, cam_full_name: camFull };
  });

  if (rows.length > 0) {
    const head = [columns.map(c => c.header)];
    const body = rows.map(r => columns.map(
      c => formatCell(pick(r, c.field), c.format)
    ));

    autoTable(doc, {
      startY: cursorY,
      head, body,
      theme: "grid",
      styles: {
        font: fontName,
        fontSize: 9,
        fontStyle: "bold",
        minCellHeight: 22,
        lineWidth: 0.8,
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
      },
      headStyles: {
        font: fontName,
        fontStyle: "bold",
        fontSize: 9,
        fillColor: [120, 160, 210]
      },
      bodyStyles: {
        fontStyle: "bold",
        textColor: [0, 0, 0]
      },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.8,
      columnStyles: buildColumnStyles(columns),
      margin: { left: 39.5, right: 39.5 }
    });

    const at = doc.lastAutoTable;
    const tableBottomY = at?.finalY || cursorY;
    const m2ColIndex = 4;
    const firstHead = at?.table?.head?.[0];
    let m2ColX = null, m2ColW = null;
    if (firstHead?.cells) {
      m2ColX = firstHead.cells[m2ColIndex]?.x;
      m2ColW = firstHead.cells[m2ColIndex]?.width;
    }
    if (m2ColX == null || m2ColW == null) {
      const pageW = doc.internal.pageSize.getWidth();
      m2ColW = 110;
      m2ColX = pageW - 40 - m2ColW;
    }

    const totalM2 = sumField(rows, "m2");
    const label = `Toplam Metrekare: ${formatCell(totalM2, "number(2)")}`;
    const fontSize = 9;
    const lineFactor2 = (typeof doc.getLineHeightFactor === "function") ? doc.getLineHeightFactor() : 1.15;
    const padX = 4, padY = 4;
    const lines = doc.splitTextToSize(label, Math.max(10, m2ColW - 2 * padX));
    const contentH = lines.length * (fontSize * lineFactor2);
    const boxH = Math.max(22, contentH + 2 * padY);

    doc.setLineWidth(0.8);
    doc.rect(m2ColX, tableBottomY, m2ColW, boxH, "S");

    setFontSafe(doc, fontName, "bold");
    doc.setFontSize(fontSize);
    const textX = m2ColX + m2ColW / 2;
    const textY = tableBottomY + padY + fontSize;
    doc.text(lines, textX, textY, { align: "center" });
  }

  // 3) System variant PNG'leri tablo bittikten sonra, üstten aşağı doğru çiz
  const afterTableY = doc.lastAutoTable?.finalY || cursorY;
  await drawSystemVariantPngs(doc, requirements, ctx, afterTableY);

  openPdf(doc);
}
