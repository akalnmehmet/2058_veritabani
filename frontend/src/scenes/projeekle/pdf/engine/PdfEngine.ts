// Path: @/scenes/projeekle/pdf/engine/PdfEngine.ts
// import { createPdfDoc, drawSplitHeader, openPdf, autoTable } from '../pdfCommon';
// import dataSources from '../registry/dataSources';
// import defaultTheme from '../themes/defaultTheme';

// const themes = { default: defaultTheme };

// // --- Yardımcılar ---
// function normalizeConfig(input){
//   if (!input) return null;
//   if (Array.isArray(input)) return input[0]?.config_json ?? input[0] ?? null;
//   if (input.config_json)    return input.config_json;
//   return input;
// }
// const pick = (o,p)=>(!o||!p)?'':(p.split('.').reduce((a,k)=>a?a[k]:undefined,o) ?? '');
// function buildColumnStyles(cols=[]){const s={}; cols.forEach((c,i)=>{s[i]={}; if(c.width) s[i].cellWidth=c.width; if(c.align==='right') s[i].halign='right'; if(c.align==='center') s[i].halign='center';}); return s;}
// function formatCell(v,f){ if(f==null) return v??''; const n=Number(v); if(f==='integer') return Number.isFinite(n)?String(Math.round(n)):(v??''); const m=String(f).match(/^number\((\d+)\)$/); if(m){const d=+m[1]||2; return Number.isFinite(n)?n.toFixed(d):(v??'');} return v??''; }
// function sumField(rows,f){ return (rows||[]).reduce((s,r)=>s+(Number(pick(r,f))||0),0); }
// async function resolveData(source, ctx){ const fn=dataSources?.[source]; if(!fn){ console.warn(`[PdfEngine] dataSource yok: ${source}`); return []; } try{ const r=await fn(ctx); return Array.isArray(r)?r:(r?[r]:[]);} catch(e){ console.error('[PdfEngine] dataSource hata:',source,e); return []; } }

// // --- Font seçimi: Roboto yoksa helvetica'ya düş ---
// function selectAvailableFont(doc, preferred='Roboto', style='normal'){
//   try{
//     const list = doc.getFontList?.() || {};
//     const hasPreferred = !!list?.[preferred]?.includes(style) || !!list?.[preferred];
//     if (hasPreferred) return preferred;

//     // jsPDF default yerleşik fontlar: helvetica, times, courier
//     if (list?.helvetica) return 'helvetica';
//     if (list?.times) return 'times';
//     if (list?.courier) return 'courier';
//   }catch(_) {}
//   // Emniyet supabı
//   return 'helvetica';
// }









// export async function renderPdf(configInput, ctx) {
//   const config = normalizeConfig(configInput);
//   if (!config) throw new Error('[PdfEngine] Geçersiz PDF config');

//   const theme = themes[config.theme || 'default'] || defaultTheme;
//   const doc   = await createPdfDoc();

//   // Kullanılacak fontu bir kez belirle
//   const fontName = selectAvailableFont(doc, 'Roboto', 'normal');

//   // >>> Bölünmüş başlık
//   let headerBottomY = 60;
//   if (config.header?.layout === 'splitBrand') {
//     const { bottomY } = await drawSplitHeader(doc, config.header, ctx);
//     headerBottomY = bottomY;
//   } else {
//     // Basit başlık (fallback)
//     if (config.title) {
//       doc.setFont(fontName, 'normal');
//       doc.setFontSize(theme.font?.titleSize || 14);
//       doc.text(String(config.title), 40, headerBottomY);
//       headerBottomY += 10;
//     }
//   }

//   let cursorY = headerBottomY + 8;

//   // SECTIONS
//   const sections = Array.isArray(config.sections) ? config.sections : [];
//   for (const section of sections) {
//     if (!section?.type) continue;

//     if (section.type === 'text') {
//       if (section.marginTop) cursorY += Number(section.marginTop) || 0;
//       doc.setFont(fontName, 'normal');
//       doc.setFontSize(theme.font?.baseSize || 10);
//       doc.text(String(section.content || ''), 40, cursorY);
//       cursorY += 14;
//       continue;
//     }

