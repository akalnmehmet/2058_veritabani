// Path: @/scenes/projeekle/pdf/mappers/glass.mapper.ts
// requirements -> cam satırları (gruplanmış) üretir
export function mapGlass(requirements) {
  const map = new Map();
  // key: `${glass_type_id}|${width}|${height}|${colorKey1}|${colorKey2}`

  const add = (g) => {
    const width  = Number(g.width_mm || 0);
    const height = Number(g.height_mm || 0);
    const count  = Number(g.count || 0);

    // ====== İSİM & TİP ======
    const cam_isim = g.glass_type?.cam_isim || g.glass_type_name || "-";
    const glass_type_id =
      g.glass_type_id || g.glass_type?.id || cam_isim;
    const thickness_mm = Number(
      g.glass_type?.thickness_mm ?? g.thickness_mm ?? 0
    );

    // ====== RENK OKUMA (1 ve 2 için güvenli) ======
    // 1. renk
    const color1_id =
      g.glass_color_id_1 ??
      g.glass_color_obj_1?.id ??
      g.glass_color_1?.id ??
      g.glass_color_id ??                 // eski tek-reneğe geri uyumluluk
      g.glass_color?.id ?? null;

    const color1_name =
      g.glass_color_obj_1?.name ??
      "";

    // 2. renk
    const color2_id =
      g.glass_color_id_2 ??
      g.glass_color_obj_2?.id ??
      g.glass_color_2?.id ?? null;

    const color2_name =
      g.glass_color_obj_2?.name ??
      "";
    
    const belirtec_1_value =
    g.belirtec_1_value??0;

    const belirtec_2_value=
    g.belirtec_2_value??0;

    // ====== m2 (ham) — mevcut mantık korunur ======
    const area_m2 = g.area_m2 != null
      ? Number(g.area_m2)
      : (width / 1000) * (height / 1000) * count;

    // ====== GRUPLAMA ANAHTARI ======
    // Not: kalınlık dolaylı olarak glass_type_id ile sabit kalır; yine de
    // renk çiftleri farklıysa satırlar birleşmesin diye ikisini de anahtara ekliyoruz.
    const key = [
      glass_type_id,
      width,
      height,
      (color1_id ?? "null"),
      (color2_id ?? "-") // tek camda color2 olmayabilir
    ].join("|");

    if (!map.has(key)) {
      map.set(key, {
        cam_isim,
        width_mm: width,
        height_mm: height,
        count: 0,
        m2: 0,
        // PDF tarafında kullanılacak ek alanlar:
        thickness_mm,
        color1_name: (color1_name || "").trim(),
        color2_name: (color2_name || "").trim(),
        belirtec_1_value:belirtec_1_value,
        belirtec_2_value:belirtec_2_value
      });
    }

    const row = map.get(key);
    row.count += count;
    row.m2    += area_m2;
  };

  // systems > glasses
  (requirements?.systems || []).forEach(sys => (sys.glasses || []).forEach(add));

  // extra_glasses (varsa)
  (requirements?.extra_glasses || []).forEach(add);

  // diziye çevir (m2 ham değer kalsın)
  return Array.from(map.values());
}
