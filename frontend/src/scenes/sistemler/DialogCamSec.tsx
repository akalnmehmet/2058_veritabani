// Path: @/scenes/sistemler/DialogCamSec.tsx
import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PagedSelectDialog from "./PagedSelectDialog";
import { getCamlarFromApi } from "@/redux/actions/actions_camlar";

const EMPTY_PAGE = {
  items: [],
  total: 0,
  page: 1,
  limit: 5,
  total_pages: 1,
  has_next: false,
  has_prev: false,
};

const LIMIT = 5;

const DialogCamSec = ({ open, onOpenChange, onSelect }) => {
  const dispatch = useDispatch();
  const data = useSelector((s) => s.getCamlarFromApiReducer) || EMPTY_PAGE;

  // PagedSelectDialog, page & query parametreleri ile bu fonksiyonu çağıracak
  const fetchPage = useCallback(
    (page, q) => dispatch(getCamlarFromApi(page, q, LIMIT)),
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
      title="Cam Seç"
      open={open}
      onOpenChange={onOpenChange}
      data={data}
      fetchPage={fetchPage}
      columns={[{ key: "cam_isim", label: "Cam İsmi" }]}
      onSelect={onSelect}
      searchPlaceholder="Cam ismi ile ara…"
    />
  );
};

export default DialogCamSec;
