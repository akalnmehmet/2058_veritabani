// Path: @/scenes/projeekle/DialogProfilRenkSec.tsx
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import PagedSelectDialog from "./PagedSelectDialog";
import { getProfileColorFromApi } from "@/redux/actions/actions_boyalar";

const EMPTY_PAGE = { items: [], total: 0, page: 1, limit: 5, total_pages: 1, has_next: false, has_prev: false };
const LIMIT = 5;

const DialogProfilRenkSec = ({ open, onOpenChange, onSelect }) => {
  const dispatch = useDispatch();
  const data = useSelector((s) => s.getProfileColorsFromApiReducer) || EMPTY_PAGE;

  const fetchPage = useCallback((page, q) => dispatch(getProfileColorFromApi(page, q, LIMIT)), [dispatch]);

  return (
    <PagedSelectDialog
      title="Profil Rengi Seç"
      open={open}
      onOpenChange={onOpenChange}
      data={Array.isArray(data) ? { ...EMPTY_PAGE, items: data } : data}
      fetchPage={fetchPage}
      columns={[
        { key: "name", label: "Renk Adı" },
        // İstersen { key: "code", label: "Kod" } ekle
      ]}
      onSelect={onSelect}
      searchPlaceholder="Renk adına göre ara…"
    />
  );
};

export default DialogProfilRenkSec;
