// Path: @/scenes/projeler/Projeler.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actions_projeler from "@/redux/actions/actions_projeler";
import DialogProjeEkle from './DialogProjeEkle';
import Header from '@/components/mycomponents/Header';
import { useNavigate } from 'react-router-dom';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import DialogMusteriSec from '../projeekle/DialogMusteriSec';
import AppButton from '@/components/ui/AppButton';

const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin"></div>
  </div>
);

// basit debounce hook'u
const useDebounced = (value, delay = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

const EMPTY_PAGE = {
  items: [],
  total: 0,
  page: 1,
  limit: 5,
  total_pages: 1,
  has_next: false,
  has_prev: false,
};

/** 🔽 Durum seçenekleri */
const BOYA_DURUMLAR   = ['Boya Durumu','Boyanacak', 'Boyada', 'Boyadan Geldi'];
const CAM_DURUMLAR    = ['Cam Durumu','Cam Çekildi', 'Cam Geldi', 'Cam Çekilecek'];
const URETIM_DURUMLAR = ['Üretim Durumu','Üretimde', 'Sevk Edildi'];

/** Yardımcı: "Durum Belirtilmedi" => "" (URL'e eklenmesin) */
const toParam = (label) => (
  label &&
  label !== 'Boya Durumu' &&
  label !== 'Cam Durumu' &&
  label !== 'Üretim Durumu'
    ? label
    : ""
);

/** 🔵 Durum → badge eşlemesi */
const BOYA_BADGE = {
  'Boyanacak':     'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  'Boyada':        'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  'Boyadan Geldi': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
};

const CAM_BADGE = {
  'Cam Çekilecek': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  'Cam Çekildi':   'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  'Cam Geldi':     'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
};

const URETIM_BADGE = {
  'Üretimde':   'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  'Sevk Edildi':'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

const renderBadge = (value, map) => {
  if (!value) return <span className="opacity-40 text-xs font-medium">—</span>;
  const cls = map[value];

  const base =
    "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-sm transition-all";

  if (!cls) return <span className={`${base} bg-muted text-muted-foreground border-transparent`}>{value}</span>;
  return <span className={`${base} ${cls}`}>{value}</span>;
};

/** 🔹 approval_date → sadece tarih (TR yereli) */
const formatOnlyDate = (val) => {
  if (!val) return "—";
  try {
    if (typeof val === "string") {
      const m = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) {
        const [, y, mo, d] = m;
        return `${d}/${mo}/${y}`;
      }
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) return "—";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return "—";
  }
};

const Projeler = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const data = useSelector(state => state.getProjelerFromApiReducer) || EMPTY_PAGE;

  const [isOverlayLoading, setIsOverlayLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  // 🔹 İKİ AYRI ARAMA ALANI: KOD + AD
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const debouncedCode = useDebounced(searchCode, 300);
  const debouncedName = useDebounced(searchName, 300);

  const [sortProjeler, setSortProjeler] = useState(false);
  const [sortProjelerDir, setSortProjelerDir] = useState(null);
  const [page, setPage] = useState(1);

  // 🆕 Proje sayısı (limit)
  const [limit, setLimit] = useState(10);

  // ❌ Silme modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 🟦 Tekliflere Taşı modal state
  const [moveOpen, setMoveOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState(null);
  const [moving, setMoving] = useState(false);

  // ✅ Dropdown filtre state'leri
  const [paintLabel, setPaintLabel] = useState('Boya Durumu');
  const [glassLabel, setGlassLabel] = useState('Cam Durumu');
  const [prodLabel,  setProdLabel]  = useState('Üretim Durumu');

  const paint_status      = toParam(paintLabel);
  const glass_status      = toParam(glassLabel);
  const production_status = toParam(prodLabel);

  // 🟢 Müşteri filtresi
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    setListLoading(true);
    Promise.resolve(
      dispatch(
        actions_projeler.getProjelerFromApi({
          page,
          limit: Math.min(50, Math.max(1, Number(limit) || 10)),
          name: debouncedName || "",
          code: debouncedCode || "",
          is_teklif: false,
          paint_status,
          glass_status,
          production_status,
          customer_id: selectedCustomer?.id || "",
          ...(sortProjeler === true ? { proje_sorted: true } : {}),
        })
      )
    ).finally(() => setListLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch, page, debouncedName, debouncedCode,
    paint_status, glass_status, production_status,
    selectedCustomer?.id, limit, sortProjeler
  ]);

  const onSearchName = (e) => { setSearchName(e.target.value); setPage(1); };
  const onSearchCode = (e) => { setSearchCode(e.target.value); setPage(1); };

  const onPaintChange = (e) => { setPaintLabel(e.target.value); setPage(1); };
  const onGlassChange = (e) => { setGlassLabel(e.target.value); setPage(1); };
  const onProdChange  = (e) => { setProdLabel(e.target.value);  setPage(1); };

  const onLimitChange = (e) => {
    const raw = parseInt(e.target.value, 10);
    const clamped = isNaN(raw) ? 10 : Math.min(200, Math.max(1, raw));
    setLimit(clamped);
    setPage(1);
  };

  const handleAddProje = useCallback(async (newProje) => {
    setIsOverlayLoading(true);
    const payload = {
      project_name: newProje.project_name,
      is_teklif: false
    };

    try {
      const created = await dispatch(actions_projeler.addProjeToApi(payload));
      await dispatch(actions_projeler.getProjelerFromApi({
        page,
        limit: Math.min(50, Math.max(1, Number(limit) || 10)),
        name: debouncedName || "",
        code: debouncedCode || "",
        is_teklif: false,
        paint_status,
        glass_status,
        production_status,
        customer_id: selectedCustomer?.id || "",
      }));
      const newId = created?.id || created?.data?.id;
      if (newId) navigate(`/sistemsec/${newId}`);
    } finally {
      setIsOverlayLoading(false);
    }
  }, [
    dispatch, navigate, page, debouncedName, debouncedCode,
    paint_status, glass_status, production_status,
    selectedCustomer?.id, limit
  ]);

  const askDelete = (proje) => {
    setPendingDelete(proje);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      await dispatch(actions_projeler.deleteProjeOnApi(pendingDelete.id));
      await dispatch(actions_projeler.getProjelerFromApi({
        page,
        limit: Math.min(50, Math.max(1, Number(limit) || 10)),
        name: debouncedName || "",
        code: debouncedCode || "",
        is_teklif: false,
        paint_status,
        glass_status,
        production_status,
        customer_id: selectedCustomer?.id || "",
      }));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
      setDeleteOpen(false);
    }
  };

  const askMove = (proje) => {
    setPendingMove(proje);
    setMoveOpen(true);
  };

  const handleConfirmMove = async () => {
    if (!pendingMove) return;
    try {
      setMoving(true);
      const p = pendingMove;
      const payload = {
        customer_id: p.customer_id,
        project_name: p.project_name,
        profile_color_id: p.profile_color_id,
        glass_color_id: p.glass_color_id,
        created_at: p.created_at,
        press_price: p.press_price ?? 0,
        painted_price: p.painted_price ?? 0,
        is_teklif: true,
        paint_status: p.paint_status,
        glass_status: p.glass_status,
        production_status: p.production_status,
      };
      await dispatch(actions_projeler.editProjeOnApi(p.id, payload));
      await dispatch(actions_projeler.getProjelerFromApi({
        page,
        limit: Math.min(50, Math.max(1, Number(limit) || 10)),
        name: debouncedName || "",
        code: debouncedCode || "",
        is_teklif: false,
        paint_status,
        glass_status,
        production_status,
        customer_id: selectedCustomer?.id || "",
      }));
    } finally {
      setMoving(false);
      setPendingMove(null);
      setMoveOpen(false);
    }
  };

  const items = data.items ?? [];
  const totalPages = data.total_pages || 1;
  const COL_COUNT = 8;

  return (
    // ✅ Musteriler formatı: sabit header + içerik
    <div className="grid grid-rows-[60px_1fr] min-h-screen">
      {/* Overlay loading aynı kalsın */}
      {isOverlayLoading && (
        <div className="fixed inset-0 bg-foreground/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-muted-foreground/30 border-t-primary"></div>
        </div>
      )}

      <Header title="Projeler" />

      <div className="bg-card w-full border border-border rounded-2xl p-4 sm:p-5 flex flex-col gap-y-4 text-foreground">
        {/* =========================
            ✅ ÜST TOOLBAR (Modern Tasarım)
        ========================= */}
        <div className="bg-secondary/20 backdrop-blur-md border border-border/50 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 w-full shadow-sm">
          {/* Üst Satır: Arama + Sağ Blok */}
          <div className="flex flex-col xl:flex-row xl:items-center gap-4 w-full justify-between">
            
            {/* Arama Alanları */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto flex-1">
              {/* Proje Kodu arama */}
              <div className="relative w-full sm:max-w-xs group">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input
                  type="text"
                  placeholder="Proje koduna göre ara..."
                  value={searchCode}
                  onChange={onSearchCode}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                />
              </div>

              {/* Proje Adı arama */}
              <div className="relative w-full sm:max-w-xs group">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input
                  type="text"
                  placeholder="Proje adına göre ara..."
                  value={searchName}
                  onChange={onSearchName}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Sağ blok: Müşteri + Limit + Ekle */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto shrink-0">
              {/* Müşteri seçimi */}
              <div className="flex flex-wrap items-center gap-2">
                <AppButton
                  type="button"
                  variant="gri"
                  size="sm"
                  shape="md"
                  onClick={() => setCustomerDialogOpen(true)}
                  title="Müşteriye göre filtrele"
                  className="w-full sm:w-auto h-10 px-4 rounded-xl shadow-sm border border-border/50 hover:bg-muted"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    Müşteri Seç
                  </span>
                </AppButton>

                {selectedCustomer?.id && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-xl text-sm font-medium shadow-sm">
                    <span className="truncate max-w-[150px]">
                      {selectedCustomer.company_name || selectedCustomer.name || 'Seçili müşteri'}
                    </span>
                    <button
                      className="hover:text-primary-focus transition-colors"
                      onClick={() => { setSelectedCustomer(null); setPage(1); }}
                      title="Filtreyi temizle"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Limit Input */}
              <div className="flex items-center gap-2 bg-background border border-border/60 rounded-xl px-3 py-1 shadow-sm h-10 w-full sm:w-auto justify-between sm:justify-start">
                <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Görünüm:
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={limit}
                  onChange={onLimitChange}
                  className="w-12 bg-transparent text-sm font-semibold text-foreground text-center outline-none"
                  title="Sayfa Başına Proje Sayısı"
                />
              </div>

              {/* Yeni Proje Ekle Butonu */}
              <div className="w-full sm:w-auto flex-shrink-0">
                <DialogProjeEkle onSave={handleAddProje} />
              </div>
            </div>
          </div>

          {/* Alt Satır: Durum Filtreleri */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border/50 pt-4 mt-1">
            <div className="relative group">
              <select
                value={paintLabel}
                onChange={onPaintChange}
                className="w-full pl-4 pr-10 py-2.5 appearance-none bg-background border border-border/60 hover:border-border rounded-xl text-sm font-medium text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm cursor-pointer"
                title="Boya durumuna göre filtrele"
              >
                {BOYA_DURUMLAR.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <div className="relative group">
              <select
                value={glassLabel}
                onChange={onGlassChange}
                className="w-full pl-4 pr-10 py-2.5 appearance-none bg-background border border-border/60 hover:border-border rounded-xl text-sm font-medium text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm cursor-pointer"
                title="Cam durumuna göre filtrele"
              >
                {CAM_DURUMLAR.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <div className="relative group">
              <select
                value={prodLabel}
                onChange={onProdChange}
                className="w-full pl-4 pr-10 py-2.5 appearance-none bg-background border border-border/60 hover:border-border rounded-xl text-sm font-medium text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm cursor-pointer"
                title="Üretim durumuna göre filtrele"
              >
                {URETIM_DURUMLAR.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            ✅ Desktop/Tablet TABLO (md+)
        ========================= */}
        <div className="hidden md:block flex-grow overflow-x-auto rounded-xl border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border/50">
              <tr>
                <th className="px-4 py-4 font-semibold tracking-wider">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer select-none group"
                    title="Onay tarihine göre sırala"
                    onClick={() => {
                      if (sortProjeler === false) {
                        setSortProjeler(true);
                        setSortProjelerDir(prev => (prev === "asc" ? "desc" : "asc"));
                        setPage(1);
                      } else {
                        setSortProjeler(false);
                        setSortProjelerDir(prev => (prev === "asc" ? "desc" : "asc"));
                        setPage(1);
                      }
                    }}
                  >
                    <span>Onay Tarihi</span>
                    <span className={`transition-transform duration-200 ${sortProjeler ? "text-primary" : "opacity-40 group-hover:opacity-80"}`}>
                      {sortProjelerDir === "asc" ? "▲" : "▼"}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-4 font-semibold tracking-wider">Proje Kodu</th>
                <th className="px-4 py-4 font-semibold tracking-wider">Müşteri Adı</th>
                <th className="px-4 py-4 font-semibold tracking-wider">Proje Adı</th>
                <th className="px-4 py-4 font-semibold tracking-wider">Boya Durumu</th>
                <th className="px-4 py-4 font-semibold tracking-wider">Cam Durumu</th>
                <th className="px-4 py-4 font-semibold tracking-wider">Üretim Durumu</th>
                <th className="px-4 py-4 font-semibold tracking-wider text-center">İşlemler</th>
              </tr>
            </thead>

            {listLoading ? (
              <tbody>
                <tr>
                  <td colSpan={COL_COUNT} className="py-10"><Spinner /></td>
                </tr>
              </tbody>
            ) : items.length > 0 ? (
              <tbody>
                {items.map(proje => (
                  <tr key={proje.id} className="border-b border-border/50 hover:bg-secondary/40 transition-colors group">
                    <td className="px-4 py-3.5 font-medium text-foreground/80">{formatOnlyDate(proje?.approval_date ?? proje?.requirements?.approval_date)}</td>
                    <td className="px-4 py-3.5 font-semibold text-primary/90">{proje.project_kodu}</td>
                    <td className="px-4 py-3.5 text-foreground/90">{proje.company_name || '—'}</td>
                    <td className="px-4 py-3.5 font-medium">{proje.project_name}</td>
                    <td className="px-4 py-3.5">{renderBadge(proje.paint_status, BOYA_BADGE)}</td>
                    <td className="px-4 py-3.5">{renderBadge(proje.glass_status, CAM_BADGE)}</td>
                    <td className="px-4 py-3.5">{renderBadge(proje.production_status, URETIM_BADGE)}</td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex flex-col sm:flex-row gap-2 justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                        <AppButton
                          onClick={() => askMove(proje)}
                          variant="kurumsalmavi"
                          size="sm"
                          shape="md"
                          title="Projeyi tekliflere taşı"
                          className="shadow-sm hover:shadow-md transition-shadow"
                        >
                          Tekliflere Taşı
                        </AppButton>

                        <AppButton
                          onClick={() => navigate(`/projeduzenle/${proje.id}`)}
                          variant="sari"
                          size="sm"
                          shape="md"
                          title="Projeyi düzenle"
                          className="shadow-sm hover:shadow-md transition-shadow"
                        >
                          Düzenle
                        </AppButton>

                        <AppButton
                          onClick={() => askDelete(proje)}
                          variant="kirmizi"
                          size="sm"
                          shape="md"
                          title="Projeyi sil"
                          className="shadow-sm hover:shadow-md transition-shadow"
                        >
                          Sil
                        </AppButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={COL_COUNT} className="border border-gray-500 text-center text-muted-foreground py-10">
                    Gösterilecek proje bulunamadı.
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        {/* =========================
            ✅ MOBİL KART GÖRÜNÜMÜ (md-)
        ========================= */}
        <div className="md:hidden">
          {listLoading ? (
            <Spinner />
          ) : items.length > 0 ? (
            <div className="flex flex-col gap-3">
              {items.map(proje => (
                <div
                  key={proje.id}
                  className="bg-background/60 border border-border rounded-xl p-3 shadow-sm flex flex-col gap-3"
                >
                  {/* Üst satır: proje adı + müşteri + tarih */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">
                        {proje.project_name || "—"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {proje.company_name || "Müşteri yok"} • {proje.project_kodu || "Kod yok"}
                      </div>
                    </div>

                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary/70 text-[11px] whitespace-nowrap">
                      {formatOnlyDate(proje?.approval_date ?? proje?.requirements?.approval_date)}
                    </span>
                  </div>

                  {/* Durumlar */}
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Boya</span>
                      {renderBadge(proje.paint_status, BOYA_BADGE)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Cam</span>
                      {renderBadge(proje.glass_status, CAM_BADGE)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Üretim</span>
                      {renderBadge(proje.production_status, URETIM_BADGE)}
                    </div>
                  </div>

                  {/* Aksiyonlar */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <AppButton
                      onClick={() => askMove(proje)}
                      variant="kurumsalmavi"
                      size="sm"
                      shape="md"
                      title="Projeyi tekliflere taşı"
                    >
                      Tekliflere Taşı
                    </AppButton>

                    <AppButton
                      onClick={() => navigate(`/projeduzenle/${proje.id}`)}
                      variant="sari"
                      size="sm"
                      shape="md"
                      title="Projeyi düzenle"
                    >
                      Düzenle
                    </AppButton>

                    <AppButton
                      onClick={() => askDelete(proje)}
                      variant="kirmizi"
                      size="sm"
                      shape="md"
                      title="Projeyi sil"
                    >
                      Sil
                    </AppButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8 text-sm">
              Gösterilecek proje bulunamadı.
            </div>
          )}
        </div>

        {/* =========================
            ✅ Sayfalama (Musteriler formatı)
        ========================= */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center sm:justify-between items-center gap-2 sm:gap-3 mt-4">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
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
      </div>

      {/* ❌ Silme modali */}
      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Projeyi silmek istediğinize emin misiniz?"
        description={pendingDelete ? `'${pendingDelete.project_name}' silinecek. Bu işlem geri alınamaz.` : ""}
        confirmText="Evet, sil"
        cancelText="Vazgeç"
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      {/* 🟦 Tekliflere Taşı modali */}
      <ConfirmDeleteModal
        open={moveOpen}
        onOpenChange={setMoveOpen}
        title="Projeyi Tekliflere Taşımaya Emin misiniz?"
        description={pendingMove ? `'${pendingMove.project_name}' projeden tekliflere taşınacak.` : ""}
        confirmText="Evet, Taşı"
        cancelText="Vazgeç"
        onConfirm={handleConfirmMove}
        loading={moving}
      />

      {/* 🟢 Müşteri seçimi modali */}
      <DialogMusteriSec
        open={customerDialogOpen}
        onOpenChange={setCustomerDialogOpen}
        onSelect={(row) => {
          setSelectedCustomer(row);
          setPage(1);
          setCustomerDialogOpen(false);
        }}
      />
    </div>
  );
};

export default Projeler;
