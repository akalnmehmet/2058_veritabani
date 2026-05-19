// Path: @/scenes/ekstramalzemeekle/EkstraMalzemeEkle.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

// Server-side listeleme (limit 5)
import { getCamlarFromApi } from '@/redux/actions/actions_camlar';
import { getDigerMalzemelerFromApi } from '@/redux/actions/actions_diger_malzemeler';
import { getProfillerFromApi } from '@/redux/actions/actions_profiller';
import { getKumandalarFromApi } from '@/redux/actions/actions_kumandalar';
import {
  addExtraGlassToApi,
  addExtraMaterialToApi,
  addExtraProfileToApi,
  addExtraRemoteToApi
} from '@/redux/actions/actions_projeler';

import AppButton from '@/components/ui/AppButton';

const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin"></div>
  </div>
);

const EMPTY_PAGE = {
  items: [],
  total: 0,
  page: 1,
  limit: 5,
  total_pages: 1,
  has_next: false,
  has_prev: false,
};

const EkstraMalzemeEkle = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [mode, setMode] = useState(null); // 'profil' | 'cam' | 'malzeme' | 'kumanda'
  const [notification, setNotification] = useState(null);

  // her tablo için ARAMA + SAYFA + loading
  const [profileSearch, setProfileSearch] = useState('');
  const [profilePage, setProfilePage] = useState(1);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [glassSearch, setGlassSearch] = useState('');
  const [glassPage, setGlassPage] = useState(1);
  const [loadingGlass, setLoadingGlass] = useState(false);

  const [otherSearch, setOtherSearch] = useState('');
  const [otherPage, setOtherPage] = useState(1);
  const [loadingOther, setLoadingOther] = useState(false);

  const [kumandaSearch, setKumandaSearch] = useState('');
  const [kumandaPage, setKumandaPage] = useState(1);
  const [loadingKumanda, setLoadingKumanda] = useState(false);

  const [profilInputs, setProfilInputs] = useState({});
  const [camInputs, setCamInputs] = useState({});
  const [malzemeInputs, setMalzemeInputs] = useState({});
  const [kumandaInputs, setKumandaInputs] = useState({});

  const [profilUnitPrices, setProfilUnitPrices] = useState({});
  const [camUnitPrices, setCamUnitPrices] = useState({});
  const [malzemeUnitPrices, setMalzemeUnitPrices] = useState({});
  const [kumandaUnitPrices, setKumandaUnitPrices] = useState({});

  const profiller = useSelector(s => s.getProfillerFromApiReducer) || EMPTY_PAGE;
  const camlar = useSelector(s => s.getCamlarFromApiReducer) || EMPTY_PAGE;
  const digerMalzemeler = useSelector(
    s => s.getDigerMalzemerFromApiReducer || s.getDigerMalzemelerFromApiReducer
  ) || EMPTY_PAGE;
  const kumandalar = useSelector(s => s.getKumandalarFromApiReducer) || EMPTY_PAGE;

  // Seçilen moda göre veri çek
  useEffect(() => {
    if (mode === 'profil') {
      setLoadingProfile(true);
      Promise.resolve(dispatch(getProfillerFromApi(profilePage, profileSearch, 5)))
        .finally(() => setLoadingProfile(false));
    }
  }, [dispatch, mode, profilePage, profileSearch]);

  useEffect(() => {
    if (mode === 'kumanda') {
      setLoadingKumanda(true);
      Promise
        .resolve(dispatch(getKumandalarFromApi({ page: kumandaPage, q: kumandaSearch, limit: 5 })))
        .finally(() => setLoadingKumanda(false));
    }
  }, [dispatch, mode, kumandaPage, kumandaSearch]);

  useEffect(() => {
    if (mode === 'cam') {
      setLoadingGlass(true);
      Promise.resolve(dispatch(getCamlarFromApi(glassPage, glassSearch, 5)))
        .finally(() => setLoadingGlass(false));
    }
  }, [dispatch, mode, glassPage, glassSearch]);

  useEffect(() => {
    if (mode === 'malzeme') {
      setLoadingOther(true);
      Promise.resolve(dispatch(getDigerMalzemelerFromApi(otherPage, otherSearch, 5)))
        .finally(() => setLoadingOther(false));
    }
  }, [dispatch, mode, otherPage, otherSearch]);

  // bildirim
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  // Ortak sayfalama barı → AppButton ile (kontrollü input)
  const Pager = ({ data, setPage }) => {
    const totalPages = data.total_pages || 1;
    const current = data.page || 1;

    return (
      <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-4">
        <AppButton
          variant="kurumsalmavi"
          size="sm"
          shape="none"
          onClick={() => setPage(1)}
          disabled={current === 1}
          title="İlk sayfa"
        >
          « İlk
        </AppButton>

        <AppButton
          variant="kurumsalmavi"
          size="sm"
          shape="none"
          onClick={() => setPage(p => Math.max(1, (typeof p === 'number' ? p : current) - 1))}
          disabled={!data.has_prev}
          title="Önceki sayfa"
        >
          ‹ Önceki
        </AppButton>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const val = parseInt(e.target.elements.pageNum.value, 10);
            if (!isNaN(val) && val >= 1 && val <= totalPages) setPage(val);
          }}
          className="flex items-center gap-1"
        >
          <input
            type="number"
            name="pageNum"
            min={1}
            max={totalPages}
            value={current}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (isNaN(val)) return setPage(1);
              setPage(Math.min(Math.max(1, val), totalPages));
            }}
            className="input input-bordered input-sm w-16 text-center"
          />
          <span className="text-sm">/ {totalPages}</span>
        </form>

        <AppButton
          variant="kurumsalmavi"
          size="sm"
          shape="none"
          onClick={() => setPage(p => (typeof p === 'number' ? p + 1 : current + 1))}
          disabled={!data.has_next}
          title="Sonraki sayfa"
        >
          Sonraki ›
        </AppButton>

        <AppButton
          variant="kurumsalmavi"
          size="sm"
          shape="none"
          onClick={() => setPage(totalPages)}
          disabled={current === totalPages || totalPages <= 1}
          title="Son sayfa"
        >
          Son »
        </AppButton>
      </div>
    );
  };

  const getApiUnitPrice = (item) =>
    item?.unit_price ?? item?.price ?? item?.unitPrice ?? item?.fiyat ?? 0;

  // --- Ekleme handler’ları ---
  const onAddProfile = useCallback((profil) => {
    const data = profilInputs[profil.id] || {};
    const chosenUnitPrice = Number(
      (profilUnitPrices?.[profil.id] ?? getApiUnitPrice(profil)) || 0
    );
    dispatch(addExtraProfileToApi(projectId, {
      project_id: projectId,
      profile_id: profil.id,
      cut_length_mm: Number(data.cut_length_mm || 0),
      cut_count: Number(data.cut_count || 0),
      unit_price: chosenUnitPrice,
    }))
      .then(() => {
        showNotification('Profil başarıyla eklendi');
        setProfilInputs(prev => {
          const next = { ...prev };
          delete next[profil.id];
          return next;
        });
      })
      .catch(() => showNotification('Profil eklenirken hata oluştu'));
  }, [dispatch, profilInputs, projectId, profilUnitPrices]);

  const onAddGlass = useCallback((cam) => {
    const data = camInputs[cam.id] || {};
    const chosenUnitPrice = Number(
      (camUnitPrices?.[cam.id] ?? getApiUnitPrice(cam)) || 0
    );
    dispatch(addExtraGlassToApi(projectId, {
      project_id: projectId,
      glass_type_id: cam.id,
      width_mm: Number(data.width_mm || 0),
      height_mm: Number(data.height_mm || 0),
      count: Number(data.count || 0),
      unit_price: chosenUnitPrice,
    }))
      .then(() => {
        showNotification('Cam başarıyla eklendi');
        setCamInputs(prev => {
          const next = { ...prev };
          delete next[cam.id];
          return next;
        });
      })
      .catch(() => showNotification('Cam eklenirken hata oluştu'));
  }, [dispatch, camInputs, projectId, camUnitPrices]);

  const onAddOther = useCallback((m) => {
    const data = malzemeInputs[m.id] || {};
    const chosenUnitPrice = Number(
      ((malzemeInputs[m.id]?.unit_price) ?? getApiUnitPrice(m)) || 0
    );
    dispatch(addExtraMaterialToApi(projectId, {
      project_id: projectId,
      material_id: m.id,
      count: Number(data.count || 0),
      cut_length_mm: (m.hesaplama_turu === 'adetli')
        ? 0
        : Number(data.size_input_text || 0),
      unit_price: chosenUnitPrice,
      pdf: {
        camCiktisi: true,
        profilAksesuarCiktisi: true,
        boyaCiktisi: true,
        siparisCiktisi: true,
        optimizasyonDetayliCiktisi: true,
        optimizasyonDetaysizCiktisi: true
      }
    }))
      .then(() => {
        showNotification('Malzeme başarıyla eklendi');
        setMalzemeInputs(prev => {
          const next = { ...prev };
          delete next[m.id];
          return next;
        });
      })
      .catch(() => showNotification('Malzeme eklenirken hata oluştu'));
  }, [dispatch, malzemeInputs, projectId]);

  const onAddRemote = useCallback((remote) => {
    const data = kumandaInputs[remote.id] || {};
    const adet = Number(data.count || 0);
    const chosenUnitPrice = Number(
      (kumandaUnitPrices[remote.id] ?? getApiUnitPrice(remote)) || 0
    );
    dispatch(addExtraRemoteToApi(projectId, {
      project_id: projectId,
      remote_id: remote.id,
      count: adet,
      unit_price: chosenUnitPrice,
      pdf: {
        camCiktisi: true,
        profilAksesuarCiktisi: true,
        boyaCiktisi: true,
        siparisCiktisi: true,
        optimizasyonDetayliCiktisi: true,
        optimizasyonDetaysizCiktisi: true
      }
    }))
      .then(() => {
        showNotification('Kumanda başarıyla eklendi');
        setKumandaInputs(prev => {
          const next = { ...prev };
          delete next[remote.id];
          return next;
        });
      })
      .catch(() => showNotification('Kumanda eklenirken hata oluştu'));
  }, [dispatch, kumandaInputs, projectId, kumandaUnitPrices]);

  return (
    <div className="p-4 sm:p-5 text-foreground">
      {/* Başlık + geri */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <h1 className="text-2xl font-bold">Ekstra Malzeme Ekle</h1>
        <AppButton
          onClick={() => navigate(`/projeduzenle/${projectId}`)}
          variant="kurumsalmavi"
          size="sm"
          shape="none"
          className="sm:ml-auto w-full sm:w-auto"
          title="Projeye geri dön"
        >
          Projeye Dön
        </AppButton>
      </div>

      {notification && (
        <div className="alert alert-success shadow-lg mb-4">
          <div><span>{notification}</span></div>
        </div>
      )}

      {/* seçim kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <AppButton
          onClick={() => { setMode('profil'); setProfilePage(1); }}
          variant="kurumsalmavi"
          size="md"
          shape="none"
          className="card w-full bg-base-100 shadow p-4 hover:bg-primary/10 text-left"
          title="Profil ekleme modunu aç"
        >
          <h2 className="text-lg font-semibold">Profil Ekle</h2>
        </AppButton>

        <AppButton
          onClick={() => { setMode('cam'); setGlassPage(1); }}
          variant="kurumsalmavi"
          size="md"
          shape="none"
          className="card w-full bg-base-100 shadow p-4 hover:bg-primary/10 text-left"
          title="Cam ekleme modunu aç"
        >
          <h2 className="text-lg font-semibold">Cam Ekle</h2>
        </AppButton>

        <AppButton
          onClick={() => { setMode('malzeme'); setOtherPage(1); }}
          variant="kurumsalmavi"
          size="md"
          shape="none"
          className="card w-full bg-base-100 shadow p-4 hover:bg-primary/10 text-left"
          title="Malzeme ekleme modunu aç"
        >
          <h2 className="text-lg font-semibold">Malzeme Ekle</h2>
        </AppButton>

        <AppButton
          onClick={() => { setMode('kumanda'); setKumandaPage(1); }}
          variant="kurumsalmavi"
          size="md"
          shape="none"
          className="card w-full bg-base-100 shadow p-4 hover:bg-primary/10 text-left"
          title="Kumanda ekleme modunu aç"
        >
          <h2 className="text-lg font-semibold">Kumanda Ekle</h2>
        </AppButton>
      </div>

      {!mode ? null : (
        <div className="mt-4 sm:mt-6">
          {/* Search + geri */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
            {mode === 'profil' && (
              <input
                type="text"
                value={profileSearch}
                onChange={(e) => { setProfileSearch(e.target.value); setProfilePage(1); }}
                placeholder="Profil ara..."
                className="input input-bordered w-full md:max-w-md"
              />
            )}
            {mode === 'cam' && (
              <input
                type="text"
                value={glassSearch}
                onChange={(e) => { setGlassSearch(e.target.value); setGlassPage(1); }}
                placeholder="Cam ara..."
                className="input input-bordered w-full md:max-w-md"
              />
            )}
            {mode === 'malzeme' && (
              <input
                type="text"
                value={otherSearch}
                onChange={(e) => { setOtherSearch(e.target.value); setOtherPage(1); }}
                placeholder="Malzeme ara..."
                className="input input-bordered w-full md:max-w-md"
              />
            )}
            {mode === 'kumanda' && (
              <input
                type="text"
                value={kumandaSearch}
                onChange={(e) => { setKumandaSearch(e.target.value); setKumandaPage(1); }}
                placeholder="Kumanda ara..."
                className="input input-bordered w-full md:max-w-md"
              />
            )}

            <AppButton
              onClick={() => setMode(null)}
              variant="gri"
              size="sm"
              shape="none"
              className="w-full md:w-auto md:ml-auto"
              title="Ana seçim ekranına dön"
            >
              Geri
            </AppButton>
          </div>

          {/* ================= PROFİLLER ================= */}
          {mode === 'profil' && (
            <div className="w-full">
              {/* DESKTOP TABLO */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Profil Kodu</th>
                      <th>Profil Adı</th>
                      <th>Kesim Ölçüsü (mm)</th>
                      <th>Kesim Adedi</th>
                      <th>Birim Fiyat</th>
                      <th className="text-right">Ekle</th>
                    </tr>
                  </thead>
                  {loadingProfile ? (
                    <tbody><tr><td colSpan={6}><Spinner /></td></tr></tbody>
                  ) : (
                    <tbody>
                      {(profiller.items ?? []).map(profil => (
                        <tr className="border border-border" key={profil.id}>
                          <td>{profil.profil_kodu}</td>
                          <td>{profil.profil_isim}</td>
                          <td>
                            <input
                              type="number"
                              placeholder="mm"
                              className="input input-sm input-bordered w-24"
                              value={profilInputs[profil.id]?.cut_length_mm || ''}
                              onChange={e =>
                                setProfilInputs(prev => ({
                                  ...prev,
                                  [profil.id]: { ...(prev[profil.id] || {}), cut_length_mm: e.target.value }
                                }))
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              placeholder="Adet"
                              className="input input-sm input-bordered w-20"
                              value={profilInputs[profil.id]?.cut_count || ''}
                              onChange={e =>
                                setProfilInputs(prev => ({
                                  ...prev,
                                  [profil.id]: { ...(prev[profil.id] || {}), cut_count: e.target.value }
                                }))
                              }
                            />
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                className="input input-sm input-bordered w-24"
                                value={profilUnitPrices[profil.id] ?? getApiUnitPrice(profil)}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setProfilUnitPrices((prev) => ({ ...prev, [profil.id]: v }));
                                }}
                              />
                              <AppButton
                                type="button"
                                variant="gri"
                                size="sm"
                                shape="none"
                                onClick={() =>
                                  setProfilUnitPrices((prev) => ({
                                    ...prev,
                                    [profil.id]: getApiUnitPrice(profil),
                                  }))
                                }
                              >
                                Sıfırla
                              </AppButton>
                            </div>
                          </td>
                          <td className="text-right">
                            <AppButton
                              variant="kurumsalmavi"
                              size="sm"
                              shape="none"
                              onClick={() => onAddProfile(profil)}
                            >
                              Ekle
                            </AppButton>
                          </td>
                        </tr>
                      ))}
                      {(!profiller.items || profiller.items.length === 0) && (
                        <tr>
                          <td colSpan={6} className="text-center text-muted-foreground py-6">Kayıt yok</td>
                        </tr>
                      )}
                    </tbody>
                  )}
                </table>
              </div>

              {/* MOBİL KARTLAR */}
              <div className="md:hidden flex flex-col gap-3">
                {loadingProfile ? (
                  <Spinner />
                ) : (profiller.items?.length > 0 ? (
                  profiller.items.map(profil => {
                    const pInput = profilInputs[profil.id] || {};
                    const unit = profilUnitPrices[profil.id] ?? getApiUnitPrice(profil);

                    return (
                      <div key={profil.id} className="border border-border rounded-2xl p-4 bg-card shadow-sm grid gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="grid">
                            <div className="text-sm opacity-70">Profil Kodu</div>
                            <div className="font-semibold break-words">{profil.profil_kodu}</div>
                          </div>
                        </div>

                        <div className="grid">
                          <div className="text-sm opacity-70">Profil Adı</div>
                          <div className="font-medium break-words">{profil.profil_isim}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-sm opacity-70">Kesim Ölçüsü (mm)</div>
                            <input
                              type="number"
                              className="input input-sm input-bordered w-full"
                              value={pInput.cut_length_mm || ''}
                              onChange={e =>
                                setProfilInputs(prev => ({
                                  ...prev,
                                  [profil.id]: { ...(prev[profil.id] || {}), cut_length_mm: e.target.value }
                                }))
                              }
                            />
                          </div>
                          <div>
                            <div className="text-sm opacity-70">Kesim Adedi</div>
                            <input
                              type="number"
                              className="input input-sm input-bordered w-full"
                              value={pInput.cut_count || ''}
                              onChange={e =>
                                setProfilInputs(prev => ({
                                  ...prev,
                                  [profil.id]: { ...(prev[profil.id] || {}), cut_count: e.target.value }
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <div className="text-sm opacity-70 mb-1">Birim Fiyat</div>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              className="input input-sm input-bordered w-full"
                              value={unit}
                              onChange={(e) =>
                                setProfilUnitPrices(prev => ({ ...prev, [profil.id]: e.target.value }))
                              }
                            />
                            <AppButton
                              variant="gri"
                              size="sm"
                              shape="none"
                              onClick={() =>
                                setProfilUnitPrices(prev => ({ ...prev, [profil.id]: getApiUnitPrice(profil) }))
                              }
                            >
                              Sıfırla
                            </AppButton>
                          </div>
                        </div>

                        <AppButton
                          variant="kurumsalmavi"
                          size="md"
                          className="w-full"
                          onClick={() => onAddProfile(profil)}
                        >
                          Ekle
                        </AppButton>
                      </div>
                    );
                  })
                ) : (
                  <div className="border border-border rounded-2xl p-6 text-center text-muted-foreground">
                    Kayıt yok
                  </div>
                ))}
              </div>

              <Pager data={profiller || EMPTY_PAGE} setPage={setProfilePage} />
            </div>
          )}

          {/* ================= CAMLAR ================= */}
          {mode === 'cam' && (
            <div className="w-full">
              {/* DESKTOP TABLO */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Cam İsmi</th>
                      <th>Genişlik (mm)</th>
                      <th>Yükseklik (mm)</th>
                      <th>Adet</th>
                      <th>Birim Fiyat</th>
                      <th className="text-right">Ekle</th>
                    </tr>
                  </thead>
                  {loadingGlass ? (
                    <tbody><tr><td colSpan={6}><Spinner /></td></tr></tbody>
                  ) : (
                    <tbody>
                      {(camlar.items ?? []).map(cam => (
                        <tr className="border border-border" key={cam.id}>
                          <td>{cam.cam_isim}</td>
                          <td>
                            <input
                              type="number"
                              placeholder='mm'
                              className="input input-sm input-bordered w-20"
                              value={camInputs[cam.id]?.width_mm || ''}
                              onChange={e =>
                                setCamInputs(prev => ({
                                  ...prev,
                                  [cam.id]: { ...(prev[cam.id] || {}), width_mm: e.target.value }
                                }))
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              placeholder='mm'
                              className="input input-sm input-bordered w-20"
                              value={camInputs[cam.id]?.height_mm || ''}
                              onChange={e =>
                                setCamInputs(prev => ({
                                  ...prev,
                                  [cam.id]: { ...(prev[cam.id] || {}), height_mm: e.target.value }
                                }))
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              placeholder='Adet'
                              className="input input-sm input-bordered w-16"
                              value={camInputs[cam.id]?.count || ''}
                              onChange={e =>
                                setCamInputs(prev => ({
                                  ...prev,
                                  [cam.id]: { ...(prev[cam.id] || {}), count: e.target.value }
                                }))
                              }
                            />
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                className="input input-sm input-bordered w-24"
                                value={camUnitPrices[cam.id] ?? getApiUnitPrice(cam)}
                                onChange={(e) =>
                                  setCamUnitPrices(prev => ({ ...prev, [cam.id]: e.target.value }))
                                }
                              />
                              <AppButton
                                type="button"
                                variant="gri"
                                size="sm"
                                shape="none"
                                onClick={() =>
                                  setCamUnitPrices(prev => ({ ...prev, [cam.id]: getApiUnitPrice(cam) }))
                                }
                              >
                                Sıfırla
                              </AppButton>
                            </div>
                          </td>
                          <td className="text-right">
                            <AppButton
                              variant="kurumsalmavi"
                              size="sm"
                              shape="none"
                              onClick={() => onAddGlass(cam)}
                            >
                              Ekle
                            </AppButton>
                          </td>
                        </tr>
                      ))}
                      {(!camlar.items || camlar.items.length === 0) && (
                        <tr><td colSpan={6} className="text-center text-muted-foreground py-6">Kayıt yok</td></tr>
                      )}
                    </tbody>
                  )}
                </table>
              </div>

              {/* MOBİL KARTLAR */}
              <div className="md:hidden flex flex-col gap-3">
                {loadingGlass ? (
                  <Spinner />
                ) : (camlar.items?.length > 0 ? (
                  camlar.items.map(cam => {
                    const cInput = camInputs[cam.id] || {};
                    const unit = camUnitPrices[cam.id] ?? getApiUnitPrice(cam);

                    return (
                      <div key={cam.id} className="border border-border rounded-2xl p-4 bg-card shadow-sm grid gap-3">
                        <div className="text-base font-semibold break-words">{cam.cam_isim}</div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-sm opacity-70">Genişlik (mm)</div>
                            <input
                              type="number"
                              className="input input-sm input-bordered w-full"
                              value={cInput.width_mm || ''}
                              onChange={e =>
                                setCamInputs(prev => ({
                                  ...prev,
                                  [cam.id]: { ...(prev[cam.id] || {}), width_mm: e.target.value }
                                }))
                              }
                            />
                          </div>
                          <div>
                            <div className="text-sm opacity-70">Yükseklik (mm)</div>
                            <input
                              type="number"
                              className="input input-sm input-bordered w-full"
                              value={cInput.height_mm || ''}
                              onChange={e =>
                                setCamInputs(prev => ({
                                  ...prev,
                                  [cam.id]: { ...(prev[cam.id] || {}), height_mm: e.target.value }
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-sm opacity-70">Adet</div>
                            <input
                              type="number"
                              className="input input-sm input-bordered w-full"
                              value={cInput.count || ''}
                              onChange={e =>
                                setCamInputs(prev => ({
                                  ...prev,
                                  [cam.id]: { ...(prev[cam.id] || {}), count: e.target.value }
                                }))
                              }
                            />
                          </div>

                          <div>
                            <div className="text-sm opacity-70 mb-1">Birim Fiyat</div>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                className="input input-sm input-bordered w-full"
                                value={unit}
                                onChange={(e) =>
                                  setCamUnitPrices(prev => ({ ...prev, [cam.id]: e.target.value }))
                                }
                              />
                              <AppButton
                                variant="gri"
                                size="sm"
                                shape="none"
                                onClick={() =>
                                  setCamUnitPrices(prev => ({ ...prev, [cam.id]: getApiUnitPrice(cam) }))
                                }
                              >
                                Sıfırla
                              </AppButton>
                            </div>
                          </div>
                        </div>

                        <AppButton
                          variant="kurumsalmavi"
                          size="md"
                          className="w-full"
                          onClick={() => onAddGlass(cam)}
                        >
                          Ekle
                        </AppButton>
                      </div>
                    );
                  })
                ) : (
                  <div className="border border-border rounded-2xl p-6 text-center text-muted-foreground">
                    Kayıt yok
                  </div>
                ))}
              </div>

              <Pager data={camlar || EMPTY_PAGE} setPage={setGlassPage} />
            </div>
          )}

          {/* ================= DİĞER MALZEMELER ================= */}
          {mode === 'malzeme' && (
            <div className="w-full">
              {/* DESKTOP TABLO */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>İsim</th>
                      <th>Adet</th>
                      <th>Kesim Ölçüsü</th>
                      <th>Birim Fiyat</th>
                      <th className="text-right">Ekle</th>
                    </tr>
                  </thead>
                  {loadingOther ? (
                    <tbody><tr><td colSpan={5}><Spinner /></td></tr></tbody>
                  ) : (
                    <tbody>
                      {(digerMalzemeler.items ?? []).map(m => (
                        <tr className="border border-border" key={m.id}>
                          <td>{m.diger_malzeme_isim}</td>
                          <td>
                            <input
                              type="number"
                              placeholder='Adet'
                              className="input input-sm input-bordered w-20"
                              value={malzemeInputs[m.id]?.count || ''}
                              onChange={e =>
                                setMalzemeInputs(prev => ({
                                  ...prev,
                                  [m.id]: { ...(prev[m.id] || {}), count: e.target.value }
                                }))
                              }
                            />
                          </td>
                          <td>
                            {m.hesaplama_turu === 'olculu' ? (
                              <input
                                type="number"
                                placeholder="mm"
                                className="input input-sm input-bordered w-40"
                                value={malzemeInputs[m.id]?.size_input_text || ''}
                                onChange={(e) =>
                                  setMalzemeInputs((prev) => ({
                                    ...prev,
                                    [m.id]: { ...(prev[m.id] || {}), size_input_text: e.target.value }
                                  }))
                                }
                              />
                            ) : (
                              <span className="text-muted-foreground">Adetli Malzeme</span>
                            )}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                className="input input-sm input-bordered w-24"
                                value={(malzemeInputs[m.id]?.unit_price) ?? getApiUnitPrice(m)}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setMalzemeInputs(prev => ({
                                    ...prev,
                                    [m.id]: { ...(prev[m.id] || {}), unit_price: v }
                                  }));
                                }}
                              />
                              <AppButton
                                type="button"
                                variant="gri"
                                size="sm"
                                shape="none"
                                onClick={() =>
                                  setMalzemeInputs(prev => ({
                                    ...prev,
                                    [m.id]: { ...(prev[m.id] || {}), unit_price: getApiUnitPrice(m) }
                                  }))
                                }
                              >
                                Sıfırla
                              </AppButton>
                            </div>
                          </td>

                          <td className="text-right">
                            <AppButton
                              variant="kurumsalmavi"
                              size="sm"
                              shape="none"
                              onClick={() => onAddOther(m)}
                            >
                              Ekle
                            </AppButton>
                          </td>
                        </tr>
                      ))}
                      {(!digerMalzemeler.items || digerMalzemeler.items.length === 0) && (
                        <tr><td colSpan={5} className="text-center text-muted-foreground py-6">Kayıt yok</td></tr>
                      )}
                    </tbody>
                  )}
                </table>
              </div>

              {/* MOBİL KARTLAR */}
              <div className="md:hidden flex flex-col gap-3">
                {loadingOther ? (
                  <Spinner />
                ) : (digerMalzemeler.items?.length > 0 ? (
                  digerMalzemeler.items.map(m => {
                    const oInput = malzemeInputs[m.id] || {};
                    const unit = (oInput.unit_price) ?? getApiUnitPrice(m);
                    const isOlculu = m.hesaplama_turu === 'olculu';

                    return (
                      <div key={m.id} className="border border-border rounded-2xl p-4 bg-card shadow-sm grid gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-base font-semibold break-words">{m.diger_malzeme_isim}</div>
                          <span className="badge badge-outline whitespace-nowrap">
                            {isOlculu ? "Ölçülü" : "Adetli"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-sm opacity-70">Adet</div>
                            <input
                              type="number"
                              className="input input-sm input-bordered w-full"
                              value={oInput.count || ''}
                              onChange={e =>
                                setMalzemeInputs(prev => ({
                                  ...prev,
                                  [m.id]: { ...(prev[m.id] || {}), count: e.target.value }
                                }))
                              }
                            />
                          </div>

                          <div>
                            <div className="text-sm opacity-70">Kesim Ölçüsü</div>
                            {isOlculu ? (
                              <input
                                type="number"
                                className="input input-sm input-bordered w-full"
                                placeholder="mm"
                                value={oInput.size_input_text || ''}
                                onChange={e =>
                                  setMalzemeInputs(prev => ({
                                    ...prev,
                                    [m.id]: { ...(prev[m.id] || {}), size_input_text: e.target.value }
                                  }))
                                }
                              />
                            ) : (
                              <div className="text-sm text-muted-foreground mt-2">Adetli Malzeme</div>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm opacity-70 mb-1">Birim Fiyat</div>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              className="input input-sm input-bordered w-full"
                              value={unit}
                              onChange={(e) =>
                                setMalzemeInputs(prev => ({
                                  ...prev,
                                  [m.id]: { ...(prev[m.id] || {}), unit_price: e.target.value }
                                }))
                              }
                            />
                            <AppButton
                              variant="gri"
                              size="sm"
                              shape="none"
                              onClick={() =>
                                setMalzemeInputs(prev => ({
                                  ...prev,
                                  [m.id]: { ...(prev[m.id] || {}), unit_price: getApiUnitPrice(m) }
                                }))
                              }
                            >
                              Sıfırla
                            </AppButton>
                          </div>
                        </div>

                        <AppButton
                          variant="kurumsalmavi"
                          size="md"
                          className="w-full"
                          onClick={() => onAddOther(m)}
                        >
                          Ekle
                        </AppButton>
                      </div>
                    );
                  })
                ) : (
                  <div className="border border-border rounded-2xl p-6 text-center text-muted-foreground">
                    Kayıt yok
                  </div>
                ))}
              </div>

              <Pager data={digerMalzemeler || EMPTY_PAGE} setPage={setOtherPage} />
            </div>
          )}

          {/* ================= KUMANDALAR ================= */}
          {mode === 'kumanda' && (
            <div className="w-full">
              {/* DESKTOP TABLO */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Kumanda İsmi</th>
                      <th>Adet</th>
                      <th>Birim Fiyat</th>
                      <th className="text-right">Ekle</th>
                    </tr>
                  </thead>

                  {loadingKumanda ? (
                    <tbody><tr><td colSpan={4}><Spinner /></td></tr></tbody>
                  ) : (
                    <tbody>
                      {(kumandalar.items ?? []).map(remote => (
                        <tr className="border border-border" key={remote.id}>
                          <td>{remote.kumanda_isim || remote.isim || remote.name}</td>
                          <td>
                            <input
                              type="number"
                              placeholder="Adet"
                              className="input input-sm input-bordered w-20"
                              value={kumandaInputs[remote.id]?.count || ''}
                              onChange={e =>
                                setKumandaInputs(prev => ({
                                  ...prev,
                                  [remote.id]: { ...(prev[remote.id] || {}), count: e.target.value }
                                }))
                              }
                            />
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                className="input input-sm input-bordered w-24"
                                value={kumandaUnitPrices[remote.id] ?? getApiUnitPrice(remote)}
                                onChange={(e) =>
                                  setKumandaUnitPrices(prev => ({ ...prev, [remote.id]: e.target.value }))
                                }
                              />
                              <AppButton
                                type="button"
                                variant="gri"
                                size="sm"
                                shape="none"
                                onClick={() =>
                                  setKumandaUnitPrices(prev => ({
                                    ...prev,
                                    [remote.id]: getApiUnitPrice(remote)
                                  }))
                                }
                              >
                                Sıfırla
                              </AppButton>
                            </div>
                          </td>

                          <td className="text-right">
                            <AppButton
                              variant="kurumsalmavi"
                              size="sm"
                              shape="none"
                              onClick={() => onAddRemote(remote)}
                            >
                              Ekle
                            </AppButton>
                          </td>
                        </tr>
                      ))}

                      {(!kumandalar.items || kumandalar.items.length === 0) && (
                        <tr><td colSpan={4} className="text-center text-muted-foreground py-6">Kayıt yok</td></tr>
                      )}
                    </tbody>
                  )}
                </table>
              </div>

              {/* MOBİL KARTLAR */}
              <div className="md:hidden flex flex-col gap-3">
                {loadingKumanda ? (
                  <Spinner />
                ) : (kumandalar.items?.length > 0 ? (
                  kumandalar.items.map(remote => {
                    const rInput = kumandaInputs[remote.id] || {};
                    const unit = kumandaUnitPrices[remote.id] ?? getApiUnitPrice(remote);
                    const label = remote.kumanda_isim || remote.isim || remote.name;

                    return (
                      <div key={remote.id} className="border border-border rounded-2xl p-4 bg-card shadow-sm grid gap-3">
                        <div className="text-base font-semibold break-words">{label}</div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-sm opacity-70">Adet</div>
                            <input
                              type="number"
                              className="input input-sm input-bordered w-full"
                              value={rInput.count || ''}
                              onChange={e =>
                                setKumandaInputs(prev => ({
                                  ...prev,
                                  [remote.id]: { ...(prev[remote.id] || {}), count: e.target.value }
                                }))
                              }
                            />
                          </div>

                          <div>
                            <div className="text-sm opacity-70 mb-1">Birim Fiyat</div>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                className="input input-sm input-bordered w-full"
                                value={unit}
                                onChange={(e) =>
                                  setKumandaUnitPrices(prev => ({ ...prev, [remote.id]: e.target.value }))
                                }
                              />
                              <AppButton
                                variant="gri"
                                size="sm"
                                shape="none"
                                onClick={() =>
                                  setKumandaUnitPrices(prev => ({ ...prev, [remote.id]: getApiUnitPrice(remote) }))
                                }
                              >
                                Sıfırla
                              </AppButton>
                            </div>
                          </div>
                        </div>

                        <AppButton
                          variant="kurumsalmavi"
                          size="md"
                          className="w-full"
                          onClick={() => onAddRemote(remote)}
                        >
                          Ekle
                        </AppButton>
                      </div>
                    );
                  })
                ) : (
                  <div className="border border-border rounded-2xl p-6 text-center text-muted-foreground">
                    Kayıt yok
                  </div>
                ))}
              </div>

              <Pager data={kumandalar || EMPTY_PAGE} setPage={setKumandaPage} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EkstraMalzemeEkle;
