// Path: @/scenes/sistemler/DialogMalzemeSec.tsx
import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PagedSelectDialog from "./PagedSelectDialog";
import { getDigerMalzemelerFromApi } from "@/redux/actions/actions_diger_malzemeler";

const EMPTY_PAGE = { items: [], total: 0, page: 1, limit: 5, total_pages: 1, has_next: false, has_prev: false };
const LIMIT = 5;

const DialogMalzemeSec = ({ open, onOpenChange, onSelect }) => {
  const dispatch = useDispatch();
  const data = useSelector((s) => s.getDigerMalzemelerFromApiReducer) || EMPTY_PAGE;

  // PagedSelectDialog, page & query ile bu fonksiyonu çağıracak
  const fetchPage = useCallback(
    (page, q) => dispatch(getDigerMalzemelerFromApi(page, q, LIMIT)),
    [dispatch]
  );

  // Dialog açıldığında ilk sayfayı otomatik yükle (boş arama ile)
  useEffect(() => {
    if (open) {
      fetchPage(1, "");
    }
  }, [open, fetchPage]);

  return (
    <PagedSelectDialog
      title="Malzeme Seç"
      open={open}
      onOpenChange={onOpenChange}
      data={data}
      fetchPage={fetchPage}
      columns={[{ key: "diger_malzeme_isim", label: "Malzeme İsmi" }]}
      onSelect={onSelect}
      searchPlaceholder="Malzeme ismi ile ara…"
    />
  );
};

export default DialogMalzemeSec;
