// Path: @/scenes/bayiler/Bayiler.tsx
// Path Alias: src/scenes/bayiler/Bayiler.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getDealersFromApi,
  addDealerOnApi,
  editDealerOnApi,
  sellDealerOnApi,
  getDealerInviteLinkOnApi,
  adminSetupDealerOnApi,          // ✅ yeni
} from "@/redux/actions/actions_bayiler";
import Header from '@/components/mycomponents/Header';
import DialogBayiEkle from './DialogBayiEkle';
import DialogBayiDuzenle from './DialogBayiDuzenle';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import AppButton from '@/components/ui/AppButton';
import DialogResendInvite from "./DialogResendInvite";
import DialogAdminSetup from "./DialogAdminSetup";   // ✅ yeni

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
  has_prev: false
};

const Bayiler = () => {
  const dispatch = useDispatch();

  const data = useSelector(s => s.getBayilerFromApiReducer) || EMPTY_PAGE;

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(false);

  const [limit, setLimit] = useState(10);

  // ✅ Resend modal state (dealer seçimi + link)
  const [resendOpen, setResendOpen] = useState(false);
  const [resendDealer, setResendDealer] = useState(null);

  // ✅ Admin setup modal state
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminDealer, setAdminDealer] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Tekrar Davet Gönder — modal aç
  const openResendModal = useCallback((bayi) => {
    setResendDealer(bayi);
    setResendOpen(true);
  }, []);

  // modal submit: sendEmailFlag ile API çağır
  const submitResendInvite = useCallback(async (sendEmail) => {
    if (!resendDealer?.id) return "";
    const res = await dispatch(getDealerInviteLinkOnApi(resendDealer.id, !!sendEmail));
    const link = res?.invite_link || res?.link || "";
    return link;
  }, [dispatch, resendDealer]);

  // Kullanıcı Oluştur — modal aç
  const openAdminSetup = useCallback((bayi) => {
    setAdminDealer(bayi);
    setAdminOpen(true);
  }, []);

  // Admin setup submit
  const submitAdminSetup = useCallback(async (payload) => {
    if (!adminDealer?.id) return {};
    const res = await dispatch(adminSetupDealerOnApi(adminDealer.id, payload));
    // listeyi tazele (username dolmuş olacak)
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    await dispatch(getDealersFromApi(search, safeLimit, page));
    return res;
  }, [dispatch, adminDealer, search, limit, page]);

  useEffect(() => {
    setListLoading(true);
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    Promise
      .resolve(dispatch(getDealersFromApi(search, safeLimit, page)))
      .finally(() => setListLoading(false));
  }, [dispatch, page, search, limit]);

  const onSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const onLimitChange = (e) => {
    const raw = parseInt(e.target.value, 10);
    const clamped = isNaN(raw) ? 10 : Math.min(50, Math.max(1, raw));
    setLimit(clamped);
    setPage(1);
  };

  const handleAdd = useCallback(async (payload) => {
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    await dispatch(addDealerOnApi(payload));
    await dispatch(getDealersFromApi(search, safeLimit, page));
  }, [dispatch, page, search, limit]);

  const handleEdit = useCallback(async (bayi) => {
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    await dispatch(editDealerOnApi(bayi.id, {
      name: bayi.name,
      email: bayi.email,
      phone: bayi.phone,
      owner_name: bayi.owner_name,
      city: bayi.city,
      status: bayi.status,
    }));
    await dispatch(getDealersFromApi(search, safeLimit, page));
  }, [dispatch, page, search, limit]);

  const askDelete = (b) => {
    setPendingDelete(b);
    setDeleteOpen(true);
  };
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
      await dispatch(sellDealerOnApi(pendingDelete.id));
      await dispatch(getDealersFromApi(search, safeLimit, page));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
      setDeleteOpen(false);
    }
  };

  const totalPages = data.total_pages || 1;

  return (
    <div className="grid grid-rows-[60px_1fr]">
      <Header title="Bayiler" />

      <div className="bg-card w-full border border-border rounded-2xl p-4 sm:p-5 flex flex-col gap-y-4 text-foreground">
        {/* =========================
            ✅ ÜST TOOLBAR (Modern Tasarım)
        ========================= */}
        <div className="bg-secondary/20 backdrop-blur-md border border-border/50 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 w-full shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-4 w-full justify-between">
            {/* Arama inputu */}
            <div className="relative w-full md:max-w-md group flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                type="text"
                placeholder="Bayi ismine/maile göre ara..."
                value={search}
                onChange={onSearchChange}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
              />
            </div>

            {/* Sağ blok: Limit ve Ekle */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
              {/* Limit */}
              <div className="flex items-center gap-2 bg-background border border-border/60 rounded-xl px-3 py-1 shadow-sm h-10 w-full sm:w-auto justify-between sm:justify-start">
                <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Görünüm:
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={limit}
                  onChange={onLimitChange}
                  className="w-12 bg-transparent text-sm font-semibold text-foreground text-center outline-none"
                  title="Sayfa Başına Kayıt"
                />
              </div>

              <div className="w-full sm:w-auto flex-shrink-0">
                <DialogBayiEkle onSave={handleAdd} />
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP TABLO */}
        <div className="hidden md:block flex-grow overflow-x-auto rounded-xl border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border/50">
              <tr>
                <th className="px-4 py-4 font-semibold tracking-wider">İsim</th>
                <th className="px-4 py-4 font-semibold tracking-wider">E-posta</th>
                <th className="px-4 py-4 font-semibold tracking-wider">Telefon</th>
                <th className="px-4 py-4 font-semibold tracking-wider">Sahip</th>
                <th className="px-4 py-4 font-semibold tracking-wider">Şehir</th>
                <th className="px-4 py-4 font-semibold tracking-wider">Durum</th>
                <th className="px-4 py-4 font-semibold tracking-wider text-center">İşlemler</th>
              </tr>
            </thead>

            {listLoading ? (
              <tbody>
                <tr>
                  <td colSpan={7} className="py-10"><Spinner /></td>
                </tr>
              </tbody>
            ) : (data.items ?? []).length > 0 ? (
              <tbody>
                {data.items.map(b => {
                  const isActive = b.status === 'active';
                  const missingAdmin = !b.username; // ✅ R3.1
                  return (
                    <tr key={b.id} className="border-b border-border/50 hover:bg-secondary/40 transition-colors group">
                      <td className="px-4 py-3.5 font-bold text-primary/90">{b.name || '—'}</td>
                      <td className="px-4 py-3.5 text-foreground/90">{b.email || '—'}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{b.phone || '—'}</td>
                      <td className="px-4 py-3.5 font-medium">{b.owner_name || '—'}</td>
                      <td className="px-4 py-3.5 text-foreground/80">{b.city || '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          isActive 
                            ? 'border-emerald-500/50 text-emerald-600 bg-emerald-500/10' 
                            : 'border-amber-500/40 text-amber-600 bg-amber-500/10'
                        }`}>
                          {isActive ? "Aktif" : "Davet Edildi"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex gap-2 justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                          {/* ✅ R2: modal aç */}
                          <AppButton
                            onClick={() => openResendModal(b)}
                            disabled={isActive}
                            variant="koyumavi"
                            size="sm"
                            shape="md"
                            title={isActive ? "Aktif bayiye davet gönderilemez" : "Davet oluştur / tekrar gönder"}
                            className="shadow-sm hover:shadow-md transition-shadow"
                          >
                            Tekrar Davet Gönder
                          </AppButton>

                          {/* ✅ R3: Kullanıcı Oluştur */}
                          {missingAdmin && (
                            <AppButton
                              onClick={() => openAdminSetup(b)}
                              variant="sari"
                              size="sm"
                              shape="md"
                              title="Bayi admin kullanıcı bilgilerini oluştur"
                              className="shadow-sm hover:shadow-md transition-shadow"
                            >
                              Kullanıcı Oluştur
                            </AppButton>
                          )}

                          <DialogBayiDuzenle bayi={b} onSave={handleEdit} />

                          <AppButton
                            onClick={() => askDelete(b)}
                            variant="kirmizi"
                            size="sm"
                            shape="md"
                            title="Bayiyi sil"
                            className="shadow-sm hover:shadow-md transition-shadow"
                          >
                            Sil
                          </AppButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={7} className="text-center text-muted-foreground py-10">
                    Gösterilecek bayi bulunamadı.
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        {/* MOBİL KART */}
        <div className="md:hidden flex flex-col gap-3">
          {listLoading ? (
            <div className="border border-border rounded-2xl bg-card">
              <Spinner />
            </div>
          ) : (data.items ?? []).length > 0 ? (
            data.items.map(b => {
              const isActive = b.status === "active";
              const missingAdmin = !b.username;
              return (
                <div
                  key={b.id}
                  className="
                    border border-border rounded-2xl p-4
                    bg-card shadow-sm
                    flex flex-col gap-3
                  "
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-base font-semibold truncate">{b.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{b.email}</div>
                    </div>

                    <span
                      className={[
                        "px-2 py-1 text-xs rounded-full border whitespace-nowrap",
                        isActive
                          ? "border-emerald-500/50 text-emerald-600 bg-emerald-500/10"
                          : "border-amber-500/40 text-amber-600 bg-amber-500/10"
                      ].join(" ")}
                    >
                      {isActive ? "Aktif" : "Davet Edildi"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Telefon</span>
                      <span className="font-medium">{b.phone || "—"}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Sahip</span>
                      <span className="font-medium">{b.owner_name || "—"}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Şehir</span>
                      <span className="font-medium">{b.city || "—"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    <AppButton
                      onClick={() => openResendModal(b)}
                      disabled={isActive}
                      variant="koyumavi"
                      size="md"
                      className="w-full"
                      title={isActive ? "Aktif bayiye davet gönderilemez" : "Davet oluştur / tekrar gönder"}
                    >
                      Tekrar Davet Gönder
                    </AppButton>

                    {missingAdmin && (
                      <AppButton
                        onClick={() => openAdminSetup(b)}
                        variant="sari"
                        size="md"
                        className="w-full"
                        title="Bayi admin kullanıcı bilgilerini oluştur"
                      >
                        Kullanıcı Oluştur
                      </AppButton>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <DialogBayiDuzenle bayi={b} onSave={handleEdit}>
                        <AppButton variant="sari" size="md" className="w-full">
                          Düzenle
                        </AppButton>
                      </DialogBayiDuzenle>

                      <AppButton
                        onClick={() => askDelete(b)}
                        variant="kirmizi"
                        size="md"
                        className="w-full"
                        title="Bayiyi sil"
                      >
                        Sil
                      </AppButton>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="border border-border rounded-2xl p-6 text-center text-muted-foreground">
              Gösterilecek bayi bulunamadı.
            </div>
          )}
        </div>

        {/* Sayfalama */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-2 sm:mt-4">
          <AppButton
            variant="kurumsalmavi"
            size="sm"
            shape="md"
            onClick={() => setPage(1)}
            disabled={data.page === 1}
            title="İlk sayfa"
          >
            « İlk
          </AppButton>

          <AppButton
            variant="kurumsalmavi"
            size="sm"
            shape="md"
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={!data.has_prev}
            title="Önceki sayfa"
          >
            ‹ Önceki
          </AppButton>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              // @ts-ignore
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
              value={page}
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
            shape="md"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={!data.has_next}
            title="Sonraki sayfa"
          >
            Sonraki ›
          </AppButton>

          <AppButton
            variant="kurumsalmavi"
            size="sm"
            shape="md"
            onClick={() => setPage(totalPages)}
            disabled={data.page === totalPages || totalPages <= 1}
            title="Son sayfa"
          >
            Son »
          </AppButton>
        </div>
      </div>

      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Bayiyi silmek istediğinize emin misiniz?"
        description={pendingDelete ? `'${pendingDelete.name}' silinecek. Bu işlem geri alınamaz.` : ""}
        confirmText="Evet, sil"
        cancelText="Vazgeç"
        onConfirm={confirmDelete}
        loading={deleting}
      />

      {/* ✅ R2 modal */}
      <DialogResendInvite
        open={resendOpen}
        onOpenChange={setResendOpen}
        dealer={resendDealer}
        onSubmit={submitResendInvite}
      />

      {/* ✅ R3 modal */}
      <DialogAdminSetup
        open={adminOpen}
        onOpenChange={setAdminOpen}
        dealer={adminDealer}
        onSubmit={submitAdminSetup}
      />
    </div>
  );
};

export default Bayiler;
