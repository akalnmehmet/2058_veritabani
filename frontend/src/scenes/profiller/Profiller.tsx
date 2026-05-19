// Path: @/scenes/profiller/Profiller.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getProfillerFromApi,
  addProfillerToApi,
  editProfillerOnApi,
  sellProfillerOnApi,
  getProfilImageFromApi,
  uploadProfilImageToApi,
  deleteProfilImageFromApi
} from '@/redux/actions/actions_profiller';
import DialogProfilEkle from './DialogProfilEkle';
import DialogProfilDuzenle from './DialogProfilDuzenle';
import Header from '@/components/mycomponents/Header';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import AppButton from '@/components/ui/AppButton';

const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin"></div>
  </div>
);

// Hücre için minik spinner
const CellSpinner = () => (
  <div className="inline-flex items-center justify-center w-10 h-10">
    <span className="loading loading-spinner loading-sm" />
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

const Profiller = () => {
  const dispatch = useDispatch();

  const data = useSelector(state => state.getProfillerFromApiReducer) || EMPTY_PAGE;
  const imageCache = useSelector(state => state.getProfilImageFromApiReducer) || {};

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [limit, setLimit] = useState(10);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [loadingImgIds, setLoadingImgIds] = useState(new Set());
  const [uploadingIds, setUploadingIds] = useState(new Set());
  const fileInputRefs = useRef({});
  const requestedRef = useRef(new Set());

  // Veri çek
  useEffect(() => {
    setIsLoading(true);
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    dispatch(getProfillerFromApi(currentPage, searchTerm, safeLimit))
      .finally(() => setIsLoading(false));
  }, [dispatch, currentPage, searchTerm, limit]);

  // Arama
  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Limit değişimi
  const onLimitChange = (e) => {
    const raw = parseInt(e.target.value, 10);
    const clamped = isNaN(raw) ? 10 : Math.min(50, Math.max(1, raw));
    setLimit(clamped);
    setCurrentPage(1);
  };

  // Görünen satırlar için profil kesit görselini prefetch et
  useEffect(() => {
    (data?.items ?? []).forEach((p) => {
      const entry = imageCache[p.id];
      const hasImg = (typeof entry === 'string') || !!entry?.imageData;
      const failed = !!entry?.error;
      const isLoadingImg = loadingImgIds.has(p.id);
      if (!hasImg && !failed && !isLoadingImg && !requestedRef.current.has(p.id)) {
        requestedRef.current.add(p.id);
        setLoadingImgIds(prev => new Set(prev).add(p.id));
        Promise.resolve(dispatch(getProfilImageFromApi(p.id)))
          .finally(() => {
            setLoadingImgIds(prev => {
              const next = new Set(prev);
              next.delete(p.id);
              return next;
            });
          });
      }
    });
  }, [dispatch, data?.items, imageCache, loadingImgIds]);

  // EKLE
  const handleAddProfil = useCallback(async (profil) => {
    setIsLoading(true);
    try {
      await dispatch(addProfillerToApi(profil));
      const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
      await dispatch(getProfillerFromApi(currentPage, searchTerm, safeLimit));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, currentPage, searchTerm, limit]);

  // DÜZENLE
  const handleEditProfil = useCallback(async (profil) => {
    setIsLoading(true);
    try {
      await dispatch(editProfillerOnApi(profil.id, {
        profil_kodu: profil.profil_kodu,
        profil_isim: profil.profil_isim,
        birim_agirlik: profil.birim_agirlik,
        boy_uzunluk: profil.boy_uzunluk,
        unit_price: 0
      }));
      const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
      await dispatch(getProfillerFromApi(currentPage, searchTerm, safeLimit));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, currentPage, searchTerm, limit]);

  // SİL → modal aç
  const askDelete = (profil) => {
    setPendingDelete(profil);
    setDeleteOpen(true);
  };

  // Modal onay
  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      await dispatch(sellProfillerOnApi(pendingDelete.id));
      const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
      await dispatch(getProfillerFromApi(currentPage, searchTerm, safeLimit));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
      setDeleteOpen(false);
    }
  };

  const handleClickUpload = (profilId) => {
    if (!fileInputRefs.current[profilId]) return;
    fileInputRefs.current[profilId].click();
  };

  const handleFileChange = async (profilId, e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadingIds(prev => new Set(prev).add(profilId));
    try {
      await dispatch(uploadProfilImageToApi(profilId, file));
      await dispatch(getProfilImageFromApi(profilId));
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploadingIds(prev => {
        const next = new Set(prev);
        next.delete(profilId);
        return next;
      });
    }
  };

  const totalPages = data.total_pages || 1;
  const items = data.items ?? [];

  return (
    <div className="grid grid-rows-[60px_1fr]">
      <Header title="Profiller" />

      <div className="bg-card w-full border border-border rounded-2xl p-4 sm:p-5 flex flex-col gap-y-4 text-foreground">
        {/* ÜST ARAÇ ÇUBUĞU (GLASSMORPHISM) */}
        <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 justify-between shadow-sm">
          {/* Arama */}
          <div className="relative w-full md:max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Profil kodu veya adı ile ara..."
              value={searchTerm}
              onChange={onSearchChange}
              className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>

          {/* Limit + Ekle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto md:ml-4">
            <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto bg-background/40 px-3 py-2 rounded-xl border border-border/50">
              <label className="text-xs sm:text-sm opacity-80 whitespace-nowrap">
                Kayıt/Sayfa:
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={limit}
                onChange={onLimitChange}
                className="w-16 bg-transparent text-center outline-none text-sm font-medium"
                title="Sayfa Başına Kayıt (min:1 / max:50)"
              />
            </div>

            <div className="w-full sm:w-auto sm:ml-auto">
              <DialogProfilEkle onSave={handleAddProfil} />
            </div>
          </div>
        </div>

        {/* 🔹 Desktop / tablet: Tablo görünümü (md ve üzeri) */}
        <div className="hidden md:block flex-grow overflow-x-auto rounded-xl border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border/50">
              <tr>
                <th className="px-4 py-4 font-semibold tracking-wider">Profil Kodu</th>
                <th className="px-4 py-4 font-semibold tracking-wider">Profil Adı</th>
                <th className="px-4 py-4 font-semibold tracking-wider">Kesit Fotoğraf</th>
                <th className="px-4 py-4 font-semibold tracking-wider">Birim Ağırlık</th>
                <th className="px-4 py-4 font-semibold tracking-wider">Boy Uzunluk</th>
                <th className="px-4 py-4 font-semibold tracking-wider text-center">İşlemler</th>
              </tr>
            </thead>

            {isLoading ? (
              <tbody>
                <tr>
                  <td colSpan={6}><Spinner /></td>
                </tr>
              </tbody>
            ) : items.length > 0 ? (
              <tbody>
                {items.map(profil => {
                  const entry = imageCache[profil.id];
                  const imgSrc = typeof entry === 'string' ? entry : entry?.imageData;
                  const failed = !!entry?.error;
                  const isLoadingImg = loadingImgIds.has(profil.id);

                  return (
                    <tr key={profil.id} className="border-b border-border/50 hover:bg-secondary/40 transition-colors group">
                      <td className="px-4 py-3.5 font-bold text-primary/90">{profil.profil_kodu}</td>
                      <td className="px-4 py-3.5">{profil.profil_isim}</td>
                      <td className="px-4 py-3.5">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={`${profil.profil_isim} kesit`}
                            className="h-10 w-16 object-contain border border-border/50 bg-background/50 rounded shadow-sm"
                            loading="lazy"
                          />
                        ) : failed ? (
                          <span className="opacity-60">—</span>
                        ) : isLoadingImg ? (
                          <CellSpinner />
                        ) : (
                          <span className="opacity-60">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">{profil.birim_agirlik}</td>
                      <td className="px-4 py-3.5">{profil.boy_uzunluk}</td>
                      <td className="px-4 py-3.5 text-center space-x-2">
                        <AppButton shape="md"
                          onClick={async () => {
                            try {
                              await dispatch(deleteProfilImageFromApi(profil.id));
                            } catch (err) {
                              console.error("Fotoğraf silme hatası", err);
                            }
                          }}
                          variant="gri"
                          size="sm"
                          shape="md"
                          title="Profil kesit fotoğrafını sil"
                        >
                          Fotoğraf Sil
                        </AppButton>

                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={el => { fileInputRefs.current[profil.id] = el; }}
                          onChange={(e) => handleFileChange(profil.id, e)}
                        />
                        <AppButton shape="md"
                          onClick={() => handleClickUpload(profil.id)}
                          variant="koyumavi"
                          size="sm"
                          shape="md"
                          disabled={uploadingIds.has(profil.id)}
                          title="Profil kesit fotoğrafı yükle"
                        >
                          {uploadingIds.has(profil.id) ? "Yükleniyor..." : "Fotoğraf Yükle"}
                        </AppButton>

                        <DialogProfilDuzenle profil={profil} onSave={handleEditProfil} />

                        <AppButton shape="md"
                          onClick={() => askDelete(profil)}
                          variant="kirmizi"
                          size="sm"
                          shape="md"
                          title="Profili sil"
                        >
                          Sil
                        </AppButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-muted-foreground py-10"
                  >
                    Gösterilecek profil bulunamadı.
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        {/* 🔹 Mobil: Kart görünümü (md altı) */}
        <div className="md:hidden">
          {isLoading ? (
            <Spinner />
          ) : items.length > 0 ? (
            <div className="flex flex-col gap-3">
              {items.map(profil => {
                const entry = imageCache[profil.id];
                const imgSrc = typeof entry === 'string' ? entry : entry?.imageData;
                const failed = !!entry?.error;
                const isLoadingImg = loadingImgIds.has(profil.id);
                const isUploading = uploadingIds.has(profil.id);

                return (
                  <div
                    key={profil.id}
                    className="bg-background/60 border border-border rounded-xl p-3 shadow-sm flex flex-col gap-3"
                  >
                    {/* Üst satır */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="font-semibold text-sm">
                          {profil.profil_kodu || "-"} — {profil.profil_isim || "-"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Birim Ağırlık: {profil.birim_agirlik ?? "—"} | Boy: {profil.boy_uzunluk ?? "—"}
                        </div>
                      </div>
                    </div>

                    {/* Fotoğraf alanı */}
                    <div className="flex items-center gap-3">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={`${profil.profil_isim} kesit`}
                          className="h-12 w-20 object-contain border border-gray-500 rounded"
                          loading="lazy"
                        />
                      ) : failed ? (
                        <div className="text-xs opacity-60">Fotoğraf yok</div>
                      ) : isLoadingImg ? (
                        <CellSpinner />
                      ) : (
                        <div className="text-xs opacity-60">Fotoğraf yok</div>
                      )}

                      <div className="flex gap-2 ml-auto">
                        <AppButton shape="md"
                          onClick={async () => {
                            try {
                              await dispatch(deleteProfilImageFromApi(profil.id));
                            } catch (err) {
                              console.error("Fotoğraf silme hatası", err);
                            }
                          }}
                          variant="gri"
                          size="sm"
                          shape="md"
                          title="Profil kesit fotoğrafını sil"
                        >
                          Sil
                        </AppButton>

                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={el => { fileInputRefs.current[profil.id] = el; }}
                          onChange={(e) => handleFileChange(profil.id, e)}
                        />
                        <AppButton shape="md"
                          onClick={() => handleClickUpload(profil.id)}
                          variant="koyumavi"
                          size="sm"
                          shape="md"
                          disabled={isUploading}
                          title="Profil kesit fotoğrafı yükle"
                        >
                          {isUploading ? "Yükleniyor..." : "Yükle"}
                        </AppButton>
                      </div>
                    </div>

                    {/* Alt satır: aksiyonlar */}
                    <div className="flex justify-end gap-2">
                      <DialogProfilDuzenle profil={profil} onSave={handleEditProfil} />
                      <AppButton shape="md"
                        onClick={() => askDelete(profil)}
                        variant="kirmizi"
                        size="sm"
                        shape="md"
                        title="Profili sil"
                      >
                        Sil
                      </AppButton>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8 text-sm">
              Gösterilecek profil bulunamadı.
            </div>
          )}
        </div>

        {/* Sayfalama */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center sm:justify-between items-center gap-2 sm:gap-3 mt-4">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <AppButton
              variant="kurumsalmavi"
              size="sm"
              shape="md"
              onClick={() => setCurrentPage(1)}
              disabled={data.page === 1}
              title="İlk sayfa"
            >
              « İlk
            </AppButton>

            <AppButton
              variant="kurumsalmavi"
              size="sm"
              shape="md"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={!data.has_prev}
              title="Önceki sayfa"
            >
              ‹ Önceki
            </AppButton>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = parseInt(e.currentTarget.elements.pageNum.value, 10);
                if (!isNaN(val) && val >= 1 && val <= totalPages) {
                  setCurrentPage(val);
                }
              }}
              className="flex items-center gap-1"
            >
              <input
                type="number"
                name="pageNum"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (isNaN(val)) return setCurrentPage(1);
                  setCurrentPage(Math.min(Math.max(1, val), totalPages));
                }}
                className="input input-bordered input-sm w-16 text-center"
              />
              <span className="text-sm">/ {totalPages}</span>
            </form>

            <AppButton
              variant="kurumsalmavi"
              size="sm"
              shape="md"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={!data.has_next}
              title="Sonraki sayfa"
            >
              Sonraki ›
            </AppButton>

            <AppButton
              variant="kurumsalmavi"
              size="sm"
              shape="md"
              onClick={() => setCurrentPage(totalPages)}
              disabled={data.page === totalPages || totalPages <= 1}
              title="Son sayfa"
            >
              Son »
            </AppButton>
          </div>
        </div>
      </div>

      {/* Silme Onay Modali */}
      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Silmek istediğinize emin misiniz?"
        description={
          pendingDelete
            ? `'${pendingDelete.profil_isim}' silinecek. Bu işlem geri alınamaz.`
            : ""
        }
        confirmText="Evet, sil"
        cancelText="Vazgeç"
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  );
};

export default Profiller;
