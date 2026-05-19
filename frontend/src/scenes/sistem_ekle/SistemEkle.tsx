// Path: @/scenes/sistem_ekle/SistemEkle.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getSystemFullVariantsOfSystemFromApi } from '@/redux/actions/actions_sistemler';
import { addRequirementsToProjeToApi, getProjeRequirementsFromApi } from '@/redux/actions/actions_projeler';
import { ReactComponent as PencilRuler } from '../../icons/pencil-ruler_v2.svg';
import * as math from 'mathjs';
import SistemEkleTables from './SistemEkleTables';
import AppButton from '@/components/ui/AppButton';
import PagedSelectDialog from '@/scenes/projeekle/PagedSelectDialog';
import { getGlassColorFromApi, getDefaultColorOne, getDefaultColorTwo } from '@/redux/actions/actions_boyalar';

const round2 = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
};

const Spinner = () => (
  <div className="flex justify-center items-center py-10 w-full h-full">
    <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin"></div>
  </div>
);

const EMPTY_PAGE = { items: [], total: 0, page: 1, limit: 5, total_pages: 1, has_next: false, has_prev: false };
const LIMIT = 5;

const SistemEkle = () => {
  const { projectId, variantId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingInit, setIsLoadingInit] = useState(true);

  const [sistemGenislik, setSistemGenislik] = useState(0);
  const [sistemYukseklik, setSistemYukseklik] = useState(0);
  const [sistemAdet, setSistemAdet] = useState(0);

  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [whichColorSelecting, setWhichColorSelecting] = useState(null); // 1 veya 2
  const [renk1Id, setRenk1Id] = useState(null);
  const [renk1Name, setRenk1Name] = useState('-');
  const [renk2Id, setRenk2Id] = useState(null);
  const [renk2Name, setRenk2Name] = useState('-');

  const requirements = useSelector(s => s.getProjeRequirementsFromApiReducer) || { systems: [], extra_requirements: [] };
  const seciliSistemTam = useSelector(s => s.getSystemFullVariantsOfSystemFromApiReducer) || {};

  const colorsPage = useSelector(s => s.getGlassColorsFromApiReducer) || EMPTY_PAGE;
  const fetchPage = React.useCallback(
    (page, q) => dispatch(getGlassColorFromApi(page, q, LIMIT)),
    [dispatch]
  );

  const handleNumberChange = (setter) => (e) => {
    const v = e.target.value;
    setter(v === "" ? 0 : Number(v));
  };
  const handleNumberBlur = (val, setter) => {
    if (val === 0 || val === "" || isNaN(val)) setter(0);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingInit(true);
      try {
        await dispatch(getSystemFullVariantsOfSystemFromApi(variantId));
        await dispatch(getProjeRequirementsFromApi(projectId));
        // Varsayılan renkleri getir
        try {
          const d1 = await dispatch(getDefaultColorOne());
          if (d1?.id) {
            setRenk1Id(d1.id);
            setRenk1Name(d1.name ?? 'Renk 1');
          }
        } catch {}
        try {
          const d2 = await dispatch(getDefaultColorTwo());
          if (d2?.id) {
            setRenk2Id(d2.id);
            setRenk2Name(d2.name ?? 'Renk 2');
          }
        } catch {}
      } finally {
        setIsLoadingInit(false);
      }
    };
    fetchData();
  }, [dispatch, variantId, projectId]);

  const guvenliHesapla = (expr) => {
    try {
      const scope = {
        sistem_genislik: Number(sistemGenislik) || 0,
        sistem_yukseklik: Number(sistemYukseklik) || 0,
        sistem_adet: Number(sistemAdet) || 0,
      };
      const value = math.evaluate(expr, scope);
      const n = Number(value);
      return Number.isFinite(n) && n >= 0 ? n : 0;
    } catch {
      return 0;
    }
  };

  function applyChunkByLength(tpl, rl) {
    const pieceLen = Math.max(1, Math.round(tpl?.piece_length_mm || 100));
    const L = Math.max(0, Math.round(rl || 0));
    const count = L === 0 ? 0 : Math.ceil(L / pieceLen);
    return { count, cut_length_mm: pieceLen };
  }

  const canSave =
    Number.isFinite(sistemGenislik) && sistemGenislik > 0 &&
    Number.isFinite(sistemYukseklik) && sistemYukseklik > 0 &&
    Number.isFinite(sistemAdet) && sistemAdet > 0;

  const handleSistemKaydet = async () => {
    if (!canSave) return;

    const sys = {
      system_variant_id: variantId,
      color: seciliSistemTam.color_options?.[0] ?? '',
      width_mm: Math.round(sistemGenislik),
      height_mm: Math.round(sistemYukseklik),
      quantity: Math.round(sistemAdet),
      profiles: (seciliSistemTam.profile_templates || []).map((tpl, index) => {
        const cut_length_mm = Math.round(guvenliHesapla(tpl.formula_cut_length));
        const cut_count = Math.round(guvenliHesapla(tpl.formula_cut_count));
        const birimAgirlik = Number(tpl.profile?.birim_agirlik || 0);
        const toplamKg = (cut_length_mm / 1000) * cut_count * birimAgirlik;
        const total_weight_kg = round2(toplamKg);
        return {
          profile_id: tpl.profile_id,
          cut_length_mm,
          cut_count,
          total_weight_kg,
          order_index: index + 1,
          pdf: tpl.pdf
        };
      }),
      glasses: (seciliSistemTam.glass_templates || []).map((tpl, index) => {
        const width_mm = Math.round(guvenliHesapla(tpl.formula_width));
        const height_mm = Math.round(guvenliHesapla(tpl.formula_height));
        const count = Math.round(guvenliHesapla(tpl.formula_count));
        const area_m2 = round2((width_mm * height_mm * count) / 1_000_000);
        return {
          glass_type_id: tpl.glass_type_id,
          width_mm,
          height_mm,
          count,
          area_m2,
          order_index: index + 1,
          pdf: tpl.pdf,
          ...(renk1Id ? { glass_color_id_1: renk1Id } : {}),
          ...(renk2Id ? { glass_color_id_2: renk2Id } : {}),
        };
      }),
      materials: (seciliSistemTam.material_templates || []).map((tpl, i) => {
        const rq = guvenliHesapla(tpl.formula_quantity);
        const rl = guvenliHesapla(tpl.formula_cut_length);
        let count, cut_length_mm;
        if (tpl?.type === 'chunk_by_length') {
          ({ count, cut_length_mm } = applyChunkByLength(tpl, rl));
        } else {
          count = Math.round(rq);
          cut_length_mm = Math.round(rl);
        }
        return {
          material_id: tpl.material_id,
          count,
          cut_length_mm,
          order_index: i + 1,
          pdf: tpl.pdf
        };
      }),
      remotes: (seciliSistemTam.remote_templates || []).map((tpl, index) => ({
        remote_id: tpl.remote_id,
        count: 0,
        unit_price: tpl.unit_price,
        order_index: index + 1,
        pdf: tpl.pdf
      })),
    };

    const payload = { systems: [sys] };

    setIsRefreshing(true);
    try {
      await dispatch(addRequirementsToProjeToApi(projectId, payload));
      await dispatch(getProjeRequirementsFromApi(projectId));
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshRequirements = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(getProjeRequirementsFromApi(projectId));
    } finally {
      setIsRefreshing(false);
    }
  };

  const displayName = useMemo(() => {
    const parts = [seciliSistemTam?.system?.name, seciliSistemTam?.name].filter(Boolean);
    return parts.join(' ');
  }, [seciliSistemTam?.system?.name, seciliSistemTam?.name]);

  return (
    <div className="min-h-screen bg-background text-foreground rounded-2xl border border-border p-4 sm:p-5 flex flex-col">
      {isLoadingInit ? (
        <Spinner />
      ) : (
        // ✅ ÜST PANEL: mobilde alt alta, md+ satır
        <div className="bg-card border border-border rounded-2xl w-full p-4 flex flex-col md:flex-row gap-4 mb-5 md:items-center">
          <div className="flex items-start gap-3">
            <PencilRuler className="w-9 shrink-0" />
            <div className="flex flex-col gap-2">
              <div className="text-lg font-semibold">
                {displayName || "Sistem Adı - Varyant Adı"}
              </div>
            </div>
          </div>

          {/* ✅ INPUTLAR + RENK: mobilde kolon, sm+ satır */}
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                step="1"
                value={sistemGenislik === 0 ? "" : sistemGenislik}
                onChange={handleNumberChange(setSistemGenislik)}
                onBlur={() => handleNumberBlur(sistemGenislik, setSistemGenislik)}
                placeholder="En (mm)"
                className="input input-bordered w-full sm:max-w-xs"
              />
              <input
                type="number"
                inputMode="numeric"
                min={1}
                step="1"
                value={sistemYukseklik === 0 ? "" : sistemYukseklik}
                onChange={handleNumberChange(setSistemYukseklik)}
                onBlur={() => handleNumberBlur(sistemYukseklik, setSistemYukseklik)}
                placeholder="Boy (mm)"
                className="input input-bordered w-full sm:max-w-xs"
              />
              <input
                type="number"
                inputMode="numeric"
                min={1}
                step="1"
                value={sistemAdet === 0 ? "" : sistemAdet}
                onChange={handleNumberChange(setSistemAdet)}
                onBlur={() => handleNumberBlur(sistemAdet, setSistemAdet)}
                placeholder="Adet"
                className="input input-bordered w-full sm:max-w-xs"
              />
            </div>

            {/* ✅ RENK SEÇİM: wrap ile taşma yok */}
            <div className="flex flex-wrap items-center gap-2">
              <AppButton
                variant="kurumsalmavi"
                size="sm"
                onClick={() => { setWhichColorSelecting(1); setColorDialogOpen(true); }}
                title="Renk 1 seç"
              >
                Renk 1
              </AppButton>
              <span className="text-xs text-muted-foreground">({renk1Name})</span>

              <AppButton
                variant="kurumsalmavi"
                size="sm"
                onClick={() => { setWhichColorSelecting(2); setColorDialogOpen(true); }}
                title="Renk 2 seç"
              >
                Renk 2
              </AppButton>
              <span className="text-xs text-muted-foreground">({renk2Name})</span>
            </div>
          </div>

          {/* ✅ SAĞ BUTONLAR: mobilde full, sm+ sabit */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full sm:w-auto md:ml-auto">
            <AppButton
              variant="kurumsalmavi"
              className="w-full sm:w-40"
              onClick={() => navigate(`/projeduzenle/${projectId}`)}
            >
              Projeye Dön
            </AppButton>

            <AppButton
              variant="kurumsalmavi"
              className="w-full sm:w-40"
              onClick={() => navigate(`/sistemsec/${projectId}`)}
            >
              Sistem Seç
            </AppButton>

            <AppButton
              variant="kurumsalmavi"
              className="w-full sm:w-40"
              onClick={handleSistemKaydet}
              disabled={!canSave || isRefreshing}
            >
              {isRefreshing ? "Ekleniyor..." : "Sistem Ekle"}
            </AppButton>
          </div>
        </div>
      )}

      {isRefreshing ? (
        <Spinner />
      ) : (
        <SistemEkleTables onRefresh={refreshRequirements} systems={requirements.systems} />
      )}

      {/* Cam rengi seçim modali */}
      <PagedSelectDialog
        title="Cam Rengi Seç"
        open={colorDialogOpen}
        onOpenChange={setColorDialogOpen}
        data={Array.isArray(colorsPage) ? { ...EMPTY_PAGE, items: colorsPage } : colorsPage}
        fetchPage={fetchPage}
        columns={[{ key: 'name', label: 'Renk Adı' }]}
        searchPlaceholder="Renk adına göre ara…"
        onSelect={(row) => {
          if (!row?.id) return;
          if (whichColorSelecting === 1) {
            setRenk1Id(row.id);
            setRenk1Name(row.name ?? 'Renk 1');
          } else if (whichColorSelecting === 2) {
            setRenk2Id(row.id);
            setRenk2Name(row.name ?? 'Renk 2');
          }
          setColorDialogOpen(false);
          setWhichColorSelecting(null);
        }}
      />
    </div>
  );
};

export default SistemEkle;
