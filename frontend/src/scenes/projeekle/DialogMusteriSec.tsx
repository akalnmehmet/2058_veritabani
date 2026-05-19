// Path: @/scenes/projeekle/DialogMusteriSec.tsx
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import PagedSelectDialog from "./PagedSelectDialog";
import { getMusterilerFromApi } from "@/redux/actions/actions_musteriler";

const EMPTY_PAGE = { items: [], total: 0, page: 1, limit: 5, total_pages: 1, has_next: false, has_prev: false };
const LIMIT = 5;

const DialogMusteriSec = ({ open, onOpenChange, onSelect }) => {
  const dispatch = useDispatch();
  const data = useSelector((s) => s.getMusterilerFromApiReducer) || EMPTY_PAGE;

  const fetchPage = useCallback((page, q) => dispatch(getMusterilerFromApi(page, q, LIMIT)), [dispatch]);

  return (
    <PagedSelectDialog
      title="Müşteri Seç"
      open={open}
      onOpenChange={onOpenChange}
      data={Array.isArray(data) ? { ...EMPTY_PAGE, items: data } : data}
      fetchPage={fetchPage}
      columns={[
        { key: "company_name", label: "Şirket" },
        { key: "name", label: "İsim" },
        { key: "phone", label: "Telefon" },
        { key: "city", label: "Şehir" },
      ]}
      onSelect={onSelect}
      searchPlaceholder="Şirket/isim ara…"
    />
  );
};

export default DialogMusteriSec;
