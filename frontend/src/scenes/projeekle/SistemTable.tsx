// Path: @/scenes/projeekle/SistemTable.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import * as math from 'mathjs';

import {
  editProjeSystemOnApi,
  deleteProjeSystemOnApi
} from '@/redux/actions/actions_projeler';

import { getSystemFullVariantsOfSystemFromApi } from '@/redux/actions/actions_sistemler';

import AppButton from '@/components/ui/AppButton';
import DialogSistemDuzenleOnProject from '@/components/DialogSistemDuzenleOnProject';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';

// —— SistemEkle.jsx ile aynı yardımcılar —— //
const round2 = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
};

const guvenliHesapla = (expr, scope) => {
  try {
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

const SistemTable = ({ systems = [], onRefresh }) => {
  const dispatch = useDispatch();
  const { id } = useParams();

  // ——— Variant detay reducer’ı (düzenle formülleri için gerekli) ———
  const seciliSistemTam =
    useSelector((s) => s.getSystemFullVariantsOfSystemFromApiReducer) || {};

  // ——— Düzenleme diyalogu state’leri ———
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [selectedSys, setSelectedSys] = useState(null);

  // ——— Silme onayı state’leri ———
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ——— Yardımcılar ———
  const fullName = (s) => `${s.system?.name || ''} ${s.name || ''}`.trim();
  const showNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : '—';
  };

  const sorted = [...systems].sort((a, b) =>
    fullName(a).toLowerCase().localeCompare(fullName(b).toLowerCase())
  );

  // Satırdaki mevcut R1/R2’yi diyaloga geçirmek için
  const extractInitialColors = (sys) => {
    const g = Array.isArray(sys?.glasses) && sys.glasses.length > 0 ? sys.glasses[0] : null;
    if (!g) return undefined;
    const id1 = g?.glass_color_obj_1?.id ?? g?.glass_color_id_1 ?? null;
    const id2 = g?.glass_color_obj_2?.id ?? g?.glass_color_id_2 ?? null;
    const name1 = g?.glass_color_obj_1?.name ?? g?.glass_color_1 ?? (id1 ? "Renk 1" : "-");
    const name2 = g?.glass_color_obj_2?.name ?? g?.glass_color_2 ?? (id2 ? "Renk 2" : "-");
    if (id1 || id2) return { id1, name1, id2, name2 };
    return undefined;
  };

  // ——— DÜZENLE: önce gerekli variantı getir, sonra dialogu aç ———
  const handleEdit = async (sys) => {
    setSelectedSys(sys);
    setDialogOpen(true);
    setDialogLoading(true);
    try {
      await dispatch(getSystemFullVariantsOfSystemFromApi(sys.system_variant_id));
    } finally {
      setDialogLoading(false);
    }
  };

  // ——— DÜZENLE KAYDET ———
  const handleDialogSave = async ({ width_mm, height_mm, quantity, glass_color_id_1, glass_color_id_2 }) => {
    if (!selectedSys) return;

    try {
      setSavingEdit(true);

      // Girişleri güvenli hale getir + yuvarla
      const W = Math.round(Number(width_mm) || 0);
      const H = Math.round(Number(height_mm) || 0);
      const Q = Math.round(Number(quantity) || 0);

      const scope = {
        sistem_genislik: W,
        sistem_yukseklik: H,
        sistem_adet: Q,
      };

      // ——— PROFİLLER ———
      const profiles = (seciliSistemTam.profile_templates || []).map((tpl) => {
        const cut_length_mm = Math.round(guvenliHesapla(tpl.formula_cut_length, scope));
        const cut_count     = Math.round(guvenliHesapla(tpl.formula_cut_count,   scope));
        const birimAgirlik  = Number(tpl.profile?.birim_agirlik || 0);
        const toplamKg      = (cut_length_mm / 1000) * cut_count * birimAgirlik;
        const total_weight_kg = round2(toplamKg);

        return {
          profile_id: tpl.profile_id,
          cut_length_mm,
          cut_count,
          total_weight_kg,
          order_index: tpl?.order_index,
          is_painted: tpl?.is_painted ?? false,
          pdf: tpl?.pdf,
        };
      });

      // ——— CAMLAR ———
      const glasses = (seciliSistemTam.glass_templates || []).map((tpl) => {
        const gW = Math.round(guvenliHesapla(tpl.formula_width,  scope));
        const gH = Math.round(guvenliHesapla(tpl.formula_height, scope));
        const gC = Math.round(guvenliHesapla(tpl.formula_count,  scope));
        const area_m2 = round2((gW * gH * gC) / 1_000_000);

        return {
          glass_type_id: tpl.glass_type_id,
          width_mm: gW,
          height_mm: gH,
          count: gC,
          area_m2,
          order_index: tpl?.order_index,
          pdf: tpl?.pdf,
          ...(glass_color_id_1 ? { glass_color_id_1 } : {}),
          ...(glass_color_id_2 ? { glass_color_id_2 } : {}),
        };
      });

      // ——— MALZEMELER ———
      const materials = (seciliSistemTam.material_templates || []).map((tpl) => {
        const rq = guvenliHesapla(tpl.formula_quantity,   scope);
        const rl = guvenliHesapla(tpl.formula_cut_length, scope);

        let count;
        let cut_length_mm;
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
          type: tpl?.type,
          piece_length_mm: tpl?.piece_length_mm,
          unit_price: tpl?.unit_price,
          order_index: tpl?.order_index,
          pdf: tpl?.pdf,
        };
      });

      // ——— REMOTELAR ———
      const remotes = (seciliSistemTam.remote_templates || []).map((tpl) => ({
        remote_id: tpl.remote_id,
        count: 0,
        order_index: tpl?.order_index,
        unit_price: tpl.unit_price,
        pdf: tpl?.pdf,
      }));

      // ——— edited payload ———
      const editedSystem = {
        project_system_id: selectedSys.project_system_id,
        system_variant_id: selectedSys.system_variant_id,
        width_mm: W,
        height_mm: H,
        quantity: Q,
        profiles,
        glasses,
        materials,
        remotes,
      };

      await dispatch(
        editProjeSystemOnApi(id, selectedSys.project_system_id, editedSystem)
      );

      onRefresh?.();
      setDialogOpen(false);
      setSelectedSys(null);
    } finally {
      setSavingEdit(false);
    }
  };

  // ——— SİL: id’yi ata → modal aç ———
  const requestDelete = (sys) => {
    setDeletingId(sys.project_system_id);
    setConfirmOpen(true);
  };

  // ——— SİL ONAY: DELETE ———
  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      setDeleting(true);
      await dispatch(deleteProjeSystemOnApi(id, deletingId));
      onRefresh?.();
      setConfirmOpen(false);
      setDeletingId(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mt-5 border border-border rounded-2xl overflow-hidden">
      {/* ===================================================== */}
      {/* ✅ Desktop/Tablet tablo — ESKİSİ GİBİ (md ve üstü) */}
      {/* ===================================================== */}
      <div className="hidden md:block overflow-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th className="whitespace-nowrap">Sistem İsmi</th>
              <th className="whitespace-nowrap text-right">En (mm)</th>
              <th className="whitespace-nowrap text-right">Boy (mm)</th>
              <th className="whitespace-nowrap text-right">Adet</th>
              <th className="text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length > 0 ? (
              sorted.map((sys, i) => {
                const key = sys.project_system_id ?? sys.system_variant_id ?? sys.id ?? `sys-${i}`;
                const isRowDeleting = deleting && deletingId === sys.project_system_id;
                const isRowSaving =
                  savingEdit && selectedSys?.project_system_id === sys.project_system_id;

                return (
                  <tr key={key} className="hover:bg-muted/40">
                    <td>{fullName(sys)}</td>
                    <td className="text-right">{showNum(sys.width_mm)}</td>
                    <td className="text-right">{showNum(sys.height_mm)}</td>
                    <td className="text-right">{showNum(sys.quantity)}</td>
                    <td className="text-right space-x-2">
                      <AppButton
                        variant="sari"
                        size="sm"
                        shape="none"
                        onClick={() => handleEdit(sys)}
                        title="Sistemi düzenle"
                        disabled={deleting || savingEdit}
                      >
                        {isRowSaving ? 'Kaydediliyor…' : 'Düzenle'}
                      </AppButton>

                      <AppButton
                        variant="kirmizi"
                        size="sm"
                        shape="none"
                        onClick={() => requestDelete(sys)}
                        title="Sistemi sil"
                        disabled={deleting || savingEdit}
                      >
                        {isRowDeleting ? 'Siliniyor…' : 'Sil'}
                      </AppButton>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-6">
                  Sistem bulunamadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===================================================== */}
      {/* ✅ Mobil kart görünümü (md altı) */}
      {/* ===================================================== */}
      <div className="md:hidden p-3 flex flex-col gap-3 overflow-auto">
        {sorted.length > 0 ? (
          sorted.map((sys, i) => {
            const key = sys.project_system_id ?? sys.system_variant_id ?? sys.id ?? `sys-${i}`;
            const isRowDeleting = deleting && deletingId === sys.project_system_id;
            const isRowSaving =
              savingEdit && selectedSys?.project_system_id === sys.project_system_id;

            return (
              <div
                key={key}
                className="bg-background/60 border border-border rounded-xl p-3 shadow-sm flex flex-col gap-3"
              >
                {/* Sistem adı */}
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Sistem İsmi</div>
                  <div className="font-semibold text-sm truncate">{fullName(sys)}</div>
                </div>

                {/* Sayısal bilgiler */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-xs text-muted-foreground">En (mm)</span>
                    <span className="font-medium">
                      {showNum(sys.width_mm)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-xs text-muted-foreground">Boy (mm)</span>
                    <span className="font-medium">
                      {showNum(sys.height_mm)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2 col-span-2">
                    <span className="text-xs text-muted-foreground">Adet</span>
                    <span className="font-medium">
                      {showNum(sys.quantity)}
                    </span>
                  </div>
                </div>

                {/* Butonlar */}
                <div className="flex justify-end gap-2">
                  <AppButton
                    variant="sari"
                    size="sm"
                    shape="none"
                    onClick={() => handleEdit(sys)}
                    title="Sistemi düzenle"
                    disabled={deleting || savingEdit}
                  >
                    {isRowSaving ? 'Kaydediliyor…' : 'Düzenle'}
                  </AppButton>

                  <AppButton
                    variant="kirmizi"
                    size="sm"
                    shape="none"
                    onClick={() => requestDelete(sys)}
                    title="Sistemi sil"
                    disabled={deleting || savingEdit}
                  >
                    {isRowDeleting ? 'Siliniyor…' : 'Sil'}
                  </AppButton>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-muted-foreground py-6 text-sm">
            Sistem bulunamadı
          </div>
        )}
      </div>

      {/* Düzenleme diyaloğu */}
      <DialogSistemDuzenleOnProject
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setSelectedSys(null);
        }}
        title="Sistem Düzenle"
        initial={{
          width_mm: selectedSys?.width_mm,
          height_mm: selectedSys?.height_mm,
          quantity: selectedSys?.quantity
        }}
        initialColors={selectedSys ? extractInitialColors(selectedSys) : undefined}
        loading={dialogLoading}
        saving={savingEdit}
        onSave={handleDialogSave}
      />

      {/* Silme onay diyaloğu */}
      <ConfirmDeleteModal
        open={confirmOpen}
        onOpenChange={(v) => {
          setConfirmOpen(v);
          if (!v) setDeletingId(null);
        }}
        title="Sistemi silmek istediğinize emin misiniz?"
        description="Bu işlem geri alınamaz. İlgili proje sistem kaydı kalıcı olarak silinecek."
        confirmText={deleting ? 'Siliniyor…' : 'Evet, sil'}
        cancelText="Vazgeç"
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
};

export default SistemTable;