//     if (section.type === 'table') {
//       // İSTEK: "Camlar" başlığını yazdırma → title bloğu yok
//       if (section.marginTop) cursorY += Number(section.marginTop) || 0;

//       const rows    = await resolveData(section.dataSource, ctx);
//       const columns = Array.isArray(section.columns) ? section.columns : [];
//       const head    = [columns.map(c => c.header ?? '')];
//       const body    = rows.map(row => columns.map(col => formatCell(pick(row, col.field), col.format)));

//       // Tablo marjları (fallback hesapta da kullanacağız)
//       const leftMargin  = 40;
//       const rightMargin = theme.page?.marginRight || 40;

//       // --- HÜCREYE RESİM: JSON'dan opsiyonel ayar
//       // Ör: { columnIndex: 1, imageField: 'profil_image_data_url', type: 'PNG', padding: 2 }
//       const imgCfg = section.cellImages;

//       autoTable(doc, {
//         startY: cursorY,
//         head, body,
//         theme: (section.options?.border === 'grid') ? 'grid' : 'plain',
//         styles: {
//           font: fontName,
//           fontSize: theme.font?.baseSize || 10,
//           minCellHeight: section.rowHeight || 22
//         },
//         headStyles: {
//           font: fontName,
//           fontStyle: 'normal',
//           fontSize: theme.font?.headSize || 11
//         },
//         columnStyles: buildColumnStyles(columns),
//         margin: { left: leftMargin, right: rightMargin },

//         // <<< EKLENDİ: Hücreye resim basma
//         didDrawCell: data => {
//           if (!imgCfg) return;
//           if (data.section !== 'body') return;
//           if (data.column.index !== Number(imgCfg.columnIndex)) return;

//           // Satırın ham objesini al (resolveData'dan dönen rows)
//           const rowObj = rows[data.row.index];
//           const dataUrl = pick(rowObj, imgCfg.imageField); // 'profil_image_data_url' vb.
//           if (!dataUrl) return;

//           // İç boşluk (padding)
//           const pad = Number(imgCfg.padding ?? 2);
//           const x = data.cell.x + pad;
//           const y = data.cell.y + pad;
//           const w = Math.max(0, data.cell.width  - 2 * pad);
//           const h = Math.max(0, data.cell.height - 2 * pad);

//           try {
//             doc.addImage(dataUrl, (imgCfg.type || 'PNG'), x, y, w, h);
//           } catch (_) {
//             // sessiz geç: resim eklenemezse tablo render'ı devam eder
//           }
//         }
//       });

//       // === "Toplam Metrekare" kutusu: tablonun en altında, m2 sütunu kadar ===
//       const at = doc.lastAutoTable;
//       const tableBottomY = at?.finalY || cursorY;

//       // m2 sütununun index'i
//       const m2ColIndex = columns.findIndex(c =>
//         c?.field === 'm2' || /metrekare/i.test(String(c?.header || ''))
//       );

//       // Sürüm farklarına dayanıklı biçimde x/width bul
//       function resolveColRect(fromRow, index, headerText) {
//         if (!fromRow) return {};
//         const cells = fromRow.cells ?? fromRow;
//         if (Array.isArray(cells)) {
//           const c = cells[index];
//           return { x: c?.x, w: c?.width };
//         } else if (cells && typeof cells === 'object') {
//           const values = Object.values(cells);
//           const byText = values.find(v => {
//             const t = String(v?.text ?? v?.content ?? '').toLowerCase();
//             return headerText && t.includes(String(headerText).toLowerCase());
//           });
//           if (byText?.x != null && byText?.width != null) return { x: byText.x, w: byText.width };
//           const sorted = values.filter(v => v?.x != null).sort((a, b) => a.x - b.x);
//           const c = sorted[index];
//           return { x: c?.x, w: c?.width };
//         }
//         return {};
//       }

//       let m2ColX = null, m2ColW = null;

