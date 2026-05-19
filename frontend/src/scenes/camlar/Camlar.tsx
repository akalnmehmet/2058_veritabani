// src/scenes/camlar/Camlar.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCamlarFromApi, addCamToApi, editCamOnApi, sellCamOnApi } from "@/redux/actions/actions_camlar";
import Header from "@/components/mycomponents/Header";
import AppButton from "@/components/ui/AppButton";
import { useModal } from "@/shared/modals/ModalProvider";
import { useConfirm } from "@/shared/modals/ConfirmProvider";

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

const Camlar = () => {
  const dispatch = useDispatch();
  const { openModal } = useModal();
  const confirm = useConfirm();

  const data = useSelector((state: any) => state.getCamlarFromApiReducer) || EMPTY_PAGE;

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(10);

  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    dispatch(getCamlarFromApi(currentPage, searchTerm, safeLimit)).finally(() => setIsLoading(false));
  }, [dispatch, currentPage, searchTerm, limit]);

  const onSearchChange = (e: any) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const onLimitChange = (e: any) => {
    const raw = parseInt(e.target.value, 10);
    const clamped = isNaN(raw) ? 10 : Math.min(50, Math.max(1, raw));
    setLimit(clamped);
    setCurrentPage(1);
  };

  const handleAddCam = useCallback(
    async (row: any) => {
      setIsLoading(true);
      try {
        await dispatch(
          addCamToApi({
            cam_isim: row.cam_isim,
            thickness_mm: row.thickness_mm,
            belirtec_1: Number(row.belirtec_1) || 0,
            belirtec_2: Number(row.thickness_mm) === 2 ? Number(row.belirtec_2) || 0 : 0,
          })
        );

        const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
        await dispatch(getCamlarFromApi(currentPage, searchTerm, safeLimit));
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, currentPage, searchTerm, limit]
  );

  const handleEditCam = useCallback(
    async (row: any) => {
      setIsLoading(true);
      try {
        await dispatch(
          editCamOnApi(row.id, {
            cam_isim: row.cam_isim,
            thickness_mm: row.thickness_mm,
            belirtec_1: Number(row.belirtec_1) || 0,
            belirtec_2: Number(row.thickness_mm) === 2 ? Number(row.belirtec_2) || 0 : 0,
          })
        );

        const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
        await dispatch(getCamlarFromApi(currentPage, searchTerm, safeLimit));
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, currentPage, searchTerm, limit]
  );

  const openCreate = () => {
    openModal("cam.upsert", {
      mode: "create",
      onSave: async (payload: any) => {
        await handleAddCam(payload);
      },
    });
  };

  const openEdit = (cam: any) => {
    openModal("cam.upsert", {
      mode: "edit",
      cam,
      onSave: async (payload: any) => {
        await handleEditCam(payload);
      },
    });
  };

  const askDelete = async (cam: any) => {
    if (!cam?.id) return;
    if (deletingId != null) return;

    const ok = await confirm({
      title: "Silmek istediğinize emin misiniz?",
      description: `'${cam.cam_isim}' silinecek. Bu işlem geri alınamaz.`,
      confirmText: "Evet, sil",
      cancelText: "Vazgeç",
      confirmVariant: "kirmizi",
    });

    if (!ok) return;

    try {
      setDeletingId(cam.id);
      await dispatch(sellCamOnApi(cam.id));
      const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
      await dispatch(getCamlarFromApi(currentPage, searchTerm, safeLimit));
    } finally {
      setDeletingId(null);
    }
  };

  const camTuru = (v: any) => {
    if (Number(v) === 1) return "Tek Cam";
    if (Number(v) === 2) return "Çift Cam";
    return "—";
  };

  const totalPages = data.total_pages || 1;

  return (
    <div className="grid grid-rows-[60px_1fr] min-h-screen">
      <Header title="Camlar" />

      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col gap-y-4 text-foreground">
        {/* ÜST ARAÇ ÇUBUĞU (GLASSMORPHISM) */}
        <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 justify-between shadow-sm">
          <div className="relative w-full md:max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cam ismine göre ara..."
              value={searchTerm}
              onChange={onSearchChange}
              className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto md:ml-4">
            <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto bg-background/40 px-3 py-2 rounded-xl border border-border/50">
              <label className="text-sm opacity-80 whitespace-nowrap">Kayıt/Sayfa:</label>
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

            <div className="w-full md:w-auto md:ml-auto">
              <AppButton shape="md" variant="kurumsalmavi" size="mdtxtlg" className="w-full md:w-44 shadow-sm" onClick={openCreate}>
                + Cam Ekle
              </AppButton>
            </div>
          </div>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <div className="hidden md:block flex-grow overflow-x-auto rounded-xl border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border/50">
                  <tr>
                    <th className="px-4 py-4 font-semibold tracking-wider">Cam İsmi</th>
                    <th className="px-4 py-4 font-semibold tracking-wider text-center">Cam Türü</th>
                    <th className="px-4 py-4 font-semibold tracking-wider text-center">İşlemler</th>
                  </tr>
                </thead>

                <tbody>
                  {data.items?.length > 0 ? (
                    data.items.map((cam: any) => {
                      const isDeleting = deletingId === cam.id;
                      return (
                        <tr key={cam.id} className="border-b border-border/50 hover:bg-secondary/40 transition-colors group">
                          <td className="px-4 py-3.5 font-bold text-primary/90">{cam.cam_isim}</td>
                          <td className="px-4 py-3.5 text-center">{camTuru(cam.thickness_mm)}</td>
                          <td className="px-4 py-3.5 text-center space-x-2">
                            <AppButton variant="sari" size="sm" shape="md" onClick={() => openEdit(cam)}>
                              Düzenle
                            </AppButton>

                            <AppButton
                              variant="kirmizi"
                              size="sm"
                              shape="md"
                              onClick={() => askDelete(cam)}
                              disabled={isDeleting}
                              loading={isDeleting}
                            >
                              Sil
                            </AppButton>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center text-muted-foreground py-10">
                        Veri bulunamadı
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden flex flex-col gap-3">
              {data.items?.length > 0 ? (
                data.items.map((cam: any) => {
                  const isDeleting = deletingId === cam.id;
                  return (
                    <div
                      key={cam.id}
                      className="border border-border rounded-2xl p-4 bg-card shadow-sm flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-base font-semibold break-words">{cam.cam_isim}</div>
                        <span className="badge badge-outline whitespace-nowrap">{camTuru(cam.thickness_mm)}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <AppButton shape="md" variant="sari" size="md" className="w-full" onClick={() => openEdit(cam)}>
                          Düzenle
                        </AppButton>

                        <AppButton shape="md"
                          variant="kirmizi"
                          size="md"
                          className="w-full"
                          onClick={() => askDelete(cam)}
                          disabled={isDeleting}
                          loading={isDeleting}
                        >
                          Sil
                        </AppButton>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="border border-border rounded-2xl p-6 text-center text-muted-foreground">
                  Veri bulunamadı
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-4">
              <AppButton
                variant="kurumsalmavi"
                size="sm"
                shape="md"
                onClick={() => setCurrentPage(1)}
                disabled={data.page === 1}
              >
                « İlk
              </AppButton>

              <AppButton
                variant="kurumsalmavi"
                size="sm"
                shape="md"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={!data.has_prev}
              >
                ‹ Önceki
              </AppButton>

              <form
                onSubmit={(e: any) => {
                  e.preventDefault();
                  const val = parseInt(e.target.elements.pageNum.value, 10);
                  if (!isNaN(val) && val >= 1 && val <= totalPages) setCurrentPage(val);
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={!data.has_next}
              >
                Sonraki ›
              </AppButton>

              <AppButton
                variant="kurumsalmavi"
                size="sm"
                shape="md"
                onClick={() => setCurrentPage(totalPages)}
                disabled={data.page === totalPages || totalPages <= 1}
              >
                Son »
              </AppButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Camlar;
