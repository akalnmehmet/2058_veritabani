// Path: @/scenes/projeekle/MalzemeTable.tsx
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import AppButton from '@/components/ui/AppButton';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import * as actions_projeler from '@/redux/actions/actions_projeler';

const MalzemeTable = ({
  extraProfiles = [],
  extraGlasses = [],
  extraRequirements = [],
  extraRemotes = [],
}) => {
  const dispatch = useDispatch();
  const { id: projectId } = useParams();

  const olculu = useMemo(
    () => extraRequirements.filter((req) => req.material?.hesaplama_turu === 'olculu'),
    [extraRequirements]
  );
  const adetli = useMemo(
    () => extraRequirements.filter((req) => req.material?.hesaplama_turu === 'adetli'),
    [extraRequirements]
  );

  const [deleteState, setDeleteState] = useState({
    open: false,
    type: null,
    row: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const [editState, setEditState] = useState({
    open: false,
    type: null,
    row: null,
    form: {},
  });
  const [isSaving, setIsSaving] = useState(false);

  const openEdit = (type, row) => {
    if (!row) return;
    let form = {};
    switch (type) {
      case 'profile':
        form = {
          cut_length_mm: Number(row.cut_length_mm) || 0,
          cut_count: Number(row.cut_count) || 0,
          is_painted: Boolean(row.is_painted),
          unit_price: Number(row.unit_price) || 0,
          pdf: row.pdf ?? {
            camCiktisi: true,
            profilAksesuarCiktisi: true,
            boyaCiktisi: true,
            siparisCiktisi: true,
            optimizasyonDetayliCiktisi: true,
            optimizasyonDetaysizCiktisi: true,
          },
        };
        break;
      case 'glass':
        form = {
          width_mm: Number(row.width_mm) || 0,
          height_mm: Number(row.height_mm) || 0,
          count: Number(row.count) || 0,
          unit_price: Number(row.unit_price) || 0,
          glass_color_id_1: row.glass_color_id_1 ?? null,
          glass_color_1: row.glass_color_1 ?? null,
          glass_color_id_2: row.glass_color_id_2 ?? null,
          glass_color_2: row.glass_color_2 ?? null,
          pdf: row.pdf ?? {
            camCiktisi: true,
            profilAksesuarCiktisi: true,
            boyaCiktisi: true,
            siparisCiktisi: true,
            optimizasyonDetayliCiktisi: true,
            optimizasyonDetaysizCiktisi: true,
          },
        };
        break;
      case 'material':
        form = {
          count: Number(row.count) || 0,
          cut_length_mm: Number(row.cut_length_mm) || 0,
          unit_price: Number(row.unit_price) || 0,
          pdf: row.pdf ?? {
            camCiktisi: true,
            profilAksesuarCiktisi: true,
            boyaCiktisi: true,
            siparisCiktisi: true,
            optimizasyonDetayliCiktisi: true,
            optimizasyonDetaysizCiktisi: true,
          },
        };
        break;
      case 'remote':
        form = {
          count: Number(row.count) || 0,
          unit_price: Number(row.unit_price ?? row?.remote?.price ?? 0) || 0,
          pdf: row.pdf ?? {
            camCiktisi: true,
            profilAksesuarCiktisi: true,
            boyaCiktisi: true,
            siparisCiktisi: true,
            optimizasyonDetayliCiktisi: true,
            optimizasyonDetaysizCiktisi: true,
          },
        };
        break;
      default:
        break;
    }
    setEditState({ open: true, type, row, form });
  };

  const closeEdit = () => setEditState({ open: false, type: null, row: null, form: {} });

  const onChangeForm = (key, val) => {
    setEditState((s) => ({ ...s, form: { ...s.form, [key]: val } }));
  };

  const saveEdit = async () => {
    const { type, row, form } = editState;
    if (!type || !row) return;
    try {
      setIsSaving(true);
      if (type === 'profile') {
        await dispatch(actions_projeler.editExtraProfileOnApi(projectId, row.id, form));
      } else if (type === 'glass') {
        await dispatch(actions_projeler.editExtraGlassOnApi(projectId, row.id, form));
      } else if (type === 'material') {
        await dispatch(actions_projeler.editExtraMaterialOnApi(projectId, row.id, form));
      } else if (type === 'remote') {
        await dispatch(actions_projeler.editExtraRemoteOnApi(projectId, row.id, form));
      }
      closeEdit();
    } finally {
      setIsSaving(false);
    }
  };

  const requestDelete = (type, row) => {
    setDeleteState({ open: true, type, row });
  };
  const closeDelete = () => setDeleteState({ open: false, type: null, row: null });

  const confirmDelete = async () => {
    const { type, row } = deleteState;
    if (!type || !row) return;
    try {
      setIsDeleting(true);
      if (type === 'profile') {
        await dispatch(actions_projeler.deleteExtraProfileFromApi(projectId, row.id));
      } else if (type === 'glass') {
        await dispatch(actions_projeler.deleteExtraGlassFromApi(projectId, row.id));
      } else if (type === 'material') {
        await dispatch(actions_projeler.deleteExtraMaterialFromApi(projectId, row.id));
      } else if (type === 'remote') {
        await dispatch(actions_projeler.deleteExtraRemoteOnApi(projectId, row.id));
      }
      closeDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const money = (n) =>
    Number(n || 0).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) +
    ' ₺';

  return (
    <div className="space-y-6">

      {/* Ekstra Profiller */}
      {extraProfiles.length > 0 && (
        <div className="bg-card text-foreground border border-border rounded-2xl p-4">
          <div className="font-semibold mb-2">Ekstra Profiller</div>

          {/* md+ tablo (mevcut hali) */}
          <div className="hidden md:block overflow-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Profil Kodu</th>
                  <th>Profil İsim</th>
                  <th>Kesim Ölçüsü (mm)</th>
                  <th>Kesim Adedi</th>
                  <th>Birim Fiyat</th>
                  <th className="text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {extraProfiles.map((p, i) => (
                  <tr key={`${p.id || p.profile_id}_${i}`}>
                    <td>{p.profile?.profil_kodu ?? '—'}</td>
                    <td>{p.profile?.profil_isim ?? '—'}</td>
                    <td>{p.cut_length_mm}</td>
                    <td>{p.cut_count}</td>
                    <td>{money(p.unit_price)}</td>
                    <td className="text-right space-x-2">
                      <AppButton variant="sari" size="sm" shape="none" onClick={() => openEdit('profile', p)}>
                        Düzenle
                      </AppButton>
                      <AppButton variant="kirmizi" size="sm" shape="none" onClick={() => requestDelete('profile', p)}>
                        Sil
                      </AppButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* md- mobil kart */}
          <div className="md:hidden flex flex-col gap-3">
            {extraProfiles.map((p, i) => (
              <div key={`${p.id || p.profile_id}_m_${i}`} className="bg-background/60 border border-border rounded-xl p-3 flex flex-col gap-2">
                <div>
                  <div className="font-semibold text-sm">
                    {p.profile?.profil_kodu ?? '—'} — {p.profile?.profil_isim ?? '—'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Kesim Ölçüsü</div>
                    <div>{p.cut_length_mm}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Kesim Adedi</div>
                    <div>{p.cut_count}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground">Birim Fiyat</div>
                    <div className="font-medium">{money(p.unit_price)}</div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <AppButton variant="sari" size="sm" shape="none" onClick={() => openEdit('profile', p)}>
                    Düzenle
                  </AppButton>
                  <AppButton variant="kirmizi" size="sm" shape="none" onClick={() => requestDelete('profile', p)}>
                    Sil
                  </AppButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ekstra Camlar */}
      {extraGlasses.length > 0 && (
        <div className="bg-card text-foreground border border-border rounded-2xl p-4">
          <div className="font-semibold mb-2">Ekstra Camlar</div>

          <div className="hidden md:block overflow-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Cam İsim</th>
                  <th>Yükseklik (mm)</th>
                  <th>Genişlik (mm)</th>
                  <th>Adet</th>
                  <th>Birim Fiyat</th>
                  <th className="text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {extraGlasses.map((g, i) => (
                  <tr key={`${g.id || g.glass_type_id}_${i}`}>
                    <td>{g.glass_type?.cam_isim ?? '—'}</td>
                    <td>{g.height_mm}</td>
                    <td>{g.width_mm}</td>
                    <td>{g.count}</td>
                    <td>{money(g.unit_price)}</td>
                    <td className="text-right space-x-2">
                      <AppButton variant="sari" size="sm" shape="none" onClick={() => openEdit('glass', g)}>
                        Düzenle
                      </AppButton>
                      <AppButton variant="kirmizi" size="sm" shape="none" onClick={() => requestDelete('glass', g)}>
                        Sil
                      </AppButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col gap-3">
            {extraGlasses.map((g, i) => (
              <div key={`${g.id || g.glass_type_id}_m_${i}`} className="bg-background/60 border border-border rounded-xl p-3 flex flex-col gap-2">
                <div className="font-semibold text-sm">{g.glass_type?.cam_isim ?? '—'}</div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Genişlik</div>
                    <div>{g.width_mm} mm</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Yükseklik</div>
                    <div>{g.height_mm} mm</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Adet</div>
                    <div>{g.count}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Birim Fiyat</div>
                    <div className="font-medium">{money(g.unit_price)}</div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <AppButton variant="sari" size="sm" shape="none" onClick={() => openEdit('glass', g)}>
                    Düzenle
                  </AppButton>
                  <AppButton variant="kirmizi" size="sm" shape="none" onClick={() => requestDelete('glass', g)}>
                    Sil
                  </AppButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ölçülü Ekstra Malzemeler */}
      {olculu.length > 0 && (
        <div className="bg-card text-foreground border border-border rounded-2xl p-4">
          <div className="font-semibold mb-2">Ölçülü Ekstra Malzemeler</div>

          <div className="hidden md:block overflow-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Malzeme İsim</th>
                  <th>Birim</th>
                  <th>Kesim Ölçüsü (mm)</th>
                  <th>Kesim Adedi</th>
                  <th>Birim Fiyat</th>
                  <th className="text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {olculu.map((m, i) => (
                  <tr key={`${m.id || m.material_id}_${i}`}>
                    <td>{m.material?.diger_malzeme_isim ?? '—'}</td>
                    <td>{m.material?.birim ?? '—'}</td>
                    <td>{m.cut_length_mm}</td>
                    <td>{m.count}</td>
                    <td>{money(m.unit_price)}</td>
                    <td className="text-right space-x-2">
                      <AppButton variant="sari" size="sm" shape="none" onClick={() => openEdit('material', m)}>
                        Düzenle
                      </AppButton>
                      <AppButton variant="kirmizi" size="sm" shape="none" onClick={() => requestDelete('material', m)}>
                        Sil
                      </AppButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col gap-3">
            {olculu.map((m, i) => (
              <div key={`${m.id || m.material_id}_m_${i}`} className="bg-background/60 border border-border rounded-xl p-3 flex flex-col gap-2">
                <div className="font-semibold text-sm">
                  {m.material?.diger_malzeme_isim ?? '—'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Birim: {m.material?.birim ?? '—'}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Kesim Ölçüsü</div>
                    <div>{m.cut_length_mm} mm</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Kesim Adedi</div>
                    <div>{m.count}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground">Birim Fiyat</div>
                    <div className="font-medium">{money(m.unit_price)}</div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <AppButton variant="sari" size="sm" shape="none" onClick={() => openEdit('material', m)}>
                    Düzenle
                  </AppButton>
                  <AppButton variant="kirmizi" size="sm" shape="none" onClick={() => requestDelete('material', m)}>
                    Sil
                  </AppButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adetli Ekstra Malzemeler */}
      {adetli.length > 0 && (
        <div className="bg-card text-foreground border border-border rounded-2xl p-4">
          <div className="font-semibold mb-2">Adetli Ekstra Malzemeler</div>

          <div className="hidden md:block overflow-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Malzeme İsim</th>
                  <th>Birim</th>
                  <th>Adet</th>
                  <th>Birim Fiyat</th>
                  <th className="text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {adetli.map((m, i) => (
                  <tr key={`${m.id || m.material_id}_${i}`}>
                    <td>{m.material?.diger_malzeme_isim ?? '—'}</td>
                    <td>{m.material?.birim ?? '—'}</td>
                    <td>{m.count}</td>
                    <td>{money(m.unit_price)}</td>
                    <td className="text-right space-x-2">
                      <AppButton variant="sari" size="sm" shape="none" onClick={() => openEdit('material', m)}>
                        Düzenle
                      </AppButton>
                      <AppButton variant="kirmizi" size="sm" shape="none" onClick={() => requestDelete('material', m)}>
                        Sil
                      </AppButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col gap-3">
            {adetli.map((m, i) => (
              <div key={`${m.id || m.material_id}_m_${i}`} className="bg-background/60 border border-border rounded-xl p-3 flex flex-col gap-2">
                <div className="font-semibold text-sm">
                  {m.material?.diger_malzeme_isim ?? '—'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Birim: {m.material?.birim ?? '—'}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Adet</div>
                    <div>{m.count}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Birim Fiyat</div>
                    <div className="font-medium">{money(m.unit_price)}</div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <AppButton variant="sari" size="sm" shape="none" onClick={() => openEdit('material', m)}>
                    Düzenle
                  </AppButton>
                  <AppButton variant="kirmizi" size="sm" shape="none" onClick={() => requestDelete('material', m)}>
                    Sil
                  </AppButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ekstra Kumandalar */}
      {extraRemotes.length > 0 && (
        <div className="bg-card text-foreground border border-border rounded-2xl p-4">
          <div className="font-semibold mb-2">Ekstra Kumandalar</div>

          <div className="hidden md:block overflow-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Kumanda İsim</th>
                  <th className="text-right">Adet</th>
                  <th className="text-right">Birim Fiyat</th>
                  <th className="text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {extraRemotes.map((row, i) => {
                  const name = row?.remote?.kumanda_isim || '—';
                  const count = Number(row?.count) || 0;
                  const unitPrice = row?.unit_price ?? row?.remote?.price ?? 0;
                  return (
                    <tr key={`${row.id || row.remote_id || 'remote'}_${i}`}>
                      <td>{name}</td>
                      <td className="text-right">{count}</td>
                      <td className="text-right">{money(unitPrice)}</td>
                      <td className="text-right space-x-2">
                        <AppButton variant="sari" size="sm" shape="none" onClick={() => openEdit('remote', row)}>
                          Düzenle
                        </AppButton>
                        <AppButton variant="kirmizi" size="sm" shape="none" onClick={() => requestDelete('remote', row)}>
                          Sil
                        </AppButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col gap-3">
            {extraRemotes.map((row, i) => {
              const name = row?.remote?.kumanda_isim || '—';
              const count = Number(row?.count) || 0;
              const unitPrice = row?.unit_price ?? row?.remote?.price ?? 0;
              return (
                <div key={`${row.id || row.remote_id || 'remote'}_m_${i}`} className="bg-background/60 border border-border rounded-xl p-3 flex flex-col gap-2">
                  <div className="font-semibold text-sm">{name}</div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Adet</div>
                      <div>{count}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Birim Fiyat</div>
                      <div className="font-medium">{money(unitPrice)}</div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <AppButton variant="sari" size="sm" shape="none" onClick={() => openEdit('remote', row)}>
                      Düzenle
                    </AppButton>
                    <AppButton variant="kirmizi" size="sm" shape="none" onClick={() => requestDelete('remote', row)}>
                      Sil
                    </AppButton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Düzenleme Modalı */}
      <Dialog open={editState.open} onOpenChange={(o) => (o ? null : closeEdit())}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editState.type === 'profile' && 'Ekstra Profil Düzenle'}
              {editState.type === 'glass' && 'Ekstra Cam Düzenle'}
              {editState.type === 'material' && 'Ekstra Malzeme Düzenle'}
              {editState.type === 'remote' && 'Ekstra Kumanda Düzenle'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            {(editState.type === 'profile' || editState.type === 'material') && (
              <>
                {editState.type === 'profile' && (
                  <>
                    <label className="block text-sm font-medium">Kesim Ölçüsü (mm)</label>
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      value={editState.form.cut_length_mm}
                      onChange={(e) => onChangeForm('cut_length_mm', Number(e.target.value || 0))}
                    />
                    <label className="block text-sm font-medium">Kesim Adedi</label>
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      value={editState.form.cut_count}
                      onChange={(e) => onChangeForm('cut_count', Number(e.target.value || 0))}
                    />
                    <label className="inline-flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={!!editState.form.is_painted}
                        onChange={(e) => onChangeForm('is_painted', e.target.checked)}
                      />
                      Boyalı mı?
                    </label>
                  </>
                )}

                {editState.type === 'material' && (
                  <>
                    <label className="block text-sm font-medium">Kesim Ölçüsü (mm)</label>
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      value={editState.form.cut_length_mm}
                      onChange={(e) => onChangeForm('cut_length_mm', Number(e.target.value || 0))}
                    />
                    <label className="block text-sm font-medium">Adet</label>
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      value={editState.form.count}
                      onChange={(e) => onChangeForm('count', Number(e.target.value || 0))}
                    />
                  </>
                )}

                <label className="block text-sm font-medium">Birim Fiyat</label>
                <input
                  type="number"
                  step="0.01"
                  className="input input-bordered w-full"
                  value={editState.form.unit_price}
                  onChange={(e) => onChangeForm('unit_price', Number(e.target.value || 0))}
                />
              </>
            )}

            {editState.type === 'glass' && (
              <>
                <label className="block text-sm font-medium">Genişlik (mm)</label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={editState.form.width_mm}
                  onChange={(e) => onChangeForm('width_mm', Number(e.target.value || 0))}
                />
                <label className="block text-sm font-medium">Yükseklik (mm)</label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={editState.form.height_mm}
                  onChange={(e) => onChangeForm('height_mm', Number(e.target.value || 0))}
                />
                <label className="block text-sm font-medium">Adet</label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={editState.form.count}
                  onChange={(e) => onChangeForm('count', Number(e.target.value || 0))}
                />
                <label className="block text-sm font-medium">Birim Fiyat</label>
                <input
                  type="number"
                  step="0.01"
                  className="input input-bordered w-full"
                  value={editState.form.unit_price}
                  onChange={(e) => onChangeForm('unit_price', Number(e.target.value || 0))}
                />
              </>
            )}

            {editState.type === 'remote' && (
              <>
                <label className="block text-sm font-medium">Adet</label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={editState.form.count}
                  onChange={(e) => onChangeForm('count', Number(e.target.value || 0))}
                />
                <label className="block text-sm font-medium">Birim Fiyat</label>
                <input
                  type="number"
                  step="0.01"
                  className="input input-bordered w-full"
                  value={editState.form.unit_price}
                  onChange={(e) => onChangeForm('unit_price', Number(e.target.value || 0))}
                />
              </>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <AppButton variant="gri" onClick={closeEdit}>
              Kapat
            </AppButton>
            <AppButton variant="kurumsalmavi" onClick={saveEdit} loading={isSaving}>
              Kaydet
            </AppButton>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        open={deleteState.open}
        onOpenChange={(o) => (o ? null : closeDelete())}
        title="Silmek istediğinize emin misiniz?"
        description="Bu işlem geri alınamaz."
        confirmText="Evet, sil"
        cancelText="Vazgeç"
        onConfirm={confirmDelete}
        loading={isDeleting}
      />
    </div>
  );
};

export default MalzemeTable;