//       if (m2ColIndex >= 0 && at?.table) {
//         // Tercih: başlık
//         const tryHead = resolveColRect(at.table.head?.[0], m2ColIndex, columns[m2ColIndex]?.header);
//         if (tryHead?.x != null && tryHead?.w != null) {
//           m2ColX = tryHead.x; m2ColW = tryHead.w;
//         } else {
//           // Fallback: ilk body satırı
//           const tryBody = resolveColRect(at.table.body?.[0], m2ColIndex, columns[m2ColIndex]?.header);
//           if (tryBody?.x != null && tryBody?.w != null) {
//             m2ColX = tryBody.x; m2ColW = tryBody.w;
//           }
//         }
//       }

//       // ULTRA-FALLBACK: sağdan hizala (m2 genişliği config’te 110; yoksa 110)
//       if (m2ColX == null || m2ColW == null) {
//         const pageW = doc.internal.pageSize.getWidth();
//         const configuredM2Width = Number(columns[m2ColIndex]?.width) || 110;
//         m2ColW = configuredM2Width;
//         m2ColX = pageW - rightMargin - m2ColW;
//       }

//       // totals tanımı
//       const totals = Array.isArray(section.totals) ? section.totals : [];
//       const m2TotalDef =
//         totals.find(t =>
//           (t?.type === 'sum') &&
//           (t?.field === 'm2' || /metrekare/i.test(String(t?.label || '')))
//         ) || { label: 'Toplam Metrekare', field: 'm2', format: 'number(3)' };

//       const rawTotal    = sumField(rows, m2TotalDef.field);
//       const prettyTotal = formatCell(rawTotal, m2TotalDef.format);
//       const boxLabel    = `${m2TotalDef.label}: ${prettyTotal}`;

//       // Kutu yazı ölçüsü (wrap olabilir; ama BOLD OLMAYACAK)
//       const fontSize = theme.font?.baseSize || 10;
//       const lineFactor = (typeof doc.getLineHeightFactor === 'function')
//         ? doc.getLineHeightFactor()
//         : 1.15;
//       const paddingX = 4;
//       const paddingY = 4;
//       const lines = doc.splitTextToSize(boxLabel, Math.max(10, m2ColW - 2 * paddingX));
//       const contentH = lines.length * (fontSize * lineFactor);
//       const boxH = Math.max(section.rowHeight || 22, contentH + 2 * paddingY);

//       // Kutu çizgi rengi = tablonun çizgi rengi
//       const tableLineColor =
//         at?.styles?.lineColor ??
//         at?.settings?.styles?.lineColor ??
//         at?.table?.styles?.lineColor ??
//         [189, 189, 189]; // default gri
//       if (Array.isArray(tableLineColor)) {
//         doc.setDrawColor(tableLineColor[0], tableLineColor[1], tableLineColor[2]);
//       } else if (typeof tableLineColor === 'number') {
//         doc.setDrawColor(tableLineColor);
//       } else {
//         doc.setDrawColor(189, 189, 189);
//       }

//       // Kutu
//       doc.setLineWidth(0.8);
//       doc.rect(m2ColX, tableBottomY, m2ColW, boxH, 'S');

//       // Metin (çok satırlı olabilir; BOLD DEĞİL)
//       doc.setFont(fontName, 'normal');   // <<< özellikle normal
//       doc.setFontSize(fontSize);
//       const textX = m2ColX + (m2ColW / 2);
//       const textY = tableBottomY + paddingY + fontSize; // üstten padding kadar boşluk
//       doc.text(lines, textX, textY, { align: 'center' });

//       // İmleci kutunun altına indir
//       cursorY = tableBottomY + boxH + 14;

//       // Diğer totals (m2 hariç)
//       for (const t of totals) {
//         const isM2 =
//           (t?.type === 'sum') &&
//           (t?.field === 'm2' || /metrekare/i.test(String(t?.label || '')));
//         if (isM2) continue; // m2 zaten kutuda

//         const val = (t.type === 'sum') ? sumField(rows, t.field) : '';
//         doc.setFont(fontName, 'normal');
//         doc.setFontSize(theme.font?.baseSize || 10);
//         doc.text(`${t.label}: ${formatCell(val, t.format)}`, leftMargin, cursorY);
//         cursorY += 14;
//       }
//     }
//   }

//   openPdf(doc);
// }













// export default renderPdf;
