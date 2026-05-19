// Path: @/scenes/sistemler/SistemVaryantDuzenle.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getSystemFullVariantsOfSystemFromApi,
  editSystemVariantTemplatesOnApi,
  getSistemlerFromApi,
  changeSystemOfSystemVariant,
} from '@/redux/actions/actions_sistemler';
import DialogPdfAyar from "./DialogPdfAyar";
import Header from '@/components/mycomponents/Header';

import DialogProfilSec from "./DialogProfilSec";
import DialogCamSec from "./DialogCamSec";
import DialogMalzemeSec from "./DialogMalzemeSec";
import DialogKumandaSec from "./DialogKumandaSec";
import DialogSystemVariantFoto from "./DialogSystemVariantFoto";
// ✅ YENİ: Pdf Fotoğraf dialogu
import DialogSystemVariantPdfFoto from "./DialogSystemVariantPdfFoto";

import AppButton from "@/components/ui/AppButton";

const SistemVaryantDuzenle = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { variantId } = useParams();

  const seciliVaryant = useSelector(s => s.getSystemFullVariantsOfSystemFromApiReducer) || {};
  const [openVariantPhotoDlg, setOpenVariantPhotoDlg] = useState(false);
  // ✅ YENİ: Pdf fotoğraf dialog state
  const [openVariantPdfPhotoDlg, setOpenVariantPdfPhotoDlg] = useState(false);

  const [openPdfDlg, setOpenPdfDlg] = useState(false);
  const [pdfTarget, setPdfTarget] = useState({ type: null, rowKey: null });
  const [pdfDraft, setPdfDraft] = useState(null);

  const [selectedSystem, setSelectedSystem] = useState('');
  const [systems, setSystems] = useState([]);
  const [systemsLoading, setSystemsLoading] = useState(false);

  const [variantName, setVariantName] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [glasses, setGlasses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [remotes, setRemotes] = useState([]);

  const [openProfileDlg, setOpenProfileDlg] = useState(false);
  const [editingProfileRowKey, setEditingProfileRowKey] = useState(null);

  const [openCamDlg, setOpenCamDlg] = useState(false);
  const [editingCamRowKey, setEditingCamRowKey] = useState(null);

  const [openMatDlg, setOpenMatDlg] = useState(false);
  const [editingMatRowKey, setEditingMatRowKey] = useState(null);

  const [openRemoteDlg, setOpenRemoteDlg] = useState(false);
  const [editingRemoteRowKey, setEditingRemoteRowKey] = useState(null);

  const createRowKey = () =>
    (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  useEffect(() => {
    dispatch(getSystemFullVariantsOfSystemFromApi(variantId));
  }, [dispatch, variantId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setSystemsLoading(true);
        const data = await dispatch(getSistemlerFromApi(1, "", "all"));
        if (!mounted) return;
        setSystems(Array.isArray(data?.items) ? data.items : []);
      } catch (err) {
        console.error("Sistemler yüklenemedi:", err);
        setSystems([]);
      } finally {
        if (mounted) setSystemsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [dispatch]);

  useEffect(() => {
    if (seciliVaryant?.id === variantId) {
      setSelectedSystem(seciliVaryant.system?.id ?? '');
      setVariantName(seciliVaryant.name || '');

      const sortedProfileTemplates = [...(seciliVaryant.profile_templates || [])]
        .sort((a, b) => a.order_index - b.order_index);
      setProfiles(sortedProfileTemplates.map(t => ({
        id: t.profile_id,
        rowKey: createRowKey(),
        profile_id: t.profile_id,
        profil_kodu: t.profile?.profil_kodu,
        profil_isim: t.profile?.profil_isim,
        formula_cut_length: t.formula_cut_length || '',
        formula_cut_count: t.formula_cut_count || '',
        is_painted: t.is_painted ?? false,
        pdf: {
          optimizasyonDetayliCiktisi: t.pdf?.optimizasyonDetayliCiktisi ?? true,
          optimizasyonDetaysizCiktisi: t.pdf?.optimizasyonDetaysizCiktisi ?? true,
          siparisCiktisi: t.pdf?.siparisCiktisi ?? true,
          boyaCiktisi: t.pdf?.boyaCiktisi ?? true,
          profilAksesuarCiktisi: t.pdf?.profilAksesuarCiktisi ?? true,
          camCiktisi: true,
        }
      })));

      const sortedGlassTemplates = [...(seciliVaryant.glass_templates || [])]
        .sort((a, b) => a.order_index - b.order_index);
      setGlasses(sortedGlassTemplates.map(t => ({
        id: t.glass_type_id,
        rowKey: createRowKey(),
        glass_type_id: t.glass_type_id,
        cam_isim: t.glass_type?.cam_isim,
        formula_width: t.formula_width || '',
        formula_height: t.formula_height || '',
        formula_count: t.formula_count || '',
        pdf: {
          optimizasyonDetayliCiktisi: t.pdf?.optimizasyonDetayliCiktisi ?? true,
          optimizasyonDetaysizCiktisi: t.pdf?.optimizasyonDetaysizCiktisi ?? true,
          siparisCiktisi: t.pdf?.siparisCiktisi ?? true,
          boyaCiktisi: t.pdf?.boyaCiktisi ?? true,
          profilAksesuarCiktisi: t.pdf?.profilAksesuarCiktisi ?? true,
          camCiktisi: t.pdf?.camCiktisi ?? true,
        }
      })));

      const sortedMaterialTemplates = [...(seciliVaryant.material_templates || [])]
        .sort((a, b) => a.order_index - b.order_index);
      setMaterials(sortedMaterialTemplates.map(t => {
        const isChunk = t.type === 'chunk_by_length';
        return {
          id: t.material_id,
          rowKey: createRowKey(),
          material_id: t.material_id,
          diger_malzeme_isim: t.material?.diger_malzeme_isim,
          formula_quantity: t.formula_quantity || '',
          formula_cut_length: t.formula_cut_length || '',
          chunk_enabled: isChunk,
          piece_length_mm: isChunk ? (t.piece_length_mm ?? '') : '',
          pdf: {
            optimizasyonDetayliCiktisi: t.pdf?.optimizasyonDetayliCiktisi ?? true,
            optimizasyonDetaysizCiktisi: t.pdf?.optimizasyonDetaysizCiktisi ?? true,
            siparisCiktisi: t.pdf?.siparisCiktisi ?? true,
            boyaCiktisi: t.pdf?.boyaCiktisi ?? true,
            profilAksesuarCiktisi: t.pdf?.profilAksesuarCiktisi ?? true,
            camCiktisi: t.pdf?.camCiktisi ?? true,
          }
        };
      }));

      const sortedRemoteTemplates = [...(seciliVaryant.remote_templates || [])]
        .sort((a, b) => a.order_index - b.order_index);
      setRemotes(sortedRemoteTemplates.map(t => ({
        id: t.remote_id,
        rowKey: createRowKey(),
        remote_id: t.remote_id,
        kumanda_isim: t.remote?.kumanda_isim || '',
        pdf: {
          optimizasyonDetayliCiktisi: t.pdf?.optimizasyonDetayliCiktisi ?? true,
          optimizasyonDetaysizCiktisi: t.pdf?.optimizasyonDetaysizCiktisi ?? true,
          siparisCiktisi: t.pdf?.siparisCiktisi ?? true,
          boyaCiktisi: t.pdf?.boyaCiktisi ?? true,
          profilAksesuarCiktisi: t.pdf?.profilAksesuarCiktisi ?? true,
          camCiktisi: t.pdf?.camCiktisi ?? true,
        }
      })));
    }
  }, [seciliVaryant, variantId]);

  const handleSystemChange = async (e) => {
    const newSystemId = e.target.value;
    if (!newSystemId || newSystemId === selectedSystem) return;

    try {
      await dispatch(changeSystemOfSystemVariant(variantId, newSystemId));
      setSelectedSystem(newSystemId);
      await dispatch(getSystemFullVariantsOfSystemFromApi(variantId));
    } catch (err) {
      console.error("Sistem değiştirilemedi:", err);
    }
  };

  const addProfileRow = () => setProfiles(ps => [...ps, {
    id: '',
    rowKey: createRowKey(),
    profile_id: '', profil_kodu: '', profil_isim: '',
    formula_cut_length: '', formula_cut_count: '', is_painted: false,
    pdf: {
      optimizasyonDetayliCiktisi: true,
      optimizasyonDetaysizCiktisi: true,
      siparisCiktisi: true,
      boyaCiktisi: true,
      profilAksesuarCiktisi: true,
      camCiktisi: true,
    }
  }]);
  const removeProfileRow = rowKey => setProfiles(ps => ps.filter(r => r.rowKey !== rowKey));

  const addGlassRow = () => setGlasses(gs => [...gs, {
    id: '',
    rowKey: createRowKey(),
    glass_type_id: '', cam_isim: '',
    formula_width: '', formula_height: '', formula_count: '',
    pdf: {
      optimizasyonDetayliCiktisi: true,
      optimizasyonDetaysizCiktisi: true,
      siparisCiktisi: true,
      boyaCiktisi: true,
      profilAksesuarCiktisi: true,
      camCiktisi: true,
    }
  }]);
  const removeGlassRow = rowKey => setGlasses(gs => gs.filter(r => r.rowKey !== rowKey));

  const addMaterialRow = () => setMaterials(ms => [...ms, {
    id: Date.now(),
    rowKey: createRowKey(),
    material_id: '',
    diger_malzeme_isim: '',
    formula_quantity: '',
    formula_cut_length: '',
    chunk_enabled: false,
    piece_length_mm: '',
    pdf: {
      optimizasyonDetayliCiktisi: true,
      optimizasyonDetaysizCiktisi: true,
      siparisCiktisi: true,
      boyaCiktisi: true,
      profilAksesuarCiktisi: true,
      camCiktisi: true,
    }
  }]);
  const removeMaterialRow = rowKey => setMaterials(ms => ms.filter(r => r.rowKey !== rowKey));

  const addRemoteRow = () => setRemotes(rs => [...rs, {
    id: Date.now(), remote_id: '', rowKey: createRowKey(), kumanda_isim: '',
    pdf: {
      optimizasyonDetayliCiktisi: true,
      optimizasyonDetaysizCiktisi: true,
      siparisCiktisi: true,
      boyaCiktisi: true,
      profilAksesuarCiktisi: true,
      camCiktisi: true,
    }
  }]);
  const removeRemoteRow = rowKey => setRemotes(rs => rs.filter(r => r.rowKey !== rowKey));

  const moveItem = (arr, setArr, rowKey, dir) => {
    setArr(old => {
      const idx = old.findIndex(r => r.rowKey === rowKey);
      if (idx < 0) return old;
      const swapWith = dir === 'up' ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= old.length) return old;
      const copy = [...old];
      [copy[idx], copy[swapWith]] = [copy[swapWith], copy[idx]];
      return copy;
    });
  };
  const moveProfileUp = rowKey => moveItem(profiles, setProfiles, rowKey, 'up');
  const moveProfileDown = rowKey => moveItem(profiles, setProfiles, rowKey, 'down');
  const moveCamUp = rowKey => moveItem(glasses, setGlasses, rowKey, 'up');
  const moveCamDown = rowKey => moveItem(glasses, setGlasses, rowKey, 'down');
  const moveMatUp = rowKey => moveItem(materials, setMaterials, rowKey, 'up');
  const moveMatDown = rowKey => moveItem(materials, setMaterials, rowKey, 'down');
  const moveRemoteUp = rowKey => moveItem(remotes, setRemotes, rowKey, 'up');
  const moveRemoteDown = rowKey => moveItem(remotes, setRemotes, rowKey, 'down');

  const openProfileDialog = (rowKey) => { setEditingProfileRowKey(rowKey); setOpenProfileDlg(true); };
  const openCamDialog = (rowKey) => { setEditingCamRowKey(rowKey); setOpenCamDlg(true); };
  const openMatDialog = (rowKey) => { setEditingMatRowKey(rowKey); setOpenMatDlg(true); };
  const openRemoteDialog = (rowKey) => { setEditingRemoteRowKey(rowKey); setOpenRemoteDlg(true); };

  const handleSave = () => {
    const payload = {
      name: variantName,
      profile_templates: profiles.map((r, idx) => ({
        profile_id: r.profile_id,
        formula_cut_length: r.formula_cut_length,
        formula_cut_count: r.formula_cut_count,
        order_index: idx,
        is_painted: r.is_painted,
        pdf: { ...r.pdf, camCiktisi: true },
      })),
      glass_templates: glasses.map((r, idx) => ({
        glass_type_id: r.glass_type_id,
        formula_width: r.formula_width,
        formula_height: r.formula_height,
        formula_count: r.formula_count,
        order_index: idx,
        pdf: r.pdf,
      })),
      material_templates: materials.map((r, idx) => ({
        material_id: r.material_id,
        formula_quantity: r.chunk_enabled ? '0' : r.formula_quantity,
        formula_cut_length: r.formula_cut_length,
        type: r.chunk_enabled ? 'chunk_by_length' : 'none',
        piece_length_mm: r.chunk_enabled ? (Number(r.piece_length_mm) || 0) : 0,
        order_index: idx,
        pdf: r.pdf,
      })),
      remote_templates: remotes.map((r, idx) => ({
        remote_id: r.remote_id,
        order_index: idx,
        pdf: r.pdf,
      }))
    };

    dispatch(editSystemVariantTemplatesOnApi(variantId, payload))
      .then(() => navigate('/sistemler'))
      .catch(err => console.error('Düzenlerken hata:', err));
  };

  return (
    <div className="grid grid-rows-[60px_1fr] min-h-screen bg-background text-foreground">
      <Header title="Sistem Varyant Düzenle" />

      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-8">

        {/* ===== ÜST BAR (grid toolbar) ===== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="flex items-center gap-2 md:col-span-4">
            <label className="font-semibold whitespace-nowrap">Sistem:</label>
            <select
              className="select select-bordered w-full"
              value={selectedSystem}
              onChange={handleSystemChange}
              disabled={systemsLoading || systems.length === 0}
            >
              <option value="" disabled>
                {systemsLoading ? 'Yükleniyor...' : 'Sistem seçin'}
              </option>
              {systems.map(sys => (
                <option key={sys.id} value={sys.id}>
                  {sys.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 md:col-span-4">
            <label className="font-semibold whitespace-nowrap">Varyant İsmi:</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={variantName}
              onChange={e => setVariantName(e.target.value)}
            />
          </div>

          {/* ✅ Fotoğraf + Pdf Fotoğraf yan yana */}
          <div className="md:col-span-2 flex">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <AppButton
                variant="gri"
                shape="md"
                className="w-full md:w-auto shadow-sm"
                onClick={() => setOpenVariantPhotoDlg(true)}
              >
                Fotoğraf
              </AppButton>

              <AppButton
                variant="gri"
                shape="md"
                className="w-full md:w-auto shadow-sm"
                onClick={() => setOpenVariantPdfPhotoDlg(true)}
              >
                Pdf Fotoğraf
              </AppButton>
            </div>
          </div>

          <div className="md:col-span-2 flex md:justify-end">
            <AppButton
              variant="kurumsalmavi"
              shape="md"
              className="w-full md:w-auto shadow-sm"
              onClick={handleSave}
              disabled={!variantName}
            >
              Kaydet
            </AppButton>
          </div>
        </div>

        {/* Profiller */}
        <Section
          title="Profiller"
          addButtonLabel="Profil Ekle"
          columns={['Profil Kodu', 'Profil Adı', 'Kesim Ölçüsü', 'Kesim Adedi', 'Boyanacak mı?', 'İşlemler']}
          rows={profiles}
          addRow={addProfileRow}
          renderRow={row => [
            row.profil_kodu || '-',
            row.profil_isim || '-',
            <input
              key="cutlen"
              type="text"
              value={row.formula_cut_length}
              onChange={e => setProfiles(ps => ps.map(r =>
                r.rowKey === row.rowKey ? { ...r, formula_cut_length: e.target.value } : r
              ))}
              className="input input-xs input-bordered w-50"
            />,
            <input
              key="cutcount"
              type="text"
              value={row.formula_cut_count}
              onChange={e => setProfiles(ps => ps.map(r =>
                r.rowKey === row.rowKey ? { ...r, formula_cut_count: e.target.value } : r
              ))}
              className="input input-xs input-bordered w-50"
            />,
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Evet/Hayır</span>
              <input
                type="checkbox"
                checked={row.is_painted}
                onChange={e => setProfiles(ps => ps.map(r =>
                  r.rowKey === row.rowKey ? { ...r, is_painted: e.target.checked } : r
                ))}
                className="checkbox checkbox-sm"
              />
            </div>,
            <div key="actions" className="flex justify-center flex-wrap gap-2">
              <AppButton
                size="xs"
                variant="kurumsalmavi"
                shape="md"
                onClick={() => {
                  setPdfTarget({ type: 'profile', rowKey: row.rowKey });
                  setPdfDraft(row.pdf);
                  setOpenPdfDlg(true);
                }}
              >
                PDF
              </AppButton>
              <AppButton size="xs" variant="gri" shape="md" onClick={() => moveProfileUp(row.rowKey)} title="Yukarı taşı">▲</AppButton>
              <AppButton size="xs" variant="gri" shape="md" onClick={() => moveProfileDown(row.rowKey)} title="Aşağı taşı">▼</AppButton>
              <AppButton size="xs" variant="gri" shape="md" onClick={() => openProfileDialog(row.rowKey)}>Seç</AppButton>
              <AppButton size="xs" variant="kirmizi" shape="md" onClick={() => removeProfileRow(row.rowKey)}>Kaldır</AppButton>
            </div>
          ]}
        />

        {/* Camlar */}
        <Section
          title="Camlar"
          addButtonLabel="Cam Ekle"
          columns={['Cam İsmi', 'Genişlik Formülü', 'Yükseklik Formülü', 'Adet Formülü', 'İşlemler']}
          rows={glasses}
          addRow={addGlassRow}
          renderRow={row => [
            row.cam_isim || '-',
            <input
              key="w"
              type="text"
              value={row.formula_width}
              onChange={e => setGlasses(gs => gs.map(r =>
                r.rowKey === row.rowKey ? { ...r, formula_width: e.target.value } : r
              ))}
              className="input input-xs input-bordered w-50"
            />,
            <input
              key="h"
              type="text"
              value={row.formula_height}
              onChange={e => setGlasses(gs => gs.map(r =>
                r.rowKey === row.rowKey ? { ...r, formula_height: e.target.value } : r
              ))}
              className="input input-xs input-bordered w-50"
            />,
            <input
              key="c"
              type="text"
              value={row.formula_count}
              onChange={e => setGlasses(gs => gs.map(r =>
                r.rowKey === row.rowKey ? { ...r, formula_count: e.target.value } : r
              ))}
              className="input input-xs input-bordered w-50"
            />,
            <div key="actions" className="flex justify-center flex-wrap gap-2">
              <AppButton
                size="xs"
                variant="kurumsalmavi"
                shape="md"
                onClick={() => {
                  setPdfTarget({ type: 'glass', rowKey: row.rowKey });
                  setPdfDraft(row.pdf);
                  setOpenPdfDlg(true);
                }}
              >
                PDF
              </AppButton>
              <AppButton size="xs" variant="gri" shape="md" onClick={() => moveCamUp(row.rowKey)} title="Yukarı taşı">▲</AppButton>
              <AppButton size="xs" variant="gri" shape="md" onClick={() => moveCamDown(row.rowKey)} title="Aşağı taşı">▼</AppButton>
              <AppButton size="xs" variant="gri" shape="md" onClick={() => openCamDialog(row.rowKey)}>Seç</AppButton>
              <AppButton size="xs" variant="kirmizi" shape="md" onClick={() => removeGlassRow(row.rowKey)}>Kaldır</AppButton>
            </div>
          ]}
        />

        {/* Diğer Malzemeler */}
        <Section
          title="Diğer Malzemeler"
          addButtonLabel="Diğer Malzeme Ekle"
          columns={['Malzeme İsmi', 'Adet Formülü', 'Kesim Ölçüsü Formülü', 'Sayıya Tamamla', 'İşlemler']}
          rows={materials}
          addRow={addMaterialRow}
          renderRow={row => [
            row.diger_malzeme_isim || '-',

            row.chunk_enabled ? (
              <div key="q" className="text-xs italic text-muted-foreground">
                Sayıya Tamamla aktif → Kesim adedi payload’da 0 gider
              </div>
            ) : (
              <input
                key="q"
                type="text"
                value={row.formula_quantity}
                onChange={e => setMaterials(ms => ms.map(r =>
                  r.rowKey === row.rowKey ? { ...r, formula_quantity: e.target.value } : r
                ))}
                className="input input-xs input-bordered w-50"
              />
            ),

            <input
              key="l"
              type="text"
              value={row.formula_cut_length}
              onChange={e => setMaterials(ms => ms.map(r =>
                r.rowKey === row.rowKey ? { ...r, formula_cut_length: e.target.value } : r
              ))}
              className="input input-xs input-bordered w-50"
            />,

            <input
              key="piece"
              type="number"
              min={0}
              step={1}
              placeholder="mm"
              value={row.piece_length_mm}
              onChange={e => {
                const val = e.target.value;
                setMaterials(ms => ms.map(r =>
                  r.rowKey === row.rowKey ? { ...r, piece_length_mm: val } : r
                ));
              }}
              disabled={!row.chunk_enabled}
              className="input input-xs input-bordered w-50"
              title={row.chunk_enabled ? 'Parça uzunluğu (mm)' : 'Önce Sayıya Tamamla’yı açın'}
            />,

            <div key="actions" className="flex justify-center flex-wrap gap-2">
              <AppButton
                size="xs"
                variant={row.chunk_enabled ? 'kurumsalmavi' : 'gri'}
                shape="md"
                onClick={() => setMaterials(ms => ms.map(r =>
                  r.rowKey === row.rowKey
                    ? { ...r, chunk_enabled: !r.chunk_enabled }
                    : r
                ))}
                title="Sayıya Tamamla"
              >
                {row.chunk_enabled ? '✅' : '☐'}&nbsp;Sayıya Tamamla
              </AppButton>

              <AppButton
                size="xs"
                variant="kurumsalmavi"
                shape="md"
                onClick={() => {
                  setPdfTarget({ type: 'material', rowKey: row.rowKey });
                  setPdfDraft(row.pdf);
                  setOpenPdfDlg(true);
                }}
              >
                PDF
              </AppButton>
              <AppButton size="xs" variant="gri" shape="md" onClick={() => moveMatUp(row.rowKey)} title="Yukarı taşı">▲</AppButton>
              <AppButton size="xs" variant="gri" shape="md" onClick={() => moveMatDown(row.rowKey)} title="Aşağı taşı">▼</AppButton>
              <AppButton size="xs" variant="gri" shape="md" onClick={() => openMatDialog(row.rowKey)}>Seç</AppButton>
              <AppButton size="xs" variant="kirmizi" shape="md" onClick={() => removeMaterialRow(row.rowKey)}>Kaldır</AppButton>
            </div>
          ]}
        />

        {/* Kumandalar */}
        <Section
          title="Kumandalar"
          addButtonLabel="Kumanda Ekle"
          columns={['Kumanda İsmi', 'İşlemler']}
          rows={remotes}
          addRow={addRemoteRow}
          renderRow={row => [
            row.kumanda_isim || '-',
            <div key="actions" className="flex justify-center flex-wrap gap-2">
              <AppButton
                size="xs"
                variant="kurumsalmavi"
                shape="md"
                onClick={() => {
                  setPdfTarget({ type: 'remote', rowKey: row.rowKey });
                  setPdfDraft(row.pdf);
                  setOpenPdfDlg(true);
                }}
              >
                PDF
              </AppButton>
              <AppButton size="xs" variant="gri" shape="md" onClick={() => moveRemoteUp(row.rowKey)} title="Yukarı taşı">▲</AppButton>
              <AppButton size="xs" variant="gri" shape="md" onClick={() => moveRemoteDown(row.rowKey)} title="Aşağı taşı">▼</AppButton>
              <AppButton size="xs" variant="gri" shape="md" onClick={() => openRemoteDialog(row.rowKey)}>Seç</AppButton>
              <AppButton size="xs" variant="kirmizi" shape="md" onClick={() => removeRemoteRow(row.rowKey)}>Kaldır</AppButton>
            </div>
          ]}
        />

        {/* Seçim Dialogları */}
        <DialogProfilSec
          open={openProfileDlg}
          onOpenChange={setOpenProfileDlg}
          onSelect={(item) => {
            setProfiles(ps => ps.map(r =>
              r.rowKey === editingProfileRowKey
                ? { ...r, profile_id: item.id, profil_kodu: item.profil_kodu, profil_isim: item.profil_isim }
                : r
            ));
          }}
        />

        <DialogCamSec
          open={openCamDlg}
          onOpenChange={setOpenCamDlg}
          onSelect={(item) => {
            setGlasses(gs => gs.map(r =>
              r.rowKey === editingCamRowKey
                ? { ...r, glass_type_id: item.id, cam_isim: item.cam_isim }
                : r
            ));
          }}
        />

        <DialogMalzemeSec
          open={openMatDlg}
          onOpenChange={setOpenMatDlg}
          onSelect={(item) => {
            setMaterials(ms => ms.map(r =>
              r.rowKey === editingMatRowKey
                ? { ...r, material_id: item.id, diger_malzeme_isim: item.diger_malzeme_isim }
                : r
            ));
          }}
        />

        <DialogKumandaSec
          open={openRemoteDlg}
          onOpenChange={setOpenRemoteDlg}
          onSelect={(item) => {
            setRemotes(rs => rs.map(r =>
              r.rowKey === editingRemoteRowKey
                ? { ...r, remote_id: item.id, kumanda_isim: item.kumanda_isim }
                : r
            ));
          }}
        />

        <DialogPdfAyar
          open={openPdfDlg}
          onOpenChange={setOpenPdfDlg}
          initial={pdfDraft}
          section={pdfTarget.type || "profile"}
          onSave={(val) => {
            if (pdfTarget.type === 'profile') {
              const fixed = { ...val, camCiktisi: true };
              setProfiles(ps => ps.map(r => r.rowKey === pdfTarget.rowKey ? ({ ...r, pdf: { ...r.pdf, ...fixed } }) : r));
            } else if (pdfTarget.type === 'glass') {
              setGlasses(gs => gs.map(r => r.rowKey === pdfTarget.rowKey ? ({ ...r, pdf: { ...r.pdf, ...val } }) : r));
            } else if (pdfTarget.type === 'material') {
              setMaterials(ms => ms.map(r => r.rowKey === pdfTarget.rowKey ? ({ ...r, pdf: { ...r.pdf, ...val } }) : r));
            } else if (pdfTarget.type === 'remote') {
              setRemotes(rs => rs.map(r => r.rowKey === pdfTarget.rowKey ? ({ ...r, pdf: { ...r.pdf, ...val } }) : r));
            }
          }}
        />

        <DialogSystemVariantFoto
          open={openVariantPhotoDlg}
          onOpenChange={setOpenVariantPhotoDlg}
          variantId={variantId}
        />

        {/* ✅ YENİ Dialog */}
        <DialogSystemVariantPdfFoto
          open={openVariantPdfPhotoDlg}
          onOpenChange={setOpenVariantPdfPhotoDlg}
          variantId={variantId}
        />
      </div>
    </div>
  );
};

/**
 * Reusable Section — md+ tablo, md- kart
 */
const Section = ({ title, columns, rows, addRow, renderRow, addButtonLabel }) => {
  const renderCells = (row) => renderRow(row);

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <AppButton
          size="sm"
          variant="kurumsalmavi"
          shape="md"
          onClick={addRow}
          className="w-full sm:w-auto shadow-sm"
        >
          {addButtonLabel ?? `${title.slice(0, -1)} Ekle`}
        </AppButton>
      </div>

      {/* md+ tablo */}
      <div className="hidden md:block overflow-x-auto border border-border rounded-lg">
        <table className="table w-full">
          <thead>
            <tr>{columns.map((c, i) => <th key={i}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length > 0
              ? rows.map(r => (
                <tr key={r.rowKey} className="hover:bg-muted/40 border-b border-base-300 last:border-b-0">
                  {renderCells(r).map((cell, i) => <td key={i} className="align-top">{cell}</td>)}
                </tr>
              ))
              : (
                <tr>
                  <td colSpan={columns.length} className="text-center text-muted-foreground py-4">
                    Veri bulunamadı
                  </td>
                </tr>
              )
            }
          </tbody>
        </table>
      </div>

      {/* md- mobil kart */}
      <div className="md:hidden">
        {rows.length > 0 ? (
          <div className="flex flex-col gap-3">
            {rows.map((r) => {
              const cells = renderCells(r);
              return (
                <div
                  key={r.rowKey}
                  className="bg-background/60 border border-border rounded-xl p-3 shadow-sm flex flex-col gap-2"
                >
                  {/* Alanlar */}
                  <div className="flex flex-col gap-1 text-sm">
                    {columns.map((label, i) => {
                      if (label.toLowerCase() === "işlemler") return null;
                      return (
                        <div key={i} className="flex justify-between gap-2">
                          <span className="text-xs text-muted-foreground">{label}</span>
                          <div className="text-right font-medium">
                            {cells[i] ?? "—"}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-4 text-sm">
            Veri bulunamadı
          </div>
        )}
      </div>
    </div>
  );
};

export default SistemVaryantDuzenle;
