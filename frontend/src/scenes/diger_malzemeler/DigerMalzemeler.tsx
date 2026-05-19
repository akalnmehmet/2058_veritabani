// src/scenes/diger_malzemeler/DigerMalzemeler.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getDigerMalzemelerFromApi,
  addDigerMalzemeToApi,
  editDigerMalzemeOnApi,
  sellDigerMalzemeOnApi,
} from "@/redux/actions/actions_diger_malzemeler";
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

const DigerMalzemeler = () => {
  const dispatch = useDispatch();
  const { openModal } = useModal();
  const confirm = useConfirm();

  const data = useSelector((state: any) => state.getDigerMalzemelerFromApiReducer) || EMPTY_PAGE;

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(10);

  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    dispatch(getDigerMalzemelerFromApi(currentPage, searchTerm, safeLimit)).finally(() => setIsLoading(false));
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

  const handleAddItem = useCallback(
    async (row: any) => {
      setIsLoading(true);
      try {
        await dispatch(addDigerMalzemeToApi(row));
        const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
        await dispatch(getDigerMalzemelerFromApi(currentPage, searchTerm, safeLimit));
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, currentPage, searchTerm, limit]
  );

  const handleEditItem = useCallback(
    async (row: any) => {
      setIsLoading(true);
      try {
        await dispatch(
          editDigerMalzemeOnApi(row.id, {
            diger_malzeme_isim: row.diger_malzeme_isim,
            birim: row.birim,
            birim_agirlik: row.birim_agirlik,
            hesaplama_turu: row.hesaplama_turu,
            unit_price: row.unit_price,
          })
        );
        const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
        await dispatch(getDigerMalzemelerFromApi(currentPage, searchTerm, safeLimit));
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, currentPage, searchTerm, limit]
  );

  const openCreate = () => {
    openModal("digerMalzeme.upsert", {
      mode: "create",
      onSave: async (payload: any) => {
        await handleAddItem(payload);
      },
    });
  };

  const openEdit = (item: any) => {
    openModal("digerMalzeme.upsert", {
      mode: "edit",
      item,
      onSave: async (payload: any) => {
        await handleEditItem(payload);
      },
    });
  };

  const askDelete = async (item: any) => {
    if (!item?.id) return;
    if (deletingId != null) return;

    const ok = await confirm({
      title: "Silmek istediğinize emin misiniz?",
      description: `'${item.diger_malzeme_isim}' silinecek. Bu işlem geri alınamaz.`,
      confirmText: "Evet, sil",
      cancelText: "Vazgeç",
      confirmVariant: "kirmizi",
    });

    if (!ok) return;

    try {
      setDeletingId(item.id);
      await dispatch(sellDigerMalzemeOnApi(item.id));
      const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
      await dispatch(getDigerMalzemelerFromApi(currentPage, searchTerm, safeLimit));
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = data.total_pages || 1;
  const hesaplamaLabel = (t: any) => (t === "adetli" ? "Adetli" : "Ölçülü");

  return (
    <div className="grid grid-rows-[60px_1fr] min-h-screen">
      <Header title="Diğer Malzemeler" />

      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col gap-y-4 text-foreground">
        {/* ÜST ARAÇ ÇUBUĞU (GLASSMORPHISM) */}
        <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 justify-between shadow-sm">
          <div className="relative w-full md:max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Malzeme adına göre ara..."
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
              <AppButton shape="md" variant="kurumsalmavi" size="mdtxtlg" className="w-full md:w-52 shadow-sm" onClick={openCreate}>
                + Malzeme Ekle
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
                    <th className="px-4 py-4 font-semibold tracking-wider">İsim</th>
                    <th className="px-4 py-4 font-semibold tracking-wider">Birim</th>
                    <th className="px-4 py-4 font-semibold tracking-wider">Birim Ağırlık</th>
                    <th className="px-4 py-4 font-semibold tracking-wider">Birim Fiyat</th>
                    <th className="px-4 py-4 font-semibold tracking-wider">Hesaplama Türü</th>
                    <th className="px-4 py-4 font-semibold tracking-wider text-center">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items?.length > 0 ? (
                    data.items.map((item: any) => {
                      const isDeleting = deletingId === item.id;
                      return (
                        <tr key={item.id} className="border-b border-border/50 hover:bg-secondary/40 transition-colors group">
                          <td className="px-4 py-3.5 font-bold text-primary/90">{item.diger_malzeme_isim}</td>
                          <td className="px-4 py-3.5">{item.birim}</td>
                          <td className="px-4 py-3.5">{item.birim_agirlik}</td>
                          <td className="px-4 py-3.5">{item.unit_price}</td>
                          <td className="px-4 py-3.5">{item.hesaplama_turu}</td>
                          <td className="px-4 py-3.5 text-center space-x-2">
                            <AppButton variant="sari" size="sm" shape="md" onClick={() => openEdit(item)}>
                              Düzenle
                            </AppButton>

                            <AppButton
                              variant="kirmizi"
                              size="sm"
                              shape="md"
                              onClick={() => askDelete(item)}
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
                      <td colSpan={6} className="text-center text-muted-foreground py-10">
                        Veri bulunamadı
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden flex flex-col gap-3">
              {data.items?.length > 0 ? (
                data.items.map((item: any) => {
                  const isDeleting = deletingId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="border border-border rounded-2xl p-4 bg-card shadow-sm flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-base font-semibold break-words">{item.diger_malzeme_isim}</div>
                        <span className="badge badge-outline whitespace-nowrap">{hesaplamaLabel(item.hesaplama_turu)}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-lg border border-border p-2 bg-muted/20">
                          <div className="text-xs text-muted-foreground">Birim</div>
                          <div className="font-medium break-words">{item.birim || "—"}</div>
                        </div>
                        <div className="rounded-lg border border-border p-2 bg-muted/20">
                          <div className="text-xs text-muted-foreground">Birim Ağırlık</div>
                          <div className="font-medium">{item.birim_agirlik ?? 0}</div>
                        </div>
                        <div className="rounded-lg border border-border p-2 bg-muted/20 col-span-2">
                          <div className="text-xs text-muted-foreground">Birim Fiyat</div>
                          <div className="font-medium">{item.unit_price ?? 0}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <AppButton shape="md" variant="sari" size="md" className="w-full" onClick={() => openEdit(item)}>
                          Düzenle
                        </AppButton>

                        <AppButton shape="md"
                          variant="kirmizi"
                          size="md"
                          className="w-full"
                          onClick={() => askDelete(item)}
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
                <div className="border border-border rounded-2xl p-6 text-center text-muted-foreground">Veri bulunamadı</div>
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

export default DigerMalzemeler;
