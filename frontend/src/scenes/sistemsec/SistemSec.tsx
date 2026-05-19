// Path: @/scenes/sistemsec/SistemSec.tsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

import {
  getSistemlerFromApi,
  getSystemVariantsOfSystemFromApi,
  getSystemImageFromApi,
  getSystemVariantImageFromApi,
} from '@/redux/actions/actions_sistemler';
import AppButton from "@/components/ui/AppButton";

/** Spinner (temalı) */
const Spinner = () => (
  <div className="flex justify-center items-center py-10 w-full">
    <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin"></div>
  </div>
);

const MiniSpinner = () => (
  <div className="flex justify-center items-center w-full h-40">
    <div className="w-6 h-6 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin"></div>
  </div>
);

const SistemSec = () => {
  const dispatch = useDispatch();
  const { projectId } = useParams();
  const navigate = useNavigate();

  // --- Listeler (fotoğraflar hariç) ---
  const sistemler = useSelector(state => state.getSistemlerFromApiReducer);
  const systemVariants = useSelector(state => state.systemVariantsOfSystem);

  // --- FOTOĞRAF CACHE (sadece component içinde) ---
  const [sysImageUrls, setSysImageUrls] = useState({});
  const [varImageUrls, setVarImageUrls] = useState({});

  const sysImgPromisesRef = useRef(new Map());
  const varImgPromisesRef = useRef(new Map());

  const sysObjUrlsRef = useRef(new Set());
  const varObjUrlsRef = useRef(new Set());

  // --- UI seçim/yükleme durumları ---
  const [selectedSistemId, setSelectedSistemId] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [loadingSystems, setLoadingSystems] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [sysImgLoading, setSysImgLoading] = useState({});
  const [varImgLoading, setVarImgLoading] = useState({});

  // 1) İlk yüklemede tüm sistemleri getir
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingSystems(true);
        await dispatch(getSistemlerFromApi(1, "", "all"));
      } finally {
        if (mounted) setLoadingSystems(false);
      }
    })();
    return () => { mounted = false; };
  }, [dispatch]);

  // --- SIRALAMALAR (sort_index’e göre) ---
  const sortedSystems = useMemo(() => {
    const arr = Array.isArray(sistemler?.items) ? [...sistemler.items] : [];
    return arr.sort((a, b) => Number(a?.sort_index ?? 0) - Number(b?.sort_index ?? 0));
  }, [sistemler?.items]);

  const sortedVariants = useMemo(() => {
    const arr = Array.isArray(systemVariants?.items) ? [...systemVariants.items] : [];
    return arr.sort((a, b) => Number(a?.sort_index ?? 0) - Number(b?.sort_index ?? 0));
  }, [systemVariants?.items]);

  // --- AKTİF FİLTRELER ---
  const activeSortedSystems = useMemo(() => {
    return sortedSystems.filter(s => s?.is_active !== false);
  }, [sortedSystems]);

  const activeSortedVariants = useMemo(() => {
    return sortedVariants.filter(v => v?.is_active !== false);
  }, [sortedVariants]);

  // --- Sistem foto GET: her id için sadece 1 kez ---
  const fetchSystemImageOnce = useCallback(async (systemId) => {
    if (sysImgPromisesRef.current.has(systemId)) {
      return sysImgPromisesRef.current.get(systemId);
    }
    if (sysImageUrls[systemId]) return;

    setSysImgLoading(prev => ({ ...prev, [systemId]: true }));

    const p = (async () => {
      try {
        const res = await dispatch(getSystemImageFromApi(systemId));
        if (res?.imageUrl) {
          sysObjUrlsRef.current.add(res.imageUrl);
          setSysImageUrls(prev => ({ ...prev, [systemId]: res.imageUrl }));
        }
      } catch {
        // foto yoksa sessiz geç
      } finally {
        setSysImgLoading(prev => ({ ...prev, [systemId]: false }));
        sysImgPromisesRef.current.delete(systemId);
      }
    })();

    sysImgPromisesRef.current.set(systemId, p);
    return p;
  }, [dispatch, sysImageUrls]);

  // Sistemler değişince eksik görselleri getir
  useEffect(() => {
    const items = activeSortedSystems || [];
    if (!items.length) return;
    items.forEach(s => {
      if (!sysImageUrls[s.id]) fetchSystemImageOnce(s.id);
    });
  }, [activeSortedSystems, sysImageUrls, fetchSystemImageOnce]);

  // 2) Sistem seçilince varyantları getir
  const handleSystemSelect = useCallback(async (sistemId) => {
    setSelectedSistemId(sistemId);
    setSelectedVariantId(null);
    try {
      setLoadingVariants(true);
      await dispatch(getSystemVariantsOfSystemFromApi(sistemId));
    } finally {
      setLoadingVariants(false);
    }
  }, [dispatch]);

  const fetchVariantImageOnce = useCallback(async (variantId) => {
    if (varImgPromisesRef.current.has(variantId)) {
      return varImgPromisesRef.current.get(variantId);
    }
    if (varImageUrls[variantId]) return;

    setVarImgLoading(prev => ({ ...prev, [variantId]: true }));

    const p = (async () => {
      try {
        const res = await dispatch(getSystemVariantImageFromApi(variantId));
        if (res?.imageUrl) {
          varObjUrlsRef.current.add(res.imageUrl);
          setVarImageUrls(prev => ({ ...prev, [variantId]: res.imageUrl }));
        }
      } catch {
        // foto yoksa sessiz geç
      } finally {
        setVarImgLoading(prev => ({ ...prev, [variantId]: false }));
        varImgPromisesRef.current.delete(variantId);
      }
    })();

    varImgPromisesRef.current.set(variantId, p);
    return p;
  }, [dispatch, varImageUrls]);

  // Varyant listesi değişince eksik görselleri getir
  useEffect(() => {
    const vItems = activeSortedVariants || [];
    if (!vItems.length) return;
    vItems.forEach(v => {
      if (!varImageUrls[v.id]) fetchVariantImageOnce(v.id);
    });
  }, [activeSortedVariants, varImageUrls, fetchVariantImageOnce]);

  // 3) Variant seçimi → yönlendirme
  const handleVariantSelect = useCallback((variantId) => {
    setSelectedVariantId(variantId);
    navigate(`/sistemekle/${projectId}/${variantId}`);
  }, [navigate, projectId]);

  // 4) ObjectURL temizliği
  useEffect(() => {
    return () => {
      sysObjUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      varObjUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      sysObjUrlsRef.current.clear();
      varObjUrlsRef.current.clear();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-3 sm:p-5">
      {/* Üst bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Sistem Seç</h1>

        <AppButton
          variant="gri"
          className="sm:ml-auto w-full sm:w-auto"
          onClick={() => navigate(`/projeduzenle/${projectId}`)}
        >
          Projeye Dön
        </AppButton>
      </div>

      <div className="bg-card border border-border rounded-2xl w-full min-h-[300px] p-3 sm:p-5">
        {/* Sistemler Bölümü */}
        <section>
          {loadingSystems ? (
            <Spinner />
          ) : !activeSortedSystems.length ? (
            <div className="text-muted-foreground">Hiç aktif Sistem bulunmuyor</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {activeSortedSystems.map((sistem) => {
                const imgUrl = sysImageUrls[sistem.id] || '/placeholder-system.png';
                const isSysLoading = !!sysImgLoading[sistem.id];
                const selected = selectedSistemId === sistem.id;

                return (
                  <div
                    key={sistem.id}
                    className={`bg-card rounded-2xl border p-3 sm:p-4 flex flex-col transition-all
                      ${selected ? 'border-primary shadow-lg' : 'border-border hover:shadow-md'}`}
                  >
                    {/* Sistem Fotoğrafı */}
                    <div className="w-full aspect-video bg-muted/10 rounded-xl border border-border overflow-hidden flex items-center justify-center">
                      {isSysLoading ? (
                        <MiniSpinner />
                      ) : (
                        <img
                          src={imgUrl}
                          alt={sistem.name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-semibold mt-3 text-center line-clamp-2">
                      {sistem.name}
                    </h3>

                    <AppButton
                      className="mt-3 w-full"
                      variant="kurumsalmavi"
                      onClick={() => handleSystemSelect(sistem.id)}
                    >
                      Seç
                    </AppButton>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Variant’lar Bölümü */}
        {selectedSistemId && (
          <section className="mt-6 sm:mt-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
              Alt Sistem Seç
            </h2>

            {loadingVariants ? (
              <Spinner />
            ) : activeSortedVariants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {activeSortedVariants.map((variant) => {
                  const vImgUrl = varImageUrls[variant.id] || '/placeholder-variant.png';
                  const isVarLoading = !!varImgLoading[variant.id];
                  const selected = selectedVariantId === variant.id;

                  return (
                    <div
                      key={variant.id}
                      className={`bg-card rounded-2xl border p-3 sm:p-4 flex flex-col transition-all
                        ${selected ? 'border-success shadow-lg' : 'border-border hover:shadow-md'}`}
                    >
                      {/* Variant Fotoğrafı */}
                      <div className="w-full aspect-video bg-muted/10 rounded-xl border border-border overflow-hidden flex items-center justify-center">
                        {isVarLoading ? (
                          <MiniSpinner />
                        ) : (
                          <img
                            src={vImgUrl}
                            alt={variant.name}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg mt-3 font-medium text-center line-clamp-2">
                        {variant.name}
                      </h3>

                      <AppButton
                        className="mt-3 w-full"
                        variant="kurumsalmavi"
                        onClick={() => handleVariantSelect(variant.id)}
                      >
                        Seç
                      </AppButton>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Bu sisteme ait aktif alt sistem bulunmuyor.
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default SistemSec;
