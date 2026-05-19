// Path: @/components/DialogSistemDuzenleOnProject.tsx
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import AppButton from "@/components/ui/AppButton";

// PagedSelectDialog, projendeki yerleşime göre bu yolda.
// Sende farklıysa, PagedSelectDialog bileşeninin gerçek yolunu kullan.
import PagedSelectDialog from "@/scenes/projeekle/PagedSelectDialog";

import {
  getGlassColorFromApi,
  getDefaultColorOne,
  getDefaultColorTwo,
} from "@/redux/actions/actions_boyalar";

const initialState = { width_mm: "", height_mm: "", quantity: "" };
const EMPTY_PAGE = { items: [], total: 0, page: 1, limit: 5, total_pages: 1, has_next: false, has_prev: false };
const LIMIT = 5;

const DialogSistemDuzenleOnProject = ({
  open,
  onOpenChange,
  title = "Sistem Düzenle",
  initial = { width_mm: 0, height_mm: 0, quantity: 0 },
  onSave,
  loading = false,
  saving = false,
  // Satırdaki mevcut cam renklerini ilk açılışta göstermek için:
  // { id1, name1, id2, name2 } (opsiyonel)
  initialColors,
}) => {
  const dispatch = useDispatch();
  const colorsPage = useSelector((s) => s.getGlassColorsFromApiReducer) || EMPTY_PAGE;

  const [form, setForm] = useState(initialState);
  const firstInputRef = useRef(null);

  // Renk seçim modal durumu
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [whichColorSelecting, setWhichColorSelecting] = useState(null); // 1 | 2

  // Seçili/varsayılan renk state'leri
  const [renk1Id, setRenk1Id] = useState(null);
  const [renk1Name, setRenk1Name] = useState("-");
  const [renk2Id, setRenk2Id] = useState(null);
  const [renk2Name, setRenk2Name] = useState("-");

  const fetchPage = React.useCallback(
    (page, q) => dispatch(getGlassColorFromApi(page, q, LIMIT)),
    [dispatch]
  );

  useEffect(() => {
    if (!open) return;

    // Form reset + focus
    setForm({
      width_mm: String(initial?.width_mm ?? ""),
      height_mm: String(initial?.height_mm ?? ""),
      quantity: String(initial?.quantity ?? ""),
    });
    setTimeout(() => firstInputRef.current?.focus(), 0);

    // Renkleri yükle: önce mevcut (initialColors), yoksa defaultlar
    (async () => {
      if (initialColors?.id1) {
        setRenk1Id(initialColors.id1);
        setRenk1Name(initialColors.name1 ?? "Renk 1");
      }
      if (initialColors?.id2) {
        setRenk2Id(initialColors.id2);
        setRenk2Name(initialColors.name2 ?? "Renk 2");
      }

      try {
        if (!initialColors?.id1) {
          const d1 = await dispatch(getDefaultColorOne());
          if (d1?.id) {
            setRenk1Id(d1.id);
            setRenk1Name(d1.name ?? "Renk 1");
          }
        }
      } catch {}
      try {
        if (!initialColors?.id2) {
          const d2 = await dispatch(getDefaultColorTwo());
          if (d2?.id) {
            setRenk2Id(d2.id);
            setRenk2Name(d2.name ?? "Renk 2");
          }
        }
      } catch {}
    })();
  }, [open, initial, initialColors, dispatch]);

  const handleOpenChange = (v) => {
    onOpenChange?.(v);
    if (!v) {
      setForm(initialState);
      setColorDialogOpen(false);
      setWhichColorSelecting(null);
    }
  };

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const toNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

  const width = toNumber(form.width_mm);
  const height = toNumber(form.height_mm);
  const qty = toNumber(form.quantity);

  const errors = {
    width: width <= 0,
    height: height <= 0,
    qty: qty <= 0 || !Number.isInteger(qty),
  };
  const hasError = errors.width || errors.height || errors.qty;
  const canSave = !loading && !saving && !hasError;

  const submit = (e) => {
    e?.preventDefault?.();
    if (!canSave) return;
    onSave?.({
      width_mm: width,
      height_mm: height,
      quantity: qty,
      glass_color_id_1: renk1Id || null,
      glass_color_id_2: renk2Id || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-card text-foreground border border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <form className="mt-2 space-y-3" onSubmit={submit}>
            <label className="form-control w-full">
              <span className="label-text text-muted-foreground">En (mm)</span>
              <input
                ref={firstInputRef}
                type="number"
                inputMode="numeric"
                min={1}
                step="1"
                className={`input input-bordered w-full ${errors.width ? "input-error" : ""}`}
                value={form.width_mm}
                onChange={(e) => setField("width_mm", e.target.value)}
                disabled={saving}
                placeholder="Örn: 1200"
              />
              {errors.width && <span className="text-xs text-destructive mt-1">En 0’dan büyük olmalı.</span>}
            </label>

            <label className="form-control w-full">
              <span className="label-text text-muted-foreground">Boy (mm)</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                step="1"
                className={`input input-bordered w-full ${errors.height ? "input-error" : ""}`}
                value={form.height_mm}
                onChange={(e) => setField("height_mm", e.target.value)}
                disabled={saving}
                placeholder="Örn: 2400"
              />
              {errors.height && <span className="text-xs text-destructive mt-1">Boy 0’dan büyük olmalı.</span>}
            </label>

            <label className="form-control w-full">
              <span className="label-text text-muted-foreground">Adet</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                step="1"
                className={`input input-bordered w-full ${errors.qty ? "input-error" : ""}`}
                value={form.quantity}
                onChange={(e) => setField("quantity", e.target.value)}
                disabled={saving}
                placeholder="Örn: 3"
              />
              {errors.qty && <span className="text-xs text-destructive mt-1">Adet pozitif tam sayı olmalı.</span>}
            </label>

            {/* Renk 1 / Renk 2 seçim butonları */}
            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <AppButton
                  type="button"
                  size="sm"
                  variant="kurumsalmavi"
                  onClick={() => { setWhichColorSelecting(1); setColorDialogOpen(true); }}
                  disabled={saving}
                  title="Renk 1 seç"
                >
                  Renk 1
                </AppButton>
                <span className="text-xs text-muted-foreground">({renk1Name})</span>
              </div>

              <div className="flex items-center gap-2">
                <AppButton
                  type="button"
                  size="sm"
                  variant="kurumsalmavi"
                  onClick={() => { setWhichColorSelecting(2); setColorDialogOpen(true); }}
                  disabled={saving}
                  title="Renk 2 seç"
                >
                  Renk 2
                </AppButton>
                <span className="text-xs text-muted-foreground">({renk2Name})</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <DialogClose asChild>
                <AppButton type="button" size="sm" variant="gri" disabled={saving}>
                  Vazgeç
                </AppButton>
              </DialogClose>

              <AppButton
                type="submit"
                size="sm"
                variant="kurumsalmavi"
                className="inline-flex items-center gap-2"
                disabled={!canSave}
              >
                {saving && <span className="loading loading-spinner loading-xs" />}
                Kaydet
              </AppButton>
            </div>
          </form>
        )}

        {/* Cam rengi seçim modali */}
        <PagedSelectDialog
          title="Cam Rengi Seç"
          open={colorDialogOpen}
          onOpenChange={setColorDialogOpen}
          data={Array.isArray(colorsPage) ? { ...EMPTY_PAGE, items: colorsPage } : colorsPage}
          fetchPage={fetchPage}
          columns={[{ key: "name", label: "Renk Adı" }]}
          searchPlaceholder="Renk adına göre ara…"
          onSelect={(row) => {
            if (!row?.id) return;
            if (whichColorSelecting === 1) {
              setRenk1Id(row.id);
              setRenk1Name(row.name ?? "Renk 1");
            } else if (whichColorSelecting === 2) {
              setRenk2Id(row.id);
              setRenk2Name(row.name ?? "Renk 2");
            }
            setColorDialogOpen(false);
            setWhichColorSelecting(null);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DialogSistemDuzenleOnProject;
